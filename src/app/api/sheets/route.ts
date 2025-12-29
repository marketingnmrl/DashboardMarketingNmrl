import { NextRequest, NextResponse } from "next/server";

// API route to fetch data from Google Sheets
// Note: This is a simplified version. For production, you'd want to use
// Google Sheets API with proper authentication.

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const sheetsUrl = searchParams.get("url");
    const funnelName = searchParams.get("funnel");

    if (!sheetsUrl) {
        return NextResponse.json(
            { error: "URL da planilha não fornecida" },
            { status: 400 }
        );
    }

    try {
        // Extract sheet ID from URL
        // URLs look like: https://docs.google.com/spreadsheets/d/SHEET_ID/...
        const match = sheetsUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (!match) {
            return NextResponse.json(
                { error: "URL da planilha inválida" },
                { status: 400 }
            );
        }

        const sheetId = match[1];

        // Use Google Sheets API to fetch data as JSON
        // For this to work, the sheet must be "Published to the web" as CSV
        // Format: https://docs.google.com/spreadsheets/d/{ID}/export?format=csv
        const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

        const response = await fetch(csvUrl);
        if (!response.ok) {
            throw new Error("Não foi possível acessar a planilha. Verifique se ela está pública.");
        }

        const csvText = await response.text();

        // Parse CSV
        const rows = csvText.split("\n").map((row) =>
            row.split(",").map((cell) => cell.trim().replace(/^"|"$/g, ""))
        );

        if (rows.length < 2) {
            return NextResponse.json({ data: [] });
        }

        // Get headers (first row)
        const headers = rows[0].map((h) => h.toLowerCase());
        const funnelIdx = headers.findIndex((h) => h.includes("funil"));
        const stageIdx = headers.findIndex((h) => h.includes("etapa"));
        const valueIdx = headers.findIndex((h) => h.includes("valor"));
        const dateIdx = headers.findIndex((h) => h.includes("data"));

        if (funnelIdx === -1 || stageIdx === -1 || valueIdx === -1) {
            return NextResponse.json(
                { error: "Planilha deve ter colunas: Funil, Etapa, Valor" },
                { status: 400 }
            );
        }

        // Parse data rows
        const data = rows.slice(1)
            .filter((row) => row.length > Math.max(funnelIdx, stageIdx, valueIdx))
            .map((row) => ({
                funnel: row[funnelIdx] || "",
                stage: row[stageIdx] || "",
                value: parseFloat(row[valueIdx]) || 0,
                date: dateIdx !== -1 ? row[dateIdx] || "" : new Date().toISOString().split("T")[0],
            }))
            .filter((item) => item.funnel && item.stage);

        // Filter by funnel name if provided
        const filteredData = funnelName
            ? data.filter((d) => d.funnel.toLowerCase() === funnelName.toLowerCase())
            : data;

        return NextResponse.json({ data: filteredData });
    } catch (error) {
        console.error("Sheets API error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Erro ao buscar dados" },
            { status: 500 }
        );
    }
}
