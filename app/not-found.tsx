export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center text-center px-4" style={{ background: "var(--bg)" }}>
      <div>
        <p className="text-8xl mb-6">🔍</p>
        <h1 className="text-4xl font-black mb-3" style={{ color: "var(--fg)" }}>404</h1>
        <p className="text-lg mb-8" style={{ color: "var(--fg2)" }}>페이지를 찾을 수 없어요</p>
        <a href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white" style={{ background: "#22c55e" }}>
          🏠 홈으로
        </a>
      </div>
    </div>
  );
}
