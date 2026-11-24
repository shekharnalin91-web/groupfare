import React, { useState } from 'react';
import { Plane, Search, Sparkles, Calendar, DollarSign, Users, Tag, Check, ArrowRight, ShieldCheck, Info } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import StatusBadge from '../components/StatusBadge';

export default function TravelRequestPage({ setActivePage, setSelectedGroupId }) {
  const { currentUser } = useAuth();
  const { addToast } = useNotifications();

  const [departureCity, setDepartureCity] = useState('Bengaluru');
  const [destinationCity, setDestinationCity] = useState('Delhi');
  const [travelDate, setTravelDate] = useState('2026-12-20');
  const [flexibleDates, setFlexibleDates] = useState(true);
  const [flexibilityDays, setFlexibilityDays] = useState(2);
  const [passengersCount, setPassengersCount] = useState(1);
  const [cabinClass, setCabinClass] = useState('Economy');
  const [budget, setBudget] = useState(10000);
  const [preferredAirlines, setPreferredAirlines] = useState(['IndiGo', 'Air India']);
  const [preferences, setPreferences] = useState('Prefer morning departure window between 7 AM to 11 AM.');

  const [submitting, setSubmitting] = useState(false);
  const [matchResults, setMatchResults] = useState(null);
  const [selectedScore, setSelectedScore] = useState(null);

  const airlineOptions = ['IndiGo', 'Air India', 'Air India Express', 'Vistara', 'SpiceJet', 'Akasa Air', 'Emirates'];

  const toggleAirline = (al) => {
    if (preferredAirlines.includes(al)) {
      setPreferredAirlines(preferredAirlines.filter(a => a !== al));
    } else {
      setPreferredAirlines([...preferredAirlines, al]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser?.id) {
      addToast('Please login or select a demo user profile first.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.travelRequests.create(currentUser.id, {
        departure_city: departureCity,
        destination_city: destinationCity,
        travel_date: travelDate,
        flexible_dates: flexibleDates,
        flexibility_days: flexibilityDays,
        passengers_count: passengersCount,
        cabin_class: cabinClass,
        max_budget_per_passenger: Number(budget),
        preferred_airlines: preferredAirlines,
        preferences,
      });

      setMatchResults(response);
      addToast(response.message || 'Travel request created! AI Match found.', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to submit travel request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoin = async (group) => {
    try {
      await api.groups.joinGroup(group.id, currentUser.id, passengersCount, 'confirmed');
      addToast(`Joined ${group.name} with ${passengersCount} passenger(s)!`, 'success');
      setSelectedGroupId(group.id);
      setActivePage('details');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Page Title */}
      <div className="max-w-3xl space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>AI-Powered Smart Matching Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Post Travel Requirement
        </h1>
        <p className="text-sm text-slate-400">
          Tell our matching agent where and when you need to fly. We will discover compatible travelers and calculate transparent compatibility scores without auto-locking you into any group.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl glass-panel-glow border border-blue-500/30 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2 pb-4 border-b border-slate-800">
              <Plane className="w-4 h-4 text-blue-400" />
              <span>Flight & Passenger Requirements</span>
            </h3>

            {/* Departure & Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Departure City</label>
                <input
                  type="text"
                  value={departureCity}
                  onChange={(e) => setDepartureCity(e.target.value)}
                  placeholder="e.g. Bengaluru"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Destination City</label>
                <input
                  type="text"
                  value={destinationCity}
                  onChange={(e) => setDestinationCity(e.target.value)}
                  placeholder="e.g. Delhi"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Date & Flexibility */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Travel Date</label>
                <input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Passengers Count</label>
                <input
                  type="number"
                  min="1"
                  max="9"
                  value={passengersCount}
                  onChange={(e) => setPassengersCount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Flexibility Toggle */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">Flexible Travel Dates?</div>
                  <div className="text-[11px] text-slate-400">Allows AI to match cohorts traveling within a few days</div>
                </div>
                <input
                  type="checkbox"
                  checked={flexibleDates}
                  onChange={(e) => setFlexibleDates(e.target.checked)}
                  className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                />
              </div>

              {flexibleDates && (
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Date Flexibility Range:</span>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setFlexibilityDays(days)}
                        className={`px-3 py-1 rounded-lg font-medium transition-all ${
                          flexibilityDays === days
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        ±{days} Day{days > 1 ? 's' : ''}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Cabin Class & Budget */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Cabin Class</label>
                <select
                  value={cabinClass}
                  onChange={(e) => setCabinClass(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Economy">Economy</option>
                  <option value="Premium Economy">Premium Economy</option>
                  <option value="Business">Business</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Approx Budget / Passenger: <strong className="text-white font-mono">₹{budget.toLocaleString('en-IN')}</strong>
                </label>
                <input
                  type="range"
                  min="4000"
                  max="35000"
                  step="500"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Preferred Airlines */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Preferred Airlines (Optional)</label>
              <div className="flex flex-wrap gap-2">
                {airlineOptions.map((al) => {
                  const selected = preferredAirlines.includes(al);
                  return (
                    <button
                      key={al}
                      type="button"
                      onClick={() => toggleAirline(al)}
                      className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                        selected
                          ? 'bg-blue-600/30 border border-blue-500 text-blue-200'
                          : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {al}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Additional Preferences */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Additional Preferences</label>
              <textarea
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                rows={2}
                placeholder="e.g. morning departures preferred, traveling with extra bag"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{submitting ? 'Running Compatibility Agent...' : 'Submit Request & Find Matching Groups'}</span>
            </button>
          </form>
        </div>

        {/* AI Matches & Scoring Breakdown Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Transparency Card */}
          <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-cyan-400">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <h4 className="text-sm font-bold text-white">Transparent Compatibility Formula</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every recommendation is backed by a clear mathematical compatibility score:
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-300">Route Compatibility:</span>
                <span className="font-mono font-bold text-blue-400">40% Weight</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-300">Travel Date Alignment:</span>
                <span className="font-mono font-bold text-blue-400">30% Weight</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-300">Date Flexibility Buffer:</span>
                <span className="font-mono font-bold text-blue-400">15% Weight</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-300">Cabin Class Match:</span>
                <span className="font-mono font-bold text-blue-400">10% Weight</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-300">Budget Feasibility:</span>
                <span className="font-mono font-bold text-blue-400">5% Weight</span>
              </div>
            </div>
          </div>

          {/* AI Matching Results */}
          {matchResults && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>AI Recommendations ({matchResults.matched_groups_count})</span>
                </h4>
                <span className="text-xs text-slate-400">Requires your approval</span>
              </div>

              {matchResults.matches?.length === 0 ? (
                <div className="p-6 rounded-3xl glass-panel border border-slate-800 text-center space-y-3">
                  <Info className="w-8 h-8 text-blue-400 mx-auto" />
                  <p className="text-xs text-slate-400">
                    No active group currently meets the 40% threshold for this route. Would you like to create your own travel group?
                  </p>
                  <button
                    onClick={() => setActivePage('create')}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                  >
                    Create a Travel Group
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {matchResults.matches?.map((m) => {
                    const g = m.group;
                    return (
                      <div
                        key={m.group_id}
                        className="p-5 rounded-3xl glass-panel-glow border border-blue-500/40 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-extrabold text-xs">
                              {m.score_percentage}% Match
                            </span>
                            <span className="text-xs text-slate-400 font-medium">
                              {m.compatible_passengers} travelers found
                            </span>
                          </div>
                          {g?.status && <StatusBadge status={g.status} />}
                        </div>

                        <div>
                          <h5 className="text-sm font-bold text-white">{g?.name || 'Travel Cohort'}</h5>
                          <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                            <span>{g?.departure_city} ➔ {g?.destination_city}</span>
                            <span>•</span>
                            <span>{g?.travel_date}</span>
                          </div>
                        </div>

                        {/* Breakdown reasons */}
                        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5 text-[11px] text-slate-300">
                          <div className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider mb-1">
                            Transparent Match Breakdown
                          </div>
                          {m.reasons?.map((r, rIdx) => (
                            <div key={rIdx} className="flex items-start gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{r}</span>
                            </div>
                          ))}
                        </div>

                        {/* Explicit Join Button */}
                        <div className="pt-2 flex items-center justify-between">
                          <button
                            onClick={() => {
                              setSelectedGroupId(m.group_id);
                              setActivePage('details');
                            }}
                            className="text-xs text-slate-400 hover:text-white font-medium"
                          >
                            Inspect Group Dashboard
                          </button>

                          <button
                            onClick={() => handleJoin(g)}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                          >
                            <span>Request to Join</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
