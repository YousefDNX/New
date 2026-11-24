import { Bell, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { usePrefs } from "@/lib/preferences";
import type { NotificationPrefs } from "@/lib/settings";
import type { UserSettingsRow } from "@/lib/firestore-data";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { SegmentedChoice, SettingsRow, SettingsSectionCard } from "./SettingsPrimitives";
import { BRAND } from "@/config/brand";

type SettingsPatch = Partial<Omit<UserSettingsRow, "user_id" | "theme">> & { theme?: string };

export function NotificationsSection({
  runSave,
}: {
  runSave: (apply: () => void, undo: () => void, patch: SettingsPatch) => void;
}) {
  const { t, notifications, setNotifications } = usePrefs();
  const [permStatus, setPermStatus] = useState<NotificationPermission | "unsupported">("default");

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermStatus("unsupported");
    } else {
      setPermStatus(Notification.permission);
    }
  }, []);

  function updateNotif(patch: Partial<NotificationPrefs>, dbPatch: SettingsPatch) {
    const prev = notifications;
    runSave(
      () => setNotifications(patch),
      () => setNotifications(prev),
      dbPatch,
    );
  }

  async function requestPermission() {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    try {
      const res = await Notification.requestPermission();
      setPermStatus(res);
      if (res === "granted") {
        toast.success(t("set.notif.perm.granted"));
      }
    } catch {
      toast.error(t("set.notif.perm.unsupported"));
    }
  }

  function sendTestNotification() {
    if (
      typeof window === "undefined" ||
      !("Notification" in window) ||
      Notification.permission !== "granted"
    ) {
      toast.info(t("set.notif.perm.req"));
      return;
    }
    try {
      new Notification(BRAND.name, {
        body: t("set.notif.reminders"),
        icon: "/icon-192.png",
      });
    } catch {
      toast.success(t("set.notif.perm.test"));
    }
  }

  const permText =
    permStatus === "granted"
      ? t("set.notif.perm.granted")
      : permStatus === "denied"
        ? t("set.notif.perm.denied")
        : permStatus === "unsupported"
          ? t("set.notif.perm.unsupported")
          : t("set.notif.perm.default");

  return (
    <SettingsSectionCard
      id="cat-notifications"
      title={t("set.notif.title")}
      desc={t("set.notif.d")}
      badge={<FeatureGuideTrigger featureId="settings-notifications" />}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 py-3.5">
        <div>
          <p className="text-sm font-medium">{t("set.notif.perm")}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{permText}</p>
        </div>
        <div className="flex items-center gap-2">
          {permStatus === "default" && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={requestPermission}
              className="gap-1.5"
            >
              <Bell className="size-3.5" />
              <span>{t("set.notif.perm.req")}</span>
            </Button>
          )}
          {permStatus === "granted" && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={sendTestNotification}
              className="gap-1.5"
            >
              <Bell className="size-3.5" />
              <span>{t("set.notif.perm.test")}</span>
            </Button>
          )}
        </div>
      </div>

      <SettingsRow id="n-rem" label={t("set.notif.reminders")}>
        <Switch
          id="n-rem"
          checked={notifications.reminders}
          onCheckedChange={(v) => updateNotif({ reminders: v }, { notify_reminders: v })}
        />
      </SettingsRow>

      <SettingsRow id="n-tasks" label={t("set.notif.tasks")}>
        <Switch
          id="n-tasks"
          checked={notifications.tasks}
          onCheckedChange={(v) => updateNotif({ tasks: v }, { notify_tasks: v })}
        />
      </SettingsRow>

      <SettingsRow id="n-cal" label={t("set.notif.calendar")}>
        <Switch
          id="n-cal"
          checked={notifications.calendar}
          onCheckedChange={(v) => updateNotif({ calendar: v }, { notify_calendar: v })}
        />
      </SettingsRow>

      <SettingsRow id="n-streak" label={t("set.notif.streak")}>
        <Switch
          id="n-streak"
          checked={notifications.streak}
          onCheckedChange={(v) => updateNotif({ streak: v }, { notify_streak: v })}
        />
      </SettingsRow>

      <SettingsRow id="n-opps" label={t("set.notif.opportunities")}>
        <Switch
          id="n-opps"
          checked={notifications.opportunities}
          onCheckedChange={(v) => updateNotif({ opportunities: v }, { notify_opportunities: v })}
        />
      </SettingsRow>

      <SettingsRow id="n-comm" label={t("set.notif.community")}>
        <Switch
          id="n-comm"
          checked={notifications.community}
          onCheckedChange={(v) => updateNotif({ community: v }, { notify_community: v })}
        />
      </SettingsRow>

      <SettingsRow id="n-teams" label={t("set.notif.teams")}>
        <Switch
          id="n-teams"
          checked={notifications.teams}
          onCheckedChange={(v) => updateNotif({ teams: v }, { notify_teams: v })}
        />
      </SettingsRow>

      <div className="flex items-center justify-between gap-4 py-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Lock className="size-3.5" />
          <span>{t("set.notif.account")}</span>
        </span>
        <span className="font-medium text-success">{t("common.enabled")}</span>
      </div>

      <SettingsRow id="n-email" label={t("set.notif.email")}>
        <Switch
          id="n-email"
          checked={notifications.emailEnabled}
          onCheckedChange={(v) => updateNotif({ emailEnabled: v }, { notify_email_enabled: v })}
        />
      </SettingsRow>

      <SettingsRow id="n-push" label={t("set.notif.push")}>
        <Switch
          id="n-push"
          checked={notifications.pushEnabled}
          onCheckedChange={(v) => updateNotif({ pushEnabled: v }, { notify_push_enabled: v })}
        />
      </SettingsRow>

      <SettingsRow label={t("set.notif.freq")}>
        <SegmentedChoice
          label={t("set.notif.freq")}
          value={notifications.frequency}
          onChange={(v) => updateNotif({ frequency: v }, { notify_frequency: v })}
          options={[
            { v: "instant", l: t("set.notif.freq.instant") },
            { v: "daily", l: t("set.notif.freq.daily") },
            { v: "weekly", l: t("set.notif.freq.weekly") },
          ]}
        />
      </SettingsRow>

      <div className="space-y-3 py-3.5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">{t("set.notif.quiet")}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{t("set.notif.quiet.d")}</p>
          </div>
          <Switch
            aria-label={t("set.notif.quiet")}
            checked={notifications.quietHoursEnabled}
            onCheckedChange={(v) =>
              updateNotif({ quietHoursEnabled: v }, { quiet_hours_enabled: v })
            }
          />
        </div>

        {notifications.quietHoursEnabled && (
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{t("set.notif.quietStart")}</span>
              <Input
                type="time"
                value={notifications.quietStart}
                onChange={(e) =>
                  updateNotif({ quietStart: e.target.value }, { quiet_hours_start: e.target.value })
                }
                dir="ltr"
                className="h-8 w-32 font-mono text-xs"
              />
            </label>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{t("set.notif.quietEnd")}</span>
              <Input
                type="time"
                value={notifications.quietEnd}
                onChange={(e) =>
                  updateNotif({ quietEnd: e.target.value }, { quiet_hours_end: e.target.value })
                }
                dir="ltr"
                className="h-8 w-32 font-mono text-xs"
              />
            </label>
          </div>
        )}
      </div>
    </SettingsSectionCard>
  );
}
