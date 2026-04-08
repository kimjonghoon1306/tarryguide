import { NextRequest, NextResponse } from "next/server";
import { savePost } from "@/lib/kv";
import { generateSlug } from "@/lib/i18n";
import type { Post } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get("x-webhook-secret");
    if (process.env.WEBHOOK_SECRET && secret !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const post: Post = {
      id: body.id || ("p_" + Date.now()),
      title: body.title || "제목 없음",
      slug: generateSlug(body.title || "post"),
      content: body.content || "",
      excerpt: body.excerpt || (body.content || "").replace(/<[^>]+>/g, "").slice(0, 150) + "...",
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
