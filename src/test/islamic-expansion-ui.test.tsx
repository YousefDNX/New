import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { IslamicCenterWorkspace } from "@/components/islamic/IslamicCenterWorkspace";
import { QuranAudioPlayer } from "@/components/islamic/QuranAudioPlayer";

describe("Islamic Center Expansion & Global Reciters Directory UI", () => {
  beforeEach(() => {
    if (typeof window !== "undefined") {
      window.history.replaceState({}, "", "/");
    }
  });

  it("browses Country Browser -> Kuwait -> Sheikh Ahmed Al-Nafis with dedicated profile and multi-recording switcher", () => {
    render(<QuranAudioPlayer lang="en" />);

    expect(screen.getByTestId("country-browser-grid")).toBeInTheDocument();
    const kuwaitCard = screen.getByTestId("country-card-KW");
    fireEvent.click(kuwaitCard);

    expect(screen.getByTestId("country-detail-view")).toBeInTheDocument();
    const nafisCard = screen.getByTestId("reciter-card-ahmad-al-nafis");
    expect(nafisCard).toBeInTheDocument();

    fireEvent.click(within(nafisCard).getByText(/Sheikh Ahmed Al-Nafis/i));
    const profile = screen.getByTestId("active-reciter-profile");
    expect(profile).toHaveTextContent(/Sheikh Ahmed Al-Nafis/i);
    expect(profile).toHaveTextContent(/Associated country:/i);
    expect(profile).toHaveTextContent(/114\/114 Surahs/i);
  });

  it("renders Multi-Recording selector for Al-Husary Surah Al-Fatihah and switches editions cleanly", () => {
    render(<QuranAudioPlayer lang="en" initialReciterId="al-husary" initialSurahId={1} />);

    const recordingsList = screen.getByTestId("surah-recordings-list");
    expect(recordingsList).toHaveTextContent(/Murattal/i);
    expect(recordingsList).toHaveTextContent(/Mujawwad/i);

    const mujawwadOption = screen.getByTestId("recording-option-al-husary-mujawwad");
    fireEvent.click(within(mujawwadOption).getByRole("button", { name: /Complete Mujawwad/i }));
    expect(mujawwadOption.className).toContain("border-emerald-500");
  });

  it("navigates across Tafsir layer separation, Tajweed Academy, Fiqh Madhhab filter, Guarded AI helper, and Unified Search while preserving sincerity notice", () => {
    render(<IslamicCenterWorkspace initialTab="tafsir" lang="en" />);

    expect(screen.getByTestId("islamic-sincerity-notice")).toHaveTextContent(
      /BTC never calculates divine reward/i,
    );
    expect(screen.getByTestId("tafsir-layer-quran")).toBeInTheDocument();
    expect(screen.getByTestId("tafsir-layer-translation")).toBeInTheDocument();
    expect(screen.getByTestId("tafsir-layer-classical")).toBeInTheDocument();
    expect(screen.getByTestId("tafsir-layer-study-overview")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Tajweed Academy/i }));
    expect(screen.getByTestId("tajweed-talaqqi-disclaimer")).toBeInTheDocument();
    expect(screen.getByTestId("tajweed-lesson-tajweed-noon-sakinah")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Knowledge Hub/i }));
    expect(screen.getByTestId("fiqh-scholar-referral")).toBeInTheDocument();
    const madhhabSelect = screen.getByLabelText(/Select Madhhab/i);
    fireEvent.change(madhhabSelect, { target: { value: "hanafi" } });
    expect(screen.getByTestId("fiqh-card-fiqh-wudu-essentials")).toHaveTextContent(/Hanafi/i);

    fireEvent.click(screen.getByRole("button", { name: /Study Log, Registry & Helper/i }));
    expect(screen.getByTestId("editorial-verification-registry")).toBeInTheDocument();

    const aiHelper = screen.getByTestId("islamic-ai-study-helper");
    const input = aiHelper.querySelector("input")!;
    fireEvent.change(input, { target: { value: "Give me a personal fatwa on divorce" } });
    fireEvent.submit(input.closest("form")!);
    expect(screen.getByTestId("islamic-ai-answer-box")).toHaveTextContent(
      /Scholar Referral Enforced/i,
    );

    fireEvent.click(screen.getByRole("button", { name: /Unified Search/i }));
    const searchPanel = screen.getByTestId("unified-islamic-search-panel");
    const searchInput = searchPanel.querySelector("input")!;
    fireEvent.change(searchInput, { target: { value: "Al-Nafis" } });
    expect(searchPanel).toHaveTextContent(/Sheikh Ahmed Al-Nafis/i);
  });

  it("supports RTL Arabic layout cleanly across new modules", () => {
    const { container } = render(<IslamicCenterWorkspace initialTab="knowledge" lang="ar" />);
    const root = container.querySelector('[data-testid="islamic-center-workspace"]');
    expect(root).toHaveAttribute("dir", "rtl");
    expect(screen.getByTestId("islamic-sincerity-notice")).toHaveTextContent(
      /تنبيه الإخلاص والخصوصية/,
    );
    expect(screen.getByTestId("fiqh-scholar-referral")).toBeInTheDocument();
  });

  it("discovers reciters by vocal signature & emotional style, filters active profile editions, and saves editorial style overrides", () => {
    window.localStorage.clear();
    render(<QuranAudioPlayer lang="ar" initialReciterId="al-luhaidan" initialSurahId={18} />);

    // 1. Active profile displays Al-Luhaidan's verified signature and separated style chips
    const styleSection = screen.getByTestId("reciter-style-characteristics");
    expect(styleSection).toBeInTheDocument();
    expect(screen.getByTestId("reciter-signature-banner-al_luhaidan_signature")).toHaveTextContent(
      /النبرة اللحيدانية/,
    );

    // 2. Open Tab 2 (Recitation Styles Explorer) and filter by Al-Luhaidan signature chip
    fireEvent.click(screen.getByRole("button", { name: /^الأنماط الصوتية \(/ }));
    const stylesExplorer = screen.getByTestId("recitation-styles-explorer");
    expect(stylesExplorer).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("style-chip-al_luhaidan_signature"));
    expect(screen.getByTestId("style-recording-card-al-luhaidan-mp3q-server8")).toBeInTheDocument();

    // 3. Return to reciter editions list & open Editorial Classification Modal on QuranicAudio edition
    fireEvent.click(screen.getByRole("button", { name: /^الدول \(/ }));
    const editBtn = screen.getByTestId("edit-style-al-luhaidan-qa-select");
    fireEvent.click(editBtn);

    const modal = screen.getByTestId("style-editorial-modal");
    expect(modal).toBeInTheDocument();
    fireEvent.click(within(modal).getByRole("button", { name: /تدبرية رصينة/i }));
    fireEvent.click(screen.getByTestId("save-style-editorial-btn"));

    expect(screen.queryByTestId("style-editorial-modal")).not.toBeInTheDocument();
    const qaCard = screen.getByTestId("recording-option-al-luhaidan-qa-select");
    expect(qaCard).toHaveTextContent(/تدبرية رصينة/);
  });
});
