import { NextRequest, NextResponse } from "next/server";

// API route to fetch data from Google Sheets
// Reads from the "dashboard_daily" tab with flow-based metrics

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const sheetsUrl = searchParams.get("url");
    const pipelineName = searchParams.get("pipeline"); // Nome do funil

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

        // Fetch specifically from "dashboard_daily" tab
        // gid=0 is the first tab, but we need to use the tab name
        // Format: ...export?format=csv&gid=SHEET_GID or ...gviz/tq?tqx=out:csv&sheet=SHEET_NAME
        const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=dashboard_daily`;

        const response = await fetch(csvUrl);
        if (!response.ok) {
            throw new Error("Não foi possível acessar a planilha. Verifique se ela está pública e se a aba 'dashboard_daily' existe.");
        }

        const csvText = await response.text();

        // Parse CSV - handle quoted fields properly
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
        const headers = rows[0].map((h) => h.toLowerCase().trim());

        // Find column indices for new format
        // Expected columns: date, pipeline, stage, created_count, stage_changed_count
        const dateIdx = headers.findIndex((h) => h === "date");
        const pipelineIdx = headers.findIndex((h) => h === "pipeline");
        const stageIdx = headers.findIndex((h) => h === "stage");
        const createdCountIdx = headers.findIndex((h) => h === "created_count");
        const stageChangedCountIdx = headers.findIndex((h) => h === "stage_changed_count");

        if (dateIdx === -1 || pipelineIdx === -1 || stageIdx === -1 || createdCountIdx === -1 || stageChangedCountIdx === -1) {
            return NextResponse.json(
                {
                    error: "Planilha deve ter as colunas: date, pipeline, stage, created_count, stage_changed_count",
                    foundHeaders: headers
                },
                { status: 400 }
            );
        }

        // Parse data rows
        const data = rows.slice(1)
            .filter((row) => row.length > Math.max(dateIdx, pipelineIdx, stageIdx, createdCountIdx, stageChangedCountIdx))
            .map((row) => ({
                date: row[dateIdx]?.trim() || "",
                pipeline: row[pipelineIdx]?.trim() || "",
                stage: row[stageIdx]?.trim() || "",
                createdCount: parseInt(row[createdCountIdx]) || 0,
                stageChangedCount: parseInt(row[stageChangedCountIdx]) || 0,
            }))
            .filter((item) => item.pipeline && item.stage && item.date);

        // Filter by pipeline name if provided (case-insensitive)
        const filteredData = pipelineName
            ? data.filter((d) => d.pipeline.toLowerCase() === pipelineName.toLowerCase())
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
