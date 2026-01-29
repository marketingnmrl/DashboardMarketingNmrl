import { NextRequest, NextResponse } from "next/server";
import { StractCampaignRow, parseBrazilianNumber, findColumnIndex } from "@/types/stract";

// API route to fetch and parse Stract data from Google Sheets
// The sheet must be "Published to the web" or shared publicly

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const sheetsUrl = searchParams.get("url");

    if (!sheetsUrl) {
        return NextResponse.json(
            { error: "URL da planilha não fornecida" },
            { status: 400 }
        );
    }

    try {
        // Extract sheet ID from URL
        const match = sheetsUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (!match) {
            return NextResponse.json(
                { error: "URL da planilha inválida" },
                { status: 400 }
            );
        }

        const sheetId = match[1];

        // Also try to get gid (sheet tab ID) from URL if present
        const gidMatch = sheetsUrl.match(/gid=(\d+)/);
        const gid = gidMatch ? gidMatch[1] : "0";

        console.log("[Stract API] Sheet ID:", sheetId, "GID:", gid);

        // Try multiple endpoints for better reliability
        const endpoints = [
            // Method 1: Direct export (most common)
            `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`,
            // Method 2: gviz/tq query endpoint
            `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`,
            // Method 3: pub endpoint (for published sheets)
            `https://docs.google.com/spreadsheets/d/e/${sheetId}/pub?output=csv&gid=${gid}`,
        ];

        let response: Response | null = null;
        let lastError = "";

        for (const csvUrl of endpoints) {
            console.log("[Stract API] Trying:", csvUrl);

            try {
                response = await fetch(csvUrl, {
                    method: "GET",
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                        "Accept": "text/csv,text/plain,*/*",
                    },
                    redirect: "follow",
                });

                console.log("[Stract API] Response:", response.status);

                if (response.ok) {
                    break; // Success!
                }

                lastError = `Status ${response.status}`;
            } catch (fetchErr) {
                lastError = fetchErr instanceof Error ? fetchErr.message : "Fetch failed";
                console.error("[Stract API] Fetch error:", lastError);
            }
        }

        if (!response || !response.ok) {
            throw new Error(`Não foi possível acessar a planilha. ${lastError}. Verifique se ela está publicada na web (Arquivo > Compartilhar > Publicar na Web).`);
        }

        const csvText = await response.text();

        // Parse CSV with proper handling of quoted fields
        const rows = parseCSV(csvText);

        if (rows.length < 2) {
            return NextResponse.json({ data: [], message: "Planilha vazia ou sem dados" });
        }

        // Get headers from first row and find column indices dynamically
        const headers = rows[0];
        const columnIndices = {
            // Identification
            date: findColumnIndex(headers, "date"),
            accountName: findColumnIndex(headers, "accountName"),
            campaignName: findColumnIndex(headers, "campaignName"),
            adsetName: findColumnIndex(headers, "adsetName"),
            adName: findColumnIndex(headers, "adName"),

            // Core metrics
            spend: findColumnIndex(headers, "spend"),
            impressions: findColumnIndex(headers, "impressions"),
            clicks: findColumnIndex(headers, "clicks"),
            cpm: findColumnIndex(headers, "cpm"),
            cpc: findColumnIndex(headers, "cpc"),

            // Reach & Frequency
            reach: findColumnIndex(headers, "reach"),
            frequency: findColumnIndex(headers, "frequency"),

            // Click metrics
            linkClicks: findColumnIndex(headers, "linkClicks"),
            landingPageViews: findColumnIndex(headers, "landingPageViews"),
            landingPageViewPerLinkClick: findColumnIndex(headers, "landingPageViewPerLinkClick"),
            ctr: findColumnIndex(headers, "ctr"),

            // Conversion metrics
            purchases: findColumnIndex(headers, "purchases"),
            purchaseValue: findColumnIndex(headers, "purchaseValue"),
            fbPixelLeads: findColumnIndex(headers, "fbPixelLeads"),
            leads: findColumnIndex(headers, "leads"),
            leadValue: findColumnIndex(headers, "leadValue"),
            checkouts: findColumnIndex(headers, "checkouts"),
            purchasePerLandingPageView: findColumnIndex(headers, "purchasePerLandingPageView"),
            roas: findColumnIndex(headers, "roas"),

            // Engagement metrics
            pageLikes: findColumnIndex(headers, "pageLikes"),
            pageLikesValue: findColumnIndex(headers, "pageLikesValue"),
            pageEngagement: findColumnIndex(headers, "pageEngagement"),
            postEngagement: findColumnIndex(headers, "postEngagement"),
            postComments: findColumnIndex(headers, "postComments"),
            postReactions: findColumnIndex(headers, "postReactions"),
            postShares: findColumnIndex(headers, "postShares"),
            conversationsStarted: findColumnIndex(headers, "conversationsStarted"),
            engagementRateRanking: findColumnIndex(headers, "engagementRateRanking"),

            // Video metrics
            videoViews3s: findColumnIndex(headers, "videoViews3s"),
            videoViews3sValue: findColumnIndex(headers, "videoViews3sValue"),
            costPerVideoView3s: findColumnIndex(headers, "costPerVideoView3s"),
            videoPlayActions: findColumnIndex(headers, "videoPlayActions"),
            videoThruplayWatched: findColumnIndex(headers, "videoThruplayWatched"),

            // Quality rankings
            qualityRanking: findColumnIndex(headers, "qualityRanking"),
            conversionRateRanking: findColumnIndex(headers, "conversionRateRanking"),

            // Creative info
            adcreativeName: findColumnIndex(headers, "adcreativeName"),
            thumbnailUrl: findColumnIndex(headers, "thumbnailUrl"),
            thumbnailId: findColumnIndex(headers, "thumbnailId"),
            videoId: findColumnIndex(headers, "videoId"),
            videoThumbnailUrl: findColumnIndex(headers, "videoThumbnailUrl"),
            videoUrl: findColumnIndex(headers, "videoUrl"),
        };

        // Validate required columns
        if (columnIndices.date === -1) {
            return NextResponse.json(
                { error: "Coluna 'Date' não encontrada na planilha" },
                { status: 400 }
            );
        }

        // Parse data rows
        const data: StractCampaignRow[] = rows.slice(1)
            .filter(row => row.length > 1 && getCell(row, columnIndices.date))
            .map(row => ({
                // Identification
                date: getCell(row, columnIndices.date),
                accountName: getCell(row, columnIndices.accountName),
                campaignName: getCell(row, columnIndices.campaignName),
                adsetName: getCell(row, columnIndices.adsetName),
                adName: getCell(row, columnIndices.adName),

                // Core metrics
                spend: parseBrazilianNumber(getCell(row, columnIndices.spend)),
                impressions: parseIntSafe(getCell(row, columnIndices.impressions)),
                clicks: parseIntSafe(getCell(row, columnIndices.clicks)),
                cpm: parseBrazilianNumber(getCell(row, columnIndices.cpm)),
                cpc: parseBrazilianNumber(getCell(row, columnIndices.cpc)),

                // Reach & Frequency
                reach: parseIntSafe(getCell(row, columnIndices.reach)),
                frequency: parseBrazilianNumber(getCell(row, columnIndices.frequency)),

                // Click metrics
                linkClicks: parseIntSafe(getCell(row, columnIndices.linkClicks)),
                landingPageViews: parseIntSafe(getCell(row, columnIndices.landingPageViews)),
                landingPageViewPerLinkClick: parseBrazilianNumber(getCell(row, columnIndices.landingPageViewPerLinkClick)),
                ctr: parseBrazilianNumber(getCell(row, columnIndices.ctr)),

                // Conversion metrics
                purchases: parseIntSafe(getCell(row, columnIndices.purchases)),
                purchaseValue: parseBrazilianNumber(getCell(row, columnIndices.purchaseValue)),
                fbPixelLeads: parseIntSafe(getCell(row, columnIndices.fbPixelLeads)),
                leads: parseIntSafe(getCell(row, columnIndices.leads)),
                leadValue: parseBrazilianNumber(getCell(row, columnIndices.leadValue)),
                checkouts: parseIntSafe(getCell(row, columnIndices.checkouts)),
                purchasePerLandingPageView: parseBrazilianNumber(getCell(row, columnIndices.purchasePerLandingPageView)),
                roas: parseBrazilianNumber(getCell(row, columnIndices.roas)),

                // Engagement metrics
                pageLikes: parseIntSafe(getCell(row, columnIndices.pageLikes)),
                pageLikesValue: parseBrazilianNumber(getCell(row, columnIndices.pageLikesValue)),
                pageEngagement: parseIntSafe(getCell(row, columnIndices.pageEngagement)),
                postEngagement: parseIntSafe(getCell(row, columnIndices.postEngagement)),
                postComments: parseIntSafe(getCell(row, columnIndices.postComments)),
                postReactions: parseIntSafe(getCell(row, columnIndices.postReactions)),
                postShares: parseIntSafe(getCell(row, columnIndices.postShares)),
                conversationsStarted: parseIntSafe(getCell(row, columnIndices.conversationsStarted)),
                engagementRateRanking: getCell(row, columnIndices.engagementRateRanking),

                // Video metrics
                videoViews3s: parseIntSafe(getCell(row, columnIndices.videoViews3s)),
                videoViews3sValue: parseBrazilianNumber(getCell(row, columnIndices.videoViews3sValue)),
                costPerVideoView3s: parseBrazilianNumber(getCell(row, columnIndices.costPerVideoView3s)),
                videoPlayActions: parseIntSafe(getCell(row, columnIndices.videoPlayActions)),
                videoThruplayWatched: parseIntSafe(getCell(row, columnIndices.videoThruplayWatched)),

                // Quality rankings
                qualityRanking: getCell(row, columnIndices.qualityRanking),
                conversionRateRanking: getCell(row, columnIndices.conversionRateRanking),

                // Creative info
                adcreativeName: getCell(row, columnIndices.adcreativeName),
                thumbnailUrl: getCell(row, columnIndices.thumbnailUrl),
                thumbnailId: getCell(row, columnIndices.thumbnailId),
                videoId: getCell(row, columnIndices.videoId),
                videoThumbnailUrl: getCell(row, columnIndices.videoThumbnailUrl),
                videoUrl: getCell(row, columnIndices.videoUrl),
            }))
            .filter(row => row.date && row.date.match(/^\d{4}-\d{2}-\d{2}$/));

        // Sort by date descending (most recent first)
        data.sort((a, b) => b.date.localeCompare(a.date));

        return NextResponse.json({
            data,
            count: data.length,
            columnsFound: Object.entries(columnIndices)
                .filter(([, idx]) => idx !== -1)
                .map(([name]) => name),
            dateRange: data.length > 0 ? {
                start: data[data.length - 1].date,
                end: data[0].date,
            } : null
        });
    } catch (error) {
        console.error("Stract API error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Erro ao buscar dados" },
            { status: 500 }
        );
    }
}

// Helper to safely get cell value
function getCell(row: string[], index: number): string {
    if (index === -1 || index >= row.length) return "";
    return row[index] || "";
}

// Helper to parse integer safely
function parseIntSafe(value: string): number {
    if (!value || value === "-") return 0;
    // Handle Brazilian format with dots as thousands separator
    const cleaned = value.replace(/\./g, "").replace(",", ".");
    const num = parseInt(cleaned);
    return isNaN(num) ? 0 : num;
}

// Parse CSV handling quoted fields properly
function parseCSV(csvText: string): string[][] {
    const rows: string[][] = [];
    const lines = csvText.split("\n");

    for (const line of lines) {
        if (!line.trim()) continue;

        const row: string[] = [];
        let current = "";
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    // Escaped quote
                    current += '"';
                    i++;
                } else {
                    // Toggle quote mode
                    inQuotes = !inQuotes;
                }
            } else if (char === "," && !inQuotes) {
                row.push(current.trim());
                current = "";
            } else {
                current += char;
            }
        }
        // Push last field
        row.push(current.trim().replace(/^"|"$/g, ""));
        rows.push(row);
    }

    return rows;
}
