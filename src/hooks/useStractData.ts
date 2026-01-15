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
                totalLinkClicks: 0,
                totalLandingPageViews: 0,
                totalLeads: 0,
                totalReach: 0,
                totalResults: 0,
                totalPurchases: 0,
                totalPurchaseValue: 0,
                totalCheckouts: 0,
                avgCpc: 0,
                avgCpm: 0,
                avgCtr: 0,
                avgCpl: 0,
                avgRoas: 0,
                ticketMedio: 0,
                cac: 0,
                connectRate: 0,
                checkoutRate: 0,
                purchaseRate: 0,
                conversionRate: 0,
                uniqueCampaigns: 0,
                uniqueAds: 0,
            };
        }

        const totalSpend = filteredData.reduce((sum, r) => sum + r.spend, 0);
        const totalImpressions = filteredData.reduce((sum, r) => sum + r.impressions, 0);
        const totalClicks = filteredData.reduce((sum, r) => sum + r.clicks, 0);
        const totalLinkClicks = filteredData.reduce((sum, r) => sum + r.linkClicks, 0);
        const totalLandingPageViews = filteredData.reduce((sum, r) => sum + r.landingPageViews, 0);
        const totalLeads = filteredData.reduce((sum, r) => sum + r.leads, 0);
        const totalReach = filteredData.reduce((sum, r) => sum + r.reach, 0);
        const totalResults = filteredData.reduce((sum, r) => sum + r.results, 0);

        // New e-commerce totals
        const totalPurchases = filteredData.reduce((sum, r) => sum + (r.purchases || 0), 0);
        const totalPurchaseValue = filteredData.reduce((sum, r) => sum + (r.purchaseValue || 0), 0);
        const totalCheckouts = filteredData.reduce((sum, r) => sum + (r.checkouts || 0), 0);

        // Calculate averages based on totals (use LinkClicks for CPC/CTR as it's more relevant)
        const avgCpc = totalLinkClicks > 0 ? totalSpend / totalLinkClicks : 0;
        const avgCpm = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;
        const avgCtr = totalImpressions > 0 ? (totalLinkClicks / totalImpressions) * 100 : 0;
        const avgCpl = totalLeads > 0 ? totalSpend / totalLeads : 0;

        // ROAS: Calculate from purchaseValue if available, otherwise use average from rows
        const avgRoas = totalSpend > 0 && totalPurchaseValue > 0
            ? totalPurchaseValue / totalSpend
            : 0;

        // New calculated metrics
        const ticketMedio = totalPurchases > 0 ? totalPurchaseValue / totalPurchases : 0;
        const cac = totalPurchases > 0 ? totalSpend / totalPurchases : 0;
        const connectRate = totalImpressions > 0 ? (totalLinkClicks / totalImpressions) * 100 : 0;
        const checkoutRate = totalLinkClicks > 0 ? (totalCheckouts / totalLinkClicks) * 100 : 0;
        const purchaseRate = totalCheckouts > 0 ? (totalPurchases / totalCheckouts) * 100 : 0;
        const conversionRate = totalLinkClicks > 0 ? (totalPurchases / totalLinkClicks) * 100 : 0;

        const uniqueCampaigns = new Set(filteredData.map(r => r.campaignName)).size;
        const uniqueAds = new Set(filteredData.map(r => r.adName)).size;

        return {
            totalSpend,
            totalImpressions,
            totalClicks,
            totalLinkClicks,
            totalLandingPageViews,
            totalLeads,
            totalReach,
            totalResults,
            totalPurchases,
            totalPurchaseValue,
            totalCheckouts,
            avgCpc,
            avgCpm,
            avgCtr,
            avgCpl,
            avgRoas,
            ticketMedio,
            cac,
            connectRate,
            checkoutRate,
            purchaseRate,
            conversionRate,
            uniqueCampaigns,
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
                existing.linkClicks += row.linkClicks;
                existing.leads += row.leads;
                existing.reach += row.reach;
                existing.purchases += row.purchases;
                existing.purchaseValue += row.purchaseValue;
            } else {
                byDate.set(row.date, {
                    date: row.date,
                    spend: row.spend,
                    impressions: row.impressions,
                    clicks: row.clicks,
                    linkClicks: row.linkClicks,
                    leads: row.leads,
                    reach: row.reach,
                    purchases: row.purchases,
                    purchaseValue: row.purchaseValue,
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
                existing.linkClicks += row.linkClicks;
                existing.leads += row.leads;
                existing.reach += row.reach;
                existing.results += row.results;
            } else {
                byCampaign.set(row.campaignName, {
                    campaignName: row.campaignName,
                    spend: row.spend,
                    impressions: row.impressions,
                    clicks: row.clicks,
                    linkClicks: row.linkClicks,
                    leads: row.leads,
                    reach: row.reach,
                    results: row.results,
                    ctr: 0,
                    cpc: 0,
                    cpl: 0,
                });
            }
        });

        // Calculate CTR, CPC, CPL for each campaign
        return Array.from(byCampaign.values())
            .map(c => ({
                ...c,
                ctr: c.impressions > 0 ? (c.linkClicks / c.impressions) * 100 : 0,
                cpc: c.linkClicks > 0 ? c.spend / c.linkClicks : 0,
                cpl: c.leads > 0 ? c.spend / c.leads : 0,
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

// Date preset helpers (kept for backwards compatibility)
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
