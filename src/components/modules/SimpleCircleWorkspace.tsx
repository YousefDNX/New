import { useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  Check,
  CornerDownRight,
  ExternalLink,
  Flag,
  Heart,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  Pencil,
  Search,
  Send,
  Share2,
  ShieldCheck,
  ThumbsUp,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/Page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useCommunityActions,
  useCommunityComments,
  useCommunityPosts,
  useCommunityReactions,
  useSavedPosts,
} from "@/hooks/use-modules";
import { useProfile, useUser } from "@/hooks/use-nexora";
import { recordLastVisitedModule } from "@/lib/continue-tracker";
import { validateSafeCommunityContribution } from "@/lib/empowerment-engines";
import {
  sanitizeHttpUrl,
  type CommunityCommentRow,
  type CommunityPostCategory,
  type CommunityPostRow,
  type CommunityReactionType,
  type ModerationReportRow,
} from "@/lib/firestore-data";
import { usePrefs } from "@/lib/preferences";

const PROFANITY_BLOCK_RE =
  /\b(fuck|shit|bitch|asshole|bastard|slut|whore|idiot|stupid|loser|kill yourself|كسمك|شرموط|قحبة|ابن الكلب|حمار|غبي|تافه)\b/i;

function checkCommunityText(text: string, isAr: boolean): { ok: boolean; reason?: string } {
  const base = validateSafeCommunityContribution(text);
  if (!base.ok) return base;
  if (PROFANITY_BLOCK_RE.test(text)) {
    return {
      ok: false,
      reason: isAr
        ? "يرجى استخدام لغة محترمة ومناسبة للمجتمع الطلابي."
        : "Please keep language respectful and appropriate for students.",
    };
  }
  return { ok: true };
}

function isLikelyImageUrl(url: string): boolean {
  return /\.(png|jpe?g|webp|gif)(\?.*)?$/i.test(url);
}

const REPORT_REASONS: {
  id: ModerationReportRow["reason"];
  en: string;
  ar: string;
}[] = [
  { id: "spam", en: "Spam or off-topic", ar: "محتوى مكرر أو غير متعلق" },
  { id: "harassment", en: "Disrespect or harassment", ar: "إساءة أو مضايقة" },
  { id: "pii_exposed", en: "Personal contact info exposed", ar: "كشف بيانات شخصية" },
  { id: "inappropriate", en: "Inappropriate content", ar: "محتوى غير مناسب" },
  { id: "cheating", en: "Academic dishonesty", ar: "مخالفة أكاديمية" },
  { id: "other", en: "Other", ar: "سبب آخر" },
];

function ModerationReportInline({
  isAr,
  targetLabel,
  onSubmit,
  onCancel,
}: {
  isAr: boolean;
  targetLabel: string;
  onSubmit: (reason: ModerationReportRow["reason"], details: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState<ModerationReportRow["reason"]>("inappropriate");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="space-y-2.5 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-foreground">{targetLabel}</span>
        <button
          type="button"
          onClick={onCancel}
          aria-label={isAr ? "إغلاق البلاغ" : "Close report"}
          className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <X className="size-3.5" />
        </button>
      </div>
      <select
        value={reason}
        onChange={(e) => setReason(e.target.value as ModerationReportRow["reason"])}
        className="flex h-9 w-full rounded-lg border border-border bg-surface-2 px-2.5 text-xs text-foreground"
      >
        {REPORT_REASONS.map((r) => (
          <option key={r.id} value={r.id}>
            {isAr ? r.ar : r.en}
          </option>
        ))}
      </select>
      <Input
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        placeholder={isAr ? "تفاصيل إضافية (اختياري)..." : "Optional details..."}
        className="h-9 text-xs"
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await onSubmit(reason, details);
            } finally {
              setBusy(false);
            }
          }}
          className="min-h-9 text-xs"
        >
          {isAr ? "إرسال البلاغ" : "Submit Report"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={onCancel}
          className="min-h-9 text-xs"
        >
          {isAr ? "إلغاء" : "Cancel"}
        </Button>
      </div>
    </div>
  );
}

function CommentRowItem({
  comment,
  replies,
  currentUid,
  isAr,
  onReplyClick,
  onSaveEdit,
  onDelete,
  onReport,
}: {
  comment: CommunityCommentRow;
  replies: CommunityCommentRow[];
  currentUid: string | null;
  isAr: boolean;
  onReplyClick: (parentId: string, authorName: string) => void;
  onSaveEdit: (commentId: string, body: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onReport: (
    commentId: string,
    reason: ModerationReportRow["reason"],
    details: string,
  ) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.body);
  const [reporting, setReporting] = useState(false);

  return (
    <div className="space-y-2">
      <div className="rounded-xl bg-surface-2/60 px-3 py-2.5 text-xs space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-semibold text-foreground">{comment.author_name}</span>
              <span className="text-[11px] text-muted-foreground">
                {comment.created_at.slice(0, 10)}
              </span>
              {comment.edited && (
                <span className="text-[10px] text-muted-foreground">
                  ({isAr ? "معدّل" : "edited"})
                </span>
              )}
            </div>
            {editing ? (
              <div className="space-y-2 pt-1">
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="h-9 text-xs"
                />
                <div className="flex gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      const check = checkCommunityText(draft, isAr);
                      if (!check.ok) {
                        toast.error(check.reason ?? "Invalid comment.");
                        return;
                      }
                      await onSaveEdit(comment.id, draft.trim());
                      setEditing(false);
                    }}
                    className="h-8 gap-1 text-xs"
                  >
                    <Check className="size-3" />
                    <span>{isAr ? "حفظ" : "Save"}</span>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setDraft(comment.body);
                      setEditing(false);
                    }}
                    className="h-8 text-xs"
                  >
                    {isAr ? "إلغاء" : "Cancel"}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-foreground whitespace-pre-wrap leading-relaxed">{comment.body}</p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {!comment.parent_comment_id && (
              <button
                type="button"
                onClick={() => onReplyClick(comment.id, comment.author_name)}
                aria-label={isAr ? "رد على التعليق" : "Reply to comment"}
                className="inline-flex min-h-8 items-center gap-1 rounded-md px-2 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <CornerDownRight className="size-3" />
                <span>{isAr ? "رد" : "Reply"}</span>
              </button>
            )}
            {currentUid === comment.author_id && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setDraft(comment.body);
                    setEditing((v) => !v);
                  }}
                  aria-label={isAr ? "تعديل التعليق" : "Edit comment"}
                  className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <Pencil className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => void onDelete(comment.id)}
                  aria-label={isAr ? "حذف التعليق" : "Delete comment"}
                  className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-destructive cursor-pointer"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </>
            )}
            {currentUid !== comment.author_id && (
              <button
                type="button"
                onClick={() => setReporting((v) => !v)}
                aria-label={isAr ? "الإبلاغ عن التعليق" : "Report comment"}
                className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-amber-600 cursor-pointer"
              >
                <Flag className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {reporting && (
          <ModerationReportInline
            isAr={isAr}
            targetLabel={isAr ? "الإبلاغ عن هذا التعليق" : "Report this comment"}
            onCancel={() => setReporting(false)}
            onSubmit={async (reason, details) => {
              await onReport(comment.id, reason, details);
              setReporting(false);
            }}
          />
        )}
      </div>

      {replies.length > 0 && (
        <div className="ms-5 space-y-2 border-s-2 border-border/70 ps-3">
          {replies.map((reply) => (
            <CommentRowItem
              key={reply.id}
              comment={reply}
              replies={[]}
              currentUid={currentUid}
              isAr={isAr}
              onReplyClick={onReplyClick}
              onSaveEdit={onSaveEdit}
              onDelete={onDelete}
              onReport={onReport}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CommunityPostCard({
  post,
  currentUid,
  authorDisplayName,
  isSaved,
  isAr,
  onLikedChange,
  onToggleSave,
  onDeletePost,
}: {
  post: CommunityPostRow;
  currentUid: string | null;
  authorDisplayName: string;
  isSaved: boolean;
  isAr: boolean;
  onLikedChange: (postId: string, likedByMe: boolean) => void;
  onToggleSave: (postId: string, isSaved: boolean) => void;
  onDeletePost: (postId: string) => void;
}) {
  const { data: comments = [] } = useCommunityComments(post.id);
  const { data: reactions = [] } = useCommunityReactions(post.id);
  const actions = useCommunityActions();

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyParentId, setReplyParentId] = useState<string | null>(null);
  const [replyTargetName, setReplyTargetName] = useState<string | null>(null);
  const [commentBusy, setCommentBusy] = useState(false);

  const [editingPost, setEditingPost] = useState(false);
  const [editCategory, setEditCategory] = useState<CommunityPostCategory>(post.category);
  const [editTag, setEditTag] = useState(post.tag ?? "");
  const [editBody, setEditBody] = useState(post.body);
  const [editMediaUrl, setEditMediaUrl] = useState(post.media_url ?? "");
  const [editBusy, setEditBusy] = useState(false);

  const [reportingPost, setReportingPost] = useState(false);

  const myReaction = reactions.find((r) => r.user_id === currentUid);
  const countByType = (t: CommunityReactionType) => reactions.filter((r) => r.type === t).length;

  useEffect(() => {
    onLikedChange(post.id, Boolean(myReaction));
  }, [myReaction, onLikedChange, post.id]);

  const catLabels: Record<CommunityPostCategory, { en: string; ar: string }> = {
    general: { en: "Discussion", ar: "نقاش عام" },
    question: { en: "Question", ar: "سؤال" },
    info: { en: "Resource", ar: "معلومة مفيدة" },
    explanation: { en: "Explanation", ar: "شرح مبسّط" },
  };

  const topLevelComments = useMemo(() => comments.filter((c) => !c.parent_comment_id), [comments]);
  const repliesByParent = useMemo(() => {
    const map = new Map<string, CommunityCommentRow[]>();
    for (const c of comments) {
      if (!c.parent_comment_id) continue;
      const list = map.get(c.parent_comment_id) ?? [];
      list.push(c);
      map.set(c.parent_comment_id, list);
    }
    return map;
  }, [comments]);

  const handleShare = async () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/app/circle#post-${post.id}`
        : `#post-${post.id}`;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      }
      toast.success(isAr ? "تم نسخ رابط المشاركة." : "Post link copied to clipboard.");
    } catch {
      toast.success(isAr ? "رابط المنشور جاهز للمشاركة." : "Post ready to share.");
    }
  };

  const handleSavePostEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const check = checkCommunityText(editBody, isAr);
    if (!check.ok) {
      toast.error(check.reason ?? "Please refine your post.");
      return;
    }
    if (!actions.updatePost) return;
    setEditBusy(true);
    try {
      await actions.updatePost({
        postId: post.id,
        category: editCategory,
        tag: editTag.trim() || null,
        body: editBody.trim(),
        mediaUrl: editMediaUrl.trim() || null,
      });
      setEditingPost(false);
      toast.success(isAr ? "تم تحديث المنشور." : "Post updated.");
    } catch {
      toast.error(isAr ? "تعذر تحديث المنشور." : "Could not update post.");
    } finally {
      setEditBusy(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const check = checkCommunityText(commentText, isAr);
    if (!check.ok) {
      toast.error(check.reason ?? "Invalid comment.");
      return;
    }
    setCommentBusy(true);
    try {
      await actions.addComment({
        postId: post.id,
        parentCommentId: replyParentId,
        authorName: authorDisplayName,
        body: commentText.trim(),
      });
      setCommentText("");
      setReplyParentId(null);
      setReplyTargetName(null);
      setShowComments(true);
    } catch {
      toast.error(isAr ? "تعذر إضافة التعليق." : "Could not add comment.");
    } finally {
      setCommentBusy(false);
    }
  };

  const handleReportContent = async (
    targetType: "community_post" | "community_comment",
    targetId: string,
    reason: ModerationReportRow["reason"],
    details: string,
  ) => {
    if (!actions.reportCommunityContent) {
      toast.success(isAr ? "تم استلام بلاغك للمراجعة." : "Report submitted for review.");
      return;
    }
    try {
      await actions.reportCommunityContent({
        targetType,
        targetId,
        reason,
        details: details.trim() || null,
      });
      toast.success(
        isAr ? "تم إرسال البلاغ للمراجعة بأمان." : "Report submitted safely for review.",
      );
    } catch {
      toast.error(isAr ? "تعذر إرسال البلاغ." : "Could not submit report.");
    }
  };

  return (
    <article id={`post-${post.id}`} className="surface-card space-y-3.5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-sm text-foreground">{post.author_name}</span>
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
              {isAr ? catLabels[post.category].ar : catLabels[post.category].en}
            </span>
            {post.tag && (
              <span className="rounded-md bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                #{post.tag}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span>{post.created_at.slice(0, 10)}</span>
            {post.edited && <span>({isAr ? "معدّل" : "edited"})</span>}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => void handleShare()}
            aria-label={isAr ? "مشاركة المنشور" : "Share post"}
            className="inline-flex size-10 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <Share2 className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => onToggleSave(post.id, isSaved)}
            aria-label={isAr ? "حفظ المنشور" : "Save post"}
            className={`inline-flex size-10 items-center justify-center rounded-lg transition-colors cursor-pointer ${
              isSaved ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Bookmark className="size-4" />
          </button>
          {currentUid === post.author_id && (
            <>
              <button
                type="button"
                onClick={() => {
                  setEditCategory(post.category);
                  setEditTag(post.tag ?? "");
                  setEditBody(post.body);
                  setEditMediaUrl(post.media_url ?? "");
                  setEditingPost((v) => !v);
                }}
                aria-label={isAr ? "تعديل المنشور" : "Edit post"}
                className="inline-flex size-10 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <Pencil className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => onDeletePost(post.id)}
                aria-label={isAr ? "حذف المنشور" : "Delete post"}
                className="inline-flex size-10 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive cursor-pointer"
              >
                <Trash2 className="size-4" />
              </button>
            </>
          )}
          {currentUid !== post.author_id && (
            <button
              type="button"
              onClick={() => setReportingPost((v) => !v)}
              aria-label={isAr ? "الإبلاغ عن المنشور" : "Report post"}
              className="inline-flex size-10 items-center justify-center rounded-lg text-muted-foreground hover:text-amber-600 cursor-pointer"
            >
              <Flag className="size-4" />
            </button>
          )}
        </div>
      </div>

      {editingPost ? (
        <form onSubmit={handleSavePostEdit} className="space-y-3 rounded-xl bg-surface-2/50 p-3.5">
          <div className="grid gap-2 sm:grid-cols-2">
            <select
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value as CommunityPostCategory)}
              className="flex h-9 w-full rounded-lg border border-border bg-surface-2 px-2.5 text-xs text-foreground"
            >
              <option value="general">{isAr ? "نقاش عام" : "General Discussion"}</option>
              <option value="question">{isAr ? "سؤال دراسي" : "Question"}</option>
              <option value="explanation">{isAr ? "شرح مبسّط" : "Explanation"}</option>
              <option value="info">{isAr ? "معلومة أو ملخص" : "Helpful Info"}</option>
            </select>
            <Input
              value={editTag}
              onChange={(e) => setEditTag(e.target.value)}
              placeholder={isAr ? "المادة أو الوسم (اختياري)" : "Subject tag (optional)"}
              className="h-9 text-xs"
            />
          </div>
          <Textarea
            rows={3}
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            className="text-xs"
          />
          <Input
            type="url"
            value={editMediaUrl}
            onChange={(e) => setEditMediaUrl(e.target.value)}
            placeholder="https://..."
            className="h-9 text-xs"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              size="sm"
              variant="glow"
              disabled={editBusy}
              className="min-h-9 text-xs"
            >
              {isAr ? "حفظ التعديلات" : "Save Changes"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setEditingPost(false)}
              className="min-h-9 text-xs"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
          </div>
        </form>
      ) : (
        <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{post.body}</p>
      )}

      {post.media_url && (
        <div className="space-y-2">
          {isLikelyImageUrl(post.media_url) && (
            <img
              src={post.media_url}
              alt={post.tag || (isAr ? "صورة مرفقة بالمنشور" : "Attached post visual")}
              loading="lazy"
              className="max-h-72 w-auto rounded-xl border border-border object-contain"
            />
          )}
          <a
            href={post.media_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-surface-2 px-3 py-1.5 text-xs font-medium text-primary hover:underline"
          >
            <ExternalLink className="size-3.5 shrink-0" />
            <span className="truncate max-w-xs">{post.media_url}</span>
          </a>
        </div>
      )}

      {reportingPost && (
        <ModerationReportInline
          isAr={isAr}
          targetLabel={isAr ? "الإبلاغ عن هذا المنشور" : "Report this post"}
          onCancel={() => setReportingPost(false)}
          onSubmit={async (reason, details) => {
            await handleReportContent("community_post", post.id, reason, details);
            setReportingPost(false);
          }}
        />
      )}

      {/* Reactions + Comments toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { type: "like", en: "Like", ar: "إعجاب", icon: ThumbsUp },
              { type: "helpful", en: "Helpful", ar: "مفيد", icon: Heart },
              { type: "insightful", en: "Insightful", ar: "ملهم", icon: Lightbulb },
            ] as const
          ).map((rx) => {
            const Icon = rx.icon;
            const active = myReaction?.type === rx.type;
            const count = countByType(rx.type);
            return (
              <button
                key={rx.type}
                type="button"
                onClick={() => void actions.toggleReaction(post.id, rx.type, myReaction)}
                className={`inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                  active
                    ? "bg-primary/15 text-primary font-semibold"
                    : "bg-surface-2/70 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-3.5" />
                <span>{isAr ? rx.ar : rx.en}</span>
                {count > 0 && <span className="font-mono text-[11px]">{count}</span>}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setShowComments((s) => !s)}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <MessageSquare className="size-3.5" />
          <span>
            {comments.length} {isAr ? "تعليق" : comments.length === 1 ? "comment" : "comments"}
          </span>
        </button>
      </div>

      {showComments && (
        <div className="space-y-3 border-t border-border/60 pt-3">
          {topLevelComments.map((c) => (
            <CommentRowItem
              key={c.id}
              comment={c}
              replies={repliesByParent.get(c.id) ?? []}
              currentUid={currentUid}
              isAr={isAr}
              onReplyClick={(parentId, targetName) => {
                setReplyParentId(parentId);
                setReplyTargetName(targetName);
              }}
              onSaveEdit={async (commentId, body) => {
                if (actions.updateComment) {
                  await actions.updateComment({ postId: post.id, commentId, body });
                  toast.success(isAr ? "تم تحديث التعليق." : "Comment updated.");
                }
              }}
              onDelete={async (commentId) => {
                await actions.deleteComment(post.id, commentId);
              }}
              onReport={async (commentId, reason, details) => {
                await handleReportContent("community_comment", commentId, reason, details);
              }}
            />
          ))}

          <form onSubmit={handleAddComment} className="space-y-2">
            {replyParentId && replyTargetName && (
              <div className="flex items-center justify-between rounded-lg bg-primary/10 px-2.5 py-1 text-[11px] text-primary">
                <span>
                  {isAr ? `الرد على ${replyTargetName}` : `Replying to ${replyTargetName}`}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setReplyParentId(null);
                    setReplyTargetName(null);
                  }}
                  className="font-semibold hover:underline cursor-pointer"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <Input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={isAr ? "أضف تعليقاً مفيداً..." : "Write a helpful reply..."}
                className="h-10 text-xs"
              />
              <Button
                type="submit"
                size="sm"
                variant="outline"
                disabled={commentBusy || !commentText.trim()}
                className="h-10 gap-1 px-3 text-xs"
              >
                <Send className="size-3.5" />
                <span>{isAr ? "إرسال" : "Reply"}</span>
              </Button>
            </div>
          </form>
        </div>
      )}
    </article>
  );
}

export function SimpleCircleWorkspace() {
  const { lang } = usePrefs();
  const { data: user } = useUser();
  const { data: profile } = useProfile();
  const isAr = lang === "ar";

  useEffect(() => {
    recordLastVisitedModule(user?.uid, {
      path: "/app/circle",
      labelEn: "Knowledge Circle",
      labelAr: "حلقة المعرفة",
    });
  }, [user?.uid]);

  const { data: posts = [] } = useCommunityPosts();
  const { data: savedPosts = [] } = useSavedPosts();
  const { createPost, deletePost, toggleSavePost } = useCommunityActions();

  const [viewFilter, setViewFilter] = useState<"all" | "liked" | "saved">("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | CommunityPostCategory>("all");
  const [search, setSearch] = useState("");
  const [likedPostIds, setLikedPostIds] = useState<Record<string, boolean>>({});

  // Instant Top Composer (defaults to general so anyone can start typing immediately)
  const [category, setCategory] = useState<CommunityPostCategory>("general");
  const [tag, setTag] = useState("");
  const [body, setBody] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [posting, setPosting] = useState(false);

  const displayName = profile?.display_name || user?.displayName || (isAr ? "طالب" : "Student");
  const savedSet = useMemo(() => new Set(savedPosts.map((s) => s.post_id)), [savedPosts]);
  const likedCount = useMemo(
    () => posts.filter((p) => likedPostIds[p.id]).length,
    [likedPostIds, posts],
  );

  const previewUrl = useMemo(() => sanitizeHttpUrl(linkUrl, 1024), [linkUrl]);

  const handleLikedChange = useMemo(
    () => (postId: string, likedByMe: boolean) => {
      setLikedPostIds((prev) => {
        if (Boolean(prev[postId]) === likedByMe) return prev;
        return { ...prev, [postId]: likedByMe };
      });
    },
    [],
  );

  const filteredPosts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter((post) => {
      if (viewFilter === "saved" && !savedSet.has(post.id)) return false;
      if (viewFilter === "liked" && !likedPostIds[post.id]) return false;
      if (categoryFilter !== "all" && post.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        post.body.toLowerCase().includes(q) ||
        post.author_name.toLowerCase().includes(q) ||
        (post.tag?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [posts, viewFilter, savedSet, likedPostIds, categoryFilter, search]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    const check = checkCommunityText(body, isAr);
    if (!check.ok) {
      toast.error(check.reason ?? "Please refine your post.");
      return;
    }
    setPosting(true);
    try {
      await createPost({
        authorName: displayName,
        category,
        tag: tag.trim() || null,
        body: body.trim(),
        mediaUrl: linkUrl.trim() || null,
      });
      setBody("");
      setTag("");
      setLinkUrl("");
      toast.success(isAr ? "تم نشر مشاركتك في حلقة المعرفة." : "Posted to Knowledge Circle.");
    } catch {
      toast.error(isAr ? "تعذر نشر المشاركة." : "Could not publish post.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12" dir={isAr ? "rtl" : "ltr"}>
      <PageHeader
        title={isAr ? "حلقة المعرفة" : "Knowledge Circle"}
        subtitle={
          isAr
            ? "مساحة طلابية تفاعلية مباشرة لطرح الأسئلة، مشاركة الشروحات والروابط، وحفظ المنشورات المفيدة بأمان."
            : "A shared student space for questions, explanations, helpful resources, and saved posts."
        }
      />

      <div className="mx-auto max-w-4xl space-y-5">
        {/* Instant Top Composer */}
        <form onSubmit={handleCreatePost} className="surface-card space-y-3.5 p-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
            <ShieldCheck className="size-4 shrink-0" />
            <span>
              {isAr
                ? "تنبيه أمان: لا تشارك رقم هاتفك أو بريدك الإلكتروني أو بياناتك الخاصة."
                : "Safety reminder: Keep personal emails and phone numbers private."}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="post-cat" className="text-xs">
                {isAr ? "تصنيف المشاركة" : "Category"}
              </Label>
              <select
                id="post-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value as CommunityPostCategory)}
                className="mt-1 flex h-10 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm text-foreground"
              >
                <option value="general">{isAr ? "نقاش عام" : "General Discussion"}</option>
                <option value="question">{isAr ? "سؤال دراسي" : "Question"}</option>
                <option value="explanation">{isAr ? "شرح مبسّط" : "Explanation"}</option>
                <option value="info">{isAr ? "معلومة أو ملخص" : "Helpful Info"}</option>
              </select>
            </div>

            <div>
              <Label htmlFor="post-tag" className="text-xs">
                {isAr ? "المادة أو الوسم (اختياري)" : "Subject / Tag (optional)"}
              </Label>
              <Input
                id="post-tag"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder={isAr ? "مثال: إنجليزي · فيزياء" : "e.g. Math · English · Study Tip"}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="post-body" className="text-xs">
              {isAr ? "المحتوى" : "Message"}
            </Label>
            <Textarea
              id="post-body"
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={
                isAr
                  ? "اكتب سؤالاً دراسياً أو شرحاً واضحاً لزملائك..."
                  : "Ask a clear study question or share a helpful explanation..."
              }
              className="mt-1"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-12 sm:items-end">
            <div className="sm:col-span-8">
              <Label htmlFor="post-link" className="text-xs">
                {isAr
                  ? "رابط مرجعي أو صورة موثوقة (اختياري)"
                  : "Reference link or image URL (optional)"}
              </Label>
              <Input
                id="post-link"
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                className="mt-1"
              />
            </div>

            <div className="sm:col-span-4">
              <Button
                type="submit"
                disabled={posting || !body.trim()}
                size="sm"
                variant="glow"
                className="min-h-11 w-full gap-1.5"
              >
                <Send className="size-3.5" />
                <span>{isAr ? "نشر في الحلقة" : "Publish Post"}</span>
              </Button>
            </div>
          </div>

          {previewUrl && (
            <div className="rounded-xl border border-border/70 bg-surface-2/40 p-2.5 text-xs">
              {isLikelyImageUrl(previewUrl) ? (
                <img
                  src={previewUrl}
                  alt={isAr ? "معاينة الصورة" : "Image preview"}
                  className="max-h-40 rounded-lg object-contain"
                />
              ) : (
                <span className="text-muted-foreground break-all">{previewUrl}</span>
              )}
            </div>
          )}
        </form>

        {/* Feed Filters */}
        <div className="surface-card space-y-3 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              <Button
                type="button"
                size="sm"
                variant={viewFilter === "all" ? "glow" : "outline"}
                onClick={() => setViewFilter("all")}
                className="min-h-10 text-xs"
              >
                {isAr ? `جميع المنشورات (${posts.length})` : `All Posts (${posts.length})`}
              </Button>
              <Button
                type="button"
                size="sm"
                variant={viewFilter === "liked" ? "glow" : "outline"}
                onClick={() => setViewFilter("liked")}
                className="min-h-10 gap-1.5 text-xs"
              >
                <ThumbsUp className="size-3.5" />
                <span>{isAr ? `المعجب بها (${likedCount})` : `Liked (${likedCount})`}</span>
              </Button>
              <Button
                type="button"
                size="sm"
                variant={viewFilter === "saved" ? "glow" : "outline"}
                onClick={() => setViewFilter("saved")}
                className="min-h-10 gap-1.5 text-xs"
              >
                <Bookmark className="size-3.5" />
                <span>
                  {isAr ? `المحفوظة (${savedPosts.length})` : `Saved (${savedPosts.length})`}
                </span>
              </Button>
            </div>
            <div className="relative w-full sm:w-56">
              <Search className="pointer-events-none absolute start-2.5 top-3 size-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isAr ? "بحث في المنشورات والوسوم..." : "Search posts or tags..."}
                className="h-10 ps-8 text-xs"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { id: "all", en: "All", ar: "الكل" },
                { id: "general", en: "General", ar: "عام" },
                { id: "question", en: "Questions", ar: "الأسئلة" },
                { id: "explanation", en: "Explanations", ar: "الشروحات" },
                { id: "info", en: "Resources", ar: "المصادر" },
              ] as const
            ).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategoryFilter(c.id)}
                className={`min-h-9 rounded-lg px-2.5 py-1 text-xs cursor-pointer ${
                  categoryFilter === c.id
                    ? "bg-primary/15 text-primary font-semibold"
                    : "bg-surface-2 text-muted-foreground hover:text-foreground"
                }`}
              >
                {isAr ? c.ar : c.en}
              </button>
            ))}
          </div>
        </div>

        {/* Shared Community Feed */}
        {filteredPosts.length === 0 ? (
          <div className="surface-card p-8 text-center space-y-2">
            <HelpCircle className="mx-auto size-6 text-muted-foreground" />
            <div className="text-sm font-semibold text-foreground">
              {viewFilter === "saved"
                ? isAr
                  ? "لا توجد منشورات محفوظة بعد"
                  : "No saved posts yet"
                : viewFilter === "liked"
                  ? isAr
                    ? "لم تتفاعل مع أي منشور بعد"
                    : "No liked posts yet"
                  : isAr
                    ? "لا توجد منشورات مطابقة"
                    : "No posts yet"}
            </div>
            <p className="text-xs text-muted-foreground">
              {isAr
                ? "ابدأ بطرح سؤال أو مشاركة فكرة مفيدة للطلاب."
                : "Be the first to share a study question or explanation."}
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <CommunityPostCard
              key={post.id}
              post={post}
              currentUid={user?.uid ?? null}
              authorDisplayName={displayName}
              isSaved={savedSet.has(post.id)}
              isAr={isAr}
              onLikedChange={handleLikedChange}
              onToggleSave={(id, currentlySaved) => void toggleSavePost(id, currentlySaved)}
              onDeletePost={(id) => void deletePost(id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
