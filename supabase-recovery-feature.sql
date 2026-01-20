-- STEP 1: Drop the OLD function with single UUID parameter
DROP FUNCTION IF EXISTS get_stage_history_leads(UUID, UUID, UUID);

-- STEP 2: Create the NEW function with array parameter
-- Function to get leads that passed through a specific stage but are NOT in ANY of the excluded current stages
-- Used for "Lead Recovery" feature (e.g., passed "Call" but not in "Won" or "Negotiation")

CREATE OR REPLACE FUNCTION get_stage_history_leads(
  target_pipeline_id UUID,
  passed_stage_id UUID,
  exclude_current_stage_ids UUID[]  -- Array of stage IDs to exclude
)
RETURNS SETOF crm_leads
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT DISTINCT l.*
  FROM crm_leads l
  JOIN crm_lead_stage_history h ON l.id = h.lead_id
  WHERE l.pipeline_id = target_pipeline_id
  AND h.to_stage_id = passed_stage_id
  AND (l.current_stage_id IS NULL OR NOT (l.current_stage_id = ANY(exclude_current_stage_ids)));
$$;

COMMENT ON FUNCTION get_stage_history_leads(UUID, UUID, UUID[]) IS 'Returns leads that have a history entry for passed_stage_id but are currently NOT in any of the exclude_current_stage_ids';
