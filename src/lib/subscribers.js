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

export async function addSubscriber({ email, name, locale, source }) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const subscribers = await readSubscribers();

  if (!subscribers.some((entry) => entry.email === email)) {
    subscribers.push({
      email,
      name: String(name || "").slice(0, 80).trim(),
      locale: String(locale || "en").slice(0, 5),
      source: String(source || "page").slice(0, 40),
      createdAt: new Date().toISOString(),
    });
    await fs.writeFile(DATA_FILE, JSON.stringify(subscribers, null, 2), "utf8");
    return true;
  }
  // update name if provided and empty before
  const idx = subscribers.findIndex((e) => e.email === email);
  if (idx !== -1 && name && !subscribers[idx].name) {
    subscribers[idx].name = String(name).slice(0, 80).trim();
    await fs.writeFile(DATA_FILE, JSON.stringify(subscribers, null, 2), "utf8");
  }
  return false;
}

export function toCsv(subscribers) {
  const hasName = subscribers.some((s) => s.name);
  const header = hasName ? "email,name,locale,source,createdAt" : "email,locale,source,createdAt";
  return [
    header,
    ...subscribers.map((entry) =>
      (hasName
        ? [entry.email, entry.name || "", entry.locale, entry.source, entry.createdAt]
        : [entry.email, entry.locale, entry.source, entry.createdAt]
      )
        .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
        .join(",")
    ),
  ].join("\n");
}
