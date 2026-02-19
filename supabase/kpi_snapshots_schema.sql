-- KPI growth history for the "growth over time" chart.
-- Run in Supabase SQL Editor once. Snapshots are inserted when you save or log KPI values.

CREATE TABLE IF NOT EXISTS kpi_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  value NUMERIC NOT NULL,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kpi_snapshots_user_date ON kpi_snapshots(user_id, snapshot_date);
CREATE INDEX IF NOT EXISTS idx_kpi_snapshots_metric ON kpi_snapshots(user_id, metric_name);

ALTER TABLE kpi_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own snapshots" ON kpi_snapshots;
CREATE POLICY "Users manage own snapshots" ON kpi_snapshots FOR ALL USING (auth.uid() = user_id);
