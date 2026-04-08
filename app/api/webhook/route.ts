import { NextRequest, NextResponse } from "next/server";
import { savePost } from "@/lib/kv";
import { generateSlug } from "@/lib/i18n";
import type { Post } from "@/lib/types";

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
    const rawContent = body.content || "";
    const isHtml = rawContent.trim().startsWith("<") || rawContent.includes("<div") || rawContent.includes("<p>");
    const content = isHtml ? rawContent : cleanContent(rawContent).content;

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
