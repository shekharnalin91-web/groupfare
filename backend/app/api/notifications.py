from fastapi import APIRouter, HTTPException
from typing import List
from app.core.database import get_db_connection, row_to_dict
from app.models.schemas import NotificationResponse

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("/user/{user_id}", response_model=List[NotificationResponse])
def get_user_notifications(user_id: str):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM notifications 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        """, (user_id,))
        rows = cursor.fetchall()
        return [
            {
                **row_to_dict(r),
                "is_read": bool(r["is_read"])
            }
            for r in rows
        ]

@router.post("/{notification_id}/read")
def mark_notification_as_read(notification_id: str, user_id: str):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?", (notification_id, user_id))
        return {"status": "success"}

@router.post("/user/{user_id}/read-all")
def mark_all_as_read(user_id: str):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE notifications SET is_read = 1 WHERE user_id = ?", (user_id,))
        return {"status": "success"}
