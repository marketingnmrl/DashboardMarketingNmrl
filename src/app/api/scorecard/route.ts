import { NextRequest, NextResponse } from "next/server";

// API route to fetch weekly scorecard data from Google Sheets
// Expected columns: date, seguidores_ganhos, custo_por_seguidor, media_views_reel, 
// retencao_media, cliques_link_bio, leads_gerados, reels_postados, reels_impulsionados

export interface ScorecardData {
    date: string;
    seguidoresGanhos: number;
    custoPorSeguidor: number;
    mediaViewsReel: number;
    retencaoMedia: number;
    cliquesLinkBio: number;
    leadsGerados: number;
    reelsPostados: number;
    reelsImpulsionados: number;
}

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

        // Fetch from the first tab (or specify a tab name if needed)
        const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

        const response = await fetch(csvUrl);
        if (!response.ok) {
            throw new Error("Não foi possível acessar a planilha. Verifique se ela está pública.");
        }

        const csvText = await response.text();

        // Parse CSV
        const parseCSVLine = (line: string): string[] => {
            const result: string[] = [];
            let current = "";
            let inQuotes = false;

            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    result.push(current.trim());
                    current = "";
                } else {
                    current += char;
                }
            }
            result.push(current.trim());
            return result;
        };

        const rows = csvText.split("\n").filter(row => row.trim()).map(parseCSVLine);

        if (rows.length < 2) {
            return NextResponse.json({ data: [] });
        }

        // Get headers (first row) - normalize to lowercase
        const headers = rows[0].map((h) => h.toLowerCase().trim().replace(/ /g, "_"));

        // Find column indices
        const dateIdx = headers.findIndex((h) => h === "date" || h === "data");
        const seguidoresIdx = headers.findIndex((h) => h.includes("seguidores"));
        const custoIdx = headers.findIndex((h) => h.includes("custo"));
        const viewsIdx = headers.findIndex((h) => h.includes("views") || h.includes("visualiza"));
        const retencaoIdx = headers.findIndex((h) => h.includes("retencao") || h.includes("retenção"));
        const cliquesIdx = headers.findIndex((h) => h.includes("cliques") || h.includes("link"));
        const leadsIdx = headers.findIndex((h) => h.includes("leads"));
        const reelsPostadosIdx = headers.findIndex((h) => h.includes("reels_postados") || h.includes("postados"));
        const reelsImpulsionadosIdx = headers.findIndex((h) => h.includes("impulsionados"));

        if (dateIdx === -1) {
            return NextResponse.json(
                {
                    error: "Planilha deve ter uma coluna 'date' ou 'data'",
                    foundHeaders: headers
                },
                { status: 400 }
            );
        }

        // Parse data rows
        const data: ScorecardData[] = rows.slice(1)
            .filter((row) => row.length > dateIdx && row[dateIdx])
            .map((row) => ({
                date: row[dateIdx]?.trim() || "",
                seguidoresGanhos: seguidoresIdx >= 0 ? parseInt(row[seguidoresIdx]) || 0 : 0,
                custoPorSeguidor: custoIdx >= 0 ? parseFloat(row[custoIdx]?.replace(",", ".")) || 0 : 0,
                mediaViewsReel: viewsIdx >= 0 ? parseInt(row[viewsIdx]) || 0 : 0,
                retencaoMedia: retencaoIdx >= 0 ? parseFloat(row[retencaoIdx]?.replace(",", ".")) || 0 : 0,
                cliquesLinkBio: cliquesIdx >= 0 ? parseInt(row[cliquesIdx]) || 0 : 0,
                leadsGerados: leadsIdx >= 0 ? parseInt(row[leadsIdx]) || 0 : 0,
                reelsPostados: reelsPostadosIdx >= 0 ? parseInt(row[reelsPostadosIdx]) || 0 : 0,
                reelsImpulsionados: reelsImpulsionadosIdx >= 0 ? parseInt(row[reelsImpulsionadosIdx]) || 0 : 0,
            }));

        return NextResponse.json({ data });
    } catch (error) {
        console.error("Scorecard API error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Erro ao buscar dados" },
            { status: 500 }
        );
    }
}
