CREATE TABLE writing_feedback_user_limits (
  user_id TEXT NOT NULL,
  task_id TEXT NOT NULL,
  success_count INTEGER NOT NULL DEFAULT 0,
  pending_count INTEGER NOT NULL DEFAULT 0,
  cooldown_until INTEGER,
  PRIMARY KEY (user_id, task_id)
);