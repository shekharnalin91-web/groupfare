# GroupFare – AI-Powered Group Flight Booking Platform

> **Developed by Team CORRUPTX**  
> **Team ID:** `d362a123`  
> **Tagline:** *Travel Together. Unlock Better Group Fare Opportunities.*

---

## 1. Quick Start: How to Open the Application

Both backend and frontend services are currently **running and active**:

1. **Frontend Web Application:**  
   Open your browser and navigate to:  
   👉 **[http://localhost:5173](http://localhost:5173)**

2. **Backend API Documentation (Swagger / OpenAPI):**  
   👉 **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**

3. **Backend Health Check:**  
   👉 **[http://127.0.0.1:8000](http://127.0.0.1:8000)**

---

## 2. Platform Architecture & Features

### A. Landing Page
- **Hero Section:** "Travel Together. Unlock Better Group Fare Opportunities."
- **Interactive Illustration:** Live toggle demonstrating how individual bookings face surge rates and lack perks, whereas GroupFare cohorts unlock volume pricing and 25kg luggage allowances.
- **Flight Search Widget:** Search active corridors by Departure, Destination, Date, and Seats.
- **How It Works & FAQs:** Transparent explanation of group flight rules.

### B. Transparent 5-Factor AI Matching Engine
When a traveler posts a travel requirement, our matching engine calculates a transparent compatibility score:
- **Route Compatibility (40% Weight):** Exact match between departure and arrival city.
- **Travel Date Window (30% Weight):** Exact vs adjacent calendar days.
- **Date Flexibility Buffer (15% Weight):** Evaluates user's declared ±1 to 3 days flexibility threshold.
- **Cabin Class (10% Weight):** Economy, Premium Economy, or Business alignment.
- **Budget Feasibility (5% Weight):** Ensures user budget comfortably covers group estimated tariffs.

*Ethical Requirement Enforced:* Users are **never automatically placed** into groups. Explicit consent is required to join.

### C. Group Dashboard & Lifecycle
- **Real-Time Progress Bar:** Distinctly displays **Confirmed Passengers** vs **Interested Passengers** against the required target (e.g., 10 seats).
- **Group Status Lifecycles:** `Open`, `Filling Fast`, `Target Reached`, `Quote Requested`, `Quote Received`, `Completed`, `Cancelled`.
- **Passenger Roster:** Verified member avatars with verification badges.
- **Shareable Invite Link:** 1-click clipboard link generator (`/join/:inviteCode`).

### D. Group Fare Quotation & Fare Comparison
- **Volume Advantage:** Compares individual benchmark ticket price against negotiated group tariff.
- **Side-by-Side Breakdown:** Base airfare, aviation taxes, baggage allowance (25kg vs 15kg), seat assignment, and name correction policy.
- **Commercial Disclaimer:** Clear label: *"Demo Estimate – Not a Live Airline Offer"*. Savings are calculated only when supported by verifiable comparative data.

### E. AI Travel Assistant ("GroupFare AI")
- Available both as a floating drawer on every page and a full-screen dedicated assistant.
- Uses controlled backend tools (`search_compatible_groups`, `check_group_status`, `explain_matching_score`, `suggest_alternative_dates`, `explain_fallback_options`).
- Provides actionable cards to inspect recommended cohorts directly.

### F. Fallback Protocol
If a group is nearing its deadline and hasn't reached its quota:
1. **Extend Deadline:** 1-click +3 day window extension for cohorts at 70%+ capacity.
2. **Consensual Group Merging:** Proposes merging with compatible groups on nearby dates.
3. **Standalone Fallback Rates:** Shows benchmark individual flight alternatives.
4. **Zero Financial Lock-in:** Zero non-refundable deposits are accepted before final ticket booking.

### G. Admin Dashboard
- **Analytics:** Total users, active travel requests, groups reaching quota, and verified potential savings.
- **Groups Monitor:** Live status switcher and member inspection.
- **Quotation Desk:** Allows admins to enter or verify airline quotations.

---

## 3. Pre-Seeded Demo User Profiles

For fast evaluation, use the **Quick Demo User Switcher** in the top-right corner of the navigation bar:

| Name | Role | Email | Status |
| :--- | :--- | :--- | :--- |
| **Rahul Sharma** | Passenger / Coordinator | `rahul@groupfare.com` | Verified Passenger |
| **Priya Verma** | Passenger / Coordinator | `priya@groupfare.com` | KYC Verified |
| **Ananya Patel** | Passenger | `ananya@groupfare.com` | Verified Passenger |
| **Amit Kumar** | Passenger | `amit@groupfare.com` | Verified Passenger |
| **CORRUPTX Admin** | Administrator | `admin@groupfare.com` | Platform Administrator |

*Note: All demo passwords are `password123` (or `admin123` for admin).*

---

## 4. Environment Variables Template (`.env`)

```env
APP_NAME=GroupFare
TEAM_NAME=CORRUPTX
TEAM_ID=d362a123
PORT=8000
HOST=127.0.0.1

# Database (SQLite default out-of-the-box, Supabase compatible)
DATABASE_FILE=groupfare.db
SUPABASE_URL=
SUPABASE_KEY=

# Google Gemini API Key (Optional: AI agent functions autonomously with offline tools if key is not present)
GEMINI_API_KEY=
```

---

## 5. Development Commands

### Backend (FastAPI + Uvicorn)
```bash
cd backend
python run.py
```

### Frontend (React + Vite + Tailwind CSS)
```bash
cd frontend
npm run dev
```
