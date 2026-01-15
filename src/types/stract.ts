// Types for Stract Campaign Data Integration
// Updated to match user's actual spreadsheet columns

export interface StractCampaignRow {
    date: string; // Format: YYYY-MM-DD
    campaignName: string;
    adName: string;
    spend: number;
    impressions: number;
    clicks: number; // Engagement clicks
    linkClicks: number; // Action Link Clicks - clicks to website
    leads: number; // Action Leads
    reach: number; // Reach (Estimated)
    landingPageViews: number; // Action Landing Page View
    results: number; // Results/Conversions
    roas: number; // Purchase ROAS
    // E-commerce fields
    purchases: number; // Action FB Pixel Purchase
    purchaseValue: number; // Action Value FB Pixel Purchase (receita)
    checkouts: number; // Action Initiate Checkout FB Pixel
}

// Aggregated metrics for KPIs
export interface StractAggregatedMetrics {
    totalSpend: number;
    totalImpressions: number;
    totalClicks: number; // Engagement clicks
    totalLinkClicks: number; // Website clicks
    totalLandingPageViews: number;
    totalLeads: number;
    totalReach: number;
    totalResults: number;
    // New purchase/checkout metrics
    totalPurchases: number; // Compras
    totalPurchaseValue: number; // Valor Gerado (receita)
    totalCheckouts: number; // Checkouts iniciados
    // Calculated averages
    avgCpc: number; // Calculated: Spend / LinkClicks
    avgCpm: number; // Calculated: (Spend / Impressions) * 1000
    avgCtr: number; // Calculated: (LinkClicks / Impressions) * 100
    avgCpl: number; // Calculated: Spend / Leads
    avgRoas: number;
    // New calculated metrics
    ticketMedio: number; // Calculated: PurchaseValue / Purchases
    cac: number; // Calculated: Spend / Purchases
    connectRate: number; // Calculated: (LinkClicks / Impressions) * 100
    checkoutRate: number; // Calculated: (Checkouts / LinkClicks) * 100
    purchaseRate: number; // Calculated: (Purchases / Checkouts) * 100
    conversionRate: number; // Calculated: (Purchases / LinkClicks) * 100
    uniqueCampaigns: number;
    uniqueAds: number;
}

// Data grouped by date for charts
export interface StractDailyData {
    date: string;
    spend: number;
    impressions: number;
    clicks: number;
    linkClicks: number;
    leads: number;
    reach: number;
    purchases: number;
    purchaseValue: number; // Faturamento
}

// Data grouped by campaign
export interface StractCampaignSummary {
    campaignName: string;
    spend: number;
    impressions: number;
    clicks: number;
    linkClicks: number;
    leads: number;
    reach: number;
    results: number;
    ctr: number; // Calculated
    cpc: number; // Calculated
    cpl: number; // Calculated
}

// Dashboard settings stored in Supabase
export interface DashboardSettings {
    id?: string;
    visaoGeralSheetUrl: string | null;
    investimentosSheetUrl?: string | null;
    trafegoSheetUrl?: string | null;
    hiddenMenuItems?: string[]; // Array of href paths to hide from sidebar
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

// Column name mapping - maps various possible header names to our fields
// This allows flexibility in column naming
export const COLUMN_MAPPINGS: Record<string, string[]> = {
    date: ["date", "data"],
    campaignName: ["campaign name", "campaign", "nome da campanha", "campanha"],
    adName: ["ad name", "ad", "nome do anúncio", "anúncio", "anuncio"],
    spend: ["spend", "cost", "amount spent", "gasto", "custo", "investimento"],
    impressions: ["impressions", "impressões", "impressoes"],
    clicks: ["clicks", "cliques"],
    linkClicks: ["action link clicks", "link clicks", "cliques no link", "outbound clicks"],
    leads: ["action leads", "leads", "lead"],
    reach: ["reach", "reach (estimated)", "alcance"],
    landingPageViews: ["action landing page view", "landing page views", "lp views", "visualizações da lp"],
    results: ["results", "resultados", "conversions", "conversões"],
    roas: ["purchase roas", "roas", "retorno"],
    // New e-commerce columns
    purchases: ["action fb pixel purchase", "purchases", "compras", "purchase", "vendas"],
    purchaseValue: ["action value fb pixel", "action value fb pixel purchase", "purchase value", "valor", "receita", "valor gerado", "faturamento"],
    checkouts: ["action initiate checkout fb pixel", "checkouts", "checkout", "initiate checkout"],
};

// Find column index by matching header name
export function findColumnIndex(headers: string[], fieldName: string): number {
    const possibleNames = COLUMN_MAPPINGS[fieldName] || [fieldName];
    const headerLower = headers.map(h => h.toLowerCase().trim());

    for (const name of possibleNames) {
        // Try exact match first
        const exactIndex = headerLower.indexOf(name.toLowerCase());
        if (exactIndex !== -1) return exactIndex;

        // Try partial match (header contains the name)
        const partialIndex = headerLower.findIndex(h => h.includes(name.toLowerCase()));
        if (partialIndex !== -1) return partialIndex;
    }

    return -1; // Not found
}
