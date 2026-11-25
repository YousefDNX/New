import { useState, useEffect } from "react";
import {
  Lightbulb,
  ThumbsUp,
  Plus,
  Filter,
  MessageSquare,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { BRAND } from "@/config/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ModernSelect } from "@/components/ui/modern-select";
import {
  fetchFeedbackItems,
  createFeedbackItem,
  toggleFeedbackUpvote,
  type FeedbackItem,
  type FeedbackCategory,
} from "@/lib/support-service";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export function FeedbackCenter() {
  const { user } = useAuth();
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<FeedbackCategory | "all">("all");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<FeedbackCategory>("feature_suggestion");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadFeedback = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchFeedbackItems();
      setItems(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load feedback items.";
      setLoadError(msg);
      console.error("Failed to load feedback items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      await createFeedbackItem({
        category,
        title: title.trim(),
        description: description.trim(),
      });
      toast.success(`Feedback submitted! Thank you for helping shape ${BRAND.name}.`);
      setTitle("");
      setDescription("");
      setShowSubmitForm(false);
      await loadFeedback();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (feedbackId: string) => {
    if (!user) {
      toast.error("Please sign in to vote on suggestions.");
      return;
    }
    // Optimistic toggle
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== feedbackId) return item;
        const alreadyUpvoted = item.upvoted_by.includes(user.uid);
        const nextUpvotedBy = alreadyUpvoted
          ? item.upvoted_by.filter((id) => id !== user.uid)
          : [...item.upvoted_by, user.uid];
        return {
          ...item,
          upvotes: nextUpvotedBy.length,
          upvoted_by: nextUpvotedBy,
        };
      }),
    );

    try {
      await toggleFeedbackUpvote(feedbackId);
    } catch (err) {
      toast.error("Failed to update vote.");
      await loadFeedback();
    }
  };

  const getStatusBadge = (status: FeedbackItem["status"]) => {
    switch (status) {
      case "planned":
        return (
          <Badge
            variant="outline"
            className="border-purple-500/50 text-purple-700 dark:text-purple-400 bg-purple-500/10"
          >
            Planned
          </Badge>
        );
      case "under_review":
        return (
          <Badge
            variant="outline"
            className="border-blue-500/50 text-blue-700 dark:text-blue-400 bg-blue-500/10"
          >
            Under Review
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="outline"
            className="border-emerald-500/50 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10"
          >
            Completed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Community Idea
          </Badge>
        );
    }
  };

  const filteredItems = items.filter((item) => {
    if (categoryFilter === "all") return true;
    return item.category === categoryFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold font-display text-foreground flex items-center gap-2">
            <Lightbulb className="size-5 text-amber-500" />
            Feedback & Student Roadmap
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Suggest new features, report usability improvements, and vote on fellow students' ideas.
          </p>
        </div>
        <Button
          type="button"
          variant="glow"
          size="sm"
          onClick={() => setShowSubmitForm(!showSubmitForm)}
          className="gap-1.5"
        >
          <Plus className="size-4" />
          <span>{showSubmitForm ? "Cancel Suggestion" : "Suggest an Idea"}</span>
        </Button>
      </div>

      {showSubmitForm && (
        <form
          onSubmit={handleSubmit}
          className="surface-card p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="font-semibold text-sm text-foreground flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            Submit Your Suggestion
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="fb-title" className="text-xs font-semibold">
                Feature Idea or Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fb-title"
                placeholder="e.g. Ambient lofi background sound during Pomodoro"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                required
              />
            </div>
            <ModernSelect
              id="fb-category"
              label="Category"
              value={category}
              onValueChange={(v) => setCategory(v as FeedbackCategory)}
              searchable={false}
              options={[
                { value: "feature_suggestion", label: "New Feature Idea" },
                { value: "usability_feedback", label: "Usability & UI Polish" },
                { value: "content_improvement", label: "Study / Quiz Content" },
                { value: "general", label: "General Suggestion" },
              ]}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fb-desc" className="text-xs font-semibold">
              Explanation & Why This Helps Students <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="fb-desc"
              placeholder="Describe how this feature would improve daily studying or organization..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowSubmitForm(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="glow" size="sm" disabled={submitting}>
              {submitting ? "Submitting..." : "Post Idea to Board"}
            </Button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-muted-foreground font-semibold flex items-center gap-1">
          <Filter className="size-3" />
          Filter:
        </span>
        {(["all", "feature_suggestion", "usability_feedback", "content_improvement"] as const).map(
          (cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              aria-pressed={categoryFilter === cat}
              className={`min-h-[38px] px-3 py-1.5 rounded-md font-medium transition-all ${
                categoryFilter === cat
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-surface-2 text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat === "all"
                ? "All Suggestions"
                : cat === "feature_suggestion"
                  ? "Features"
                  : cat === "usability_feedback"
                    ? "Usability"
                    : "Content"}
            </button>
          ),
        )}
      </div>

      {/* Community Ideas List */}
      {loading ? (
        <div className="surface-card p-8 text-center text-sm text-muted-foreground">
          Loading feedback board...
        </div>
      ) : loadError ? (
        <div
          role="alert"
          className="surface-card border-destructive/40 bg-destructive/10 p-6 flex flex-wrap items-center justify-between gap-3 text-xs text-destructive"
        >
          <span>{loadError}</span>
          <Button type="button" variant="outline" size="sm" onClick={() => void loadFeedback()}>
            Retry
          </Button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="surface-card p-8 text-center space-y-2">
          <Lightbulb className="size-8 mx-auto text-muted-foreground/60" />
          <h4 className="text-sm font-semibold text-foreground">No Ideas Yet in this Category</h4>
          <p className="text-xs text-muted-foreground">
            Be the first student to suggest an idea and start the discussion!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredItems.map((item) => {
            const hasVoted = user ? item.upvoted_by?.includes(user.uid) : false;
            return (
              <div
                key={item.id}
                className="surface-card p-4 flex gap-3 items-start justify-between transition-all hover:border-primary/40"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {getStatusBadge(item.status)}
                    <span className="text-[11px] text-muted-foreground capitalize">
                      {item.category.replace("_", " ")}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-foreground leading-snug">{item.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                  <div className="text-[10px] text-muted-foreground pt-1">
                    Suggested by {item.user_name} • {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleVote(item.id)}
                  className={`flex flex-col items-center justify-center rounded-xl p-2.5 min-w-[3.25rem] border transition-all ${
                    hasVoted
                      ? "bg-primary/15 border-primary text-primary font-bold shadow-sm"
                      : "bg-surface-2 border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                  title={hasVoted ? "Remove upvote" : "Upvote this suggestion"}
                >
                  <ThumbsUp className={`size-4 ${hasVoted ? "fill-primary" : ""}`} />
                  <span className="text-xs font-mono mt-1">{item.upvotes}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
