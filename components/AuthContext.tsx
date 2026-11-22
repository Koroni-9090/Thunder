'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, NotificationItem } from '../lib/types';

interface AuthContextType {
  currentUser: User | null;
  user: User | null;
  isLoggedIn: boolean;
  setCurrentUser: (user: User | null) => void;
  loginUser: (user: User, token?: string) => void;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
  language: 'ur' | 'en';
  setLanguage: (lang: 'ur' | 'en') => void;
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  notifications: NotificationItem[];
  unreadCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  speakText: (text: string, lang?: 'ur' | 'en') => void;
  speak: (text: string, lang?: 'ur' | 'en') => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
}

export const PRESET_USERS: Record<UserRole, User> = {
  citizen: {
    id: 'usr-citizen-1',
    name: 'Rashida Bibi (Widow)',
    email: 'rashida.widow@example.com',
    cnic_mock: '35201-1234567-8',
    role: 'citizen',
    language_pref: 'ur',
    created_at: '2026-01-10T10:00:00Z',
  },
  helper: {
    id: 'usr-helper-1',
    name: 'Khadija Parveen (Social Mobilizer)',
    email: 'khadija.helper@example.com',
    cnic_mock: '35201-9876543-2',
    role: 'helper',
    language_pref: 'ur',
    created_at: '2026-01-05T08:30:00Z',
  },
  officer: {
    id: 'usr-officer-1',
    name: 'Tariq Mehmood (Welfare Officer)',
    email: 'tariq.officer@example.com',
    cnic_mock: '37405-1122334-1',
    role: 'officer',
    language_pref: 'en',
    created_at: '2025-11-01T09:00:00Z',
  },
  admin: {
    id: 'usr-admin-1',
    name: 'Zainab Abbas (Policy Admin)',
    email: 'zainab.admin@example.com',
    cnic_mock: '61101-9988776-3',
    role: 'admin',
    language_pref: 'en',
    created_at: '2025-08-01T09:00:00Z',
  },
  auditor: {
    id: 'usr-auditor-1',
    name: 'Farooq Ahmed (State Auditor)',
    email: 'farooq.auditor@example.com',
    cnic_mock: '42201-7788990-5',
    role: 'auditor',
    language_pref: 'en',
    created_at: '2025-09-01T09:00:00Z',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [language, setLanguage] = useState<'ur' | 'en'>('en');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Initialize session - DO NOT AUTO-LOGIN if user previously logged out
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Load voices
      const updateVoices = () => {
        const v = window.speechSynthesis.getVoices();
        setAvailableVoices(v);
      };
      updateVoices();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }

      // Check existing session from localStorage
      const savedUser = localStorage.getItem('sahulat_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed && parsed.id) {
            setCurrentUser(parsed);
            setIsLoggedIn(true);
            setLanguage(parsed.language_pref || 'en');
          } else {
            setCurrentUser(null);
            setIsLoggedIn(false);
          }
        } catch {
          setCurrentUser(null);
          setIsLoggedIn(false);
        }
      } else {
        // If not logged in, remain unauthenticated so user starts from home login screen
        setCurrentUser(null);
        setIsLoggedIn(false);
      }

      // Register Service Worker for offline capability
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
          console.warn('SW registration skipped:', err);
        });
      }

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // Poll notifications and reconcile with local read status
  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await fetch('/api/notifications');
        if (res.ok) {
          const data = await res.json();
          let serverNotifs: NotificationItem[] = data.notifications || [];
          if (typeof window !== 'undefined') {
            const readIds: string[] = JSON.parse(localStorage.getItem('sahulat_read_notifs') || '[]');
            if (readIds.length > 0) {
              const readSet = new Set(readIds);
              serverNotifs = serverNotifs.map((n) => ({
                ...n,
                isRead: n.isRead || readSet.has(n.id),
              }));
            }
          }
          setNotifications(serverNotifs);
        }
      } catch {
        // offline or fallback
      }
    }
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const loginUser = (user: User, token?: string) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setLanguage(user.language_pref || 'en');
    if (typeof window !== 'undefined') {
      localStorage.setItem('sahulat_user', JSON.stringify(user));
      if (token) localStorage.setItem('sahulat_token', token);
    }
  };

  const logout = async () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sahulat_user');
      localStorage.removeItem('sahulat_token');
      // Clear cookie
      document.cookie = 'sahulat_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      window.location.href = '/';
    }
  };

  const switchRole = async (role: UserRole) => {
    const preset = PRESET_USERS[role];
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: preset.email, skipOtp: true }),
      });
      if (res.ok) {
        const data = await res.json();
        loginUser(data.user || preset, data.token);
      } else {
        loginUser(preset);
      }
    } catch {
      loginUser(preset);
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    if (typeof window !== 'undefined') {
      try {
        const readIds: string[] = JSON.parse(localStorage.getItem('sahulat_read_notifs') || '[]');
        if (!readIds.includes(id)) {
          readIds.push(id);
          localStorage.setItem('sahulat_read_notifs', JSON.stringify(readIds));
        }
      } catch {}
    }
    // Update server
    fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).catch(() => {});
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    if (typeof window !== 'undefined') {
      try {
        const allIds = notifications.map((n) => n.id);
        localStorage.setItem('sahulat_read_notifs', JSON.stringify(allIds));
      } catch {}
    }
    // Update server
    fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true }),
    }).catch(() => {});
  };

  // Dual-Language Young Man Voice Synthesis (Urdu + English)
  const speakText = (text: string, lang: 'ur' | 'en' = language) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    if (!text || !text.trim()) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 1.22; // Energetic, youthful pitch
    utterance.rate = 1.05;  // Crisp delivery pace

    const voices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();

    if (lang === 'ur') {
      const urVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith('ur') ||
          v.lang.toLowerCase().includes('pk') ||
          v.lang.toLowerCase().startsWith('hi') ||
          v.name.toLowerCase().includes('urdu')
      );
      if (urVoice) utterance.voice = urVoice;
      utterance.lang = 'ur-PK';
    } else {
      const youngMaleVoice = voices.find(
        (v) =>
          (v.name.includes('Ryan') ||
            v.name.includes('Guy') ||
            v.name.includes('Natural') ||
            v.name.includes('David') ||
            v.name.includes('Male')) &&
          v.lang.startsWith('en')
      );
      if (youngMaleVoice) utterance.voice = youngMaleVoice;
      utterance.lang = 'en-US';
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        user: currentUser,
        isLoggedIn,
        setCurrentUser,
        loginUser,
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
        speakText,
        speak: speakText,
        stopSpeaking,
        isSpeaking,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
