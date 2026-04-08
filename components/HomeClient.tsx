"use client";
import { useState, useEffect } from "react";
import Header from "./Header";
import PostCard from "./PostCard";
import type { Post, Category, SiteSettings } from "@/lib/types";

export default function HomeClient({ posts, categories, settings }: {
  posts: Post[]; categories: Category[]; settings: SiteSettings;
}) {
  const [activeCat, setActiveCat] = useState("all");
  const [lang, setLang] = useState("ko");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("cat");
    if (cat) setActiveCat(cat);
  }, []);

  const filtered = activeCat === "all" ? posts : posts.filter(p => p.category === activeCat);
  const featured = filtered[0];
  const secondary = filtered.slice(1, 4);
  const rest = filtered.slice(4);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <style>{`
        .home-main { padding: 0 24px; }
        .news-grid { display: grid; grid-template-columns: 1fr 1px 320px; }
        .news-divider { background: var(--border); }
        .news-main { padding-right: 28px; }
        .news-side { padding-left: 28px; }
        .more-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 28px 20px; }
        @media (max-width: 767px) {
          .home-main { padding: 0 14px; }
          .news-grid { grid-template-columns: 1fr; }
          .news-divider { display: none; }
          .news-main { padding-right: 0; }
          .news-side { padding-left: 0; border-top: 1px solid var(--border); margin-top: 20px; padding-top: 20px; }
          .more-grid { grid-template-columns: 1fr; gap: 20px; }
        }
      `}</style>

      <Header lang={lang} onLangChange={() => setLang(lang === "ko" ? "en" : "ko")} />

      <main style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="home-main">
          {posts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: "var(--fg3)" }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>📰</div>
              <div style={{ fontSize: 16, fontFamily: "'Noto Serif KR', serif", fontWeight: 700, color: "var(--fg2)", marginBottom: 8 }}>아직 게시된 글이 없습니다</div>
              <div style={{ fontSize: 13 }}>BlogAuto Pro에서 첫 번째 글을 발행해보세요</div>
            </div>
          ) : (
            <>
              {featured && (
                <div style={{ padding: "24px 0", borderBottom: "1px solid var(--border)" }}>
                  <div className="news-grid">
                    <div className="news-main"><PostCard post={featured} view="grid" /></div>
                    <div className="news-divider" />
                    <div className="news-side">
                      {secondary.map((post, i) => (
                        <div key={post.id} style={{ borderBottom: i < secondary.length - 1 ? "1px solid var(--border)" : "none", paddingBottom: i < secondary.length - 1 ? 14 : 0, marginBottom: i < secondary.length - 1 ? 14 : 0 }}>
                          <PostCard post={post} view="list" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {rest.length > 0 && (
                <div style={{ padding: "28px 0" }}>
                  <div style={{ borderTop: "2px solid var(--fg)", borderBottom: "1px solid var(--fg)", padding: "4px 0", marginBottom: 20 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--fg3)" }}>More Stories</span>
                  </div>
                  <div className="more-grid">
                    {rest.map(post => <PostCard key={post.id} post={post} view="grid" />)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <footer style={{ borderTop: "3px solid var(--fg)", marginTop: 40, padding: "28px 16px", textAlign: "center" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 900, marginBottom: 6 }}>TarryGuide</div>
        <div style={{ fontSize: 12, color: "var(--fg3)" }}>{settings.footerText || "© 2026 TarryGuide. All rights reserved."}</div>
      </footer>
    </div>
  );
}
