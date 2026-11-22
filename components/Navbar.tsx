'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth, PRESET_USERS } from './AuthContext';
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
  Check,
  Home,
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
    markAllNotificationsRead,
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

  // STRICT RBAC TABS: Filter tabs according to current user's role
  const getPermittedNavLinks = () => {
    if (!isLoggedIn || !currentUser) {
      return [
        { href: '/', label: 'Home / Sign In', icon: Home },
        { href: '/dashboard', label: 'Public Command Center', icon: Layers },
        { href: '/docs', label: 'REST API Docs', icon: ExternalLink },
      ];
    }

    const links = [{ href: '/dashboard', label: 'Dashboard', icon: Layers }];

    if (currentUser.role === 'citizen') {
      links.unshift({ href: '/citizen', label: 'Citizen Portal', icon: UserCheck2 });
    } else if (currentUser.role === 'helper') {
      links.unshift({ href: '/helper', label: 'Community Helper Kiosk', icon: Shield });
    } else if (currentUser.role === 'officer') {
      links.unshift({ href: '/officer', label: 'Officer Queue', icon: FileCheck });
    } else if (currentUser.role === 'admin') {
      links.unshift({ href: '/admin', label: 'Admin & Twin', icon: Cpu });
      links.push({ href: '/officer', label: 'Officer Review', icon: FileCheck });
      links.push({ href: '/helper', label: 'Helper Kiosk', icon: Shield });
      links.push({ href: '/auditor', label: 'Auditor & Trace', icon: FileText });
    } else if (currentUser.role === 'auditor') {
      links.unshift({ href: '/auditor', label: 'Auditor & Trace', icon: FileText });
    }

    links.push({ href: '/docs', label: 'API Docs', icon: ExternalLink });
    return links;
  };

  const navLinks = getPermittedNavLinks();

  const handleNotificationClick = (item: any) => {
    markNotificationRead(item.id);
    setShowNotifications(false);

    if (item.title?.toLowerCase().includes('officer') || item.channel === 'in_app') {
      if (currentUser?.role === 'officer' || currentUser?.role === 'admin') {
        router.push('/officer');
      } else {
        router.push('/dashboard');
      }
    } else if (item.title?.toLowerCase().includes('relief') || item.title?.toLowerCase().includes('raast')) {
      if (currentUser?.role === 'citizen') {
        router.push('/citizen');
      } else {
        router.push('/dashboard');
      }
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#859114] border-b border-[#6F7910] shadow-md text-white">
      {/* 1. MANDATORY PROTOTYPE BANNER */}
      <div className="bg-[#1C1B1F] text-white text-xs font-bold py-1.5 px-4 text-center tracking-wide flex items-center justify-center gap-2 border-b border-[#616060]">
        <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
        <span>PROTOTYPE ONLY — SIMULATED DPI SERVICES (MOCK NADRA &amp; RAAST). NO REAL PERSONAL DATA.</span>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <ThunderLogo size={36} withText={true} />
          </Link>

          {/* User Persona & Role Badge with Click-Outside */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 bg-[#6F7910] hover:bg-[#5C640E] text-white border border-[#9EAA23] rounded-md px-3 py-1.5 text-xs font-medium transition-all shadow-sm"
              title="Click to view authenticated user & switch role"
            >
              <UserCheck className="w-3.5 h-3.5 text-white" />
              <span className="hidden md:inline text-white/80">Account:</span>
              <span className="font-bold text-white max-w-[130px] truncate">
                {currentUser?.name || (isLoggedIn ? 'Active User' : 'Guest (Not Logged In)')}
              </span>
              <span className="text-[10px] uppercase font-bold text-black bg-[#F59E0B] px-1.5 py-0.5 rounded shadow-xs">
                {currentUser?.role || 'Guest'}
              </span>
              <ChevronDown className="w-3 h-3 text-white/80" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-[#383737] rounded-lg shadow-2xl border border-[#616060] py-2 z-50 animate-in fade-in slide-in-from-top-2 text-white">
                <div className="px-3 py-1.5 border-b border-[#616060] flex items-center justify-between text-[11px] font-bold text-[#D1D5DB] uppercase tracking-wider">
                  <span>Current User Profile</span>
                  {isLoggedIn && (
                    <span className="text-[10px] bg-emerald-700 text-white px-1.5 py-0.5 rounded font-mono">
                      Authenticated
                    </span>
                  )}
                </div>

                {isLoggedIn && currentUser && (
                  <div className="px-3 py-2 bg-[#2E2D2D] border-b border-[#616060] text-xs space-y-1">
                    <div className="font-bold text-white">{currentUser.name}</div>
                    <div className="text-[11px] text-[#D1D5DB] truncate">{currentUser.email}</div>
                    <div className="text-[10px] text-[#A3A3A3] font-mono">CNIC: {currentUser.cnic_mock}</div>
                  </div>
                )}

                <div className="px-3 py-1.5 text-[11px] font-bold text-[#D1D5DB] uppercase tracking-wider">
                  Switch Persona / Role (Hackathon Demo)
                </div>

                {roles.map((item) => (
                  <button
                    key={item.role}
                    onClick={() => {
                      switchRole(item.role);
                      setShowUserMenu(false);
                      // Navigate directly to their role page
                      if (item.role === 'citizen') router.push('/citizen');
                      else if (item.role === 'helper') router.push('/helper');
                      else if (item.role === 'officer') router.push('/officer');
                      else if (item.role === 'admin') router.push('/admin');
                      else if (item.role === 'auditor') router.push('/auditor');
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#4A4949] transition-colors ${
                      currentUser?.role === item.role
                        ? 'bg-[#859114]/30 text-white font-bold border-l-4 border-[#859114]'
                        : 'text-[#D1D5DB]'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-white">{item.label}</div>
                      <div className="text-[11px] text-[#A3A3A3]">{item.desc}</div>
                    </div>
                    {currentUser?.role === item.role && (
                      <span className="text-[10px] bg-[#859114] text-white px-1.5 py-0.5 rounded font-bold">
                        Active
                      </span>
                    )}
                  </button>
                ))}

                {isLoggedIn && (
                  <div className="p-2 border-t border-[#616060] mt-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full flex items-center justify-center gap-1.5 bg-red-800/80 hover:bg-red-700 text-white text-xs font-bold py-1.5 rounded transition shadow-sm"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out Session</span>
                    </button>
                  </div>
                )}
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

            {/* Notification Bell with Dynamic Unread Badge */}
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
                <div className="absolute right-0 mt-2 w-80 bg-[#383737] rounded-lg shadow-2xl border border-[#616060] p-3 z-50 animate-in fade-in text-white">
                  <div className="flex items-center justify-between pb-2 border-b border-[#616060]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Alerts &amp; Dispatches</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.2 rounded-full font-bold">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllNotificationsRead}
                          className="text-[10px] text-[#FEF08A] hover:underline font-bold flex items-center gap-0.5"
                          title="Mark all alerts as read"
                        >
                          <Check className="w-3 h-3" />
                          <span>Mark all read</span>
                        </button>
                      )}
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-[#D1D5DB] hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-2 mt-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-[#A3A3A3] py-3 text-center">No notifications</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`p-2.5 rounded-md text-xs cursor-pointer transition-colors border ${
                            n.isRead
                              ? 'bg-[#2E2D2D] text-[#A3A3A3] border-[#525151]'
                              : 'bg-[#4A4949] text-white border-l-4 border-[#859114] shadow-sm font-medium'
                          }`}
                        >
                          <div className="flex justify-between items-center text-[10px] text-[#D1D5DB] mb-0.5">
                            <span className="uppercase font-bold text-[#F59E0B]">{n.channel}</span>
                            <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className="font-bold text-white">{n.title}</div>
                          <div className="text-[11px] mt-0.5 text-[#D1D5DB]">
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

        {/* Horizontal Navigation Sub-Bar (Strictly RBAC Permitted) */}
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
                    ? 'bg-[#383737] text-white shadow-sm border border-[#616060]'
                    : 'text-white/90 hover:text-white hover:bg-[#6F7910]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#F59E0B]' : 'text-white'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
