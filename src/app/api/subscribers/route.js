import { readSubscribers, toCsv } from "@/lib/subscribers";

export async function GET(request) {
  const adminKey = process.env.SUBSCRIBERS_ADMIN_KEY;
  if (adminKey && request.headers.get("x-admin-key") !== adminKey) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const subscribers = await readSubscribers();

  return new Response(toCsv(subscribers), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="subscribers.csv"',
    },
  });
}
