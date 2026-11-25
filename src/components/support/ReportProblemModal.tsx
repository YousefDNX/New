import { useState } from "react";
import { Bug, Send, CheckCircle2, AlertTriangle, Monitor, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ModernSelect } from "@/components/ui/modern-select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createTechnicalReport, type TechReportCategory } from "@/lib/support-service";
import { isSafeHttpUrl } from "@/lib/safe-file";
import { toast } from "sonner";
import { BRAND } from "@/config/brand";

interface ReportProblemModalProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ReportProblemModal({ trigger, open, onOpenChange }: ReportProblemModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const effectiveOpen = open !== undefined ? open : isOpen;
  const setEffectiveOpen = onOpenChange || setIsOpen;

  const [category, setCategory] = useState<TechReportCategory>("broken_button");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [stepsToReproduce, setStepsToReproduce] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!title.trim()) {
      const msg = "Please enter a short title for the problem.";
      setSubmitError(msg);
      toast.error(msg);
      return;
    }
    if (!description.trim()) {
      const msg = "Please describe what went wrong.";
      setSubmitError(msg);
      toast.error(msg);
      return;
    }
    const cleanAttachment = attachmentUrl.trim();
    if (cleanAttachment && !isSafeHttpUrl(cleanAttachment)) {
      const msg = "Screenshot URL must start with https:// or http://.";
      setSubmitError(msg);
      toast.error(msg);
      return;
    }

    setSubmitting(true);
    try {
      const id = await createTechnicalReport({
        category,
        title: title.trim(),
        description: description.trim(),
        steps_to_reproduce: stepsToReproduce.trim(),
        ...(cleanAttachment ? { attachment_url: cleanAttachment } : {}),
      });

      setSubmittedId(id);
      toast.success(`Bug report logged. Thank you for helping improve ${BRAND.name}!`, {
        description: `Reference: ${id}`,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to log technical report.";
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmittedId(null);
    setSubmitError(null);
    setTitle("");
    setDescription("");
    setStepsToReproduce("");
    setAttachmentUrl("");
  };

  return (
    <Dialog
      open={effectiveOpen}
      onOpenChange={(v) => {
        setEffectiveOpen(v);
        if (!v) resetForm();
      }}
    >
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-lg bg-surface border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground font-display">
            <Bug className="size-5 text-destructive" />
            Report a Technical Problem
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Encountered a bug, broken button, or unexpected crash? Let our engineering team know.
          </DialogDescription>
        </DialogHeader>

        {submittedId ? (
          <div className="py-6 text-center space-y-3">
            <div className="size-12 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="size-6" />
            </div>
            <h4 className="text-base font-bold text-foreground">Report Received</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Your diagnostic report has been filed under{" "}
              <span className="font-mono text-primary font-semibold">{submittedId}</span>. Our team
              investigates high-priority tickets within 24 hours.
            </p>
            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEffectiveOpen(false)}
              >
                Close Window
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <ModernSelect
              id="tech-category"
              label="Problem Category"
              value={category}
              onValueChange={(v) => setCategory(v as TechReportCategory)}
              searchable
              searchPlaceholder="Search problem types..."
              options={[
                { value: "broken_button", label: "Button or click does not respond" },
                { value: "page_not_loading", label: "Page not loading or blank screen" },
                { value: "incorrect_result", label: "Incorrect calculation or XP discrepancy" },
                { value: "auth_problem", label: "Session or verification issue" },
                { value: "settings_not_saving", label: "Settings or theme not persisting" },
                { value: "unexpected_error", label: "Unexpected crash or red error banner" },
                { value: "other", label: "Other technical glitch" },
              ]}
            />

            <div className="space-y-1.5">
              <Label htmlFor="tech-title" className="text-xs font-semibold">
                What happened? (Title) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="tech-title"
                placeholder="e.g. Timer stops counting when switching tabs"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tech-desc" className="text-xs font-semibold">
                What went wrong? <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="tech-desc"
                placeholder="Describe what occurred..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tech-steps" className="text-xs font-semibold">
                Steps to Reproduce
              </Label>
              <Textarea
                id="tech-steps"
                placeholder="1. Go to Study > Focus Timer&#10;2. Click Start&#10;3. Switch to another tab"
                value={stepsToReproduce}
                onChange={(e) => setStepsToReproduce(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="tech-attachment"
                className="text-xs font-semibold flex items-center gap-1"
              >
                <LinkIcon className="size-3 text-muted-foreground" />
                Optional Screenshot URL
              </Label>
              <Input
                id="tech-attachment"
                placeholder="https://..."
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
              />
            </div>

            <div className="p-2.5 rounded-lg bg-surface-2 border border-border text-[11px] text-muted-foreground flex items-center gap-2">
              <Monitor className="size-4 shrink-0 text-primary" />
              <span>
                Diagnostic info (browser version and screen resolution) is automatically attached.
              </span>
            </div>

            {submitError && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
              >
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setEffectiveOpen(false)}
                className="min-h-[40px]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                size="sm"
                disabled={submitting}
                className="min-h-[40px] gap-1.5"
              >
                <Send className="size-3.5" />
                <span>{submitting ? "Submitting..." : "Send Problem Report"}</span>
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
