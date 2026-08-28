"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Bot, Layers, Zap, Shield, CheckCircle2 } from "lucide-react";

interface InfoDialogsProps {
  type: "howItWorks" | "services" | null;
  onClose: () => void;
  onSelectPrompt?: (prompt: string) => void;
}

export function InfoDialogs({ type, onClose, onSelectPrompt }: InfoDialogsProps) {
  if (!type) return null;

  return (
    <Dialog open={type !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-6 bg-white dark:bg-[#141923] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-3xl shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="h-9 w-9 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
              {type === "howItWorks" ? <Zap className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                {type === "howItWorks" ? "How Janseva AI Works" : "Explore Public Services"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                {type === "howItWorks"
                  ? "AI-Powered Citizen Assistance & Form Automation"
                  : "Central & State Government Digital Services"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-3 text-xs space-y-3.5">
          {type === "howItWorks" ? (
            <>
              <div className="flex gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-[#1a212e] border border-slate-200/80 dark:border-slate-800">
                <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Ask in Natural Language</h4>
                  <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                    Ask about any government scheme, eligibility rules, document checklists, or application deadlines in any Indian language.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-[#1a212e] border border-slate-200/80 dark:border-slate-800">
                <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Generative UI & Interactive Forms</h4>
                  <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                    Janseva AI generates customized interactive forms on-the-fly and pre-fills them to save you hours of paperwork.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-[#1a212e] border border-slate-200/80 dark:border-slate-800">
                <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Live Tracking & Validation</h4>
                  <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                    Track real-time passport status, PAN verification, and grievance updates directly via official microservices.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { title: "Passport Seva", query: "How do I apply for a fresh passport?" },
                { title: "Aadhaar Card", query: "How to update address in Aadhaar online?" },
                { title: "PAN Card Status", query: "Check status of PAN card application" },
                { title: "Income Tax", query: "Guide to filing ITR-1 income tax return" },
                { title: "Ayushman Bharat", query: "Check PM-JAY health card eligibility" },
                { title: "Pension Schemes", query: "Explain Atal Pension Yojana benefits" },
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
