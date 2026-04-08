import { NextRequest, NextResponse } from "next/server";
import { savePost } from "@/lib/kv";
import { generateSlug } from "@/lib/i18n";
import type { Post } from "@/lib/types";

export const maxDuration = 30;

function cleanContent(raw: string): { content: string; relatedLinks: string[] } {
  let content = raw;
  const relatedLinks: string[] = [];

  // [인사말] 제거
  content = content.replace(/\[인사말\][\s\S]*?\[\/인사말\]/g, "").trim();
  content = content.replace(/\[인사말시작\][\s\S]*?\[인사말끝\]/g, "").trim();

  // [이미지:...] 태그 제거
  content = content.replace(/\[이미지:[^\]]*\]/g, "").trim();

  // - 정렬: center 같은 잔여 태그 제거
  content = content.replace(/- 정렬:[^\n]*/g, "").trim();

  // [FAQ시작] ~ [FAQ끝] → 마크다운 FAQ 섹션으로 변환
  content = content.replace(/\[FAQ시작\]([\s\S]*?)\[FAQ끝\]/g, (_, inner) => {
    return "\n\n---\n\n## 자주 묻는 질문\n\n" + inner.trim();
  });

  // [참고자료시작] ~ [참고자료끝] → 마크다운 참고자료 섹션으로 변환
  content = content.replace(/\[참고자료시작\]([\s\S]*?)\[참고자료끝\]/g, (_, inner) => {
    return "\n\n---\n\n## 참고자료\n\n" + inner.trim();
  });

  // [관련글시작] ~ [관련글끝] → 마크다운 관련글 섹션으로 변환
  const relatedMatch = content.match(/\[관련글시작\]([\s\S]*?)\[관련글끝\]/);
  if (relatedMatch) {
    const lines = relatedMatch[1].trim().split("\n").filter(Boolean);
    const relatedMd = lines.map(line => {
      const parts = line.split("|");
      if (parts.length >= 2) {
        relatedLinks.push(parts[0].trim());
        return `- ${parts[0].trim()}`;
      }
      return `- ${line.trim()}`;
    }).join("\n");
    content = content.replace(/\[관련글시작\][\s\S]*?\[관련글끝\]/g,
      "\n\n---\n\n## 관련 글\n\n" + relatedMd);
  }

  // 나머지 알 수 없는 [태그시작]/[태그끝] 제거
  content = content.replace(/\[[^\]]+시작\]/g, "").replace(/\[[^\]]+끝\]/g, "").trim();

  return { content, relatedLinks };
}

function makeExcerpt(content: string): string {
  return content
    .replace(/#{1,6}\s/g, "")
    .replace(/\[.*?\]/g, "")
    .replace(/[*_`>-]/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 150) + "...";
}

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get("x-webhook-secret");
    if (process.env.WEBHOOK_SECRET && secret !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    console.log("[WEBHOOK] keys:", Object.keys(body));
    console.log("[WEBHOOK] content length:", (body.content || "").length);
    console.log("[WEBHOOK] content head:", (body.content || "").slice(0, 300));
    console.log("[WEBHOOK] content tail:", (body.content || "").slice(-300));
    const rawContent = body.content || "";
    const isHtml = rawContent.trim().startsWith("<") || rawContent.includes("<div") || rawContent.includes("<p>");
    let content = isHtml ? rawContent : cleanContent(rawContent).content;

    // HTML 안에 남아있는 텍스트 태그 처리
    content = content.replace(/\[참고자료시작\]([\s\S]*?)\[참고자료끝\]/g, (_: string, inner: string) => {
      const links = inner.trim().split("\n").filter(Boolean).map((line: string) => {
        const parts = line.split("|");
        if (parts.length >= 2) {
          const name = parts[0].trim();
          const url = parts[1].trim();
          return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="display:block;padding:12px 16px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;margin:8px 0;color:#2563eb;text-decoration:none;font-size:14px">🔗 ${name}</a>`;
        }
        return `<p style="margin:4px 0;font-size:14px">${line.trim()}</p>`;
      }).join("");
      return `<div style="margin:40px 0"><h2 style="font-size:18px;font-weight:800;color:#1a1a1a;margin:0 0 16px;padding-bottom:8px;border-bottom:2px solid #e2e8f0">참고자료 &amp; 링크</h2><div>${links}</div></div>`;
    });

    content = content.replace(/\[관련글시작\]([\s\S]*?)\[관련글끝\]/g, (_: string, inner: string) => {
      const posts = inner.trim().split("\n").filter(Boolean).map((line: string) => {
        const parts = line.split("|");
        const title = parts[0].trim().replace(/^POST\d+:\s*/, "");
        const desc = parts[1]?.trim() || "";
        return `<div style="padding:16px;background:#fff;border:1px solid #e2e8f0;border-radius:10px"><div style="font-weight:700;color:#1e293b;font-size:14px;margin-bottom:6px">${title}</div>${desc ? `<div style="color:#64748b;font-size:12px">${desc}</div>` : ""}</div>`;
      }).join("");
      return `<div style="margin:40px 0"><h2 style="font-size:18px;font-weight:800;color:#1a1a1a;margin:0 0 16px;padding-bottom:8px;border-bottom:2px solid #e2e8f0">관련 글</h2><div style="display:grid;gap:10px">${posts}</div></div>`;
    });

    // 나머지 남은 태그 제거
    content = content.replace(/\[[^\]]+시작\]/g, "").replace(/\[[^\]]+끝\]/g, "").trim();

    const post: Post = {
      id: body.id || ("p_" + Date.now()),
      title: body.title || "제목 없음",
      slug: generateSlug(body.title || "post"),
      content,
      excerpt: body.excerpt || makeExcerpt(content),
      category: body.category || "",
      tags: Array.isArray(body.tags) ? body.tags : (body.tags ? body.tags.split(",").map((t: string) => t.trim()) : []),
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
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "Webhook endpoint active", method: "POST" });
}
