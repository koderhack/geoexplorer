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
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-plex-sans",
});

async function getLocale() {
  if (IS_GH_PAGES) return "en";
  const cookieStore = await cookies();
  return cookieStore.get("locale")?.value || "pl";
}

export async function generateMetadata() {
  const locale = await getLocale();

  return {
    title: "GeoExplorer — Jedna mapa zamiast pięciu aplikacji",
    description:
      "GeoExplorer łączy kesze, questy, lokalne kolekcje rzeźb, krakowskie parki i inne rzeczy w mieście do odkrycia — na jednej mapie. Dołącz do betatestów przez TestFlight.",
    openGraph: {
      title: "GeoExplorer — Jedna mapa zamiast pięciu aplikacji",
      description:
        "Kesze, questy, kolekcje rzeźb, krakowskie parki i inne odkrycia — wszystko na jednej mapie.",
    },
  };
}

export default async function RootLayout({ children }) {
  const locale = await getLocale();

  return (
    <html lang={locale} className={`${plexMono.variable} ${plexSans.variable}`}>
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
      <body className="bg-[#fcfcf9] text-[#111827] antialiased">{children}</body>
    </html>
  );
}
