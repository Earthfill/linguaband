import type { AdminMock, AdminPracticeTrack } from "@/lib/store";

/** A "generating" row older than this is treated as stuck (the job failed or never ran). */
export const STUCK_AFTER_MS = 15 * 60 * 1000;

/** The status shown for a practice track: D1's audio_status with a content fallback. */
export function practiceTrackStatus(track: Pick<AdminPracticeTrack, "audio" | "audioStatus">): string {
  return track.audioStatus ?? (track.audio ? "ready" : "content");
}

export function isStuck(status: string, updatedAt: string | undefined, now: number): boolean {
  if (status !== "generating") return false;
  const updated = updatedAt ? Date.parse(updatedAt) : NaN;
  if (Number.isNaN(updated)) return true;
  return now - updated > STUCK_AFTER_MS;
}

/** True when a mock exam's audio job needs a retry or is stuck. */
export function mockNeedsAttention(mock: Pick<AdminMock, "status" | "updatedAt">, now: number): boolean {
  if (mock.status === "content" || mock.status === "failed") return true;
  return isStuck(mock.status, mock.updatedAt, now);
}

/** True when a listening practice track's audio job needs a retry or is stuck. */
export function trackNeedsAttention(track: AdminPracticeTrack, now: number): boolean {
  const status = practiceTrackStatus(track);
  return status === "content" || status === "failed" || isStuck(status, track.updatedAt, now);
}

/** How many audio jobs across mocks and practice tracks need attention right now. */
export function countAttention(mocks: AdminMock[], tracks: AdminPracticeTrack[], now: number = Date.now()): number {
  let count = 0;
  for (const mock of mocks) if (mockNeedsAttention(mock, now)) count++;
  for (const track of tracks) if (trackNeedsAttention(track, now)) count++;
  return count;
}
