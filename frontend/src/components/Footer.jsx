import React from 'react';
import { Plane, Shield, Info, Heart, ExternalLink } from 'lucide-react';

export default function Footer({ setActivePage }) {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-900 mt-20 pt-12 pb-8 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-900">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <Plane className="w-4 h-4 transform -rotate-45" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">GroupFare</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI-driven group travel coordination engine empowering independent passengers to unlock volume airline quotas together.
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] font-mono">
                Crafted by <strong className="text-white">CORRUPTX</strong> (ID: d362a123)
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Platform</h5>
            <ul className="space-y-1.5">
              <li>
                <button onClick={() => setActivePage('explore')} className="hover:text-blue-400 transition-colors">
                  Explore Active Groups
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('request')} className="hover:text-blue-400 transition-colors">
                  Post Travel Requirement
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('create')} className="hover:text-blue-400 transition-colors">
                  Create a Travel Group
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('assistant')} className="hover:text-blue-400 transition-colors">
                  GroupFare AI Travel Assistant
                </button>
              </li>
            </ul>
          </div>

          {/* Fallback Protocol & Guarantees */}
          <div className="space-y-2">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Safety & Ethics</h5>
            <ul className="space-y-1.5">
              <li className="flex items-center gap-1.5 text-slate-300">
                <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Zero deposit before contract approval</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>No automated additions without consent</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Transparent 5-factor matching math</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Consensual group merge options</span>
              </li>
            </ul>
          </div>

          {/* Essential Policy Disclaimer */}
          <div className="space-y-2 md:col-span-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <Info className="w-4 h-4 shrink-0" />
              <span>Commercial Transparency</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] leading-relaxed text-slate-400">
              GroupFare connects individual passengers to explore collective fare opportunities. Group fares may or may not be cheaper than standalone fares. Savings are presented only when backed by comparative fare data. Simulated estimations are strictly educational for hackathon evaluation.
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <div>
            © 2026 GroupFare. Built by Team CORRUPTX for the AI Travel-Tech Hackathon.
          </div>
          <div className="flex items-center gap-4">
            <span>Team ID: <strong className="text-slate-400 font-mono">d362a123</strong></span>
            <span>•</span>
            <span className="text-emerald-400">FastAPI & React Stack</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
