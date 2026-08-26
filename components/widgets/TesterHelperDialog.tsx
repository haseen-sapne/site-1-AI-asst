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
  Calendar,
  ShieldCheck,
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
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xl hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all border border-slate-700 cursor-pointer group"
        title="Hackathon Tester Instructions"
      >
        <HelpCircle className="h-4 w-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
        <span>Tester Helper</span>
      </button>

      {/* Tester Instructions Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg p-6">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle>Hackathon Tester Instructions</DialogTitle>
                <DialogDescription>
                  Copy-paste this mock data into the AI chat or forms to test the Generative UI prototype.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 pt-1">
            {/* Profile 1 */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 transition-colors">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/70">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                  <User className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Profile 1</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      "Name: Ramesh Sharma | DOB: 1990-05-15 | Vehicle: DL01AB1234 | ID: [Aadhaar Redacted]",
                      "p1"
                    )
                  }
                  className="flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 cursor-pointer active:scale-95"
                >
                  {copiedKey === "p1" ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy Profile</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 font-mono">
                <div>
                  <span className="text-slate-400 font-sans text-[11px]">Name:</span> Ramesh Sharma
                </div>
                <div>
                  <span className="text-slate-400 font-sans text-[11px]">DOB:</span> 1990-05-15
                </div>
                <div>
                  <span className="text-slate-400 font-sans text-[11px]">Vehicle:</span> DL01AB1234
                </div>
                <div>
                  <span className="text-slate-400 font-sans text-[11px]">ID:</span> [Aadhaar Redacted]
                </div>
              </div>
            </div>

            {/* Profile 2 */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 transition-colors">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/70">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                  <User className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Profile 2</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      "Name: Priya Patel | DOB: 1988-10-22 | Vehicle: MH02CD5678 | ID: [Aadhaar Redacted]",
                      "p2"
                    )
                  }
                  className="flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 cursor-pointer active:scale-95"
                >
                  {copiedKey === "p2" ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy Profile</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 font-mono">
                <div>
                  <span className="text-slate-400 font-sans text-[11px]">Name:</span> Priya Patel
                </div>
                <div>
                  <span className="text-slate-400 font-sans text-[11px]">DOB:</span> 1988-10-22
                </div>
                <div>
                  <span className="text-slate-400 font-sans text-[11px]">Vehicle:</span> MH02CD5678
                </div>
                <div>
                  <span className="text-slate-400 font-sans text-[11px]">ID:</span> [Aadhaar Redacted]
                </div>
              </div>
            </div>

            {/* Test Hints */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5">
              <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                Suggested Test Prompts
              </h4>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => handleUsePrompt("Check fines for DL01AB1234")}
                  className="w-full text-left bg-white hover:bg-emerald-100/60 border border-emerald-200/80 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <span>"Check fines for DL01AB1234"</span>
                  <ArrowRight className="h-3 w-3 text-slate-400 group-hover:text-emerald-700 transition-transform group-hover:translate-x-0.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleUsePrompt("Book a passport appointment")}
                  className="w-full text-left bg-white hover:bg-emerald-100/60 border border-emerald-200/80 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <span>"Book a passport appointment"</span>
                  <ArrowRight className="h-3 w-3 text-slate-400 group-hover:text-emerald-700 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
