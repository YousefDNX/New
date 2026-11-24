import { useState, useEffect } from "react";
import {
  Accessibility,
  Volume2,
  VolumeX,
  FileText,
  Image as ImageIcon,
  Sparkles,
  CheckCircle2,
  Copy,
  Upload,
  BookOpen,
  ArrowRight,
  ListOrdered,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStudentEcosystem } from "@/lib/student-ecosystem";
import { usePrefs } from "@/lib/preferences";
import type { UniversalBenefitResource } from "@/data/humanity-first";

export function AccessibilityImprovementStudio({
  onPublishResource,
}: {
  onPublishResource?: (res: UniversalBenefitResource) => void;
}) {
  const { lang } = usePrefs();
  const isAr = lang === "ar";
  const { update: updateEco } = useStudentEcosystem();

  const [activeMode, setActiveMode] = useState<"audio" | "alt_text" | "simplify" | "semantic">(
    "audio",
  );

  // 1. Audio Adaptation Mode State
  const [sourceNote, setSourceNote] = useState(
    "Mitosis stages: Prophase (chromatin condenses -> visible chromosomes, nuclear env breaks down), Metaphase (chromosomes line up @ equatorial plate, spindle fibers attach to kinetochores), Anaphase (sister chromatids pulled apart to opposite poles), Telophase (nuclei reform, cytokinesis starts).",
  );
  const [audioFriendlyText, setAudioFriendlyText] = useState(
    "Let us explore the four stages of cell division known as mitosis. First, during prophase, the genetic material inside the cell condenses into clearly visible chromosomes, and the protective nuclear envelope begins to break down. Second, during metaphase, these chromosomes align neatly across the middle of the cell, while spindle fibers attach to their centers. Third, during anaphase, the chromosome copies are gently pulled apart toward opposite sides of the cell. Finally, during telophase, new nuclear envelopes form around each set of chromosomes, and the cell prepares to divide into two identical daughter cells.",
  );
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Web Speech API synthesis
  const handleToggleSpeech = () => {
    if (!window.speechSynthesis) {
      toast.error(
        isAr ? "المتصفح لا يدعم القراءة الصوتية" : "Speech synthesis not supported on this browser",
      );
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(audioFriendlyText);
    utterance.lang = isAr ? "ar-SA" : "en-US";
    utterance.rate = 0.95;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // 2. Diagram Alt-Text Generator State
  const [diagramTitle, setDiagramTitle] = useState("Water Cycle Diagram");
  const [diagramDescription, setDiagramDescription] = useState(
    "A circular educational graphic with arrows depicting evaporation from the ocean, condensation into clouds, precipitation falling over mountains, and surface runoff returning to the sea.",
  );
  const [diagramKeyTakeaway, setDiagramKeyTakeaway] = useState(
    "Water continuously moves through physical states (liquid, vapor, ice) powered by solar thermal energy and gravity.",
  );
  const [diagramTableFallback, setDiagramTableFallback] = useState(
    "Phase 1: Evaporation (liquid to vapor via sunlight). Phase 2: Condensation (cooling vapor creates clouds). Phase 3: Precipitation (rain/snow). Phase 4: Collection (rivers return water to oceans).",
  );

  // 3. Simplified Reading State
  const [rawAcademicText, setRawAcademicText] = useState(
    "The macroeconomic ramifications of severe hyperinflationary episodes frequently precipitate an unprecedented erosion of domestic purchasing power, consequently precipitating severe logistical supply-chain bottlenecks and general economic stagnation.",
  );
  const [plainReadingText, setPlainReadingText] = useState(
    "When prices rise too rapidly (hyperinflation), money quickly loses its purchasing power. Families find it hard to buy basic goods, businesses struggle to stock shelves, and the entire economy slows down.",
  );

  // 4. Semantic Structure Formatter State
  const [unstructuredNotes, setUnstructuredNotes] = useState(
    "Renewable energy types solar energy uses photovoltaic panels wind energy uses turbines on land or offshore geothermal uses heat from deep in the earth advantages clean no carbon emissions disadvantages weather dependent upfront installation costs.",
  );
  const [semanticFormattedText, setSemanticFormattedText] = useState(
    `# Understanding Renewable Energy Sources

## Major Types
1. **Solar Energy**: Captures sunlight using photovoltaic silicon panels.
2. **Wind Energy**: Uses wind turbines positioned onshore or offshore.
3. **Geothermal Energy**: Harnesses natural thermal heat from deep beneath the Earth's crust.

## Key Advantages
- **Clean**: Produces zero greenhouse gas emissions during power generation.
- **Abundant**: Energy sources replenish naturally.

## Key Challenges
- **Intermittency**: Output fluctuates depending on sunlight and weather conditions.
- **Initial Cost**: Requires capital investment for equipment and grid storage batteries.`,
  );

  // Save to Universal Benefit Resource Registry
  const handleSaveToRegistry = () => {
    const resource: UniversalBenefitResource = {
      id: `ubr_acc_${Date.now()}`,
      title: `${diagramTitle || "Accessible Study Guide"} (Adapted Material)`,
      titleAr: isAr ? "دليل دراسي ميسر لأصحاب الهمم" : "Accessible Study Guide",
      systemKind: "educational_gift",
      lifecycleState: "published",
      creatorName: "NEXORA Accessibility Improvement Studio",
      creatorRole: "specialist",
      originalSource: "Curated Open Curriculum Adaptation",
      license: "CC-BY-4.0",
      publicationDate: new Date().toISOString().split("T")[0] || "2026-11-19",
      lastReviewedDate: new Date().toISOString().split("T")[0] || "2026-11-19",
      reviewIntervalDays: 180,
      version: 1,
      maintenanceStatus: "healthy",
      accessibilityStatus: {
        hasAudio: true,
        hasScreenReaderFormatted: true,
        hasSimplifiedText: true,
        hasDiagramAltText: true,
        hasCaptions: true,
      },
      languagesAvailable: ["en", "ar"],
      pendingCorrectionCount: 0,
      knownLimitations: [],
      contentSummary:
        "Material adapted with high-contrast semantics, audio-first flow, and complete alt-text.",
      fullContent: `${audioFriendlyText}\n\n---\n### Accessible Visual Description\n${diagramDescription}\n\n### Semantic Layout\n${semanticFormattedText}`,
      targetAudience: "All students, visually impaired learners, and screen-reader users.",
      versionHistory: [
        {
          version: 1,
          date: new Date().toISOString().split("T")[0] || "2026-11-19",
          changeSummary: "Initial accessible multi-modal adaptation completed.",
          reviewerName: "NEXORA Accessibility Studio",
        },
      ],
      correctionReports: [],
    };

    updateEco((prev) => ({
      ...prev,
      universalBenefitResources: [resource, ...(prev.universalBenefitResources || [])],
    }));

    toast.success(
      isAr
        ? "تم حفظ المورد الميسر ونشره في السجل العام للنفع الدائم!"
        : "Accessible material published to Universal Benefit Registry!",
    );

    if (onPublishResource) {
      onPublishResource(resource);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(isAr ? "تم النسخ إلى الحافظة" : "Copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Accessibility className="h-6 w-6 text-emerald-600" />
            <h2 className="text-xl font-bold tracking-tight">
              {isAr
                ? "استوديو تحسين إمكانية الوصول وتكييف المناهج"
                : "Accessibility Mission & Adaptation Studio"}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {isAr
              ? "تحويل المحتوى الأكاديمي إلى نصوص صديقة للقراءة الصوتية، كتابة الأوصاف البديلة للرسوم (Alt-Text)، وتبسيط القراءة"
              : "Transform study materials into audio-friendly prose, comprehensive diagram alt-text, and screen-reader semantics."}
          </p>
        </div>

        <Button
          size="sm"
          onClick={handleSaveToRegistry}
          className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Upload className="h-3.5 w-3.5" />
          {isAr ? "نشر المورد في السجل العام" : "Publish to Universal Registry"}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeMode} onValueChange={(v) => setActiveMode(v as typeof activeMode)}>
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full">
          <TabsTrigger
            value="audio"
            onClick={() => setActiveMode("audio")}
            className="text-xs gap-1.5"
          >
            <Volume2 className="h-3.5 w-3.5" />
            {isAr ? "تكييف الصوت (Audio-Friendly)" : "Audio Adaptation"}
          </TabsTrigger>
          <TabsTrigger
            value="alt_text"
            onClick={() => setActiveMode("alt_text")}
            className="text-xs gap-1.5"
          >
            <ImageIcon className="h-3.5 w-3.5" />
            {isAr ? "وصف الرسوم والخرائط (Alt-Text)" : "Diagram Alt-Text"}
          </TabsTrigger>
          <TabsTrigger
            value="simplify"
            onClick={() => setActiveMode("simplify")}
            className="text-xs gap-1.5"
          >
            <FileText className="h-3.5 w-3.5" />
            {isAr ? "مستويات القراءة المبسطة" : "Reading Simplifier"}
          </TabsTrigger>
          <TabsTrigger
            value="semantic"
            onClick={() => setActiveMode("semantic")}
            className="text-xs gap-1.5"
          >
            <ListOrdered className="h-3.5 w-3.5" />
            {isAr ? "الهيكلة الدلالية (قارئات الشاشة)" : "Semantic Structure"}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Mode 1: Audio Adaptation */}
      {activeMode === "audio" && (
        <Card className="border shadow-xs">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-primary" />
                  {isAr
                    ? "محول الملاحظات إلى نص ملائم للاستماع الصوتي"
                    : "Audio-Friendly Text Adapter"}
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  {isAr
                    ? "الرموز والأسهم والاختصارات يصعب سماعها عبر قارئ الشاشة. حولها إلى جمل مترابطة تتدفق بسلاسة في الأذن."
                    : "Arrows, abbreviations, and bullet fragments sound disjointed when read aloud. Convert them into natural conversational prose."}
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant={isPlayingAudio ? "destructive" : "default"}
                onClick={handleToggleSpeech}
                className="text-xs gap-1.5"
              >
                {isPlayingAudio ? (
                  <>
                    <VolumeX className="h-3.5 w-3.5" />
                    {isAr ? "إيقاف القراءة" : "Stop Audio"}
                  </>
                ) : (
                  <>
                    <Volume2 className="h-3.5 w-3.5" />
                    {isAr ? "استمع للمعاينة الصوتية" : "Listen Preview"}
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  {isAr
                    ? "الملاحظات الأصلية (مليئة بالأسهم والرموز):"
                    : "Original Visual Notes (Bullet & Arrow heavy):"}
                </Label>
                <Textarea
                  rows={6}
                  value={sourceNote}
                  onChange={(e) => setSourceNote(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-emerald-600">
                    {isAr
                      ? "الصياغة السردية الصديقة للاستماع:"
                      : "Audio-Adapted Natural Narrative:"}
                  </Label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(audioFriendlyText)}
                    className="h-6 text-[10px] gap-1 px-2"
                  >
                    <Copy className="h-3 w-3" />
                    {isAr ? "نسخ" : "Copy"}
                  </Button>
                </div>
                <Textarea
                  rows={6}
                  value={audioFriendlyText}
                  onChange={(e) => setAudioFriendlyText(e.target.value)}
                  className="text-xs leading-relaxed"
                />
              </div>
            </div>

            <div className="p-3 rounded-lg border bg-muted/30 text-xs text-muted-foreground flex items-center justify-between">
              <span>
                {isAr
                  ? "نصيحة للميسرين: استبدل الرموز (->) بكلمات مثل (يؤدي إلى)، واشرح الاختصارات مثل (e.g.) بكلمة (على سبيل المثال)."
                  : "Accessibility Tip: Expand shorthand (e.g., i.e., ->) into natural spoken words ('such as', 'leading to') for auditory clarity."}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mode 2: Diagram Alt-Text */}
      {activeMode === "alt_text" && (
        <Card className="border shadow-xs">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-primary" />
              {isAr
                ? "منشئ الوصف البديل للرسوم والمخططات (Alt-Text Studio)"
                : "Diagram Alt-Text & Data Table Studio"}
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              {isAr
                ? "المكفوفون وضعاف البصر يحتاجون وصفاً دقيقاً لما تحتويه الصورة من بيانات، وليس مجرد عنوان عابر."
                : "Help visually impaired learners understand educational charts with concise functional descriptions, trends, and tabular fallbacks."}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {isAr ? "عنوان الرسم التوضيحي" : "Graphic Title"}
              </Label>
              <Input
                value={diagramTitle}
                onChange={(e) => setDiagramTitle(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {isAr
                  ? "1. الوصف الوظيفي الموجز (Concise Functional Alt-Text - 1-2 sentences):"
                  : "1. Concise Functional Alt-Text (1-2 sentences):"}
              </Label>
              <Textarea
                rows={2}
                value={diagramDescription}
                onChange={(e) => setDiagramDescription(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {isAr
                  ? "2. الرسالة أو الاتجاه الأساسي في الرسم (Key Educational Takeaway):"
                  : "2. Core Trend / Insight Conveyed by the Diagram:"}
              </Label>
              <Input
                value={diagramKeyTakeaway}
                onChange={(e) => setDiagramKeyTakeaway(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {isAr
                  ? "3. البديل الجدولي المفصل لقارئات الشاشة (Data Table Fallback):"
                  : "3. Detailed Text Table Equivalent for Screen Readers:"}
              </Label>
              <Textarea
                rows={3}
                value={diagramTableFallback}
                onChange={(e) => setDiagramTableFallback(e.target.value)}
                className="text-xs font-mono"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mode 3: Simplified Reading */}
      {activeMode === "simplify" && (
        <Card className="border shadow-xs">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              {isAr
                ? "تكييف النص لمستويات القراءة الميسرة (Plain Language)"
                : "Plain Language & Reading Level Converter"}
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              {isAr
                ? "إعادة صياغة المصطلحات المعقدة دون الإخلال بالمحتوى العلمي لتمكين الطلبة الذين يواجهون صعوبات تعلم أو حواجز لغوية."
                : "Transform dense multi-clause academic syntax into active, accessible language without sacrificing factual precision."}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  {isAr ? "النص الأكاديمي الصعب:" : "Dense Academic Text:"}
                </Label>
                <Textarea
                  rows={5}
                  value={rawAcademicText}
                  onChange={(e) => setRawAcademicText(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-emerald-600">
                    {isAr ? "الصياغة الميسرة المبسطة:" : "Clear Plain-Language Adaptation:"}
                  </Label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(plainReadingText)}
                    className="h-6 text-[10px] gap-1 px-2"
                  >
                    <Copy className="h-3 w-3" />
                    {isAr ? "نسخ" : "Copy"}
                  </Button>
                </div>
                <Textarea
                  rows={5}
                  value={plainReadingText}
                  onChange={(e) => setPlainReadingText(e.target.value)}
                  className="text-xs leading-relaxed"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mode 4: Semantic Structure Formatter */}
      {activeMode === "semantic" && (
        <Card className="border shadow-xs">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <ListOrdered className="h-4 w-4 text-primary" />
              {isAr
                ? "الهيكلة الدلالية لقارئات الشاشة (Semantic HTML / Markdown)"
                : "Semantic Screen-Reader Structuring"}
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              {isAr
                ? "قارئات الشاشة تعتمد على العناوين الهرمية (#، ##) والقوائم المرتبة لتمكين الكفيف من القفز بين الأقسام بسهولة."
                : "Organize unformatted text blocks into proper hierarchical headings, ordered lists, and summary takeaways."}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  {isAr ? "الملاحظات غير المرتبة:" : "Unstructured Text Block:"}
                </Label>
                <Textarea
                  rows={7}
                  value={unstructuredNotes}
                  onChange={(e) => setUnstructuredNotes(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-primary">
                    {isAr
                      ? "الهيكل الدلالي المنسق (#، ##، قوائم):"
                      : "Semantic Markdown Structure:"}
                  </Label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(semanticFormattedText)}
                    className="h-6 text-[10px] gap-1 px-2"
                  >
                    <Copy className="h-3 w-3" />
                    {isAr ? "نسخ" : "Copy"}
                  </Button>
                </div>
                <Textarea
                  rows={7}
                  value={semanticFormattedText}
                  onChange={(e) => setSemanticFormattedText(e.target.value)}
                  className="text-xs font-mono leading-relaxed"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
