import { useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { READY_TO_USE_LIBRARY, type ReadyLibraryItem } from "@/data/ready-to-use-library";
import { useStudyActions } from "@/hooks/use-modules";
import { useGoalActions, useTaskActions } from "@/hooks/use-nexora";

export function ReadyToUseLibraryView({
  defaultCategory = "all",
  onItemImported,
}: {
  defaultCategory?: "all" | "study" | "tasks" | "future" | "care";
  onItemImported?: () => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>(defaultCategory);
  const [previewItem, setPreviewItem] = useState<ReadyLibraryItem | null>(null);
  const [importingId, setImportingId] = useState<string | null>(null);

  const { addStudyItem } = useStudyActions();
  const { addTask } = useTaskActions();
  const { addGoal } = useGoalActions();

  const filteredItems = READY_TO_USE_LIBRARY.filter((item) => {
    if (selectedCategory === "all") return true;
    return item.category === selectedCategory;
  });

  const handleImport = async (item: ReadyLibraryItem) => {
    setImportingId(item.id);
    try {
      if (item.category === "study" && item.deckData) {
        for (const card of item.deckData) {
          await addStudyItem({
            kind: "flashcard",
            subject: item.subject ?? "General",
            deck: item.titleEn,
            title: card.front,
            content: card.front,
            answer: card.back,
            difficulty: "medium",
          });
        }
        toast.success(`Imported ${item.deckData.length} flashcards to "${item.titleEn}" deck!`);
      } else if (item.category === "tasks" && item.tasksData) {
        for (const t of item.tasksData) {
          await addTask({
            title: t.title,
            details: t.details,
            area: "productivity",
            priority: t.priority,
          });
        }
        toast.success(`Added ${item.tasksData.length} structured tasks to your planner!`);
      } else if (item.goalData) {
        await addGoal({
          title: item.goalData.title,
          area: item.goalData.area,
          target_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
          milestones: item.goalData.milestones.map((m, idx) => ({
            id: `ms-${idx}-${Date.now()}`,
            title: m,
            done: false,
          })),
        });
        toast.success(`Adopted goal: "${item.goalData.title}"!`);
      }

      setPreviewItem(null);
      onItemImported?.();
    } catch (err) {
      toast.error("Failed to import material. Please try again.");
    } finally {
      setImportingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-3">
        {[
          { id: "all", label: "All Materials (8)" },
          { id: "study", label: "Study & Flashcards (3)" },
          { id: "tasks", label: "Project & Task Plans (2)" },
          { id: "future", label: "Career & Roadmaps (2)" },
          { id: "care", label: "Wellbeing & Reset (1)" },
        ].map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedCategory === cat.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-surface-2/60 text-muted-foreground hover:bg-surface-2 hover:text-foreground"
            }`}
          >
            {cat.label}
          </button>
        ))}
        <div className="ms-auto">
          <FeatureGuideTrigger featureId="ready-library" />
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="surface-card group flex flex-col justify-between p-5 transition-all hover:border-primary/40 hover:-translate-y-0.5"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary border border-primary/20">
                  {item.badge}
                </span>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                  {item.category.toUpperCase()}
                </span>
              </div>

              <div>
                <h3 className="font-display text-base font-bold text-foreground group-hover:text-primary transition-colors">
                  {item.titleEn}
                </h3>
                <div className="font-arabic text-xs text-muted-foreground mt-0.5">
                  {item.titleAr}
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {item.subtitleEn}
              </p>

              {/* Preview Bullets */}
              <div className="rounded-lg bg-surface-2/40 p-2.5 text-[11px] text-muted-foreground space-y-1">
                {item.previewPoints.slice(0, 2).map((point, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 line-clamp-1">
                    <span className="text-primary font-bold">·</span>
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 pt-3 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-1/2 text-xs h-8"
                onClick={() => setPreviewItem(item)}
              >
                Preview
              </Button>

              <Button
                type="button"
                variant="glow"
                size="sm"
                className="w-1/2 text-xs h-8"
                disabled={importingId === item.id}
                onClick={() => handleImport(item)}
              >
                {importingId === item.id ? "Adding..." : "Add to App"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Dialog */}
      {previewItem && (
        <Dialog open={Boolean(previewItem)} onOpenChange={() => setPreviewItem(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                <Sparkles className="size-3.5" />
                <span>{previewItem.badge}</span>
              </div>
              <DialogTitle className="font-display text-lg font-bold">
                {previewItem.titleEn}
              </DialogTitle>
              <DialogDescription className="font-arabic text-xs text-primary">
                {previewItem.titleAr}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs max-h-80 overflow-y-auto pe-1">
              <p className="text-muted-foreground leading-relaxed">{previewItem.subtitleEn}</p>

              <div className="space-y-2">
                <div className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                  Curriculum Contents ({previewItem.itemCount} Items)
                </div>
                <div className="space-y-2">
                  {previewItem.previewPoints.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-surface-2/60 border border-border/70 text-foreground"
                    >
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="flex items-center justify-between gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPreviewItem(null)}
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="glow"
                size="sm"
                disabled={importingId === previewItem.id}
                onClick={() => handleImport(previewItem)}
              >
                {importingId === previewItem.id ? "Importing..." : previewItem.actionLabelEn}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
