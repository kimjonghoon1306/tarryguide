"use client";
import { useState } from "react";

interface Props {
  title: string;
  url?: string;
}

export default function ShareButtons({ title, url }: Props) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const encoded = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nativeShare = () => {
    if (navigator.share) {
      navigator.share({ title, url: shareUrl });
    }
  };

  const btns = [
    {
      label: "카카오",
      emoji: "💬",
      bg: "#FEE500",
      color: "#000",
      action: () => window.open(`https://story.kakao.com/share?url=${encoded}`, "_blank", "width=600,height=500"),
    },
    {
      label: "트위터",
      emoji: "🐦",
      bg: "#1DA1F2",
      color: "#fff",
      action: () => window.open(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encoded}`, "_blank", "width=600,height=500"),
    },
    {
      label: "페북",
      emoji: "👥",
      bg: "#1877F2",
      color: "#fff",
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encoded}`, "_blank", "width=600,height=500"),
    },
    {
      label: copied ? "복사됨!" : "링크복사",
      emoji: copied ? "✅" : "🔗",
      bg: copied ? "#22c55e" : "var(--bg2)",
      color: copied ? "#fff" : "var(--fg2)",
      action: copyLink,
    },
  ];

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--fg3)", marginBottom: 10 }}>공유하기</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {btns.map(btn => (
          <button
            key={btn.label}
            onClick={btn.action}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 14px", background: btn.bg, color: btn.color,
              border: "none", borderRadius: 6, cursor: "pointer",
              fontSize: 13, fontWeight: 600, transition: "opacity 0.15s"
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            <span>{btn.emoji}</span>
            <span>{btn.label}</span>
          </button>
        ))}
        {typeof navigator !== "undefined" && "share" in navigator && (
          <button
            onClick={nativeShare}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 14px", background: "var(--brand)", color: "#fff",
              border: "none", borderRadius: 6, cursor: "pointer",
              fontSize: 13, fontWeight: 600
            }}
          >
            <span>📤</span><span>더 보내기</span>
          </button>
        )}
      </div>
    </div>
  );
}
