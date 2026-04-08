import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export async function GET() {
  const redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
  const ids = await redis.smembers("posts:ids");
  const posts = await Promise.all(ids.map(id => redis.hgetall(`post:${id}`)));
  const result = (posts as any[]).filter(Boolean).map((post: any) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    contentLength: (post.content || "").length,
    contentPreview: (post.content || "").slice(0, 200),
    contentEnd: (post.content || "").slice(-200),
    excerptLength: (post.excerpt || "").length,
    excerpt: post.excerpt,
    thumbnail: post.thumbnail,
    published: post.published,
  }));
  return NextResponse.json(result, { headers: { "Content-Type": "application/json; charset=utf-8" } });
}
