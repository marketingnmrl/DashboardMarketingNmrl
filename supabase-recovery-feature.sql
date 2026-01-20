-- Function to get leads that passed through a specific stage but are NOT in a current specific stage
-- Used for "Sprint Recovery" feature (e.g., passed "Call" but not in "Won")

CREATE OR REPLACE FUNCTION get_stage_history_leads(
  target_pipeline_id UUID,
  passed_stage_id UUID,
  exclude_current_stage_id UUID
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
  AND (l.current_stage_id != exclude_current_stage_id OR l.current_stage_id IS NULL);
$$;

COMMENT ON FUNCTION get_stage_history_leads IS 'Returns leads that have a history entry for passed_stage_id but are currently NOT in exclude_current_stage_id';
