import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { PreferencesProvider } from "@/lib/preferences";
import { FeatureGuideProvider } from "@/components/common/FeatureGuideModal";
import { StudentPrivacyCenter } from "@/components/care/StudentPrivacyCenter";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { btcLogger } from "@/lib/observability";
import { BTC_BACKUP_SCHEMA_VERSION, computeDeterministicChecksum } from "@/lib/backup-recovery";

vi.mock("@/hooks/use-settings", () => ({
  useSaveSettings: () => vi.fn(async () => {}),
}));

vi.mock("@/lib/support-service", () => ({
  fetchPlatformStats: vi.fn(async () => ({
    total_users: 42,
    open_tickets: 3,
    pending_reports: 1,
    published_articles: 12,
  })),
}));

vi.mock("@/lib/student-ecosystem", () => ({
  useStudentEcosystem: () => ({ state: { communityProjects: [], resolvedGapIds: [] } }),
  resetCurrentEcosystemSandbox: vi.fn(),
}));

describe("Production Operations, Backup/Recovery & Observability UI", () => {
  beforeEach(() => {
    window.localStorage.clear();
    btcLogger.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("exports verified backup, restores valid backup JSON with rollback snapshot, and rejects tampered backups", async () => {
    window.localStorage.setItem(
      "btc_recitation_style_overrides_v1",
      JSON.stringify({ "al-luhaidan-qa-select": { emotionalStyles: ["reflective"] } }),
    );

    render(
      <PreferencesProvider>
        <FeatureGuideProvider>
          <StudentPrivacyCenter />
        </FeatureGuideProvider>
      </PreferencesProvider>,
    );

    const panel = screen.getByTestId("disaster-recovery-panel");
    expect(panel).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("export-system-backup-btn"));
    expect(screen.getByTestId("backup-status-banner")).toHaveTextContent(/btc_crc_/);

    // Prepare a tampered upload -> must fail validation
    const badFile = new File(
      ['{"metadata":{"appName":"BTC — BE THE CHANGE","checksum":"btc_crc_00000000"},"data":{}}'],
      "bad.json",
      {
        type: "application/json",
      },
    );
    const fileInput = screen.getByTestId("restore-backup-file-input") as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [badFile] } });

    await waitFor(() => {
      expect(screen.getByTestId("backup-status-banner")).toHaveTextContent(
        /Checksum verification failed/,
      );
    });

    // Prepare valid checksum upload -> must succeed and enable rollback button
    const validData = {
      directoryState: {
        favoriteReciterIds: ["ahmad-al-nafis"],
        favoriteRecordingKeys: [],
        listeningHistory: [],
      },
      islamicLearningState: { personalNotes: [], completedTopicIds: [] },
      styleOverrides: {},
      themePrefs: null,
      a11yPrefs: null,
      uiMode: null,
    };
    const crc = computeDeterministicChecksum(JSON.stringify(validData));
    const validFile = new File(
      [
        JSON.stringify({
          metadata: {
            appName: "BTC — BE THE CHANGE",
            appletId: "5e2578e5-d6c6-419c-9c1a-5f8674f1e7dd",
            schemaVersion: BTC_BACKUP_SCHEMA_VERSION,
            createdAt: new Date().toISOString(),
            checksum: crc,
            itemCounts: {
              favoriteReciters: 1,
              favoriteRecordings: 0,
              listeningHistory: 0,
              studyNotes: 0,
              studyCompletedTopics: 0,
              styleOverrides: 0,
            },
          },
          data: validData,
        }),
      ],
      "valid.json",
      { type: "application/json" },
    );

    fireEvent.change(fileInput, { target: { files: [validFile] } });

    await waitFor(() => {
      expect(screen.getByTestId("backup-status-banner")).toHaveTextContent(
        /Backup restored successfully/,
      );
    });

    const rollbackBtn = screen.getByTestId("rollback-backup-btn");
    expect(rollbackBtn).toBeInTheDocument();
    fireEvent.click(rollbackBtn);
    expect(screen.getByTestId("backup-status-banner")).toHaveTextContent(
      /Backup restored successfully/,
    );
  });

  it("renders live ecosystem health probes, AI safety guardrail metrics, and PII-scrubbed diagnostics in AdminOverview", async () => {
    btcLogger.warn("ai", "Blocked email leak@student.edu prompt");

    render(<AdminOverview />);

    expect(screen.getByTestId("ecosystem-health-probes")).toBeInTheDocument();
    expect(screen.getByTestId("ai-guardrail-metrics")).toBeInTheDocument();

    const logPanel = screen.getByTestId("pii-scrubbed-logs");
    expect(logPanel).toBeInTheDocument();
    expect(logPanel).toHaveTextContent(/\[REDACTED\]/);
    expect(logPanel).not.toHaveTextContent(/leak@student\.edu/);

    await waitFor(() => {
      expect(screen.getByTestId("ecosystem-health-probes")).toHaveTextContent(
        /Local Browser Storage/,
      );
    });
  });
});
