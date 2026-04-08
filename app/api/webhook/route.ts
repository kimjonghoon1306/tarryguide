import { NextRequest, NextResponse } from "next/server";
import { savePost } from "@/lib/kv";
import { generateSlug } from "@/lib/i18n";
import type { Post } from "@/lib/types";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSlug(value: unknown, title?: string): string {
  const raw = String(value || "").trim();
  if (!raw) return generateSlug(title || "post");

  let slug = raw;

  slug = slug.replace(/^https?:\/\/[^/]+/i, "");
  slug = slug.replace(/^\/+|\/+$/g, "");
  slug = slug.replace(/^(posts|post|blog)\//i, "");

  const parts = slug.split("/").filter(Boolean);
  slug = parts.length ? parts[parts.length - 1] : slug;

  slug = slug
    .replace(/\?.*$/, "")
    .replace(/#.*$/, "")
    .replace(/[^a-zA-Z0-9가-힣-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .trim();

  return slug || generateSlug(title || "post");
}

function parseReferenceLine(line: string) {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const urlMatch = trimmed.match(/https?:\/\/[^\s|]+/i);
  const url = urlMatch?.[0] || "";

  const parts = trimmed.split("|").map((v) => v.trim()).filter(Boolean);

  let title = parts[0] || trimmed;
  let description = parts[1] || "";

  if (!url && parts.length >= 2) {
    description = parts.slice(1).join(" ");
  }

  if (url) {
    title = trimmed.replace(url, "").replace(/[|]+/g, " ").trim() || url;
  }

  if (!description && url) {
    description = url;
  }

  return {
    title: title || url || trimmed,
    description,
    url,
  };
}

function parseRelatedLine(line: string) {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const parts = trimmed.split("|").map((v) => v.trim()).filter(Boolean);
  const title = parts[0] || trimmed;
  const description = parts[1] || "관련 글을 확인해보세요.";
  const href = parts[2] || "#";

  return { title, description, href };
}

function parseFaqBlocks(inner: string) {
  const lines = inner
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const items: Array<{ q: string; a: string }> = [];
  let currentQ = "";
  let currentA: string[] = [];

  for (const line of lines) {
    if (/^Q[.\s:：]/i.test(line)) {
      if (currentQ) {
        items.push({ q: currentQ, a: currentA.join(" ").trim() });
      }
      currentQ = line.replace(/^Q[.\s:：]+/i, "").trim();
      currentA = [];
      continue;
    }

    if (/^A[.\s:：]/i.test(line)) {
      currentA.push(line.replace(/^A[.\s:：]+/i, "").trim());
      continue;
    }

    if (currentQ) {
      currentA.push(line);
    }
  }

  if (currentQ) {
    items.push({ q: currentQ, a: currentA.join(" ").trim() });
  }

  return items.filter((item) => item.q && item.a);
}

function renderReferenceSection(inner: string): string {
  const items = inner
    .split(/\r?\n/)
    .map(parseReferenceLine)
    .filter(Boolean) as Array<{ title: string; description: string; url: string }>;

  if (!items.length) return "";

  return `
<section style="margin:48px 0 24px;">
  <h2 style="font-size:34px;font-weight:900;line-height:1.3;margin:0 0 20px;color:#222;">참고자료 & 링크</h2>
  <div style="display:grid;gap:14px;">
    ${items
      .map(
        (item) => `
      <a href="${escapeHtml(item.url || "#")}" target="_blank" rel="noopener noreferrer" style="display:flex;align-items:center;justify-content:space-between;gap:16px;padding:22px 24px;border:1px solid #e5e7eb;border-radius:20px;background:#fff;color:inherit;text-decoration:none;box-shadow:0 4px 14px rgba(15,23,42,0.04);">
        <div style="min-width:0;">
          <div style="font-size:28px;font-weight:800;color:#3563ff;line-height:1.4;word-break:keep-all;">🔗 ${escapeHtml(item.title)}</div>
          <div style="margin-top:8px;font-size:18px;color:#6b7280;line-height:1.6;word-break:keep-all;">${escapeHtml(item.description || item.url || "공식 사이트 바로가기")}</div>
        </div>
        <div style="width:52px;height:52px;border-radius:999px;background:#eef2ff;display:flex;align-items:center;justify-content:center;font-size:22px;color:#3563ff;flex:0 0 auto;">→</div>
      </a>`
      )
      .join("")}
  </div>
</section>`.trim();
}

function renderRelatedSection(inner: string): string {
  const items = inner
    .split(/\r?\n/)
    .map(parseRelatedLine)
    .filter(Boolean) as Array<{ title: string; description: string; href: string }>;

  if (!items.length) return "";

  return `
<section style="margin:56px 0 24px;">
  <h2 style="font-size:34px;font-weight:900;line-height:1.3;margin:0 0 20px;color:#222;">관련 글</h2>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:18px;">
    ${items
      .map(
        (item) => `
      <a href="${escapeHtml(item.href || "#")}" style="display:block;padding:24px 22px;border:1px solid #e5e7eb;border-radius:18px;background:#fff;color:inherit;text-decoration:none;box-shadow:0 4px 14px rgba(15,23,42,0.04);min-height:168px;">
        <div style="font-size:28px;font-weight:800;line-height:1.45;color:#1f2937;word-break:keep-all;">${escapeHtml(item.title)}</div>
        <div style="margin-top:14px;font-size:19px;line-height:1.75;color:#6b7280;word-break:keep-all;">${escapeHtml(item.description)}</div>
      </a>`
      )
      .join("")}
  </div>
</section>`.trim();
}

function renderFaqSection(inner: string): string {
  const items = parseFaqBlocks(inner);
  if (!items.length) return "";

  return `
<section style="margin:56px 0 24px;">
  <h2 style="font-size:34px;font-weight:900;line-height:1.3;margin:0 0 20px;color:#222;">자주 묻는 질문</h2>
  <div style="display:grid;gap:20px;">
    ${items
      .map(
        (item) => `
      <div style="border:1px solid #dbe4ff;border-radius:18px;overflow:hidden;background:#fff;box-shadow:0 4px 14px rgba(15,23,42,0.04);">
        <div style="padding:18px 22px;background:linear-gradient(90deg,#6a5cff,#5b6cff);color:#fff;font-size:24px;font-weight:800;line-height:1.6;">Q. ${escapeHtml(item.q)}</div>
        <div style="padding:22px;font-size:21px;line-height:1.9;color:#374151;word-break:keep-all;">A. ${escapeHtml(item.a)}</div>
      </div>`
      )
      .join("")}
  </div>
</section>`.trim();
}

function renderParagraphs(text: string): string {
  const blocks = text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks
    .map((block) => {
      const heading = block.match(/^(#{1,3})\s+(.+)$/);
      if (heading) {
        const level = Math.min(3, heading[1].length + 1);
        const title = escapeHtml(heading[2].trim());
        const size = level === 2 ? "32px" : level === 3 ? "26px" : "22px";
        return `<h${level} style="font-size:${size};font-weight:800;line-height:1.45;margin:34px 0 14px;color:#111827;word-break:keep-all;">${title}</h${level}>`;
      }

      const lines = block
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .join("<br />");

      return `<p style="margin:0 0 18px;font-size:21px;line-height:1.95;color:#374151;word-break:keep-all;">${escapeHtml(lines).replace(/&lt;br \/&gt;/g, "<br />")}</p>`;
    })
    .join("\n");
}

function cleanContent(raw: string): string {
  let content = raw || "";

  content = content.replace(/\r/g, "");
  content = content.replace(/\[인사말\][\s\S]*?\[\/인사말\]/g, "").trim();
  content = content.replace(/\[인사말시작\][\s\S]*?\[인사말끝\]/g, "").trim();
  content = content.replace(/\[이미지:[^\]]*\]/g, "").trim();
  content = content.replace(/-\s*정렬:[^\n]*/g, "").trim();

  content = content.replace(/\[참고자료시작\]([\s\S]*?)\[참고자료끝\]/g, (_, inner) => {
    return `\n\n${renderReferenceSection(inner.trim())}\n\n`;
  });

  content = content.replace(/\[관련글시작\]([\s\S]*?)\[관련글끝\]/g, (_, inner) => {
    return `\n\n${renderRelatedSection(inner.trim())}\n\n`;
  });

  content = content.replace(/\[FAQ시작\]([\s\S]*?)\[FAQ끝\]/g, (_, inner) => {
    return `\n\n${renderFaqSection(inner.trim())}\n\n`;
  });

  content = content.replace(/\[[^\]]+시작\]/g, "");
  content = content.replace(/\[[^\]]+끝\]/g, "");

  const html = renderParagraphs(content.trim());
  return `<div class="blogpro-content">${html}</div>`;
}

function makeExcerpt(content: string): string {
  const plain = stripHtml(content);
  return plain.length > 150 ? `${plain.slice(0, 150)}...` : plain;
}

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get("x-webhook-secret");
    if (process.env.WEBHOOK_SECRET && secret !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const rawContent = String(body.content || "").trim();
    const isHtml = /<\/?[a-z][\s\S]*>/i.test(rawContent);
    const finalContent = isHtml ? rawContent : cleanContent(rawContent);

    const slug = normalizeSlug(body.slug || body.permalink || body.url, body.title || "post");

    const post: Post = {
      id: body.id || `p_${Date.now()}`,
      title: body.title || "제목 없음",
      slug,
      content: finalContent,
      excerpt: body.excerpt || makeExcerpt(finalContent),
      category: body.category || "life",
      tags: Array.isArray(body.tags)
        ? body.tags
        : body.tags
          ? String(body.tags).split(",").map((t) => t.trim()).filter(Boolean)
          : [],
      thumbnail: body.thumbnail || body.image || "",
      author: body.author || "TarryGuide",
      lang: body.lang === "en" ? "en" : "ko",
      published: body.published !== false,
      featured: Boolean(body.featured),
      views: Number(body.views || 0),
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await savePost(post);

    return NextResponse.json({
      ok: true,
      id: post.id,
      slug: post.slug,
      contentLength: post.content.length,
    });
  } catch (error) {
    console.error("[webhook] error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "Webhook endpoint active", method: "POST" });
}
