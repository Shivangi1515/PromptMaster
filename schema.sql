-- ─────────────────────────────────────────────
-- PromptMaster V2 — Supabase Schema
-- ─────────────────────────────────────────────

-- 1. USERS TABLE
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id      TEXT UNIQUE NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  name          TEXT,
  avatar_url    TEXT,
  tier          TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'teams', 'lifetime', 'api')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  credits_used  INT NOT NULL DEFAULT 0,
  credits_reset_at TIMESTAMPTZ DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_stripe_customer ON users(stripe_customer_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 2. COMPILATIONS TABLE
CREATE TABLE compilations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  input       TEXT NOT NULL,
  title       TEXT GENERATED ALWAYS AS (LEFT(input, 80)) STORED,
  p1          TEXT NOT NULL DEFAULT '',
  p2          TEXT NOT NULL DEFAULT '',
  p3          TEXT NOT NULL DEFAULT '',
  tokens_used INT DEFAULT 0,
  model       TEXT DEFAULT 'llama-3.3-70b-versatile',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_compilations_user_id ON compilations(user_id);
CREATE INDEX idx_compilations_created_at ON compilations(created_at DESC);

-- 3. FOLDERS TABLE
CREATE TABLE folders (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. SAVED PROMPTS TABLE
CREATE TABLE saved_prompts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  content     TEXT NOT NULL,
  folder_id   UUID REFERENCES folders(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TEAMS TABLE
CREATE TABLE teams (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  owner_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. TEAM MEMBERS TABLE
CREATE TABLE team_members (
  team_id   UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role      TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  PRIMARY KEY (team_id, user_id)
);

-- 7. API KEYS TABLE
CREATE TABLE api_keys (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key_hash    TEXT NOT NULL,
  name        TEXT NOT NULL,
  last_used_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. SUBSCRIPTIONS TABLE (for audit trail)
CREATE TABLE subscriptions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id  TEXT UNIQUE NOT NULL,
  tier                    TEXT NOT NULL,
  status                  TEXT NOT NULL DEFAULT 'active',
  current_period_start    TIMESTAMPTZ,
  current_period_end      TIMESTAMPTZ,
  canceled_at             TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. PROMPT PACKS TABLE (Marketplace)
CREATE TABLE prompt_packs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  tags        TEXT[] DEFAULT '{}',
  price       INT NOT NULL, -- in cents
  content     JSONB NOT NULL,
  downloads   INT DEFAULT 0,
  rating_avg  FLOAT DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. PURCHASES TABLE
CREATE TABLE purchases (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id      UUID NOT NULL REFERENCES users(id),
  pack_id       UUID NOT NULL REFERENCES prompt_packs(id),
  amount        INT NOT NULL,
  platform_fee  INT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE compilations ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies: users can only access their own data
CREATE POLICY user_isolation ON users
  FOR ALL USING (clerk_id = current_setting('app.user_id', TRUE));

CREATE POLICY compilation_isolation ON compilations
  FOR ALL USING (user_id = (SELECT id FROM users WHERE clerk_id = current_setting('app.user_id', TRUE)));
