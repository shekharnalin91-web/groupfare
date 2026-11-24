from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
import uuid
from datetime import datetime, timezone, timedelta
from app.core.database import get_db_connection, row_to_dict
from app.models.schemas import AdminAnalytics, QuotationCreate, GroupStatus

router = APIRouter(prefix="/admin", tags=["Admin Portal"])

@router.get("/analytics", response_model=AdminAnalytics)
def get_admin_analytics():
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) as cnt FROM users")
        total_users = cursor.fetchone()["cnt"]
        
        cursor.execute("SELECT COUNT(*) as cnt FROM travel_requests")
        total_requests = cursor.fetchone()["cnt"]
        
        cursor.execute("SELECT COUNT(*) as cnt FROM groups")
        total_groups = cursor.fetchone()["cnt"]
        
        cursor.execute("SELECT COUNT(*) as cnt FROM groups WHERE status NOT IN ('Cancelled', 'Completed')")
        active_groups = cursor.fetchone()["cnt"]
        
        cursor.execute("SELECT COUNT(*) as cnt FROM groups WHERE status IN ('Target Reached', 'Quote Requested', 'Quote Received', 'Completed')")
        target_reached_groups = cursor.fetchone()["cnt"]
        
        cursor.execute("SELECT COUNT(*) as cnt FROM fare_quotations")
        quotes_issued = cursor.fetchone()["cnt"]
        
        # Calculate verified potential savings across all issued quotes
        cursor.execute("""
            SELECT q.individual_fare_per_pax, q.group_quote_per_pax, g.passenger_target
            FROM fare_quotations q
            JOIN groups g ON q.group_id = g.id
        """)
        quotes = cursor.fetchall()
        total_savings = 0.0
        for q in quotes:
            diff = q["individual_fare_per_pax"] - q["group_quote_per_pax"]
            if diff > 0:
                total_savings += diff * q["passenger_target"]
                
        cursor.execute("SELECT AVG(passenger_target) as avg_pax FROM groups")
        avg_pax = cursor.fetchone()["avg_pax"] or 10.0
        
        return AdminAnalytics(
            total_users=total_users,
            total_travel_requests=total_requests,
            total_groups=total_groups,
            active_groups=active_groups,
            target_reached_groups=target_reached_groups,
            quotes_issued=quotes_issued,
            verified_potential_savings=round(total_savings, 2),
            average_group_size=round(float(avg_pax), 1)
        )

@router.get("/users")
def get_all_users():
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, email, full_name, phone, verification_status, role, created_at FROM users ORDER BY created_at DESC")
        return [row_to_dict(r) for r in cursor.fetchall()]

@router.get("/travel-requests")
def get_all_travel_requests():
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT tr.*, u.full_name as user_name, u.email as user_email
            FROM travel_requests tr
            JOIN users u ON tr.user_id = u.id
            ORDER BY tr.created_at DESC
        """)
        return [row_to_dict(r) for r in cursor.fetchall()]

@router.get("/groups")
def get_all_groups_monitor():
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT g.*, u.full_name as creator_name,
                (SELECT COUNT(*) FROM group_members WHERE group_id = g.id AND status = 'confirmed') as confirmed_count,
                (SELECT COUNT(*) FROM group_members WHERE group_id = g.id AND status = 'interested') as interested_count
            FROM groups g
            JOIN users u ON g.creator_id = u.id
            ORDER BY g.created_at DESC
        """)
        return [row_to_dict(r) for r in cursor.fetchall()]

@router.post("/groups/{group_id}/status")
def update_group_status(group_id: str, status: str):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE groups SET status = ? WHERE id = ?", (status, group_id))
        return {"status": "success", "message": f"Group status updated to {status}."}

@router.post("/quotations/issue")
def issue_admin_quotation(quote: QuotationCreate):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM groups WHERE id = ?", (quote.group_id,))
        grp = cursor.fetchone()
        if not grp:
            raise HTTPException(status_code=404, detail="Group not found.")
            
        quote_id = f"quote_{uuid.uuid4().hex[:8]}"
        now = datetime.now(timezone.utc)
        expires_at = (now + timedelta(hours=quote.validity_hours)).isoformat()
        
        cursor.execute("""
            INSERT INTO fare_quotations (
                id, group_id, airline_name, individual_fare_per_pax,
                group_quote_per_pax, taxes_and_fees_per_pax, baggage_conditions,
                fare_conditions, status, validity_hours, expires_at, is_simulated, admin_notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            quote_id,
            quote.group_id,
            quote.airline_name,
            quote.individual_fare_per_pax,
            quote.group_quote_per_pax,
            quote.taxes_and_fees_per_pax,
            quote.baggage_conditions,
            quote.fare_conditions,
            "issued",
            quote.validity_hours,
            expires_at,
            1 if quote.is_simulated else 0,
            "Issued / Verified via Admin Control Panel."
        ))
        
        cursor.execute("UPDATE groups SET status = 'Quote Received' WHERE id = ?", (quote.group_id,))
        return {"status": "success", "quotation_id": quote_id, "message": "Quotation issued to group members."}
