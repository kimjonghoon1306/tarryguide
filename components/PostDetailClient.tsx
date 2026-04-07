"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import PostCard from "@/components/PostCard";
import { ArrowLeft, Copy, Check, Share2, Eye, Clock, Calendar, Tag } from "lucide-react";
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
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Header settings={settings} categories={categories} lang={lang} onLangChange={handleLang} />

      {/* 썸네일 히어로 */}
      {post.thumbnail && (
        <div className="relative h-72 md:h-96 pt-16">
          <Image src={post.thumbnail} alt={post.title} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          {category && (
            <div className="absolute bottom-6 left-6">
              <span className="px-3 py-1.5 rounded-full text-sm font-bold text-white" style={{ background: category.color }}>
                {category.icon} {lang === "ko" ? category.name : category.nameEn}
              </span>
            </div>
          )}
        </div>
      )}

      <div className={`max-w-7xl mx-auto px-4 ${post.thumbnail ? "pt-8" : "pt-28"} pb-16`}>
        <div className="flex gap-8">
          {/* 본문 */}
          <article className="flex-1 min-w-0 max-w-3xl">
            {/* 뒤로가기 */}
            <Link href="/" className="inline-flex items-center gap-2 mb-6 text-sm hover:opacity-70 transition-opacity" style={{ color: "var(--fg2)" }}>
              <ArrowLeft className="w-4 h-4" /> {t[lang].goBack}
            </Link>

            {/* 제목 */}
            <h1 className="text-2xl md:text-4xl font-black leading-tight mb-5" style={{ color: "var(--fg)" }}>
              {post.title}
            </h1>

            {/* 메타 */}
            <div className="flex flex-wrap items-center gap-4 mb-8 pb-6 text-sm" style={{ borderBottom: "1px solid var(--border)", color: "var(--fg2)" }}>
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{dateStr}</span>
              <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" />{post.views || 0} {t[lang].views}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{readTime}{t[lang].minute} {t[lang].readTime}</span>
              <div className="flex items-center gap-2 ml-auto">
                <button onClick={handleCopy} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ color: "var(--fg2)" }}>
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
                <button onClick={() => navigator.share?.({ title: post.title, url: window.location.href })} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ color: "var(--fg2)" }}>
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 본문 */}
            <div ref={contentRef} className="prose" dangerouslySetInnerHTML={{ __html: html }} />

            {/* 태그 */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-10 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
                <Tag className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: "var(--fg2)" }} />
                {post.tags.map((tag) => (
                  <Link key={tag} href={`/?q=${encodeURIComponent(tag)}`} className="px-3 py-1 rounded-full text-sm font-medium hover:opacity-80 transition-opacity" style={{ background: "rgba(34,197,94,0.1)", color: "var(--brand)" }}>
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* 관련 글 */}
            {related.length > 0 && (
              <section className="mt-14">
                <h3 className="text-xl font-black mb-5" style={{ color: "var(--fg)" }}>{t[lang].relatedPosts}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {related.map((p) => <PostCard key={p.id} post={p} categories={categories} lang={lang} featured />)}
                </div>
              </section>
            )}
          </article>

          {/* 사이드바: TOC */}
          {toc.length > 0 && (
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24">
                <div className="rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                  <p className="text-sm font-black mb-4 uppercase tracking-widest" style={{ color: "var(--fg2)" }}>{t[lang].toc}</p>
                  <nav className="flex flex-col gap-0.5">
                    {toc.map((h) => (
                      <a
                        key={h.id}
                        href={`#${h.id}`}
                        className="text-sm py-1 transition-colors hover:text-green-500"
                        style={{
                          paddingLeft: `${(h.level - 1) * 12}px`,
                          color: activeId === h.id ? "var(--brand)" : "var(--fg2)",
                          fontWeight: activeId === h.id ? 600 : 400,
                        }}
                      >
                        {h.text}
                      </a>
                    ))}
                  </nav>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
