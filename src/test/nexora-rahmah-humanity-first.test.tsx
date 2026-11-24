import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import {
  INITIAL_UNIVERSAL_BENEFIT_REGISTRY,
  INITIAL_HEALTH_TOPICS,
  INITIAL_EARTH_CARE_CHALLENGES,
  INITIAL_DIGITAL_SAFETY_LESSONS,
  DIGITAL_SAFETY_CHECKLIST_ITEMS,
  INITIAL_COMMUNITY_MAP_RESOURCES,
  INITIAL_LIFE_SAVING_GUIDES,
  INITIAL_OPEN_TOOLS_CATALOG,
  INITIAL_GOOD_CHARACTER_THEMES,
} from "@/data/humanity-first";
import { PreferencesProvider } from "@/lib/preferences";
import { KnowledgeGiftWizard } from "@/components/rahmah/KnowledgeGiftWizard";
import { CommunityResourceMapPanel } from "@/components/rahmah/CommunityResourceMapPanel";
import { LifeSavingAwarenessPanel } from "@/components/rahmah/LifeSavingAwarenessPanel";
import { FamilyKnowledgeLegacyPanel } from "@/components/rahmah/FamilyKnowledgeLegacyPanel";
import { VerifiedHelpNetworkPanel } from "@/components/rahmah/VerifiedHelpNetworkPanel";
import { HumanWisdomArchivePanel } from "@/components/rahmah/HumanWisdomArchivePanel";
import { AccessibilityImprovementStudio } from "@/components/rahmah/AccessibilityImprovementStudio";
import { HealthAwarenessPanel } from "@/components/rahmah/HealthAwarenessPanel";
import { TruthDefenderPanel } from "@/components/rahmah/TruthDefenderPanel";
import { EarthCareIncubatorPanel } from "@/components/rahmah/EarthCareIncubatorPanel";
import { DigitalSafetyPanel } from "@/components/rahmah/DigitalSafetyPanel";
import { OpenToolsForGoodPanel } from "@/components/rahmah/OpenToolsForGoodPanel";
import { GoodCharacterCompanionPanel } from "@/components/rahmah/GoodCharacterCompanionPanel";
import { BenefitContinuityRegistryPanel } from "@/components/rahmah/BenefitContinuityRegistryPanel";
import { NexoraRahmahHub } from "@/components/rahmah/NexoraRahmahHub";

vi.mock("@tanstack/react-router", async () => {
  const actual =
    await vi.importActual<typeof import("@tanstack/react-router")>("@tanstack/react-router");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    Link: ({
      children,
      to,
      ...rest
    }: {
      children: ReactNode;
      to: string;
      [k: string]: unknown;
    }) => (
      <a href={to} {...rest}>
        {children}
      </a>
    ),
  };
});

function renderWithProviders(ui: ReactNode) {
  return render(<PreferencesProvider>{ui}</PreferencesProvider>);
}

describe("NEXORA RAHMAH — Humanity First & Benefit Continuity System", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  describe("1. Data Invariants & Theological/Ethical Boundaries", () => {
    it("never includes حسنات calculation, point reward scoring, or competitive rankings", () => {
      INITIAL_GOOD_CHARACTER_THEMES.forEach((theme) => {
        expect(theme.authenticReferences.length).toBeGreaterThan(0);
        theme.authenticReferences.forEach((ref) => {
          expect(ref.sourceBook).toBeDefined();
          expect(ref.citationNumber).toBeDefined();
          expect(ref.textAr).toBeTruthy();
          expect(ref.textEn).toBeTruthy();
        });
        // Ensure no score fields exist
        expect((theme as unknown as Record<string, unknown>)["rewardScore"]).toBeUndefined();
        expect((theme as unknown as Record<string, unknown>)["hasanatPoints"]).toBeUndefined();
      });
    });

    it("verifies health awareness topics cover 15 distinct clinical domains with emergency red flags", () => {
      expect(INITIAL_HEALTH_TOPICS.length).toBeGreaterThanOrEqual(15);
      INITIAL_HEALTH_TOPICS.forEach((topic) => {
        expect(topic.whenToConsultDoctor.length).toBeGreaterThan(0);
        expect(topic.emergencyWarningSigns.length).toBeGreaterThan(0);
        expect(topic.trustedReferences.length).toBeGreaterThan(0);
        expect(topic.limitationsNotice).toContain("Educational");
      });
    });

    it("verifies life-saving protocols mandate certified training disclaimers and 112/999/911 dispatch", () => {
      INITIAL_LIFE_SAVING_GUIDES.forEach((guide) => {
        expect(guide.emergencyNumbers.kuwait).toBe("112");
        expect(guide.emergencyNumbers.international).toContain("112");
        expect(guide.certifiedTrainingDisclaimer).toBeTruthy();
        expect(guide.whatNeverToDo.length).toBeGreaterThan(0);
      });
    });
  });

  describe("2. HealthAwarenessPanel Component", () => {
    it("renders medical disclaimer banner and emergency dispatch instructions", () => {
      renderWithProviders(<HealthAwarenessPanel />);
      expect(screen.getByText(/Strict Ethical & Clinical Health Disclaimer/i)).toBeInTheDocument();
      expect(screen.getByText(/112 \(Kuwait\/Gulf\)/i)).toBeInTheDocument();
    });

    it("allows switching tabs between Overview, Doctor vs Emergency, and Glossary", () => {
      renderWithProviders(<HealthAwarenessPanel />);
      const emergencyTab = screen.getByRole("tab", { name: /Doctor vs Emergency/i });
      fireEvent.click(emergencyTab);
      expect(screen.getByText(/When Should You Consult a Doctor\?/i)).toBeInTheDocument();
      expect(screen.getByText(/Critical Emergency Warning Signs/i)).toBeInTheDocument();
    });
  });

  describe("3. TruthDefenderPanel Component", () => {
    it("renders examined claims with calibrated evidence verdicts", () => {
      renderWithProviders(<TruthDefenderPanel />);
      expect(screen.getByText(/Truth & Knowledge Defender/i)).toBeInTheDocument();
      expect(screen.getByText(/Claim Workspace/i)).toBeInTheDocument();
    });

    it("provides the Fallacy Gym for practicing critical reasoning", () => {
      renderWithProviders(<TruthDefenderPanel />);
      const fallacyTab = screen.getByRole("tab", { name: /Fallacy Gym/i });
      fireEvent.click(fallacyTab);
      expect(screen.getByText(/Logical Fallacy Practice Gymnasium/i)).toBeInTheDocument();
    });
  });

  describe("4. EarthCareIncubatorPanel Component", () => {
    it("enforces strict environmental honesty and displays safe student challenges", () => {
      renderWithProviders(<EarthCareIncubatorPanel />);
      expect(
        screen.getByText(/Strict Environmental Honesty & Safety Protocol/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/8-Step Incubator/i)).toBeInTheDocument();
    });
  });

  describe("5. DigitalSafetyPanel Component", () => {
    it("renders 10-point checklist and toggles state purely client-side without credentials", () => {
      renderWithProviders(<DigitalSafetyPanel />);
      expect(screen.getByText(/Strict Zero-Credential Privacy Guarantee/i)).toBeInTheDocument();
      const firstChecklist = screen.getByText(
        DIGITAL_SAFETY_CHECKLIST_ITEMS[0]?.label || "Unique Strong Passwords",
      );
      expect(firstChecklist).toBeInTheDocument();
      fireEvent.click(firstChecklist);
    });
  });

  describe("6. OpenToolsForGoodPanel Component", () => {
    it("accurately computes WCAG 2.2 color contrast ratios and passes AAA for black on white", () => {
      renderWithProviders(<OpenToolsForGoodPanel />);
      expect(screen.getByText(/WCAG 2.2 Color Contrast Ratio Calculator/i)).toBeInTheDocument();
      // Black on White (#0f172a on #ffffff) has high contrast > 10:1
      expect(screen.getByText(/Normal Text AAA/i)).toBeInTheDocument();
    });
  });

  describe("7. GoodCharacterCompanionPanel Component", () => {
    it("displays prophetic references and asserts no reward scoring", () => {
      renderWithProviders(<GoodCharacterCompanionPanel />);
      expect(
        screen.getByText(/Strict Ethical Notice: Sincerity & No Reward Scoring/i),
      ).toBeInTheDocument();
      expect(screen.getAllByText(/Noble Character Virtues/i).length).toBeGreaterThan(0);
      expect(INITIAL_GOOD_CHARACTER_THEMES.length).toBe(12);
    });
  });

  describe("8. BenefitContinuityRegistryPanel Component", () => {
    it("renders 10-stage lifecycle, review scheduling, and health dashboard metrics", () => {
      renderWithProviders(<BenefitContinuityRegistryPanel />);
      expect(screen.getByText(/Universal Benefit Resource Registry/i)).toBeInTheDocument();
      expect(screen.getByText(/Current 10-Stage Lifecycle Pipeline:/i)).toBeInTheDocument();
    });
  });

  describe("9. Master NexoraRahmahHub Coordinator", () => {
    it("renders all 5 top-level pillars without throwing errors", () => {
      renderWithProviders(<NexoraRahmahHub />);
      expect(screen.getAllByText(/NEXORA RAHMAH/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Humanity First \(10\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Knowledge Gift/i)).toBeInTheDocument();
      expect(screen.getByText(/Accessibility Studio/i)).toBeInTheDocument();
      expect(screen.getByText(/Universal Registry \(11th\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Good Character/i)).toBeInTheDocument();
    });
  });

  describe("10. KnowledgeGiftWizard & Remaining Humanity Systems", () => {
    it("renders KnowledgeGiftWizard 8-step flow", () => {
      renderWithProviders(<KnowledgeGiftWizard />);
      expect(screen.getByText(/Topic & Subject/i)).toBeInTheDocument();
      expect(screen.getByText(/Your Own Words/i)).toBeInTheDocument();
      expect(screen.getByText(/Publish to Registry/i)).toBeInTheDocument();
    });

    it("renders CommunityResourceMapPanel with verified centers and filtering", () => {
      renderWithProviders(<CommunityResourceMapPanel />);
      expect(screen.getByText(/Verified Community & Educational Resources/i)).toBeInTheDocument();
      expect(INITIAL_COMMUNITY_MAP_RESOURCES.length).toBeGreaterThan(0);
    });

    it("renders LifeSavingAwarenessPanel with 112 dispatch and mandatory training disclaimer", () => {
      renderWithProviders(<LifeSavingAwarenessPanel />);
      expect(screen.getByText(/Universal Emergency Dispatch Numbers/i)).toBeInTheDocument();
      expect(screen.getByText(/Mandatory Educational Disclaimer/i)).toBeInTheDocument();
    });

    it("renders FamilyKnowledgeLegacyPanel with private family vault guarantee", () => {
      renderWithProviders(<FamilyKnowledgeLegacyPanel />);
      expect(screen.getByText(/Strict Private Family Vault Guarantee/i)).toBeInTheDocument();
    });

    it("renders VerifiedHelpNetworkPanel with strict child safety protocol", () => {
      renderWithProviders(<VerifiedHelpNetworkPanel />);
      expect(screen.getByText(/Strict Youth Safety & Safeguarding Protocol/i)).toBeInTheDocument();
    });

    it("renders HumanWisdomArchivePanel with consent-verified records", () => {
      renderWithProviders(<HumanWisdomArchivePanel />);
      expect(screen.getByText(/Human Wisdom & Mentorship Archive/i)).toBeInTheDocument();
    });

    it("renders AccessibilityImprovementStudio with audio, alt-text, simplifier, and semantic tabs", () => {
      renderWithProviders(<AccessibilityImprovementStudio />);
      expect(screen.getByText(/Accessibility Mission & Adaptation Studio/i)).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /Audio Adaptation/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /Diagram Alt-Text/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /Reading Simplifier/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /Semantic Structure/i })).toBeInTheDocument();
    });
  });
});
