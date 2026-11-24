import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  Search,
  BookOpen,
  UserCheck,
  Map,
  Clock,
  CheckSquare,
  Sparkles,
  Sliders,
  AlertCircle,
  LifeBuoy,
  ChevronRight,
  MessageSquare,
  HelpCircle,
  Tag,
  ArrowRight,
  X,
  FileText,
  Calendar,
} from "lucide-react";
import { BRAND } from "@/config/brand";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  SEED_HELP_ARTICLES,
  SEED_FAQS,
  fetchHelpArticles,
  filterHelpArticles,
  type HelpArticle,
  type HelpArticleCategory,
} from "@/lib/support-service";
import { useRbac } from "@/hooks/use-rbac";
import { cn } from "@/lib/utils";

interface CategoryMeta {
  id: HelpArticleCategory;
  name: string;
  description: string;
  icon: typeof BookOpen;
  colorClass: string;
}

const CATEGORIES: CategoryMeta[] = [
  {
    id: "getting_started",
    name: "Getting Started",
    description: `New to ${BRAND.name}? Set up your account, explore the dashboard, and earn your first XP.`,
    icon: Sparkles,
    colorClass: "text-teal-600 dark:text-teal-400 bg-teal-500/10 border-teal-500/20",
  },
  {
    id: "account",
    name: "Account & Verification",
    description:
      "Manage login credentials, verify student email and phone, and ensure session persistence.",
    icon: UserCheck,
    colorClass: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
  {
    id: "growth_map",
    name: "Growth Map & XP",
    description: "Understand levels, streaks, skill spider charts, and academic milestones.",
    icon: Map,
    colorClass: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    id: "study",
    name: "Study & Pomodoro",
    description: "Spaced repetition flashcards, Pomodoro focus sprints, and exam preparation tips.",
    icon: Clock,
    colorClass: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  {
    id: "productivity",
    name: "Productivity & Tasks",
    description:
      "Organize homework, set priorities, build checklist subtasks, and use the calendar.",
    icon: CheckSquare,
    colorClass: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  },
  {
    id: "ai",
    name: `${BRAND.shortName} AI Assistant`,
    description:
      "Learn how to use your personalized academic study coach responsibly and effectively.",
    icon: Sparkles,
    colorClass: "text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  },
  {
    id: "settings",
    name: "Settings & Personalization",
    description: "Configure Aurora Glass & Creative Neon themes, typography, and accessibility.",
    icon: Sliders,
    colorClass: "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20",
  },
  {
    id: "troubleshooting",
    name: "Troubleshooting",
    description:
      "Fix network errors, settings rollback issues, offline notices, and browser cache quirks.",
    icon: AlertCircle,
    colorClass: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20",
  },
];

export interface HelpCenterProps {
  className?: string;
  onOpenTicket?: () => void;
  onOpenReport?: () => void;
}

export function HelpCenter({ className, onOpenTicket, onOpenReport }: HelpCenterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<HelpArticleCategory | "all">("all");
  const [activeArticle, setActiveArticle] = useState<HelpArticle | null>(null);
  const { canManageHelp } = useRbac();

  const { data: articles = SEED_HELP_ARTICLES } = useQuery({
    queryKey: ["help-articles"],
    queryFn: () => fetchHelpArticles("all", "", false),
    initialData: SEED_HELP_ARTICLES,
    staleTime: 60_000,
  });

  // Search indexing function: filters published articles by category, tags, title keywords, excerpt and content
  const filteredArticles = useMemo(() => {
    return filterHelpArticles(articles, selectedCategory, searchQuery, false);
  }, [articles, searchQuery, selectedCategory]);

  const handleSelectRelated = (relatedId: string) => {
    const target = articles.find((a) => a.id === relatedId);
    if (target) {
      setActiveArticle(target);
    }
  };

  return (
    <div className={cn("space-y-10", className)}>
      {/* Hero & Search Header */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-b from-surface-2/60 via-card to-card p-6 text-center md:p-10">
        <div className="mx-auto max-w-2xl space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <LifeBuoy className="size-3.5" />
              <span>{BRAND.name} Knowledge Base &amp; Support</span>
            </div>
            <FeatureGuideTrigger featureId="help-center" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
            How can we help your learning today?
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Search our comprehensive student guides, review step-by-step instructions, or browse
            categorized documentation.
          </p>

          {/* Search Bar */}
          <div className="relative mx-auto mt-6 max-w-xl">
            <Search className="absolute start-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides, topics, error codes, tags (e.g. 'Pomodoro', 'Streak', 'Theme')..."
              className="h-12 rounded-xl border-border/80 bg-surface pe-10 ps-12 text-sm shadow-sm transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
              aria-label="Search help articles"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute end-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Quick Search Tag Chips */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-medium">Popular:</span>
            {[
              "Pomodoro",
              "XP & Levels",
              "Session Persistence",
              "Creative Neon",
              "Verify Email",
              "Dyslexia Font",
            ].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSearchQuery(tag)}
                className="rounded-md border border-border/60 bg-surface-2/40 px-2 py-0.5 text-foreground/80 transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {canManageHelp && (
          <div className="mt-6 flex justify-end">
            <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
              <Link to="/app/admin" search={{ tab: "articles" }}>
                <span>Staff: Manage Help Articles</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-3">
        <button
          type="button"
          onClick={() => setSelectedCategory("all")}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
            selectedCategory === "all"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
          )}
        >
          All Topics ({articles.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = articles.filter((a) => a.category === cat.id).length;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
              )}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Search Results Notice (if active search) */}
      {searchQuery && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Found <strong>{filteredArticles.length}</strong> guide
            {filteredArticles.length === 1 ? "" : "s"} matching &quot;{searchQuery}&quot;
          </span>
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="text-primary underline-offset-4 hover:underline"
          >
            Reset search
          </button>
        </div>
      )}

      {/* Article Grid / Results */}
      {filteredArticles.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredArticles.map((article) => {
            const cat = CATEGORIES.find((c) => c.id === article.category) ?? CATEGORIES[0]!;
            const Icon = cat.icon;

            return (
              <div
                key={article.id}
                role="button"
                tabIndex={0}
                onClick={() => setActiveArticle(article)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActiveArticle(article);
                  }
                }}
                className="surface-card group flex flex-col justify-between p-5 text-start transition-all hover:border-primary/40 hover:shadow-card cursor-pointer"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold",
                        cat.colorClass,
                      )}
                    >
                      <Icon className="size-3" />
                      <span>{cat.name}</span>
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(article.last_updated_at).toLocaleDateString("en-US", {
                        timeZone: "UTC",
                      })}
                    </span>
                  </div>

                  <h3 className="font-display text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>

                  <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {article.excerpt}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {article.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-1 pt-2 text-xs font-semibold text-primary">
                  <span>Read full guide</span>
                  <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="surface-card flex flex-col items-center justify-center p-10 text-center">
          <HelpCircle className="size-10 text-muted-foreground/60" />
          <h3 className="mt-3 text-base font-semibold text-foreground">No matching guides found</h3>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            We couldn&apos;t find any documentation matching your search query. Try another keyword
            or submit a direct support ticket.
          </p>
          <div className="mt-4 flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setSearchQuery("")}>
              Clear Search
            </Button>
            {onOpenTicket && (
              <Button type="button" variant="glow" size="sm" onClick={onOpenTicket}>
                Contact Support
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Category Exploration Grid (When not filtering with a specific query) */}
      {!searchQuery && selectedCategory === "all" && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-foreground sm:text-xl">
                Browse by Category
              </h2>
              <p className="text-xs text-muted-foreground">
                Deep-dive into specific areas of the student experience.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const count = articles.filter((a) => a.category === cat.id).length;

              return (
                <div
                  key={cat.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedCategory(cat.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedCategory(cat.id);
                    }
                  }}
                  className="surface-card group p-4 transition-all hover:border-primary/40 hover:-translate-y-0.5 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex size-10 items-center justify-center rounded-xl border",
                        cat.colorClass,
                      )}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        {count} {count === 1 ? "guide" : "guides"}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2.5 text-xs text-muted-foreground line-clamp-2">
                    {cat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* FAQ Accordion Section */}
      <section className="space-y-4 pt-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
            <HelpCircle className="size-3.5" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="font-display text-lg font-bold text-foreground sm:text-xl">
            Quick Answers to Common Questions
          </h2>
          <p className="text-xs text-muted-foreground">
            Clear solutions for account recovery, theme customization, and study routines.
          </p>
        </div>

        <div className="surface-card p-4 sm:p-6">
          <Accordion type="single" collapsible className="w-full">
            {SEED_FAQS.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id} className="border-border/60">
                <AccordionTrigger className="text-start font-medium text-foreground hover:text-primary py-3.5 text-sm">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-xs leading-relaxed text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Support Escalation & Contact Banner */}
      <section className="surface-card relative overflow-hidden p-6 md:p-8">
        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2 text-primary">
              <MessageSquare className="size-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Need Personal Assistance?
              </span>
            </div>
            <h3 className="font-display text-lg font-bold text-foreground sm:text-xl">
              Can&apos;t find what you&apos;re looking for?
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
              Our academic advisors and technical support team are here to help. Open a private
              ticket or report a problem and we&apos;ll get back to you shortly.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            {onOpenTicket ? (
              <Button
                type="button"
                variant="glow"
                onClick={onOpenTicket}
                className="gap-1.5 text-xs"
              >
                <LifeBuoy className="size-3.5" />
                <span>Submit Support Ticket</span>
              </Button>
            ) : (
              <Button asChild variant="glow" className="gap-1.5 text-xs">
                <Link to="/app/support">
                  <LifeBuoy className="size-3.5" />
                  <span>Submit Support Ticket</span>
                </Link>
              </Button>
            )}

            {onOpenReport && (
              <Button
                type="button"
                variant="outline"
                onClick={onOpenReport}
                className="gap-1.5 text-xs"
              >
                <AlertCircle className="size-3.5" />
                <span>Report an Issue</span>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Detailed Article Reader Dialog */}
      {activeArticle && (
        <Dialog
          open={Boolean(activeArticle)}
          onOpenChange={(open) => !open && setActiveArticle(null)}
        >
          <DialogContent className="surface-card max-h-[85vh] overflow-y-auto sm:max-w-2xl p-6 sm:p-8">
            <DialogHeader className="space-y-2 border-b border-border/70 pb-4 text-start">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-semibold uppercase tracking-wider text-primary">
                  {CATEGORIES.find((c) => c.id === activeArticle.category)?.name ||
                    activeArticle.category}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="size-3" />
                  {new Date(activeArticle.last_updated_at).toLocaleDateString("en-US", {
                    timeZone: "UTC",
                  })}
                </span>
                {activeArticle.author_name && (
                  <>
                    <span>•</span>
                    <span>{activeArticle.author_name}</span>
                  </>
                )}
              </div>
              <DialogTitle className="font-display text-xl font-bold text-foreground sm:text-2xl">
                {activeArticle.title}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
                {activeArticle.excerpt}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 pt-4 text-sm leading-relaxed text-foreground/90">
              {/* Main Content */}
              <div className="whitespace-pre-line text-xs sm:text-sm text-muted-foreground">
                {activeArticle.content}
              </div>

              {/* Step-by-Step Instructions */}
              {activeArticle.steps && activeArticle.steps.length > 0 && (
                <div className="space-y-2.5 rounded-xl border border-border/80 bg-surface-2/40 p-4">
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Step-by-Step Instructions:
                  </h4>
                  <ol className="list-decimal space-y-2 ps-4 text-xs text-muted-foreground">
                    {activeArticle.steps.map((step, idx) => (
                      <li key={idx} className="ps-1 leading-normal">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Tags */}
              {activeArticle.tags && activeArticle.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-2">
                  <Tag className="size-3 text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground">Tags:</span>
                  {activeArticle.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-foreground/80"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Related Articles */}
              {activeArticle.related_article_ids &&
                activeArticle.related_article_ids.length > 0 && (
                  <div className="space-y-2 border-t border-border/60 pt-4">
                    <h4 className="text-xs font-semibold text-foreground">Related Articles:</h4>
                    <div className="flex flex-wrap gap-2">
                      {activeArticle.related_article_ids.map((relId) => {
                        const related = articles.find((a) => a.id === relId);
                        if (!related) return null;
                        return (
                          <button
                            key={relId}
                            type="button"
                            onClick={() => handleSelectRelated(relId)}
                            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground"
                          >
                            <FileText className="size-3 text-primary" />
                            <span>{related.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
            </div>

            <div className="mt-6 flex justify-end border-t border-border/70 pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setActiveArticle(null)}
              >
                Close Guide
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
