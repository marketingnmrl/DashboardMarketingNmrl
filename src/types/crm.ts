// CRM Types for Supabase

export interface CRMPipeline {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
    stages?: CRMPipelineStage[];
}

export interface CRMPipelineStage {
    id: string;
    pipeline_id: string;
    name: string;
    order_index: number;
    color: string;
    default_value?: number | null; // Default deal value when lead enters this stage
    created_at: string;
    lead_count?: number; // Computed field
}

export interface CRMTag {
    id: string;
    user_id: string;
    name: string;
    color: string;
    created_at: string;
}

export interface CRMLead {
    id: string;
    user_id: string;
    pipeline_id: string | null;
    current_stage_id: string | null;
    name: string;
    email: string | null;
    phone: string | null;
    company: string | null;
    origin: string; // Custom origin (e.g., 'paid', 'organic', 'Instagram', 'Indicação Ricardo')
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    utm_content: string | null;
    utm_term: string | null;
    custom_fields: Record<string, unknown>;
    assigned_to: string | null; // ID of responsible org_user
    deal_value: number | null; // Deal/sale value for this lead
    scheduled_call_at: string | null; // When the call is scheduled
    call_completed_at: string | null; // When the call was completed
    created_at: string;
    updated_at: string;
    // Joined fields
    current_stage?: CRMPipelineStage;
    pipeline?: CRMPipeline;
    assigned_user?: { id: string; name: string | null; email: string };
    tags?: CRMTag[]; // Tags assigned to this lead
}

// Default origin options (can be extended with custom origins)
export const DEFAULT_LEAD_ORIGINS = ['organic', 'paid', 'manual', 'webhook', 'instagram', 'indicação'] as const;
export type LeadOrigin = string; // Allows custom origins

export interface CRMLeadStageHistory {
    id: string;
    lead_id: string;
    from_stage_id: string | null;
    to_stage_id: string | null;
    moved_at: string;
    moved_by: string;
    // Joined fields
    from_stage?: CRMPipelineStage;
    to_stage?: CRMPipelineStage;
}

export interface CRMLeadInteraction {
    id: string;
    lead_id: string;
    type: InteractionType;
    title: string | null;
    content: string | null;
    created_by: string | null;
    created_at: string;
}

export type InteractionType = 'note' | 'call' | 'email' | 'meeting' | 'task';

export interface CRMCustomField {
    id: string;
    user_id: string;
    name: string;
    field_key: string;
    field_type: CustomFieldType;
    options: string[] | null;
    required: boolean;
    created_at: string;
}

export type CustomFieldType = 'text' | 'number' | 'date' | 'select' | 'boolean';

export interface CRMApiKey {
    id: string;
    user_id: string;
    name: string;
    key_prefix: string;
    last_used_at: string | null;
    created_at: string;
}

// Input types for creating/updating
export interface CreatePipelineInput {
    name: string;
    description?: string;
    stages: { name: string; color?: string }[];
}

export interface UpdatePipelineInput {
    name?: string;
    description?: string;
}

export interface CreateLeadInput {
    pipeline_id: string;
    stage_id?: string; // Uses first stage if not provided
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    origin?: LeadOrigin;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
    custom_fields?: Record<string, unknown>;
    deal_value?: number | null; // Deal/sale value
    created_at?: string; // ISO date string for backfilling historical leads
    assigned_to?: string; // ID of responsible org_user
}

export interface UpdateLeadInput {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    custom_fields?: Record<string, unknown>;
    assigned_to?: string | null; // ID of responsible org_user
    deal_value?: number | null; // Deal/sale value
    origin?: string; // Custom origin
    scheduled_call_at?: string | null; // When the call is scheduled
    call_completed_at?: string | null; // When the call was completed
}

export interface CreateInteractionInput {
    lead_id: string;
    type: InteractionType;
    title?: string;
    content?: string;
    created_by?: string;
}
// SDR Reports
export interface SdrReport {
    id: string;
    user_id: string;
    report_date: string;

    // Acquisition Metrics
    acquisition_new_leads: number;
    acquisition_responses: number;
    acquisition_invalid_leads: number;
    acquisition_disqualified_leads: number;
    acquisition_appointments: number;

    // Application Metrics
    application_new_leads: number;
    application_responses: number;
    application_invalid_leads: number;
    application_disqualified_leads: number;
    application_appointments: number;

    created_at: string;
    updated_at: string;

    // Joined fields
    user?: { id: string; name: string | null; email: string };
}

export interface CreateSdrReportInput {
    user_id: string;
    report_date: string;

    acquisition_new_leads?: number;
    acquisition_responses?: number;
    acquisition_invalid_leads?: number;
    acquisition_disqualified_leads?: number;
    acquisition_appointments?: number;

    application_new_leads?: number;
    application_responses?: number;
    application_invalid_leads?: number;
    application_disqualified_leads?: number;
    application_appointments?: number;
}
