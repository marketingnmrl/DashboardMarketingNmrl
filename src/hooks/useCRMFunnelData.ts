"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { LeadOrigin } from "@/types/crm";

interface CRMStageCount {
    stageId: string;
    count: number;
    origin?: LeadOrigin;
}

interface UseCRMFunnelDataOptions {
    pipelineId: string;
    stageIds: string[];
    dateRange: {
        start: Date;
        end: Date;
    };
}

interface UseCRMFunnelDataReturn {
    getCRMStageValue: (stageId: string, origin?: "total" | "trafego" | "organico") => number | null;
    isLoading: boolean;
    error: string | null;
    refresh: () => void;
}

/**
 * Hook to fetch lead counts from CRM stages for hybrid funnels (COHORT MODEL)
 * 
 * IMPORTANTE: Filtra leads por DATA DE CRIAÇÃO (created_at) dentro do período
 * Isso garante que a visualização mostra apenas leads que NASCERAM no período,
 * evitando contaminação de leads de dias anteriores.
 * 
 * Exemplo:
 * - Lead criado 12/01, movido pra "Em Negociação" em 13/01
 * - Na visualização de 13/01, esse lead NÃO aparece (foi criado em 12/01)
 * - Na visualização de 12/01 a 13/01, esse lead aparece em "Em Negociação"
 */
export function useCRMFunnelData(options: UseCRMFunnelDataOptions | null): UseCRMFunnelDataReturn {
    const { user } = useAuth();
    const [counts, setCounts] = useState<CRMStageCount[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Memoize date strings to avoid unnecessary refetches
    const dateRangeKey = useMemo(() => {
        if (!options?.dateRange) return "";
        return `${options.dateRange.start.toISOString()}-${options.dateRange.end.toISOString()}`;
    }, [options?.dateRange]);

    const fetchCounts = useCallback(async () => {
        if (!user || !options || !options.pipelineId || options.stageIds.length === 0) {
            setCounts([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Format dates for Supabase query
            const startDate = new Date(options.dateRange.start);
            startDate.setHours(0, 0, 0, 0);

            const endDate = new Date(options.dateRange.end);
            endDate.setHours(23, 59, 59, 999);

            // Fetch leads CREATED in the period, grouped by current stage and origin
            // This is the COHORT model: leads born in period → where are they now
            const { data, error: fetchError } = await supabase
                .from("crm_leads")
                .select("current_stage_id, origin, created_at")
                .eq("pipeline_id", options.pipelineId)
                .in("current_stage_id", options.stageIds)
                .gte("created_at", startDate.toISOString())
                .lte("created_at", endDate.toISOString());

            if (fetchError) throw fetchError;

            // Count leads by stage and origin
            const countMap = new Map<string, { total: number; paid: number; organic: number }>();

            options.stageIds.forEach(id => {
                countMap.set(id, { total: 0, paid: 0, organic: 0 });
            });

            (data || []).forEach(lead => {
                const stageId = lead.current_stage_id;
                if (stageId && countMap.has(stageId)) {
                    const stageCounts = countMap.get(stageId)!;
                    stageCounts.total++;
                    if (lead.origin === "paid") {
                        stageCounts.paid++;
                    } else if (lead.origin === "organic") {
                        stageCounts.organic++;
                    }
                }
            });

            // Store the full counts for later filtering
            setCounts(Array.from(countMap.entries()).flatMap(([stageId, c]) => [
                { stageId, count: c.total, origin: undefined },
                { stageId, count: c.paid, origin: "paid" as LeadOrigin },
                { stageId, count: c.organic, origin: "organic" as LeadOrigin },
            ]));

        } catch (err) {
            console.error("Error fetching CRM stage counts:", err);
            setError(err instanceof Error ? err.message : "Erro ao buscar dados do CRM");
        } finally {
            setIsLoading(false);
        }
    }, [user, options?.pipelineId, options?.stageIds, dateRangeKey]);

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
