"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function Header({ lang, onLangChange }: { lang: string; onLangChange: () => void }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [dark, setDark] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const today = new Date().toLocaleDateString(lang === "ko" ? "ko-KR" : "en-US", {
    year: "numeric", month: "long", day: "numeric", weekday: "long"
  });

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDark = () => {
    setDark(!dark);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", !dark ? "dark" : "light");
  };

  useEffect(() => { if (searchOpen) searchRef.current?.focus(); }, [searchOpen]);

  return (
    <header style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
      {/* 상단 바 - 날짜, 다크모드, 언어 */}
      <div style={{ borderBottom: "1px solid var(--border)", padding: "6px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: "var(--fg3)" }}>{today}</span>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <button onClick={toggleDark} style={{ fontSize: 12, color: "var(--fg3)", background: "none", border: "none", cursor: "pointer" }}>
              {dark ? "☀ 라이트" : "☾ 다크"}
            </button>
            <button onClick={onLangChange} style={{ fontSize: 12, color: "var(--fg3)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
              {lang === "ko" ? "EN" : "KO"}
            </button>
          </div>
        </div>
      </div>

      {/* 로고 영역 */}
      <div style={{ padding: "20px 0 16px", textAlign: "center", borderBottom: "3px solid var(--fg)" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{ fontFamily: "'Playfair Display', 'Noto Serif KR', serif", fontSize: "clamp(32px, 6vw, 56px)", fontWeight: 900, color: "var(--fg)", letterSpacing: "-1px", lineHeight: 1 }}>
            TarryGuide
          </div>
          <div style={{ fontFamily: "'Noto Sans KR', sans-serif", fontSize: 11, color: "var(--fg3)", letterSpacing: "0.3em", marginTop: 4, textTransform: "uppercase" }}>
            {lang === "ko" ? "더 나은 삶을 위한 가이드" : "Your Guide to a Better Life"}
          </div>
        </Link>
      </div>

      {/* 네비게이션 */}
      <nav style={{ borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 0 }}>
            <Link href="/" style={{ padding: "12px 20px", fontSize: 13, fontWeight: 700, color: "var(--fg)", textDecoration: "none", borderRight: "1px solid var(--border)" }}>홈</Link>
            <Link href="/admin" style={{ padding: "12px 20px", fontSize: 13, color: "var(--fg2)", textDecoration: "none", borderRight: "1px solid var(--border)" }}>관리자</Link>
          </div>
          <button onClick={() => setSearchOpen(!searchOpen)} style={{ padding: "8px 12px", background: "none", border: "none", cursor: "pointer", color: "var(--fg2)", fontSize: 16 }}>
            🔍
          </button>
        </div>
      </nav>

      {/* 검색창 */}
      {searchOpen && (
        <div style={{ background: "var(--bg2)", borderBottom: "1px solid var(--border)", padding: "12px 24px" }}>
          <div style={{ maxWidth: 600, margin: "0 auto", display: "flex", gap: 8 }}>
            <input ref={searchRef} value={query} onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && query && (window.location.href = `/?q=${encodeURIComponent(query)}`)}
              placeholder="검색어를 입력하세요..."
              style={{ flex: 1, padding: "10px 14px", border: "1px solid var(--border-dark)", background: "var(--bg)", color: "var(--fg)", fontSize: 14, outline: "none" }} />
            <button onClick={() => query && (window.location.href = `/?q=${encodeURIComponent(query)}`)}
              style={{ padding: "10px 20px", background: "var(--fg)", color: "var(--bg)", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
              검색
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
