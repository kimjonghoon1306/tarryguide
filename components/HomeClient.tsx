"use client";
import { useState, useEffect } from "react";
import Header from "./Header";
import PostCard from "./PostCard";
import Footer from "./Footer";
import PopupNotice from "./PopupNotice";
import type { Post, Category, SiteSettings } from "@/lib/types";

const ALL_CATEGORIES = [
  { id: "life", name: "🌿 라이프" }, { id: "travel", name: "✈️ 여행" },
  { id: "food", name: "🍜 맛집/음식" }, { id: "money", name: "💰 재테크" },
  { id: "tech", name: "💻 IT/테크" }, { id: "beauty", name: "💄 뷰티/패션" },
  { id: "health", name: "💪 건강/운동" }, { id: "parenting", name: "👶 육아" },
  { id: "pets", name: "🐾 반려동물" }, { id: "interior", name: "🏠 인테리어" },
  { id: "review", name: "⭐ 리뷰" }, { id: "issue", name: "🔥 이슈/트렌드" },
];

export default function HomeClient({ posts, categories, settings }: {
  posts: Post[]; categories: Category[]; settings: SiteSettings;
}) {
  const [activeCat, setActiveCat] = useState("all");
  const [lang, setLang] = useState("ko");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("cat");
    if (cat) setActiveCat(cat);
    const q = params.get("q");
    // search handled by filter below
  }, []);

  const searchQuery = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("q") || ""
    : "";

  const filtered = posts.filter(p => {
    const catOk = activeCat === "all" || p.category === activeCat;
    const qOk = !searchQuery || p.title.includes(searchQuery) || p.content.includes(searchQuery) || (p.tags || []).some(t => t.includes(searchQuery));
    return catOk && qOk;
  });

  const featured = filtered[0];
  const secondary = filtered.slice(1, 4);
  const rest = filtered.slice(4);

  // Top 5 popular
  const top5 = [...posts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

  const handleCat = (id: string) => {
    setActiveCat(id);
    setSidebarOpen(false);
    const url = new URL(window.location.href);
    if (id === "all") url.searchParams.delete("cat");
    else url.searchParams.set("cat", id);
    url.searchParams.delete("q");
    window.history.pushState({}, "", url.toString());
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <style>{`
        .home-layout { display: grid; grid-template-columns: 200px 1fr; gap: 0; max-width: 1200px; margin: 0 auto; }
        .sidebar { border-right: 1px solid var(--border); padding: 20px 0; min-height: 60vh; }
        .main-content { padding: 0 20px; }
        .news-grid { display: grid; grid-template-columns: 1fr 1px 300px; }
        .news-divider { background: var(--border); }
        .news-main { padding-right: 24px; }
        .news-side { padding-left: 24px; }
        .more-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 24px 18px; }
        .mobile-cat-toggle { display: none; }
        .sidebar-overlay { display: none; }
        @media (max-width: 900px) {
          .home-layout { grid-template-columns: 1fr; }
          .sidebar { display: none; border-right: none; }
          .sidebar.open { display: block; position: fixed; top: 0; left: 0; bottom: 0; width: 240px; z-index: 1000; background: var(--bg); border-right: 1px solid var(--border); padding: 60px 0 20px; overflow-y: auto; }
          .sidebar-overlay { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 999; }
          .sidebar-overlay.hidden { display: none; }
          .mobile-cat-toggle { display: flex; align-items: center; gap: 8px; padding: 8px 16px; background: var(--bg2); border: 1px solid var(--border); cursor: pointer; font-size: 13px; color: var(--fg2); margin: 12px 16px 0; border-radius: 6px; }
          .main-content { padding: 0 14px; }
          .news-grid { grid-template-columns: 1fr; }
          .news-divider { display: none; }
          .news-main { padding-right: 0; }
          .news-side { padding-left: 0; border-top: 1px solid var(--border); margin-top: 16px; padding-top: 16px; }
          .more-grid { grid-template-columns: 1fr; gap: 16px; }
        }
      `}</style>

      <Header lang={lang} onLangChange={() => setLang(lang === "ko" ? "en" : "ko")} />
      <PopupNotice />

      {/* 모바일 카테고리 토글 */}
      <button className="mobile-cat-toggle" onClick={() => setSidebarOpen(true)}>
        ☰ 카테고리
        {activeCat !== "all" && <span style={{ background: "var(--brand)", color: "#fff", padding: "2px 8px", borderRadius: 99, fontSize: 11 }}>
          {ALL_CATEGORIES.find(c => c.id === activeCat)?.name}
        </span>}
      </button>

      {/* 사이드바 오버레이 */}
      <div className={`sidebar-overlay${sidebarOpen ? "" : " hidden"}`} onClick={() => setSidebarOpen(false)} />

      <div className="home-layout">
        {/* 왼쪽 사이드바 카테고리 */}
        <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
          {sidebarOpen && (
            <button onClick={() => setSidebarOpen(false)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--fg2)" }}>✕</button>
          )}
          <div style={{ padding: "0 12px", marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", color: "var(--fg3)", textTransform: "uppercase", marginBottom: 8 }}>Categories</div>
          </div>
          <button
            onClick={() => handleCat("all")}
            style={{
              width: "100%", textAlign: "left", padding: "9px 16px",
              background: activeCat === "all" ? "var(--brand)" : "none",
              color: activeCat === "all" ? "#fff" : "var(--fg2)",
              border: "none", cursor: "pointer", fontSize: 13, fontWeight: activeCat === "all" ? 700 : 400,
              borderLeft: activeCat === "all" ? "3px solid var(--brand)" : "3px solid transparent",
            }}
          >
            🗂 전체보기
          </button>
          {ALL_CATEGORIES.map(cat => {
            const count = posts.filter(p => p.category === cat.id).length;
            const active = activeCat === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCat(cat.id)}
                style={{
                  width: "100%", textAlign: "left", padding: "9px 16px",
                  background: active ? "var(--bg2)" : "none",
                  color: active ? "var(--brand)" : "var(--fg2)",
                  border: "none", cursor: "pointer", fontSize: 13, fontWeight: active ? 700 : 400,
                  borderLeft: active ? "3px solid var(--brand)" : "3px solid transparent",
                  display: "flex", alignItems: "center", justifyContent: "space-between"
                }}
              >
                <span>{cat.name}</span>
                {count > 0 && <span style={{ fontSize: 11, color: "var(--fg3)" }}>{count}</span>}
              </button>
            );
          })}

          {/* 인기글 TOP5 */}
          {top5.length > 0 && (
            <div style={{ marginTop: 24, padding: "0 12px" }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", color: "var(--fg3)", textTransform: "uppercase", marginBottom: 10, borderTop: "1px solid var(--border)", paddingTop: 16 }}>🔥 인기글 TOP5</div>
              {top5.map((p, i) => (
                <a key={p.id} href={`/${p.slug}`} style={{ display: "block", marginBottom: 10, textDecoration: "none" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: i < 3 ? "var(--brand)" : "var(--fg3)", minWidth: 16 }}>{i + 1}</span>
                    <span style={{ fontSize: 12, color: "var(--fg2)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.title}</span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </aside>

        {/* 메인 콘텐츠 */}
        <main>
          <div className="main-content">
            {/* 애드센스 상단 배너 */}
            {settings.adsenseId && (
              <div style={{ margin: "16px 0", textAlign: "center", minHeight: 90, background: "var(--bg2)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed var(--border)", fontSize: 12, color: "var(--fg3)" }}>
                광고
              </div>
            )}

            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0", color: "var(--fg3)" }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>📰</div>
                <div style={{ fontSize: 16, fontFamily: "'Noto Serif KR', serif", fontWeight: 700, color: "var(--fg2)", marginBottom: 8 }}>
                  {searchQuery ? `"${searchQuery}" 검색 결과가 없습니다` : "아직 게시된 글이 없습니다"}
                </div>
                <div style={{ fontSize: 13 }}>BlogAuto Pro에서 첫 번째 글을 발행해보세요</div>
              </div>
            ) : (
              <>
                {featured && (
                  <div style={{ padding: "20px 0", borderBottom: "1px solid var(--border)" }}>
                    <div className="news-grid">
                      <div className="news-main"><PostCard post={featured} view="grid" /></div>
                      <div className="news-divider" />
                      <div className="news-side">
                        {secondary.map((post, i) => (
                          <div key={post.id} style={{ borderBottom: i < secondary.length - 1 ? "1px solid var(--border)" : "none", paddingBottom: i < secondary.length - 1 ? 12 : 0, marginBottom: i < secondary.length - 1 ? 12 : 0 }}>
                            <PostCard post={post} view="list" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 중간 광고 */}
                {settings.adsenseId && rest.length > 0 && (
                  <div style={{ margin: "20px 0", textAlign: "center", minHeight: 90, background: "var(--bg2)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed var(--border)", fontSize: 12, color: "var(--fg3)" }}>
                    광고
                  </div>
                )}

                {rest.length > 0 && (
                  <div style={{ padding: "24px 0" }}>
                    <div style={{ borderTop: "2px solid var(--fg)", borderBottom: "1px solid var(--fg)", padding: "4px 0", marginBottom: 18 }}>
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
      </div>

      <Footer settings={settings} />
    </div>
  );
}
