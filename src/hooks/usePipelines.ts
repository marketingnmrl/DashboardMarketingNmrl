"use client";

import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type {
    CRMPipeline,
    CRMPipelineStage,
    CreatePipelineInput,
    UpdatePipelineInput
} from "@/types/crm";

interface UsePipelinesReturn {
    pipelines: CRMPipeline[];
    isLoading: boolean;
    error: string | null;
    fetchPipelines: () => Promise<void>;
    getPipeline: (id: string) => Promise<CRMPipeline | null>;
    createPipeline: (input: CreatePipelineInput) => Promise<CRMPipeline | null>;
    updatePipeline: (id: string, input: UpdatePipelineInput) => Promise<boolean>;
    deletePipeline: (id: string) => Promise<boolean>;
    addStage: (pipelineId: string, name: string, color?: string, defaultValue?: number | null) => Promise<CRMPipelineStage | null>;
    updateStage: (stageId: string, name: string, color?: string, defaultValue?: number | null) => Promise<boolean>;
    deleteStage: (stageId: string) => Promise<boolean>;
    reorderStages: (pipelineId: string, stageIds: string[]) => Promise<boolean>;
}

export function usePipelines(): UsePipelinesReturn {
    const { user } = useAuth();
    const [pipelines, setPipelines] = useState<CRMPipeline[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch all pipelines with stages and lead counts
    const fetchPipelines = useCallback(async () => {
        if (!user) {
            setPipelines([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from("crm_pipelines")
                .select(`
                    *,
                    stages:crm_pipeline_stages(*)
                `)
                .order("created_at", { ascending: false });

            if (fetchError) throw fetchError;

            // Get all leads to count per stage
            const { data: leads } = await supabase
                .from("crm_leads")
                .select("current_stage_id");

            const leadCountMap: Record<string, number> = {};
            (leads || []).forEach(lead => {
                if (lead.current_stage_id) {
                    leadCountMap[lead.current_stage_id] = (leadCountMap[lead.current_stage_id] || 0) + 1;
                }
            });

            // Sort stages by order_index and add lead_count
            const pipelinesWithSortedStages = (data || []).map(pipeline => ({
                ...pipeline,
                stages: (pipeline.stages || [])
                    .sort((a: CRMPipelineStage, b: CRMPipelineStage) =>
                        a.order_index - b.order_index
                    )
                    .map((stage: CRMPipelineStage) => ({
                        ...stage,
                        lead_count: leadCountMap[stage.id] || 0
                    }))
            }));

            setPipelines(pipelinesWithSortedStages);
        } catch (err) {
            console.error("Error fetching pipelines:", err);
            setError(err instanceof Error ? err.message : "Erro ao carregar pipelines");
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    // Get single pipeline with stages and lead counts
    const getPipeline = useCallback(async (id: string): Promise<CRMPipeline | null> => {
        if (!user) return null;

        try {
            const { data, error: fetchError } = await supabase
                .from("crm_pipelines")
                .select(`
                    *,
                    stages:crm_pipeline_stages(*)
                `)
                .eq("id", id)
                .single();

            if (fetchError) throw fetchError;

            // Get lead counts per stage
            const { data: leadCounts } = await supabase
                .from("crm_leads")
                .select("current_stage_id")
                .eq("pipeline_id", id);

            const countMap: Record<string, number> = {};
            (leadCounts || []).forEach(lead => {
                if (lead.current_stage_id) {
                    countMap[lead.current_stage_id] = (countMap[lead.current_stage_id] || 0) + 1;
                }
            });

            // Add lead_count to each stage
            const stagesWithCounts = (data.stages || [])
                .sort((a: CRMPipelineStage, b: CRMPipelineStage) => a.order_index - b.order_index)
                .map((stage: CRMPipelineStage) => ({
                    ...stage,
                    lead_count: countMap[stage.id] || 0
                }));

            return { ...data, stages: stagesWithCounts };
        } catch (err) {
            console.error("Error fetching pipeline:", err);
            return null;
        }
    }, [user]);

    // Create pipeline with stages
    const createPipeline = useCallback(async (input: CreatePipelineInput): Promise<CRMPipeline | null> => {
        if (!user) return null;

        try {
            // Create pipeline
            const { data: pipeline, error: pipelineError } = await supabase
                .from("crm_pipelines")
                .insert({
                    user_id: user.id,
                    name: input.name,
                    description: input.description || null
                })
                .select()
                .single();

            if (pipelineError) throw pipelineError;

            // Create stages
            if (input.stages.length > 0) {
                const stagesToInsert = input.stages.map((stage, index) => ({
                    pipeline_id: pipeline.id,
                    name: stage.name,
                    color: stage.color || "#19069E",
                    order_index: index
                }));

                const { error: stagesError } = await supabase
                    .from("crm_pipeline_stages")
                    .insert(stagesToInsert);

                if (stagesError) throw stagesError;
            }

            await fetchPipelines();
            return pipeline;
        } catch (err) {
            console.error("Error creating pipeline:", err);
            setError(err instanceof Error ? err.message : "Erro ao criar pipeline");
            return null;
        }
    }, [user, fetchPipelines]);

    // Update pipeline
    const updatePipeline = useCallback(async (id: string, input: UpdatePipelineInput): Promise<boolean> => {
        if (!user) return false;

        try {
            const { error: updateError } = await supabase
                .from("crm_pipelines")
                .update({
                    ...input,
                    updated_at: new Date().toISOString()
                })
                .eq("id", id);

            if (updateError) throw updateError;

            await fetchPipelines();
            return true;
        } catch (err) {
            console.error("Error updating pipeline:", err);
            return false;
        }
    }, [user, fetchPipelines]);

    // Delete pipeline
    const deletePipeline = useCallback(async (id: string): Promise<boolean> => {
        if (!user) return false;

        try {
            const { error: deleteError } = await supabase
                .from("crm_pipelines")
                .delete()
                .eq("id", id);

            if (deleteError) throw deleteError;

            await fetchPipelines();
            return true;
        } catch (err) {
            console.error("Error deleting pipeline:", err);
            return false;
        }
    }, [user, fetchPipelines]);

    // Add stage to pipeline
    const addStage = useCallback(async (
        pipelineId: string,
        name: string,
        color: string = "#19069E",
        defaultValue?: number | null
    ): Promise<CRMPipelineStage | null> => {
        if (!user) return null;

        try {
            // Get current max order_index
            const { data: existingStages } = await supabase
                .from("crm_pipeline_stages")
                .select("order_index")
                .eq("pipeline_id", pipelineId)
                .order("order_index", { ascending: false })
                .limit(1);

            const nextIndex = existingStages && existingStages.length > 0
                ? existingStages[0].order_index + 1
                : 0;

            const insertData: Record<string, unknown> = {
                pipeline_id: pipelineId,
                name,
                color,
                order_index: nextIndex
            };
            if (defaultValue !== undefined && defaultValue !== null) {
                insertData.default_value = defaultValue;
            }

            const { data: stage, error: stageError } = await supabase
                .from("crm_pipeline_stages")
                .insert(insertData)
                .select()
                .single();

            if (stageError) throw stageError;

            await fetchPipelines();
            return stage;
        } catch (err) {
            console.error("Error adding stage:", err);
            return null;
        }
    }, [user, fetchPipelines]);

    // Update stage
    const updateStage = useCallback(async (
        stageId: string,
        name: string,
        color?: string,
        defaultValue?: number | null
    ): Promise<boolean> => {
        try {
            const updateData: Record<string, unknown> = { name };
            if (color !== undefined) updateData.color = color;
            if (defaultValue !== undefined) updateData.default_value = defaultValue;

            const { error: updateError } = await supabase
                .from("crm_pipeline_stages")
                .update(updateData)
                .eq("id", stageId);

            if (updateError) throw updateError;

            await fetchPipelines();
            return true;
        } catch (err) {
            console.error("Error updating stage:", err);
            return false;
        }
    }, [fetchPipelines]);

    // Delete stage
    const deleteStage = useCallback(async (stageId: string): Promise<boolean> => {
        try {
            const { error: deleteError } = await supabase
                .from("crm_pipeline_stages")
                .delete()
                .eq("id", stageId);

            if (deleteError) throw deleteError;

            await fetchPipelines();
            return true;
        } catch (err) {
            console.error("Error deleting stage:", err);
            return false;
        }
    }, [fetchPipelines]);

    // Reorder stages
    const reorderStages = useCallback(async (pipelineId: string, stageIds: string[]): Promise<boolean> => {
        try {
            // Update each stage with new order_index
            const updates = stageIds.map((id, index) =>
                supabase
                    .from("crm_pipeline_stages")
                    .update({ order_index: index })
                    .eq("id", id)
                    .eq("pipeline_id", pipelineId)
            );

            await Promise.all(updates);
            await fetchPipelines();
            return true;
        } catch (err) {
            console.error("Error reordering stages:", err);
            return false;
        }
    }, [fetchPipelines]);

    // Initial fetch
    useEffect(() => {
        fetchPipelines();
    }, [fetchPipelines]);

    return {
        pipelines,
        isLoading,
        error,
        fetchPipelines,
        getPipeline,
        createPipeline,
        updatePipeline,
        deletePipeline,
        addStage,
        updateStage,
        deleteStage,
        reorderStages
    };
}
