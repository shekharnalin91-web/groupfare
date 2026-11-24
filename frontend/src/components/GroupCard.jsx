import React from 'react';
import { Plane, Calendar, Users, ArrowRight, Share2, Tag, ShieldCheck, Clock } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function GroupCard({ group, matchScore = null, onSelect, onJoin }) {
  const confirmed = group.current_confirmed_passengers ?? group.members?.filter(m => m.status === 'confirmed').length ?? 0;
  const target = group.passenger_target || 10;
  const progressPct = Math.min(100, Math.round((confirmed / target) * 100));

  const copyInviteLink = (e) => {
    e.stopPropagation();
    const link = `${window.location.origin}/join/${group.invite_code}`;
    navigator.clipboard.writeText(link);
    alert(`Invite link copied to clipboard!\n${link}`);
  };

  return (
    <div 
      onClick={() => onSelect && onSelect(group.id)}
      className="group relative rounded-3xl glass-panel hover:glass-panel-glow border border-slate-800 hover:border-blue-500/50 p-5 transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      {/* Top row: Match Score & Status */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={group.status} />
          {matchScore && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-600/20 to-cyan-500/20 border border-blue-400/40 text-cyan-300 text-xs font-bold shadow-sm">
              ✨ {matchScore.score_percentage}% Match
            </span>
          )}
          {group.flight_number && (
            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-lg bg-slate-800 text-blue-300 border border-slate-700">
              {group.flight_number}
            </span>
          )}
        </div>

        <button
          onClick={copyInviteLink}
          className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all text-xs flex items-center gap-1"
          title="Share Invite Link"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Group Title & Route */}
      <div className="mb-3">
        <h4 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-1 mb-2">
          {group.name}
        </h4>

        {/* Route visualization */}
        <div className="flex items-center justify-between gap-2 text-sm font-semibold text-slate-200">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold">
              {group.departure_airport_code || group.departure_city.slice(0, 3).toUpperCase()}
            </span>
            <span className="text-xs text-slate-400 truncate max-w-[80px]">{group.departure_city}</span>
          </div>

          <div className="flex items-center gap-1 text-slate-500">
            <span className="h-px w-6 bg-slate-700"></span>
            <Plane className="w-3.5 h-3.5 text-blue-400 transform rotate-45 shrink-0" />
            <span className="h-px w-6 bg-slate-700"></span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 truncate max-w-[80px]">{group.destination_city}</span>
            <span className="px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold">
              {group.destination_airport_code || group.destination_city.slice(0, 3).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Flight Timing & Airline */}
      {group.departure_time && group.arrival_time && (
        <div className="mb-3 p-2.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-300 font-mono font-semibold">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{group.departure_time} ➔ {group.arrival_time}</span>
          </div>
          <div className="text-[11px] text-cyan-300 font-medium">
            {group.airline_name || 'Group Airline'}
          </div>
        </div>
      )}

      {/* Date & Cabin */}
      <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mb-3 bg-slate-900/40 p-2 rounded-2xl border border-slate-800/60">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="truncate">{group.travel_date}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="truncate">{group.cabin_class}</span>
        </div>
      </div>

      {/* Passenger Formation Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-400 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <strong className="text-white font-semibold">{confirmed}</strong> of {target} seats locked
          </span>
          <span className="font-semibold text-blue-400">{progressPct}%</span>
        </div>

        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              progressPct >= 100 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                : progressPct >= 60 
                ? 'bg-gradient-to-r from-blue-500 to-cyan-400' 
                : 'bg-blue-600'
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
          <span>{target - confirmed > 0 ? `Needs ${target - confirmed} more to lock quota` : 'Quota unlocked!'}</span>
          {group.current_interested_passengers > 0 && (
            <span>+{group.current_interested_passengers} exploring</span>
          )}
        </div>
      </div>

      {/* Bottom Row: Estimated Fare & Action */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Benchmark Fare</div>
          <div className="text-sm font-bold text-white">
            ₹{parseInt(group.estimated_individual_fare || 8500).toLocaleString('en-IN')}
            <span className="text-[10px] text-slate-400 font-normal"> /pax</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect && onSelect(group.id);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1 transition-all shadow-sm shadow-blue-500/20"
          >
            <span>View Group</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
