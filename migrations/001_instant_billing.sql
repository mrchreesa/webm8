BEGIN;
CREATE SCHEMA IF NOT EXISTS instant_websites;
REVOKE ALL ON SCHEMA instant_websites FROM PUBLIC;
CREATE TABLE IF NOT EXISTS instant_websites.orders (
  id uuid PRIMARY KEY, access_hash text NOT NULL UNIQUE,
  answers jsonb NOT NULL, checkout_attempt integer NOT NULL DEFAULT 1,
  checkout_session_id text UNIQUE, checkout_confirmed boolean NOT NULL DEFAULT false,
  customer_id text UNIQUE, subscription_id text UNIQUE, subscription_status text,
  trial_end timestamptz, cancel_at timestamptz, cancel_at_period_end boolean NOT NULL DEFAULT false,
  needs_review boolean NOT NULL DEFAULT false, submitted_at timestamptz, crm_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS instant_websites.stripe_events (
  id text PRIMARY KEY, type text NOT NULL, order_id uuid REFERENCES instant_websites.orders(id),
  stripe_created bigint NOT NULL, processed_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS instant_websites.rate_limits (
  key text PRIMARY KEY, window_start timestamptz NOT NULL, attempts integer NOT NULL
);
REVOKE ALL ON ALL TABLES IN SCHEMA instant_websites FROM PUBLIC;
COMMIT;
