"use client";
import { useEffect, useState } from "react";
import type { PopupNotice } from "@/lib/types";

export default function PopupNotice() {
  const [popup, setPopup] = useState<PopupNotice | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetch("/api/popup")
      .then(r => r.json())
      .then(data => {
        if (!data.popup) return;
        const p: PopupNotice = data.popup;
        if (p.showOnce) {
          const key = `popup_closed_${p.id}`;
          const closed = localStorage.getItem(key);
          if (closed) return;
        }
        setPopup(p);
        setVisible(true);
      })
      .catch(() => {});
  }, []);

  const close = (todayOnly = false) => {
    if (popup && (todayOnly || popup.showOnce)) {
      localStorage.setItem(`popup_closed_${popup.id}`, new Date().toDateString());
    }
    setVisible(false);
  };

  if (!visible || !popup) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center",
      padding: "16px"
    }}>
      <div style={{
        background: popup.bgColor || "#fff",
        color: popup.textColor || "#111",
        borderRadius: 12,
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        width: "100%", maxWidth: 480,
        overflow: "hidden",
        animation: "popupIn 0.2s ease"
      }}>
        <style>{`
          @keyframes popupIn { from { opacity:0; transform:scale(0.92) } to { opacity:1; transform:scale(1) } }
        `}</style>

        {/* 헤더 */}
        <div style={{
          padding: "18px 20px", borderBottom: "1px solid rgba(0,0,0,0.08)",
          display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <span style={{ fontWeight: 800, fontSize: 16 }}>📢 {popup.title}</span>
          <button onClick={() => close(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: popup.textColor || "#111", lineHeight: 1 }}>✕</button>
        </div>

        {/* 내용 */}
        <div style={{ padding: "20px", fontSize: 14, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
          {popup.content}
        </div>

        {/* 버튼 */}
        <div style={{ padding: "12px 20px 18px", display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            onClick={() => close(true)}
            style={{ padding: "8px 16px", background: "rgba(0,0,0,0.08)", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, color: popup.textColor || "#111" }}
          >
            오늘 하루 보지 않기
          </button>
          <button
            onClick={() => close(false)}
            style={{ padding: "8px 16px", background: popup.textColor || "#111", color: popup.bgColor || "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 700 }}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
