import { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Eye,
  EyeOff,
  Search,
  Tag,
  RefreshCw,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ModernSelect } from "@/components/ui/modern-select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  fetchHelpArticles,
  createHelpArticle,
  updateHelpArticle,
  deleteHelpArticle,
  SEED_HELP_ARTICLES,
  type HelpArticle,
  type HelpArticleCategory,
} from "@/lib/support-service";
import { toast } from "sonner";
import { BRAND } from "@/config/brand";

export function AdminHelpEditor() {
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<HelpArticleCategory | "all">("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<HelpArticle | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState<HelpArticleCategory>("getting_started");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [stepsInput, setStepsInput] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [published, setPublished] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const data = await fetchHelpArticles("all", "", true);
      setArticles(data);
    } catch (err) {
      console.error("Failed to load articles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const openCreateDialog = () => {
    setEditingArticle(null);
    setTitle("");
    setSlug("");
    setCategory("getting_started");
    setExcerpt("");
    setContent("");
    setStepsInput("");
    setTagsInput("");
    setPublished(true);
    setDialogOpen(true);
  };

  const openEditDialog = (art: HelpArticle) => {
    setEditingArticle(art);
    setTitle(art.title);
    setSlug(art.slug);
    setCategory(art.category);
    setExcerpt(art.excerpt);
    setContent(art.content);
    setStepsInput(art.steps?.join("\n") || "");
    setTagsInput(art.tags?.join(", ") || "");
    setPublished(art.published);
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required.");
      return;
    }

    setSaving(true);
    const steps = stepsInput
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    const autoSlug =
      slug.trim() ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    try {
      if (editingArticle) {
        await updateHelpArticle(editingArticle.id, {
          title: title.trim(),
          slug: autoSlug,
          category,
          excerpt: excerpt.trim(),
          content: content.trim(),
          steps,
          tags,
          published,
        });
        toast.success("Help article updated successfully.");
      } else {
        await createHelpArticle({
          title: title.trim(),
          slug: autoSlug,
          category,
          excerpt: excerpt.trim(),
          content: content.trim(),
          steps,
          tags,
          related_article_ids: [],
          published,
          created_at: new Date().toISOString(),
          last_updated_at: new Date().toISOString(),
          author_name: `${BRAND.name} Editorial`,
        });
        toast.success("New help article published.");
      }
      setDialogOpen(false);
      await loadArticles();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save article.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, artTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${artTitle}"?`)) return;
    try {
      await deleteHelpArticle(id);
      toast.success("Article deleted.");
      await loadArticles();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete article.");
    }
  };

  const handleTogglePublish = async (art: HelpArticle) => {
    try {
      await updateHelpArticle(art.id, { published: !art.published });
      setArticles((prev) =>
        prev.map((a) => (a.id === art.id ? { ...a, published: !art.published } : a)),
      );
      toast.success(
        art.published ? "Article unpublished (draft)." : "Article published to students.",
      );
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  const filteredArticles = articles.filter((a) => {
    if (categoryFilter !== "all" && a.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.tags.some((t) => t.includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold font-display text-foreground flex items-center gap-2">
            <BookOpen className="size-5 text-primary" />
            Help Center Content Management
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Add, update, or revise documentation, user guides, and troubleshooting steps for
            students.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="glow"
            size="sm"
            onClick={openCreateDialog}
            className="gap-1.5"
          >
            <Plus className="size-4" />
            <span>Create Article</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={loadArticles}
            disabled={loading}
            className="size-8"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative md:col-span-2">
          <Search className="size-3.5 absolute start-3 top-3 text-muted-foreground" />
          <Input
            placeholder="Search articles by title, excerpt, tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-8 text-xs"
          />
        </div>
        <ModernSelect
          ariaLabel="Filter articles by category"
          placeholder="All Categories"
          value={categoryFilter}
          onValueChange={(v) => setCategoryFilter(v as HelpArticleCategory | "all")}
          searchable
          searchPlaceholder="Search categories..."
          size="sm"
          options={[
            { value: "all", label: "All Categories" },
            { value: "getting_started", label: "Getting Started" },
            { value: "account", label: "Account & Verification" },
            { value: "growth_map", label: "Growth Map & XP" },
            { value: "study", label: "Study Module" },
            { value: "productivity", label: "Productivity & Tasks" },
            { value: "ai", label: `${BRAND.name} AI` },
            { value: "settings", label: "Settings & Themes" },
            { value: "troubleshooting", label: "Troubleshooting" },
          ]}
        />
      </div>

      {/* Articles Table */}
      {loading ? (
        <div className="surface-card p-8 text-center text-xs text-muted-foreground">
          Loading help repository...
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="surface-card p-8 text-center space-y-2">
          <FileText className="size-8 mx-auto text-muted-foreground/60" />
          <h4 className="text-sm font-semibold text-foreground">No Articles Found</h4>
          <p className="text-xs text-muted-foreground">
            Try adjusting your search query or filter.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredArticles.map((art) => (
            <div
              key={art.id}
              className="surface-card p-4 flex flex-wrap items-center justify-between gap-3 transition-all hover:border-primary/40"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="font-medium capitalize text-foreground">
                    {art.category.replace("_", " ")}
                  </span>
                  <span aria-hidden="true" className="text-border">
                    ·
                  </span>
                  {art.published ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-1">
                      <Eye className="size-3" /> Published
                    </span>
                  ) : (
                    <span className="text-muted-foreground font-semibold inline-flex items-center gap-1">
                      <EyeOff className="size-3" /> Draft
                    </span>
                  )}
                  <span aria-hidden="true" className="text-border">
                    ·
                  </span>
                  <span className="text-muted-foreground tabular-nums">
                    Updated {new Date(art.last_updated_at).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-foreground">{art.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-1">{art.excerpt}</p>
                <div className="flex flex-wrap items-center gap-1 text-[10px] text-muted-foreground pt-0.5">
                  <Tag className="size-2.5" />
                  {art.tags?.slice(0, 5).map((t) => (
                    <span key={t} className="bg-surface-2 px-1.5 py-0.5 rounded">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTogglePublish(art)}
                  className="h-8 text-xs gap-1"
                  title={art.published ? "Unpublish to draft" : "Publish to students"}
                >
                  {art.published ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  <span>{art.published ? "Unpublish" : "Publish"}</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(art)}
                  className="h-8 text-xs gap-1"
                >
                  <Edit2 className="size-3.5" />
                  <span>Edit</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(art.id, art.title)}
                  className="size-8 text-destructive hover:bg-destructive/10"
                  title="Delete article"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl bg-surface border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">
              {editingArticle ? "Edit Help Article" : "Create Help Article"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Provide thorough explanations and actionable instructions for students.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="art-title" className="text-xs font-semibold">
                  Article Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="art-title"
                  placeholder="e.g. Setting Up Spaced Repetition"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <ModernSelect
                id="art-cat"
                label="Category"
                value={category}
                onValueChange={(v) => setCategory(v as HelpArticleCategory)}
                searchable
                searchPlaceholder="Select category..."
                options={[
                  { value: "getting_started", label: "Getting Started" },
                  { value: "account", label: "Account & Verification" },
                  { value: "growth_map", label: "Growth Map & XP" },
                  { value: "study", label: "Study Module" },
                  { value: "productivity", label: "Productivity & Tasks" },
                  { value: "ai", label: `${BRAND.name} AI` },
                  { value: "settings", label: "Settings & Themes" },
                  { value: "troubleshooting", label: "Troubleshooting" },
                ]}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="art-excerpt" className="text-xs font-semibold">
                Summary / Excerpt (1-2 sentences)
              </Label>
              <Input
                id="art-excerpt"
                placeholder="Brief summary that appears in search results..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="art-content" className="text-xs font-semibold">
                Article Body (Markdown or Plain Text) <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="art-content"
                placeholder="Full article explanation..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="art-steps" className="text-xs font-semibold">
                Step-by-Step Instructions (One per line)
              </Label>
              <Textarea
                id="art-steps"
                placeholder="1. Open Settings&#10;2. Click Appearance&#10;3. Select Creative Neon"
                value={stepsInput}
                onChange={(e) => setStepsInput(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="art-tags" className="text-xs font-semibold">
                Search Tags (Comma separated)
              </Label>
              <Input
                id="art-tags"
                placeholder="e.g. study, pomodoro, timer, streak"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="art-pub"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="art-pub" className="text-xs cursor-pointer font-medium">
                Publish immediately to Help Center
              </Label>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button type="button" variant="ghost" size="sm" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="glow" size="sm" disabled={saving}>
                {saving ? "Saving..." : editingArticle ? "Save Changes" : "Publish Article"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
