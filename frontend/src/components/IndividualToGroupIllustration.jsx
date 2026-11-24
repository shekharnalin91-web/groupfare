import React, { useState } from 'react';
import { Plane, Users, Sparkles, Check, ArrowRight } from 'lucide-react';

export default function IndividualToGroupIllustration() {
  const [activeTab, setActiveTab] = useState('group'); // 'lone' vs 'group'

  return (
    <div className="relative w-full max-w-xl mx-auto rounded-3xl p-6 glass-panel-glow border border-blue-500/30 overflow-hidden">
      {/* Background radial gradient */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400">
            <Plane className="w-5 h-5 transform -rotate-45" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wide">The GroupFare Transformation</h4>
            <p className="text-xs text-slate-400">How independent passengers unlock group quota perks</p>
          </div>
        </div>

        {/* Toggle view */}
        <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-700/50 text-xs">
          <button
            onClick={() => setActiveTab('lone')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'lone' ? 'bg-slate-800 text-slate-200 font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            Lone Booking
          </button>
          <button
            onClick={() => setActiveTab('group')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'group' ? 'bg-blue-600 text-white font-medium shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            GroupFare AI
          </button>
        </div>
      </div>

      {activeTab === 'lone' ? (
        <div className="space-y-4 py-2 animate-fade-in">
          <div className="grid grid-cols-3 gap-3">
            {[
              { name: 'Passenger A', fare: '₹8,500', bag: '15 kg bag', seat: '+₹400 seat' },
              { name: 'Passenger B', fare: '₹8,800', bag: '15 kg bag', seat: '+₹400 seat' },
              { name: 'Passenger C', fare: '₹8,950', bag: '15 kg bag', seat: '+₹400 seat' },
            ].map((p, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col items-center text-center">
                <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-2 text-xs font-semibold">
                  P{idx + 1}
                </div>
                <div className="text-xs font-medium text-slate-300">{p.name}</div>
                <div className="text-sm font-bold text-rose-400 mt-1">{p.fare}</div>
                <div className="text-[10px] text-slate-400 mt-1">{p.bag}</div>
                <div className="text-[10px] text-amber-400/80">{p.seat}</div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0"></span>
            Independent passengers face peak holiday surge fares, strict name change penalties, and no volume leverage.
          </div>
        </div>
      ) : (
        <div className="space-y-4 py-2 animate-fade-in">
          {/* Visual convergence */}
          <div className="relative p-4 rounded-2xl bg-gradient-to-br from-blue-950/60 to-slate-900/90 border border-blue-500/40">
            <div className="flex items-center justify-between">
              <div className="flex -space-x-2 overflow-hidden">
                <img className="inline-block h-8 w-8 rounded-full ring-2 ring-blue-500" src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&auto=format&fit=crop&q=80" alt="Rahul" />
                <img className="inline-block h-8 w-8 rounded-full ring-2 ring-blue-500" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&auto=format&fit=crop&q=80" alt="Ananya" />
                <img className="inline-block h-8 w-8 rounded-full ring-2 ring-blue-500" src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=60&auto=format&fit=crop&q=80" alt="Priya" />
                <img className="inline-block h-8 w-8 rounded-full ring-2 ring-blue-500" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&auto=format&fit=crop&q=80" alt="Amit" />
                <div className="h-8 w-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center ring-2 ring-blue-500">
                  +6
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-blue-300">Coordinated Cohort</div>
                <div className="text-sm font-bold text-white">10 Confirmed Passengers</div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-blue-500/20 grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-xl bg-slate-900/80 border border-blue-500/20">
                <div className="text-[10px] text-slate-400">Group Fare / Pax</div>
                <div className="text-sm font-bold text-emerald-400">₹7,800</div>
                <div className="text-[10px] text-emerald-300/80">Save ~₹700-₹1,000</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/80 border border-blue-500/20">
                <div className="text-[10px] text-slate-400">Luggage Quota</div>
                <div className="text-sm font-bold text-white">25 kg Included</div>
                <div className="text-[10px] text-cyan-300/80">+10kg upgrade</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/80 border border-blue-500/20">
                <div className="text-[10px] text-slate-400">Seat Allocation</div>
                <div className="text-sm font-bold text-white">Seated Together</div>
                <div className="text-[10px] text-blue-300/80">Free pre-reserve</div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>AI matches schedule, route & budget with transparent compatibility score.</span>
            </div>
            <span className="font-semibold text-emerald-400">Zero deposit required</span>
          </div>
        </div>
      )}
    </div>
  );
}
