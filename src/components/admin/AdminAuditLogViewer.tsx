import { useState, useEffect } from "react";
import {
  FileText,
  Search,
  RefreshCw,
  Download,
  Trash2,
  Shield,
  UserCheck,
  AlertTriangle,
  BookOpen,
  MessageSquare,
  Settings,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ModernSelect } from "@/components/ui/modern-select";
import { fetchAuditLogs, clearAuditLogs, type AuditLogEntry } from "@/lib/support-service";
import { useRbac } from "@/hooks/use-rbac";
import { downloadTextFile } from "@/lib/safe-file";
import { toast } from "sonner";

export function AdminAuditLogViewer() {
  const rbac = useRbac();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");

  const loadLogs = () => {
    setLoading(true);
    try {
      const data = fetchAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.actor_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.target_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const handleExportJson = () => {
    try {
      const json = JSON.stringify(logs, null, 2);
      downloadTextFile(
        json,
        `nexora-audit-trail-${new Date().toISOString().slice(0, 10)}.json`,
        "application/json;charset=utf-8",
      );
      toast.success("Audit log archive downloaded successfully.");
    } catch {
      toast.error("Failed to export audit logs.");
    }
  };

  const handleClear = () => {
    if (!rbac.isFounder) {
      toast.error("Only the Founder account has authorization to purge audit records.");
      return;
    }
    if (confirm("Are you sure you want to clear the local administrative audit trail?")) {
      clearAuditLogs();
      loadLogs();
      toast.success("Audit records cleared.");
    }
  };

  const getActionIcon = (action: AuditLogEntry["action"]) => {
    switch (action) {
      case "user_role_assigned":
      case "user_role_revoked":
        return <UserCheck className="size-3.5 text-primary" />;
      case "moderation_status_updated":
        return <AlertTriangle className="size-3.5 text-rose-500" />;
      case "ticket_status_updated":
        return <MessageSquare className="size-3.5 text-amber-500" />;
      case "help_article_created":
      case "help_article_updated":
      case "help_article_deleted":
        return <BookOpen className="size-3.5 text-emerald-500" />;
      case "system_settings_updated":
        return <Settings className="size-3.5 text-sky-400" />;
      default:
        return <Shield className="size-3.5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold font-display text-foreground flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            Security &amp; Administrative Audit Trail
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Immutable log of role changes, moderation actions, ticket resolutions, and documentation
            updates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportJson}
            disabled={logs.length === 0}
            className="gap-1.5 text-xs h-8"
          >
            <Download className="size-3.5" />
            <span>Export JSON</span>
          </Button>

          {rbac.isFounder && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="gap-1.5 text-xs h-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-3.5" />
              <span>Purge</span>
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={loadLogs}
            disabled={loading}
            className="size-8"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="size-4 absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by actor, target ID, action, or details..."
            className="ps-9 text-xs h-9"
          />
        </div>

        <div className="w-60">
          <ModernSelect
            ariaLabel="Filter event type"
            placeholder="All Actions"
            value={actionFilter}
            onValueChange={setActionFilter}
            searchable
            searchPlaceholder="Search event types..."
            size="sm"
            options={[
              { value: "all", label: `All Event Types (${logs.length})` },
              { value: "user_role_assigned", label: "User Role Assigned" },
              { value: "user_role_revoked", label: "User Role Revoked" },
              { value: "moderation_status_updated", label: "Moderation Action" },
              { value: "ticket_status_updated", label: "Ticket Status Updated" },
              { value: "help_article_created", label: "Help Article Created" },
              { value: "system_settings_updated", label: "System Setting Updated" },
            ]}
          />
        </div>
      </div>

      {/* Audit Log Entries List */}
      {filteredLogs.length === 0 ? (
        <div className="surface-card p-10 text-center text-xs text-muted-foreground">
          No audit records match the current filter.
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredLogs.map((log) => {
            const actionLabel = log.action.replace(/_/g, " ");
            return (
              <div
                key={log.id}
                className="surface-card p-3.5 space-y-2 border-s-4 border-s-primary text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getActionIcon(log.action)}
                    <span className="font-semibold text-foreground capitalize">{actionLabel}</span>
                    <Badge variant="outline" className="text-[10px] uppercase font-mono">
                      {log.target_type}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>

                <p className="text-foreground text-xs leading-relaxed">{log.details}</p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/60 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <span>Actor:</span>
                    <span className="font-semibold text-foreground">{log.actor_email}</span>
                    <Badge variant="secondary" className="text-[10px] capitalize">
                      {log.actor_role}
                    </Badge>
                  </div>
                  <div className="font-mono text-[10px] text-muted-foreground/80">
                    Target ID: {log.target_id}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
