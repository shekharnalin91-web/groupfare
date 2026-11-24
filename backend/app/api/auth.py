from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
import uuid
import hashlib
from app.core.database import get_db_connection, row_to_dict
from app.models.schemas import UserRegister, UserLogin, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

def hash_pw(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()

@router.post("/register", response_model=UserResponse)
def register(user: UserRegister):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE email = ?", (user.email.strip().lower(),))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="An account with this email already exists.")
            
        user_id = f"user_{uuid.uuid4().hex[:8]}"
        avatar = user.avatar or f"https://api.dicebear.com/7.x/initials/svg?seed={user.full_name}"
        
        cursor.execute("""
            INSERT INTO users (id, email, password_hash, full_name, phone, avatar, verification_status, role)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id,
            user.email.strip().lower(),
            hash_pw(user.password),
            user.full_name.strip(),
            user.phone or "",
            avatar,
            "Verified Passenger",
            user.role or "user"
        ))
        
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        new_user = cursor.fetchone()
        return row_to_dict(new_user)

@router.post("/login", response_model=UserResponse)
def login(creds: UserLogin):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM users 
            WHERE email = ? AND password_hash = ?
        """, (creds.email.strip().lower(), hash_pw(creds.password)))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password.")
        return row_to_dict(user)

@router.get("/users", response_model=List[UserResponse])
def get_all_users():
    """Demo helper: lists available seeded test users for easy switching."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, email, full_name, phone, avatar, verification_status, role, created_at FROM users")
        return [row_to_dict(r) for r in cursor.fetchall()]

@router.get("/user/{user_id}", response_model=UserResponse)
def get_user_profile(user_id: str):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found.")
        return row_to_dict(user)
