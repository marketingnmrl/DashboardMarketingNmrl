import { NextRequest, NextResponse } from "next/server";
import { StractCampaignRow, parseBrazilianNumber, STRACT_COLUMNS } from "@/types/stract";

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

        // Fetch CSV from Google Sheets
        const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;

        const response = await fetch(csvUrl, {
            headers: {
                "Cache-Control": "no-cache",
            },
        });

        if (!response.ok) {
            throw new Error("Não foi possível acessar a planilha. Verifique se ela está pública.");
        }

        const csvText = await response.text();

        // Parse CSV with proper handling of quoted fields
        const rows = parseCSV(csvText);

        if (rows.length < 2) {
            return NextResponse.json({ data: [], message: "Planilha vazia ou sem dados" });
        }

        // Skip header row and parse data
        const data: StractCampaignRow[] = rows.slice(1)
            .filter(row => row.length >= 10 && row[STRACT_COLUMNS.DATE])
            .map(row => ({
                date: row[STRACT_COLUMNS.DATE] || "",
                spend: parseBrazilianNumber(row[STRACT_COLUMNS.SPEND] || "0"),
                campaignName: row[STRACT_COLUMNS.CAMPAIGN_NAME] || "",
                adsetName: row[STRACT_COLUMNS.ADSET_NAME] || "",
                adName: row[STRACT_COLUMNS.AD_NAME] || "",
                impressions: parseInt(row[STRACT_COLUMNS.IMPRESSIONS] || "0") || 0,
                clicks: parseInt(row[STRACT_COLUMNS.CLICKS] || "0") || 0,
                landingPageViews: parseInt(row[STRACT_COLUMNS.LANDING_PAGE_VIEWS] || "0") || 0,
                leads: parseBrazilianNumber(row[STRACT_COLUMNS.LEADS] || "0"),
                cpc: parseBrazilianNumber(row[STRACT_COLUMNS.CPC] || "0"),
                cpm: parseBrazilianNumber(row[STRACT_COLUMNS.CPM] || "0"),
                ctr: parseBrazilianNumber(row[STRACT_COLUMNS.CTR] || "0"),
                resultRate: parseBrazilianNumber(row[STRACT_COLUMNS.RESULT_RATE] || "0"),
            }))
            .filter(row => row.date && row.date.match(/^\d{4}-\d{2}-\d{2}$/));

        return NextResponse.json({
            data,
            count: data.length,
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
        row.push(current.trim().replace(/^\"|\"$/g, ""));
        rows.push(row);
    }

    return rows;
}
