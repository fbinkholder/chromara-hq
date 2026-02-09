-- CHROMARA HQ - Agent System Tables
-- Run this in Supabase SQL Editor after your main schema. Uses existing auth.users.

-- Social Media Posts
CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  platform TEXT CHECK (platform IN ('twitter', 'linkedin', 'tiktok', 'pinterest')),
  content TEXT NOT NULL,
  media_url TEXT,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'queued', 'published', 'failed')),
  posted_at TIMESTAMP WITH TIME ZONE,
  engagement JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social Media Analytics
CREATE TABLE IF NOT EXISTS social_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  platform TEXT,
  metric_type TEXT,
  value NUMERIC,
  tracked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- SEO & Market Intelligence
CREATE TABLE IF NOT EXISTS market_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  category TEXT CHECK (category IN ('seo_keyword', 'competitor_insight', 'industry_trend', 'consumer_insight')),
  title TEXT NOT NULL,
  description TEXT,
  source_url TEXT,
  data JSONB,
  relevance_score INT CHECK (relevance_score BETWEEN 1 AND 10),
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- USPTO & Product Tracking
CREATE TABLE IF NOT EXISTS patent_filings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  company TEXT NOT NULL,
  patent_number TEXT,
  title TEXT NOT NULL,
  filing_date DATE,
  status TEXT,
  category TEXT,
  description TEXT,
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact Intelligence
CREATE TABLE IF NOT EXISTS contact_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  company TEXT NOT NULL,
  domain TEXT,
  employee_count INT,
  industry TEXT,
  contacts JSONB,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent Activity Log
CREATE TABLE IF NOT EXISTS agent_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  agent_name TEXT NOT NULL,
  status TEXT CHECK (status IN ('running', 'completed', 'failed', 'stopped')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  results_summary JSONB,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_social_posts_user ON social_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled ON social_posts(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_market_intel_category ON market_intelligence(category);
CREATE INDEX IF NOT EXISTS idx_patent_filings_company ON patent_filings(company);
CREATE INDEX IF NOT EXISTS idx_agent_activity_user ON agent_activity(user_id);

ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE patent_filings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_activity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage social_posts" ON social_posts;
CREATE POLICY "Users manage social_posts" ON social_posts FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users manage social_analytics" ON social_analytics;
CREATE POLICY "Users manage social_analytics" ON social_analytics FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users manage market_intelligence" ON market_intelligence;
CREATE POLICY "Users manage market_intelligence" ON market_intelligence FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users manage patent_filings" ON patent_filings;
CREATE POLICY "Users manage patent_filings" ON patent_filings FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users manage contact_intelligence" ON contact_intelligence;
CREATE POLICY "Users manage contact_intelligence" ON contact_intelligence FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users manage agent_activity" ON agent_activity;
CREATE POLICY "Users manage agent_activity" ON agent_activity FOR ALL USING (auth.uid() = user_id);
