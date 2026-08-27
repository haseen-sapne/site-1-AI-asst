"use client";

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import React, { useState, useRef, useEffect } from 'react';
import { ChallanCard } from "@/components/widgets/ChallanCard";
import { AadhaarStatusCard } from "@/components/widgets/AadhaarStatusCard";
import { PanCardWidget } from "@/components/widgets/PanCardWidget";
import { ChatBotIcon } from "@/components/widgets/ChatBotIcon";
import { DarkModeToggle } from "@/components/widgets/DarkModeToggle";
import { TesterHelperDialog } from "@/components/widgets/TesterHelperDialog";
import {
  Send,
  User as UserIcon,
  MoreVertical,
  Loader2,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

export default function ChatPage() {
  const [input, setInput] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  const handleSendPrompt = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    setInput('');
    sendMessage({ parts: [{ type: 'text', text: trimmed }] } as any);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendPrompt(input);
  };

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-screen w-full max-w-4xl mx-auto bg-[#f8fafc] dark:bg-[#181e28] text-slate-900 dark:text-slate-100 transition-colors duration-200 select-none md:border-x border-slate-200/80 dark:border-slate-800/80">
      
      {/* Top Navbar */}
      <header className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-[#181e28]/95 backdrop-blur-md z-30 flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Ashoka Lion Emblem Badge */}
          <div className="h-9 w-9 rounded-full bg-[#1e2430] dark:bg-[#232a37] border border-slate-700/60 flex items-center justify-center text-slate-100 shadow-md">
            <ChatBotIcon className="w-5 h-5 text-slate-100" />
          </div>

          <div>
            <h1 className="font-bold text-slate-900 dark:text-white text-[15px] tracking-tight leading-none">
              JanSeva AI
            </h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
                ONLINE
              </span>
            </div>
          </div>
        </div>

        {/* Top Right Controls: Dark Mode Button + Menu */}
        <div className="flex items-center gap-2 relative">
          {/* Dark Mode Toggle Button */}
          <DarkModeToggle />

          {/* Three Dots Menu Button */}
          <div className="relative">
            <button
              type="button"
              id="top-menu-btn"
              onClick={() => setShowMenu(!showMenu)}
              aria-label="Menu options"
              className="h-9 w-9 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#202735] border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    setMessages([]);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear Conversation</span>
                </button>
                <div className="border-t border-slate-200 dark:border-slate-700/60 my-1" />
                <div className="px-4 py-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                  JanSeva AI • Citizen Public Gateway
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Message Stream */}
      <main className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-6">
        
        {/* Initial Assistant Welcome Bubble with Suggestion Chips (Always shown at top) */}
        <div className="flex flex-col gap-3 max-w-[90%] md:max-w-[80%] animate-in fade-in duration-300">
          <div className="flex items-center gap-2 mb-0.5">
            <div className="h-6 w-6 rounded-full bg-[#1e2430] dark:bg-[#232a37] border border-slate-700/60 flex items-center justify-center text-slate-200 shadow-sm flex-shrink-0">
              <ChatBotIcon className="w-3.5 h-3.5 text-slate-100" />
            </div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              JanSeva AI
            </span>
          </div>

          <div className="bg-white dark:bg-[#242b38] border border-slate-200/90 dark:border-slate-700/50 rounded-2xl rounded-tl-sm px-5 py-4 text-[13.5px] text-slate-800 dark:text-slate-200 leading-relaxed shadow-sm">
            Welcome to <strong>JanSeva AI</strong> — your official Indian public service gateway. How can I assist you today?
          </div>

          {/* Quick Action Chips */}
          <div className="flex flex-wrap gap-2 pt-1 pl-1">
            <button
              type="button"
              onClick={() => handleSendPrompt("Check Traffic Fines")}
              className="rounded-full border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-[#242b38]/70 hover:bg-slate-100 dark:hover:bg-[#2e3748] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-4 py-1.5 text-xs font-medium transition-all shadow-sm cursor-pointer active:scale-95"
            >
              Check Traffic Fines
            </button>

            <button
              type="button"
              onClick={() => handleSendPrompt("Check my Aadhaar status")}
              className="rounded-full border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-[#242b38]/70 hover:bg-slate-100 dark:hover:bg-[#2e3748] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-4 py-1.5 text-xs font-medium transition-all shadow-sm cursor-pointer active:scale-95"
            >
              Aadhaar Status
            </button>

            <button
              type="button"
              onClick={() => handleSendPrompt("PAN Card Info")}
              className="rounded-full border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-[#242b38]/70 hover:bg-slate-100 dark:hover:bg-[#2e3748] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-4 py-1.5 text-xs font-medium transition-all shadow-sm cursor-pointer active:scale-95"
            >
              PAN Card Info
            </button>
          </div>
        </div>

        {/* Dynamic Messages Loop */}
        {messages.map((m: any) => {
          const isUser = m.role === 'user';
          const hasVisibleContent = m.parts?.some(
            (p: any) =>
              (p.type === 'text' && p.text?.trim()) ||
              p.type?.startsWith('tool-') ||
              p.type === 'dynamic-tool'
          );

          if (!isUser && !hasVisibleContent && !isLoading) {
            return null;
          }

          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full animate-in fade-in duration-200`}
            >
              {/* Message Header (Label + Avatar) */}
              <div className={`flex items-center gap-2 mb-1.5 px-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                <div
                  className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                    isUser
                      ? 'bg-[#9bb3f7]/20 border border-[#9bb3f7]/40 text-[#4361ee] dark:text-[#9bb3f7]'
                      : 'bg-[#1e2430] dark:bg-[#232a37] border border-slate-700/60 text-slate-100'
                  }`}
                >
                  {isUser ? (
                    <UserIcon className="w-3.5 h-3.5" />
                  ) : (
                    <ChatBotIcon className="w-3.5 h-3.5 text-slate-100" />
                  )}
                </div>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {isUser ? 'You' : 'JanSeva AI'}
                </span>
              </div>

              {/* Message Content Bubble */}
              <div
                className={`max-w-[90%] md:max-w-[80%] flex flex-col gap-2.5 ${
                  isUser
                    ? 'bg-[#9bb3f7] text-slate-950 font-medium rounded-2xl rounded-tr-sm px-5 py-3 text-sm shadow-md'
                    : 'bg-white dark:bg-[#242b38] border border-slate-200/90 dark:border-slate-700/50 rounded-2xl rounded-tl-sm px-5 py-3.5 text-[13.5px] text-slate-800 dark:text-slate-200 leading-relaxed shadow-sm'
                }`}
              >
                {/* Message Parts */}
                {m.parts?.map((part: any, i: number) => {
                  if (part.type === 'step-start') return null;

                  // Text part
                  if (part.type === 'text') {
                    const textContent = part.text ?? '';
                    if (!textContent) return null;
                    return (
                      <p key={i} className="whitespace-pre-wrap leading-relaxed">
                        {textContent}
                      </p>
                    );
                  }

                  // Tool: checkTrafficFines
                  if (part.type === 'tool-checkTrafficFines') {
                    const { state } = part;
                    if (state === 'input-streaming' || state === 'input-available') {
                      return (
                        <div key={i} className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 text-xs py-2">
                          <Loader2 className="w-4 h-4 animate-spin text-[#9bb3f7]" />
                          <span>Searching Parivahan Vahan & Challan Registry...</span>
                        </div>
                      );
                    }
                    if (state === 'output-available') {
                      return (
                        <div key={i} className="w-full">
                          <ChallanCard result={part.output} />
                        </div>
                      );
                    }
                  }

                  // Tool: checkAadhaarStatus
                  if (part.type === 'tool-checkAadhaarStatus') {
                    const { state } = part;
                    if (state === 'input-streaming' || state === 'input-available') {
                      return (
                        <div key={i} className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 text-xs py-2">
                          <Loader2 className="w-4 h-4 animate-spin text-[#9bb3f7]" />
                          <span>Authenticating with UIDAI Portal Gateway...</span>
                        </div>
                      );
                    }
                    if (state === 'output-available') {
                      return (
                        <div key={i} className="w-full">
                          <AadhaarStatusCard result={part.output} />
                        </div>
                      );
                    }
                  }

                  // Tool: checkPanInfo
                  if (part.type === 'tool-checkPanInfo') {
                    const { state } = part;
                    if (state === 'input-streaming' || state === 'input-available') {
                      return (
                        <div key={i} className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 text-xs py-2">
                          <Loader2 className="w-4 h-4 animate-spin text-[#9bb3f7]" />
                          <span>Querying NSDL & Income Tax Department...</span>
                        </div>
                      );
                    }
                    if (state === 'output-available') {
                      return (
                        <div key={i} className="w-full">
                          <PanCardWidget result={part.output} />
                        </div>
                      );
                    }
                  }

                  return null;
                })}

                {/* Assistant Loading Dots */}
                {!isUser && isLoading && !hasVisibleContent && (
                  <div className="flex gap-1.5 items-center h-4 py-2">
                    <span className="w-2 h-2 bg-[#9bb3f7] rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 bg-[#9bb3f7] rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 bg-[#9bb3f7] rounded-full animate-bounce" />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Global error notification */}
        {error && (
          <div className="flex items-center gap-2.5 p-3 text-xs text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl max-w-md mx-auto">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <span>Connection issue with Public Gateway. Please retry.</span>
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      {/* Bottom Floating Input Capsule */}
      <footer className="px-4 md:px-6 pb-4 pt-2 bg-[#f8fafc] dark:bg-[#181e28] flex-shrink-0">
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-[#212836] border border-slate-200 dark:border-slate-700/80 rounded-full px-4 py-2 flex items-center gap-2 shadow-lg transition-all focus-within:border-slate-400 dark:focus-within:border-slate-500 focus-within:ring-2 focus-within:ring-[#9bb3f7]/20"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your query here..."
            disabled={isLoading}
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none px-2 font-normal"
          />

          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            aria-label="Send message"
            className="h-8 w-8 rounded-full bg-[#9bb3f7] hover:bg-[#8ea8f7] text-slate-950 flex items-center justify-center transition-all flex-shrink-0 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
            ) : (
              <Send className="w-3.5 h-3.5 text-slate-950 fill-current translate-x-px" />
            )}
          </button>
        </form>

        <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 mt-2 font-normal">
          JanSeva AI can make mistakes. Verify important information.
        </p>
      </footer>

      {/* Tester Helper for quick mock test data */}
      <TesterHelperDialog onSelectPrompt={handleSendPrompt} />
    </div>
  );
}