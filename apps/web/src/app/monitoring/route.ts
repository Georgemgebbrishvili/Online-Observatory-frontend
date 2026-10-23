import { envelopeUrl } from "@/lib/monitoring/options";

/**
 * POST /monitoring -- ADR-064 §4. The browser SDK's envelopes, forwarded to the one
 * Sentry project NEXT_PUBLIC_SENTRY_DSN names and nowhere else. Absent DSN, 404.
 */
export const dynamic = "force-dynamic";

const MAX_BYTES = 256 * 1024;

export async function POST(request: Request) {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();
  const target = dsn ? envelopeUrl(dsn) : null;
  if (!dsn || !target) return new Response(null, { status: 404 });

  const body = await request.arrayBuffer();
  if (body.byteLength > MAX_BYTES) return new Response(null, { status: 413 });

  // The envelope's first line names the DSN it was made for; only ours is carried.
  const firstLine = new TextDecoder().decode(body.slice(0, 4096)).split("\n", 1)[0];
  let header: { dsn?: unknown };
  try {
    header = JSON.parse(firstLine) as { dsn?: unknown };
  } catch {
    return new Response(null, { status: 400 });
  }
  if (typeof header.dsn !== "string" || envelopeUrl(header.dsn) !== target) {
    return new Response(null, { status: 400 });
  }

  const upstream = await fetch(target, {
    method: "POST",
    headers: { "content-type": "application/x-sentry-envelope" },
    body,
    cache: "no-store",
  }).catch(() => null);
  return new Response(null, { status: upstream?.ok ? 200 : 502 });
}
