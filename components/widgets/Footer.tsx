"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function Footer() {
  const [legalModal, setLegalModal] = useState<"privacy" | "terms" | null>(null);

  return (
    <>
      <footer className="w-full border-t border-slate-200/60 dark:border-slate-800/60 py-8 px-4 sm:px-6 lg:px-8 mt-auto bg-white/40 dark:bg-[#0b0e14]/40 backdrop-blur-sm transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          
          {/* Left: Brand */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white text-sm">
              Janseva AI
            </span>
          </div>

          {/* Center: Legal Links */}
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setLegalModal("privacy")}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => setLegalModal("terms")}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
          </div>

          {/* Right: Copyright notice */}
          <div className="text-slate-400 dark:text-slate-500">
            © 2024 Janseva AI. Government of India Partnership.
          </div>
        </div>
      </footer>

      {/* Legal Dialog */}
      <Dialog open={legalModal !== null} onOpenChange={(open) => !open && setLegalModal(null)}>
        <DialogContent className="max-w-md p-6 bg-white dark:bg-[#141923] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {legalModal === "privacy" ? "Privacy Policy" : "Terms of Service"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              National Digital Public Infrastructure Compliance
            </DialogDescription>
          </DialogHeader>
          <div className="py-3 text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed max-h-60 overflow-y-auto">
            {legalModal === "privacy" ? (
              <>
                <p>
                  Janseva AI respects citizen privacy. In accordance with the Digital Personal Data Protection (DPDP) Act, user queries, identity authentications, and session histories are encrypted and processed through government API gateways without persistent storage of sensitive credentials.
                </p>
                <p>
                  Cookies and local cache are utilized solely for theme preferences and session persistence.
                </p>
              </>
            ) : (
              <>
                <p>
                  Janseva AI is a public service intelligence assistant designed to simplify citizen access to government schemes, forms, and procedures.
                </p>
                <p>
                  Citizens are encouraged to verify critical application details and official timestamps directly on primary state and central department portals.
                </p>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
