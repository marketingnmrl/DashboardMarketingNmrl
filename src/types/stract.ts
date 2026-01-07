// Types for Stract Campaign Data Integration

export interface StractCampaignRow {
    date: string; // Format: YYYY-MM-DD
    spend: number;
    campaignName: string;
    adsetName: string;
    adName: string;
    impressions: number;
    clicks: number;
    landingPageViews: number;
    leads: number;
    cpc: number;
    cpm: number;
    ctr: number;
    resultRate: number;
}

// Aggregated metrics for KPIs
export interface StractAggregatedMetrics {
    totalSpend: number;
    totalImpressions: number;
    totalClicks: number;
    totalLandingPageViews: number;
    totalLeads: number;
    avgCpc: number;
    avgCpm: number;
    avgCtr: number;
    avgResultRate: number;
    uniqueCampaigns: number;
    uniqueAdsets: number;
    uniqueAds: number;
}

// Data grouped by date for charts
export interface StractDailyData {
    date: string;
    spend: number;
    impressions: number;
    clicks: number;
    leads: number;
}

// Data grouped by campaign
export interface StractCampaignSummary {
    campaignName: string;
    spend: number;
    impressions: number;
    clicks: number;
    leads: number;
    ctr: number;
    cpc: number;
}

// Dashboard settings stored in Supabase
export interface DashboardSettings {
    id?: string;
    visaoGeralSheetUrl: string | null;
    investimentosSheetUrl?: string | null;
    trafegoSheetUrl?: string | null;
    updatedAt?: string;
}

// Helper to parse Brazilian number format (1.234,56 -> 1234.56)
export function parseBrazilianNumber(value: string): number {
    if (!value || value === "0" || value === "-") return 0;
    // Handle dates that might appear (like 1899-12-30 which is an Excel error)
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return 0;
    // Remove dots (thousands separator) and replace comma with dot
    const cleaned = value.replace(/\./g, "").replace(",", ".");
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
}

// CSV column mapping for Stract format
export const STRACT_COLUMNS = {
    DATE: 0,
    SPEND: 1,
    CAMPAIGN_NAME: 2,
    ADSET_NAME: 3,
    AD_NAME: 4,
    IMPRESSIONS: 5,
    CLICKS: 6,
    LANDING_PAGE_VIEWS: 7,
    LEADS: 8,
    CPC: 9,
    CPM: 10,
    CTR: 11,
    RESULT_RATE: 12,
} as const;
