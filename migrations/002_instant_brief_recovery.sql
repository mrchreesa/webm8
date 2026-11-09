BEGIN;
ALTER TABLE instant_websites.orders
  ADD COLUMN IF NOT EXISTS brief_submission jsonb;
COMMIT;
