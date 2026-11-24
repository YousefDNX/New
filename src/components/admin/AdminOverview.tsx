import { useState, useEffect } from "react";
import {
  Users,
  MessageSquare,
  AlertTriangle,
  BookOpen,
  Activity,
  ShieldCheck,
  RefreshCw,
  Server,
  Zap,
  HeartPulse,
  Terminal,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchPlatformStats, type PlatformStats } from "@/lib/support-service";
import {
  btcLogger,
  checkBtcEcosystemHealth,
  getAiUsageMetrics,
  type AiUsageMetrics,
  type DiagnosticLogEntry,
  type EcosystemHealthReport,
} from "@/lib/observability";
import { BRAND } from "@/config/brand";

interface AdminOverviewProps {
  onNavigateTab?: (
    tab: "overview" | "tickets" | "articles" | "moderation" | "users" | "audit",
  ) => void;
}

export function AdminOverview({ onNavigateTab }: AdminOverviewProps) {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [healthReport, setHealthReport] = useState<EcosystemHealthReport | null>(null);
  const [checkingHealth, setCheckingHealth] = useState(false);
  const [aiMetrics, setAiMetrics] = useState<AiUsageMetrics>(() => getAiUsageMetrics());
  const [logs, setLogs] = useState<DiagnosticLogEntry[]>(() => btcLogger.getRecentLogs(20));

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await fetchPlatformStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load platform stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const runHealthCheck = async () => {
    setCheckingHealth(true);
    try {
      const report = await checkBtcEcosystemHealth();
      setHealthReport(report);
      setAiMetrics(getAiUsageMetrics());
      setLogs(btcLogger.getRecentLogs(20));
    } finally {
      setCheckingHealth(false);
    }
  };

  useEffect(() => {
    loadStats();
    runHealthCheck();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
            <Server className="size-5 text-primary" />
            {BRAND.name} Platform Operations &amp; Overview
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Student support volume, safety queues, live health checks, and AI safety metrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              loadStats();
              runHealthCheck();
            }}
            disabled={loading || checkingHealth}
            className="gap-1.5 text-xs h-8 whitespace-nowrap shrink-0"
          >
            <RefreshCw className={`size-3.5 ${loading || checkingHealth ? "animate-spin" : ""}`} />
            <span>Sync &amp; Run Probes</span>
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          className="surface-card p-4 space-y-2 cursor-pointer transition-all hover:border-primary/50"
          onClick={() => onNavigateTab?.("users")}
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Active Students</span>
            <Users className="size-4 text-primary" />
          </div>
          <div className="text-2xl font-bold font-display tabular-nums text-foreground">
            {stats ? stats.total_users : "—"}
          </div>
          <p className="text-[11px] text-muted-foreground">Manage accounts &amp; roles</p>
        </div>

        <div
          className="surface-card p-4 space-y-2 cursor-pointer transition-all hover:border-amber-500/50"
          onClick={() => onNavigateTab?.("tickets")}
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Open Tickets</span>
            <MessageSquare className="size-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-display tabular-nums text-amber-600 dark:text-amber-400">
            {stats ? stats.open_tickets : "—"}
          </div>
          <p className="text-[11px] text-muted-foreground">Awaiting coordinator response</p>
        </div>

        <div
          className="surface-card p-4 space-y-2 cursor-pointer transition-all hover:border-rose-500/50"
          onClick={() => onNavigateTab?.("moderation")}
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Safety Reports</span>
            <AlertTriangle className="size-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-display tabular-nums text-rose-600 dark:text-rose-400">
            {stats ? stats.pending_reports : "—"}
          </div>
          <p className="text-[11px] text-muted-foreground">Pending trust &amp; safety review</p>
        </div>

        <div
          className="surface-card p-4 space-y-2 cursor-pointer transition-all hover:border-primary/50"
          onClick={() => onNavigateTab?.("articles")}
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Help Articles</span>
            <BookOpen className="size-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-display tabular-nums text-emerald-600 dark:text-emerald-400">
            {stats ? stats.published_articles : "—"}
          </div>
          <p className="text-[11px] text-muted-foreground">Active in Help Center</p>
        </div>
      </div>

      {/* Live Ecosystem Subsystem Health Probes */}
      <div className="surface-card p-5 space-y-4" data-testid="ecosystem-health-probes">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <HeartPulse className="size-4 text-primary" />
            Live Subsystem Health Probes
          </h3>
          {healthReport && (
            <Badge
              variant={healthReport.overallStatus === "healthy" ? "default" : "secondary"}
              className="text-[11px] font-mono"
            >
              Overall: {healthReport.overallStatus.toUpperCase()}
            </Badge>
          )}
        </div>

        {healthReport ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {healthReport.subsystems.map((sub) => (
              <div
                key={sub.name}
                className="p-3 rounded-xl bg-surface-2 border border-border space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-foreground">{sub.name}</span>
                  <span
                    className={`font-mono text-[11px] font-bold ${
                      sub.status === "healthy"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : sub.status === "degraded"
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {sub.status.toUpperCase()}
                    {typeof sub.latencyMs === "number" ? ` · ${sub.latencyMs}ms` : ""}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">{sub.detailsEn}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Running subsystem connectivity probes...</p>
        )}
      </div>

      {/* AI Guardrail Quotas & Infrastructure Services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="surface-card p-5 space-y-3" data-testid="ai-guardrail-metrics">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-600" />
            Islamic &amp; Academic AI Safety Quotas
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-surface-2 border border-border">
              <div className="text-muted-foreground text-[11px]">Evaluated Queries</div>
              <div className="text-lg font-bold font-mono text-foreground">
                {aiMetrics.totalRequests}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-surface-2 border border-border">
              <div className="text-muted-foreground text-[11px]">Est. Tokens Metered</div>
              <div className="text-lg font-bold font-mono text-foreground">
                {aiMetrics.estimatedTokensConsumed}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-surface-2 border border-border">
              <div className="text-muted-foreground text-[11px]">Blocked Fatwa Prompts</div>
              <div className="text-lg font-bold font-mono text-amber-600">
                {aiMetrics.blockedFatwaAttempts}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-surface-2 border border-border">
              <div className="text-muted-foreground text-[11px]">Blocked Fabrications</div>
              <div className="text-lg font-bold font-mono text-rose-600">
                {aiMetrics.blockedFabricationAttempts}
              </div>
            </div>
          </div>
        </div>

        <div className="surface-card p-5 space-y-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Activity className="size-4 text-primary" />
            Platform Security Architecture
          </h3>
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-surface-2 border border-border flex items-center justify-between">
              <span className="text-muted-foreground">Authentication &amp; RBAC:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="size-3" /> Active
              </span>
            </div>
            <div className="p-3 rounded-xl bg-surface-2 border border-border flex items-center justify-between">
              <span className="text-muted-foreground">Firestore Zero-Trust ABAC:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <Zap className="size-3" /> Enforced in rules
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* PII-Scrubbed Diagnostic & Security Log Buffer */}
      <div className="surface-card p-5 space-y-3" data-testid="pii-scrubbed-logs">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Terminal className="size-4 text-primary" />
            PII-Scrubbed Runtime Diagnostics Buffer
          </h3>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              btcLogger.clear();
              setLogs([]);
            }}
            className="h-7 text-xs gap-1 text-muted-foreground"
          >
            <Trash2 className="size-3" />
            Clear Buffer
          </Button>
        </div>
        {logs.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">
            No runtime warnings or security events logged in the current session.
          </p>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto text-[11px] font-mono">
            {logs.map((entry) => (
              <div
                key={entry.id}
                className="p-2 rounded-lg bg-surface-2 border border-border flex items-start justify-between gap-2"
              >
                <span className="text-foreground">
                  [{entry.level.toUpperCase()}/{entry.subsystem}] {entry.message}
                </span>
                <span className="text-muted-foreground shrink-0">
                  {entry.timestamp.slice(11, 19)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
