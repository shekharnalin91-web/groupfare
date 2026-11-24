from fastapi import APIRouter, HTTPException
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from app.core.database import get_db_connection, row_to_dict
from app.models.schemas import QuotationResponse

router = APIRouter(prefix="/quotations", tags=["Quotations & Fare Comparison"])

def calculate_quote_metrics(q_dict: Dict[str, Any], passenger_count: int = 10) -> Dict[str, Any]:
    indiv_base = float(q_dict["individual_fare_per_pax"])
    group_base = float(q_dict["group_quote_per_pax"])
    taxes = float(q_dict.get("taxes_and_fees_per_pax", 1200.0))
    
    indiv_total_per_pax = indiv_base + taxes
    group_total_per_pax = group_base + taxes
    
    savings_per_pax = indiv_base - group_base
    total_group_savings = savings_per_pax * passenger_count
    has_savings = savings_per_pax > 0
    
    q_dict["total_individual_cost"] = round(indiv_total_per_pax * passenger_count, 2)
    q_dict["total_group_cost"] = round(group_total_per_pax * passenger_count, 2)
    q_dict["savings_per_pax"] = round(savings_per_pax, 2)
    q_dict["total_group_savings"] = round(total_group_savings, 2)
    q_dict["has_savings"] = has_savings
    q_dict["is_simulated"] = bool(q_dict.get("is_simulated", 1))
    q_dict["disclaimer"] = "Demo Estimate – Not a Live Airline Offer. Final pricing subject to carrier confirmation and seat inventory availability."
    return q_dict

@router.get("/group/{group_id}")
def get_group_quotation(group_id: str):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM fare_quotations 
            WHERE group_id = ? 
            ORDER BY created_at DESC LIMIT 1
        """, (group_id,))
        quote = cursor.fetchone()
        if not quote:
            raise HTTPException(status_code=404, detail="No quotation has been issued for this group yet.")
            
        cursor.execute("""
            SELECT SUM(passengers_count) as confirmed 
            FROM group_members WHERE group_id = ? AND status = 'confirmed'
        """, (group_id,))
        conf = cursor.fetchone()["confirmed"] or 10
        
        return calculate_quote_metrics(row_to_dict(quote), passenger_count=conf)

@router.post("/{quotation_id}/accept")
def accept_quotation(quotation_id: str, user_id: str):
    """Member or coordinator accepts quotation terms."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM fare_quotations WHERE id = ?", (quotation_id,))
        quote = cursor.fetchone()
        if not quote:
            raise HTTPException(status_code=404, detail="Quotation not found.")
            
        cursor.execute("UPDATE fare_quotations SET status = 'accepted' WHERE id = ?", (quotation_id,))
        cursor.execute("UPDATE groups SET status = 'Completed' WHERE id = ?", (quote["group_id"],))
        
        return {"status": "success", "message": "Group quotation accepted. Proceeding to passenger name manifest submission."}
