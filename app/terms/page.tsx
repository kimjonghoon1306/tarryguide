import Link from "next/link";

export const metadata = { title: "이용약관 | TarryGuide" };

export default function TermsPage() {
  const today = new Date().toLocaleDateString("ko-KR");
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <header style={{ background: "var(--fg)", color: "var(--bg)", padding: "14px 20px", display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/" style={{ color: "var(--bg)", textDecoration: "none", fontSize: 20 }}>⟵</Link>
        <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: 18 }}>TarryGuide</span>
      </header>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px 80px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8, color: "var(--fg)" }}>이용약관</h1>
        <p style={{ fontSize: 13, color: "var(--fg3)", marginBottom: 40 }}>시행일: {today}</p>

        {[
          {
            title: "제1조 (목적)",
            content: "본 약관은 TarryGuide(이하 '서비스')가 제공하는 블로그 서비스의 이용과 관련하여 서비스와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다."
          },
          {
            title: "제2조 (서비스 이용)",
            content: "서비스는 인터넷을 통해 제공되는 정보 콘텐츠 서비스입니다. 이용자는 본 서비스를 통해 제공되는 콘텐츠를 개인적인 목적으로 열람할 수 있습니다."
          },
          {
            title: "제3조 (저작권)",
            content: "서비스에 게재된 모든 콘텐츠(텍스트, 이미지, 영상 등)의 저작권은 TarryGuide 또는 원저작자에게 있습니다. 이용자는 서비스에 게시된 저작물을 서비스의 사전 동의 없이 복제, 배포, 전송, 전시하거나 상업적으로 이용할 수 없습니다."
          },
          {
            title: "제4조 (광고)",
            content: "서비스는 Google AdSense 등 제3자 광고 서비스를 통해 광고를 게재할 수 있습니다. 광고 콘텐츠는 제3자에 의해 제공되며, 서비스는 광고 콘텐츠의 내용에 대해 책임을 지지 않습니다."
          },
          {
            title: "제5조 (면책사항)",
            content: "서비스에서 제공하는 정보는 일반적인 정보 제공을 목적으로 하며, 전문적인 의학적, 법률적, 재정적 조언을 대체하지 않습니다. 이용자는 서비스에서 제공하는 정보를 참고용으로만 사용해야 합니다."
          },
          {
            title: "제6조 (약관 변경)",
            content: "서비스는 필요한 경우 약관을 변경할 수 있으며, 변경된 약관은 서비스 내 공지사항을 통해 공지합니다. 이용자가 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단할 수 있습니다."
          },
          {
            title: "제7조 (준거법)",
            content: "본 약관의 해석 및 적용에 관하여는 대한민국 법률을 준거법으로 합니다."
          },
        ].map(section => (
          <div key={section.title} style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--fg)", marginBottom: 8 }}>{section.title}</h2>
            <p style={{ fontSize: 14, lineHeight: 1.8, color: "var(--fg2)" }}>{section.content}</p>
          </div>
        ))}

        <div style={{ marginTop: 40, paddingTop: 20, borderTop: "1px solid var(--border)", display: "flex", gap: 16 }}>
          <Link href="/privacy" style={{ fontSize: 13, color: "var(--brand)", textDecoration: "none" }}>개인정보처리방침 →</Link>
          <Link href="/" style={{ fontSize: 13, color: "var(--fg3)", textDecoration: "none" }}>홈으로 →</Link>
        </div>
      </div>
    </div>
  );
}
