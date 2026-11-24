import { useState } from "react";
import {
  Send,
  CheckCircle2,
  Paperclip,
  AlertCircle,
  Clock,
  ShieldCheck,
  Mail,
  MessageSquare,
} from "lucide-react";
import { BRAND } from "@/config/brand";
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
  createSupportTicket,
  type SupportTicket,
  type SupportTicketCategory,
  type SupportTicketPriority,
} from "@/lib/support-service";
import { useAuth } from "@/lib/auth";
import { isSafeHttpUrl, validateAttachmentFile } from "@/lib/safe-file";
import { toast } from "sonner";

interface SupportTicketFormProps {
  onSuccess?: (ticket: SupportTicket) => void;
  defaultCategory?: SupportTicketCategory;
}

export function SupportTicketForm({ onSuccess, defaultCategory }: SupportTicketFormProps) {
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<SupportTicketCategory>(defaultCategory || "general");
  const [priority, setPriority] = useState<SupportTicketPriority>("medium");
  const [description, setDescription] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [contactPreference, setContactPreference] = useState<"in_app" | "email">("in_app");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdTicket, setCreatedTicket] = useState<SupportTicket | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!subject.trim()) {
      const msg = "Please enter a subject for your ticket.";
      setSubmitError(msg);
      toast.error(msg);
      return;
    }
    if (!description.trim()) {
      const msg = "Please describe your issue or question.";
      setSubmitError(msg);
      toast.error(msg);
      return;
    }

    const cleanAttachment = attachmentUrl.trim();
    if (
      cleanAttachment &&
      !cleanAttachment.startsWith("Local file selected: ") &&
      !isSafeHttpUrl(cleanAttachment)
    ) {
      const msg =
        "Attachment link must start with https:// or http://, or use Attach File to include file details.";
      setSubmitError(msg);
      toast.error(msg);
      return;
    }
    if (cleanAttachment.length > 512) {
      const msg = "Attachment reference exceeds 512 characters.";
      setSubmitError(msg);
      toast.error(msg);
      return;
    }

    setSubmitting(true);
    try {
      const ticket = await createSupportTicket({
        subject: subject.trim(),
        category,
        priority,
        description: description.trim(),
        ...(cleanAttachment ? { attachment_url: cleanAttachment } : {}),
        contact_preference: contactPreference,
      });

      toast.success("Support ticket submitted successfully!", {
        description: `Ticket ID: ${ticket.id}`,
      });
      setCreatedTicket(ticket);
      if (onSuccess) {
        onSuccess(ticket);
      }
    } catch (err) {
      console.error("Failed to submit ticket:", err);
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to submit ticket. Please check your connection and try again.";
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (createdTicket) {
    return (
      <div className="surface-card p-6 md:p-8 text-center space-y-4">
        <div className="mx-auto size-14 rounded-full bg-primary/15 text-primary flex items-center justify-center">
          <CheckCircle2 className="size-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold font-display text-foreground">
            Ticket Successfully Created
          </h3>
          <p className="text-sm text-muted-foreground">
            Our support team and academic coordinators have received your inquiry.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-surface-2/80 border border-border inline-block text-left text-sm space-y-1.5 max-w-md w-full">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>Ticket Reference:</span>
            <span className="font-mono font-semibold text-primary">{createdTicket.id}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Status:</span>
            <span className="font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider text-[11px] bg-amber-500/10 px-2 py-0.5 rounded-md">
              {createdTicket.status}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Category:</span>
            <span className="font-medium capitalize">
              {createdTicket.category.replace("_", " ")}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Contact Preference:</span>
            <span className="font-medium capitalize">
              {createdTicket.contact_preference.replace("_", " ")}
            </span>
          </div>
        </div>
        <div className="pt-2 flex flex-wrap gap-2 justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setCreatedTicket(null);
              setSubject("");
              setDescription("");
              setAttachmentUrl("");
            }}
          >
            Submit Another Ticket
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="surface-card p-6 md:p-8 space-y-5">
      <div className="border-b border-border/80 pb-4">
        <h3 className="text-lg font-bold font-display text-foreground flex items-center gap-2">
          <MessageSquare className="size-5 text-primary" />
          Create Support Request
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Submit an official support request to the {BRAND.name} student success &amp; engineering
          desk.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="ticket-category" className="text-xs font-semibold">
            Category <span className="text-destructive">*</span>
          </Label>
          <Select
            value={category}
            onValueChange={(val) => setCategory(val as SupportTicketCategory)}
          >
            <SelectTrigger id="ticket-category" className="w-full">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="account">Account & Profile Problems</SelectItem>
              <SelectItem value="login_verification">Login, Email & Phone Verification</SelectItem>
              <SelectItem value="technical">Technical Issues & Bug Reports</SelectItem>
              <SelectItem value="study_learning">Study Module & Flashcards</SelectItem>
              <SelectItem value="growth_map">Growth Map & XP Progression</SelectItem>
              <SelectItem value="billing">Payments & Billing Inquiries</SelectItem>
              <SelectItem value="privacy_security">Privacy, Data & Security</SelectItem>
              <SelectItem value="general">General Questions</SelectItem>
              <SelectItem value="other">Other Inquiries</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ticket-priority" className="text-xs font-semibold">
            Priority Level
          </Label>
          <Select
            value={priority}
            onValueChange={(val) => setPriority(val as SupportTicketPriority)}
          >
            <SelectTrigger id="ticket-priority" className="w-full">
              <SelectValue placeholder="Select Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low — General question or minor note</SelectItem>
              <SelectItem value="medium">Medium — Normal inquiry or feature feedback</SelectItem>
              <SelectItem value="high">High — Impeding active study or streak</SelectItem>
              <SelectItem value="urgent">Urgent — Account locked or critical error</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ticket-subject" className="text-xs font-semibold">
          Subject / Brief Summary <span className="text-destructive">*</span>
        </Label>
        <Input
          id="ticket-subject"
          placeholder="e.g. Cannot complete email verification link or Pomodoro sound not triggering"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          maxLength={150}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ticket-description" className="text-xs font-semibold">
          Detailed Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="ticket-description"
          placeholder="Please describe what you are experiencing, what you expected to happen, and any steps you already tried..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          maxLength={3000}
          required
        />
        <div className="flex justify-between items-center text-[11px] text-muted-foreground">
          <span>Be as specific as possible to help us resolve this promptly.</span>
          <span>{description.length}/3000</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label
            htmlFor="ticket-attachment"
            className="text-xs font-semibold flex items-center gap-1.5"
          >
            <Paperclip className="size-3.5 text-muted-foreground" />
            Optional Attachment (File or Screenshot URL)
          </Label>
          <div className="flex flex-wrap gap-2 sm:flex-nowrap">
            <Input
              id="ticket-attachment"
              type="text"
              placeholder="https://... or select a file to log details"
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
              maxLength={512}
            />
            <label className="inline-flex min-h-[40px] shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-border bg-surface-2 px-3 text-xs font-medium text-foreground hover:border-primary/40">
              <Paperclip className="size-3.5 text-primary" />
              <span>Attach File</span>
              <input
                type="file"
                accept="image/*,.pdf,.txt,.log"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  const check = validateAttachmentFile(file, {
                    maxBytes: 10 * 1024 * 1024,
                    allowedMimePrefixes: ["image/", "application/pdf", "text/"],
                    allowedExtensions: [
                      ".png",
                      ".jpg",
                      ".jpeg",
                      ".webp",
                      ".gif",
                      ".pdf",
                      ".txt",
                      ".log",
                    ],
                  });
                  if (!check.ok) {
                    toast.error(check.errorEn || "Unsupported or invalid attachment file.");
                    return;
                  }
                  const sizeKb = Math.max(1, Math.round(file.size / 1024));
                  const summary = `Local file selected: ${file.name} (${sizeKb} KB)`.slice(0, 500);
                  setAttachmentUrl(summary);
                  toast.success(`File details attached: ${file.name}`);
                }}
              />
            </label>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Paste a secure https:// link for screenshots, or attach a local file to log its verified
            name and size with your ticket.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="ticket-contact-pref"
            className="text-xs font-semibold flex items-center gap-1.5"
          >
            <Mail className="size-3.5 text-muted-foreground" />
            Contact Preference
          </Label>
          <Select
            value={contactPreference}
            onValueChange={(val) => setContactPreference(val as "in_app" | "email")}
          >
            <SelectTrigger id="ticket-contact-pref" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="in_app">
                In-App Notification & Ticket Thread (Recommended)
              </SelectItem>
              <SelectItem value="email">
                Email Response to {user?.email || "registered address"}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {submitError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border/80">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 text-emerald-500" />
          <span>Tickets are strictly private between you and authorized support staff.</span>
        </div>
        <Button
          type="submit"
          variant="glow"
          disabled={submitting || !subject.trim() || !description.trim()}
          className="min-h-[44px] gap-2"
        >
          <Send className="size-4" />
          <span>{submitting ? "Submitting..." : "Send Ticket"}</span>
        </Button>
      </div>
    </form>
  );
}
