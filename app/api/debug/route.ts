import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export async function GET() {
  const redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
  const ids = await redis.smembers("posts:ids");
  const posts = await Promise.all(ids.map(id => redis.hgetall(`post:${id}`)));
  const result = await Promise.all((posts as any[]).filter(Boolean).map(async (post: any) => {
    const slugVal = await redis.get(`slug:${post.slug}`);
    return { id: post.id, slug: post.slug, title: post.title, slugKeyExists: !!slugVal, slugKeyValue: slugVal };
  }));
  return NextResponse.json(result);
}
