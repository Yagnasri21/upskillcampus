import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Zap, AlertTriangle, Home, ExternalLink, RotateCcw } from "lucide-react";
import { resolveUrl } from "../lib/api";

type Status = "loading" | "redirecting" | "error";

interface ResolvedLink {
  originalUrl: string;
  shortCode: string;
  title: string;
  clicks: number;
}

export function RedirectPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  const [status, setStatus] = useState<Status>("loading");
  const [resolved, setResolved] = useState<ResolvedLink | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!code) {
      setErrorMsg("No short code provided in the URL.");
      setStatus("error");
      return;
    }

    // Validate code format before hitting the server
    if (!/^[a-zA-Z0-9-]{3,20}$/.test(code)) {
      setErrorMsg(`"${code}" is not a valid short code. Codes must be 3–20 alphanumeric characters.`);
      setStatus("error");
      return;
    }

    resolveUrl(code)
      .then((data) => {
        setResolved(data);
        setStatus("redirecting");
      })
      .catch((err: Error) => {
        console.error("RedirectPage resolve error:", err.message);
        setErrorMsg(err.message || "This short link could not be found.");
        setStatus("error");
      });
  }, [code]);

  // Countdown + automatic redirect
  useEffect(() => {
    if (status !== "redirecting" || !resolved) return;

    if (countdown <= 0) {
      window.location.replace(resolved.originalUrl);
      return;
    }

    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [status, countdown, resolved]);

  // ── Loading state ──
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-6 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl">
            Quick<span className="text-violet-400">Link</span>
          </span>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-4 border-violet-500/20" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-500 animate-spin" />
          </div>
          <p className="text-slate-400 text-sm animate-pulse">Looking up short link…</p>
          {code && (
            <span className="font-mono text-violet-400 text-sm bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-full">
              /{code}
            </span>
          )}
        </div>
      </div>
    );
  }

  // ── Redirecting state ──
  if (status === "redirecting" && resolved) {
    const pct = Math.round(((3 - countdown) / 3) * 100);

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-8 px-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl">
            Quick<span className="text-violet-400">Link</span>
          </span>
        </div>

        {/* Card */}
        <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-7 text-center shadow-2xl shadow-black/50">
          {/* Success icon */}
          <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5">
            <ExternalLink className="w-6 h-6 text-emerald-400" />
          </div>

          <h1 className="text-white text-lg font-bold mb-1">
            {resolved.title || "Redirecting you now"}
          </h1>
          <p className="text-slate-500 text-sm mb-5">
            You're being taken to the destination
          </p>

          {/* Destination URL */}
          <div className="bg-slate-900/70 border border-white/8 rounded-xl px-4 py-3 mb-5 text-left">
            <p className="text-slate-500 text-xs mb-1 font-medium uppercase tracking-wider">
              Destination
            </p>
            <p className="text-violet-300 text-sm font-mono break-all leading-relaxed">
              {resolved.originalUrl}
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-3">
            <div className="h-1.5 w-full bg-white/8 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-1000"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <p className="text-slate-400 text-sm">
            Redirecting in{" "}
            <span className="text-white font-bold tabular-nums">{countdown}</span>s…
          </p>

          {/* Manual redirect */}
          <a
            href={resolved.originalUrl}
            className="mt-5 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all shadow-lg shadow-violet-500/20"
          >
            <ExternalLink className="w-4 h-4" />
            Go now
          </a>

          {/* Short code info */}
          <p className="text-slate-600 text-xs mt-4">
            Short code:{" "}
            <span className="font-mono text-slate-500">/{code}</span>
            {" · "}
            {resolved.clicks} total click{resolved.clicks !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    );
  }

  // ── Error state ──
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-8 px-4">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <span className="text-white font-bold text-xl">
          Quick<span className="text-violet-400">Link</span>
        </span>
      </div>

      {/* Error card */}
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-7 text-center shadow-2xl shadow-black/50">
        <div className="w-14 h-14 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-6 h-6 text-red-400" />
        </div>

        <h1 className="text-white text-lg font-bold mb-2">Link not found</h1>

        <p className="text-slate-400 text-sm leading-relaxed mb-5">
          {errorMsg}
        </p>

        {code && (
          <div className="bg-slate-900/70 border border-white/8 rounded-xl px-4 py-3 mb-5">
            <p className="text-slate-500 text-xs mb-1 uppercase tracking-wider">
              Requested code
            </p>
            <p className="text-red-400 font-mono text-sm">/{code}</p>
          </div>
        )}

        {/* Troubleshooting checklist */}
        <div className="text-left bg-slate-900/50 border border-white/8 rounded-xl p-4 mb-5 space-y-2">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Troubleshooting
          </p>
          {[
            "Check the link was copied in full",
            "Short codes are case-sensitive",
            "The link may have been deleted",
            "Auto-generated codes are exactly 6 characters",
          ].map((tip) => (
            <div key={tip} className="flex items-start gap-2 text-slate-500 text-sm">
              <span className="text-slate-600 mt-0.5 shrink-0">›</span>
              {tip}
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate("/")}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all"
          >
            <Home className="w-4 h-4" />
            Create a new link
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white text-sm transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}
