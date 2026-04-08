"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import PostCard from "@/components/PostCard";
import { ArrowLeft, Copy, Check, Share2, Eye, Clock, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ko, enUS } from "date-fns/locale";
import type { Post, Category, SiteSettings } from "@/lib/types";
import type { Lang } from "@/lib/i18n";
import { t, calcReadTime } from "@/lib/i18n";
import { marked } from "marked";

function renderContent(content: string): string {
  let html = marked(content) as string;
  // 특수 박스 변환
  html = html.replace(/\[팁\](.*?)\[\/팁\]/gs, '<div class="tip-box">$1</div>');
  html = html.replace(/\[주의\](.*?)\[\/주의\]/gs, '<div class="warning-box">$1</div>');
  html = html.replace(/\[중요\](.*?)\[\/중요\]/gs, '<div class="important-box">$1</div>');
  html = html.replace(/\[정보\](.*?)\[\/정보\]/gs, '<div class="info-box">$1</div>');
  return html;
}

function extractToc(content: string) {
  const headings: { id: string; text: string; level: number }[] = [];
  const lines = content.split("\n");
  lines.forEach((line) => {
    const m = line.match(/^(#{1,3})\s+(.+)/);
    if (m) {
      const level = m[1].length;
      const text = m[2].replace(/[*_`]/g, "");
      const id = text.toLowerCase().replace(/[^\w가-힣]+/g, "-");
      headings.push({ id, text, level });
    }
  });
  return headings;
}

interface Props {
  post: Post;
  related: Post[];
  categories: Category[];
  settings: SiteSettings;
}

export default function PostDetailClient({ post, related, categories, settings }: Props) {
  const [lang, setLang] = useState<Lang>("ko");
  const [copied, setCopied] = useState(false);
  const [activeId, setActiveId] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("blog_lang") as Lang;
    if (saved) setLang(saved);
  }, []);

  useEffect(() => {
    if (!contentRef.current) return;
    const headings = contentRef.current.querySelectorAll("h1,h2,h3");
    headings.forEach((h) => {
      if (!h.id) h.id = (h.textContent || "").toLowerCase().replace(/[^\w가-힣]+/g, "-");
    });
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActiveId(e.target.id); });
    }, { rootMargin: "-20% 0px -70% 0px" });
    headings.forEach((h) => obs.observe(h));
    return () => obs.disconnect();
  }, [post.content]);

  const handleLang = (l: Lang) => { setLang(l); localStorage.setItem("blog_lang", l); };
  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const category = categories.find((c) => c.id === post.category);
  const locale = lang === "ko" ? ko : enUS;
  const dateStr = format(new Date(post.createdAt), lang === "ko" ? "yyyy년 M월 d일" : "MMMM d, yyyy", { locale });
  const readTime = calcReadTime(post.content);
  const toc = extractToc(post.content);
  const html = renderContent(post.content);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Header lang={lang} onLangChange={() => handleLang(lang === "ko" ? "en" : "ko")} />

      {/* 썸네일 히어로 - 풀와이드 */}
      {post.thumbnail && (
        <div style={{ width: "100%", height: "clamp(280px, 40vw, 520px)", position: "relative", overflow: "hidden" }}>
          <img src={post.thumbnail} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)" }} />
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: toc.length > 0 ? "minmax(0,1fr) 200px" : "1fr", gap: "0 40px", alignItems: "start" }}>

          {/* 본문 */}
          <article style={{ paddingTop: 32, paddingBottom: 64, minWidth: 0 }}>
            {/* 뒤로가기 */}
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 24, fontSize: 13, color: "var(--fg3)", textDecoration: "none" }}>
              <ArrowLeft style={{ width: 14, height: 14 }} /> 목록으로
            </Link>

            {/* 카테고리 */}
            {category && (
              <div style={{ fontSize: 11, fontWeight: 800, color: "var(--brand)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12 }}>
                {lang === "ko" ? category.name : category.nameEn}
              </div>
            )}

            {/* 제목 */}
            <h1 style={{ fontFamily: "'Noto Serif KR', 'Playfair Display', serif", fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 900, lineHeight: 1.3, color: "var(--fg)", marginBottom: 20, borderBottom: "2px solid var(--fg)", paddingBottom: 20 }}>
              {post.title}
            </h1>

            {/* 메타 */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, marginBottom: 32, fontSize: 12, color: "var(--fg3)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar style={{ width: 13, height: 13 }} />{dateStr}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Eye style={{ width: 13, height: 13 }} />{post.views || 0} {t[lang].views}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock style={{ width: 13, height: 13 }} />{readTime}{t[lang].minute} {t[lang].readTime}</span>
              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <button onClick={handleCopy} style={{ padding: "6px 8px", background: "none", border: "1px solid var(--border)", cursor: "pointer", color: "var(--fg2)" }}>
                  {copied ? <Check style={{ width: 13, height: 13 }} /> : <Copy style={{ width: 13, height: 13 }} />}
                </button>
                <button onClick={() => navigator.share?.({ title: post.title, url: window.location.href })} style={{ padding: "6px 8px", background: "none", border: "1px solid var(--border)", cursor: "pointer", color: "var(--fg2)" }}>
                  <Share2 style={{ width: 13, height: 13 }} />
                </button>
              </div>
            </div>

            {/* 본문 */}
            <div ref={contentRef} className="prose" dangerouslySetInnerHTML={{ __html: html }} />

            {/* 태그 */}
            {post.tags && post.tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 40, paddingTop: 24, borderTop: "1px solid var(--border)" }}>
                {post.tags.map((tag) => (
                  <Link key={tag} href={`/?q=${encodeURIComponent(tag)}`} style={{ padding: "4px 12px", fontSize: 12, background: "var(--bg2)", color: "var(--fg2)", textDecoration: "none", border: "1px solid var(--border)" }}>
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* 관련 글 */}
            {related.length > 0 && (
              <section style={{ marginTop: 56, paddingTop: 24, borderTop: "2px solid var(--fg)" }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 24, color: "var(--fg3)" }}>{t[lang].relatedPosts}</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 24 }}>
                  {related.map((p) => <PostCard key={p.id} post={p} view="grid" />)}
                </div>
              </section>
            )}
          </article>

          {/* 사이드바: TOC - 모바일 숨김 */}
          {toc.length > 0 && (
            <aside style={{ paddingTop: 40, position: "sticky", top: 24, display: "var(--toc-display, block)" }}>
              <style>{`@media(max-width:768px){aside{display:none!important}}`}</style>
              <div style={{ borderTop: "2px solid var(--fg)", paddingTop: 16 }}>
                <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--fg3)", marginBottom: 12 }}>{t[lang].toc}</p>
                <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {toc.map((h) => (
                    <a key={h.id} href={`#${h.id}`}
                      style={{ fontSize: 12, padding: "4px 0", paddingLeft: `${(h.level - 1) * 10 + 8}px`, color: activeId === h.id ? "var(--brand)" : "var(--fg2)", fontWeight: activeId === h.id ? 700 : 400, textDecoration: "none", borderLeft: activeId === h.id ? "2px solid var(--brand)" : "2px solid transparent", transition: "all 0.15s" }}>
                      {h.text}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* 푸터 */}
      <footer style={{ borderTop: "3px solid var(--fg)", padding: "32px 24px", textAlign: "center" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 900, marginBottom: 8 }}>TarryGuide</div>
        <div style={{ fontSize: 12, color: "var(--fg3)" }}>{settings.footerText || "© 2026 TarryGuide. All rights reserved."}</div>
      </footer>
    </div>
  );
}
