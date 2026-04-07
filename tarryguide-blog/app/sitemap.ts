import { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/kv";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tarryguide.com";
  let posts: any[] = [];
  try { posts = await getAllPosts(); } catch {}
  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    ...posts.map((p) => ({
      url: `${siteUrl}/${p.slug}`,
      lastModified: new Date(p.updatedAt || p.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
