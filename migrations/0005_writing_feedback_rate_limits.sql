-- Anonymous writing-feedback request budget (client IPs are stored as keyed hashes).
CREATE TABLE writing_feedback_rate_limits (
  ip_hash TEXT PRIMARY KEY,
  window_start INTEGER NOT NULL,
  request_count INTEGER NOT NULL
);