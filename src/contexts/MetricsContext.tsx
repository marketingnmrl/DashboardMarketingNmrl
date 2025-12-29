"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";

// Types for page metrics
export interface PageMetrics {
    pagina: string;
    descricao: string;
    periodo?: string;
    filtros?: Record<string, string>;
    kpis: Record<string, number | string>;
    dados_adicionais?: Record<string, unknown>;
}

interface MetricsContextType {
    metrics: PageMetrics | null;
    setMetrics: (metrics: PageMetrics) => void;
}

const MetricsContext = createContext<MetricsContextType | undefined>(undefined);

export function MetricsProvider({ children }: { children: ReactNode }) {
    const [metrics, setMetricsState] = useState<PageMetrics | null>(null);

    // Use useCallback to stabilize setMetrics reference
    const setMetrics = useCallback((newMetrics: PageMetrics) => {
        setMetricsState(newMetrics);
    }, []);

    return (
        <MetricsContext.Provider value={{ metrics, setMetrics }}>
            {children}
        </MetricsContext.Provider>
    );
}

export function useMetrics() {
    const context = useContext(MetricsContext);
    if (context === undefined) {
        throw new Error("useMetrics must be used within a MetricsProvider");
    }
    return context;
}
