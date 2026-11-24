from datetime import datetime, date
from typing import List, Dict, Any, Optional
import math
from app.models.schemas import TravelRequestResponse, GroupResponse, CompatibilityScore, CabinClass

def parse_date(d_str: str) -> date:
    try:
        return datetime.strptime(d_str.split("T")[0], "%Y-%m-%d").date()
    except Exception:
        return date.today()

def calculate_compatibility(request: Dict[str, Any], group: Dict[str, Any]) -> CompatibilityScore:
    """
    Transparent compatibility scoring formula:
    - Route compatibility: 40%
    - Date compatibility: 30%
    - Flexibility: 15%
    - Cabin class: 10%
    - Budget compatibility: 5%
    Total: 100%
    """
    reasons: List[str] = []
    
    # 1. Route Compatibility (40%)
    req_dep = request.get("departure_city", "").strip().lower()
    req_arr = request.get("destination_city", "").strip().lower()
    grp_dep = group.get("departure_city", "").strip().lower()
    grp_arr = group.get("destination_city", "").strip().lower()
    
    route_score = 0.0
    if req_dep == grp_dep and req_arr == grp_arr:
        route_score = 40.0
        reasons.append(f"Identical flight corridor: {group.get('departure_city')} -> {group.get('destination_city')} (40/40 pts)")
    elif req_dep == grp_dep or req_arr == grp_arr:
        route_score = 10.0
        reasons.append("Partial corridor match - transit alignment required (10/40 pts)")
    else:
        route_score = 0.0
        reasons.append("Different travel corridor (0/40 pts)")
    
    # 2. Date Compatibility (30%)
    req_date = parse_date(str(request.get("travel_date", "")))
    grp_date = parse_date(str(group.get("travel_date", "")))
    day_diff = abs((req_date - grp_date).days)
    
    date_score = 0.0
    if day_diff == 0:
        date_score = 30.0
        reasons.append(f"Exact travel date match on {group.get('travel_date')} (30/30 pts)")
    elif day_diff == 1:
        date_score = 22.0
        reasons.append(f"Nearby travel date ({day_diff} day difference) (22/30 pts)")
    elif day_diff == 2:
        date_score = 14.0
        reasons.append(f"Acceptable date window ({day_diff} days difference) (14/30 pts)")
    elif day_diff <= 3:
        date_score = 8.0
        reasons.append(f"Borderline date window ({day_diff} days difference) (8/30 pts)")
    else:
        date_score = 0.0
        reasons.append(f"Date gap too wide ({day_diff} days) (0/30 pts)")
    
    # 3. Flexibility Compatibility (15%)
    user_flexible = bool(request.get("flexible_dates", False))
    flex_days = int(request.get("flexibility_days", 1))
    
    flex_score = 0.0
    if user_flexible:
        if day_diff <= flex_days:
            flex_score = 15.0
            reasons.append(f"Passenger marked +/-{flex_days} days flexibility; within viable group formation threshold (15/15 pts)")
        else:
            flex_score = 7.0
            reasons.append("Flexibility active but dates slightly exceed declared range (7/15 pts)")
    else:
        if day_diff == 0:
            flex_score = 12.0
            reasons.append("Fixed date preference precisely satisfied by group departure (12/15 pts)")
        else:
            flex_score = 0.0
            reasons.append("Fixed date preference does not align with group travel date (0/15 pts)")
    
    # 4. Cabin Class Compatibility (10%)
    req_cabin = str(request.get("cabin_class", "Economy")).strip().lower()
    grp_cabin = str(group.get("cabin_class", "Economy")).strip().lower()
    
    cabin_score = 0.0
    if req_cabin == grp_cabin:
        cabin_score = 10.0
        reasons.append(f"Exact cabin class alignment: {group.get('cabin_class')} (10/10 pts)")
    elif (req_cabin == "economy" and grp_cabin == "premium economy") or (req_cabin == "premium economy" and grp_cabin == "economy"):
        cabin_score = 5.0
        reasons.append(f"Adjacent cabin classes ({req_cabin} vs {grp_cabin}) (5/10 pts)")
    else:
        cabin_score = 0.0
        reasons.append(f"Cabin mismatch: requested {req_cabin} vs group {grp_cabin} (0/10 pts)")
        
    # 5. Budget Compatibility (5%)
    user_budget = float(request.get("max_budget_per_passenger", 10000.0) or 10000.0)
    est_fare = float(group.get("estimated_individual_fare", 8500.0) or 8500.0)
    
    budget_score = 0.0
    if user_budget >= est_fare:
        budget_score = 5.0
        reasons.append(f"Budget (₹{int(user_budget):,}) comfortably covers estimated fare (₹{int(est_fare):,}) (5/5 pts)")
    elif user_budget >= est_fare * 0.9:
        budget_score = 3.0
        reasons.append(f"Budget (₹{int(user_budget):,}) close to estimated group fare (3/5 pts)")
    else:
        budget_score = 1.0
        reasons.append(f"Budget (₹{int(user_budget):,}) lower than current group expectation (1/5 pts)")
        
    total_score = round(route_score + date_score + flex_score + cabin_score + budget_score)
    total_score = max(0, min(100, total_score))
    
    confirmed = group.get("current_confirmed_passengers", 0)
    interested = group.get("current_interested_passengers", 0)
    total_travelers = confirmed + interested
    
    return CompatibilityScore(
        group_id=str(group.get("id")),
        score_percentage=total_score,
        route_score=route_score,
        date_score=date_score,
        flexibility_score=flex_score,
        cabin_score=cabin_score,
        budget_score=budget_score,
        compatible_passengers=total_travelers,
        reasons=reasons
    )

def find_best_group_matches(request: Dict[str, Any], groups: List[Dict[str, Any]], min_score: int = 40) -> List[CompatibilityScore]:
    scored_matches: List[CompatibilityScore] = []
    for g in groups:
        # Don't match cancelled or completed groups
        if g.get("status") in ["Completed", "Cancelled"]:
            continue
        score = calculate_compatibility(request, g)
        if score.score_percentage >= min_score:
            score.group = GroupResponse(**g) if isinstance(g, dict) and "id" in g else None
            scored_matches.append(score)
    
    # Sort descending by score_percentage
    scored_matches.sort(key=lambda x: x.score_percentage, reverse=True)
    return scored_matches
