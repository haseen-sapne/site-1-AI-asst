"use client";

import React, { useState } from "react";
import { CheckCircle2, ShieldAlert, CreditCard, Check } from "lucide-react";

export function ChallanCard({ result }: { result: any }) {
  const [paid, setPaid] = useState(false);

  if (!result || result.status === "NOT_FOUND") {
    return (
      <div className="w-full max-w-md bg-emerald-50/80 dark:bg-[#202735] border border-emerald-500/30 rounded-2xl p-5 shadow-xl transition-all space-y-2 my-1">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
              No Pending Fines
            </h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">Clean Driving Record</p>
          </div>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal pt-1">
          {result?.message || "No pending violations found. Drive safely!"}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white dark:bg-[#202735] border border-rose-500/30 rounded-2xl p-5 shadow-xl transition-all space-y-3.5 my-1">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500 dark:text-rose-400 flex-shrink-0">
            <ShieldAlert className="w-4 h-4 text-rose-500 dark:text-rose-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
              e-Challan Pending
            </h3>
            <p className="text-xs font-medium text-rose-500 dark:text-rose-400 mt-0.5">Parivahan Violation Notice</p>
          </div>
        </div>
        <span className="bg-rose-500/15 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 dark:border-rose-500/40 text-xs font-bold px-2.5 py-1 rounded-full">
          ₹{result.amount || 1000}
        </span>
      </div>

      {/* Details Box */}
      <div className="bg-slate-50 dark:bg-[#181e29] rounded-xl p-3.5 border border-slate-200 dark:border-slate-700/60 text-xs space-y-2">
        <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
          <span>Vehicle Registration:</span>
          <span className="text-slate-900 dark:text-slate-100 font-mono font-bold uppercase">
            {result.vehicle || "DL01AB1234"}
          </span>
        </div>
        <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
          <span>Challan ID:</span>
          <span className="text-slate-800 dark:text-slate-200 font-mono">
            {result.challanId || "CH-2026-88349"}
          </span>
        </div>
        <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
          <span>Violation / Offense:</span>
          <span className="text-rose-600 dark:text-rose-300 font-medium">
            {result.offense || "Over Speeding (Sec 183 MVA)"}
          </span>
        </div>
        <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
          <span>Notice Date:</span>
          <span className="text-slate-800 dark:text-slate-200">{result.date || "14-02-2026"}</span>
        </div>
      </div>

      {/* Payment Action */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setPaid(true)}
          className="w-full bg-[#9bb3f7] hover:bg-[#8ea8f7] text-slate-950 font-semibold py-2.5 px-4 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
        >
          {paid ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Redirecting to Bharat BillPay Gateway...</span>
            </>
          ) : (
            <>
              <CreditCard className="w-3.5 h-3.5" />
              <span>Proceed to Secure Parivahan Payment</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}