// Types for Stract Campaign Data Integration
// Updated to match user's complete spreadsheet with all metrics

export interface StractCampaignRow {
    date: string; // Format: YYYY-MM-DD
    accountName: string; // Account Name
    campaignName: string; // Campaign Name
    adsetName: string; // Adset Name
    adName: string; // Ad Name

    // Core metrics
    spend: number; // Spend (Cost, Amount Spent)
    impressions: number;
    clicks: number; // Engagement clicks
    cpm: number; // CPM (Cost per 1000 Impressions)
    cpc: number; // CPC (Cost per Click)

    // Conversion metrics
    purchases: number; // Action FB Pixel Purchase (Offsite Conversion)
    fbPixelLeads: number; // Action FB Pixel Lead (Offsite Conversion)
    leads: number; // Action Leads
    purchaseValue: number; // Action Value FB Pixel Purchase (receita/faturamento)
    leadValue: number; // Action Value Leads
    checkouts: number; // Action FB Pixel Initiate Checkout
    purchasePerLandingPageView: number; // Purchase per Landing Page View
    roas: number; // Purchase ROAS

    // Reach & Frequency
    reach: number; // Reach (Estimated)
    frequency: number; // Frequency

    // Click metrics
    linkClicks: number; // Action Link Clicks
    landingPageViews: number; // Action Landing Page View
    landingPageViewPerLinkClick: number; // Landing Page View per Link Click
    ctr: number; // CTR (Clickthrough Rate)

    // Engagement metrics
    pageLikes: number; // Action Page Likes
    pageLikesValue: number; // Action Value Page Likes
    pageEngagement: number; // Action Page Engagement
    postEngagement: number; // Action Post Engagement
    postComments: number; // Action Post Comments
    postReactions: number; // Action Post Reactions
    postShares: number; // Action Post Shares
    conversationsStarted: number; // Action Messaging Conversations Started
    engagementRateRanking: string; // Engagement Rate Ranking

    // Video metrics
    videoViews3s: number; // Action 3s Video Views
    videoViews3sValue: number; // Action Value 3s Video Views
    costPerVideoView3s: number; // Cost Per Action 3s Video Views
    videoPlayActions: number; // Video Play Actions
    videoThruplayWatched: number; // Video Thruplay Watched Actions

    // Quality rankings
    qualityRanking: string; // Quality Ranking
    conversionRateRanking: string; // Conversion Rate Ranking

    // Creative info
    adcreativeName: string; // Adcreative Name
    thumbnailUrl: string; // Thumbnail URL
    thumbnailId: string; // Thumbnail ID
    videoId: string; // Video ID
    videoThumbnailUrl: string; // Video Asset Thumbnail URL
    videoUrl: string; // Video Asset URL
}

// Aggregated metrics for KPIs
export interface StractAggregatedMetrics {
    // Core totals
    totalSpend: number;
    totalImpressions: number;
    totalClicks: number; // Engagement clicks
    totalLinkClicks: number; // Website clicks
    totalLandingPageViews: number;
    totalReach: number;

    // Conversion totals
    totalLeads: number;
    totalFbPixelLeads: number;
    totalPurchases: number;
    totalPurchaseValue: number; // Faturamento
    totalLeadValue: number;
    totalCheckouts: number;

    // Engagement totals
    totalPageLikes: number;
    totalPageEngagement: number;
    totalPostEngagement: number;
    totalPostComments: number;
    totalPostReactions: number;
    totalPostShares: number;
    totalConversationsStarted: number;

    // Video totals
    totalVideoViews3s: number;
    totalVideoThruplayWatched: number;
    totalVideoPlayActions: number;

    // Calculated averages
    avgCpc: number; // Spend / LinkClicks
    avgCpm: number; // (Spend / Impressions) * 1000
    avgCtr: number; // (LinkClicks / Impressions) * 100
    avgCpl: number; // Spend / Leads
    avgRoas: number; // PurchaseValue / Spend
    avgFrequency: number; // Impressions / Reach

    // Calculated rates
    ticketMedio: number; // PurchaseValue / Purchases
    cac: number; // Spend / Purchases
    connectRate: number; // (LandingPageViews / LinkClicks) * 100
    checkoutRate: number; // (Checkouts / LandingPageViews) * 100
    purchaseRate: number; // (Purchases / Checkouts) * 100
    conversionRate: number; // (Purchases / LinkClicks) * 100
    leadConversionRate: number; // (Leads / LinkClicks) * 100

    // Counts
    uniqueCampaigns: number;
    uniqueAdsets: number;
    uniqueAds: number;
    uniqueAccounts: number;

    // Legacy (for compatibility)
    totalResults: number;
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
    purchaseValue: number;
    checkouts: number;
    landingPageViews: number;
    postEngagement: number;
    videoViews3s: number;
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
    purchases: number;
    purchaseValue: number;
    checkouts: number;
    // Calculated
    ctr: number;
    cpc: number;
    cpl: number;
    roas: number;
    conversionRate: number;
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
    if (!value || value === "0" || value === "-" || value === "") return 0;
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
    accountName: ["account name", "conta", "account"],
    campaignName: ["campaign name", "campaign", "nome da campanha", "campanha"],
    adsetName: ["adset name", "adset", "conjunto de anúncios", "conjunto"],
    adName: ["ad name", "ad", "nome do anúncio", "anúncio", "anuncio"],

    // Core metrics
    spend: ["spend", "cost", "amount spent", "gasto", "custo", "investimento"],
    impressions: ["impressions", "impressões", "impressoes"],
    clicks: ["clicks", "cliques"],
    cpm: ["cpm", "cost per 1000 impressions"],
    cpc: ["cpc", "cost per click"],

    // Reach & Frequency
    reach: ["reach", "reach (estimated)", "alcance"],
    frequency: ["frequency", "frequência", "frequencia"],

    // Click metrics
    linkClicks: ["action link clicks", "link clicks", "cliques no link"],
    landingPageViews: ["action landing page view", "landing page views", "lp views"],
    landingPageViewPerLinkClick: ["landing page view per link click"],
    ctr: ["ctr", "clickthrough rate", "taxa de cliques"],

    // Conversion metrics
    purchases: ["action fb pixel purchase", "purchases", "compras", "vendas"],
    purchaseValue: ["action value fb pixel purchase", "purchase value", "valor", "receita", "faturamento"],
    fbPixelLeads: ["action fb pixel lead"],
    leads: ["action leads", "leads"],
    leadValue: ["action value leads", "lead value"],
    checkouts: ["action fb pixel initiate checkout", "checkouts", "initiate checkout"],
    purchasePerLandingPageView: ["purchase per landing page view"],
    roas: ["purchase roas", "roas", "retorno"],

    // Engagement metrics
    pageLikes: ["action page likes", "page likes"],
    pageLikesValue: ["action value page likes"],
    pageEngagement: ["action page engagement", "page engagement"],
    postEngagement: ["action post engagement", "post engagement", "engajamento"],
    postComments: ["action post comments", "comments", "comentários"],
    postReactions: ["action post reactions", "reactions", "reações"],
    postShares: ["action post shares", "shares", "compartilhamentos"],
    conversationsStarted: ["action messaging conversations started", "conversations started", "conversas"],
    engagementRateRanking: ["engagement rate ranking"],

    // Video metrics
    videoViews3s: ["action 3s video views", "3s video views", "video views"],
    videoViews3sValue: ["action value 3s video views"],
    costPerVideoView3s: ["cost per action 3s video views"],
    videoPlayActions: ["video play actions", "video plays"],
    videoThruplayWatched: ["video thruplay watched actions", "thruplay"],

    // Quality rankings
    qualityRanking: ["quality ranking", "qualidade"],
    conversionRateRanking: ["conversion rate ranking"],

    // Creative info
    adcreativeName: ["adcreative name", "creative name"],
    thumbnailUrl: ["thumbnail url"],
    thumbnailId: ["thumbnail id"],
    videoId: ["video id"],
    videoThumbnailUrl: ["video asset thumbnail url"],
    videoUrl: ["video asset url"],
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
