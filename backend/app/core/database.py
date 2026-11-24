import sqlite3
import os
import json
from datetime import datetime, timezone
from contextlib import contextmanager
from app.core.config import settings

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "groupfare.db")

@contextmanager
def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db():
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # 1. Users table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            phone TEXT DEFAULT '',
            avatar TEXT DEFAULT '',
            verification_status TEXT DEFAULT 'Verified Passenger',
            role TEXT DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)
        
        # 2. Travel Requests table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS travel_requests (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            departure_city TEXT NOT NULL,
            destination_city TEXT NOT NULL,
            travel_date TEXT NOT NULL,
            flexible_dates INTEGER DEFAULT 0,
            flexibility_days INTEGER DEFAULT 1,
            passengers_count INTEGER DEFAULT 1,
            cabin_class TEXT DEFAULT 'Economy',
            max_budget_per_passenger REAL DEFAULT 10000.0,
            preferred_airlines TEXT DEFAULT '[]',
            preferences TEXT DEFAULT '',
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)
        
        # 3. Real Flights table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS flights (
            id TEXT PRIMARY KEY,
            flight_number TEXT NOT NULL,
            airline_name TEXT NOT NULL,
            airline_code TEXT NOT NULL,
            departure_city TEXT NOT NULL,
            departure_airport_code TEXT NOT NULL,
            departure_terminal TEXT DEFAULT 'T1',
            destination_city TEXT NOT NULL,
            destination_airport_code TEXT NOT NULL,
            destination_terminal TEXT DEFAULT 'T2',
            departure_time TEXT NOT NULL,
            arrival_time TEXT NOT NULL,
            duration TEXT NOT NULL,
            stops TEXT DEFAULT 'Non-stop',
            aircraft_type TEXT DEFAULT 'Airbus A320neo',
            cabin_class TEXT DEFAULT 'Economy',
            base_individual_fare REAL NOT NULL,
            taxes_and_fees REAL DEFAULT 1250.0,
            min_group_size INTEGER DEFAULT 10,
            group_discount_pct REAL DEFAULT 10.0,
            group_quota_pax_fare REAL NOT NULL,
            group_baggage TEXT DEFAULT '25kg Check-in + 7kg Cabin',
            group_policy TEXT NOT NULL
        );
        """)

        # 4. Groups table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS groups (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            creator_id TEXT NOT NULL,
            departure_city TEXT NOT NULL,
            destination_city TEXT NOT NULL,
            travel_date TEXT NOT NULL,
            passenger_target INTEGER DEFAULT 10,
            cabin_class TEXT DEFAULT 'Economy',
            description TEXT DEFAULT '',
            invite_code TEXT UNIQUE NOT NULL,
            status TEXT DEFAULT 'Open',
            deadline TIMESTAMP NOT NULL,
            estimated_individual_fare REAL DEFAULT 8500.0,
            flight_number TEXT DEFAULT '',
            airline_name TEXT DEFAULT '',
            departure_time TEXT DEFAULT '08:00',
            arrival_time TEXT DEFAULT '10:45',
            departure_airport_code TEXT DEFAULT '',
            destination_airport_code TEXT DEFAULT '',
            departure_terminal TEXT DEFAULT 'T1',
            destination_terminal TEXT DEFAULT 'T2',
            duration TEXT DEFAULT '2h 45m',
            aircraft_type TEXT DEFAULT 'Airbus A320neo',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (creator_id) REFERENCES users(id)
        );
        """)
        
        # Migrate existing groups table if columns are missing
        cursor.execute("PRAGMA table_info(groups)")
        columns = [row["name"] for row in cursor.fetchall()]
        cols_to_add = [
            ("flight_number", "TEXT DEFAULT ''"),
            ("airline_name", "TEXT DEFAULT ''"),
            ("departure_time", "TEXT DEFAULT '08:00'"),
            ("arrival_time", "TEXT DEFAULT '10:45'"),
            ("departure_airport_code", "TEXT DEFAULT ''"),
            ("destination_airport_code", "TEXT DEFAULT ''"),
            ("departure_terminal", "TEXT DEFAULT 'T1'"),
            ("destination_terminal", "TEXT DEFAULT 'T2'"),
            ("duration", "TEXT DEFAULT '2h 45m'"),
            ("aircraft_type", "TEXT DEFAULT 'Airbus A320neo'")
        ]
        for col_name, col_def in cols_to_add:
            if col_name not in columns:
                try:
                    cursor.execute(f"ALTER TABLE groups ADD COLUMN {col_name} {col_def}")
                except Exception:
                    pass

        # 5. Group Members table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS group_members (
            id TEXT PRIMARY KEY,
            group_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            travel_request_id TEXT,
            passengers_count INTEGER DEFAULT 1,
            status TEXT DEFAULT 'interested',
            role TEXT DEFAULT 'member',
            joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(group_id, user_id)
        );
        """)
        
        # 6. Fare Quotations table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS fare_quotations (
            id TEXT PRIMARY KEY,
            group_id TEXT NOT NULL,
            airline_name TEXT NOT NULL,
            individual_fare_per_pax REAL NOT NULL,
            group_quote_per_pax REAL NOT NULL,
            taxes_and_fees_per_pax REAL DEFAULT 1200.0,
            baggage_conditions TEXT DEFAULT '',
            fare_conditions TEXT DEFAULT '',
            status TEXT DEFAULT 'issued',
            validity_hours INTEGER DEFAULT 48,
            expires_at TIMESTAMP NOT NULL,
            is_simulated INTEGER DEFAULT 1,
            admin_notes TEXT DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
        );
        """)
        
        # 7. Notifications table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS notifications (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            type TEXT NOT NULL,
            link TEXT DEFAULT '',
            is_read INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)
        
        # 8. Chat History table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS chat_history (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            action_type TEXT DEFAULT '',
            action_data TEXT DEFAULT '{}',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

def row_to_dict(row):
    if row is None:
        return None
    d = dict(row)
    if 'preferred_airlines' in d and isinstance(d['preferred_airlines'], str):
        try:
            d['preferred_airlines'] = json.loads(d['preferred_airlines'])
        except Exception:
            d['preferred_airlines'] = []
    return d
