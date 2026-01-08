// Types for Custom Funnel Management with Google Sheets Integration

export interface FunnelStageThresholds {
    otimo: { min: number; max: number };
    ok: { min: number; max: number };
    ruim: { max: number };
}

export interface FunnelStage {
    id: string;
    name: string;
    emoji: string;
    unit: "absolute" | "percentage"; // absolute = leads/dia, percentage = %
    thresholds: FunnelStageThresholds;
}

export interface Funnel {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    stages: FunnelStage[];
    evaluationStages?: FunnelStage[]; // Etapas de avaliação (não fazem parte do funil principal)
    sheetsUrl?: string; // Google Sheets URL
}

// Data from Google Sheets
export interface FunnelMetricData {
    funnel: string;
    stage: string;
    value: number;
    date: string;
}

export type PerformanceStatus = "otimo" | "ok" | "ruim" | "sem_dados";

// Helper to get performance status from value and thresholds
export function getPerformanceStatus(
    value: number | null | undefined,
    thresholds: FunnelStageThresholds
): PerformanceStatus {
    if (value === null || value === undefined) {
        return "sem_dados";
    }
    if (value >= thresholds.otimo.min) {
        return "otimo";
    } else if (value >= thresholds.ok.min) {
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
