"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface CRMSalesData {
    totalSales: number;         // Sum of all deal_values
    salesCount: number;         // Number of leads with deal_value
    wonStageLeadsCount: number; // Number of leads in "won" stages
}

export function useCRMSales() {
    const { user } = useAuth();
    const [data, setData] = useState<CRMSalesData>({
        totalSales: 0,
        salesCount: 0,
        wonStageLeadsCount: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    const fetchSalesData = useCallback(async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            // Fetch all leads with deal_value
            const { data: leads, error } = await supabase
                .from("crm_leads")
                .select("id, deal_value, current_stage_id")
                .not("deal_value", "is", null);

            if (error) throw error;

            const totalSales = (leads || []).reduce((sum, lead) => sum + (lead.deal_value || 0), 0);
            const salesCount = (leads || []).filter(l => l.deal_value && l.deal_value > 0).length;

            setData({
                totalSales,
                salesCount,
                wonStageLeadsCount: salesCount // For now, count leads with value as "won"
            });

        } catch (err) {
            console.error("Error fetching CRM sales:", err);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchSalesData();
    }, [fetchSalesData]);

    return { ...data, isLoading, refresh: fetchSalesData };
}
