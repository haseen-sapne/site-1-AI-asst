"use client";

import React, { useState } from "react";
import { DarkModeToggle } from "@/components/widgets/DarkModeToggle";
import { AuthDialog } from "@/components/widgets/AuthDialog";
import { Plus } from "lucide-react";

interface NavbarProps {
  onOpenHowItWorks?: () => void;
  onOpenServices?: () => void;
  onResetChat?: () => void;
}

export function Navbar({ onOpenHowItWorks, onOpenServices, onResetChat }: NavbarProps) {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 dark:bg-[#0b0e14]/80 border-b border-slate-200/60 dark:border-slate-800/60 transition-colors duration-250">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Left: Brand Logo & Title */}
          <button
            type="button"
            onClick={onResetChat}
            className="flex items-center gap-2.5 group cursor-pointer focus:outline-none"
            aria-label="Janseva AI Home"
          >
            {/* 3x3 Grid Logo Emblem */}
            <div className="w-6 h-6 grid grid-cols-3 gap-0.5 items-center justify-center p-0.5 text-slate-900 dark:text-white transition-transform group-hover:scale-110">
              <span className="w-1.5 h-1.5 rounded-sm bg-slate-900 dark:bg-white" />
              <span className="w-1.5 h-1.5 rounded-sm bg-blue-600" />
              <span className="w-1.5 h-1.5 rounded-sm bg-slate-900 dark:bg-white" />
              <span className="w-1.5 h-1.5 rounded-sm bg-blue-500" />
              <span className="w-1.5 h-1.5 rounded-sm bg-slate-900 dark:bg-white" />
              <span className="w-1.5 h-1.5 rounded-sm bg-blue-400" />
              <span className="w-1.5 h-1.5 rounded-sm bg-slate-900 dark:bg-white" />
              <span className="w-1.5 h-1.5 rounded-sm bg-blue-600" />
              <span className="w-1.5 h-1.5 rounded-sm bg-slate-900 dark:bg-white" />
            </div>

            <span className="text-[17px] font-bold tracking-tight text-slate-900 dark:text-white">
              Janseva AI
            </span>
          </button>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <button
              type="button"
              onClick={onOpenHowItWorks}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              How it works
            </button>
            <button
              type="button"
              onClick={onOpenServices}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Services
            </button>
          </nav>

          {/* Right Controls: Switch Button + Sign In Button */}
          <div className="flex items-center gap-3">
            {/* Dedicated Top-Right Day/Night Mode Switch Button */}
            <DarkModeToggle />

            {/* Sign In Pill Button */}
            <button
              type="button"
              id="sign-in-btn"
              onClick={() => setAuthOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 shadow-sm hover:shadow active:scale-95 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white dark:bg-[#a5b4fc] dark:hover:bg-[#c7d2fe] dark:text-slate-950"
            >
              <Plus className="w-3.5 h-3.5 block dark:hidden" />
              <span>Sign In</span>
            </button>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
}
