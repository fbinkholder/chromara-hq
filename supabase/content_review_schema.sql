-- Content Review Hub – run in Supabase SQL Editor
-- Backs up assets and comments to the cloud (Supabase). Data is per-user via RLS.

DROP TABLE IF EXISTS content_review_comments CASCADE;
DROP TABLE IF EXISTS content_review_assets CASCADE;

-- Assets: id is text so we can use seed ids ('1','2',...) or uuid for new assets
CREATE TABLE content_review_assets (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('tiktok_script', 'ig_static', 'deck_slide', 'landing_page', 'email', 'other')),
  channel TEXT NOT NULL CHECK (channel IN ('tiktok', 'instagram', 'site', 'deck', 'email', 'paid_ads', 'other')),
  link_or_path TEXT,
  description TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'in_review', 'approved', 'blocked', 'archived')),
  tags TEXT[] DEFAULT '{}',
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  legal_review JSONB NOT NULL,
  brand_review JSONB NOT NULL,
  ux_review JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE content_review_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id TEXT NOT NULL REFERENCES content_review_assets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_review_assets_user ON content_review_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_content_review_assets_status ON content_review_assets(status);
CREATE INDEX IF NOT EXISTS idx_content_review_comments_asset ON content_review_comments(asset_id);

ALTER TABLE content_review_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_review_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own assets" ON content_review_assets;
CREATE POLICY "Users manage own assets" ON content_review_assets FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own comments" ON content_review_comments;
CREATE POLICY "Users manage own comments" ON content_review_comments FOR ALL USING (auth.uid() = user_id);
