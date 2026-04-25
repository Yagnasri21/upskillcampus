import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  Link2,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  BarChart3,
  Search,
  RefreshCw,
  Edit3,
  X,
  MousePointerClick,
  Clock,
  Plus,
  AlertTriangle,
  Database,
  LayoutGrid,
  ChevronDown,
  ChevronUp,
  Hash,
} from "lucide-react";
import {
  getLinks,
  deleteLink,
  updateLinkTitle,
  getShortUrl,
  type LinkData,
} from "../lib/api";

function timeAgo(dateStr: string): string {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function fmtDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function truncate(str: string, max = 40): string {
  return str.length > max ? str.slice(0, max) + "…" : str;
}

// ─── DB Table View ───────────────────────────────────────────────────────────
const DB_COLUMNS: { key: keyof LinkData; label: string; mono?: boolean }[] = [
  { key: "shortCode",     label: "short_code",       mono: true },
  { key: "title",         label: "title" },
  { key: "originalUrl",   label: "original_url",     mono: true },
  { key: "clicks",        label: "clicks" },
  { key: "createdAt",     label: "created_at",       mono: true },
  { key: "lastClickedAt", label: "last_clicked_at",  mono: true },
];

function DbTableView({ links, onDelete }: { links: LinkData[]; onDelete: (code: string) => void }) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  if (links.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500">
        <Database className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm">No records in kv_store</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      {/* Table header */}
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-white/5 border-b border-white/10">
            <th className="px-4 py-3 text-left text-slate-500 font-semibold text-xs uppercase tracking-wider w-8">
              #
            </th>
            {DB_COLUMNS.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left text-slate-500 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">
                {col.label}
              </th>
            ))}
            <th className="px-4 py-3 text-left text-slate-500 font-semibold text-xs uppercase tracking-wider">
              actions
            </th>
          </tr>
        </thead>
        <tbody>
          {links.map((link, idx) => {
            const isExpanded = expandedRow === link.shortCode;
            const isConfirming = confirmDelete === link.shortCode;

            return (
              <React.Fragment key={link.shortCode}>
                <tr
                  className={`border-b border-white/5 transition-colors ${isExpanded ? "bg-violet-500/5" : "hover:bg-white/3"}`}
                >
                  {/* Row number */}
                  <td className="px-4 py-3 text-slate-600 text-xs font-mono">{idx + 1}</td>

                  {/* short_code */}
                  <td className="px-4 py-3">
                    <span className="font-mono text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded text-xs">
                      {link.shortCode}
                    </span>
                  </td>

                  {/* title */}
                  <td className="px-4 py-3 text-slate-300 max-w-[120px]">
                    <span className="truncate block text-xs">{link.title || <span className="text-slate-600 italic">null</span>}</span>
                  </td>

                  {/* original_url */}
                  <td className="px-4 py-3 max-w-[200px]">
                    <a
                      href={link.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-slate-400 hover:text-violet-300 truncate block transition-colors"
                      title={link.originalUrl}
                    >
                      {truncate(link.originalUrl, 35)}
                    </a>
                  </td>

                  {/* clicks */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                      link.clicks > 0
                        ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/20"
                        : "bg-white/5 text-slate-500 border border-white/8"
                    }`}>
                      <MousePointerClick className="w-3 h-3" />
                      {link.clicks}
                    </span>
                  </td>

                  {/* created_at */}
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs whitespace-nowrap">
                    {fmtDate(link.createdAt)}
                  </td>

                  {/* last_clicked_at */}
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs whitespace-nowrap">
                    {fmtDate(link.lastClickedAt)}
                  </td>

                  {/* actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setExpandedRow(isExpanded ? null : link.shortCode)}
                        title="View raw JSON"
                        className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-all"
                      >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                      <a
                        href={getShortUrl(link)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open link"
                        className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      {isConfirming ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { onDelete(link.shortCode); setConfirmDelete(null); }}
                            className="px-2 py-1 rounded bg-red-600 hover:bg-red-500 text-white text-xs transition-all"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="px-2 py-1 rounded bg-white/5 text-slate-400 text-xs hover:bg-white/10 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(link.shortCode)}
                          title="Delete record"
                          className="p-1.5 rounded bg-white/5 hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>

                {/* Expanded raw JSON row */}
                {isExpanded && (
                  <tr key={`${link.shortCode}-expanded`} className="bg-slate-900/80">
                    <td colSpan={DB_COLUMNS.length + 2} className="px-4 py-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Hash className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-slate-500 text-xs font-mono">kv_store key: <span className="text-violet-400">url:{link.shortCode}</span></span>
                      </div>
                      <pre className="text-xs font-mono text-emerald-300/80 bg-black/40 rounded-lg p-4 overflow-x-auto border border-white/5 leading-relaxed">
                        {JSON.stringify(link, null, 2)}
                      </pre>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      {/* Footer */}
      <div className="px-4 py-2.5 bg-white/2 border-t border-white/8 flex items-center justify-between">
        <span className="text-slate-600 text-xs font-mono">
          {links.length} row{links.length !== 1 ? "s" : ""} · table: kv_store_cb5e1dd8 · prefix: url:
        </span>
        <span className="text-slate-700 text-xs font-mono">Supabase KV</span>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
type Tab = "cards" | "database";

export function DashboardPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("cards");
  const [links, setLinks] = useState<LinkData[]>([]);
  const [filtered, setFiltered] = useState<LinkData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [deletingCode, setDeletingCode] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getLinks();
      setLinks(data);
      setFiltered(data);
    } catch (err: any) {
      setError(err.message || "Failed to load links.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLinks(); }, [fetchLinks]);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(links);
    } else {
      const q = search.toLowerCase();
      setFiltered(
        links.filter(
          (l) =>
            l.originalUrl.toLowerCase().includes(q) ||
            l.shortCode.toLowerCase().includes(q) ||
            l.title.toLowerCase().includes(q)
        )
      );
    }
  }, [search, links]);

  const handleCopy = async (link: LinkData) => {
    await navigator.clipboard.writeText(getShortUrl(link));
    setCopiedCode(link.shortCode);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDelete = async (code: string) => {
    setDeletingCode(code);
    try {
      await deleteLink(code);
      setLinks((prev) => prev.filter((l) => l.shortCode !== code));
      setConfirmDelete(null);
    } catch (err: any) {
      setError(err.message || "Failed to delete link.");
    } finally {
      setDeletingCode(null);
    }
  };

  const handleEditSave = async (code: string) => {
    try {
      const updated = await updateLinkTitle(code, editTitle);
      setLinks((prev) => prev.map((l) => (l.shortCode === code ? updated : l)));
      setEditingCode(null);
    } catch (err: any) {
      setError(err.message || "Failed to update title.");
    }
  };

  const totalClicks = links.reduce((s, l) => s + (l.clicks || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Manage and monitor all your shortened links</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchLinks}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-medium transition-all shadow-lg shadow-violet-500/20"
          >
            <Plus className="w-4 h-4" />
            New Link
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Links",  value: links.length,                                   icon: Link2,             color: "text-violet-400" },
          { label: "Total Clicks", value: totalClicks,                                    icon: MousePointerClick, color: "text-indigo-400" },
          { label: "Active Links", value: links.filter((l) => l.clicks > 0).length,      icon: BarChart3,         color: "text-emerald-400" },
          { label: "Newest Link",  value: links[0] ? timeAgo(links[0].createdAt) : "—",  icon: Clock,             color: "text-orange-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="p-4 rounded-xl bg-white/3 border border-white/8 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/5">
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div>
              <p className="text-slate-500 text-xs">{label}</p>
              <p className="text-white font-bold text-lg leading-tight">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
          <button onClick={() => setError("")} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* View Tabs */}
      <div className="flex items-center gap-1 mb-6 p-1 bg-white/3 border border-white/8 rounded-xl w-fit">
        <button
          onClick={() => setTab("cards")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === "cards"
              ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          Cards
        </button>
        <button
          onClick={() => setTab("database")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === "database"
              ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Database className="w-4 h-4" />
          Database
          <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded-full font-mono">{links.length}</span>
        </button>
      </div>

      {/* Search (shared) */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search by URL, code, or title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/40 transition-all text-sm"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading from database...</p>
          </div>
        </div>
      ) : tab === "database" ? (
        /* ── DATABASE TAB ── */
        <div>
          {/* DB header bar */}
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400 text-sm font-mono">kv_store_cb5e1dd8</span>
            </div>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500 text-xs font-mono">prefix: <span className="text-violet-400">url:*</span></span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500 text-xs">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</span>
          </div>

          <DbTableView links={filtered} onDelete={handleDelete} />
        </div>
      ) : filtered.length === 0 ? (
        /* ── EMPTY STATE ── */
        <div className="text-center py-20 border border-white/8 rounded-2xl bg-white/2">
          <Link2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-white font-semibold text-lg mb-2">
            {search ? "No links match your search" : "No links yet"}
          </h3>
          <p className="text-slate-500 mb-6">
            {search ? "Try a different search term" : "Create your first short link to get started"}
          </p>
          {!search && (
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all"
            >
              Shorten a URL
            </button>
          )}
        </div>
      ) : (
        /* ── CARDS TAB ── */
        <div className="space-y-3">
          {filtered.map((link) => {
            const shortUrl = getShortUrl(link);
            const isEditing = editingCode === link.shortCode;
            const isDeleting = deletingCode === link.shortCode;
            const isConfirming = confirmDelete === link.shortCode;

            return (
              <div
                key={link.shortCode}
                className="group p-5 rounded-xl bg-white/3 border border-white/8 hover:border-white/15 hover:bg-white/5 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Link info */}
                  <div className="flex-1 min-w-0">
                    {/* Title / edit */}
                    {isEditing ? (
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleEditSave(link.shortCode);
                            if (e.key === "Escape") setEditingCode(null);
                          }}
                          autoFocus
                          className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-violet-500/40 text-white text-sm focus:outline-none"
                          placeholder="Link title..."
                        />
                        <button
                          onClick={() => handleEditSave(link.shortCode)}
                          className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs transition-all"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingCode(null)}
                          className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium text-sm truncate">
                          {link.title || link.shortCode}
                        </span>
                        <button
                          onClick={() => { setEditingCode(link.shortCode); setEditTitle(link.title || ""); }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-slate-300"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Short URL */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <a
                        href={shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-violet-400 hover:text-violet-300 font-mono text-sm transition-colors truncate"
                      >
                        {shortUrl}
                      </a>
                    </div>

                    {/* Original URL */}
                    <p className="text-slate-500 text-xs truncate" title={link.originalUrl}>
                      {truncate(link.originalUrl, 70)}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <MousePointerClick className="w-3.5 h-3.5" />
                        <span className="text-white font-medium">{link.clicks}</span> clicks
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        {timeAgo(link.createdAt)}
                      </span>
                      {link.lastClickedAt && (
                        <span className="text-xs text-slate-600">
                          Last click {timeAgo(link.lastClickedAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCopy(link)}
                      title="Copy short URL"
                      className="p-2 rounded-lg bg-white/5 hover:bg-violet-500/20 hover:text-violet-300 text-slate-400 transition-all"
                    >
                      {copiedCode === link.shortCode ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <a
                      href={shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open link"
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => navigate(`/analytics?code=${link.shortCode}`)}
                      title="View analytics"
                      className="p-2 rounded-lg bg-white/5 hover:bg-indigo-500/20 hover:text-indigo-300 text-slate-400 transition-all"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </button>
                    {isConfirming ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-red-400">Delete?</span>
                        <button
                          onClick={() => handleDelete(link.shortCode)}
                          disabled={isDeleting}
                          className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs transition-all disabled:opacity-60"
                        >
                          {isDeleting ? "..." : "Yes"}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 text-xs transition-all"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(link.shortCode)}
                        title="Delete link"
                        className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-slate-400 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "cards" && filtered.length > 0 && (
        <p className="text-slate-600 text-sm text-center mt-6">
          Showing {filtered.length} of {links.length} links
        </p>
      )}
    </div>
  );
}