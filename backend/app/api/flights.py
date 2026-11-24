from fastapi import APIRouter, HTTPException
from typing import List, Optional, Dict, Any
from app.core.database import get_db_connection, row_to_dict
from app.models.schemas import FlightResponse

router = APIRouter(prefix="/flights", tags=["Real Flights & Airline Group Desks"])

AIRLINE_GROUP_POLICIES = [
    {
        "airline_name": "Air India",
        "airline_code": "AI",
        "min_group_size": 10,
        "policy_rule": "Air India Group Desk accepts minimum 10 passengers traveling together on the same flight sector.",
        "benefits": [
            "Up to 10-12% wholesale tier discount on base fare",
            "Enhanced 25kg checked baggage allowance (vs 15kg individual standard)",
            "Flexible passenger name manifest submission up to 72 hours prior to departure",
            "Dedicated group check-in counter at DEL T3, BOM T2, and BLR T2 hubs"
        ],
        "badge_color": "rose",
        "logo_text": "Air India Group Desk"
    },
    {
        "airline_name": "IndiGo",
        "airline_code": "6E",
        "min_group_size": 10,
        "policy_rule": "IndiGo Group Portal requires more than 9 passengers (minimum 10 passengers) for bulk fare quotes.",
        "benefits": [
            "Wholesale group net tariff block",
            "20kg to 25kg check-in baggage quota",
            "Free adjacent standard seat selection block for whole contingent",
            "Zero charge for minor passenger name adjustments up to 7 days before departure"
        ],
        "badge_color": "sky",
        "logo_text": "IndiGo Group Desk (>9 Pax)"
    },
    {
        "airline_name": "Air India Express",
        "airline_code": "IX",
        "min_group_size": 10,
        "policy_rule": "Air India Express Group Portal requires minimum 10 passengers.",
        "benefits": [
            "Special leisure corridor wholesale tariffs (Goa, Gulf, Tier-2)",
            "20kg checked baggage per passenger",
            "Complimentary hot meal pre-selection for groups"
        ],
        "badge_color": "amber",
        "logo_text": "Air India Express (Min 10)"
    },
    {
        "airline_name": "Emirates",
        "airline_code": "EK",
        "min_group_size": 10,
        "policy_rule": "Emirates Group Department requires minimum 10 passengers traveling together in Economy.",
        "benefits": [
            "Contracted wholesale net group rate for international corridors (Dubai, Gulf)",
            "30kg generous checked baggage allowance",
            "Initial low seat deposit buffer with final balance due 30 days prior",
            "Pre-arranged group check-in and zone boarding"
        ],
        "badge_color": "red",
        "logo_text": "Emirates Group Dept (Min 10)"
    },
    {
        "airline_name": "SpiceJet",
        "airline_code": "SG",
        "min_group_size": 10,
        "policy_rule": "SpiceJet Group Desk accepts minimum 10 passengers.",
        "benefits": [
            "Festival/holiday volume concession pricing",
            "20kg checked baggage allowance"
        ],
        "badge_color": "orange",
        "logo_text": "SpiceJet Group Desk (Min 10)"
    }
]

def format_flight_record(r: Dict[str, Any]) -> Dict[str, Any]:
    base = float(r["base_individual_fare"])
    taxes = float(r.get("taxes_and_fees", 1250.0))
    disc = float(r.get("group_discount_pct", 10.0))
    group_base = round(base * (1.0 - (disc / 100.0)), -1)
    
    total_indiv = base + taxes
    total_group = group_base + taxes
    savings = base - group_base
    
    r_dict = dict(r)
    r_dict["group_quota_pax_fare"] = group_base
    r_dict["total_individual_fare"] = total_indiv
    r_dict["total_group_pax_fare"] = total_group
    r_dict["potential_savings_per_pax"] = savings
    return r_dict

@router.get("/", response_model=List[FlightResponse])
def get_flights(
    departure: Optional[str] = None,
    destination: Optional[str] = None,
    airline: Optional[str] = None
):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        query = "SELECT * FROM flights WHERE 1=1"
        params = []
        
        if departure:
            query += " AND (LOWER(departure_city) LIKE ? OR LOWER(departure_airport_code) LIKE ?)"
            params.extend([f"%{departure.strip().lower()}%", f"%{departure.strip().lower()}%"])
        if destination:
            query += " AND (LOWER(destination_city) LIKE ? OR LOWER(destination_airport_code) LIKE ?)"
            params.extend([f"%{destination.strip().lower()}%", f"%{destination.strip().lower()}%"])
        if airline:
            query += " AND (LOWER(airline_name) LIKE ? OR LOWER(airline_code) LIKE ?)"
            params.extend([f"%{airline.strip().lower()}%", f"%{airline.strip().lower()}%"])
            
        query += " ORDER BY departure_time ASC"
        cursor.execute(query, params)
        rows = cursor.fetchall()
        return [format_flight_record(row_to_dict(r)) for r in rows]

@router.get("/airlines")
def get_airline_policies():
    """Returns official group policies for airlines that offer bulk booking quotas."""
    return AIRLINE_GROUP_POLICIES

@router.get("/routes")
def get_all_routes():
    """List of all available flight corridors."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT DISTINCT departure_city, departure_airport_code, destination_city, destination_airport_code 
            FROM flights 
            ORDER BY departure_city ASC
        """)
        return [row_to_dict(r) for r in cursor.fetchall()]

@router.get("/{flight_id}", response_model=FlightResponse)
def get_flight_by_id(flight_id: str):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM flights WHERE id = ?", (flight_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Flight not found")
        return format_flight_record(row_to_dict(row))
