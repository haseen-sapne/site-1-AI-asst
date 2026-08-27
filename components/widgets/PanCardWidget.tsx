"use client";

import React, { useState } from "react";
import { CreditCard, CheckCircle2, ShieldCheck } from "lucide-react";

interface PanResult {
  status?: string;
  panNumber?: string;
  name?: string;
  category?: string;
  aadhaarLinked?: boolean;
}

export function PanCardWidget({ result }: { result?: PanResult }) {
  const [verified, setVerified] = useState(false);

  return (
    <div className="w-full max-w-md bg-white dark:bg-[#202735] border border-slate-200/90 dark:border-slate-700/60 rounded-2xl p-5 shadow-xl transition-all space-y-3.5 my-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
              Permanent Account Number (PAN)
            </h3>
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">
              Verified & Active
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-[#181e29] rounded-xl p-3.5 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
        <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
          <span>PAN Number:</span>
          <span className="text-slate-900 dark:text-slate-200 font-mono font-semibold">
            {result?.panNumber || "ABCDE1234F"}
          </span>
        </div>
        <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
          <span>Holder Name:</span>
          <span className="text-slate-900 dark:text-slate-200">{result?.name || "Ramesh Sharma"}</span>
        </div>
        <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
          <span>Aadhaar Linkage:</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Linked & Validated
          </span>
        </div>
      </div>

      <div className="space-y-2 pt-1">
        <button
          type="button"
          onClick={() => setVerified(true)}
          className="w-full bg-[#9bb3f7] hover:bg-[#8ea8f7] text-slate-950 font-semibold py-2.5 px-4 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{verified ? "Verification Certificate Generated" : "Download e-PAN / Verification"}</span>
        </button>
      </div>
    </div>
  );
}
