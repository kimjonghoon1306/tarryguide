import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export async function GET() {
  const redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
  const ids = await redis.smembers("posts:ids");
  const result = await Promise.all((ids as string[]).map(async (id) => {
    const post = await redis.hgetall(`post:${id}`) as any;
    if (!post) return null;
    const content = post.content || "";
    return {
      id: post.id,
      slug: post.slug,
      title: post.title,
      contentLength: content.length,
      contentEnd: content.slice(-300),
      hasFaq: content.includes("faq-section") || content.includes("자주 묻는 질문"),
      hasRef: content.includes("ref-section") || content.includes("참고자료"),
      hasRelated: content.includes("관련 글"),
    };
  }));
  return NextResponse.json(result.filter(Boolean));
}
