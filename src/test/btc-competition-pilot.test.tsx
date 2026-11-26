import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import * as supportService from "@/lib/support-service";
import { verifyModeratorRequest, scrubPii } from "@/lib/moderator.server";
import { NAV_GROUPS } from "@/config/navigation";
import { PILOT_LANGS } from "@/lib/i18n/types";
import { GRADE_9_UNIT_3_WORDS } from "@/data/grade9-unit3-vocab";

describe("BTC Competition Pilot Guardrails", () => {
  it("never exposes moderator email in client modules (support-service, use-rbac)", () => {
    const supportSource = readFileSync(
      resolve(process.cwd(), "src/lib/support-service.ts"),
      "utf8",
    );
    const rbacSource = readFileSync(resolve(process.cwd(), "src/hooks/use-rbac.ts"), "utf8");
    const modServerSource = readFileSync(
      resolve(process.cwd(), "src/lib/moderator.server.ts"),
      "utf8",
    );
    expect(supportSource).not.toContain("alshbrawe7373");
    expect(rbacSource).not.toContain("alshbrawe7373");
    expect(modServerSource).toContain("alshbrawe7373");
  });

  it("fails closed on server moderator verification when Authorization header is missing and scrubs PII", async () => {
    const res = await verifyModeratorRequest(
      new Request("http://localhost/api/moderator/overview"),
    );
    expect(res.authorized).toBe(false);
    expect(res.role).toBe("student");
    expect(res.reason).toBe("missing_bearer_token");

    const scrubbed = scrubPii("Failed for alice@example.com with +96512345678");
    expect(scrubbed).not.toContain("alice@example.com");
    expect(scrubbed).not.toContain("96512345678");
    expect(scrubbed).toContain("[redacted-email]");
    expect(scrubbed).toContain("[redacted-phone]");
  });

  it("exposes restored BTC navigation items and EN/AR bilingual languages", () => {
    const allIds = NAV_GROUPS.flatMap((g) => g.items.map((item) => item.id));
    expect(allIds).toEqual([
      "home",
      "study",
      "skills",
      "tasks",
      "care",
      "future",
      "opportunities",
      "english",
      "quran",
    ]);
    expect(PILOT_LANGS).toEqual(["en", "ar"]);
  });

  it("includes all 24 Grade 9 Unit 3 vocabulary words", () => {
    expect(GRADE_9_UNIT_3_WORDS).toHaveLength(24);
  });
});
