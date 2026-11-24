import { useState, useMemo } from "react";
import {
  Heart,
  Lock,
  Users,
  BookOpen,
  PlusCircle,
  Download,
  Calendar,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  INITIAL_FAMILY_KNOWLEDGE_RECORDS,
  type FamilyKnowledgeRecord,
} from "@/data/humanity-first";
import { useStudentEcosystem } from "@/lib/student-ecosystem";
import { usePrefs } from "@/lib/preferences";

const INTERGENERATIONAL_PROMPTS = [
  {
    categoryEn: "Education & Daily Life",
    categoryAr: "التعليم والحياة اليومية",
    questionsEn: [
      "What was your school day like when you were my age?",
      "How did you study for exams before digital devices or internet access?",
      "What was the most important lesson you learned outside of school?",
    ],
    questionsAr: [
      "كيف كان يومك الدراسي عندما كنت في مثل عمري؟",
      "كيف كنتم تستعدون للاختبارات قبل الإنترنت والأجهزة الرقمية؟",
      "ما أهم درس تعلمته خارج أسوار المدرسة في طفولتك؟",
    ],
  },
  {
    categoryEn: "Crafts & Practical Trades",
    categoryAr: "الحرف والمهارات العملية",
    questionsEn: [
      "What physical trade, cooking recipe, or craft did you learn from your parents?",
      "Can you teach me the exact steps to make or repair that today?",
      "What tool did you use daily that is rare today?",
    ],
    questionsAr: [
      "ما الصنعة أو المهارة اليدوية أو الوصفة التي توارثتها عن والديك؟",
      "هل يمكنك تعليمي خطواتها العملية بالتفصيل اليوم؟",
      "ما الأداة التي كنت تستخدمها يومياً ولم تعد شائعة الآن؟",
    ],
  },
  {
    categoryEn: "Overcoming Hardship",
    categoryAr: "تجاوز الصعاب والشدائد",
    questionsEn: [
      "What was a major challenge your family faced, and what values kept you united?",
      "When things seemed hopeless, what thoughts or habits gave you patience?",
      "What advice would you give to our generation about staying humble during success?",
    ],
    questionsAr: [
      "ما أصعب تحدٍ واجهته عائلتكم، وما القيم التي حفظت تماسككم؟",
      "ما الذي كان يمنحك الصبر والسكينة عند اشتداد الصعاب؟",
      "ما نصيحتك لجيلنا حول التواضع والتمسك بالقيم عند النجاح؟",
    ],
  },
];

export function FamilyKnowledgeLegacyPanel() {
  const { lang } = usePrefs();
  const isAr = lang === "ar";
  const { state: ecoState, update: updateEco } = useStudentEcosystem();

  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<"vault" | "prompts">("vault");

  // Form State
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [familyRole, setFamilyRole] = useState("");
  const [generation, setGeneration] = useState<
    "grandparent" | "parent" | "youth" | "collaborative"
  >("collaborative");
  const [summary, setSummary] = useState("");
  const [notesAndSteps, setNotesAndSteps] = useState("");

  const familyRecords = useMemo(() => {
    const userRecords = ecoState.familyKnowledgeRecords || [];
    const combined = [...userRecords, ...INITIAL_FAMILY_KNOWLEDGE_RECORDS];
    const seen = new Set<string>();
    return combined.filter((r) => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });
  }, [ecoState.familyKnowledgeRecords]);

  const handleSaveRecord = () => {
    if (!title.trim() || !summary.trim() || !familyRole.trim()) {
      toast.error(
        isAr
          ? "يرجى تعبئة العنوان والملخص ومن روى القصة"
          : "Please fill in title, summary, and family storyteller",
      );
      return;
    }

    const created: FamilyKnowledgeRecord = {
      id: `fam_${Date.now()}`,
      title: title.trim(),
      topic: topic.trim() || (isAr ? "حكمة وتراث عائلي" : "Family Heritage"),
      familyRoleAuthor: familyRole.trim(),
      generationPerspective: generation,
      summary: summary.trim(),
      notesAndSteps: notesAndSteps.trim(),
      sharedDate: new Date().toISOString().split("T")[0] || "2026-11-19",
      isPrivateToFamily: true,
    };

    updateEco((prev) => ({
      ...prev,
      familyKnowledgeRecords: [created, ...(prev.familyKnowledgeRecords || [])],
    }));

    toast.success(
      isAr
        ? "تم حفظ الذكرى والمعرفة العائلية في خزينتك الخاصة بأمان!"
        : "Family legacy memory preserved in your private vault!",
    );

    setIsAdding(false);
    setTitle("");
    setTopic("");
    setFamilyRole("");
    setSummary("");
    setNotesAndSteps("");
  };

  const handleExportVault = () => {
    const dataStr = JSON.stringify(familyRecords, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexora-family-vault-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(
      isAr ? "تم تنزيل خزانة العائلة كملف خاص!" : "Family vault exported successfully!",
    );
  };

  return (
    <div className="space-y-6">
      {/* Strict Privacy Notice */}
      <div className="rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50/60 dark:bg-rose-950/30 p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <Lock className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-semibold text-rose-900 dark:text-rose-200">
              {isAr
                ? "خزانة العائلة الخاصة (سرية ومحمية بالكامل)"
                : "Strict Private Family Vault Guarantee"}
            </h4>
            <p className="text-rose-800 dark:text-rose-300 mt-1 leading-relaxed">
              {isAr
                ? "هذا القسم مخصص لتوثيق تاريخ أسرتك، وصفات أجدادك، وتجاربهم في تجاوز الصعاب. جميع السجلات هنا خاصة 100% بحسابك ولا تُنشر إطلاقاً على أي مكتبة عامة، وتبقى محفوظة لتتعلم منها الأجيال القادمة."
                : "This archive is dedicated to preserving your family's oral history, intergenerational recipes, and craftsmanship wisdom. Every entry remains strictly private to your local account and is never broadcast publicly."}
            </p>
          </div>
        </div>
      </div>

      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-rose-500" />
            <h2 className="text-xl font-bold tracking-tight">
              {isAr ? "خزانة الإرث المعرفي للأسرة والأجيال" : "Family Knowledge & Heritage Vault"}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {isAr
              ? "توثيق تجارب الأجداد، الحرف الأسرية، وأسئلة الحوار بين الأجيال في بيئة خاصة وآمنة"
              : "Preserving ancestral life wisdom, craftsmanship, and meaningful intergenerational dialogue."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={activeTab === "vault" ? "default" : "outline"}
            onClick={() => setActiveTab("vault")}
            className="text-xs"
          >
            {isAr ? "سجلات الخزانة" : "Family Vault"} ({familyRecords.length})
          </Button>
          <Button
            size="sm"
            variant={activeTab === "prompts" ? "default" : "outline"}
            onClick={() => setActiveTab("prompts")}
            className="text-xs"
          >
            {isAr ? "أسئلة الحوار مع الكبار" : "Dialogue Prompts"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportVault}
            className="text-xs gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            {isAr ? "تصدير نسختك" : "Export Backup"}
          </Button>
        </div>
      </div>

      {/* Tab 1: Vault & Add Form */}
      {activeTab === "vault" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {isAr ? "سجلات العائلة المحفوظة محلياً" : "Private Preserved Entries"}
            </h3>
            <Button
              size="sm"
              variant={isAdding ? "secondary" : "default"}
              onClick={() => setIsAdding(!isAdding)}
              className="text-xs gap-1.5"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              {isAdding
                ? isAr
                  ? "إلغاء"
                  : "Cancel"
                : isAr
                  ? "توثيق ذكرى أو مهارة عائلية"
                  : "Document Memory / Skill"}
            </Button>
          </div>

          {isAdding && (
            <Card className="border-2 border-rose-300 dark:border-rose-900 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-rose-700 dark:text-rose-400">
                  <Users className="h-4 w-4" />
                  {isAr ? "توثيق حكمة أو مهارة عائلية جديدة" : "Document a Family Memory or Craft"}
                </CardTitle>
                <CardDescription className="text-xs">
                  {isAr
                    ? "سجل ما روي لك من والديك أو أجدادك ليبقى محفوظاً للأبناء والأحفاد."
                    : "Preserve advice, historical memories, or craftsmanship instructions handed down by elders."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">
                      {isAr ? "عنوان السجل أو القصة" : "Memory / Record Title"}
                    </Label>
                    <Input
                      placeholder={
                        isAr
                          ? "مثال: قصة كفاح جدي في تجارة الغوص واللؤلؤ"
                          : "E.g. Grandfather's First Apprenticeship & Perseverance"
                      }
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">
                      {isAr ? "الموضوع أو المجال" : "Topic or Craft"}
                    </Label>
                    <Input
                      placeholder={
                        isAr
                          ? "مثال: مهارات النجارة التقليدية، الصبر، الترابط الأسري"
                          : "E.g. Traditional carpentry, patience, family solidarity"
                      }
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">
                      {isAr ? "صاحب التجربة أو الراوي" : "Family Storyteller / Role"}
                    </Label>
                    <Input
                      placeholder={
                        isAr
                          ? "مثال: جدي سالم (رحمه الله)، جدتي فاطمة، والدي"
                          : "E.g. Grandfather Salem, Grandmother Fatima, Uncle"
                      }
                      value={familyRole}
                      onChange={(e) => setFamilyRole(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">
                      {isAr ? "المنظور الجيلي" : "Generation Perspective"}
                    </Label>
                    <select
                      className="w-full text-xs rounded-md border border-input bg-background p-2"
                      value={generation}
                      onChange={(e) =>
                        setGeneration(
                          e.target.value as "grandparent" | "parent" | "youth" | "collaborative",
                        )
                      }
                    >
                      <option value="grandparent">
                        {isAr ? "الجيل الأول (الأجداد)" : "Grandparent Generation"}
                      </option>
                      <option value="parent">
                        {isAr ? "الجيل الثاني (الوالدان)" : "Parent Generation"}
                      </option>
                      <option value="youth">
                        {isAr ? "جيل الشباب (الأحفاد)" : "Youth / Grandchild"}
                      </option>
                      <option value="collaborative">
                        {isAr ? "حوار مشترك بين الأجيال" : "Collaborative Intergenerational"}
                      </option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">
                    {isAr ? "خلاصة التجربة أو العبرة المستفادة" : "Core Insight & Summary"}
                  </Label>
                  <Textarea
                    rows={2}
                    placeholder={
                      isAr
                        ? "ما العبرة الأساسية أو الحكمة التي يريدون توريثها لنا؟"
                        : "What is the core takeaway or value being passed down?"
                    }
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">
                    {isAr
                      ? "الخطوات العملية أو التفاصيل الكاملة"
                      : "Detailed Steps, Notes or Family Recipe"}
                  </Label>
                  <Textarea
                    rows={4}
                    placeholder={
                      isAr
                        ? "اكتب القصة بالتفصيل، أو خطوات الصنعة اليدوية بدقة..."
                        : "Describe the narrative in detail, or specify exact tools, recipes, or life advice..."
                    }
                    value={notesAndSteps}
                    onChange={(e) => setNotesAndSteps(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAdding(false)}
                    className="text-xs"
                  >
                    {isAr ? "إلغاء" : "Cancel"}
                  </Button>
                  <Button size="sm" onClick={handleSaveRecord} className="text-xs">
                    {isAr ? "حفظ في الخزانة الخاصة" : "Save to Private Vault"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Records Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {familyRecords.map((rec) => (
              <Card key={rec.id} className="border shadow-xs flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {rec.generationPerspective}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Lock className="h-3 w-3 text-rose-500" />
                      {isAr ? "خاص بالعائلة" : "Private Vault"}
                    </span>
                  </div>
                  <CardTitle className="text-base font-semibold mt-2">{rec.title}</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    {isAr ? "الراوي:" : "Told by:"} {rec.familyRoleAuthor} • {rec.topic}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 pt-0 text-xs">
                  <div className="p-2.5 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-foreground leading-relaxed">
                    <span className="font-semibold text-rose-700 dark:text-rose-400">
                      {isAr ? "العبرة الأساسية:" : "Core Insight:"}{" "}
                    </span>
                    {rec.summary}
                  </div>

                  {rec.notesAndSteps && (
                    <div className="space-y-1">
                      <span className="font-semibold text-foreground text-[11px]">
                        {isAr ? "التفاصيل والخطوات:" : "Notes & Practical Steps:"}
                      </span>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line line-clamp-4">
                        {rec.notesAndSteps}
                      </p>
                    </div>
                  )}

                  <div className="pt-2 border-t text-[10px] text-muted-foreground flex items-center justify-between">
                    <span>
                      {isAr ? "تاريخ التوثيق:" : "Recorded on:"} {rec.sharedDate}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Dialogue Prompts with Elders */}
      {activeTab === "prompts" && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl border bg-muted/30">
            <h3 className="font-semibold text-sm">
              {isAr
                ? "بطاقات الحوار المعرفي مع الأجداد والوالدين"
                : "Intergenerational Dialogue Starter Prompts"}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isAr
                ? "خصص جلسة هادئة مع كبار السن في أسرتك، واسألهم هذه الأسئلة المفتوحة لتوثيق حكمتهم وتجاربهم في خزانة العائلة."
                : "Sit down with an elder in your family with tea and genuine curiosity. Use these open-ended questions to discover their personal history and values."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {INTERGENERATIONAL_PROMPTS.map((promptGroup, idx) => (
              <Card key={idx} className="border shadow-xs">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-rose-500" />
                    {isAr ? promptGroup.categoryAr : promptGroup.categoryEn}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <ul className="space-y-2.5 text-xs text-foreground">
                    {(isAr ? promptGroup.questionsAr : promptGroup.questionsEn).map((q, qIdx) => (
                      <li
                        key={qIdx}
                        className="p-2.5 rounded-lg border bg-card hover:bg-muted/40 transition-colors flex items-start gap-2"
                      >
                        <span className="text-rose-500 font-bold shrink-0">{qIdx + 1}.</span>
                        <span className="leading-relaxed">{q}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs mt-2"
                    onClick={() => {
                      setTitle(
                        isAr
                          ? `حوار عائلي في: ${promptGroup.categoryAr}`
                          : `Dialogue on ${promptGroup.categoryEn}`,
                      );
                      setTopic(isAr ? promptGroup.categoryAr : promptGroup.categoryEn);
                      setActiveTab("vault");
                      setIsAdding(true);
                    }}
                  >
                    {isAr ? "توثيق إجابات هذا المحور" : "Document Responses"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
