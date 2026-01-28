"use client";

import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { CRMTag } from "@/types/crm";

interface UseTagsReturn {
    tags: CRMTag[];
    isLoading: boolean;
    error: string | null;
    fetchTags: () => Promise<void>;
    createTag: (name: string, color: string) => Promise<CRMTag | null>;
    updateTag: (id: string, name: string, color: string) => Promise<boolean>;
    deleteTag: (id: string) => Promise<boolean>;
    addTagToLead: (leadId: string, tagId: string) => Promise<boolean>;
    removeTagFromLead: (leadId: string, tagId: string) => Promise<boolean>;
    addTagToLeads: (leadIds: string[], tagId: string) => Promise<boolean>;
    getLeadTags: (leadId: string) => Promise<CRMTag[]>;
}

export function useTags(): UseTagsReturn {
    const { user } = useAuth();
    const [tags, setTags] = useState<CRMTag[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch all tags for the current user
    const fetchTags = useCallback(async () => {
        if (!user) {
            setTags([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from("crm_tags")
                .select("*")
                .eq("user_id", user.id)
                .order("name", { ascending: true });

            if (fetchError) throw fetchError;
            setTags(data || []);
        } catch (err) {
            console.error("Error fetching tags:", err);
            setError(err instanceof Error ? err.message : "Erro ao carregar tags");
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    // Create a new tag
    const createTag = useCallback(async (name: string, color: string): Promise<CRMTag | null> => {
        if (!user) return null;

        try {
            const { data, error: createError } = await supabase
                .from("crm_tags")
                .insert({
                    user_id: user.id,
                    name: name.trim(),
                    color
                })
                .select()
                .single();

            if (createError) throw createError;

            await fetchTags();
            return data;
        } catch (err) {
            console.error("Error creating tag:", err);
            setError(err instanceof Error ? err.message : "Erro ao criar tag");
            return null;
        }
    }, [user, fetchTags]);

    // Update an existing tag
    const updateTag = useCallback(async (id: string, name: string, color: string): Promise<boolean> => {
        if (!user) return false;

        try {
            const { error: updateError } = await supabase
                .from("crm_tags")
                .update({ name: name.trim(), color })
                .eq("id", id)
                .eq("user_id", user.id);

            if (updateError) throw updateError;

            await fetchTags();
            return true;
        } catch (err) {
            console.error("Error updating tag:", err);
            return false;
        }
    }, [user, fetchTags]);

    // Delete a tag
    const deleteTag = useCallback(async (id: string): Promise<boolean> => {
        if (!user) return false;

        try {
            const { error: deleteError } = await supabase
                .from("crm_tags")
                .delete()
                .eq("id", id)
                .eq("user_id", user.id);

            if (deleteError) throw deleteError;

            await fetchTags();
            return true;
        } catch (err) {
            console.error("Error deleting tag:", err);
            return false;
        }
    }, [user, fetchTags]);

    // Add a tag to a lead
    const addTagToLead = useCallback(async (leadId: string, tagId: string): Promise<boolean> => {
        if (!user) return false;

        try {
            const { error: insertError } = await supabase
                .from("crm_lead_tags")
                .insert({ lead_id: leadId, tag_id: tagId });

            if (insertError) {
                // Ignore duplicate key errors (tag already added)
                if (insertError.code === "23505") return true;
                throw insertError;
            }

            return true;
        } catch (err) {
            console.error("Error adding tag to lead:", err);
            return false;
        }
    }, [user]);

    // Remove a tag from a lead
    const removeTagFromLead = useCallback(async (leadId: string, tagId: string): Promise<boolean> => {
        if (!user) return false;

        try {
            const { error: deleteError } = await supabase
                .from("crm_lead_tags")
                .delete()
                .eq("lead_id", leadId)
                .eq("tag_id", tagId);

            if (deleteError) throw deleteError;

            return true;
        } catch (err) {
            console.error("Error removing tag from lead:", err);
            return false;
        }
    }, [user]);

    // Add a tag to multiple leads (bulk operation)
    const addTagToLeads = useCallback(async (leadIds: string[], tagId: string): Promise<boolean> => {
        if (!user || leadIds.length === 0) return false;

        try {
            const insertData = leadIds.map(leadId => ({
                lead_id: leadId,
                tag_id: tagId
            }));

            const { error: insertError } = await supabase
                .from("crm_lead_tags")
                .upsert(insertData, { onConflict: "lead_id,tag_id" });

            if (insertError) throw insertError;

            return true;
        } catch (err) {
            console.error("Error adding tag to leads:", err);
            return false;
        }
    }, [user]);

    // Get tags for a specific lead
    const getLeadTags = useCallback(async (leadId: string): Promise<CRMTag[]> => {
        if (!user) return [];

        try {
            const { data, error: fetchError } = await supabase
                .from("crm_lead_tags")
                .select("tag_id, crm_tags(*)")
                .eq("lead_id", leadId);

            if (fetchError) throw fetchError;

            // Extract the tag objects
            return (data || []).map(row => row.crm_tags as unknown as CRMTag).filter(Boolean);
        } catch (err) {
            console.error("Error fetching lead tags:", err);
            return [];
        }
    }, [user]);

    // Initial fetch
    useEffect(() => {
        fetchTags();
    }, [fetchTags]);

    return {
        tags,
        isLoading,
        error,
        fetchTags,
        createTag,
        updateTag,
        deleteTag,
        addTagToLead,
        removeTagFromLead,
        addTagToLeads,
        getLeadTags
    };
}
