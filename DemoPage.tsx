import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Zap,
  Link2,
  Copy,
  Check,
  ExternalLink,
  BarChart3,
  MousePointerClick,
  Trash2,
  Edit3,
  Clock,
  ChevronRight,
  ChevronLeft,
  Play,
  RotateCcw,
  ArrowRight,
  LayoutDashboard,
  TrendingUp,
  Database,
  Sparkles,
  CheckCircle2,
  CircleDot,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { shortenUrl, getShortUrl, getLinks, type LinkData } from "../lib/api";

// ─── helpers ────────────────────────────────────────────────────────────────

const DEMO_URLS = [
  "https://github.com/features/actions",
  "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
  "https://reactjs.org/docs/getting-started.html",
];

const MOCK_CHART = Array.from({ length: 14 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (13 - i));
  return {
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    clicks: Math.floor(Math.random() * 18) + (i > 8 ? 10 : 2),
  };
});

function TypewriterText({ text, speed = 35 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("");
  const idx = useRef(0);
  useEffect(() => {
    setDisplayed("");
    idx.current = 0;
    const iv = setInterval(() => {
      if (idx.current < text.length) {
        setDisplayed(text.slice(0, idx.current + 1));
        idx.current++;
      } else {
        clearInterval(iv);
      }
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed]);
  return <>{displayed}<span className="animate-pulse">|</span></>;
}

function StepBadge({
  step,
  active,
  done,
  label,
  icon: Icon,
  onClick,
}: {
  step: number;
  active: boolean;
  done: boolean;
  label: string;
  icon: React.ElementType;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
        ${active
          ? "bg-violet-600 text-white shadow-lg shadow-violet-500/30"
          : done
          ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
          : "bg-white/5 border border-white/10 text-slate-500 hover:text-slate-300 hover:bg-white/8"
        }`}
    >
      {done && !active ? (
        <CheckCircle2 className="w-4 h-4" />
      ) : active ? (
        <CircleDot className="w-4 h-4" />
      ) : (
        <Icon className="w-4 h-4" />
      )}
      <span className="hidden sm:block">{label}</span>
      <span className="sm:hidden font-bold">{step}</span>
    </button>
  );
}

// ─── Step 1: Shorten ─────────────────────────────────────────────────────────

function StepShorten({ onComplete }: { onComplete: (link: LinkData) => void }) {
  const [phase, setPhase] = useState<"idle" | "typing" | "loading" | "done">("idle");
  const [demoUrlIdx] = useState(0);
  const [result, setResult] = useState<LinkData | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const demoUrl = DEMO_URLS[demoUrlIdx];

  const runDemo = async () => {
    setPhase("typing");
    await new Promise((r) => setTimeout(r, demoUrl.length * 35 + 300));
    setPhase("loading");
    setError("");
    try {
      const link = await shortenUrl(demoUrl, "QuickLink Demo", undefined);
      setResult(link);
      setPhase("done");
      onComplete(link);
    } catch (e: any) {
      setError(e.message || "Failed to shorten URL");
      setPhase("idle");
    }
  };

  const reset = () => {
    setPhase("idle");
    setResult(null);
    setError("");
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(getShortUrl(result));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/25 text-violet-300 text-xs font-semibold mb-3">
          <Zap className="w-3 h-3" /> Step 1 of 3
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">Shorten any URL</h2>
        <p className="text-slate-400 text-sm">
          Paste a long URL and get a compact, shareable short link in milliseconds.
        </p>
      </div>

      {/* Animated form mockup */}
      <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 shadow-xl">
        {/* URL Input row */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <div className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-sm font-mono min-h-[48px] flex items-center">
              {phase === "idle" ? (
                <span className="text-slate-500 italic">https://your-very-long-url.com/goes/here…</span>
              ) : phase === "typing" ? (
                <span className="text-violet-300">
                  <TypewriterText text={demoUrl} />
                </span>
              ) : (
                <span className="text-slate-300 truncate">{demoUrl}</span>
              )}
            </div>
          </div>
          <button
            onClick={phase === "idle" ? runDemo : undefined}
            disabled={phase === "typing" || phase === "loading"}
            className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap
              ${phase === "idle"
                ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/25 cursor-pointer"
                : phase === "done"
                ? "bg-emerald-600/80 text-white"
                : "bg-violet-600/50 text-white/50 cursor-not-allowed"
              }`}
          >
            {phase === "loading" ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : phase === "done" ? (
              <><Check className="w-4 h-4" /> Done!</>
            ) : phase === "idle" ? (
              <><Play className="w-4 h-4" /> Run Demo</>
            ) : (
              <><ArrowRight className="w-4 h-4" /> Shortening…</>
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
            ⚠ {error}
          </div>
        )}

        {/* Loading state */}
        {phase === "loading" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20"
          >
            <div className="w-5 h-5 border-2 border-violet-400/40 border-t-violet-400 rounded-full animate-spin shrink-0" />
            <div className="space-y-1 flex-1">
              {["Validating URL…", "Generating short code…", "Saving to Supabase KV…"].map((msg, i) => (
                <motion.p
                  key={msg}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.4 }}
                  className="text-violet-300 text-xs font-mono"
                >
                  › {msg}
                </motion.p>
              ))}
            </div>
          </motion.div>
        )}

        {/* Result */}
        <AnimatePresence>
          {phase === "done" && result && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="space-y-4"
            >
              {/* Success banner */}
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Short link created successfully!
              </div>

              {/* URL pair */}
              <div className="rounded-xl border border-white/10 overflow-hidden">
                <div className="p-4 bg-white/3 border-b border-white/8">
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Original URL</p>
                  <p className="text-slate-400 text-sm font-mono break-all">{result.originalUrl}</p>
                </div>
                <div className="p-4">
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Short URL</p>
                  <div className="flex items-center gap-3">
                    <p className="text-violet-300 text-sm font-mono font-semibold flex-1 break-all">
                      {getShortUrl(result)}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={handleCopy}
                        className="p-2 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 transition-all"
                        title="Copy"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <a
                        href={getShortUrl(result)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                        title="Open"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats pills */}
              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  { label: `Code: ${result.shortCode}`, color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
                  { label: `${result.originalUrl.length} → ${getShortUrl(result).length} chars`, color: "text-slate-400 bg-white/5 border-white/10" },
                  { label: "Stored in Supabase KV", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
                ].map(({ label, color }) => (
                  <span key={label} className={`px-2.5 py-1 rounded-full border font-mono ${color}`}>{label}</span>
                ))}
              </div>

              <button
                onClick={reset}
                className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-xs transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Run again with a new URL
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Explanation callouts */}
      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { icon: Zap, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", title: "Auto code", desc: "6-char random alphanumeric code generated instantly" },
          { icon: Database, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20", title: "Supabase KV", desc: "Stored as url:{code} key in the kv_store table" },
          { icon: Link2, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", title: "302 redirect", desc: "The short URL does a real HTTP redirect via Hono" },
        ].map(({ icon: Icon, color, bg, title, desc }) => (
          <div key={title} className={`p-4 rounded-xl border ${bg} flex gap-3`}>
            <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${color}`} />
            <div>
              <p className={`text-xs font-bold ${color} mb-0.5`}>{title}</p>
              <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step 2: Manage ──────────────────────────────────────────────────────────

function StepManage({ demoLink }: { demoLink: LinkData | null }) {
  const navigate = useNavigate();
  const [links, setLinks] = useState<LinkData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleVal, setTitleVal] = useState("QuickLink Demo");
  const [copied, setCopied] = useState<string | null>(null);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  useEffect(() => {
    getLinks()
      .then((data) => setLinks(data.slice(0, 5)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const highlight = (feat: string) => {
    setActiveFeature(feat);
    setTimeout(() => setActiveFeature(null), 1800);
  };

  const displayLinks = demoLink
    ? [demoLink, ...links.filter((l) => l.shortCode !== demoLink.shortCode)].slice(0, 4)
    : links.slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 text-xs font-semibold mb-3">
          <LayoutDashboard className="w-3 h-3" /> Step 2 of 3
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">Manage your links</h2>
        <p className="text-slate-400 text-sm">
          The Dashboard lets you view, copy, edit, and delete all your short links in one place.
        </p>
      </div>

      {/* Feature buttons */}
      <div className="flex flex-wrap justify-center gap-2">
        {[
          { id: "copy", label: "Copy URL", icon: Copy, color: "violet" },
          { id: "edit", label: "Edit Title", icon: Edit3, color: "indigo" },
          { id: "open", label: "Open Link", icon: ExternalLink, color: "emerald" },
          { id: "delete", label: "Delete", icon: Trash2, color: "red" },
        ].map(({ id, label, icon: Icon, color }) => (
          <button
            key={id}
            onClick={() => highlight(id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all
              ${activeFeature === id
                ? `bg-${color}-500/30 border-${color}-500/50 text-${color}-300 scale-105`
                : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
              }`}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* Dashboard mockup */}
      <div className="bg-slate-900/80 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        {/* Tab bar */}
        <div className="flex items-center gap-1 p-2 border-b border-white/8 bg-white/3">
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-medium">
            <LayoutDashboard className="w-3 h-3" /> Cards
          </div>
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-slate-500 text-xs">
            <Database className="w-3 h-3" /> Database
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          </div>
        ) : displayLinks.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            No links yet — go to Step 1 to create one!
          </div>
        ) : (
          <div className="p-4 space-y-3 max-h-[380px] overflow-y-auto">
            {displayLinks.map((link, i) => {
              const isDemo = link.shortCode === demoLink?.shortCode;
              return (
                <motion.div
                  key={link.shortCode}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`p-4 rounded-xl border transition-all ${
                    isDemo
                      ? "border-violet-500/40 bg-violet-500/8"
                      : "border-white/8 bg-white/3"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Title row */}
                      <div className="flex items-center gap-2 mb-1">
                        {isDemo && editingTitle && activeFeature === "edit" ? (
                          <input
                            value={titleVal}
                            onChange={(e) => setTitleVal(e.target.value)}
                            className="flex-1 px-2 py-0.5 rounded bg-white/5 border border-violet-500/40 text-white text-sm focus:outline-none"
                            autoFocus
                            onBlur={() => setEditingTitle(false)}
                          />
                        ) : (
                          <span className="text-white text-sm font-medium truncate">
                            {isDemo ? titleVal : (link.title || link.shortCode)}
                            {isDemo && (
                              <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-semibold">
                                NEW
                              </span>
                            )}
                          </span>
                        )}
                      </div>

                      {/* Short URL */}
                      <motion.p
                        animate={activeFeature === "copy" && isDemo ? { color: ["#a78bfa", "#34d399", "#a78bfa"] } : {}}
                        transition={{ duration: 0.8 }}
                        className="text-violet-400 text-xs font-mono truncate mb-1"
                      >
                        {getShortUrl(link)}
                      </motion.p>

                      {/* Original URL */}
                      <p className="text-slate-600 text-xs truncate">{link.originalUrl}</p>

                      {/* Meta */}
                      <div className="flex items-center gap-3 mt-2">
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <MousePointerClick className="w-3 h-3" />
                          <span className="text-white font-medium">{link.clicks}</span> clicks
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-600">
                          <Clock className="w-3 h-3" />
                          {link.createdAt ? new Date(link.createdAt).toLocaleDateString() : "—"}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <motion.button
                        animate={activeFeature === "copy" ? { scale: [1, 1.2, 1], backgroundColor: ["rgba(139,92,246,0.1)", "rgba(139,92,246,0.35)", "rgba(139,92,246,0.1)"] } : {}}
                        onClick={async () => {
                          await navigator.clipboard.writeText(getShortUrl(link));
                          setCopied(link.shortCode);
                          setTimeout(() => setCopied(null), 2000);
                        }}
                        className="p-2 rounded-lg bg-white/5 hover:bg-violet-500/20 text-slate-400 hover:text-violet-300 transition-all"
                        title="Copy"
                      >
                        {copied === link.shortCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </motion.button>
                      <motion.button
                        animate={activeFeature === "edit" && isDemo ? { scale: [1, 1.2, 1], backgroundColor: ["rgba(99,102,241,0.1)", "rgba(99,102,241,0.35)", "rgba(99,102,241,0.1)"] } : {}}
                        onClick={() => { if (isDemo) setEditingTitle(true); }}
                        className="p-2 rounded-lg bg-white/5 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-300 transition-all"
                        title="Edit title"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </motion.button>
                      <motion.a
                        animate={activeFeature === "open" ? { scale: [1, 1.15, 1] } : {}}
                        href={getShortUrl(link)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                        title="Open"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </motion.a>
                      <motion.button
                        animate={activeFeature === "delete" ? { scale: [1, 1.2, 1], backgroundColor: ["rgba(239,68,68,0.05)", "rgba(239,68,68,0.25)", "rgba(239,68,68,0.05)"] } : {}}
                        className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Go to real dashboard */}
      <div className="text-center">
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 hover:border-white/20 text-slate-300 hover:text-white text-sm font-medium transition-all"
        >
          <LayoutDashboard className="w-4 h-4" />
          Open the real Dashboard →
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Analyze ─────────────────────────────────────────────────────────

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload?.length) {
    return (
      <div className="bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm shadow-xl">
        <p className="text-slate-400 text-xs">{label}</p>
        <p className="text-violet-300 font-bold">{payload[0].value} clicks</p>
      </div>
    );
  }
  return null;
}

function StepAnalyze({ demoLink }: { demoLink: LinkData | null }) {
  const navigate = useNavigate();
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(t);
  }, []);

  const totalClicks = MOCK_CHART.reduce((s, d) => s + d.clicks, 0);
  const peakDay = MOCK_CHART.reduce((best, d) => d.clicks > best.clicks ? d : best, MOCK_CHART[0]);
  const avgDaily = (totalClicks / 14).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 text-xs font-semibold mb-3">
          <BarChart3 className="w-3 h-3" /> Step 3 of 3
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">Track with Analytics</h2>
        <p className="text-slate-400 text-sm">
          Every click is logged. View daily trends, peak days, and total engagement for each link.
        </p>
      </div>

      {/* Analytics mockup */}
      <div className="bg-slate-900/80 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        {/* Link header */}
        <div className="p-5 border-b border-white/8">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-white font-semibold">
                {demoLink?.title || "QuickLink Demo"}
              </p>
              <p className="text-violet-400 text-xs font-mono mt-0.5">
                {demoLink ? getShortUrl(demoLink) : "https://…/r/abc123"}
              </p>
              <p className="text-slate-600 text-xs mt-0.5 truncate">
                {demoLink?.originalUrl || "https://example.com/long-url"}
              </p>
            </div>
            <span className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs font-bold">
              <TrendingUp className="w-3 h-3" /> Live
            </span>
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/8">
            {[
              { label: "Total Clicks", value: demoLink?.clicks ?? totalClicks },
              { label: "Last 14 Days", value: totalClicks },
              { label: "Avg / Day", value: avgDaily },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={animated ? { opacity: 1, scale: 1 } : {}}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="text-white text-2xl font-bold"
                >
                  {value}
                </motion.p>
                <p className="text-slate-500 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-sm font-semibold">Click Trends — Last 14 Days</h3>
            <span className="text-xs text-slate-500">
              Peak: {peakDay.date} ({peakDay.clicks})
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={MOCK_CHART}>
              <defs>
                <linearGradient id="demoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#64748b", fontSize: 9 }}
                tickLine={false}
                axisLine={false}
                interval={2}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 9 }}
                tickLine={false}
                axisLine={false}
                width={25}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="clicks"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="url(#demoGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "#8b5cf6" }}
                isAnimationActive={animated}
                animationDuration={1200}
              />
            </AreaChart>
          </ResponsiveContainer>
          <p className="text-slate-600 text-xs text-center mt-2 italic">
            Simulated click data for illustration — real charts use live Supabase data
          </p>
        </div>
      </div>

      {/* Feature callouts */}
      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { icon: MousePointerClick, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20", title: "Per-click tracking", desc: "Every redirect increments the click counter in real time" },
          { icon: BarChart3, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20", title: "Daily breakdown", desc: "Click history stored by date, viewable as area or bar chart" },
          { icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", title: "Global stats", desc: "Total links, total clicks, and today's traffic at a glance" },
        ].map(({ icon: Icon, color, bg, title, desc }) => (
          <div key={title} className={`p-4 rounded-xl border ${bg} flex gap-3`}>
            <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${color}`} />
            <div>
              <p className={`text-xs font-bold ${color} mb-0.5`}>{title}</p>
              <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center">
        <button
          onClick={() => navigate("/analytics")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 hover:border-white/20 text-slate-300 hover:text-white text-sm font-medium transition-all"
        >
          <BarChart3 className="w-4 h-4" />
          Open real Analytics →
        </button>
      </div>
    </div>
  );
}

// ─── Main Demo Page ───────────────────────────────────────────────────────────

const STEPS = [
  { id: "shorten", label: "Shorten", icon: Link2 },
  { id: "manage",  label: "Manage",  icon: LayoutDashboard },
  { id: "analyze", label: "Analyze", icon: BarChart3 },
];

export function DemoPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [demoLink, setDemoLink] = useState<LinkData | null>(null);
  const [completed, setCompleted] = useState<boolean[]>([false, false, false]);
  const prevStep = useRef(0);

  const goTo = (s: number) => {
    prevStep.current = step;
    setStep(s);
  };

  const markDone = (s: number) => {
    setCompleted((prev) => {
      const next = [...prev];
      next[s] = true;
      return next;
    });
  };

  const direction = step > prevStep.current ? 1 : -1;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero banner */}
      <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-violet-950/50 via-slate-950 to-indigo-950/40">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-violet-600/20 rounded-full blur-3xl" />
          <div className="absolute top-0 right-0 w-56 h-56 bg-indigo-600/15 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Interactive Demo
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">
            See QuickLink in Action
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Walk through the full flow — shorten a real URL, manage links, and explore analytics.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Step tabs */}
        <div className="flex items-center gap-3 mb-8">
          {STEPS.map((s, i) => (
            <StepBadge
              key={s.id}
              step={i + 1}
              active={step === i}
              done={completed[i]}
              label={s.label}
              icon={s.icon}
              onClick={() => goTo(i)}
            />
          ))}
          {/* Progress line */}
          <div className="flex-1 h-px bg-white/8 relative ml-2">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
              animate={{ width: `${((completed.filter(Boolean).length) / 3) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-slate-600 text-xs font-mono whitespace-nowrap">
            {completed.filter(Boolean).length}/3 done
          </span>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 40 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
          >
            {step === 0 && (
              <StepShorten
                onComplete={(link) => {
                  setDemoLink(link);
                  markDone(0);
                }}
              />
            )}
            {step === 1 && (
              <StepManage demoLink={demoLink} />
            )}
            {step === 2 && (
              <StepAnalyze demoLink={demoLink} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/8">
          <button
            onClick={() => goTo(step - 1)}
            disabled={step === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 text-slate-300 hover:text-white text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  step === i
                    ? "bg-violet-400 w-6"
                    : completed[i]
                    ? "bg-emerald-500"
                    : "bg-white/20"
                }`}
              />
            ))}
          </div>

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => { markDone(step); goTo(step + 1); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-violet-500/20 transition-all"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Zap className="w-4 h-4" />
              Start shortening!
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
