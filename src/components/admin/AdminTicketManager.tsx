import { useState, useEffect, useCallback } from "react";
import {
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Shield,
  Send,
  Lock,
  User,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ModernSelect } from "@/components/ui/modern-select";
import {
  fetchAllSupportTickets,
  addTicketReply,
  updateTicketStatus,
  type SupportTicket,
  type SupportTicketStatus,
  type SupportTicketCategory,
} from "@/lib/support-service";
import { toast } from "sonner";

export function AdminTicketManager() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<SupportTicketStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<SupportTicketCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [replyText, setReplyText] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [newStatus, setNewStatus] = useState<SupportTicketStatus | "">("");
  const [resolutionNotes, setResolutionNotes] = useState("");

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchAllSupportTickets();
      setTickets(data);
      setSelectedTicketId((prev) => prev ?? data[0]?.id ?? null);
    } catch (err) {
      console.error("Failed to load tickets:", err);
      setLoadError(err instanceof Error ? err.message : "Failed to load support tickets.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  const activeTicket = tickets.find((t) => t.id === selectedTicketId) || null;

  useEffect(() => {
    if (activeTicket) {
      setNewStatus(activeTicket.status);
      setResolutionNotes(activeTicket.resolution_notes || "");
    }
  }, [activeTicket]);

  const handleSendReply = async () => {
    if (!activeTicket || !replyText.trim()) return;
    setSubmittingReply(true);
    try {
      const newMsg = await addTicketReply({
        ticketId: activeTicket.id,
        message: replyText.trim(),
        isInternal: isInternalNote,
        staffRole: "staff",
      });

      setTickets((prev) =>
        prev.map((t) =>
          t.id === activeTicket.id
            ? {
                ...t,
                messages: [...(t.messages || []), newMsg],
                updated_at: new Date().toISOString(),
                status: isInternalNote ? t.status : "waiting_user",
              }
            : t,
        ),
      );
      setReplyText("");
      toast.success(isInternalNote ? "Internal note added." : "Reply sent to student.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to post reply.");
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!activeTicket || !newStatus) return;
    try {
      await updateTicketStatus(activeTicket.id, newStatus, resolutionNotes.trim() || undefined);
      setTickets((prev) =>
        prev.map((t) =>
          t.id === activeTicket.id
            ? {
                ...t,
                status: newStatus,
                resolution_notes: resolutionNotes.trim() || null,
                updated_at: new Date().toISOString(),
              }
            : t,
        ),
      );
      toast.success(`Ticket marked as ${newStatus.replace("_", " ")}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status.");
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.id.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.user_email.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header and Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold font-display text-foreground flex items-center gap-2">
            <MessageSquare className="size-5 text-primary" />
            Support Ticket Queue
          </h3>
          <Badge variant="outline" className="font-mono">
            {filteredTickets.length}
          </Badge>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={loadTickets}
          disabled={loading}
          className="size-8"
        >
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative md:col-span-1">
          <Search className="size-3.5 absolute start-3 top-3 text-muted-foreground" />
          <Input
            placeholder="Search tickets, student email, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-8 text-xs"
          />
        </div>

        <ModernSelect
          ariaLabel="Filter by ticket status"
          placeholder="All Statuses"
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as SupportTicketStatus | "all")}
          searchable
          size="sm"
          options={[
            { value: "all", label: "All Statuses" },
            { value: "open", label: "Open" },
            { value: "in_progress", label: "In Progress" },
            { value: "waiting_user", label: "Awaiting Student Reply" },
            { value: "resolved", label: "Resolved" },
            { value: "closed", label: "Closed" },
          ]}
        />

        <ModernSelect
          ariaLabel="Filter by ticket category"
          placeholder="All Categories"
          value={categoryFilter}
          onValueChange={(v) => setCategoryFilter(v as SupportTicketCategory | "all")}
          searchable
          size="sm"
          options={[
            { value: "all", label: "All Categories" },
            { value: "account", label: "Account & Profile" },
            { value: "login_verification", label: "Verification" },
            { value: "technical", label: "Technical Issues" },
            { value: "study_learning", label: "Study & Flashcards" },
            { value: "growth_map", label: "Growth Map & XP" },
            { value: "privacy_security", label: "Privacy & Security" },
            { value: "general", label: "General Inquiries" },
          ]}
        />
      </div>

      {/* Main Split Layout: Ticket List & Conversation Inspector */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Ticket List (Left) */}
        <div className="md:col-span-5 space-y-2 max-h-[600px] overflow-y-auto pe-1">
          {loading ? (
            <div className="surface-card p-6 text-center text-xs text-muted-foreground">
              Loading ticket queue...
            </div>
          ) : loadError ? (
            <div
              role="alert"
              className="surface-card border-destructive/40 bg-destructive/5 p-5 text-center space-y-2"
            >
              <p className="text-xs font-medium text-destructive">{loadError}</p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void loadTickets()}
                className="min-h-[36px] text-xs"
              >
                Retry
              </Button>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="surface-card p-6 text-center text-xs text-muted-foreground">
              No tickets found matching filters.
            </div>
          ) : (
            filteredTickets.map((ticket) => {
              const isSelected = selectedTicketId === ticket.id;
              return (
                <button
                  key={ticket.id}
                  type="button"
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={`surface-card w-full p-3.5 text-start transition-all space-y-2 ${
                    isSelected ? "border-primary bg-primary/5 shadow-sm" : "hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-semibold text-primary">{ticket.id}</span>
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      {new Date(ticket.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-foreground line-clamp-1">
                    {ticket.subject}
                  </h4>
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                    <span className="capitalize font-medium px-2 py-0.5 rounded-md bg-surface-2 border border-border">
                      {ticket.category.replace("_", " ")}
                    </span>
                    <span className="capitalize font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                      {ticket.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    From: {ticket.user_display_name} ({ticket.user_email})
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Ticket Details & Action Panel (Right) */}
        <div className="md:col-span-7">
          {activeTicket ? (
            <div className="surface-card p-5 space-y-5">
              <div className="border-b border-border/80 pb-3 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-primary">
                      {activeTicket.id}
                    </span>
                    <Badge variant="outline" className="capitalize">
                      {activeTicket.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Created {new Date(activeTicket.created_at).toLocaleString()}
                  </span>
                </div>
                <h3 className="text-base font-bold text-foreground">{activeTicket.subject}</h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="size-3.5" />
                    {activeTicket.user_display_name} ({activeTicket.user_email})
                  </span>
                  <span>•</span>
                  <span>Contact: {activeTicket.contact_preference}</span>
                  {activeTicket.attachment_url &&
                    (activeTicket.attachment_url.startsWith("http://") ||
                    activeTicket.attachment_url.startsWith("https://") ? (
                      <a
                        href={activeTicket.attachment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary flex items-center gap-1 underline"
                      >
                        <ExternalLink className="size-3" /> Attachment
                      </a>
                    ) : (
                      <span className="rounded bg-surface-2 px-2 py-0.5 text-[11px] font-mono text-foreground">
                        {activeTicket.attachment_url}
                      </span>
                    ))}
                </div>
              </div>

              {/* Status Update & Resolution Controls */}
              <div className="p-3.5 rounded-xl bg-surface-2/80 border border-border space-y-3">
                <div className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Ticket Status & Resolution</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="glow"
                    onClick={handleUpdateStatus}
                    className="h-7 text-xs"
                  >
                    Save Status Change
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <ModernSelect
                    ariaLabel="Update ticket status"
                    value={newStatus}
                    onValueChange={(v) => setNewStatus(v as SupportTicketStatus)}
                    searchable={false}
                    size="sm"
                    options={[
                      { value: "open", label: "Open" },
                      { value: "in_progress", label: "In Progress" },
                      { value: "waiting_user", label: "Awaiting Student Reply" },
                      { value: "resolved", label: "Resolved" },
                      { value: "closed", label: "Closed" },
                    ]}
                  />

                  <Input
                    placeholder="Optional resolution notes..."
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
              </div>

              {/* Message Thread */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Conversation & Internal Log ({activeTicket.messages?.length || 0})
                </div>
                <div className="space-y-2.5 max-h-72 overflow-y-auto pe-1">
                  {activeTicket.messages?.map((msg) => {
                    const isStaff = msg.sender_role === "staff";
                    const isInternal = Boolean(msg.is_internal);
                    return (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-xl text-xs space-y-1.5 ${
                          isInternal
                            ? "bg-amber-500/10 border border-amber-500/30 text-foreground"
                            : isStaff
                              ? "bg-primary/10 border border-primary/20 text-foreground ms-4"
                              : "bg-surface-2 border border-border text-foreground me-4"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <span className="font-semibold flex items-center gap-1">
                            {isInternal ? (
                              <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1">
                                <Lock className="size-3" /> Internal Staff Note
                              </span>
                            ) : isStaff ? (
                              <span className="text-primary flex items-center gap-1">
                                <Shield className="size-3" /> {msg.sender_name} (Staff)
                              </span>
                            ) : (
                              <span>{msg.sender_name} (Student)</span>
                            )}
                          </span>
                          <span>{new Date(msg.created_at).toLocaleTimeString()}</span>
                        </div>
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reply Input */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <Label htmlFor="ticket-reply" className="text-xs font-semibold">
                    Post Response
                  </Label>
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInternalNote}
                      onChange={(e) => setIsInternalNote(e.target.checked)}
                      className="rounded"
                    />
                    <span>Post as Internal Note (Hidden from Student)</span>
                  </label>
                </div>
                <Textarea
                  id="ticket-reply"
                  placeholder={
                    isInternalNote
                      ? "Write an internal diagnostic note for staff..."
                      : "Type a clear, helpful response to the student..."
                  }
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={3}
                  className="text-xs"
                />
                <div className="flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    variant={isInternalNote ? "outline" : "glow"}
                    onClick={handleSendReply}
                    disabled={submittingReply || !replyText.trim()}
                    className="gap-1.5 h-8 text-xs"
                  >
                    <Send className="size-3.5" />
                    <span>
                      {submittingReply
                        ? "Posting..."
                        : isInternalNote
                          ? "Add Internal Note"
                          : "Send to Student"}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="surface-card p-12 text-center text-xs text-muted-foreground">
              Select a ticket from the left queue to inspect and reply.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
