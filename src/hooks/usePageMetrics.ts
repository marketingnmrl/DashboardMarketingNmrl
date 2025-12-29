"use client";

import { useEffect } from "react";
import { useMetrics, PageMetrics } from "@/contexts/MetricsContext";

/**
 * Hook to set page metrics for AI analysis
 * Call this in each page component to provide metrics data
 */
export function usePageMetrics(metrics: PageMetrics) {
    const { setMetrics } = useMetrics();

    useEffect(() => {
        setMetrics(metrics);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);  // Run only once on mount
}
