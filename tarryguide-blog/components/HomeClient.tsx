"use client";
import { useState, useEffect, useMemo } from "react";
import Header from "@/components/Header";
import PostCard from "@/components/PostCard";
import { TrendingUp, Zap, ChevronRight, LayoutGrid, List } from "lucide-react";
import type { Post, Category, SiteSettings } from "@/lib/types";
import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";

interface HomeClientProps {
  posts: Post[];
  categories: Category[];
  settings: SiteSettings;
}

export default function HomeClient({ posts, categories, settings }: HomeClientProps) {
  const [lang, setLang] = useState<Lang>("ko");
  const [activeCat, setActiveCat] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;

  useEffect(() => {
    const saved = localStorage.getItem("blog_lang") as Lang;
    if (saved) setLang(saved);
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("cat");
    if (cat) setActiveCat(cat);
  }, []);

  const handleLang = (l: Lang) => {
    setLang(l);
    localStorage.setItem("blog_lang", l);
  };

  const featured = useMemo(() => posts.filter((p) => p.featured).slice(0, 3), [posts]);

  const filtered = useMemo(() => {
    if (activeCat === "all") return posts;
    const cat = categories.find((c) => c.slug === activeCat);
    return cat ? posts.filter((p) => p.category === cat.id) : posts;
  }, [posts, categories, activeCat]);

  const paginated = filtered.slice(0, page * PER_PAGE);
  const hasMore = paginated.length < filtered.length;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Header settings={settings} categories={categories} lang={lang} onLangChange={handleLang} />

      {/* Hero Banner */}
      <section className="relative pt-24 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-72 h-72 rounded-full opacity-10 blur-3xl" style={{ background: "var(--brand)" }} />
          <div className="absolute top-40 right-1/4 w-64 h-64 rounded-full opacity-8 blur-3xl" style={{ background: "#3b82f6" }} />
        </div>
        <div className="max-w-7xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "var(--brand)" }}>
            <Zap className="w-3.5 h-3.5" />
            {lang === "ko" ? "매일 새로운 글 업데이트" : "Daily updated content"}
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight" style={{ color: "var(--fg)" }}>
            {lang === "ko" ? settings.siteNameKo || settings.siteName : settings.siteName}
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto" style={{ color: "var(--fg2)" }}>
            {lang === "ko" ? settings.taglineKo || settings.tagline : settings.tagline}
          </p>
        </div>
      </section>

      {/* Featured Posts */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 mb-12">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-5 h-5" style={{ color: "var(--brand)" }} />
            <h2 className="text-xl font-black" style={{ color: "var(--fg)" }}>{t[lang].featuredPosts}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featured.map((post) => (
              <PostCard key={post.id} post={post} categories={categories} lang={lang} featured />
            ))}
          </div>
        </section>
      )}

      {/* Category Filter + Posts */}
      <section className="max-w-7xl mx-auto px-4 mb-16">
        {/* 카테고리 탭 */}
        <div className="flex items-center justify-between mb-5 gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-1">
            <button
              onClick={() => { setActiveCat("all"); setPage(1); }}
              className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={activeCat === "all" ? { background: "var(--brand)", color: "white" } : { background: "var(--card)", color: "var(--fg2)", border: "1px solid var(--border)" }}
            >
              🗂️ {t[lang].all}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setActiveCat(cat.slug); setPage(1); }}
                className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={activeCat === cat.slug
                  ? { background: cat.color, color: "white" }
                  : { background: "var(--card)", color: "var(--fg2)", border: "1px solid var(--border)" }
                }
              >
                {cat.icon} {lang === "ko" ? cat.name : cat.nameEn}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={() => setViewMode("grid")} className="w-9 h-9 flex items-center justify-center rounded-xl transition-all" style={viewMode === "grid" ? { background: "var(--brand)", color: "white" } : { color: "var(--fg2)" }}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode("list")} className="w-9 h-9 flex items-center justify-center rounded-xl transition-all" style={viewMode === "list" ? { background: "var(--brand)", color: "white" } : { color: "var(--fg2)" }}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 글 목록 */}
        {filtered.length === 0 ? (
          <div className="text-center py-20" style={{ color: "var(--fg2)" }}>
            <p className="text-5xl mb-4">📭</p>
            <p className="text-lg font-semibold">{t[lang].noPost}</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {paginated.map((post) => (
              <PostCard key={post.id} post={post} categories={categories} lang={lang} featured />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {paginated.map((post) => (
              <PostCard key={post.id} post={post} categories={categories} lang={lang} />
            ))}
          </div>
        )}

        {/* 더 보기 */}
        {hasMore && (
          <div className="text-center mt-10">
            <button onClick={() => setPage((p) => p + 1)} className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all hover:opacity-90" style={{ background: "var(--brand)", color: "white" }}>
              {t[lang].readMore} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t py-10 text-center text-sm" style={{ borderColor: "var(--border)", color: "var(--fg2)" }}>
        <p className="font-bold mb-1" style={{ color: "var(--fg)" }}>{settings.siteName}</p>
        <p>{settings.footerText}</p>
      </footer>
    </div>
  );
}
