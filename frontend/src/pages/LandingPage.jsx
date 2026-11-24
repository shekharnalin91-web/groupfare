import React, { useState, useEffect } from 'react';
import { Plane, Search, Users, Sparkles, ArrowRight, ShieldCheck, TrendingDown, Clock, HelpCircle, ChevronRight, CheckCircle2, PlusCircle, Luggage } from 'lucide-react';
import IndividualToGroupIllustration from '../components/IndividualToGroupIllustration';
import GroupCard from '../components/GroupCard';
import HowGroupIsFormed from '../components/HowGroupIsFormed';
import AirlinePolicyCard from '../components/AirlinePolicyCard';
import FlightCard from '../components/FlightCard';
import { api } from '../services/api';

export default function LandingPage({ setActivePage, setSelectedGroupId, setSearchQuery, setPrepopulatedFlight }) {
  const [departure, setDeparture] = useState('Bengaluru');
  const [destination, setDestination] = useState('Delhi');
  const [travelDate, setTravelDate] = useState('2026-12-20');
  const [passengers, setPassengers] = useState(1);
  const [featuredGroups, setFeaturedGroups] = useState([]);
  const [featuredFlights, setFeaturedFlights] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    api.groups.getGroups()
      .then(groups => setFeaturedGroups(groups.slice(0, 3)))
      .catch(err => console.error(err));

    api.flights.getFlights()
      .then(fls => setFeaturedFlights(fls.slice(0, 4)))
      .catch(err => console.error(err));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (setSearchQuery) {
      setSearchQuery({ departure, destination, travelDate, passengers });
    }
    setActivePage('flights');
  };

  const faqs = [
    {
      q: "Which airlines give bulk booking fare reductions on GroupFare?",
      a: "Only airlines that have official, verified Group Booking Desks: Air India (minimum 10 passengers), IndiGo (more than 9 passengers / min 10), Air India Express (minimum 10 passengers), and Emirates (minimum 10 passengers in Economy). Low-cost carriers that do not offer wholesale group discounts are not matched."
    },
    {
      q: "Are group flight discounts guaranteed?",
      a: "No. Never promise guaranteed flight discounts. Group fares depend strictly on airline revenue inventory, group quotas (minimum 10 passengers), seasonal demand, and booking conditions. GroupFare only presents savings when verified by actual comparable fare quotations."
    },
    {
      q: "How does a travel group get formed?",
      a: "Group formation follows a 5-stage transparent lifecycle: (1) Independent passengers discover matching corridors, (2) Live seats fill toward the airline quota threshold (e.g. 10 seats), (3) GroupFare AI queries the carrier group desk with the flight number, (4) The airline issues wholesale net tariff and 25kg luggage allowances, and (5) All members explicitly review and approve the quote before final ticket issuance. Zero non-refundable deposits are ever collected upfront."
    },
    {
      q: "What routes are supported?",
      a: "GroupFare supports all major high-traffic Indian and international corridors including Bengaluru-Delhi, Delhi-Bengaluru, Mumbai-Goa, Delhi-Mumbai, Kolkata-Mumbai, Chennai-Port Blair, Delhi-Srinagar, Hyderabad-Delhi, Delhi-Dubai, and Mumbai-Dubai."
    },
    {
      q: "What happens if a group misses the required passenger target?",
      a: "If the group does not reach 10 passengers before the deadline, GroupFare's fallback protocol triggers: (1) we can extend the matching deadline by 3 days, (2) propose consensual merges with nearby date cohorts, (3) check smaller-tier quotas (6-9 pax), or (4) present standard individual booking options. Zero financial risk."
    }
  ];

  return (
    <div className="space-y-24 py-8">
      {/* 1. Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <div className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin-slow" />
            <span>AI-Powered Group Flight Booking Platform by Team <strong>CORRUPTX</strong></span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Travel Together.{' '}
            <span className="gradient-text">Unlock Better Group Fare Opportunities.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Find travellers going your way, build your group, and explore group flight fares with AI.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setActivePage('flights')}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-blue-500/25 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <Plane className="w-4 h-4" />
              <span>Browse Real Flights & Group Fares</span>
            </button>

            <button
              onClick={() => setActivePage('request')}
              className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm flex items-center gap-2 transition-all"
            >
              <Search className="w-4 h-4 text-blue-400" />
              <span>AI Match My Schedule</span>
            </button>
          </div>
        </div>

        {/* Search Widget */}
        <div className="mt-12 max-w-5xl mx-auto rounded-3xl glass-panel-glow border border-blue-500/30 p-4 sm:p-6 shadow-2xl">
          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Departure */}
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-left">
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Departure City
              </label>
              <input
                type="text"
                value={departure}
                onChange={(e) => setDeparture(e.target.value)}
                placeholder="e.g. Bengaluru (BLR)"
                className="w-full bg-transparent text-sm font-semibold text-white focus:outline-none placeholder-slate-600"
                required
              />
            </div>

            {/* Destination */}
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-left">
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Destination City
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Delhi (DEL)"
                className="w-full bg-transparent text-sm font-semibold text-white focus:outline-none placeholder-slate-600"
                required
              />
            </div>

            {/* Travel Date */}
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-left">
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Travel Date
              </label>
              <input
                type="date"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-white focus:outline-none"
                required
              />
            </div>

            {/* Passengers */}
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-left">
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Seats Needed
              </label>
              <select
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
                className="w-full bg-transparent text-sm font-semibold text-white focus:outline-none"
              >
                <option value={1} className="bg-slate-900 text-white">1 Passenger</option>
                <option value={2} className="bg-slate-900 text-white">2 Passengers</option>
                <option value={3} className="bg-slate-900 text-white">3 Passengers</option>
                <option value={4} className="bg-slate-900 text-white">4+ Passengers</option>
              </select>
            </div>

            {/* Search Button */}
            <div className="flex items-center">
              <button
                type="submit"
                className="w-full h-full min-h-[52px] rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all"
              >
                <Search className="w-4 h-4" />
                <span>Search Flights</span>
              </button>
            </div>
          </form>
        </div>

        {/* Visual Transformation Illustration */}
        <div className="mt-14">
          <IndividualToGroupIllustration />
        </div>
      </section>

      {/* 2. Interactive: How a Group is Formed */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <HowGroupIsFormed />
      </section>

      {/* 3. Airline Group Policies (Air India: Min 10, IndiGo: >9, etc.) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AirlinePolicyCard />
      </section>

      {/* 4. Real Scheduled Commercial Flights Live Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs uppercase font-bold tracking-wider text-cyan-400 mb-1">
              Live Scheduled Flights Across India & Dubai
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Real Flight Numbers, Actual Times & Wholesale Fares
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Bengaluru, Delhi, Mumbai, Goa, Dubai, Port Blair, Srinagar, Hyderabad, and Kolkata.
            </p>
          </div>

          <button
            onClick={() => setActivePage('flights')}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
          >
            <span>View All 27 Scheduled Flights</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {featuredFlights.map((flight) => (
            <FlightCard
              key={flight.id}
              flight={flight}
              onStartGroup={(fl) => {
                if (setPrepopulatedFlight) setPrepopulatedFlight(fl);
                setActivePage('create');
              }}
              onFindGroups={(fl) => {
                if (setSearchQuery) setSearchQuery({ departure: fl.departure_city, destination: fl.destination_city });
                setActivePage('explore');
              }}
            />
          ))}
        </div>
      </section>

      {/* 5. Active Cohorts Forming Now Across Corridors */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs uppercase font-bold tracking-wider text-cyan-400 mb-1">
              Community & AI Cohorts
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Active Travel Groups Nearing Quota Lock
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Lock your seat with fellow passengers to trigger official airline group tariff issuance.
            </p>
          </div>

          <button
            onClick={() => setActivePage('explore')}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
          >
            <span>View All Groups</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredGroups.map((g) => (
            <GroupCard
              key={g.id}
              group={g}
              onSelect={(id) => {
                setSelectedGroupId(id);
                setActivePage('details');
              }}
            />
          ))}
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Common Questions</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl glass-panel border border-slate-800 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left text-sm font-semibold text-white hover:text-blue-300 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-90 text-blue-400' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-400 leading-relaxed border-t border-slate-800/80 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
