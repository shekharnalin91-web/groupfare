from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List, Optional
from app.core.database import get_db_connection, row_to_dict
from app.models.schemas import AIChatRequest, AIChatResponse, CompatibilityScore
from app.services.ai_assistant import ai_assistant
from app.services.matching_engine import calculate_compatibility, find_best_group_matches

router = APIRouter(prefix="/ai", tags=["AI Agent & Travel Assistant"])

@router.post("/chat", response_model=AIChatResponse)
def chat_with_agent(req: AIChatRequest):
    result = ai_assistant.process_chat(
        user_message=req.message,
        user_id=req.user_id,
        current_group_id=req.current_group_id,
        travel_request_id=req.travel_request_id,
        history=[m.model_dump() for m in req.history] if req.history else []
    )
    return AIChatResponse(**result)

@router.post("/match", response_model=List[CompatibilityScore])
def match_travel_request(request_data: Dict[str, Any]):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM groups WHERE status NOT IN ('Cancelled', 'Completed')")
        groups = [row_to_dict(g) for g in cursor.fetchall()]
        
        enriched = []
        for g in groups:
            cursor.execute("""
                SELECT status, SUM(passengers_count) as count 
                FROM group_members WHERE group_id = ? 
                GROUP BY status
            """, (g["id"],))
            stats = {r["status"]: r["count"] for r in cursor.fetchall()}
            g["current_confirmed_passengers"] = stats.get("confirmed", 0)
            g["current_interested_passengers"] = stats.get("interested", 0)
            g["total_passenger_interest"] = g["current_confirmed_passengers"] + g["current_interested_passengers"]
            enriched.append(g)
            
        return find_best_group_matches(request_data, enriched, min_score=35)

@router.get("/explain/{request_id}/{group_id}", response_model=CompatibilityScore)
def explain_group_recommendation(request_id: str, group_id: str):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM travel_requests WHERE id = ?", (request_id,))
        req = cursor.fetchone()
        if not req:
            raise HTTPException(status_code=404, detail="Travel request not found.")
            
        cursor.execute("SELECT * FROM groups WHERE id = ?", (group_id,))
        grp = cursor.fetchone()
        if not grp:
            raise HTTPException(status_code=404, detail="Group not found.")
            
        grp_dict = row_to_dict(grp)
        cursor.execute("""
            SELECT status, SUM(passengers_count) as count 
            FROM group_members WHERE group_id = ? 
            GROUP BY status
        """, (group_id,))
        stats = {r["status"]: r["count"] for r in cursor.fetchall()}
        grp_dict["current_confirmed_passengers"] = stats.get("confirmed", 0)
        grp_dict["current_interested_passengers"] = stats.get("interested", 0)
        
        return calculate_compatibility(row_to_dict(req), grp_dict)

@router.get("/fallback/{group_id}")
def get_fallback_strategy(group_id: str):
    """
    Evaluates fallback options if the group is near its deadline and hasn't reached its target.
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM groups WHERE id = ?", (group_id,))
        grp = cursor.fetchone()
        if not grp:
            raise HTTPException(status_code=404, detail="Group not found.")
            
        cursor.execute("""
            SELECT SUM(passengers_count) as confirmed 
            FROM group_members WHERE group_id = ? AND status = 'confirmed'
        """, (group_id,))
        conf = cursor.fetchone()["confirmed"] or 0
        target = grp["passenger_target"]
        
        # Look for candidate groups to merge with
        cursor.execute("""
            SELECT * FROM groups 
            WHERE id != ? 
              AND departure_city = ? 
              AND destination_city = ?
              AND status NOT IN ('Cancelled', 'Completed')
        """, (group_id, grp["departure_city"], grp["destination_city"]))
        merge_candidates = [row_to_dict(r) for r in cursor.fetchall()]
        
        return {
            "group_id": group_id,
            "group_name": grp["name"],
            "confirmed_passengers": conf,
            "target": target,
            "is_under_target": conf < target,
            "extension_recommended": conf >= round(target * 0.6),
            "merge_candidates_count": len(merge_candidates),
            "merge_candidates": merge_candidates,
            "individual_backup_fare": grp["estimated_individual_fare"],
            "safety_guarantee": "Zero non-refundable financial risk. Members retain full autonomy."
        }
