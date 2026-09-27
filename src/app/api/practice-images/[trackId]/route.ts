import { getCloudflareContext } from "@opennextjs/cloudflare";

type R2Object = {
  body: ReadableStream<Uint8Array>;
  httpMetadata?: { contentType?: string };
};
type R2Bucket = {
  get(key: string): Promise<R2Object | null>;
};

export async function GET(_request: Request, { params }: { params: Promise<{ trackId: string }> }) {
  const { trackId } = await params;
  if (!/^[\w-]+$/.test(trackId)) return new Response("Not found", { status: 404 });

  try {
    const bucket = (getCloudflareContext().env as { BUCKET?: R2Bucket }).BUCKET;
    if (!bucket) return new Response("Image storage unavailable", { status: 503 });
    const object = await bucket.get(`practice/${trackId}/image`);
    if (!object) return new Response("Not found", { status: 404 });

    return new Response(object.body, {
      headers: {
        "Content-Type": object.httpMetadata?.contentType ?? "application/octet-stream",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[practice-images] read failed", error);
    return new Response("Image storage unavailable", { status: 503 });
  }
}