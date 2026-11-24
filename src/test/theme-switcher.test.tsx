import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useTheme } from "@/components/theme/ThemeContext";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { THEME_CATALOG } from "@/lib/theme-catalog";

function ThemeConsumer() {
  const { themePresetId, applyThemePreset, themePresets } = useTheme();
  return (
    <div>
      <span data-testid="current-preset">{themePresetId ?? "none"}</span>
      <span data-testid="preset-count">{themePresets.length}</span>
      <button type="button" onClick={() => applyThemePreset("nordic_frost")}>
        Set Nordic Frost
      </button>
    </div>
  );
}

describe("ThemeContext & ThemeSwitcher 2-preset toggle suite", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme-preset");
    delete document.documentElement.dataset["themePreset"];
  });

  it("exposes both presets in ThemeContext and updates DOM and localStorage on preset change", () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("preset-count")).toHaveTextContent("2");
    expect(screen.getByTestId("current-preset")).toHaveTextContent("none");

    fireEvent.click(screen.getByText("Set Nordic Frost"));
    expect(screen.getByTestId("current-preset")).toHaveTextContent("nordic_frost");
    expect(document.documentElement.getAttribute("data-theme-preset")).toBe("nordic_frost");
    expect(document.documentElement.dataset["themePreset"]).toBe("nordic_frost");
    expect(localStorage.getItem("themePreset")).toBe("nordic_frost");
  });

  it("renders both presets in ThemeSwitcher and toggles preset on click", () => {
    render(
      <ThemeProvider>
        <ThemeSwitcher variant="presets" />
      </ThemeProvider>,
    );

    for (const preset of THEME_CATALOG) {
      expect(screen.getByTestId(`theme-preset-${preset.id}`)).toBeTruthy();
    }

    fireEvent.click(screen.getByTestId("theme-preset-nordic_frost"));
    expect(document.documentElement.getAttribute("data-theme-preset")).toBe("nordic_frost");
    expect(localStorage.getItem("themePreset")).toBe("nordic_frost");

    fireEvent.click(screen.getByTestId("theme-preset-btc_classic"));
    expect(document.documentElement.getAttribute("data-theme-preset")).toBe("btc_classic");
    expect(localStorage.getItem("themePreset")).toBe("btc_classic");
  });
});
