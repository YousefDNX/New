import { Link } from "@tanstack/react-router";
import { ArrowRight, BookMarked, Compass, FolderKanban, HeartHandshake } from "lucide-react";
import { useOpportunities, useStudyItems } from "@/hooks/use-modules";
import { useGoals } from "@/hooks/use-nexora";
import { usePrefs } from "@/lib/preferences";
import { useStudentEcosystem } from "@/lib/student-ecosystem";

export function EcosystemOverviewWidget() {
  const { lang } = usePrefs();
  const isAr = lang === "ar";
  const { state: eco } = useStudentEcosystem();
  const { data: studyItems = [] } = useStudyItems();
  const { data: goals = [] } = useGoals();
  const { data: opportunities = [] } = useOpportunities();

  const projectsCount =
    eco.portfolio.projects.length + eco.researchProjects.length + eco.engineeringSpecs.length;
  const savedResourcesCount =
    eco.knowledgeLibrary.length +
    studyItems.filter((i) => i.kind === "note").length +
    eco.researchCitations.length;
  const activeGoals = goals.filter((g) => g.status !== "completed");
  const nextGoal = activeGoals[0];
  const savedOrOpenOpportunities = opportunities.length;
  const latestProject =
    eco.portfolio.projects[0]?.title ||
    eco.researchProjects[0]?.title ||
    eco.engineeringSpecs[0]?.title;

  return (
    <section
      aria-label={isAr ? "نظرة شاملة على منظومة التعلم" : "Connected Learning Ecosystem"}
      className="surface-card space-y-3 p-5"
      data-testid="ecosystem-overview-widget"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-3">
        <div>
          <h2 className="font-display text-base font-bold text-foreground">
            {isAr
              ? "مشاريعك ومواردك والفرص المترابطة"
              : "Projects, Saved Resources & Active Opportunities"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {isAr
              ? "ربط مباشر بين مشاريعك الشخصية، مكتبتك البحثية، أهدافك النشطة، والفرص التعليمية."
              : "Actionable links across your personal projects, saved knowledge library, goals, and real-world impact."}
          </p>
        </div>
        <Link
          to="/app/circle"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          <span>{isAr ? "حلقة المعرفة والمجتمع" : "Knowledge Circle"}</span>
          <ArrowRight className="size-3.5 rtl-flip" />
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
        <Link
          to="/app/level-up"
          className="group flex flex-col justify-between rounded-xl border border-border bg-surface-2 p-3.5 transition-colors hover:border-primary/50"
        >
          <div className="space-y-1">
            <div className="flex items-center justify-between text-primary">
              <span className="font-semibold">
                {isAr ? "المشاريع والأبحاث" : "Personal Projects"}
              </span>
              <FolderKanban className="size-4 shrink-0" />
            </div>
            <div className="font-display text-lg font-bold tabular-nums text-foreground">
              {projectsCount}
            </div>
            <p className="line-clamp-2 text-[11px] text-muted-foreground">
              {latestProject
                ? `${isAr ? "أحدث مشروع:" : "Latest:"} ${latestProject}`
                : isAr
                  ? "ابدأ مشروعاً هندسياً أو بحثياً أو أضفه لملف الإنجاز."
                  : "Start a portfolio build, research investigation, or engineering spec."}
            </p>
          </div>
          <span className="mt-2 inline-flex items-center gap-1 font-semibold text-primary">
            {isAr ? "فتح المشاريع" : "Open Projects"}{" "}
            <ArrowRight className="size-3 rtl-flip transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>

        <Link
          to="/app/study"
          search={{ tab: "research" }}
          className="group flex flex-col justify-between rounded-xl border border-border bg-surface-2 p-3.5 transition-colors hover:border-primary/50"
        >
          <div className="space-y-1">
            <div className="flex items-center justify-between text-primary">
              <span className="font-semibold">
                {isAr ? "الموارد والمراجع المحفوظة" : "Saved Resources"}
              </span>
              <BookMarked className="size-4 shrink-0" />
            </div>
            <div className="font-display text-lg font-bold tabular-nums text-foreground">
              {savedResourcesCount}
            </div>
            <p className="line-clamp-2 text-[11px] text-muted-foreground">
              {isAr
                ? `${eco.knowledgeLibrary.length} ملخص معرفة · ${eco.researchCitations.length} مرجع موثق.`
                : `${eco.knowledgeLibrary.length} AI summaries · ${eco.researchCitations.length} verified citations.`}
            </p>
          </div>
          <span className="mt-2 inline-flex items-center gap-1 font-semibold text-primary">
            {isAr ? "مختبر البحث" : "Research & Notes"}{" "}
            <ArrowRight className="size-3 rtl-flip transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>

        <Link
          to="/app"
          search={{ tab: "growthmap" }}
          className="group flex flex-col justify-between rounded-xl border border-border bg-surface-2 p-3.5 transition-colors hover:border-primary/50"
        >
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xp">
              <span className="font-semibold">
                {isAr ? "الأهداف والخطوة التالية" : "Goals & Next Step"}
              </span>
              <Compass className="size-4 shrink-0" />
            </div>
            <div className="font-display text-lg font-bold tabular-nums text-foreground">
              {activeGoals.length} {isAr ? "نشطة" : "active"}
            </div>
            <p className="line-clamp-2 text-[11px] text-muted-foreground">
              {nextGoal
                ? nextGoal.title
                : isAr
                  ? "أنشئ هدف نمو شخصي مع معالم واضحة داخل خريطة النمو 2.0."
                  : "Create a personal goal and custom milestones in Growth Map 2.0."}
            </p>
          </div>
          <span className="mt-2 inline-flex items-center gap-1 font-semibold text-xp">
            {isAr ? "خريطة النمو 2.0" : "Growth Map 2.0"}{" "}
            <ArrowRight className="size-3 rtl-flip transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>

        <Link
          to="/app/circle"
          className="group flex flex-col justify-between rounded-xl border border-border bg-surface-2 p-3.5 transition-colors hover:border-primary/50"
        >
          <div className="space-y-1">
            <div className="flex items-center justify-between text-emerald-400">
              <span className="font-semibold">
                {isAr ? "الأنشطة والمجتمع" : "Community & Projects"}
              </span>
              <HeartHandshake className="size-4 shrink-0" />
            </div>
            <div className="font-display text-lg font-bold tabular-nums text-foreground">
              {savedOrOpenOpportunities + eco.realWorldGoodProjects.length}
            </div>
            <p className="line-clamp-2 text-[11px] text-muted-foreground">
              {isAr
                ? `${savedOrOpenOpportunities} نشاط مسجل · ${eco.realWorldGoodProjects.length} مبادرات طلابية.`
                : `${savedOrOpenOpportunities} saved tracks · ${eco.realWorldGoodProjects.length} student initiatives.`}
            </p>
          </div>
          <span className="mt-2 inline-flex items-center gap-1 font-semibold text-emerald-400">
            {isAr ? "استكشف حلقة المعرفة" : "Explore Knowledge Circle"}{" "}
            <ArrowRight className="size-3 rtl-flip transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>
    </section>
  );
}
