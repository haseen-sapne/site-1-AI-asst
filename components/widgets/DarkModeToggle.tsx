"use client";

import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function DarkModeToggle() {
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("janseva-theme");
    if (stored === "light") {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    } else if (stored === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      // Default to dark mode matching the reference design
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
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
      <div className="h-9 w-9 rounded-full bg-transparent flex items-center justify-center opacity-0">
        <Moon className="w-5 h-5" />
      </div>
    );
  }

  return (
    <button
      type="button"
      id="dark-mode-toggle"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="h-9 w-9 rounded-full flex items-center justify-center transition-all duration-200 text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 dark:hover:bg-slate-800/80 light:hover:bg-slate-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-500/30"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-amber-300 transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon className="w-5 h-5 text-slate-700 transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
}
