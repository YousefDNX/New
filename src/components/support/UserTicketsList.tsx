import { useState, useEffect, useCallback } from "react";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
  CornerDownRight,
  Shield,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  fetchUserSupportTickets,
  addTicketReply,
  type SupportTicket,
  type SupportTicketStatus,
} from "@/lib/support-service";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export function UserTicketsList() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [statusFilter, setStatusFilter] = useState<SupportTicketStatus | "all">("all");

  const loadTickets = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchUserSupportTickets(user.uid);
      setTickets(data);
    } catch (err) {
      console.error("Failed to load user tickets:", err);
      setLoadError(
        err instanceof Error
          ? err.message
          : "Unable to load your support tickets right now. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  const handleSendReply = async (ticketId: string) => {
    if (!replyText.trim()) return;
    setSendingReply(true);
    try {
      const newMsg = await addTicketReply({
        ticketId,
        message: replyText.trim(),
        staffRole: "student",
      });
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? {
                ...t,
                messages: [...(t.messages || []), newMsg],
                updated_at: new Date().toISOString(),
                status: t.status === "waiting_user" ? "in_progress" : t.status,
              }
            : t,
        ),
      );
      setReplyText("");
      toast.success("Reply added to ticket thread.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send reply.");
    } finally {
      setSendingReply(false);
    }
  };

  const getStatusBadge = (status: SupportTicketStatus) => {
    switch (status) {
      case "open":
        return (
          <Badge variant="outline" className="border-amber-500/50 text-amber-500 bg-amber-500/10">
            Open
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="outline" className="border-blue-500/50 text-blue-500 bg-blue-500/10">
            In Progress
          </Badge>
        );
      case "waiting_user":
        return (
          <Badge
            variant="outline"
            className="border-purple-500/50 text-purple-500 bg-purple-500/10"
          >
            Awaiting Your Reply
          </Badge>
        );
      case "resolved":
        return (
          <Badge
            variant="outline"
            className="border-emerald-500/50 text-emerald-500 bg-emerald-500/10"
          >
            Resolved
          </Badge>
        );
      case "closed":
        return (
          <Badge
            variant="outline"
            className="border-muted-foreground/40 text-muted-foreground bg-muted/20"
          >
            Closed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return (
          <span className="text-[10px] uppercase font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md">
            Urgent
          </span>
        );
      case "high":
        return (
          <span className="text-[10px] uppercase font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">
            High
          </span>
        );
      case "medium":
        return (
          <span className="text-[10px] uppercase font-medium text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-md">
            Medium
          </span>
        );
      default:
        return (
          <span className="text-[10px] uppercase font-medium text-muted-foreground bg-muted/20 px-2 py-0.5 rounded-md">
            Low
          </span>
        );
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter === "all") return true;
    return t.status === statusFilter;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-foreground">My Support Tickets</h3>
          <span className="text-xs text-muted-foreground font-mono">({tickets.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex flex-wrap rounded-lg border border-border p-0.5 bg-surface-2 text-xs">
            {(["all", "open", "in_progress", "resolved"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`min-h-[36px] px-2.5 py-1 rounded-md transition-all capitalize font-medium ${
                  statusFilter === st
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {st.replace("_", " ")}
              </button>
            ))}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => void loadTickets()}
            disabled={loading}
            className="min-h-[40px] min-w-[40px]"
            aria-label="Refresh Tickets"
            title="Refresh Tickets"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="surface-card p-8 text-center text-sm text-muted-foreground">
          <RefreshCw className="size-5 animate-spin mx-auto mb-2 text-primary" />
          Loading your support records...
        </div>
      ) : loadError ? (
        <div
          role="alert"
          className="surface-card border-destructive/40 bg-destructive/5 p-6 text-center space-y-3"
        >
          <AlertCircle className="size-7 mx-auto text-destructive" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-foreground">Could not load tickets</h4>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">{loadError}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void loadTickets()}
            className="min-h-[40px] gap-1.5"
          >
            <RefreshCw className="size-3.5" />
            <span>Retry</span>
          </Button>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="surface-card p-8 text-center space-y-2">
          <MessageSquare className="size-8 mx-auto text-muted-foreground/60" />
          <h4 className="text-sm font-semibold text-foreground">No Tickets Found</h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {statusFilter === "all"
              ? "You haven't submitted any support requests yet. If you run into any trouble, submit a ticket above."
              : `No tickets matching filter '${statusFilter}'.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((ticket) => {
            const isExpanded = expandedTicketId === ticket.id;
            return (
              <div
                key={ticket.id}
                className="surface-card p-4 transition-all hover:border-primary/40 space-y-3"
              >
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  className="flex w-full flex-wrap items-start justify-between gap-2 text-start"
                  onClick={() => setExpandedTicketId(isExpanded ? null : ticket.id)}
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-primary">
                        {ticket.id}
                      </span>
                      {getStatusBadge(ticket.status)}
                      {getPriorityBadge(ticket.priority)}
                      <span className="text-xs text-muted-foreground capitalize">
                        • {ticket.category.replace("_", " ")}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-foreground hover:text-primary transition-colors">
                      {ticket.subject}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {ticket.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                    <span className="flex items-center gap-1 tabular-nums">
                      <Clock className="size-3" />
                      {new Date(ticket.updated_at).toLocaleDateString()}
                    </span>
                    <span className="inline-flex size-8 items-center justify-center rounded-md hover:bg-surface-2">
                      {isExpanded ? (
                        <ChevronUp className="size-4" />
                      ) : (
                        <ChevronDown className="size-4" />
                      )}
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="pt-3 border-t border-border/80 space-y-4">
                    {ticket.resolution_notes && (
                      <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-300 space-y-1">
                        <div className="font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="size-3.5" />
                          Resolution Details
                        </div>
                        <p>{ticket.resolution_notes}</p>
                      </div>
                    )}

                    <div className="space-y-2.5">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Conversation Thread ({ticket.messages?.length || 0})
                      </div>

                      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                        {ticket.messages
                          ?.filter((msg) => !msg.is_internal)
                          .map((msg) => {
                            const isStaff = msg.sender_role === "staff";
                            return (
                              <div
                                key={msg.id}
                                className={`p-3 rounded-xl text-xs space-y-1 ${
                                  isStaff
                                    ? "bg-primary/10 border border-primary/20 text-foreground ml-3 md:ml-6"
                                    : "bg-surface-2 border border-border text-foreground mr-3 md:mr-6"
                                }`}
                              >
                                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                  <span className="font-semibold flex items-center gap-1">
                                    {isStaff ? (
                                      <>
                                        <Shield className="size-3 text-primary" />
                                        {msg.sender_name} (Staff)
                                      </>
                                    ) : (
                                      <>
                                        <CornerDownRight className="size-3" />
                                        {msg.sender_name} (You)
                                      </>
                                    )}
                                  </span>
                                  <span>{new Date(msg.created_at).toLocaleString()}</span>
                                </div>
                                <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    {ticket.status !== "closed" ? (
                      <div className="space-y-2 pt-2">
                        <Textarea
                          placeholder="Type your reply to staff..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows={2}
                          className="text-xs"
                        />
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            size="sm"
                            variant="glow"
                            onClick={() => handleSendReply(ticket.id)}
                            disabled={sendingReply || !replyText.trim()}
                            className="gap-1.5 h-8 text-xs"
                          >
                            <Send className="size-3" />
                            <span>{sendingReply ? "Sending..." : "Send Reply"}</span>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        This ticket is marked closed. If you require further help, please submit a
                        new ticket.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
