"use client";

import React, { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Navbar } from "@/components/widgets/Navbar";
import { FeaturedServices } from "@/components/widgets/FeaturedServices";
import { Footer } from "@/components/widgets/Footer";
import { InfoDialogs } from "@/components/widgets/InfoDialogs";
import { DynamicForm } from "@/components/widgets/DynamicForm";
import { TesterHelperDialog } from "@/components/widgets/TesterHelperDialog";
import { ChatBotIcon } from "@/components/widgets/ChatBotIcon";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUp,
  Paperclip,
  Mic,
  MicOff,
  Search,
  FileText,
  CreditCard,
  Building2,
  UserCheck,
  Activity,
  RotateCcw,
  Sparkles,
  Loader2,
  AlertCircle,
  X,
  ChevronRight,
  ChevronDown,
  User as UserIcon,
  MessageSquare,
  Send,
} from "lucide-react";

// Formatted rich text renderer for structured AI output
function renderFormattedSpan(str: string) {
  const parts = str.split(/(\*\*.*?\*\*|\*.*?\*|\[.*?\]\(.*?\))/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-slate-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={i} className="italic text-slate-600 dark:text-slate-400">
          {part.slice(1, -1)}
        </em>
      );
    }
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      return (
        <a
          key={i}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 underline font-medium hover:text-blue-700"
        >
          {linkMatch[1]}
        </a>
      );
    }
    return part;
  });
}

function FormattedMessageText({ text }: { text: string }) {
  if (!text) return null;
  const lines = text.split("\n");

  return (
    <div className="space-y-2 text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }
        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={idx} className="font-bold text-base text-slate-900 dark:text-white pt-1">
              {renderFormattedSpan(trimmed.slice(4))}
            </h4>
          );
        }
        if (trimmed.startsWith("#### ")) {
          return (
            <h5 key={idx} className="font-semibold text-sm text-slate-900 dark:text-slate-100 pt-1">
              {renderFormattedSpan(trimmed.slice(5))}
            </h5>
          );
        }
        if (trimmed.startsWith("* ") || trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="text-blue-500 font-bold text-sm leading-tight mt-0.5">•</span>
              <div className="flex-1 text-slate-700 dark:text-slate-300">
                {renderFormattedSpan(trimmed.slice(2))}
              </div>
            </div>
          );
        }
        return (
          <p key={idx} className="text-slate-700 dark:text-slate-300">
            {renderFormattedSpan(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

export default function HomePage() {
  const [input, setInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Identity");
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [infoModal, setInfoModal] = useState<"howItWorks" | "services" | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isAutoScrollEnabledRef = useRef(true);
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isLoading = status === "submitted" || status === "streaming";
  const hasMessages = messages.length > 0;

  const scrollToBottom = (smooth = true) => {
    if (!chatContainerRef.current) return;
    chatContainerRef.current.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    });
  };

  // Track if user intentionally scrolled up to read earlier text
  const handleChatScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 120;
    isAutoScrollEnabledRef.current = isNearBottom;
    setShowScrollBottomBtn(!isNearBottom);
  };

  // Auto-scroll on content updates / streaming chunks
  useEffect(() => {
    if (hasMessages && isAutoScrollEnabledRef.current && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading, status, hasMessages]);

  // Use ResizeObserver so dynamically expanding elements (streaming text, forms) trigger container auto-scroll
  useEffect(() => {
    if (!hasMessages || !chatContainerRef.current) return;

    const container = chatContainerRef.current;
    const observer = new ResizeObserver(() => {
      if (isAutoScrollEnabledRef.current && container) {
        container.scrollTop = container.scrollHeight;
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [hasMessages]);

  const handleSendPrompt = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    let fullPrompt = trimmed;
    if (attachedFile) {
      fullPrompt = `[Attached Document: ${attachedFile}]\n${trimmed}`;
      setAttachedFile(null);
    }

    isAutoScrollEnabledRef.current = true;
    setShowScrollBottomBtn(false);
    setInput("");
    sendMessage({ parts: [{ type: "text", text: fullPrompt }] } as any);

    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, 50);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendPrompt(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendPrompt(input);
    }
  };

  const handleToggleVoice = () => {
    if (!isRecording) {
      setIsRecording(true);
      const sampleQueries = [
        "How do I apply for a fresh passport online?",
        "How can I update my address or mobile number in Aadhaar card?",
        "Check status of PAN card application online",
        "Book a passport appointment",
      ];
      const randomQuery = sampleQueries[Math.floor(Math.random() * sampleQueries.length)];
      setTimeout(() => {
        setInput(randomQuery);
        setIsRecording(false);
      }, 2000);
    } else {
      setIsRecording(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file.name);
    }
  };

  // Focus textarea when conversation opens
  useEffect(() => {
    if (hasMessages) {
      textareaRef.current?.focus();
    }
  }, [hasMessages]);

  // Suggestion chips by category
  const categoryChips: Record<string, Array<{ icon: any; label: string; prompt: string; color: string }>> = {
    Identity: [
      { icon: FileText, label: "Apply for Passport", prompt: "How do I apply for a fresh passport online?", color: "text-emerald-500" },
      { icon: UserCheck, label: "Aadhaar Update", prompt: "How can I update my address or mobile number in Aadhaar card?", color: "text-blue-500" },
      { icon: CreditCard, label: "PAN Card Status", prompt: "How to check PAN card application status online?", color: "text-purple-500" },
      { icon: Building2, label: "Income Tax Filing", prompt: "Explain the procedure for Income Tax Return (ITR) filing for individuals.", color: "text-amber-500" },
      { icon: Activity, label: "Pension Schemes", prompt: "What are the eligibility criteria and benefits of Atal Pension Yojana (APY)?", color: "text-cyan-500" },
    ],
    Finance: [
      { icon: Building2, label: "Income Tax Filing", prompt: "Explain ITR filing steps and deductions under New Tax Regime.", color: "text-amber-500" },
      { icon: CreditCard, label: "Instant e-PAN", prompt: "How to get an instant e-PAN using Aadhaar e-KYC?", color: "text-purple-500" },
      { icon: Activity, label: "PM Kisan Samman", prompt: "Check PM Kisan 17th installment release status and e-KYC requirement.", color: "text-emerald-500" },
      { icon: Activity, label: "Sukanya Samriddhi", prompt: "What is the interest rate and tenure for Sukanya Samriddhi Account?", color: "text-pink-500" },
    ],
    Legal: [
      { icon: FileText, label: "RTI Application", prompt: "How to file an online Right to Information (RTI) application?", color: "text-blue-500" },
      { icon: Building2, label: "Property Registration", prompt: "What documents are required for land and property registry deed in India?", color: "text-indigo-500" },
      { icon: UserCheck, label: "Legal Heir Certificate", prompt: "How to apply for Legal Heir Certificate online?", color: "text-purple-500" },
    ],
    Education: [
      { icon: FileText, label: "National Scholarship", prompt: "Track National Scholarship Portal (NSP) scheme status and eligibility.", color: "text-amber-500" },
      { icon: Building2, label: "DigiLocker Marksheets", prompt: "How to download verified CBSE 10th and 12th marksheets via DigiLocker?", color: "text-blue-500" },
      { icon: UserCheck, label: "AICTE Student Schemes", prompt: "List top engineering and polytechnic scholarships by AICTE.", color: "text-emerald-500" },
    ],
    Health: [
      { icon: Activity, label: "Ayushman Bharat PM-JAY", prompt: "Check hospital network and coverage for Ayushman Bharat PM-JAY card.", color: "text-emerald-500" },
      { icon: UserCheck, label: "ABHA Health Account", prompt: "How to generate Ayushman Bharat Health Account (ABHA ID)?", color: "text-cyan-500" },
      { icon: FileText, label: "Jan Aushadhi Kendra", prompt: "How to locate nearby PM Jan Aushadhi generic medicine store?", color: "text-rose-500" },
    ],
  };

  const currentChips = categoryChips[selectedCategory] || categoryChips["Identity"];

  return (
    <div className="min-h-screen flex flex-col relative bg-white dark:bg-[#0b0e14] text-slate-900 dark:text-slate-100 selection:bg-blue-500 selection:text-white transition-colors duration-250">
      
      {/* Ambient Glow */}
      <div className="absolute top-0 inset-x-0 h-[640px] hero-ambient-glow pointer-events-none z-0" />

      {/* Top Navigation */}
      <Navbar
        onOpenHowItWorks={() => setInfoModal("howItWorks")}
        onOpenServices={() => setInfoModal("services")}
        onResetChat={() => setMessages([])}
      />

      {/* Main App Canvas */}
      <main className="flex-1 z-10 flex flex-col items-center px-3 sm:px-6 w-full">
        
        {/* ========================================================================= */}
        {/* SCENARIO 1: HERO VIEW (When no conversation is active)                  */}
        {/* ========================================================================= */}
        {!hasMessages ? (
          <section className="w-full max-w-4xl mx-auto pt-8 sm:pt-14 pb-8 flex flex-col items-center text-center animate-in fade-in duration-300">
            
            {/* Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-[46px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15] mb-8 animate-in fade-in duration-300">
              How can I help you today?
            </h1>

            {/* Central Search & AI Chat Box */}
            <div className="w-full max-w-2xl bg-white dark:bg-[#141926] border border-slate-200/90 dark:border-slate-800 rounded-[28px] sm:rounded-[32px] p-4 sm:p-5 shadow-[0_12px_45px_-12px_rgba(0,0,0,0.08)] dark:shadow-[0_16px_50px_-15px_rgba(0,0,0,0.5)] transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500/20 dark:focus-within:ring-indigo-500/30 focus-within:border-blue-400 dark:focus-within:border-slate-700 text-left">
              
              <div className="flex items-center justify-between mb-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50/80 dark:bg-[#1b2333] border border-blue-100 dark:border-slate-700/80 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Assistant</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={2}
                    disabled={isLoading}
                    placeholder="Ask about government services, fill forms, or track applications..."
                    className="w-full bg-transparent text-sm sm:text-[15px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none resize-none leading-relaxed py-1"
                  />

                  {attachedFile && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 mt-1">
                      <Paperclip className="w-3 h-3 text-blue-500" />
                      <span className="truncate max-w-[200px]">{attachedFile}</span>
                      <button
                        type="button"
                        onClick={() => setAttachedFile(null)}
                        className="text-slate-400 hover:text-rose-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {isRecording && (
                    <div className="flex items-center gap-2 text-xs text-rose-500 font-medium animate-pulse py-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>Listening... Speak your query clearly</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/60">
                  <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      aria-label="Attach document"
                      title="Attach government document / ID proof"
                      className="h-8 w-8 rounded-full flex items-center justify-center hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={handleToggleVoice}
                      aria-label={isRecording ? "Stop recording" : "Voice search"}
                      title={isRecording ? "Stop Recording" : "Speak your query"}
                      className={`h-8 w-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        isRecording
                          ? "bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 scale-110"
                          : "hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || (!input.trim() && !attachedFile)}
                    aria-label="Send message"
                    className="h-9 w-9 rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-[#9bb3f7] dark:hover:bg-[#8ea8f7] text-white dark:text-slate-950 flex items-center justify-center transition-all shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="w-full max-w-2xl mt-5 space-y-2">
              <div className="flex flex-wrap items-center justify-center gap-2">
                {currentChips.slice(0, 4).map((chip, idx) => {
                  const IconComponent = chip.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendPrompt(chip.prompt)}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-[#151b27] hover:bg-slate-50 dark:hover:bg-[#1e2638] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-medium shadow-sm transition-all duration-150 active:scale-95 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700"
                    >
                      <IconComponent className={`w-3.5 h-3.5 ${chip.color}`} />
                      <span>{chip.label}</span>
                    </button>
                  );
                })}
              </div>

              {currentChips.length > 4 && (
                <div className="flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => handleSendPrompt(currentChips[4].prompt)}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-[#151b27] hover:bg-slate-50 dark:hover:bg-[#1e2638] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-medium shadow-sm transition-all duration-150 active:scale-95 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700"
                  >
                    {(() => {
                      const IconComponent = currentChips[4].icon;
                      return <IconComponent className={`w-3.5 h-3.5 ${currentChips[4].color}`} />;
                    })()}
                    <span>{currentChips[4].label}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="w-full max-w-2xl mt-6 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                aria-label="Search filter"
                className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151b27] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center justify-center text-xs shadow-sm cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
              </button>

              {["Identity", "Finance", "Legal", "Education", "Health"].map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all shadow-sm cursor-pointer ${
                      isActive
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-md font-semibold"
                        : "bg-white dark:bg-[#151b27] border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setInfoModal("services")}
                className="px-3.5 py-1.5 rounded-full border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#151b27] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-medium shadow-sm flex items-center gap-1 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700"
              >
                <span>See all</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </section>
        ) : (
          /* ========================================================================= */
          /* SCENARIO 2: UNIFIED INTERACTIVE CHAT WORKSPACE (Live Conversation)       */
          /* ========================================================================= */
          <div className="w-full max-w-3xl mx-auto flex flex-col flex-1 pb-4 animate-in fade-in duration-300">
            
            {/* Unified Chat Window Card */}
            <div className="w-full bg-white dark:bg-[#121722] border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-xl overflow-hidden flex flex-col my-4 relative">
              
              {/* Chat Header Bar */}
              <div className="px-5 py-3.5 bg-slate-50/90 dark:bg-[#161c2b] border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm">
                    <ChatBotIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">JanSeva AI Gateway</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Online
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Unified Citizen Public Services & Generative UI Assistant
                    </p>
                  </div>
                </div>

                {/* Reset / New Chat Action */}
                <button
                  type="button"
                  onClick={() => setMessages([])}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1d2536] text-xs text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-900/60 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                  title="Clear conversation and start over"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="font-medium">New Chat</span>
                </button>
              </div>

              {/* Message Stream Body */}
              <div
                ref={chatContainerRef}
                onScroll={handleChatScroll}
                className="p-4 sm:p-6 space-y-6 max-h-[620px] overflow-y-auto overscroll-contain scroll-smooth"
              >
                {messages.map((m: any) => {
                  const isUser = m.role === "user";
                  const hasVisibleContent = m.parts?.some(
                    (p: any) =>
                      (p.type === "text" && p.text?.trim()) ||
                      p.type?.startsWith("tool-") ||
                      p.type === "dynamic-tool"
                  );

                  if (!isUser && !hasVisibleContent && !isLoading) {
                    return null;
                  }

                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-full animate-in fade-in duration-200`}
                    >
                      {/* Avatar & Label */}
                      <div className={`flex items-center gap-2 mb-1.5 px-1 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                        <div
                          className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                            isUser
                              ? "bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400"
                              : "bg-slate-900 dark:bg-[#1f2736] border border-slate-700 text-white"
                          }`}
                        >
                          {isUser ? <UserIcon className="w-3.5 h-3.5" /> : <ChatBotIcon className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                          {isUser ? "You" : "JanSeva AI"}
                        </span>
                      </div>

                      {/* Message Bubble Container */}
                      <div
                        className={`max-w-[94%] sm:max-w-[88%] flex flex-col gap-2.5 ${
                          isUser
                            ? "bg-blue-600 text-white font-medium rounded-2xl rounded-tr-sm px-4 sm:px-5 py-3 text-sm shadow-md"
                            : "bg-slate-50 dark:bg-[#171e2c] border border-slate-200/90 dark:border-slate-800/90 rounded-2xl rounded-tl-sm px-4 sm:px-5 py-4 text-sm text-slate-800 dark:text-slate-200 shadow-sm"
                        }`}
                      >
                        {m.parts?.map((part: any, i: number) => {
                          // Text Rendering
                          if (part.type === "text") {
                            const textContent = part.text ?? "";
                            if (!textContent) return null;
                            if (isUser) {
                              return (
                                <p key={i} className="whitespace-pre-wrap leading-relaxed">
                                  {textContent}
                                </p>
                              );
                            }
                            return <FormattedMessageText key={i} text={textContent} />;
                          }

                          // Tool Rendering
                          const isStandardTool = part.type === "tool-invocation";
                          const toolName = isStandardTool ? part.toolInvocation?.toolName : part.type?.replace("tool-", "");
                          const toolState = isStandardTool ? part.toolInvocation?.state : (part as any).state;
                          const toolResult = isStandardTool ? part.toolInvocation?.result : (part as any).output;

                          // 1. Dynamic Generative Form
                          if (toolName === "createApplicationForm") {
                            if (toolState === "result" || toolResult || toolState === "output-available") {
                              return (
                                <div key={i} className="w-full mt-2">
                                  <DynamicForm result={toolResult} />
                                </div>
                              );
                            }
                            return (
                              <div key={i} className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 text-xs py-2 mt-2">
                                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                <span>Generating dynamic citizen application form...</span>
                              </div>
                            );
                          }

                          // 2. Passport Tracking Output
                          if (toolName === "trackPassport") {
                            if (toolState === "result" || toolResult || toolState === "output-available") {
                              let parsed = toolResult;
                              if (typeof parsed === "string") {
                                try {
                                  parsed = JSON.parse(parsed);
                                } catch {}
                              }

                              if (!parsed || typeof parsed !== "object" || parsed.status === "NEED_INPUT") {
                                return null;
                              }

                              if (parsed.status === "ERROR" || parsed.status === "NOT_FOUND") {
                                return (
                                  <div key={i} className="w-full mt-2 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-700 dark:text-rose-400 text-xs">
                                    <AlertCircle className="w-4 h-4 inline-block mr-1.5 mb-0.5" />
                                    {parsed.message}
                                  </div>
                                );
                              }

                              return (
                                <div key={i} className="w-full mt-2 p-4 bg-emerald-50 dark:bg-[#122119] border border-emerald-200 dark:border-emerald-900/60 rounded-2xl text-emerald-900 dark:text-emerald-100 text-sm shadow-sm space-y-2">
                                  <div className="flex items-center justify-between border-b border-emerald-200/60 dark:border-emerald-800/60 pb-2">
                                    <span className="font-bold font-mono text-emerald-700 dark:text-emerald-400">
                                      {parsed.appId || "Passport Application"}
                                    </span>
                                    <Badge className="bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100 hover:bg-emerald-200 text-[10px]">
                                      {parsed.status}
                                    </Badge>
                                  </div>
                                  <div className="space-y-1 text-xs text-emerald-800/90 dark:text-emerald-200/90">
                                    {parsed.serviceType && (
                                      <p><strong>Service:</strong> {parsed.serviceType}</p>
                                    )}
                                    {parsed.personalDetails && (
                                      <p><strong>Applicant:</strong> {parsed.personalDetails.firstName} {parsed.personalDetails.lastName}</p>
                                    )}
                                    {parsed.appointment?.pskLocation && (
                                      <p><strong>Location:</strong> {parsed.appointment.pskLocation}</p>
                                    )}
                                    {parsed.appointment?.tokenNumber && (
                                      <p><strong>Token:</strong> {parsed.appointment.tokenNumber}</p>
                                    )}
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div key={i} className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 text-xs py-2 mt-2">
                                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                <span>Connecting to Passport Seva portal...</span>
                              </div>
                            );
                          }

                          return null;
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Thinking Skeleton Indicator */}
                {isLoading && (
                  <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 text-xs py-2 px-2 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    <span>Consulting National Public Services Knowledge Base...</span>
                  </div>
                )}

                {/* Global Error Notice */}
                {error && (
                  <div className="flex items-center gap-2.5 p-3 text-xs text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl">
                    <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                    <span>Service gateway temporary timeout. Please retry your inquiry.</span>
                  </div>
                )}
              </div>

              {/* Floating Scroll to Bottom Jump Button */}
              {showScrollBottomBtn && (
                <div className="absolute bottom-24 right-6 flex justify-center pointer-events-none z-20">
                  <button
                    type="button"
                    onClick={() => {
                      isAutoScrollEnabledRef.current = true;
                      setShowScrollBottomBtn(false);
                      scrollToBottom(true);
                    }}
                    className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 text-white dark:bg-blue-600 dark:hover:bg-blue-500 shadow-xl text-xs font-semibold backdrop-blur-sm transition-all duration-200 animate-in fade-in zoom-in-95 cursor-pointer hover:scale-105 active:scale-95 border border-slate-700/50"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                    <span>Scroll to bottom</span>
                  </button>
                </div>
              )}

              {/* Integrated Bottom Input Bar (Inside Chat Window) */}
              <div className="p-3 sm:p-4 bg-slate-50/70 dark:bg-[#161c2b] border-t border-slate-200/80 dark:border-slate-800/80">
                
                {/* Quick Follow-up Chips Carousel */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-1 text-xs no-scrollbar">
                  {[
                    "Apply for Passport",
                    "Aadhaar Update",
                    "Instant e-PAN",
                    "Track Application",
                    "Income Tax Filing",
                  ].map((quickPrompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendPrompt(quickPrompt)}
                      className="px-2.5 py-1 rounded-full bg-white dark:bg-[#1e2638] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 text-[11px] whitespace-nowrap transition-colors cursor-pointer active:scale-95 shadow-sm"
                    >
                      {quickPrompt}
                    </button>
                  ))}
                </div>

                {/* Input Controls */}
                <form
                  onSubmit={handleSubmit}
                  className="bg-white dark:bg-[#121722] border border-slate-200 dark:border-slate-700/90 rounded-2xl p-2.5 sm:p-3 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 transition-all"
                >
                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      rows={2}
                      disabled={isLoading}
                      placeholder="Ask follow-up question, request official documents, or fill forms..."
                      className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none resize-none leading-relaxed py-1"
                    />

                    {attachedFile && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 mb-1">
                        <Paperclip className="w-3 h-3 text-blue-500" />
                        <span className="truncate max-w-[180px]">{attachedFile}</span>
                        <button
                          type="button"
                          onClick={() => setAttachedFile(null)}
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {isRecording && (
                      <div className="flex items-center gap-2 text-xs text-rose-500 font-medium animate-pulse py-0.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span>Listening... Speak your query clearly</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/60 mt-1">
                    <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleFileUpload}
                        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        aria-label="Attach document"
                        title="Attach government document / ID proof"
                        className="h-7 w-7 rounded-full flex items-center justify-center hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={handleToggleVoice}
                        aria-label={isRecording ? "Stop recording" : "Voice search"}
                        title={isRecording ? "Stop Recording" : "Speak your query"}
                        className={`h-7 w-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                          isRecording
                            ? "bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 scale-110"
                            : "hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || (!input.trim() && !attachedFile)}
                      aria-label="Send message"
                      className="h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-[#9bb3f7] dark:hover:bg-[#8ea8f7] text-white dark:text-slate-950 flex items-center justify-center transition-all shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                      )}
                    </button>
                  </div>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* FEATURED SERVICES SECTION (Always accessible below) */}
        <FeaturedServices onSelectService={handleSendPrompt} />

      </main>

      {/* FOOTER */}
      <Footer />

      {/* Info Dialogs for How it works & Services */}
      <InfoDialogs
        type={infoModal}
        onClose={() => setInfoModal(null)}
        onSelectPrompt={handleSendPrompt}
      />

      {/* Tester Helper for Hackathon Evaluation */}
      <TesterHelperDialog onSelectPrompt={handleSendPrompt} />

    </div>
  );
}