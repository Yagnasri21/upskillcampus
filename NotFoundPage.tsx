import { useNavigate } from "react-router";
import { Link2Off, Home } from "lucide-react";

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
        <Link2Off className="w-10 h-10 text-slate-500" />
      </div>
      <h1 className="text-4xl font-bold text-white mb-3">404</h1>
      <p className="text-slate-400 mb-8 max-w-sm">
        This page doesn't exist. Maybe the link expired or was deleted.
      </p>
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium transition-all"
      >
        <Home className="w-4 h-4" />
        Back to Home
      </button>
    </div>
  );
}
