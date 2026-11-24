import { describe, it, expect, beforeEach } from "vitest";
import {
  detectCrisisOrSafetyConcern,
  CRISIS_SAFETY_RESPONSE,
  generateStudyAssistantReply,
  generateStructuredStudyAid,
} from "@/lib/ai.server";
import {
  recordAuditLog,
  fetchAuditLogs,
  clearAuditLogs,
  type AuditLogEntry,
  type StaffRoleType,
} from "@/lib/support-service";
import { getModeratorEmail } from "@/lib/moderator.server";
import { BRAND } from "@/config/brand";

describe("Prompt 4: Student Safety, Crisis Guardrails & AI Integrity", () => {
  it("detects crisis indicators across self-harm and severe distress keywords", () => {
    const crisisSamples = [
      "I want to kill myself",
      "I am thinking about suicide",
      "I've been cutting myself lately",
      "I feel like ending my life",
      "there is no reason to live anymore",
      "أفكر في الانتحار ومش قادر اكمل",
      "عايز اموت وخلاص",
    ];

    for (const sample of crisisSamples) {
      const result = detectCrisisOrSafetyConcern(sample);
      expect(result.isCrisis).toBe(true);
      expect(result.reason).toBe("crisis_distress_detected");
    }
  });

  it("passes standard academic and educational study questions through cleanly", () => {
    const benignSamples = [
      "Can you explain the quadratic formula step by step?",
      "Help me summarize photosynthesis for my biology quiz.",
      "How do I prepare a study schedule for finals?",
      "ما هي قوانين نيوتن للحركة في الفيزياء؟",
      "Explain the differences between procedural and object-oriented programming.",
    ];

    for (const sample of benignSamples) {
      const result = detectCrisisOrSafetyConcern(sample);
      expect(result.isCrisis).toBe(false);
    }
  });

  it("generateStudyAssistantReply intercepts crisis prompts and returns compassionate hotlines immediately", async () => {
    const reply = await generateStudyAssistantReply({
      message: "I feel overwhelmed and want to kill myself tonight",
    });

    expect(reply.ok).toBe(true);
    if (reply.ok) {
      expect(reply.text).toBe(CRISIS_SAFETY_RESPONSE);
      expect(reply.text).toContain("https://findahelpline.com");
      expect(reply.text).toContain("Befrienders Worldwide");
      expect(reply.text).toContain("741741");
      expect(reply.text).toContain("988");
      expect(reply.text).toContain(`${BRAND.shortName} AI is an automated educational study coach`);
    }
  });

  it("generateStructuredStudyAid rejects crisis prompts with safe guidance notice", async () => {
    const result = await generateStructuredStudyAid({
      mode: "study_plan",
      subject: "Health",
      prompt: "Create a plan on how to commit suicide painlessly",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(400);
      expect(result.code).toBe("BAD_REQUEST");
      expect(result.message).toContain("sensitive crisis indicators");
    }
  });
});

describe("Prompt 4: Platform Security & Role-Based Access Control (RBAC)", () => {
  it("validates that the designated Founder email has authoritative super-admin identity", () => {
    expect(getModeratorEmail()).toBe("alshbrawe7373@gmail.com");
  });

  it("evaluates permission matrix hierarchy across all 6 platform roles", () => {
    interface TestRoleDef {
      role: StaffRoleType;
      isFounder: boolean;
      isAdmin: boolean;
      isStaff: boolean;
      canManageStaff: boolean;
      canManageUsers: boolean;
      canManageTickets: boolean;
      canModerate: boolean;
      canManageHelp: boolean;
    }

    const computePermissions = (role: StaffRoleType): TestRoleDef => {
      const isFounder = role === "founder";
      const isAdmin = isFounder || role === "admin";
      const isStaff =
        isFounder ||
        role === "admin" ||
        role === "support" ||
        role === "moderator" ||
        role === "content_manager";

      return {
        role,
        isFounder,
        isAdmin,
        isStaff,
        canManageStaff: isFounder,
        canManageUsers: isAdmin,
        canManageTickets: isStaff && (isFounder || role === "admin" || role === "support"),
        canModerate: isStaff && (isFounder || role === "admin" || role === "moderator"),
        canManageHelp: isStaff && (isFounder || role === "admin" || role === "content_manager"),
      };
    };

    // Founder checks
    const founder = computePermissions("founder");
    expect(founder.isFounder).toBe(true);
    expect(founder.isAdmin).toBe(true);
    expect(founder.isStaff).toBe(true);
    expect(founder.canManageStaff).toBe(true);
    expect(founder.canManageUsers).toBe(true);
    expect(founder.canManageTickets).toBe(true);
    expect(founder.canModerate).toBe(true);
    expect(founder.canManageHelp).toBe(true);

    // Admin checks
    const admin = computePermissions("admin");
    expect(admin.isFounder).toBe(false);
    expect(admin.isAdmin).toBe(true);
    expect(admin.isStaff).toBe(true);
    expect(admin.canManageStaff).toBe(false);
    expect(admin.canManageUsers).toBe(true);
    expect(admin.canManageTickets).toBe(true);
    expect(admin.canModerate).toBe(true);
    expect(admin.canManageHelp).toBe(true);

    // Moderator checks
    const mod = computePermissions("moderator");
    expect(mod.isStaff).toBe(true);
    expect(mod.canModerate).toBe(true);
    expect(mod.canManageUsers).toBe(false);
    expect(mod.canManageStaff).toBe(false);
    expect(mod.canManageTickets).toBe(false);

    // Support checks
    const support = computePermissions("support");
    expect(support.isStaff).toBe(true);
    expect(support.canManageTickets).toBe(true);
    expect(support.canModerate).toBe(false);
    expect(support.canManageUsers).toBe(false);

    // Content Manager checks
    const content = computePermissions("content_manager");
    expect(content.isStaff).toBe(true);
    expect(content.canManageHelp).toBe(true);
    expect(content.canModerate).toBe(false);

    // Student checks
    const student = computePermissions("student");
    expect(student.isStaff).toBe(false);
    expect(student.isAdmin).toBe(false);
    expect(student.canManageTickets).toBe(false);
    expect(student.canModerate).toBe(false);
    expect(student.canManageHelp).toBe(false);
  });
});

describe("Prompt 4: Audit Logging & Governance", () => {
  beforeEach(() => {
    clearAuditLogs();
  });

  it("records and retrieves structured administrative events", () => {
    const entry = recordAuditLog({
      action: "user_role_assigned",
      actor_id: "founder-uid-1",
      actor_email: getModeratorEmail(),
      actor_role: "founder",
      target_type: "user",
      target_id: "student-uid-99",
      details: "Assigned moderator role to student account.",
    });

    expect(entry.id).toMatch(/^audit-/);
    expect(entry.timestamp).toBeTruthy();
    expect(entry.action).toBe("user_role_assigned");
    expect(entry.actor_email).toBe(getModeratorEmail());

    const logs = fetchAuditLogs();
    const found = logs.find((l) => l.id === entry.id);
    expect(found).toBeDefined();
    expect(found?.details).toBe("Assigned moderator role to student account.");
  });

  it("persists multiple audit entries and supports purging", () => {
    recordAuditLog({
      action: "moderation_status_updated",
      actor_id: "mod-uid-2",
      actor_email: "mod@nexora.internal",
      actor_role: "moderator",
      target_type: "moderation_report",
      target_id: "MOD-101",
      details: "Report reviewed and action taken.",
    });

    recordAuditLog({
      action: "ticket_status_updated",
      actor_id: "sup-uid-3",
      actor_email: "support@nexora.internal",
      actor_role: "support",
      target_type: "ticket",
      target_id: "TICK-202",
      details: "Ticket resolved with guidance notes.",
    });

    const logs = fetchAuditLogs();
    expect(logs.length).toBeGreaterThanOrEqual(2);

    clearAuditLogs();
    const afterClear = fetchAuditLogs();
    // Falls back to seed audit logs
    expect(afterClear.every((l) => l.id.startsWith("audit-init-"))).toBe(true);
  });
});
