import React, { useState, useEffect } from 'react';
import { Plane, Users, Calendar, PlusCircle, ArrowRight, Share2, ShieldCheck, Tag, Info, Clock } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export default function CreateGroupPage({ setActivePage, setSelectedGroupId, prepopulatedFlight = null }) {
  const { currentUser } = useAuth();
  const { addToast } = useNotifications();

  const [name, setName] = useState(prepopulatedFlight ? `${prepopulatedFlight.departure_city}-${prepopulatedFlight.destination_city} ${prepopulatedFlight.airline_name} Cohort` : '');
  const [departureCity, setDepartureCity] = useState(prepopulatedFlight?.departure_city || '');
  const [destinationCity, setDestinationCity] = useState(prepopulatedFlight?.destination_city || '');
  const [travelDate, setTravelDate] = useState('2026-12-25');
  const [passengerTarget, setPassengerTarget] = useState(prepopulatedFlight?.min_group_size || 10);
  const [cabinClass, setCabinClass] = useState('Economy');
  const [description, setDescription] = useState(prepopulatedFlight ? `Coordinating seats on ${prepopulatedFlight.airline_name} flight ${prepopulatedFlight.flight_number} departing at ${prepopulatedFlight.departure_time}.` : '');
  const [deadlineDays, setDeadlineDays] = useState(7);
  const [estimatedFare, setEstimatedFare] = useState(prepopulatedFlight?.base_individual_fare || 8500);

  // Flight specific metadata
  const [flightNumber, setFlightNumber] = useState(prepopulatedFlight?.flight_number || '6E-2041');
  const [airlineName, setAirlineName] = useState(prepopulatedFlight?.airline_name || 'IndiGo');
  const [departureTime, setDepartureTime] = useState(prepopulatedFlight?.departure_time || '06:15');
  const [arrivalTime, setArrivalTime] = useState(prepopulatedFlight?.arrival_time || '09:00');
  const [departureAirportCode, setDepartureAirportCode] = useState(prepopulatedFlight?.departure_airport_code || 'BLR');
  const [destinationAirportCode, setDestinationAirportCode] = useState(prepopulatedFlight?.destination_airport_code || 'DEL');
  const [departureTerminal, setDepartureTerminal] = useState(prepopulatedFlight?.departure_terminal || 'T2');
  const [destinationTerminal, setDestinationTerminal] = useState(prepopulatedFlight?.destination_terminal || 'T3');
  const [duration, setDuration] = useState(prepopulatedFlight?.duration || '2h 45m');
  const [aircraftType, setAircraftType] = useState(prepopulatedFlight?.aircraft_type || 'Airbus A321neo');

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (prepopulatedFlight) {
      setName(`${prepopulatedFlight.departure_city}-${prepopulatedFlight.destination_city} ${prepopulatedFlight.airline_name} Cohort`);
      setDepartureCity(prepopulatedFlight.departure_city);
      setDestinationCity(prepopulatedFlight.destination_city);
      setFlightNumber(prepopulatedFlight.flight_number);
      setAirlineName(prepopulatedFlight.airline_name);
      setDepartureTime(prepopulatedFlight.departure_time);
      setArrivalTime(prepopulatedFlight.arrival_time);
      setDepartureAirportCode(prepopulatedFlight.departure_airport_code);
      setDestinationAirportCode(prepopulatedFlight.destination_airport_code);
      setDepartureTerminal(prepopulatedFlight.departure_terminal);
      setDestinationTerminal(prepopulatedFlight.destination_terminal);
      setDuration(prepopulatedFlight.duration);
      setAircraftType(prepopulatedFlight.aircraft_type);
      setEstimatedFare(prepopulatedFlight.base_individual_fare);
      setPassengerTarget(prepopulatedFlight.min_group_size || 10);
      setDescription(`Coordinating seats on ${prepopulatedFlight.airline_name} flight ${prepopulatedFlight.flight_number} departing at ${prepopulatedFlight.departure_time}.`);
    }
  }, [prepopulatedFlight]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser?.id) {
      addToast('Please log in or select a demo user profile first.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const created = await api.groups.createGroup(currentUser.id, {
        name: name.trim(),
        departure_city: departureCity.trim(),
        destination_city: destinationCity.trim(),
        travel_date: travelDate,
        passenger_target: Number(passengerTarget),
        cabin_class: cabinClass,
        description: description.trim(),
        deadline_days: Number(deadlineDays),
        estimated_individual_fare: Number(estimatedFare),
        flight_number: flightNumber.trim(),
        airline_name: airlineName.trim(),
        departure_time: departureTime,
        arrival_time: arrivalTime,
        departure_airport_code: departureAirportCode.trim().toUpperCase(),
        destination_airport_code: destinationAirportCode.trim().toUpperCase(),
        departure_terminal: departureTerminal,
        destination_terminal: destinationTerminal,
        duration,
        aircraft_type: aircraftType
      });

      addToast(`Travel group '${created.name}' launched successfully!`, 'success');
      setSelectedGroupId(created.id);
      setActivePage('details');
    } catch (err) {
      addToast(err.message || 'Failed to create group', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Community & AI Cohorts</span>
        <h1 className="text-3xl font-extrabold text-white mt-1">Create a Travel Group</h1>
        <p className="text-sm text-slate-400">
          Initiate a collective travel cohort, specify your scheduled flight, and let GroupFare AI coordinate the airline quotation.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl glass-panel-glow border border-blue-500/30 space-y-6">
        {/* Group Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Group Title</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. BLR-DEL Winter Techies Flight Cohort"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
            required
          />
        </div>

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

        {/* Scheduled Flight Details */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <Plane className="w-3.5 h-3.5" />
            <span>Scheduled Commercial Flight Metadata</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Airline Partner</label>
              <select
                value={airlineName}
                onChange={(e) => setAirlineName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              >
                <option value="Air India">Air India (Min 10 Pax)</option>
                <option value="IndiGo">IndiGo (&gt;9 Pax / Min 10)</option>
                <option value="Air India Express">Air India Express (Min 10)</option>
                <option value="Emirates">Emirates (Min 10 Pax)</option>
                <option value="SpiceJet">SpiceJet (Min 10 Pax)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Flight Number</label>
              <input
                type="text"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value)}
                placeholder="e.g. 6E-2041 or AI-503"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Departure Time</label>
              <input
                type="text"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                placeholder="06:15"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Travel Date & Target Passengers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Passenger Quota Target <span className="text-blue-400 font-mono">(Min 10)</span>
            </label>
            <input
              type="number"
              min="10"
              max="50"
              value={passengerTarget}
              onChange={(e) => setPassengerTarget(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

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
        </div>

        {/* Benchmark Fare & Matching Deadline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Estimated Individual Market Fare (₹)
            </label>
            <input
              type="number"
              step="100"
              value={estimatedFare}
              onChange={(e) => setEstimatedFare(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Matching Deadline (Days)</label>
            <input
              type="number"
              min="1"
              max="30"
              value={deadlineDays}
              onChange={(e) => setDeadlineDays(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Group Description</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Details about baggage, meeting at terminal, or reason for travel..."
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{submitting ? 'Creating Group...' : 'Create Travel Group & Generate Invite Link'}</span>
        </button>
      </form>
    </div>
  );
}
