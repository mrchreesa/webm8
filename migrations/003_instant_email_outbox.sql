BEGIN;
CREATE TABLE IF NOT EXISTS instant_websites.email_outbox (
  id uuid PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES instant_websites.orders(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('customer_confirmation', 'team_notification')),
  livemode boolean NOT NULL,
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed', 'needs_review')),
  attempts integer NOT NULL DEFAULT 0,
  first_attempt_at timestamptz,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  lease_token uuid,
  lease_until timestamptz,
  provider_id text,
  sent_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (order_id, kind)
);
CREATE INDEX IF NOT EXISTS email_outbox_due ON instant_websites.email_outbox (next_attempt_at) WHERE status IN ('pending', 'sending');
REVOKE ALL ON instant_websites.email_outbox FROM PUBLIC;
-- Preserve the restricted runtime permissions already used by each database.
DO $$ DECLARE role_name text; BEGIN
  FOR role_name IN SELECT grantee FROM information_schema.role_table_grants
    WHERE table_schema='instant_websites' AND table_name='orders' AND privilege_type='INSERT' AND grantee <> current_user
  LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE ON instant_websites.email_outbox TO %I', role_name);
  END LOOP;
END $$;
COMMIT;
