BEGIN;
CREATE TABLE IF NOT EXISTS instant_websites.drafts (
  access_hash text PRIMARY KEY,
  answers jsonb NOT NULL DEFAULT '{}',
  step text NOT NULL CHECK (step IN ('business','checkout','brief','quote')),
  revision bigint NOT NULL,
  deleted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS instant_drafts_updated_idx ON instant_websites.drafts(updated_at DESC);
REVOKE ALL ON instant_websites.drafts FROM PUBLIC;
-- Runtime can read/write snapshots and remove expired drafts, but cannot change billing schema.
DO $$ BEGIN
  IF current_database()='webm8_instant' THEN
    GRANT SELECT,INSERT,UPDATE,DELETE ON instant_websites.drafts TO webm8_instant_runtime;
  ELSIF current_database()='webm8_instant_sandbox' THEN
    GRANT SELECT,INSERT,UPDATE,DELETE ON instant_websites.drafts TO webm8_instant_sandbox_runtime;
  END IF;
END $$;
COMMIT;
