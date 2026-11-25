import { useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  ExternalLink,
  Heart,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  Search,
  Send,
  ShieldCheck,
  ThumbsUp,
  Trash2,
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
import type {
  CommunityPostCategory,
  CommunityPostRow,
  CommunityReactionType,
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

function CommunityPostCard({
  post,
  currentUid,
  authorDisplayName,
  isSaved,
  isAr,
  onToggleSave,
  onDeletePost,
}: {
  post: CommunityPostRow;
  currentUid: string | null;
  authorDisplayName: string;
  isSaved: boolean;
  isAr: boolean;
  onToggleSave: (postId: string, isSaved: boolean) => void;
  onDeletePost: (postId: string) => void;
}) {
  const { data: comments = [] } = useCommunityComments(post.id);
  const { data: reactions = [] } = useCommunityReactions(post.id);
  const { addComment, deleteComment, toggleReaction } = useCommunityActions();

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentBusy, setCommentBusy] = useState(false);

  const myReaction = reactions.find((r) => r.user_id === currentUid);
  const countByType = (t: CommunityReactionType) => reactions.filter((r) => r.type === t).length;

  const catLabels: Record<CommunityPostCategory, { en: string; ar: string }> = {
    general: { en: "Discussion", ar: "نقاش عام" },
    question: { en: "Question", ar: "سؤال" },
    info: { en: "Resource", ar: "معلومة مفيدة" },
    explanation: { en: "Explanation", ar: "شرح مبسّط" },
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
      await addComment({
        postId: post.id,
        authorName: authorDisplayName,
        body: commentText.trim(),
      });
      setCommentText("");
      setShowComments(true);
    } catch {
      toast.error(isAr ? "تعذر إضافة التعليق." : "Could not add comment.");
    } finally {
      setCommentBusy(false);
    }
  };

  return (
    <article className="surface-card space-y-3.5 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-sm text-foreground">{post.author_name}</span>
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
              {isAr ? catLabels[post.category].ar : catLabels[post.category].en}
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground">{post.created_at.slice(0, 10)}</div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onToggleSave(post.id, isSaved)}
            aria-label={isAr ? "حفظ المنشور" : "Save post"}
            className={`rounded-lg p-1.5 transition-colors cursor-pointer ${
              isSaved ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Bookmark className="size-4" />
          </button>
          {currentUid === post.author_id && (
            <button
              type="button"
              onClick={() => onDeletePost(post.id)}
              aria-label={isAr ? "حذف المنشور" : "Delete post"}
              className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive cursor-pointer"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
      </div>

      <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{post.body}</p>

      {post.media_url && (
        <a
          href={post.media_url}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1.5 rounded-lg bg-surface-2 px-3 py-1.5 text-xs font-medium text-primary hover:underline"
        >
          <ExternalLink className="size-3.5" />
          <span className="truncate max-w-xs">{post.media_url}</span>
        </a>
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
                onClick={() => void toggleReaction(post.id, rx.type, myReaction)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs transition-colors cursor-pointer ${
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
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <MessageSquare className="size-3.5" />
          <span>
            {comments.length} {isAr ? "تعليق" : comments.length === 1 ? "comment" : "comments"}
          </span>
        </button>
      </div>

      {showComments && (
        <div className="space-y-3 border-t border-border/60 pt-3">
          {comments.map((c) => (
            <div
              key={c.id}
              className="flex items-start justify-between gap-2 rounded-xl bg-surface-2/50 px-3 py-2 text-xs"
            >
              <div>
                <span className="font-semibold text-foreground">{c.author_name}: </span>
                <span className="text-foreground">{c.body}</span>
              </div>
              {currentUid === c.author_id && (
                <button
                  type="button"
                  onClick={() => void deleteComment(post.id, c.id)}
                  aria-label={isAr ? "حذف التعليق" : "Delete comment"}
                  className="text-muted-foreground hover:text-destructive cursor-pointer shrink-0"
                >
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </div>
          ))}

          <form onSubmit={handleAddComment} className="flex gap-2">
            <Input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={isAr ? "أضف تعليقاً مفيداً..." : "Write a helpful reply..."}
              className="h-9 text-xs"
            />
            <Button
              type="submit"
              size="sm"
              variant="outline"
              disabled={commentBusy || !commentText.trim()}
              className="h-9 gap-1 text-xs"
            >
              <Send className="size-3.5" />
              <span>{isAr ? "إرسال" : "Reply"}</span>
            </Button>
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

  const [viewFilter, setViewFilter] = useState<"all" | "saved">("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | CommunityPostCategory>("all");
  const [search, setSearch] = useState("");

  // Composer
  const [category, setCategory] = useState<CommunityPostCategory>("question");
  const [body, setBody] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [posting, setPosting] = useState(false);

  const displayName = profile?.display_name || user?.displayName || (isAr ? "طالب" : "Student");
  const savedSet = useMemo(() => new Set(savedPosts.map((s) => s.post_id)), [savedPosts]);

  const filteredPosts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter((post) => {
      if (viewFilter === "saved" && !savedSet.has(post.id)) return false;
      if (categoryFilter !== "all" && post.category !== categoryFilter) return false;
      if (!q) return true;
      return post.body.toLowerCase().includes(q) || post.author_name.toLowerCase().includes(q);
    });
  }, [posts, viewFilter, savedSet, categoryFilter, search]);

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
        body: body.trim(),
        mediaUrl: linkUrl.trim() || null,
      });
      setBody("");
      setLinkUrl("");
      toast.success(isAr ? "تم نشر مشاركتك في حلقة المعرفة." : "Posted to Knowledge Circle.");
    } catch {
      toast.error(isAr ? "تعذر نشر المشاركة." : "Could not publish post.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title={isAr ? "حلقة المعرفة" : "Knowledge Circle"}
        subtitle={
          isAr
            ? "مساحة طلابية مشتركة لطرح الأسئلة، مشاركة الشروحات، وحفظ المنشورات المفيدة بأمان."
            : "A shared student space for questions, explanations, helpful resources, and saved posts."
        }
      />

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Composer */}
        <form
          onSubmit={handleCreatePost}
          className="surface-card space-y-3.5 p-5 lg:col-span-5 h-fit"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
            <ShieldCheck className="size-4" />
            <span>
              {isAr
                ? "تنبيه أمان: لا تشارك رقم هاتفك أو بريدك الإلكتروني."
                : "Safety reminder: Keep personal emails and phone numbers private."}
            </span>
          </div>

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
              <option value="question">{isAr ? "سؤال دراسي" : "Question"}</option>
              <option value="explanation">{isAr ? "شرح مبسّط" : "Explanation"}</option>
              <option value="info">{isAr ? "معلومة أو ملخص" : "Helpful Info"}</option>
              <option value="general">{isAr ? "نقاش عام" : "General Discussion"}</option>
            </select>
          </div>

          <div>
            <Label htmlFor="post-body" className="text-xs">
              {isAr ? "المحتوى" : "Message"}
            </Label>
            <Textarea
              id="post-body"
              rows={4}
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

          <div>
            <Label htmlFor="post-link" className="text-xs">
              {isAr ? "رابط مرجعي موثوق (اختياري)" : "Reference link (optional)"}
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

          <Button
            type="submit"
            disabled={posting || !body.trim()}
            size="sm"
            variant="glow"
            className="w-full gap-1.5"
          >
            <Send className="size-3.5" />
            <span>{isAr ? "نشر في الحلقة" : "Publish Post"}</span>
          </Button>
        </form>

        {/* Feed */}
        <div className="space-y-4 lg:col-span-7">
          <div className="surface-card space-y-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-1.5">
                <Button
                  type="button"
                  size="sm"
                  variant={viewFilter === "all" ? "glow" : "outline"}
                  onClick={() => setViewFilter("all")}
                  className="h-8 text-xs"
                >
                  {isAr ? `جميع المنشورات (${posts.length})` : `All Posts (${posts.length})`}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={viewFilter === "saved" ? "glow" : "outline"}
                  onClick={() => setViewFilter("saved")}
                  className="h-8 gap-1.5 text-xs"
                >
                  <Bookmark className="size-3.5" />
                  <span>
                    {isAr ? `المحفوظة (${savedPosts.length})` : `Saved (${savedPosts.length})`}
                  </span>
                </Button>
              </div>
              <div className="relative w-full sm:w-52">
                <Search className="pointer-events-none absolute start-2.5 top-2.5 size-3.5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={isAr ? "بحث في المنشورات..." : "Search posts..."}
                  className="h-8 ps-8 text-xs"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: "all", en: "All", ar: "الكل" },
                  { id: "question", en: "Questions", ar: "الأسئلة" },
                  { id: "explanation", en: "Explanations", ar: "الشروحات" },
                  { id: "info", en: "Resources", ar: "المصادر" },
                  { id: "general", en: "General", ar: "عام" },
                ] as const
              ).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryFilter(c.id)}
                  className={`rounded-lg px-2.5 py-1 text-xs cursor-pointer ${
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

          {filteredPosts.length === 0 ? (
            <div className="surface-card p-8 text-center space-y-2">
              <HelpCircle className="mx-auto size-6 text-muted-foreground" />
              <div className="text-sm font-semibold text-foreground">
                {viewFilter === "saved"
                  ? isAr
                    ? "لا توجد منشورات محفوظة بعد"
                    : "No saved posts yet"
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
                onToggleSave={(id, currentlySaved) => void toggleSavePost(id, currentlySaved)}
                onDeletePost={(id) => void deletePost(id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
