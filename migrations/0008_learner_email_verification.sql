ALTER TABLE learner_accounts ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0;

CREATE TABLE learner_email_verification_tokens (
  token_hash TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES learner_accounts(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX learner_email_verification_tokens_account_idx
  ON learner_email_verification_tokens(account_id);

-- Existing learner accounts predate email verification. Keep them accessible;
-- newly registered email/password accounts start unverified.
UPDATE learner_accounts SET email_verified = 1;