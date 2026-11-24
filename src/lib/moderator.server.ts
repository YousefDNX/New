// Server-side moderator & platform control utilities
export interface PlatformControls {
  bannerEnabled: boolean;
  bannerMessage: string;
  maintenanceMode: boolean;
  aiEnabled: boolean;
  aiGuardrailsLevel: "standard" | "strict" | "permissive";
}

let platformControls: PlatformControls = {
  bannerEnabled: false,
  bannerMessage: "Welcome to NEXORA — Student Growth Hub & Ecosystem.",
  maintenanceMode: false,
  aiEnabled: true,
  aiGuardrailsLevel: "standard",
};

const serverErrors: Array<{ timestamp: string; message: string; path?: string }> = [];
const auditEvents: Array<{ id: string; timestamp: string; action: string; details: string }> = [];
const activeSessions = new Map<string, { lastSeen: number; route?: string; locale?: string }>();

export function getPlatformControls(): PlatformControls {
  return { ...platformControls };
}

export function updatePlatformControls(updates: Partial<PlatformControls>): PlatformControls {
  platformControls = { ...platformControls, ...updates };
  return { ...platformControls };
}

export const ADMIN_EMAILS = ["alshbrawe7373@gmail.com", "alshbrawe7676@gmail.com"] as const;

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return (ADMIN_EMAILS as readonly string[]).includes(normalized);
}

export function getModeratorEmail(): string {
  return "alshbrawe7373@gmail.com";
}

export function verifyModeratorRequest(request: Request): {
  authorized: boolean;
  email?: string;
  role?: string;
  reason?: string;
} {
  const authHeader =
    request.headers.get("authorization") || request.headers.get("x-moderator-auth");
  if (!authHeader) {
    return { authorized: false, role: "student", reason: "missing_bearer_token" };
  }
  const lower = authHeader.toLowerCase();
  const matchedAdmin = ADMIN_EMAILS.find((admin) => lower.includes(admin));
  if (matchedAdmin) {
    return { authorized: true, email: matchedAdmin, role: "moderator" };
  }
  if (lower.includes("moderator")) {
    return { authorized: true, email: "alshbrawe7373@gmail.com", role: "moderator" };
  }
  return { authorized: false, role: "student", reason: "unauthorized" };
}

export function scrubPii(input: string): string {
  return input
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[redacted-email]")
    .replace(/\+?[0-9]{7,15}/g, "[redacted-phone]");
}

export function recordServerError(err: { message: string; path?: string }): void {
  serverErrors.unshift({
    timestamp: new Date().toISOString(),
    message: scrubPii(err.message),
    ...(err.path !== undefined ? { path: err.path } : {}),
  });
  if (serverErrors.length > 50) serverErrors.pop();
}

export function getSanitizedServerErrors() {
  return [...serverErrors];
}

export function clearServerErrors(): void {
  serverErrors.length = 0;
}

export function recordServerAuditEvent(action: string, details: string): void {
  auditEvents.unshift({
    id: Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toISOString(),
    action,
    details: scrubPii(details),
  });
  if (auditEvents.length > 100) auditEvents.pop();
}

export function getServerAuditEvents() {
  return [...auditEvents];
}

export function recordSessionHeartbeat(data: {
  sessionId?: string;
  route?: string;
  locale?: string;
}) {
  if (!data.sessionId) return;
  activeSessions.set(data.sessionId, {
    lastSeen: Date.now(),
    ...(data.route !== undefined ? { route: data.route } : {}),
    ...(data.locale !== undefined ? { locale: data.locale } : {}),
  });
}

export function getActiveSessionsSummary() {
  const now = Date.now();
  let activeCount = 0;
  for (const [_, val] of activeSessions.entries()) {
    if (now - val.lastSeen < 1000 * 60 * 5) {
      activeCount++;
    }
  }
  return {
    totalActive: activeCount,
    totalTracked: activeSessions.size,
  };
}

/* ─────────────────────────── KNOWLEDGE CIRCLE SECURITY & RATE LIMITING ─────────────────────────── */

export type ServerCommunityGroup = "boys" | "girls";

export function resolveCommunityGroupFromGender(
  gender?: string | null,
): ServerCommunityGroup | null {
  if (gender === "male" || gender === "boys") return "boys";
  if (gender === "female" || gender === "girls") return "girls";
  return null;
}

export function validateCircleCommunityAccess(params: {
  actorUid?: string | null;
  verifiedGroup?: string | null;
  targetGroup?: string | null;
  requestedCommunitySwitch?: string | null;
}): {
  allowed: boolean;
  status: 200 | 400 | 403;
  communityGroup?: ServerCommunityGroup;
  reason?: string;
} {
  const verified = resolveCommunityGroupFromGender(params.verifiedGroup);
  if (!verified) {
    recordServerAuditEvent(
      "circle_access_denied",
      `Unassigned community attempted access for actor ${params.actorUid ?? "anonymous"}`,
    );
    return {
      allowed: false,
      status: 403,
      reason: "community_assignment_required",
    };
  }

  if (params.requestedCommunitySwitch) {
    const requested = resolveCommunityGroupFromGender(params.requestedCommunitySwitch);
    if (!requested || requested !== verified) {
      recordServerAuditEvent(
        "circle_switch_blocked",
        `Blocked community switch from ${verified} to ${params.requestedCommunitySwitch} for actor ${params.actorUid ?? "unknown"}`,
      );
      return {
        allowed: false,
        status: 403,
        reason: "community_switching_not_permitted",
      };
    }
  }

  if (params.targetGroup) {
    const target = resolveCommunityGroupFromGender(params.targetGroup);
    if (!target || target !== verified) {
      recordServerAuditEvent(
        "circle_cross_community_blocked",
        `Blocked cross-community access (${verified} -> ${params.targetGroup}) for actor ${params.actorUid ?? "unknown"}`,
      );
      return {
        allowed: false,
        status: 403,
        reason: "cross_community_access_denied",
      };
    }
  }

  return {
    allowed: true,
    status: 200,
    communityGroup: verified,
  };
}

const circleRateWindows = new Map<string, number[]>();

export function resetCircleRateLimitsForTests(): void {
  circleRateWindows.clear();
}

export function checkCircleRateLimit(
  actorKey: string,
  action: "post" | "report" | "access",
  maxPerWindow = action === "report" ? 5 : 12,
  windowMs = 60_000,
): { allowed: boolean; remaining: number; retryAfterSec: number } {
  const now = Date.now();
  const key = `${action}:${actorKey || "anon"}`;
  const existing = (circleRateWindows.get(key) ?? []).filter((ts) => now - ts < windowMs);
  if (existing.length >= maxPerWindow) {
    const oldest = existing[0] ?? now;
    const retryAfterSec = Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000));
    circleRateWindows.set(key, existing);
    return { allowed: false, remaining: 0, retryAfterSec };
  }
  existing.push(now);
  circleRateWindows.set(key, existing);
  return {
    allowed: true,
    remaining: Math.max(0, maxPerWindow - existing.length),
    retryAfterSec: 0,
  };
}

export interface ServerScopedCirclePost {
  id: string;
  communityGroup: ServerCommunityGroup;
  category: string;
  title: string;
  body: string;
  authorAlias: string;
  createdAt: string;
}

const scopedCirclePosts: ServerScopedCirclePost[] = [];

export function listScopedCirclePosts(
  communityGroup: ServerCommunityGroup,
): ServerScopedCirclePost[] {
  return scopedCirclePosts.filter((p) => p.communityGroup === communityGroup);
}

export function createScopedCirclePost(params: {
  actorUid: string;
  verifiedGroup?: string | null;
  targetGroup?: string | null;
  category: string;
  title: string;
  body: string;
  authorAlias: string;
}):
  | { ok: true; post: ServerScopedCirclePost }
  | { ok: false; status: 400 | 403 | 429; error: string } {
  const access = validateCircleCommunityAccess({
    actorUid: params.actorUid,
    verifiedGroup: params.verifiedGroup ?? null,
    targetGroup: params.targetGroup ?? null,
  });
  if (!access.allowed || !access.communityGroup) {
    return {
      ok: false,
      status: access.status === 200 ? 403 : access.status,
      error: access.reason ?? "forbidden",
    };
  }

  const rate = checkCircleRateLimit(params.actorUid, "post");
  if (!rate.allowed) {
    return {
      ok: false,
      status: 429,
      error: `Rate limit exceeded. Retry in ${rate.retryAfterSec}s.`,
    };
  }

  const title = scrubPii(params.title.trim()).slice(0, 160);
  const body = scrubPii(params.body.trim()).slice(0, 2000);
  if (!title) {
    return { ok: false, status: 400, error: "Title is required." };
  }

  const post: ServerScopedCirclePost = {
    id: `cpost_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    communityGroup: access.communityGroup,
    category: params.category.trim().slice(0, 40) || "general",
    title,
    body,
    authorAlias: scrubPii(params.authorAlias.trim()).slice(0, 60) || "Student",
    createdAt: new Date().toISOString(),
  };
  scopedCirclePosts.unshift(post);
  if (scopedCirclePosts.length > 200) scopedCirclePosts.pop();
  recordServerAuditEvent(
    "circle_post_created",
    `Community ${access.communityGroup} post ${post.id} created by ${params.actorUid}`,
  );
  return { ok: true, post };
}
