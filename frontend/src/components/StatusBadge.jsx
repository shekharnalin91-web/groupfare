import React from 'react';
import { Users, Clock, CheckCircle2, Send, Tag, ShieldCheck, XCircle } from 'lucide-react';

export default function StatusBadge({ status, size = 'sm' }) {
  const configs = {
    'Open': {
      bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      icon: Users,
      dot: 'bg-blue-400'
    },
    'Filling Fast': {
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse',
      icon: Clock,
      dot: 'bg-amber-400'
    },
    'Target Reached': {
      bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 font-semibold',
      icon: CheckCircle2,
      dot: 'bg-emerald-400 animate-ping'
    },
    'Quote Requested': {
      bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      icon: Send,
      dot: 'bg-purple-400'
    },
    'Quote Received': {
      bg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 font-semibold shadow-sm shadow-cyan-500/20',
      icon: Tag,
      dot: 'bg-cyan-400'
    },
    'Completed': {
      bg: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
      icon: ShieldCheck,
      dot: 'bg-slate-400'
    },
    'Cancelled': {
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      icon: XCircle,
      dot: 'bg-rose-400'
    }
  };

  const current = configs[status] || configs['Open'];
  const Icon = current.icon;
  const padding = size === 'lg' ? 'px-3.5 py-1.5 text-sm' : 'px-2.5 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${current.bg} ${padding} transition-colors`}>
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`}></span>
      <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      <span>{status}</span>
    </span>
  );
}
