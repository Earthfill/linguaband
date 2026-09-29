-- Extend the practice bank to store authored writing and speaking tasks.
PRAGMA foreign_keys=OFF;

CREATE TABLE practice_sets_new (
  id TEXT PRIMARY KEY,
  skill TEXT NOT NULL CHECK (skill IN ('listening', 'reading', 'writing', 'speaking')),
  payload TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  audio TEXT,
  audio_status TEXT NOT NULL DEFAULT 'content'
);

INSERT INTO practice_sets_new (id, skill, payload, updated_at, audio, audio_status)
SELECT id, skill, payload, updated_at, audio, audio_status FROM practice_sets;

DROP TABLE practice_sets;
ALTER TABLE practice_sets_new RENAME TO practice_sets;

PRAGMA foreign_keys=ON;