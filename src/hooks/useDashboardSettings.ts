"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabase } from "@/lib/supabase";
import { DashboardSettings } from "@/types/stract";

// Database types
interface DBDashboardSettings {
    id: string;
    visao_geral_sheet_url: string | null;
    investimentos_sheet_url: string | null;
    trafego_sheet_url: string | null;
    hidden_menu_items: string[] | null;
    updated_at: string;
}

// Convert DB to app format
function dbToSettings(db: DBDashboardSettings): DashboardSettings {
    return {
        id: db.id,
        visaoGeralSheetUrl: db.visao_geral_sheet_url,
        investimentosSheetUrl: db.investimentos_sheet_url,
        trafegoSheetUrl: db.trafego_sheet_url,
        hiddenMenuItems: db.hidden_menu_items || [],
        updatedAt: db.updated_at,
    };
}

export function useDashboardSettings() {
    const [settings, setSettings] = useState<DashboardSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Load settings
    const loadSettings = useCallback(async () => {
        if (typeof window === "undefined") return;

        try {
            setIsLoading(true);
            const supabase = getSupabase();

            // Try to get existing settings (there should be only one row)
            const { data, error: fetchError } = await supabase
                .from("dashboard_settings")
                .select("*")
                .limit(1)
                .single();

            if (fetchError) {
                // If no row exists, that's okay - we'll create one on save
                if (fetchError.code === "PGRST116") {
                    setSettings({
                        visaoGeralSheetUrl: null,
                        investimentosSheetUrl: null,
                        trafegoSheetUrl: null,
                        hiddenMenuItems: [],
                    });
                } else {
                    throw fetchError;
                }
            } else {
                setSettings(dbToSettings(data as DBDashboardSettings));
            }
            setError(null);
        } catch (err) {
            console.error("Error loading dashboard settings:", err);
            setError(err instanceof Error ? err.message : "Erro ao carregar configurações");
            // Fallback to localStorage if Supabase fails
            const localData = localStorage.getItem("dashboard_settings");
            if (localData) {
                try {
                    setSettings(JSON.parse(localData));
                } catch {
                    // Ignore parse errors
                }
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Load on mount
    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    // Update a specific sheet URL
    const updateSheetUrl = useCallback(
        async (
            field: "visaoGeralSheetUrl" | "investimentosSheetUrl" | "trafegoSheetUrl",
            url: string | null
        ) => {
            setIsSaving(true);
            try {
                const supabase = getSupabase();
                const now = new Date().toISOString();

                // Map app field to DB column
                const dbField = {
                    visaoGeralSheetUrl: "visao_geral_sheet_url",
                    investimentosSheetUrl: "investimentos_sheet_url",
                    trafegoSheetUrl: "trafego_sheet_url",
                }[field];

                if (settings?.id) {
                    // Update existing
                    const { error: updateError } = await supabase
                        .from("dashboard_settings")
                        .update({ [dbField]: url, updated_at: now })
                        .eq("id", settings.id);

                    if (updateError) throw updateError;
                } else {
                    // Insert new
                    const { data, error: insertError } = await supabase
                        .from("dashboard_settings")
                        .insert({ [dbField]: url, updated_at: now })
                        .select()
                        .single();

                    if (insertError) throw insertError;

                    // Update local state with new ID
                    if (data) {
                        setSettings(dbToSettings(data as DBDashboardSettings));
                        return;
                    }
                }

                // Update local state
                setSettings(prev => prev ? { ...prev, [field]: url, updatedAt: now } : null);

                // Also save to localStorage as backup
                const newSettings = { ...settings, [field]: url };
                localStorage.setItem("dashboard_settings", JSON.stringify(newSettings));
            } catch (err) {
                console.error("Error saving dashboard settings:", err);
                setError(err instanceof Error ? err.message : "Erro ao salvar configurações");

                // Fallback: save to localStorage only
                const newSettings = { ...settings, [field]: url };
                localStorage.setItem("dashboard_settings", JSON.stringify(newSettings));
                setSettings(prev => prev ? { ...prev, [field]: url } : null);
            } finally {
                setIsSaving(false);
            }
        },
        [settings]
    );

    // Test sheet URL connectivity
    const testSheetUrl = useCallback(async (url: string): Promise<{ success: boolean; message: string; count?: number }> => {
        try {
            const res = await fetch(`/api/sheets/stract?url=${encodeURIComponent(url)}`);
            const data = await res.json();

            if (!res.ok) {
                return { success: false, message: data.error || "Erro ao acessar planilha" };
            }

            return {
                success: true,
                message: `Conexão bem-sucedida! ${data.count || 0} registros encontrados.`,
                count: data.count
            };
        } catch (err) {
            return {
                success: false,
                message: err instanceof Error ? err.message : "Erro de conexão"
            };
        }
    }, []);

    // Save hidden menu items array (called by Settings page with explicit save button)
    const saveHiddenMenuItems = useCallback(async (hiddenItems: string[]) => {
        setIsSaving(true);
        try {
            const supabase = getSupabase();
            const now = new Date().toISOString();

            if (settings?.id) {
                const { error: updateError } = await supabase
                    .from("dashboard_settings")
                    .update({ hidden_menu_items: hiddenItems, updated_at: now })
                    .eq("id", settings.id);

                if (updateError) throw updateError;
            } else {
                const { data, error: insertError } = await supabase
                    .from("dashboard_settings")
                    .insert({ hidden_menu_items: hiddenItems, updated_at: now })
                    .select()
                    .single();

                if (insertError) throw insertError;

                if (data) {
                    setSettings(dbToSettings(data as DBDashboardSettings));
                    setIsSaving(false);
                    return;
                }
            }

            setSettings(prev => prev ? { ...prev, hiddenMenuItems: hiddenItems, updatedAt: now } : null);
        } catch (err) {
            console.error("Error saving hidden menu items:", err);
            throw err; // Re-throw so the caller can handle it
        } finally {
            setIsSaving(false);
        }
    }, [settings]);

    // Toggle menu item visibility (legacy, used by Sidebar auto-toggle)
    const toggleMenuItemVisibility = useCallback(async (href: string) => {
        const currentHidden = settings?.hiddenMenuItems || [];
        const isCurrentlyHidden = currentHidden.includes(href);
        const newHidden = isCurrentlyHidden
            ? currentHidden.filter(h => h !== href)
            : [...currentHidden, href];

        await saveHiddenMenuItems(newHidden);
    }, [settings, saveHiddenMenuItems]);

    return {
        settings,
        isLoading,
        error,
        isSaving,
        updateSheetUrl,
        testSheetUrl,
        saveHiddenMenuItems,
        toggleMenuItemVisibility,
        refresh: loadSettings,
    };
}

