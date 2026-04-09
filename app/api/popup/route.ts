import { NextResponse } from "next/server";
import { getActivePopup } from "@/lib/kv";

export async function GET() {
  try {
    const popup = await getActivePopup();
    return NextResponse.json({ popup });
  } catch {
    return NextResponse.json({ popup: null });
  }
}
