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
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Click outside to close chat window
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isOpen &&
        chatContainerRef.current &&
        !chatContainerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

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

  // When language switches, add a friendly localized prompt
  useEffect(() => {
    setMessages((prev) => [
      ...prev,
      {
        id: `lang-switch-${Date.now()}`,
        sender: 'assistant',
        text:
          language === 'ur'
            ? 'زبان اردو منتخب ہو گئی ہے۔ میں اردو میں سن اور بول سکتا ہوں۔ آپ کیا جاننا چاہتے ہیں؟'
            : 'Language switched to English. You can speak or type your question.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // STT: Speech to Text via Web Speech API in Urdu or English
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
      // Speak the response using the dual-language voice (Urdu / English)
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
    language === 'ur' ? 'کیا بیوہ نام کے ہجے کے فرق کے ساتھ اپلائی کر سکتی ہے؟' : 'Can a widow apply with name spelling differences?',
    language === 'ur' ? '0301 سے 25 ہزار کا ایس ایم ایس آیا ہے، کیا سچ ہے؟' : 'Is SMS from 0300 asking for Raast PIN real?',
    language === 'ur' ? 'راست پر رقم کی منتقلی کیسے ہوتی ہے؟' : 'How does Raast instant disbursement work?',
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40" ref={chatContainerRef}>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-[#859114] hover:bg-[#6F7910] text-white font-bold px-4 py-3 rounded-lg shadow-2xl hover:scale-105 transition-all border border-[#5C640E]"
        >
          <MessageSquare className="w-5 h-5 text-white" />
          <span className="text-sm font-extrabold tracking-wide">
            {language === 'ur' ? 'آواز و چیٹ معاون' : 'Voice & DPI AI'}
          </span>
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></span>
        </button>
      )}

      {isOpen && (
        <div className="w-[360px] sm:w-[420px] h-[540px] bg-[#383737] border border-[#616060] rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 text-white">
          {/* Header */}
          <div className="bg-[#859114] p-3.5 border-b border-[#6F7910] flex items-center justify-between text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-[#6F7910] border border-white/30 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  SahulatRail AI Guide
                  <span className="text-[10px] bg-black/25 text-white px-1.5 py-0.2 rounded font-mono">
                    gemini-2.5-flash
                  </span>
                </h3>
                <p className="text-[11px] text-white/90">
                  {language === 'ur' ? 'اردو اور انگریزی آواز | غیر یقینی پر معذرت' : 'Urdu & English Voice • Uncertainty Safe'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="p-1.5 rounded-md bg-black/20 text-white hover:bg-black/30"
                  title="Stop audio"
                >
                  <VolumeX className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-md text-white/80 hover:text-white hover:bg-black/20"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-[#2E2D2D]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-md px-3.5 py-2.5 text-xs ${
                    m.sender === 'user'
                      ? 'bg-[#859114] text-white font-medium shadow-sm'
                      : m.isUncertain
                      ? 'bg-amber-950/80 border border-amber-500/60 text-amber-200 font-medium'
                      : 'bg-[#4A4949] text-white border border-[#616060] shadow-sm'
                  }`}
                >
                  {m.isUncertain && (
                    <div className="flex items-center gap-1 text-[11px] font-bold text-amber-300 mb-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{language === 'ur' ? 'غیر یقینی کی اطلاع: میں مکمل پراعتماد نہیں ہوں' : 'Uncertainty Notice: "I am not sure"'}</span>
                    </div>
                  )}
                  <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                </div>
                <div className="flex items-center gap-2 mt-1 px-1">
                  <span className="text-[10px] text-[#A3A3A3]">{m.timestamp}</span>
                  {m.sender === 'assistant' && (
                    <button
                      onClick={() => speakText(m.text, language)}
                      className="text-[#D1D5DB] hover:text-[#FEF08A] transition-colors"
                      title="Read aloud"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-[#D1D5DB] italic bg-[#383737] p-2 rounded-md border border-[#616060]">
                <div className="w-2 h-2 rounded-full bg-[#859114] animate-ping"></div>
                Analyzing DPI regulations &amp; checking risk router...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="p-2 bg-[#2E2D2D] border-t border-[#616060] flex gap-1.5 overflow-x-auto scrollbar-none">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="text-[11px] whitespace-nowrap bg-[#383737] hover:bg-[#4A4949] text-white px-2.5 py-1 rounded-md border border-[#616060] transition-colors font-medium shadow-sm"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input & Voice Controls */}
          <div className="p-3 bg-[#383737] border-t border-[#616060] flex items-center gap-2">
            <button
              onClick={handleToggleListening}
              className={`p-2.5 rounded-md border transition-all ${
                isListening
                  ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                  : 'bg-[#2A2929] text-white border-[#616060] hover:bg-[#4A4949] shadow-sm'
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
                  ? 'یہاں اردو یا انگریزی میں سوال لکھیں...'
                  : 'Ask DPI rules, scam alerts, or say hello...'
              }
              className="flex-1 bg-[#2A2929] text-xs text-white rounded-md px-3 py-2.5 border border-[#616060] focus:outline-none focus:border-[#859114] placeholder:text-[#A3A3A3] shadow-inner"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-md bg-[#859114] text-white hover:bg-[#6F7910] disabled:opacity-40 transition-opacity font-bold shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
