import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  HelpCircle,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  User,
  Car,
  FileText,
  CreditCard,
  ShieldCheck,
  Search,
} from "lucide-react";

interface TesterHelperDialogProps {
  onSelectPrompt?: (prompt: string) => void;
}

export function TesterHelperDialog({ onSelectPrompt }: TesterHelperDialogProps) {
  const [open, setOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 1800);
  };

  const handleUsePrompt = (prompt: string) => {
    if (onSelectPrompt) {
      onSelectPrompt(prompt);
      setOpen(false);
    }
  };

  return (
    <>
      {/* Floating Action Button (FAB) positioned bottom-right */}
      <button
        id="tester-helper-fab"
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-slate-900 dark:bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xl hover:bg-slate-800 dark:hover:bg-blue-500 hover:scale-105 active:scale-95 transition-all border border-slate-700 dark:border-blue-400/50 cursor-pointer group"
        title="Hackathon Tester Instructions"
      >
        <HelpCircle className="h-4 w-4 text-emerald-400 dark:text-emerald-300 group-hover:rotate-12 transition-transform" />
        <span>Tester Helper</span>
      </button>

      {/* Tester Instructions Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl p-6 bg-white dark:bg-[#141923] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Hackathon Evaluation & Test Helper</DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                  Click any suggested prompt below or copy mock credentials to test live microservices & Generative UI widgets.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            
            {/* SECTION 1: PASSPORT SEVA (SITE 3) */}
            <div className="rounded-2xl border border-blue-200/80 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs text-blue-900 dark:text-blue-300">
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Passport Seva Portal (Site 3 Microservice)</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      "Name: Rahul Sharma | DOB: 1995-08-20 | Address: 12 Janpath, New Delhi | Service: Fresh | PSK: Delhi - RPO Herald House, ITO",
                      "pass_profile"
                    )
                  }
                  className="flex items-center gap-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-[#1a212e] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer active:scale-95 shadow-sm"
                >
                  {copiedKey === "pass_profile" ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy Passport Details</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-white dark:bg-[#111620] p-2.5 rounded-xl border border-blue-100 dark:border-blue-950">
                <div><span className="text-slate-400 font-sans">Applicant:</span> Rahul Sharma</div>
                <div><span className="text-slate-400 font-sans">DOB:</span> 1995-08-20</div>
                <div><span className="text-slate-400 font-sans">Sample Track ID:</span> APP-2026-145351</div>
                <div><span className="text-slate-400 font-sans">PSK:</span> Delhi RPO</div>
              </div>

              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Test Passport Workflows:
                </p>
                <button
                  type="button"
                  onClick={() => handleUsePrompt("I want to apply for a fresh passport")}
                  className="w-full text-left bg-white dark:bg-[#161d2a] hover:bg-blue-100/50 dark:hover:bg-blue-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-between group cursor-pointer shadow-sm"
                >
                  <span>1. "I want to apply for a fresh passport" (Generates Dynamic Form)</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-transform group-hover:translate-x-0.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleUsePrompt("Track passport application APP-2026-145351")}
                  className="w-full text-left bg-white dark:bg-[#161d2a] hover:bg-blue-100/50 dark:hover:bg-blue-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-between group cursor-pointer shadow-sm"
                >
                  <span>2. "Track passport application APP-2026-145351" (Live DB Lookup)</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>

            {/* SECTION 2: PARIVAHAN (SITE 2) */}
            <div className="rounded-2xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs text-amber-900 dark:text-amber-300">
                  <Car className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span>Parivahan e-Challan Portal (Site 2 Microservice)</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard("Vehicle: MH02CD5678 | Challan: CH-2026-44120", "parivahan_profile")
                  }
                  className="flex items-center gap-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-[#1a212e] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer active:scale-95 shadow-sm"
                >
                  {copiedKey === "parivahan_profile" ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy Vehicle Info</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-white dark:bg-[#111620] p-2.5 rounded-xl border border-amber-100 dark:border-amber-950">
                <div><span className="text-slate-400 font-sans">Pending Challan:</span> MH02CD5678</div>
                <div><span className="text-slate-400 font-sans">Fine:</span> ₹500 (Signal Jump)</div>
                <div><span className="text-slate-400 font-sans">Clean Record:</span> DL01AB0000</div>
                <div><span className="text-slate-400 font-sans">Payment:</span> GovPay Gateway</div>
              </div>

              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Test Traffic Fines & Payment:
                </p>
                <button
                  type="button"
                  onClick={() => handleUsePrompt("Check traffic fines for MH02CD5678")}
                  className="w-full text-left bg-white dark:bg-[#161d2a] hover:bg-amber-100/50 dark:hover:bg-amber-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-between group cursor-pointer shadow-sm"
                >
                  <span>1. "Check traffic fines for MH02CD5678" (Pending Challan Ticket)</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-transform group-hover:translate-x-0.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleUsePrompt("Pay challan CH-2026-44120")}
                  className="w-full text-left bg-white dark:bg-[#161d2a] hover:bg-amber-100/50 dark:hover:bg-amber-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-between group cursor-pointer shadow-sm"
                >
                  <span>2. "Pay challan CH-2026-44120" (Secure GovPay Payment Gateway)</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-transform group-hover:translate-x-0.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleUsePrompt("Check traffic fines for DL01AB0000")}
                  className="w-full text-left bg-white dark:bg-[#161d2a] hover:bg-amber-100/50 dark:hover:bg-amber-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-between group cursor-pointer shadow-sm"
                >
                  <span>3. "Check traffic fines for DL01AB0000" (Clean Record Verification)</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>

            {/* SECTION 3: RAG KNOWLEDGE BASE */}
            <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs text-emerald-900 dark:text-emerald-300">
                <Search className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Knowledge Base & Policy Inquiries (RAG Vector Search)</span>
              </div>
              <button
                type="button"
                onClick={() => handleUsePrompt("What is the fee and document requirement for a fresh 36-page passport?")}
                className="w-full text-left bg-white dark:bg-[#161d2a] hover:bg-emerald-100/50 dark:hover:bg-emerald-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-between group cursor-pointer shadow-sm"
              >
                <span>"What is the fee and document requirement for a fresh 36-page passport?"</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
