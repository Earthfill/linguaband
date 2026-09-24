// Shared GitHub dispatch used by the admin upload + retry routes.
export async function dispatchAudio(mockId: string): Promise<boolean> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  if (!token || !repo) return false;
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/dispatches`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "linguaband-admin",
      },
      body: JSON.stringify({ event_type: "generate-audio", client_payload: { mockId } }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
