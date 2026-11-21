'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import ThunderLogo from './ThunderLogo';
import {
  Bell,
  Wifi,
  WifiOff,
  Globe,
  UserCheck,
  ChevronDown,
  Shield,
  Layers,
  FileCheck,
  Cpu,
  FileText,
  UserCheck2,
  X,
  ExternalLink,
} from 'lucide-react';
import { UserRole } from '../lib/types';

export default function Navbar() {
  const pathname = usePathname();
  const {
    currentUser,
    switchRole,
    language,
    setLanguage,
    isOnline,
    setIsOnline,
    notifications,
    unreadCount,
    markNotificationRead,
  } = useAuth();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'citizen', label: 'Rashida Bibi', desc: 'Citizen (Widow)' },
    { role: 'helper', label: 'Khadija Parveen', desc: 'Community Helper (40 Families)' },
    { role: 'officer', label: 'Tariq Mehmood', desc: 'Welfare Officer' },
    { role: 'admin', label: 'Zainab Abbas', desc: 'Policy Admin' },
    { role: 'auditor', label: 'Farooq Ahmed', desc: 'State Auditor' },
  ];

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Layers },
    { href: '/citizen', label: 'Citizen', icon: UserCheck2 },
    { href: '/helper', label: 'Community Helper', icon: Shield },
    { href: '/officer', label: 'Officer Queue', icon: FileCheck },
    { href: '/admin', label: 'Admin & Twin', icon: Cpu },
    { href: '/auditor', label: 'Auditor & Trace', icon: FileText },
    { href: '/docs', label: 'API Docs', icon: ExternalLink },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-indigo-950/80 shadow-md">
      {/* 1. MANDATORY PROTOTYPE BANNER */}
      <div className="bg-amber-400 text-slate-950 text-xs font-bold py-1.5 px-4 text-center tracking-wide flex items-center justify-center gap-2 shadow-inner">
        <span className="inline-block w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
        <span>PROTOTYPE ONLY — SIMULATED DPI SERVICES (MOCK NADRA &amp; RAAST). NO REAL PERSONAL DATA.</span>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <ThunderLogo size={36} className="transition-transform group-hover:scale-105" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-white tracking-tight">SahulatRail</span>
                <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-400/30">
                  THUNDER
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                AI on Public Rails • FAST-NUCES '26
              </p>
            </div>
          </Link>

          {/* Quick Persona Dropdown Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 bg-slate-800/90 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-medium transition-all shadow-sm"
              title="Click to switch persona immediately"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline text-slate-400">Persona:</span>
              <span className="font-semibold text-white max-w-[140px] truncate">
                {currentUser?.name || 'Select Persona'}
              </span>
              <span className="text-[10px] uppercase font-bold text-indigo-300 bg-indigo-900/60 px-1.5 py-0.5 rounded">
                {currentUser?.role}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-850 rounded-xl shadow-2xl border border-slate-700 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-1.5 border-b border-slate-700/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Active Persona
                </div>
                {roles.map((item) => (
                  <button
                    key={item.role}
                    onClick={() => {
                      switchRole(item.role);
                      setShowUserMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-750 transition-colors ${
                      currentUser?.role === item.role
                        ? 'bg-amber-400/10 text-amber-300 font-semibold border-l-2 border-amber-400'
                        : 'text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-white">{item.label}</div>
                      <div className="text-[11px] text-slate-400">{item.desc}</div>
                    </div>
                    {currentUser?.role === item.role && (
                      <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded">Active</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Action Icons & Toggles */}
          <div className="flex items-center gap-2">
            {/* Online / Offline Simulator Badge */}
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                isOnline
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20 animate-pulse'
              }`}
              title="Click to simulate low-bandwidth offline village connection"
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline Mode'}</span>
            </button>

            {/* Language Toggle (Urdu / English) */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors"
              title="Switch Language (Urdu / English)"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>{language === 'en' ? 'اردو' : 'EN'}</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Drawer */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-850 rounded-xl shadow-2xl border border-slate-700 p-3 z-50 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                    <span className="text-xs font-bold text-white">Alerts &amp; Dispatches</span>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-2 mt-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3 text-center">No notifications</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                            n.isRead ? 'bg-slate-800/60 text-slate-400' : 'bg-slate-800 text-slate-200 border-l-2 border-amber-400 font-medium'
                          }`}
                        >
                          <div className="flex justify-between items-center text-[10px] text-slate-400 mb-0.5">
                            <span className="uppercase font-bold text-amber-400">{n.channel}</span>
                            <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className="font-semibold text-white">{n.title}</div>
                          <div className="text-[11px] mt-0.5">{language === 'ur' && n.bodyUr ? n.bodyUr : n.body}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Auth Link (Login / Signup) */}
            <Link
              href="/login"
              className="hidden lg:inline-flex bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Horizontal Navigation Sub-Bar */}
        <nav className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none text-xs border-t border-slate-800 pt-1.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-400/20 text-amber-300 font-semibold border border-amber-400/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
