import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router";
import {
  BarChart3,
  MousePointerClick,
  Link2,
  TrendingUp,
  Calendar,
  ArrowLeft,
  ExternalLink,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";
import {
  getLinks,
  getLinkAnalytics,
  getStats,
  getShortUrl,
  type LinkData,
  type ClickHistoryEntry,
  type Stats,
} from "../lib/api";

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm shadow-xl">
        <p className="text-slate-400">{label}</p>
        <p className="text-violet-300 font-bold">{payload[0].value} clicks</p>
      </div>
    );
  }
  return null;
}

export function AnalyticsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCode = searchParams.get("code");

  const [links, setLinks] = useState<LinkData[]>([]);
  const [selectedCode, setSelectedCode] = useState<string>(preselectedCode || "");
  const [analytics, setAnalytics] = useState<{
    link: LinkData;
    clickHistory: ClickHistoryEntry[];
  } | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [error, setError] = useState("");

  // Use a ref to always read the current selectedCode inside callbacks
  // without adding it to the dependency array (avoids stale closure)
  const selectedCodeRef = useRef(selectedCode);
  useEffect(() => { selectedCodeRef.current = selectedCode; }, [selectedCode]);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [linksData, statsData] = await Promise.all([getLinks(), getStats()]);
      setLinks(linksData);
      setStats(statsData);
      // Use the ref so we always read the *current* selectedCode, not a stale closure value
      if (!selectedCodeRef.current && linksData.length > 0) {
        setSelectedCode(linksData[0].shortCode);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAnalytics = useCallback(async (code: string) => {
    if (!code) return;
    setAnalyticsLoading(true);
    try {
      const data = await getLinkAnalytics(code);
      setAnalytics(data);
    } catch (err: any) {
      setError(err.message || "Failed to load link analytics.");
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  useEffect(() => {
    if (selectedCode) {
      fetchAnalytics(selectedCode);
    }
  }, [selectedCode, fetchAnalytics]);

  const chartData =
    analytics?.clickHistory.map((d) => ({
      date: formatDateLabel(d.date),
      clicks: d.clicks,
    })) || [];

  const maxClicks = Math.max(...(analytics?.clickHistory.map((d) => d.clicks) || [0]), 1);
  const totalLast30 = analytics?.clickHistory.reduce((s, d) => s + d.clicks, 0) || 0;
  const avgDaily = totalLast30 > 0 ? (totalLast30 / 30).toFixed(1) : "0";
  const peakDay = analytics?.clickHistory.reduce(
    (best, d) => (d.clicks > (best?.clicks || 0) ? d : best),
    analytics.clickHistory[0]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-slate-400 mt-1">
            Track performance and click data for your links
          </p>
        </div>
        <button
          onClick={fetchOverview}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all text-sm self-start"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Overall Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total Links",
              value: stats.totalLinks,
              icon: Link2,
              color: "from-violet-500 to-indigo-600",
              glow: "shadow-violet-500/20",
            },
            {
              label: "Total Clicks",
              value: stats.totalClicks,
              icon: MousePointerClick,
              color: "from-indigo-500 to-blue-600",
              glow: "shadow-indigo-500/20",
            },
            {
              label: "Active Links",
              value: stats.activeLinks,
              icon: TrendingUp,
              color: "from-emerald-500 to-teal-600",
              glow: "shadow-emerald-500/20",
            },
            {
              label: "Clicks Today",
              value: stats.todayClicks,
              icon: Calendar,
              color: "from-orange-500 to-rose-500",
              glow: "shadow-orange-500/20",
            },
          ].map(({ label, value, icon: Icon, color, glow }) => (
            <div
              key={label}
              className="p-5 rounded-2xl bg-white/3 border border-white/8 hover:border-white/15 transition-all"
            >
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-lg ${glow}`}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">{value}</p>
              <p className="text-slate-500 text-sm">{label}</p>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading analytics...</p>
          </div>
        </div>
      ) : links.length === 0 ? (
        <div className="text-center py-20 border border-white/8 rounded-2xl bg-white/2">
          <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-white font-semibold text-lg mb-2">No data yet</h3>
          <p className="text-slate-500 mb-6">
            Create some short links to start seeing analytics
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all"
          >
            Shorten a URL
          </button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Link Selector + List */}
          <div className="lg:col-span-1">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Select a Link
            </h2>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {links.map((link) => (
                <button
                  key={link.shortCode}
                  onClick={() => setSelectedCode(link.shortCode)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedCode === link.shortCode
                      ? "bg-violet-500/15 border-violet-500/40"
                      : "bg-white/3 border-white/8 hover:border-white/15 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {link.title || link.shortCode}
                      </p>
                      <p className="text-violet-400 text-xs font-mono mt-0.5">
                        /{link.shortCode}
                      </p>
                    </div>
                    <span className="shrink-0 flex items-center gap-1 text-xs text-slate-400">
                      <MousePointerClick className="w-3.5 h-3.5" />
                      {link.clicks}
                    </span>
                  </div>
                  <p
                    className="text-slate-600 text-xs mt-1.5 truncate"
                    title={link.originalUrl}
                  >
                    {link.originalUrl}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Analytics Panel */}
          <div className="lg:col-span-2 space-y-5">
            {analyticsLoading ? (
              <div className="flex items-center justify-center h-64 bg-white/3 border border-white/8 rounded-2xl">
                <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
              </div>
            ) : analytics ? (
              <>
                {/* Link Header */}
                <div className="p-5 rounded-2xl bg-white/3 border border-white/8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-white font-semibold text-lg">
                        {analytics.link.title || analytics.link.shortCode}
                      </h3>
                      <a
                        href={getShortUrl(analytics.link)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-violet-400 hover:text-violet-300 text-sm font-mono flex items-center gap-1.5 mt-1 transition-colors"
                      >
                        {getShortUrl(analytics.link)}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <p className="text-slate-500 text-sm mt-1 truncate">
                        {analytics.link.originalUrl}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate("/dashboard")}
                      className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors shrink-0"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                  </div>

                  {/* Mini stats */}
                  <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/8">
                    {[
                      { label: "Total Clicks", value: analytics.link.clicks },
                      { label: "Last 30 Days", value: totalLast30 },
                      { label: "Avg / Day", value: avgDaily },
                    ].map(({ label, value }) => (
                      <div key={label} className="text-center">
                        <p className="text-white text-2xl font-bold">{value}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Area Chart */}
                <div className="p-5 rounded-2xl bg-white/3 border border-white/8">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-white font-semibold">
                      Clicks — Last 30 Days
                    </h3>
                    {peakDay && peakDay.clicks > 0 && (
                      <span className="text-xs text-slate-500">
                        Peak: {formatDateLabel(peakDay.date)} ({peakDay.clicks})
                      </span>
                    )}
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="clickGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: "#64748b", fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        interval={6}
                      />
                      <YAxis
                        tick={{ fill: "#64748b", fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        width={30}
                        domain={[0, maxClicks + 1]}
                        allowDecimals={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="clicks"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        fill="url(#clickGrad)"
                        dot={false}
                        activeDot={{ r: 4, fill: "#8b5cf6" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Bar Chart - last 14 days */}
                <div className="p-5 rounded-2xl bg-white/3 border border-white/8">
                  <h3 className="text-white font-semibold mb-5">
                    Daily Breakdown — Last 14 Days
                  </h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={chartData.slice(-14)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: "#64748b", fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fill: "#64748b", fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        width={30}
                        allowDecimals={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="clicks"
                        fill="#6d28d9"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={32}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}