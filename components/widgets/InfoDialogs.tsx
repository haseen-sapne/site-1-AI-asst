"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Layers, Zap, FileText, Car, Search, ShieldCheck } from "lucide-react";

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
                {type === "howItWorks" ? "How Janseva AI Works" : "Integrated Public Services"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                {type === "howItWorks"
                  ? "AI-Powered Citizen Assistance & Form Automation"
                  : "National Digital Portals & Real-Time Microservices"}
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
                    Ask about passport applications, traffic fines, vehicle RC details, or document requirements.
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
                    Janseva AI generates interactive forms and Secure GovPay payment gateways directly inside your conversation.
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
                    Track real-time passport draft status (Site 3) and settle e-Challans (Site 2) with instant database updates.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
