"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isCurrentlyDark = document.documentElement.classList.contains("dark");
    setIsDark(isCurrentlyDark);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("janseva-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("janseva-theme", "light");
    }
  };

  if (!mounted) {
    return (
      <div className="w-16 h-8 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
    );
  }

  return (
    <button
      type="button"
      id="theme-switch-btn"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to Day Mode (Light)" : "Switch to Night Mode (Dark)"}
      title={isDark ? "Switch to Day Mode (Light)" : "Switch to Night Mode (Dark)"}
      className={`relative inline-flex h-8 w-16 flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
        isDark
          ? "bg-slate-800 border-slate-600 hover:border-slate-500"
          : "bg-slate-200 border-slate-300 hover:border-slate-400"
      }`}
    >
      {/* Background Icons */}
      <span className="absolute inset-0 flex items-center justify-between px-2 text-[10px] pointer-events-none select-none">
        <Sun
          className={`w-3.5 h-3.5 transition-opacity duration-200 ${
            isDark ? "text-slate-500 opacity-40" : "text-amber-500 opacity-100"
          }`}
        />
        <Moon
          className={`w-3.5 h-3.5 transition-opacity duration-200 ${
            isDark ? "text-indigo-300 opacity-100" : "text-slate-400 opacity-40"
          }`}
        />
      </span>

      {/* Sliding Thumb */}
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-flex h-6 w-6 transform items-center justify-center rounded-full bg-white shadow-md transition duration-300 ease-in-out mt-[2px] ${
          isDark
            ? "translate-x-[34px] bg-slate-900 border border-slate-700 text-indigo-300"
            : "translate-x-[2px] bg-white text-amber-500 border border-slate-200"
        }`}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 fill-indigo-300/30 text-indigo-300" />
        ) : (
          <Sun className="w-3.5 h-3.5 fill-amber-400/30 text-amber-500" />
        )}
      </span>
    </button>
  );
}
