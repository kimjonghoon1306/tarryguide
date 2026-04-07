import Link from "next/link";
import Image from "next/image";
import { Eye, Clock, Tag } from "lucide-react";
import { format } from "date-fns";
import { ko, enUS } from "date-fns/locale";
import type { Post, Category } from "@/lib/types";
import type { Lang } from "@/lib/i18n";
import { t, calcReadTime } from "@/lib/i18n";

interface PostCardProps {
  post: Post;
  categories: Category[];
  lang: Lang;
  featured?: boolean;
}

export default function PostCard({ post, categories, lang, featured = false }: PostCardProps) {
  const category = categories.find((c) => c.id === post.category);
  const readTime = calcReadTime(post.content);
  const locale = lang === "ko" ? ko : enUS;
  const dateStr = format(new Date(post.createdAt), lang === "ko" ? "yyyy. M. d." : "MMM d, yyyy", { locale });

  if (featured) {
    return (
      <Link href={`/${post.slug}`} className="group block">
        <article className="relative rounded-2xl overflow-hidden card-hover" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          {post.thumbnail && (
            <div className="relative h-56 overflow-hidden">
              <Image src={post.thumbnail} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              {category && (
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold text-white" style={{ background: category.color }}>
                  {category.icon} {lang === "ko" ? category.name : category.nameEn}
                </span>
              )}
              {post.featured && (
                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-400 text-yellow-900">
                  ⭐ Featured
                </span>
              )}
            </div>
          )}
          <div className="p-5">
            <h2 className="font-bold text-lg leading-snug mb-2 group-hover:text-green-500 transition-colors line-clamp-2" style={{ color: "var(--fg)" }}>
              {post.title}
            </h2>
            <p className="text-sm line-clamp-2 mb-4" style={{ color: "var(--fg2)" }}>{post.excerpt}</p>
            <div className="flex items-center justify-between text-xs" style={{ color: "var(--fg2)" }}>
              <span>{dateStr}</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{post.views || 0}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{readTime}{t[lang].minute}</span>
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={`/${post.slug}`} className="group block">
      <article className="flex gap-4 p-4 rounded-2xl card-hover" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        {post.thumbnail && (
          <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden">
            <Image src={post.thumbnail} alt={post.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {category && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold mb-1.5 px-2 py-0.5 rounded-full" style={{ background: `${category.color}20`, color: category.color }}>
              {category.icon} {lang === "ko" ? category.name : category.nameEn}
            </span>
          )}
          <h3 className="font-semibold text-sm leading-snug mb-1 group-hover:text-green-500 transition-colors line-clamp-2" style={{ color: "var(--fg)" }}>
            {post.title}
          </h3>
          <div className="flex items-center gap-2 text-xs" style={{ color: "var(--fg2)" }}>
            <span>{dateStr}</span>
            <span>·</span>
            <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />{post.views || 0}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
