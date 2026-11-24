import hashlib
import json
import uuid
from datetime import datetime, timedelta, timezone
from app.core.database import get_db_connection

def hash_pw(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()

REAL_FLIGHTS = [
    # 1. Bengaluru -> Delhi
    ("fl_blr_del_1", "6E-2041", "IndiGo", "6E", "Bengaluru", "BLR", "T2", "Delhi", "DEL", "T3", "06:15", "09:00", "2h 45m", "Non-stop", "Airbus A321neo", "Economy", 8500.0, 1250.0, 10, 10.0, 7650.0, "20kg Checked + 7kg Cabin", "IndiGo Group Portal requires >9 passengers (Min 10). Includes free standard seats together."),
    ("fl_blr_del_2", "AI-503", "Air India", "AI", "Bengaluru", "BLR", "T2", "Delhi", "DEL", "T3", "09:45", "12:35", "2h 50m", "Non-stop", "Boeing 787-8 Dreamliner", "Economy", 8900.0, 1250.0, 10, 11.0, 7920.0, "25kg Checked + 7kg Cabin", "Air India Group Desk accepts min 10 passengers. +10kg luggage perk and free name changes up to 72h."),
    ("fl_blr_del_3", "6E-2418", "IndiGo", "6E", "Bengaluru", "BLR", "T1", "Delhi", "DEL", "T1", "19:30", "22:15", "2h 45m", "Non-stop", "Airbus A320neo", "Economy", 8200.0, 1250.0, 10, 9.5, 7420.0, "20kg Checked + 7kg Cabin", "IndiGo Group Portal (>9 passengers)."),

    # 2. Delhi -> Bengaluru
    ("fl_del_blr_1", "AI-506", "Air India", "AI", "Delhi", "DEL", "T3", "Bengaluru", "BLR", "T2", "07:15", "10:05", "2h 50m", "Non-stop", "Boeing 787-8 Dreamliner", "Economy", 8700.0, 1250.0, 10, 10.0, 7830.0, "25kg Checked + 7kg Cabin", "Air India Group Desk: Min 10 passengers with dedicated check-in."),
    ("fl_del_blr_2", "6E-2134", "IndiGo", "6E", "Delhi", "DEL", "T2", "Bengaluru", "BLR", "T2", "17:00", "19:45", "2h 45m", "Non-stop", "Airbus A321neo", "Economy", 8400.0, 1250.0, 10, 10.0, 7560.0, "20kg Checked + 7kg Cabin", "IndiGo Group Portal: >9 passengers required for group net tariff."),

    # 3. Mumbai -> Goa
    ("fl_bom_goi_1", "IX-172", "Air India Express", "IX", "Mumbai", "BOM", "T2", "Goa", "GOX", "Mopa", "08:30", "09:45", "1h 15m", "Non-stop", "Boeing 737 MAX 8", "Economy", 6200.0, 1150.0, 10, 11.3, 5500.0, "25kg Checked + 7kg Cabin", "Air India Express Group Portal: Min 10 passengers. Includes complimentary hot meal."),
    ("fl_bom_goi_2", "6E-6214", "IndiGo", "6E", "Mumbai", "BOM", "T1", "Goa", "GOI", "Dabolim", "14:15", "15:30", "1h 15m", "Non-stop", "Airbus A320neo", "Economy", 6500.0, 1150.0, 10, 11.0, 5780.0, "20kg Checked + 7kg Cabin", "IndiGo Group Portal: >9 passengers. Guaranteed seats blocked together."),
    ("fl_bom_goi_3", "AI-663", "Air India", "AI", "Mumbai", "BOM", "T2", "Goa", "GOX", "Mopa", "18:00", "19:20", "1h 20m", "Non-stop", "Airbus A320neo", "Economy", 6800.0, 1150.0, 10, 11.0, 6050.0, "25kg Checked + 7kg Cabin", "Air India Group Desk: Min 10 passengers."),

    # 4. Goa -> Mumbai
    ("fl_goi_bom_1", "IX-173", "Air India Express", "IX", "Goa", "GOX", "Mopa", "Mumbai", "BOM", "T2", "10:30", "11:45", "1h 15m", "Non-stop", "Boeing 737 MAX 8", "Economy", 6100.0, 1150.0, 10, 10.5, 5460.0, "20kg Checked + 7kg Cabin", "Air India Express Group Portal (Min 10)."),
    ("fl_goi_bom_2", "6E-6215", "IndiGo", "6E", "Goa", "GOI", "Dabolim", "Mumbai", "BOM", "T1", "16:30", "17:45", "1h 15m", "Non-stop", "Airbus A320neo", "Economy", 6400.0, 1150.0, 10, 11.0, 5700.0, "20kg Checked + 7kg Cabin", "IndiGo Group Portal (>9 passengers)."),

    # 5. Delhi -> Mumbai
    ("fl_del_bom_1", "AI-887", "Air India", "AI", "Delhi", "DEL", "T3", "Mumbai", "BOM", "T2", "07:00", "09:15", "2h 15m", "Non-stop", "Boeing 777-300ER", "Economy", 7800.0, 1250.0, 10, 11.0, 6950.0, "25kg Checked + 7kg Cabin", "Air India Group Desk: Min 10 passengers with zone boarding."),
    ("fl_del_bom_2", "6E-2055", "IndiGo", "6E", "Delhi", "DEL", "T2", "Mumbai", "BOM", "T1", "11:30", "13:45", "2h 15m", "Non-stop", "Airbus A321neo", "Economy", 7500.0, 1250.0, 10, 10.0, 6750.0, "20kg Checked + 7kg Cabin", "IndiGo Group Portal: >9 passengers."),

    # 6. Mumbai -> Delhi
    ("fl_bom_del_1", "6E-5022", "IndiGo", "6E", "Mumbai", "BOM", "T1", "Delhi", "DEL", "T2", "06:45", "09:00", "2h 15m", "Non-stop", "Airbus A320neo", "Economy", 7600.0, 1250.0, 10, 10.5, 6800.0, "20kg Checked + 7kg Cabin", "IndiGo Group Portal (>9 passengers)."),
    ("fl_bom_del_2", "AI-806", "Air India", "AI", "Mumbai", "BOM", "T2", "Delhi", "DEL", "T3", "19:30", "21:45", "2h 15m", "Non-stop", "Boeing 787-8 Dreamliner", "Economy", 8200.0, 1250.0, 10, 11.0, 7300.0, "25kg Checked + 7kg Cabin", "Air India Group Desk (Min 10)."),

    # 7. Kolkata -> Mumbai
    ("fl_ccu_bom_1", "AI-773", "Air India", "AI", "Kolkata", "CCU", "T2", "Mumbai", "BOM", "T2", "06:30", "09:25", "2h 55m", "Non-stop", "Airbus A320neo", "Economy", 7900.0, 1250.0, 10, 10.8, 7050.0, "25kg Checked + 7kg Cabin", "Air India Group Desk (Min 10 passengers)."),
    ("fl_ccu_bom_2", "6E-6782", "IndiGo", "6E", "Kolkata", "CCU", "T2", "Mumbai", "BOM", "T1", "16:00", "18:55", "2h 55m", "Non-stop", "Airbus A321neo", "Economy", 7700.0, 1250.0, 10, 10.4, 6900.0, "20kg Checked + 7kg Cabin", "IndiGo Group Portal (>9 passengers)."),

    # 8. Chennai -> Port Blair
    ("fl_maa_ixz_1", "AI-549", "Air India", "AI", "Chennai", "MAA", "T1", "Port Blair", "IXZ", "Main", "05:05", "07:15", "2h 10m", "Non-stop", "Airbus A320neo", "Economy", 9800.0, 1250.0, 10, 10.7, 8750.0, "25kg Checked + 7kg Cabin", "Air India Group Desk (Min 10 passengers). Holiday quota lock."),
    ("fl_maa_ixz_2", "6E-6819", "IndiGo", "6E", "Chennai", "MAA", "T1", "Port Blair", "IXZ", "Main", "10:15", "12:30", "2h 15m", "Non-stop", "Airbus A320neo", "Economy", 9500.0, 1250.0, 10, 10.0, 8550.0, "20kg Checked + 7kg Cabin", "IndiGo Group Portal (>9 passengers)."),

    # 9. Delhi -> Srinagar
    ("fl_del_sxr_1", "6E-2144", "IndiGo", "6E", "Delhi", "DEL", "T2", "Srinagar", "SXR", "Main", "09:15", "10:45", "1h 30m", "Non-stop", "Airbus A320neo", "Economy", 9200.0, 1250.0, 10, 10.3, 8250.0, "20kg Checked + 7kg Cabin", "IndiGo Group Portal (>9 passengers)."),
    ("fl_del_sxr_2", "AI-825", "Air India", "AI", "Delhi", "DEL", "T3", "Srinagar", "SXR", "Main", "11:30", "13:00", "1h 30m", "Non-stop", "Airbus A320neo", "Economy", 9600.0, 1250.0, 10, 11.0, 8550.0, "25kg Checked + 7kg Cabin", "Air India Group Desk (Min 10 passengers)."),

    # 10. Hyderabad -> Delhi
    ("fl_hyd_del_1", "AI-559", "Air India", "AI", "Hyderabad", "HYD", "RGIA", "Delhi", "DEL", "T3", "06:00", "08:15", "2h 15m", "Non-stop", "Airbus A320neo", "Economy", 7200.0, 1250.0, 10, 10.4, 6450.0, "25kg Checked + 7kg Cabin", "Air India Group Desk (Min 10 passengers)."),
    ("fl_hyd_del_2", "6E-6012", "IndiGo", "6E", "Hyderabad", "HYD", "RGIA", "Delhi", "DEL", "T2", "14:30", "16:45", "2h 15m", "Non-stop", "Airbus A321neo", "Economy", 7000.0, 1250.0, 10, 10.0, 6300.0, "20kg Checked + 7kg Cabin", "IndiGo Group Portal (>9 passengers)."),

    # 11. Delhi -> Dubai
    ("fl_del_dxb_1", "EK-511", "Emirates", "EK", "Delhi", "DEL", "T3", "Dubai", "DXB", "T3", "10:35", "13:00", "3h 55m", "Non-stop", "Boeing 777-300ER", "Economy", 21500.0, 2200.0, 10, 10.7, 19200.0, "30kg Checked + 7kg Cabin", "Emirates Group Department: Min 10 passengers in Economy. Low deposit buffer with manifest lock."),
    ("fl_del_dxb_2", "AI-995", "Air India", "AI", "Delhi", "DEL", "T3", "Dubai", "DXB", "T1", "20:00", "22:20", "3h 50m", "Non-stop", "Boeing 787-8 Dreamliner", "Economy", 18500.0, 2100.0, 10, 10.0, 16650.0, "25kg Checked + 7kg Cabin", "Air India Group Desk (Min 10 passengers)."),
    ("fl_del_dxb_3", "6E-1461", "IndiGo", "6E", "Delhi", "DEL", "T3", "Dubai", "DXB", "T2", "17:15", "19:40", "3h 55m", "Non-stop", "Airbus A321neo", "Economy", 16200.0, 1950.0, 10, 8.6, 14800.0, "20kg Checked + 7kg Cabin", "IndiGo Group Portal (>9 passengers)."),

    # 12. Mumbai -> Dubai
    ("fl_bom_dxb_1", "EK-505", "Emirates", "EK", "Mumbai", "BOM", "T2", "Dubai", "DXB", "T3", "09:50", "11:45", "3h 25m", "Non-stop", "Boeing 777-300ER", "Economy", 19800.0, 2200.0, 10, 10.1, 17800.0, "30kg Checked + 7kg Cabin", "Emirates Group Department: Min 10 passengers. Generous 30kg allowance."),
    ("fl_bom_dxb_2", "AI-983", "Air India", "AI", "Mumbai", "BOM", "T2", "Dubai", "DXB", "T1", "14:00", "15:55", "3h 25m", "Non-stop", "Airbus A321neo", "Economy", 17200.0, 2100.0, 10, 10.0, 15500.0, "25kg Checked + 7kg Cabin", "Air India Group Desk (Min 10 passengers).")
]

def seed_database():
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # 1. Check & Seed Flights
        cursor.execute("SELECT COUNT(*) as count FROM flights")
        if cursor.fetchone()["count"] == 0:
            print("[GroupFare] Seeding real flights across national & international corridors...")
            cursor.executemany("""
                INSERT INTO flights (
                    id, flight_number, airline_name, airline_code,
                    departure_city, departure_airport_code, departure_terminal,
                    destination_city, destination_airport_code, destination_terminal,
                    departure_time, arrival_time, duration, stops,
                    aircraft_type, cabin_class, base_individual_fare, taxes_and_fees,
                    min_group_size, group_discount_pct, group_quota_pax_fare,
                    group_baggage, group_policy
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, REAL_FLIGHTS)
            
        # 2. Check Users
        cursor.execute("SELECT COUNT(*) as count FROM users")
        if cursor.fetchone()["count"] == 0:
            print("[GroupFare] Seeding realistic user accounts...")
            users = [
                ("user_rahul", "rahul@groupfare.com", hash_pw("password123"), "Rahul Sharma", "+91 98765 43210", "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80", "Verified Passenger", "user"),
                ("user_ananya", "ananya@groupfare.com", hash_pw("password123"), "Ananya Patel", "+91 98111 22334", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80", "Verified Passenger", "user"),
                ("user_priya", "priya@groupfare.com", hash_pw("password123"), "Priya Verma", "+91 98222 33445", "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80", "KYC Verified", "user"),
                ("user_amit", "amit@groupfare.com", hash_pw("password123"), "Amit Kumar", "+91 98333 44556", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80", "Verified Passenger", "user"),
                ("user_sneha", "sneha@groupfare.com", hash_pw("password123"), "Sneha Reddy", "+91 98444 55667", "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80", "Verified Passenger", "user"),
                ("user_vikram", "vikram@groupfare.com", hash_pw("password123"), "Vikram Singh", "+91 98555 66778", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80", "Verified Passenger", "user"),
                ("user_admin", "admin@groupfare.com", hash_pw("admin123"), "CORRUPTX Admin", "+91 99999 00000", "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80", "Platform Administrator", "admin")
            ]
            cursor.executemany("""
                INSERT INTO users (id, email, password_hash, full_name, phone, avatar, verification_status, role)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, users)

        # 3. Check Groups & enrich with flight numbers and multiple corridors
        cursor.execute("SELECT COUNT(*) as count FROM groups")
        if cursor.fetchone()["count"] <= 4:
            print("[GroupFare] Enhancing groups with real flight numbers across corridors...")
            # Clear old groups and re-seed with rich corridor data
            cursor.execute("DELETE FROM group_members")
            cursor.execute("DELETE FROM fare_quotations")
            cursor.execute("DELETE FROM groups")
            
            now = datetime.now(timezone.utc)
            dl_blr = (now + timedelta(days=5)).isoformat()
            dl_goa = (now + timedelta(days=2)).isoformat()
            dl_dxb = (now + timedelta(days=8)).isoformat()
            dl_del_bom = (now + timedelta(days=4)).isoformat()
            dl_bom_del = (now + timedelta(days=6)).isoformat()
            dl_maa = (now + timedelta(days=7)).isoformat()
            dl_sxr = (now + timedelta(days=3)).isoformat()
            dl_ccu = (now + timedelta(days=9)).isoformat()
            dl_hyd = (now + timedelta(days=5)).isoformat()

            new_groups = [
                # 1. BLR-DEL: 8 confirmed, 2 interested (IndiGo 6E-2041)
                ("grp_blr_del", "BLR-DEL Winter Techies Cohort", "user_rahul", "Bengaluru", "Delhi", "2026-12-20", 10, "Economy", "Coordinating developers & tech attendees heading home for winter holidays on IndiGo early morning flight.", "BLR-DEL-2041", "Filling Fast", dl_blr, 8500.0, "6E-2041", "IndiGo", "06:15", "09:00", "BLR", "DEL", "T2", "T3", "2h 45m", "Airbus A321neo"),
                
                # 2. BOM-GOI: 10 confirmed (Target Reached & Quote Received!) (Air India Express IX-172)
                ("grp_bom_goi", "Goa Sunsplash Holiday Group", "user_priya", "Mumbai", "Goa", "2026-12-24", 10, "Economy", "Holiday travellers gathering to unlock airline group fare quotas for Christmas weekend in North Goa on Air India Express.", "GOA-SUN-172", "Quote Received", dl_goa, 6200.0, "IX-172", "Air India Express", "08:30", "09:45", "BOM", "GOX", "T2", "Mopa", "1h 15m", "Boeing 737 MAX 8"),
                
                # 3. DEL-DXB: 12 confirmed (Emirates EK-511)
                ("grp_del_dxb", "Dubai NYE Shopping Contingent", "user_amit", "Delhi", "Dubai", "2026-12-30", 12, "Economy", "Independent travelers coordinating for New Year fireworks and shopping festival on Emirates A380/777 flight.", "DXB-NYE-511", "Quote Requested", dl_dxb, 21500.0, "EK-511", "Emirates", "10:35", "13:00", "DEL", "DXB", "T3", "T3", "3h 55m", "Boeing 777-300ER"),

                # 4. DEL-BOM: 8 confirmed (Air India AI-887)
                ("grp_del_bom", "DEL-BOM Commercial Corridor", "user_sneha", "Delhi", "Mumbai", "2026-12-21", 10, "Economy", "Business professionals and consultants locking wholesale block on wide-body Air India B777.", "DEL-BOM-887", "Filling Fast", dl_del_bom, 7800.0, "AI-887", "Air India", "07:00", "09:15", "DEL", "BOM", "T3", "T2", "2h 15m", "Boeing 777-300ER"),

                # 5. BOM-DEL: 5 confirmed (IndiGo 6E-5022)
                ("grp_bom_del", "MUM-DEL Festive Flyers", "user_vikram", "Mumbai", "Delhi", "2026-12-22", 10, "Economy", "Holiday travelers heading to NCR for year-end family gatherings.", "MUM-DEL-5022", "Open", dl_bom_del, 7600.0, "6E-5022", "IndiGo", "06:45", "09:00", "BOM", "DEL", "T1", "T2", "2h 15m", "Airbus A320neo"),

                # 6. MAA-IXZ: 9 confirmed (Air India AI-549 Andaman holiday)
                ("grp_maa_ixz", "Andaman Island Winter Escape", "user_ananya", "Chennai", "Port Blair", "2026-12-26", 10, "Economy", "Vacationers flying to Havelock Island via Port Blair. 9 confirmed, just 1 more to lock Air India group quota!", "MAA-IXZ-549", "Filling Fast", dl_maa, 9800.0, "AI-549", "Air India", "05:05", "07:15", "MAA", "IXZ", "T1", "Main", "2h 10m", "Airbus A320neo"),

                # 7. DEL-SXR: 7 confirmed (IndiGo 6E-2144 Kashmir Snow)
                ("grp_del_sxr", "Kashmir Winter Wonderland Cohort", "user_rahul", "Delhi", "Srinagar", "2026-12-27", 10, "Economy", "Skiers and holidaymakers heading to Gulmarg and Srinagar.", "DEL-SXR-2144", "Filling Fast", dl_sxr, 9200.0, "6E-2144", "IndiGo", "09:15", "10:45", "DEL", "SXR", "T2", "Main", "1h 30m", "Airbus A320neo"),

                # 8. CCU-BOM: 4 confirmed (Air India AI-773)
                ("grp_ccu_bom", "CCU-BOM Creative Tribe", "user_priya", "Kolkata", "Mumbai", "2027-01-05", 10, "Economy", "Designers and media attendees flying from Kolkata to Mumbai.", "CCU-BOM-773", "Open", dl_ccu, 7900.0, "AI-773", "Air India", "06:30", "09:25", "CCU", "BOM", "T2", "T2", "2h 55m", "Airbus A320neo"),

                # 9. HYD-DEL: 3 confirmed (Air India AI-559)
                ("grp_hyd_del", "Hyderabad Tech Delegate Flight", "user_amit", "Hyderabad", "Delhi", "2026-12-23", 10, "Economy", "Tech delegates attending annual policy summit in New Delhi.", "HYD-DEL-559", "Open", dl_hyd, 7200.0, "AI-559", "Air India", "06:00", "08:15", "HYD", "DEL", "RGIA", "T3", "2h 15m", "Airbus A320neo")
            ]

            cursor.executemany("""
                INSERT INTO groups (
                    id, name, creator_id, departure_city, destination_city,
                    travel_date, passenger_target, cabin_class, description,
                    invite_code, status, deadline, estimated_individual_fare,
                    flight_number, airline_name, departure_time, arrival_time,
                    departure_airport_code, destination_airport_code,
                    departure_terminal, destination_terminal, duration, aircraft_type
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, new_groups)

            # Members
            members = [
                # BLR-DEL: 8 confirmed, 1 interested
                ("mem_1", "grp_blr_del", "user_rahul", None, 2, "confirmed", "creator"),
                ("mem_2", "grp_blr_del", "user_ananya", None, 1, "confirmed", "member"),
                ("mem_3", "grp_blr_del", "user_priya", None, 2, "confirmed", "member"),
                ("mem_4", "grp_blr_del", "user_amit", None, 1, "confirmed", "member"),
                ("mem_5", "grp_blr_del", "user_sneha", None, 1, "confirmed", "member"),
                ("mem_6", "grp_blr_del", "user_vikram", None, 1, "confirmed", "member"),

                # BOM-GOI: 10 confirmed (Target reached!)
                ("mem_g1", "grp_bom_goi", "user_priya", None, 2, "confirmed", "creator"),
                ("mem_g2", "grp_bom_goi", "user_rahul", None, 2, "confirmed", "member"),
                ("mem_g3", "grp_bom_goi", "user_ananya", None, 1, "confirmed", "member"),
                ("mem_g4", "grp_bom_goi", "user_amit", None, 2, "confirmed", "member"),
                ("mem_g5", "grp_bom_goi", "user_sneha", None, 2, "confirmed", "member"),
                ("mem_g6", "grp_bom_goi", "user_vikram", None, 1, "confirmed", "member"),

                # DEL-DXB: 12 confirmed
                ("mem_d1", "grp_del_dxb", "user_amit", None, 2, "confirmed", "creator"),
                ("mem_d2", "grp_del_dxb", "user_rahul", None, 2, "confirmed", "member"),
                ("mem_d3", "grp_del_dxb", "user_ananya", None, 2, "confirmed", "member"),
                ("mem_d4", "grp_del_dxb", "user_priya", None, 2, "confirmed", "member"),
                ("mem_d5", "grp_del_dxb", "user_sneha", None, 2, "confirmed", "member"),
                ("mem_d6", "grp_del_dxb", "user_vikram", None, 2, "confirmed", "member"),

                # DEL-BOM: 8 confirmed
                ("mem_db1", "grp_del_bom", "user_sneha", None, 2, "confirmed", "creator"),
                ("mem_db2", "grp_del_bom", "user_rahul", None, 2, "confirmed", "member"),
                ("mem_db3", "grp_del_bom", "user_priya", None, 2, "confirmed", "member"),
                ("mem_db4", "grp_del_bom", "user_amit", None, 2, "confirmed", "member"),

                # MAA-IXZ: 9 confirmed
                ("mem_m1", "grp_maa_ixz", "user_ananya", None, 2, "confirmed", "creator"),
                ("mem_m2", "grp_maa_ixz", "user_priya", None, 2, "confirmed", "member"),
                ("mem_m3", "grp_maa_ixz", "user_amit", None, 3, "confirmed", "member"),
                ("mem_m4", "grp_maa_ixz", "user_sneha", None, 2, "confirmed", "member"),

                # DEL-SXR: 7 confirmed
                ("mem_s1", "grp_del_sxr", "user_rahul", None, 2, "confirmed", "creator"),
                ("mem_s2", "grp_del_sxr", "user_vikram", None, 3, "confirmed", "member"),
                ("mem_s3", "grp_del_sxr", "user_ananya", None, 2, "confirmed", "member")
            ]
            cursor.executemany("""
                INSERT INTO group_members (id, group_id, user_id, travel_request_id, passengers_count, status, role)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, members)

            # Quotation for BOM-GOI
            exp_goa = (now + timedelta(hours=36)).isoformat()
            cursor.execute("""
                INSERT INTO fare_quotations (
                    id, group_id, airline_name, individual_fare_per_pax,
                    group_quote_per_pax, taxes_and_fees_per_pax, baggage_conditions,
                    fare_conditions, status, validity_hours, expires_at, is_simulated, admin_notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                "quote_bom_goi_01",
                "grp_bom_goi",
                "Air India Express Group Portal",
                6200.0,
                5500.0,
                1150.0,
                "25kg Checked baggage + 7kg Cabin baggage per passenger (Group Special vs 15kg standard)",
                "Adjacent group seating pre-blocked, free passenger name corrections up to 72 hours prior to flight departure, zero ticket reissue penalty for date shifts if done 7 days prior.",
                "issued",
                48,
                exp_goa,
                1,
                "Verified wholesale contract based on 10 confirmed passenger block (Air India Express Group Portal)."
            ))

        print("[GroupFare] Initial dataset seeded successfully!")
