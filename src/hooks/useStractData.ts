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
    accountName?: string; // Filter by account name (null or undefined = all accounts)
    autoRefresh?: boolean;
    refreshInterval?: number; // in milliseconds
}

interface UseStractDataReturn {
    data: StractCampaignRow[];
    filteredData: StractCampaignRow[];
    metrics: StractAggregatedMetrics;
    dailyData: StractDailyData[];
    campaignSummary: StractCampaignSummary[];
    uniqueAccounts: string[]; // List of unique account names from data
    isLoading: boolean;
    error: string | null;
    dateRange: { start: string; end: string } | null;
    refresh: () => void;
}

export function useStractData(
    sheetUrl: string | null | undefined,
    options: UseStractDataOptions = {}
): UseStractDataReturn {
    const { startDate, endDate, accountName, autoRefresh = false, refreshInterval = 4 * 60 * 60 * 1000 } = options;

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

    // Filter data by date range and account
    const filteredData = useMemo(() => {
        return data.filter(row => {
            if (startDate && row.date < startDate) return false;
            if (endDate && row.date > endDate) return false;
            if (accountName && row.accountName !== accountName) return false;
            return true;
        });
    }, [data, startDate, endDate, accountName]);

    // Extract unique account names from full data (not filtered)
    const uniqueAccounts = useMemo(() => {
        const accounts = [...new Set(data.map(row => row.accountName).filter(Boolean))];
        return accounts.sort();
    }, [data]);

    // Calculate aggregated metrics
    const metrics = useMemo((): StractAggregatedMetrics => {
        if (filteredData.length === 0) {
            return {
                totalSpend: 0,
                totalImpressions: 0,
                totalClicks: 0,
                totalLinkClicks: 0,
                totalLandingPageViews: 0,
                totalReach: 0,
                totalLeads: 0,
                totalFbPixelLeads: 0,
                totalPurchases: 0,
                totalPurchaseValue: 0,
                totalLeadValue: 0,
                totalCheckouts: 0,
                totalPageLikes: 0,
                totalPageEngagement: 0,
                totalPostEngagement: 0,
                totalPostComments: 0,
                totalPostReactions: 0,
                totalPostShares: 0,
                totalConversationsStarted: 0,
                totalVideoViews3s: 0,
                totalVideoThruplayWatched: 0,
                totalVideoPlayActions: 0,
                avgCpc: 0,
                avgCpm: 0,
                avgCtr: 0,
                avgCpl: 0,
                avgRoas: 0,
                avgFrequency: 0,
                ticketMedio: 0,
                cac: 0,
                connectRate: 0,
                checkoutRate: 0,
                purchaseRate: 0,
                conversionRate: 0,
                leadConversionRate: 0,
                uniqueCampaigns: 0,
                uniqueAdsets: 0,
                uniqueAds: 0,
                uniqueAccounts: 0,
                totalResults: 0,
            };
        }

        // Core totals
        const totalSpend = filteredData.reduce((sum, r) => sum + (r.spend || 0), 0);
        const totalImpressions = filteredData.reduce((sum, r) => sum + (r.impressions || 0), 0);
        const totalClicks = filteredData.reduce((sum, r) => sum + (r.clicks || 0), 0);
        const totalLinkClicks = filteredData.reduce((sum, r) => sum + (r.linkClicks || 0), 0);
        const totalLandingPageViews = filteredData.reduce((sum, r) => sum + (r.landingPageViews || 0), 0);
        const totalReach = filteredData.reduce((sum, r) => sum + (r.reach || 0), 0);

        // Conversion totals
        const totalLeads = filteredData.reduce((sum, r) => sum + (r.leads || 0), 0);
        const totalFbPixelLeads = filteredData.reduce((sum, r) => sum + (r.fbPixelLeads || 0), 0);
        const totalPurchases = filteredData.reduce((sum, r) => sum + (r.purchases || 0), 0);
        const totalPurchaseValue = filteredData.reduce((sum, r) => sum + (r.purchaseValue || 0), 0);
        const totalLeadValue = filteredData.reduce((sum, r) => sum + (r.leadValue || 0), 0);
        const totalCheckouts = filteredData.reduce((sum, r) => sum + (r.checkouts || 0), 0);

        // Engagement totals
        const totalPageLikes = filteredData.reduce((sum, r) => sum + (r.pageLikes || 0), 0);
        const totalPageEngagement = filteredData.reduce((sum, r) => sum + (r.pageEngagement || 0), 0);
        const totalPostEngagement = filteredData.reduce((sum, r) => sum + (r.postEngagement || 0), 0);
        const totalPostComments = filteredData.reduce((sum, r) => sum + (r.postComments || 0), 0);
        const totalPostReactions = filteredData.reduce((sum, r) => sum + (r.postReactions || 0), 0);
        const totalPostShares = filteredData.reduce((sum, r) => sum + (r.postShares || 0), 0);
        const totalConversationsStarted = filteredData.reduce((sum, r) => sum + (r.conversationsStarted || 0), 0);

        // Video totals
        const totalVideoViews3s = filteredData.reduce((sum, r) => sum + (r.videoViews3s || 0), 0);
        const totalVideoThruplayWatched = filteredData.reduce((sum, r) => sum + (r.videoThruplayWatched || 0), 0);
        const totalVideoPlayActions = filteredData.reduce((sum, r) => sum + (r.videoPlayActions || 0), 0);

        // Calculated averages
        const avgCpc = totalLinkClicks > 0 ? totalSpend / totalLinkClicks : 0;
        const avgCpm = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;
        const avgCtr = totalImpressions > 0 ? (totalLinkClicks / totalImpressions) * 100 : 0;
        const avgCpl = totalLeads > 0 ? totalSpend / totalLeads : 0;
        const avgRoas = totalSpend > 0 && totalPurchaseValue > 0 ? totalPurchaseValue / totalSpend : 0;
        const avgFrequency = totalReach > 0 ? totalImpressions / totalReach : 0;

        // Calculated rates
        const ticketMedio = totalPurchases > 0 ? totalPurchaseValue / totalPurchases : 0;
        const cac = totalPurchases > 0 ? totalSpend / totalPurchases : 0;
        const connectRate = totalLinkClicks > 0 ? (totalLandingPageViews / totalLinkClicks) * 100 : 0;
        const checkoutRate = totalLandingPageViews > 0 ? (totalCheckouts / totalLandingPageViews) * 100 : 0;
        const purchaseRate = totalCheckouts > 0 ? (totalPurchases / totalCheckouts) * 100 : 0;
        const conversionRate = totalLinkClicks > 0 ? (totalPurchases / totalLinkClicks) * 100 : 0;
        const leadConversionRate = totalLinkClicks > 0 ? (totalLeads / totalLinkClicks) * 100 : 0;

        // Counts
        const uniqueCampaigns = new Set(filteredData.map(r => r.campaignName)).size;
        const uniqueAdsets = new Set(filteredData.map(r => r.adsetName)).size;
        const uniqueAds = new Set(filteredData.map(r => r.adName)).size;
        const uniqueAccounts = new Set(filteredData.map(r => r.accountName)).size;

        return {
            totalSpend,
            totalImpressions,
            totalClicks,
            totalLinkClicks,
            totalLandingPageViews,
            totalReach,
            totalLeads,
            totalFbPixelLeads,
            totalPurchases,
            totalPurchaseValue,
            totalLeadValue,
            totalCheckouts,
            totalPageLikes,
            totalPageEngagement,
            totalPostEngagement,
            totalPostComments,
            totalPostReactions,
            totalPostShares,
            totalConversationsStarted,
            totalVideoViews3s,
            totalVideoThruplayWatched,
            totalVideoPlayActions,
            avgCpc,
            avgCpm,
            avgCtr,
            avgCpl,
            avgRoas,
            avgFrequency,
            ticketMedio,
            cac,
            connectRate,
            checkoutRate,
            purchaseRate,
            conversionRate,
            leadConversionRate,
            uniqueCampaigns,
            uniqueAdsets,
            uniqueAds,
            uniqueAccounts,
            totalResults: totalPurchases, // Legacy compatibility
        };
    }, [filteredData]);

    // Group by date for charts
    const dailyData = useMemo((): StractDailyData[] => {
        const byDate = new Map<string, StractDailyData>();

        filteredData.forEach(row => {
            const existing = byDate.get(row.date);
            if (existing) {
                existing.spend += row.spend || 0;
                existing.impressions += row.impressions || 0;
                existing.clicks += row.clicks || 0;
                existing.linkClicks += row.linkClicks || 0;
                existing.leads += row.leads || 0;
                existing.reach += row.reach || 0;
                existing.purchases += row.purchases || 0;
                existing.purchaseValue += row.purchaseValue || 0;
                existing.checkouts += row.checkouts || 0;
                existing.landingPageViews += row.landingPageViews || 0;
                existing.postEngagement += row.postEngagement || 0;
                existing.videoViews3s += row.videoViews3s || 0;
            } else {
                byDate.set(row.date, {
                    date: row.date,
                    spend: row.spend || 0,
                    impressions: row.impressions || 0,
                    clicks: row.clicks || 0,
                    linkClicks: row.linkClicks || 0,
                    leads: row.leads || 0,
                    reach: row.reach || 0,
                    purchases: row.purchases || 0,
                    purchaseValue: row.purchaseValue || 0,
                    checkouts: row.checkouts || 0,
                    landingPageViews: row.landingPageViews || 0,
                    postEngagement: row.postEngagement || 0,
                    videoViews3s: row.videoViews3s || 0,
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
                existing.spend += row.spend || 0;
                existing.impressions += row.impressions || 0;
                existing.clicks += row.clicks || 0;
                existing.linkClicks += row.linkClicks || 0;
                existing.leads += row.leads || 0;
                existing.reach += row.reach || 0;
                existing.purchases += row.purchases || 0;
                existing.purchaseValue += row.purchaseValue || 0;
                existing.checkouts += row.checkouts || 0;
            } else {
                byCampaign.set(row.campaignName, {
                    campaignName: row.campaignName,
                    spend: row.spend || 0,
                    impressions: row.impressions || 0,
                    clicks: row.clicks || 0,
                    linkClicks: row.linkClicks || 0,
                    leads: row.leads || 0,
                    reach: row.reach || 0,
                    purchases: row.purchases || 0,
                    purchaseValue: row.purchaseValue || 0,
                    checkouts: row.checkouts || 0,
                    ctr: 0,
                    cpc: 0,
                    cpl: 0,
                    roas: 0,
                    conversionRate: 0,
                });
            }
        });

        // Calculate metrics for each campaign
        return Array.from(byCampaign.values())
            .map(c => ({
                ...c,
                ctr: c.impressions > 0 ? (c.linkClicks / c.impressions) * 100 : 0,
                cpc: c.linkClicks > 0 ? c.spend / c.linkClicks : 0,
                cpl: c.leads > 0 ? c.spend / c.leads : 0,
                roas: c.spend > 0 ? c.purchaseValue / c.spend : 0,
                conversionRate: c.linkClicks > 0 ? (c.purchases / c.linkClicks) * 100 : 0,
            }))
            .sort((a, b) => b.spend - a.spend);
    }, [filteredData]);

    return {
        data,
        filteredData,
        metrics,
        dailyData,
        campaignSummary,
        uniqueAccounts,
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
