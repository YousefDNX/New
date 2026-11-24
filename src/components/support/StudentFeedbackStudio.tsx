import { useEffect, useState } from "react";
import { MessageSquarePlus, Send, Sparkles, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePrefs } from "@/lib/preferences";
import {
  fetchFeedbackItems,
  createFeedbackItem,
  toggleFeedbackUpvote,
  type FeedbackCategory,
  type FeedbackItem,
} from "@/lib/support-service";

const FEEDBACK_CATEGORIES: Array<{
  id: FeedbackCategory;
  labelEn: string;
  labelAr: string;
  desc: string;
}> = [
  {
    id: "content_improvement",
    labelEn: "Curriculum & Lessons",
    labelAr: "المناهج والدروس",
    desc: "Suggest missing STEM topics, textbook corrections, or revision flashcards.",
  },
  {
    id: "usability_feedback",
    labelEn: "Accessibility & UI",
    labelAr: "سهولة الاستخدام والوصول",
    desc: "Report screen-reader issues, high-contrast needs, or navigation friction.",
  },
  {
    id: "feature_suggestion",
    labelEn: "Feature Idea",
    labelAr: "اقتراح ميزة جديدة",
    desc: "Suggest interactive simulators, study tools, or student collaboration modes.",
  },
  {
    id: "general",
    labelEn: "General Feedback",
    labelAr: "ملاحظات عامة",
    desc: "Share your experience and thoughts on the BTC student platform.",
  },
];

export function StudentFeedbackStudio() {
  const { lang } = usePrefs();
  const isAr = lang === "ar";
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [category, setCategory] = useState<FeedbackCategory>("content_improvement");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const loadItems = async () => {
    try {
      const data = await fetchFeedbackItems();
      setItems(data ?? []);
    } catch {
      // offline fallback
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadItems();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setSubmitting(true);
    try {
      await createFeedbackItem({
        category,
        title: title.trim(),
        description: description.trim(),
      });
      setTitle("");
      setDescription("");
      toast.success(
        isAr
          ? "شكراً لك! تم إرسال اقتراحك لفريق المناهج والتطوير"
          : "Thank you! Your feedback was sent to platform educators",
      );
      void loadItems();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = async (itemId: string) => {
    try {
      await toggleFeedbackUpvote(itemId);
      void loadItems();
    } catch {
      toast.error("Sign in to upvote student suggestions");
    }
  };

  return (
    <div className="surface-card p-5 space-y-4" data-testid="student-feedback-studio">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MessageSquarePlus className="size-5 text-primary" />
          <div>
            <h2 className="text-base font-bold font-display text-foreground">
              39. Student Feedback & Curriculum Co-Design Studio
            </h2>
            <p className="text-xs text-muted-foreground">
              Direct voice channel for student proposals, curriculum fixes, and accessibility
              requests.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2 text-xs">
        {/* Submission Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-3 rounded-xl border border-border bg-surface-2/60 p-4"
        >
          <div className="font-bold text-foreground">Submit a Curriculum or Feature Suggestion</div>
          <div className="grid grid-cols-2 gap-1.5">
            {FEEDBACK_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`rounded-lg border p-2 text-start transition-colors ${
                  category === cat.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-surface-1 text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="font-semibold text-foreground">
                  {isAr ? cat.labelAr : cat.labelEn}
                </div>
                <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                  {cat.desc}
                </div>
              </button>
            ))}
          </div>

          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Short title (e.g., Add Redox Reaction Titration simulator to Unit 4)"
            className="text-xs font-medium"
          />

          <Textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed suggestion or curriculum gap context..."
            className="text-xs"
          />

          <Button type="submit" size="sm" disabled={submitting} className="h-8 text-xs">
            <Send className="size-3.5 me-1.5" />
            {submitting ? "Submitting..." : "Send Feedback to Academic Team"}
          </Button>
        </form>

        {/* Existing Feedback & Upvote Board */}
        <div className="space-y-3">
          <div className="font-bold text-foreground">Recent Student & Educator Proposals</div>
          {loading ? (
            <div className="text-muted-foreground py-4">Loading feedback board...</div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-border bg-surface-2/40 p-4 text-muted-foreground">
              Be the first to submit a proposal for curriculum review!
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pe-1">
              {items.slice(0, 10).map((it) => (
                <div
                  key={it.id}
                  className="rounded-lg border border-border bg-surface-2/60 p-3 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground truncate">{it.title}</span>
                      <span className="font-mono text-[10px] text-primary capitalize shrink-0">
                        {it.category.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                      {it.description}
                    </p>
                    <div className="text-[10px] text-muted-foreground">
                      Submitted by {it.user_name} · {it.status}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleUpvote(it.id)}
                    className="flex flex-col items-center gap-0.5 rounded-lg border border-border bg-surface-1 px-2.5 py-1.5 hover:border-primary transition-colors shrink-0"
                  >
                    <ThumbsUp className="size-3.5 text-primary" />
                    <span className="font-mono font-bold text-[11px] text-foreground">
                      {it.upvotes}
                    </span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
