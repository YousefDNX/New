import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AiWorkspace } from "@/components/modules/AiWorkspace";
import { generateCurriculumAwareReply } from "@/lib/ai-fallback";
import { PreferencesProvider } from "@/lib/preferences";

vi.mock("@/hooks/use-nexora", () => ({
  useUser: () => ({ data: null }),
  awardXpIfUnique: vi.fn(async () => undefined),
}));

describe("BTC AI Standalone App Redesign & Multimodal Features", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("renders pure BTC AI branding with zero visible Gemini text and shows image, recording, voice conversation, and settings controls", () => {
    const { container } = render(
      <PreferencesProvider>
        <AiWorkspace />
      </PreferencesProvider>,
    );

    expect(screen.getByTestId("btc-ai-app-shell")).toBeInTheDocument();
    expect(container.textContent?.toLowerCase()).not.toContain("gemini");

    expect(screen.getByTestId("ai-attach-image-btn")).toBeInTheDocument();
    expect(screen.getByTestId("ai-record-voice-btn")).toBeInTheDocument();
    expect(screen.getByTestId("ai-composer-voice-btn")).toBeInTheDocument();
    expect(screen.getByTestId("ai-toggle-settings")).toBeInTheDocument();
    expect(screen.getByTestId("ai-toggle-sessions")).toBeInTheDocument();
  });

  it("supports Custom Prompt & Settings panel and forwards customSystemPrompt + image attachments in POST /api/ai/chat/stream", async () => {
    const capturedBodies: Array<Record<string, unknown>> = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
        capturedBodies.push(JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>);
        return new Response(
          JSON.stringify({
            ok: true,
            text: "Analyzed image with custom instructions applied.",
            tierUsed: "balanced",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }),
    );

    render(
      <PreferencesProvider>
        <AiWorkspace />
      </PreferencesProvider>,
    );

    // Open Settings & Custom Prompt drawer
    fireEvent.click(screen.getByTestId("ai-toggle-settings"));
    const settingsPanel = await screen.findByTestId("ai-settings-panel");
    expect(settingsPanel).toBeInTheDocument();

    const customPromptInput = screen.getByTestId("ai-custom-prompt-input");
    fireEvent.change(customPromptInput, {
      target: { value: "Explain with direct definition, rules, and exceptions." },
    });
    expect(localStorage.getItem("btc_ai_custom_prompt_v1")).toBe(
      "Explain with direct definition, rules, and exceptions.",
    );

    // Attach an image file
    const fileInput = screen.getByTestId("ai-image-input") as HTMLInputElement;
    const pngFile = new File(["fake-png-bytes"], "diagram.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { files: [pngFile] } });

    await screen.findByTestId("ai-attachments-preview");
    expect(screen.getByText("diagram.png")).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText(/Ask a study question/i);
    fireEvent.change(textarea, { target: { value: "What does this diagram show?" } });
    fireEvent.submit(textarea.closest("form")!);

    await waitFor(() => {
      expect(
        screen.getByText("Analyzed image with custom instructions applied."),
      ).toBeInTheDocument();
    });

    expect(capturedBodies).toHaveLength(1);
    const body = capturedBodies[0]!;
    expect(body["customSystemPrompt"]).toBe(
      "Explain with direct definition, rules, and exceptions.",
    );
    const atts = body["attachments"] as Array<{
      name: string;
      mimeType: string;
      dataBase64: string;
    }>;
    expect(atts).toHaveLength(1);
    expect(atts[0]?.name).toBe("diagram.png");
    expect(atts[0]?.mimeType).toBe("image/png");
    expect(atts[0]?.dataBase64).toContain("data:image/png;base64,");
  });

  it("opens VoiceConversationDrawer with LiveAudioVisualizer when composer voice button is clicked", async () => {
    render(
      <PreferencesProvider>
        <AiWorkspace />
      </PreferencesProvider>,
    );

    const voiceBtn = screen.getByTestId("ai-composer-voice-btn");
    fireEvent.click(voiceBtn);

    const visualizer = await screen.findByTestId("live-audio-visualizer");
    expect(visualizer).toBeInTheDocument();
  });

  it("provides structured offline fallback without internet including countable/uncountable grammar rules", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("Network offline");
      }),
    );

    render(
      <PreferencesProvider>
        <AiWorkspace />
      </PreferencesProvider>,
    );

    const textarea = screen.getByPlaceholderText(/Ask a study question/i);
    fireEvent.change(textarea, { target: { value: "Explain countable and uncountable nouns" } });
    fireEvent.submit(textarea.closest("form")!);

    await waitFor(() => {
      expect(screen.getByText(/Local Offline Assistant/i)).toBeInTheDocument();
    });

    const grammarReply = generateCurriculumAwareReply({
      message: "Explain countable and uncountable nouns",
      langHint: "en",
    });
    expect(grammarReply).toMatch(/Countable/i);
    expect(grammarReply).toMatch(/Uncountable/i);
    expect(grammarReply).toMatch(/much|many/i);
    expect(grammarReply).toMatch(/information|money|water/i);
  });

  it("opens dedicated Voice Conversation settings panel to toggle US/UK accent, adjust speaking speed, and forward settings", async () => {
    const capturedLiveBodies: Array<Record<string, unknown>> = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        if (String(input).includes("/api/ai/live-turn")) {
          capturedLiveBodies.push(
            JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>,
          );
          return new Response(
            JSON.stringify({
              ok: true,
              outputTranscript: "Cheerio! Here is a British English explanation.",
              audioBase64: "",
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        }
        return new Response("{}", { status: 404 });
      }),
    );

    render(
      <PreferencesProvider>
        <AiWorkspace />
      </PreferencesProvider>,
    );

    // Open Voice Conversation drawer
    fireEvent.click(screen.getByTestId("ai-composer-voice-btn"));
    await screen.findByTestId("voice-conversation-drawer");

    // Open dedicated conversation settings panel inside drawer
    fireEvent.click(screen.getByTestId("voice-settings-toggle"));
    const panel = await screen.findByTestId("voice-conversation-settings-panel");
    expect(panel).toBeInTheDocument();

    const usBtn = screen.getByTestId("voice-accent-us");
    const gbBtn = screen.getByTestId("voice-accent-gb");
    expect(usBtn).toHaveAttribute("aria-checked", "true");
    expect(gbBtn).toHaveAttribute("aria-checked", "false");

    // Toggle to UK English accent
    fireEvent.click(gbBtn);
    expect(gbBtn).toHaveAttribute("aria-checked", "true");
    expect(usBtn).toHaveAttribute("aria-checked", "false");

    // Adjust speaking speed via preset button 1.30x
    fireEvent.click(screen.getByTestId("voice-speed-preset-1.30"));
    expect(screen.getByTestId("voice-speed-readout")).toHaveTextContent("1.30×");

    // Send a fallback text turn inside Voice Conversation Drawer and assert accent & speed forwarded
    const voiceInput = screen.getByTestId("voice-fallback-input");
    fireEvent.change(voiceInput, { target: { value: "Read a sentence in British English" } });
    fireEvent.submit(voiceInput.closest("form")!);

    await waitFor(() => {
      expect(
        screen.getByText("Cheerio! Here is a British English explanation."),
      ).toBeInTheDocument();
    });

    expect(capturedLiveBodies).toHaveLength(1);
    expect(capturedLiveBodies[0]?.["accent"]).toBe("en-GB");
    expect(capturedLiveBodies[0]?.["speakingRate"]).toBe(1.3);

    // Toggle back to US English and confirm state
    fireEvent.click(usBtn);
    expect(usBtn).toHaveAttribute("aria-checked", "true");
  });

  it("persists US/UK accent and AI speech rate in localStorage across remounts and handles 503 live-turn gracefully", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        if (String(input).includes("/api/ai/live-turn")) {
          return new Response(
            JSON.stringify({
              ok: false,
              code: "NOT_CONFIGURED",
              message: "GEMINI_API_KEY is not configured on the server.",
            }),
            { status: 503, headers: { "Content-Type": "application/json" } },
          );
        }
        return new Response("{}", { status: 404 });
      }),
    );

    const view1 = render(
      <PreferencesProvider>
        <AiWorkspace />
      </PreferencesProvider>,
    );

    fireEvent.click(screen.getByTestId("ai-composer-voice-btn"));
    await screen.findByTestId("voice-conversation-drawer");
    fireEvent.click(screen.getByTestId("voice-settings-toggle"));
    await screen.findByTestId("voice-conversation-settings-panel");

    fireEvent.click(screen.getByTestId("voice-accent-gb"));
    fireEvent.click(screen.getByTestId("voice-speed-preset-0.75"));

    await waitFor(() => {
      const ttsRaw = localStorage.getItem("nexora.tts.v1");
      expect(ttsRaw).toBeTruthy();
      const ttsParsed = JSON.parse(ttsRaw!) as { accent?: string; rate?: number };
      expect(ttsParsed.accent).toBe("en-GB");
      expect(ttsParsed.rate).toBe(0.75);
    });

    // Test graceful offline/unconfigured fallback inside VoiceConversationDrawer
    const voiceInput = screen.getByTestId("voice-fallback-input");
    fireEvent.change(voiceInput, { target: { value: "Explain countable and uncountable nouns" } });
    fireEvent.submit(voiceInput.closest("form")!);

    await waitFor(() => {
      expect(screen.getByText(/Voice Tutor:/i)).toBeInTheDocument();
    });
    expect(screen.queryByRole("alert")).toBeNull();

    // Unmount and remount to verify persistence across reloads
    view1.unmount();

    render(
      <PreferencesProvider>
        <AiWorkspace />
      </PreferencesProvider>,
    );

    fireEvent.click(screen.getByTestId("ai-composer-voice-btn"));
    await screen.findByTestId("voice-conversation-drawer");
    fireEvent.click(screen.getByTestId("voice-settings-toggle"));
    await screen.findByTestId("voice-conversation-settings-panel");

    expect(screen.getByTestId("voice-accent-gb")).toHaveAttribute("aria-checked", "true");
    expect(screen.getByTestId("voice-speed-readout")).toHaveTextContent("0.75×");
  });
});
