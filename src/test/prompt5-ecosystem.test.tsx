import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  CRISIS_SAFETY_RESPONSE,
  extractGroundingMetadata,
  extractValidatedFunctionProposals,
  formatGeminiError,
  generateMapsGroundedReply,
  generateOrEditEducationalImage,
  generateSearchGroundedReply,
  resolveChatModelConfig,
  runLiveVoiceTurn,
  transcribeAudioWithGemini,
} from "@/lib/ai.server";
import {
  GMP_QUOTA_DOCS_URL,
  GMP_QUOTA_EVENT,
  dispatchGmpQuotaExceeded,
  initGmpQuotaDefense,
  isQuotaExceededError,
} from "@/lib/maps-quota";
import { PreferencesProvider, usePrefs } from "@/lib/preferences";
import { GroundedSourcesPanel } from "@/components/ai/GroundedSourcesPanel";
import { STEM_SCENES, Study3DScene } from "@/components/study/Study3DScene";

describe("Prompt 5: Model Routing, Grounding Metadata & Function Proposals", () => {
  it("routes model tiers to the approved Gemini models and thinking levels", () => {
    expect(resolveChatModelConfig("balanced")).toMatchObject({
      model: "gemini-4-hydrogen",
      isPaidTier: false,
    });
    expect(resolveChatModelConfig("fast")).toMatchObject({
      model: "gemini-3.1-flash-lite",
      isPaidTier: false,
    });
    expect(resolveChatModelConfig("stem")).toMatchObject({
      model: "gemini-4-argon",
      isPaidTier: true,
    });
    expect(resolveChatModelConfig("deep")).toMatchObject({
      model: "gemini-4-carbon",
      isPaidTier: true,
    });
    expect(resolveChatModelConfig("deep_research")).toMatchObject({
      model: "gemini-4-hydrogen",
      isPaidTier: false,
    });
  });

  it("classifies 403/billing upstream errors for paid-tier models honestly", () => {
    const err403 = formatGeminiError(
      { status: 403, message: "PERMISSION_DENIED: Billing required" },
      true,
    );
    expect(err403.ok).toBe(false);
    expect(err403.code).toBe("PAID_MODEL_REQUIRED");
    expect(err403.isPaidModelError).toBe(true);
    expect(err403.message).toContain("billed/paid Gemini API key");

    const errGeneric = formatGeminiError(new Error("Temporary network hiccup"), false);
    expect(errGeneric.code).toBe("UPSTREAM_ERROR");
    expect(errGeneric.isPaidModelError).toBe(false);
  });

  it("validates and normalizes Gemini function calling action proposals", () => {
    const proposals = extractValidatedFunctionProposals([
      {
        name: "propose_study_task",
        args: {
          title: "  Solve 10 quadratic problems  ",
          details: "Focus on discriminant cases.",
          subject: "Mathematics",
          priority: "HIGH",
        },
      },
      {
        name: "propose_flashcard",
        args: {
          front: "What is osmosis?",
          back: "Net movement of water across a semipermeable membrane.",
          subject: "Biology",
          difficulty: "easy",
        },
      },
      {
        name: "propose_revision_plan",
        args: {
          summary: "Physics midterm plan",
          subject: "Physics",
          steps: [
            { title: "Review kinematics", details: "Equations 1-4", priority: "high" },
            { title: "   ", details: "Ignored empty title", priority: "low" },
          ],
        },
      },
    ]);

    expect(proposals).toHaveLength(3);
    expect(proposals[0]).toEqual({
      kind: "task",
      title: "Solve 10 quadratic problems",
      details: "Focus on discriminant cases.",
      subject: "Mathematics",
      priority: "high",
    });
    expect(proposals[1]).toEqual({
      kind: "flashcard",
      front: "What is osmosis?",
      back: "Net movement of water across a semipermeable membrane.",
      subject: "Biology",
      difficulty: "easy",
    });
    expect(proposals[2]).toEqual({
      kind: "revision_plan",
      summary: "Physics midterm plan",
      subject: "Physics",
      steps: [{ title: "Review kinematics", details: "Equations 1-4", priority: "high" }],
    });
  });

  it("extracts safe Search and Maps grounding chunks and rejects javascript: URIs", () => {
    const meta = extractGroundingMetadata({
      groundingMetadata: {
        webSearchQueries: ["STEM scholarships high school"],
        googleMapsWidgetContextToken: "ctx_abc_123",
        groundingChunks: [
          { web: { uri: "https://example.edu/scholarship", title: "STEM Scholarship Portal" } },
          { web: { uri: "javascript:alert(1)", title: "Unsafe Link" } },
          {
            maps: {
              uri: "https://maps.google.com/?cid=123",
              title: "National Public Science Library",
              placeId: "place_999",
              placeAnswerSources: {
                reviewSnippets: [{ content: "Quiet study cubicles with outlets." }],
              },
            },
          },
        ],
      },
    });

    expect(meta.webSources).toEqual([
      { title: "STEM Scholarship Portal", url: "https://example.edu/scholarship" },
    ]);
    expect(meta.mapsPlaces).toEqual([
      {
        title: "National Public Science Library",
        uri: "https://maps.google.com/?cid=123",
        placeId: "place_999",
        reviewSnippets: ["Quiet study cubicles with outlets."],
      },
    ]);
    expect(meta.searchQueries).toEqual(["STEM scholarships high school"]);
    expect(meta.widgetContextToken).toBe("ctx_abc_123");
  });
});

describe("Prompt 5: Safety Guardrails & Input Validation Across New Endpoints", () => {
  it("intercepts crisis queries across search, maps grounding, image studio, and live voice", async () => {
    const searchRes = await generateSearchGroundedReply({ query: "how to commit suicide" });
    expect(searchRes.ok).toBe(true);
    if (searchRes.ok) {
      expect(searchRes.text).toBe(CRISIS_SAFETY_RESPONSE);
    }

    const mapsRes = await generateMapsGroundedReply({ query: "ways to kill myself nearby" });
    expect(mapsRes.ok).toBe(true);
    if (mapsRes.ok) {
      expect(mapsRes.text).toBe(CRISIS_SAFETY_RESPONSE);
    }

    const imageRes = await generateOrEditEducationalImage({ prompt: "draw self harm cutting" });
    expect(imageRes.ok).toBe(false);
    if (!imageRes.ok) {
      expect(imageRes.status).toBe(400);
      expect(imageRes.code).toBe("BAD_REQUEST");
    }

    const liveRes = await runLiveVoiceTurn({ textPrompt: "I want to end my life" });
    expect(liveRes.ok).toBe(true);
    if (liveRes.ok) {
      expect(liveRes.outputTranscript).toBe(CRISIS_SAFETY_RESPONSE);
    }
  });

  it("enforces strict payload validation for audio transcription and educational image endpoints", async () => {
    const emptyAudio = await transcribeAudioWithGemini({ audioBase64: "", mimeType: "audio/webm" });
    expect(emptyAudio.ok).toBe(false);
    if (!emptyAudio.ok) expect(emptyAudio.status).toBe(400);

    const badMimeAudio = await transcribeAudioWithGemini({
      audioBase64: "AAAA",
      mimeType: "application/pdf",
    });
    expect(badMimeAudio.ok).toBe(false);
    if (!badMimeAudio.ok) expect(badMimeAudio.message).toContain("Unsupported audio format");

    const hugeAudio = await transcribeAudioWithGemini({
      audioBase64: "A".repeat(11_000_050),
      mimeType: "audio/webm",
    });
    expect(hugeAudio.ok).toBe(false);
    if (!hugeAudio.ok) expect(hugeAudio.message).toContain("8MB");

    const emptyImagePrompt = await generateOrEditEducationalImage({ prompt: "   " });
    expect(emptyImagePrompt.ok).toBe(false);
    if (!emptyImagePrompt.ok) expect(emptyImagePrompt.status).toBe(400);

    const badRefMime = await generateOrEditEducationalImage({
      prompt: "Label cell organelles",
      sourceImageBase64: "AAAA",
      sourceMimeType: "image/svg+xml",
    });
    expect(badRefMime.ok).toBe(false);
    if (!badRefMime.ok) expect(badRefMime.message).toContain("PNG, JPEG, or WebP");
  });
});

describe("Prompt 5: Google Maps Demo Key Quota Trap & UI Components", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("detects Google Maps quota error signatures and dispatches global quota event", () => {
    expect(isQuotaExceededError({ status: 429 })).toBe(true);
    expect(isQuotaExceededError(new Error("RESOURCE_EXHAUSTED from Places API"))).toBe(true);
    expect(isQuotaExceededError("OverQuotaMapError")).toBe(true);
    expect(isQuotaExceededError(new Error("Regular timeout"))).toBe(false);
    expect(GMP_QUOTA_DOCS_URL).toContain("quota_exceeded_errors");

    const listener = vi.fn();
    window.addEventListener(GMP_QUOTA_EVENT, listener);
    const cleanup = initGmpQuotaDefense();

    dispatchGmpQuotaExceeded("Test quota trigger");
    expect(listener).toHaveBeenCalledTimes(1);

    // Non-Maps QuotaExceededError (e.g. localStorage/IndexedDB) should NOT trigger Maps quota banner
    console.error("QuotaExceededError: Failed to execute setItem on Storage");
    expect(listener).toHaveBeenCalledTimes(1);

    // Maps-contextual QuotaExceededError SHOULD trigger Maps quota banner
    console.error("Google Maps Places QuotaExceededError");
    expect(listener).toHaveBeenCalledTimes(2);

    cleanup();
    window.removeEventListener(GMP_QUOTA_EVENT, listener);
  });

  it("renders grounded web citations, maps places, and ungrounded badge cleanly", () => {
    render(
      <PreferencesProvider>
        <GroundedSourcesPanel
          mode="search"
          searchQueries={["IB Physics formula booklet"]}
          webSources={[
            { title: "Physics Reference", url: "https://example.org/physics" },
            { title: "Bad URL", url: "javascript:void(0)" },
          ]}
        />
        <GroundedSourcesPanel
          mode="maps"
          mapsPlaces={[
            {
              title: "City STEM Library",
              uri: "https://maps.google.com/?q=City+STEM+Library",
              reviewSnippets: ["Great group tables for exam prep."],
            },
          ]}
        />
        <GroundedSourcesPanel mode="ungrounded" />
      </PreferencesProvider>,
    );

    expect(screen.getByText("Physics Reference")).toBeInTheDocument();
    expect(screen.queryByText("Bad URL")).not.toBeInTheDocument();
    expect(screen.getByText("City STEM Library")).toBeInTheDocument();
    expect(screen.getByText(/Great group tables for exam prep/)).toBeInTheDocument();
    expect(screen.getByText(/Ungrounded/)).toBeInTheDocument();
  });

  it("persists and clamps Prompt 5 EcosystemPrefs safely without affecting Firestore schemas", () => {
    function Harness() {
      const { ecosystem, setEcosystem } = usePrefs();
      return (
        <div>
          <span data-testid="tier">{ecosystem.aiModelTier}</span>
          <span data-testid="speed">{ecosystem.voiceSpeed}</span>
          <span data-testid="grounding">{String(ecosystem.searchGroundingDefault)}</span>
          <button
            type="button"
            onClick={() =>
              setEcosystem({
                aiModelTier: "fast",
                voiceSpeed: 5,
                searchGroundingDefault: true,
              })
            }
          >
            Update Ecosystem
          </button>
        </div>
      );
    }

    render(
      <PreferencesProvider>
        <Harness />
      </PreferencesProvider>,
    );

    expect(screen.getByTestId("tier")).toHaveTextContent("balanced");
    expect(screen.getByTestId("speed")).toHaveTextContent("1");
    fireEvent.click(screen.getByRole("button", { name: "Update Ecosystem" }));
    expect(screen.getByTestId("tier")).toHaveTextContent("fast");
    expect(screen.getByTestId("speed")).toHaveTextContent("1.25");
    expect(screen.getByTestId("grounding")).toHaveTextContent("true");
  });

  it("renders Three.js STEM Lab with 4 educational models and graceful WebGL fallback in JSDOM", () => {
    expect(STEM_SCENES.map((s) => s.id)).toEqual([
      "bohr_atom",
      "dna_helix",
      "molecule_geometry",
      "solar_system",
    ]);

    render(
      <PreferencesProvider>
        <Study3DScene />
      </PreferencesProvider>,
    );

    expect(screen.getByText("Carbon-12 Bohr Atom")).toBeInTheDocument();
    expect(screen.getByText("DNA Double Helix")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(/Interactive 3D rendering requires WebGL/i);

    fireEvent.click(screen.getByRole("button", { name: "DNA Double Helix" }));
    expect(screen.getByRole("alert")).toHaveTextContent(/Antiparallel sugar-phosphate/i);
  });
});
