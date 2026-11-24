from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta, timezone
from app.core.database import get_db_connection, row_to_dict
from app.models.schemas import GroupCreate, GroupResponse, GroupStatus, MemberStatus, GroupMemberResponse
from app.services.quotation_service import generate_simulated_quotation

router = APIRouter(prefix="/groups", tags=["Groups"])

def enrich_group_data(cursor, group_dict: Dict[str, Any]) -> Dict[str, Any]:
    group_id = group_dict["id"]
    
    # Creator info
    cursor.execute("SELECT full_name FROM users WHERE id = ?", (group_dict["creator_id"],))
    c_user = cursor.fetchone()
    group_dict["creator_name"] = c_user["full_name"] if c_user else "Fellow Traveller"
    
    # Members
    cursor.execute("""
        SELECT gm.id, gm.group_id, gm.user_id, gm.passengers_count, gm.status, gm.role, gm.joined_at,
               u.full_name as user_name, u.avatar as user_avatar, u.verification_status
        FROM group_members gm
        JOIN users u ON gm.user_id = u.id
        WHERE gm.group_id = ?
        ORDER BY gm.role DESC, gm.joined_at ASC
    """, (group_id,))
    members = [row_to_dict(r) for r in cursor.fetchall()]
    group_dict["members"] = members
    
    confirmed = sum(m["passengers_count"] for m in members if m["status"] == "confirmed")
    interested = sum(m["passengers_count"] for m in members if m["status"] == "interested")
    group_dict["current_confirmed_passengers"] = confirmed
    group_dict["current_interested_passengers"] = interested
    group_dict["total_passenger_interest"] = confirmed + interested
    
    # Check quotation
    cursor.execute("SELECT id FROM fare_quotations WHERE group_id = ? ORDER BY created_at DESC LIMIT 1", (group_id,))
    quote = cursor.fetchone()
    group_dict["quotation_id"] = quote["id"] if quote else None
    group_dict["has_active_quote"] = bool(quote)
    
    return group_dict

@router.get("/", response_model=List[GroupResponse])
def get_groups(
    departure: Optional[str] = None,
    destination: Optional[str] = None,
    status: Optional[str] = None
):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        query = "SELECT * FROM groups WHERE 1=1"
        params = []
        
        if departure:
            query += " AND LOWER(departure_city) LIKE ?"
            params.append(f"%{departure.strip().lower()}%")
        if destination:
            query += " AND LOWER(destination_city) LIKE ?"
            params.append(f"%{destination.strip().lower()}%")
        if status:
            query += " AND status = ?"
            params.append(status)
            
        query += " ORDER BY created_at DESC"
        cursor.execute(query, params)
        raw_groups = [row_to_dict(r) for r in cursor.fetchall()]
        
        return [enrich_group_data(cursor, g) for g in raw_groups]

@router.get("/{group_id}", response_model=GroupResponse)
def get_group_details(group_id: str):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM groups WHERE id = ?", (group_id,))
        grp = cursor.fetchone()
        if not grp:
            raise HTTPException(status_code=404, detail="Group not found.")
        return enrich_group_data(cursor, row_to_dict(grp))

@router.get("/invite/{invite_code}", response_model=GroupResponse)
def get_group_by_invite(invite_code: str):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM groups WHERE invite_code = ?", (invite_code.strip(),))
        grp = cursor.fetchone()
        if not grp:
            raise HTTPException(status_code=404, detail="Invalid group invitation code.")
        return enrich_group_data(cursor, row_to_dict(grp))

@router.post("/", response_model=GroupResponse)
def create_group(group: GroupCreate, creator_id: str):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        cursor.execute("SELECT id, full_name FROM users WHERE id = ?", (creator_id,))
        creator = cursor.fetchone()
        if not creator:
            raise HTTPException(status_code=404, detail="User not found.")
            
        group_id = f"grp_{uuid.uuid4().hex[:8]}"
        code_prefix = f"{group.departure_city[:3].upper()}-{group.destination_city[:3].upper()}"
        invite_code = f"{code_prefix}-{uuid.uuid4().hex[:4].upper()}"
        
        now = datetime.now(timezone.utc)
        deadline = (now + timedelta(days=group.deadline_days)).isoformat()
        
        cursor.execute("""
            INSERT INTO groups (
                id, name, creator_id, departure_city, destination_city,
                travel_date, passenger_target, cabin_class, description,
                invite_code, status, deadline, estimated_individual_fare,
                flight_number, airline_name, departure_time, arrival_time,
                departure_airport_code, destination_airport_code,
                departure_terminal, destination_terminal, duration, aircraft_type
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            group_id,
            group.name.strip(),
            creator_id,
            group.departure_city.strip(),
            group.destination_city.strip(),
            group.travel_date,
            group.passenger_target,
            group.cabin_class.value,
            group.description or "",
            invite_code,
            "Open",
            deadline,
            group.estimated_individual_fare,
            group.flight_number or "",
            group.airline_name or "",
            group.departure_time or "08:00",
            group.arrival_time or "10:45",
            group.departure_airport_code or "",
            group.destination_airport_code or "",
            group.departure_terminal or "T1",
            group.destination_terminal or "T2",
            group.duration or "2h 45m",
            group.aircraft_type or "Airbus A320neo"
        ))
        
        # Add creator as confirmed member
        member_id = f"mem_{uuid.uuid4().hex[:8]}"
        cursor.execute("""
            INSERT INTO group_members (id, group_id, user_id, passengers_count, status, role)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (member_id, group_id, creator_id, 1, "confirmed", "creator"))
        
        cursor.execute("SELECT * FROM groups WHERE id = ?", (group_id,))
        created = row_to_dict(cursor.fetchone())
        return enrich_group_data(cursor, created)

@router.post("/{group_id}/join")
def join_group(
    group_id: str,
    user_id: str,
    passengers_count: int = 1,
    status: MemberStatus = MemberStatus.CONFIRMED,
    travel_request_id: Optional[str] = None
):
    """
    Explicit user consent join mechanism.
    A user can join as 'interested' to monitor or 'confirmed' to count toward the quotation quota.
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM groups WHERE id = ?", (group_id,))
        grp = cursor.fetchone()
        if not grp:
            raise HTTPException(status_code=404, detail="Group not found.")
            
        if grp["status"] in ["Cancelled", "Completed"]:
            raise HTTPException(status_code=400, detail=f"Cannot join a group that is {grp['status']}.")
            
        cursor.execute("SELECT full_name FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found.")
            
        # Check if already a member
        cursor.execute("SELECT * FROM group_members WHERE group_id = ? AND user_id = ?", (group_id, user_id))
        existing = cursor.fetchone()
        
        if existing:
            # Update status or count
            cursor.execute("""
                UPDATE group_members 
                SET status = ?, passengers_count = ?, travel_request_id = coalesce(?, travel_request_id)
                WHERE id = ?
            """, (status.value, passengers_count, travel_request_id, existing["id"]))
            msg = f"Group membership updated to {status.value} for {passengers_count} passenger(s)."
        else:
            member_id = f"mem_{uuid.uuid4().hex[:8]}"
            cursor.execute("""
                INSERT INTO group_members (id, group_id, user_id, travel_request_id, passengers_count, status, role)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (member_id, group_id, user_id, travel_request_id, passengers_count, status.value, "member"))
            msg = f"Joined {grp['name']} as {status.value} for {passengers_count} passenger(s)."
            
        # Recalculate confirmed count & update group status
        cursor.execute("""
            SELECT SUM(passengers_count) as confirmed 
            FROM group_members 
            WHERE group_id = ? AND status = 'confirmed'
        """, (group_id,))
        confirmed_count = cursor.fetchone()["confirmed"] or 0
        target = grp["passenger_target"]
        
        new_status = grp["status"]
        if confirmed_count >= target:
            new_status = "Target Reached"
            # Send notification to creator
            notif_id = f"notif_{uuid.uuid4().hex[:8]}"
            cursor.execute("""
                INSERT INTO notifications (id, user_id, title, message, type, link)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                notif_id,
                grp["creator_id"],
                "Group Target Reached! 🚀",
                f"Your group '{grp['name']}' has reached the target of {target} confirmed passengers. You can now request an official group quote!",
                "target_reached",
                f"/groups/{group_id}"
            ))
        elif confirmed_count >= (target * 0.6) and grp["status"] == "Open":
            new_status = "Filling Fast"
            
        if new_status != grp["status"]:
            cursor.execute("UPDATE groups SET status = ? WHERE id = ?", (new_status, group_id))
            
        return {
            "status": "success",
            "message": msg,
            "group_id": group_id,
            "confirmed_passengers": confirmed_count,
            "passenger_target": target,
            "group_status": new_status
        }

@router.post("/{group_id}/leave")
def leave_group(group_id: str, user_id: str):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM group_members WHERE group_id = ? AND user_id = ?", (group_id, user_id))
        return {"status": "success", "message": "You have left the group."}

@router.post("/{group_id}/request-quote")
def request_group_quotation(group_id: str, requester_id: str):
    """
    Once target is reached or requested by coordinator, trigger quotation workflow.
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM groups WHERE id = ?", (group_id,))
        grp = cursor.fetchone()
        if not grp:
            raise HTTPException(status_code=404, detail="Group not found.")
            
        cursor.execute("""
            SELECT SUM(passengers_count) as total_confirmed
            FROM group_members WHERE group_id = ? AND status = 'confirmed'
        """, (group_id,))
        conf = cursor.fetchone()["total_confirmed"] or 0
        
        # Check if quotation already exists
        cursor.execute("SELECT * FROM fare_quotations WHERE group_id = ?", (group_id,))
        existing_quote = cursor.fetchone()
        if existing_quote:
            return {
                "status": "already_exists",
                "message": "Quotation already issued for this group.",
                "quotation": row_to_dict(existing_quote)
            }
            
        # Generate verified simulated quote
        quote_data = generate_simulated_quotation(
            group_id=group_id,
            departure_city=grp["departure_city"],
            destination_city=grp["destination_city"],
            passenger_count=conf if conf > 0 else grp["passenger_target"],
            cabin_class=grp["cabin_class"]
        )
        
        cursor.execute("""
            INSERT INTO fare_quotations (
                id, group_id, airline_name, individual_fare_per_pax,
                group_quote_per_pax, taxes_and_fees_per_pax, baggage_conditions,
                fare_conditions, status, validity_hours, expires_at, is_simulated, admin_notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            quote_data["id"],
            group_id,
            quote_data["airline_name"],
            quote_data["individual_fare_per_pax"],
            quote_data["group_quote_per_pax"],
            quote_data["taxes_and_fees_per_pax"],
            quote_data["baggage_conditions"],
            quote_data["fare_conditions"],
            "issued",
            quote_data["validity_hours"],
            quote_data["expires_at"],
            1,
            quote_data["admin_notes"]
        ))
        
        # Update group status
        cursor.execute("UPDATE groups SET status = 'Quote Received' WHERE id = ?", (group_id,))
        
        # Notify members
        cursor.execute("SELECT user_id FROM group_members WHERE group_id = ?", (group_id,))
        members = cursor.fetchall()
        for m in members:
            notif_id = f"notif_{uuid.uuid4().hex[:8]}"
            cursor.execute("""
                INSERT INTO notifications (id, user_id, title, message, type, link)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                notif_id,
                m["user_id"],
                "Group Fare Quotation Ready! 🎉",
                f"Quotation received for '{grp['name']}' from {quote_data['airline_name']}. Review your savings and fare comparison now.",
                "quote_received",
                f"/groups/{group_id}"
            ))
            
        return {
            "status": "success",
            "message": "Group quotation successfully received and verified.",
            "quotation": quote_data
        }

@router.post("/{group_id}/extend-deadline")
def extend_group_deadline(group_id: str, additional_days: int = 3):
    """Fallback mechanism: extends matching deadline if target not yet reached."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT deadline FROM groups WHERE id = ?", (group_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Group not found.")
            
        current_deadline = datetime.fromisoformat(row["deadline"].replace("Z", "+00:00"))
        new_deadline = (current_deadline + timedelta(days=additional_days)).isoformat()
        
        cursor.execute("UPDATE groups SET deadline = ? WHERE id = ?", (new_deadline, group_id))
        return {"status": "success", "new_deadline": new_deadline, "message": f"Deadline extended by {additional_days} days."}
