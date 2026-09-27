import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { MockExam } from "@/data/practice";
import type { AudioEntry, ListeningTrack, ReadingPassage } from "@/data/practice/types";

// Minimal structural types for Cloudflare's D1 binding (avoids a hard dependency
// on @cloudflare/workers-types).
type D1Query = {
  bind(...args: (string | number | null)[]): D1Query;
  all<T = unknown>(): Promise<{ results?: T[] }>;
  first<T = unknown>(...args: (string | number | null)[]): Promise<T | null>;
  run(): Promise<{ success: boolean }>;
};
type D1Database = {
  prepare(sql: string): D1Query;
};

export type MockStatus = "content" | "generating" | "ready" | "failed";

export type AdminMock = {
  id: string;
  name: string;
  badge: string;
  difficulty: string;
  description: string;
  status: MockStatus;
  /** ISO timestamp of the last status/audio change — used to spot stuck jobs. */
  updatedAt?: string;
};

export type PracticeSets = {
  listening: ListeningTrack[];
  reading: ReadingPassage[];
};

export type AdminPracticeTrack = Pick<ListeningTrack, "id" | "title" | "audio" | "audioStatus"> & {
  updatedAt?: string;
};

type StoredPracticeSet = {
  id: string;
  skill: "listening" | "reading";
  payload: string;
  audio?: string | null;
  audio_status?: ListeningTrack["audioStatus"];
  updated_at?: string;
};

function getDb(): D1Database | null {
  try {
    const env = getCloudflareContext().env as { DB?: D1Database } | undefined;
    return env?.DB ?? null;
  } catch {
    return null;
  }
}

/** True only when running on Cloudflare with the D1 binding configured. */
export function hasRemoteStore(): boolean {
  return getDb() !== null;
}

function parseExam(payload: string): MockExam | null {
  try {
    return JSON.parse(payload) as MockExam;
  } catch {
    return null;
  }
}

function parsePracticeSet(payload: string): ListeningTrack | ReadingPassage | null {
  try {
    return JSON.parse(payload) as ListeningTrack | ReadingPassage;
  } catch {
    return null;
  }
}

/** Return uploaded practice sets only. No bundled listening or reading fallback is used. */
export async function listPracticeSets(): Promise<PracticeSets> {
  const db = getDb();
  if (db) {
    try {
      const res = await db
        .prepare("SELECT id, skill, payload, audio, audio_status FROM practice_sets ORDER BY updated_at DESC")
        .all<StoredPracticeSet>();
      const listening: ListeningTrack[] = [];
      const reading: ReadingPassage[] = [];
      for (const row of res.results ?? []) {
        const set = parsePracticeSet(row.payload);
        if (!set) continue;
        if (row.skill === "listening") {
          const track = set as ListeningTrack;
          track.audio = row.audio ? (JSON.parse(row.audio) as AudioEntry) : undefined;
          track.audioStatus = row.audio_status ?? (track.audio ? "ready" : "content");
          listening.push(track);
        }
        if (row.skill === "reading") reading.push(set as ReadingPassage);
      }
      return { listening, reading };
    } catch (err) {
      console.error("[store] listPracticeSets failed", err);
    }
  }
  return { listening: [], reading: [] };
}

export async function savePracticeSets(sets: PracticeSets): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("No database configured");
  const now = new Date().toISOString();
  const rows = [
    ...sets.listening.map((set) => ({ id: set.id, skill: "listening", set })),
    ...sets.reading.map((set) => ({ id: set.id, skill: "reading", set })),
  ];
  for (const row of rows) {
    await db
      .prepare(
        "INSERT INTO practice_sets (id, skill, payload, updated_at, audio, audio_status) VALUES (?, ?, ?, ?, NULL, ?) " +
          "ON CONFLICT(id) DO UPDATE SET skill = excluded.skill, payload = excluded.payload, updated_at = excluded.updated_at, " +
          "audio = CASE WHEN json_extract(practice_sets.payload, '$.transcript') = json_extract(excluded.payload, '$.transcript') THEN practice_sets.audio ELSE NULL END, " +
          "audio_status = CASE WHEN json_extract(practice_sets.payload, '$.transcript') = json_extract(excluded.payload, '$.transcript') THEN practice_sets.audio_status ELSE excluded.audio_status END",
      )
      .bind(row.id, row.skill, JSON.stringify(row.set), now, row.skill === "listening" ? "content" : "ready")
      .run();
  }
}

export async function adminPracticeTracks(): Promise<AdminPracticeTrack[]> {
  const db = getDb();
  if (!db) return [];
  try {
    const res = await db
      .prepare("SELECT id, payload, audio, audio_status, updated_at FROM practice_sets WHERE skill = 'listening' ORDER BY updated_at DESC")
      .all<StoredPracticeSet>();
    return (res.results ?? []).flatMap((row) => {
      const set = parsePracticeSet(row.payload);
      if (!set) return [];
      const track = set as ListeningTrack;
      track.audio = row.audio ? (JSON.parse(row.audio) as AudioEntry) : undefined;
      track.audioStatus = row.audio_status ?? (track.audio ? "ready" : "content");
      return [{ id: row.id, title: track.title, audio: track.audio, audioStatus: track.audioStatus, updatedAt: row.updated_at }];
    });
  } catch (err) {
    console.error("[store] adminPracticeTracks failed", err);
    return [];
  }
}

export async function practiceTrackExists(id: string): Promise<boolean> {
  const db = getDb();
  if (!db) return false;
  const row = await db.prepare("SELECT id FROM practice_sets WHERE id = ? AND skill = 'listening'").bind(id).first<{ id: string }>();
  return Boolean(row);
}

export async function setPracticeAudioStatus(
  id: string,
  status: NonNullable<ListeningTrack["audioStatus"]>,
): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db
    .prepare("UPDATE practice_sets SET audio_status = ?, updated_at = ? WHERE id = ? AND skill = 'listening'")
    .bind(status, new Date().toISOString(), id)
    .run();
}

export async function setPracticeAudio(id: string, audio: AudioEntry): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db
    .prepare("UPDATE practice_sets SET audio = ?, audio_status = 'ready', updated_at = ? WHERE id = ? AND skill = 'listening'")
    .bind(JSON.stringify(audio), new Date().toISOString(), id)
    .run();
}

/** Return uploaded mocks only. */
export async function listMocks(): Promise<MockExam[]> {
  const db = getDb();
  const stored: MockExam[] = [];
  if (db) {
    try {
      const res = await db
        .prepare("SELECT payload, created_at FROM mocks ORDER BY created_at DESC")
        .all<{ payload: string; created_at: string }>();
      for (const row of res.results ?? []) {
        const exam = parseExam(row.payload);
        if (exam) stored.push({ ...exam, createdAt: row.created_at });
      }
    } catch (err) {
      console.error("[store] listMocks failed", err);
    }
  }
  return stored;
}

export type MockSource = "stored";

export async function getMock(
  id: string,
): Promise<{ exam: MockExam; audio: Record<string, AudioEntry>; source: MockSource } | null> {
  const db = getDb();
  if (db) {
    try {
      const row = await db
        .prepare("SELECT payload, audio, created_at FROM mocks WHERE id = ?")
        .bind(id)
        .first<{ payload: string; audio: string | null; created_at: string }>();
      if (row) {
        const exam = parseExam(row.payload);
        if (exam) {
          return {
            exam: { ...exam, createdAt: row.created_at },
            audio: row.audio ? (JSON.parse(row.audio) as Record<string, AudioEntry>) : {},
            source: "stored",
          };
        }
      }
    } catch (err) {
      console.error("[store] getMock failed", err);
    }
  }
  return null;
}

/** Section IDs already used by uploaded mocks, for upload collision checks. */
export async function existingSectionIds(exceptMockId?: string): Promise<Set<string>> {
  const ids = new Set<string>();
  const db = getDb();
  if (db) {
    try {
      const res = await db.prepare("SELECT id, payload FROM mocks").all<{ id: string; payload: string }>();
      for (const row of res.results ?? []) {
        if (row.id === exceptMockId) continue;
        const exam = parseExam(row.payload);
        if (exam) for (const s of exam.sections) ids.add(s.id);
      }
    } catch (err) {
      console.error("[store] existingSectionIds failed", err);
    }
  }
  return ids;
}

export async function adminMocks(): Promise<AdminMock[]> {
  const db = getDb();
  if (!db) return [];
  try {
    const res = await db
      .prepare(
        "SELECT id, payload, status, updated_at FROM mocks ORDER BY created_at DESC",
      )
      .all<{
        id: string;
        payload: string;
        status: MockStatus;
        updated_at: string;
      }>();
    return (res.results ?? []).flatMap((row) => {
      const exam = parseExam(row.payload);
      if (!exam) return [];
      return [{
        id: row.id,
        name: exam.name,
        badge: exam.badge,
        difficulty: exam.difficulty,
        description: exam.description,
        status: row.status,
        updatedAt: row.updated_at,
      }];
    });
  } catch (err) {
    console.error("[store] adminMocks failed", err);
    return [];
  }
}

export async function saveMock(exam: MockExam): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("No database configured");
  const now = new Date().toISOString();
  await db
    .prepare(
      "INSERT INTO mocks (id, payload, audio, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?) " +
        "ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at",
    )
    .bind(exam.id, JSON.stringify(exam), null, "content", now, now)
    .run();
}

export async function setMockStatus(id: string, status: MockStatus): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db
    .prepare("UPDATE mocks SET status = ?, updated_at = ? WHERE id = ?")
    .bind(status, new Date().toISOString(), id)
    .run();
}

export async function setMockAudio(id: string, audio: Record<string, AudioEntry>): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db
    .prepare("UPDATE mocks SET audio = ?, status = 'ready', updated_at = ? WHERE id = ?")
    .bind(JSON.stringify(audio), new Date().toISOString(), id)
    .run();
}
