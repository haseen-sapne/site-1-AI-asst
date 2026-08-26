import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JanSeva AI - Citizen Public Service Gateway",
  description: "AI-Powered Generative UI Public Service Gateway for India",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#f8fafc] text-slate-900 overflow-hidden font-sans">
        {children}
      </body>
    </html>
  );
}
