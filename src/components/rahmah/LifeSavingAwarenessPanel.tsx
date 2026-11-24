import { useState, useMemo } from "react";
import {
  PhoneCall,
  AlertTriangle,
  Flame,
  Droplets,
  Heart,
  ShieldAlert,
  XCircle,
  CheckCircle2,
  BookOpen,
  Info,
  Thermometer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { INITIAL_LIFE_SAVING_GUIDES, type LifeSavingTopic } from "@/data/humanity-first";
import { usePrefs } from "@/lib/preferences";

export function LifeSavingAwarenessPanel() {
  const { lang } = usePrefs();
  const isAr = lang === "ar";

  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    INITIAL_LIFE_SAVING_GUIDES[0]?.id || "",
  );

  const activeTopic = useMemo(() => {
    return (
      INITIAL_LIFE_SAVING_GUIDES.find((t) => t.id === selectedTopicId) ||
      INITIAL_LIFE_SAVING_GUIDES[0]
    );
  }, [selectedTopicId]);

  if (!activeTopic) return null;

  return (
    <div className="space-y-6">
      {/* Prominent Emergency Dispatch Banner */}
      <div className="rounded-xl border-2 border-red-500 bg-red-50 dark:bg-red-950/40 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-red-600 text-white shrink-0 mt-0.5">
              <PhoneCall className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-red-900 dark:text-red-200 text-base">
                {isAr ? "أرقام الطوارئ السريعة الموحدة" : "Universal Emergency Dispatch Numbers"}
              </h3>
              <p className="text-xs text-red-800 dark:text-red-300 mt-0.5">
                {isAr
                  ? "الكويت ودول الخليج وأوروبا: 112 | المملكة المتحدة: 999 | الولايات المتحدة: 911"
                  : "Kuwait, GCC & Europe: 112 | UK: 999 | US & Americas: 911"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="tel:112"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs"
            >
              <PhoneCall className="h-3.5 w-3.5" />
              <span>{isAr ? "اتصال طوارئ 112" : "Call 112"}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Mandatory Training Disclaimer */}
      <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-900 bg-amber-50/60 dark:bg-amber-950/30">
        <div className="flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
          <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">
              {isAr ? "تنبيه أخلاقي وتعليمي ملزم: " : "Mandatory Educational Disclaimer: "}
            </span>
            {isAr
              ? "هذا القسم يقدم توعية نظرية عامة فقط، ولا يغني إطلاقاً عن الدورات العملية المعتمدة للإنعاش القلبي الرئوي (CPR) والإسعافات الأولية الصادرة من جمعيات الهلال الأحمر، الصليب الأحمر، أو جمعية القلب الأمريكية (AHA). شجع نفسك وعائلتك على التسجيل في دورة تدريبية عملية ميدانية."
              : "This curriculum provides general introductory awareness and strictly DOES NOT substitute for accredited, hands-on CPR and First Aid training certified by the Red Crescent, Red Cross, or American Heart Association (AHA). We strongly encourage every student and family to attend certified hands-on workshops."}
          </div>
        </div>
      </div>

      {/* Topics Selector & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Topics List */}
        <div className="lg:col-span-4 space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            {isAr ? "بروتوكولات التوعية بإنقاذ الحياة" : "Life-Saving Protocols"}
          </h4>
          <div className="space-y-1.5">
            {INITIAL_LIFE_SAVING_GUIDES.map((topic) => {
              const isSelected = activeTopic.id === topic.id;
              return (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopicId(topic.id)}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition-colors ${
                    isSelected
                      ? "border-red-500 bg-red-50/60 dark:bg-red-950/30 text-red-950 dark:text-red-200 font-semibold"
                      : "border-border bg-card hover:bg-muted/40 text-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{isAr ? topic.titleAr : topic.title}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1 font-normal">
                    {topic.warningSignsNotice}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Guide Details */}
        <div className="lg:col-span-8">
          <Card className="border shadow-xs">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base text-foreground">
                    {isAr ? activeTopic.titleAr : activeTopic.title}
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    {isAr ? activeTopic.title : activeTopic.titleAr}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {activeTopic.officialGuidelineSource}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-6">
              {/* Warning Signs Notice */}
              <div className="p-3.5 rounded-lg border border-red-200 dark:border-red-900 bg-red-50/40 dark:bg-red-950/20 text-xs text-red-950 dark:text-red-200">
                <div className="font-semibold flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span>
                    {isAr
                      ? "علامات الخطر التي تستدعي التصرف الفوري:"
                      : "Critical Signs Demanding Immediate Action:"}
                  </span>
                </div>
                <p className="leading-relaxed">{activeTopic.warningSignsNotice}</p>
              </div>

              {/* Immediate Action Steps */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  {isAr
                    ? "الخطوات المنهجية الصحيحة (ما يجب فعله):"
                    : "Immediate Recommended Action Steps:"}
                </h4>
                <ul className="space-y-2 text-xs">
                  {activeTopic.immediateActionSteps.map((step, idx) => (
                    <li
                      key={idx}
                      className="p-2.5 rounded-md border bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/40 flex items-start gap-2.5"
                    >
                      <span className="h-5 w-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-foreground leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* What NEVER To Do */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <XCircle className="h-4 w-4" />
                  {isAr
                    ? "أخطاء شائعة خطيرة (ما لا تفعله إطلاقاً):"
                    : "Dangerous Common Errors (What NEVER To Do):"}
                </h4>
                <div className="space-y-1.5">
                  {activeTopic.whatNeverToDo.map((err, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-md border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2"
                    >
                      <span className="text-rose-600 font-bold shrink-0">✕</span>
                      <span className="leading-relaxed">{err}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Official Source & Disclaimers */}
              <div className="p-3 rounded-lg bg-muted text-[11px] text-muted-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-2 border">
                <span>
                  {isAr ? "المصدر الإرشادي المعتمد:" : "Official Guideline:"}{" "}
                  {activeTopic.officialGuidelineSource}
                </span>
                <span>{activeTopic.certifiedTrainingDisclaimer}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
