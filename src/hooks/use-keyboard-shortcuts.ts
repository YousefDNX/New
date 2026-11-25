import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { BRAND } from "@/config/brand";

export interface ShortcutDefinition {
  id: string;
  keyLabel: string;
  keys: string[];
  actionEn: string;
  actionAr: string;
  category: "navigation" | "action" | "system";
  modulePath?: string;
  badge?: string;
}

export const GLOBAL_SHORTCUTS: readonly ShortcutDefinition[] = [
  {
    id: "palette",
    keyLabel: "Ctrl + K",
    keys: ["⌘", "K"],
    actionEn: "Quick Navigation & Search Palette (Cmd/Ctrl + K)",
    actionAr: "شريط التنقل السريع والبحث الشامل (Cmd/Ctrl + K)",
    category: "system",
  },
  {
    id: "help",
    keyLabel: "Ctrl + /",
    keys: ["Ctrl", "/"],
    actionEn: "Open Keyboard Shortcuts Help",
    actionAr: "فتح دليل اختصارات المفاتيح",
    category: "system",
  },
  {
    id: "nav-growth",
    keyLabel: "Ctrl + 1",
    keys: ["Ctrl", "1"],
    actionEn: "Navigate to Dashboard Home",
    actionAr: "الانتقال إلى لوحة التحكم الرئيسية",
    category: "navigation",
    modulePath: "/app",
  },
  {
    id: "nav-study",
    keyLabel: "Ctrl + 2",
    keys: ["Ctrl", "2"],
    actionEn: "Open Study & Notes Workspace (or press S)",
    actionAr: "فتح مساحة الدراسة والملاحظات (أو اضغط S)",
    category: "navigation",
    modulePath: "/app/study",
  },
  {
    id: "nav-productivity",
    keyLabel: "Ctrl + 3",
    keys: ["Ctrl", "3"],
    actionEn: "Open Tasks & Productivity Planner (or press T)",
    actionAr: "فتح المهام ومخطط الإنتاجية (أو اضغط T)",
    category: "navigation",
    modulePath: "/app/tasks",
  },
  {
    id: "nav-ai",
    keyLabel: "Ctrl + 4",
    keys: ["Ctrl", "4"],
    actionEn: `Open ${BRAND.shortName} AI Assistant (or press A)`,
    actionAr: `فتح مساعد ${BRAND.shortName} الذكي (أو اضغط A)`,
    category: "navigation",
    modulePath: "/app/ai",
  },
  {
    id: "nav-growth-map",
    keyLabel: "G",
    keys: ["G"],
    actionEn: "Navigate to Growth Map",
    actionAr: "الانتقال إلى خريطة النمو التفاعلية",
    category: "navigation",
    modulePath: "/app?tab=growthmap",
  },
  {
    id: "nav-dashboard",
    keyLabel: "D",
    keys: ["D"],
    actionEn: "Navigate to Dashboard Overview",
    actionAr: "الانتقال إلى نظرة عامة على لوحة التحكم",
    category: "navigation",
    modulePath: "/app",
  },
  {
    id: "nav-quran",
    keyLabel: "Q",
    keys: ["Q"],
    actionEn: "Open Quran Recitation & Reflection",
    actionAr: "فتح مساحة القرآن الكريم والتلاوة",
    category: "navigation",
    modulePath: "/app/quran",
  },
  {
    id: "nav-levelup",
    keyLabel: "L",
    keys: ["L"],
    actionEn: "Open Level-Up Tech & STEM Labs",
    actionAr: "فتح مختبرات البرمجة والعلوم",
    category: "navigation",
    modulePath: "/app/level-up",
  },
  {
    id: "shortcuts-help",
    keyLabel: "?",
    keys: ["?"],
    actionEn: "Open Keyboard Shortcuts Manager",
    actionAr: "فتح مدير اختصارات لوحة المفاتيح",
    category: "system",
  },
] as const;

export interface UseKeyboardShortcutsOptions {
  onOpenCommandPalette?: () => void;
  onOpenHelp?: () => void;
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  onOpenCommandPalette,
  onOpenHelp,
  enabled = true,
}: UseKeyboardShortcutsOptions = {}) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      const isModifier = event.ctrlKey || event.metaKey;

      // 1. Command Palette: Cmd+K / Ctrl+K
      if (isModifier && (event.key === "k" || event.key === "K")) {
        event.preventDefault();
        onOpenCommandPalette?.();
        return;
      }

      // 2. Help Guide: Cmd+/ / Ctrl+/
      if (isModifier && event.key === "/") {
        event.preventDefault();
        onOpenHelp?.();
        return;
      }

      // Number-based quick navigation (Ctrl+1 .. Ctrl+4)
      if (isModifier && !event.shiftKey && !event.altKey) {
        if (event.key === "1") {
          event.preventDefault();
          void navigate({ to: "/app" });
          return;
        }
        if (event.key === "2") {
          event.preventDefault();
          void navigate({ to: "/app/study" });
          return;
        }
        if (event.key === "3") {
          event.preventDefault();
          void navigate({ to: "/app/tasks" });
          return;
        }
        if (event.key === "4") {
          event.preventDefault();
          void navigate({ to: "/app/ai" });
          return;
        }
      }

      // If user is typing in a form input, do NOT trigger single-key shortcuts
      if (isInput || isModifier || event.altKey) {
        return;
      }

      // 3. Single key shortcuts when not in inputs
      const key = event.key.toLowerCase();

      if (event.key === "?") {
        event.preventDefault();
        onOpenHelp?.();
        return;
      }

      switch (key) {
        case "g":
          event.preventDefault();
          void navigate({ to: "/app", search: { tab: "growthmap" } as Record<string, string> });
          break;
        case "d":
          event.preventDefault();
          void navigate({ to: "/app", search: { tab: "overview" } as Record<string, string> });
          break;
        case "s":
          event.preventDefault();
          void navigate({ to: "/app/study" });
          break;
        case "t":
        case "p":
          event.preventDefault();
          void navigate({ to: "/app/tasks" });
          break;
        case "a":
          event.preventDefault();
          void navigate({ to: "/app/ai" });
          break;
        case "q":
          event.preventDefault();
          void navigate({ to: "/app/quran" });
          break;
        case "c":
          event.preventDefault();
          void navigate({ to: "/app/circle" });
          break;
        case "l":
          event.preventDefault();
          void navigate({ to: "/app/level-up" });
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate, onOpenCommandPalette, onOpenHelp, enabled]);
}
