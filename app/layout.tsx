import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../components/AuthContext';
import Navbar from '../components/Navbar';
import DpiAssistantChat from '../components/DpiAssistantChat';

export const metadata: Metadata = {
  title: 'SahulatRail: AI on Public Rails | Team Thunder',
  description:
    'Full-stack prototype SaaS web application for Digital Public Infrastructure (DPI), emergency relief grants, scam SMS verification, and low-literacy voice interface for FAST-NUCES Karachi AI Hackathon.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#1E1B4B" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 w-full">{children}</main>
          <DpiAssistantChat />
          <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-6 px-4 mt-12 text-center">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span className="font-bold text-white">⚡ SahulatRail by Team Thunder</span> — Built for Coder&apos;s Cup &apos;26 AI Hackathon (FAST-NUCES Karachi)
              </div>
              <div className="text-[11px] text-slate-400">
                PROTOTYPE ONLY — SIMULATED DPI SERVICES (MOCK NADRA &amp; RAAST). NO REAL PERSONAL DATA.
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
