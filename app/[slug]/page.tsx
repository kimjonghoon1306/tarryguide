import { getPostBySlug, getAllPosts, getCategories, getSiteSettings, incrementViews } from "@/lib/kv";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PostDetailClient from "@/components/PostDetailClient";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Not Found" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, images: post.thumbnail ? [post.thumbnail] : [] },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const [post, allPosts, categories, settings] = await Promise.all([
    getPostBySlug(slug),
    getAllPosts(),
    getCategories(),
    getSiteSettings(),
  ]);

  if (!post) notFound();

  incrementViews(post!.id).catch(() => {});

  const related = allPosts
    .filter((p) => p.id !== post!.id && p.category === post!.category)
    .slice(0, 3);

  return <PostDetailClient post={post!} related={related} categories={categories} settings={settings} />;
}
