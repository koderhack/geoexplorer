import { promises as fs } from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "subscribers.json");

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function readSubscribers() {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function addSubscriber({ email, locale, source }) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const subscribers = await readSubscribers();

  if (!subscribers.some((entry) => entry.email === email)) {
    subscribers.push({
      email,
      locale: String(locale || "en").slice(0, 5),
      source: String(source || "page").slice(0, 40),
      createdAt: new Date().toISOString(),
    });
    await fs.writeFile(DATA_FILE, JSON.stringify(subscribers, null, 2), "utf8");
    return true;
  }
  return false;
}

export function toCsv(subscribers) {
  return [
    "email,locale,source,createdAt",
    ...subscribers.map((entry) =>
      [entry.email, entry.locale, entry.source, entry.createdAt]
        .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
        .join(",")
    ),
  ].join("\n");
}
