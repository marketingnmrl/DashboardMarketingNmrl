"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabase } from "@/lib/supabase";

interface FinancialData {
    id?: string;
    caixa: number;
    meta: number;
}

export function useFinancialData() {
    const [data, setData] = useState<FinancialData>({
        caixa: 85000,
        meta: 60000,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load from Supabase
    const loadData = useCallback(async () => {
        if (typeof window === 'undefined') return;

        try {
            setIsLoading(true);
            const supabase = getSupabase();

            const { data: rows, error: fetchError } = await supabase
                .from('financial_settings')
                .select('*')
                .limit(1);

            if (fetchError) throw fetchError;

            if (rows && rows.length > 0) {
                const row = rows[0];
                setData({
                    id: row.id,
                    caixa: Number(row.caixa) || 0,
                    meta: Number(row.meta) || 0,
                });
            } else {
                // Create default row if none exists
                const { data: newRow, error: insertError } = await supabase
                    .from('financial_settings')
                    .insert({ caixa: 85000, meta: 60000 })
                    .select()
                    .single();

                if (insertError) throw insertError;

                setData({
                    id: newRow.id,
                    caixa: Number(newRow.caixa) || 85000,
                    meta: Number(newRow.meta) || 60000,
                });
            }

            setError(null);
        } catch (err) {
            console.error("Error loading financial data:", err);
            setError(err instanceof Error ? err.message : "Erro ao carregar dados financeiros");
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Load on mount
    useEffect(() => {
        loadData();
    }, [loadData]);

    // Save data to Supabase
    const saveData = useCallback(async (updates: Partial<FinancialData>) => {
        if (typeof window === 'undefined') return;

        try {
            const supabase = getSupabase();
            const newData = { ...data, ...updates };

            if (data.id) {
                // Update existing
                const { error: updateError } = await supabase
                    .from('financial_settings')
                    .update({
                        caixa: newData.caixa,
                        meta: newData.meta,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', data.id);

                if (updateError) throw updateError;
            } else {
                // Insert new
                const { data: newRow, error: insertError } = await supabase
                    .from('financial_settings')
                    .insert({
                        caixa: newData.caixa,
                        meta: newData.meta,
                    })
                    .select()
                    .single();

                if (insertError) throw insertError;
                newData.id = newRow.id;
            }

            setData(newData);
            setError(null);
        } catch (err) {
            console.error("Error saving financial data:", err);
            setError(err instanceof Error ? err.message : "Erro ao salvar dados financeiros");
        }
    }, [data]);

    // Refresh data
    const refresh = useCallback(() => {
        loadData();
    }, [loadData]);

    return { data, isLoading, error, saveData, refresh };
}
