"use client";

import { useEffect, useRef } from "react";
import { useMetrics, PageMetrics } from "@/contexts/MetricsContext";

/**
 * Hook to set page metrics for AI analysis
 * Call this in each page component to provide metrics data
 * Updates automatically when metrics values change
 */
export function usePageMetrics(metrics: PageMetrics) {
    const { setMetrics } = useMetrics();
    const metricsRef = useRef<string>("");

    useEffect(() => {
        // Serialize metrics to compare changes
        const serialized = JSON.stringify(metrics);

        // Only update if metrics actually changed
        if (serialized !== metricsRef.current) {
            metricsRef.current = serialized;
            setMetrics(metrics);
        }
    }, [metrics, setMetrics]);
}
