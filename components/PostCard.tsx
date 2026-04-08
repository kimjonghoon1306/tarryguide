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

const CATEGORY_COLORS: Record<string, string> = {
  life: "#2d6a4f", travel: "#1d3557", food: "#9b2226", money: "#7b4f12",
  tech: "#3d2c8d", beauty: "#7b2d8b", health: "#1a535c",
  parenting: "#6d1a36", pets: "#5c4033", interior: "#1a4a6b",
  review: "#7b5e00", issue: "#7b1e1e",
};

export function PostCardLarge({ post }: { post: Post }) {
  const color = CATEGORY_COLORS[post.category] || "#333";
  const catName = CATEGORY_NAMES[post.category] || post.category;
  const timeAgo = post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ko }) : "";

  return (
    <Link href={`/${post.slug}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
      <article>
        {/* 썸네일 */}
        <div style={{ aspectRatio: "16/9", marginBottom: 16, overflow: "hidden", background: "#f0f0ec" }}>
          {post.thumbnail ? (
            <img src={post.thumbnail} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }}
              onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.02)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#e8e8e4" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#999", letterSpacing: "0.15em", textTransform: "uppercase" }}>No Image</span>
            </div>
          )}
        </div>
        <div style={{ borderTop: `3px solid ${color}`, paddingTop: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 8 }}>{catName}</div>
          <h2 style={{ fontFamily: "'Noto Serif KR', 'Playfair Display', serif", fontSize: "clamp(17px, 2.2vw, 22px)", fontWeight: 700, lineHeight: 1.4, color: "var(--fg)", marginBottom: 10 }}>{post.title}</h2>
          <p style={{ fontSize: 13, color: "var(--fg2)", lineHeight: 1.7, marginBottom: 12, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{post.excerpt}</p>
          <div style={{ fontSize: 11, color: "var(--fg3)", display: "flex", gap: 12 }}>
            <span>{post.author || "TarryGuide"}</span>
            <span>{timeAgo}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function PostCardSmall({ post }: { post: Post }) {
  const color = CATEGORY_COLORS[post.category] || "#333";
  const catName = CATEGORY_NAMES[post.category] || post.category;
  const timeAgo = post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ko }) : "";

  return (
    <Link href={`/${post.slug}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
      <article style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
        <div style={{ width: 90, height: 68, flexShrink: 0, overflow: "hidden", background: "#e8e8e4" }}>
          {post.thumbnail ? (
            <img src={post.thumbnail} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 9, color: "#bbb", letterSpacing: "0.1em" }}>NO IMG</span>
            </div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9, fontWeight: 800, color, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 5 }}>{catName}</div>
          <h3 style={{ fontFamily: "'Noto Serif KR', serif", fontSize: 13, fontWeight: 700, lineHeight: 1.45, color: "var(--fg)", marginBottom: 6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{post.title}</h3>
          <div style={{ fontSize: 11, color: "var(--fg3)" }}>{timeAgo}</div>
        </div>
      </article>
    </Link>
  );
}

export default function PostCard({ post, view }: { post: Post; view?: string }) {
  return view === "list" ? <PostCardSmall post={post} /> : <PostCardLarge post={post} />;
}
