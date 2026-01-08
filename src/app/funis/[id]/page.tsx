"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { useFunnels, useFunnelData } from "@/hooks/useFunnels";
import { usePageMetrics } from "@/hooks/usePageMetrics";
import { getPerformanceStatus, PERFORMANCE_CONFIG, SHEETS_FORMAT_HELP, FunnelStageThresholds } from "@/types/funnel";
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

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-[#19069E]">Editar Critérios</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                    Defina os critérios para <strong>{stageName}</strong>
                </p>

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
                            <span className="text-gray-500">{unit === "percentage" ? "%" : ""}</span>
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
                            <span className="text-gray-500">{unit === "percentage" ? "%" : ""}</span>
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
                            <span className="text-gray-500">{unit === "percentage" ? "%" : ""}</span>
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
                        onClick={() => { onSave(values); onClose(); }}
                        className="flex-1 py-2.5 bg-[#C2DF0C] text-[#19069E] font-bold rounded-lg hover:bg-[#B0CC0B]"
                    >
                        Salvar
                    </button>
                </div>
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
    const [selectedPeriod, setSelectedPeriod] = useState("hoje");
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [customDateRange, setCustomDateRange] = useState<{ start: string; end: string }>({
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        end: new Date().toISOString().split("T")[0],
    });

    const funnel = getFunnel(params.id as string);
    const { getStageValue, isLoading: isLoadingData, error: dataError, refresh: refreshData } = useFunnelData(
        funnel?.sheetsUrl,
        funnel?.name || ""
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
            const value = getStageValue(stage.name);
            const key = stage.name.toLowerCase().replace(/ /g, "_");
            kpis[key] = value ?? 0;

            // Add conversion rate to next stage
            if (index > 0) {
                const prevValue = getStageValue(funnel.stages[index - 1]?.name);
                if (prevValue && value !== null) {
                    kpis[`conversao_${key}`] = `${((value / prevValue) * 100).toFixed(2)}%`;
                }
            }
        });

        // Calculate overall funnel conversion
        const firstValue = getStageValue(funnel.stages[0]?.name);
        const lastValue = getStageValue(funnel.stages[funnel.stages.length - 1]?.name);
        if (firstValue && lastValue) {
            kpis["conversao_total"] = `${((lastValue / firstValue) * 100).toFixed(3)}%`;
        }

        kpis["planilha_conectada"] = funnel.sheetsUrl ? "Sim" : "Não";

        return kpis;
    }, [funnel, isLoading, getStageValue]);

    usePageMetrics({
        pagina: funnel?.name || "Funil",
        descricao: !funnel
            ? "Carregando funil..."
            : `Funil com ${funnel.stages.length} etapas: ${funnel.stages.map(s => s.name).join(" → ")}`,
        periodo: selectedPeriod,
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
                    {/* Period Selector */}
                    <div className="relative">
                        <select
                            value={selectedPeriod}
                            onChange={(e) => {
                                setSelectedPeriod(e.target.value);
                                if (e.target.value === "custom") {
                                    setShowDatePicker(true);
                                }
                            }}
                            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 pr-8"
                        >
                            <option value="hoje">Hoje</option>
                            <option value="7d">Últimos 7 dias</option>
                            <option value="30d">Últimos 30 dias</option>
                            <option value="mes">Este mês</option>
                            <option value="custom">Personalizado</option>
                        </select>
                    </div>

                    {/* Custom Date Range Display/Button */}
                    {selectedPeriod === "custom" && (
                        <button
                            onClick={() => setShowDatePicker(true)}
                            className="flex items-center gap-2 px-3 py-2 bg-[#19069E]/10 border border-[#19069E]/20 rounded-lg text-sm font-medium text-[#19069E] hover:bg-[#19069E]/20 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                            <span>
                                {new Date(customDateRange.start).toLocaleDateString("pt-BR")} - {new Date(customDateRange.end).toLocaleDateString("pt-BR")}
                            </span>
                        </button>
                    )}

                    {/* Date Picker Dropdown */}
                    {showDatePicker && (
                        <div className="absolute top-full right-0 mt-2 p-4 bg-white rounded-xl border border-gray-200 shadow-xl z-50" style={{ minWidth: "300px" }}>
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold text-[#19069E]">Período Personalizado</h4>
                                <button onClick={() => setShowDatePicker(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                    <span className="material-symbols-outlined text-[18px]">close</span>
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Data Início</label>
                                    <input
                                        type="date"
                                        value={customDateRange.start}
                                        onChange={(e) => setCustomDateRange({ ...customDateRange, start: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#19069E] focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Data Fim</label>
                                    <input
                                        type="date"
                                        value={customDateRange.end}
                                        onChange={(e) => setCustomDateRange({ ...customDateRange, end: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#19069E] focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => setShowDatePicker(false)}
                                    className="flex-1 py-2 border border-gray-200 text-gray-600 font-medium text-sm rounded-lg hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedPeriod("custom");
                                        setShowDatePicker(false);
                                    }}
                                    className="flex-1 py-2 bg-[#C2DF0C] text-[#19069E] font-bold text-sm rounded-lg hover:bg-[#B0CC0B]"
                                >
                                    Aplicar
                                </button>
                            </div>
                        </div>
                    )}

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
                    <div className="flex flex-col items-center space-y-2">
                        {funnel.stages.map((stage, index) => {
                            const value = getStageValue(stage.name);
                            const firstStageValue = getStageValue(funnel.stages[0]?.name);
                            const previousValue = index > 0 ? getStageValue(funnel.stages[index - 1]?.name) : null;

                            // Calculate percentage relative to first stage
                            const percentOfTotal = firstStageValue && value !== null
                                ? ((value / firstStageValue) * 100)
                                : (index === 0 ? 100 : null);

                            // Calculate conversion rate from previous stage
                            const conversionRate = previousValue && value !== null
                                ? ((value / previousValue) * 100)
                                : null;

                            const status = getPerformanceStatus(value, stage.thresholds);
                            const config = PERFORMANCE_CONFIG[status];
                            const widthPercent = 100 - (index * (60 / Math.max(funnel.stages.length, 1)));

                            // Use brand colors - first stage is primary color, last is accent
                            const isLastStage = index === funnel.stages.length - 1;
                            const bgColor = isLastStage ? "bg-[#C2DF0C]" : "bg-[#19069E]";
                            const textColor = isLastStage ? "text-[#19069E]" : "text-white";
                            const subTextColor = isLastStage ? "text-[#19069E]/70" : "text-white/70";

                            return (
                                <div key={stage.id} className="relative w-full flex flex-col items-center">
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
                                    const first = getStageValue(funnel.stages[0]?.name);
                                    const last = getStageValue(funnel.stages[funnel.stages.length - 1]?.name);
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
                                        const prev = getStageValue(funnel.stages[i - 1]?.name);
                                        const curr = getStageValue(funnel.stages[i]?.name);
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
                {funnel.stages.map((stage) => {
                    const value = getStageValue(stage.name);
                    const status = getPerformanceStatus(value, stage.thresholds);
                    const config = PERFORMANCE_CONFIG[status];

                    return (
                        <div
                            key={stage.id}
                            className={`p-5 rounded-xl bg-white border-2 ${config.borderColor} shadow-sm`}
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

                            <p className="text-3xl font-extrabold text-[#19069E] mb-3">
                                {value !== null ? value : "—"}
                                <span className="text-lg font-medium text-gray-500 ml-1">
                                    {stage.unit === "absolute" ? "/dia" : "%"}
                                </span>
                            </p>

                            <div className="pt-3 border-t border-gray-100 flex justify-between text-xs">
                                <span className="text-gray-500">
                                    Meta: {stage.thresholds.otimo.min}+
                                    {stage.unit === "percentage" ? "%" : ""}
                                </span>
                                <button
                                    onClick={() => setEditingStage(stage.id)}
                                    className="text-[#19069E] hover:underline font-medium"
                                >
                                    Editar critérios
                                </button>
                            </div>
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
                            const value = getStageValue(stage.name);
                            const status = getPerformanceStatus(value, stage.thresholds);
                            const config = PERFORMANCE_CONFIG[status];

                            return (
                                <div
                                    key={stage.id}
                                    className={`p-5 rounded-xl bg-white border-2 ${config.borderColor} shadow-sm`}
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

                                    <p className="text-3xl font-extrabold text-amber-700 mb-3">
                                        {value !== null ? value : "—"}
                                        <span className="text-lg font-medium text-gray-500 ml-1">
                                            {stage.unit === "absolute" ? "/dia" : "%"}
                                        </span>
                                    </p>

                                    <div className="pt-3 border-t border-gray-100 flex justify-between text-xs">
                                        <span className="text-gray-500">
                                            Meta: {stage.thresholds.otimo.min}+
                                            {stage.unit === "percentage" ? "%" : ""}
                                        </span>
                                        <button
                                            onClick={() => setEditingStage(stage.id)}
                                            className="text-amber-600 hover:underline font-medium"
                                        >
                                            Editar critérios
                                        </button>
                                    </div>
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
