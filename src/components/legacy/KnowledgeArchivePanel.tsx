import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Archive,
  CheckCircle2,
  Copy,
  Database,
  Download,
  FileCheck2,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { computeCanonicalArchiveDigest } from "@/lib/checksum";
import {
  detectArchiveDuplicates,
  exportArchivalBundleJson,
  scanBrokenArchiveResources,
  verifyArchiveIntegrity,
} from "@/lib/legacy-knowledge";
import { usePrefs } from "@/lib/preferences";
import { downloadTextFile } from "@/lib/safe-file";
import { useStudentEcosystem } from "@/lib/student-ecosystem";

export function KnowledgeArchivePanel() {
  const { lang } = usePrefs();
  const isAr = lang === "ar";
  const { state: eco, update: updateEco } = useStudentEcosystem();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditSummary, setAuditSummary] = useState<{
    timestamp: string;
    total: number;
    passed: number;
    failedTitles: string[];
  } | null>(null);
  const [recordAuditMap, setRecordAuditMap] = useState<
    Record<string, { valid: boolean; calculatedChecksum: string }>
  >({});
  const [charterOpen, setCharterOpen] = useState(false);

  const archiveRecords = useMemo(
    () => eco.archivedPreservationRecords ?? [],
    [eco.archivedPreservationRecords],
  );

  const duplicates = useMemo(() => detectArchiveDuplicates(archiveRecords), [archiveRecords]);
  const brokenCheck = useMemo(() => scanBrokenArchiveResources(archiveRecords), [archiveRecords]);

  const filteredRecords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return archiveRecords.filter((r) => {
      if (statusFilter !== "all" && r.preservationStatus !== statusFilter) return false;
      if (!q) return true;
      const haystack = [r.title, r.resourceId, r.checksum, r.originalSource]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [archiveRecords, statusFilter, searchQuery]);

  const handleRunIntegrityAudit = () => {
    setIsAuditing(true);
    const nextMap: Record<string, { valid: boolean; calculatedChecksum: string }> = {};
    const failedTitles: string[] = [];
    let passed = 0;

    for (const rec of archiveRecords) {
      const check = verifyArchiveIntegrity(rec);
      nextMap[rec.id] = check;
      if (check.valid) {
        passed += 1;
      } else {
        failedTitles.push(rec.title);
      }
    }

    setRecordAuditMap(nextMap);
    setAuditSummary({
      timestamp: new Date().toISOString(),
      total: archiveRecords.length,
      passed,
      failedTitles,
    });
    setIsAuditing(false);

    if (failedTitles.length === 0) {
      toast.success(
        `Integrity scan passed: ${passed}/${archiveRecords.length} canonical records verified.`,
      );
    } else {
      toast.error(
        `Integrity alert: ${failedTitles.length} record(s) failed canonical checksum verification!`,
      );
    }
  };

  const handleExportArchivalBundle = () => {
    const jsonStr = exportArchivalBundleJson({
      records: archiveRecords,
      contributions: eco.legacyContributions,
      communityResources: eco.communityResources,
    });
    downloadTextFile(
      jsonStr,
      `nexora-archival-preservation-bundle-${new Date().toISOString().slice(0, 10)}.json`,
      "application/json;charset=utf-8",
    );
    toast.success("Exported durable archival preservation bundle (.json).");
  };

  const handleVerifyIndividualRecord = (rec: (typeof archiveRecords)[0]) => {
    const result = verifyArchiveIntegrity(rec);
    setRecordAuditMap((prev) => ({ ...prev, [rec.id]: result }));
    if (result.valid) {
      toast.success(`Checksum for '${rec.title}' verified: ${result.calculatedChecksum} (PASS).`);
    } else {
      toast.error(
        `Checksum mismatch for '${rec.title}': expected ${result.calculatedChecksum}, stored ${rec.checksum}.`,
      );
    }
  };

  const handleToggleArchiveState = (recId: string) => {
    updateEco((prev) => ({
      ...prev,
      archivedPreservationRecords: (prev.archivedPreservationRecords ?? []).map((r) => {
        if (r.id !== recId) return r;
        const nextStatus =
          r.preservationStatus === "preserved_archived" ? "preserved_active" : "preserved_archived";
        return { ...r, preservationStatus: nextStatus };
      }),
    }));
    toast.success("Updated non-destructive preservation status cleanly.");
  };

  const handleRecanonicalize = (rec: (typeof archiveRecords)[0]) => {
    const canonical = computeCanonicalArchiveDigest(rec);
    updateEco((prev) => ({
      ...prev,
      archivedPreservationRecords: (prev.archivedPreservationRecords ?? []).map((r) =>
        r.id === rec.id ? { ...r, checksum: canonical, preservationStatus: "preserved_active" } : r,
      ),
    }));
    setRecordAuditMap((prev) => ({
      ...prev,
      [rec.id]: { valid: true, calculatedChecksum: canonical },
    }));
    toast.success(`Restored canonical checksum (${canonical}) for '${rec.title}'.`);
  };

  return (
    <div className="space-y-5" data-testid="knowledge-archive-panel">
      {/* Banner */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-surface-card to-surface-2 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
              <Database className="size-4" />
              <span>{isAr ? "أرشيف الحفظ المعرفي الدائم" : "NEXORA Knowledge Archive"}</span>
            </div>
            <h2 className="font-display text-lg font-bold text-foreground">
              Long-Term Preservation Infrastructure &amp; Cryptographic Integrity
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
              Append-only recoverability and preservation of verified curriculum and OER assets.
              Guarantees deterministic checksum verification, duplicate detection, review cadence
              tracking, and non-destructive archival.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setCharterOpen(true)}
              className="h-8 text-xs"
            >
              Continuity Charter
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isAuditing}
              onClick={handleRunIntegrityAudit}
              className="h-8 text-xs"
            >
              <RefreshCw className={`size-3.5 me-1.5 ${isAuditing ? "animate-spin" : ""}`} />
              Run Integrity Audit
            </Button>

            <Button
              type="button"
              size="sm"
              variant="glow"
              onClick={handleExportArchivalBundle}
              className="h-8 text-xs"
            >
              <Download className="size-3.5 me-1.5" />
              Export Archival Bundle (.json)
            </Button>
          </div>
        </div>
      </div>

      {/* Preservation & Integrity Cards */}
      <div className="grid gap-3 sm:grid-cols-3 text-xs">
        <div className="surface-card p-4 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="font-medium">Preserved Records</span>
            <ShieldCheck className="size-4 text-emerald-500" />
          </div>
          <div className="font-display text-2xl font-bold tabular-nums text-foreground">
            {archiveRecords.length}
          </div>
          <div className="text-[10px] text-muted-foreground">
            Canonical 64-Bit FNV Checksums · Delete-Protected
          </div>
        </div>

        <div className="surface-card p-4 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="font-medium">Duplicate Content</span>
            <Copy className="size-4 text-primary" />
          </div>
          <div className="font-display text-2xl font-bold tabular-nums text-emerald-500">
            {duplicates.duplicatesCount} detected
          </div>
          <div className="text-[10px] text-muted-foreground">
            {duplicates.duplicatesCount === 0
              ? "Zero duplicate digests detected in canonical registry"
              : `Duplicates in: ${duplicates.duplicateTitles.join(", ")}`}
          </div>
        </div>

        <div className="surface-card p-4 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="font-medium">Broken / Missing Sources</span>
            <AlertTriangle className="size-4 text-amber-500" />
          </div>
          <div className="font-display text-2xl font-bold tabular-nums text-emerald-500">
            {brokenCheck.atRiskCount} at risk
          </div>
          <div className="text-[10px] text-muted-foreground">
            {brokenCheck.atRiskCount === 0
              ? "All archived resources link to verified sources"
              : `${brokenCheck.atRiskCount} item(s) flagged for source re-verification`}
          </div>
        </div>
      </div>

      {auditSummary && (
        <div
          className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs text-foreground ${
            auditSummary.failedTitles.length === 0
              ? "border-emerald-500/30 bg-emerald-500/5"
              : "border-destructive/40 bg-destructive/10"
          }`}
        >
          {auditSummary.failedTitles.length === 0 ? (
            <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="size-4 text-destructive shrink-0 mt-0.5" />
          )}
          <span className="tabular-nums">
            Integrity scan (<code className="font-mono">{auditSummary.timestamp}</code>):{" "}
            <strong>
              {auditSummary.passed}/{auditSummary.total}
            </strong>{" "}
            records match canonical digest.
            {auditSummary.failedTitles.length > 0 &&
              ` Mismatch detected in: ${auditSummary.failedTitles.join(", ")}.`}
          </span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-2.5 rounded-xl border border-border bg-surface-card p-3 text-xs">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute start-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search archive by title, resourceId, checksum, or citation..."
            className="h-8 ps-8 text-xs font-mono"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {(["all", "preserved_active", "preserved_archived"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${
                statusFilter === st
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "border border-border/80 bg-surface-2/60 text-muted-foreground hover:bg-surface-2"
              }`}
            >
              {st === "all" ? "All Archives" : st.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Preservation Records */}
      <div className="space-y-3">
        {filteredRecords.map((rec) => {
          const check = recordAuditMap[rec.id];
          return (
            <div
              key={rec.id}
              className={`surface-card flex flex-col justify-between space-y-2.5 p-4 transition-all text-xs ${
                check && !check.valid
                  ? "border-destructive/50 bg-destructive/5"
                  : "hover:border-primary/40"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-foreground text-sm">{rec.title}</span>
                  <span className="font-mono text-[10px] text-primary">· {rec.resourceId}</span>
                </div>

                <div className="flex items-center gap-2 font-mono text-[10px]">
                  <span
                    className={
                      rec.preservationStatus === "preserved_active"
                        ? "text-emerald-500 font-semibold"
                        : "text-amber-500 font-semibold"
                    }
                  >
                    {rec.preservationStatus}
                  </span>
                  <span className="text-muted-foreground">· v{rec.version}</span>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 font-mono text-[11px] text-muted-foreground">
                <div>
                  <span className="text-foreground font-medium">Deterministic Checksum: </span>
                  <code className="text-primary">{rec.checksum}</code>
                </div>
                <div className="truncate">
                  <span className="text-foreground font-medium">Content Digest: </span>
                  <span>{rec.contentDigest.slice(0, 32)}...</span>
                </div>
              </div>

              <div className="text-[11px] text-muted-foreground flex flex-wrap justify-between gap-2">
                <span>
                  <span className="font-semibold text-foreground">Original Source: </span>
                  {rec.originalSource}
                </span>
                {rec.nextReviewDueDate && (
                  <span className="font-mono text-[10px]">
                    Next Review Due: {rec.nextReviewDueDate}
                  </span>
                )}
              </div>

              {check && (
                <div
                  className={`text-[10px] font-mono ${
                    check.valid ? "text-emerald-500" : "text-destructive"
                  }`}
                >
                  {check.valid
                    ? `Verification: PASS (Canonical digest matches ${check.calculatedChecksum})`
                    : `Verification: MISMATCH (Stored ${rec.checksum} vs Calculated ${check.calculatedChecksum})`}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60 text-[10px] text-muted-foreground">
                <span>
                  Preserved: {rec.preservedAt.slice(0, 10)} · Format:{" "}
                  {rec.exportFormat.toUpperCase()}
                </span>

                <div className="flex flex-wrap items-center gap-1.5">
                  {check && !check.valid && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleRecanonicalize(rec)}
                      className="h-6 text-[10px]"
                    >
                      Restore Canonical
                    </Button>
                  )}

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleArchiveState(rec.id)}
                    className="h-6 text-[10px]"
                  >
                    {rec.preservationStatus === "preserved_archived" ? (
                      <>
                        <RotateCcw className="size-3 me-1" />
                        Restore Active
                      </>
                    ) : (
                      <>
                        <Archive className="size-3 me-1" />
                        Mark Archived
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleVerifyIndividualRecord(rec)}
                    className="h-6 text-[10px]"
                  >
                    <FileCheck2 className="size-3 me-1 text-primary" />
                    Verify Checksum
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Archival Policy & Governance Summary */}
      <div className="rounded-xl border border-border bg-surface-2/60 p-4 text-xs space-y-2 text-muted-foreground">
        <div className="font-bold text-foreground flex items-center gap-1.5">
          <Archive className="size-4 text-primary" />
          <span>NEXORA Archival Preservation &amp; Role Governance</span>
        </div>
        <p className="leading-relaxed">
          Append-only archival model protected by Firebase Security Rules: non-admin contributors
          can submit and edit drafts, while deletion is restricted to administrators. Outdated
          materials transition to <code>preserved_archived</code> rather than being erased.
        </p>
        <div className="text-[11px] font-mono text-foreground">
          Access Roles: Public Learner (Read Approved) · Approved Contributor (Submit Pending) ·
          Educator Reviewer (Approve/Rate) · Admin Steward (Archive &amp; Governance)
        </div>
      </div>

      {/* Continuity & Succession Charter Modal */}
      <Dialog open={charterOpen} onOpenChange={setCharterOpen}>
        <DialogContent className="max-w-lg text-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <ShieldCheck className="size-4 text-primary" />
              Project Continuity &amp; Responsible Succession Charter
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2.5 text-muted-foreground leading-relaxed">
            <p>
              <strong>1. Architecture Portability:</strong> Open OER JSON bundles, Markdown lessons,
              and 64-bit FNV checksums run independently of proprietary services so future educators
              can inspect, verify, and host all learning packs anywhere.
            </p>
            <p>
              <strong>2. Content Stewardship Succession:</strong> High-stakes health, safety, and
              Islamic learning modules require verified educator or scholar review before status
              promotion and undergo scheduled review intervals.
            </p>
            <p>
              <strong>3. Ethical Sustainability:</strong> Zero behavioral ads, zero paywalls on core
              literacy and STEM essentials, and full documentation in{" "}
              <code>docs/NEXORA_CONTINUITY_AND_PRESERVATION.md</code>.
            </p>
          </div>
          <div className="flex justify-end pt-2">
            <Button type="button" size="sm" variant="glow" onClick={() => setCharterOpen(false)}>
              Understood
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
