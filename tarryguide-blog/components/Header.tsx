"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Moon, Sun, Menu, X, Globe, ChevronDown } from "lucide-react";
import type { Category, SiteSettings } from "@/lib/types";
import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";

interface HeaderProps {
  settings: SiteSettings;
  categories: Category[];
  lang: Lang;
  onLangChange: (l: Lang) => void;
}

export default function Header({ settings, categories, lang, onLangChange }: HeaderProps) {
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const isDark = saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const siteName = lang === "ko" ? settings.siteNameKo || settings.siteName : settings.siteName;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "glass shadow-lg shadow-black/5" : "bg-transparent"
        }`}
        style={{ borderBottom: scrolled ? "1px solid var(--border)" : "none" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2 group">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm"
              style={{ background: "linear-gradient(135deg, var(--brand), #3b82f6)" }}
            >
              T
            </div>
            <span className="font-black text-xl tracking-tight" style={{ color: "var(--fg)" }}>
              {siteName}
            </span>
          </Link>

          {/* 데스크탑 네비 */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/" className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ color: "var(--fg2)" }}>
              {t[lang].home}
            </Link>
            <div className="relative" onMouseEnter={() => setCatOpen(true)} onMouseLeave={() => setCatOpen(false)}>
              <button className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-1" style={{ color: "var(--fg2)" }}>
                {t[lang].category} <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {catOpen && (
                <div className="absolute top-full left-0 pt-2 w-64">
                  <div className="rounded-2xl shadow-2xl p-2 grid grid-cols-2 gap-1" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                    <Link href="/" className="col-span-2 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ color: "var(--brand)" }}>
                      🗂️ {t[lang].all}
                    </Link>
                    {categories.map((c) => (
                      <Link key={c.id} href={`/?cat=${c.slug}`} className="px-3 py-2 rounded-lg text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-1.5" style={{ color: "var(--fg2)" }}>
                        <span>{c.icon}</span>
                        <span>{lang === "ko" ? c.name : c.nameEn}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* 우측 버튼들 */}
          <div className="flex items-center gap-1">
            <button onClick={() => setSearchOpen(true)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ color: "var(--fg2)" }}>
              <Search className="w-4.5 h-4.5" />
            </button>
            <button onClick={toggleDark} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ color: "var(--fg2)" }}>
              {dark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
            <button onClick={() => onLangChange(lang === "ko" ? "en" : "ko")} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-xs font-bold" style={{ color: "var(--fg2)" }}>
              {lang === "ko" ? "EN" : "KO"}
            </button>
            <button onClick={() => setMenuOpen(true)} className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--fg2)" }}>
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* 모바일 메뉴 */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div className="relative ml-auto w-72 h-full flex flex-col shadow-2xl overflow-y-auto" style={{ background: "var(--card)" }}>
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--border)" }}>
              <span className="font-black text-lg">{siteName}</span>
              <button onClick={() => setMenuOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-4 flex flex-col gap-1">
              <Link href="/" onClick={() => setMenuOpen(false)} className="px-3 py-3 rounded-xl font-semibold" style={{ color: "var(--brand)" }}>
                🏠 {t[lang].home}
              </Link>
              <div className="text-xs font-bold uppercase tracking-widest mt-3 mb-1 px-3" style={{ color: "var(--fg2)" }}>
                {t[lang].category}
              </div>
              {categories.map((c) => (
                <Link key={c.id} href={`/?cat=${c.slug}`} onClick={() => setMenuOpen(false)} className="px-3 py-2.5 rounded-xl flex items-center gap-2 text-sm hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--fg2)" }}>
                  <span className="text-lg">{c.icon}</span>
                  <span>{lang === "ko" ? c.name : c.nameEn}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* 검색 모달 */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSearchOpen(false)} />
          <div className="relative w-full max-w-xl">
            <div className="relative rounded-2xl shadow-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "var(--fg2)" }} />
              <input
                autoFocus
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && searchQ.trim()) { window.location.href = `/?q=${encodeURIComponent(searchQ)}`; setSearchOpen(false); } if (e.key === "Escape") setSearchOpen(false); }}
                placeholder={t[lang].searchPlaceholder}
                className="w-full pl-12 pr-12 py-4 bg-transparent text-base outline-none"
                style={{ color: "var(--fg)" }}
              />
              <button onClick={() => setSearchOpen(false)} className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
