// Shared GitHub dispatch used by the admin upload + retry routes.
export type DispatchResult = {
  ok: boolean;
  status?: number;
  error?: string;
};

export async function dispatchAudio(mockId: string): Promise<DispatchResult> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  if (!token || !repo) {
    return { ok: false, error: "GITHUB_TOKEN / GITHUB_REPO is not configured" };
  }
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/dispatches`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "linguaband-admin",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({ event_type: "generate-audio", client_payload: { mockId } }),
    });
    if (res.ok) return { ok: true, status: res.status };

    const raw = await res.text();
    let message = raw.slice(0, 300);
    try {
      const parsed = JSON.parse(raw) as { message?: string };
      if (parsed.message) message = parsed.message;
    } catch {
      // keep the raw snippet
    }
    console.error(`[audio] dispatch failed (${res.status}): ${message}`);
    return { ok: false, status: res.status, error: message };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[audio] dispatch threw:", message);
    return { ok: false, error: message };
  }
}
