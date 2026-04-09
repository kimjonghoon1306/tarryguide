import { NextRequest, NextResponse } from "next/server";
import {
  getAllPostsAdmin, savePost, deletePost,
  getCategories, saveCategories,
  getSiteSettings, saveSiteSettings,
  getPopupNotices, savePopupNotices,
  getAdminPassword, saveAdminPassword,
} from "@/lib/kv";

async function checkAuth(req: NextRequest): Promise<boolean> {
  const pw = req.headers.get("x-admin-pw");
  if (!pw) return false;
  const stored = await getAdminPassword();
  return pw === stored;
}

export async function GET(req: NextRequest) {
  if (!(await checkAuth(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const resource = req.nextUrl.searchParams.get("resource");
  try {
    if (resource === "auth") return NextResponse.json({ ok: true });
    if (resource === "posts") return NextResponse.json(await getAllPostsAdmin());
    if (resource === "categories") return NextResponse.json(await getCategories());
    if (resource === "settings") return NextResponse.json(await getSiteSettings());
    if (resource === "popups") return NextResponse.json(await getPopupNotices());
    return NextResponse.json({ error: "Unknown resource" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await checkAuth(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { resource, data } = await req.json();
  if (resource === "post") { await savePost(data); return NextResponse.json({ ok: true }); }
  if (resource === "popup") {
    const notices = await getPopupNotices();
    notices.push(data);
    await savePopupNotices(notices);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Unknown resource" }, { status: 400 });
}

export async function PUT(req: NextRequest) {
  if (!(await checkAuth(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { resource, data } = await req.json();
  if (resource === "post") { await savePost(data); return NextResponse.json({ ok: true }); }
  if (resource === "categories") { await saveCategories(data); return NextResponse.json({ ok: true }); }
  if (resource === "settings") { await saveSiteSettings(data); return NextResponse.json({ ok: true }); }
  if (resource === "popups") { await savePopupNotices(data); return NextResponse.json({ ok: true }); }
  if (resource === "password") {
    await saveAdminPassword(data.newPassword);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Unknown resource" }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
  if (!(await checkAuth(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const resource = req.nextUrl.searchParams.get("resource") || "post";
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "No id" }, { status: 400 });
  if (resource === "post") { await deletePost(id); return NextResponse.json({ ok: true }); }
  if (resource === "popup") {
    const notices = await getPopupNotices();
    await savePopupNotices(notices.filter(n => n.id !== id));
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Unknown resource" }, { status: 400 });
}
