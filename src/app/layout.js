import "./globals.css";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { cookies } from "next/headers";
import { translate } from "@/lib/i18n";

const IS_GH_PAGES = process.env.DEPLOY_TARGET === "ghpages";

const plexMono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-plex-mono",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["600", "700"],
  display: "swap",
  variable: "--font-plex-sans",
});

async function getLocale() {
  if (IS_GH_PAGES) return "en";
  const cookieStore = await cookies();
  return cookieStore.get("locale")?.value || "en";
}

export async function generateMetadata() {
  const locale = await getLocale();

  return {
    title: translate(locale, "metaTitle"),
    description: translate(locale, "metaDescription"),
  };
}

export default async function RootLayout({ children }) {
  const locale = await getLocale();

  return (
    <html lang={locale} className={`dark ${plexMono.variable} ${plexSans.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
