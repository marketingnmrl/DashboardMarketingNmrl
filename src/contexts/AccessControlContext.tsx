"use client";

import { createContext, useContext, ReactNode } from "react";
import { useAccessControl } from "@/hooks/useAccessControl";
import { AccessLevel, OrgUser } from "@/types/access-control";

interface AccessControlContextType {
    currentUser: OrgUser | null;
    accessLevel: AccessLevel | null;
    allowedRoutes: string[];
    isAdmin: boolean;
    isOwner: boolean;
    canAccess: (route: string) => boolean;
    accessLevels: AccessLevel[];
    orgUsers: OrgUser[];
    createAccessLevel: (name: string, description: string, routes: string[], isAdmin: boolean) => Promise<AccessLevel>;
    updateAccessLevel: (id: string, updates: Partial<AccessLevel>) => Promise<void>;
    deleteAccessLevel: (id: string) => Promise<void>;
    createOrgUser: (email: string, name: string, accessLevelId: string) => Promise<OrgUser>;
    updateOrgUser: (id: string, updates: { name?: string; accessLevelId?: string }) => Promise<void>;
    deleteOrgUser: (id: string) => Promise<void>;
    isLoading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

const AccessControlContext = createContext<AccessControlContextType | undefined>(undefined);

export function AccessControlProvider({ children }: { children: ReactNode }) {
    const accessControl = useAccessControl();

    return (
        <AccessControlContext.Provider value={accessControl}>
            {children}
        </AccessControlContext.Provider>
    );
}

export function useAccessControlContext() {
    const context = useContext(AccessControlContext);
    if (context === undefined) {
        throw new Error("useAccessControlContext must be used within an AccessControlProvider");
    }
    return context;
}
