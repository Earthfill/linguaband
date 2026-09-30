CREATE TABLE vocabulary_content (
  id TEXT PRIMARY KEY CHECK (id = 'default'),
  payload TEXT NOT NULL,
  updated_at TEXT NOT NULL
);