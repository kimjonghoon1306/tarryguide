import { NextRequest, NextResponse } from "next/server";
import { marked } from "marked";
import { savePost } from "@/lib/kv";
import { generateSlug } from "@/lib/i18n";
import type { Post } from "@/lib/types";

export const maxDuration = 30;

marked.setOptions({ breaks: true, gfm: true });

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function splitLineParts(line: string): string[] {
  return line
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);
}

function normalizeUrl(url: string): string {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

function normalizeIncomingSlug(input: unknown, fallbackTitle: string): string {
  const raw = typeof input === "string" ? input.trim() : "";
  if (!raw) return generateSlug(fallbackTitle || "post");

  let slug = raw;

  try {
    if (/^https?:\/\//i.test(slug)) {
      const url = new URL(slug);
      slug = url.pathname || "";
    }
  } catch {
    // ignore invalid URL and continue cleaning as text
  }

  slug = slug
    .replace(/^https?:\/\/[^/]+/i, "")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "")
    .replace(/^posts?\//i, "")
    .replace(/^blog\//i, "")
    .split("/")
    .filter(Boolean)
    .pop() || "";

  slug = slug
    .replace(/\?.*$/, "")
    .replace(/#.*$/, "")
    .trim();

  if (!slug) return generateSlug(fallbackTitle || "post");

  const safe = slug
    .toLowerCase()
    .replace(/%[0-9a-f]{2}/gi, "")
    .replace(/[^a-z0-9가-힣-_]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return safe || generateSlug(fallbackTitle || "post");
}

function buildReferenceSection(inner: string): string {
  const items = inner
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = splitLineParts(line);
      const url = normalizeUrl(parts[2] || parts[1] || "");
      const title = parts[0] || "참고 링크";
      const desc =
        parts.length >= 3
          ? parts[1]
          : parts[1] && !/^https?:\/\//i.test(parts[1])
            ? parts[1]
            : "관련 정보를 확인할 수 있는 외부 페이지";

      if (!url) {
        return `
          <div class="tg-ref-card">
            <div class="tg-ref-icon">🔗</div>
            <div class="tg-ref-copy">
              <div class="tg-ref-title">${escapeHtml(title)}</div>
              <div class="tg-ref-desc">${escapeHtml(desc || "관련 정보를 확인할 수 있습니다.")}</div>
            </div>
          </div>
        `;
      }

      return `
        <a class="tg-ref-card tg-ref-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer nofollow">
          <div class="tg-ref-icon">🔗</div>
          <div class="tg-ref-copy">
            <div class="tg-ref-title">${escapeHtml(title)}</div>
            <div class="tg-ref-desc">${escapeHtml(desc || "관련 정보를 확인할 수 있습니다.")}</div>
          </div>
          <div class="tg-ref-arrow">→</div>
        </a>
      `;
    })
    .join("");

  if (!items) return "";

  return `
    <section class="tg-section tg-ref-section">
      <h2 class="tg-section-title" id="참고자료-링크">참고자료 &amp; 링크</h2>
      <div class="tg-ref-list">${items}</div>
    </section>
  `;
}

function buildRelatedSection(inner: string): string {
  const items = inner
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = splitLineParts(line);
      const rawTitle = parts[0] || "관련 글";
      const title = rawTitle.replace(/^POST\d+\s*:\s*/i, "").trim();
      const desc = parts[1] || "함께 보면 좋은 관련 글입니다.";
      const url = normalizeUrl(parts[2] || "");

      const cardInner = `
        <div class="tg-related-title">${escapeHtml(title)}</div>
        <div class="tg-related-desc">${escapeHtml(desc)}</div>
      `;

      if (url) {
        return `<a class="tg-related-card tg-related-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${cardInner}</a>`;
      }

      return `<div class="tg-related-card">${cardInner}</div>`;
    })
    .join("");

  if (!items) return "";

  return `
    <section class="tg-section tg-related-section">
      <h2 class="tg-section-title" id="관련-글">관련 글</h2>
      <div class="tg-related-grid">${items}</div>
    </section>
  `;
}

function buildFaqSection(inner: string): string {
  const lines = inner
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const items: { q: string; a: string }[] = [];
  let currentQ = "";
  let currentA: string[] = [];

  const pushItem = () => {
    if (!currentQ) return;
    items.push({ q: currentQ, a: currentA.join(" ").trim() || "내용 준비 중입니다." });
    currentQ = "";
    currentA = [];
  };

  for (const line of lines) {
    if (/^(Q\.|Q:|질문[:：]?)/i.test(line)) {
      pushItem();
      currentQ = line.replace(/^(Q\.|Q:|질문[:：]?)/i, "").trim();
      continue;
    }

    if (/^(A\.|A:|답변[:：]?)/i.test(line)) {
      currentA.push(line.replace(/^(A\.|A:|답변[:：]?)/i, "").trim());
      continue;
    }

    if (!currentQ) {
      currentQ = line;
    } else {
      currentA.push(line);
    }
  }

  pushItem();

  if (items.length === 0) return "";

  return `
    <section class="tg-section tg-faq-section">
      <h2 class="tg-section-title" id="자주-묻는-질문">자주 묻는 질문</h2>
      <div class="tg-faq-list">
        ${items
          .map(
            (item) => `
            <div class="tg-faq-item">
              <div class="tg-faq-q">Q. ${escapeHtml(item.q)}</div>
              <div class="tg-faq-a">A. ${escapeHtml(item.a)}</div>
            </div>
          `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function buildInlineInfoBoxes(html: string): string {
  return html
    .replace(/\[팁\]([\s\S]*?)\[\/팁\]/g, '<div class="tg-note tg-tip">$1</div>')
    .replace(/\[주의\]([\s\S]*?)\[\/주의\]/g, '<div class="tg-note tg-warning">$1</div>')
    .replace(/\[중요\]([\s\S]*?)\[\/중요\]/g, '<div class="tg-note tg-important">$1</div>')
    .replace(/\[정보\]([\s\S]*?)\[\/정보\]/g, '<div class="tg-note tg-info">$1</div>');
}

function wrapRichHtml(contentHtml: string): string {
  return `
    <div class="tg-content-root">
      <style>
        .tg-content-root { color: #1f2937; }
        .tg-content-root p { margin: 0 0 1.1em; }
        .tg-content-root h2, .tg-content-root h3 { line-height: 1.45; }
        .tg-section { margin: 48px 0 0; }
        .tg-section-title {
          font-size: clamp(24px, 2.2vw, 32px);
          line-height: 1.35;
          font-weight: 800;
          color: #111827;
          margin: 0 0 20px;
          letter-spacing: -0.02em;
        }
        .tg-ref-list, .tg-faq-list { display: grid; gap: 14px; }
        .tg-ref-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 22px 24px;
          border: 1px solid #e5e7eb;
          border-radius: 22px;
          background: #ffffff;
          text-decoration: none;
          color: inherit;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.05);
        }
        .tg-ref-link:hover, .tg-related-link:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 28px rgba(37, 99, 235, 0.12);
        }
        .tg-ref-icon {
          width: 42px;
          height: 42px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #eef2ff;
          font-size: 18px;
          flex-shrink: 0;
        }
        .tg-ref-copy { min-width: 0; flex: 1; }
        .tg-ref-title {
          font-size: 1.1rem;
          line-height: 1.5;
          font-weight: 800;
          color: #2563eb;
          word-break: keep-all;
        }
        .tg-ref-desc {
          margin-top: 6px;
          color: #6b7280;
          line-height: 1.65;
          font-size: 0.98rem;
          word-break: keep-all;
        }
        .tg-ref-arrow {
          width: 42px;
          height: 42px;
          border-radius: 999px;
          background: #eff6ff;
          color: #2563eb;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }
        .tg-related-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
        }
        .tg-related-card {
          display: block;
          min-height: 100%;
          padding: 24px 22px;
          border-radius: 22px;
          border: 1px solid #e5e7eb;
          background: #ffffff;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.04);
          text-decoration: none;
          color: inherit;
        }
        .tg-related-title {
          font-size: 1.1rem;
          line-height: 1.55;
          font-weight: 800;
          color: #1f2937;
          margin-bottom: 10px;
          word-break: keep-all;
        }
        .tg-related-desc {
          color: #6b7280;
          line-height: 1.75;
          font-size: 0.98rem;
          word-break: keep-all;
        }
        .tg-faq-item {
          overflow: hidden;
          border-radius: 24px;
          border: 1px solid #dbeafe;
          background: #ffffff;
          box-shadow: 0 10px 30px rgba(37, 99, 235, 0.05);
        }
        .tg-faq-q {
          padding: 20px 24px;
          background: linear-gradient(90deg, #6366f1, #4f46e5);
          color: #ffffff;
          font-weight: 800;
          font-size: 1.08rem;
          line-height: 1.6;
          word-break: keep-all;
        }
        .tg-faq-a {
          padding: 22px 24px;
          color: #374151;
          line-height: 1.9;
          font-size: 1rem;
          word-break: keep-all;
        }
        .tg-note {
          margin: 24px 0;
          padding: 18px 20px;
          border-radius: 18px;
          line-height: 1.8;
          border: 1px solid transparent;
        }
        .tg-tip { background: #ecfdf5; border-color: #a7f3d0; }
        .tg-warning { background: #fff7ed; border-color: #fdba74; }
        .tg-important { background: #fef2f2; border-color: #fca5a5; }
        .tg-info { background: #eff6ff; border-color: #93c5fd; }
        @media (max-width: 768px) {
          .tg-ref-card { padding: 18px; gap: 12px; border-radius: 18px; }
          .tg-ref-arrow { width: 36px; height: 36px; }
          .tg-related-grid { grid-template-columns: 1fr; }
          .tg-related-card { padding: 20px 18px; border-radius: 18px; }
          .tg-faq-q, .tg-faq-a { padding: 18px; }
        }
      </style>
      ${contentHtml}
    </div>
  `;
}

function convertSpecialSections(raw: string): string {
  let content = raw.replace(/\r\n/g, "\n");

  content = content.replace(/\[인사말\][\s\S]*?\[\/인사말\]/g, "").trim();
  content = content.replace(/\[인사말시작\][\s\S]*?\[인사말끝\]/g, "").trim();
  content = content.replace(/\[이미지:[^\]]*\]/g, "").trim();
  content = content.replace(/-\s*정렬:[^\n]*/g, "").trim();

  content = content.replace(/\[참고자료시작\]([\s\S]*?)\[참고자료끝\]/g, (_, inner) => `\n\n${buildReferenceSection(inner)}\n\n`);
  content = content.replace(/\[관련글시작\]([\s\S]*?)\[관련글끝\]/g, (_, inner) => `\n\n${buildRelatedSection(inner)}\n\n`);
  content = content.replace(/\[FAQ시작\]([\s\S]*?)\[FAQ끝\]/g, (_, inner) => `\n\n${buildFaqSection(inner)}\n\n`);

  content = content.replace(/\[[^\]]+시작\]/g, "").replace(/\[[^\]]+끝\]/g, "").trim();

  const markdownHtml = marked.parse(content) as string;
  return wrapRichHtml(buildInlineInfoBoxes(markdownHtml));
}

function makeExcerpt(content: string): string {
  const plain = content
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

  return `${plain.slice(0, 150)}${plain.length > 150 ? "..." : ""}`;
}

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get("x-webhook-secret");
    if (process.env.WEBHOOK_SECRET && secret !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const rawContent = typeof body.content === "string" ? body.content : "";
    const isRichHtml = /<div|<section|<article|<p|<h[1-6]|<ul|<ol/i.test(rawContent);
    const content = isRichHtml ? rawContent : convertSpecialSections(rawContent);
    const normalizedSlug = normalizeIncomingSlug(body.slug || body.url || body.permalink, body.title || "post");

    const post: Post = {
      id: body.id || `p_${Date.now()}`,
      title: body.title || "제목 없음",
      slug: normalizedSlug,
      content,
      excerpt: body.excerpt || makeExcerpt(content),
      category: body.category || "",
      tags: Array.isArray(body.tags)
        ? body.tags
        : body.tags
          ? String(body.tags)
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      thumbnail: body.thumbnail || body.image || "",
      author: body.author || "TarryGuide",
      lang: body.lang || "ko",
      published: body.published !== false,
      featured: body.featured || false,
      views: 0,
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await savePost(post);

    return NextResponse.json({
      ok: true,
      id: post.id,
      slug: post.slug,
      contentLength: rawContent.length,
    });
  } catch (error) {
    console.error("[WEBHOOK_ERROR]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "Webhook endpoint active", method: "POST" });
}
