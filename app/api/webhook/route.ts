import { NextRequest, NextResponse } from "next/server";
import { savePost } from "@/lib/kv";
import { generateSlug } from "@/lib/i18n";
import type { Post } from "@/lib/types";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function nl2br(text: string): string {
  return escapeHtml(text).replace(/\n/g, "<br />");
}

function renderReferenceSection(inner: string): string {
  const lines: string[] = inner
    .split("\n")
    .map((line: string) => line.trim())
    .filter(Boolean);

  const items = lines
    .map((line: string) => {
      const m = line.match(/^(.*?)(https?:\/\/\S+)$/);
      if (!m) return "";
      const label = m[1].trim();
      const url = m[2].trim();
      return `
        <a href="${url}" target="_blank" rel="noopener noreferrer" style="display:flex;align-items:center;justify-content:space-between;gap:16px;padding:20px 24px;border:1px solid #e5e7eb;border-radius:18px;background:#fff;text-decoration:none;color:inherit;box-shadow:0 2px 10px rgba(0,0,0,0.04);margin:0 0 14px 0;">
          <div style="min-width:0;">
            <div style="font-size:22px;font-weight:800;color:#3b5bdb;line-height:1.45;word-break:keep-all;">🔗 ${escapeHtml(label)}</div>
            <div style="margin-top:8px;font-size:16px;color:#6b7280;line-height:1.6;word-break:break-word;">${escapeHtml(url)}</div>
          </div>
          <div style="flex-shrink:0;width:44px;height:44px;border-radius:9999px;background:#eef2ff;display:flex;align-items:center;justify-content:center;color:#3b5bdb;font-size:20px;">→</div>
        </a>`;
    })
    .filter(Boolean)
    .join("");

  if (!items) return "";

  return `
    <section style="margin:56px 0 0 0;">
      <h2 style="font-size:34px;font-weight:900;line-height:1.3;margin:0 0 22px 0;color:#111827;">참고자료 & 링크</h2>
      <div>${items}</div>
    </section>`;
}

function renderRelatedSection(inner: string): string {
  const lines: string[] = inner
    .split("\n")
    .map((line: string) => line.trim())
    .filter(Boolean);

  const items = lines
    .map((line: string) => {
      const parts = line.split("|").map((v: string) => v.trim());
      const title = parts[0] || "";
      const desc = parts[1] || "관련 글입니다.";
      if (!title) return "";
      return `
        <div style="border:1px solid #e5e7eb;border-radius:18px;background:#fff;padding:24px;box-shadow:0 2px 10px rgba(0,0,0,0.04);min-height:180px;">
          <div style="font-size:28px;font-weight:900;line-height:1.45;color:#1f2937;word-break:keep-all;">${escapeHtml(title)}</div>
          <div style="margin-top:14px;font-size:18px;line-height:1.8;color:#6b7280;word-break:keep-all;">${escapeHtml(desc)}</div>
        </div>`;
    })
    .filter(Boolean)
    .join("");

  if (!items) return "";

  return `
    <section style="margin:56px 0 0 0;">
      <h2 style="font-size:34px;font-weight:900;line-height:1.3;margin:0 0 22px 0;color:#111827;">관련 글</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:18px;">${items}</div>
    </section>`;
}

function renderFaqSection(inner: string): string {
  const blocks: string[] = inner
    .split(/\n\s*\n/)
    .map((block: string) => block.trim())
    .filter(Boolean);

  const items = blocks
    .map((block: string) => {
      const q = block.match(/Q\.\s*(.+)/)?.[1]?.trim();
      const a = block.match(/A\.\s*([\s\S]+)/)?.[1]?.trim();
      if (!q || !a) return "";
      return `
        <div style="border:1px solid #dbe4ff;border-radius:18px;overflow:hidden;background:#fff;box-shadow:0 2px 10px rgba(0,0,0,0.04);margin:0 0 18px 0;">
          <div style="background:linear-gradient(90deg,#6366f1,#5b5ce2);color:#fff;padding:18px 22px;font-size:24px;font-weight:800;line-height:1.5;">Q. ${escapeHtml(q)}</div>
          <div style="padding:22px;font-size:20px;line-height:1.9;color:#374151;word-break:keep-all;">A. ${nl2br(a)}</div>
        </div>`;
    })
    .filter(Boolean)
    .join("");

  if (!items) return "";

  return `
    <section style="margin:56px 0 0 0;">
      <h2 style="font-size:34px;font-weight:900;line-height:1.3;margin:0 0 22px 0;color:#111827;">자주 묻는 질문</h2>
      <div>${items}</div>
    </section>`;
}

function cleanContent(raw: string): { content: string; relatedLinks: string[] } {
  let content = raw;
  const relatedLinks: string[] = [];

  content = content.replace(/\[인사말\][\s\S]*?\[\/인사말\]/g, "").trim();
  content = content.replace(/\[인사말시작\][\s\S]*?\[인사말끝\]/g, "").trim();
  content = content.replace(/\[이미지:[^\]]*\]/g, "").trim();
  content = content.replace(/- 정렬:[^\n]*/g, "").trim();

  let referenceHtml = "";
  content = content.replace(/\[참고자료시작\]([\s\S]*?)\[참고자료끝\]/g, (_match: string, inner: string) => {
    referenceHtml = renderReferenceSection(inner.trim());
    return "";
  });

  let relatedHtml = "";
  content = content.replace(/\[관련글시작\]([\s\S]*?)\[관련글끝\]/g, (_match: string, inner: string) => {
    const lines: string[] = inner.trim().split("\n").filter(Boolean);
    lines.forEach((line: string) => {
      const parts = line.split("|");
      if (parts[0]?.trim()) relatedLinks.push(parts[0].trim());
    });
    relatedHtml = renderRelatedSection(inner.trim());
    return "";
  });

  let faqHtml = "";
  content = content.replace(/\[FAQ시작\]([\s\S]*?)\[FAQ끝\]/g, (_match: string, inner: string) => {
    faqHtml = renderFaqSection(inner.trim());
    return "";
  });

  content = content.replace(/\[[^\]]+시작\]/g, "").replace(/\[[^\]]+끝\]/g, "").trim();

  const bodyHtml = content
    .split(/\n{2,}/)
    .map((block: string) => block.trim())
    .filter(Boolean)
    .map((block: string) => {
      if (/^#{1,6}\s+/.test(block)) {
        const m = block.match(/^(#{1,6})\s+(.+)$/);
        if (!m) return `<p>${nl2br(block)}</p>`;
        const level = Math.min(m[1].length, 6);
        return `<h${level}>${escapeHtml(m[2].trim())}</h${level}>`;
      }
      return `<p>${nl2br(block)}</p>`;
    })
    .join("\n");

  const finalHtml = `${bodyHtml}${referenceHtml}${relatedHtml}${faqHtml}`.trim();
  return { content: finalHtml, relatedLinks };
}

function makeExcerpt(content: string): string {
  return (
    content
      .replace(/#{1,6}\s/g, "")
      .replace(/\[.*?\]/g, "")
      .replace(/[*_`>-]/g, "")
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 150) + "..."
  );
}

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get("x-webhook-secret");
    if (process.env.WEBHOOK_SECRET && secret !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const rawContent = body.content || "";
    const isHtml =
      rawContent.trim().startsWith("<") || rawContent.includes("<div") || rawContent.includes("<p>");
    
    let content: string;
    if (isHtml) {
      // HTML이지만 마크다운 섹션이 포함된 경우 처리
      let html = rawContent;
      let referenceHtml = "";
      let relatedHtml = "";
      let faqHtml = "";
      
      html = html.replace(/\[참고자료시작\]([\s\S]*?)\[참고자료끝\]/g, (_: string, inner: string) => {
        referenceHtml = renderReferenceSection(inner.trim());
        return "";
      });
      html = html.replace(/\[관련글시작\]([\s\S]*?)\[관련글끝\]/g, (_: string, inner: string) => {
        relatedHtml = renderRelatedSection(inner.trim());
        return "";
      });
      html = html.replace(/\[FAQ시작\]([\s\S]*?)\[FAQ끝\]/g, (_: string, inner: string) => {
        faqHtml = renderFaqSection(inner.trim());
        return "";
      });
      html = html.replace(/\[[^\]]+시작\]/g, "").replace(/\[[^\]]+끝\]/g, "");
      content = `${html}${faqHtml}${referenceHtml}${relatedHtml}`.trim();
    } else {
      content = cleanContent(rawContent).content;
    }

    const post: Post = {
      id: body.id || "p_" + Date.now(),
      title: body.title || "제목 없음",
      slug: generateSlug(body.title || "post"),
      content,
      excerpt: body.excerpt || makeExcerpt(content),
      category: body.category || "",
      tags: Array.isArray(body.tags)
        ? body.tags
        : body.tags
          ? body.tags.split(",").map((t: string) => t.trim())
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
    return NextResponse.json({ ok: true, id: post.id, slug: post.slug });
  } catch (e) {
    console.error("Webhook error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "Webhook endpoint active", method: "POST" });
}
