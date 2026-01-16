"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { AccessLevel, OrgUser, ALL_ROUTES } from "@/types/access-control";

interface UseAccessControlReturn {
    // Current user's access
    currentUser: OrgUser | null;
    accessLevel: AccessLevel | null;
    allowedRoutes: string[];
    isAdmin: boolean;
    isOwner: boolean;
    canAccess: (route: string) => boolean;

    // All data for management
    accessLevels: AccessLevel[];
    orgUsers: OrgUser[];

    // CRUD operations
    createAccessLevel: (name: string, description: string, routes: string[], isAdmin: boolean) => Promise<AccessLevel>;
    updateAccessLevel: (id: string, updates: Partial<AccessLevel>) => Promise<void>;
    deleteAccessLevel: (id: string) => Promise<void>;

    createOrgUser: (email: string, name: string, accessLevelId: string) => Promise<OrgUser>;
    updateOrgUser: (id: string, updates: { name?: string; accessLevelId?: string }) => Promise<void>;
    deleteOrgUser: (id: string) => Promise<void>;

    // State
    isLoading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

export function useAccessControl(): UseAccessControlReturn {
    const { user } = useAuth();
    const [accessLevels, setAccessLevels] = useState<AccessLevel[]>([]);
    const [orgUsers, setOrgUsers] = useState<OrgUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch all data
    const fetchData = useCallback(async () => {
        if (!user) {
            setAccessLevels([]);
            setOrgUsers([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const supabase = getSupabase();

            // Fetch access levels
            const { data: levelsData, error: levelsError } = await supabase
                .from("access_levels")
                .select("*")
                .order("name");

            if (levelsError) throw levelsError;

            // Fetch org users with access level
            const { data: usersData, error: usersError } = await supabase
                .from("org_users")
                .select(`
                    *,
                    access_level:access_levels(*)
                `)
                .order("name");

            if (usersError) throw usersError;

            // Transform to app types
            const levels: AccessLevel[] = (levelsData || []).map(l => ({
                id: l.id,
                name: l.name,
                description: l.description,
                allowedRoutes: l.allowed_routes || [],
                isAdmin: l.is_admin || false,
                createdAt: l.created_at,
                updatedAt: l.updated_at,
            }));

            const users: OrgUser[] = (usersData || []).map(u => ({
                id: u.id,
                authUserId: u.auth_user_id,
                email: u.email,
                name: u.name,
                accessLevelId: u.access_level_id,
                accessLevel: u.access_level ? {
                    id: u.access_level.id,
                    name: u.access_level.name,
                    description: u.access_level.description,
                    allowedRoutes: u.access_level.allowed_routes || [],
                    isAdmin: u.access_level.is_admin || false,
                    createdAt: u.access_level.created_at,
                    updatedAt: u.access_level.updated_at,
                } : null,
                isOwner: u.is_owner || false,
                createdAt: u.created_at,
                updatedAt: u.updated_at,
            }));

            setAccessLevels(levels);
            setOrgUsers(users);
        } catch (err) {
            console.error("Error fetching access control data:", err);
            setError(err instanceof Error ? err.message : "Erro ao carregar dados");
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Current user's data
    const currentUser = useMemo(() => {
        if (!user) return null;
        return orgUsers.find(u => u.authUserId === user.id || u.email === user.email) || null;
    }, [user, orgUsers]);

    const accessLevel = useMemo(() => {
        return currentUser?.accessLevel || null;
    }, [currentUser]);

    const isAdmin = useMemo(() => {
        return currentUser?.isOwner || accessLevel?.isAdmin || false;
    }, [currentUser, accessLevel]);

    const isOwner = useMemo(() => {
        return currentUser?.isOwner || false;
    }, [currentUser]);

    const allowedRoutes = useMemo(() => {
        if (isAdmin) {
            return ALL_ROUTES.map(r => r.href);
        }
        return accessLevel?.allowedRoutes || [];
    }, [isAdmin, accessLevel]);

    const canAccess = useCallback((route: string): boolean => {
        if (isAdmin) return true;
        if (!accessLevel) return false;

        // Check exact match or if route starts with an allowed route
        return allowedRoutes.some(allowed =>
            route === allowed ||
            route.startsWith(allowed + "/")
        );
    }, [isAdmin, accessLevel, allowedRoutes]);

    // CRUD: Access Levels
    const createAccessLevel = useCallback(async (
        name: string,
        description: string,
        routes: string[],
        isAdminLevel: boolean
    ): Promise<AccessLevel> => {
        const supabase = getSupabase();

        const { data, error } = await supabase
            .from("access_levels")
            .insert({
                name,
                description,
                allowed_routes: routes,
                is_admin: isAdminLevel,
            })
            .select()
            .single();

        if (error) throw error;

        const newLevel: AccessLevel = {
            id: data.id,
            name: data.name,
            description: data.description,
            allowedRoutes: data.allowed_routes || [],
            isAdmin: data.is_admin,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };

        setAccessLevels(prev => [...prev, newLevel]);
        return newLevel;
    }, []);

    const updateAccessLevel = useCallback(async (id: string, updates: Partial<AccessLevel>) => {
        const supabase = getSupabase();

        const dbUpdates: Record<string, unknown> = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.allowedRoutes !== undefined) dbUpdates.allowed_routes = updates.allowedRoutes;
        if (updates.isAdmin !== undefined) dbUpdates.is_admin = updates.isAdmin;

        const { error } = await supabase
            .from("access_levels")
            .update(dbUpdates)
            .eq("id", id);

        if (error) throw error;

        setAccessLevels(prev => prev.map(l =>
            l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l
        ));
    }, []);

    const deleteAccessLevel = useCallback(async (id: string) => {
        const supabase = getSupabase();

        const { error } = await supabase
            .from("access_levels")
            .delete()
            .eq("id", id);

        if (error) throw error;

        setAccessLevels(prev => prev.filter(l => l.id !== id));
    }, []);

    // CRUD: Org Users
    const createOrgUser = useCallback(async (
        email: string,
        name: string,
        accessLevelId: string
    ): Promise<OrgUser> => {
        const supabase = getSupabase();

        // Check if user already exists in auth
        // We'll create org_user entry and link later when they sign in
        const { data, error } = await supabase
            .from("org_users")
            .insert({
                email: email.toLowerCase(),
                name,
                access_level_id: accessLevelId,
                auth_user_id: null, // Will be linked when user signs in
            })
            .select(`
                *,
                access_level:access_levels(*)
            `)
            .single();

        if (error) throw error;

        const newUser: OrgUser = {
            id: data.id,
            authUserId: data.auth_user_id,
            email: data.email,
            name: data.name,
            accessLevelId: data.access_level_id,
            accessLevel: data.access_level ? {
                id: data.access_level.id,
                name: data.access_level.name,
                description: data.access_level.description,
                allowedRoutes: data.access_level.allowed_routes || [],
                isAdmin: data.access_level.is_admin,
                createdAt: data.access_level.created_at,
                updatedAt: data.access_level.updated_at,
            } : null,
            isOwner: false,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };

        setOrgUsers(prev => [...prev, newUser]);
        return newUser;
    }, []);

    const updateOrgUser = useCallback(async (id: string, updates: { name?: string; accessLevelId?: string }) => {
        const supabase = getSupabase();

        const dbUpdates: Record<string, unknown> = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.accessLevelId !== undefined) dbUpdates.access_level_id = updates.accessLevelId;

        const { error } = await supabase
            .from("org_users")
            .update(dbUpdates)
            .eq("id", id);

        if (error) throw error;

        // Refresh to get updated access level
        await fetchData();
    }, [fetchData]);

    const deleteOrgUser = useCallback(async (id: string) => {
        const supabase = getSupabase();

        // Prevent deleting owner
        const userToDelete = orgUsers.find(u => u.id === id);
        if (userToDelete?.isOwner) {
            throw new Error("Não é possível remover o proprietário da conta");
        }

        const { error } = await supabase
            .from("org_users")
            .delete()
            .eq("id", id);

        if (error) throw error;

        setOrgUsers(prev => prev.filter(u => u.id !== id));
    }, [orgUsers]);

    return {
        currentUser,
        accessLevel,
        allowedRoutes,
        isAdmin,
        isOwner,
        canAccess,
        accessLevels,
        orgUsers,
        createAccessLevel,
        updateAccessLevel,
        deleteAccessLevel,
        createOrgUser,
        updateOrgUser,
        deleteOrgUser,
        isLoading,
        error,
        refresh: fetchData,
    };
}
