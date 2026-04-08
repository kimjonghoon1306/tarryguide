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
  html = html.replace(/\[팁\](.*?)\[\/팁\]/gs, '<div class="tip-box">$1</div>');
  html = html.replace(/\[주의\](.*?)\[\/주의\]/gs, '<div class="warning-box">$1</div>');
  html = html.replace(/\[중요\](.*?)\[\/중요\]/gs, '<div class="important-box">$1</div>');
  html = html.replace(/\[정보\](.*?)\[\/정보\]/gs, '<div class="info-box">$1</div>');
  return html;
}

function extractToc(content: string) {
  const headings: { id: string; text: string; level: number }[] = [];
  content.split("\n").forEach((line) => {
    const m = line.match(/^(#{1,3})\s+(.+)/);
    if (m) {
      const text = m[2].replace(/[*_`]/g, "");
      const id = text.toLowerCase().replace(/[^\w가-힣]+/g, "-");
      headings.push({ id, text, level: m[1].length });
    }
  });
  return headings;
}

interface Props { post: Post; related: Post[]; categories: Category[]; settings: SiteSettings; }

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
      <style>{`
        .detail-wrap { max-width: 1400px; margin: 0 auto; padding: 0 48px; }
        .detail-grid { display: grid; grid-template-columns: minmax(0,1fr) 220px; gap: 0 48px; align-items: start; }
        .detail-toc { display: block; }
        .detail-article { padding-top: 32px; padding-bottom: 80px; min-width: 0; }
        @media (max-width: 1024px) {
          .detail-wrap { padding: 0 24px; }
          .detail-grid { grid-template-columns: 1fr; }
          .detail-toc { display: none; }
        }
        @media (max-width: 767px) {
          .detail-wrap { padding: 0; }
          .detail-article { padding-top: 16px; padding-bottom: 48px; padding-left: 16px; padding-right: 16px; }
          .meta-row { flex-wrap: wrap; gap: 10px !important; }
          .meta-actions { margin-left: 0 !important; }
          .prose img { margin-left: -16px !important; width: calc(100% + 32px) !important; max-width: calc(100% + 32px) !important; border-radius: 0 !important; }
        }
      `}</style>

      <Header lang={lang} onLangChange={() => handleLang(lang === "ko" ? "en" : "ko")} />

      {post.thumbnail && (
        <div style={{ width: "100%", height: "clamp(200px, 35vw, 480px)", overflow: "hidden", position: "relative" }}>
          <img src={post.thumbnail} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 60%)" }} />
        </div>
      )}

      <div className="detail-wrap">
        <div className="detail-grid">
          <article className="detail-article">
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20, fontSize: 13, color: "var(--fg3)", textDecoration: "none" }}>
              <ArrowLeft style={{ width: 13, height: 13 }} /> 목록으로
            </Link>

            {category && (
              <div style={{ fontSize: 10, fontWeight: 800, color: "var(--brand)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 10 }}>
                {lang === "ko" ? category.name : category.nameEn}
              </div>
            )}

            <h1 style={{ fontFamily: "'Noto Serif KR', 'Playfair Display', serif", fontSize: "clamp(22px, 4vw, 38px)", fontWeight: 900, lineHeight: 1.3, color: "var(--fg)", marginBottom: 18, borderBottom: "2px solid var(--fg)", paddingBottom: 18 }}>
              {post.title}
            </h1>

            <div className="meta-row" style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28, fontSize: 12, color: "var(--fg3)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar style={{ width: 12, height: 12 }} />{dateStr}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Eye style={{ width: 12, height: 12 }} />{post.views || 0} {t[lang].views}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock style={{ width: 12, height: 12 }} />{readTime}{t[lang].minute} {t[lang].readTime}</span>
              <div className="meta-actions" style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                <button onClick={handleCopy} style={{ padding: "6px 8px", background: "none", border: "1px solid var(--border)", cursor: "pointer", color: "var(--fg2)" }}>
                  {copied ? <Check style={{ width: 12, height: 12 }} /> : <Copy style={{ width: 12, height: 12 }} />}
                </button>
                <button onClick={() => navigator.share?.({ title: post.title, url: window.location.href })} style={{ padding: "6px 8px", background: "none", border: "1px solid var(--border)", cursor: "pointer", color: "var(--fg2)" }}>
                  <Share2 style={{ width: 12, height: 12 }} />
                </button>
              </div>
            </div>

            <div ref={contentRef} className="prose" dangerouslySetInnerHTML={{ __html: html }} />

            {post.tags && post.tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 36, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
                {post.tags.map((tag) => (
                  <Link key={tag} href={`/?q=${encodeURIComponent(tag)}`} style={{ padding: "4px 10px", fontSize: 12, background: "var(--bg2)", color: "var(--fg2)", textDecoration: "none", border: "1px solid var(--border)" }}>
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {related.length > 0 && (
              <section style={{ marginTop: 48, paddingTop: 20, borderTop: "2px solid var(--fg)" }}>
                <h3 style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 20, color: "var(--fg3)" }}>{t[lang].relatedPosts}</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 20 }}>
                  {related.map((p) => <PostCard key={p.id} post={p} view="grid" />)}
                </div>
              </section>
            )}
          </article>

          {toc.length > 0 && (
            <aside className="detail-toc" style={{ paddingTop: 32, position: "sticky", top: 20 }}>
              <div style={{ borderTop: "2px solid var(--fg)", paddingTop: 14 }}>
                <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--fg2)", marginBottom: 12 }}>{t[lang].toc}</p>
                <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {toc.map((h) => (
                    <a key={h.id} href={`#${h.id}`} style={{ fontSize: 13, padding: `5px 0 5px ${(h.level - 1) * 10 + 8}px`, color: activeId === h.id ? "var(--brand)" : "var(--fg2)", fontWeight: activeId === h.id ? 700 : 400, textDecoration: "none", borderLeft: activeId === h.id ? "2px solid var(--brand)" : "2px solid transparent", transition: "all 0.15s", lineHeight: 1.4 }}>
                      {h.text}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
          )}
        </div>
      </div>

      <footer style={{ borderTop: "3px solid var(--fg)", padding: "28px 16px", textAlign: "center" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 900, marginBottom: 6 }}>TarryGuide</div>
        <div style={{ fontSize: 12, color: "var(--fg3)" }}>{settings.footerText || "© 2026 TarryGuide. All rights reserved."}</div>
      </footer>
    </div>
  );
}
