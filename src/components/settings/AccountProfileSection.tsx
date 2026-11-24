import { Check, Download, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { exportStudentDataJson, useSaveProfile } from "@/hooks/use-settings";
import type { ProfileRow } from "@/lib/firestore-data";
import { usePrefs } from "@/lib/preferences";
import { downloadTextFile } from "@/lib/safe-file";
import { AVATAR_PRESETS, SUBJECT_OPTIONS } from "@/lib/settings";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BRAND } from "@/config/brand";
import { SettingsSectionCard } from "./SettingsPrimitives";

export function AccountProfileSection({ profile }: { profile: ProfileRow | null | undefined }) {
  const { t } = usePrefs();
  const saveProfile = useSaveProfile();

  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [gradeLevel, setGradeLevel] = useState("high");
  const [schoolName, setSchoolName] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [learningGoals, setLearningGoals] = useState("");
  const [saving, setSaving] = useState(false);
  const [exportBusy, setExportBusy] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setName(profile.display_name ?? "");
    setAvatarUrl(profile.avatar_url ?? "");
    setGradeLevel(profile.grade_level ?? "high");
    setSchoolName(profile.school_name ?? "");
    setSubjects(Array.isArray(profile.preferred_subjects) ? profile.preferred_subjects : []);
    setLearningGoals(profile.learning_goals ?? "");
  }, [profile]);

  function toggleSubject(subject: string) {
    setSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject].slice(0, 12),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await saveProfile({
        display_name: name.trim().slice(0, 60) || "Student",
        avatar_url: avatarUrl.trim() ? avatarUrl.trim().slice(0, 512) : null,
        grade_level: gradeLevel,
        school_name: schoolName.trim() ? schoolName.trim().slice(0, 120) : null,
        preferred_subjects: subjects,
        learning_goals: learningGoals.trim() ? learningGoals.trim().slice(0, 300) : null,
      });
      toast.success(t("set.saved"), { id: "set-saved", duration: 1500 });
    } catch {
      toast.error(t("set.error"));
    } finally {
      setSaving(false);
    }
  }

  async function handleExportAllData() {
    if (exportBusy) return;
    setExportBusy(true);
    try {
      const payload = await exportStudentDataJson();
      downloadTextFile(
        JSON.stringify(payload, null, 2),
        `${BRAND.shortName.toLowerCase()}-student-export-${new Date().toISOString().slice(0, 10)}.json`,
        "application/json;charset=utf-8",
      );
      toast.success(t("set.sec.export.done"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("set.error"));
    } finally {
      setExportBusy(false);
    }
  }

  return (
    <SettingsSectionCard
      id="cat-account"
      title={t("set.profile")}
      desc={t("set.profile.d")}
      badge={<FeatureGuideTrigger featureId="settings-privacy-account" />}
    >
      <form onSubmit={handleSubmit} className="space-y-5 pt-2">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="prof-name">{t("set.name")}</Label>
            <Input
              id="prof-name"
              value={name}
              maxLength={60}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prof-grade">{t("set.grade")}</Label>
            <Select value={gradeLevel} onValueChange={setGradeLevel}>
              <SelectTrigger id="prof-grade" aria-label={t("set.grade")} className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="middle">{t("set.grade.middle")}</SelectItem>
                <SelectItem value="high">{t("set.grade.high")}</SelectItem>
                <SelectItem value="prep">{t("set.grade.prep")}</SelectItem>
                <SelectItem value="undergrad">{t("set.grade.undergrad")}</SelectItem>
                <SelectItem value="self">{t("set.grade.self")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Avatar presets + optional URL */}
        <div className="space-y-2">
          <Label>{t("set.avatar")}</Label>
          <div className="flex flex-wrap items-center gap-3">
            {AVATAR_PRESETS.map((presetUrl, idx) => {
              const selected = avatarUrl === presetUrl;
              return (
                <button
                  key={presetUrl}
                  type="button"
                  onClick={() => setAvatarUrl(presetUrl)}
                  aria-label={`${t("set.avatar")} ${idx + 1}`}
                  aria-pressed={selected}
                  className={`relative size-11 overflow-hidden rounded-full border-2 transition-transform ${
                    selected
                      ? "scale-105 border-primary"
                      : "border-border hover:border-foreground/50"
                  }`}
                >
                  <img
                    src={presetUrl}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="size-full object-cover"
                  />
                  {selected && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/35 text-white">
                      <Check className="size-4" />
                    </span>
                  )}
                </button>
              );
            })}
            <Input
              value={avatarUrl}
              maxLength={512}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder={t("set.avatar.url")}
              dir="ltr"
              className="min-w-[14rem] flex-1 font-mono text-xs"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="prof-school">{t("set.school")}</Label>
          <Input
            id="prof-school"
            value={schoolName}
            maxLength={120}
            onChange={(e) => setSchoolName(e.target.value)}
            placeholder={t("set.school.ph")}
          />
        </div>

        <div className="space-y-2">
          <Label>{t("set.subjects")}</Label>
          <div className="flex flex-wrap gap-2">
            {SUBJECT_OPTIONS.map((subj) => {
              const active = subjects.includes(subj);
              return (
                <button
                  key={subj}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleSubject(subj)}
                  className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? "border-primary bg-primary/15 text-foreground"
                      : "border-border bg-surface-2/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {subj}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="prof-goals">{t("set.learningGoals")}</Label>
          <Input
            id="prof-goals"
            value={learningGoals}
            maxLength={300}
            onChange={(e) => setLearningGoals(e.target.value)}
            placeholder={t("set.learningGoals.ph")}
          />
        </div>

        <div className="flex items-center justify-end pt-1">
          <Button type="submit" disabled={saving}>
            {t("common.save")}
          </Button>
        </div>
      </form>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/80 pt-4">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-foreground">{t("set.exportAll")}</div>
          <p className="text-xs text-muted-foreground">{t("set.exportAllDesc")}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={exportBusy}
          onClick={handleExportAllData}
          data-testid="settings-export-all-btn"
          className="gap-1.5"
        >
          {exportBusy ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Download className="size-3.5" />
          )}
          <span>{t("set.exportAll")}</span>
        </Button>
      </div>
    </SettingsSectionCard>
  );
}
