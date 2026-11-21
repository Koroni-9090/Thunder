'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { MessageSquare, X, Send, Mic, MicOff, Volume2, VolumeX, Sparkles, AlertCircle } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  isUncertain?: boolean;
  timestamp: string;
}

export default function DpiAssistantChat() {
  const { language, speakText, stopSpeaking, isSpeaking } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text:
        language === 'ur'
          ? 'السلام علیکم! میں سہولت ریل کا اے آئی معاون ہوں۔ آپ آواز سے یا لکھ کر امدادی گرانٹ اور ایس ایم ایس کی تصدیق پوچھ سکتے ہیں۔'
          : 'Welcome to SahulatRail! I am your DPI AI Assistant. Tap the mic to speak or ask questions regarding emergency relief claims and scam checks.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // STT: Speech to Text via Web Speech API
  const handleToggleListening = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Please type your query.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'ur' ? 'ur-PK' : 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
          handleSendMessage(transcript);
        }
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query, language }),
      });

      if (!res.ok) throw new Error('Assistant API error');
      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: data.text,
        isUncertain: data.isUncertain,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      // Speak the response using the young man voice
      speakText(data.text, language);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text:
          language === 'ur'
            ? 'میں ابھی جواب دینے میں معذور ہوں۔ براہ کرم سرکاری ہیلپ لائن 8171 پر رابطہ کریں۔'
            : 'I am unable to answer right now due to network limits. Please contact the 8171 emergency helpline.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    language === 'ur' ? 'کیا بغیر ڈیتھ سرٹیفکیٹ بیوہ اپلائی کر سکتی ہے؟' : 'Can a widow apply with name spelling differences?',
    language === 'ur' ? '8171 سے 25 ہزار کا ایس ایم ایس آیا ہے، کیا سچ ہے؟' : 'Is SMS from 0300 asking for Raast PIN real?',
    language === 'ur' ? 'راست پر رقم کب منتقل ہوتی ہے؟' : 'How does Raast instant disbursement work?',
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-bold px-4 py-3 rounded-full shadow-2xl hover:scale-105 transition-all border-2 border-amber-300"
        >
          <MessageSquare className="w-5 h-5 text-slate-950" />
          <span className="text-sm font-extrabold tracking-wide">
            {language === 'ur' ? 'آواز و چیٹ معاون' : 'Voice & DPI AI'}
          </span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
        </button>
      )}

      {isOpen && (
        <div className="w-[360px] sm:w-[420px] h-[550px] bg-slate-900 border border-indigo-900/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-4 border-b border-indigo-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  SahulatRail AI Guide
                  <span className="text-[10px] bg-indigo-800 text-indigo-200 px-1.5 py-0.2 rounded font-mono">
                    gemini-2.5-flash
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  {language === 'ur' ? 'نوجوان مردانہ آواز | غیر یقینی پر معذرت' : 'Young Male Voice • Says "I am not sure" when uncertain'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="p-1.5 rounded-lg bg-amber-400/20 text-amber-300 hover:bg-amber-400/30"
                  title="Stop audio"
                >
                  <VolumeX className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-slate-950/40">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs ${
                    m.sender === 'user'
                      ? 'bg-amber-500 text-slate-950 font-medium rounded-br-none shadow-md'
                      : m.isUncertain
                      ? 'bg-amber-950/40 border border-amber-500/50 text-amber-200 rounded-bl-none'
                      : 'bg-slate-800 text-slate-100 border border-slate-700/60 rounded-bl-none'
                  }`}
                >
                  {m.isUncertain && (
                    <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400 mb-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Uncertainty Notice: "I am not sure"</span>
                    </div>
                  )}
                  <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                </div>
                <div className="flex items-center gap-2 mt-1 px-1">
                  <span className="text-[10px] text-slate-400">{m.timestamp}</span>
                  {m.sender === 'assistant' && (
                    <button
                      onClick={() => speakText(m.text, language)}
                      className="text-slate-400 hover:text-amber-400 transition-colors"
                      title="Read aloud in young male voice"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-400 italic bg-slate-800/40 p-2 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></div>
                Analyzing DPI regulations &amp; checking risk router...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="p-2 bg-slate-900 border-t border-slate-800 flex gap-1.5 overflow-x-auto scrollbar-none">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="text-[11px] whitespace-nowrap bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white px-2.5 py-1 rounded-full border border-slate-700 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input & Voice Controls */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
            <button
              onClick={handleToggleListening}
              className={`p-2.5 rounded-xl border transition-all ${
                isListening
                  ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                  : 'bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-750'
              }`}
              title="Speak in Urdu or English (Web Speech STT)"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={
                language === 'ur'
                  ? 'یہاں سوال لکھیں یا مائیک دبائیں...'
                  : 'Ask DPI rules, scam alerts, or say hello...'
              }
              className="flex-1 bg-slate-800 text-xs text-white rounded-xl px-3 py-2.5 border border-slate-700 focus:outline-none focus:border-amber-400 placeholder:text-slate-500"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300 disabled:opacity-40 transition-opacity font-bold"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
