// Types for Custom Funnel Management with Google Sheets Integration

export interface FunnelStageThresholds {
    otimo: { min: number; max: number };
    ok: { min: number; max: number };
    ruim: { max: number };
    thresholdMode?: "absolute" | "percentage"; // absolute = compare value directly, percentage = compare conversion rate
}

export interface FunnelStage {
    id: string;
    name: string;
    emoji: string;
    unit: "absolute" | "percentage"; // absolute = leads/dia, percentage = %
    thresholds: FunnelStageThresholds;
    dataSource?: "sheet" | "crm"; // Where this stage gets its data
    crmStageId?: string; // If dataSource = "crm", link to CRM stage
}

export type FunnelSourceType = "sheet" | "pipeline";

export interface Funnel {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    stages: FunnelStage[];
    evaluationStages?: FunnelStage[]; // Etapas de avaliação (não fazem parte do funil principal)
    sheetsUrl?: string; // Google Sheets URL
    sourceType?: FunnelSourceType; // 'sheet' = all from sheets, 'pipeline' = hybrid
    sourcePipelineId?: string; // If sourceType = 'pipeline', the linked CRM pipeline
}

// Data from Google Sheets (dashboard_daily tab)
// Represents flow data: how many people passed through each stage on each day
export interface FunnelMetricData {
    pipeline: string;      // Nome do funil (ex: "Funil Sessão Estratégica")
    stage: string;         // Nome da etapa (ex: "Novo Lead")
    date: string;          // Data do evento (DD/MM/YYYY)
    createdCount: number;  // Quantas oportunidades nasceram nessa etapa nesse dia
    stageChangedCount: number; // Quantas oportunidades vieram de outra etapa nesse dia
    origem?: string;       // Origem do lead: "trafego" | "organico" (opcional, para filtro)
}

// Origin/Source types for filtering
export type FunnelOrigin = "total" | "trafego" | "organico";

export type PerformanceStatus = "otimo" | "ok" | "ruim" | "sem_dados";

// Helper to get performance status from value and thresholds
// When thresholdMode is "percentage", use conversionRate instead of value
// When thresholdMode is "absolute", scale thresholds by dayCount (threshold = daily target × days)
export function getPerformanceStatus(
    value: number | null | undefined,
    thresholds: FunnelStageThresholds,
    conversionRate?: number | null, // Conversion rate from previous stage (0-100)
    dayCount: number = 1 // Number of days in the selected period (for scaling absolute thresholds)
): PerformanceStatus {
    if (value === null || value === undefined) {
        return "sem_dados";
    }

    // Determine which value to compare based on threshold mode
    const mode = thresholds.thresholdMode || "absolute";

    if (mode === "percentage" && conversionRate !== null && conversionRate !== undefined) {
        // Percentage mode: compare conversion rate directly (no scaling)
        if (conversionRate >= thresholds.otimo.min) {
            return "otimo";
        } else if (conversionRate >= thresholds.ok.min) {
            return "ok";
        }
        return "ruim";
    }

    // Absolute mode: scale thresholds by number of days
    // Thresholds are configured as daily targets, so multiply by dayCount
    const scaledOtimoMin = thresholds.otimo.min * dayCount;
    const scaledOkMin = thresholds.ok.min * dayCount;

    if (value >= scaledOtimoMin) {
        return "otimo";
    } else if (value >= scaledOkMin) {
        return "ok";
    }
    return "ruim";
}

// Performance status colors and labels
export const PERFORMANCE_CONFIG = {
    otimo: {
        color: "bg-green-500",
        bgLight: "bg-green-100",
        textColor: "text-green-700",
        borderColor: "border-green-500",
        label: "ÓTIMO",
        icon: "check_circle",
    },
    ok: {
        color: "bg-yellow-500",
        bgLight: "bg-yellow-100",
        textColor: "text-yellow-700",
        borderColor: "border-yellow-500",
        label: "OK",
        icon: "warning",
    },
    ruim: {
        color: "bg-red-500",
        bgLight: "bg-red-100",
        textColor: "text-red-700",
        borderColor: "border-red-500",
        label: "RUIM",
        icon: "error",
    },
    sem_dados: {
        color: "bg-gray-400",
        bgLight: "bg-gray-100",
        textColor: "text-gray-500",
        borderColor: "border-gray-300",
        label: "SEM DADOS",
        icon: "help",
    },
};

// Default emojis for stages
export const STAGE_EMOJIS = ["🪣", "📋", "💎", "⏰", "✅", "💰", "🎯", "📊", "🔥", "⭐"];

// Spreadsheet format tooltip
export const SHEETS_FORMAT_HELP = `
A planilha deve ter as seguintes colunas:
• Funil: Nome exato do funil (ex: "Sessão Estratégica")
• Etapa: Nome exato da etapa (ex: "Visitantes na Página")
• Valor: Número (ex: 95 ou 32.5)
• Data: Data no formato AAAA-MM-DD (ex: 2025-12-29)

Exemplo:
| Funil               | Etapa              | Valor | Data       |
|---------------------|--------------------|-------|------------|
| Sessão Estratégica  | Visitantes         | 95    | 2025-12-29 |
| Sessão Estratégica  | Leads Formulário   | 32    | 2025-12-29 |
`;
