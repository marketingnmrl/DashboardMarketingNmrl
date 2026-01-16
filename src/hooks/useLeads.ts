"use client";

import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type {
    CRMLead,
    CRMLeadStageHistory,
    CRMLeadInteraction,
    CreateLeadInput,
    UpdateLeadInput,
    CreateInteractionInput
} from "@/types/crm";

interface UseLeadsOptions {
    pipelineId?: string;
    stageId?: string;
    assignedToId?: string; // Filter by assigned user (for 'My Leads')
}

interface UseLeadsReturn {
    leads: CRMLead[];
    isLoading: boolean;
    error: string | null;
    fetchLeads: () => Promise<void>;
    getLead: (id: string) => Promise<CRMLead | null>;
    getLeadHistory: (leadId: string) => Promise<CRMLeadStageHistory[]>;
    getLeadInteractions: (leadId: string) => Promise<CRMLeadInteraction[]>;
    createLead: (input: CreateLeadInput) => Promise<CRMLead | null>;
    updateLead: (id: string, input: UpdateLeadInput) => Promise<boolean>;
    deleteLead: (id: string) => Promise<boolean>;
    moveLead: (leadId: string, toStageId: string, movedBy?: string) => Promise<boolean>;
    addInteraction: (input: CreateInteractionInput) => Promise<CRMLeadInteraction | null>;
    getLeadCountByStage: (pipelineId: string) => Promise<Record<string, number>>;
    deleteStageHistory: (historyId: string) => Promise<boolean>;
}

export function useLeads(options: UseLeadsOptions = {}): UseLeadsReturn {
    const { user } = useAuth();
    const [leads, setLeads] = useState<CRMLead[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { pipelineId, stageId, assignedToId } = options;

    // Fetch leads with optional filters
    const fetchLeads = useCallback(async () => {
        if (!user) {
            setLeads([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            let query = supabase
                .from("crm_leads")
                .select(`
                    *,
                    current_stage:crm_pipeline_stages(*),
                    pipeline:crm_pipelines(id, name),
                    assigned_user:org_users!crm_leads_assigned_to_fkey(id, name, email)
                `)
                .order("created_at", { ascending: false });

            if (pipelineId) {
                query = query.eq("pipeline_id", pipelineId);
            }

            if (stageId) {
                query = query.eq("current_stage_id", stageId);
            }

            if (assignedToId) {
                query = query.eq("assigned_to", assignedToId);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;

            setLeads(data || []);
        } catch (err) {
            console.error("Error fetching leads:", err);
            setError(err instanceof Error ? err.message : "Erro ao carregar leads");
        } finally {
            setIsLoading(false);
        }
    }, [user, pipelineId, stageId, assignedToId]);

    // Get single lead with full details
    const getLead = useCallback(async (id: string): Promise<CRMLead | null> => {
        if (!user) return null;

        try {
            const { data, error: fetchError } = await supabase
                .from("crm_leads")
                .select(`
                    *,
                    current_stage:crm_pipeline_stages(*),
                    pipeline:crm_pipelines(*)
                `)
                .eq("id", id)
                .single();

            if (fetchError) throw fetchError;

            return data;
        } catch (err) {
            console.error("Error fetching lead:", err);
            return null;
        }
    }, [user]);

    // Get lead stage history
    const getLeadHistory = useCallback(async (leadId: string): Promise<CRMLeadStageHistory[]> => {
        try {
            const { data, error: fetchError } = await supabase
                .from("crm_lead_stage_history")
                .select(`
                    *,
                    from_stage:crm_pipeline_stages!from_stage_id(*),
                    to_stage:crm_pipeline_stages!to_stage_id(*)
                `)
                .eq("lead_id", leadId)
                .order("moved_at", { ascending: false });

            if (fetchError) throw fetchError;

            return data || [];
        } catch (err) {
            console.error("Error fetching lead history:", err);
            return [];
        }
    }, []);

    // Get lead interactions
    const getLeadInteractions = useCallback(async (leadId: string): Promise<CRMLeadInteraction[]> => {
        try {
            const { data, error: fetchError } = await supabase
                .from("crm_lead_interactions")
                .select("*")
                .eq("lead_id", leadId)
                .order("created_at", { ascending: false });

            if (fetchError) throw fetchError;

            return data || [];
        } catch (err) {
            console.error("Error fetching lead interactions:", err);
            return [];
        }
    }, []);

    // Create lead
    const createLead = useCallback(async (input: CreateLeadInput): Promise<CRMLead | null> => {
        if (!user) return null;

        try {
            // If no stage_id provided, get first stage of pipeline
            let stageId = input.stage_id;
            if (!stageId && input.pipeline_id) {
                const { data: stages } = await supabase
                    .from("crm_pipeline_stages")
                    .select("id")
                    .eq("pipeline_id", input.pipeline_id)
                    .order("order_index", { ascending: true })
                    .limit(1);

                if (stages && stages.length > 0) {
                    stageId = stages[0].id;
                }
            }

            // Use custom created_at or current time
            const createdAt = input.created_at || new Date().toISOString();

            const { data: lead, error: createError } = await supabase
                .from("crm_leads")
                .insert({
                    user_id: user.id,
                    pipeline_id: input.pipeline_id,
                    current_stage_id: stageId,
                    name: input.name,
                    email: input.email || null,
                    phone: input.phone || null,
                    company: input.company || null,
                    origin: input.origin || "manual",
                    utm_source: input.utm_source || null,
                    utm_medium: input.utm_medium || null,
                    utm_campaign: input.utm_campaign || null,
                    utm_content: input.utm_content || null,
                    utm_term: input.utm_term || null,
                    custom_fields: input.custom_fields || {},
                    assigned_to: input.assigned_to || null,
                    created_at: createdAt
                })
                .select()
                .single();

            if (createError) throw createError;

            // Record initial stage in history (use same date for consistency)
            if (stageId) {
                await supabase
                    .from("crm_lead_stage_history")
                    .insert({
                        lead_id: lead.id,
                        from_stage_id: null,
                        to_stage_id: stageId,
                        moved_by: "system",
                        moved_at: createdAt
                    });
            }

            await fetchLeads();
            return lead;
        } catch (err) {
            console.error("Error creating lead:", err);
            setError(err instanceof Error ? err.message : "Erro ao criar lead");
            return null;
        }
    }, [user, fetchLeads]);

    // Update lead
    const updateLead = useCallback(async (id: string, input: UpdateLeadInput): Promise<boolean> => {
        if (!user) return false;

        try {
            const { error: updateError } = await supabase
                .from("crm_leads")
                .update({
                    ...input,
                    updated_at: new Date().toISOString()
                })
                .eq("id", id);

            if (updateError) throw updateError;

            await fetchLeads();
            return true;
        } catch (err) {
            console.error("Error updating lead:", err);
            return false;
        }
    }, [user, fetchLeads]);

    // Delete lead
    const deleteLead = useCallback(async (id: string): Promise<boolean> => {
        if (!user) return false;

        try {
            const { error: deleteError } = await supabase
                .from("crm_leads")
                .delete()
                .eq("id", id);

            if (deleteError) throw deleteError;

            await fetchLeads();
            return true;
        } catch (err) {
            console.error("Error deleting lead:", err);
            return false;
        }
    }, [user, fetchLeads]);

    // Move lead to different stage
    const moveLead = useCallback(async (
        leadId: string,
        toStageId: string,
        movedBy: string = "user"
    ): Promise<boolean> => {
        if (!user) return false;

        try {
            // Get current stage
            const { data: lead } = await supabase
                .from("crm_leads")
                .select("current_stage_id")
                .eq("id", leadId)
                .single();

            const fromStageId = lead?.current_stage_id || null;

            // Update lead
            const { error: updateError } = await supabase
                .from("crm_leads")
                .update({
                    current_stage_id: toStageId,
                    updated_at: new Date().toISOString()
                })
                .eq("id", leadId);

            if (updateError) throw updateError;

            // Record history
            await supabase
                .from("crm_lead_stage_history")
                .insert({
                    lead_id: leadId,
                    from_stage_id: fromStageId,
                    to_stage_id: toStageId,
                    moved_by: movedBy
                });

            await fetchLeads();
            return true;
        } catch (err) {
            console.error("Error moving lead:", err);
            return false;
        }
    }, [user, fetchLeads]);

    // Add interaction to lead
    const addInteraction = useCallback(async (input: CreateInteractionInput): Promise<CRMLeadInteraction | null> => {
        try {
            const { data: interaction, error: createError } = await supabase
                .from("crm_lead_interactions")
                .insert({
                    lead_id: input.lead_id,
                    type: input.type,
                    title: input.title || null,
                    content: input.content || null,
                    created_by: input.created_by || null
                })
                .select()
                .single();

            if (createError) throw createError;

            return interaction;
        } catch (err) {
            console.error("Error adding interaction:", err);
            return null;
        }
    }, []);

    // Get lead count by stage for a pipeline
    const getLeadCountByStage = useCallback(async (pipelineId: string): Promise<Record<string, number>> => {
        try {
            const { data } = await supabase
                .from("crm_leads")
                .select("current_stage_id")
                .eq("pipeline_id", pipelineId);

            const countMap: Record<string, number> = {};
            (data || []).forEach(lead => {
                if (lead.current_stage_id) {
                    countMap[lead.current_stage_id] = (countMap[lead.current_stage_id] || 0) + 1;
                }
            });

            return countMap;
        } catch (err) {
            console.error("Error getting lead counts:", err);
            return {};
        }
    }, []);

    // Delete stage history entry (to remove incorrect movements)
    const deleteStageHistory = useCallback(async (historyId: string): Promise<boolean> => {
        try {
            const { error: deleteError } = await supabase
                .from("crm_lead_stage_history")
                .delete()
                .eq("id", historyId);

            if (deleteError) throw deleteError;

            return true;
        } catch (err) {
            console.error("Error deleting stage history:", err);
            return false;
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    return {
        leads,
        isLoading,
        error,
        fetchLeads,
        getLead,
        getLeadHistory,
        getLeadInteractions,
        createLead,
        updateLead,
        deleteLead,
        moveLead,
        addInteraction,
        getLeadCountByStage,
        deleteStageHistory
    };
}
