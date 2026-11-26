import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { Logo } from "@/components/app/Logo";
import { FeatureGuideProvider } from "@/components/common/FeatureGuideModal";
import { EnglishAdventureWorld } from "@/components/english/EnglishAdventureWorld";
import { ModernSelect } from "@/components/ui/modern-select";
import { APPROVED_BTC_MODULES } from "@/config/modules-catalog";
import { ALL_NAV_ITEMS } from "@/config/navigation";
import { GRADE_9_UNIT_3_WORDS } from "@/data/grade9-unit3-vocab";
import {
  GRADE_9_UNIT_1_WORDS,
  GRADE_9_UNIT_2_WORDS,
  GRADE_9_UNIT_4_WORDS,
  GRADE_9_UNIT_QUIZZES,
  GRADE_9_VOCAB_UNITS,
} from "@/data/grade9-vocab-units";
import { resolveCommunityGroup } from "@/lib/firestore-data";
import {
  ADMIN_EMAILS,
  checkCircleRateLimit,
  createScopedCirclePost,
  getModeratorEmail,
  resetCircleRateLimitsForTests,
  scrubPii,
  validateCircleCommunityAccess,
  verifyModeratorRequest,
} from "@/lib/moderator.server";
import { PreferencesProvider } from "@/lib/preferences";

describe("BTC Restoration Verification (Parts 1-8)", () => {
  beforeEach(() => {
    localStorage.clear();
    resetCircleRateLimitsForTests();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it("Part 1 & 6: includes restored core educational modules in ALL_NAV_ITEMS without gender-locked nav entries and shows 'Levelup peers' under BTC logo", () => {
    const requiredNavIds = [
      "home",
      "study",
      "skills",
      "tasks",
      "care",
      "future",
      "ai",
      "opportunities",
      "english",
      "quran",
      "settings",
    ];
    const presentIds = new Set(ALL_NAV_ITEMS.map((item) => item.id));
    for (const id of requiredNavIds) {
      expect(presentIds.has(id)).toBe(true);
    }

    const blockedNavIds = new Set(["girls", "girls-space", "martial-arts", "rahmah"]);
    for (const item of ALL_NAV_ITEMS) {
      expect(blockedNavIds.has(item.id)).toBe(false);
    }

    const excludedModuleIds = new Set([
      "wellbeing-healthy-habits",
      "future-careers",
      "opportunity-radar",
      "community-impact",
      "projects-innovation",
      "skills-academy",
    ]);
    for (const mod of APPROVED_BTC_MODULES) {
      expect(excludedModuleIds.has(mod.id)).toBe(false);
    }

    render(<Logo />);
    expect(screen.getByText("BTC")).toBeInTheDocument();
    expect(screen.getByText("Levelup peers")).toBeInTheDocument();
  });

  it("Part 2: enforces community segregation, rate limiting, PII scrubbing, and dual admin emails", () => {
    expect(ADMIN_EMAILS).toContain("alshbrawe7373@gmail.com");
    expect(ADMIN_EMAILS).toContain("alshbrawe7676@gmail.com");
    expect(getModeratorEmail()).toBe("alshbrawe7373@gmail.com");

    const reqPrimary = new Request("http://localhost/api/moderator/session", {
      headers: { authorization: "Bearer alshbrawe7373@gmail.com" },
    });
    const reqSecondary = new Request("http://localhost/api/moderator/session", {
      headers: { authorization: "Bearer alshbrawe7676@gmail.com" },
    });
    const reqStudent = new Request("http://localhost/api/moderator/session", {
      headers: { authorization: "Bearer student@example.com" },
    });

    expect(verifyModeratorRequest(reqPrimary)).toMatchObject({
      authorized: true,
      email: "alshbrawe7373@gmail.com",
    });
    expect(verifyModeratorRequest(reqSecondary)).toMatchObject({
      authorized: true,
      email: "alshbrawe7676@gmail.com",
    });
    expect(verifyModeratorRequest(reqStudent).authorized).toBe(false);

    expect(resolveCommunityGroup("male")).toBe("boys");
    expect(resolveCommunityGroup("female")).toBe("girls");
    expect(resolveCommunityGroup(null)).toBeNull();

    const blockedCross = validateCircleCommunityAccess({
      actorUid: "u-boy-1",
      verifiedGroup: "boys",
      targetGroup: "girls",
    });
    expect(blockedCross.allowed).toBe(false);
    expect(blockedCross.status).toBe(403);

    const blockedSwitch = validateCircleCommunityAccess({
      actorUid: "u-girl-1",
      verifiedGroup: "girls",
      requestedCommunitySwitch: "boys",
    });
    expect(blockedSwitch.allowed).toBe(false);
    expect(blockedSwitch.status).toBe(403);

    const sameCommunity = validateCircleCommunityAccess({
      actorUid: "u-girl-1",
      verifiedGroup: "girls",
      targetGroup: "girls",
    });
    expect(sameCommunity).toMatchObject({
      allowed: true,
      status: 200,
      communityGroup: "girls",
    });

    for (let i = 0; i < 12; i++) {
      expect(checkCircleRateLimit("rate-user-1", "post").allowed).toBe(true);
    }
    const limited = checkCircleRateLimit("rate-user-1", "post");
    expect(limited.allowed).toBe(false);

    const scopedPostBlocked = createScopedCirclePost({
      actorUid: "rate-user-1",
      verifiedGroup: "boys",
      category: "math",
      title: "Email me student@test.org or +96512345678",
      body: "Body",
      authorAlias: "Student",
    });
    expect(scopedPostBlocked).toMatchObject({ ok: false, status: 429 });

    expect(scrubPii("Contact student@test.org or +96512345678")).toBe(
      "Contact [redacted-email] or [redacted-phone]",
    );
  });

  it("Part 3: provides complete Grade 9 Units 1-4 vocabulary with preserved Unit 3 and interactive unit switching in English World", () => {
    expect(GRADE_9_VOCAB_UNITS.map((u) => u.unit)).toEqual([1, 2, 3, 4]);
    expect(GRADE_9_UNIT_1_WORDS.length).toBe(24);
    expect(GRADE_9_UNIT_2_WORDS.length).toBe(24);
    expect(GRADE_9_UNIT_3_WORDS.length).toBe(24);
    expect(GRADE_9_UNIT_4_WORDS.length).toBe(21);

    const willWord = GRADE_9_UNIT_1_WORDS.find((w) => w.word === "will");
    expect(willWord?.meaningAr).toContain("العزيمة");

    const claimWord = GRADE_9_UNIT_2_WORDS.find((w) => w.word === "claim");
    expect(claimWord?.meaningAr).toContain("يدّعي");
    expect(GRADE_9_UNIT_2_WORDS.some((w) => w.word === "judgement")).toBe(true);

    const benefitWord = GRADE_9_UNIT_4_WORDS.find((w) => w.word === "benefit");
    expect(benefitWord?.meaningAr).toContain("يفيد");
    expect(GRADE_9_UNIT_4_WORDS.some((w) => w.word === "minimise")).toBe(true);

    expect(GRADE_9_UNIT_QUIZZES[1].length).toBeGreaterThanOrEqual(4);
    expect(GRADE_9_UNIT_QUIZZES[2].length).toBeGreaterThanOrEqual(4);
    expect(GRADE_9_UNIT_QUIZZES[3].length).toBeGreaterThanOrEqual(4);
    expect(GRADE_9_UNIT_QUIZZES[4].length).toBeGreaterThanOrEqual(4);

    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={qc}>
        <PreferencesProvider>
          <FeatureGuideProvider>
            <EnglishAdventureWorld />
          </FeatureGuideProvider>
        </PreferencesProvider>
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Skill Academies/i }));
    fireEvent.click(screen.getByRole("button", { name: /^Vocabulary$/i }));

    fireEvent.click(screen.getByTestId("vocab-unit-1-tab"));
    expect(screen.getByText("will")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("vocab-unit-2-tab"));
    expect(screen.getByText("claim")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("vocab-unit-4-tab"));
    expect(screen.getByText("benefit")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Unit 4 Quiz/i }));
    expect(screen.getByText(/Tree-planting projects/i)).toBeInTheDocument();
  });

  it("Part 5: ModernSelect opens and updates selected value interactively", () => {
    function Harness() {
      const [val, setVal] = useState("unit1");
      return (
        <div>
          <ModernSelect
            value={val}
            onValueChange={setVal}
            ariaLabel="Unit Picker"
            data-testid="modern-select-test"
            options={[
              { value: "unit1", label: "Unit 1" },
              { value: "unit2", label: "Unit 2" },
              { value: "unit4", label: "Unit 4" },
            ]}
          />
          <span data-testid="selected-value">{val}</span>
        </div>
      );
    }

    render(
      <PreferencesProvider>
        <Harness />
      </PreferencesProvider>,
    );
    const trigger = screen.getByTestId("modern-select-test");
    expect(trigger).toHaveTextContent("Unit 1");
    fireEvent.keyDown(trigger, { key: "Enter" });
    fireEvent.click(screen.getByRole("option", { name: "Unit 4" }));
    expect(screen.getByTestId("selected-value")).toHaveTextContent("unit4");
  });
});
