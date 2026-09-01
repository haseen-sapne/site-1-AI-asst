"use client";

import React, { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { InfoDialogs } from "@/components/widgets/InfoDialogs";
import { DynamicForm } from "@/components/widgets/DynamicForm";
import { PaymentWidget } from "@/components/widgets/PaymentWidget";
import { TesterHelperDialog } from "@/components/widgets/TesterHelperDialog";
import { DarkModeToggle } from "@/components/widgets/DarkModeToggle";
import { ChatBotIcon } from "@/components/widgets/ChatBotIcon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ArrowUp,
  FileText,
  CreditCard,
  CheckCircle2,
  Car,
  Search,
  RotateCcw,
  Sparkles,
  Loader2,
  AlertCircle,
  ChevronDown,
  User as UserIcon,
  ExternalLink,
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
    <div className="space-y-2 text-slate-800 dark:text-slate-200 text-[15px] leading-relaxed">
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
  const [infoModal, setInfoModal] = useState<"howItWorks" | "services" | "aboutUs" | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isAutoScrollEnabledRef = useRef(true);
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);
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

  // Track if user intentionally scrolled up
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

  // Use ResizeObserver for dynamic height updates
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

    isAutoScrollEnabledRef.current = true;
    setShowScrollBottomBtn(false);
    setInput("");
    sendMessage({ parts: [{ type: "text", text: trimmed }] } as any);

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

  // Focus textarea when conversation opens
  useEffect(() => {
    if (hasMessages) {
      textareaRef.current?.focus();
    }
  }, [hasMessages]);

  // Focused quick suggestion chips
  const quickChips = [
    {
      icon: FileText,
      label: "Apply for Passport",
      prompt: "I want to apply for a fresh passport",
      color: "text-emerald-500",
    },
    {
      icon: Search,
      label: "Passport Application Status",
      prompt: "Track passport application APP-2026-145351",
      color: "text-blue-500",
    },
    {
      icon: Car,
      label: "Check Traffic Fines",
      prompt: "Check traffic fines for MH02CD5678",
      color: "text-amber-500",
    },
    {
      icon: Sparkles,
      label: "Passport Fees & Rules",
      prompt: "What is the fee and document requirement for a fresh 36-page passport?",
      color: "text-purple-500",
    },
  ];

  return (
    <div className={`h-[100dvh] flex flex-col relative bg-white dark:bg-[#0b0e14] text-slate-900 dark:text-slate-100 selection:bg-blue-500 selection:text-white transition-colors duration-250 ${hasMessages ? "overflow-hidden" : "overflow-y-auto"}`}>
      
      {/* Ambient Glow */}
      <div className="absolute top-0 inset-x-0 h-[640px] hero-ambient-glow pointer-events-none z-0" />

      {/* ========================================================================= */}
      {/* INLINE HEADER (Merged Navbar)                                            */}
      {/* ========================================================================= */}
      <header className="shrink-0 sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 dark:bg-[#0b0e14]/80 border-b border-slate-200/60 dark:border-slate-800/60 transition-colors duration-250">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo & Title */}
          <button
            type="button"
            onClick={() => setMessages([])}
            className="flex items-center gap-2.5 group cursor-pointer focus:outline-none"
            aria-label="Janseva AI Home"
          >
            <div className="w-7 h-7 rounded-xl bg-blue-600 dark:bg-blue-600 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <ChatBotIcon className="w-4 h-4 text-white" />
            </div>

            <div className="text-left">
              <span className="text-[17px] font-bold tracking-tight text-slate-900 dark:text-white block leading-none">
                Janseva AI
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                ● Gateway Online
              </span>
            </div>
          </button>

          {/* Navigation Links & Controls */}
          <div className="flex items-center gap-4">
            <nav className="hidden sm:flex items-center gap-6 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
              <button
                type="button"
                onClick={() => setInfoModal("howItWorks")}
                className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                How it works
              </button>
              <button
                type="button"
                onClick={() => setInfoModal("services")}
                className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Services
              </button>
              <button
                type="button"
                onClick={() => setInfoModal("aboutUs")}
                className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                About Us
              </button>
            </nav>

            {/* Dark Mode Switch Button */}
            <DarkModeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={`flex-1 min-h-0 z-10 flex flex-col items-center px-3 sm:px-6 w-full ${hasMessages ? "overflow-hidden" : ""}`}>
        
        {/* ========================================================================= */}
        {/* SCENARIO 1: HERO VIEW (When no conversation is active)                  */}
        {/* ========================================================================= */}
        {!hasMessages ? (
          <section className="w-full max-w-4xl mx-auto pt-10 sm:pt-16 pb-12 flex flex-col items-center text-center animate-in fade-in duration-300">
            
            {/* Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-[46px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15] mb-8 animate-in fade-in duration-300">
              How can I help you today?
            </h1>

            {/* Central Search & AI Chat Box */}
            <div className="w-full max-w-[762px] bg-white dark:bg-[#141926] border border-slate-200/90 dark:border-slate-800 rounded-[28px] sm:rounded-[32px] p-4 sm:p-5 shadow-[0_12px_45px_-12px_rgba(0,0,0,0.08)] dark:shadow-[0_16px_50px_-15px_rgba(0,0,0,0.5)] transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500/20 dark:focus-within:ring-indigo-500/30 focus-within:border-blue-400 dark:focus-within:border-slate-700 text-left">
              
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={2}
                    disabled={isLoading}
                    placeholder="Ask about passport applications, traffic fines, or track records..."
                    className="w-full bg-transparent text-[15px] sm:text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none resize-none leading-relaxed py-1"
                  />
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/60">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                    JanSeva AI • Unified Public Service Gateway
                  </span>

                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
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

            {/* Focused Quick Suggestion Chips */}
            <div className="w-full max-w-[772px] mt-6 flex flex-wrap items-center justify-center gap-2.5">
              {quickChips.map((chip, idx) => {
                const IconComponent = chip.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendPrompt(chip.prompt)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-[#151b27] hover:bg-slate-50 dark:hover:bg-[#1e2638] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-medium shadow-sm transition-all duration-150 active:scale-95 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700"
                  >
                    <IconComponent className={`w-3.5 h-3.5 ${chip.color}`} />
                    <span>{chip.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Direct Microservice Portals (Site 2 & Site 3) */}
            <div className="w-full max-w-[762px] mt-4 flex flex-wrap items-center justify-center gap-3 pt-1">
              <a
                href="https://site-2-passportseva.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200/80 dark:border-blue-800/60 bg-blue-50/70 dark:bg-[#131d2e] hover:bg-blue-100/80 dark:hover:bg-[#1a2840] text-blue-800 dark:text-blue-200 hover:text-blue-900 dark:hover:text-white text-xs font-medium shadow-sm transition-all duration-150 active:scale-95 group cursor-pointer hover:border-blue-300 dark:hover:border-blue-600"
                title="Open Site 2: Passport Seva in a new tab"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                <span>Site 2: Passport Seva</span>
                <ExternalLink className="w-3 h-3 text-blue-500/80 dark:text-blue-400/80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              <a
                href="https://site-3-parivahan.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-200/80 dark:border-amber-800/60 bg-amber-50/70 dark:bg-[#231d15] hover:bg-amber-100/80 dark:hover:bg-[#2f271a] text-amber-800 dark:text-amber-200 hover:text-amber-900 dark:hover:text-white text-xs font-medium shadow-sm transition-all duration-150 active:scale-95 group cursor-pointer hover:border-amber-300 dark:hover:border-amber-600"
                title="Open Site 3: Parivahan Portal in a new tab"
              >
                <Car className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
                <span>Site 3: Parivahan Portal</span>
                <ExternalLink className="w-3 h-3 text-amber-500/80 dark:text-amber-400/80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </section>
        ) : (
          /* ========================================================================= */
          /* SCENARIO 2: LIVE CONVERSATION WORKSPACE                                   */
          /* ========================================================================= */
          <div className="w-full max-w-[848px] mx-auto flex flex-col flex-1 min-h-0 py-2 sm:py-3 animate-in fade-in duration-300">
            
            {/* Unified Chat Window Card */}
            <div className="w-full h-full min-h-0 bg-white dark:bg-[#121722] border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-xl overflow-hidden flex flex-col relative">
              
              {/* Chat Header Bar */}
              <div className="shrink-0 px-5 py-3 bg-slate-50/90 dark:bg-[#161c2b] border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
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
                className="flex-1 min-h-0 p-4 sm:p-6 space-y-6 overflow-y-auto overscroll-contain scroll-smooth"
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
                            ? "bg-blue-600 dark:bg-[#9bb3f7] text-white dark:text-slate-950 font-medium rounded-2xl rounded-tr-sm px-4 sm:px-5 py-3 text-[15px] shadow-md"
                            : "bg-slate-50 dark:bg-[#171e2c] border border-slate-200/90 dark:border-slate-800/90 rounded-2xl rounded-tl-sm px-4 sm:px-5 py-4 text-[15px] text-slate-800 dark:text-slate-200 shadow-sm"
                        }`}
                      >
                        {m.parts?.map((part: any, i: number) => {
                          // 1. Text Rendering
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

                          // 2. Normalize Tool Data
                          const isStandardTool = part.type === "tool-invocation";
                          const toolName = isStandardTool ? part.toolInvocation?.toolName : part.type?.replace("tool-", "");
                          const toolState = isStandardTool ? part.toolInvocation?.state : (part as any).state;
                          const toolArgs = isStandardTool ? part.toolInvocation?.args : (part as any).args;
                          const toolResult = isStandardTool ? part.toolInvocation?.result : (part as any).output;
                          const toolData = toolResult || toolArgs;

                          // 3. Payment Gateway Generator
                          if (toolName === "initiateChallanPayment") {
                            if (toolState === "result" || toolData || toolState === "output-available") {
                              return <PaymentWidget key={i} result={toolData} />;
                            }
                            return (
                              <div key={i} className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 text-xs py-2 mt-2">
                                <Loader2 className="w-4 h-4 animate-spin text-blue-500 dark:text-[#9bb3f7]" />
                                <span>Initializing Secure Payment Gateway...</span>
                              </div>
                            );
                          }

                          // 4. Dynamic Generative Form (Modal Dialog Overlay)
                          if (toolName === "createApplicationForm") {
                            if (toolState === "result" || toolResult || toolState === "output-available") {
                              return (
                                <div key={i} className="w-full mt-2">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button className="w-full bg-[#9bb3f7] hover:bg-[#8ea8f7] text-slate-950 font-bold py-2.5 rounded-xl shadow-sm cursor-pointer transition flex items-center justify-center gap-2 text-sm">
                                        <span>📝 Fill Passport Application Form</span>
                                      </Button>
                                    </DialogTrigger>

                                    <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto bg-slate-50 dark:bg-[#0b101a] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-3xl p-6">
                                      <DialogHeader>
                                        <DialogTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                                          Passport Application
                                        </DialogTitle>
                                        <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                                          Please verify and complete your application details below.
                                        </DialogDescription>
                                      </DialogHeader>

                                      <div className="mt-3">
                                        <DynamicForm result={toolResult} />
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              );
                            }
                            return (
                              <div key={i} className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 text-xs py-2 mt-2">
                                <Loader2 className="w-4 h-4 animate-spin text-blue-500 dark:text-[#9bb3f7]" />
                                <span>Generating dynamic citizen application form...</span>
                              </div>
                            );
                          }

                          // 5. Passport Tracking Output
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
                                <Loader2 className="w-4 h-4 animate-spin text-blue-500 dark:text-[#9bb3f7]" />
                                <span>Connecting to Passport Seva portal...</span>
                              </div>
                            );
                          }

                          // 6. Knowledge Base Search
                          if (toolName === "searchKnowledgeBase") {
                            if (toolState === "result" || toolResult || toolState === "output-available") {
                              return null;
                            }
                            return (
                              <div key={i} className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 text-xs py-2 mt-2">
                                <Loader2 className="w-4 h-4 animate-spin text-blue-500 dark:text-[#9bb3f7]" />
                                <span>Searching official government rulebooks...</span>
                              </div>
                            );
                          }

                          // 7. e-Challan / Traffic Fines Output
                          if (toolName === "checkTrafficFines") {
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

                              if (parsed.status === "ERROR") {
                                return (
                                  <div key={i} className="w-full mt-2 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-lg text-rose-700 dark:text-rose-400 text-xs">
                                    <AlertCircle className="w-4 h-4 inline-block mr-1.5 mb-0.5" />
                                    {parsed.message || "Unable to reach the Parivahan database at this time."}
                                  </div>
                                );
                              }

                              if (parsed.status === "NOT_FOUND") {
                                return (
                                  <div key={i} className="w-full mt-2 p-4 bg-emerald-50 dark:bg-[#1a2721] border border-emerald-200 dark:border-emerald-900/60 rounded-xl text-emerald-900 dark:text-emerald-100 text-sm shadow-sm text-center">
                                    <CheckCircle2 className="w-7 h-7 mx-auto mb-2 text-emerald-500" />
                                    <p className="font-bold">No Pending Fines!</p>
                                    <p className="text-xs mt-1 text-emerald-700 dark:text-emerald-300">
                                      Vehicle <span className="font-mono font-semibold">{parsed.vehicleNo || parsed.vehicle?.vehicleNo}</span> has a clean record.
                                    </p>
                                  </div>
                                );
                              }

                              // Render the Vehicle & Challan Ticket Cards
                              const vehNo = parsed.vehicle?.vehicleNo || parsed.vehicleNo || "Vehicle";
                              const owner = parsed.vehicle?.ownerName || "Registered Owner";
                              const vehicleClass = parsed.vehicle?.vehicleClass;
                              const fuelType = parsed.vehicle?.fuelType;
                              const challanList = Array.isArray(parsed.challans) ? parsed.challans : [];

                              return (
                                <div key={i} className="w-full mt-2 space-y-3">
                                  <div className="p-3.5 bg-slate-100 dark:bg-[#1e2430] rounded-xl border border-slate-200 dark:border-slate-700/80 flex justify-between items-center shadow-sm">
                                    <div>
                                      <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Vehicle</p>
                                      <p className="font-bold text-xs text-slate-800 dark:text-slate-200 mt-0.5">{owner}</p>
                                      {(vehicleClass || fuelType) && (
                                        <div className="flex gap-1 mt-1">
                                          {vehicleClass && <span className="text-[9px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded">{vehicleClass}</span>}
                                          {fuelType && <span className="text-[9px] bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 px-1.5 py-0.5 rounded">{fuelType}</span>}
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Registration</p>
                                      <span className="font-mono font-bold text-xs bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-800/60 inline-block mt-0.5">
                                        {vehNo}
                                      </span>
                                    </div>
                                  </div>

                                  {challanList.map((challan: any, ci: number) => {
                                    const isPaid = challan.status === "PAID";
                                    const isDisposed = challan.status === "DISPOSED";
                                    const badgeColor = isPaid
                                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900"
                                      : isDisposed
                                      ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                                      : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900";

                                    const barColor = isPaid ? "bg-emerald-500" : isDisposed ? "bg-slate-400" : "bg-rose-500";

                                    return (
                                      <div key={challan.challanId || `ch-${ci}`} className="p-4 bg-white dark:bg-[#1e2430] border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-sm relative overflow-hidden">
                                        <div className={`absolute top-0 left-0 w-1.5 h-full ${barColor}`}></div>
                                        <div className="flex justify-between items-start mb-2 pl-1">
                                          <div>
                                            <p className={`font-bold text-sm ${isPaid ? "text-emerald-600 dark:text-emerald-400" : isDisposed ? "text-slate-600 dark:text-slate-400" : "text-rose-600 dark:text-rose-400"}`}>
                                              ₹{Number(challan.amount || 0).toLocaleString("en-IN")}
                                            </p>
                                            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5">
                                              {challan.offense || "Traffic Violation"}
                                            </p>
                                            {challan.location && (
                                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                📍 {challan.location}
                                              </p>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-2">
                                            {!isPaid && !isDisposed && (
                                              <button
                                                type="button"
                                                onClick={() => handleSendPrompt(`Pay challan ${challan.challanId}`)}
                                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold transition shadow-sm cursor-pointer"
                                              >
                                                Pay ₹{Number(challan.amount || 0).toLocaleString("en-IN")} Online
                                              </button>
                                            )}
                                            <Badge variant="outline" className={`text-[10px] ${badgeColor}`}>
                                              {challan.status || "PENDING"}
                                            </Badge>
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mt-2 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 pl-1">
                                          <p><strong>ID:</strong> <span className="font-mono">{challan.challanId}</span></p>
                                          <p className="text-right"><strong>Date:</strong> {challan.date ? new Date(challan.date).toLocaleDateString() : "N/A"}</p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            }

                            return (
                              <div key={i} className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 text-xs py-2 mt-2">
                                <Loader2 className="w-4 h-4 animate-spin text-blue-500 dark:text-[#9bb3f7]" />
                                <span>Querying National Parivahan Database...</span>
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
                <div className="absolute bottom-28 sm:bottom-32 right-6 flex justify-center pointer-events-none z-20">
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

              {/* Integrated Bottom Input Bar */}
              <div className="shrink-0 p-3 sm:p-4 bg-slate-50/70 dark:bg-[#161c2b] border-t border-slate-200/80 dark:border-slate-800/80">
                
                {/* Quick Follow-up Chips Carousel */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-1 text-xs no-scrollbar">
                  {[
                    "Apply for Passport",
                    "Passport Application Status",
                    "Check Traffic Fines",
                    "Passport Fees & Rules",
                    "Pay Traffic Challan",
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
                      placeholder="Ask follow-up question, fill forms, or track applications..."
                      className="w-full bg-transparent text-[15px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none resize-none leading-relaxed py-1"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/60 mt-1">
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      Press Enter to send
                    </span>

                    <button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      aria-label="Send message"
                      className="h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-[#9bb3f7] dark:hover:bg-[#8ea8f7] text-white dark:text-slate-950 flex items-center justify-center transition-all shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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

            </div>
          </div>
        )}

      </main>

     
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