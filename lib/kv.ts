import { kv } from "@vercel/kv";
import type { Post, Category, SiteSettings } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cast = <T>(v: any): T => v as T;

// ─── Posts ───────────────────────────────────────────────
export async function getAllPosts(): Promise<Post[]> {
  const ids = await kv.smembers("posts:ids");
  if (!ids || ids.length === 0) return [];
  const posts = await Promise.all(ids.map((id) => kv.hgetall(`post:${id}`)));
  return posts
    .filter(Boolean)
    .map((p) => cast<Post>(p))
    .filter((p) => p.published)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getAllPostsAdmin(): Promise<Post[]> {
  const ids = await kv.smembers("posts:ids");
  if (!ids || ids.length === 0) return [];
  const posts = await Promise.all(ids.map((id) => kv.hgetall(`post:${id}`)));
  return posts
    .filter(Boolean)
    .map((p) => cast<Post>(p))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const id = await kv.get(`slug:${slug}`);
  if (!id) return null;
  const post = await kv.hgetall(`post:${id}`);
  return post ? cast<Post>(post) : null;
}

export async function savePost(post: Post): Promise<void> {
  await kv.hset(`post:${post.id}`, post as unknown as Record<string, unknown>);
  await kv.sadd("posts:ids", post.id);
  await kv.set(`slug:${post.slug}`, post.id);
  if (post.category) {
    await kv.sadd(`cat:${post.category}:posts`, post.id);
  }
}

export async function deletePost(id: string): Promise<void> {
  const raw = await kv.hgetall(`post:${id}`);
  if (!raw) return;
  const post = cast<Post>(raw);
  await kv.del(`post:${id}`);
  await kv.srem("posts:ids", id);
  await kv.del(`slug:${post.slug}`);
  if (post.category) await kv.srem(`cat:${post.category}:posts`, id);
}

export async function incrementViews(id: string): Promise<void> {
  await kv.hincrby(`post:${id}`, "views", 1);
}

// ─── Categories ──────────────────────────────────────────
export const DEFAULT_CATEGORIES: Category[] = [
  { id: "life", name: "라이프", nameEn: "Life", slug: "life", icon: "🌿", color: "#22c55e", description: "일상, 건강, 웰빙", count: 0 },
  { id: "travel", name: "여행", nameEn: "Travel", slug: "travel", icon: "✈️", color: "#3b82f6", description: "국내외 여행 정보", count: 0 },
  { id: "food", name: "맛집/음식", nameEn: "Food", slug: "food", icon: "🍜", color: "#f97316", description: "맛집 리뷰 & 레시피", count: 0 },
  { id: "money", name: "재테크", nameEn: "Finance", slug: "money", icon: "💰", color: "#eab308", description: "부업, 투자, 절약", count: 0 },
  { id: "tech", name: "IT/테크", nameEn: "Tech", slug: "tech", icon: "💻", color: "#8b5cf6", description: "AI, 앱, 디지털 트렌드", count: 0 },
  { id: "beauty", name: "뷰티/패션", nameEn: "Beauty", slug: "beauty", icon: "💄", color: "#ec4899", description: "화장품, 스킨케어, 패션", count: 0 },
  { id: "health", name: "건강/운동", nameEn: "Health", slug: "health", icon: "💪", color: "#14b8a6", description: "운동, 다이어트, 건강 정보", count: 0 },
  { id: "parenting", name: "육아", nameEn: "Parenting", slug: "parenting", icon: "👶", color: "#f43f5e", description: "임신, 출산, 아이 교육", count: 0 },
  { id: "pets", name: "반려동물", nameEn: "Pets", slug: "pets", icon: "🐾", color: "#a16207", description: "강아지, 고양이, 반려생활", count: 0 },
  { id: "interior", name: "인테리어", nameEn: "Interior", slug: "interior", icon: "🏠", color: "#0ea5e9", description: "홈데코, 인테리어 팁", count: 0 },
  { id: "review", name: "리뷰", nameEn: "Review", slug: "review", icon: "⭐", color: "#f59e0b", description: "제품, 서비스 리뷰", count: 0 },
  { id: "issue", name: "이슈/트렌드", nameEn: "Trend", slug: "issue", icon: "🔥", color: "#ef4444", description: "사회 이슈, 트렌드", count: 0 },
];

export async function getCategories(): Promise<Category[]> {
  const data = await kv.get("categories");
  if (!data) {
    await kv.set("categories", DEFAULT_CATEGORIES);
    return DEFAULT_CATEGORIES;
  }
  return cast<Category[]>(data);
}

export async function saveCategories(categories: Category[]): Promise<void> {
  await kv.set("categories", categories);
}

// ─── Site Settings ────────────────────────────────────────
const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "TarryGuide",
  siteNameKo: "테리가이드",
  tagline: "Your guide to a better life",
  taglineKo: "더 나은 삶을 위한 가이드",
  adsenseId: "",
  analyticsId: "",
  primaryColor: "#22c55e",
  footerText: "© 2026 TarryGuide. All rights reserved.",
  socialLinks: {},
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const data = await kv.get("site:settings");
  if (!data) return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...cast<SiteSettings>(data) };
}

export async function saveSiteSettings(settings: SiteSettings): Promise<void> {
  await kv.set("site:settings", settings);
}
