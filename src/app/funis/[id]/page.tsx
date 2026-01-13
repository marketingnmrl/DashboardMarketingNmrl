"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useMemo, useCallback } from "react";
import { useFunnels, useFunnelData } from "@/hooks/useFunnels";
import { useCRMFunnelData } from "@/hooks/useCRMFunnelData";
import { usePageMetrics } from "@/hooks/usePageMetrics";
import { getPerformanceStatus, PERFORMANCE_CONFIG, SHEETS_FORMAT_HELP, FunnelStageThresholds } from "@/types/funnel";
import DateRangePicker from "@/components/DateRangePicker";
import Link from "next/link";

// Threshold Editor Modal
function ThresholdEditor({
    stageName,
    unit,
    thresholds,
    onSave,
    onClose,
}: {
    stageName: string;
    unit: "absolute" | "percentage";
    thresholds: FunnelStageThresholds;
    onSave: (thresholds: FunnelStageThresholds) => void;
    onClose: () => void;
}) {
    const [values, setValues] = useState(thresholds);
    const [mode, setMode] = useState<"absolute" | "percentage">(thresholds.thresholdMode || "absolute");

    const handleSave = () => {
        onSave({ ...values, thresholdMode: mode });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-[#19069E]">Editar Critérios</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                    Defina os critérios para <strong>{stageName}</strong>
                </p>

                {/* Mode Selector */}
                <div className="mb-5 p-4 rounded-xl bg-gray-50 border border-gray-200">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                        Tipo de Meta
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setMode("absolute")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === "absolute"
                                ? "bg-[#19069E] text-white shadow-md"
                                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">tag</span>
                            Número Absoluto
                        </button>
                        <button
                            onClick={() => setMode("percentage")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === "percentage"
                                ? "bg-[#19069E] text-white shadow-md"
                                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">percent</span>
                            Conversão %
                        </button>
                    </div>
                    {mode === "percentage" && (
                        <p className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded-lg">
                            💡 A meta será baseada na taxa de conversão da etapa anterior
                        </p>
                    )}
                </div>

                <div className="space-y-4">
                    {/* ÓTIMO */}
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                        <p className="text-sm font-bold text-green-700 mb-2">🟢 ÓTIMO</p>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={values.otimo.min}
                                onChange={(e) => setValues({
                                    ...values,
                                    otimo: { ...values.otimo, min: parseFloat(e.target.value) || 0 }
                                })}
                                className="w-20 px-2 py-1.5 rounded border text-sm text-center"
                            />
                            <span className="text-gray-500">a</span>
                            <input
                                type="number"
                                value={values.otimo.max}
                                onChange={(e) => setValues({
                                    ...values,
                                    otimo: { ...values.otimo, max: parseFloat(e.target.value) || 0 }
                                })}
                                className="w-20 px-2 py-1.5 rounded border text-sm text-center"
                            />
                            <span className="text-gray-500">{mode === "percentage" ? "%" : (unit === "percentage" ? "%" : "")}</span>
                        </div>
                    </div>

                    {/* OK */}
                    <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                        <p className="text-sm font-bold text-yellow-700 mb-2">🟡 OK</p>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={values.ok.min}
                                onChange={(e) => setValues({
                                    ...values,
                                    ok: { ...values.ok, min: parseFloat(e.target.value) || 0 }
                                })}
                                className="w-20 px-2 py-1.5 rounded border text-sm text-center"
                            />
                            <span className="text-gray-500">a</span>
                            <input
                                type="number"
                                value={values.ok.max}
                                onChange={(e) => setValues({
                                    ...values,
                                    ok: { ...values.ok, max: parseFloat(e.target.value) || 0 }
                                })}
                                className="w-20 px-2 py-1.5 rounded border text-sm text-center"
                            />
                            <span className="text-gray-500">{mode === "percentage" ? "%" : (unit === "percentage" ? "%" : "")}</span>
                        </div>
                    </div>

                    {/* RUIM */}
                    <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                        <p className="text-sm font-bold text-red-700 mb-2">🔴 RUIM</p>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500">Abaixo de</span>
                            <input
                                type="number"
                                value={values.ruim.max + 1}
                                onChange={(e) => setValues({
                                    ...values,
                                    ruim: { max: (parseFloat(e.target.value) || 1) - 1 }
                                })}
                                className="w-20 px-2 py-1.5 rounded border text-sm text-center"
                            />
                            <span className="text-gray-500">{mode === "percentage" ? "%" : (unit === "percentage" ? "%" : "")}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 py-2.5 bg-[#C2DF0C] text-[#19069E] font-bold rounded-lg hover:bg-[#B0CC0B]"
                    >
                        Salvar
                    </button>
                </div>
            </div>
        </div>
    );
}

// Threshold Tooltip - shows scaled thresholds and gap to next level
function ThresholdTooltip({
    value,
    thresholds,
    conversionRate,
    dayCount,
}: {
    value: number | null;
    thresholds: FunnelStageThresholds;
    conversionRate?: number | null;
    dayCount: number;
}) {
    const mode = thresholds.thresholdMode || "absolute";
    const usePercentage = mode === "percentage" && conversionRate !== null && conversionRate !== undefined;

    // Calculate scaled thresholds
    const scaledOtimo = usePercentage ? thresholds.otimo.min : thresholds.otimo.min * dayCount;
    const scaledOk = usePercentage ? thresholds.ok.min : thresholds.ok.min * dayCount;

    // Current value to compare
    const currentValue = usePercentage ? conversionRate : value;
    const suffix = usePercentage ? "%" : "";

    // Calculate gap to next level
    let gapMessage = "";
    if (currentValue !== null && currentValue !== undefined) {
        if (currentValue >= scaledOtimo) {
            gapMessage = "✅ Meta atingida!";
        } else if (currentValue >= scaledOk) {
            const gapToOtimo = scaledOtimo - currentValue;
            gapMessage = `Faltam ${gapToOtimo.toFixed(usePercentage ? 1 : 0)}${suffix} para ÓTIMO`;
        } else {
            const gapToOk = scaledOk - currentValue;
            gapMessage = `Faltam ${gapToOk.toFixed(usePercentage ? 1 : 0)}${suffix} para OK`;
        }
    }

    return (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
            <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl min-w-[180px]">
                <p className="font-bold mb-2 text-center border-b border-gray-700 pb-2">
                    📊 Metas {usePercentage ? "(Conversão)" : `(${dayCount} ${dayCount === 1 ? "dia" : "dias"})`}
                </p>
                <div className="space-y-1">
                    <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <span>ÓTIMO:</span>
                        </span>
                        <span className="font-bold">≥ {scaledOtimo.toFixed(usePercentage ? 1 : 0)}{suffix}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                            <span>OK:</span>
                        </span>
                        <span className="font-bold">≥ {scaledOk.toFixed(usePercentage ? 1 : 0)}{suffix}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            <span>RUIM:</span>
                        </span>
                        <span className="font-bold">&lt; {scaledOk.toFixed(usePercentage ? 1 : 0)}{suffix}</span>
                    </div>
                </div>
                {currentValue !== null && currentValue !== undefined && (
                    <div className="mt-2 pt-2 border-t border-gray-700">
                        <p className="text-center">
                            <span className="text-gray-400">Atual: </span>
                            <span className="font-bold text-white">{currentValue.toFixed(usePercentage ? 1 : 0)}{suffix}</span>
                        </p>
                        <p className={`text-center mt-1 ${currentValue >= scaledOtimo
                            ? "text-green-400"
                            : currentValue >= scaledOk
                                ? "text-yellow-400"
                                : "text-red-400"
                            }`}>
                            {gapMessage}
                        </p>
                    </div>
                )}
                {/* Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
            </div>
        </div>
    );
}

// Rename Modal
function RenameModal({
    currentName,
    onSave,
    onClose,
}: {
    currentName: string;
    onSave: (newName: string) => void;
    onClose: () => void;
}) {
    const [name, setName] = useState(currentName);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSave(name.trim());
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-[#19069E]">Renomear Funil</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nome do Funil
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#19069E] focus:border-transparent text-sm"
                            autoFocus
                            required
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-2.5 bg-[#C2DF0C] text-[#19069E] font-bold rounded-lg hover:bg-[#B0CC0B]"
                        >
                            Salvar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Sheets Config Modal
function SheetsConfigModal({
    currentUrl,
    onSave,
    onClose,
}: {
    currentUrl?: string;
    onSave: (url: string) => void;
    onClose: () => void;
}) {
    const [url, setUrl] = useState(currentUrl || "");
    const [showHelp, setShowHelp] = useState(false);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-[#19069E]">Configurar Planilha</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            URL do Google Sheets
                        </label>
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://docs.google.com/spreadsheets/d/..."
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#19069E] focus:border-transparent text-sm"
                        />
                    </div>

                    <button
                        onClick={() => setShowHelp(!showHelp)}
                        className="flex items-center gap-2 text-sm text-[#19069E] hover:underline"
                    >
                        <span className="material-symbols-outlined text-[18px]">help</span>
                        Como formatar a planilha?
                    </button>

                    {showHelp && (
                        <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 text-sm">
                            <pre className="whitespace-pre-wrap text-blue-800 font-mono text-xs">
                                {SHEETS_FORMAT_HELP}
                            </pre>
                            <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <p className="text-yellow-800 font-medium text-xs">
                                    ⚠️ A planilha deve estar pública ou "Publicada na Web"
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => { onSave(url); onClose(); }}
                        className="flex-1 py-2.5 bg-[#C2DF0C] text-[#19069E] font-bold rounded-lg hover:bg-[#B0CC0B]"
                    >
                        Salvar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function FunilDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { getFunnel, updateFunnel, updateThresholds, setSheetsUrl, deleteFunnel, isLoading } = useFunnels();
    const [editingStage, setEditingStage] = useState<string | null>(null);
    const [showSheetsConfig, setShowSheetsConfig] = useState(false);
    const [showRenameModal, setShowRenameModal] = useState(false);

    // Date range state - defaults to today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
        start: today,
        end: today,
    });

    // Origin filter state
    const [selectedOrigin, setSelectedOrigin] = useState<"total" | "trafego" | "organico">("total");

    const handleDateChange = useCallback((start: Date, end: Date) => {
        setDateRange({ start, end });
    }, []);

    const funnel = getFunnel(params.id as string);
    const { getStageValue, isLoading: isLoadingData, error: dataError, refresh: refreshData, getAvailableOrigins } = useFunnelData(
        funnel?.sheetsUrl,
        funnel?.name || ""
    );

    // CRM data for hybrid funnels (COHORT MODEL)
    // Filters leads by creation date within selected period
    const crmOptions = useMemo(() => {
        if (!funnel || funnel.sourceType !== "pipeline" || !funnel.sourcePipelineId) {
            return null;
        }
        const crmStageIds = funnel.stages
            .filter(s => s.dataSource === "crm" && s.crmStageId)
            .map(s => s.crmStageId!);
        return crmStageIds.length > 0 ? {
            pipelineId: funnel.sourcePipelineId,
            stageIds: crmStageIds,
            dateRange: dateRange  // Pass date range for cohort filtering
        } : null;
    }, [funnel, dateRange]);

    const { getCRMStageValue, isLoading: isLoadingCRM } = useCRMFunnelData(crmOptions);

    // Check if origin data is available
    const availableOrigins = getAvailableOrigins();
    const hasOriginData = availableOrigins.length > 0 || funnel?.sourceType === "pipeline";

    // Calculate number of days in selected period (for threshold scaling)
    const dayCount = useMemo(() => {
        const diffTime = Math.abs(dateRange.end.getTime() - dateRange.start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(1, diffDays + 1); // +1 because both start and end days are inclusive
    }, [dateRange]);

    // Helper to get stage value with current date range and origin filter
    // Supports hybrid funnels: CRM stages use lead count, sheet stages use sheets data
    const getStageValueForPeriod = useCallback(
        (stageName: string, stageId?: string, dataSource?: "sheet" | "crm", crmStageId?: string): number | null => {
            // If this is a CRM stage, get count from CRM
            if (dataSource === "crm" && crmStageId) {
                return getCRMStageValue(crmStageId, selectedOrigin);
            }
            // Otherwise use sheets data
            return getStageValue(stageName, dateRange.start, dateRange.end, selectedOrigin);
        },
        [getStageValue, getCRMStageValue, dateRange, selectedOrigin]
    );

    // Build KPIs object with actual values for AI context
    const funnelKpis = useMemo(() => {
        if (!funnel || isLoading) return {};

        const kpis: Record<string, number | string> = {
            nome_funil: funnel.name,
            total_etapas: funnel.stages.length,
            etapas: funnel.stages.map(s => s.name).join(", "),
        };

        funnel.stages.forEach((stage, index) => {
            const value = getStageValueForPeriod(stage.name);
            const key = stage.name.toLowerCase().replace(/ /g, "_");
            kpis[key] = value ?? 0;

            // Add conversion rate to next stage
            if (index > 0) {
                const prevValue = getStageValueForPeriod(funnel.stages[index - 1]?.name);
                if (prevValue && value !== null) {
                    kpis[`conversao_${key}`] = `${((value / prevValue) * 100).toFixed(2)}%`;
                }
            }
        });

        // Calculate overall funnel conversion
        const firstValue = getStageValueForPeriod(funnel.stages[0]?.name);
        const lastValue = getStageValueForPeriod(funnel.stages[funnel.stages.length - 1]?.name);
        if (firstValue && lastValue) {
            kpis["conversao_total"] = `${((lastValue / firstValue) * 100).toFixed(3)}%`;
        }

        kpis["planilha_conectada"] = funnel.sheetsUrl ? "Sim" : "Não";

        return kpis;
    }, [funnel, isLoading, getStageValueForPeriod]);

    usePageMetrics({
        pagina: funnel?.name || "Funil",
        descricao: !funnel
            ? "Carregando funil..."
            : `Funil com ${funnel.stages.length} etapas: ${funnel.stages.map(s => s.name).join(" → ")}`,
        periodo: `${dateRange.start.toLocaleDateString("pt-BR")} - ${dateRange.end.toLocaleDateString("pt-BR")}`,
        kpis: funnelKpis,
    });

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto flex items-center justify-center h-64">
                <div className="flex items-center gap-3 text-[#19069E]">
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    <span className="font-medium">Carregando funil...</span>
                </div>
            </div>
        );
    }

    if (!funnel) {
        return (
            <div className="max-w-7xl mx-auto p-12 rounded-xl bg-white border border-gray-200 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-red-500">error</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Funil não encontrado</h3>
                <Link
                    href="/funis"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-[#19069E] hover:bg-[#12047A] text-white font-bold rounded-lg transition-all"
                >
                    <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                    Voltar
                </Link>
            </div>
        );
    }

    const handleDelete = () => {
        if (confirm("Tem certeza que deseja excluir este funil?")) {
            deleteFunnel(funnel.id);
            router.push("/funis");
        }
    };

    const editingStageData = funnel.stages.find(s => s.id === editingStage)
        || funnel.evaluationStages?.find(s => s.id === editingStage);

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/funis"
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-extrabold text-[#19069E]">{funnel.name}</h1>
                            <button
                                onClick={() => setShowRenameModal(true)}
                                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#19069E] transition-colors"
                                title="Renomear funil"
                            >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                        </div>
                        <p className="text-sm text-gray-500">
                            {funnel.stages.length} etapas
                            {funnel.sheetsUrl && " • Planilha conectada"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Origin Filter Toggle */}
                    {hasOriginData && (
                        <div className="flex rounded-xl border border-gray-200 overflow-hidden">
                            {(["total", "trafego", "organico"] as const).map((origin) => (
                                <button
                                    key={origin}
                                    onClick={() => setSelectedOrigin(origin)}
                                    className={`px-3 py-2 text-sm font-medium transition-colors ${selectedOrigin === origin
                                        ? "bg-[#19069E] text-white"
                                        : "bg-white text-gray-600 hover:bg-gray-50"
                                        }`}
                                >
                                    {origin === "total" ? "Total" : origin === "trafego" ? "Tráfego" : "Orgânico"}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Date Range Picker */}
                    <DateRangePicker
                        startDate={dateRange.start}
                        endDate={dateRange.end}
                        onChange={handleDateChange}
                    />

                    {/* Refresh Data Button */}
                    {funnel.sheetsUrl && (
                        <button
                            onClick={refreshData}
                            disabled={isLoadingData}
                            className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors disabled:opacity-50"
                            title="Atualizar dados"
                        >
                            <span className={`material-symbols-outlined text-[20px] ${isLoadingData ? 'animate-spin' : ''}`}>
                                {isLoadingData ? 'progress_activity' : 'refresh'}
                            </span>
                        </button>
                    )}

                    {/* Sheets Config Button */}
                    <button
                        onClick={() => setShowSheetsConfig(true)}
                        className={`p-2 rounded-lg transition-colors ${funnel.sheetsUrl
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                        title="Configurar planilha"
                    >
                        <span className="material-symbols-outlined text-[20px]">table</span>
                    </button>

                    {/* Delete */}
                    <button
                        onClick={handleDelete}
                        className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                        title="Excluir funil"
                    >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                </div>
            </div>

            {/* Data Status */}
            {!funnel.sheetsUrl && (
                <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 flex items-center gap-3">
                    <span className="material-symbols-outlined text-yellow-600">warning</span>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-yellow-800">Planilha não configurada</p>
                        <p className="text-xs text-yellow-700">Configure a URL do Google Sheets para visualizar os dados</p>
                    </div>
                    <button
                        onClick={() => setShowSheetsConfig(true)}
                        className="px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-medium text-sm rounded-lg"
                    >
                        Configurar
                    </button>
                </div>
            )
            }

            {
                dataError && (
                    <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3">
                        <span className="material-symbols-outlined text-red-600">error</span>
                        <p className="text-sm text-red-700">{dataError}</p>
                    </div>
                )
            }

            {
                isLoadingData && (
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 flex items-center gap-3">
                        <span className="material-symbols-outlined animate-spin text-blue-600">progress_activity</span>
                        <p className="text-sm text-blue-700">Carregando dados da planilha...</p>
                    </div>
                )
            }

            {/* Visual Funnel */}
            <div className="p-8 rounded-xl bg-white border border-gray-200 shadow-sm">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-[#19069E]">Visualização do Funil</h3>
                    <p className="text-sm text-gray-500">Jornada do cliente com taxas de conversão</p>
                </div>

                {funnel.stages.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                            <span className="material-symbols-outlined text-3xl text-amber-600">warning</span>
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 mb-2">Nenhuma etapa cadastrada</h4>
                        <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
                            Este funil não possui etapas. As etapas podem não ter sido salvas corretamente durante a criação.
                            Você pode excluir este funil e criar um novo com as etapas desejadas.
                        </p>
                        <button
                            onClick={handleDelete}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                            Excluir e criar novo
                        </button>
                    </div>
                ) : (
                    <div
                        key={`funnel-${selectedOrigin}-${dateRange.start.getTime()}-${dateRange.end.getTime()}`}
                        className="flex flex-col items-center space-y-2 animate-blur-focus"
                    >
                        {funnel.stages.map((stage, index) => {
                            const value = getStageValueForPeriod(stage.name, stage.id, stage.dataSource, stage.crmStageId);
                            const firstStage = funnel.stages[0];
                            const firstStageValue = getStageValueForPeriod(firstStage?.name, firstStage?.id, firstStage?.dataSource, firstStage?.crmStageId);
                            const prevStage = index > 0 ? funnel.stages[index - 1] : null;
                            const previousValue = prevStage ? getStageValueForPeriod(prevStage.name, prevStage.id, prevStage.dataSource, prevStage.crmStageId) : null;

                            // Calculate percentage relative to first stage
                            const percentOfTotal = firstStageValue && value !== null
                                ? ((value / firstStageValue) * 100)
                                : (index === 0 ? 100 : null);

                            // Calculate conversion rate from previous stage
                            const conversionRate = previousValue && value !== null
                                ? ((value / previousValue) * 100)
                                : null;

                            const status = getPerformanceStatus(value, stage.thresholds, conversionRate, dayCount);
                            const config = PERFORMANCE_CONFIG[status];
                            const widthPercent = 100 - (index * (60 / Math.max(funnel.stages.length, 1)));

                            // Use brand colors - first stage is primary color, last is accent
                            const isLastStage = index === funnel.stages.length - 1;
                            const bgColor = isLastStage ? "bg-[#C2DF0C]" : "bg-[#19069E]";
                            const textColor = isLastStage ? "text-[#19069E]" : "text-white";
                            const subTextColor = isLastStage ? "text-[#19069E]/70" : "text-white/70";

                            return (
                                <div
                                    key={stage.id}
                                    className="relative w-full flex flex-col items-center animate-cascade-in"
                                    style={{
                                        animationDelay: `${index * 100}ms`,
                                        opacity: 0,
                                        animation: `cascadeIn 0.4s ease-out ${index * 100}ms forwards`
                                    }}
                                >
                                    {/* Conversion Rate Badge */}
                                    {index > 0 && conversionRate !== null && (
                                        <div className="py-2">
                                            <span className="inline-flex items-center px-3 py-1 bg-[#C2DF0C] text-[#19069E] text-xs font-bold rounded-full shadow">
                                                {conversionRate.toFixed(2)}% conversão
                                            </span>
                                        </div>
                                    )}

                                    {/* Stage Bar */}
                                    <div
                                        className={`relative py-4 px-6 rounded-lg text-center transition-all hover:scale-[1.01] ${bgColor} group cursor-pointer`}
                                        style={{ width: `${widthPercent}%`, maxWidth: "700px", minWidth: "200px" }}
                                        onClick={() => setEditingStage(stage.id)}
                                    >
                                        {/* Performance Indicator */}
                                        <div className={`absolute top-2 left-2 w-2 h-2 rounded-full ${config.color}`} title={config.label}></div>

                                        {/* Edit Button */}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setEditingStage(stage.id); }}
                                            className={`absolute top-2 right-2 p-1.5 rounded-lg ${isLastStage ? "bg-[#19069E]/10 text-[#19069E]" : "bg-white/20 text-white"} opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/30`}
                                            title="Editar critérios"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">tune</span>
                                        </button>

                                        {/* Stage Name */}
                                        <p className={`${subTextColor} text-xs font-bold uppercase tracking-wider mb-1`}>
                                            {stage.name}
                                        </p>

                                        {/* Value */}
                                        <p className={`${textColor} text-3xl font-extrabold`}>
                                            {value !== null ? (
                                                value >= 1000000
                                                    ? `${(value / 1000000).toFixed(1)}M`
                                                    : value >= 1000
                                                        ? `${(value / 1000).toFixed(1)}K`
                                                        : value.toLocaleString("pt-BR")
                                            ) : "—"}
                                        </p>

                                        {/* Threshold Tooltip */}
                                        <ThresholdTooltip
                                            value={value}
                                            thresholds={stage.thresholds}
                                            conversionRate={conversionRate}
                                            dayCount={dayCount}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Summary Metrics */}
                {funnel.stages.length >= 2 && (
                    <div className="mt-8 pt-6 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <p className="text-xs text-gray-500 font-medium">Taxa Geral</p>
                            <p className="text-xl font-extrabold text-[#19069E]">
                                {(() => {
                                    const first = getStageValueForPeriod(funnel.stages[0]?.name);
                                    const last = getStageValueForPeriod(funnel.stages[funnel.stages.length - 1]?.name);
                                    return first && last ? `${((last / first) * 100).toFixed(3)}%` : "—";
                                })()}
                            </p>
                            <p className="text-xs text-gray-400">
                                {funnel.stages[0]?.name} → {funnel.stages[funnel.stages.length - 1]?.name}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-gray-500 font-medium">Etapas</p>
                            <p className="text-xl font-extrabold text-[#19069E]">{funnel.stages.length}</p>
                            <p className="text-xs text-gray-400">Total de etapas</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-gray-500 font-medium">Menor Conversão</p>
                            <p className="text-xl font-extrabold text-red-500">
                                {(() => {
                                    let minRate = Infinity;
                                    for (let i = 1; i < funnel.stages.length; i++) {
                                        const prev = getStageValueForPeriod(funnel.stages[i - 1]?.name);
                                        const curr = getStageValueForPeriod(funnel.stages[i]?.name);
                                        if (prev && curr) {
                                            minRate = Math.min(minRate, (curr / prev) * 100);
                                        }
                                    }
                                    return minRate !== Infinity ? `${minRate.toFixed(2)}%` : "—";
                                })()}
                            </p>
                            <p className="text-xs text-gray-400">Gargalo do funil</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-gray-500 font-medium">Status</p>
                            <p className="text-xl font-extrabold">
                                <span className={`px-3 py-1 rounded-full text-sm ${funnel.sheetsUrl ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                                    }`}>
                                    {funnel.sheetsUrl ? "Conectado" : "Sem dados"}
                                </span>
                            </p>
                            <p className="text-xs text-gray-400">Planilha</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Stages Detail Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {funnel.stages.map((stage, index) => {
                    const value = getStageValueForPeriod(stage.name, stage.id, stage.dataSource, stage.crmStageId);
                    const prevStage = index > 0 ? funnel.stages[index - 1] : null;
                    const previousValue = prevStage ? getStageValueForPeriod(prevStage.name, prevStage.id, prevStage.dataSource, prevStage.crmStageId) : null;
                    const conversionRate = previousValue && value !== null ? (value / previousValue) * 100 : null;
                    const status = getPerformanceStatus(value, stage.thresholds, conversionRate, dayCount);
                    const config = PERFORMANCE_CONFIG[status];

                    return (
                        <div
                            key={stage.id}
                            onClick={() => setEditingStage(stage.id)}
                            className={`relative p-5 rounded-xl bg-white border-2 ${config.borderColor} shadow-sm cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-md group`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-gray-900 text-sm">{stage.name}</h4>
                                </div>
                                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${config.bgLight}`}>
                                    <span className={`material-symbols-outlined text-[18px] ${config.textColor}`}>
                                        {config.icon}
                                    </span>
                                    <span className={`text-xs font-bold ${config.textColor}`}>
                                        {config.label}
                                    </span>
                                </div>
                            </div>

                            <p className="text-3xl font-extrabold text-[#19069E]">
                                {value !== null ? value : "—"}
                                <span className="text-lg font-medium text-gray-500 ml-1">
                                    {stage.unit === "absolute" ? "/dia" : "%"}
                                </span>
                            </p>

                            {/* Threshold Tooltip */}
                            <ThresholdTooltip
                                value={value}
                                thresholds={stage.thresholds}
                                conversionRate={conversionRate}
                                dayCount={dayCount}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Evaluation Stages Section */}
            {funnel.evaluationStages && funnel.evaluationStages.length > 0 && (
                <div className="p-6 rounded-xl bg-amber-50 border border-amber-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-amber-600">assessment</span>
                        <h3 className="text-lg font-bold text-amber-700">Etapas de Avaliação</h3>
                    </div>
                    <p className="text-sm text-amber-600 mb-4">
                        Métricas acessórias que não fazem parte do fluxo principal do funil
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {funnel.evaluationStages.map((stage) => {
                            const value = getStageValueForPeriod(stage.name);
                            const status = getPerformanceStatus(value, stage.thresholds, null, dayCount);
                            const config = PERFORMANCE_CONFIG[status];

                            return (
                                <div
                                    key={stage.id}
                                    onClick={() => setEditingStage(stage.id)}
                                    className={`relative p-5 rounded-xl bg-white border-2 ${config.borderColor} shadow-sm cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-md group`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-amber-500 text-[18px]">assessment</span>
                                            <h4 className="font-bold text-gray-900 text-sm">{stage.name}</h4>
                                        </div>
                                        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${config.bgLight}`}>
                                            <span className={`material-symbols-outlined text-[18px] ${config.textColor}`}>
                                                {config.icon}
                                            </span>
                                            <span className={`text-xs font-bold ${config.textColor}`}>
                                                {config.label}
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-3xl font-extrabold text-amber-700">
                                        {value !== null ? value : "—"}
                                        <span className="text-lg font-medium text-gray-500 ml-1">
                                            {stage.unit === "absolute" ? "/dia" : "%"}
                                        </span>
                                    </p>

                                    {/* Threshold Tooltip */}
                                    <ThresholdTooltip
                                        value={value}
                                        thresholds={stage.thresholds}
                                        conversionRate={null}
                                        dayCount={dayCount}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
                <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        <span className="text-gray-600">ÓTIMO</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                        <span className="text-gray-600">OK</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500"></span>
                        <span className="text-gray-600">RUIM</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-gray-400"></span>
                        <span className="text-gray-600">SEM DADOS</span>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {
                editingStageData && (
                    <ThresholdEditor
                        stageName={editingStageData.name}
                        unit={editingStageData.unit}
                        thresholds={editingStageData.thresholds}
                        onSave={(thresholds) => updateThresholds(funnel.id, editingStageData.id, thresholds)}
                        onClose={() => setEditingStage(null)}
                    />
                )
            }

            {
                showSheetsConfig && (
                    <SheetsConfigModal
                        currentUrl={funnel.sheetsUrl}
                        onSave={(url) => setSheetsUrl(funnel.id, url)}
                        onClose={() => setShowSheetsConfig(false)}
                    />
                )
            }

            {
                showRenameModal && (
                    <RenameModal
                        currentName={funnel.name}
                        onSave={(newName) => updateFunnel(funnel.id, { name: newName })}
                        onClose={() => setShowRenameModal(false)}
                    />
                )
            }
        </div >
    );
}
