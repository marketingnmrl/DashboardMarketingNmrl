"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { DateFilterProvider } from "@/contexts/DateFilterContext";
import { Sidebar, Header } from "@/components/layout";
import AIAssistant from "@/components/AIAssistant";

const PUBLIC_ROUTES = ["/login"];

function ProtectedLayoutInner({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    useEffect(() => {
        if (!isLoading) {
            if (!user && !isPublicRoute) {
                router.push("/login");
            } else if (user && isPublicRoute) {
                router.push("/");
            }
        }
    }, [user, isLoading, isPublicRoute, router]);

    // Show loading state
    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-[#F4F4F4]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-[#C2DF0C] rounded-xl flex items-center justify-center animate-pulse">
                        <span className="material-symbols-outlined text-[#19069E] text-[24px]">
                            analytics
                        </span>
                    </div>
                    <p className="text-gray-500 text-sm">Carregando...</p>
                </div>
            </div>
        );
    }

    // Public routes (login) - render without layout and without AI
    if (isPublicRoute) {
        return <>{children}</>;
    }

    // Protected routes - render with full layout and AI assistant
    if (!user) {
        return null; // Will redirect to login
    }

    return (
        <div className="flex h-screen w-full overflow-hidden">
            <Sidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden">
                <Header />
                <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-[#F4F4F4]">
                    {children}
                </div>
            </main>
            <AIAssistant />
        </div>
    );
}

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <DateFilterProvider>
                <ProtectedLayoutInner>{children}</ProtectedLayoutInner>
            </DateFilterProvider>
        </SidebarProvider>
    );
}

