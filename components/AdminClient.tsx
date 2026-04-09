"use client";
import { useState, useEffect } from "react";
import type { Post, SiteSettings, PopupNotice } from "@/lib/types";

const PW_KEY = "admin_pw_tarry";

function api(resource: string, pw: string) {
  return fetch(`/api/admin?resource=${resource}`, { headers: { "x-admin-pw": pw } }).then(r => r.json());
}

export default function AdminClient() {
  const [pw, setPw] = useState("");
  const [inputPw, setInputPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authErr, setAuthErr] = useState("");
  const [tab, setTab] = useState<"posts" | "settings" | "popups">("posts");

  const [posts, setPosts] = useState<Post[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [popups, setPopups] = useState<PopupNotice[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // 글 편집 상태
  const [editPost, setEditPost] = useState<Post | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editTitle, setEditTitle] = useState("");

  // 팝업 편집 상태
  const [editPopup, setEditPopup] = useState<PopupNotice | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(PW_KEY);
    if (saved) tryAuth(saved);
  }, []);

  const tryAuth = async (p: string) => {
    setLoading(true);
    setAuthErr("");
    try {
      const r = await fetch("/api/admin?resource=auth", { headers: { "x-admin-pw": p } });
      if (r.ok) {
        setPw(p);
        sessionStorage.setItem(PW_KEY, p);
        setAuthed(true);
        loadAll(p);
      } else {
        setAuthErr("비밀번호가 올바르지 않습니다");
      }
    } catch {
      setAuthErr("서버 연결 오류");
    }
    setLoading(false);
  };

  const loadAll = async (p: string) => {
    setLoading(true);
    const [ps, st, pp] = await Promise.all([
      api("posts", p), api("settings", p), api("popups", p)
    ]);
    if (Array.isArray(ps)) setPosts(ps);
    if (st && !st.error) setSettings(st);
    if (Array.isArray(pp)) setPopups(pp);
    setLoading(false);
  };

  const showMsg = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };

  // ── 글 삭제 ──────────────────────────────────────────
  const deletePost = async (id: string) => {
    if (!confirm("정말 삭제할까요?")) return;
    await fetch(`/api/admin?resource=post&id=${id}`, { method: "DELETE", headers: { "x-admin-pw": pw } });
    setPosts(prev => prev.filter(p => p.id !== id));
    showMsg("삭제되었습니다");
  };

  // ── 글 수정 저장 ──────────────────────────────────────
  const savePost = async () => {
    if (!editPost) return;
    const updated = { ...editPost, title: editTitle, content: editContent, updatedAt: new Date().toISOString() };
    await fetch("/api/admin", {
      method: "PUT", headers: { "x-admin-pw": pw, "Content-Type": "application/json" },
      body: JSON.stringify({ resource: "post", data: updated })
    });
    setPosts(prev => prev.map(p => p.id === updated.id ? updated : p));
    setEditPost(null);
    showMsg("저장되었습니다 ✅");
  };

  // ── 발행/비발행 토글 ──────────────────────────────────
  const togglePublish = async (post: Post) => {
    const updated = { ...post, published: !post.published };
    await fetch("/api/admin", {
      method: "PUT", headers: { "x-admin-pw": pw, "Content-Type": "application/json" },
      body: JSON.stringify({ resource: "post", data: updated })
    });
    setPosts(prev => prev.map(p => p.id === updated.id ? updated : p));
    showMsg(updated.published ? "발행되었습니다" : "숨김 처리됨");
  };

  // ── 사이트 설정 저장 ──────────────────────────────────
  const saveSettings = async () => {
    if (!settings) return;
    await fetch("/api/admin", {
      method: "PUT", headers: { "x-admin-pw": pw, "Content-Type": "application/json" },
      body: JSON.stringify({ resource: "settings", data: settings })
    });
    showMsg("설정 저장 완료 ✅");
  };

  // ── 비밀번호 변경 ────────────────────────────────────────
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPw2, setNewPw2] = useState("");
  const [pwErr, setPwErr] = useState("");

  const changePassword = async () => {
    setPwErr("");
    if (!newPw || newPw.length < 4) { setPwErr("비밀번호는 4자 이상이어야 합니다"); return; }
    if (newPw !== newPw2) { setPwErr("새 비밀번호가 일치하지 않습니다"); return; }
    // 현재 비밀번호 재확인
    const check = await fetch("/api/admin?resource=auth", { headers: { "x-admin-pw": curPw } });
    if (!check.ok) { setPwErr("현재 비밀번호가 올바르지 않습니다"); return; }
    const res = await fetch("/api/admin", {
      method: "PUT", headers: { "x-admin-pw": pw, "Content-Type": "application/json" },
      body: JSON.stringify({ resource: "password", data: { newPassword: newPw } })
    });
    if (res.ok) {
      // 새 비밀번호로 세션 갱신
      setPw(newPw);
      sessionStorage.setItem(PW_KEY, newPw);
      setCurPw(""); setNewPw(""); setNewPw2("");
      showMsg("비밀번호가 변경되었습니다 ✅");
    } else {
      setPwErr("저장 실패");
    }
  };

  // ── 팝업 저장 ─────────────────────────────────────────
  const savePopup = async () => {
    if (!editPopup) return;
    let list: PopupNotice[];
    if (editPopup.id === "__new__") {
      const newP = { ...editPopup, id: "pop_" + Date.now(), createdAt: new Date().toISOString() };
      list = [...popups, newP];
    } else {
      list = popups.map(p => p.id === editPopup.id ? editPopup : p);
    }
    await fetch("/api/admin", {
      method: "PUT", headers: { "x-admin-pw": pw, "Content-Type": "application/json" },
      body: JSON.stringify({ resource: "popups", data: list })
    });
    setPopups(list);
    setEditPopup(null);
    showMsg("팝업 저장 완료 ✅");
  };

  const deletePopup = async (id: string) => {
    if (!confirm("삭제할까요?")) return;
    const list = popups.filter(p => p.id !== id);
    await fetch("/api/admin", {
      method: "PUT", headers: { "x-admin-pw": pw, "Content-Type": "application/json" },
      body: JSON.stringify({ resource: "popups", data: list })
    });
    setPopups(list);
    showMsg("삭제되었습니다");
  };

  // ── 로그인 화면 ───────────────────────────────────────
  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12, padding: "40px 32px", width: "100%", maxWidth: 360, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚙️</div>
          <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4, color: "var(--fg)" }}>TarryGuide 관리자</h1>
          <p style={{ fontSize: 13, color: "var(--fg3)", marginBottom: 24 }}>관리자 비밀번호를 입력하세요</p>
          <input
            type="password"
            value={inputPw}
            onChange={e => setInputPw(e.target.value)}
            onKeyDown={e => e.key === "Enter" && tryAuth(inputPw)}
            placeholder="비밀번호"
            style={{ width: "100%", padding: "12px 14px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--fg)", fontSize: 15, borderRadius: 8, marginBottom: 12, boxSizing: "border-box", outline: "none" }}
          />
          {authErr && <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>{authErr}</div>}
          <button
            onClick={() => tryAuth(inputPw)}
            disabled={loading}
            style={{ width: "100%", padding: "12px", background: "var(--fg)", color: "var(--bg)", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 15, fontWeight: 700 }}
          >
            {loading ? "확인 중..." : "로그인"}
          </button>
        </div>
      </div>
    );
  }

  // ── 글 수정 모달 ──────────────────────────────────────
  if (editPost) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "0 0 60px" }}>
        <div style={{ background: "var(--fg)", color: "var(--bg)", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
          <span style={{ fontWeight: 800, fontSize: 15 }}>✏️ 글 수정</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setEditPost(null)} style={{ padding: "7px 14px", background: "rgba(255,255,255,0.15)", color: "var(--bg)", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13 }}>취소</button>
            <button onClick={savePost} style={{ padding: "7px 16px", background: "#22c55e", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>저장</button>
          </div>
        </div>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--fg3)", display: "block", marginBottom: 6 }}>제목</label>
            <input
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              style={{ width: "100%", padding: "12px 14px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--fg)", fontSize: 16, borderRadius: 8, outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--fg3)", display: "block", marginBottom: 6 }}>내용 (HTML)</label>
            <textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              rows={30}
              style={{ width: "100%", padding: "14px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--fg)", fontSize: 13, fontFamily: "monospace", borderRadius: 8, outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: 1.6 }}
            />
          </div>
        </div>
      </div>
    );
  }

  // ── 팝업 편집 모달 ────────────────────────────────────
  if (editPopup) {
    const today = new Date().toISOString().slice(0, 10);
    const p = editPopup;
    const set = (k: keyof PopupNotice, v: any) => setEditPopup(prev => prev ? { ...prev, [k]: v } : prev);
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "0 0 60px" }}>
        <div style={{ background: "var(--fg)", color: "var(--bg)", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
          <span style={{ fontWeight: 800, fontSize: 15 }}>📢 공지 팝업 편집</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setEditPopup(null)} style={{ padding: "7px 14px", background: "rgba(255,255,255,0.15)", color: "var(--bg)", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13 }}>취소</button>
            <button onClick={savePopup} style={{ padding: "7px 16px", background: "#22c55e", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>저장</button>
          </div>
        </div>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 16px", display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { label: "제목", key: "title" as const, type: "text" },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--fg3)", display: "block", marginBottom: 6 }}>{f.label}</label>
              <input value={p[f.key] as string} onChange={e => set(f.key, e.target.value)}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--fg)", fontSize: 14, borderRadius: 8, outline: "none", boxSizing: "border-box" }} />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--fg3)", display: "block", marginBottom: 6 }}>내용</label>
            <textarea value={p.content} onChange={e => set("content", e.target.value)} rows={6}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--fg)", fontSize: 14, borderRadius: 8, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--fg3)", display: "block", marginBottom: 6 }}>시작일</label>
              <input type="date" value={p.startDate} onChange={e => set("startDate", e.target.value)}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--fg)", fontSize: 14, borderRadius: 8, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--fg3)", display: "block", marginBottom: 6 }}>종료일</label>
              <input type="date" value={p.endDate} onChange={e => set("endDate", e.target.value)}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--fg)", fontSize: 14, borderRadius: 8, outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--fg3)", display: "block", marginBottom: 6 }}>배경색</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input type="color" value={p.bgColor || "#ffffff"} onChange={e => set("bgColor", e.target.value)} style={{ width: 40, height: 36, border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer" }} />
                <input value={p.bgColor || "#ffffff"} onChange={e => set("bgColor", e.target.value)}
                  style={{ flex: 1, padding: "8px 10px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--fg)", fontSize: 13, borderRadius: 6, outline: "none" }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--fg3)", display: "block", marginBottom: 6 }}>글자색</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input type="color" value={p.textColor || "#111111"} onChange={e => set("textColor", e.target.value)} style={{ width: 40, height: 36, border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer" }} />
                <input value={p.textColor || "#111111"} onChange={e => set("textColor", e.target.value)}
                  style={{ flex: 1, padding: "8px 10px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--fg)", fontSize: 13, borderRadius: 6, outline: "none" }} />
              </div>
            </div>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <input type="checkbox" checked={p.active} onChange={e => set("active", e.target.checked)} style={{ width: 16, height: 16 }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--fg)" }}>활성화</span>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <input type="checkbox" checked={p.showOnce} onChange={e => set("showOnce", e.target.checked)} style={{ width: 16, height: 16 }} />
            <span style={{ fontSize: 14, color: "var(--fg2)" }}>하루에 한 번만 표시</span>
          </label>

          {/* 미리보기 */}
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--fg3)", marginBottom: 8 }}>미리보기</div>
            <div style={{ background: p.bgColor || "#fff", color: p.textColor || "#111", borderRadius: 10, border: "1px solid var(--border)", padding: "16px 20px" }}>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 8 }}>📢 {p.title || "제목"}</div>
              <div style={{ fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{p.content || "내용을 입력하세요"}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── 메인 관리자 화면 ──────────────────────────────────
  const TAB_STYLE = (active: boolean) => ({
    padding: "10px 18px", background: "none", border: "none",
    borderBottom: active ? "2px solid var(--brand)" : "2px solid transparent",
    color: active ? "var(--brand)" : "var(--fg3)",
    cursor: "pointer", fontSize: 14, fontWeight: active ? 700 : 400, whiteSpace: "nowrap" as const
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* 헤더 */}
      <div style={{ background: "var(--fg)", color: "var(--bg)", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="/" style={{ color: "var(--bg)", fontSize: 20, textDecoration: "none" }}>⟵</a>
          <span style={{ fontWeight: 900, fontSize: 16 }}>⚙️ TarryGuide 관리자</span>
        </div>
        <button
          onClick={() => { sessionStorage.removeItem(PW_KEY); setAuthed(false); setPw(""); }}
          style={{ padding: "6px 12px", background: "rgba(255,255,255,0.15)", color: "var(--bg)", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12 }}
        >
          로그아웃
        </button>
      </div>

      {/* 알림 */}
      {msg && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#111", color: "#fff", padding: "10px 20px", borderRadius: 8, zIndex: 9999, fontSize: 14, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
          {msg}
        </div>
      )}

      {/* 탭 */}
      <div style={{ borderBottom: "1px solid var(--border)", overflowX: "auto" }}>
        <div style={{ display: "flex", maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
          <button style={TAB_STYLE(tab === "posts")} onClick={() => setTab("posts")}>📝 글 관리 ({posts.length})</button>
          <button style={TAB_STYLE(tab === "settings")} onClick={() => setTab("settings")}>⚙️ 사이트 설정</button>
          <button style={TAB_STYLE(tab === "popups")} onClick={() => setTab("popups")}>📢 공지 팝업 ({popups.length})</button>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 16px" }}>
        {loading && <div style={{ textAlign: "center", padding: 40, color: "var(--fg3)" }}>불러오는 중...</div>}

        {/* ── 글 관리 탭 ── */}
        {!loading && tab === "posts" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--fg)" }}>전체 글 ({posts.length})</h2>
            </div>
            {posts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "var(--fg3)" }}>아직 발행된 글이 없습니다</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {posts.map(post => (
                  <div key={post.id} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px", background: "var(--bg2)", display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
                    {post.thumbnail && (
                      <img src={post.thumbnail} alt="" style={{ width: 72, height: 54, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
                        <span style={{ fontSize: 11, padding: "2px 8px", background: post.published ? "#dcfce7" : "#fee2e2", color: post.published ? "#16a34a" : "#dc2626", borderRadius: 99, fontWeight: 700 }}>
                          {post.published ? "발행" : "숨김"}
                        </span>
                        {post.category && <span style={{ fontSize: 11, color: "var(--fg3)" }}>{post.category}</span>}
                        <span style={{ fontSize: 11, color: "var(--fg3)" }}>조회 {post.views || 0}</span>
                        <span style={{ fontSize: 11, color: "var(--fg3)" }}>{new Date(post.createdAt).toLocaleDateString("ko-KR")}</span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--fg)", marginBottom: 4, lineHeight: 1.4 }}>{post.title}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap" }}>
                      <a href={`/${post.slug}`} target="_blank" rel="noreferrer"
                        style={{ padding: "6px 10px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer", fontSize: 12, color: "var(--fg2)", textDecoration: "none" }}>
                        보기
                      </a>
                      <button
                        onClick={() => { setEditPost(post); setEditTitle(post.title); setEditContent(post.content); }}
                        style={{ padding: "6px 10px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 6, cursor: "pointer", fontSize: 12, color: "#1d4ed8" }}>
                        수정
                      </button>
                      <button
                        onClick={() => togglePublish(post)}
                        style={{ padding: "6px 10px", background: post.published ? "#fff7ed" : "#f0fdf4", border: `1px solid ${post.published ? "#fed7aa" : "#bbf7d0"}`, borderRadius: 6, cursor: "pointer", fontSize: 12, color: post.published ? "#c2410c" : "#15803d" }}>
                        {post.published ? "숨김" : "발행"}
                      </button>
                      <button
                        onClick={() => deletePost(post.id)}
                        style={{ padding: "6px 10px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, cursor: "pointer", fontSize: 12, color: "#dc2626" }}>
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── 사이트 설정 탭 ── */}
        {!loading && tab === "settings" && settings && (
          <div style={{ maxWidth: 640 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--fg)", marginBottom: 20 }}>사이트 설정</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "사이트명 (영문)", key: "siteName" as const },
                { label: "사이트명 (한글)", key: "siteNameKo" as const },
                { label: "태그라인 (영문)", key: "tagline" as const },
                { label: "태그라인 (한글)", key: "taglineKo" as const },
                { label: "AdSense ID", key: "adsenseId" as const },
                { label: "Google Analytics ID", key: "analyticsId" as const },
                { label: "OG 이미지 URL", key: "ogImage" as const },
                { label: "푸터 문구", key: "footerText" as const },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--fg3)", display: "block", marginBottom: 5 }}>{f.label}</label>
                  <input
                    value={(settings as any)[f.key] || ""}
                    onChange={e => setSettings(prev => prev ? { ...prev, [f.key]: e.target.value } : prev)}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--fg)", fontSize: 14, borderRadius: 8, outline: "none", boxSizing: "border-box" }}
                  />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--fg3)", display: "block", marginBottom: 5 }}>메인 컬러</label>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <input type="color" value={settings.primaryColor || "#22c55e"} onChange={e => setSettings(prev => prev ? { ...prev, primaryColor: e.target.value } : prev)}
                    style={{ width: 44, height: 40, border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer" }} />
                  <input value={settings.primaryColor || "#22c55e"} onChange={e => setSettings(prev => prev ? { ...prev, primaryColor: e.target.value } : prev)}
                    style={{ flex: 1, padding: "10px 12px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--fg)", fontSize: 14, borderRadius: 8, outline: "none" }} />
                </div>
              </div>
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--fg3)", marginBottom: 10 }}>소셜 링크</div>
                {(["twitter", "instagram", "youtube", "email"] as const).map(k => (
                  <div key={k} style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: 12, color: "var(--fg3)", display: "block", marginBottom: 4, textTransform: "capitalize" }}>{k}</label>
                    <input
                      value={settings.socialLinks?.[k] || ""}
                      onChange={e => setSettings(prev => prev ? { ...prev, socialLinks: { ...prev.socialLinks, [k]: e.target.value } } : prev)}
                      placeholder={k === "email" ? "이메일 주소" : "URL"}
                      style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--fg)", fontSize: 13, borderRadius: 6, outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                ))}
              </div>
              <button onClick={saveSettings}
                style={{ padding: "13px", background: "var(--fg)", color: "var(--bg)", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 15, fontWeight: 700, marginTop: 8 }}>
                설정 저장
              </button>

              {/* 비밀번호 변경 */}
              <div style={{ marginTop: 32, paddingTop: 24, borderTop: "2px solid var(--border)" }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--fg)", marginBottom: 16 }}>🔐 관리자 비밀번호 변경</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { label: "현재 비밀번호", val: curPw, set: setCurPw },
                    { label: "새 비밀번호", val: newPw, set: setNewPw },
                    { label: "새 비밀번호 확인", val: newPw2, set: setNewPw2 },
                  ].map(f => (
                    <div key={f.label}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: "var(--fg3)", display: "block", marginBottom: 5 }}>{f.label}</label>
                      <input
                        type="password"
                        value={f.val}
                        onChange={e => f.set(e.target.value)}
                        style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--fg)", fontSize: 14, borderRadius: 8, outline: "none", boxSizing: "border-box" }}
                      />
                    </div>
                  ))}
                  {pwErr && <div style={{ color: "#ef4444", fontSize: 13 }}>{pwErr}</div>}
                  <button onClick={changePassword}
                    style={{ padding: "11px", background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 700 }}>
                    비밀번호 변경
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 팝업 관리 탭 ── */}
        {!loading && tab === "popups" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--fg)" }}>공지 팝업</h2>
              <button
                onClick={() => setEditPopup({
                  id: "__new__", title: "", content: "", active: true,
                  startDate: new Date().toISOString().slice(0, 10),
                  endDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
                  bgColor: "#ffffff", textColor: "#111111", showOnce: true,
                  createdAt: new Date().toISOString()
                })}
                style={{ padding: "8px 16px", background: "var(--brand)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700 }}
              >
                + 새 팝업
              </button>
            </div>
            {popups.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "var(--fg3)" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📢</div>
                <div>아직 팝업이 없습니다. 새 팝업을 만들어보세요!</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {popups.map(p => (
                  <div key={p.id} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px", background: "var(--bg2)", display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 11, padding: "2px 8px", background: p.active ? "#dcfce7" : "#fee2e2", color: p.active ? "#16a34a" : "#dc2626", borderRadius: 99, fontWeight: 700 }}>
                          {p.active ? "활성" : "비활성"}
                        </span>
                        <span style={{ fontSize: 11, color: "var(--fg3)" }}>{p.startDate} ~ {p.endDate}</span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--fg)" }}>📢 {p.title}</div>
                      <div style={{ fontSize: 12, color: "var(--fg3)", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.content}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button onClick={() => setEditPopup(p)}
                        style={{ padding: "6px 10px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 6, cursor: "pointer", fontSize: 12, color: "#1d4ed8" }}>수정</button>
                      <button onClick={() => deletePopup(p.id)}
                        style={{ padding: "6px 10px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, cursor: "pointer", fontSize: 12, color: "#dc2626" }}>삭제</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
