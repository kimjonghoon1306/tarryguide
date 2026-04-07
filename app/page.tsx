import { getAllPosts, getCategories, getSiteSettings } from "@/lib/kv";
import HomeClient from "@/components/HomeClient";
import type { Post, Category, SiteSettings } from "@/lib/types";

export const revalidate = 60;

export default async function HomePage() {
  let posts: Post[] = [];
  let categories: Category[] = [];
  let settings: SiteSettings = {
    siteName: "TarryGuide",
    siteNameKo: "테리가이드",
    tagline: "Your guide to a better life",
    taglineKo: "더 나은 삶을 위한 가이드",
    adsenseId: "",
    analyticsId: "",
    primaryColor: "#22c55e",
    footerText: "© 2026 TarryGuide. All rights reserved.",
    socialLinks: {},
  };

  try { posts = await getAllPosts(); } catch {}
  try { categories = await getCategories(); } catch {}
  try { settings = await getSiteSettings(); } catch {}

  return <HomeClient posts={posts} categories={categories} settings={settings} />;
}
