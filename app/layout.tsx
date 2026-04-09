import type { Metadata } from "next";
import "@/styles/globals.css";
import { getSiteSettings } from "@/lib/kv";

export async function generateMetadata(): Promise<Metadata> {
  let settings;
  try { settings = await getSiteSettings(); } catch { settings = { siteName: "TarryGuide", tagline: "Your guide to a better life", adsenseId: "" }; }
  return {
    title: { default: settings.siteName, template: `%s | ${settings.siteName}` },
    description: settings.tagline,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://tarryguide.com"),
    openGraph: {
      siteName: settings.siteName,
      locale: "ko_KR",
      type: "website",
      images: settings.ogImage ? [{ url: settings.ogImage, width: 1200, height: 630 }] : [],
    },
    robots: { index: true, follow: true },
    verification: { google: "" },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem('theme');
                if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch(e){}
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
