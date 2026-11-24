import "./lib/error-capture";

import {
  generateMapsGroundedReply,
  generateOrEditEducationalImage,
  generateSearchGroundedReply,
  generateStructuredStudyAid,
  generateStudyAssistantReply,
  resolveGeminiApiKey,
  resolveMapsApiKey,
  runLiveVoiceTurn,
  synthesizeSpeechWithGemini,
  transcribeAudioWithGemini,
  type AiChatServerRequest,
  type AiImageRequest,
  type AiLiveTurnRequest,
  type AiMapsGroundingRequest,
  type AiSearchRequest,
  type AiStructuredRequest,
  type AiTranscribeRequest,
  type AiTtsRequest,
} from "./lib/ai.server";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

async function readJsonBody<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

import {
  clearServerErrors,
  getActiveSessionsSummary,
  getPlatformControls,
  getSanitizedServerErrors,
  getServerAuditEvents,
  recordServerAuditEvent,
  recordServerError,
  recordSessionHeartbeat,
  updatePlatformControls,
  verifyModeratorRequest,
} from "./lib/moderator.server";

// Hosting compresses every response at the edge. Never compress a body (gzip, brotli,
// CompressionStream) or set content-encoding here or in a server route: the body gets encoded
// twice and renders garbled.
export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);

      if (url.pathname === "/api/platform/banner" && request.method === "GET") {
        return jsonResponse(getPlatformControls());
      }

      if (url.pathname === "/api/telemetry/heartbeat" && request.method === "POST") {
        const body = await readJsonBody<{
          sessionId?: string;
          route?: string;
          locale?: string;
          viewport?: string;
        }>(request);
        if (body) {
          recordSessionHeartbeat(body);
        }
        return jsonResponse({ ok: true });
      }

      if (url.pathname === "/api/moderator/session" && request.method === "GET") {
        const mod = await verifyModeratorRequest(request);
        return jsonResponse(mod, mod.authorized ? 200 : 403);
      }

      if (url.pathname === "/api/moderator/overview" && request.method === "GET") {
        const mod = await verifyModeratorRequest(request);
        if (!mod.authorized) {
          return jsonResponse(
            { ok: false, error: "Access Restricted to Verified Moderators." },
            403,
          );
        }
        const configured = Boolean(resolveGeminiApiKey(env));
        return jsonResponse({
          ok: true,
          controls: getPlatformControls(),
          errors: getSanitizedServerErrors(),
          sessions: getActiveSessionsSummary(),
          auditLogs: getServerAuditEvents(),
          aiConfigured: configured,
          timestamp: new Date().toISOString(),
        });
      }

      if (url.pathname === "/api/moderator/controls" && request.method === "POST") {
        const mod = await verifyModeratorRequest(request);
        if (!mod.authorized) {
          return jsonResponse(
            { ok: false, error: "Access Restricted to Verified Moderators." },
            403,
          );
        }
        const body = await readJsonBody<Parameters<typeof updatePlatformControls>[0]>(request);
        if (!body) {
          return jsonResponse({ ok: false, error: "Invalid payload" }, 400);
        }
        const updated = updatePlatformControls(body);
        recordServerAuditEvent("platform_controls_updated", JSON.stringify(body));
        return jsonResponse({ ok: true, controls: updated });
      }

      if (url.pathname === "/api/moderator/errors/clear" && request.method === "POST") {
        const mod = await verifyModeratorRequest(request);
        if (!mod.authorized) {
          return jsonResponse(
            { ok: false, error: "Access Restricted to Verified Moderators." },
            403,
          );
        }
        clearServerErrors();
        recordServerAuditEvent("server_errors_cleared", "Moderator cleared error ring buffer.");
        return jsonResponse({ ok: true });
      }

      if (url.pathname === "/api/ai/status" && request.method === "GET") {
        const controls = getPlatformControls();
        const configured = Boolean(resolveGeminiApiKey(env));
        const mapsConfigured = Boolean(
          resolveMapsApiKey(env) || import.meta.env?.["VITE_GOOGLE_MAPS_API_KEY"],
        );
        return jsonResponse({
          configured,
          providerConfigured: configured,
          aiPaused: !controls.aiEnabled,
          mapsConfigured,
          model: "gemini-4-hydrogen",
          features: {
            chatbot: configured && controls.aiEnabled,
            searchGrounding: configured && controls.aiEnabled,
            mapsGrounding: configured && controls.aiEnabled,
            mapsPlatform: mapsConfigured,
            audioTranscription: configured && controls.aiEnabled,
            voiceLive: configured && controls.aiEnabled,
            imageGeneration: configured && controls.aiEnabled,
            tts: configured && controls.aiEnabled,
          },
        });
      }

      if (url.pathname === "/api/ai/chat" && request.method === "POST") {
        const controls = getPlatformControls();
        if (!controls.aiEnabled) {
          return jsonResponse(
            {
              ok: false,
              code: "AI_PAUSED",
              message: "BTC AI is temporarily paused by the moderator. Please try again shortly.",
            },
            503,
          );
        }
        const body = await readJsonBody<AiChatServerRequest>(request);
        if (!body) {
          return jsonResponse(
            { ok: false, code: "BAD_REQUEST", message: "Invalid JSON request body." },
            400,
          );
        }
        const result = await generateStudyAssistantReply(body, env);
        return jsonResponse(result, result.ok ? 200 : result.status);
      }

      if (url.pathname === "/api/ai/structured" && request.method === "POST") {
        const controls = getPlatformControls();
        if (!controls.aiEnabled) {
          return jsonResponse(
            {
              ok: false,
              code: "AI_PAUSED",
              message: "BTC AI is temporarily paused by the moderator. Please try again shortly.",
            },
            503,
          );
        }
        const body = await readJsonBody<AiStructuredRequest>(request);
        if (!body) {
          return jsonResponse(
            { ok: false, code: "BAD_REQUEST", message: "Invalid JSON request body." },
            400,
          );
        }
        const result = await generateStructuredStudyAid(body, env);
        return jsonResponse(result, result.ok ? 200 : result.status);
      }

      if (url.pathname === "/api/ai/search" && request.method === "POST") {
        const body = await readJsonBody<AiSearchRequest>(request);
        if (!body) {
          return jsonResponse(
            { ok: false, code: "BAD_REQUEST", message: "Invalid JSON request body." },
            400,
          );
        }
        const result = await generateSearchGroundedReply(body, env);
        return jsonResponse(result, result.ok ? 200 : result.status);
      }

      if (url.pathname === "/api/ai/maps-grounding" && request.method === "POST") {
        const body = await readJsonBody<AiMapsGroundingRequest>(request);
        if (!body) {
          return jsonResponse(
            { ok: false, code: "BAD_REQUEST", message: "Invalid JSON request body." },
            400,
          );
        }
        const result = await generateMapsGroundedReply(body, env);
        return jsonResponse(result, result.ok ? 200 : result.status);
      }

      if (url.pathname === "/api/ai/transcribe" && request.method === "POST") {
        const body = await readJsonBody<AiTranscribeRequest>(request);
        if (!body) {
          return jsonResponse(
            { ok: false, code: "BAD_REQUEST", message: "Invalid JSON request body." },
            400,
          );
        }
        const result = await transcribeAudioWithGemini(body, env);
        return jsonResponse(result, result.ok ? 200 : result.status);
      }

      if (url.pathname === "/api/ai/image" && request.method === "POST") {
        const body = await readJsonBody<AiImageRequest>(request);
        if (!body) {
          return jsonResponse(
            { ok: false, code: "BAD_REQUEST", message: "Invalid JSON request body." },
            400,
          );
        }
        const result = await generateOrEditEducationalImage(body, env);
        return jsonResponse(result, result.ok ? 200 : result.status);
      }

      if (url.pathname === "/api/ai/live-turn" && request.method === "POST") {
        const body = await readJsonBody<AiLiveTurnRequest>(request);
        if (!body) {
          return jsonResponse(
            { ok: false, code: "BAD_REQUEST", message: "Invalid JSON request body." },
            400,
          );
        }
        const result = await runLiveVoiceTurn(body, env);
        return jsonResponse(result, result.ok ? 200 : result.status);
      }

      if (url.pathname === "/api/ai/tts" && request.method === "POST") {
        const body = await readJsonBody<AiTtsRequest>(request);
        if (!body) {
          return jsonResponse(
            { ok: false, code: "BAD_REQUEST", message: "Invalid JSON request body." },
            400,
          );
        }
        const result = await synthesizeSpeechWithGemini(body, env);
        return jsonResponse(result, result.ok ? 200 : result.status);
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
