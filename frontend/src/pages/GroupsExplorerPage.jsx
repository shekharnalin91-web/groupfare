import React, { useState, useEffect } from 'react';
import { Plane, Search, Users, PlusCircle, Filter, Sparkles, RefreshCw } from 'lucide-react';
import GroupCard from '../components/GroupCard';
import { api } from '../services/api';

export default function GroupsExplorerPage({ setActivePage, setSelectedGroupId, initialSearch = null }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [departure, setDeparture] = useState(initialSearch?.departure || '');
  const [destination, setDestination] = useState(initialSearch?.destination || '');

  const loadGroups = async () => {
    setLoading(true);
    try {
      const data = await api.groups.getGroups({
        departure: departure.trim() || undefined,
        destination: destination.trim() || undefined,
        status: statusFilter === 'All' ? undefined : statusFilter,
      });
      setGroups(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadGroups();
  };

  const statusTabs = ['All', 'Filling Fast', 'Target Reached', 'Quote Received', 'Open'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Explore Travel Groups</h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse and join travel cohorts aiming for airline group ticket quotas.
          </p>
        </div>

        <button
          onClick={() => setActivePage('create')}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Travel Group</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 sm:p-5 rounded-3xl glass-panel border border-slate-800 space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Departure City
            </label>
            <input
              type="text"
              value={departure}
              onChange={(e) => setDeparture(e.target.value)}
              placeholder="e.g. Bengaluru"
              className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-slate-600"
            />
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Destination City
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Delhi, Goa, Dubai"
              className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-slate-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 h-full min-h-[46px] rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <Search className="w-4 h-4" />
              <span>Filter Corridors</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setDeparture('');
                setDestination('');
                setStatusFilter('All');
                loadGroups();
              }}
              className="h-full min-h-[46px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all text-xs"
              title="Reset Filters"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-800/80">
          <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {statusTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                statusFilter === tab
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Groups */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
          <span>Loading available travel cohorts...</span>
        </div>
      ) : groups.length === 0 ? (
        <div className="py-20 text-center rounded-3xl glass-panel border border-slate-800 space-y-4 max-w-md mx-auto p-8">
          <Users className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Groups Found</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            No travel groups match your current route filters. Be the first to start a group for this corridor!
          </p>
          <button
            onClick={() => setActivePage('create')}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
          >
            Create This Travel Group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onSelect={(id) => {
                setSelectedGroupId(id);
                setActivePage('details');
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
