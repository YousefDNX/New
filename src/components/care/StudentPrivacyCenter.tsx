import { useState, useRef } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Database,
  Download,
  Eye,
  EyeOff,
  HardDriveDownload,
  Lock,
  RotateCcw,
  ShieldCheck,
  Undo2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { Button } from "@/components/ui/button";
import { useSaveSettings } from "@/hooks/use-settings";
import { createVersionedEcosystemBackup } from "@/lib/legacy-knowledge";
import {
  BTC_BACKUP_SAFETY_ROLLBACK_KEY,
  createBtcSystemBackup,
  restoreBtcSystemBackup,
  rollbackPreRestoreBackup,
  validateBtcBackupPayload,
} from "@/lib/backup-recovery";
import { btcLogger } from "@/lib/observability";
import { usePrefs } from "@/lib/preferences";
import { downloadTextFile } from "@/lib/safe-file";
import { resetCurrentEcosystemSandbox, useStudentEcosystem } from "@/lib/student-ecosystem";

export function StudentPrivacyCenter() {
  const { lang, privacy, setPrivacy, activeUid } = usePrefs();
  const isAr = lang === "ar";
  const saveSettings = useSaveSettings();
  const { state: eco } = useStudentEcosystem();
  const [clearing, setClearing] = useState(false);
  const [backupStatus, setBackupStatus] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);
  const [hasRollbackSnapshot, setHasRollbackSnapshot] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return Boolean(window.localStorage.getItem(BTC_BACKUP_SAFETY_ROLLBACK_KEY));
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleToggleCircle = (nextVal: boolean) => {
    setPrivacy({ showInCircle: nextVal });
    saveSettings({ show_in_circle: nextVal })
      .then(() => {
        toast.success(
          nextVal
            ? isAr
              ? "تم إظهار تقدمك لأعضاء فرقك الدراسية"
              : "Progress is now visible to study teams"
            : isAr
              ? "تم إخفاء تقدمك من الدوائر الجماعية"
              : "Progress is now hidden from group circles",
        );
      })
      .catch(() => {
        toast.info("Saved privacy preference locally");
      });
  };

  const handleExportAllJson = () => {
    const verifiedBackup = createVersionedEcosystemBackup(eco, activeUid);
    const payload = {
      exportTimestamp: verifiedBackup.exportedAt,
      studentUid: verifiedBackup.uidScope,
      schemaVersion: verifiedBackup.schemaVersion,
      checksum: verifiedBackup.checksum,
      ecosystem: eco,
      privacyPolicyNotice:
        "Private student data exported directly from device memory with integrity checksum.",
    };
    downloadTextFile(
      JSON.stringify(payload, null, 2),
      `btc-student-data-export-${new Date().toISOString().slice(0, 10)}.json`,
      "application/json;charset=utf-8",
    );
    toast.success(`Downloaded complete personal JSON export (${verifiedBackup.checksum})`);
  };

  const handleExportSystemRecoveryBackup = () => {
    const snapshot = createBtcSystemBackup();
    downloadTextFile(
      JSON.stringify(snapshot, null, 2),
      `btc-system-recovery-${new Date().toISOString().slice(0, 10)}.json`,
      "application/json;charset=utf-8",
    );
    btcLogger.info("storage", "Exported system recovery backup", {
      checksum: snapshot.metadata.checksum,
      schemaVersion: snapshot.metadata.schemaVersion,
    });
    setBackupStatus({
      kind: "success",
      text: isAr
        ? `تم تصدير نسخة استعادة موثقة (${snapshot.metadata.checksum}) — ${snapshot.metadata.itemCounts.favoriteReciters} قرّاء، ${snapshot.metadata.itemCounts.studyNotes} ملاحظات، ${snapshot.metadata.itemCounts.styleOverrides} تصنيفات.`
        : `Exported verified recovery snapshot (${snapshot.metadata.checksum}) — ${snapshot.metadata.itemCounts.favoriteReciters} favorite reciters, ${snapshot.metadata.itemCounts.studyNotes} notes, ${snapshot.metadata.itemCounts.styleOverrides} style overrides.`,
    });
    toast.success(`Backup exported (${snapshot.metadata.checksum})`);
  };

  const handleRestoreFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rawText =
        typeof file.text === "function"
          ? await file.text()
          : await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result ?? ""));
              reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
              reader.readAsText(file);
            });
      const validation = validateBtcBackupPayload(rawText);
      if (!validation.valid) {
        btcLogger.warn("storage", "Rejected invalid or tampered backup upload", {
          reason: validation.error,
        });
        setBackupStatus({
          kind: "error",
          text: validation.error ?? "Backup checksum validation failed.",
        });
        toast.error(validation.error ?? "Invalid backup file");
        return;
      }

      const result = restoreBtcSystemBackup(rawText);
      if (result.success) {
        setHasRollbackSnapshot(true);
        btcLogger.info("storage", "Restored BTC system backup with rollback safety snapshot");
        setBackupStatus({ kind: "success", text: result.message });
        toast.success(isAr ? "تمت استعادة البيانات بنجاح" : "Backup restored successfully");
      } else {
        setBackupStatus({ kind: "error", text: result.message });
        toast.error(result.message);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setBackupStatus({ kind: "error", text: msg });
      toast.error(msg);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRollback = () => {
    const res = rollbackPreRestoreBackup();
    if (res.success) {
      btcLogger.info("storage", "Rolled back to pre-restore safety snapshot");
      setBackupStatus({
        kind: "success",
        text: isAr ? "تم التراجع إلى النسخة السابقة قبل الاستعادة." : res.message,
      });
      toast.success(isAr ? "تم استرجاع الوضع السابق للاستعادة" : "Rolled back pre-restore state");
    } else {
      setBackupStatus({ kind: "error", text: res.message });
      toast.error(res.message);
    }
  };

  const handleClearSandbox = () => {
    if (
      !window.confirm(
        "Reset local sandbox simulations and draft projects? (Synced profile and cloud tasks remain safe)",
      )
    ) {
      return;
    }
    setClearing(true);
    resetCurrentEcosystemSandbox();
    setTimeout(() => {
      setClearing(false);
      toast.success("Reset local ecosystem workspace cache");
    }, 200);
  };

  return (
    <div className="surface-card p-5 space-y-4" data-testid="student-privacy-center">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-primary" />
          <div>
            <h2 className="text-base font-bold font-display text-foreground">
              49. Student Privacy &amp; Data Inventory Center
            </h2>
            <p className="text-xs text-muted-foreground">
              Complete transparency: see exactly what data lives on cloud servers vs. inside your
              browser storage.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FeatureGuideTrigger featureId="student-privacy" />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleExportAllJson}
            className="h-8 text-xs"
          >
            <Download className="size-3.5 me-1.5" />
            Export All My Data (JSON)
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 text-xs">
        {/* Cloud vs Browser Storage Inventory */}
        <div className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-2.5">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <Database className="size-4 text-primary" />
            <span>Storage Architecture Inventory</span>
          </div>
          <div className="space-y-1.5 text-muted-foreground">
            <div className="rounded-lg bg-surface-1 p-2">
              <strong className="text-foreground">Cloud Firestore (Multi-Device Sync):</strong>
              <div className="text-[11px] mt-0.5">
                • Profiles &amp; User Stats (XP, Level, Streak)
                <br />
                • Tasks, Daily Goals &amp; Study Items (Notes, Flashcards, Mistakes)
                <br />• Study Teams &amp; Moderated Circles
              </div>
            </div>
            <div className="rounded-lg bg-surface-1 p-2">
              <strong className="text-foreground">
                Browser Local Storage (Isolated per Device):
              </strong>
              <div className="text-[11px] mt-0.5">
                • <code>btc.student_ecosystem.v1.&lt;uid&gt;</code> (Simulations, Coding Sandboxes,
                Story Drafts)
                <br />• <code>nexora.prefs.&lt;uid&gt;</code> (Theme Presets, Accessibility Font
                Scales)
                <br />• Emotional Care check-ins strictly protected
              </div>
            </div>
          </div>
        </div>

        {/* Real Privacy Controls */}
        <div className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-3">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <Lock className="size-4 text-primary" />
            <span>Audited Privacy Controls</span>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-1 p-3">
            <div className="space-y-0.5">
              <div className="font-semibold text-foreground">Share Progress in Study Circles</div>
              <p className="text-[11px] text-muted-foreground">
                When disabled, team members only see your display name without XP or badge stats.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggleCircle(!privacy.showInCircle)}
              className={`rounded-lg border px-3 py-1.5 font-semibold text-xs transition-colors ${
                privacy.showInCircle
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface-2 text-muted-foreground"
              }`}
            >
              {privacy.showInCircle ? (
                <span className="flex items-center gap-1">
                  <Eye className="size-3" /> Shared
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <EyeOff className="size-3" /> Hidden
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <div className="space-y-0.5">
              <div className="font-semibold text-foreground">Clear Local Sandbox Cache</div>
              <p className="text-[11px] text-muted-foreground">
                Erases cached code snippets, story drafts, and simulation progress on this device
                only.
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              disabled={clearing}
              onClick={handleClearSandbox}
              className="h-8 text-xs shrink-0"
            >
              <RotateCcw className="size-3 me-1" />
              Reset Cache
            </Button>
          </div>
        </div>
      </div>

      {/* Disaster Recovery: Verified Backup Export, Checksum Restore & Rollback */}
      <div
        className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-3 text-xs"
        data-testid="disaster-recovery-panel"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <HardDriveDownload className="size-4 text-primary" />
            <span>
              {isAr
                ? "النسخ الاحتياطي والاستعادة الموثقة (اختبار سلامة البيانات)"
                : "Verified Recovery Backup, Checksum Restore & Safety Rollback"}
            </span>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">
            CRC Integrity Verification Enabled
          </span>
        </div>

        <p className="text-[11px] text-muted-foreground leading-relaxed">
          {isAr
            ? "يحفظ هذا الإجراء مفضلة التلاوات، وسجل الاستماع، وملاحظات المركز الإسلامي، وتعديلات التصنيف التحريري، وإعدادات المظهر في ملف JSON موثق بتحقق CRC مع حفظ نقطة تراجع تلقائية قبل أي استعادة."
            : "Creates a deterministic CRC-verified JSON snapshot of Islamic favorites, listening history, study notes, recitation style overrides, and interface preferences. Before any restore, your current state is saved to a rollback snapshot automatically."}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            data-testid="export-system-backup-btn"
            onClick={handleExportSystemRecoveryBackup}
            className="h-8 text-xs"
          >
            <Download className="size-3.5 me-1.5" />
            {isAr ? "تصدير نسخة استعادة موثقة" : "Export Verified System Backup"}
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleRestoreFileChange}
            className="hidden"
            data-testid="restore-backup-file-input"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            data-testid="trigger-restore-backup-btn"
            onClick={() => fileInputRef.current?.click()}
            className="h-8 text-xs"
          >
            <Upload className="size-3.5 me-1.5" />
            {isAr ? "استعادة من ملف JSON" : "Restore from Backup JSON"}
          </Button>

          {hasRollbackSnapshot && (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              data-testid="rollback-backup-btn"
              onClick={handleRollback}
              className="h-8 text-xs"
            >
              <Undo2 className="size-3.5 me-1.5" />
              {isAr ? "تراجع عن آخر استعادة" : "Rollback Last Restore"}
            </Button>
          )}
        </div>

        {backupStatus && (
          <div
            data-testid="backup-status-banner"
            className={`rounded-lg border p-2.5 flex items-start gap-2 text-[11px] ${
              backupStatus.kind === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "border-destructive/40 bg-destructive/10 text-destructive"
            }`}
          >
            {backupStatus.kind === "success" ? (
              <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
            )}
            <span>{backupStatus.text}</span>
          </div>
        )}
      </div>
    </div>
  );
}
