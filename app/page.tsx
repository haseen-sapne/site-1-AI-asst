"use client";

import { useChat } from '@ai-sdk/react';
import { PaymentWidget } from '@/components/widgets/PaymentWidget';
import { DefaultChatTransport } from 'ai';
import React, { useState, useRef, useEffect } from 'react';
import { ChatBotIcon } from "@/components/widgets/ChatBotIcon";
import { DarkModeToggle } from "@/components/widgets/DarkModeToggle";
import { TesterHelperDialog } from "@/components/widgets/TesterHelperDialog";
import { DynamicForm } from "@/components/widgets/DynamicForm";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  CheckCircle2,
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
                  
                  // 1. Render standard text parts
                  if (part.type === 'text') {
                    const textContent = part.text ?? '';
                    if (!textContent) return null;
                    return (
                      <p key={i} className="whitespace-pre-wrap leading-relaxed">
                        {textContent}
                      </p>
                    );
                  }
                  
                  // 2. NORMALIZE TOOL DATA (Handles both Vercel AI SDK and manual fallbacks)
                  const isStandardTool = part.type === 'tool-invocation';
                  const toolName = isStandardTool ? part.toolInvocation?.toolName : part.type?.replace('tool-', '');
                  const toolState = isStandardTool ? part.toolInvocation?.state : (part as any).state;
                  const toolArgs = isStandardTool ? part.toolInvocation?.args : (part as any).args;
                  const toolResult = isStandardTool ? part.toolInvocation?.result : (part as any).output;
                  const toolData = toolResult || toolArgs;

                  // 3. Render Payment Gateway
                  if (toolName === 'initiateChallanPayment') {
                    if (toolState === 'result' || toolData || toolState === 'output-available') {
                      return <PaymentWidget key={i} result={toolData} />;
                    }
                    return (
                      <div key={i} className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 text-xs py-2 mt-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#9bb3f7]" />
                        <span>Initializing Secure Payment Gateway...</span>
                      </div>
                    );
                  }

                  // 4. Render the Dynamic Form
                  if (toolName === 'createApplicationForm') {
                    if (toolState === 'result' || toolResult || toolState === 'output-available') {
                      return (
                        <div key={i} className="w-full mt-2">
                          <DynamicForm result={toolResult} />
                        </div>
                      );
                    }
                    return (
                      <div key={i} className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 text-xs py-2 mt-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#9bb3f7]" />
                        <span>Generating custom application form...</span>
                      </div>
                    );
                  }

                  // 4. Render Passport Tracking Output
                  if (toolName === 'trackPassport') {
                    if (toolState === 'result' || toolResult || toolState === 'output-available') {
                      
                      // Normalize: toolResult might be a JSON string from the SDK
                      let parsed = toolResult;
                      if (typeof parsed === 'string') {
                        try { parsed = JSON.parse(parsed); } catch { /* keep as-is */ }
                      }

                      // NEED_INPUT means the AI will ask the user via text — don't render anything
                      if (!parsed || typeof parsed !== 'object' || parsed.status === 'NEED_INPUT') {
                        return null;
                      }

                      // Handle Errors or Not Found cleanly
                      if (parsed.status === 'ERROR' || parsed.status === 'NOT_FOUND') {
                        return (
                          <div key={i} className="w-full mt-2 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-lg text-rose-700 dark:text-rose-400 text-xs">
                            <AlertCircle className="w-4 h-4 inline-block mr-1.5 mb-0.5" />
                            {parsed.message}
                          </div>
                        );
                      }
                    
                      // Render successful tracking details
                      return (
                        <div key={i} className="w-full mt-2 p-4 bg-emerald-50 dark:bg-[#1a2721] border border-emerald-200 dark:border-emerald-900/60 rounded-xl text-emerald-900 dark:text-emerald-100 text-sm shadow-sm">
                          <div className="flex items-center justify-between border-b border-emerald-200/50 dark:border-emerald-800/50 pb-2 mb-2">
                            <span className="font-bold font-mono text-emerald-700 dark:text-emerald-400">
                              {parsed.appId || 'Passport Application'}
                            </span>
                            <Badge className="bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100 hover:bg-emerald-200 text-[10px]">
                              {parsed.status}
                            </Badge>
                          </div>
                          
                          <div className="space-y-1.5 text-xs text-emerald-800/80 dark:text-emerald-200/80">
                            {parsed.serviceType && (
                              <p><strong className="text-emerald-900 dark:text-emerald-100">Service:</strong> {parsed.serviceType}</p>
                            )}
                            {parsed.personalDetails && (
                              <p><strong className="text-emerald-900 dark:text-emerald-100">Applicant:</strong> {parsed.personalDetails.firstName} {parsed.personalDetails.lastName}</p>
                            )}
                            {parsed.appointment?.pskLocation && (
                              <p><strong className="text-emerald-900 dark:text-emerald-100">Location:</strong> {parsed.appointment.pskLocation}</p>
                            )}
                          </div>
                        </div>
                      );
                    }
                    
                    return (
                      <div key={i} className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 text-xs py-2 mt-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#9bb3f7]" />
                        <span>Connecting to Passport Seva servers...</span>
                      </div>
                    );
                  }

                  // 5. Render Knowledge Base Loader
                  if (toolName === 'searchKnowledgeBase') {
                    if (toolState === 'result' || toolResult || toolState === 'output-available') {
                      return null; // Don't render JSON here, let the AI talk normally below it
                    }
                    return (
                      <div key={i} className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 text-xs py-2 mt-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#9bb3f7]" />
                        <span>Searching official government rulebooks...</span>
                      </div>
                    );
                  }
                  // 5. Render e-Challan / Traffic Fines Output
                  if (toolName === 'checkTrafficFines') {
                    if (toolState === 'result' || toolResult || toolState === 'output-available') {
                      // Normalize: toolResult might be a JSON string from the SDK
                      let parsed = toolResult;
                      if (typeof parsed === 'string') {
                        try { parsed = JSON.parse(parsed); } catch { /* keep as-is */ }
                      }

                      // NEED_INPUT means the AI will ask the user via text — don't render anything
                      if (!parsed || typeof parsed !== 'object' || parsed.status === 'NEED_INPUT') {
                        return null;
                      }

                      if (parsed.status === 'ERROR') {
                        return (
                          <div key={i} className="w-full mt-2 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-lg text-rose-700 dark:text-rose-400 text-xs">
                            <AlertCircle className="w-4 h-4 inline-block mr-1.5 mb-0.5" />
                            {parsed.message || 'Unable to reach the Parivahan database at this time.'}
                          </div>
                        );
                      }

                      if (parsed.status === 'NOT_FOUND') {
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

                      // Render the Challan Ticket
                      const vehNo = parsed.vehicle?.vehicleNo || parsed.vehicleNo || 'Vehicle';
                      const owner = parsed.vehicle?.ownerName || 'Registered Owner';
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
                                  {vehicleClass && <span className="text-[9px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.2 rounded">{vehicleClass}</span>}
                                  {fuelType && <span className="text-[9px] bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 px-1.5 py-0.2 rounded">{fuelType}</span>}
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
                            const isPaid = challan.status === 'PAID';
                            const isDisposed = challan.status === 'DISPOSED';
                            const badgeColor = isPaid
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900'
                              : isDisposed
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900';

                            const barColor = isPaid ? 'bg-emerald-500' : isDisposed ? 'bg-slate-400' : 'bg-rose-500';

                            return (
                              <div key={challan.challanId || `ch-${ci}`} className="p-4 bg-white dark:bg-[#1e2430] border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-sm relative overflow-hidden">
                                <div className={`absolute top-0 left-0 w-1.5 h-full ${barColor}`}></div>
                                <div className="flex justify-between items-start mb-2 pl-1">
                                  <div>
                                    <p className={`font-bold text-sm ${isPaid ? 'text-emerald-600 dark:text-emerald-400' : isDisposed ? 'text-slate-600 dark:text-slate-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                      ₹{Number(challan.amount || 0).toLocaleString('en-IN')}
                                    </p>
                                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5">
                                      {challan.offense || 'Traffic Violation'}
                                    </p>
                                    {challan.location && (
                                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                        📍 {challan.location}
                                      </p>
                                    )}
                                  </div>
                                  <Badge variant="outline" className={`text-[10px] ${badgeColor}`}>
                                    {challan.status || 'PENDING'}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 pl-1">
                                  <p><strong>ID:</strong> <span className="font-mono">{challan.challanId}</span></p>
                                  <p className="text-right"><strong>Date:</strong> {challan.date ? new Date(challan.date).toLocaleDateString() : 'N/A'}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    }
                    
                    return (
                      <div key={i} className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 text-xs py-2 mt-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#9bb3f7]" />
                        <span>Querying National Parivahan Database...</span>
                      </div>
                    );
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

        {/* Thinking Indicator — shown while waiting for AI response */}
        {status === 'submitted' && (
          <div className="flex flex-col items-start max-w-full animate-in fade-in duration-300">
            <div className="flex items-center gap-2 mb-1.5 px-1">
              <div className="h-6 w-6 rounded-full bg-[#1e2430] dark:bg-[#232a37] border border-slate-700/60 flex items-center justify-center text-slate-100 shadow-sm flex-shrink-0">
                <ChatBotIcon className="w-3.5 h-3.5 text-slate-100" />
              </div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                JanSeva AI
              </span>
            </div>
            <div className="bg-white dark:bg-[#242b38] border border-slate-200/90 dark:border-slate-700/50 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
              <div className="flex gap-1.5 items-center">
                <span className="w-2 h-2 bg-[#9bb3f7] rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-[#9bb3f7] rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-[#9bb3f7] rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}

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