-- Mock tests store. One row per mock; the whole exam is stored as JSON.
CREATE TABLE IF NOT EXISTS mocks (
  id TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  audio TEXT,
  status TEXT NOT NULL DEFAULT 'content',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
