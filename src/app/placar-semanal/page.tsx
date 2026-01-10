"use client";

import { useState, useEffect, useCallback } from "react";
import DateRangePicker from "@/components/DateRangePicker";
import { usePageMetrics } from "@/hooks/usePageMetrics";

// Scorecard data type
interface ScorecardData {
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

// Scorecard Section Component
function ScorecardSection({
    title,
    emoji,
    subtitle,
    bgColor,
    borderColor,
    children,
}: {
    title: string;
    emoji: string;
    subtitle: string;
    bgColor: string;
    borderColor: string;
    children: React.ReactNode;
}) {
    return (
        <div className={`rounded-2xl border-2 ${borderColor} ${bgColor} overflow-hidden`}>
            <div className="p-5 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">{emoji}</span>
                    <div>
                        <h3 className="font-bold text-lg text-gray-900">{title}</h3>
                        <p className="text-sm text-gray-500">{subtitle}</p>
                    </div>
                </div>
            </div>
            <div className="p-5">
                {children}
            </div>
        </div>
    );
}

// Metric Item Component
function MetricItem({
    label,
    value,
    target,
    icon,
    status,
    suffix = "",
}: {
    label: string;
    value: number | string | null;
    target?: number | string;
    icon: string;
    status?: "success" | "warning" | "danger" | "neutral";
    suffix?: string;
}) {
    const statusColors = {
        success: "bg-green-100 text-green-700 border-green-200",
        warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
        danger: "bg-red-100 text-red-700 border-red-200",
        neutral: "bg-gray-100 text-gray-700 border-gray-200",
    };

    const statusIcons = {
        success: "check_circle",
        warning: "warning",
        danger: "error",
        neutral: "help",
    };

    return (
        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-[#19069E]/10 rounded-lg">
                    <span className="material-symbols-outlined text-[#19069E]">{icon}</span>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-600">{label}</p>
                    {target && (
                        <p className="text-xs text-gray-400">Meta: {target}{suffix}</p>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-[#19069E]">
                    {value !== null ? `${value}${suffix}` : "—"}
                </span>
                {status && (
                    <span className={`p-1 rounded-lg border ${statusColors[status]}`}>
                        <span className="material-symbols-outlined text-[18px]">{statusIcons[status]}</span>
                    </span>
                )}
            </div>
        </div>
    );
}

// Checklist Item Component
function ChecklistItem({
    label,
    checked,
    count,
    target,
}: {
    label: string;
    checked: boolean;
    count?: number;
    target?: number;
}) {
    return (
        <div
            className={`flex items-center justify-between p-4 bg-white rounded-xl border-2 transition-all ${checked
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200"
                }`}
        >
            <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${checked
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}>
                    <span className="material-symbols-outlined text-[18px]">
                        {checked ? "check" : "close"}
                    </span>
                </div>
                <span className={`font-medium ${checked ? "text-green-700" : "text-gray-700"}`}>
                    {label}
                </span>
            </div>
            {count !== undefined && target !== undefined && (
                <span className={`text-sm font-bold ${checked ? "text-green-600" : "text-gray-500"}`}>
                    {count}/{target}
                </span>
            )}
        </div>
    );
}

// Sheets Config Modal
function SheetsConfigModal({
    currentUrl,
    onSave,
    onClose,
}: {
    currentUrl: string;
    onSave: (url: string) => void;
    onClose: () => void;
}) {
    const [url, setUrl] = useState(currentUrl);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-[#19069E]">Conectar Planilha</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                    Cole a URL da sua planilha Google Sheets. Certifique-se de que ela está <strong>pública</strong>.
                </p>

                <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm mb-4 focus:ring-2 focus:ring-[#19069E] focus:border-transparent"
                />

                {/* Download Template */}
                <div className="p-4 bg-gray-50 rounded-xl mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">📋 Formato da planilha:</p>
                    <p className="text-xs text-gray-500 mb-3">
                        Colunas: date, seguidores_ganhos, custo_por_seguidor, media_views_reel,
                        retencao_media, cliques_link_bio, leads_gerados, reels_postados, reels_impulsionados
                    </p>
                    <a
                        href="/modelo-placar-semanal.csv"
                        download="modelo-placar-semanal.csv"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#19069E] text-white rounded-lg text-sm font-medium hover:bg-[#2D1AAF] transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">download</span>
                        Baixar Modelo CSV
                    </a>
                </div>

                <div className="flex gap-3">
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

export default function PlacarSemanalPage() {
    // Date range state - defaults to current week
    const getWeekStart = () => {
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(now.setDate(diff));
        monday.setHours(0, 0, 0, 0);
        return monday;
    };

    const getWeekEnd = () => {
        const monday = getWeekStart();
        const sunday = new Date(monday);
        sunday.setDate(sunday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);
        return sunday;
    };

    const [dateRange, setDateRange] = useState({
        start: getWeekStart(),
        end: getWeekEnd(),
    });

    // Sheets config
    const [sheetsUrl, setSheetsUrl] = useState<string>("");
    const [showSheetsConfig, setShowSheetsConfig] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [rawData, setRawData] = useState<ScorecardData[]>([]);

    // Load sheets URL from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("scorecard_sheets_url");
        if (saved) setSheetsUrl(saved);
    }, []);

    // Save sheets URL to localStorage
    const handleSaveUrl = (url: string) => {
        setSheetsUrl(url);
        localStorage.setItem("scorecard_sheets_url", url);
    };

    // Parse date from DD/MM/YYYY format
    const parseDate = useCallback((dateStr: string): Date | null => {
        if (!dateStr) return null;
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            const [day, month, year] = parts.map(p => parseInt(p));
            return new Date(year, month - 1, day);
        }
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? null : d;
    }, []);

    // Check if date is in range
    const isDateInRange = useCallback((dateStr: string): boolean => {
        const date = parseDate(dateStr);
        if (!date) return false;
        date.setHours(0, 0, 0, 0);
        const start = new Date(dateRange.start);
        start.setHours(0, 0, 0, 0);
        const end = new Date(dateRange.end);
        end.setHours(23, 59, 59, 999);
        return date >= start && date <= end;
    }, [parseDate, dateRange]);

    // Fetch data from API
    const fetchData = useCallback(async () => {
        if (!sheetsUrl) return;

        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/scorecard?url=${encodeURIComponent(sheetsUrl)}&t=${Date.now()}`);
            const result = await res.json();
            if (result.error) throw new Error(result.error);
            setRawData(result.data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao buscar dados");
            setRawData([]);
        } finally {
            setIsLoading(false);
        }
    }, [sheetsUrl]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Filter and aggregate data for selected period
    const metrics = useCallback(() => {
        const filtered = rawData.filter(d => isDateInRange(d.date));

        if (filtered.length === 0) {
            return {
                seguidoresGanhos: 0,
                custoPorSeguidor: 0,
                mediaViewsReel: 0,
                retencaoMedia: 0,
                cliquesLinkBio: 0,
                leadsGerados: 0,
                reelsPostados: 0,
                reelsImpulsionados: 0,
            };
        }

        // Sum/average depending on metric type
        const sum = (key: keyof ScorecardData) =>
            filtered.reduce((acc, d) => acc + (typeof d[key] === 'number' ? d[key] as number : 0), 0);

        const avg = (key: keyof ScorecardData) => {
            const total = sum(key);
            return filtered.length > 0 ? total / filtered.length : 0;
        };

        return {
            seguidoresGanhos: sum('seguidoresGanhos'),
            custoPorSeguidor: avg('custoPorSeguidor'),
            mediaViewsReel: Math.round(avg('mediaViewsReel')),
            retencaoMedia: Math.round(avg('retencaoMedia')),
            cliquesLinkBio: sum('cliquesLinkBio'),
            leadsGerados: sum('leadsGerados'),
            reelsPostados: sum('reelsPostados'),
            reelsImpulsionados: sum('reelsImpulsionados'),
        };
    }, [rawData, isDateInRange])();

    // Page metrics for AI
    usePageMetrics({
        pagina: "Placar Semanal",
        descricao: "Métricas semanais de execução, crescimento, atenção e tráfego do Instagram",
        periodo: `${dateRange.start.toLocaleDateString("pt-BR")} - ${dateRange.end.toLocaleDateString("pt-BR")}`,
        kpis: {
            reels_postados: metrics.reelsPostados,
            reels_impulsionados: metrics.reelsImpulsionados,
            seguidores_ganhos: metrics.seguidoresGanhos,
            custo_por_seguidor: `R$ ${metrics.custoPorSeguidor.toFixed(2)}`,
            media_views_reel: metrics.mediaViewsReel,
            retencao_media: `${metrics.retencaoMedia}%`,
            cliques_link_bio: metrics.cliquesLinkBio,
            leads_gerados: metrics.leadsGerados,
        },
    });

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#19069E]">Placar Semanal</h1>
                    <p className="text-gray-500">Acompanhe o desempenho semanal do Instagram</p>
                </div>
                <div className="flex items-center gap-3">
                    <DateRangePicker
                        startDate={dateRange.start}
                        endDate={dateRange.end}
                        onChange={(start, end) => setDateRange({ start, end })}
                    />
                    <button
                        onClick={() => setShowSheetsConfig(true)}
                        className={`p-2.5 rounded-xl border-2 transition-colors ${sheetsUrl
                                ? "bg-green-50 border-green-200 text-green-600"
                                : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                            }`}
                        title={sheetsUrl ? "Planilha conectada" : "Conectar planilha"}
                    >
                        <span className="material-symbols-outlined">{sheetsUrl ? "link" : "add_link"}</span>
                    </button>
                    {sheetsUrl && (
                        <button
                            onClick={fetchData}
                            disabled={isLoading}
                            className="p-2.5 rounded-xl bg-blue-50 border-2 border-blue-200 text-blue-600 hover:bg-blue-100 disabled:opacity-50"
                            title="Atualizar dados"
                        >
                            <span className={`material-symbols-outlined ${isLoading ? "animate-spin" : ""}`}>
                                refresh
                            </span>
                        </button>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    <span className="material-symbols-outlined align-middle mr-2">error</span>
                    {error}
                </div>
            )}

            {/* No Data Message */}
            {!sheetsUrl && (
                <div className="p-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl text-center">
                    <span className="material-symbols-outlined text-4xl text-gray-400 mb-3">table_chart</span>
                    <h3 className="text-lg font-bold text-gray-700 mb-2">Conecte uma planilha</h3>
                    <p className="text-sm text-gray-500 mb-4">
                        Para ver seus dados reais, conecte uma planilha Google Sheets
                    </p>
                    <div className="flex justify-center gap-3">
                        <button
                            onClick={() => setShowSheetsConfig(true)}
                            className="px-4 py-2 bg-[#19069E] text-white rounded-lg font-medium hover:bg-[#2D1AAF] transition-colors"
                        >
                            Conectar Planilha
                        </button>
                        <a
                            href="/modelo-placar-semanal.csv"
                            download="modelo-placar-semanal.csv"
                            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">download</span>
                            Baixar Modelo
                        </a>
                    </div>
                </div>
            )}

            {/* Scorecards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Placar de Execução */}
                <ScorecardSection
                    title="Execução"
                    emoji="📝"
                    subtitle="O básico bem feito"
                    bgColor="bg-purple-50"
                    borderColor="border-purple-200"
                >
                    <div className="space-y-3">
                        <ChecklistItem
                            label="Postamos 4 Reels esta semana?"
                            checked={metrics.reelsPostados >= 4}
                            count={metrics.reelsPostados}
                            target={4}
                        />
                        <ChecklistItem
                            label="Impulsionamos os Reels planejados?"
                            checked={metrics.reelsImpulsionados >= metrics.reelsPostados && metrics.reelsPostados > 0}
                            count={metrics.reelsImpulsionados}
                            target={metrics.reelsPostados || 4}
                        />

                        {metrics.reelsPostados >= 4 && metrics.reelsImpulsionados >= metrics.reelsPostados && (
                            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                                <div className="flex items-center gap-2 text-green-700">
                                    <span className="material-symbols-outlined">check_circle</span>
                                    <span className="font-medium text-sm">Execução em dia! 🎯</span>
                                </div>
                            </div>
                        )}
                    </div>
                </ScorecardSection>

                {/* 2. Placar de Crescimento */}
                <ScorecardSection
                    title="Crescimento"
                    emoji="📈"
                    subtitle="Fama e audiência"
                    bgColor="bg-green-50"
                    borderColor="border-green-200"
                >
                    <div className="space-y-3">
                        <MetricItem
                            label="Seguidores ganhos na semana"
                            value={metrics.seguidoresGanhos}
                            target="100+"
                            icon="group_add"
                            status={metrics.seguidoresGanhos >= 100 ? "success" : metrics.seguidoresGanhos > 0 ? "warning" : "neutral"}
                        />
                        <MetricItem
                            label="Custo por seguidor"
                            value={`R$ ${metrics.custoPorSeguidor.toFixed(2)}`}
                            target="< R$ 1,00"
                            icon="payments"
                            status={metrics.custoPorSeguidor > 0 && metrics.custoPorSeguidor <= 1
                                ? "success"
                                : metrics.custoPorSeguidor > 1
                                    ? "danger"
                                    : "neutral"
                            }
                        />

                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                            <p className="text-xs text-blue-600">
                                💡 Se seguidores sobem e o custo não explode, está no caminho certo.
                            </p>
                        </div>
                    </div>
                </ScorecardSection>

                {/* 3. Placar de Atenção */}
                <ScorecardSection
                    title="Atenção"
                    emoji="👀"
                    subtitle="Conteúdo funcionando"
                    bgColor="bg-orange-50"
                    borderColor="border-orange-200"
                >
                    <div className="space-y-3">
                        <MetricItem
                            label="Média de views por Reel"
                            value={metrics.mediaViewsReel.toLocaleString("pt-BR")}
                            target="2.000+"
                            icon="visibility"
                            status={metrics.mediaViewsReel >= 2000
                                ? "success"
                                : metrics.mediaViewsReel > 0
                                    ? "warning"
                                    : "neutral"
                            }
                        />
                        <MetricItem
                            label="Retenção / Tempo médio assistido"
                            value={metrics.retencaoMedia}
                            target="40%+"
                            icon="timer"
                            status={metrics.retencaoMedia >= 40
                                ? "success"
                                : metrics.retencaoMedia > 0
                                    ? "warning"
                                    : "neutral"
                            }
                            suffix="%"
                        />

                        <div className="p-3 bg-orange-100 border border-orange-200 rounded-xl">
                            <p className="text-xs text-orange-700">
                                🎬 Views altos + boa retenção = algoritmo te amando.
                            </p>
                        </div>
                    </div>
                </ScorecardSection>

                {/* 4. Placar de Tráfego */}
                <ScorecardSection
                    title="Tráfego"
                    emoji="🎯"
                    subtitle="Ponte para o funil"
                    bgColor="bg-blue-50"
                    borderColor="border-blue-200"
                >
                    <div className="space-y-3">
                        <MetricItem
                            label="Cliques no link da bio / CTAs"
                            value={metrics.cliquesLinkBio}
                            target="50+"
                            icon="link"
                            status={metrics.cliquesLinkBio >= 50
                                ? "success"
                                : metrics.cliquesLinkBio > 0
                                    ? "warning"
                                    : "neutral"
                            }
                        />
                        <MetricItem
                            label="Leads gerados a partir do Instagram"
                            value={metrics.leadsGerados}
                            target="10+"
                            icon="person_add"
                            status={metrics.leadsGerados >= 10
                                ? "success"
                                : metrics.leadsGerados > 0
                                    ? "warning"
                                    : "neutral"
                            }
                        />

                        <div className="p-4 bg-white border border-gray-200 rounded-xl">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Taxa de conversão (clique → lead)</span>
                                <span className="font-bold text-[#19069E]">
                                    {metrics.cliquesLinkBio > 0
                                        ? `${((metrics.leadsGerados / metrics.cliquesLinkBio) * 100).toFixed(1)}%`
                                        : "—"
                                    }
                                </span>
                            </div>
                        </div>
                    </div>
                </ScorecardSection>
            </div>

            {/* Weekly Summary */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#19069E] to-[#2D1AAF] text-white">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">🏆</span>
                    <h3 className="text-xl font-bold">Resumo da Semana</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-white/10 rounded-xl">
                        <p className="text-white/70 text-sm">Execução</p>
                        <p className="text-2xl font-bold">
                            {metrics.reelsPostados >= 4 ? "✅" : `${metrics.reelsPostados}/4`}
                        </p>
                    </div>
                    <div className="p-4 bg-white/10 rounded-xl">
                        <p className="text-white/70 text-sm">Crescimento</p>
                        <p className="text-2xl font-bold">+{metrics.seguidoresGanhos}</p>
                    </div>
                    <div className="p-4 bg-white/10 rounded-xl">
                        <p className="text-white/70 text-sm">Atenção</p>
                        <p className="text-2xl font-bold">{metrics.retencaoMedia}%</p>
                    </div>
                    <div className="p-4 bg-white/10 rounded-xl">
                        <p className="text-white/70 text-sm">Leads</p>
                        <p className="text-2xl font-bold">{metrics.leadsGerados}</p>
                    </div>
                </div>
            </div>

            {/* Sheets Config Modal */}
            {showSheetsConfig && (
                <SheetsConfigModal
                    currentUrl={sheetsUrl}
                    onSave={handleSaveUrl}
                    onClose={() => setShowSheetsConfig(false)}
                />
            )}
        </div>
    );
}
