import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface PipelineAnalyticsData {
    stageName: string;
    stageId: string;
    total: number;
    byOrigin: Record<string, number>;
}

export function usePipelineAnalytics(pipelineId: string) {
    const [data, setData] = useState<PipelineAnalyticsData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAnalytics = useCallback(async (startDate: Date, endDate: Date) => {
        setIsLoading(true);
        setError(null);
        try {
            // Fetch stages to ensure we have all of them
            const { data: stages, error: stagesError } = await supabase
                .from('crm_pipeline_stages')
                .select('id, name, order_index')
                .eq('pipeline_id', pipelineId)
                .order('order_index');

            if (stagesError) throw stagesError;

            // Fetch leads within date range
            const { data: leads, error: leadsError } = await supabase
                .from('crm_leads')
                .select('current_stage_id, origin')
                .eq('pipeline_id', pipelineId)
                .gte('created_at', startDate.toISOString())
                .lte('created_at', endDate.toISOString());

            if (leadsError) throw leadsError;

            // Process data
            const analytics: PipelineAnalyticsData[] = (stages || []).map(stage => {
                const stageLeads = (leads || []).filter(l => l.current_stage_id === stage.id);
                const byOrigin: Record<string, number> = {};

                stageLeads.forEach(lead => {
                    const origin = lead.origin?.toLowerCase() || 'manual';
                    byOrigin[origin] = (byOrigin[origin] || 0) + 1;
                });

                return {
                    stageName: stage.name,
                    stageId: stage.id,
                    total: stageLeads.length,
                    byOrigin
                };
            });

            setData(analytics);

        } catch (err: any) {
            console.error('Error fetching pipeline analytics:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [pipelineId]);

    return { data, isLoading, error, fetchAnalytics };
}
