-- Content & Campaign Management - run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS content_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  platform TEXT,
  content_type TEXT,
  description TEXT,
  scheduled_date DATE,
  scheduled_time TIME,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'cancelled')),
  content_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  objective TEXT,
  start_date DATE,
  end_date DATE,
  budget NUMERIC,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'paused', 'completed')),
  channels TEXT[],
  target_metrics JSONB,
  actual_metrics JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  metric_name TEXT NOT NULL,
  category TEXT,
  current_value NUMERIC NOT NULL,
  target_value NUMERIC,
  unit TEXT,
  tracked_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pr_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  publication TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  twitter_handle TEXT,
  beat TEXT,
  tier TEXT CHECK (tier IN ('tier1', 'tier2', 'tier3', 'niche')),
  last_contact_date DATE,
  relationship_status TEXT DEFAULT 'cold' CHECK (relationship_status IN ('cold', 'warm', 'hot', 'active')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pr_coverage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  publication TEXT NOT NULL,
  article_title TEXT,
  article_url TEXT,
  published_date DATE,
  coverage_type TEXT,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  reach_estimate INT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ambassadors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT,
  social_handle TEXT,
  platform TEXT,
  follower_count INT,
  tier TEXT CHECK (tier IN ('micro', 'mid', 'macro', 'mega')),
  status TEXT DEFAULT 'prospect' CHECK (status IN ('prospect', 'reached_out', 'onboarded', 'active', 'inactive')),
  onboard_date DATE,
  total_posts INT DEFAULT 0,
  total_engagement INT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ambassador_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  ambassador_id UUID REFERENCES ambassadors(id) ON DELETE CASCADE,
  activity_type TEXT,
  platform TEXT,
  content_url TEXT,
  post_date DATE,
  engagement_count INT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_calendar_date ON content_calendar(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_content_calendar_status ON content_calendar(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_kpis_category ON kpis(category);
CREATE INDEX IF NOT EXISTS idx_kpis_date ON kpis(tracked_date);
CREATE INDEX IF NOT EXISTS idx_pr_contacts_tier ON pr_contacts(tier);
CREATE INDEX IF NOT EXISTS idx_ambassadors_status ON ambassadors(status);

ALTER TABLE content_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE pr_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pr_coverage ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassadors ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassador_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own data" ON content_calendar;
CREATE POLICY "Users manage own data" ON content_calendar FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users manage own data" ON campaigns;
CREATE POLICY "Users manage own data" ON campaigns FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users manage own data" ON kpis;
CREATE POLICY "Users manage own data" ON kpis FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users manage own data" ON pr_contacts;
CREATE POLICY "Users manage own data" ON pr_contacts FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users manage own data" ON pr_coverage;
CREATE POLICY "Users manage own data" ON pr_coverage FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users manage own data" ON ambassadors;
CREATE POLICY "Users manage own data" ON ambassadors FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users manage own data" ON ambassador_activities;
CREATE POLICY "Users manage own data" ON ambassador_activities FOR ALL USING (auth.uid() = user_id);
