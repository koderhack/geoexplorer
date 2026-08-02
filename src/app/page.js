import { cookies } from "next/headers";
import GeoExplorerPage from "@/components/GeoExplorerPage";

export default async function Home() {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value || "en";
  const source = cookieStore.get("locale_source")?.value || "auto";

  return <GeoExplorerPage initialLocale={locale} initialSource={source} />;
}
