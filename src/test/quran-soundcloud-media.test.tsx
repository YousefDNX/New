import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QuranAudioProvider } from "@/contexts/QuranAudioContext";
import { QuranAudioPlayer } from "@/components/islamic/QuranAudioPlayer";
import { QuranMiniPlayer } from "@/components/islamic/QuranMiniPlayer";
import {
  getAuthenticReciter,
  getRecordingAudioUrl,
  getReciterSurahUrl,
  type VerifiedRecordingEdition,
} from "@/lib/quran-reciters";
import {
  detectDirectAudioFormat,
  getLuhaidanSurahMp3Url,
  isValidDirectAudioUrl,
  isValidSoundCloudUrl,
} from "@/lib/quran-soundcloud-media";

describe("Quran Direct Audio (MP3 & M4A), Sheikh Al-Luhaidan Two Tones, Surah Qaf, Taha, Al-Furqan, Al-Baqarah & MiniPlayer Controls", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(window.HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    vi.spyOn(window.HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
    vi.spyOn(window.HTMLMediaElement.prototype, "load").mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("supports m4a format and custom per-surah URLs in recording URL resolution", () => {
    const edition: VerifiedRecordingEdition = {
      recordingId: "test-m4a-edition",
      reciterId: "test-reciter",
      collectionTitleAr: "اختبار M4A",
      collectionTitleEn: "M4A Test Edition",
      riwayahAr: "حفص عن عاصم",
      riwayahEn: "Hafs 'an Asim",
      style: "Murattal",
      serverBaseUrl: "https://archive.org/download/test-m4a-collection/",
      audioFormat: "m4a",
      customSurahUrls: {
        25: "https://archive.org/download/14_20260303_202603/1.m4a",
      },
      availableSurahIds: [1, 25],
      qualityNoteAr: null,
      qualityNoteEn: null,
      addedDate: null,
      sourceName: "Archive.org",
      sourceUrl: "https://archive.org/details/14_20260303_202603",
      attributionAr: "مكتبة الأرشيف",
      attributionEn: "Archive Library",
      licenseNoteEn: "Public Archive",
      licenseNoteAr: "أرشيف عام",
    };

    const customReciter = {
      ...getAuthenticReciter("al-luhaidan"),
      recordings: [edition],
    };

    expect(getRecordingAudioUrl(edition, 1)).toBe(
      "https://archive.org/download/test-m4a-collection/001.m4a",
    );
    expect(getRecordingAudioUrl(edition, 25)).toBe(
      "https://archive.org/download/14_20260303_202603/1.m4a",
    );
    expect(getReciterSurahUrl(customReciter, 1, "test-m4a-edition")).toBe(
      "https://archive.org/download/test-m4a-collection/001.m4a",
    );
    expect(getReciterSurahUrl(customReciter, 25, "test-m4a-edition")).toBe(
      "https://archive.org/download/14_20260303_202603/1.m4a",
    );
  });

  it("validates direct audio URLs and formats securely without external leaks", () => {
    expect(isValidSoundCloudUrl("https://soundcloud.com/muhammad_alluhaidan")).toBe(true);
    expect(isValidSoundCloudUrl("javascript:alert(1)")).toBe(false);

    expect(isValidDirectAudioUrl("https://archive.org/download/al_luhaidan/050.mp3")).toBe(true);
    expect(isValidDirectAudioUrl("https://archive.org/download/002_20261007/020.m4a")).toBe(true);
    expect(isValidDirectAudioUrl("ftp://example.com/025.mp3")).toBe(false);

    expect(detectDirectAudioFormat("https://cdn.example.com/025.m4a?download=1")).toBe("m4a");
    expect(detectDirectAudioFormat("https://server8.mp3quran.net/lhdan/025.mp3")).toBe("mp3");
  });

  it("resolves Sheikh Mohammed Al-Luhaidan MP3/M4A links across all 114 surahs and highlights Qaf, Taha, and Furqan", () => {
    expect(getLuhaidanSurahMp3Url(1, "mp3quran")).toBe(
      "https://server8.mp3quran.net/lhdan/001.mp3",
    );
    expect(getLuhaidanSurahMp3Url(25, "mp3quran")).toBe(
      "https://server8.mp3quran.net/lhdan/025.mp3",
    );
    expect(getLuhaidanSurahMp3Url(25, "archive_ib")).toBe(
      "https://archive.org/download/al_luhaidan/025.mp3",
    );
    expect(getLuhaidanSurahMp3Url(50, "archive_ib")).toBe(
      "https://archive.org/download/al_luhaidan/050.mp3",
    );
    expect(getLuhaidanSurahMp3Url(114, "archive_ltq")).toBe(
      "https://archive.org/download/listen-to-quran.com_Mohammed-Al-Lohaidan/114.mp3",
    );

    const luhaidan = getAuthenticReciter("al-luhaidan");
    expect(luhaidan.recordings.length).toBeGreaterThanOrEqual(4);
    // Highlights for Taha (20), Furqan (25), and Qaf (50)
    expect(luhaidan.recordings[0]?.surahHighlights?.[20]?.verseArabicExcerpt).toContain(
      "وَيَسْأَلُونَكَ عَنِ الْجِبَالِ",
    );
    expect(luhaidan.recordings[0]?.surahHighlights?.[25]?.verseArabicExcerpt).toContain(
      "وَكَانَ اللَّهُ غَفُورًا رَحِيمًا",
    );
    expect(luhaidan.recordings[0]?.surahHighlights?.[50]?.verseArabicExcerpt).toContain(
      "وَجَاءَتْ سَكْرَةُ الْمَوْتِ بِالْحَقِّ",
    );
  });

  it("plays featured recitations (Taha, Furqan, Qaf, Baqarah) and switches between the two authentic styles", () => {
    render(
      <QuranAudioProvider initialReciterId="al-luhaidan" initialSurahId={25}>
        <QuranAudioPlayer lang="ar" initialReciterId="al-luhaidan" initialSurahId={25} />
      </QuranAudioProvider>,
    );

    expect(screen.getByTestId("quick-listen-taha-jibal")).toBeInTheDocument();
    expect(screen.getByTestId("quick-listen-furqan-signature")).toBeInTheDocument();
    expect(screen.getByTestId("quick-listen-qaf-signature")).toBeInTheDocument();
    expect(screen.getByTestId("quick-listen-baqarah-extra")).toBeInTheDocument();

    // Open direct audio hub tab
    fireEvent.click(screen.getByTestId("quran-tab-soundcloud"));
    const hub = screen.getByTestId("soundcloud-mp3-m4a-hub");
    expect(hub).toBeInTheDocument();

    // Verify zero user-facing SoundCloud text is rendered
    expect(hub.textContent).not.toMatch(/soundcloud/i);

    // Switch between the two tones
    const highToneBtn = screen.getByTestId("tone-switch-high");
    const calmToneBtn = screen.getByTestId("tone-switch-calm");
    expect(highToneBtn).toBeInTheDocument();
    expect(calmToneBtn).toBeInTheDocument();

    fireEvent.click(calmToneBtn);
    expect(calmToneBtn).toHaveClass("bg-emerald-700");

    fireEvent.click(highToneBtn);
    expect(highToneBtn).toHaveClass("bg-emerald-700");

    // All 114 Surahs selector
    const surahSelect = screen.getByTestId("luhaidan-114-surah-select");
    expect(surahSelect).toHaveTextContent(/25\.\s*سورة الفرقان/);

    // Quick play buttons
    fireEvent.click(screen.getByTestId("quick-play-furqan-mp3quran"));
    expect(screen.getByText(/التلاوة الحالية · 1\.0x · MP3/)).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("quick-play-qaf-sakrat"));
    expect(screen.getByText(/التلاوة الحالية · 1\.0x · MP3/)).toBeInTheDocument();

    // Add direct audio URL
    fireEvent.change(screen.getByTestId("custom-audio-url-input"), {
      target: { value: "https://archive.org/download/002_20261007/050.m4a" },
    });
    fireEvent.change(screen.getByTestId("custom-audio-title-input"), {
      target: { value: "سورة ق M4A خاشعة" },
    });
    fireEvent.click(screen.getByTestId("add-custom-audio-btn"));

    expect(screen.getByText(/التلاوة الحالية · 1\.0x · M4A/)).toBeInTheDocument();
  });

  it("renders QuranMiniPlayer with size controls (S/M/L) and bottom docked tab bar when minimized", () => {
    function MockAppShell() {
      const [page, setPage] = useState<"dashboard" | "study">("dashboard");
      return (
        <div>
          <nav>
            <button type="button" onClick={() => setPage("dashboard")}>
              Dashboard
            </button>
            <button type="button" onClick={() => setPage("study")}>
              Study
            </button>
          </nav>
          <main data-testid="active-route-view">{page}</main>
          <QuranMiniPlayer lang="ar" onOpenQuranPage={vi.fn()} />
        </div>
      );
    }

    render(
      <QuranAudioProvider initialReciterId="al-luhaidan" initialSurahId={1}>
        <MockAppShell />
      </QuranAudioProvider>,
    );

    const miniPlayer = screen.getByTestId("quran-persistent-mini-player");
    expect(miniPlayer).toBeInTheDocument();

    // Sizing controls: S / M / L
    const sizeSm = screen.getByTestId("mini-player-size-sm");
    const sizeLg = screen.getByTestId("mini-player-size-lg");
    const sizeMd = screen.getByTestId("mini-player-size-md");
    expect(sizeSm).toBeInTheDocument();
    expect(sizeLg).toBeInTheDocument();
    expect(sizeMd).toBeInTheDocument();

    fireEvent.click(sizeSm);
    expect(screen.getByTestId("quran-persistent-mini-player")).toHaveClass("md:w-80");

    fireEvent.click(sizeLg);
    expect(screen.getByTestId("quran-persistent-mini-player")).toHaveClass("md:w-[32rem]");

    fireEvent.click(sizeMd);
    expect(screen.getByTestId("quran-persistent-mini-player")).toHaveClass("md:w-[25rem]");

    // Minimize to docked bottom tab (not complete disappearance, sits as a tab at the bottom)
    const dismissBtn = screen.getByTestId("mini-player-dismiss");
    fireEvent.click(dismissBtn);

    // Mini player collapsed tab appears docked at the bottom
    expect(screen.queryByTestId("quran-persistent-mini-player")).not.toBeInTheDocument();
    const dockedTab = screen.getByTestId("mini-player-collapsed-tab");
    expect(dockedTab).toBeInTheDocument();

    // Reopen/expand in 1-click
    const reopenBtn = screen.getByTestId("mini-player-reopen");
    fireEvent.click(reopenBtn);

    // Full player is restored immediately
    expect(screen.getByTestId("quran-persistent-mini-player")).toBeInTheDocument();
    expect(screen.queryByTestId("mini-player-collapsed-tab")).not.toBeInTheDocument();
  });
});
