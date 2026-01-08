-- Run this SQL in your Supabase SQL Editor to add support for evaluation stages
ALTER TABLE funnel_stages ADD COLUMN IF NOT EXISTS is_evaluation BOOLEAN DEFAULT FALSE;
