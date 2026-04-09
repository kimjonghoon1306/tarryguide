import Link from "next/link";

export default function Footer({ settings }: { settings?: { siteName?: string; footerText?: string } }) {
  const siteName = settings?.siteName || "TarryGuide";
  const footerText = settings?.footerText || `© ${new Date().getFullYear()} TarryGuide. All rights reserved.`;

  return (
    <footer style={{ borderTop: "3px solid var(--fg)", marginTop: 40, padding: "28px 16px", textAlign: "center" }}>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 900, marginBottom: 8 }}>{siteName}</div>
      <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 12, flexWrap: "wrap" }}>
        <Link href="/terms" style={{ fontSize: 12, color: "var(--fg3)", textDecoration: "none" }}>이용약관</Link>
        <span style={{ fontSize: 12, color: "var(--border)" }}>|</span>
        <Link href="/privacy" style={{ fontSize: 12, color: "var(--fg3)", textDecoration: "none" }}>개인정보처리방침</Link>
      </div>
      <div style={{ fontSize: 12, color: "var(--fg3)" }}>{footerText}</div>
    </footer>
  );
}
