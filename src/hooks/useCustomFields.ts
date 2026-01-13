"use client";

import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { CRMCustomField, CustomFieldType } from "@/types/crm";

interface UseCustomFieldsReturn {
    customFields: CRMCustomField[];
    isLoading: boolean;
    error: string | null;
    fetchCustomFields: () => Promise<void>;
    createCustomField: (name: string, fieldType: CustomFieldType, options?: string[]) => Promise<CRMCustomField | null>;
    updateCustomField: (id: string, name: string, options?: string[]) => Promise<boolean>;
    deleteCustomField: (id: string) => Promise<boolean>;
}

export function useCustomFields(): UseCustomFieldsReturn {
    const { user } = useAuth();
    const [customFields, setCustomFields] = useState<CRMCustomField[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch all custom fields
    const fetchCustomFields = useCallback(async () => {
        if (!user) {
            setCustomFields([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from("crm_custom_fields")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: true });

            if (fetchError) throw fetchError;

            setCustomFields(data || []);
        } catch (err) {
            console.error("Error fetching custom fields:", err);
            setError(err instanceof Error ? err.message : "Erro ao carregar campos");
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    // Create custom field
    const createCustomField = useCallback(async (
        name: string,
        fieldType: CustomFieldType,
        options?: string[]
    ): Promise<CRMCustomField | null> => {
        if (!user) return null;

        try {
            // Generate field_key from name (snake_case)
            const fieldKey = name
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]+/g, "_")
                .replace(/(^_|_$)/g, "");

            const { data, error: createError } = await supabase
                .from("crm_custom_fields")
                .insert({
                    user_id: user.id,
                    name,
                    field_key: fieldKey,
                    field_type: fieldType,
                    options: fieldType === "select" ? options : null,
                    required: false
                })
                .select()
                .single();

            if (createError) throw createError;

            await fetchCustomFields();
            return data;
        } catch (err) {
            console.error("Error creating custom field:", err);
            setError(err instanceof Error ? err.message : "Erro ao criar campo");
            return null;
        }
    }, [user, fetchCustomFields]);

    // Update custom field
    const updateCustomField = useCallback(async (
        id: string,
        name: string,
        options?: string[]
    ): Promise<boolean> => {
        try {
            const updateData: Partial<CRMCustomField> = { name };
            if (options) {
                updateData.options = options;
            }

            const { error: updateError } = await supabase
                .from("crm_custom_fields")
                .update(updateData)
                .eq("id", id);

            if (updateError) throw updateError;

            await fetchCustomFields();
            return true;
        } catch (err) {
            console.error("Error updating custom field:", err);
            return false;
        }
    }, [fetchCustomFields]);

    // Delete custom field
    const deleteCustomField = useCallback(async (id: string): Promise<boolean> => {
        try {
            const { error: deleteError } = await supabase
                .from("crm_custom_fields")
                .delete()
                .eq("id", id);

            if (deleteError) throw deleteError;

            await fetchCustomFields();
            return true;
        } catch (err) {
            console.error("Error deleting custom field:", err);
            return false;
        }
    }, [fetchCustomFields]);

    // Initial fetch
    useEffect(() => {
        fetchCustomFields();
    }, [fetchCustomFields]);

    return {
        customFields,
        isLoading,
        error,
        fetchCustomFields,
        createCustomField,
        updateCustomField,
        deleteCustomField
    };
}
