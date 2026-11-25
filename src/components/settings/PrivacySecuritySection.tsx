import type { ProfileRow, UserSettingsRow } from "@/lib/firestore-data";
import { AccountProfileSection } from "./AccountProfileSection";

type SettingsPatch = Partial<Omit<UserSettingsRow, "user_id" | "theme">> & { theme?: string };

export function PrivacySecuritySection({
  profile,
}: {
  user?: unknown;
  profile: ProfileRow | null | undefined;
  onOpenUpgrade?: () => void;
  runSave?: (apply: () => void, undo: () => void, patch: SettingsPatch) => void;
}) {
  return <AccountProfileSection profile={profile} />;
}
