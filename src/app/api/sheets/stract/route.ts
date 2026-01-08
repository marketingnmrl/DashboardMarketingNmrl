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

        // Get headers from first row and find column indices dynamically
        const headers = rows[0];
        const columnIndices = {
            date: findColumnIndex(headers, "date"),
            campaignName: findColumnIndex(headers, "campaignName"),
            adName: findColumnIndex(headers, "adName"),
            spend: findColumnIndex(headers, "spend"),
            impressions: findColumnIndex(headers, "impressions"),
            clicks: findColumnIndex(headers, "clicks"),
            linkClicks: findColumnIndex(headers, "linkClicks"),
            leads: findColumnIndex(headers, "leads"),
            reach: findColumnIndex(headers, "reach"),
            landingPageViews: findColumnIndex(headers, "landingPageViews"),
            results: findColumnIndex(headers, "results"),
            roas: findColumnIndex(headers, "roas"),
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
                date: getCell(row, columnIndices.date),
                campaignName: getCell(row, columnIndices.campaignName),
                adName: getCell(row, columnIndices.adName),
                spend: parseBrazilianNumber(getCell(row, columnIndices.spend)),
                impressions: parseIntSafe(getCell(row, columnIndices.impressions)),
                clicks: parseIntSafe(getCell(row, columnIndices.clicks)),
                linkClicks: parseIntSafe(getCell(row, columnIndices.linkClicks)),
                leads: parseIntSafe(getCell(row, columnIndices.leads)),
                reach: parseIntSafe(getCell(row, columnIndices.reach)),
                landingPageViews: parseIntSafe(getCell(row, columnIndices.landingPageViews)),
                results: parseIntSafe(getCell(row, columnIndices.results)),
                roas: parseBrazilianNumber(getCell(row, columnIndices.roas)),
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
        row.push(current.trim().replace(/^\"|\"$/g, ""));
        rows.push(row);
    }

    return rows;
}
