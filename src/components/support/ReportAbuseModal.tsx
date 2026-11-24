import { useState } from "react";
import { ShieldAlert, Send, CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createModerationReport, type ModerationCategory } from "@/lib/support-service";
import { toast } from "sonner";
import { BRAND } from "@/config/brand";

interface ReportAbuseModalProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  targetId?: string;
  targetType?: "circle_post" | "circle_member" | "comment" | "resource" | "other";
}

export function ReportAbuseModal({
  trigger,
  open,
  onOpenChange,
  targetId,
  targetType = "other",
}: ReportAbuseModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const effectiveOpen = open !== undefined ? open : isOpen;
  const setEffectiveOpen = onOpenChange || setIsOpen;

  const [category, setCategory] = useState<ModerationCategory>("harassment");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!details.trim()) {
      const msg = "Please explain the reason for your report.";
      setSubmitError(msg);
      toast.error(msg);
      return;
    }

    setSubmitting(true);
    try {
      const id = await createModerationReport({
        ...(targetId ? { reported_target_id: targetId } : {}),
        reported_target_type: targetType,
        category,
        details: details.trim(),
      });

      setSubmittedId(id);
      toast.success("Confidential report submitted to trust & safety.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to submit report.";
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmittedId(null);
    setSubmitError(null);
    setDetails("");
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
      <DialogContent className="sm:max-w-md bg-surface border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground font-display">
            <ShieldAlert className="size-5 text-rose-500" />
            Report Unsafe or Inappropriate Behavior
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            All reports are strictly confidential. The reported user will not be notified who
            submitted this report.
          </DialogDescription>
        </DialogHeader>

        {submittedId ? (
          <div className="py-6 text-center space-y-3">
            <div className="size-12 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="size-6" />
            </div>
            <h4 className="text-base font-bold text-foreground">Report Submitted Securely</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Our safety and moderation coordinators will review this incident. If urgent student
              safety is involved, immediate disciplinary action or content removal will be enforced.
            </p>
            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEffectiveOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="mod-category" className="text-xs font-semibold">
                Violation Type <span className="text-destructive">*</span>
              </Label>
              <Select value={category} onValueChange={(v) => setCategory(v as ModerationCategory)}>
                <SelectTrigger id="mod-category" className="w-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="harassment">
                    Bullying, harassment, or offensive language
                  </SelectItem>
                  <SelectItem value="inappropriate_content">
                    Explicit, violent, or inappropriate content
                  </SelectItem>
                  <SelectItem value="spam">
                    Spam, advertising, or academic cheating links
                  </SelectItem>
                  <SelectItem value="pii_exposed">
                    Personal information (phone, address) exposed
                  </SelectItem>
                  <SelectItem value="impersonation">
                    Impersonating a student, teacher, or staff
                  </SelectItem>
                  <SelectItem value="unsafe_behavior">Self-harm or safety concern</SelectItem>
                  <SelectItem value="other">Other policy violation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mod-details" className="text-xs font-semibold">
                Incident Details <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="mod-details"
                placeholder="Explain what occurred, what was said, or what rules were violated..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="p-2.5 rounded-lg bg-surface-2 border border-border text-[11px] text-muted-foreground flex items-center gap-2">
              <Lock className="size-4 shrink-0 text-emerald-500" />
              <span>{BRAND.name} strictly enforces student safety and anti-bullying policies.</span>
            </div>

            {submitError && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
              >
                <ShieldAlert className="mt-0.5 size-3.5 shrink-0" />
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
                <span>{submitting ? "Submitting..." : "Submit Confidential Report"}</span>
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
