"use client";

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { CRMLead } from "@/types/crm";

export function useRecovery() {
    const { user } = useAuth();
    const [leads, setLeads] = useState<CRMLead[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Fetch leads that match the recovery criteria
    const fetchRecoveryLeads = useCallback(async (
        pipelineId: string,
        passedStageId: string,
        excludeStageIds: string[]  // Changed to array
    ) => {
        if (!user) return;
        setIsLoading(true);
        setLeads([]);

        try {
            const { data, error } = await supabase
                .rpc("get_stage_history_leads", {
                    target_pipeline_id: pipelineId,
                    passed_stage_id: passedStageId,
                    exclude_current_stage_ids: excludeStageIds  // Pass as array
                });

            if (error) throw error;

            // Need to fetch joined data (stage names usually) or just use IDs
            // Since RPC returns CRMLead structure, we ideally want to join again to get current_stage details
            // For now, let's just return the leads. The UI might need to fetch stage names separately or map them.
            if (data && data.length > 0) {
                // Enhance leads with current_stage info if needed, or rely on IDs
                // For display, we usually want the stage name.
                // Let's do a client-side join or just fetch details if the RPC returns basic rows
                const { data: enrichedLeads, error: enrichError } = await supabase
                    .from('crm_leads')
                    .select('*, current_stage:crm_pipeline_stages(*)')
                    .in('id', data.map((l: any) => l.id));

                if (enrichError) throw enrichError;
                setLeads(enrichedLeads || []);
            } else {
                setLeads([]);
            }

        } catch (err: any) {
            console.error("Error fetching recovery leads:", err);
            // Optionally set error state
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    // Bulk move leads
    const moveLeadsErrors = useCallback(async (
        leadIds: string[],
        targetStageId: string
    ) => {
        setIsProcessing(true);
        try {
            const { error } = await supabase
                .from('crm_leads')
                .update({
                    current_stage_id: targetStageId,
                    updated_at: new Date().toISOString()
                })
                .in('id', leadIds);

            if (error) throw error;

            // Also record history for each lead (could be done in a loop or DB trigger, 
            // loop is safer for now without more SQL)
            const historyInserts = leadIds.map(leadId => ({
                lead_id: leadId,
                to_stage_id: targetStageId,
                moved_by: 'bulk_recovery',
                moved_at: new Date().toISOString()
            }));

            await supabase.from('crm_lead_stage_history').insert(historyInserts);

            // Remove moved leads from the local list
            setLeads(prev => prev.filter(l => !leadIds.includes(l.id)));
            return true;
        } catch (err) {
            console.error("Error moving leads:", err);
            return false;
        } finally {
            setIsProcessing(false);
        }
    }, []);

    return {
        leads,
        isLoading,
        isProcessing,
        fetchRecoveryLeads,
        moveLeads: moveLeadsErrors
    };
}
