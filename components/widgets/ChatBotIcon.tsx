import React from "react";

interface ChatBotIconProps {
  className?: string;
  size?: number;
}

export function ChatBotIcon({ className = "w-5 h-5", size }: ChatBotIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Chat Bot Icon"
    >
      {/* Top Antenna */}
      <path d="M12 2v3" />
      <circle cx="12" cy="2" r="1" fill="currentColor" />

      {/* Main Bot Head Frame */}
      <rect x="4" y="6" width="16" height="14" rx="4" />

      {/* Left and Right Ears / Headset */}
      <path d="M2 11v4" />
      <path d="M22 11v4" />

      {/* Visor / Eyes Screen */}
      <circle cx="9" cy="12" r="1.5" fill="currentColor" />
      <circle cx="15" cy="12" r="1.5" fill="currentColor" />

      {/* Friendly Smile / Mouth Line */}
      <path d="M9 16c1 1 5 1 6 0" />
    </svg>
  );
}
