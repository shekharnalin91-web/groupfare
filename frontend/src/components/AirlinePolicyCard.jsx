import React, { useState } from 'react';
import { ShieldCheck, Info, Plane, CheckCircle2, ChevronDown, Luggage, Users } from 'lucide-react';

export default function AirlinePolicyCard() {
  const [selectedAirline, setSelectedAirline] = useState('IndiGo');

  const policies = [
    {
      name: "Air India",
      code: "AI",
      rule: "Air India Group Desk: Minimum 10 Passengers",
      minPax: 10,
      discount: "8% to 12% off spot market rate",
      baggage: "25kg Checked baggage (vs 15kg individual) + 7kg Cabin",
      manifest: "Name updates allowed free up to 72 hrs prior",
      seating: "Adjacent group seats pre-blocked together",
      badgeColor: "bg-rose-500/10 border-rose-500/30 text-rose-300",
      accent: "#e11d48",
      highlights: [
        "Dedicated group check-in desks at DEL T3, BOM T2, BLR T2",
        "Higher checked luggage allowance (25 kg)",
        "Zero reissue fee for date shifts if requested 7 days prior"
      ]
    },
    {
      name: "IndiGo",
      code: "6E",
      rule: "IndiGo Group Portal: More than 9 Passengers (Min 10)",
      minPax: 10,
      discount: "8% to 11% group net tariff",
      baggage: "20kg - 25kg Checked baggage + 7kg Cabin",
      manifest: "Minor passenger name corrections free up to 7 days prior",
      seating: "Whole contingent seated in the same zone without seat selection fee",
      badgeColor: "bg-sky-500/10 border-sky-500/30 text-sky-300",
      accent: "#0284c7",
      highlights: [
        "Special group block tariff across 1500+ daily flights",
        "Pre-allocated standard seats together",
        "Protects group against sudden holiday surge pricing"
      ]
    },
    {
      name: "Air India Express",
      code: "IX",
      rule: "Air India Express Group Portal: Minimum 10 Passengers",
      minPax: 10,
      discount: "7% to 10% wholesale holiday rate",
      baggage: "20kg Checked baggage + 7kg Cabin",
      manifest: "Flexible manifest submission up to 3 days prior",
      seating: "Pre-reserved group row block",
      badgeColor: "bg-amber-500/10 border-amber-500/30 text-amber-300",
      accent: "#d97706",
      highlights: [
        "Unlocks special leisure rates for Goa, Kochi, and Gulf sectors",
        "Complimentary hot meal pre-selection included for groups",
        "Zero penalty for initial passenger swaps"
      ]
    },
    {
      name: "Emirates",
      code: "EK",
      rule: "Emirates Group Dept: Minimum 10 Passengers in Economy",
      minPax: 10,
      discount: "Contracted corporate / leisure group tariff (Save ₹1,500 - ₹2,500/pax)",
      baggage: "30kg generous checked baggage allowance",
      manifest: "Name list finalized 30 days prior with free swaps up to 7 days",
      seating: "Zone-based group block seating",
      badgeColor: "bg-red-500/10 border-red-500/30 text-red-300",
      accent: "#dc2626",
      highlights: [
        "Generous 30kg baggage allowance per passenger",
        "Initial low deposit buffer with balance 30 days prior",
        "Pre-arranged group check-in and priority zone boarding"
      ]
    },
    {
      name: "SpiceJet",
      code: "SG",
      rule: "SpiceJet Group Desk: Minimum 10 Passengers",
      minPax: 10,
      discount: "6% to 9% group volume concession",
      baggage: "20kg Checked baggage + 7kg Cabin",
      manifest: "Passenger manifest submission up to 72 hours prior",
      seating: "Complimentary standard seats",
      badgeColor: "bg-orange-500/10 border-orange-500/30 text-orange-300",
      accent: "#ea580c",
      highlights: [
        "Concessionary rates for pilgrimage & festive groups",
        "Single master PNR for simple group tracking"
      ]
    }
  ];

  const current = policies.find(p => p.name === selectedAirline) || policies[0];

  return (
    <div className="rounded-3xl glass-panel-glow border border-blue-500/30 p-6 sm:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Authorized Group Desk Carrier Network</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white">
            Which Airlines Offer Bulk Group Booking Reductions?
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            GroupFare integrates <strong>only verified carriers</strong> that operate official Airline Group Desks with contractual discounts, extra baggage, and flexible name manifests.
          </p>
        </div>

        {/* Airline Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
          {policies.map(p => (
            <button
              key={p.name}
              onClick={() => setSelectedAirline(p.name)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedAirline === p.name
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Policy Card */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-5 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-base text-white font-mono">
              {current.code}
            </div>
            <div>
              <div className="text-base font-bold text-white flex items-center gap-2">
                <span>{current.name}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${current.badgeColor}`}>
                  {current.rule}
                </span>
              </div>
              <div className="text-xs text-emerald-400 font-medium mt-0.5">
                Typical Bulk Advantage: {current.discount}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
              Min Passengers: <strong className="text-white">{current.minPax} Pax</strong>
            </span>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
              <Luggage className="w-3.5 h-3.5 text-blue-400" /> Luggage Allowance
            </div>
            <div className="text-white font-semibold">{current.baggage}</div>
            <div className="text-[10px] text-cyan-300">Free baggage upgrade on group contract</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-400" /> Passenger Seating
            </div>
            <div className="text-white font-semibold">{current.seating}</div>
            <div className="text-[10px] text-emerald-300">No seat-selection surcharge</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Name Flexibility
            </div>
            <div className="text-white font-semibold">{current.manifest}</div>
            <div className="text-[10px] text-blue-300">Submit traveler names later</div>
          </div>
        </div>

        {/* Key Highlights */}
        <div className="pt-2 flex flex-wrap gap-2 text-xs">
          {current.highlights.map((h, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-slate-300 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              {h}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
