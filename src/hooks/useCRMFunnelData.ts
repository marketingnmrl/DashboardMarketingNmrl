"use client";

import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { LeadOrigin } from "@/types/crm";

interface CRMStageCount {
    stageId: string;
    stageName: string;
    count: number;
    origin?: LeadOrigin;
}

interface UseCRMFunnelDataOptions {
    pipelineId: string;
    stageIds: string[];
}

interface UseCRMFunnelDataReturn {
    getCRMStageValue: (stageId: string, origin?: "total" | "trafego" | "organico") => number | null;
    isLoading: boolean;
    error: string | null;
    refresh: () => void;
}

/**
 * Hook to fetch lead counts from CRM stages for hybrid funnels
 * Returns counts that can be filtered by origin (paid = trafego, organic = organico)
 */
export function useCRMFunnelData(options: UseCRMFunnelDataOptions | null): UseCRMFunnelDataReturn {
    const { user } = useAuth();
    const [counts, setCounts] = useState<CRMStageCount[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCounts = useCallback(async () => {
        if (!user || !options || !options.pipelineId || options.stageIds.length === 0) {
            setCounts([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Fetch leads grouped by stage and origin
            const { data, error: fetchError } = await supabase
                .from("crm_leads")
                .select("current_stage_id, origin")
                .eq("pipeline_id", options.pipelineId)
                .in("current_stage_id", options.stageIds);

            if (fetchError) throw fetchError;

            // Count leads by stage and origin
            const countMap = new Map<string, { total: number; paid: number; organic: number }>();

            options.stageIds.forEach(id => {
                countMap.set(id, { total: 0, paid: 0, organic: 0 });
            });

            (data || []).forEach(lead => {
                const stageId = lead.current_stage_id;
                if (stageId && countMap.has(stageId)) {
                    const counts = countMap.get(stageId)!;
                    counts.total++;
                    if (lead.origin === "paid") {
                        counts.paid++;
                    } else if (lead.origin === "organic") {
                        counts.organic++;
                    }
                }
            });

            // Convert to array format
            const result: CRMStageCount[] = [];
            countMap.forEach((counts, stageId) => {
                result.push({ stageId, stageName: "", count: counts.total });
            });

            // Store the full counts for later filtering
            setCounts(Array.from(countMap.entries()).flatMap(([stageId, c]) => [
                { stageId, stageName: "", count: c.total, origin: undefined },
                { stageId, stageName: "", count: c.paid, origin: "paid" as LeadOrigin },
                { stageId, stageName: "", count: c.organic, origin: "organic" as LeadOrigin },
            ]));

        } catch (err) {
            console.error("Error fetching CRM stage counts:", err);
            setError(err instanceof Error ? err.message : "Erro ao buscar dados do CRM");
        } finally {
            setIsLoading(false);
        }
    }, [user, options]);

    useEffect(() => {
        fetchCounts();
    }, [fetchCounts]);

    // Get value for a specific stage with optional origin filter
    const getCRMStageValue = useCallback((
        stageId: string,
        origin?: "total" | "trafego" | "organico"
    ): number | null => {
        if (!stageId || counts.length === 0) return null;

        if (!origin || origin === "total") {
            // Return total count
            const match = counts.find(c => c.stageId === stageId && c.origin === undefined);
            return match?.count ?? null;
        }

        // Map origin filter to LeadOrigin
        const leadOrigin: LeadOrigin | undefined = origin === "trafego" ? "paid" : origin === "organico" ? "organic" : undefined;

        if (!leadOrigin) return null;

        const match = counts.find(c => c.stageId === stageId && c.origin === leadOrigin);
        return match?.count ?? null;
    }, [counts]);

    return {
        getCRMStageValue,
        isLoading,
        error,
        refresh: fetchCounts,
    };
}
