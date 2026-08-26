'use client';

import React, { useState, useRef, useEffect } from "react";
import {
  DynamicFormRenderer,
  DynamicFormSchema,
} from "@/components/widgets/DynamicFormRenderer";
import { TesterHelperDialog } from "@/components/widgets/TesterHelperDialog";
import {
  Send,
  Sparkles,
  Bot,
  User,
  ExternalLink,
  CheckCircle2,
  Car,
  FileText,
  ShieldCheck,
  Receipt,
  Calendar,
} from "lucide-react";

export interface SubmissionResult {
  success: boolean;
  portal?: string;
  status?: string;
  message?: string;
  details?: Record<string, any>;
  [key: string]: any;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  timestamp: string;
  type: "text" | "form" | "submission_result";
  text?: string;
  schema?: DynamicFormSchema;
  submissionResult?: SubmissionResult;
  targetPortalUrl?: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial-welcome-message",
      sender: "ai",
      timestamp: "Just now",
      type: "text",
      text: "Namaste! I am JanSeva AI, your Generative UI Gateway for Indian Public Services. You can ask me to check traffic challans (e.g., 'Check fines for DL01AB1234') or book a Passport Seva Kendra appointment.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking, isSubmittingForm]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend !== undefined ? textToSend : inputValue).trim();
    if (!query || isThinking) return;

    const userTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      timestamp: userTime,
      type: "text",
      text: query,
    };

    setMessages((prev) => [...prev, userMessage]);
    if (textToSend === undefined) {
      setInputValue("");
    }
    setIsThinking(true);

    try {
      // 1. Post user input to /api/chat (Prompt Guard & Intent Classifier)
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });

      const aiTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      if (response.ok) {
        const apiData = await response.json();
        const newAiMessages: ChatMessage[] = [];

        if (apiData.type === "form" && apiData.schema) {
          if (apiData.text) {
            newAiMessages.push({
              id: `ai-text-${Date.now()}`,
              sender: "ai",
              timestamp: aiTime,
              type: "text",
              text: apiData.text,
            });
          }
          newAiMessages.push({
            id: `ai-form-${Date.now() + 1}`,
            sender: "ai",
            timestamp: aiTime,
            type: "form",
            schema: apiData.schema,
          });
        } else {
          newAiMessages.push({
            id: `ai-text-${Date.now()}`,
            sender: "ai",
            timestamp: aiTime,
            type: "text",
            text:
              apiData.text ||
              "I have received your request. How else may I assist you?",
          });
        }

        setMessages((prev) => [...prev, ...newAiMessages]);
      } else {
        throw new Error("Chat endpoint returned an error");
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-error-${Date.now()}`,
          sender: "ai",
          timestamp: "Just now",
          type: "text",
          text: "I encountered a connectivity issue with the gateway. Please try asking: 'Check fines for DL01AB1234' or 'Book a passport appointment'.",
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  // 2. Cross-Site Form Submission handler (Calls /api/submit proxy)
  const handleFormSubmit = async (
    formData: Record<string, any>,
    schema: DynamicFormSchema
  ) => {
    setIsSubmittingForm(true);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_action: schema.target_action,
          formData,
        }),
      });

      const data = await res.json();
      const submissionTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const submissionMessage: ChatMessage = {
        id: `submission-result-${Date.now()}`,
        sender: "ai",
        timestamp: submissionTime,
        type: "submission_result",
        submissionResult: data,
        targetPortalUrl:
          data?.details?.portal_url ||
          (schema.target_action.includes("Parivahan")
            ? "https://echallan.parivahan.gov.in"
            : "https://passportindia.gov.in"),
      };

      setMessages((prev) => [...prev, submissionMessage]);
    } catch (err) {
      console.error("Submission failed:", err);
      const submissionTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `submission-err-${Date.now()}`,
          sender: "ai",
          timestamp: submissionTime,
          type: "text",
          text: "Failed to forward draft to the target portal. Please verify connection and try again.",
        },
      ]);
    } finally {
      setIsSubmittingForm(false);
    }
  };

  return (
    <div className="relative flex h-screen w-full flex-col bg-[#f8fafc] text-slate-900 overflow-hidden font-sans">
      {/* Scrollable Feed of Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 pb-28">
        <div className="mx-auto max-w-2xl space-y-5">
          {/* Subtle Top Indicator / Identity */}
          <div className="flex items-center justify-center pb-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1 text-xs font-medium text-slate-600 border border-slate-200 shadow-xs">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-800">JanSeva AI Gateway</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">Site 1 Generative UI Orchestrator</span>
            </div>
          </div>

          {/* Quick Suggestions Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 pb-2">
            <button
              type="button"
              onClick={() => handleSendMessage("Check fines for DL01AB1234")}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-100 hover:border-slate-300 transition-all cursor-pointer"
            >
              <Car className="h-3.5 w-3.5 text-emerald-600" />
              <span>Check fines for DL01AB1234</span>
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage("Book a passport appointment")}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-100 hover:border-slate-300 transition-all cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5 text-indigo-600" />
              <span>Book passport appointment</span>
            </button>
          </div>

          {/* Message Stream */}
          {messages.map((message) => {
            const isAi = message.sender === "ai";

            // If it's a dynamic form
            if (isAi && message.type === "form" && message.schema) {
              return (
                <div key={message.id} className="flex gap-3 w-full self-start">
                  <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white shrink-0 mt-1 shadow-md">
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <DynamicFormRenderer
                      schema={message.schema}
                      onSubmit={handleFormSubmit}
                      isSubmitting={isSubmittingForm}
                    />
                  </div>
                </div>
              );
            }

            // If it's a Submission Result Card (Real Data Returned from Site 2/3)
            if (isAi && message.type === "submission_result" && message.submissionResult) {
              const res = message.submissionResult;
              const details = res.details || {};

              return (
                <div key={message.id} className="flex gap-3 max-w-[92%] sm:max-w-[85%] self-start">
                  <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white shrink-0 mt-1 shadow-md">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="bg-white border border-emerald-200/80 rounded-2xl rounded-tl-xs shadow-md p-4 text-slate-800 text-sm space-y-3">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm border-b border-emerald-100 pb-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{res.portal || "Government Portal"}: {res.status || "CONFIRMED"}</span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {res.message || "Your draft has been securely communicated across the gateway."}
                    </p>

                    {/* Key Details Summary */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1.5 font-mono text-slate-700">
                      {details.challan_number && (
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-sans">Challan ID:</span>
                          <span className="font-semibold">{details.challan_number}</span>
                        </div>
                      )}
                      {details.vehicle_number && (
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-sans">Vehicle No:</span>
                          <span className="font-semibold">{details.vehicle_number}</span>
                        </div>
                      )}
                      {details.amount && (
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-sans">Settlement Amount:</span>
                          <span className="font-bold text-emerald-600">{details.amount}</span>
                        </div>
                      )}
                      {details.transaction_id && (
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-sans">Txn Ref:</span>
                          <span className="text-slate-600">{details.transaction_id}</span>
                        </div>
                      )}
                      {details.application_ref && (
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-sans">Application ARN:</span>
                          <span className="font-semibold">{details.application_ref}</span>
                        </div>
                      )}
                      {details.rpo_location && (
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-sans">Location:</span>
                          <span className="text-right">{details.rpo_location}</span>
                        </div>
                      )}
                      {details.appointment_date && (
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-sans">Slot Date:</span>
                          <span className="font-semibold">{details.appointment_date}</span>
                        </div>
                      )}
                      {details.id_proof && (
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-sans">Identity:</span>
                          <span className="text-amber-700 font-semibold">[Aadhaar Redacted]</span>
                        </div>
                      )}
                    </div>

                    {/* Direct Portal Link */}
                    <div className="pt-1">
                      <a
                        href={message.targetPortalUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.preventDefault();
                          alert(
                            `Live Portal Redirect: Connecting to ${res.portal || "National Gateway"} with secure session token.`
                          );
                        }}
                        className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer"
                      >
                        <span>Proceed to {res.portal || "Target Portal"}</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            }

            // Standard AI Text Message
            if (isAi) {
              return (
                <div
                  key={message.id}
                  className="flex gap-3 max-w-[88%] sm:max-w-[82%] self-start"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white shrink-0 mt-1 shadow-md">
                    <Bot className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-xs shadow-xs text-slate-800 text-sm leading-relaxed text-left">
                    <p>{message.text}</p>
                  </div>
                </div>
              );
            }

            // User Message
            return (
              <div
                key={message.id}
                className="flex gap-3 max-w-[88%] sm:max-w-[82%] self-end flex-row-reverse ml-auto"
              >
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white shrink-0 mt-1 shadow-xs font-semibold text-xs">
                  <User className="h-4 w-4" />
                </div>
                <div className="bg-slate-900 text-white p-3.5 rounded-2xl rounded-tr-xs shadow-md text-sm leading-relaxed text-left">
                  {message.text}
                </div>
              </div>
            );
          })}

          {/* Thinking / Forwarding Indicator */}
          {(isThinking || isSubmittingForm) && (
            <div className="flex gap-3 max-w-[82%] self-start items-center">
              <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white shrink-0 shadow-md">
                <Bot className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="bg-white border border-slate-200 px-4 py-2.5 rounded-2xl rounded-tl-xs shadow-xs text-slate-600 text-xs flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-600 [animation-delay:-0.3s]" />
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-600 [animation-delay:-0.15s]" />
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-600" />
                </div>
                <span className="font-medium">
                  {isSubmittingForm
                    ? "Submitting draft to external gateway..."
                    : "Analyzing request with Prompt Guard..."}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Fixed Input Bar at Bottom Center */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-md border-t border-slate-200 py-3.5 px-4 sm:px-8">
        <div className="mx-auto max-w-2xl relative">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="relative flex items-center"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask JanSeva AI (e.g. 'Check fines for DL01AB1234')..."
              className="w-full bg-slate-100 border border-slate-200 rounded-full px-5 py-3.5 pr-14 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:bg-white placeholder:text-slate-400 transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isThinking || isSubmittingForm}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-slate-900 hover:bg-slate-800 text-white w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
              title="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Floating Helper Button & Dialog in Bottom-Right Corner */}
      <TesterHelperDialog
        onSelectPrompt={(prompt) => {
          handleSendMessage(prompt);
        }}
      />
    </div>
  );
}
