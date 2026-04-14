import React, { useState } from "react";
import { RefreshCw, ChevronDown, ChevronUp, CircleAlert as AlertCircle, CircleCheck as CheckCircle, Circle as XCircle, Clock, Pause } from "lucide-react";

// ── Sample data (no Tauri IPC required) ─────────────────────────────────────

const SAMPLE_PIPELINES = [
  { id: "p1", name: "Support Ticket Triage", description: "Auto-classify and route incoming support tickets" },
  { id: "p2", name: "Contract Review Bot", description: "Extract key terms from uploaded PDFs" },
  { id: "p3", name: "Lead Scoring Pipeline", description: undefined },
];

const SAMPLE_RUNS = [
  { id: "r1", pipeline_id: "p1", status: "in_progress", started_at: Math.floor(Date.now() / 1000) - 1800, outcomes_count: 84 },
  { id: "r2", pipeline_id: "p1", status: "completed",   started_at: Math.floor(Date.now() / 1000) - 86400, ended_at: Math.floor(Date.now() / 1000) - 80000, outcomes_count: 217 },
  { id: "r3", pipeline_id: "p2", status: "failed",      started_at: Math.floor(Date.now() / 1000) - 43200, outcomes_count: 12 },
  { id: "r4", pipeline_id: "p3", status: "paused",      started_at: Math.floor(Date.now() / 1000) - 3600, outcomes_count: 41 },
];

const SAMPLE_BUDGETS = [
  { id: "b1", pipeline_id: "p1", period: "2026-04", allocated_cents: 500000, spent_cents: 312000 },
  { id: "b2", pipeline_id: "p2", period: "2026-04", allocated_cents: 250000, spent_cents: 241000 },
  { id: "b3", pipeline_id: "p3", period: "2026-04", allocated_cents: 150000, spent_cents: 18000 },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatCurrency = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

const formatAge = (ts: number) => {
  const diff = Math.floor(Date.now() / 1000) - ts;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const STATUS_STYLES: Record<string, { badge: string; icon: React.ReactNode; label: string }> = {
  in_progress: { badge: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: <RefreshCw size={12} className="animate-spin" />, label: "In Progress" },
  completed:   { badge: "bg-green-100  text-green-800  border-green-200",  icon: <CheckCircle size={12} />,                       label: "Completed"  },
  failed:      { badge: "bg-red-100    text-red-800    border-red-200",    icon: <XCircle size={12} />,                           label: "Failed"     },
  paused:      { badge: "bg-gray-100   text-gray-700   border-gray-200",   icon: <Pause size={12} />,                             label: "Paused"     },
};

const UTIL_COLOR = (pct: number) =>
  pct >= 100 ? "bg-red-500" : pct >= 80 ? "bg-yellow-500" : "bg-green-500";

// ── Primitive components ──────────────────────────────────────────────────────

const Section: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
  <section className="mb-16">
    <div className="mb-6 pb-4 border-b border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
    {children}
  </section>
);

const SubSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-10">
    <h3 className="text-base font-semibold text-gray-700 mb-4 uppercase tracking-wide text-xs">{title}</h3>
    {children}
  </div>
);

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-xs text-gray-400 mt-2 font-mono">{children}</p>
);

// ── Color Palette ─────────────────────────────────────────────────────────────

const ColorSwatch: React.FC<{ hex: string; name: string; textDark?: boolean }> = ({ hex, name, textDark }) => (
  <div className="flex flex-col items-center gap-1">
    <div className="w-16 h-16 rounded-lg border border-black/10 shadow-sm" style={{ backgroundColor: hex }} />
    <span className={`text-xs font-mono ${textDark ? "text-gray-800" : "text-gray-600"}`}>{name}</span>
    <span className="text-xs text-gray-400 font-mono">{hex}</span>
  </div>
);

// ── Typography specimens ──────────────────────────────────────────────────────

const TypeSpecimen: React.FC<{ label: string; className: string; sample: string }> = ({ label, className, sample }) => (
  <div className="flex items-baseline gap-6 py-3 border-b border-gray-100 last:border-0">
    <span className="w-48 text-xs font-mono text-gray-400 shrink-0">{label}</span>
    <span className={`${className} text-gray-900`}>{sample}</span>
  </div>
);

// ── Button Showcase ───────────────────────────────────────────────────────────

const ButtonShowcase: React.FC = () => (
  <div className="flex flex-wrap gap-4 items-center">
    <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
      Primary
    </button>
    <button className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors">
      Secondary
    </button>
    <button className="px-4 py-2 text-blue-600 border border-blue-300 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors">
      Outline
    </button>
    <button className="px-4 py-2 text-red-600 border border-red-300 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors">
      Destructive
    </button>
    <button disabled className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg opacity-50 cursor-not-allowed">
      Disabled
    </button>
    <button className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition-colors">
      +$100
    </button>
    <button className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors">
      Delete
    </button>
    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
      <RefreshCw size={16} />
      Sync Now
    </button>
  </div>
);

// ── Status Badges ─────────────────────────────────────────────────────────────

const BadgeShowcase: React.FC = () => (
  <div className="flex flex-wrap gap-3 items-center">
    {Object.entries(STATUS_STYLES).map(([key, s]) => (
      <span key={key} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${s.badge}`}>
        {s.icon}
        {s.label}
      </span>
    ))}
    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
      3 pending
    </span>
    <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
      Over budget
    </span>
  </div>
);

// ── Metric Cards ──────────────────────────────────────────────────────────────

const METRIC_COLORS: Record<string, { card: string; text: string }> = {
  blue:   { card: "bg-blue-50   border-blue-200",   text: "text-blue-900"   },
  red:    { card: "bg-red-50    border-red-200",    text: "text-red-900"    },
  green:  { card: "bg-green-50  border-green-200",  text: "text-green-900"  },
  purple: { card: "bg-purple-50 border-purple-200", text: "text-purple-900" },
  orange: { card: "bg-orange-50 border-orange-200", text: "text-orange-900" },
};

const MetricCard: React.FC<{ title: string; value: string | number; unit?: string; color: string; large?: boolean }> = ({
  title, value, unit, color, large,
}) => {
  const c = METRIC_COLORS[color] ?? METRIC_COLORS.blue;
  return (
    <div className={`${c.card} border rounded-lg p-6`}>
      <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
      <p className={`${c.text} ${large ? "text-4xl" : "text-3xl"} font-bold`}>
        {value}
        {unit && <span className={`text-lg ml-1 ${c.text}`}>{unit}</span>}
      </p>
    </div>
  );
};

// ── Pipeline Card ─────────────────────────────────────────────────────────────

const PipelineCard: React.FC<{ pipeline: typeof SAMPLE_PIPELINES[0] }> = ({ pipeline }) => (
  <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between hover:shadow-md transition-shadow">
    <div className="flex-1">
      <h3 className="text-base font-semibold text-gray-900">{pipeline.name}</h3>
      {pipeline.description && <p className="text-gray-500 text-sm mt-0.5">{pipeline.description}</p>}
      <p className="text-gray-400 text-xs mt-1 font-mono">{pipeline.id}</p>
    </div>
    <div className="flex gap-2 ml-4">
      <button className="px-3 py-1.5 text-sm text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors">View</button>
      <button className="px-3 py-1.5 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors">Delete</button>
    </div>
  </div>
);

// ── Run Card ──────────────────────────────────────────────────────────────────

const RunCard: React.FC<{ run: typeof SAMPLE_RUNS[0] }> = ({ run }) => {
  const pipeline = SAMPLE_PIPELINES.find((p) => p.id === run.pipeline_id);
  const s = STATUS_STYLES[run.status];
  return (
    <div className="bg-white rounded-lg shadow p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-gray-900">{pipeline?.name ?? "Unknown"}</p>
          <p className="text-xs text-gray-400 font-mono">{run.id}</p>
        </div>
        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${s.badge}`}>
          {s.icon} {s.label}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div>
          <p className="text-xs text-gray-500">Outcomes</p>
          <p className="text-xl font-bold text-gray-900">{run.outcomes_count}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Started</p>
          <p className="text-sm text-gray-700">{formatAge(run.started_at)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Duration</p>
          <p className="text-sm text-gray-700">
            {run.ended_at
              ? `${Math.floor((run.ended_at - run.started_at) / 60)}m`
              : `${Math.floor((Math.floor(Date.now() / 1000) - run.started_at) / 60)}m`}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        {run.status === "in_progress" && (
          <>
            <button className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200">Pause</button>
            <button className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200">Complete</button>
            <button className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200">Mark Failed</button>
          </>
        )}
        {run.status === "paused" && (
          <button className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200">Resume</button>
        )}
        {(run.status === "completed" || run.status === "failed") && (
          <span className="text-xs text-gray-400">No actions available</span>
        )}
      </div>
    </div>
  );
};

// ── Budget Card ───────────────────────────────────────────────────────────────

const BudgetCard: React.FC<{ budget: typeof SAMPLE_BUDGETS[0] }> = ({ budget }) => {
  const pct = (budget.spent_cents / budget.allocated_cents) * 100;
  const pipeline = SAMPLE_PIPELINES.find((p) => p.id === budget.pipeline_id);
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-4">{pipeline?.name}</h3>
      <div className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Allocated</span>
          <span className="font-semibold text-gray-900">{formatCurrency(budget.allocated_cents)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Spent</span>
          <span className="font-semibold text-gray-900">{formatCurrency(budget.spent_cents)}</span>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-gray-500">Utilization</span>
            <span className={`font-semibold ${pct >= 100 ? "text-red-600" : "text-gray-900"}`}>{pct.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`${UTIL_COLOR(pct)} h-3 rounded-full transition-all`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
        </div>
        <div className="flex justify-between text-sm pt-1">
          <span className="text-gray-500">Remaining</span>
          <span className={`font-semibold ${pct > 100 ? "text-red-600" : "text-green-600"}`}>
            {formatCurrency(budget.allocated_cents - budget.spent_cents)}
          </span>
        </div>
      </div>
    </div>
  );
};

// ── Form Examples ─────────────────────────────────────────────────────────────

const FormExamples: React.FC = () => (
  <div className="bg-white rounded-lg shadow p-6 max-w-lg">
    <h3 className="text-base font-semibold text-gray-900 mb-4">Create Budget</h3>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Pipeline</label>
        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
          {SAMPLE_PIPELINES.map((p) => <option key={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
        <input type="month" defaultValue="2026-04" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Allocated Amount ($)</label>
        <input type="number" min="0.01" step="0.01" placeholder="0.00" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-gray-400">(optional)</span></label>
        <textarea rows={3} placeholder="Describe this budget…" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
      </div>
      <div className="flex gap-3 pt-1">
        <button className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">Create</button>
        <button className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
      </div>
    </div>
  </div>
);

// ── Notification/Alert patterns ───────────────────────────────────────────────

const Notifications: React.FC = () => (
  <div className="space-y-3 max-w-lg">
    <div className="bg-red-50 border-l-4 border-red-400 p-4 flex items-center justify-between rounded-r-lg">
      <div className="flex items-center gap-3">
        <AlertCircle size={18} className="text-red-500 shrink-0" />
        <p className="text-sm text-red-800">Failed to sync 3 entries. Check your connection.</p>
      </div>
      <button className="text-red-400 hover:text-red-600 text-lg leading-none ml-4">×</button>
    </div>
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
      <div className="flex items-center gap-3">
        <AlertCircle size={18} className="text-yellow-500 shrink-0" />
        <p className="text-sm text-yellow-800">Contract Review Bot is at 96% budget utilization.</p>
      </div>
    </div>
    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
      <div className="flex items-center gap-3">
        <CheckCircle size={18} className="text-green-500 shrink-0" />
        <p className="text-sm text-green-800">All changes synced to cloud successfully.</p>
      </div>
    </div>
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
      <div className="flex items-center gap-3">
        <Clock size={18} className="text-blue-500 shrink-0" />
        <p className="text-sm text-blue-800">5 changes queued, will sync when connection is restored.</p>
      </div>
    </div>
  </div>
);

// ── Sync Panel ────────────────────────────────────────────────────────────────

const SyncPanelDemo: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden max-w-lg">
      <button onClick={() => setOpen(!open)} className="w-full px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition bg-white">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" />
          <div className="text-left">
            <p className="text-sm font-medium text-gray-900">5 pending changes</p>
            <p className="text-xs text-gray-500">Last sync: 12m ago</p>
          </div>
        </div>
        {open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>
      {open && (
        <div className="border-t border-gray-200 px-5 py-4 bg-gray-50 space-y-4">
          <div className="text-sm flex justify-between">
            <span className="text-gray-500">Pending Changes</span>
            <span className="font-semibold text-gray-900">5</span>
          </div>
          <div className="text-sm flex justify-between">
            <span className="text-gray-500">Last Sync</span>
            <span className="text-gray-900">12m ago</span>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
            Your changes are saved locally and will sync automatically when online.
          </div>
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            <RefreshCw size={16} />
            Sync Now
          </button>
        </div>
      )}
    </div>
  );
};

// ── Conflict Resolver ─────────────────────────────────────────────────────────

const ConflictDemo: React.FC = () => (
  <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500 max-w-2xl">
    <h3 className="text-base font-bold text-gray-900 mb-4">Conflict: Budget b2</h3>
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="bg-blue-50 rounded p-4 border border-blue-200">
        <h4 className="font-semibold text-blue-900 text-sm mb-1">Your Version</h4>
        <p className="text-xs text-blue-600 mb-3">Changes on your device</p>
        <pre className="bg-white p-3 rounded text-xs overflow-auto max-h-40 border border-blue-100">{`{
  "allocated_cents": 250000,
  "spent_cents": 241000,
  "period": "2026-04"
}`}</pre>
        <button className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1.5 px-3 rounded transition-colors">
          Keep Your Version
        </button>
      </div>
      <div className="bg-green-50 rounded p-4 border border-green-200">
        <h4 className="font-semibold text-green-900 text-sm mb-1">Cloud Version</h4>
        <p className="text-xs text-green-600 mb-3">Latest from cloud</p>
        <pre className="bg-white p-3 rounded text-xs overflow-auto max-h-40 border border-green-100">{`{
  "allocated_cents": 275000,
  "spent_cents": 241000,
  "period": "2026-04"
}`}</pre>
        <button className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-1.5 px-3 rounded transition-colors">
          Use Cloud Version
        </button>
      </div>
    </div>
    <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
      <p className="text-xs text-yellow-800">
        <strong>Note:</strong> Financial data requires careful review. Choose the version with the most recent accurate information.
      </p>
    </div>
  </div>
);

// ── Progress Bars ─────────────────────────────────────────────────────────────

const ProgressBars: React.FC = () => (
  <div className="space-y-4 max-w-md">
    {[
      { label: "Support Ticket Triage", pct: 62.4 },
      { label: "Contract Review Bot",   pct: 96.4 },
      { label: "Lead Scoring Pipeline", pct: 12.0 },
    ].map(({ label, pct }) => (
      <div key={label}>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-700">{label}</span>
          <span className={`font-semibold ${pct >= 100 ? "text-red-600" : pct >= 80 ? "text-yellow-700" : "text-gray-900"}`}>{pct.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className={`${UTIL_COLOR(pct)} h-2.5 rounded-full transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
      </div>
    ))}
  </div>
);

// ── Loading / Empty States ────────────────────────────────────────────────────

const States: React.FC = () => (
  <div className="flex gap-6 flex-wrap">
    <div className="bg-white rounded-lg shadow p-8 flex flex-col items-center w-72">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-3" />
      <p className="text-sm text-gray-500">Loading dashboard...</p>
    </div>
    <div className="bg-white rounded-lg shadow p-8 flex flex-col items-center w-72">
      <p className="text-gray-600 mb-2 font-medium">No pipelines yet</p>
      <p className="text-gray-400 text-sm text-center">Create your first pipeline to get started tracking ROI.</p>
    </div>
    <div className="bg-white rounded-lg shadow p-8 flex flex-col items-center w-72">
      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
        <CheckCircle size={24} className="text-green-600" />
      </div>
      <p className="text-gray-700 font-medium">All synced</p>
      <p className="text-gray-400 text-sm mt-1">Last sync: just now</p>
    </div>
  </div>
);

// ── Nav Preview ───────────────────────────────────────────────────────────────

const NavPreview: React.FC = () => {
  const [active, setActive] = useState("dashboard");
  const items = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "pipelines", label: "Pipelines", icon: "⚙️" },
    { id: "runs",      label: "Runs",      icon: "▶️" },
    { id: "budgets",   label: "Budgets",   icon: "💰" },
    { id: "settings",  label: "Settings",  icon: "⚙️" },
  ];
  return (
    <div className="flex gap-6 flex-wrap">
      {/* Header preview */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between w-full max-w-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <span className="text-lg font-bold text-gray-900">Orchestra Box Office</span>
          <span className="text-xs text-gray-400">ROI Tracking for AI Pipelines</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-gray-600">Online</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-50 rounded-full border border-yellow-200">
            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-xs text-yellow-800">5 pending</span>
          </div>
          <div className="w-7 h-7 rounded-full bg-gray-300" />
        </div>
      </div>

      {/* Sidebar preview */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 w-52 shadow-sm">
        <nav className="space-y-1 mb-6">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 text-sm transition-colors ${
                active === item.id ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="border-t border-gray-200 pt-4">
          <p className="text-xs font-semibold text-gray-700 mb-2">Quick Stats</p>
          {[["Total Cost", "$9,012"], ["ROI", "24.1%"], ["Outcomes", "354"]].map(([k, v]) => (
            <div key={k} className="flex justify-between text-xs py-1">
              <span className="text-gray-500">{k}</span>
              <span className="font-semibold text-gray-900">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Full Dashboard Preview ────────────────────────────────────────────────────

const DashboardPreview: React.FC = () => {
  const totalCost = SAMPLE_BUDGETS.reduce((s, b) => s + b.spent_cents, 0);
  const totalOutcomes = SAMPLE_RUNS.reduce((s, r) => s + r.outcomes_count, 0);
  const roi = totalOutcomes > 0 && totalCost > 0 ? ((totalOutcomes / totalCost) * 10000).toFixed(2) : "0.00";
  const activeRuns = SAMPLE_RUNS.filter((r) => r.status === "in_progress" || r.status === "paused").length;

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Pipelines" value={SAMPLE_PIPELINES.length} color="blue" />
        <MetricCard title="Total Cost"      value={formatCurrency(totalCost)}   color="red" />
        <MetricCard title="Total Outcomes"  value={totalOutcomes}               color="green" />
        <MetricCard title="Active Runs"     value={activeRuns}                  color="orange" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <MetricCard title="ROI" value={roi} unit="%" color="green" large />
        </div>
        <MetricCard title="Avg Cost / Outcome" value={formatCurrency(Math.round(totalCost / (totalOutcomes || 1)))} color="blue" large />
      </div>
      <div className="bg-white rounded-lg shadow p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Budget Utilization %</h3>
        <ProgressBars />
      </div>
    </div>
  );
};

// ── Icon showcase ─────────────────────────────────────────────────────────────

const Icons: React.FC = () => {
  const icons = [
    { label: "RefreshCw", el: <RefreshCw size={20} /> },
    { label: "ChevronDown", el: <ChevronDown size={20} /> },
    { label: "ChevronUp", el: <ChevronUp size={20} /> },
    { label: "AlertCircle", el: <AlertCircle size={20} /> },
    { label: "CheckCircle", el: <CheckCircle size={20} /> },
    { label: "XCircle", el: <XCircle size={20} /> },
    { label: "Clock", el: <Clock size={20} /> },
    { label: "Pause", el: <Pause size={20} /> },
  ];
  return (
    <div className="flex flex-wrap gap-6">
      {icons.map(({ label, el }) => (
        <div key={label} className="flex flex-col items-center gap-1.5">
          <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 shadow-sm flex items-center justify-center text-gray-700">{el}</div>
          <span className="text-xs font-mono text-gray-500">{label}</span>
        </div>
      ))}
    </div>
  );
};

// ── Root ──────────────────────────────────────────────────────────────────────

export const DesignSystem: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Orchestra Box Office</h1>
            <p className="text-xs text-gray-400 mt-0.5">Design System Prototype</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            <span className="text-xs text-gray-500">v0.1.0 — Tailwind 4 + React 18</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-12">

        {/* ── Colors ── */}
        <Section title="Color Palette" subtitle="Primary blue + semantic status colors">
          <SubSection title="Primary">
            <div className="flex flex-wrap gap-4">
              {[
                { hex: "#f0f9ff", name: "primary-50" }, { hex: "#e0f2fe", name: "primary-100" },
                { hex: "#0ea5e9", name: "primary-500" }, { hex: "#0284c7", name: "primary-600" },
                { hex: "#0369a1", name: "primary-700" }, { hex: "#0c2d6b", name: "primary-900" },
              ].map((s) => <ColorSwatch key={s.hex} {...s} />)}
            </div>
            <Label>tailwind.config.ts → theme.extend.colors.primary</Label>
          </SubSection>
          <SubSection title="Semantic">
            <div className="flex flex-wrap gap-4">
              {[
                { hex: "#22c55e", name: "green-500" }, { hex: "#dcfce7", name: "green-100" },
                { hex: "#f59e0b", name: "yellow-500" }, { hex: "#fef9c3", name: "yellow-100" },
                { hex: "#ef4444", name: "red-500" }, { hex: "#fee2e2", name: "red-100" },
                { hex: "#a855f7", name: "purple-500" }, { hex: "#f5f3ff", name: "purple-50" },
                { hex: "#f97316", name: "orange-500" }, { hex: "#fff7ed", name: "orange-50" },
              ].map((s) => <ColorSwatch key={s.hex} {...s} />)}
            </div>
          </SubSection>
          <SubSection title="Neutral">
            <div className="flex flex-wrap gap-4">
              {[
                { hex: "#f9fafb", name: "gray-50" }, { hex: "#f3f4f6", name: "gray-100" },
                { hex: "#e5e7eb", name: "gray-200" }, { hex: "#6b7280", name: "gray-500" },
                { hex: "#374151", name: "gray-700" }, { hex: "#111827", name: "gray-900" },
                { hex: "#ffffff", name: "white" },
              ].map((s) => <ColorSwatch key={s.hex} {...s} />)}
            </div>
          </SubSection>
        </Section>

        {/* ── Typography ── */}
        <Section title="Typography" subtitle="Inter sans-serif — system fallback stack">
          <div className="bg-white rounded-lg shadow p-6">
            <TypeSpecimen label="text-3xl font-bold"    className="text-3xl font-bold"    sample="Pipeline ROI Dashboard" />
            <TypeSpecimen label="text-2xl font-bold"    className="text-2xl font-bold"    sample="Budget Tracking" />
            <TypeSpecimen label="text-xl font-semibold" className="text-xl font-semibold" sample="Contract Review Bot" />
            <TypeSpecimen label="text-lg font-semibold" className="text-lg font-semibold" sample="Create Budget" />
            <TypeSpecimen label="text-base font-medium" className="text-base font-medium" sample="Support Ticket Triage — AI pipeline" />
            <TypeSpecimen label="text-sm"               className="text-sm"               sample="Sync completed successfully. All 217 entries uploaded to cloud." />
            <TypeSpecimen label="text-xs font-mono"     className="text-xs font-mono text-gray-500" sample="p-uuid-4a1b2c3d · 2026-04-14T10:23:11Z" />
          </div>
        </Section>

        {/* ── Icons ── */}
        <Section title="Icons" subtitle="lucide-react — 20px default, text-gray-700">
          <Icons />
        </Section>

        {/* ── Buttons ── */}
        <Section title="Buttons" subtitle="Variants + states">
          <div className="bg-white rounded-lg shadow p-6">
            <SubSection title="Variants"><ButtonShowcase /></SubSection>
          </div>
        </Section>

        {/* ── Badges ── */}
        <Section title="Badges & Status" subtitle="Run status + sync state chips">
          <div className="bg-white rounded-lg shadow p-6">
            <BadgeShowcase />
          </div>
        </Section>

        {/* ── Metric Cards ── */}
        <Section title="Metric Cards" subtitle="KPI display across 5 color themes">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <MetricCard title="Total Pipelines" value={3}          color="blue" />
            <MetricCard title="Total Cost"      value="$5,710"     color="red" />
            <MetricCard title="Total Outcomes"  value={354}        color="green" />
            <MetricCard title="Active Runs"     value={2}          color="purple" />
            <MetricCard title="Avg Cost / Run"  value="$1,903"     color="orange" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <MetricCard title="ROI" value="24.18" unit="%" color="green" large />
            <MetricCard title="Budget Utilization" value="63.4" unit="%" color="orange" large />
          </div>
          <Label>components/Dashboard.tsx → MetricCard</Label>
        </Section>

        {/* ── Progress Bars ── */}
        <Section title="Progress Bars" subtitle="Budget utilization with semantic threshold colors">
          <div className="bg-white rounded-lg shadow p-6">
            <ProgressBars />
          </div>
          <Label>Green &lt;80% · Yellow 80-99% · Red ≥100%</Label>
        </Section>

        {/* ── Form ── */}
        <Section title="Forms" subtitle="Standard form with label, input, select, textarea pattern">
          <FormExamples />
        </Section>

        {/* ── Notifications ── */}
        <Section title="Notifications & Alerts" subtitle="Error, warning, success, info banners">
          <Notifications />
        </Section>

        {/* ── Sync Panel ── */}
        <Section title="Sync Panel" subtitle="Collapsible footer with pending count + manual trigger">
          <SyncPanelDemo />
          <Label>components/SyncPanel.tsx</Label>
        </Section>

        {/* ── Conflict Resolver ── */}
        <Section title="Conflict Resolver" subtitle="Side-by-side diff for financial data — always manual resolution">
          <ConflictDemo />
          <Label>components/ConflictResolver.tsx</Label>
        </Section>

        {/* ── Cards ── */}
        <Section title="Pipeline Cards" subtitle="bg-white rounded-lg shadow with hover elevation">
          <div className="space-y-3">
            {SAMPLE_PIPELINES.map((p) => <PipelineCard key={p.id} pipeline={p} />)}
          </div>
          <Label>components/PipelineList.tsx</Label>
        </Section>

        <Section title="Run Cards" subtitle="Status-aware cards with contextual action buttons">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SAMPLE_RUNS.map((r) => <RunCard key={r.id} run={r} />)}
          </div>
          <Label>components/RunsPage.tsx</Label>
        </Section>

        <Section title="Budget Cards" subtitle="Metric + utilization bar summary per pipeline">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SAMPLE_BUDGETS.map((b) => <BudgetCard key={b.id} budget={b} />)}
          </div>
          <Label>components/BudgetPage.tsx</Label>
        </Section>

        {/* ── Loading / Empty States ── */}
        <Section title="Loading & Empty States" subtitle="Spinner · empty message · success confirmation">
          <States />
        </Section>

        {/* ── Navigation ── */}
        <Section title="Navigation" subtitle="Header bar + sidebar with active-state highlight">
          <NavPreview />
          <Label>components/Header.tsx + Sidebar.tsx</Label>
        </Section>

        {/* ── Full Dashboard ── */}
        <Section title="Dashboard Preview" subtitle="Composite view — all primitives assembled">
          <DashboardPreview />
        </Section>

        {/* ── Spacing scale ── */}
        <Section title="Spacing Scale" subtitle="8px base grid — Tailwind units 1–12">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-end gap-3 flex-wrap">
              {[1,2,3,4,5,6,8,10,12].map((n) => (
                <div key={n} className="flex flex-col items-center gap-1.5">
                  <div className="bg-blue-400 rounded" style={{ width: `${n * 4}px`, height: `${n * 4}px` }} />
                  <span className="text-xs font-mono text-gray-500">{n}</span>
                  <span className="text-xs text-gray-400">{n * 4}px</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── Border Radius ── */}
        <Section title="Border Radius" subtitle="rounded · rounded-lg · rounded-full">
          <div className="bg-white rounded-lg shadow p-6 flex gap-6 items-center flex-wrap">
            {[
              { cls: "rounded", label: "rounded\n4px" },
              { cls: "rounded-lg", label: "rounded-lg\n8px" },
              { cls: "rounded-xl", label: "rounded-xl\n12px" },
              { cls: "rounded-full", label: "rounded-full" },
            ].map(({ cls, label }) => (
              <div key={cls} className="flex flex-col items-center gap-2">
                <div className={`w-16 h-16 bg-blue-100 border-2 border-blue-400 ${cls}`} />
                <span className="text-xs font-mono text-gray-500 text-center whitespace-pre">{label}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Shadow scale ── */}
        <Section title="Shadow Scale" subtitle="shadow · shadow-md · shadow-lg">
          <div className="flex gap-6 flex-wrap">
            {["shadow", "shadow-md", "shadow-lg"].map((s) => (
              <div key={s} className="flex flex-col items-center gap-2">
                <div className={`w-24 h-24 bg-white rounded-lg ${s} flex items-center justify-center text-xs text-gray-500 font-mono`}>
                  {s}
                </div>
              </div>
            ))}
          </div>
        </Section>

      </div>
    </div>
  );
};
