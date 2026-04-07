# TarryGuide Blog

Next.js 14 + Vercel KV 기반 블로그

## 세팅 방법

### 1. GitHub 업로드
GitHub에서 새 레포 생성 후 이 폴더 통째로 업로드

### 2. Vercel 배포
- Vercel에서 "New Project" → GitHub 레포 연결
- Storage 탭 → KV Database 연결
- Environment Variables 추가:
  - `ADMIN_PASSWORD` : 관리자 비밀번호
  - `WEBHOOK_SECRET` : BlogAuto Pro와 동일하게
  - `NEXT_PUBLIC_SITE_URL` : https://tarryguide.com
  - `NEXT_PUBLIC_SITE_NAME` : TarryGuide

### 3. 도메인 연결
Vercel 프로젝트 Settings → Domains → 도메인 추가

### 4. BlogAuto Pro Webhook 설정
DeploymentPage에서 Webhook URL:
`https://tarryguide.com/api/webhook`
Header: `x-webhook-secret: [WEBHOOK_SECRET값]`

## 관리자 페이지
`https://tarryguide.com/admin`

## 주요 기능
- 다크/라이트 테마
- 한국어/영어 전환
- 카테고리 추가/수정/삭제
- 글 쓰기 에디터 (마크다운 + 특수박스)
- BlogAuto Pro Webhook 자동 수신
- 조회수 통계
- SEO 최적화 (sitemap, robots, OpenGraph)
- 애드센스 연동
