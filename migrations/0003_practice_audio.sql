-- Generated audio metadata and retry state for uploaded listening practice tracks.
ALTER TABLE practice_sets ADD COLUMN audio TEXT;
ALTER TABLE practice_sets ADD COLUMN audio_status TEXT NOT NULL DEFAULT 'content';