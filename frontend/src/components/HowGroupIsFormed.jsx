import React, { useState } from 'react';
import { Users, Sparkles, Send, Tag, CheckCircle2, ShieldCheck, ArrowRight, Plane, Clock, Award } from 'lucide-react';

export default function HowGroupIsFormed() {
  const [activeStep, setActiveStep] = useState(2); // default step 2

  const steps = [
    {
      num: "01",
      title: "Individual Intent & Route Matching",
      tag: "Autonomous Matching",
      desc: "Independent passengers submit travel dates, corridors (e.g. Bengaluru to Delhi), and seat counts. Our AI engine groups matching schedules without forcing an immediate financial lock-in.",
      icon: Users,
      metric: "1 to 4 Solo Travelers",
      statusBadge: "Open",
      statusColor: "bg-blue-500/20 text-blue-300 border-blue-500/30"
    },
    {
      num: "02",
      title: "Reaching the Airline Quota Threshold",
      tag: "Quota Milestone",
      desc: "Airlines like Air India require min 10 passengers; IndiGo requires more than 9 passengers. GroupFare monitors live confirmed seats until the magic number (10 seats) is unlocked.",
      icon: Clock,
      metric: "10 Confirmed Seats",
      statusBadge: "Target Reached",
      statusColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
    },
    {
      num: "03",
      title: "Airline Group Desk Quotation Request",
      tag: "Official Quote",
      desc: "The moment the group reaches 10 passengers, GroupFare AI queries the carrier's Group Sales Desk (Air India / IndiGo / Emirates) with the exact flight number (e.g., 6E-2041).",
      icon: Send,
      metric: "Direct Airline Desk",
      statusBadge: "Quote Requested",
      statusColor: "bg-purple-500/20 text-purple-300 border-purple-500/30"
    },
    {
      num: "04",
      title: "Wholesale Contract & Perks Unlocked",
      tag: "Contract Tariff",
      desc: "The airline issues a dedicated group net quotation: base fare is reduced (~8-12%), checked baggage increases to 25kg (vs 15kg individual standard), and adjacent seats are pre-blocked.",
      icon: Tag,
      metric: "Save ~₹700-₹1,200/pax",
      statusBadge: "Quote Received",
      statusColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
    },
    {
      num: "05",
      title: "Consensual Approval & Manifest Lock",
      tag: "Zero Upfront Risk",
      desc: "Every member reviews the quotation and must give explicit approval. Once confirmed, passenger names are entered into 1 Master Group PNR. You only pay once terms are approved.",
      icon: ShieldCheck,
      metric: "Master Group PNR",
      statusBadge: "Completed",
      statusColor: "bg-teal-500/20 text-teal-300 border-teal-500/30"
    }
  ];

  return (
    <div className="rounded-3xl glass-panel-glow border border-blue-500/30 p-6 sm:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Transparent Group Formation Lifecycle</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
            How a Travel Group is Formed on GroupFare
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            See the exact journey from lone traveler intent to official airline wholesale group issuance.
          </p>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Interactive Walkthrough • Step {activeStep + 1} of 5
        </div>
      </div>

      {/* Progress Stepper Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {steps.map((s, idx) => {
          const isActive = activeStep === idx;
          const isPassed = activeStep > idx;
          return (
            <button
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`p-3 rounded-2xl border text-left transition-all ${
                isActive
                  ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                  : isPassed
                  ? 'bg-slate-900/80 border-slate-700/60 text-slate-300'
                  : 'bg-slate-950/40 border-slate-900 text-slate-500 hover:text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs font-bold text-blue-400">{s.num}</span>
                {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <div className="text-xs font-semibold truncate leading-tight">{s.tag}</div>
            </button>
          );
        })}
      </div>

      {/* Active Step Showcase Card */}
      {(() => {
        const current = steps[activeStep];
        const Icon = current.icon;
        return (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-400">STAGE {current.num}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${current.statusColor}`}>
                      Status: {current.statusBadge}
                    </span>
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold text-white mt-0.5">{current.title}</h4>
                </div>
              </div>

              <div className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-cyan-300">
                {current.metric}
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
              {current.desc}
            </p>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => setActiveStep(prev => (prev > 0 ? prev - 1 : 4))}
                className="text-xs text-slate-400 hover:text-white font-medium"
              >
                ← Previous Stage
              </button>

              <button
                onClick={() => setActiveStep(prev => (prev < 4 ? prev + 1 : 0))}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/20"
              >
                <span>{activeStep === 4 ? 'Restart Walkthrough' : 'Next Stage'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
