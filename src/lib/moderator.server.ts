// Server-side moderator & platform control utilities
export interface PlatformControls {
  bannerEnabled: boolean;
  bannerMessage: string;
  maintenanceMode: boolean;
  aiGuardrailsLevel: "standard" | "strict" | "permissive";
}

let platformControls: PlatformControls = {
  bannerEnabled: false,
  bannerMessage: "Welcome to NEXORA — Student Growth Hub & Ecosystem.",
  maintenanceMode: false,
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
  if (authHeader.includes("alshbrawe7373@gmail.com") || authHeader.includes("moderator")) {
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
    message: err.message,
    path: err.path,
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
    details,
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
    route: data.route,
    locale: data.locale,
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
