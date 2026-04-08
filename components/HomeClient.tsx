"use client";
import { useState } from "react";
import Header from "./Header";
import PostCard from "./PostCard";
import type { Post, Category, SiteSettings } from "@/lib/types";

const CATEGORY_ICONS: Record<string, string> = {
  life: "🌿", travel: "✈️", food: "🍜", money: "💰", tech: "💻",
  beauty: "💄", health: "💪", parenting: "👶", pets: "🐾",
  interior: "🏠", review: "⭐", issue: "🔥",
};

export default function HomeClient({ posts, categories, settings }: {
  posts: Post[]; categories: Category[]; settings: SiteSettings;
}) {
  const [activeCat, setActiveCat] = useState("all");
  const [lang, setLang] = useState("ko");

  const filtered = activeCat === "all" ? posts : posts.filter(p => p.category === activeCat);
  const featured = filtered[0];
  const secondary = filtered.slice(1, 4);
  const rest = filtered.slice(4);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Header lang={lang} onLangChange={() => setLang(lang === "ko" ? "en" : "ko")} />

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>

        {/* 카테고리 필터 */}
        <div style={{ display: "flex", gap: 0, padding: "16px 0", overflowX: "auto", borderBottom: "1px solid var(--border)" }}>
          <button onClick={() => setActiveCat("all")}
            style={{ padding: "7px 18px", fontSize: 11, fontWeight: 700, border: "none", borderRight: "1px solid var(--border)", background: activeCat === "all" ? "var(--fg)" : "transparent", color: activeCat === "all" ? "var(--bg)" : "var(--fg2)", cursor: "pointer", whiteSpace: "nowrap", letterSpacing: "0.08em", textTransform: "uppercase", transition: "all 0.15s" }}>
            All
          </button>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setActiveCat(cat.id)}
              style={{ padding: "7px 18px", fontSize: 11, fontWeight: 600, border: "none", borderRight: "1px solid var(--border)", background: activeCat === cat.id ? "var(--fg)" : "transparent", color: activeCat === cat.id ? "var(--bg)" : "var(--fg2)", cursor: "pointer", whiteSpace: "nowrap", letterSpacing: "0.05em", transition: "all 0.15s" }}>
              {cat.name}
            </button>
          ))}
        </div>

        {posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--fg3)" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📰</div>
            <div style={{ fontSize: 18, fontFamily: "'Noto Serif KR', serif", fontWeight: 700, color: "var(--fg2)", marginBottom: 8 }}>아직 게시된 글이 없습니다</div>
            <div style={{ fontSize: 14 }}>BlogAuto Pro에서 첫 번째 글을 발행해보세요</div>
          </div>
        ) : (
          <>
            {/* 메인 레이아웃 - 신문 그리드 */}
            {featured && (
              <div style={{ padding: "32px 0", borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1px 340px", gap: 0 }}>
                  {/* 메인 피처 */}
                  <div style={{ paddingRight: 32 }}>
                    <PostCard post={featured} view="grid" />
                  </div>

                  {/* 구분선 */}
                  <div style={{ background: "var(--border)" }} />

                  {/* 사이드 3개 */}
                  <div style={{ paddingLeft: 32 }}>
                    {secondary.map((post, i) => (
                      <div key={post.id} style={{ borderBottom: i < secondary.length - 1 ? "1px solid var(--border)" : "none", paddingBottom: i < secondary.length - 1 ? 16 : 0, marginBottom: i < secondary.length - 1 ? 16 : 0 }}>
                        <PostCard post={post} view="list" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 추가 글 그리드 */}
            {rest.length > 0 && (
              <div style={{ padding: "32px 0" }}>
                <div style={{ borderTop: "2px solid var(--fg)", borderBottom: "1px solid var(--fg)", padding: "4px 0", marginBottom: 24 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--fg3)" }}>더 많은 기사</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "32px 24px" }}>
                  {rest.map(post => <PostCard key={post.id} post={post} view="grid" />)}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* 푸터 */}
      <footer style={{ borderTop: "3px solid var(--fg)", marginTop: 48, padding: "32px 24px", textAlign: "center" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 900, marginBottom: 8 }}>TarryGuide</div>
        <div style={{ fontSize: 12, color: "var(--fg3)" }}>{settings.footerText || "© 2026 TarryGuide. All rights reserved."}</div>
      </footer>
    </div>
  );
}
