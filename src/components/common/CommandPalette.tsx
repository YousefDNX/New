import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Atom,
  BookOpen,
  BookOpenCheck,
  Bot,
  Brain,
  Calendar,
  CheckCircle2,
  Code2,
  Compass,
  FileText,
  Heart,
  Keyboard,
  Layers,
  LayoutPanelTop,
  Moon,
  NotebookPen,
  Palette,
  Search,
  Settings,
  Sparkles,
  Sun,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { BRAND, isBtcMode } from "@/config/brand";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useThemePersistence } from "@/hooks/use-theme-persistence";
import { usePrefs } from "@/lib/preferences";
import { GLOBAL_SHORTCUTS, useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import type { InterfaceTheme } from "@/lib/settings";
import { UI_EXPERIENCES, type UiExperienceId } from "@/lib/ui-experiences";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const navigate = useNavigate();
  const { lang, t, theme, resolvedTheme, setUiExperience, effectiveUiExperience } = usePrefs();
  const { applyUiTheme, applyColorMode } = useThemePersistence();

  const isArabic = lang === "ar";

  // Register global shortcuts
  useKeyboardShortcuts({
    onOpenCommandPalette: () => setOpen((prev) => !prev),
    onOpenHelp: () => setHelpOpen((prev) => !prev),
    enabled: true,
  });

  // Listen to custom dispatch events from UI buttons
  useEffect(() => {
    const handleOpenPalette = () => setOpen(true);
    const handleOpenHelp = () => setHelpOpen(true);
    window.addEventListener("nexora:open-command-palette", handleOpenPalette);
    window.addEventListener("nexora:open-shortcuts-help", handleOpenHelp);
    return () => {
      window.removeEventListener("nexora:open-command-palette", handleOpenPalette);
      window.removeEventListener("nexora:open-shortcuts-help", handleOpenHelp);
    };
  }, []);

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  const handleNavigate = useCallback(
    (path: string, search?: Record<string, string>) => {
      runCommand(() => {
        if (search) {
          void navigate({ to: path, search: search as never });
        } else {
          void navigate({ to: path });
        }
      });
    },
    [navigate, runCommand],
  );

  const handleSetUiTheme = useCallback(
    (themeId: InterfaceTheme) => {
      runCommand(() => {
        void applyUiTheme(themeId);
      });
    },
    [runCommand, applyUiTheme],
  );

  const handleSetUiExperience = useCallback(
    (expId: UiExperienceId) => {
      runCommand(() => {
        setUiExperience(expId);
      });
    },
    [runCommand, setUiExperience],
  );

  const handleToggleColorMode = useCallback(() => {
    runCommand(() => {
      const next = resolvedTheme === "dark" ? "light" : "dark";
      void applyColorMode(next);
    });
  }, [runCommand, resolvedTheme, applyColorMode]);

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder={
            isArabic
              ? "ابحث عن صفحة، أمر، أو افتح ميزة..."
              : "Type a command, search modules, or take action..."
          }
        />
        <CommandList className="max-h-[380px]">
          <CommandEmpty>{isArabic ? "لم يتم العثور على نتائج." : "No results found."}</CommandEmpty>

          {/* Core Modules Navigation */}
          <CommandGroup heading={isArabic ? "الوحدات الأساسية" : "Core Modules"}>
            <CommandItem
              onSelect={() => handleNavigate("/app")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Compass className="size-4 text-teal-400" />
              <span>{isArabic ? "خريطة النمو ولوحة التحكم" : "Growth Map & Dashboard"}</span>
              <CommandShortcut>Ctrl+1</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => handleNavigate("/app/study")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <BookOpen className="size-4 text-blue-400" />
              <span>{isArabic ? "مساحة الدراسة" : "Study Workspace"}</span>
              <CommandShortcut>Ctrl+2</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => handleNavigate("/app/english")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="size-4 text-primary" />
              <span>
                {isArabic ? "عالم الإنجليزية وخريطة المغامرة" : "English Adventure World"}
              </span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleNavigate("/app/tasks")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="size-4 text-emerald-400" />
              <span>{isArabic ? "المهام والإنتاجية" : "Tasks & Productivity"}</span>
              <CommandShortcut>Ctrl+3</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => handleNavigate("/app/ai")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Bot className="size-4 text-purple-400" />
              <span>
                {isArabic ? `مساعد ${BRAND.shortName} الذكي` : `${BRAND.shortName} AI Assistant`}
              </span>
              <CommandShortcut>Ctrl+4</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          {/* Student Workspaces */}
          <CommandGroup heading={isArabic ? "مساحات الطالب" : "Student Workspaces"}>
            <CommandItem
              onSelect={() => handleNavigate("/app", { tab: "journal" })}
              className="flex items-center gap-2 cursor-pointer"
            >
              <NotebookPen className="size-4 text-teal-400" />
              <span>{t("dash.tab.journal")}</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleNavigate("/app/tasks", { tab: "calendar" })}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="size-4 text-sky-400" />
              <span>{t("cal.title")}</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleNavigate("/app/care")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Heart className="size-4 text-rose-400" />
              <span>{isArabic ? "الرعاية والعافية" : "Care & Wellbeing"}</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleNavigate("/app/quran")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <BookOpenCheck className="size-4 text-emerald-400" />
              <span>{t("nav.quran")}</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleNavigate("/app/circle")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Users className="size-4 text-amber-400" />
              <span>{isArabic ? "مجتمع الطلاب" : "Circle & Community"}</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleNavigate("/app/opportunities")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Zap className="size-4 text-yellow-400" />
              <span>{isArabic ? "الفرص والمنح" : "Opportunities & Contests"}</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleNavigate("/app/future")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Brain className="size-4 text-indigo-400" />
              <span>{isArabic ? "التخطيط المستقبلي" : "Future Planning & Career"}</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleNavigate("/app/level-up")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Trophy className="size-4 text-amber-500" />
              <span>{isArabic ? "المستويات والأوسمة" : "Level-Up & Badges"}</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleNavigate("/app/study", { tab: "science" })}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Atom className="size-4 text-cyan-400" />
              <span>
                {isArabic ? "مختبرات العلوم التفاعلية (#1-6)" : "Science Discovery Labs (#1-6)"}
              </span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleNavigate("/app/study", { tab: "math" })}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Layers className="size-4 text-blue-400" />
              <span>
                {isArabic ? "الرياضيات والهندسة (#7-12)" : "Mathematics & Engineering (#7-12)"}
              </span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleNavigate("/app/level-up", { tab: "coding" })}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Code2 className="size-4 text-emerald-400" />
              <span>
                {isArabic ? "مختبر البرمجة والروبوت (#25-29)" : "Coding & Robotics Lab (#25-29)"}
              </span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleNavigate("/app/circle", { tab: "mun" })}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Compass className="size-4 text-purple-400" />
              <span>
                {isArabic ? "محاكي نموذج الأمم المتحدة (#37)" : "Model United Nations (MUN #37)"}
              </span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleNavigate("/app/settings")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Settings className="size-4 text-muted-foreground" />
              <span>{isArabic ? "الإعدادات والتخصيص" : "Settings & Preferences"}</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          {/* Whole-Website UI & UX Experiences */}
          <CommandGroup
            heading={isArabic ? "واجهات وتجربة الموقع الكاملة" : "Whole-Site UI & UX Experiences"}
          >
            {UI_EXPERIENCES.map((exp) => (
              <CommandItem
                key={exp.id}
                onSelect={() => handleSetUiExperience(exp.id)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <LayoutPanelTop className="size-4 text-primary" />
                <span>{isArabic ? exp.nameAr : exp.nameEn}</span>
                {effectiveUiExperience === exp.id && (
                  <span className="ms-auto text-[10px] font-semibold text-primary">
                    {isArabic ? "نشطة" : "Active"}
                  </span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          {/* Quick Actions & UI Theme Switches */}
          <CommandGroup heading={isArabic ? "الإجراءات والمظهر" : "Quick Actions & Theme"}>
            <CommandItem
              onSelect={handleToggleColorMode}
              className="flex items-center gap-2 cursor-pointer"
            >
              {theme === "dark" ? (
                <Sun className="size-4 text-amber-400" />
              ) : (
                <Moon className="size-4 text-indigo-400" />
              )}
              <span>
                {theme === "dark"
                  ? isArabic
                    ? "التحويل للوضع الفاتح"
                    : "Switch to Light Mode"
                  : isArabic
                    ? "التحويل للوضع الداكن"
                    : "Switch to Dark Mode"}
              </span>
            </CommandItem>

            <CommandItem
              onSelect={() => handleSetUiTheme("classic")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Palette className="size-4 text-teal-400" />
              <span>
                {isArabic
                  ? `سمة ${BRAND.shortName} الكلاسيكية`
                  : isBtcMode()
                    ? `Theme: ${BRAND.shortName} Classic`
                    : `Theme: Classic ${BRAND.shortName}`}
              </span>
              <span className="ms-auto text-[10px] font-mono text-muted-foreground">classic</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSetUiTheme("minimal")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Palette className="size-4 text-zinc-400" />
              <span>{isArabic ? "سمة التبسيط" : "Theme: Minimalist"}</span>
              <span className="ms-auto text-[10px] font-mono text-muted-foreground">minimal</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSetUiTheme("focus")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Palette className="size-4 text-indigo-400" />
              <span>{isArabic ? "سمة التركيز الليلي" : "Theme: Deep Focus"}</span>
              <span className="ms-auto text-[10px] font-mono text-muted-foreground">focus</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSetUiTheme("creative")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="size-4 text-amber-400" />
              <span>{isArabic ? "سمة الأستوديو الإبداعي" : "Theme: Creative Studio"}</span>
              <span className="ms-auto text-[10px] font-mono text-muted-foreground">creative</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSetUiTheme("aurora_glass")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="size-4 text-emerald-400" />
              <span>{isArabic ? "سمة زجاج الشفق" : "Theme: Aurora Glass"}</span>
              <span className="ms-auto text-[10px] font-mono text-muted-foreground">
                aurora_glass
              </span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSetUiTheme("nordic_frost")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Palette className="size-4 text-cyan-400" />
              <span>{isArabic ? "سمة الصقيع الاسكندنافي" : "Theme: Nordic Frost"}</span>
              <span className="ms-auto text-[10px] font-mono text-muted-foreground">
                nordic_frost
              </span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSetUiTheme("sepia_study")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Palette className="size-4 text-amber-500" />
              <span>{isArabic ? "سمة دراسة دافئة (سيبيا)" : "Theme: Sepia Study"}</span>
              <span className="ms-auto text-[10px] font-mono text-muted-foreground">
                sepia_study
              </span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSetUiTheme("cyber_matrix")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Palette className="size-4 text-green-400" />
              <span>{isArabic ? "سمة المصفوفة الرقمية" : "Theme: Cyber Matrix"}</span>
              <span className="ms-auto text-[10px] font-mono text-muted-foreground">
                cyber_matrix
              </span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSetUiTheme("midnight_purple")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Palette className="size-4 text-purple-400" />
              <span>{isArabic ? "سمة بنفسج منتصف الليل" : "Theme: Midnight Purple"}</span>
              <span className="ms-auto text-[10px] font-mono text-muted-foreground">
                midnight_purple
              </span>
            </CommandItem>

            <CommandItem
              onSelect={() => {
                setOpen(false);
                setHelpOpen(true);
              }}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Keyboard className="size-4 text-muted-foreground" />
              <span>{isArabic ? "دليل اختصارات المفاتيح" : "Keyboard Shortcuts Cheat Sheet"}</span>
              <CommandShortcut>?</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {/* Keyboard Shortcuts Cheat Sheet Dialog */}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-semibold">
              <Keyboard className="size-4 text-primary" />
              <span>
                {isArabic ? "اختصارات لوحة المفاتيح" : `${BRAND.shortName} Keyboard Shortcuts`}
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {GLOBAL_SHORTCUTS.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-accent/40 text-xs"
              >
                <span className="text-foreground">{isArabic ? item.actionAr : item.actionEn}</span>
                <kbd className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 font-mono text-[11px] font-semibold text-muted-foreground shadow-xs border border-border">
                  {item.keyLabel}
                </kbd>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
