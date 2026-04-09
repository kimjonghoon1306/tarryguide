"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Header({ lang, onLangChange }: { lang: string; onLangChange: () => void }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

  const doSearch = () => {
    if (query) window.location.href = `/?q=${encodeURIComponent(query)}`;
  };

  return (
    <header style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
      {/* 상단 바 */}
      <div style={{ borderBottom: "1px solid var(--border)", padding: "6px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: "var(--fg3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "60%" }}>{today}</span>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexShrink: 0 }}>
            <button onClick={toggleDark} style={{ fontSize: 12, color: "var(--fg3)", background: "none", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>
              {dark ? "☀ 라이트" : "☾ 다크"}
            </button>
            <button onClick={onLangChange} style={{ fontSize: 12, color: "var(--fg3)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
              {lang === "ko" ? "EN" : "KO"}
            </button>
            <Link href="/admin" style={{ fontSize: 22, color: "var(--fg2)", textDecoration: "none", lineHeight: 1, display: "flex", alignItems: "center" }} title="관리자">
              ⚙️
            </Link>
          </div>
        </div>
      </div>

      {/* 로고 */}
      <div style={{ padding: "16px 0 14px", textAlign: "center", borderBottom: "3px solid var(--fg)" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{ fontFamily: "'Playfair Display', 'Noto Serif KR', serif", fontSize: "clamp(28px, 6vw, 56px)", fontWeight: 900, color: "var(--fg)", letterSpacing: "-1px", lineHeight: 1 }}>
            TarryGuide
          </div>
          <div style={{ fontFamily: "'Noto Sans KR', sans-serif", fontSize: 11, color: "var(--fg3)", letterSpacing: "0.3em", marginTop: 4, textTransform: "uppercase" }}>
            {lang === "ko" ? "더 나은 삶을 위한 가이드" : "Your Guide to a Better Life"}
          </div>
        </Link>
      </div>

      {/* 네비 + 검색 */}
      <nav style={{ borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ padding: "12px 14px", fontSize: 12, fontWeight: 700, color: "var(--fg)", textDecoration: "none", whiteSpace: "nowrap", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            ALL
          </Link>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {searchOpen && (
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  autoFocus
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && doSearch()}
                  placeholder="검색..."
                  style={{ width: "clamp(120px, 30vw, 240px)", padding: "6px 10px", border: "1px solid var(--border-dark)", background: "var(--bg)", color: "var(--fg)", fontSize: 13, outline: "none" }}
                />
                <button onClick={doSearch} style={{ padding: "6px 12px", background: "var(--fg)", color: "var(--bg)", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>검색</button>
              </div>
            )}
            <button onClick={() => setSearchOpen(!searchOpen)} style={{ padding: "8px", background: "none", border: "none", cursor: "pointer", color: "var(--fg2)", fontSize: 18 }}>
              {searchOpen ? "✕" : "🔍"}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
