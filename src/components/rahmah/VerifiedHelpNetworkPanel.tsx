import { useState, useMemo } from "react";
import {
  HandHeart,
  ShieldCheck,
  Users,
  Clock,
  Laptop,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  INITIAL_VERIFIED_HELP_OPPORTUNITIES,
  type VerifiedHelpOpportunity,
} from "@/data/humanity-first";
import { usePrefs } from "@/lib/preferences";

const FOCUS_LABELS: Record<VerifiedHelpOpportunity["focusArea"], { en: string; ar: string }> = {
  educational_tutoring: {
    en: "Peer Tutoring & Study Support",
    ar: "الدعم الدراسي والأكاديمي للزملاء",
  },
  accessibility_adaptation: {
    en: "Accessibility Adaptation & Audio",
    ar: "تكييف المناهج صوتياً ولأصحاب الهمم",
  },
  environmental_cleanup: { en: "Environmental & Campus Action", ar: "المبادرات البيئية والتشجير" },
  language_translation: { en: "Educational Translation", ar: "ترجمة الموارد التعليمية المفتوحة" },
  youth_mentorship: { en: "Youth Mentorship & Guidance", ar: "الإرشاد والتوجيه الطلابي" },
};

export function VerifiedHelpNetworkPanel() {
  const { lang } = usePrefs();
  const isAr = lang === "ar";

  const [focusFilter, setFocusFilter] = useState<VerifiedHelpOpportunity["focusArea"] | "all">(
    "all",
  );
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<VerifiedHelpOpportunity | null>(
    null,
  );

  // Application / Pledge State
  const [applicantName, setApplicantName] = useState("");
  const [applicantAge, setApplicantAge] = useState("");
  const [guardianConsentChecked, setGuardianConsentChecked] = useState(false);
  const [safetyPledgeChecked, setSafetyPledgeChecked] = useState(false);

  const filteredOpportunities = useMemo(() => {
    return INITIAL_VERIFIED_HELP_OPPORTUNITIES.filter((opp) => {
      const matchFocus = focusFilter === "all" || opp.focusArea === focusFilter;
      const matchRemote = !remoteOnly || opp.remoteAvailable;
      return matchFocus && matchRemote;
    });
  }, [focusFilter, remoteOnly]);

  const handleApply = () => {
    if (!applicantName.trim() || !applicantAge) {
      toast.error(isAr ? "يرجى كتابة الاسم والعمر" : "Please specify name and age");
      return;
    }
    const ageNum = parseInt(applicantAge, 10);
    if (selectedOpportunity && ageNum < selectedOpportunity.minimumAge) {
      toast.error(
        isAr
          ? `الحد الأدنى للعمر في هذه الفرصة هو ${selectedOpportunity.minimumAge} سنة لأسباب تتعلق بسلامة الطلبة`
          : `Minimum age for this supervised opportunity is ${selectedOpportunity.minimumAge} years.`,
      );
      return;
    }
    if (!guardianConsentChecked || !safetyPledgeChecked) {
      toast.error(
        isAr
          ? "يرجى الموافقة على تعهد السلامة وموافقة ولي الأمر/المشرف"
          : "Please confirm guardian consent and safety compliance",
      );
      return;
    }

    toast.success(
      isAr
        ? "تم تسجيل رغبتك في التطوع التعليمي تحت إشراف المنظومة بنجاح!"
        : "Volunteer interest registered under supervised guidelines!",
    );
    setSelectedOpportunity(null);
    setApplicantName("");
    setApplicantAge("");
    setGuardianConsentChecked(false);
    setSafetyPledgeChecked(false);
  };

  return (
    <div className="space-y-6">
      {/* Strict Child Safety & Safeguarding Notice */}
      <div className="rounded-xl border border-indigo-300 dark:border-indigo-900 bg-indigo-50/60 dark:bg-indigo-950/30 p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-semibold text-indigo-900 dark:text-indigo-200">
              {isAr
                ? "بروتوكول حماية وسلامة اليافعين والطلبة الصارم (Safeguarding)"
                : "Strict Youth Safety & Safeguarding Protocol"}
            </h4>
            <p className="text-indigo-800 dark:text-indigo-300 mt-1 leading-relaxed">
              {isAr
                ? "جميع فرص التطوع المدرجة خاضعة للإشراف المباشر من معلمين أو أولياء أمور معتمدين. تمنع نكسورا بشكل مطلق أي تواصل خاص غير مراقب بين البالغين والقُصّر، ولا تسمح بجمع أي تبرعات مالية من الطلبة، وتلتزم بأعلى معايير حماية الطفل الدولية."
                : "All volunteer initiatives are rigorously vetted for student safety. NEXORA strictly prohibits unmonitored private communication between adults and minors, bars any financial solicitations, and requires explicit guardian/faculty oversight for all student contributions."}
            </p>
          </div>
        </div>
      </div>

      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <HandHeart className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-bold tracking-tight">
              {isAr
                ? "شبكة العون والتطوع المعرفي الموثق"
                : "Verified Educational Volunteering Network"}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {isAr
              ? "فرص حقيقية ومحمية للطلبة للإسهام في مساعدة زملائهم، تكييف المناهج للمكفوفين، وخدمة المجتمع"
              : "Supervised peer tutoring, accessibility adaptation, and educational service initiatives."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            className="text-xs rounded-md border border-input bg-background p-2"
            value={focusFilter}
            onChange={(e) =>
              setFocusFilter(e.target.value as VerifiedHelpOpportunity["focusArea"] | "all")
            }
          >
            <option value="all">{isAr ? "جميع مجالات الخدمة" : "All Focus Areas"}</option>
            {Object.entries(FOCUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {isAr ? v.ar : v.en}
              </option>
            ))}
          </select>

          <Button
            size="sm"
            variant={remoteOnly ? "default" : "outline"}
            onClick={() => setRemoteOnly(!remoteOnly)}
            className="text-xs gap-1.5"
          >
            <Laptop className="h-3.5 w-3.5" />
            {isAr ? "عن بُعد فقط" : "Remote Only"}
          </Button>
        </div>
      </div>

      {/* Opportunities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOpportunities.map((opp) => (
          <Card key={opp.id} className="border flex flex-col justify-between shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <Badge variant="outline" className="text-[10px]">
                  {FOCUS_LABELS[opp.focusArea]?.[isAr ? "ar" : "en"] || opp.focusArea}
                </Badge>
                {opp.remoteAvailable ? (
                  <Badge variant="secondary" className="text-[10px] gap-1">
                    <Laptop className="h-3 w-3" />
                    {isAr ? "عن بُعد" : "Remote"}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] gap-1">
                    <MapPin className="h-3 w-3" />
                    {isAr ? "حضوري" : "In-Person"}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-base font-semibold mt-2">
                {isAr ? opp.titleAr : opp.title}
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">{opp.organizationName}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 pt-0 text-xs">
              <p className="text-muted-foreground line-clamp-3 leading-relaxed">
                {opp.description}
              </p>

              <div className="space-y-1.5 pt-2 border-t text-[11px]">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-primary" />
                    {opp.timeCommitmentHoursPerWeek} {isAr ? "ساعات/أسبوعياً" : "hrs/week"}
                  </span>
                  <span>
                    {isAr ? "الحد الأدنى للسن:" : "Min Age:"} {opp.minimumAge}+
                  </span>
                </div>

                <div className="p-2 rounded bg-muted/40 text-[10px] text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {isAr ? "الإشراف الملزم:" : "Supervision:"}{" "}
                  </span>
                  {opp.requiredSupervision}
                </div>
              </div>

              <Button
                size="sm"
                className="w-full text-xs mt-2"
                onClick={() => setSelectedOpportunity(opp)}
              >
                {isAr ? "تسجيل الرغبة في التطوع" : "Express Volunteer Interest"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Safety & Interest Registration Modal */}
      {selectedOpportunity && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border shadow-lg bg-card">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <HandHeart className="h-4 w-4 text-indigo-600" />
                  {isAr ? "تسجيل الرغبة في التطوع الآمن" : "Supervised Volunteer Registration"}
                </CardTitle>
              </div>
              <CardDescription className="text-xs mt-1">
                {selectedOpportunity.title} • {selectedOpportunity.organizationName}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold">
                  {isAr ? "اسم الطالب بالكامل" : "Student Full Name"}
                </label>
                <Input
                  placeholder={isAr ? "الاسم الثلاثي..." : "Full legal name..."}
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold">{isAr ? "العمر الحالي" : "Current Age"}</label>
                <Input
                  type="number"
                  placeholder={
                    isAr
                      ? `الحد الأدنى ${selectedOpportunity.minimumAge} سنة`
                      : `Min ${selectedOpportunity.minimumAge} years`
                  }
                  value={applicantAge}
                  onChange={(e) => setApplicantAge(e.target.value)}
                  className="text-xs"
                />
              </div>

              {/* Child Safety & Guardian Checkboxes */}
              <div className="space-y-2 pt-2 border-t">
                <label className="flex items-start gap-2 p-2 rounded-md bg-muted/40 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={guardianConsentChecked}
                    onChange={(e) => setGuardianConsentChecked(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span className="leading-relaxed text-[11px]">
                    {isAr
                      ? "أؤكد إبلاغ ولي أمري / معلمي بمشاركتي في هذه المبادرة وموافقتهم المسبقة عليها."
                      : "I confirm that my parent, guardian, or teacher has approved this educational volunteering."}
                  </span>
                </label>

                <label className="flex items-start gap-2 p-2 rounded-md bg-muted/40 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={safetyPledgeChecked}
                    onChange={(e) => setSafetyPledgeChecked(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span className="leading-relaxed text-[11px]">
                    {isAr
                      ? "أتعهد بالالتزام بأخلاقيات النفع العام، وعدم مشاركة أي بيانات شخصية أو طلب أموال."
                      : "I agree to strict child safety conduct, zero financial transactions, and public communication transparency."}
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedOpportunity(null)}
                  className="text-xs"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </Button>
                <Button size="sm" onClick={handleApply} className="text-xs">
                  {isAr ? "تأكيد التسجيل" : "Confirm Application"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
