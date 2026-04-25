import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Link2,
  ArrowRight,
  Copy,
  Check,
  ExternalLink,
  Zap,
  Shield,
  BarChart3,
  ChevronDown,
  ChevronUp,
  TrendingDown,
  Ruler,
  Sparkles,
} from "lucide-react";
import { shortenUrl, getShortUrl, type LinkData } from "../lib/api";

export function HomePage() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<LinkData | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!url.trim()) {
      setError("Please enter a URL to shorten.");
      return;
    }

    // Auto-prefix protocol if missing
    let finalUrl = url.trim();
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = "https://" + finalUrl;
    }

    setLoading(true);
    try {
      const link = await shortenUrl(
        finalUrl,
        title.trim() || undefined,
        customCode.trim() || undefined
      );
      setResult(link);
      setUrl("");
      setTitle("");
      setCustomCode("");
      setShowAdvanced(false);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(getShortUrl(result));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Length comparison: original URL vs the actual full redirect URL
  const redirectUrl = result ? getShortUrl(result) : "";
  const originalLen = result ? result.originalUrl.length : 0;
  const shortLen = redirectUrl.length; // full backend redirect URL length
  const savedChars = originalLen - shortLen;
  const isLonger = savedChars < 0;
  const reductionPct =
    originalLen > 0 ? Math.abs(Math.round((savedChars / originalLen) * 100)) : 0;
  const shortBarWidth =
    originalLen > 0 ? Math.min(100, Math.max(4, Math.round((shortLen / originalLen) * 100))) : 0;

  const features = [
    {
      icon: Zap,
      title: "Instant Shortening",
      desc: "Create short links in milliseconds with our blazing-fast infrastructure.",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: BarChart3,
      title: "Click Analytics",
      desc: "Track every click with detailed analytics including daily traffic charts.",
      color: "from-violet-500 to-indigo-600",
    },
    {
      icon: Shield,
      title: "Link Management",
      desc: "Organize, edit, and delete your links from one convenient dashboard.",
      color: "from-emerald-500 to-teal-600",
    },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Background gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute -top-20 right-0 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-900/10 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm font-medium mb-6">
          <Zap className="w-3.5 h-3.5" />
          Fast, free, and powerful URL shortener
        </div>

        {/* Heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
          Shorten links.
          <br />
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
            Amplify reach.
          </span>
        </h1>

        <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
          Transform long, ugly URLs into clean short links with click tracking
          and analytics built right in. No account needed to get started.
        </p>

        {/* Demo link */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/demo")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/15 text-violet-300 text-sm font-medium transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            See a live interactive demo →
          </button>
        </div>

        {/* Shortener Form */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Main URL input */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Paste your long URL here..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:bg-white/8 transition-all text-base"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Shorten <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Advanced Options Toggle */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-slate-400 hover:text-slate-300 text-sm transition-colors mx-auto"
            >
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              Advanced options
            </button>

            {showAdvanced && (
              <div className="grid sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5 text-left">
                    Title (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="My awesome link"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5 text-left">
                    Custom code (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="my-custom-code"
                    value={customCode}
                    onChange={(e) =>
                      setCustomCode(e.target.value.replace(/\s/g, "-").toLowerCase())
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-all text-sm"
                  />
                  <p className="text-slate-600 text-xs mt-1.5 text-left">
                    3–20 chars · letters, numbers, hyphens · auto-generated codes are always 6 chars
                  </p>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-left">
                <span className="text-red-400">⚠</span>
                {error}
              </div>
            )}
          </form>

          {/* Result */}
          {result && (
            <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">

              {/* Success header */}
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                <Check className="w-4 h-4 bg-emerald-500/20 rounded-full p-0.5" />
                Your short link is ready!
              </div>

              {/* ── URL Comparison Card ── */}
              <div className="rounded-xl border border-white/10 overflow-hidden bg-slate-900/60">

                {/* Header row */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-white/8 bg-white/3">
                  <div className="flex items-center gap-2 text-slate-300 text-sm font-semibold">
                    <Ruler className="w-4 h-4 text-violet-400" />
                    Link Length Comparison
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs font-bold">
                    <TrendingDown className="w-3.5 h-3.5" />
                    {reductionPct}% shorter
                  </div>
                </div>

                <div className="p-5 space-y-5">

                  {/* Original URL row */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Original URL
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                        <span className="text-red-300">{originalLen}</span> chars
                      </span>
                    </div>
                    {/* Full bar = 100% */}
                    <div className="relative h-7 bg-white/5 rounded-lg overflow-hidden border border-white/8 mb-2">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-600/70 to-red-400/50 rounded-lg transition-all duration-700"
                        style={{ width: "100%" }}
                      />
                      <div className="absolute inset-0 flex items-center px-3">
                        <span className="text-white/80 text-xs font-mono truncate">
                          {result.originalUrl}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 rounded-full bg-red-500/30 relative">
                        <div className="absolute inset-y-0 left-0 w-full bg-red-500/60 rounded-full" />
                      </div>
                      <span className="text-slate-600 text-xs">{originalLen} characters</span>
                    </div>
                  </div>

                  {/* VS divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-white/8" />
                    <span className="text-xs text-slate-600 font-semibold uppercase tracking-widest">vs</span>
                    <div className="flex-1 h-px bg-white/8" />
                  </div>

                  {/* Short URL row */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Short URL
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        <span className="text-emerald-300">{shortLen}</span> chars
                      </span>
                    </div>
                    {/* Bar scaled relative to original */}
                    <div className="relative h-7 bg-white/5 rounded-lg overflow-hidden border border-white/8 mb-2">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-600/80 to-indigo-500/60 rounded-lg transition-all duration-700"
                        style={{ width: `${shortBarWidth}%` }}
                      />
                      <div className="absolute inset-0 flex items-center px-3">
                        <span className="text-white/90 text-xs font-mono truncate font-semibold">
                          {redirectUrl}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 rounded-full bg-white/5 relative">
                        <div
                          className="absolute inset-y-0 left-0 bg-violet-500/60 rounded-full transition-all duration-700"
                          style={{ width: `${shortBarWidth}%` }}
                        />
                      </div>
                      <span className="text-slate-600 text-xs">{shortLen} characters</span>
                    </div>
                  </div>

                  {/* Savings summary */}
                  <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/8">
                    {[
                      {
                        label: isLonger ? "Characters Added" : "Characters Saved",
                        value: isLonger ? `+${Math.abs(savedChars)}` : `−${savedChars}`,
                        color: isLonger ? "text-red-400" : "text-emerald-400",
                      },
                      {
                        label: isLonger ? "Size Increase" : "Size Reduction",
                        value: `${reductionPct}%`,
                        color: isLonger ? "text-orange-400" : "text-violet-400",
                      },
                      {
                        label: isLonger ? "Times Longer" : "Times Shorter",
                        value: `${isLonger ? (shortLen / originalLen).toFixed(1) : (originalLen / shortLen).toFixed(1)}×`,
                        color: "text-indigo-400",
                      },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="text-center p-3 rounded-lg bg-white/3 border border-white/6">
                        <p className={`text-xl font-extrabold ${color}`}>{value}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Copy + open actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCopy}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all shadow-lg shadow-violet-500/20"
                >
                  {copied ? (
                    <><Check className="w-4 h-4" /> Copied!</>
                  ) : (
                    <><Copy className="w-4 h-4" /> Copy Short URL</>
                  )}
                </button>
                <a
                  href={redirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white text-sm font-medium transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open
                </a>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white text-sm font-medium transition-all"
                >
                  <BarChart3 className="w-4 h-4" />
                  Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div
              key={title}
              className="group p-6 rounded-2xl bg-white/3 border border-white/8 hover:border-white/15 hover:bg-white/5 transition-all"
            >
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg`}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SDLC Info Section */}
      <section className="relative border-t border-white/10 bg-white/2">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-bold text-white mb-3">
            📋 About This Project — SDLC Overview
          </h2>
          <p className="text-slate-400 mb-8 leading-relaxed max-w-3xl">
            This URL shortener was built following Software Engineering Life
            Cycle principles. Here's how each phase maps to the project:
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                phase: "1. Requirements",
                items: ["Shorten long URLs", "Track click analytics", "Manage links", "Custom short codes"],
                color: "border-violet-500/30 bg-violet-500/5",
                badge: "bg-violet-500/20 text-violet-300",
              },
              {
                phase: "2. Design",
                items: ["React + Tailwind UI", "REST API with Hono", "KV-based data store", "Responsive layout"],
                color: "border-indigo-500/30 bg-indigo-500/5",
                badge: "bg-indigo-500/20 text-indigo-300",
              },
              {
                phase: "3. Implementation",
                items: ["Frontend: React Router", "Backend: Deno + Hono", "Storage: Supabase KV", "State management"],
                color: "border-blue-500/30 bg-blue-500/5",
                badge: "bg-blue-500/20 text-blue-300",
              },
              {
                phase: "4. Testing",
                items: ["URL validation", "Collision detection", "Error handling", "Empty state handling"],
                color: "border-cyan-500/30 bg-cyan-500/5",
                badge: "bg-cyan-500/20 text-cyan-300",
              },
              {
                phase: "5. Deployment",
                items: ["Supabase Edge Functions", "Vite frontend build", "CORS configured", "Env-secured keys"],
                color: "border-emerald-500/30 bg-emerald-500/5",
                badge: "bg-emerald-500/20 text-emerald-300",
              },
              {
                phase: "6. Maintenance",
                items: ["Delete expired links", "Edit link titles", "Daily click tracking", "Analytics dashboard"],
                color: "border-orange-500/30 bg-orange-500/5",
                badge: "bg-orange-500/20 text-orange-300",
              },
            ].map(({ phase, items, color, badge }) => (
              <div
                key={phase}
                className={`p-5 rounded-xl border ${color} transition-all hover:scale-[1.01]`}
              >
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge} mb-3`}>
                  {phase}
                </span>
                <ul className="space-y-1.5">
                  {items.map((item) => (
                    <li key={item} className="text-slate-400 text-sm flex items-start gap-2">
                      <span className="text-slate-600 mt-0.5">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}