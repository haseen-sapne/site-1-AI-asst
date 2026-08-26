import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-800 p-4">
      <h2 className="text-2xl font-bold mb-2">404 - Page Not Found</h2>
      <p className="text-sm text-slate-600 mb-4">
        The requested JanSeva AI service page could not be found.
      </p>
      <Link
        href="/"
        className="bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
      >
        Return to JanSeva AI Chat
      </Link>
    </div>
  );
}
