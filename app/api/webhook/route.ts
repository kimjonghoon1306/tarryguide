import { NextRequest, NextResponse } from "next/server";
import { savePost } from "@/lib/kv";
import { generateSlug } from "@/lib/i18n";
import type { Post } from "@/lib/types";

function cleanContent(raw: string): { content: string; relatedLinks: string[] } {
  let content = raw;
  const relatedLinks: string[] = [];

  // [인사말] 제거
  content = content.replace(/\[인사말\][\s\S]*?\[\/인사말\]/g, "").trim();

  // [이미지:...] 태그 제거
  content = content.replace(/\[이미지:[^\]]*\]/g, "").trim();

  // [참고자료시작] ~ [참고자료끝] 제거
  content = content.replace(/\[참고자료시작\][\s\S]*?\[참고자료끝\]/g, "").trim();

  // [관련글시작] ~ [관련글끝] 파싱 후 제거
  const relatedMatch = content.match(/\[관련글시작\]([\s\S]*?)\[관련글끝\]/);
  if (relatedMatch) {
    const lines = relatedMatch[1].trim().split("\n").filter(Boolean);
    lines.forEach(line => {
      const parts = line.split("|");
      if (parts.length >= 2) {
        const title = parts[0].trim();
        const desc = parts[1]?.trim() || "";
        relatedLinks.push(`- [${title}](${desc})`);
      }
    });
    content = content.replace(/\[관련글시작\][\s\S]*?\[관련글끝\]/g, "").trim();
  }

  // 관련글이 있으면 본문 하단에 마크다운으로 추가
  if (relatedLinks.length > 0) {
    content += "\n\n---\n\n## 관련 글\n\n" + relatedLinks.join("\n");
  }

  // 정열: center 같은 잔여 태그 제거
  content = content.replace(/- 정렬:[^\n]*/g, "").trim();

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
    const { content } = cleanContent(body.content || "");

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
