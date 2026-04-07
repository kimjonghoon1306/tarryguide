import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text, targetLang } = await req.json();
    if (!text || !targetLang) return NextResponse.json({ error: "Missing params" }, { status: 400 });

    // Google Translate API (무료 비공식 엔드포인트)
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    const translated = data[0]?.map((item: any) => item[0]).join("") || text;

    return NextResponse.json({ translated });
  } catch (e) {
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
