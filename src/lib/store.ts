import { getCloudflareContext } from "@opennextjs/cloudflare";
import { mockExams as builtinExams } from "@/data/practice";
import { audioManifest as builtinAudio } from "@/data/practice/audio-manifest";
import type { MockExam } from "@/data/practice";
import type { AudioEntry } from "@/data/practice/audio-manifest";

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

/** All playable mocks: stored mocks (D1) first, then built-ins not shadowed. */
export async function listMocks(): Promise<MockExam[]> {
  const db = getDb();
  const stored: MockExam[] = [];
  if (db) {
    try {
      const res = await db
        .prepare("SELECT payload FROM mocks ORDER BY created_at DESC")
        .all<{ payload: string }>();
      for (const row of res.results ?? []) {
        const exam = parseExam(row.payload);
        if (exam) stored.push(exam);
      }
    } catch (err) {
      console.error("[store] listMocks failed, falling back to built-in", err);
    }
  }
  const storedIds = new Set(stored.map((e) => e.id));
  return [...stored, ...builtinExams.filter((e) => !storedIds.has(e.id))];
}

export type MockSource = "stored" | "builtin";

export async function getMock(
  id: string,
): Promise<{ exam: MockExam; audio: Record<string, AudioEntry>; source: MockSource } | null> {
  const db = getDb();
  if (db) {
    try {
      const row = await db
        .prepare("SELECT payload, audio FROM mocks WHERE id = ?")
        .bind(id)
        .first<{ payload: string; audio: string | null }>();
      if (row) {
        const exam = parseExam(row.payload);
        if (exam) {
          return {
            exam,
            audio: row.audio ? (JSON.parse(row.audio) as Record<string, AudioEntry>) : {},
            source: "stored",
          };
        }
      }
    } catch (err) {
      console.error("[store] getMock failed", err);
    }
  }
  const builtin = builtinExams.find((e) => e.id === id);
  if (builtin) return { exam: builtin, audio: builtinAudio as Record<string, AudioEntry>, source: "builtin" };
  return null;
}

/** Every section id already in use (built-in + stored) — for upload collision checks. */
export async function existingSectionIds(exceptMockId?: string): Promise<Set<string>> {
  const ids = new Set<string>();
  for (const exam of builtinExams) {
    // A mock that now lives in D1 (e.g. mock-01) may reuse its own built-in section ids.
    if (exam.id === exceptMockId) continue;
    for (const s of exam.sections) ids.add(s.id);
  }
  const db = getDb();
  if (db) {
    try {
      const res = await db.prepare("SELECT id, payload FROM mocks").all<{ id: string; payload: string }>();
      for (const row of res.results ?? []) {
        if (row.id === exceptMockId) continue;
        const exam = parseExam(row.payload);
        if (exam) for (const s of exam.sections) ids.add(s.id);
      }
    } catch {
      /* ignore — collision checks degrade to built-ins only */
    }
  }
  return ids;
}

export async function adminMocks(): Promise<AdminMock[]> {
  const db = getDb();
  if (!db) {
    return builtinExams.map((e) => ({
      id: e.id,
      name: e.name,
      badge: e.badge,
      difficulty: e.difficulty,
      description: e.description,
      status: "ready" as MockStatus,
    }));
  }
  try {
    const res = await db
      .prepare(
        "SELECT id, name, badge, difficulty, description, status, updated_at FROM mocks ORDER BY created_at DESC",
      )
      .all<{
        id: string;
        name: string;
        badge: string;
        difficulty: string;
        description: string;
        status: MockStatus;
        updated_at: string;
      }>();
    return (res.results ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      badge: row.badge,
      difficulty: row.difficulty,
      description: row.description,
      status: row.status,
      updatedAt: row.updated_at,
    }));
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
