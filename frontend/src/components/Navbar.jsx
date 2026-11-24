import React, { useState } from 'react';
import { Plane, Users, Bell, ShieldCheck, ChevronDown, Sparkles, PlusCircle, Search, LayoutDashboard, UserCheck, LogOut, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export default function Navbar({ activePage, setActivePage }) {
  const { currentUser, availableUsers, switchUser, logout, isAdmin } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);

  const navItems = [
    { id: 'landing', label: 'Home' },
    { id: 'flights', label: 'Flights & Fares', icon: Plane, badge: 'Real Fares' },
    { id: 'explore', label: 'Explore Groups', icon: Users },
    { id: 'request', label: 'Find Match', icon: Search, badge: 'AI' },
    { id: 'create', label: 'Create Group', icon: PlusCircle },
    { id: 'assistant', label: 'AI Assistant', icon: Sparkles },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin Portal', icon: LayoutDashboard }] : [])
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Team Brand */}
        <div 
          onClick={() => setActivePage('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Plane className="w-5 h-5 text-blue-400 transform -rotate-45 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white">GroupFare</span>
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400">
                AI
              </span>
            </div>
            <div className="text-[10px] text-slate-400 tracking-wider">
              CORRUPTX • <span className="text-slate-500">d362a123</span>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`relative px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'text-white bg-slate-900 border border-slate-800 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                }`}
              >
                {Icon && <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />}
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Section: Notifications & Demo User Switcher */}
        <div className="flex items-center gap-3">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifMenu(!showNotifMenu);
                setShowUserMenu(false);
              }}
              className="relative p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 z-50 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-medium">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markAsRead(n.id);
                          if (n.link && n.link.startsWith('/groups/')) {
                            const gid = n.link.replace('/groups/', '');
                            setActivePage('explore');
                          }
                          setShowNotifMenu(false);
                        }}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          n.is_read
                            ? 'bg-slate-950/40 border-slate-900 text-slate-400'
                            : 'bg-blue-950/20 border-blue-500/30 text-slate-200'
                        }`}
                      >
                        <div className="font-semibold text-white mb-1 flex items-center justify-between">
                          <span>{n.title}</span>
                          {!n.is_read && <span className="w-2 h-2 rounded-full bg-blue-400"></span>}
                        </div>
                        <p className="line-clamp-2 text-slate-300">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Demo User Switcher & Profile */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifMenu(false);
              }}
              className="flex items-center gap-2.5 p-1.5 pl-2.5 pr-2 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all"
            >
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&auto=format&fit=crop&q=80'}
                alt={currentUser?.full_name}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-blue-500/50"
              />
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-white leading-none flex items-center gap-1">
                  <span>{currentUser?.full_name || 'Rahul Sharma'}</span>
                  {currentUser?.role === 'admin' ? (
                    <span className="text-[9px] px-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">Admin</span>
                  ) : (
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  )}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Switch Demo User</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-3 z-50 animate-fade-in">
                <div className="px-3 py-2 border-b border-slate-800 mb-2">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Quick Demo User Switcher
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Switch between roles to inspect passenger & admin capabilities instantly
                  </p>
                </div>

                <div className="space-y-1">
                  {availableUsers.map((u) => {
                    const isSelected = currentUser?.id === u.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u);
                          setShowUserMenu(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all ${
                          isSelected
                            ? 'bg-blue-600/20 border border-blue-500/40 text-blue-200'
                            : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img src={u.avatar} alt={u.full_name} className="w-6 h-6 rounded-full object-cover" />
                          <div className="text-left">
                            <div className="font-semibold text-white flex items-center gap-1">
                              {u.full_name}
                              {u.role === 'admin' && (
                                <span className="text-[9px] px-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">Admin</span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400">{u.email}</div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-400" />}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {currentUser?.verification_status || 'Verified'}
                  </span>
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="text-slate-400 hover:text-rose-400 text-xs flex items-center gap-1"
                  >
                    <LogOut className="w-3 h-3" /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800/80 bg-slate-950/90 py-2 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`p-2 rounded-xl text-xs flex flex-col items-center gap-1 ${
                isActive ? 'text-blue-400 font-semibold' : 'text-slate-400'
              }`}
            >
              {Icon && <Icon className="w-4 h-4" />}
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
