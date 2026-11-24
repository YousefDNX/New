import { useState, useEffect } from "react";
import {
  ShieldAlert,
  Bug,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchAllModerationReports,
  fetchAllTechnicalReports,
  updateModerationReportStatus,
  type ModerationReport,
  type TechnicalReport,
} from "@/lib/support-service";
import { toast } from "sonner";

export function AdminModerationManager() {
  const [activeTab, setActiveTab] = useState<"moderation" | "technical">("moderation");
  const [modReports, setModReports] = useState<ModerationReport[]>([]);
  const [techReports, setTechReports] = useState<TechnicalReport[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [modData, techData] = await Promise.all([
        fetchAllModerationReports(),
        fetchAllTechnicalReports(),
      ]);
      setModReports(modData);
      setTechReports(techData);
    } catch (err) {
      console.error("Failed to load moderation queues:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateModStatus = async (
    reportId: string,
    newStatus: "pending" | "reviewed" | "action_taken" | "dismissed",
  ) => {
    try {
      await updateModerationReportStatus(reportId, newStatus);
      setModReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r)),
      );
      toast.success(`Report updated to ${newStatus.replace("_", " ")}.`);
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold font-display text-foreground flex items-center gap-2">
            <ShieldAlert className="size-5 text-rose-500" />
            Trust, Safety & Diagnostic Queue
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Review flagged behavior, harassment complaints, and system bug reports.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border p-0.5 bg-surface-2 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("moderation")}
              className={`px-3 py-1 rounded-md transition-all font-medium ${
                activeTab === "moderation"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Safety Reports (
              {modReports.filter((r) => r.status === "pending" || r.status === "submitted").length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("technical")}
              className={`px-3 py-1 rounded-md transition-all font-medium ${
                activeTab === "technical"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Technical Bug Reports ({techReports.filter((r) => r.status === "open").length})
            </button>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={loadData}
            disabled={loading}
            className="size-8"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="surface-card p-8 text-center text-xs text-muted-foreground">
          Loading safety queues...
        </div>
      ) : activeTab === "moderation" ? (
        <div className="space-y-3">
          {modReports.length === 0 ? (
            <div className="surface-card p-8 text-center text-xs text-muted-foreground">
              <CheckCircle2 className="size-8 text-emerald-500 mx-auto mb-2" />
              Safety queue is clear. No active moderation incidents reported.
            </div>
          ) : (
            modReports.map((report) => {
              const labelCategory = (report.category || report.reason || "other").replace(
                /_/g,
                " ",
              );
              const targetLabel = (
                report.reported_target_type ||
                report.target_type ||
                "other"
              ).replace(/_/g, " ");
              const selectStatus =
                report.status === "submitted"
                  ? "pending"
                  : report.status === "resolved"
                    ? "action_taken"
                    : report.status;
              return (
                <div key={report.id} className="surface-card p-4 space-y-3 border-destructive/35">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
                        {report.id}
                      </span>
                      <Badge variant="outline" className="capitalize text-[10px]">
                        {labelCategory}
                      </Badge>
                      <span className="text-xs text-muted-foreground capitalize">
                        Target: {targetLabel}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(report.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-2 text-xs space-y-1">
                    <div className="text-[11px] font-semibold text-muted-foreground">
                      Incident Details:
                    </div>
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                      {report.details || "No additional details provided."}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/80">
                    <div className="text-xs text-muted-foreground">
                      Reporter ID: <span className="font-mono">{report.reporter_id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={selectStatus}
                        onValueChange={(v) =>
                          handleUpdateModStatus(
                            report.id,
                            v as "pending" | "reviewed" | "action_taken" | "dismissed",
                          )
                        }
                      >
                        <SelectTrigger className="text-xs h-7 w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="reviewed">Under Review</SelectItem>
                          <SelectItem value="action_taken">Action Taken</SelectItem>
                          <SelectItem value="dismissed">Dismissed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {techReports.length === 0 ? (
            <div className="surface-card p-8 text-center text-xs text-muted-foreground">
              <CheckCircle2 className="size-8 text-emerald-500 mx-auto mb-2" />
              No technical bug reports logged.
            </div>
          ) : (
            techReports.map((report) => (
              <div
                key={report.id}
                className="surface-card p-4 space-y-3 border-s-4 border-s-amber-500"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-500">{report.id}</span>
                    <Badge variant="outline" className="capitalize text-[10px]">
                      {report.category.replace("_", " ")}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(report.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-foreground">{report.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {report.description}
                  </p>
                </div>

                {report.steps_to_reproduce && (
                  <div className="p-2.5 rounded-lg bg-surface-2 text-xs space-y-1">
                    <span className="font-semibold text-muted-foreground text-[11px]">
                      Steps to Reproduce:
                    </span>
                    <p className="whitespace-pre-wrap">{report.steps_to_reproduce}</p>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/80 text-[11px] text-muted-foreground">
                  <span>Browser: {report.browser_info || "N/A"}</span>
                  {report.attachment_url && (
                    <a
                      href={report.attachment_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary flex items-center gap-1 underline"
                    >
                      <ExternalLink className="size-3" /> View Screenshot
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
