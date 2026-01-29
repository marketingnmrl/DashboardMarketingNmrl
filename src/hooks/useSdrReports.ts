import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAccessControlContext } from "@/contexts/AccessControlContext";
import type { SdrReport, CreateSdrReportInput } from "@/types/crm";

export function useSdrReports() {
    const { currentUser } = useAccessControlContext();
    const [reports, setReports] = useState<SdrReport[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchReports = useCallback(async (options?: {
        startDate?: string;
        endDate?: string;
        userId?: string;
    }) => {
        setIsLoading(true);
        setError(null);

        try {
            let query = supabase
                .from("crm_sdr_reports")
                .select(`
                    *,
                    user:org_users(id, name, email)
                `)
                .order("report_date", { ascending: false });

            if (options?.startDate) {
                query = query.gte("report_date", options.startDate);
            }

            if (options?.endDate) {
                query = query.lte("report_date", options.endDate);
            }

            if (options?.userId && options.userId !== "all") {
                query = query.eq("user_id", options.userId);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;

            setReports(data || []);
        } catch (err) {
            console.error("Error fetching reports:", err);
            setError(err instanceof Error ? err.message : "Erro ao carregar relatórios");
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);

    const upsertReport = useCallback(async (input: CreateSdrReportInput): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from("crm_sdr_reports")
                .upsert(input, { onConflict: "user_id, report_date" });

            if (error) throw error;

            await fetchReports({ startDate: input.report_date, endDate: input.report_date }); // Refresh specific date or all? Better to rely on caller or generic refresh
            return true;
        } catch (err) {
            console.error("Error saving report:", err);
            setError(err instanceof Error ? err.message : "Erro ao salvar relatório");
            return false;
        }
    }, [supabase, fetchReports]);

    const deleteReport = useCallback(async (id: string): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from("crm_sdr_reports")
                .delete()
                .eq("id", id);

            if (error) throw error;

            setReports(prev => prev.filter(r => r.id !== id));
            return true;
        } catch (err) {
            console.error("Error deleting report:", err);
            setError(err instanceof Error ? err.message : "Erro ao excluir relatório");
            return false;
        }
    }, [supabase]);

    return {
        reports,
        isLoading,
        error,
        fetchReports,
        upsertReport,
        deleteReport
    };
}
