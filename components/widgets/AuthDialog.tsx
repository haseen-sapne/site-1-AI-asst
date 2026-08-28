"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ShieldCheck, Phone, KeyRound, CheckCircle2, Sparkles, ArrowRight } from "lucide-react";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const [method, setMethod] = useState<"aadhaar" | "digilocker" | "mobile">("aadhaar");
  const [identifier, setIdentifier] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) return;
    setOtpSent(true);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setIsSuccess(true);
    setTimeout(() => {
      onOpenChange(false);
      setIsSuccess(false);
      setOtpSent(false);
      setIdentifier("");
      setOtp("");
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 bg-white dark:bg-[#141923] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-3xl shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="h-9 w-9 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">Citizen Authentication</DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                Securely sign in via National Public Service Gateway
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-8 flex flex-col items-center justify-center gap-3 text-center">
            <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">Authentication Verified</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Welcome back to your Citizen Unified Portal.
            </p>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {/* Auth Method Selector */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-[#1b2230] rounded-xl text-xs font-medium">
              <button
                type="button"
                onClick={() => {
                  setMethod("aadhaar");
                  setOtpSent(false);
                }}
                className={`py-2 rounded-lg transition-all ${
                  method === "aadhaar"
                    ? "bg-white dark:bg-[#252f42] text-slate-900 dark:text-white shadow-sm font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Aadhaar OTP
              </button>
              <button
                type="button"
                onClick={() => {
                  setMethod("digilocker");
                  setOtpSent(false);
                }}
                className={`py-2 rounded-lg transition-all ${
                  method === "digilocker"
                    ? "bg-white dark:bg-[#252f42] text-slate-900 dark:text-white shadow-sm font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                DigiLocker
              </button>
              <button
                type="button"
                onClick={() => {
                  setMethod("mobile");
                  setOtpSent(false);
                }}
                className={`py-2 rounded-lg transition-all ${
                  method === "mobile"
                    ? "bg-white dark:bg-[#252f42] text-slate-900 dark:text-white shadow-sm font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Mobile OTP
              </button>
            </div>

            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-3.5 pt-1">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {method === "aadhaar"
                      ? "12-Digit Aadhaar Number"
                      : method === "digilocker"
                      ? "DigiLocker Username / Mobile"
                      : "10-Digit Mobile Number"}
                  </label>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={
                      method === "aadhaar"
                        ? "XXXX XXXX 1234"
                        : method === "digilocker"
                        ? "user.digilocker or +91 9876543210"
                        : "+91 98765 43210"
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#1a212e] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Request Verification Code</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-3.5 pt-1">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Enter 6-Digit OTP sent to your registered number
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="1 2 3 4 5 6"
                    className="w-full px-3.5 py-2.5 text-center tracking-widest font-mono text-base rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#1a212e] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="w-1/3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md active:scale-98 cursor-pointer"
                  >
                    Verify & Continue
                  </button>
                </div>
              </form>
            )}

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 text-center">
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                🔒 End-to-end encrypted with India Stack & UIDAI standards
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
