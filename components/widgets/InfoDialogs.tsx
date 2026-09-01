"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Layers,
  Zap,
  Users,
  Mail,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

// Official LinkedIn Brand SVG
function LinkedInIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 382 382"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#0077B7"
        d="M347.445,0H34.555C15.471,0,0,15.471,0,34.555v312.889C0,366.529,15.471,382,34.555,382h312.889 C366.529,382,382,366.529,382,347.444V34.555C382,15.471,366.529,0,347.445,0z M118.207,329.844c0,5.554-4.502,10.056-10.056,10.056 H65.345c-5.554,0-10.056-4.502-10.056-10.056V150.403c0-5.554,4.502-10.056,10.056-10.056h42.806 c5.554,0,10.056,4.502,10.056,10.056V329.844z M86.748,123.432c-22.459,0-40.666-18.207-40.666-40.666S64.289,42.1,86.748,42.1 s40.666,18.207,40.666,40.666S109.208,123.432,86.748,123.432z M341.91,330.654c0,5.106-4.14,9.246-9.246,9.246H286.73 c-5.106,0-9.246-4.14-9.246-9.246v-84.168c0-12.556,3.683-55.021-32.813-55.021c-28.309,0-34.051,29.066-35.204,42.11v97.079 c0,5.106-4.139,9.246-9.246,9.246h-44.426c-5.106,0-9.246-4.14-9.246-9.246V149.593c0-5.106,4.14-9.246,9.246-9.246h44.426 c5.106,0,9.246,4.14,9.246,9.246v15.655c10.497-15.753,26.097-27.912,59.312-27.912c73.552,0,73.131,68.716,73.131,106.472 L341.91,330.654L341.91,330.654z"
      />
    </svg>
  );
}

interface InfoDialogsProps {
  type: "howItWorks" | "services" | "aboutUs" | null;
  onClose: () => void;
  onSelectPrompt?: (prompt: string) => void;
}

export function InfoDialogs({ type, onClose, onSelectPrompt }: InfoDialogsProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!type) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };


  const teamMembers = [
    {
      id: "shubham",
      name: "Shubham Bansal",
      email: "bansalshubham0105@gmail.com",
      linkedin: "www.linkedin.com/in/shubham-bansal404",
      avatarColor: "bg-blue-600 dark:bg-blue-500",
    },
    {
      id: "shreshtha",
      name: "Shreshtha Gupta",
      email: "guptashreshtha011@gmail.com",
      linkedin: "https://www.linkedin.com/in/shreshthaguptaaa/",
      avatarColor: "bg-indigo-600 dark:bg-indigo-500",
    },
  ];

  return (
    <Dialog open={type !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl p-6 bg-white dark:bg-[#141923] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-3xl shadow-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>

        </DialogHeader>

        <div className="py-3 text-xs space-y-4">
          {/* 1. HOW IT WORKS */}
          {type === "howItWorks" && (
            <div className="space-y-3">
              <div className="flex gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1a212e] border border-slate-200/80 dark:border-slate-800">
                <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-xs">Ask in Natural Language</h4>
                  <p className="text-slate-600 dark:text-slate-400 mt-0.5 text-[11px] leading-relaxed">
                    Ask about passport applications, traffic fines, vehicle RC details, or document requirements in conversational English or Hindi.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1a212e] border border-slate-200/80 dark:border-slate-800">
                <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-xs">Generative UI & Dynamic Forms</h4>
                  <p className="text-slate-600 dark:text-slate-400 mt-0.5 text-[11px] leading-relaxed">
                    Janseva AI generates interactive forms and Secure GovPay payment gateways directly inside your conversation window.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1a212e] border border-slate-200/80 dark:border-slate-800">
                <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-xs">Live Verification & Settle</h4>
                  <p className="text-slate-600 dark:text-slate-400 mt-0.5 text-[11px] leading-relaxed">
                    Track real-time passport draft status (Site 3) and settle e-Challans (Site 2) with instant database updates.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. SERVICES */}
          {type === "services" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { title: "Passport Application", query: "I want to apply for a fresh passport" },
                { title: "Passport Application Status", query: "Track passport application APP-2026-145351" },
                { title: "Check Traffic Fines", query: "Check traffic fines for MH02CD5678" },
                { title: "Pay Traffic Challan", query: "Pay challan CH-2026-44120" },
                { title: "Passport Fees & Rules", query: "What is the fee and document checklist for a fresh 36-page passport?" },
                { title: "Vehicle Clean Record", query: "Check traffic fines for DL01AB0000" },
              ].map((svc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (onSelectPrompt) onSelectPrompt(svc.query);
                    onClose();
                  }}
                  className="p-3 text-left rounded-2xl bg-slate-50 dark:bg-[#1a212e] border border-slate-200/80 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 transition-all cursor-pointer group"
                >
                  <div className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {svc.title}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {svc.query}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* 3. ABOUT US (TEAM DEVELOPERS & CONTACT) */}
          {type === "aboutUs" && (
            <div className="space-y-4">
             

              {/* Developer Cards (2 Team Profiles) */}
              <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Lead Developers & Creators
                </p>

                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-[#181f2c] border border-slate-200/90 dark:border-slate-800 space-y-3 transition-all hover:border-slate-300 dark:hover:border-slate-700"
                  >
                    {/* Developer Name & Role */}
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-2xl ${member.avatarColor} text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0`}>
                        {member.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                          {member.name}
                        </h4>
                      
                      </div>
                    </div>

                    {/* Contact Links: Email & LinkedIn */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800/80">
                      {/* Email Row */}
                      <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-[#121722] border border-slate-200/70 dark:border-slate-800 text-[11px]">
                        <div className="flex items-center gap-2 min-w-0 pr-1">
                          <Mail className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="font-mono text-slate-700 dark:text-slate-300 truncate" title={member.email}>
                            {member.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <a
                            href={`mailto:${member.email}`}
                            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold transition"
                            title="Send Email"
                          >
                            Send
                          </a>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(member.email, `email-${member.id}`)}
                            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition cursor-pointer"
                            title="Copy Email"
                          >
                            {copiedKey === `email-${member.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* LinkedIn Row with Official SVG Brand Icon */}
                      <div className="max-w-sm mx-auto pt-3">
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 min-w-0 pr-1 hover:text-blue-600 dark:hover:text-blue-400 transition group"
                          title="Open LinkedIn Profile"
                        >
                          <LinkedInIcon className="w-4 h-4 shrink-0 rounded-[2px]" />
                          <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[#0077B7] dark:group-hover:text-blue-400">
                            LinkedIn Profile
                          </span>
                          <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-[#0077B7] transition-colors" />
                        </a>
                        <div className="flex items-center gap-1 shrink-0">
                         
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
