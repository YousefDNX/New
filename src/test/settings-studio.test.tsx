import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ThemesLayoutsSection } from "@/components/settings/ThemesLayoutsSection";
import { TypographySection } from "@/components/settings/TypographySection";
import { PreferencesProvider, usePrefs } from "@/lib/preferences";

function PreviewBarHarness() {
  const { isPreviewing, commitPreview, cancelPreview, t } = usePrefs();
  if (!isPreviewing) return null;
  return (
    <div data-testid="test-preview-bar">
      <button type="button" onClick={cancelPreview}>
        {t("set.preview.cancel")}
      </button>
      <button type="button" onClick={() => commitPreview()}>
        {t("set.preview.apply")}
      </button>
    </div>
  );
}

describe("Settings Studio: Themes, Layouts & Typography", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it("renders all 4 interface themes and updates DOM dataset attributes on live Preview and Apply", () => {
    const runSave = vi.fn((apply: () => void) => apply());
    render(
      <PreferencesProvider>
        <PreviewBarHarness />
        <ThemesLayoutsSection runSave={runSave} />
      </PreferencesProvider>,
    );

    expect(screen.getByTestId("theme-card-classic")).toBeInTheDocument();
    expect(screen.getByTestId("theme-card-minimal")).toBeInTheDocument();
    expect(screen.getByTestId("theme-card-focus")).toBeInTheDocument();
    expect(screen.getByTestId("theme-card-creative")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("preview-theme-creative"));
    expect(screen.getByTestId("test-preview-bar")).toBeInTheDocument();
    expect(document.documentElement.dataset["uiTheme"]).toBe("creative");
    expect(document.documentElement.dataset["cardStyle"]).toBe("glass");
    expect(document.documentElement.dataset["bgStyle"]).toBe("grid");

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByTestId("test-preview-bar")).not.toBeInTheDocument();
    expect(document.documentElement.dataset["uiTheme"]).toBe("classic");

    fireEvent.click(screen.getByTestId("apply-theme-focus"));
    expect(runSave).toHaveBeenCalled();
    expect(document.documentElement.dataset["uiTheme"]).toBe("focus");
    expect(document.documentElement.dataset["animationLevel"]).toBe("none");
  });

  it("renders Typography Studio specimen, applies font families, and persists sidebar mode changes", () => {
    const runSave = vi.fn((apply: () => void) => apply());
    render(
      <PreferencesProvider>
        <ThemesLayoutsSection runSave={runSave} />
        <TypographySection runSave={runSave} />
      </PreferencesProvider>,
    );

    expect(screen.getByTestId("typography-preview-card")).toBeInTheDocument();
    expect(screen.getByTestId("typography-preview-card")).toHaveTextContent("1,250 XP");

    fireEvent.click(screen.getByTestId("font-card-serif"));
    expect(document.documentElement.dataset["font"]).toBe("serif");

    fireEvent.click(screen.getByRole("radio", { name: "Compact" }));
    expect(runSave).toHaveBeenCalled();
  });
});
