export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  thumbnail?: string;
  author: string;
  lang: "ko" | "en";
  published: boolean;
  featured: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  nameEn: string;
  slug: string;
  icon: string;
  color: string;
  description: string;
  count: number;
}

export interface SiteSettings {
  siteName: string;
  siteNameKo: string;
  tagline: string;
  taglineKo: string;
  adsenseId: string;
  analyticsId: string;
  primaryColor: string;
  footerText: string;
  ogImage: string;
  socialLinks: {
    twitter?: string;
    instagram?: string;
    youtube?: string;
    email?: string;
  };
}

export interface PopupNotice {
  id: string;
  title: string;
  content: string;
  active: boolean;
  startDate: string;
  endDate: string;
  bgColor: string;
  textColor: string;
  showOnce: boolean;
  createdAt: string;
}
