import { addSubscriber, EMAIL_RE } from "@/lib/subscribers";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = String(body.email || "").trim().toLowerCase();

    if (!EMAIL_RE.test(email)) {
      return Response.json({ ok: false, error: "invalid_email" }, { status: 400 });
    }

    await addSubscriber({
      email,
      locale: body.locale,
      source: body.source,
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error("subscribe error:", error);
    return Response.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
