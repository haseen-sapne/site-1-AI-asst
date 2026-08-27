import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JanSeva AI - Citizen Public Service Gateway",
  description: "Official Indian Public Service AI Gateway & Generative UI Assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('janseva-theme');
                if (theme === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="antialiased bg-[#f8fafc] dark:bg-[#181e28] text-slate-900 dark:text-slate-100 min-h-screen overflow-hidden font-sans">
        {children}
      </body>
    </html>
  );
}
