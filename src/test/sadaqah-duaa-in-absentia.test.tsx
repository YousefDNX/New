import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SadaqahJariyahAndDuaaModal } from "@/components/islamic/SadaqahJariyahAndDuaaModal";
import { AppFooter } from "@/components/app/AppFooter";
import { GoodDeedsPanel } from "@/components/islamic/GoodDeedsPanel";

// Mock TanStack Link
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, className }: Record<string, unknown>) => (
    <a href={to as string} className={className as string}>
      {children}
    </a>
  ),
  createFileRoute: () => () => ({ component: () => null }),
}));

import { PreferencesProvider } from "@/lib/preferences";

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <PreferencesProvider>
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    </PreferencesProvider>,
  );
}

describe("Sadaqah Jariyah, Duaa in Absentia for Yousef Wael & Good Deeds Multipliers", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("opens SadaqahJariyahAndDuaaModal, shows authentic Hadith, and confirms heartfelt prayer in the unseen", () => {
    render(<SadaqahJariyahAndDuaaModal defaultOpen={true} lang="ar" />);

    // Modal is open
    const modal = screen.getByTestId("sadaqah-duaa-modal");
    expect(modal).toBeInTheDocument();

    // Contains authentic Sahih Muslim hadith
    expect(modal).toHaveTextContent(/دَعْوَةُ المَرْءِ المُسْلِمِ لأَخِيهِ بِظَهْرِ الغَيْبِ مُسْتَجَابَةٌ/);
    expect(modal).toHaveTextContent(/آمِينَ، وَلَكَ بِمِثْلٍ/);
    expect(modal).toHaveTextContent(/صحيح مسلم/);

    // Mentions Yousef Wael and parents
    expect(modal).toHaveTextContent(/يوسف وائل/);

    // Click confirm duaa button
    const confirmBtn = screen.getByTestId("confirm-duaa-prayed-btn");
    fireEvent.click(confirmBtn);

    // Toast appears
    const celebration = screen.getByTestId("duaa-celebration-banner");
    expect(celebration).toBeInTheDocument();
    expect(celebration).toHaveTextContent(/جَزَاكَ اللَّهُ خَيْرًا وَتَقَبَّلَ اللَّهُ دُعَاءَكَ الصَّادِقَ/);
    expect(celebration).toHaveTextContent(/آمِينَ، وَلَكَ بِمِثْلِ مَا دَعَوْتَ وَزِيَادَةً/);

    // Tasbih counters work
    const subhanAllahBtn = screen.getByRole("button", { name: /سُبْحَانَ اللَّهِ/i });
    fireEvent.click(subhanAllahBtn);
    expect(subhanAllahBtn).toHaveTextContent("1");
    fireEvent.click(subhanAllahBtn);
    expect(subhanAllahBtn).toHaveTextContent("2");
  });

  it("renders Duaa in Absentia button in AppFooter alongside creator credit", () => {
    renderWithQuery(<AppFooter />);

    const credit = screen.getByTestId("footer-creator-credit");
    expect(credit).toHaveTextContent(/Designed & Developed by Yousef Wael © 2026/);

    const duaaBtn = screen.getByTestId("footer-duaa-in-absentia-btn");
    expect(duaaBtn).toBeInTheDocument();

    fireEvent.click(duaaBtn);
    expect(screen.getByTestId("sadaqah-duaa-modal")).toBeInTheDocument();
  });

  it("renders Duaa card and 7 sincere intentions in GoodDeedsPanel", () => {
    render(<GoodDeedsPanel lang="ar" />);

    expect(screen.getByTestId("good-deeds-duaa-sadaqah-card")).toBeInTheDocument();
    expect(screen.getByTestId("open-duaa-modal-from-good-deeds")).toBeInTheDocument();

    const intentionsCard = screen.getByTestId("good-deeds-intentions-card");
    expect(intentionsCard).toBeInTheDocument();
    expect(intentionsCard).toHaveTextContent(/نوايا طالب العلم السبع لكسب حب الله ورضاه/);
    expect(intentionsCard).toHaveTextContent(/رفع الجهل عن النفس وعبادة الله على بصيرة/);
    expect(intentionsCard).toHaveTextContent(/نفع المسلمين والإحسان إلى الناس وتعمير الأرض/);
    expect(intentionsCard).toHaveTextContent(/بر الوالدين وإدخال السرور على قلوبهما/);
  });
});
