'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  LogOut,
  LogIn,
} from 'lucide-react';
import { UserRole } from '../lib/types';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    currentUser,
    isLoggedIn,
    logout,
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

  // Click outside refs for Notification and Persona Dropdowns
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const handleNotificationClick = (item: any) => {
    markNotificationRead(item.id);
    setShowNotifications(false);

    if (item.title?.toLowerCase().includes('officer') || item.channel === 'in_app') {
      router.push('/officer');
    } else if (item.title?.toLowerCase().includes('relief') || item.title?.toLowerCase().includes('raast')) {
      router.push('/citizen');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#859114] border-b border-[#6F7910] shadow-md text-white">
      {/* 1. MANDATORY PROTOTYPE BANNER */}
      <div className="bg-[#1C1B1F] text-white text-xs font-bold py-1.5 px-4 text-center tracking-wide flex items-center justify-center gap-2 border-b border-[#9E98A8]/30">
        <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
        <span>PROTOTYPE ONLY — SIMULATED DPI SERVICES (MOCK NADRA &amp; RAAST). NO REAL PERSONAL DATA.</span>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name - SINGLE NON-DUPLICATED BRANDING */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <ThunderLogo size={36} withText={true} />
          </Link>

          {/* Quick Persona Dropdown Switcher with High Contrast & Click-Outside */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 bg-[#6F7910] hover:bg-[#5C640E] text-white border border-[#9EAA23] rounded-md px-3 py-1.5 text-xs font-medium transition-all shadow-sm"
              title="Click to switch persona immediately"
            >
              <UserCheck className="w-3.5 h-3.5 text-white" />
              <span className="hidden md:inline text-white/80">Persona:</span>
              <span className="font-bold text-white max-w-[130px] truncate">
                {currentUser?.name || (isLoggedIn ? 'Active User' : 'Guest')}
              </span>
              <span className="text-[10px] uppercase font-bold text-white bg-black/25 px-1.5 py-0.5 rounded">
                {currentUser?.role || 'Guest'}
              </span>
              <ChevronDown className="w-3 h-3 text-white/80" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-[#D5D1DC] rounded-lg shadow-2xl border border-[#9E98A8] py-2 z-50 animate-in fade-in slide-in-from-top-2 text-[#1C1B1F]">
                <div className="px-3 py-1.5 border-b border-[#9E98A8] text-[11px] font-bold text-[#46434D] uppercase tracking-wider">
                  Switch Active Persona
                </div>
                {roles.map((item) => (
                  <button
                    key={item.role}
                    onClick={() => {
                      switchRole(item.role);
                      setShowUserMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#CBC6D3] transition-colors ${
                      currentUser?.role === item.role
                        ? 'bg-[#859114]/20 text-[#1C1B1F] font-bold border-l-4 border-[#859114]'
                        : 'text-[#1C1B1F]'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-[#1C1B1F]">{item.label}</div>
                      <div className="text-[11px] text-[#46434D]">{item.desc}</div>
                    </div>
                    {currentUser?.role === item.role && (
                      <span className="text-[10px] bg-[#859114] text-white px-1.5 py-0.5 rounded font-bold">
                        Active
                      </span>
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
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${
                isOnline
                  ? 'bg-emerald-950/40 text-white border-emerald-400/50 hover:bg-emerald-900/60'
                  : 'bg-rose-900/60 text-white border-rose-300 hover:bg-rose-900/80 animate-pulse'
              }`}
              title="Click to simulate low-bandwidth offline village connection"
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline Mode'}</span>
            </button>

            {/* Language Toggle (Urdu / English) */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
              className="flex items-center gap-1 bg-[#6F7910] hover:bg-[#5C640E] text-white border border-[#9EAA23] px-2.5 py-1 rounded-md text-xs font-bold transition-colors"
              title="Switch Language (Urdu / English)"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'اردو' : 'EN'}</span>
            </button>

            {/* Notification Bell with Outside Click Handler */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-1.5 text-white hover:text-white bg-[#6F7910] hover:bg-[#5C640E] rounded-md border border-[#9EAA23] transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce shadow">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Drawer */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-[#D5D1DC] rounded-lg shadow-2xl border border-[#9E98A8] p-3 z-50 animate-in fade-in text-[#1C1B1F]">
                  <div className="flex items-center justify-between pb-2 border-b border-[#9E98A8]">
                    <span className="text-xs font-bold text-[#1C1B1F]">Alerts &amp; Dispatches</span>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-[#46434D] hover:text-[#1C1B1F]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-2 mt-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-[#46434D] py-3 text-center">No notifications</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`p-2.5 rounded-md text-xs cursor-pointer transition-colors border ${
                            n.isRead
                              ? 'bg-[#CBC6D3] text-[#46434D] border-[#AEA8B7]'
                              : 'bg-white text-[#1C1B1F] border-l-4 border-[#859114] shadow-sm font-medium'
                          }`}
                        >
                          <div className="flex justify-between items-center text-[10px] text-[#46434D] mb-0.5">
                            <span className="uppercase font-bold text-[#859114]">{n.channel}</span>
                            <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className="font-bold text-[#1C1B1F]">{n.title}</div>
                          <div className="text-[11px] mt-0.5 text-[#46434D]">
                            {language === 'ur' && n.bodyUr ? n.bodyUr : n.body}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Auth Link: Login / Logout */}
            {isLoggedIn ? (
              <button
                onClick={logout}
                className="flex items-center gap-1.5 bg-[#1C1B1F] hover:bg-black text-white text-xs font-bold px-3 py-1.5 rounded-md transition-colors shadow-sm"
                title="Sign out of current session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 bg-[#1C1B1F] hover:bg-black text-white text-xs font-bold px-3 py-1.5 rounded-md transition-colors shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>

        {/* Horizontal Navigation Sub-Bar */}
        <nav className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs border-t border-[#6F7910] pt-1.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white text-[#1C1B1F] shadow-sm'
                    : 'text-white/90 hover:text-white hover:bg-[#6F7910]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#859114]' : 'text-white'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
