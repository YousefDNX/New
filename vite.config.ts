// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// Never set ssr.external or resolve.external: the Worker has no runtime module resolution, so
// the build fails. Never add compression (compressPublicAssets, vite-plugin-compression):
// hosting already compresses at the edge.
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import fs from "node:fs";
import type { IncomingMessage } from "node:http";
import path from "node:path";
import type { Duplex } from "node:stream";
import type { Plugin } from "vite";
import { BRAND } from "./src/config/brand";

function isPlaceholderGeminiKey(val: string | undefined): boolean {
  const trimmed = val?.trim();
  if (!trimmed || trimmed.length < 16) return true;
  return /^(my_|my-|your_|placeholder|replace_|changeme|test_|demo_|dummy_|fake_|gemini_api_key|<)/i.test(
    trimmed,
  );
}

function applyLocalEnvSecretsToServerProcess(): void {
  try {
    for (const fileName of [".env", ".env.local"]) {
      const envPath = path.resolve(process.cwd(), fileName);
      if (!fs.existsSync(envPath)) continue;
      const raw = fs.readFileSync(envPath, "utf8");
      for (const line of raw.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq <= 0) continue;
        const key = trimmed.slice(0, eq).trim();
        const val = trimmed
          .slice(eq + 1)
          .trim()
          .replace(/^['"]|['"]$/g, "");
        if (key === "GEMINI_API_KEY" && !isPlaceholderGeminiKey(val)) {
          process.env["GEMINI_API_KEY"] = val;
        }
      }
    }
  } catch {
    /* ignore local env file read errors */
  }
}

applyLocalEnvSecretsToServerProcess();

function createLiveVoiceProxyPlugin(): Plugin {
  return {
    name: "nexora-live-voice-ws",
    apply: "serve",
    configureServer(server) {
      applyLocalEnvSecretsToServerProcess();

      server.middlewares.use(async (req, res, next) => {
        const reqUrl = req.url ?? "/";
        const pathname = reqUrl.split("?")[0] || "";
        if (!pathname.startsWith("/api/") || pathname === "/api/ai/live-ws") {
          return next();
        }

        try {
          const serverModule = (await server.ssrLoadModule("/src/server.ts")) as Record<
            string,
            unknown
          >;
          const serverHandler = serverModule["default"] ?? serverModule;
          const url = new URL(reqUrl, `http://${req.headers.host || "localhost:3000"}`);

          let bodyBuffer: Buffer | undefined;
          if (req.method !== "GET" && req.method !== "HEAD") {
            const chunks: Buffer[] = [];
            for await (const chunk of req) {
              chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : (chunk as Buffer));
            }
            bodyBuffer = Buffer.concat(chunks);
          }

          const headersRecord: Record<string, string> = {};
          for (const [k, v] of Object.entries(req.headers)) {
            if (typeof v === "string") headersRecord[k] = v;
            else if (Array.isArray(v)) headersRecord[k] = v.join(", ");
          }

          const webReq = new Request(url, {
            method: req.method,
            headers: headersRecord,
            ...(bodyBuffer ? { body: bodyBuffer as unknown as BodyInit } : {}),
          } as RequestInit);

          if (!process.env["GEMINI_API_KEY"]) {
            applyLocalEnvSecretsToServerProcess();
          }

          const serverHandlerObj = serverHandler as {
            fetch: (req: Request, env: unknown, ctx: unknown) => Promise<Response>;
          };
          const webRes = await serverHandlerObj.fetch(webReq, process.env, {});
          res.statusCode = webRes.status;
          webRes.headers.forEach((val: string, key: string) => {
            res.setHeader(key, val);
          });
          const contentType = webRes.headers.get("content-type") ?? "";
          if (contentType.includes("text/event-stream") && webRes.body) {
            const reader = webRes.body.getReader();
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                if (value) res.write(Buffer.from(value));
              }
            } finally {
              res.end();
            }
          } else {
            const buf = Buffer.from(await webRes.arrayBuffer());
            res.end(buf);
          }
        } catch (err) {
          next(err);
        }
      });

      const httpServer = server.httpServer;
      if (!httpServer) return;

      void Promise.all([import("ws"), import("@google/genai")]).then(
        ([{ WebSocketServer }, { GoogleGenAI, Modality }]) => {
          const wss = new WebSocketServer({ noServer: true });

          httpServer.on("upgrade", (req: IncomingMessage, socket: Duplex, head: Buffer) => {
            const url = new URL(req.url ?? "/", "http://localhost");
            if (url.pathname !== "/api/ai/live-ws") return;

            wss.handleUpgrade(req, socket, head, async (clientWs) => {
              const rawKey = process.env["GEMINI_API_KEY"]?.trim();
              const apiKey = isPlaceholderGeminiKey(rawKey) ? undefined : rawKey;
              if (!apiKey) {
                clientWs.send(
                  JSON.stringify({
                    type: "error",
                    code: "NOT_CONFIGURED",
                    message:
                      "Cloud live voice stream is unavailable; switched to local voice mode.",
                  }),
                );
                clientWs.close();
                return;
              }

              const lang = url.searchParams.get("lang") || "en";
              const accentParam = (url.searchParams.get("accent") || "en-US").trim().toLowerCase();
              const speedNum = Number(url.searchParams.get("speed") || "1") || 1;
              const context = url.searchParams.get("context")?.slice(0, 400) || "";
              const rawVoice = (url.searchParams.get("voice") || "Zephyr").trim().toLowerCase();
              const voiceName =
                rawVoice === "puck"
                  ? "Puck"
                  : rawVoice === "charon" || rawVoice === "ahmed"
                    ? "Charon"
                    : rawVoice === "fenrir"
                      ? "Fenrir"
                      : rawVoice === "kore" || rawVoice === "classic"
                        ? "Kore"
                        : "Zephyr";

              const accentInstruction =
                accentParam === "en-gb" || accentParam === "gb" || accentParam === "uk"
                  ? "When speaking English, use authentic Standard British English (en-GB / Received Pronunciation) pronunciation and natural UK cadence."
                  : "When speaking English, use authentic General American English (en-US) pronunciation and natural US cadence.";
              const speedInstruction =
                speedNum < 0.9
                  ? "Speak at a slower, unhurried pace with clear pauses for accessibility and clarity."
                  : speedNum > 1.15
                    ? "Speak at a brisk, fluent pace while keeping articulation clear."
                    : "Speak at a clear, comfortable pace.";

              const ai = new GoogleGenAI({
                apiKey,
                httpOptions: {
                  headers: { "User-Agent": "aistudio-build" },
                },
              });

              let liveSession: Awaited<ReturnType<typeof ai.live.connect>> | null = null;
              let closed = false;

              const closeAll = () => {
                if (closed) return;
                closed = true;
                try {
                  liveSession?.close();
                } catch {
                  /* ignore close errors */
                }
                if (clientWs.readyState === clientWs.OPEN) {
                  clientWs.close();
                }
              };

              try {
                liveSession = await ai.live.connect({
                  model: "gemini-3.8-live",
                  config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                      voiceConfig: {
                        prebuiltVoiceConfig: { voiceName },
                      },
                    },
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    systemInstruction: [
                      `You are ${BRAND.shortName} Live Voice Tutor speaking directly with a student.`,
                      `Respond concisely and warmly in language code: ${lang}.`,
                      accentInstruction,
                      speedInstruction,
                      "Keep spoken explanations focused, encouraging, and clear.",
                      context ? `Study context: ${context}` : "",
                    ]
                      .filter(Boolean)
                      .join("\n"),
                  },
                  callbacks: {
                    onopen: () => {
                      if (clientWs.readyState === clientWs.OPEN) {
                        clientWs.send(JSON.stringify({ type: "ready" }));
                      }
                    },
                    onmessage: (msg) => {
                      if (clientWs.readyState !== clientWs.OPEN) return;
                      const sc = msg.serverContent;
                      if (sc?.interrupted) {
                        clientWs.send(JSON.stringify({ type: "interrupted" }));
                      }
                      if (sc?.inputTranscription?.text) {
                        clientWs.send(
                          JSON.stringify({
                            type: "input_transcript",
                            text: sc.inputTranscription.text,
                          }),
                        );
                      }
                      if (sc?.outputTranscription?.text) {
                        clientWs.send(
                          JSON.stringify({
                            type: "output_transcript",
                            text: sc.outputTranscription.text,
                          }),
                        );
                      }
                      const parts = sc?.modelTurn?.parts ?? [];
                      for (const part of parts) {
                        if (part.inlineData?.data) {
                          clientWs.send(
                            JSON.stringify({
                              type: "audio",
                              data: part.inlineData.data,
                              mimeType: part.inlineData.mimeType || "audio/pcm;rate=24000",
                            }),
                          );
                        }
                      }
                      if (sc?.turnComplete) {
                        clientWs.send(JSON.stringify({ type: "turn_complete" }));
                      }
                    },
                    onerror: (err) => {
                      if (clientWs.readyState === clientWs.OPEN) {
                        clientWs.send(
                          JSON.stringify({
                            type: "error",
                            message: err instanceof Error ? err.message : "Live voice stream error",
                          }),
                        );
                      }
                      closeAll();
                    },
                    onclose: () => {
                      closeAll();
                    },
                  },
                });
              } catch (err) {
                if (clientWs.readyState === clientWs.OPEN) {
                  clientWs.send(
                    JSON.stringify({
                      type: "error",
                      message:
                        err instanceof Error
                          ? err.message
                          : "Unable to initialize Gemini Live session.",
                    }),
                  );
                }
                closeAll();
                return;
              }

              clientWs.on("message", (raw) => {
                if (!liveSession || closed) return;
                try {
                  const payload = JSON.parse(raw.toString()) as {
                    type?: string;
                    data?: string;
                    text?: string;
                  };
                  if (payload.type === "audio" && typeof payload.data === "string") {
                    liveSession.sendRealtimeInput({
                      audio: { data: payload.data, mimeType: "audio/pcm;rate=16000" },
                    });
                  } else if (payload.type === "audio_end") {
                    liveSession.sendRealtimeInput({ audioStreamEnd: true });
                  } else if (payload.type === "text" && typeof payload.text === "string") {
                    const clean = payload.text.trim().slice(0, 2000);
                    if (clean) {
                      liveSession.sendClientContent({
                        turns: [{ role: "user", parts: [{ text: clean }] }],
                        turnComplete: true,
                      });
                    }
                  } else if (payload.type === "close") {
                    closeAll();
                  }
                } catch {
                  /* ignore malformed ws frame */
                }
              });

              clientWs.on("close", closeAll);
              clientWs.on("error", closeAll);
            });
          });
        },
      );
    },
  };
}

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [createLiveVoiceProxyPlugin()],
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-router",
        "@tanstack/react-query",
        "lucide-react",
        "sonner",
        "clsx",
        "tailwind-merge",
        "class-variance-authority",
        "cmdk",
        "date-fns",
        "zod",
        "framer-motion",
        "recharts",
        "three",
        "@vis.gl/react-google-maps",
        "react-helmet-async",
        "firebase/app",
        "firebase/auth",
        "firebase/firestore",
        "firebase/analytics",
        "firebase/performance",
        "firebase/storage",
        "@radix-ui/react-accordion",
        "@radix-ui/react-alert-dialog",
        "@radix-ui/react-avatar",
        "@radix-ui/react-checkbox",
        "@radix-ui/react-collapsible",
        "@radix-ui/react-dialog",
        "@radix-ui/react-dropdown-menu",
        "@radix-ui/react-label",
        "@radix-ui/react-popover",
        "@radix-ui/react-progress",
        "@radix-ui/react-radio-group",
        "@radix-ui/react-scroll-area",
        "@radix-ui/react-select",
        "@radix-ui/react-separator",
        "@radix-ui/react-slider",
        "@radix-ui/react-slot",
        "@radix-ui/react-switch",
        "@radix-ui/react-tabs",
        "@radix-ui/react-tooltip",
      ],
    },
    server: {
      host: "0.0.0.0",
      port: 3000,
      allowedHosts: true,
    },
  },
});
