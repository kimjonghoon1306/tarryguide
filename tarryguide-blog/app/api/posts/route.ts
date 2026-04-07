import { NextRequest, NextResponse } from "next/server";
import { getAllPosts, getCategories } from "@/lib/kv";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const cat = searchParams.get("cat");
    const q = searchParams.get("q");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    let posts = await getAllPosts();

    if (cat) {
      const categories = await getCategories();
      const found = categories.find((c) => c.slug === cat || c.id === cat);
      if (found) posts = posts.filter((p) => p.category === found.id);
    }

    if (q) {
      const lower = q.toLowerCase();
      posts = posts.filter((p) =>
        p.title?.toLowerCase().includes(lower) ||
        p.excerpt?.toLowerCase().includes(lower) ||
        p.tags?.some((t) => t.toLowerCase().includes(lower))
      );
    }

    const total = posts.length;
    const data = posts.slice((page - 1) * limit, page * limit);

    return NextResponse.json({ posts: data, total, page, limit, hasMore: page * limit < total });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
