"use client";

import { useState, useEffect, useCallback } from "react";
import { Funnel, FunnelStage, FunnelStageThresholds, FunnelMetricData } from "@/types/funnel";
import { getSupabase } from "@/lib/supabase";

// Database types
interface DBFunnel {
    id: string;
    name: string;
    sheets_url: string | null;
    source_type: "sheet" | "pipeline" | null;
    source_pipeline_id: string | null;
    created_at: string;
    updated_at: string;
}

interface DBFunnelStage {
    id: string;
    funnel_id: string;
    name: string;
    emoji: string;
    unit: "absolute" | "percentage";
    thresholds: FunnelStageThresholds;
    position: number;
    is_evaluation?: boolean; // true = etapa de avaliação
    data_source?: "sheet" | "crm";
    crm_stage_id?: string;
    created_at: string;
}

// Convert DB funnel to app funnel
function dbToFunnel(dbFunnel: DBFunnel, stages: DBFunnelStage[]): Funnel {
    const funnelStages = stages.filter(s => s.funnel_id === dbFunnel.id);
    const regularStages = funnelStages
        .filter(s => !s.is_evaluation)
        .sort((a, b) => a.position - b.position)
        .map(s => ({
            id: s.id,
            name: s.name,
            emoji: s.emoji || "",
            unit: s.unit,
            thresholds: s.thresholds,
            dataSource: s.data_source || "sheet",
            crmStageId: s.crm_stage_id,
        }));
    const evaluationStages = funnelStages
        .filter(s => s.is_evaluation)
        .sort((a, b) => a.position - b.position)
        .map(s => ({
            id: s.id,
            name: s.name,
            emoji: s.emoji || "",
            unit: s.unit,
            thresholds: s.thresholds,
            dataSource: s.data_source || "sheet",
            crmStageId: s.crm_stage_id,
        }));

    return {
        id: dbFunnel.id,
        name: dbFunnel.name,
        sheetsUrl: dbFunnel.sheets_url || undefined,
        sourceType: dbFunnel.source_type || "sheet",
        sourcePipelineId: dbFunnel.source_pipeline_id || undefined,
        createdAt: dbFunnel.created_at,
        updatedAt: dbFunnel.updated_at,
        stages: regularStages,
        evaluationStages: evaluationStages.length > 0 ? evaluationStages : undefined,
    };
}

// Create a new stage with default thresholds
export function createNewStage(
    name: string,
    emoji: string,
    unit: "absolute" | "percentage",
    dataSource: "sheet" | "crm" = "sheet",
    crmStageId?: string
): FunnelStage {
    const defaultThresholds: FunnelStageThresholds = unit === "absolute"
        ? {
            otimo: { min: 80, max: 120 },
            ok: { min: 50, max: 79 },
            ruim: { max: 49 },
        }
        : {
            otimo: { min: 30, max: 50 },
            ok: { min: 15, max: 29 },
            ruim: { max: 14 },
        };

    return {
        id: crypto.randomUUID(),
        name,
        emoji,
        unit,
        thresholds: defaultThresholds,
        dataSource,
        crmStageId,
    };
}

export function useFunnels() {
    const [funnels, setFunnels] = useState<Funnel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load funnels from Supabase
    const loadFunnels = useCallback(async () => {
        if (typeof window === 'undefined') return;

        try {
            setIsLoading(true);
            const supabase = getSupabase();

            // Fetch funnels
            const { data: dbFunnels, error: funnelsError } = await supabase
                .from('funnels')
                .select('*')
                .order('created_at', { ascending: true });

            if (funnelsError) throw funnelsError;

            // Fetch all stages
            const { data: dbStages, error: stagesError } = await supabase
                .from('funnel_stages')
                .select('*')
                .order('position', { ascending: true });

            if (stagesError) throw stagesError;

            // Convert to app format
            const loadedFunnels = (dbFunnels || []).map(f =>
                dbToFunnel(f as DBFunnel, (dbStages || []) as DBFunnelStage[])
            );

            setFunnels(loadedFunnels);
            setError(null);
        } catch (err) {
            console.error("Error loading funnels:", err);
            setError(err instanceof Error ? err.message : "Erro ao carregar funis");
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Load on mount
    useEffect(() => {
        loadFunnels();
    }, [loadFunnels]);

    // Add a new funnel
    const addFunnel = useCallback(async (name: string): Promise<Funnel> => {
        const supabase = getSupabase();
        const now = new Date().toISOString();

        const { data, error } = await supabase
            .from('funnels')
            .insert({ name, created_at: now, updated_at: now })
            .select()
            .single();

        if (error) throw error;

        const newFunnel: Funnel = {
            id: data.id,
            name: data.name,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            stages: [],
            sheetsUrl: undefined,
        };

        setFunnels(prev => [...prev, newFunnel]);
        return newFunnel;
    }, []);

    // Get a funnel by ID
    const getFunnel = useCallback(
        (id: string): Funnel | undefined => {
            return funnels.find((f) => f.id === id);
        },
        [funnels]
    );

    // Update a funnel
    const updateFunnel = useCallback(async (id: string, updates: Partial<Funnel>) => {
        const supabase = getSupabase();
        const now = new Date().toISOString();

        const dbUpdates: Partial<DBFunnel> = {
            updated_at: now,
        };
        if (updates.name) dbUpdates.name = updates.name;
        if (updates.sheetsUrl !== undefined) dbUpdates.sheets_url = updates.sheetsUrl || null;

        const { error } = await supabase
            .from('funnels')
            .update(dbUpdates)
            .eq('id', id);

        if (error) throw error;

        setFunnels(prev =>
            prev.map(f =>
                f.id === id ? { ...f, ...updates, updatedAt: now } : f
            )
        );
    }, []);

    // Add a stage to a funnel
    const addStage = useCallback(
        async (funnelId: string, stage: FunnelStage, position?: number, isEvaluation: boolean = false) => {
            const supabase = getSupabase();

            // If position not provided, query current max position from database
            let stagePosition = position ?? 0;
            if (position === undefined) {
                const { data: existingStages } = await supabase
                    .from('funnel_stages')
                    .select('position')
                    .eq('funnel_id', funnelId)
                    .eq('is_evaluation', isEvaluation)
                    .order('position', { ascending: false })
                    .limit(1);

                if (existingStages && existingStages.length > 0) {
                    stagePosition = (existingStages[0].position ?? 0) + 1;
                }
            }

            const { error } = await supabase
                .from('funnel_stages')
                .insert({
                    id: stage.id,
                    funnel_id: funnelId,
                    name: stage.name,
                    emoji: stage.emoji || "",
                    unit: stage.unit,
                    thresholds: stage.thresholds,
                    position: stagePosition,
                    is_evaluation: isEvaluation,
                    data_source: stage.dataSource || "sheet",
                    crm_stage_id: stage.crmStageId || null,
                });

            if (error) {
                console.error("Error adding stage:", error);
                throw error;
            }

            // Update funnel timestamp
            await supabase
                .from('funnels')
                .update({ updated_at: new Date().toISOString() })
                .eq('id', funnelId);

            // Reload to get correct order
            await loadFunnels();
        },
        [loadFunnels]
    );

    // Update a stage
    const updateStage = useCallback(
        async (funnelId: string, stageId: string, updates: Partial<FunnelStage>) => {
            const supabase = getSupabase();

            const dbUpdates: Record<string, unknown> = {};
            if (updates.name) dbUpdates.name = updates.name;
            if (updates.emoji !== undefined) dbUpdates.emoji = updates.emoji;
            if (updates.unit) dbUpdates.unit = updates.unit;
            if (updates.thresholds) dbUpdates.thresholds = updates.thresholds;

            const { error } = await supabase
                .from('funnel_stages')
                .update(dbUpdates)
                .eq('id', stageId);

            if (error) throw error;

            // Update funnel timestamp
            await supabase
                .from('funnels')
                .update({ updated_at: new Date().toISOString() })
                .eq('id', funnelId);

            setFunnels(prev =>
                prev.map(f =>
                    f.id === funnelId
                        ? {
                            ...f,
                            updatedAt: new Date().toISOString(),
                            stages: f.stages.map(s =>
                                s.id === stageId ? { ...s, ...updates } : s
                            ),
                        }
                        : f
                )
            );
        },
        []
    );

    // Remove a stage
    const removeStage = useCallback(async (funnelId: string, stageId: string) => {
        const supabase = getSupabase();

        const { error } = await supabase
            .from('funnel_stages')
            .delete()
            .eq('id', stageId);

        if (error) throw error;

        setFunnels(prev =>
            prev.map(f =>
                f.id === funnelId
                    ? {
                        ...f,
                        updatedAt: new Date().toISOString(),
                        stages: f.stages.filter(s => s.id !== stageId),
                    }
                    : f
            )
        );
    }, []);

    // Update thresholds
    const updateThresholds = useCallback(
        async (funnelId: string, stageId: string, thresholds: FunnelStageThresholds) => {
            await updateStage(funnelId, stageId, { thresholds });
        },
        [updateStage]
    );

    // Set Google Sheets URL
    const setSheetsUrl = useCallback(async (funnelId: string, url: string) => {
        await updateFunnel(funnelId, { sheetsUrl: url });
    }, [updateFunnel]);

    // Delete a funnel
    const deleteFunnel = useCallback(async (id: string) => {
        const supabase = getSupabase();

        // Stages will be deleted automatically due to CASCADE
        const { error } = await supabase
            .from('funnels')
            .delete()
            .eq('id', id);

        if (error) throw error;

        setFunnels(prev => prev.filter(f => f.id !== id));
    }, []);

    // Refresh data
    const refresh = useCallback(() => {
        loadFunnels();
    }, [loadFunnels]);

    // Add funnel from CRM pipeline (hybrid source)
    const addFunnelFromPipeline = useCallback(async (
        name: string,
        pipelineId: string,
        crmStages: Array<{ id: string; name: string; color: string }>,
        sheetsUrl?: string
    ): Promise<Funnel> => {
        const supabase = getSupabase();
        const now = new Date().toISOString();

        // Create funnel with pipeline source
        const { data, error } = await supabase
            .from('funnels')
            .insert({
                name,
                created_at: now,
                updated_at: now,
                source_type: 'pipeline',
                source_pipeline_id: pipelineId,
                sheets_url: sheetsUrl || null
            })
            .select()
            .single();

        if (error) throw error;

        // Add CRM stages
        for (let i = 0; i < crmStages.length; i++) {
            const crmStage = crmStages[i];
            await supabase
                .from('funnel_stages')
                .insert({
                    id: crypto.randomUUID(),
                    funnel_id: data.id,
                    name: crmStage.name,
                    emoji: "",
                    unit: "absolute",
                    thresholds: {
                        otimo: { min: 80, max: 120 },
                        ok: { min: 50, max: 79 },
                        ruim: { max: 49 },
                    },
                    position: i,
                    is_evaluation: false,
                    data_source: 'crm',
                    crm_stage_id: crmStage.id,
                });
        }

        const newFunnel: Funnel = {
            id: data.id,
            name: data.name,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            sourceType: 'pipeline',
            sourcePipelineId: pipelineId,
            sheetsUrl: sheetsUrl,
            stages: crmStages.map((s, i) => ({
                id: crypto.randomUUID(),
                name: s.name,
                emoji: "",
                unit: "absolute" as const,
                thresholds: {
                    otimo: { min: 80, max: 120 },
                    ok: { min: 50, max: 79 },
                    ruim: { max: 49 },
                },
                dataSource: 'crm' as const,
                crmStageId: s.id,
            })),
        };

        setFunnels(prev => [...prev, newFunnel]);
        return newFunnel;
    }, []);

    return {
        funnels,
        isLoading,
        error,
        addFunnel,
        addFunnelFromPipeline,
        getFunnel,
        updateFunnel,
        addStage,
        updateStage,
        removeStage,
        updateThresholds,
        setSheetsUrl,
        deleteFunnel,
        refresh,
    };
}

// Hook to fetch flow-based data from Google Sheets (dashboard_daily tab)
// This data represents how many people PASSED THROUGH each stage, not how many ARE in each stage
export function useFunnelData(sheetsUrl: string | undefined, funnelName: string) {
    const [data, setData] = useState<FunnelMetricData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchData = useCallback(async () => {
        if (!sheetsUrl) {
            setData([]);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/sheets?url=${encodeURIComponent(sheetsUrl)}&pipeline=${encodeURIComponent(funnelName)}&t=${Date.now()}`);
            if (!res.ok) throw new Error("Falha ao buscar dados da planilha");
            const result = await res.json();
            if (result.error) throw new Error(result.error);
            setData(result.data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro desconhecido");
            setData([]);
        } finally {
            setIsLoading(false);
        }
    }, [sheetsUrl, funnelName]);

    useEffect(() => {
        fetchData();
    }, [fetchData, refreshKey]);

    // Manual refresh function
    const refresh = useCallback(() => {
        setRefreshKey(prev => prev + 1);
    }, []);

    // Parse date from DD/MM/YYYY format to Date object
    const parseDate = useCallback((dateStr: string): Date | null => {
        if (!dateStr) return null;
        // Handle DD/MM/YYYY format
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            const [day, month, year] = parts.map(p => parseInt(p));
            return new Date(year, month - 1, day);
        }
        // Fallback to ISO format
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? null : d;
    }, []);

    // Check if a date is within range
    const isDateInRange = useCallback((dateStr: string, startDate?: Date, endDate?: Date): boolean => {
        const date = parseDate(dateStr);
        if (!date) return false;

        // Reset time parts for comparison
        date.setHours(0, 0, 0, 0);

        if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            if (date < start) return false;
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            if (date > end) return false;
        }
        return true;
    }, [parseDate]);

    // Get TOTAL value for a specific stage within a date range and optional origin filter
    // This SUMS created_count + stage_changed_count for all days in the range
    const getStageValue = useCallback(
        (stageName: string, startDate?: Date, endDate?: Date, origem?: "total" | "trafego" | "organico"): number | null => {
            // Filter by stage name (exact match)
            let stageData = data.filter((d) => d.stage === stageName);

            if (stageData.length === 0) return null;

            // Filter by origin if specified (not "total")
            if (origem && origem !== "total") {
                stageData = stageData.filter((d) => d.origem === origem);
            }

            // Filter by date range
            const filteredData = stageData.filter((d) => isDateInRange(d.date, startDate, endDate));

            if (filteredData.length === 0) return null;

            // Sum created_count + stage_changed_count for all matching rows
            const total = filteredData.reduce((sum, d) => {
                return sum + (d.createdCount || 0) + (d.stageChangedCount || 0);
            }, 0);

            return total;
        },
        [data, isDateInRange]
    );

    // Get all unique stages found in the data
    const getAvailableStages = useCallback((): string[] => {
        const stages = new Set(data.map(d => d.stage));
        return Array.from(stages);
    }, [data]);

    // Get all unique origins found in the data
    const getAvailableOrigins = useCallback((): string[] => {
        const origins = new Set(data.map(d => d.origem).filter((o): o is string => Boolean(o)));
        return Array.from(origins);
    }, [data]);

    return { data, isLoading, error, getStageValue, getAvailableStages, getAvailableOrigins, refresh };
}

