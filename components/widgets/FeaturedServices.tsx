"use client";

import React from "react";
import { ShieldCheck, GraduationCap, ChevronRight, ArrowUpRight } from "lucide-react";

interface FeaturedServicesProps {
  onSelectService: (prompt: string) => void;
}

export function FeaturedServices({ onSelectService }: FeaturedServicesProps) {
  return (
    <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-10">
      
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Featured Services
        </h2>
        <button
          type="button"
          onClick={() => onSelectService("List all popular citizen government schemes and services")}
          className="text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-1 group cursor-pointer transition-colors"
        >
          <span>See all</span>
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Wide Card: Citizen Portal */}
        <div
          onClick={() => onSelectService("Help me access my digital government documents and records")}
          className="lg:col-span-8 group relative overflow-hidden rounded-3xl border border-blue-100/90 dark:border-slate-800/80 bg-gradient-to-br from-blue-50/70 via-slate-50/50 to-indigo-50/40 dark:from-[#131826] dark:via-[#111622] dark:to-[#0f131c] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 dark:hover:border-slate-700 cursor-pointer"
        >
          {/* Text Content */}
          <div className="flex-1 space-y-3 z-10">
            <span className="inline-block text-[11px] font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase">
              CITIZEN PORTAL
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Streamlined Access to Government Records
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-md">
              Access your digital documents, verify identity, and manage applications from one unified dashboard.
            </p>
            
            <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
              <span>Open Document Vault</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>

          {/* 3D Holographic Graphic */}
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex-shrink-0 flex items-center justify-center">
            {/* Ambient Graphic Backlight */}
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/20 to-blue-500/20 rounded-2xl blur-xl" />
            
            <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg border border-white/50 dark:border-slate-700/50 bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm group-hover:scale-105 transition-transform duration-300">
              <img
                src="/citizen_portal_graphic.jpg"
                alt="Streamlined Access to Government Records Holographic Graphic"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
        </div>

        {/* Right Stacked Column Cards */}
        <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-4">
          
          {/* Card 1: Ayushman Bharat */}
          <div
            onClick={() => onSelectService("Check eligibility and hospital network for Ayushman Bharat PM-JAY")}
            className="flex-1 group rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#131824] p-5 transition-all duration-300 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer flex items-start gap-4"
          >
            <div className="h-11 w-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Ayushman Bharat
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Check eligibility and hospital network.
              </p>
            </div>
          </div>

          {/* Card 2: National Scholarship */}
          <div
            onClick={() => onSelectService("Track national scholarship portal application status and deadline")}
            className="flex-1 group rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#131824] p-5 transition-all duration-300 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer flex items-start gap-4"
          >
            <div className="h-11 w-11 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/50 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                National Scholarship
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Track application status and deadlines.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
