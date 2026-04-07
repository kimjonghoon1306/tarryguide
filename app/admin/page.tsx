"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { marked } from "marked";
import {
  LayoutDashboard, FileText, Tag, Settings, Plus, Edit3, Trash2,
  Eye, EyeOff, Star, StarOff, Save, X, ChevronDown, Upload,
  BarChart3, Globe, Palette, RefreshCw, Check, AlertTriangle,
  ArrowLeft, Search, Filter, GripVertical
} from "lucide-react";
import type { Post, Category, SiteSettings } from "@/lib/types";
import { generateSlug } from "@/lib/i18n";

type Tab = "posts" | "write" | "categories" | "settings" | "stats";

const EMOJI_LIST = ["🌿","✈️","🍜","💰","💻","💄","💪","👶","🐾","🏠","⭐","🔥","📚","🎵","🎮","🏋️","🌍","💡","🎨","🛒","🏥","🌸","🎯","🤝","📱","🌈","🦁","🐬","🌺","🎉"];
const COLOR_LIST = ["#22c55e","#3b82f6","#f97316","#eab308","#8b5cf6","#ec4899","#14b8a6","#f43f5e","#a16207","#0ea5e9","#ef4444","#6366f1","#84cc16","#06b6d4","#d946ef"];

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwErr, setPwErr] = useState(false);
  const [tab, setTab] = useState<Tab>("posts");
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [searchQ, setSearchQ] = useState("");
  const [editPost, setEditPost] = useState<Partial<Post> | null>(null);
  const [editCat, setEditCat] = useState<Partial<Category> | null>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pr, cr, sr] = await Promise.all([
        fetch("/api/admin?resource=posts", { headers: { "x-admin-pw": localStorage.getItem("admin_pw") || "" } }),
        fetch("/api/admin?resource=categories", { headers: { "x-admin-pw": localStorage.getItem("admin_pw") || "" } }),
        fetch("/api/admin?resource=settings", { headers: { "x-admin-pw": localStorage.getItem("admin_pw") || "" } }),
      ]);
      if (pr.ok) setPosts(await pr.json());
      if (cr.ok) setCategories(await cr.json());
      if (sr.ok) setSettings(await sr.json());
    } catch { showToast("데이터 로드 실패", "err"); }
    setLoading(false);
  }, []);

  const handleLogin = async () => {
    const res = await fetch("/api/admin?resource=auth", { headers: { "x-admin-pw": pw } });
    if (res.ok) {
      setAuthed(true);
      localStorage.setItem("admin_pw", pw);
      load();
    } else { setPwErr(true); }
  };

  useEffect(() => {
    const saved = localStorage.getItem("admin_pw");
    if (saved) {
      fetch("/api/admin?resource=auth", { headers: { "x-admin-pw": saved } }).then((r) => {
        if (r.ok) { setAuthed(true); setPw(saved); load(); }
      });
    }
  }, [load]);

  const savePost = async (post: Partial<Post>) => {
    const isNew = !post.id;
    const data: Post = {
      id: post.id || `p_${Date.now()}`,
      title: post.title || "제목 없음",
      slug: post.slug || generateSlug(post.title || "post"),
      content: post.content || "",
      excerpt: post.excerpt || (post.content || "").replace(/<[^>]+>/g, "").slice(0, 120) + "...",
      category: post.category || "",
      tags: post.tags || [],
      thumbnail: post.thumbnail || "",
      author: post.author || "TarryGuide",
      lang: post.lang || "ko",
      published: post.published ?? true,
      featured: post.featured ?? false,
      views: post.views || 0,
      createdAt: post.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const res = await fetch("/api/admin", {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json", "x-admin-pw": localStorage.getItem("admin_pw") || "" },
      body: JSON.stringify({ resource: "post", data }),
    });
    if (res.ok) { showToast(isNew ? "글이 발행됐어!" : "글이 수정됐어!"); setEditPost(null); load(); }
    else showToast("저장 실패", "err");
  };

  const deletePost = async (id: string) => {
    if (!confirm("정말 삭제할까요?")) return;
    const res = await fetch(`/api/admin?resource=post&id=${id}`, { method: "DELETE", headers: { "x-admin-pw": localStorage.getItem("admin_pw") || "" } });
    if (res.ok) { showToast("삭제됐어!"); load(); } else showToast("삭제 실패", "err");
  };

  const saveCat = async (cat: Partial<Category>) => {
    const isNew = !cat.id;
    const data: Category = {
      id: cat.id || `cat_${Date.now()}`,
      name: cat.name || "",
      nameEn: cat.nameEn || "",
      slug: cat.slug || (cat.name || "").toLowerCase().replace(/\s+/g, "-"),
      icon: cat.icon || "📁",
      color: cat.color || "#22c55e",
      description: cat.description || "",
      count: cat.count || 0,
    };
    const newCats = isNew ? [...categories, data] : categories.map((c) => c.id === data.id ? data : c);
    const res = await fetch("/api/admin", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-pw": localStorage.getItem("admin_pw") || "" },
      body: JSON.stringify({ resource: "categories", data: newCats }),
    });
    if (res.ok) { showToast("카테고리 저장!"); setEditCat(null); load(); } else showToast("저장 실패", "err");
  };

  const deleteCat = async (id: string) => {
    if (!confirm("카테고리를 삭제할까요?")) return;
    const newCats = categories.filter((c) => c.id !== id);
    const res = await fetch("/api/admin", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-pw": localStorage.getItem("admin_pw") || "" },
      body: JSON.stringify({ resource: "categories", data: newCats }),
    });
    if (res.ok) { showToast("삭제됐어!"); load(); }
  };

  const saveSettings = async () => {
    if (!settings) return;
    const res = await fetch("/api/admin", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-pw": localStorage.getItem("admin_pw") || "" },
      body: JSON.stringify({ resource: "settings", data: settings }),
    });
    if (res.ok) showToast("설정 저장!"); else showToast("저장 실패", "err");
  };

  const filteredPosts = posts.filter((p) =>
    p.title?.toLowerCase().includes(searchQ.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQ.toLowerCase())
  );

  // ─── 로그인 화면 ─────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg)" }}>
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black mx-auto mb-4" style={{ background: "linear-gradient(135deg, #22c55e, #3b82f6)" }}>T</div>
            <h1 className="text-2xl font-black" style={{ color: "var(--fg)" }}>관리자 로그인</h1>
            <p className="text-sm mt-1" style={{ color: "var(--fg2)" }}>TarryGuide Admin</p>
          </div>
          <div className="rounded-2xl p-6 shadow-xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <input
              type="password"
              value={pw}
              onChange={(e) => { setPw(e.target.value); setPwErr(false); }}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="비밀번호"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none mb-3"
              style={{ background: "var(--bg2)", border: `1px solid ${pwErr ? "#ef4444" : "var(--border)"}`, color: "var(--fg)" }}
            />
            {pwErr && <p className="text-xs text-red-500 mb-3">비밀번호가 틀렸어요</p>}
            <button onClick={handleLogin} className="w-full py-3 rounded-xl font-semibold text-white transition-opacity hover:opacity-90" style={{ background: "#22c55e" }}>
              로그인
            </button>
          </div>
          <div className="text-center mt-4">
            <Link href="/" className="text-sm" style={{ color: "var(--fg2)" }}>← 블로그로 돌아가기</Link>
          </div>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: "posts", label: "글 목록", icon: FileText },
    { id: "write", label: "새 글 쓰기", icon: Plus },
    { id: "categories", label: "카테고리", icon: Tag },
    { id: "settings", label: "사이트 설정", icon: Settings },
    { id: "stats", label: "통계", icon: BarChart3 },
  ] as const;

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
      {/* 토스트 */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-semibold animate-slide-up ${toast.type === "ok" ? "bg-green-500" : "bg-red-500"}`}>
          {toast.type === "ok" ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* 사이드바 */}
      <aside className="w-56 flex-shrink-0 h-screen sticky top-0 flex flex-col" style={{ background: "var(--card)", borderRight: "1px solid var(--border)" }}>
        <div className="p-5 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm" style={{ background: "linear-gradient(135deg, #22c55e, #3b82f6)" }}>T</div>
            <div>
              <p className="font-black text-sm" style={{ color: "var(--fg)" }}>Admin</p>
              <p className="text-xs" style={{ color: "var(--fg2)" }}>TarryGuide</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setTab(id); setEditPost(null); setEditCat(null); }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
              style={tab === id ? { background: "#22c55e", color: "white" } : { color: "var(--fg2)" }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t" style={{ borderColor: "var(--border)" }}>
          <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--fg2)" }}>
            <ArrowLeft className="w-4 h-4" /> 블로그 보기
          </Link>
        </div>
      </aside>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">

          {/* ─── 글 목록 ─── */}
          {tab === "posts" && !editPost && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-black" style={{ color: "var(--fg)" }}>글 목록</h1>
                  <p className="text-sm mt-1" style={{ color: "var(--fg2)" }}>총 {posts.length}개의 글</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={load} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--fg2)" }}>
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  </button>
                  <button onClick={() => { setEditPost({}); setTab("write"); }} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: "#22c55e" }}>
                    <Plus className="w-4 h-4" /> 새 글
                  </button>
                </div>
              </div>

              {/* 검색 */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--fg2)" }} />
                <input
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  placeholder="제목, 카테고리 검색..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--fg)" }}
                />
              </div>

              <div className="flex flex-col gap-2">
                {filteredPosts.map((post) => {
                  const cat = categories.find((c) => c.id === post.category);
                  return (
                    <div key={post.id} className="flex items-center gap-4 p-4 rounded-xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                      {post.thumbnail && (
                        <img src={post.thumbnail} alt="" className="w-16 h-12 rounded-lg object-cover flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {cat && <span className="text-xs px-2 py-0.5 rounded-full font-semibold text-white" style={{ background: cat.color }}>{cat.icon} {cat.name}</span>}
                          {!post.published && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300">비공개</span>}
                          {post.featured && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">⭐ 추천</span>}
                        </div>
                        <p className="font-semibold text-sm truncate" style={{ color: "var(--fg)" }}>{post.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--fg2)" }}>{new Date(post.createdAt).toLocaleDateString("ko-KR")} · 조회 {post.views || 0}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => { setEditPost(post); setTab("write"); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--fg2)" }} title="수정">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deletePost(post.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400" title="삭제">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {filteredPosts.length === 0 && (
                  <div className="text-center py-16" style={{ color: "var(--fg2)" }}>
                    <p className="text-4xl mb-3">📭</p>
                    <p>글이 없어요</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── 글 쓰기/수정 ─── */}
          {tab === "write" && (
            <WriteEditor
              post={editPost || {}}
              categories={categories}
              onSave={savePost}
              onCancel={() => { setEditPost(null); setTab("posts"); }}
            />
          )}

          {/* ─── 카테고리 ─── */}
          {tab === "categories" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-black" style={{ color: "var(--fg)" }}>카테고리</h1>
                  <p className="text-sm mt-1" style={{ color: "var(--fg2)" }}>총 {categories.length}개</p>
                </div>
                <button onClick={() => setEditCat({})} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: "#22c55e" }}>
                  <Plus className="w-4 h-4" /> 카테고리 추가
                </button>
              </div>

              {editCat && (
                <CategoryEditor cat={editCat} onSave={saveCat} onCancel={() => setEditCat(null)} />
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <div key={cat.id} className="p-4 rounded-2xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: `${cat.color}20` }}>
                          {cat.icon}
                        </div>
                        <div>
                          <p className="font-bold" style={{ color: "var(--fg)" }}>{cat.name}</p>
                          <p className="text-xs" style={{ color: "var(--fg2)" }}>{cat.nameEn}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setEditCat(cat)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/5" style={{ color: "var(--fg2)" }}>
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteCat(cat.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs" style={{ color: "var(--fg2)" }}>
                      <span>{cat.description}</span>
                      <div className="w-4 h-4 rounded-full" style={{ background: cat.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── 사이트 설정 ─── */}
          {tab === "settings" && settings && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-black" style={{ color: "var(--fg)" }}>사이트 설정</h1>
                <button onClick={saveSettings} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: "#22c55e" }}>
                  <Save className="w-4 h-4" /> 저장
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <SettingCard title="기본 정보">
                  <SettingField label="사이트 이름 (영문)" value={settings.siteName} onChange={(v) => setSettings({ ...settings, siteName: v })} />
                  <SettingField label="사이트 이름 (한글)" value={settings.siteNameKo} onChange={(v) => setSettings({ ...settings, siteNameKo: v })} />
                  <SettingField label="소개 문구 (영문)" value={settings.tagline} onChange={(v) => setSettings({ ...settings, tagline: v })} />
                  <SettingField label="소개 문구 (한글)" value={settings.taglineKo} onChange={(v) => setSettings({ ...settings, taglineKo: v })} />
                  <SettingField label="푸터 텍스트" value={settings.footerText} onChange={(v) => setSettings({ ...settings, footerText: v })} />
                </SettingCard>
                <SettingCard title="광고 & 분석">
                  <SettingField label="Google AdSense ID" value={settings.adsenseId} onChange={(v) => setSettings({ ...settings, adsenseId: v })} placeholder="ca-pub-xxxxxxxxxxxxxxxx" />
                  <SettingField label="Google Analytics ID" value={settings.analyticsId} onChange={(v) => setSettings({ ...settings, analyticsId: v })} placeholder="G-XXXXXXXXXX" />
                </SettingCard>
                <SettingCard title="SNS 링크">
                  <SettingField label="Twitter" value={settings.socialLinks?.twitter || ""} onChange={(v) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, twitter: v } })} placeholder="https://twitter.com/..." />
                  <SettingField label="Instagram" value={settings.socialLinks?.instagram || ""} onChange={(v) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, instagram: v } })} placeholder="https://instagram.com/..." />
                  <SettingField label="YouTube" value={settings.socialLinks?.youtube || ""} onChange={(v) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, youtube: v } })} placeholder="https://youtube.com/..." />
                  <SettingField label="Email" value={settings.socialLinks?.email || ""} onChange={(v) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, email: v } })} placeholder="contact@example.com" />
                </SettingCard>
              </div>
            </div>
          )}

          {/* ─── 통계 ─── */}
          {tab === "stats" && (
            <div>
              <h1 className="text-2xl font-black mb-6" style={{ color: "var(--fg)" }}>통계</h1>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "전체 글", value: posts.length, icon: "📝", color: "#22c55e" },
                  { label: "발행된 글", value: posts.filter((p) => p.published).length, icon: "✅", color: "#3b82f6" },
                  { label: "카테고리", value: categories.length, icon: "🗂️", color: "#f97316" },
                  { label: "총 조회수", value: posts.reduce((s, p) => s + (p.views || 0), 0).toLocaleString(), icon: "👁️", color: "#8b5cf6" },
                ].map((s) => (
                  <div key={s.label} className="p-5 rounded-2xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                    <div className="text-3xl mb-2">{s.icon}</div>
                    <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-sm mt-1" style={{ color: "var(--fg2)" }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <h2 className="font-bold mb-4" style={{ color: "var(--fg)" }}>인기 글 TOP 10</h2>
                <div className="flex flex-col gap-2">
                  {[...posts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10).map((p, i) => (
                    <div key={p.id} className="flex items-center gap-3">
                      <span className="w-6 text-sm font-bold text-center" style={{ color: i < 3 ? "#f97316" : "var(--fg2)" }}>{i + 1}</span>
                      <p className="flex-1 text-sm truncate" style={{ color: "var(--fg)" }}>{p.title}</p>
                      <span className="text-sm font-semibold" style={{ color: "var(--brand)" }}>{(p.views || 0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

// ─── 글 에디터 ─────────────────────────────────────────────
function WriteEditor({ post, categories, onSave, onCancel }: {
  post: Partial<Post>;
  categories: Category[];
  onSave: (p: Partial<Post>) => void;
  onCancel: () => void;
}) {
  const [data, setData] = useState<Partial<Post>>(post);
  const [preview, setPreview] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const set = (k: keyof Post, v: any) => setData((d) => ({ ...d, [k]: v }));

  const addTag = () => {
    if (!tagInput.trim()) return;
    set("tags", [...(data.tags || []), tagInput.trim()]);
    setTagInput("");
  };
  const removeTag = (i: number) => set("tags", (data.tags || []).filter((_, idx) => idx !== i));

  const insertBlock = (type: string) => {
    const blocks: Record<string, string> = {
      tip: "\n[팁]\n💡 팁 내용을 여기에 입력하세요\n[/팁]\n",
      warning: "\n[주의]\n⚠️ 주의 내용을 여기에 입력하세요\n[/주의]\n",
      important: "\n[중요]\n🚨 중요 내용을 여기에 입력하세요\n[/중요]\n",
      info: "\n[정보]\nℹ️ 정보 내용을 여기에 입력하세요\n[/정보]\n",
      h2: "\n## 소제목\n",
      h3: "\n### 소제목\n",
      bold: "**굵은 텍스트**",
      link: "[링크 텍스트](https://example.com)",
      image: "![이미지 설명](이미지URL)",
      quote: "\n> 인용문을 여기에\n",
      code: "\n```\n코드를 여기에\n```\n",
      table: "\n| 컬럼1 | 컬럼2 | 컬럼3 |\n|---|---|---|\n| 내용 | 내용 | 내용 |\n",
      hr: "\n---\n",
    };
    set("content", (data.content || "") + (blocks[type] || ""));
  };

  const TOOLBAR = [
    { id: "h2", label: "H2", title: "소제목 2" },
    { id: "h3", label: "H3", title: "소제목 3" },
    { id: "bold", label: "B", title: "굵게" },
    { id: "quote", label: "❝", title: "인용" },
    { id: "code", label: "</>", title: "코드" },
    { id: "link", label: "🔗", title: "링크" },
    { id: "image", label: "🖼️", title: "이미지" },
    { id: "table", label: "⊞", title: "표" },
    { id: "hr", label: "—", title: "구분선" },
    { id: "tip", label: "💡팁", title: "팁 박스" },
    { id: "warning", label: "⚠️주의", title: "주의 박스" },
    { id: "important", label: "🚨중요", title: "중요 박스" },
    { id: "info", label: "ℹ️정보", title: "정보 박스" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--fg2)" }}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-black" style={{ color: "var(--fg)" }}>{data.id ? "글 수정" : "새 글 쓰기"}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPreview(!preview)} className="px-4 py-2 rounded-xl text-sm font-medium border transition-colors" style={{ color: "var(--fg2)", borderColor: "var(--border)" }}>
            {preview ? "편집" : "미리보기"}
          </button>
          <button onClick={() => onSave({ ...data, published: false })} className="px-4 py-2 rounded-xl text-sm font-medium border" style={{ color: "var(--fg2)", borderColor: "var(--border)" }}>
            임시저장
          </button>
          <button onClick={() => onSave({ ...data, published: true })} className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: "#22c55e" }}>
            <Save className="w-4 h-4" /> 발행
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* 에디터 영역 */}
        <div className="xl:col-span-2">
          {/* 툴바 */}
          <div className="flex flex-wrap gap-1 p-3 rounded-t-2xl border-b" style={{ background: "var(--card)", border: "1px solid var(--border)", borderBottom: "none" }}>
            {TOOLBAR.map((btn) => (
              <button key={btn.id} onClick={() => insertBlock(btn.id)} title={btn.title}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                style={{ color: "var(--fg2)" }}>
                {btn.label}
              </button>
            ))}
          </div>

          {/* 제목 */}
          <div className="px-4 pt-4 pb-2" style={{ background: "var(--card)", borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)" }}>
            <input
              value={data.title || ""}
              onChange={(e) => set("title", e.target.value)}
              placeholder="제목을 입력하세요"
              className="w-full text-2xl font-black outline-none bg-transparent placeholder-gray-300 dark:placeholder-gray-600"
              style={{ color: "var(--fg)" }}
            />
          </div>

          {/* 본문 */}
          {preview ? (
            <div className="p-6 min-h-96 rounded-b-2xl prose" style={{ background: "var(--card)", border: "1px solid var(--border)", borderTop: "none" }}
              dangerouslySetInnerHTML={{ __html: (() => {
                let html = marked(data.content || "") as string;
                html = html.replace(/\[팁\](.*?)\[\/팁\]/gs, '<div class="tip-box">$1</div>');
                html = html.replace(/\[주의\](.*?)\[\/주의\]/gs, '<div class="warning-box">$1</div>');
                html = html.replace(/\[중요\](.*?)\[\/중요\]/gs, '<div class="important-box">$1</div>');
                html = html.replace(/\[정보\](.*?)\[\/정보\]/gs, '<div class="info-box">$1</div>');
                return html;
              })() }} />
          ) : (
            <textarea
              value={data.content || ""}
              onChange={(e) => set("content", e.target.value)}
              placeholder="마크다운으로 글을 작성하세요...&#10;&#10;## 소제목&#10;**굵게**, *기울임*&#10;&#10;[팁]팁 박스[/팁]&#10;[주의]주의 박스[/주의]"
              className="w-full p-5 min-h-96 outline-none resize-none font-mono text-sm rounded-b-2xl"
              style={{ background: "var(--card)", border: "1px solid var(--border)", borderTop: "none", color: "var(--fg)", lineHeight: 1.8 }}
            />
          )}
        </div>

        {/* 설정 패널 */}
        <div className="flex flex-col gap-4">
          {/* 발행 설정 */}
          <div className="p-5 rounded-2xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <p className="font-bold mb-4 text-sm" style={{ color: "var(--fg)" }}>발행 설정</p>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm" style={{ color: "var(--fg2)" }}>공개</span>
              <button onClick={() => set("published", !data.published)} className="w-11 h-6 rounded-full transition-colors relative" style={{ background: data.published ? "#22c55e" : "var(--border)" }}>
                <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform" style={{ transform: data.published ? "translateX(20px)" : "translateX(2px)" }} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: "var(--fg2)" }}>추천글</span>
              <button onClick={() => set("featured", !data.featured)} className="w-11 h-6 rounded-full transition-colors relative" style={{ background: data.featured ? "#f59e0b" : "var(--border)" }}>
                <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform" style={{ transform: data.featured ? "translateX(20px)" : "translateX(2px)" }} />
              </button>
            </div>
          </div>

          {/* 카테고리 */}
          <div className="p-5 rounded-2xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <p className="font-bold mb-3 text-sm" style={{ color: "var(--fg)" }}>카테고리</p>
            <div className="grid grid-cols-2 gap-1.5">
              {categories.map((cat) => (
                <button key={cat.id} onClick={() => set("category", cat.id)}
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={data.category === cat.id ? { background: cat.color, color: "white" } : { background: "var(--bg2)", color: "var(--fg2)" }}>
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* 썸네일 */}
          <div className="p-5 rounded-2xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <p className="font-bold mb-3 text-sm" style={{ color: "var(--fg)" }}>썸네일 URL</p>
            <input
              value={data.thumbnail || ""}
              onChange={(e) => set("thumbnail", e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: "var(--bg2)", border: "1px solid var(--border)", color: "var(--fg)" }}
            />
            {data.thumbnail && <img src={data.thumbnail} alt="" className="w-full h-28 object-cover rounded-xl mt-2" />}
          </div>

          {/* 요약 */}
          <div className="p-5 rounded-2xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <p className="font-bold mb-3 text-sm" style={{ color: "var(--fg)" }}>요약 (비워두면 자동)</p>
            <textarea
              value={data.excerpt || ""}
              onChange={(e) => set("excerpt", e.target.value)}
              placeholder="글 요약..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
              style={{ background: "var(--bg2)", border: "1px solid var(--border)", color: "var(--fg)" }}
            />
          </div>

          {/* 태그 */}
          <div className="p-5 rounded-2xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <p className="font-bold mb-3 text-sm" style={{ color: "var(--fg)" }}>태그</p>
            <div className="flex gap-2 mb-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTag()}
                placeholder="태그 입력 후 Enter"
                className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: "var(--bg2)", border: "1px solid var(--border)", color: "var(--fg)" }}
              />
              <button onClick={addTag} className="px-3 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: "#22c55e" }}>+</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(data.tags || []).map((tag, i) => (
                <span key={i} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
                  #{tag}
                  <button onClick={() => removeTag(i)} className="hover:opacity-60">×</button>
                </span>
              ))}
            </div>
          </div>

          {/* 슬러그 */}
          <div className="p-5 rounded-2xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <p className="font-bold mb-3 text-sm" style={{ color: "var(--fg)" }}>URL 슬러그</p>
            <input
              value={data.slug || ""}
              onChange={(e) => set("slug", e.target.value)}
              placeholder="자동 생성됩니다"
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none font-mono"
              style={{ background: "var(--bg2)", border: "1px solid var(--border)", color: "var(--fg2)" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 카테고리 에디터 ────────────────────────────────────────
function CategoryEditor({ cat, onSave, onCancel }: {
  cat: Partial<Category>;
  onSave: (c: Partial<Category>) => void;
  onCancel: () => void;
}) {
  const [data, setData] = useState<Partial<Category>>(cat);
  const set = (k: keyof Category, v: any) => setData((d) => ({ ...d, [k]: v }));

  return (
    <div className="mb-6 p-5 rounded-2xl" style={{ background: "var(--card)", border: "2px solid #22c55e" }}>
      <div className="flex items-center justify-between mb-4">
        <p className="font-bold" style={{ color: "var(--fg)" }}>{cat.id ? "카테고리 수정" : "새 카테고리"}</p>
        <button onClick={onCancel} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/5" style={{ color: "var(--fg2)" }}><X className="w-4 h-4" /></button>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--fg2)" }}>이름 (한글)</label>
          <input value={data.name || ""} onChange={(e) => set("name", e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: "var(--bg2)", border: "1px solid var(--border)", color: "var(--fg)" }} placeholder="예: 여행" />
        </div>
        <div>
          <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--fg2)" }}>이름 (영문)</label>
          <input value={data.nameEn || ""} onChange={(e) => set("nameEn", e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: "var(--bg2)", border: "1px solid var(--border)", color: "var(--fg)" }} placeholder="예: Travel" />
        </div>
        <div>
          <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--fg2)" }}>설명</label>
          <input value={data.description || ""} onChange={(e) => set("description", e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: "var(--bg2)", border: "1px solid var(--border)", color: "var(--fg)" }} placeholder="짧은 설명" />
        </div>
        <div>
          <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--fg2)" }}>슬러그</label>
          <input value={data.slug || ""} onChange={(e) => set("slug", e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm outline-none font-mono" style={{ background: "var(--bg2)", border: "1px solid var(--border)", color: "var(--fg)" }} placeholder="travel" />
        </div>
      </div>
      <div className="mb-3">
        <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--fg2)" }}>아이콘 선택</label>
        <div className="flex flex-wrap gap-2">
          {EMOJI_LIST.map((e) => (
            <button key={e} onClick={() => set("icon", e)} className="w-9 h-9 flex items-center justify-center rounded-xl text-lg transition-all" style={data.icon === e ? { background: "#22c55e", transform: "scale(1.15)" } : { background: "var(--bg2)" }}>
              {e}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--fg2)" }}>색상 선택</label>
        <div className="flex flex-wrap gap-2">
          {COLOR_LIST.map((c) => (
            <button key={c} onClick={() => set("color", c)} className="w-8 h-8 rounded-full transition-all" style={{ background: c, outline: data.color === c ? `3px solid ${c}` : "none", outlineOffset: "2px", transform: data.color === c ? "scale(1.15)" : "scale(1)" }} />
          ))}
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-medium border" style={{ color: "var(--fg2)", borderColor: "var(--border)" }}>취소</button>
        <button onClick={() => onSave(data)} className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: "#22c55e" }}>
          <Save className="w-4 h-4" /> 저장
        </button>
      </div>
    </div>
  );
}

// ─── 재사용 컴포넌트 ────────────────────────────────────────
function SettingCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-5 rounded-2xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
      <p className="font-bold mb-4" style={{ color: "var(--fg)" }}>{title}</p>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function SettingField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--fg2)" }}>{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
        style={{ background: "var(--bg2)", border: "1px solid var(--border)", color: "var(--fg)" }} />
    </div>
  );
}
