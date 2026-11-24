import uuid
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional
from app.models.schemas import QuotationCreate, QuotationResponse

# Baseline benchmark market rates for common Indian/Intl routes (Standard Individual Economy Fare)
ROUTE_BENCHMARKS = {
    ("bengaluru", "delhi"): {"base_indiv": 8500, "airline": "IndiGo Group Portal (>9 Pax)", "airline_code": "6E"},
    ("delhi", "bengaluru"): {"base_indiv": 8400, "airline": "Air India Group Desk (Min 10)", "airline_code": "AI"},
    ("mumbai", "goa"): {"base_indiv": 6200, "airline": "Air India Express (Min 10)", "airline_code": "IX"},
    ("goa", "mumbai"): {"base_indiv": 6100, "airline": "IndiGo Group Portal (>9 Pax)", "airline_code": "6E"},
    ("delhi", "mumbai"): {"base_indiv": 7800, "airline": "Air India Group Desk (Min 10)", "airline_code": "AI"},
    ("mumbai", "delhi"): {"base_indiv": 7600, "airline": "IndiGo Group Portal (>9 Pax)", "airline_code": "6E"},
    ("kolkata", "mumbai"): {"base_indiv": 7900, "airline": "Air India Group Desk (Min 10)", "airline_code": "AI"},
    ("mumbai", "kolkata"): {"base_indiv": 7700, "airline": "IndiGo Group Portal (>9 Pax)", "airline_code": "6E"},
    ("chennai", "port blair"): {"base_indiv": 9800, "airline": "Air India Group Desk (Min 10)", "airline_code": "AI"},
    ("delhi", "srinagar"): {"base_indiv": 9200, "airline": "IndiGo Group Portal (>9 Pax)", "airline_code": "6E"},
    ("hyderabad", "delhi"): {"base_indiv": 7200, "airline": "Air India Group Desk (Min 10)", "airline_code": "AI"},
    ("delhi", "dubai"): {"base_indiv": 21500, "airline": "Emirates Group Department (Min 10)", "airline_code": "EK"},
    ("mumbai", "dubai"): {"base_indiv": 19800, "airline": "Emirates Group Department (Min 10)", "airline_code": "EK"},
}

def get_route_benchmark(dep: str, arr: str) -> Dict[str, Any]:
    key = (dep.strip().lower(), arr.strip().lower())
    if key in ROUTE_BENCHMARKS:
        return ROUTE_BENCHMARKS[key]
    return {"base_indiv": 8000, "airline": "Air India / IndiGo Group Desk", "airline_code": "AI"}

def generate_simulated_quotation(
    group_id: str,
    departure_city: str,
    destination_city: str,
    passenger_count: int,
    cabin_class: str = "Economy",
    custom_quote_pax: Optional[float] = None,
    preferred_airline: Optional[str] = None
) -> Dict[str, Any]:
    """
    Generates realistic airline group quotation adhering strictly to carriers that support volume desks:
    - Air India: Minimum 10 passengers
    - IndiGo: More than 9 passengers (Min 10)
    - Air India Express: Minimum 10 passengers
    - Emirates: Minimum 10 passengers (Economy)
    - SpiceJet: Minimum 10 passengers
    """
    benchmark = get_route_benchmark(departure_city, destination_city)
    indiv_base = float(benchmark["base_indiv"])
    airline = preferred_airline or benchmark["airline"]
    
    if cabin_class == "Premium Economy":
        indiv_base *= 1.45
    elif cabin_class == "Business":
        indiv_base *= 2.8

    if custom_quote_pax is not None:
        group_pax_quote = float(custom_quote_pax)
    else:
        # Airline group desk tier pricing:
        # 10+ passengers qualify for volume block contracts (~9-12% lower base fare + perks)
        # 7-9 passengers qualify for mini-group preview (~3-5% lower base fare)
        # < 7 passengers: parity (0% savings)
        if passenger_count >= 10:
            group_pax_quote = round(indiv_base * 0.90, -1)  # 10% discount
        elif passenger_count >= 7:
            group_pax_quote = round(indiv_base * 0.95, -1)
        else:
            group_pax_quote = indiv_base

    taxes_per_pax = 1250.0
    if "dubai" in destination_city.lower() or "dubai" in departure_city.lower():
        taxes_per_pax = 2200.0

    total_indiv_cost = round((indiv_base + taxes_per_pax) * passenger_count, 2)
    total_group_cost = round((group_pax_quote + taxes_per_pax) * passenger_count, 2)
    savings_per_pax = round(indiv_base - group_pax_quote, 2)
    total_group_savings = round(savings_per_pax * passenger_count, 2)
    has_savings = savings_per_pax > 0

    # Airline specific perks
    if "emirates" in airline.lower():
        baggage = "30kg Checked Baggage + 7kg Cabin per passenger (Emirates Group Department Quota)"
        conditions = "Complimentary zone boarding, pre-allocated adjacent cabin seats, free name update up to 7 days prior."
    elif "air india express" in airline.lower():
        baggage = "25kg Checked Baggage + 7kg Cabin per passenger (Group Special vs 15kg individual)"
        conditions = "Pre-blocked adjacent group seats, complimentary hot meal pre-selection, free name change up to 72 hrs prior."
    elif "indigo" in airline.lower():
        baggage = "20kg Checked Baggage + 7kg Cabin per passenger (IndiGo Group Portal Tier)"
        conditions = "Standard seats pre-reserved together for whole contingent, zero charge for minor name amendments up to 7 days prior."
    else:
        baggage = "25kg Checked Baggage + 7kg Cabin per passenger (Air India Group Desk Advantage)"
        conditions = "Dedicated group check-in desk at DEL T3/BOM T2/BLR T2, free passenger name corrections up to 72 hours before flight."

    now = datetime.now(timezone.utc)
    validity_hours = 48
    expires_at = (now + timedelta(hours=validity_hours)).isoformat()
    
    return {
        "id": f"quote_{uuid.uuid4().hex[:10]}",
        "group_id": group_id,
        "airline_name": airline,
        "individual_fare_per_pax": indiv_base,
        "group_quote_per_pax": group_pax_quote,
        "taxes_and_fees_per_pax": taxes_per_pax,
        "baggage_conditions": baggage,
        "fare_conditions": conditions,
        "status": "issued",
        "validity_hours": validity_hours,
        "created_at": now.isoformat(),
        "expires_at": expires_at,
        "is_simulated": True,
        "disclaimer": "Demo Estimate – Not a Live Airline Offer. Actual airline group quotes depend on real-time inventory release, seasonal peaks, and carrier commercial terms.",
        "admin_notes": f"Generated via {airline} Wholesale Tariff Engine.",
        "total_individual_cost": total_indiv_cost,
        "total_group_cost": total_group_cost,
        "savings_per_pax": savings_per_pax,
        "total_group_savings": total_group_savings,
        "has_savings": has_savings
    }
