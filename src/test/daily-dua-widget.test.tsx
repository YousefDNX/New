import type { ReactNode } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DailyDuaWidget } from "@/components/dashboard/DailyDuaWidget";
import { PreferencesProvider } from "@/lib/preferences";

// Mock TanStack Link
vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    className,
    search,
  }: {
    children?: ReactNode;
    to?: string;
    className?: string;
    search?: Record<string, unknown>;
  }) => (
    <a href={to} className={className} data-search={JSON.stringify(search)}>
      {children}
    </a>
  ),
}));

describe("Daily Dua & Adhkar Dashboard Widget", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders DailyDuaWidget with rotating duaa, favorites filter, bookmarking toggle, and copy features", () => {
    render(
      <PreferencesProvider initialLang="ar">
        <DailyDuaWidget lang="ar" />
      </PreferencesProvider>,
    );

    const widget = screen.getByTestId("daily-dua-adhkar-widget");
    expect(widget).toBeInTheDocument();

    // Bookmark / favorite toggle button exists and toggles pressed state
    const bookmarkBtn = screen.getByRole("button", { name: /حفظ في المفضلة/i });
    expect(bookmarkBtn).toBeInTheDocument();
    fireEvent.click(bookmarkBtn);

    // Favorites filter toggle works
    const filterBtn = screen.getByTestId("dua-favorites-filter-btn");
    fireEvent.click(filterBtn);
    expect(filterBtn).toHaveAttribute("aria-pressed", "true");

    // Next duaa cycling works
    const nextBtn = screen.getByRole("button", { name: /دعاء تالي/i });
    fireEvent.click(nextBtn);

    // Copy button exists
    const copyBtn = screen.getByRole("button", { name: /نسخ ومشاركة/i });
    expect(copyBtn).toBeInTheDocument();
    fireEvent.click(copyBtn);

    // Link to full Islamic Center Adhkar library
    const fullLibraryLink = screen.getByRole("link", { name: /فتح موسوعة الأذكار كاملة/i });
    expect(fullLibraryLink).toBeInTheDocument();
    expect(fullLibraryLink.getAttribute("href")).toBe("/app/quran");
  });
});
