import Link from "next/link";
import type { Post } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

const CATEGORY_NAMES: Record<string, string> = {
  life: "라이프", travel: "여행", food: "맛집/음식", money: "재테크",
  tech: "IT/테크", beauty: "뷰티/패션", health: "건강/운동",
  parenting: "육아", pets: "반려동물", interior: "인테리어",
  review: "리뷰", issue: "이슈/트렌드",
};

const PLACEHOLDER_COLORS: Record<string, string> = {
  life: "#22c55e", travel: "#3b82f6", food: "#f97316", money: "#eab308",
  tech: "#8b5cf6", beauty: "#ec4899", health: "#14b8a6",
  parenting: "#f43f5e", pets: "#a16207", interior: "#0ea5e9",
  review: "#f59e0b", issue: "#ef4444",
};

export function PostCardLarge({ post }: { post: Post }) {
  const color = PLACEHOLDER_COLORS[post.category] || "#888";
  const catName = CATEGORY_NAMES[post.category] || post.category;
  const timeAgo = post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ko }) : "";

  return (
    <Link href={`/${post.slug}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
      <article>
        {/* 썸네일 */}
        <div style={{ aspectRatio: "16/9", background: post.thumbnail ? "none" : color, marginBottom: 16, overflow: "hidden", position: "relative" }}>
          {post.thumbnail ? (
            <img src={post.thumbnail} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg, ${color}22, ${color}44)` }}>
              <span style={{ fontSize: 48 }}>
                {post.category === "life" ? "🌿" : post.category === "travel" ? "✈️" : post.category === "food" ? "🍜" : post.category === "money" ? "💰" : post.category === "tech" ? "💻" : post.category === "beauty" ? "💄" : post.category === "health" ? "💪" : post.category === "parenting" ? "👶" : post.category === "pets" ? "🐾" : post.category === "interior" ? "🏠" : post.category === "review" ? "⭐" : "🔥"}
              </span>
            </div>
          )}
        </div>
        <div style={{ borderTop: `3px solid ${color}`, paddingTop: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{catName}</div>
          <h2 style={{ fontFamily: "'Noto Serif KR', serif", fontSize: "clamp(18px, 2.5vw, 24px)", fontWeight: 700, lineHeight: 1.35, color: "var(--fg)", marginBottom: 10 }}>{post.title}</h2>
          <p style={{ fontSize: 14, color: "var(--fg2)", lineHeight: 1.6, marginBottom: 12, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{post.excerpt}</p>
          <div style={{ fontSize: 12, color: "var(--fg3)" }}>{timeAgo} · {post.author || "TarryGuide"}</div>
        </div>
      </article>
    </Link>
  );
}

export function PostCardSmall({ post }: { post: Post }) {
  const color = PLACEHOLDER_COLORS[post.category] || "#888";
  const catName = CATEGORY_NAMES[post.category] || post.category;
  const timeAgo = post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ko }) : "";

  return (
    <Link href={`/${post.slug}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
      <article style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
        {/* 썸네일 작게 */}
        <div style={{ width: 90, height: 68, flexShrink: 0, overflow: "hidden", background: post.thumbnail ? "none" : `linear-gradient(135deg, ${color}22, ${color}44)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {post.thumbnail ? (
            <img src={post.thumbnail} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontSize: 24 }}>
              {post.category === "life" ? "🌿" : post.category === "travel" ? "✈️" : post.category === "food" ? "🍜" : post.category === "money" ? "💰" : post.category === "tech" ? "💻" : post.category === "beauty" ? "💄" : post.category === "health" ? "💪" : post.category === "parenting" ? "👶" : post.category === "pets" ? "🐾" : post.category === "interior" ? "🏠" : post.category === "review" ? "⭐" : "🔥"}
            </span>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 5 }}>{catName}</div>
          <h3 style={{ fontFamily: "'Noto Serif KR', serif", fontSize: 14, fontWeight: 700, lineHeight: 1.4, color: "var(--fg)", marginBottom: 6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{post.title}</h3>
          <div style={{ fontSize: 11, color: "var(--fg3)" }}>{timeAgo}</div>
        </div>
      </article>
    </Link>
  );
}

export default function PostCard({ post, view }: { post: Post; view?: string }) {
  return view === "list" ? <PostCardSmall post={post} /> : <PostCardLarge post={post} />;
}
