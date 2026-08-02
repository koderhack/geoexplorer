import { cookies } from "next/headers";
import GeoExplorerPage from "@/components/GeoExplorerPage";

const IS_GH_PAGES = process.env.DEPLOY_TARGET === "ghpages";

async function getLocale() {
  if (IS_GH_PAGES) return { locale: "en", source: "auto" };
  const cookieStore = await cookies();
  return {
    locale: cookieStore.get("locale")?.value || "en",
    source: cookieStore.get("locale_source")?.value || "auto",
  };
}

export default async function Home() {
  const { locale, source } = await getLocale();

  return <GeoExplorerPage initialLocale={locale} initialSource={source} />;
}
