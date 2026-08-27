"use client";

import React, { useState } from "react";
import { CheckCircle2, Download, Truck, Check } from "lucide-react";

interface AadhaarResult {
  status?: string;
  aadhaarNumber?: string;
  name?: string;
  message?: string;
  dispatchDate?: string;
  trackingNumber?: string;
}

export function AadhaarStatusCard({ result }: { result?: AadhaarResult }) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [showTracking, setShowTracking] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDownloaded(true);
      const blob = new Blob(["Official e-Aadhaar Document\nGovernment of India / UIDAI\nStatus: Verified Active"], {
        type: "text/plain;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `e-Aadhaar_${result?.aadhaarNumber ? result.aadhaarNumber.replace(/\*/g, "X") : "4321"}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    }, 1000);
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-[#202735] border border-slate-200/90 dark:border-slate-700/60 rounded-2xl p-5 shadow-xl transition-all space-y-3.5 my-1">
      {/* Header with status */}
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
            Aadhaar Status
          </h3>
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">
            {result?.status === "IN_PROGRESS" ? "Processing Application" : "Generated & Dispatched"}
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
        {result?.message ||
          "Your Aadhaar has been generated and sent via post. You can also download the e-Aadhaar from the official UIDAI portal."}
      </p>

      {/* Expanded tracking info */}
      {showTracking && (
        <div className="bg-slate-50 dark:bg-[#181e29] rounded-xl p-3 border border-slate-200 dark:border-slate-700/60 text-xs space-y-2 animate-in fade-in duration-200">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 font-mono text-[11px]">
            <span>Speed Post Consignment:</span>
            <span className="text-slate-800 dark:text-slate-200 font-semibold">{result?.trackingNumber || "IN984210492IN"}</span>
          </div>
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 text-[11px]">
            <span>Dispatch Date:</span>
            <span className="text-slate-800 dark:text-slate-200">{result?.dispatchDate || "24-02-2026"}</span>
          </div>
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 text-[11px]">
            <span>Current Location:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Out for Delivery (Local Nodal Hub)</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2 pt-1">
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="w-full bg-[#9bb3f7] hover:bg-[#8ea8f7] text-slate-950 font-semibold py-2.5 px-4 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-75"
        >
          {downloading ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-3 h-3 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              Generating Secured PDF...
            </span>
          ) : downloaded ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>e-Aadhaar Downloaded</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5" />
              <span>Download e-Aadhaar</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => setShowTracking(!showTracking)}
          className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-[#2a3243] dark:hover:bg-[#343e52] text-slate-800 dark:text-slate-200 font-medium py-2.5 px-4 rounded-xl text-xs border border-slate-300/80 dark:border-slate-700/80 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
        >
          <Truck className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>{showTracking ? "Hide Tracking Details" : "Track Delivery"}</span>
        </button>
      </div>
    </div>
  );
}
