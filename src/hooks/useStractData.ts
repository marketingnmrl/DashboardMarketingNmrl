"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
    StractCampaignRow,
    StractAggregatedMetrics,
    StractDailyData,
    StractCampaignSummary
} from "@/types/stract";

interface UseStractDataOptions {
    startDate?: string;
    endDate?: string;
    autoRefresh?: boolean;
    refreshInterval?: number; // in milliseconds
}

interface UseStractDataReturn {
    data: StractCampaignRow[];
    filteredData: StractCampaignRow[];
    metrics: StractAggregatedMetrics;
    dailyData: StractDailyData[];
    campaignSummary: StractCampaignSummary[];
    isLoading: boolean;
    error: string | null;
    dateRange: { start: string; end: string } | null;
    refresh: () => void;
}

export function useStractData(
    sheetUrl: string | null | undefined,
    options: UseStractDataOptions = {}
): UseStractDataReturn {
    const { startDate, endDate, autoRefresh = false, refreshInterval = 4 * 60 * 60 * 1000 } = options;

    const [data, setData] = useState<StractCampaignRow[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);

    const fetchData = useCallback(async () => {
        if (!sheetUrl) {
            setData([]);
            setDateRange(null);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch(
                `/api/sheets/stract?url=${encodeURIComponent(sheetUrl)}&t=${Date.now()}`
            );

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Falha ao buscar dados");
            }

            const result = await res.json();
            setData(result.data || []);
            setDateRange(result.dateRange || null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro desconhecido");
            setData([]);
        } finally {
            setIsLoading(false);
        }
    }, [sheetUrl]);

    // Initial fetch
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Auto-refresh
    useEffect(() => {
        if (!autoRefresh || !sheetUrl) return;

        const interval = setInterval(fetchData, refreshInterval);
        return () => clearInterval(interval);
    }, [autoRefresh, refreshInterval, fetchData, sheetUrl]);

    // Filter data by date range
    const filteredData = useMemo(() => {
        return data.filter(row => {
            if (startDate && row.date < startDate) return false;
            if (endDate && row.date > endDate) return false;
            return true;
        });
    }, [data, startDate, endDate]);

    // Calculate aggregated metrics
    const metrics = useMemo((): StractAggregatedMetrics => {
        if (filteredData.length === 0) {
            return {
                totalSpend: 0,
                totalImpressions: 0,
                totalClicks: 0,
                totalLandingPageViews: 0,
                totalLeads: 0,
                avgCpc: 0,
                avgCpm: 0,
                avgCtr: 0,
                avgResultRate: 0,
                uniqueCampaigns: 0,
                uniqueAdsets: 0,
                uniqueAds: 0,
            };
        }

        const totalSpend = filteredData.reduce((sum, r) => sum + r.spend, 0);
        const totalImpressions = filteredData.reduce((sum, r) => sum + r.impressions, 0);
        const totalClicks = filteredData.reduce((sum, r) => sum + r.clicks, 0);
        const totalLandingPageViews = filteredData.reduce((sum, r) => sum + r.landingPageViews, 0);
        const totalLeads = filteredData.reduce((sum, r) => sum + r.leads, 0);

        // Calculate averages based on totals (not row averages)
        const avgCpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
        const avgCpm = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;
        const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
        const avgResultRate = filteredData.reduce((sum, r) => sum + r.resultRate, 0) / filteredData.length;

        const uniqueCampaigns = new Set(filteredData.map(r => r.campaignName)).size;
        const uniqueAdsets = new Set(filteredData.map(r => r.adsetName)).size;
        const uniqueAds = new Set(filteredData.map(r => r.adName)).size;

        return {
            totalSpend,
            totalImpressions,
            totalClicks,
            totalLandingPageViews,
            totalLeads,
            avgCpc,
            avgCpm,
            avgCtr,
            avgResultRate,
            uniqueCampaigns,
            uniqueAdsets,
            uniqueAds,
        };
    }, [filteredData]);

    // Group by date for charts
    const dailyData = useMemo((): StractDailyData[] => {
        const byDate = new Map<string, StractDailyData>();

        filteredData.forEach(row => {
            const existing = byDate.get(row.date);
            if (existing) {
                existing.spend += row.spend;
                existing.impressions += row.impressions;
                existing.clicks += row.clicks;
                existing.leads += row.leads;
            } else {
                byDate.set(row.date, {
                    date: row.date,
                    spend: row.spend,
                    impressions: row.impressions,
                    clicks: row.clicks,
                    leads: row.leads,
                });
            }
        });

        return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
    }, [filteredData]);

    // Group by campaign
    const campaignSummary = useMemo((): StractCampaignSummary[] => {
        const byCampaign = new Map<string, StractCampaignSummary>();

        filteredData.forEach(row => {
            const existing = byCampaign.get(row.campaignName);
            if (existing) {
                existing.spend += row.spend;
                existing.impressions += row.impressions;
                existing.clicks += row.clicks;
                existing.leads += row.leads;
            } else {
                byCampaign.set(row.campaignName, {
                    campaignName: row.campaignName,
                    spend: row.spend,
                    impressions: row.impressions,
                    clicks: row.clicks,
                    leads: row.leads,
                    ctr: 0,
                    cpc: 0,
                });
            }
        });

        // Calculate CTR and CPC for each campaign
        return Array.from(byCampaign.values())
            .map(c => ({
                ...c,
                ctr: c.impressions > 0 ? (c.clicks / c.impressions) * 100 : 0,
                cpc: c.clicks > 0 ? c.spend / c.clicks : 0,
            }))
            .sort((a, b) => b.spend - a.spend);
    }, [filteredData]);

    return {
        data,
        filteredData,
        metrics,
        dailyData,
        campaignSummary,
        isLoading,
        error,
        dateRange,
        refresh: fetchData,
    };
}

// Date preset helpers
export type DatePreset = "today" | "yesterday" | "last7days" | "last30days" | "thisMonth" | "lastMonth" | "custom";

export function getDateRangeFromPreset(preset: DatePreset): { startDate: string; endDate: string } {
    const today = new Date();
    const formatDate = (d: Date) => d.toISOString().split("T")[0];

    switch (preset) {
        case "today":
            return { startDate: formatDate(today), endDate: formatDate(today) };

        case "yesterday": {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            return { startDate: formatDate(yesterday), endDate: formatDate(yesterday) };
        }

        case "last7days": {
            const start = new Date(today);
            start.setDate(start.getDate() - 6);
            return { startDate: formatDate(start), endDate: formatDate(today) };
        }

        case "last30days": {
            const start = new Date(today);
            start.setDate(start.getDate() - 29);
            return { startDate: formatDate(start), endDate: formatDate(today) };
        }

        case "thisMonth": {
            const start = new Date(today.getFullYear(), today.getMonth(), 1);
            return { startDate: formatDate(start), endDate: formatDate(today) };
        }

        case "lastMonth": {
            const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const end = new Date(today.getFullYear(), today.getMonth(), 0);
            return { startDate: formatDate(start), endDate: formatDate(end) };
        }

        default:
            return { startDate: formatDate(today), endDate: formatDate(today) };
    }
}

export const DATE_PRESET_LABELS: Record<DatePreset, string> = {
    today: "Hoje",
    yesterday: "Ontem",
    last7days: "Últimos 7 dias",
    last30days: "Últimos 30 dias",
    thisMonth: "Este mês",
    lastMonth: "Mês passado",
    custom: "Personalizado",
};
