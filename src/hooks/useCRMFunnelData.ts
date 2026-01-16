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
 * Hook to fetch lead counts from CRM stages for hybrid funnels
 * 
 * MODELO: Fluxo por etapa (quantos PASSARAM)
 * 
 * Usa a tabela crm_lead_stage_history para contar quantos leads distintos
 * ENTRARAM em cada etapa durante o período selecionado.
 * 
 * Filtro de coorte: Só conta leads que foram CRIADOS no período selecionado.
 * 
 * Exemplo:
 * - Lead criado 13/01, passou por: Novo → Qualificado → Em Negociação
 * - Visualização 13/01: Todas as 3 etapas mostram "1"
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

            // Step 1: Get leads CREATED in the period (cohort filter)
            const { data: cohortLeads, error: cohortError } = await supabase
                .from("crm_leads")
                .select("id, origin")
                .eq("pipeline_id", options.pipelineId)
                .gte("created_at", startDate.toISOString())
                .lte("created_at", endDate.toISOString());

            if (cohortError) throw cohortError;

            if (!cohortLeads || cohortLeads.length === 0) {
                // No leads in cohort, set all counts to 0
                setCounts(options.stageIds.flatMap(stageId => [
                    { stageId, count: 0, origin: undefined },
                    { stageId, count: 0, origin: "paid" as LeadOrigin },
                    { stageId, count: 0, origin: "organic" as LeadOrigin },
                ]));
                setIsLoading(false);
                return;
            }

            const cohortLeadIds = cohortLeads.map(l => l.id);
            const leadOriginMap = new Map(cohortLeads.map(l => [l.id, l.origin as LeadOrigin]));

            // Step 2: Get ALL stage history for cohort leads - entries into each stage
            // No date filter on moved_at - we want to see their full journey
            const { data: historyData, error: historyError } = await supabase
                .from("crm_lead_stage_history")
                .select("lead_id, to_stage_id, moved_at")
                .in("lead_id", cohortLeadIds)
                .in("to_stage_id", options.stageIds);

            if (historyError) throw historyError;

            // Count distinct leads that entered each stage
            const countMap = new Map<string, { total: Set<string>; paid: Set<string>; organic: Set<string> }>();

            options.stageIds.forEach(id => {
                countMap.set(id, { total: new Set(), paid: new Set(), organic: new Set() });
            });

            (historyData || []).forEach(entry => {
                const stageId = entry.to_stage_id;
                const leadId = entry.lead_id;

                if (stageId && countMap.has(stageId)) {
                    const stageCounts = countMap.get(stageId)!;
                    stageCounts.total.add(leadId);

                    const origin = leadOriginMap.get(leadId);
                    if (origin === "paid") {
                        stageCounts.paid.add(leadId);
                    } else if (origin === "organic") {
                        stageCounts.organic.add(leadId);
                    }
                }
            });

            // Convert to array format with counts
            setCounts(Array.from(countMap.entries()).flatMap(([stageId, sets]) => [
                { stageId, count: sets.total.size, origin: undefined },
                { stageId, count: sets.paid.size, origin: "paid" as LeadOrigin },
                { stageId, count: sets.organic.size, origin: "organic" as LeadOrigin },
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
