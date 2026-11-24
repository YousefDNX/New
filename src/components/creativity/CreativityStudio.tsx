import { useEffect, useRef, useState } from "react";
import {
  Camera,
  Download,
  Film,
  LayoutTemplate,
  Music,
  Pause,
  PenTool,
  Play,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePrefs } from "@/lib/preferences";
import { downloadTextFile } from "@/lib/safe-file";
import { useStudentEcosystem } from "@/lib/student-ecosystem";

type CreativityTab = "infographic" | "story" | "animation" | "photography" | "music";

const PIANO_NOTES = [
  { note: "C4", freq: 261.63, sharp: false },
  { note: "C#4", freq: 277.18, sharp: true },
  { note: "D4", freq: 293.66, sharp: false },
  { note: "D#4", freq: 311.13, sharp: true },
  { note: "E4", freq: 329.63, sharp: false },
  { note: "F4", freq: 349.23, sharp: false },
  { note: "F#4", freq: 369.99, sharp: true },
  { note: "G4", freq: 392.0, sharp: false },
  { note: "G#4", freq: 415.3, sharp: true },
  { note: "A4", freq: 440.0, sharp: false },
  { note: "A#4", freq: 466.16, sharp: true },
  { note: "B4", freq: 493.88, sharp: false },
  { note: "C5", freq: 523.25, sharp: false },
];

function playTone(freq: number, durationSec = 0.28) {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSec);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + durationSec + 0.02);
  } catch {
    /* ignore audio errors */
  }
}

export function CreativityStudio() {
  const { lang } = usePrefs();
  const isAr = lang === "ar";
  const { state: eco, update: updateEco } = useStudentEcosystem();
  const [tab, setTab] = useState<CreativityTab>("infographic");

  const saveCreativeArtifact = (
    kind: "infographic" | "story" | "animation" | "music",
    title: string,
    summary: string,
  ) => {
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    updateEco((prev) => ({
      ...prev,
      creativeProjects: [
        {
          id: `cr_${Date.now().toString(36)}`,
          kind,
          title: cleanTitle,
          summary,
          updatedAt: new Date().toISOString(),
        },
        ...prev.creativeProjects.filter((p) => !(p.kind === kind && p.title === cleanTitle)),
      ].slice(0, 30),
    }));
    toast.success(
      isAr ? "تم حفظ العمل الإبداعي في ملفك" : "Saved creative project to your studio log",
    );
  };

  // #13 & #18 Infographic / Poster Studio
  const [posterLayout, setPosterLayout] = useState<"split" | "timeline" | "compare">("split");
  const [posterTitle, setPosterTitle] = useState("Solar Desalination in Arid Regions");
  const [posterStat, setPosterStat] = useState("42% lower brine energy draw");
  const [posterBody, setPosterBody] = useState(
    "Combining reverse osmosis membranes with thermal solar collectors reduces fossil power load for coastal water supply.",
  );
  const [posterAccent, setPosterAccent] = useState("#14b8a6");

  const exportPosterSvg = () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="400" viewBox="0 0 720 400">
  <rect width="720" height="400" rx="20" fill="#0f172a"/>
  <rect x="24" y="24" width="672" height="352" rx="14" fill="#1e293b" stroke="${posterAccent}" stroke-width="3"/>
  <text x="48" y="84" fill="#f8fafc" font-family="sans-serif" font-size="26" font-weight="700">${posterTitle.replace(/[<>&]/g, "")}</text>
  <text x="48" y="136" fill="${posterAccent}" font-family="monospace" font-size="22" font-weight="700">${posterStat.replace(/[<>&]/g, "")}</text>
  <text x="48" y="190" fill="#cbd5e1" font-family="sans-serif" font-size="16">${posterBody.slice(0, 88).replace(/[<>&]/g, "")}</text>
  <text x="48" y="344" fill="#94a3b8" font-family="sans-serif" font-size="12">BTC Student Creative Studio (${posterLayout})</text>
</svg>`;
    downloadTextFile(svg, "btc-infographic.svg", "image/svg+xml;charset=utf-8");
  };

  // #14 Story World
  const [storyTitle, setStoryTitle] = useState("The Lantern of Failaka");
  const [storyCharacters, setStoryCharacters] = useState(
    "Noor (Marine Archeologist), Sami (Cartographer)",
  );
  const [storySetting, setStorySetting] = useState("Coastal tidal flats at dawn, Arabian Gulf");
  const [storyExposition, setStoryExposition] = useState(
    "Noor discovers an inscribed bronze astrolabe fragment exposed by an unusually low spring tide.",
  );
  const [storyClimax, setStoryClimax] = useState(
    "Before incoming tidewaters submerge the reef, the team aligns the star markings to locate the sunken trade harbor.",
  );

  // #15 Animation Workshop
  const [frames, setFrames] = useState<
    Array<{ x: number; y: number; size: number; color: string }>
  >([
    { x: 35, y: 120, size: 18, color: "#14b8a6" },
    { x: 85, y: 75, size: 22, color: "#22d3ee" },
    { x: 140, y: 45, size: 24, color: "#38bdf8" },
    { x: 195, y: 75, size: 22, color: "#818cf8" },
    { x: 245, y: 120, size: 18, color: "#a855f7" },
    { x: 290, y: 120, size: 20, color: "#f43f5e" },
  ]);
  const [activeFrameIdx, setActiveFrameIdx] = useState(0);
  const [playingAnim, setPlayingAnim] = useState(false);
  const [onionSkin, setOnionSkin] = useState(true);
  const [animFps, setAnimFps] = useState(3);

  useEffect(() => {
    if (!playingAnim) return;
    const timer = window.setInterval(
      () => {
        setActiveFrameIdx((idx) => (idx + 1) % frames.length);
      },
      Math.round(1000 / animFps),
    );
    return () => window.clearInterval(timer);
  }, [playingAnim, animFps, frames.length]);

  const currentFrame = frames[activeFrameIdx] ?? frames[0]!;
  const prevFrame = activeFrameIdx > 0 ? frames[activeFrameIdx - 1] : null;

  // #16 Photography Academy
  const [apertureF, setApertureF] = useState(2.8);
  const [shutterDenom, setShutterDenom] = useState(250);
  const [isoVal, setIsoVal] = useState(400);
  const [showThirdsGrid, setShowThirdsGrid] = useState(true);

  const blurPx = Math.max(0, Math.round((11 - apertureF) * 0.7));
  const motionBlurNote =
    shutterDenom >= 250
      ? "Crisp action freeze"
      : shutterDenom >= 60
        ? "Handheld still scenes"
        : "Motion trails (tripod recommended)";
  const noiseNote =
    isoVal <= 400
      ? "Clean dynamic range"
      : isoVal <= 1600
        ? "Balanced low-light"
        : "Visible sensor grain";

  // #17 Music Theory Academy
  const [rhythmSteps, setRhythmSteps] = useState<boolean[]>([
    true,
    false,
    true,
    false,
    true,
    true,
    false,
    true,
  ]);
  const [bpm, setBpm] = useState(105);
  const [rhythmPlaying, setRhythmPlaying] = useState(false);
  const [rhythmCursor, setRhythmCursor] = useState(0);
  const stepsRef = useRef(rhythmSteps);
  stepsRef.current = rhythmSteps;

  useEffect(() => {
    if (!rhythmPlaying) return;
    const stepMs = Math.round((60 / bpm / 2) * 1000);
    const id = window.setInterval(() => {
      setRhythmCursor((cur) => {
        const next = (cur + 1) % 8;
        if (stepsRef.current[next]) playTone(next % 4 === 0 ? 196 : 392, 0.08);
        return next;
      });
    }, stepMs);
    return () => window.clearInterval(id);
  }, [rhythmPlaying, bpm]);

  const tabs: Array<{ id: CreativityTab; label: string; icon: typeof LayoutTemplate }> = [
    {
      id: "infographic",
      label: isAr ? "مصمم البوسترات" : "13/18. Infographic Studio",
      icon: LayoutTemplate,
    },
    { id: "story", label: isAr ? "عالم القصص" : "14. Story World", icon: PenTool },
    { id: "animation", label: isAr ? "ورشة التحريك" : "15. Animation Lab", icon: Film },
    { id: "photography", label: isAr ? "أكاديمية التصوير" : "16. Photography", icon: Camera },
    { id: "music", label: isAr ? "البيانو والإيقاع" : "17. Music Theory", icon: Music },
  ];

  return (
    <div className="space-y-4" data-testid="creativity-studio">
      <div className="surface-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold font-display text-foreground">
              {isAr ? "استوديو الإبداع والفنون الرقمية" : "Creativity, Media & Expressive Studio"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isAr
                ? "أنشئ بوسترات تعليمية، هيكلة قصص، تحريك بالإطارات، محاكاة كاميرا، وتوليد إيقاعات موسيقية."
                : "Compose infographics, author structured stories, keyframe 2D animations, test camera exposure, and play synthesized scales."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono tabular-nums text-xs font-semibold text-primary">
              {eco.creativeProjects.length} {isAr ? "أعمال محفوظة" : "saved works"}
            </span>
            <FeatureGuideTrigger featureId="creativity-studio" />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 border-b border-border pb-3">
          {tabs.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  tab === item.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface-2 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* #13 & #18 INFOGRAPHIC & POSTER STUDIO */}
        {tab === "infographic" && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3 text-xs">
              <div className="flex gap-1.5">
                {(["split", "timeline", "compare"] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setPosterLayout(l)}
                    className={`rounded-md border px-2.5 py-1 font-semibold capitalize ${
                      posterLayout === l
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border bg-surface-2 text-muted-foreground"
                    }`}
                  >
                    {l} layout
                  </button>
                ))}
              </div>
              <Input
                value={posterTitle}
                onChange={(e) => setPosterTitle(e.target.value)}
                placeholder="Headline..."
                className="text-xs"
              />
              <Input
                value={posterStat}
                onChange={(e) => setPosterStat(e.target.value)}
                placeholder="Key metric callout..."
                className="text-xs font-mono"
              />
              <Textarea
                rows={3}
                value={posterBody}
                onChange={(e) => setPosterBody(e.target.value)}
                className="text-xs"
              />
              <div className="flex items-center gap-2">
                {["#14b8a6", "#38bdf8", "#a855f7", "#f59e0b", "#f43f5e"].map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setPosterAccent(hex)}
                    aria-label={`Poster accent ${hex}`}
                    className={`size-6 rounded-full border-2 ${
                      posterAccent === hex ? "border-white scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: hex }}
                  />
                ))}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={exportPosterSvg}
                  className="h-7 text-xs ms-auto"
                >
                  <Download className="size-3 me-1" />
                  Export SVG
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => saveCreativeArtifact("infographic", posterTitle, posterStat)}
                  className="h-7 text-xs"
                >
                  <Save className="size-3 me-1" />
                  Save
                </Button>
              </div>
            </div>

            <div
              className="rounded-xl border-2 p-5 flex flex-col justify-between bg-slate-950 text-slate-100 min-h-[210px]"
              style={{ borderColor: posterAccent }}
            >
              <div className="space-y-2">
                <div
                  className="text-[10px] font-mono uppercase tracking-widest"
                  style={{ color: posterAccent }}
                >
                  {posterLayout} infographic preview
                </div>
                <h3 className="text-lg font-bold font-display">
                  {posterTitle || "Untitled Poster"}
                </h3>
                <div className="text-sm font-mono font-bold" style={{ color: posterAccent }}>
                  {posterStat}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{posterBody}</p>
              </div>
              <div className="text-[10px] text-slate-400 pt-3 border-t border-slate-800">
                Authored in BTC Creativity Studio
              </div>
            </div>
          </div>
        )}

        {/* #14 STORY WORLD */}
        {tab === "story" && (
          <div className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-3 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-muted-foreground">
                Student-authored narrative builder (your words, version-safe drafting).
              </span>
              <Button
                type="button"
                size="sm"
                onClick={() => saveCreativeArtifact("story", storyTitle, storySetting)}
                className="h-7 text-xs"
              >
                <Save className="size-3 me-1" />
                Save Story Draft
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                value={storyTitle}
                onChange={(e) => setStoryTitle(e.target.value)}
                placeholder="Story title"
                className="text-xs"
              />
              <Input
                value={storyCharacters}
                onChange={(e) => setStoryCharacters(e.target.value)}
                placeholder="Main characters"
                className="text-xs"
              />
            </div>
            <Input
              value={storySetting}
              onChange={(e) => setStorySetting(e.target.value)}
              placeholder="Setting & era"
              className="text-xs"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <span className="font-semibold text-foreground">
                  Act I — Exposition & Inciting Spark
                </span>
                <Textarea
                  rows={3}
                  value={storyExposition}
                  onChange={(e) => setStoryExposition(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1">
                <span className="font-semibold text-foreground">
                  Act II/III — Climax & Resolution
                </span>
                <Textarea
                  rows={3}
                  value={storyClimax}
                  onChange={(e) => setStoryClimax(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* #15 ANIMATION WORKSHOP */}
        {tab === "animation" && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <svg
                viewBox="0 0 320 170"
                className="w-full rounded-xl border border-border bg-surface-1"
              >
                {onionSkin && prevFrame && (
                  <circle
                    cx={prevFrame.x}
                    cy={prevFrame.y}
                    r={prevFrame.size}
                    fill={prevFrame.color}
                    opacity={0.22}
                  />
                )}
                <circle
                  cx={currentFrame.x}
                  cy={currentFrame.y}
                  r={currentFrame.size}
                  fill={currentFrame.color}
                />
              </svg>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setPlayingAnim((p) => !p)}
                  className="h-7 text-xs"
                >
                  {playingAnim ? (
                    <Pause className="size-3 me-1" />
                  ) : (
                    <Play className="size-3 me-1" />
                  )}
                  {playingAnim ? "Pause" : "Play Loop"}
                </Button>
                <button
                  type="button"
                  onClick={() => setOnionSkin((o) => !o)}
                  className={`rounded-md border px-2 py-1 text-xs ${
                    onionSkin
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  Onion Skin: {onionSkin ? "ON" : "OFF"}
                </button>
                <span className="font-mono text-muted-foreground ms-auto">{animFps} FPS</span>
                <input
                  type="range"
                  min={1}
                  max={8}
                  value={animFps}
                  onChange={(e) => setAnimFps(Number(e.target.value))}
                  className="w-20 accent-primary"
                />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-3 text-xs">
              <div className="flex flex-wrap gap-1.5">
                {frames.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPlayingAnim(false);
                      setActiveFrameIdx(idx);
                    }}
                    className={`rounded-md border px-2.5 py-1 font-mono font-bold ${
                      activeFrameIdx === idx
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-surface-1 text-muted-foreground"
                    }`}
                  >
                    F{idx + 1}
                  </button>
                ))}
              </div>
              <div className="space-y-2 font-mono tabular-nums">
                <label className="block space-y-1">
                  <span>X Position: {currentFrame.x}</span>
                  <input
                    type="range"
                    min={25}
                    max={295}
                    value={currentFrame.x}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setFrames((prev) =>
                        prev.map((f, i) => (i === activeFrameIdx ? { ...f, x: val } : f)),
                      );
                    }}
                    className="w-full accent-primary"
                  />
                </label>
                <label className="block space-y-1">
                  <span>Y Position: {currentFrame.y}</span>
                  <input
                    type="range"
                    min={25}
                    max={145}
                    value={currentFrame.y}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setFrames((prev) =>
                        prev.map((f, i) => (i === activeFrameIdx ? { ...f, y: val } : f)),
                      );
                    }}
                    className="w-full accent-primary"
                  />
                </label>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={() =>
                  saveCreativeArtifact(
                    "animation",
                    "6-Frame Bounce Motion",
                    `${animFps} FPS arc study`,
                  )
                }
                className="h-7 text-xs"
              >
                Save Animation Study
              </Button>
            </div>
          </div>
        )}

        {/* #16 PHOTOGRAPHY ACADEMY */}
        {tab === "photography" && (
          <div className="grid gap-4 md:grid-cols-2 text-xs">
            <div className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-3 font-mono tabular-nums">
              <div className="flex items-center justify-between">
                <span className="font-sans font-bold text-foreground">Exposure Triangle</span>
                <button
                  type="button"
                  onClick={() => setShowThirdsGrid((g) => !g)}
                  className="font-sans rounded border border-border px-2 py-0.5 text-[11px] text-primary"
                >
                  Rule of Thirds: {showThirdsGrid ? "ON" : "OFF"}
                </button>
              </div>
              <label className="block space-y-1">
                <span>Aperture: f/{apertureF.toFixed(1)} (Depth of Field)</span>
                <input
                  type="range"
                  min={1.4}
                  max={11}
                  step={0.7}
                  value={apertureF}
                  onChange={(e) => setApertureF(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </label>
              <label className="block space-y-1">
                <span>
                  Shutter Speed: 1/{shutterDenom} s ({motionBlurNote})
                </span>
                <input
                  type="range"
                  min={15}
                  max={1000}
                  step={30}
                  value={shutterDenom}
                  onChange={(e) => setShutterDenom(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </label>
              <label className="block space-y-1">
                <span>
                  ISO: {isoVal} ({noiseNote})
                </span>
                <input
                  type="range"
                  min={100}
                  max={3200}
                  step={100}
                  value={isoVal}
                  onChange={(e) => setIsoVal(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </label>
              <p className="font-sans text-muted-foreground">
                Photography Ethics: Ask subject consent before photographing classmates or private
                spaces.
              </p>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-sky-950 via-slate-900 to-emerald-950 h-56 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(56,189,248,0.35),transparent_50%)]"
                style={{ filter: `blur(${blurPx}px)` }}
              />
              <div className="relative z-10 text-center space-y-1 px-4">
                <div className="text-sm font-bold text-white">Sharp Foreground Subject</div>
                <div className="text-[11px] font-mono text-sky-300">
                  f/{apertureF.toFixed(1)} · 1/{shutterDenom}s · ISO {isoVal}
                </div>
              </div>
              {showThirdsGrid && (
                <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
                  {Array.from({ length: 9 }).map((_, idx) => (
                    <div key={idx} className="border border-white/15" />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* #17 MUSIC THEORY ACADEMY */}
        {tab === "music" && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-1">
              {PIANO_NOTES.map((n) => (
                <button
                  key={n.note}
                  type="button"
                  onClick={() => playTone(n.freq)}
                  className={`rounded-lg border px-2.5 py-4 text-[11px] font-mono font-bold transition-transform active:scale-95 ${
                    n.sharp
                      ? "bg-slate-900 text-slate-100 border-slate-700 hover:bg-slate-800"
                      : "bg-surface-1 text-foreground border-border hover:border-primary"
                  }`}
                >
                  {n.note}
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-3 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-foreground">8-Step Web Audio Rhythm Sequencer</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono">{bpm} BPM</span>
                  <input
                    type="range"
                    min={70}
                    max={150}
                    value={bpm}
                    onChange={(e) => setBpm(Number(e.target.value))}
                    className="w-24 accent-primary"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setRhythmPlaying((p) => !p)}
                    className="h-7 text-xs"
                  >
                    {rhythmPlaying ? (
                      <Pause className="size-3 me-1" />
                    ) : (
                      <Play className="size-3 me-1" />
                    )}
                    {rhythmPlaying ? "Stop" : "Play Beat"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      saveCreativeArtifact(
                        "music",
                        `Rhythm Pattern (${bpm} BPM)`,
                        "Synthesized Web Audio study",
                      )
                    }
                    className="h-7 text-xs"
                  >
                    Save Beat
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-8 gap-1.5">
                {rhythmSteps.map((active, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      setRhythmSteps((prev) => prev.map((v, i) => (i === idx ? !v : v)))
                    }
                    className={`h-10 rounded-lg border font-mono font-bold transition-all ${
                      active
                        ? "border-primary bg-primary/25 text-primary"
                        : "border-border bg-surface-1 text-muted-foreground"
                    } ${rhythmPlaying && rhythmCursor === idx ? "ring-2 ring-amber-400" : ""}`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
