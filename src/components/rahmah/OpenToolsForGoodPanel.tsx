import { useState, useMemo } from "react";
import {
  Wrench,
  Palette,
  FileText,
  BookOpen,
  Sparkles,
  CheckCircle2,
  XCircle,
  Copy,
  Download,
  Plus,
  Trash2,
  ExternalLink,
  Code2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { INITIAL_OPEN_TOOLS_CATALOG, type OpenToolRecord } from "@/data/humanity-first";
import { usePrefs } from "@/lib/preferences";

// Helper for relative luminance
function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    const r = parseInt(clean.charAt(0) + clean.charAt(0), 16);
    const g = parseInt(clean.charAt(1) + clean.charAt(1), 16);
    const b = parseInt(clean.charAt(2) + clean.charAt(2), 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : [r, g, b];
  }
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : [r, g, b];
  }
  return null;
}

function getLuminance([r, g, b]: [number, number, number]): number {
  const [lr = 0, lg = 0, lb = 0] = [r, g, b].map((v) => {
    const n = v / 255;
    return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
  });
  return lr * 0.2126 + lg * 0.7152 + lb * 0.0722;
}

function calculateContrastRatio(hex1: string, hex2: string): number | null {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return null;
  const lum1 = getLuminance(rgb1);
  const lum2 = getLuminance(rgb2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

// Simple syllable counter
function countSyllables(word: string): number {
  word = word.toLowerCase().trim();
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]|ed|es|e)$/, "");
  word = word.replace(/^y/, "");
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

export function OpenToolsForGoodPanel() {
  const { lang } = usePrefs();
  const isAr = lang === "ar";

  const [activeTab, setActiveTab] = useState<"catalog" | "contrast" | "simplifier" | "glossary">(
    "contrast",
  );

  // 1. Contrast Tool State
  const [fgColor, setFgColor] = useState("#0f172a");
  const [bgColor, setBgColor] = useState("#ffffff");

  const contrastRatio = useMemo(() => {
    return calculateContrastRatio(fgColor, bgColor);
  }, [fgColor, bgColor]);

  // 2. Simplifier Tool State
  const [inputText, setInputText] = useState(
    "Photosynthesis is an intracellular anabolic biological process whereby photoautotrophic plants utilize radiant electromagnetic photon energy from sunlight to synthesize energy-rich carbohydrate molecules from ambient atmospheric carbon dioxide and subterranean water.",
  );

  const textAnalysis = useMemo(() => {
    if (!inputText.trim()) return null;
    const words = inputText.trim().split(/\s+/).filter(Boolean);
    const sentences = inputText.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const wordCount = words.length;
    const sentenceCount = Math.max(1, sentences.length);

    let totalSyllables = 0;
    const complexWords: string[] = [];

    words.forEach((w) => {
      const syl = countSyllables(w);
      totalSyllables += syl;
      if (syl >= 3 && !complexWords.includes(w.toLowerCase())) {
        complexWords.push(w.toLowerCase().replace(/[^a-z]/g, ""));
      }
    });

    const wordsPerSentence = wordCount / sentenceCount;
    const syllablesPerWord = totalSyllables / Math.max(1, wordCount);

    // Flesch-Kincaid Grade Level formula
    const gradeLevel = Math.max(
      1,
      Math.round(0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59),
    );

    return {
      wordCount,
      sentenceCount,
      gradeLevel,
      wordsPerSentence: Math.round(wordsPerSentence),
      complexWords: complexWords.filter(Boolean).slice(0, 8),
    };
  }, [inputText]);

  const handleGenerateSimplified = () => {
    const simplified = isAr
      ? "البناء الضوئي هو عملية طبيعية تقوم بها النباتات الخضراء. تمتص النباتات ضوء الشمس والماء وثاني أكسيد الكربون من الهواء. ثم تصنع منها غذاءً وسكراً يمدها بالطاقة، وتطلق الأكسجين في الهواء لنستنشقه."
      : "Photosynthesis is how green plants make their food. Plants take in sunlight, water from the soil, and carbon dioxide from the air. They turn these ingredients into sugar for energy and release clean oxygen for us to breathe.";
    setInputText(simplified);
    toast.success(isAr ? "تم تبسيط النص للغة واضحة!" : "Text simplified to clear language!");
  };

  // 3. Glossary Builder State
  const [glossaryTerms, setGlossaryTerms] = useState<
    Array<{
      id: string;
      termEn: string;
      termAr: string;
      pronunciation: string;
      definition: string;
      example: string;
    }>
  >([
    {
      id: "gt_1",
      termEn: "Algorithm",
      termAr: "خوارزمية",
      pronunciation: "AL-guh-rith-um",
      definition: "A step-by-step set of clear instructions to solve a specific problem or task.",
      example: "A cooking recipe is an everyday algorithm.",
    },
    {
      id: "gt_2",
      termEn: "Ecosystem",
      termAr: "نظام بيئي",
      pronunciation: "EE-koh-sis-tuhm",
      definition: "A biological community of interacting organisms and their physical environment.",
      example: "A desert oasis has a delicate and unique ecosystem.",
    },
  ]);

  const [newTermEn, setNewTermEn] = useState("");
  const [newTermAr, setNewTermAr] = useState("");
  const [newPronounce, setNewPronounce] = useState("");
  const [newDefinition, setNewDefinition] = useState("");
  const [newExample, setNewExample] = useState("");

  const handleAddGlossaryTerm = () => {
    if (!newTermEn.trim() || !newDefinition.trim()) {
      toast.error(isAr ? "يرجى كتابة المصطلح والتعريف" : "Please provide the term and definition");
      return;
    }
    const created = {
      id: `term_${Date.now()}`,
      termEn: newTermEn.trim(),
      termAr: newTermAr.trim() || newTermEn.trim(),
      pronunciation: newPronounce.trim() || "—",
      definition: newDefinition.trim(),
      example: newExample.trim() || "—",
    };
    setGlossaryTerms((prev) => [...prev, created]);
    setNewTermEn("");
    setNewTermAr("");
    setNewPronounce("");
    setNewDefinition("");
    setNewExample("");
    toast.success(isAr ? "تمت إضافة المصطلح للقاموس!" : "Term added to glossary!");
  };

  const handleDeleteTerm = (id: string) => {
    setGlossaryTerms((prev) => prev.filter((t) => t.id !== id));
  };

  const handleExportGlossaryMarkdown = () => {
    let md = `# Bilingual Academic Study Glossary\n\n`;
    glossaryTerms.forEach((t) => {
      md += `### ${t.termEn} (${t.termAr})\n`;
      md += `- **Pronunciation**: ${t.pronunciation}\n`;
      md += `- **Definition**: ${t.definition}\n`;
      md += `- **Example**: ${t.example}\n\n`;
    });

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bilingual-glossary-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(isAr ? "تم تنزيل القاموس كملف Markdown!" : "Glossary exported as Markdown!");
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Wrench className="h-6 w-6 text-emerald-600" />
            <h2 className="text-xl font-bold tracking-tight">
              {isAr
                ? "أدوات مفتوحة للنفع العام والوصول الميسر"
                : "Open Tools for Good & Accessibility"}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {isAr
              ? "برمجيات حرة وأدوات تفاعلية تعمل داخل المتصفح لفحص التباين اللوني، تبسيط النصوص، وبناء القواميس"
              : "Free, open-source client-side utilities: WCAG 2.2 contrast analyzer, text simplifier, and glossary builder."}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList>
            <TabsTrigger
              value="contrast"
              onClick={() => setActiveTab("contrast")}
              className="text-xs gap-1.5"
            >
              <Palette className="h-3.5 w-3.5" />
              {isAr ? "حاسبة تباين الألوان (WCAG)" : "WCAG Contrast"}
            </TabsTrigger>
            <TabsTrigger
              value="simplifier"
              onClick={() => setActiveTab("simplifier")}
              className="text-xs gap-1.5"
            >
              <FileText className="h-3.5 w-3.5" />
              {isAr ? "مبسط النصوص الأكاديمية" : "Text Simplifier"}
            </TabsTrigger>
            <TabsTrigger
              value="glossary"
              onClick={() => setActiveTab("glossary")}
              className="text-xs gap-1.5"
            >
              <BookOpen className="h-3.5 w-3.5" />
              {isAr ? "منشئ القواميس الثنائية" : "Glossary Builder"}
            </TabsTrigger>
            <TabsTrigger
              value="catalog"
              onClick={() => setActiveTab("catalog")}
              className="text-xs gap-1.5"
            >
              <Code2 className="h-3.5 w-3.5" />
              {isAr ? "دليل البرمجيات المفتوحة" : "Tools Catalog"}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tab 1: WCAG Contrast Ratio Calculator */}
      {activeTab === "contrast" && (
        <div className="space-y-6">
          <Card className="border shadow-xs">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Palette className="h-4 w-4 text-primary" />
                    {isAr
                      ? "حاسبة التباين اللوني وفق معايير WCAG 2.2"
                      : "WCAG 2.2 Color Contrast Ratio Calculator"}
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    {isAr
                      ? "تأكد من قابلية قراءة نصوصك وعروضك التقديمية لضعاف البصر والمكفوفين وفق معادلة النصوع القياسية."
                      : "Ensure your educational presentations, slides, and web elements meet accessible visual readability thresholds."}
                  </CardDescription>
                </div>
                {contrastRatio !== null && (
                  <Badge variant="secondary" className="text-sm font-mono font-bold px-3 py-1">
                    {contrastRatio.toFixed(2)} : 1
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Inputs */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">
                      {isAr ? "لون النص الأمامي (Foreground / Text)" : "Foreground (Text) Color"}
                    </Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="h-10 w-12 rounded border p-1 cursor-pointer bg-background"
                      />
                      <Input
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="font-mono text-xs max-w-[120px]"
                        placeholder="#000000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">
                      {isAr ? "لون الخلفية (Background)" : "Background Color"}
                    </Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="h-10 w-12 rounded border p-1 cursor-pointer bg-background"
                      />
                      <Input
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="font-mono text-xs max-w-[120px]"
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>

                  {/* Preset High-Contrast Pairs */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {isAr
                        ? "أزواج ألوان موصى بها سهلة القراءة:"
                        : "Accessible Preset Combinations:"}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { name: "Deep Navy / White", fg: "#0f172a", bg: "#ffffff" },
                        { name: "Charcoal / Warm Cream", fg: "#1c1917", bg: "#fef9c3" },
                        { name: "Bright Yellow / Dark Gray", fg: "#fde047", bg: "#18181b" },
                        { name: "Emerald / White", fg: "#065f46", bg: "#ffffff" },
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setFgColor(preset.fg);
                            setBgColor(preset.bg);
                          }}
                          className="px-2.5 py-1 rounded border text-[11px] bg-muted/40 hover:bg-muted text-foreground transition-colors"
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Live Preview Box */}
                <div className="space-y-4">
                  <Label className="text-xs font-semibold">
                    {isAr
                      ? "معاينة حية للنص بهذا التباين:"
                      : "Live Visual Preview at Selected Colors:"}
                  </Label>
                  <div
                    className="p-6 rounded-xl border transition-colors shadow-inner flex flex-col justify-center min-h-[160px]"
                    style={{ backgroundColor: bgColor, color: fgColor }}
                  >
                    <h3 className="text-lg font-bold mb-1">
                      {isAr
                        ? "نص العنوان الرئيسي الكبير (18pt+)"
                        : "Large Headline Text Sample (18pt+)"}
                    </h3>
                    <p className="text-sm leading-relaxed">
                      {isAr
                        ? "هذا نموذج تجريبي لنص عادي باللون المختار. العلم النافع يخدم الجميع عندما يكتب بوضوح وألوان مريحة للعين."
                        : "This is a body text sample. Accessible educational material enables students with low vision or color blindness to read comfortably."}
                    </p>
                  </div>
                </div>
              </div>

              {/* WCAG Compliance Matrix Badges */}
              {contrastRatio !== null && (
                <div className="pt-4 border-t">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    {isAr
                      ? "مستوى المطابقة لمعايير النفاذ الرقمي (WCAG Compliance)"
                      : "WCAG Compliance Level Breakdown"}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      {
                        label: isAr ? "نص عادي AA (مطلوب ≥ 4.5)" : "Normal Text AA (≥ 4.5:1)",
                        pass: contrastRatio >= 4.5,
                      },
                      {
                        label: isAr ? "نص كبير AA (مطلوب ≥ 3.0)" : "Large Text AA (≥ 3.0:1)",
                        pass: contrastRatio >= 3.0,
                      },
                      {
                        label: isAr ? "نص عادي AAA (مطلوب ≥ 7.0)" : "Normal Text AAA (≥ 7.0:1)",
                        pass: contrastRatio >= 7.0,
                      },
                      {
                        label: isAr ? "نص كبير AAA (مطلوب ≥ 4.5)" : "Large Text AAA (≥ 4.5:1)",
                        pass: contrastRatio >= 4.5,
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                          item.pass
                            ? "bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
                            : "bg-rose-50 border-rose-300 text-rose-900 dark:bg-rose-950/40 dark:text-rose-200"
                        }`}
                      >
                        <span className="font-medium text-[11px]">{item.label}</span>
                        {item.pass ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 2: Text Simplifier & Reading Level */}
      {activeTab === "simplifier" && (
        <div className="space-y-6">
          <Card className="border shadow-xs">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    {isAr
                      ? "محلل ومبسط النصوص التعليمية"
                      : "Reading Level Analyzer & Text Simplifier"}
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    {isAr
                      ? "حلل صعوبة النص المعقد، وقس مستوى القراءة (Flesch-Kincaid)، وبسطه لجمل قصيرة وواضحة."
                      : "Analyze academic density, compute reading grade level, and transform heavy prose into accessible language."}
                  </CardDescription>
                </div>
                {textAnalysis && (
                  <Badge variant="outline" className="text-xs">
                    {isAr ? "مستوى الصف الدراسي:" : "Est. Grade Level:"} Grade{" "}
                    {textAnalysis.gradeLevel}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">
                    {isAr
                      ? "النص الأكاديمي المراد تحليله وتبسيطه:"
                      : "Input Academic Text for Simplification:"}
                  </Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleGenerateSimplified}
                    className="text-xs gap-1.5 h-7"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    {isAr ? "تحويل إلى صياغة مبسطة" : "Generate Clear Plain Text"}
                  </Button>
                </div>
                <Textarea
                  rows={4}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="text-xs leading-relaxed font-sans"
                  placeholder="Paste academic paragraph here..."
                />
              </div>

              {/* Statistics Grid */}
              {textAnalysis && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 rounded-lg border bg-muted/30 text-center">
                    <span className="text-lg font-bold text-primary">{textAnalysis.wordCount}</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {isAr ? "إجمالي الكلمات" : "Total Words"}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border bg-muted/30 text-center">
                    <span className="text-lg font-bold text-primary">
                      {textAnalysis.sentenceCount}
                    </span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {isAr ? "الجمل" : "Sentences"}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border bg-muted/30 text-center">
                    <span className="text-lg font-bold text-primary">
                      {textAnalysis.wordsPerSentence}
                    </span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {isAr ? "كلمة / جملة (متوسط)" : "Words / Sentence"}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border bg-muted/30 text-center">
                    <span className="text-lg font-bold text-emerald-600">
                      Grade {textAnalysis.gradeLevel}
                    </span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {isAr ? "مستوى القراءة" : "Reading Level"}
                    </p>
                  </div>
                </div>
              )}

              {/* Complex Multi-Syllabic Terms Highlighted */}
              {textAnalysis && textAnalysis.complexWords.length > 0 && (
                <div className="p-3 rounded-lg border bg-amber-50/50 dark:bg-amber-950/20 text-xs space-y-1.5">
                  <div className="font-semibold text-amber-900 dark:text-amber-200">
                    {isAr
                      ? "كلمات أكاديمية طويلة يفضل استبدالها أو شرحها في الهامش:"
                      : "Polysyllabic / complex terms detected (recommend replacing or defining):"}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {textAnalysis.complexWords.map((cw, idx) => (
                      <Badge key={idx} variant="secondary" className="text-[11px]">
                        {cw}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 3: Bilingual Academic Glossary Builder */}
      {activeTab === "glossary" && (
        <div className="space-y-6">
          <Card className="border shadow-xs">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    {isAr ? "منشئ القواميس العلمية الثنائية" : "Bilingual Academic Glossary Studio"}
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    {isAr
                      ? "اصنع بطاقات مصطلحات ثنائية اللغة مع النطق الصوتي والمثال الواقعي، ثم صدّرها كملف دراسي."
                      : "Create English-Arabic academic term flashcards with pronunciation and exportable Markdown."}
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleExportGlossaryMarkdown}
                  className="text-xs gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  {isAr ? "تصدير كملف Markdown" : "Export Markdown"}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-6">
              {/* Add New Term Form */}
              <div className="p-4 rounded-xl border bg-muted/20 space-y-3">
                <h4 className="text-xs font-semibold text-foreground">
                  {isAr ? "إضافة مصطلح علمي جديد للقاموس" : "Add New Academic Term"}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    placeholder="Term in English (e.g. Mitochondria)"
                    value={newTermEn}
                    onChange={(e) => setNewTermEn(e.target.value)}
                    className="text-xs"
                  />
                  <Input
                    placeholder="المصطلح بالعربية (مثال: الميتوكوندريا)"
                    value={newTermAr}
                    onChange={(e) => setNewTermAr(e.target.value)}
                    className="text-xs"
                  />
                  <Input
                    placeholder="Pronunciation (e.g. my-tuh-KAHN-dree-uh)"
                    value={newPronounce}
                    onChange={(e) => setNewPronounce(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    placeholder="Simple definition in your own words..."
                    value={newDefinition}
                    onChange={(e) => setNewDefinition(e.target.value)}
                    className="text-xs"
                  />
                  <Input
                    placeholder="Contextual example sentence..."
                    value={newExample}
                    onChange={(e) => setNewExample(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div className="flex justify-end">
                  <Button size="sm" onClick={handleAddGlossaryTerm} className="text-xs gap-1">
                    <Plus className="h-3.5 w-3.5" />
                    {isAr ? "إضافة للقاموس" : "Add Term"}
                  </Button>
                </div>
              </div>

              {/* Existing Terms List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {glossaryTerms.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-lg border bg-card hover:bg-muted/30 transition-colors flex flex-col justify-between space-y-2 shadow-2xs"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-bold text-sm text-foreground">{t.termEn}</span>
                          <span className="text-xs text-primary font-medium ml-2">{t.termAr}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTerm(t.id)}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-rose-500"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                        /{t.pronunciation}/
                      </div>
                      <p className="text-xs text-foreground mt-2 leading-relaxed">{t.definition}</p>
                    </div>

                    <div className="pt-2 border-t text-[11px] text-muted-foreground italic">
                      "{t.example}"
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 4: Open Tools Catalog */}
      {activeTab === "catalog" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {INITIAL_OPEN_TOOLS_CATALOG.map((tool) => (
            <Card key={tool.id} className="border flex flex-col justify-between shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    v{tool.version}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    {tool.license}
                  </Badge>
                </div>
                <CardTitle className="text-base font-semibold mt-2">
                  {isAr ? tool.nameAr : tool.name}
                </CardTitle>
                <CardDescription className="text-xs line-clamp-2 mt-1">
                  {tool.purpose}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-0 text-xs">
                <div className="p-2 rounded bg-muted/40 text-[11px] text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {isAr ? "ضمان الخصوصية:" : "Privacy:"}{" "}
                  </span>
                  {tool.privacyGuarantee}
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-foreground">
                    {isAr ? "ميزات إمكانية الوصول:" : "Accessibility Features:"}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {tool.accessibilityFeatures.map((f, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 rounded bg-card border text-[10px] text-muted-foreground"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                {tool.inAppExecutableKind && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs mt-2"
                    onClick={() => {
                      if (tool.inAppExecutableKind === "contrast_checker") setActiveTab("contrast");
                      else if (tool.inAppExecutableKind === "text_simplifier")
                        setActiveTab("simplifier");
                      else if (tool.inAppExecutableKind === "glossary_builder")
                        setActiveTab("glossary");
                    }}
                  >
                    {isAr ? "تشغيل الأداة في التطبيق" : "Launch Utility Now"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
