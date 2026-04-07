import { NextRequest, NextResponse } from "next/server";
import {
  getAllPostsAdmin, savePost, deletePost,
  getCategories, saveCategories,
  getSiteSettings, saveSiteSettings,
} from "@/lib/kv";

function checkAuth(req: NextRequest): boolean {
  const pw = req.headers.get("x-admin-pw");
  return pw === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const resource = req.nextUrl.searchParams.get("resource");
  try {
    if (resource === "auth") return NextResponse.json({ ok: true });
    if (resource === "posts") return NextResponse.json(await getAllPostsAdmin());
    if (resource === "categories") return NextResponse.json(await getCategories());
    if (resource === "settings") return NextResponse.json(await getSiteSettings());
    return NextResponse.json({ error: "Unknown resource" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { resource, data } = await req.json();
  if (resource === "post") { await savePost(data); return NextResponse.json({ ok: true }); }
  return NextResponse.json({ error: "Unknown resource" }, { status: 400 });
}

export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { resource, data } = await req.json();
  if (resource === "post") { await savePost(data); return NextResponse.json({ ok: true }); }
  if (resource === "categories") { await saveCategories(data); return NextResponse.json({ ok: true }); }
  if (resource === "settings") { await saveSiteSettings(data); return NextResponse.json({ ok: true }); }
  return NextResponse.json({ error: "Unknown resource" }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "No id" }, { status: 400 });
  await deletePost(id);
  return NextResponse.json({ ok: true });
}
