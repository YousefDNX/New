export type HelpArticleCategory =
  | "getting_started"
  | "account"
  | "growth_map"
  | "study"
  | "productivity"
  | "ai"
  | "settings"
  | "troubleshooting";

export interface HelpArticleItem {
  id: string;
  slug: string;
  title: string;
  category: HelpArticleCategory;
  excerpt: string;
  content: string;
  steps?: string[];
  tags: string[];
  related_article_ids: string[];
  published: boolean;
  last_updated_at: string;
  created_at: string;
  author_name?: string;
}

/**
 * Pure searchable Help Article indexing function.
 * Filters articles by publish visibility, optional category, and keyword tokens
 * across title, tags, excerpt, and body content, ranking title and tag hits first.
 */
export function filterHelpArticles<T extends HelpArticleItem>(
  articles: readonly T[],
  categoryFilter: HelpArticleCategory | "all" = "all",
  searchQuery = "",
  includeUnpublished = false,
): T[] {
  let list = includeUnpublished
    ? [...articles]
    : articles.filter((article) => article.published !== false);

  if (categoryFilter && categoryFilter !== "all") {
    list = list.filter((article) => article.category === categoryFilter);
  }

  const trimmed = searchQuery.trim().toLowerCase();
  if (!trimmed) {
    return list;
  }

  const tokens = trimmed.split(/\s+/).filter(Boolean);
  const scored: Array<{ article: T; score: number }> = [];

  for (const article of list) {
    const titleLower = article.title.toLowerCase();
    const excerptLower = article.excerpt.toLowerCase();
    const contentLower = article.content.toLowerCase();
    const tagsLower = article.tags.map((t) => t.toLowerCase());

    const matchesAllTokens = tokens.every(
      (token) =>
        titleLower.includes(token) ||
        tagsLower.some((tag) => tag.includes(token)) ||
        excerptLower.includes(token) ||
        contentLower.includes(token),
    );

    if (!matchesAllTokens) continue;

    let score = 0;
    for (const token of tokens) {
      if (titleLower.includes(token)) score += 4;
      if (tagsLower.some((tag) => tag === token)) score += 4;
      else if (tagsLower.some((tag) => tag.includes(token))) score += 3;
      if (excerptLower.includes(token)) score += 2;
      if (contentLower.includes(token)) score += 1;
    }

    scored.push({ article, score });
  }

  return scored.sort((a, b) => b.score - a.score).map((entry) => entry.article);
}
