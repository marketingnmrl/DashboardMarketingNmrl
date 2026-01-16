"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAccessControlContext } from "@/contexts/AccessControlContext";

interface RouteGuardProps {
    children: React.ReactNode;
}

/**
 * RouteGuard component that protects routes based on user access level
 * Redirects to home if user doesn't have access
 */
export function RouteGuard({ children }: RouteGuardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { canAccess, isLoading, currentUser, isAdmin } = useAccessControlContext();

    useEffect(() => {
        // Skip during loading
        if (isLoading) return;

        // Always allow these routes
        const publicRoutes = ["/login", "/signup", "/forgot-password"];
        if (publicRoutes.includes(pathname)) return;

        // If user is not in org_users yet, allow access (first-time setup)
        // This allows the owner to set things up
        if (!currentUser) return;

        // Admins can access everything
        if (isAdmin) return;

        // Check if user can access this route
        if (!canAccess(pathname)) {
            // Redirect to home or first allowed route
            router.push("/");
        }
    }, [pathname, canAccess, isLoading, currentUser, isAdmin, router]);

    // Show nothing while checking (could add loading spinner)
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-[#19069E] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-gray-500 text-sm">Verificando permissões...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
