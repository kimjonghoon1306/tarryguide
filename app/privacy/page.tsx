import Link from "next/link";

export const metadata = { title: "개인정보처리방침 | TarryGuide" };

export default function PrivacyPage() {
  const today = new Date().toLocaleDateString("ko-KR");
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <header style={{ background: "var(--fg)", color: "var(--bg)", padding: "14px 20px", display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/" style={{ color: "var(--bg)", textDecoration: "none", fontSize: 20 }}>⟵</Link>
        <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: 18 }}>TarryGuide</span>
      </header>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px 80px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8, color: "var(--fg)" }}>개인정보처리방침</h1>
        <p style={{ fontSize: 13, color: "var(--fg3)", marginBottom: 40 }}>시행일: {today}</p>

        {[
          {
            title: "1. 수집하는 개인정보",
            content: "TarryGuide는 서비스 제공을 위해 다음과 같은 정보를 수집할 수 있습니다:\n• 방문 기록 (IP 주소, 브라우저 종류, 방문 시간)\n• 쿠키 및 유사 기술을 통한 이용 행태 정보\n• Google Analytics를 통한 집계된 분석 데이터"
          },
          {
            title: "2. 개인정보 수집 및 이용 목적",
            content: "수집된 정보는 다음 목적으로 사용됩니다:\n• 서비스 품질 개선 및 사용자 경험 향상\n• 방문자 통계 분석\n• 맞춤형 광고 제공 (Google AdSense)"
          },
          {
            title: "3. 쿠키(Cookie) 사용",
            content: "서비스는 쿠키를 사용하여 이용자의 환경 설정(다크모드, 언어 등)을 저장합니다. 또한 Google AdSense 및 Google Analytics는 광고 및 분석 목적으로 쿠키를 사용합니다. 브라우저 설정을 통해 쿠키 수집을 거부할 수 있으나, 일부 서비스 기능이 제한될 수 있습니다."
          },
          {
            title: "4. 제3자 서비스",
            content: "서비스는 다음 제3자 서비스를 이용합니다:\n• Google AdSense: 맞춤형 광고 제공 (Google 개인정보처리방침 적용)\n• Google Analytics: 웹사이트 분석 (데이터 익명 처리)\n• Vercel: 서버 호스팅\n\n각 서비스의 개인정보처리방침은 해당 서비스 제공자의 정책을 따릅니다."
          },
          {
            title: "5. 개인정보 보유 및 파기",
            content: "서비스는 원칙적으로 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 방문 로그 등 서비스 이용 기록은 최대 6개월간 보관 후 파기합니다."
          },
          {
            title: "6. 이용자의 권리",
            content: "이용자는 언제든지 다음 권리를 행사할 수 있습니다:\n• 개인정보 처리 현황 열람 요청\n• 개인정보 정정·삭제 요청\n• 개인정보 처리 정지 요청\n\n문의사항은 아래 연락처로 문의해 주세요."
          },
          {
            title: "7. 방침 변경",
            content: "개인정보처리방침이 변경될 경우, 변경 내용을 서비스 내 공지사항을 통해 고지합니다."
          },
          {
            title: "8. 문의처",
            content: "개인정보 관련 문의사항이 있으신 경우 서비스 관리자에게 연락해 주시기 바랍니다."
          },
        ].map(section => (
          <div key={section.title} style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--fg)", marginBottom: 8 }}>{section.title}</h2>
            <p style={{ fontSize: 14, lineHeight: 1.9, color: "var(--fg2)", whiteSpace: "pre-line" }}>{section.content}</p>
          </div>
        ))}

        <div style={{ marginTop: 40, paddingTop: 20, borderTop: "1px solid var(--border)", display: "flex", gap: 16 }}>
          <Link href="/terms" style={{ fontSize: 13, color: "var(--brand)", textDecoration: "none" }}>이용약관 →</Link>
          <Link href="/" style={{ fontSize: 13, color: "var(--fg3)", textDecoration: "none" }}>홈으로 →</Link>
        </div>
      </div>
    </div>
  );
}
