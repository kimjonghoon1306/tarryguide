export type Lang = "ko" | "en";

export const t = {
  ko: {
    home: "홈",
    category: "카테고리",
    search: "검색",
    admin: "관리자",
    readMore: "더 보기",
    latestPosts: "최신 글",
    featuredPosts: "추천 글",
    allPosts: "전체 글",
    noPost: "글이 없습니다",
    views: "조회수",
    tags: "태그",
    share: "공유",
    copyLink: "링크 복사",
    copied: "복사됨!",
    darkMode: "다크모드",
    lightMode: "라이트모드",
    searchPlaceholder: "검색어를 입력하세요",
    recentPosts: "최근 글",
    popularPosts: "인기 글",
    relatedPosts: "관련 글",
    publishedAt: "작성일",
    updatedAt: "수정일",
    by: "작성자",
    goBack: "뒤로",
    toc: "목차",
    minute: "분",
    readTime: "읽는 시간",
    all: "전체",
  },
  en: {
    home: "Home",
    category: "Category",
    search: "Search",
    admin: "Admin",
    readMore: "Read More",
    latestPosts: "Latest Posts",
    featuredPosts: "Featured",
    allPosts: "All Posts",
    noPost: "No posts found",
    views: "Views",
    tags: "Tags",
    share: "Share",
    copyLink: "Copy Link",
    copied: "Copied!",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    searchPlaceholder: "Search posts...",
    recentPosts: "Recent Posts",
    popularPosts: "Popular Posts",
    relatedPosts: "Related Posts",
    publishedAt: "Published",
    updatedAt: "Updated",
    by: "By",
    goBack: "Back",
    toc: "Table of Contents",
    minute: "min",
    readTime: "Read time",
    all: "All",
  },
};

export function calcReadTime(content: string): number {
  const words = content.replace(/<[^>]+>/g, "").split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s가-힣]/g, "")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 80) + "-" + Date.now().toString(36);
}
