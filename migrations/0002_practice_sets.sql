-- Authored listening and reading practice sets, stored independently of mock exams.
CREATE TABLE IF NOT EXISTS practice_sets (
  id TEXT PRIMARY KEY,
  skill TEXT NOT NULL CHECK (skill IN ('listening', 'reading')),
  payload TEXT NOT NULL,
  updated_at TEXT NOT NULL
);