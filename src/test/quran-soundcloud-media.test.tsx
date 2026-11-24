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
  buildSoundCloudEmbedUrl,
  detectDirectAudioFormat,
  getLuhaidanSurahMp3Url,
  isValidDirectAudioUrl,
  isValidSoundCloudUrl,
} from "@/lib/quran-soundcloud-media";

describe("Quran SoundCloud, Mohammed Al-Luhaidan 114 Surahs, Surah Al-Furqan & MP3/M4A Media", () => {
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

  it("validates SoundCloud URLs safely and rejects non-SoundCloud or javascript URLs", () => {
    expect(isValidSoundCloudUrl("https://soundcloud.com/muhammad_alluhaidan")).toBe(true);
    expect(isValidSoundCloudUrl("https://on.soundcloud.com/abc123")).toBe(true);
    expect(isValidSoundCloudUrl("http://soundcloud.com/muhammad_alluhaidan")).toBe(false);
    expect(isValidSoundCloudUrl("javascript:alert(1)")).toBe(false);
    expect(isValidSoundCloudUrl("https://evil.example.com/soundcloud.com")).toBe(false);

    const embed = buildSoundCloudEmbedUrl("https://soundcloud.com/muhammad_alluhaidan");
    expect(embed).toContain("https://w.soundcloud.com/player/?url=");
    expect(embed).toContain("muhammad_alluhaidan");
    expect(buildSoundCloudEmbedUrl("https://evil.com/track")).toBeNull();

    expect(isValidDirectAudioUrl("https://archive.org/download/14_20260303_202603/1.m4a")).toBe(
      true,
    );
    expect(isValidDirectAudioUrl("ftp://example.com/025.mp3")).toBe(false);
    expect(detectDirectAudioFormat("https://cdn.example.com/025.m4a?download=1")).toBe("m4a");
    expect(detectDirectAudioFormat("https://server8.mp3quran.net/lhdan/025.mp3")).toBe("mp3");
  });

  it("resolves Sheikh Mohammed Al-Luhaidan MP3 links across all 114 surahs and Surah Al-Furqan (25)", () => {
    expect(getLuhaidanSurahMp3Url(1, "mp3quran")).toBe(
      "https://server8.mp3quran.net/lhdan/001.mp3",
    );
    expect(getLuhaidanSurahMp3Url(25, "mp3quran")).toBe(
      "https://server8.mp3quran.net/lhdan/025.mp3",
    );
    expect(getLuhaidanSurahMp3Url(25, "archive_ib")).toBe(
      "https://archive.org/download/al_luhaidan/025.mp3",
    );
    expect(getLuhaidanSurahMp3Url(114, "archive_ltq")).toBe(
      "https://archive.org/download/listen-to-quran.com_Mohammed-Al-Lohaidan/114.mp3",
    );
  });

  it("opens SoundCloud/MP3/M4A hub, plays Al-Furqan & any of 114 surahs for Al-Luhaidan, and adds custom M4A & SoundCloud links", () => {
    render(
      <QuranAudioProvider initialReciterId="al-luhaidan" initialSurahId={25}>
        <QuranAudioPlayer lang="en" initialReciterId="al-luhaidan" initialSurahId={25} />
      </QuranAudioProvider>,
    );

    fireEvent.click(screen.getByTestId("quran-tab-soundcloud"));
    expect(screen.getByTestId("soundcloud-mp3-m4a-hub")).toBeInTheDocument();

    const iframe = screen.getByTestId("soundcloud-embed-iframe") as HTMLIFrameElement;
    expect(iframe.src).toContain("https://w.soundcloud.com/player/");
    expect(iframe.src).toContain("muhammad_alluhaidan");

    // 114 Surah picker includes Surah 114 and plays Surah Al-Furqan cleanly
    const surahSelect = screen.getByTestId("luhaidan-114-surah-select") as HTMLSelectElement;
    expect(surahSelect.options.length).toBe(114);
    expect(surahSelect.value).toBe("25");

    fireEvent.click(screen.getByTestId("quick-play-furqan-mp3quran"));
    expect(screen.getByText(/Now Playing · 1\.0x · MP3/)).toBeInTheDocument();

    // Add custom SoundCloud URL
    fireEvent.change(screen.getByTestId("custom-audio-url-input"), {
      target: { value: "https://soundcloud.com/muhammad_alluhaidan/surah-furqan-test" },
    });
    fireEvent.change(screen.getByTestId("custom-audio-title-input"), {
      target: { value: "Al-Luhaidan Al-Furqan SC" },
    });
    fireEvent.click(screen.getByTestId("add-custom-audio-btn"));

    const updatedIframe = screen.getByTestId("soundcloud-embed-iframe") as HTMLIFrameElement;
    expect(updatedIframe.src).toContain("surah-furqan-test");

    // Filter by M4A and add custom M4A audio URL
    fireEvent.change(screen.getByTestId("custom-audio-url-input"), {
      target: { value: "https://archive.org/download/14_20260303_202603/5.m4a" },
    });
    fireEvent.change(screen.getByTestId("custom-audio-title-input"), {
      target: { value: "Surah Al-Ma'idah M4A" },
    });
    fireEvent.click(screen.getByTestId("add-custom-audio-btn"));

    expect(screen.getByText(/Now Playing · 1\.0x · M4A/)).toBeInTheDocument();
    expect(document.querySelectorAll('a[target="_blank"]').length).toBe(0);
  });

  it("renders persistent QuranMiniPlayer with play/pause, seek bar, and Surah list visible across app navigation", () => {
    function MockAppShell() {
      const [page, setPage] = useState<"dashboard" | "study" | "habits">("dashboard");
      return (
        <div>
          <nav>
            <button type="button" onClick={() => setPage("dashboard")}>
              Go Dashboard
            </button>
            <button type="button" onClick={() => setPage("study")}>
              Go Study
            </button>
            <button type="button" onClick={() => setPage("habits")}>
              Go Habits
            </button>
          </nav>
          <main data-testid="active-route-view">{page}</main>
          <QuranMiniPlayer lang="en" onOpenQuranPage={vi.fn()} />
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
    expect(screen.getByTestId("mini-player-toggle-play")).toBeInTheDocument();
    expect(screen.getByTestId("mini-player-seek-bar")).toBeInTheDocument();
    expect(screen.getByTestId("mini-player-surah-list")).toBeInTheDocument();

    // Filter Surah list for Al-Furqan (25) and click to play
    fireEvent.change(screen.getByTestId("mini-player-surah-search"), {
      target: { value: "Furqan" },
    });
    const furqanRow = screen.getByTestId("mini-player-surah-25");
    fireEvent.click(furqanRow);
    expect(miniPlayer).toHaveTextContent(/Surah Al-Furqan/i);

    // Seek forward cleanly
    const seekBar = screen.getByTestId("mini-player-seek-bar") as HTMLInputElement;
    fireEvent.change(seekBar, { target: { value: "45" } });
    expect(seekBar.value).toBe("45");

    // Navigate across multiple app routes and confirm persistent player & Surah list stay visible
    fireEvent.click(screen.getByRole("button", { name: "Go Study" }));
    expect(screen.getByTestId("active-route-view")).toHaveTextContent("study");
    expect(screen.getByTestId("quran-persistent-mini-player")).toBeInTheDocument();
    expect(screen.getByTestId("mini-player-surah-list")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Go Habits" }));
    expect(screen.getByTestId("active-route-view")).toHaveTextContent("habits");
    expect(screen.getByTestId("quran-persistent-mini-player")).toBeInTheDocument();
    expect(screen.getByTestId("mini-player-surah-list")).toBeInTheDocument();
  });
});
