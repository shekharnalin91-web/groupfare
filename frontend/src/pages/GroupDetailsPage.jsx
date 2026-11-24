import React, { useState, useEffect } from 'react';
import { Plane, Users, Calendar, Clock, Share2, Tag, ShieldCheck, ArrowRight, CheckCircle2, AlertTriangle, Send, RefreshCw, Luggage, Plus, LogOut } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import StatusBadge from '../components/StatusBadge';
import FareComparisonCard from '../components/FareComparisonCard';

export default function GroupDetailsPage({ groupId, setActivePage }) {
  const { currentUser } = useAuth();
  const { addToast } = useNotifications();

  const [group, setGroup] = useState(null);
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fallbackData, setFallbackData] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadGroupDetails = async () => {
    if (!groupId) return;
    setLoading(true);
    try {
      const data = await api.groups.getGroupDetails(groupId);
      setGroup(data);

      // Check if quotation exists
      if (data.quotation_id || data.status === 'Quote Received' || data.status === 'Completed') {
        try {
          const q = await api.quotations.getGroupQuotation(groupId);
          setQuotation(q);
        } catch (e) {
          console.log('No quote yet');
        }
      }

      // Check fallback metrics
      try {
        const fb = await api.ai.getFallbackStrategy(groupId);
        setFallbackData(fb);
      } catch (e) {
        console.log('Fallback query failed');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroupDetails();
  }, [groupId]);

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 flex flex-col items-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
        <span>Loading group flight dashboard...</span>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="py-20 text-center text-white">
        <h3 className="text-xl font-bold">Group Not Found</h3>
        <button onClick={() => setActivePage('explore')} className="mt-4 px-4 py-2 bg-blue-600 rounded-xl text-xs">
          Return to Explorer
        </button>
      </div>
    );
  }

  const confirmedCount = group.current_confirmed_passengers || 0;
  const interestedCount = group.current_interested_passengers || 0;
  const target = group.passenger_target || 10;
  const progressPct = Math.min(100, Math.round((confirmedCount / target) * 100));

  const isUserMember = group.members?.some(m => m.user_id === currentUser?.id);
  const userMemberRecord = group.members?.find(m => m.user_id === currentUser?.id);
  const isCreator = group.creator_id === currentUser?.id;

  const handleJoin = async (status = 'confirmed') => {
    if (!currentUser?.id) {
      addToast('Please login or select a user first', 'error');
      return;
    }
    setActionLoading(true);
    try {
      await api.groups.joinGroup(group.id, currentUser.id, 1, status);
      addToast(`Seat successfully ${status === 'confirmed' ? 'confirmed' : 'marked as interested'}!`, 'success');
      loadGroupDetails();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!confirm('Are you sure you want to leave this group?')) return;
    setActionLoading(true);
    try {
      await api.groups.leaveGroup(group.id, currentUser.id);
      addToast('You have left the group', 'info');
      loadGroupDetails();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestQuote = async () => {
    setActionLoading(true);
    try {
      const res = await api.groups.requestQuote(group.id, currentUser.id);
      addToast(res.message, 'success');
      loadGroupDetails();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExtendDeadline = async () => {
    try {
      const res = await api.groups.extendDeadline(group.id, 3);
      addToast(res.message, 'success');
      loadGroupDetails();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleAcceptQuote = async () => {
    if (!quotation?.id) return;
    try {
      await api.quotations.acceptQuotation(quotation.id, currentUser.id);
      addToast('Group quotation accepted! Proceeding to passenger manifest coordination.', 'success');
      loadGroupDetails();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const inviteUrl = `${window.location.origin}/join/${group.invite_code}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Top Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel-glow border border-blue-500/30 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={group.status} size="lg" />
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono">
                Code: {group.invite_code}
              </span>
              <span className="text-xs text-slate-400">Created by {group.creator_name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{group.name}</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-2 transition-all"
            >
              <Share2 className="w-4 h-4 text-blue-400" />
              <span>Invite Friends</span>
            </button>

            {isUserMember ? (
              <button
                onClick={handleLeave}
                disabled={actionLoading}
                className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold text-xs flex items-center gap-1.5 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Leave Group</span>
              </button>
            ) : (
              <button
                onClick={() => handleJoin('confirmed')}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm My Seat</span>
              </button>
            )}
          </div>
        </div>

        {/* Corridor Meta */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800 text-xs">
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="text-slate-400 text-[10px] uppercase font-semibold">Corridor</div>
            <div className="font-bold text-white text-sm mt-0.5">{group.departure_city} ➔ {group.destination_city}</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="text-slate-400 text-[10px] uppercase font-semibold">Travel Date</div>
            <div className="font-bold text-white text-sm mt-0.5">{group.travel_date}</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="text-slate-400 text-[10px] uppercase font-semibold">Cabin Class</div>
            <div className="font-bold text-white text-sm mt-0.5">{group.cabin_class}</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="text-slate-400 text-[10px] uppercase font-semibold">Deadline</div>
            <div className="font-bold text-white text-sm mt-0.5">{group.deadline?.split('T')[0]}</div>
          </div>
        </div>

        {/* Quota Progress Bar */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-white">
                <strong className="text-emerald-400 font-bold">{confirmedCount}</strong> Confirmed
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-400">
                <strong className="text-blue-300 font-bold">{interestedCount}</strong> Interested
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-400">
                Target: <strong className="text-white font-bold">{target}</strong> Passengers
              </span>
            </div>
            <span className="font-bold text-blue-400">{progressPct}%</span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden relative">
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

          <div className="flex justify-between items-center text-[11px] text-slate-400">
            <span>
              {confirmedCount >= target
                ? '🎉 Quota reached! Official airline quotation can now be locked.'
                : `💡 Needs ${target - confirmedCount} more confirmed seats to qualify for group quotation.`}
            </span>
            {confirmedCount < target && isUserMember && userMemberRecord?.status === 'interested' && (
              <button
                onClick={() => handleJoin('confirmed')}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold underline"
              >
                Upgrade to Confirmed Seat
              </button>
            )}
          </div>
        </div>

        {/* Action: Trigger Quotation Request */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            {confirmedCount >= target ? (
              <span className="text-emerald-300 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Group has attained threshold. Ready for quotation issuance.
              </span>
            ) : (
              <span>Group coordinator or admin can initiate quote request as seats fill.</span>
            )}
          </div>

          {!quotation && (
            <button
              onClick={handleRequestQuote}
              disabled={actionLoading}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                confirmedCount >= target
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'bg-blue-600/30 hover:bg-blue-600/40 text-blue-200 border border-blue-500/40'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{confirmedCount >= target ? 'Request Official Group Quote Now' : 'Request Early Quote Preview'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Verified Quotation & Fare Comparison Section (If Quote Exists) */}
      {quotation && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-cyan-400">
            <Tag className="w-5 h-5 shrink-0" />
            <h3 className="text-lg font-bold text-white">Live Airline Group Quotation</h3>
          </div>
          <FareComparisonCard
            quote={quotation}
            groupName={group.name}
            passengerCount={confirmedCount || target}
            onAccept={quotation.status !== 'accepted' ? handleAcceptQuote : null}
          />
        </section>
      )}

      {/* Members Manifest & Fallback Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Confirmed & Interested Passengers Manifest */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span>Passenger Roster ({group.members?.length || 0})</span>
            </h3>
            <span className="text-xs text-slate-400">Explicit passenger consent verified</span>
          </div>

          <div className="rounded-3xl glass-panel border border-slate-800 overflow-hidden">
            <div className="divide-y divide-slate-800/80">
              {group.members?.map((member) => (
                <div key={member.id} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-900/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <img
                      src={member.user_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&auto=format&fit=crop&q=80'}
                      alt={member.user_name}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-blue-500/40"
                    />
                    <div>
                      <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                        <span>{member.user_name}</span>
                        {member.role === 'creator' && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            Coordinator
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="text-emerald-400 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> {member.verification_status || 'Verified Passenger'}
                        </span>
                        <span>•</span>
                        <span>{member.passengers_count} Seat{member.passengers_count > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        member.status === 'confirmed'
                          ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                          : 'bg-blue-500/10 border border-blue-500/30 text-blue-300'
                      }`}
                    >
                      {member.status === 'confirmed' ? '✓ Confirmed Seat' : 'Exploring (Interested)'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fallback Protocol Card */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Fallback & Contingency Plan</span>
          </h3>

          <div className="p-5 rounded-3xl glass-panel border border-slate-800 space-y-4 text-xs">
            <p className="text-slate-300 leading-relaxed">
              If the group does not reach {target} seats before {group.deadline?.split('T')[0]}, GroupFare ensures zero stranded passengers:
            </p>

            <div className="space-y-2">
              <button
                onClick={handleExtendDeadline}
                className="w-full p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left flex items-center justify-between transition-colors group"
              >
                <div>
                  <div className="font-semibold text-white group-hover:text-blue-300">Extend Matching Deadline</div>
                  <div className="text-[10px] text-slate-400">Add +3 days for last-minute passenger discovery</div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400" />
              </button>

              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-left">
                <div className="font-semibold text-white">Consensual Group Merging</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {fallbackData?.merge_candidates_count > 0 ? (
                    <span className="text-emerald-400">
                      {fallbackData.merge_candidates_count} compatible group(s) available on nearby dates
                    </span>
                  ) : (
                    <span>AI constantly monitors incoming requests for merge options</span>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-left">
                <div className="font-semibold text-white">Standalone Backup Ticket</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Benchmark individual price: ₹{parseInt(group.estimated_individual_fare).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 leading-relaxed">
              🛡️ <strong>Safety Guarantee:</strong> Zero non-refundable deposits are accepted without full consensus and confirmed airline flight tickets.
            </div>
          </div>
        </div>
      </div>

      {/* Share / Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <Share2 className="w-5 h-5 text-blue-400" />
              <span>Invite Friends to Group</span>
            </h4>
            <p className="text-xs text-slate-400">
              Share this link with colleagues, friends, or travel forums. Anyone with the link can request to join.
            </p>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
              <span className="text-xs text-cyan-300 truncate font-mono">{inviteUrl}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(inviteUrl);
                  addToast('Invitation link copied to clipboard!', 'success');
                }}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shrink-0"
              >
                Copy Link
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
