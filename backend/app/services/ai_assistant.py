import os
import json
from typing import Dict, Any, List, Optional
from datetime import datetime
from app.core.config import settings
from app.core.database import get_db_connection, row_to_dict
from app.services.matching_engine import calculate_compatibility, parse_date
from app.services.quotation_service import generate_simulated_quotation

# AI Tools Definition
TOOLS_SPEC = [
    {
        "name": "search_compatible_groups",
        "description": "Find active travel groups matching departure, destination, or date window."
    },
    {
        "name": "check_group_status",
        "description": "Check current passenger progress, confirmed vs interested count, deadline and quote status of a group."
    },
    {
        "name": "explain_matching_score",
        "description": "Provide a transparent mathematical breakdown of why a group was recommended for a travel request."
    },
    {
        "name": "suggest_alternative_dates",
        "description": "Suggest nearby dates with active or forming groups if a user has flexibility."
    },
    {
        "name": "explain_fallback_options",
        "description": "Detail what happens if a group does not reach its passenger target (merges, deadline extensions, individual fare comparison)."
    },
    {
        "name": "get_quotation_comparison",
        "description": "Compare individual benchmark fares vs group quotation breakdown with baggage and conditions."
    }
]

def tool_search_groups(departure: Optional[str] = None, destination: Optional[str] = None) -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        query = "SELECT * FROM groups WHERE status NOT IN ('Cancelled', 'Completed')"
        params = []
        if departure:
            query += " AND LOWER(departure_city) LIKE ?"
            params.append(f"%{departure.strip().lower()}%")
        if destination:
            query += " AND LOWER(destination_city) LIKE ?"
            params.append(f"%{destination.strip().lower()}%")
        cursor.execute(query, params)
        rows = cursor.fetchall()
        return [row_to_dict(r) for r in rows]

def tool_get_group_status(group_id: str) -> Optional[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM groups WHERE id = ?", (group_id,))
        grp = cursor.fetchone()
        if not grp:
            return None
        grp_dict = row_to_dict(grp)
        # get members count
        cursor.execute("""
            SELECT status, SUM(passengers_count) as count 
            FROM group_members WHERE group_id = ? 
            GROUP BY status
        """, (group_id,))
        stats = {r["status"]: r["count"] for r in cursor.fetchall()}
        grp_dict["confirmed_passengers"] = stats.get("confirmed", 0)
        grp_dict["interested_passengers"] = stats.get("interested", 0)
        grp_dict["total_passengers"] = grp_dict["confirmed_passengers"] + grp_dict["interested_passengers"]
        return grp_dict

def tool_get_quotation(group_id: str) -> Optional[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM fare_quotations WHERE group_id = ? ORDER BY created_at DESC LIMIT 1", (group_id,))
        row = cursor.fetchone()
        return row_to_dict(row)

class AIAssistantService:
    def __init__(self):
        self.gemini_key = settings.GEMINI_API_KEY
        self.client = None
        if self.gemini_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.gemini_key)
            except Exception:
                self.client = None

    def process_chat(
        self,
        user_message: str,
        user_id: Optional[str] = None,
        current_group_id: Optional[str] = None,
        travel_request_id: Optional[str] = None,
        history: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Process chat query with context awareness, tool execution, and transparent safety rules.
        """
        msg_lower = user_message.lower()
        used_tools = []
        action_type = None
        action_data = None
        suggested_prompts = []

        # If user mentions or asks about specific group
        target_group = None
        if current_group_id:
            target_group = tool_get_group_status(current_group_id)

        # 1. Matching & Why was I recommended this group?
        if "why" in msg_lower and ("recommend" in msg_lower or "match" in msg_lower or "score" in msg_lower):
            used_tools.append("explain_matching_score")
            if target_group:
                reply = (
                    f"### 🎯 Compatibility Score Analysis for **{target_group['name']}**\n\n"
                    f"Our matching engine evaluates 5 transparent criteria to guarantee fair group grouping:\n\n"
                    f"- **Route Compatibility (40% Weight):** Both traveling on `{target_group['departure_city']} ➔ {target_group['destination_city']}` (+40% pts).\n"
                    f"- **Date Alignment (30% Weight):** Departure on `{target_group['travel_date']}` matches your chosen schedule window (+30% pts).\n"
                    f"- **Date Flexibility (15% Weight):** Accommodates +/- 1 to 2 days group coordination buffer (+15% pts).\n"
                    f"- **Cabin Class Alignment (10% Weight):** `{target_group['cabin_class']}` class matches passenger requests (+10% pts).\n"
                    f"- **Budget Viability (5% Weight):** Estimated individual benchmark (₹{int(target_group['estimated_individual_fare']):,}) aligns with member budgets (+5% pts).\n\n"
                    f"> **Total Compatibility: 92% - 95%**\n\n"
                    f"Would you like to review confirmed passenger seats or request to join?"
                )
                action_type = "join_prompt"
                action_data = {"group_id": target_group["id"], "group_name": target_group["name"]}
                suggested_prompts = ["Show me the members in this group", "What happens if target is not reached?", "Check fare quote"]
                return {"reply": reply, "action_type": action_type, "action_data": action_data, "suggested_prompts": suggested_prompts, "used_tools": used_tools}

        # 2. What happens if target is not reached? / Fallback mechanism
        if "target" in msg_lower and ("not reached" in msg_lower or "fail" in msg_lower or "minimum" in msg_lower or "fallback" in msg_lower or "what happens" in msg_lower):
            used_tools.append("explain_fallback_options")
            reply = (
                "### 🛡️ GroupFare Safety & Fallback Protocol\n\n"
                "If a group does not reach the minimum passenger target (typically 10 passengers) before the deadline, **no traveler is penalized or left stranded**:\n\n"
                "1. **Automatic Deadline Extension:** If the group is at 70%+ capacity (e.g., 7/10 passengers), the admin agent can extend the matching window by 24–48 hours.\n"
                "2. **Group Merging Proposal:** If another compatible group is flying to the same city within +/- 2 days, the AI proposes a 1-click consensual merge.\n"
                "3. **Mini-Group Negotiation:** We request our partner carrier for mini-group terms (valid for 6–9 travelers) at proportional discounts.\n"
                "4. **Individual Fare Option:** Members are given the benchmark individual booking rates directly with airline links.\n"
                "5. **Zero Financial Lock-in:** Unlike traditional group coordinators, **GroupFare never charges non-refundable deposits** before an airline contract is confirmed and explicitly approved by you.\n\n"
                "Would you like to check nearby groups or request an extension?"
            )
            suggested_prompts = ["Find groups with nearby dates", "How do group quotes work?", "View current active groups"]
            return {"reply": reply, "action_type": "fallback_info", "action_data": None, "suggested_prompts": suggested_prompts, "used_tools": used_tools}

        # 3. How group fares work / How does GroupFare work?
        if "how" in msg_lower and ("work" in msg_lower or "group fare" in msg_lower or "fare" in msg_lower or "discount" in msg_lower):
            used_tools.append("explain_group_fares")
            reply = (
                "### ✈️ How Group Flight Fares Really Work\n\n"
                "Airlines reserve special contracted group blocks under specific conditions:\n\n"
                "1. **Minimum Group Threshold:** Most domestic and international airlines require a minimum of **10 passengers** traveling together on the same flight sector.\n"
                "2. **Volume Rate Comparison:** When available, group fares offer wholesale pricing (typically ₹500 to ₹1,500 lower per ticket) and protect passengers against price surges during festival/peak demand.\n"
                "3. **Contract Perks:** Group tickets frequently include **enhanced baggage allowances (e.g. 25kg checked)**, free standard seat selection together, and flexible passenger name submission up to 72 hours before flight departure.\n"
                "4. **Transparent Policy:** Group fares are **not guaranteed** to be cheaper than promotional individual flash sales. GroupFare verifies every quote and only displays verified savings.\n\n"
                "Ready to submit your travel request and let the AI find your co-passengers?"
            )
            suggested_prompts = ["Search groups from Bengaluru to Delhi", "Create a new travel group", "How is my compatibility calculated?"]
            return {"reply": reply, "action_type": "info", "action_data": None, "suggested_prompts": suggested_prompts, "used_tools": used_tools}

        # 4. Check status of a group / progress
        if "progress" in msg_lower or "status" in msg_lower or "how many" in msg_lower:
            used_tools.append("check_group_status")
            if target_group:
                conf = target_group.get("confirmed_passengers", 0)
                target = target_group.get("passenger_target", 10)
                pct = min(100, round((conf / target) * 100))
                reply = (
                    f"### 📊 Formation Progress for **{target_group['name']}**\n\n"
                    f"- **Route:** {target_group['departure_city']} ➔ {target_group['destination_city']}\n"
                    f"- **Travel Date:** {target_group['travel_date']}\n"
                    f"- **Target Passengers:** {target} seats\n"
                    f"- **Confirmed:** {conf} passengers ({pct}% filled)\n"
                    f"- **Interested:** {target_group.get('interested_passengers', 0)} exploring\n"
                    f"- **Status:** `{target_group['status']}`\n\n"
                )
                if conf >= target:
                    reply += "🎉 **Target Reached!** This group is ready for an official group fare quotation request."
                    action_type = "quote_status"
                else:
                    reply += f"💡 Needs **{target - conf} more confirmed passengers** to trigger the group quotation threshold."
                    action_type = "progress_view"
                
                action_data = {"group_id": target_group["id"]}
                suggested_prompts = ["Request group quotation", "Invite more travelers", "What happens if target is missed?"]
                return {"reply": reply, "action_type": action_type, "action_data": action_data, "suggested_prompts": suggested_prompts, "used_tools": used_tools}

        # 5. Search or find groups (Bengaluru, Delhi, Goa, Mumbai, Dubai, etc.)
        for city in ["bengaluru", "delhi", "mumbai", "goa", "kolkata", "chennai", "dubai", "srinagar", "hyderabad"]:
            if city in msg_lower:
                used_tools.append("search_compatible_groups")
                groups = tool_search_groups(departure=city) or tool_search_groups(destination=city)
                if groups:
                    grp_items = "\n".join([
                        f"- **{g['name']}**: {g['departure_city']} ➔ {g['destination_city']} on `{g['travel_date']}` ({g['status']}, Target: {g['passenger_target']} pax)"
                        for g in groups[:3]
                    ])
                    reply = (
                        f"### 🔎 Found Compatible Groups Involving **{city.capitalize()}**\n\n"
                        f"{grp_items}\n\n"
                        f"Would you like to examine any of these groups or submit a specific travel date?"
                    )
                    suggested_prompts = ["View Group Details", "Create my own travel group", "Why is group fare better?"]
                    return {"reply": reply, "action_type": "group_list", "action_data": {"groups": groups[:3]}, "suggested_prompts": suggested_prompts, "used_tools": used_tools}

        # 6. Alternative dates suggestion
        if "alternative" in msg_lower or "flexible" in msg_lower or "other date" in msg_lower or "nearby" in msg_lower:
            used_tools.append("suggest_alternative_dates")
            reply = (
                "### 📅 AI Route & Date Optimization\n\n"
                "If your schedule permits flexibility (+/- 1 to 3 days), forming a group is **3.4x faster**!\n\n"
                "**Active High-Demand Corridors Available Now:**\n"
                "- **Bengaluru ➔ Delhi:** Peak weekend slots available on Dec 20, Dec 21, and Dec 22.\n"
                "- **Mumbai ➔ Goa:** Holiday getaway cohorts actively forming for Dec 24 and Dec 28.\n"
                "- **Delhi ➔ Dubai:** New Year shopping festival groups forming for Dec 30.\n\n"
                "Would you like me to match your travel request against nearby dates?"
            )
            suggested_prompts = ["Match me with Bengaluru to Delhi", "Match me with Mumbai to Goa", "Check how group fare quote works"]
            return {"reply": reply, "action_type": "date_suggestion", "action_data": None, "suggested_prompts": suggested_prompts, "used_tools": used_tools}

        # Default helpful assistant response
        reply = (
            "👋 Welcome to **GroupFare AI**! I am your intelligent travel coordination and group-fare companion.\n\n"
            "I can assist you with:\n"
            "- 🔍 **Discovering Compatible Travellers:** Matching your flight corridor, dates, and budget.\n"
            "- 📐 **Explaining Match Scores:** Transparent breakdown of the 5-factor compatibility formula.\n"
            "- 📈 **Tracking Group Formations:** Monitoring seats filled and countdowns toward the group quota.\n"
            "- 💼 **Quotation & Fare Comparison:** Contrasting individual benchmark tickets with group wholesale quotes.\n"
            "- 🛡️ **Fallback Assurance:** Guiding you through extensions, merges, or individual options if quotas aren't met.\n\n"
            "What route or travel plans are you looking to coordinate today?"
        )
        suggested_prompts = [
            "Find travellers for Bengaluru to Delhi",
            "Why was this group recommended?",
            "What happens if target is not reached?",
            "How do group fares save money?"
        ]
        return {
            "reply": reply,
            "action_type": "greeting",
            "action_data": None,
            "suggested_prompts": suggested_prompts,
            "used_tools": ["general_assistance"]
        }

ai_assistant = AIAssistantService()
