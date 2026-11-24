import React from 'react';
import { Plane, Luggage, Clock, Users, ArrowRight, ShieldCheck, Tag, PlusCircle } from 'lucide-react';

export default function FlightCard({ flight, onStartGroup, onFindGroups }) {
  const getAirlineColor = (code) => {
    switch (code) {
      case '6E':
        return { bg: 'bg-sky-500/15 text-sky-300 border-sky-500/40', dot: 'bg-sky-400' };
      case 'AI':
        return { bg: 'bg-rose-500/15 text-rose-300 border-rose-500/40', dot: 'bg-rose-400' };
      case 'IX':
        return { bg: 'bg-amber-500/15 text-amber-300 border-amber-500/40', dot: 'bg-amber-400' };
      case 'EK':
        return { bg: 'bg-red-500/15 text-red-300 border-red-500/40', dot: 'bg-red-400' };
      case 'SG':
        return { bg: 'bg-orange-500/15 text-orange-300 border-orange-500/40', dot: 'bg-orange-400' };
      default:
        return { bg: 'bg-blue-500/15 text-blue-300 border-blue-500/40', dot: 'bg-blue-400' };
    }
  };

  const style = getAirlineColor(flight.airline_code);

  return (
    <div className="rounded-3xl glass-panel hover:glass-panel-glow border border-slate-800 hover:border-blue-500/50 p-5 sm:p-6 transition-all duration-300 space-y-5">
      {/* Top Header: Airline, Flight No, Aircraft & Group Desk Policy */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center font-bold text-sm text-white font-mono shadow-sm">
            {flight.airline_code}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">{flight.airline_name}</h4>
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                {flight.flight_number}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span>{flight.aircraft_type}</span>
              <span>•</span>
              <span className="text-emerald-400">{flight.stops}</span>
            </div>
          </div>
        </div>

        {/* Group Policy Pill */}
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${style.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
            <span>
              {flight.airline_code === '6E' ? 'IndiGo Group Portal (>9 Pax)' : `${flight.airline_name} (Min ${flight.min_group_size} Pax)`}
            </span>
          </span>
        </div>
      </div>

      {/* Flight Timing & Corridor Visualizer */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        {/* Departure */}
        <div className="sm:col-span-4 text-left">
          <div className="text-2xl font-black text-white font-mono">{flight.departure_time}</div>
          <div className="text-sm font-bold text-slate-200 mt-0.5">
            {flight.departure_city} ({flight.departure_airport_code})
          </div>
          <div className="text-[11px] text-slate-400 font-medium">Terminal {flight.departure_terminal}</div>
        </div>

        {/* Duration & Route Line */}
        <div className="sm:col-span-4 flex flex-col items-center justify-center py-2 sm:py-0">
          <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mb-1">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>{flight.duration}</span>
          </div>
          <div className="w-full flex items-center gap-1 px-4">
            <div className="h-0.5 w-full bg-slate-700 rounded-full"></div>
            <Plane className="w-4 h-4 text-blue-400 transform rotate-90 shrink-0" />
            <div className="h-0.5 w-full bg-slate-700 rounded-full"></div>
          </div>
          <div className="text-[10px] text-emerald-400 font-semibold mt-1">Direct Flight</div>
        </div>

        {/* Arrival */}
        <div className="sm:col-span-4 sm:text-right">
          <div className="text-2xl font-black text-white font-mono">{flight.arrival_time}</div>
          <div className="text-sm font-bold text-slate-200 mt-0.5">
            {flight.destination_city} ({flight.destination_airport_code})
          </div>
          <div className="text-[11px] text-slate-400 font-medium">Terminal {flight.destination_terminal}</div>
        </div>
      </div>

      {/* Price & Quota Perks Breakdown */}
      <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Standard Spot Rate</div>
            <div className="text-sm font-bold text-slate-300">
              ₹{parseInt(flight.base_individual_fare).toLocaleString('en-IN')}
              <span className="text-[10px] text-slate-400 font-normal"> /pax</span>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-800"></div>

          <div>
            <div className="text-[10px] text-emerald-400 uppercase font-bold">Group Bulk Tariff</div>
            <div className="text-base font-extrabold text-emerald-400">
              ₹{parseInt(flight.group_quota_pax_fare).toLocaleString('en-IN')}
              <span className="text-[10px] text-emerald-300 font-normal"> /pax</span>
            </div>
          </div>

          {flight.potential_savings_per_pax > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[11px] font-bold">
              Save ₹{parseInt(flight.potential_savings_per_pax).toLocaleString('en-IN')}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-cyan-300">
          <Luggage className="w-3.5 h-3.5" />
          <span>{flight.group_baggage}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <button
          onClick={() => onFindGroups && onFindGroups(flight)}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <Users className="w-3.5 h-3.5 text-blue-400" />
          <span>Search Cohorts on this Flight</span>
        </button>

        <button
          onClick={() => onStartGroup && onStartGroup(flight)}
          className="w-full sm:w-auto px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 transition-all"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Start Travel Group for this Flight</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
