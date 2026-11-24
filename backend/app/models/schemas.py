from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class CabinClass(str, Enum):
    ECONOMY = "Economy"
    PREMIUM_ECONOMY = "Premium Economy"
    BUSINESS = "Business"

class GroupStatus(str, Enum):
    OPEN = "Open"
    FILLING_FAST = "Filling Fast"
    TARGET_REACHED = "Target Reached"
    QUOTE_REQUESTED = "Quote Requested"
    QUOTE_RECEIVED = "Quote Received"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"

class MemberStatus(str, Enum):
    INTERESTED = "interested"
    CONFIRMED = "confirmed"

# --- User Models ---
class UserBase(BaseModel):
    email: str
    full_name: str
    phone: Optional[str] = ""
    avatar: Optional[str] = ""
    verification_status: str = "Verified Passenger"
    role: str = "user"  # "user" or "admin"

class UserRegister(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(UserBase):
    id: str
    created_at: str

# --- Flight Models ---
class FlightResponse(BaseModel):
    id: str
    flight_number: str
    airline_name: str
    airline_code: str
    departure_city: str
    departure_airport_code: str
    departure_terminal: str
    destination_city: str
    destination_airport_code: str
    destination_terminal: str
    departure_time: str
    arrival_time: str
    duration: str
    stops: str = "Non-stop"
    aircraft_type: str = "Airbus A320neo"
    cabin_class: str = "Economy"
    base_individual_fare: float
    taxes_and_fees: float = 1250.0
    total_individual_fare: float
    min_group_size: int = 10
    group_discount_pct: float = 10.0
    group_quota_pax_fare: float
    total_group_pax_fare: float
    potential_savings_per_pax: float
    group_baggage: str
    group_policy: str

# --- Travel Request Models ---
class TravelRequestCreate(BaseModel):
    departure_city: str
    destination_city: str
    travel_date: str # YYYY-MM-DD
    flexible_dates: bool = False
    flexibility_days: int = 1
    passengers_count: int = 1
    cabin_class: CabinClass = CabinClass.ECONOMY
    max_budget_per_passenger: float = 10000.0
    preferred_airlines: List[str] = []
    preferences: Optional[str] = ""

class TravelRequestResponse(TravelRequestCreate):
    id: str
    user_id: str
    user_name: Optional[str] = ""
    status: str = "active" # active, matched, fulfilled, cancelled
    created_at: str

# --- Group Models ---
class GroupCreate(BaseModel):
    name: str
    departure_city: str
    destination_city: str
    travel_date: str
    passenger_target: int = 10
    cabin_class: CabinClass = CabinClass.ECONOMY
    description: Optional[str] = ""
    deadline_days: int = 7
    estimated_individual_fare: float = 8500.0
    flight_number: Optional[str] = ""
    airline_name: Optional[str] = ""
    departure_time: Optional[str] = "08:00"
    arrival_time: Optional[str] = "10:45"
    departure_airport_code: Optional[str] = ""
    destination_airport_code: Optional[str] = ""
    departure_terminal: Optional[str] = "T1"
    destination_terminal: Optional[str] = "T2"
    duration: Optional[str] = "2h 45m"
    aircraft_type: Optional[str] = "Airbus A320neo"

class GroupMemberResponse(BaseModel):
    id: str
    group_id: str
    user_id: str
    user_name: str
    user_avatar: Optional[str] = ""
    verification_status: str = "Verified"
    passengers_count: int = 1
    status: MemberStatus
    joined_at: str
    role: str = "member"  # "creator" or "member"

class GroupResponse(BaseModel):
    id: str
    name: str
    creator_id: str
    creator_name: Optional[str] = ""
    departure_city: str
    destination_city: str
    travel_date: str
    passenger_target: int
    current_confirmed_passengers: int
    current_interested_passengers: int
    total_passenger_interest: int
    cabin_class: CabinClass
    description: str
    invite_code: str
    status: GroupStatus
    deadline: str
    created_at: str
    estimated_individual_fare: float
    flight_number: Optional[str] = ""
    airline_name: Optional[str] = ""
    departure_time: Optional[str] = "08:00"
    arrival_time: Optional[str] = "10:45"
    departure_airport_code: Optional[str] = ""
    destination_airport_code: Optional[str] = ""
    departure_terminal: Optional[str] = "T1"
    destination_terminal: Optional[str] = "T2"
    duration: Optional[str] = "2h 45m"
    aircraft_type: Optional[str] = "Airbus A320neo"
    members: Optional[List[GroupMemberResponse]] = []
    quotation_id: Optional[str] = None
    has_active_quote: bool = False

# --- Smart Compatibility Score ---
class CompatibilityScore(BaseModel):
    group_id: str
    score_percentage: int
    route_score: float # weight 40%
    date_score: float # weight 30%
    flexibility_score: float # weight 15%
    cabin_score: float # weight 10%
    budget_score: float # weight 5%
    compatible_passengers: int
    reasons: List[str]
    group: Optional[GroupResponse] = None

# --- Quotation Models ---
class QuotationCreate(BaseModel):
    group_id: str
    airline_name: str
    individual_fare_per_pax: float
    group_quote_per_pax: float
    taxes_and_fees_per_pax: float = 1200.0
    baggage_conditions: str = "25kg Check-in + 7kg Cabin per passenger (Group Special)"
    fare_conditions: str = "Complimentary standard seat selection, free name correction up to 72 hrs prior"
    validity_hours: int = 48
    is_simulated: bool = True
    disclaimer: str = "Demo Estimate – Not a Live Airline Offer. Subject to carrier seat release & group contracts."

class QuotationResponse(QuotationCreate):
    id: str
    status: str = "issued" # issued, accepted, rejected, expired
    created_at: str
    expires_at: str
    total_individual_cost: float
    total_group_cost: float
    savings_per_pax: float
    total_group_savings: float
    has_savings: bool

# --- Notification Models ---
class NotificationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    type: str # group_found, invite_received, passenger_joined, target_reached, quote_requested, quote_received, deadline_approaching, group_cancelled
    link: Optional[str] = ""
    is_read: bool = False
    created_at: str

# --- AI Travel Assistant Models ---
class ChatMessage(BaseModel):
    role: str # user, assistant, system
    content: str
    timestamp: Optional[str] = None
    tool_calls: Optional[List[Dict[str, Any]]] = None

class AIChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = None
    current_group_id: Optional[str] = None
    travel_request_id: Optional[str] = None
    history: Optional[List[ChatMessage]] = []

class AIChatResponse(BaseModel):
    reply: str
    action_type: Optional[str] = None # recommend_group, join_prompt, quote_status, date_suggestion, merge_proposal
    action_data: Optional[Dict[str, Any]] = None
    suggested_prompts: List[str] = []
    used_tools: List[str] = []

# --- Admin Analytics ---
class AdminAnalytics(BaseModel):
    total_users: int
    total_travel_requests: int
    total_groups: int
    active_groups: int
    target_reached_groups: int
    quotes_issued: int
    verified_potential_savings: float
    average_group_size: float
