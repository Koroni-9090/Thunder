'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, NotificationItem } from '../lib/types';

interface AuthContextType {
  currentUser: User | null;
  user: User | null;
  setCurrentUser: (user: User | null) => void;
  switchRole: (role: UserRole) => Promise<void>;
  language: 'ur' | 'en';
  setLanguage: (lang: 'ur' | 'en') => void;
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  notifications: NotificationItem[];
  unreadCount: number;
  markNotificationRead: (id: string) => void;
  speakText: (text: string, lang?: 'ur' | 'en') => void;
  speak: (text: string, lang?: 'ur' | 'en') => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
}

const PRESET_USERS: Record<UserRole, User> = {
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
  const [currentUser, setCurrentUser] = useState<User | null>(PRESET_USERS.citizen);
  const [language, setLanguage] = useState<'ur' | 'en'>('en');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  useEffect(() => {
    // Check initial online status
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

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

  // Poll notifications
  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await fetch('/api/notifications');
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
        }
      } catch {
        // offline or fallback
      }
    }
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const switchRole = async (role: UserRole) => {
    const user = PRESET_USERS[role];
    setCurrentUser(user);
    setLanguage(user.language_pref);

    // Call mock login to set cookie
    try {
      await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });
    } catch {
      // offline fallback
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  // Young Man Voice Synthesis (Pitch 1.22, Rate 1.05, youthful crisp timbre)
  const speakText = (text: string, lang: 'ur' | 'en' = language) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 1.22; // Energetic, youthful pitch (prevents sounding like an old man)
    utterance.rate = 1.05; // Alert and crisp delivery pace

    const voices = window.speechSynthesis.getVoices();
    if (lang === 'ur') {
      const urVoice = voices.find((v) => v.lang.startsWith('ur') || v.lang.startsWith('hi'));
      if (urVoice) utterance.voice = urVoice;
      utterance.lang = 'ur-PK';
    } else {
      // Select younger male sounding voices
      const youngMaleVoice = voices.find(
        (v) =>
          (v.name.includes('Ryan') ||
            v.name.includes('Guy') ||
            v.name.includes('Natural') ||
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
        setCurrentUser,
        switchRole,
        language,
        setLanguage,
        isOnline,
        setIsOnline,
        notifications,
        unreadCount,
        markNotificationRead,
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
