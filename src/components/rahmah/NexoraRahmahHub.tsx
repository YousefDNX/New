import { useState } from "react";
import {
  Heart,
  Globe2,
  Sparkles,
  BookOpen,
  ShieldCheck,
  Accessibility,
  Library,
  HandHeart,
  Stethoscope,
  Leaf,
  Lock,
  Building2,
  PhoneCall,
  Wrench,
  Users,
  Compass,
  Gift,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePrefs } from "@/lib/preferences";

// Humanity First & Rahmah Subcomponents
import { KnowledgeGiftWizard } from "./KnowledgeGiftWizard";
import { HealthAwarenessPanel } from "./HealthAwarenessPanel";
import { TruthDefenderPanel } from "./TruthDefenderPanel";
import { EarthCareIncubatorPanel } from "./EarthCareIncubatorPanel";
import { DigitalSafetyPanel } from "./DigitalSafetyPanel";
import { CommunityResourceMapPanel } from "./CommunityResourceMapPanel";
import { LifeSavingAwarenessPanel } from "./LifeSavingAwarenessPanel";
import { OpenToolsForGoodPanel } from "./OpenToolsForGoodPanel";
import { FamilyKnowledgeLegacyPanel } from "./FamilyKnowledgeLegacyPanel";
import { VerifiedHelpNetworkPanel } from "./VerifiedHelpNetworkPanel";
import { HumanWisdomArchivePanel } from "./HumanWisdomArchivePanel";
import { AccessibilityImprovementStudio } from "./AccessibilityImprovementStudio";
import { GoodCharacterCompanionPanel } from "./GoodCharacterCompanionPanel";
import { BenefitContinuityRegistryPanel } from "./BenefitContinuityRegistryPanel";

export function NexoraRahmahHub() {
  const { lang } = usePrefs();
  const isAr = lang === "ar";

  const [mainTab, setMainTab] = useState<
    "knowledge_gift" | "humanity_first" | "accessibility" | "registry" | "character"
  >("humanity_first");

  const [humanitySubsystem, setHumanitySubsystem] = useState<
    | "health"
    | "truth"
    | "earth"
    | "digital"
    | "community"
    | "lifesaving"
    | "tools"
    | "family"
    | "help"
    | "wisdom"
  >("health");

  return (
    <div className="space-y-8 pb-16">
      {/* Platform Mission Statement Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-linear-to-br from-emerald-500/10 via-sky-500/5 to-indigo-500/10 p-6 md:p-8 shadow-sm">
        <div className="relative z-10 max-w-4xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-600 text-white shadow-xs">
              <Heart className="h-3.5 w-3.5 fill-current" />
              NEXORA RAHMAH
            </span>
            <Badge variant="outline" className="text-xs bg-background/80">
              {isAr ? "منظومة النفع الإنساني المستدام" : "Humanity First Ecosystem"}
            </Badge>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            {isAr
              ? "نكسورا رحمة: منظومة المعرفة النافعة، الإحسان، والاستدامة الإنسانية"
              : "NEXORA RAHMAH: Beneficial Knowledge, Compassion & Lasting Human Impact"}
          </h1>

          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            {isAr
              ? "نظام عالمي قائم على الصدق والمسؤولية والرحمة والتواضع العلمي. صُمم لتمكين كل إنسان من تعلم علم نافع، تحسين حياته، إعانة غيره، تذليل حواجز التعلم، وصيانة المعرفة للأجيال دون ادعاء لاحتساب الأجور أو مباهاة بالأعمال."
              : "A comprehensive ecosystem centered on sincerity, responsibility, compassion, scientific accuracy, and sustainable benefit. Built to make knowledge accessible, help learners overcome barriers, preserve authentic wisdom, and solve real community challenges without spiritual vanity or reward calculation."}
          </p>

          <div className="pt-2 flex flex-wrap gap-2 text-xs text-muted-foreground font-medium">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              {isAr ? "مجاني بالكامل بدون حواجز دفع" : "100% Free Open Knowledge"}
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Accessibility className="h-3.5 w-3.5 text-sky-600" />
              {isAr ? "ميسر لأصحاب الهمم وقارئات الشاشة" : "Multi-Modal Accessibility (WCAG 2.2)"}
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Library className="h-3.5 w-3.5 text-indigo-600" />
              {isAr ? "صيانة وتدقيق دوري مستمر" : "Active Continuous Peer Maintenance"}
            </span>
          </div>
        </div>
      </div>

      {/* Primary 5-Pillar Ecosystem Navigation */}
      <Tabs
        value={mainTab}
        onValueChange={(v) => setMainTab(v as typeof mainTab)}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 md:grid-cols-5 h-auto p-1 bg-muted/60 rounded-xl gap-1">
          <TabsTrigger
            value="humanity_first"
            onClick={() => setMainTab("humanity_first")}
            className="text-xs py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-xs gap-1.5"
          >
            <Globe2 className="h-4 w-4 text-emerald-600" />
            <span>{isAr ? "منظومات الإنسانية (10)" : "Humanity First (10)"}</span>
          </TabsTrigger>

          <TabsTrigger
            value="knowledge_gift"
            onClick={() => setMainTab("knowledge_gift")}
            className="text-xs py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-xs gap-1.5"
          >
            <Gift className="h-4 w-4 text-indigo-600" />
            <span>{isAr ? "هدية العلم (8 خطوات)" : "Knowledge Gift"}</span>
          </TabsTrigger>

          <TabsTrigger
            value="accessibility"
            onClick={() => setMainTab("accessibility")}
            className="text-xs py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-xs gap-1.5"
          >
            <Accessibility className="h-4 w-4 text-sky-600" />
            <span>{isAr ? "استوديو الوصول الميسر" : "Accessibility Studio"}</span>
          </TabsTrigger>

          <TabsTrigger
            value="registry"
            onClick={() => setMainTab("registry")}
            className="text-xs py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-xs gap-1.5"
          >
            <Library className="h-4 w-4 text-purple-600" />
            <span>{isAr ? "سجل النفع العام (الـ 11)" : "Universal Registry (11th)"}</span>
          </TabsTrigger>

          <TabsTrigger
            value="character"
            onClick={() => setMainTab("character")}
            className="text-xs py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-xs gap-1.5"
          >
            <Heart className="h-4 w-4 text-rose-500" />
            <span>{isAr ? "مكارم الأخلاق والإخلاص" : "Good Character"}</span>
          </TabsTrigger>
        </TabsList>

        {/* 1. Humanity First (The 10 Systems) */}
        <TabsContent value="humanity_first" className="space-y-6 pt-4">
          {/* Subsystem Switcher Buttons */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
            {[
              {
                key: "health",
                labelEn: "1. Health Awareness",
                labelAr: "1. الوعي الصحي",
                icon: Stethoscope,
              },
              {
                key: "truth",
                labelEn: "2. Truth Defender",
                labelAr: "2. حامي الحقيقة",
                icon: ShieldCheck,
              },
              { key: "earth", labelEn: "3. Earth Care", labelAr: "3. رعاية الأرض", icon: Leaf },
              {
                key: "digital",
                labelEn: "4. Digital Safety",
                labelAr: "4. الأمان الرقمي",
                icon: Lock,
              },
              {
                key: "community",
                labelEn: "5. Community Map",
                labelAr: "5. المراكز المجتمعية",
                icon: Building2,
              },
              {
                key: "lifesaving",
                labelEn: "6. Life-Saving",
                labelAr: "6. إنقاذ الحياة (112)",
                icon: PhoneCall,
              },
              { key: "tools", labelEn: "7. Open Tools", labelAr: "7. أدوات مفتوحة", icon: Wrench },
              {
                key: "family",
                labelEn: "8. Family Vault",
                labelAr: "8. خزانة العائلة",
                icon: Users,
              },
              {
                key: "help",
                labelEn: "9. Verified Help",
                labelAr: "9. التطوع الموثق",
                icon: HandHeart,
              },
              {
                key: "wisdom",
                labelEn: "10. Human Wisdom",
                labelAr: "10. أرشيف الحكمة",
                icon: Sparkles,
              },
            ].map((sub) => {
              const isSelected = humanitySubsystem === sub.key;
              const Icon = sub.icon;
              return (
                <Button
                  key={sub.key}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => setHumanitySubsystem(sub.key as typeof humanitySubsystem)}
                  className="text-xs whitespace-nowrap gap-1.5 h-8 shrink-0"
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{isAr ? sub.labelAr : sub.labelEn}</span>
                </Button>
              );
            })}
          </div>

          {/* Subsystem Panels */}
          {humanitySubsystem === "health" && <HealthAwarenessPanel />}
          {humanitySubsystem === "truth" && <TruthDefenderPanel />}
          {humanitySubsystem === "earth" && <EarthCareIncubatorPanel />}
          {humanitySubsystem === "digital" && <DigitalSafetyPanel />}
          {humanitySubsystem === "community" && <CommunityResourceMapPanel />}
          {humanitySubsystem === "lifesaving" && <LifeSavingAwarenessPanel />}
          {humanitySubsystem === "tools" && <OpenToolsForGoodPanel />}
          {humanitySubsystem === "family" && <FamilyKnowledgeLegacyPanel />}
          {humanitySubsystem === "help" && <VerifiedHelpNetworkPanel />}
          {humanitySubsystem === "wisdom" && <HumanWisdomArchivePanel />}
        </TabsContent>

        {/* 2. One Person, One Knowledge Gift System */}
        <TabsContent value="knowledge_gift" className="space-y-6 pt-4">
          <Card className="border shadow-xs">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Gift className="h-5 w-5 text-indigo-600" />
                    {isAr
                      ? "مبادرة: إنسان واحد، هدية معرفية واحدة"
                      : "The One Person, One Knowledge Gift Initiative"}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {isAr
                      ? "دليل تفاعلي من 8 خطوات لمساعدة كل متعلم على تحويل فهمه لأي درس إلى مرجع تعليمي مبسط وموثق المصادر، وإيداعه في المكتبة العامة للنفع الدائم."
                      : "A guided 8-step wizard enabling students and educators to transform their mastered topics into high-clarity, verified open learning gifts deposited into the Universal Registry."}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-xs">
                  8-Step Creation Flow
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <KnowledgeGiftWizard />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. Accessibility Mission Studio */}
        <TabsContent value="accessibility" className="space-y-6 pt-4">
          <AccessibilityImprovementStudio />
        </TabsContent>

        {/* 4. Universal Benefit Resource Registry */}
        <TabsContent value="registry" className="space-y-6 pt-4">
          <BenefitContinuityRegistryPanel />
        </TabsContent>

        {/* 5. Good Character Companion */}
        <TabsContent value="character" className="space-y-6 pt-4">
          <GoodCharacterCompanionPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
