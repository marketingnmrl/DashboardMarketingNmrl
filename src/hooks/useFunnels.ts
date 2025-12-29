"use client";

import { useState, useEffect, useCallback } from "react";
import { Funnel, FunnelStage, FunnelStageThresholds, FunnelMetricData } from "@/types/funnel";

const STORAGE_KEY = "marketing-na-moral-funnels";

// Generate unique ID
function generateId(): string {
    return `funnel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateStageId(): string {
    return `stage-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Create a new empty funnel
export function createNewFunnel(name: string): Funnel {
    const now = new Date().toISOString();
    return {
        id: generateId(),
        name,
        createdAt: now,
        updatedAt: now,
        stages: [],
        sheetsUrl: undefined,
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
        id: generateStageId(),
        name,
        emoji,
        unit,
        thresholds: defaultThresholds,
    };
}

export function useFunnels() {
    const [funnels, setFunnels] = useState<Funnel[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load funnels from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setFunnels(JSON.parse(stored));
            }
        } catch (error) {
            console.error("Error loading funnels:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Save funnels to localStorage whenever they change
    useEffect(() => {
        if (!isLoading) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(funnels));
            } catch (error) {
                console.error("Error saving funnels:", error);
            }
        }
    }, [funnels, isLoading]);

    // Add a new funnel
    const addFunnel = useCallback((name: string): Funnel => {
        const newFunnel = createNewFunnel(name);
        setFunnels((prev) => [...prev, newFunnel]);
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
    const updateFunnel = useCallback((id: string, updates: Partial<Funnel>) => {
        setFunnels((prev) =>
            prev.map((f) =>
                f.id === id
                    ? { ...f, ...updates, updatedAt: new Date().toISOString() }
                    : f
            )
        );
    }, []);

    // Add a stage to a funnel
    const addStage = useCallback(
        (funnelId: string, stage: FunnelStage, afterStageId?: string) => {
            setFunnels((prev) =>
                prev.map((f) => {
                    if (f.id !== funnelId) return f;

                    let newStages: FunnelStage[];
                    if (afterStageId) {
                        const index = f.stages.findIndex((s) => s.id === afterStageId);
                        newStages = [
                            ...f.stages.slice(0, index + 1),
                            stage,
                            ...f.stages.slice(index + 1),
                        ];
                    } else {
                        newStages = [...f.stages, stage];
                    }

                    return {
                        ...f,
                        stages: newStages,
                        updatedAt: new Date().toISOString(),
                    };
                })
            );
        },
        []
    );

    // Update a stage
    const updateStage = useCallback(
        (funnelId: string, stageId: string, updates: Partial<FunnelStage>) => {
            setFunnels((prev) =>
                prev.map((f) =>
                    f.id === funnelId
                        ? {
                            ...f,
                            updatedAt: new Date().toISOString(),
                            stages: f.stages.map((s) =>
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
    const removeStage = useCallback((funnelId: string, stageId: string) => {
        setFunnels((prev) =>
            prev.map((f) =>
                f.id === funnelId
                    ? {
                        ...f,
                        updatedAt: new Date().toISOString(),
                        stages: f.stages.filter((s) => s.id !== stageId),
                    }
                    : f
            )
        );
    }, []);

    // Update thresholds
    const updateThresholds = useCallback(
        (funnelId: string, stageId: string, thresholds: FunnelStageThresholds) => {
            setFunnels((prev) =>
                prev.map((f) =>
                    f.id === funnelId
                        ? {
                            ...f,
                            updatedAt: new Date().toISOString(),
                            stages: f.stages.map((s) =>
                                s.id === stageId ? { ...s, thresholds } : s
                            ),
                        }
                        : f
                )
            );
        },
        []
    );

    // Set Google Sheets URL
    const setSheetsUrl = useCallback((funnelId: string, url: string) => {
        setFunnels((prev) =>
            prev.map((f) =>
                f.id === funnelId
                    ? { ...f, sheetsUrl: url, updatedAt: new Date().toISOString() }
                    : f
            )
        );
    }, []);

    // Delete a funnel
    const deleteFunnel = useCallback((id: string) => {
        setFunnels((prev) => prev.filter((f) => f.id !== id));
    }, []);

    return {
        funnels,
        isLoading,
        addFunnel,
        getFunnel,
        updateFunnel,
        addStage,
        updateStage,
        removeStage,
        updateThresholds,
        setSheetsUrl,
        deleteFunnel,
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
