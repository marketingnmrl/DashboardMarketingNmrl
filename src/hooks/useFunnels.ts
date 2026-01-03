"use client";

import { useState, useEffect, useCallback } from "react";
import { Funnel, FunnelStage, FunnelStageThresholds, FunnelMetricData } from "@/types/funnel";
import { getSupabase } from "@/lib/supabase";

// Database types
interface DBFunnel {
    id: string;
    name: string;
    sheets_url: string | null;
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
    created_at: string;
}

// Convert DB funnel to app funnel
function dbToFunnel(dbFunnel: DBFunnel, stages: DBFunnelStage[]): Funnel {
    return {
        id: dbFunnel.id,
        name: dbFunnel.name,
        sheetsUrl: dbFunnel.sheets_url || undefined,
        createdAt: dbFunnel.created_at,
        updatedAt: dbFunnel.updated_at,
        stages: stages
            .filter(s => s.funnel_id === dbFunnel.id)
            .sort((a, b) => a.position - b.position)
            .map(s => ({
                id: s.id,
                name: s.name,
                emoji: s.emoji || "",
                unit: s.unit,
                thresholds: s.thresholds,
            })),
    };
}

// Create a new stage with default thresholds
export function createNewStage(
    name: string,
    emoji: string,
    unit: "absolute" | "percentage"
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
        async (funnelId: string, stage: FunnelStage, position?: number) => {
            const supabase = getSupabase();

            // If position not provided, query current max position from database
            let stagePosition = position ?? 0;
            if (position === undefined) {
                const { data: existingStages } = await supabase
                    .from('funnel_stages')
                    .select('position')
                    .eq('funnel_id', funnelId)
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

    return {
        funnels,
        isLoading,
        error,
        addFunnel,
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

// Hook to fetch data from Google Sheets
export function useFunnelData(sheetsUrl: string | undefined, funnelName: string) {
    const [data, setData] = useState<FunnelMetricData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!sheetsUrl) {
            setData([]);
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/sheets?url=${encodeURIComponent(sheetsUrl)}&funnel=${encodeURIComponent(funnelName)}`);
                if (!res.ok) throw new Error("Falha ao buscar dados da planilha");
                const result = await res.json();
                setData(result.data || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Erro desconhecido");
                setData([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [sheetsUrl, funnelName]);

    // Get value for a specific stage and date range
    const getStageValue = useCallback(
        (stageName: string, startDate?: string, endDate?: string): number | null => {
            const stageData = data.filter((d) => d.stage === stageName);

            if (stageData.length === 0) return null;

            let filtered = stageData;
            if (startDate) {
                filtered = filtered.filter((d) => d.date >= startDate);
            }
            if (endDate) {
                filtered = filtered.filter((d) => d.date <= endDate);
            }

            if (filtered.length === 0) return null;

            // Return the most recent value or average depending on use case
            // For now, return the most recent
            const sorted = filtered.sort((a, b) => b.date.localeCompare(a.date));
            return sorted[0]?.value ?? null;
        },
        [data]
    );

    return { data, isLoading, error, getStageValue };
}
