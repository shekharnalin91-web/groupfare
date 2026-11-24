from fastapi import APIRouter, HTTPException
from typing import List, Optional, Dict, Any
import uuid
import json
from app.core.database import get_db_connection, row_to_dict
from app.models.schemas import TravelRequestCreate, TravelRequestResponse, CompatibilityScore
from app.services.matching_engine import find_best_group_matches

router = APIRouter(prefix="/travel-requests", tags=["Travel Requests"])

@router.post("/", response_model=Dict[str, Any])
def create_travel_request(req: TravelRequestCreate, user_id: str):
    """
    Submits passenger travel requirements, saves the request,
    and runs the AI smart matching engine to find compatible groups immediately.
    """
    req_id = f"req_{uuid.uuid4().hex[:8]}"
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Verify user
        cursor.execute("SELECT id, full_name FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found.")
            
        cursor.execute("""
            INSERT INTO travel_requests (
                id, user_id, departure_city, destination_city, travel_date,
                flexible_dates, flexibility_days, passengers_count, cabin_class,
                max_budget_per_passenger, preferred_airlines, preferences, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            req_id,
            user_id,
            req.departure_city.strip(),
            req.destination_city.strip(),
            req.travel_date,
            1 if req.flexible_dates else 0,
            req.flexibility_days,
            req.passengers_count,
            req.cabin_class.value,
            req.max_budget_per_passenger,
            json.dumps(req.preferred_airlines),
            req.preferences or "",
            "active"
        ))
        
        # Fetch created request
        cursor.execute("SELECT * FROM travel_requests WHERE id = ?", (req_id,))
        saved_req = row_to_dict(cursor.fetchone())
        saved_req["user_name"] = user["full_name"]
        
        # Fetch active candidate groups for matching
        cursor.execute("SELECT * FROM groups WHERE status NOT IN ('Cancelled', 'Completed')")
        raw_groups = [row_to_dict(g) for g in cursor.fetchall()]
        
        # Enrich groups with current passengers count
        enriched_groups = []
        for g in raw_groups:
            cursor.execute("""
                SELECT status, SUM(passengers_count) as count 
                FROM group_members WHERE group_id = ? 
                GROUP BY status
            """, (g["id"],))
            stats = {r["status"]: r["count"] for r in cursor.fetchall()}
            g["current_confirmed_passengers"] = stats.get("confirmed", 0)
            g["current_interested_passengers"] = stats.get("interested", 0)
            g["total_passenger_interest"] = g["current_confirmed_passengers"] + g["current_interested_passengers"]
            enriched_groups.append(g)

    # Run AI smart matching engine
    matches = find_best_group_matches(saved_req, enriched_groups, min_score=40)
    
    return {
        "travel_request": saved_req,
        "matched_groups_count": len(matches),
        "matches": [m.model_dump() for m in matches],
        "message": f"Travel request saved successfully. Found {len(matches)} compatible group(s)."
    }

@router.get("/user/{user_id}", response_model=List[TravelRequestResponse])
def get_user_travel_requests(user_id: str):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT tr.*, u.full_name as user_name 
            FROM travel_requests tr
            JOIN users u ON tr.user_id = u.id
            WHERE tr.user_id = ?
            ORDER BY tr.created_at DESC
        """, (user_id,))
        return [row_to_dict(r) for r in cursor.fetchall()]

@router.delete("/{request_id}")
def delete_travel_request(request_id: str, user_id: str):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM travel_requests WHERE id = ? AND user_id = ?", (request_id, user_id))
        return {"status": "success", "message": "Travel request cancelled."}
