import { getAllPosts, getCategories, getSiteSettings } from "@/lib/kv";
import HomeClient from "@/components/HomeClient";

export const revalidate = 60;

export default async function HomePage() {
  let posts = [], categories = [], settings: any = {};
  try { posts = await getAllPosts(); } catch {}
  try { categories = await getCategories(); } catch {}
  try { settings = await getSiteSettings(); } catch {}

  return <HomeClient posts={posts} categories={categories} settings={settings} />;
}
