import React, { useState, useEffect } from 'react';
import { Plane, Search, Filter, ShieldCheck, RefreshCw, PlusCircle, ArrowRight, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import FlightCard from '../components/FlightCard';
import AirlinePolicyCard from '../components/AirlinePolicyCard';
import HowGroupIsFormed from '../components/HowGroupIsFormed';

export default function FlightSchedulesPage({ setActivePage, setPrepopulatedFlight, setSearchQuery }) {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedAirline, setSelectedAirline] = useState('All');

  const popularCorridors = [
    { label: "All Corridors", dep: "", arr: "" },
    { label: "BLR ➔ DEL", dep: "Bengaluru", arr: "Delhi" },
    { label: "BOM ➔ GOI", dep: "Mumbai", arr: "Goa" },
    { label: "DEL ➔ BOM", dep: "Delhi", arr: "Mumbai" },
    { label: "DEL ➔ DXB", dep: "Delhi", arr: "Dubai" },
    { label: "BOM ➔ DXB", dep: "Mumbai", arr: "Dubai" },
    { label: "MAA ➔ IXZ", dep: "Chennai", arr: "Port Blair" },
    { label: "DEL ➔ SXR", dep: "Delhi", arr: "Srinagar" },
    { label: "CCU ➔ BOM", dep: "Kolkata", arr: "Mumbai" },
    { label: "HYD ➔ DEL", dep: "Hyderabad", arr: "Delhi" }
  ];

  const loadFlights = async () => {
    setLoading(true);
    try {
      const data = await api.flights.getFlights({
        departure: departure.trim() || undefined,
        destination: destination.trim() || undefined,
        airline: selectedAirline === 'All' ? undefined : selectedAirline
      });
      setFlights(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlights();
  }, [departure, destination, selectedAirline]);

  const handleStartGroup = (flight) => {
    if (setPrepopulatedFlight) {
      setPrepopulatedFlight(flight);
    }
    setActivePage('create');
  };

  const handleFindGroups = (flight) => {
    if (setSearchQuery) {
      setSearchQuery({
        departure: flight.departure_city,
        destination: flight.destination_city
      });
    }
    setActivePage('explore');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold mb-2">
            <Plane className="w-3.5 h-3.5 text-cyan-400" />
            <span>Scheduled Commercial Flights with Group Desks</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Real Flight Schedules & Group Quotas
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Browse verified commercial flights across top Indian & international corridors. Each flight qualifies for official group bulk tariffs (Air India: Min 10, IndiGo: &gt;9 Pax, Emirates: Min 10).
          </p>
        </div>

        <button
          onClick={() => setActivePage('create')}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Start Custom Group</span>
        </button>
      </div>

      {/* Corridor Quick Filter Chips */}
      <div className="space-y-3">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Popular Flight Corridors
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {popularCorridors.map((c, idx) => {
            const isSelected = departure === c.dep && destination === c.arr;
            return (
              <button
                key={idx}
                onClick={() => {
                  setDeparture(c.dep);
                  setDestination(c.arr);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 sm:p-5 rounded-3xl glass-panel border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Departure City / Airport
          </label>
          <input
            type="text"
            value={departure}
            onChange={(e) => setDeparture(e.target.value)}
            placeholder="e.g. Bengaluru (BLR)"
            className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-slate-600"
          />
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Destination City / Airport
          </label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g. Delhi, Goa, Dubai"
            className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-slate-600"
          />
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Qualifying Airline Group Desk
          </label>
          <select
            value={selectedAirline}
            onChange={(e) => setSelectedAirline(e.target.value)}
            className="w-full bg-transparent text-sm text-white focus:outline-none"
          >
            <option value="All" className="bg-slate-900 text-white">All Airlines (Air India, IndiGo, Emirates, etc.)</option>
            <option value="Air India" className="bg-slate-900 text-white">Air India (Min 10 Pax)</option>
            <option value="IndiGo" className="bg-slate-900 text-white">IndiGo (&gt;9 Pax / Min 10)</option>
            <option value="Air India Express" className="bg-slate-900 text-white">Air India Express (Min 10 Pax)</option>
            <option value="Emirates" className="bg-slate-900 text-white">Emirates (Min 10 Pax)</option>
          </select>
        </div>
      </div>

      {/* Flight Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
          <span>Fetching real-time airline flight schedules...</span>
        </div>
      ) : flights.length === 0 ? (
        <div className="py-16 text-center rounded-3xl glass-panel border border-slate-800 max-w-md mx-auto p-8 space-y-3">
          <Plane className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Flights Matched</h3>
          <p className="text-xs text-slate-400">
            No direct flights match this corridor. Try switching to "All Corridors" above.
          </p>
          <button
            onClick={() => {
              setDeparture('');
              setDestination('');
              setSelectedAirline('All');
            }}
            className="px-4 py-2 bg-blue-600 rounded-xl text-xs font-semibold text-white"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-xs text-slate-400 font-semibold flex items-center justify-between">
            <span>Showing {flights.length} Scheduled Commercial Flights</span>
            <span className="text-cyan-400">All times in Indian Standard Time (IST) / Local</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {flights.map((flight) => (
              <FlightCard
                key={flight.id}
                flight={flight}
                onStartGroup={handleStartGroup}
                onFindGroups={handleFindGroups}
              />
            ))}
          </div>
        </div>
      )}

      {/* How Group Is Formed Section */}
      <HowGroupIsFormed />

      {/* Airline Policies Section */}
      <AirlinePolicyCard />
    </div>
  );
}
