import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, FileText, Tag, ShieldCheck, TrendingUp, CheckCircle, RefreshCw, Send, PlusCircle } from 'lucide-react';
import { api } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import StatusBadge from '../components/StatusBadge';

export default function AdminDashboardPage({ setActivePage, setSelectedGroupId }) {
  const { addToast } = useNotifications();

  const [activeTab, setActiveTab] = useState('analytics'); // analytics, groups, quotes, requests, users
  const [analytics, setAnalytics] = useState(null);
  const [groups, setGroups] = useState([]);
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quote Issuance form state
  const [selectedGroupForQuote, setSelectedGroupForQuote] = useState('');
  const [airlineName, setAirlineName] = useState('IndiGo Airlines Group Desk');
  const [individualFare, setIndividualFare] = useState(8500);
  const [groupQuotePax, setGroupQuotePax] = useState(7700);
  const [taxesFees, setTaxesFees] = useState(1250);
  const [baggageConditions, setBaggageConditions] = useState('25kg Checked Baggage + 7kg Cabin per passenger (Group Fare Advantage)');
  const [fareConditions, setFareConditions] = useState('Free name amendment up to 72 hours before flight departure; standard seats allocated together.');
  const [issuing, setIssuing] = useState(false);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [an, grps, reqs, usrs] = await Promise.all([
        api.admin.getAnalytics(),
        api.admin.getGroupsMonitor(),
        api.admin.getAllTravelRequests(),
        api.admin.getAllUsers(),
      ]);
      setAnalytics(an);
      setGroups(grps);
      setRequests(reqs);
      setUsers(usrs);
      if (grps.length > 0 && !selectedGroupForQuote) {
        setSelectedGroupForQuote(grps[0].id);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const handleUpdateStatus = async (groupId, newStatus) => {
    try {
      await api.admin.updateGroupStatus(groupId, newStatus);
      addToast(`Status updated to ${newStatus}`, 'success');
      loadAllAdminData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleIssueQuotation = async (e) => {
    e.preventDefault();
    if (!selectedGroupForQuote) return;
    setIssuing(true);
    try {
      await api.admin.issueQuotation({
        group_id: selectedGroupForQuote,
        airline_name: airlineName,
        individual_fare_per_pax: Number(individualFare),
        group_quote_per_pax: Number(groupQuotePax),
        taxes_and_fees_per_pax: Number(taxesFees),
        baggage_conditions: baggageConditions,
        fare_conditions: fareConditions,
        validity_hours: 48,
        is_simulated: true,
      });
      addToast('Verified quotation successfully issued to group!', 'success');
      loadAllAdminData();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIssuing(false);
    }
  };

  const statusOptions = ['Open', 'Filling Fast', 'Target Reached', 'Quote Requested', 'Quote Received', 'Completed', 'Cancelled'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-white">Admin Control Portal</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
              Team CORRUPTX
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Supervise group formation, monitor requests, and issue verified or simulated flight quotations.
          </p>
        </div>

        <button
          onClick={loadAllAdminData}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'analytics', label: 'Platform Overview', icon: TrendingUp },
          { id: 'groups', label: `Groups Monitor (${groups.length})`, icon: Users },
          { id: 'quotes', label: 'Quotation Desk', icon: Tag },
          { id: 'requests', label: `Travel Requests (${requests.length})`, icon: FileText },
          { id: 'users', label: `Registered Users (${users.length})`, icon: ShieldCheck }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Platform Analytics */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-6 rounded-3xl glass-panel border border-slate-800">
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Users</div>
              <div className="text-3xl font-extrabold text-white mt-1">{analytics.total_users}</div>
              <div className="text-[11px] text-emerald-400 mt-1">Verified passenger accounts</div>
            </div>

            <div className="p-6 rounded-3xl glass-panel border border-slate-800">
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Travel Requests</div>
              <div className="text-3xl font-extrabold text-white mt-1">{analytics.total_travel_requests}</div>
              <div className="text-[11px] text-blue-400 mt-1">Corridors in matching pipeline</div>
            </div>

            <div className="p-6 rounded-3xl glass-panel border border-slate-800">
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Target Reached</div>
              <div className="text-3xl font-extrabold text-emerald-400 mt-1">{analytics.target_reached_groups}</div>
              <div className="text-[11px] text-slate-400 mt-1">Ready for quotation / booked</div>
            </div>

            <div className="p-6 rounded-3xl glass-panel-glow border border-emerald-500/40">
              <div className="text-xs text-emerald-300 font-semibold uppercase tracking-wider">Verified Savings</div>
              <div className="text-3xl font-extrabold text-white mt-1">
                ₹{analytics.verified_potential_savings.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-emerald-400 mt-1">Calculated across verified quotes</div>
            </div>
          </div>

          <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white">System Compliance Notice</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              In adherence to GroupFare product rules: (1) savings are reported only when backed by comparative market fare data, (2) simulated quotations are clearly flagged to prevent misleading user expectations, and (3) all passenger group additions require explicit user approval.
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Groups Monitor */}
      {activeTab === 'groups' && (
        <div className="rounded-3xl glass-panel border border-slate-800 overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Group Name</th>
                  <th className="p-4">Route</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Seats Locked</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {groups.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-900/40">
                    <td className="p-4">
                      <div className="font-bold text-white">{g.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">ID: {g.id}</div>
                    </td>
                    <td className="p-4 font-semibold text-slate-200">
                      {g.departure_city} ➔ {g.destination_city}
                    </td>
                    <td className="p-4">{g.travel_date}</td>
                    <td className="p-4">
                      <span className="font-bold text-white">{g.confirmed_count}</span> of {g.passenger_target}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={g.status} />
                    </td>
                    <td className="p-4 flex items-center gap-2">
                      <select
                        value={g.status}
                        onChange={(e) => handleUpdateStatus(g.id, e.target.value)}
                        className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-white"
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => {
                          setSelectedGroupId(g.id);
                          setActivePage('details');
                        }}
                        className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-[11px]"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Quotation Desk */}
      {activeTab === 'quotes' && (
        <div className="max-w-3xl rounded-3xl glass-panel-glow border border-blue-500/30 p-6 sm:p-8 space-y-6 animate-fade-in">
          <div>
            <h3 className="text-lg font-bold text-white">Quotation Desk & Contract Issuer</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Input simulated or airline-verified group quotation details to populate comparison metrics.
            </p>
          </div>

          <form onSubmit={handleIssueQuotation} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Group</label>
              <select
                value={selectedGroupForQuote}
                onChange={(e) => setSelectedGroupForQuote(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none"
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.departure_city} ➔ {g.destination_city}, {g.travel_date})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Airline Partner Name</label>
                <input
                  type="text"
                  value={airlineName}
                  onChange={(e) => setAirlineName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Aviation Taxes & Fees / Pax (₹)</label>
                <input
                  type="number"
                  value={taxesFees}
                  onChange={(e) => setTaxesFees(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Individual Benchmark Fare (₹)</label>
                <input
                  type="number"
                  value={individualFare}
                  onChange={(e) => setIndividualFare(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Negotiated Group Quote Fare / Pax (₹)
                </label>
                <input
                  type="number"
                  value={groupQuotePax}
                  onChange={(e) => setGroupQuotePax(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 font-mono font-bold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Baggage Conditions</label>
              <input
                type="text"
                value={baggageConditions}
                onChange={(e) => setBaggageConditions(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Fare Conditions & Seat Policy</label>
              <textarea
                rows={2}
                value={fareConditions}
                onChange={(e) => setFareConditions(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
              />
            </div>

            <button
              type="submit"
              disabled={issuing}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>{issuing ? 'Issuing...' : 'Issue Verified Quotation to Group'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab 4: Travel Requests Log */}
      {activeTab === 'requests' && (
        <div className="rounded-3xl glass-panel border border-slate-800 overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Passenger</th>
                  <th className="p-4">Corridor</th>
                  <th className="p-4">Date & Flex</th>
                  <th className="p-4">Class</th>
                  <th className="p-4">Budget</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-900/40">
                    <td className="p-4">
                      <div className="font-semibold text-white">{r.user_name}</div>
                      <div className="text-[10px] text-slate-500">{r.user_email}</div>
                    </td>
                    <td className="p-4 font-semibold text-slate-200">
                      {r.departure_city} ➔ {r.destination_city}
                    </td>
                    <td className="p-4">
                      <div>{r.travel_date}</div>
                      <div className="text-[10px] text-slate-400">
                        {r.flexible_dates ? `±${r.flexibility_days} days` : 'Fixed Date'}
                      </div>
                    </td>
                    <td className="p-4">{r.cabin_class}</td>
                    <td className="p-4 font-mono">₹{parseInt(r.max_budget_per_passenger).toLocaleString('en-IN')}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 font-medium">
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Users */}
      {activeTab === 'users' && (
        <div className="rounded-3xl glass-panel border border-slate-800 overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Name & Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Verification Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/40">
                    <td className="p-4">
                      <div className="font-bold text-white">{u.full_name}</div>
                      <div className="text-[10px] text-slate-500">{u.email}</div>
                    </td>
                    <td className="p-4">{u.phone || 'N/A'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.role === 'admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle className="w-3.5 h-3.5" />
                        {u.verification_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
