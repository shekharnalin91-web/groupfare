import React from 'react';
import { Plane, Tag, Check, ArrowRight, ShieldAlert, Sparkles, Luggage, Armchair, FileText } from 'lucide-react';

export default function FareComparisonCard({ quote, groupName = 'Travel Group', passengerCount = 10, onAccept = null }) {
  if (!quote) return null;

  const indivPax = quote.individual_fare_per_pax;
  const groupPax = quote.group_quote_per_pax;
  const taxes = quote.taxes_and_fees_per_pax || 1200;
  
  const indivTotalPax = indivPax + taxes;
  const groupTotalPax = groupPax + taxes;

  const savingsPax = quote.savings_per_pax ?? (indivPax - groupPax);
  const totalGroupSavings = quote.total_group_savings ?? (savingsPax * passengerCount);
  const hasSavings = quote.has_savings ?? (savingsPax > 0);

  return (
    <div className="rounded-3xl glass-panel-glow border border-blue-500/30 p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              Verified Quotation Analysis
            </span>
            <span className="text-xs text-slate-400 font-mono">Carrier: {quote.airline_name}</span>
          </div>
          <h3 className="text-xl font-bold text-white">
            Fare Comparison for {groupName}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Calculated for a cohort of <strong className="text-white">{passengerCount} passengers</strong>
          </p>
        </div>

        {hasSavings && (
          <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/40 text-right">
            <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
              Total Verified Group Advantage
            </div>
            <div className="text-2xl font-extrabold text-white">
              ₹{totalGroupSavings.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-emerald-300">
              (₹{savingsPax.toLocaleString('en-IN')} per passenger)
            </div>
          </div>
        )}
      </div>

      {/* Side by side comparison table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Column 1: Lone Individual Booking */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Standard Individual</span>
              <div className="text-lg font-bold text-slate-200">Standalone Market Rate</div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs font-mono">Individual</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Base Airfare per passenger:</span>
              <span className="font-semibold text-white">₹{indivPax.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Aviation Taxes & Fees:</span>
              <span>₹{taxes.toLocaleString('en-IN')}</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold text-slate-200">
              <span>Total Price per Passenger:</span>
              <span>₹{indivTotalPax.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>For {passengerCount} Independent Passengers:</span>
              <span className="font-semibold text-slate-300">₹{(indivTotalPax * passengerCount).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Luggage className="w-4 h-4 text-slate-500 shrink-0" />
              <span>Standard baggage: 15kg checked baggage limit</span>
            </div>
            <div className="flex items-center gap-2">
              <Armchair className="w-4 h-4 text-slate-500 shrink-0" />
              <span>Seat selection: Charged extra (₹300 - ₹800 per seat)</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500 shrink-0" />
              <span>Strict non-refundable passenger name assignments</span>
            </div>
          </div>
        </div>

        {/* Column 2: GroupFare Wholesale Quotation */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-blue-950/40 to-slate-900 border border-blue-500/40 relative space-y-4 shadow-lg shadow-blue-500/10">
          <div className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-blue-600 text-white text-[11px] font-bold tracking-wide uppercase shadow-sm">
            GroupFare Quota
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-blue-500/30">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-300">Airline Volume Block</span>
              <div className="text-lg font-bold text-white">Group Contract Tariff</div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 text-xs font-mono font-semibold">10+ Quota</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Negotiated Group Base per passenger:</span>
              <span className="font-bold text-emerald-400">₹{groupPax.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Aviation Taxes & Fees:</span>
              <span>₹{taxes.toLocaleString('en-IN')}</span>
            </div>
            <div className="pt-2 border-t border-blue-500/30 flex justify-between text-sm font-bold text-white">
              <span>Total Price per Passenger:</span>
              <span className="text-emerald-300">₹{groupTotalPax.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-xs text-blue-200">
              <span>For {passengerCount} Group Passengers:</span>
              <span className="font-bold text-emerald-400">₹{(groupTotalPax * passengerCount).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Group Perks */}
          <div className="pt-3 border-t border-blue-500/30 space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Luggage className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="font-medium text-white">{quote.baggage_conditions || '25kg Checked baggage (+10kg group perk)'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Armchair className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Complimentary adjacent seats together for whole party</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-slate-300">{quote.fare_conditions || 'Free name updates up to 72 hours before flight'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Official Mandatory Disclaimer */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-xs text-amber-300/90 leading-relaxed">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-amber-300 block font-semibold mb-0.5">
            {quote.disclaimer || 'Demo Estimate – Not a Live Airline Offer'}
          </strong>
          Actual airline group rates depend on dynamic revenue management, route inventory, seasonal demand, and formal airline contracts. GroupFare does not claim guaranteed discounts; savings are published strictly when backed by verifiable comparative fare quotes.
        </div>
      </div>

      {onAccept && (
        <div className="pt-4 flex justify-end">
          <button
            onClick={onAccept}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Approve Quotation & Request Manifest Allocation</span>
          </button>
        </div>
      )}
    </div>
  );
}
