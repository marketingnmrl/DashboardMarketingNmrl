"use client";

import { useState, useMemo } from "react";
import { useStractData } from "@/hooks/useStractData";
import { useDashboardSettings } from "@/hooks/useDashboardSettings";
import { useDateFilter } from "@/contexts/DateFilterContext";
import { usePageMetrics } from "@/hooks/usePageMetrics";
import { StractDailyData } from "@/types/stract";

// Format helpers
function formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatNumber(value: number): string {
    return new Intl.NumberFormat("pt-BR").format(Math.round(value));
}

function formatPercent(value: number): string {
    return `${value.toFixed(2)}%`;
}

// Mini KPI Card
function KPICard({
    icon,
    label,
    value,
    isLoading
}: {
    icon: string;
    label: string;
    value: string;
    isLoading?: boolean;
}) {
    return (
        <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-[#19069E] text-[20px]">{icon}</span>
                <span className="text-xs font-medium text-gray-500">{label}</span>
            </div>
            {isLoading ? (
                <div className="h-8 w-24 bg-gray-100 animate-pulse rounded"></div>
            ) : (
                <p className="text-2xl font-extrabold text-[#19069E]">{value}</p>
            )}
        </div>
    );
}

// Pie Chart Component
function PieChart({
    data,
    title,
    valueFormatter = (v) => formatCurrency(v)
}: {
    data: { label: string; value: number; color: string }[];
    title: string;
    valueFormatter?: (value: number) => string;
}) {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    let cumulativePercent = 0;

    // Generate CSS conic gradient
    const gradientStops = data.map((item) => {
        const percent = total > 0 ? (item.value / total) * 100 : 0;
        const start = cumulativePercent;
        cumulativePercent += percent;
        return `${item.color} ${start}% ${cumulativePercent}%`;
    }).join(", ");

    return (
        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-[#19069E] mb-4">{title}</h3>
            <div className="flex items-center gap-6">
                {/* Pie */}
                <div
                    className="w-32 h-32 rounded-full flex-shrink-0"
                    style={{
                        background: total > 0
                            ? `conic-gradient(${gradientStops})`
                            : "#e5e7eb"
                    }}
                />
                {/* Legend */}
                <div className="flex-1 space-y-2 max-h-32 overflow-y-auto">
                    {data.slice(0, 6).map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                            <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: item.color }}
                            />
                            <span className="text-gray-600 truncate flex-1" title={item.label}>
                                {item.label.length > 25 ? `${item.label.slice(0, 25)}...` : item.label}
                            </span>
                            <span className="font-bold text-gray-900">{valueFormatter(item.value)}</span>
                        </div>
                    ))}
                    {data.length > 6 && (
                        <p className="text-xs text-gray-400">+{data.length - 6} mais...</p>
                    )}
                </div>
            </div>
        </div>
    );
}

// Line Chart Component (simple CSS-based)
function LineChart({
    data,
    title,
    lines
}: {
    data: StractDailyData[];
    title: string;
    lines: { key: keyof StractDailyData; label: string; color: string }[];
}) {
    const maxValue = Math.max(...data.flatMap(d => lines.map(l => Number(d[l.key]) || 0)));

    return (
        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-[#19069E] mb-4">{title}</h3>

            {/* Legend */}
            <div className="flex gap-4 mb-4">
                {lines.map((line) => (
                    <div key={line.key} className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: line.color }} />
                        <span className="text-gray-600">{line.label}</span>
                    </div>
                ))}
            </div>

            {/* Chart */}
            <div className="relative h-48">
                {data.length > 0 ? (
                    <div className="flex items-end justify-between h-full gap-1">
                        {data.slice(-14).map((day, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                                {/* Bars */}
                                <div className="w-full flex gap-0.5 items-end" style={{ height: "160px" }}>
                                    {lines.map((line) => {
                                        const value = Number(day[line.key]) || 0;
                                        const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
                                        return (
                                            <div
                                                key={line.key}
                                                className="flex-1 rounded-t transition-all hover:opacity-80"
                                                style={{
                                                    height: `${Math.max(height, 2)}%`,
                                                    backgroundColor: line.color
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                                {/* Date label */}
                                <span className="text-[10px] text-gray-400 font-mono">
                                    {String(day.date).slice(8, 10)}
                                </span>
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                                    <div className="bg-gray-900 text-white text-xs rounded-lg p-2 shadow-xl whitespace-nowrap">
                                        <p className="font-bold mb-1">{day.date}</p>
                                        {lines.map((line) => (
                                            <p key={line.key}>
                                                {line.label}: {formatNumber(Number(day[line.key]) || 0)}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                        <span className="material-symbols-outlined text-4xl">show_chart</span>
                        <p className="ml-2">Sem dados para exibir</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function CampanhasPage() {
    const { settings, isLoading: settingsLoading } = useDashboardSettings();
    const { dateRange } = useDateFilter();
    const [selectedCampaign, setSelectedCampaign] = useState<string>("all");
    const [sortColumn, setSortColumn] = useState<string>("spend");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

    const {
        metrics,
        dailyData,
        campaignSummary,
        isLoading: dataLoading,
        error,
    } = useStractData(settings?.visaoGeralSheetUrl, {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
    });

    const isLoading = settingsLoading || dataLoading;
    const hasData = !error && metrics.totalImpressions > 0;

    // Provide metrics for AI Assistant
    usePageMetrics({
        pagina: "Acompanhamento de Campanhas",
        descricao: "Análise detalhada de performance por campanha e criativo",
        periodo: `${dateRange.startDate} a ${dateRange.endDate}`,
        kpis: {
            investimento_total: metrics.totalSpend,
            impressoes: metrics.totalImpressions,
            cliques: metrics.totalLinkClicks,
            ctr: metrics.avgCtr,
            conversoes: metrics.totalResults,
            roas: metrics.avgRoas,
        },
    });

    // Filter campaigns if one is selected
    const filteredCampaignSummary = useMemo(() => {
        if (selectedCampaign === "all") return campaignSummary;
        return campaignSummary.filter(c => c.campaignName === selectedCampaign);
    }, [campaignSummary, selectedCampaign]);

    // Sort campaign data
    const sortedCampaigns = useMemo(() => {
        return [...filteredCampaignSummary].sort((a, b) => {
            const aVal = a[sortColumn as keyof typeof a] as number || 0;
            const bVal = b[sortColumn as keyof typeof b] as number || 0;
            return sortDirection === "desc" ? bVal - aVal : aVal - bVal;
        });
    }, [filteredCampaignSummary, sortColumn, sortDirection]);

    // Pie chart data
    const pieColors = ["#19069E", "#C2DF0C", "#3B28B8", "#7C3AED", "#10B981", "#F59E0B", "#EF4444", "#6366F1"];

    const spendByPie = useMemo(() => {
        return campaignSummary.slice(0, 8).map((c, i) => ({
            label: c.campaignName,
            value: c.spend,
            color: pieColors[i % pieColors.length],
        }));
    }, [campaignSummary]);

    const resultsByPie = useMemo(() => {
        return campaignSummary.slice(0, 8).map((c, i) => ({
            label: c.campaignName,
            value: c.results,
            color: pieColors[i % pieColors.length],
        }));
    }, [campaignSummary]);

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === "desc" ? "asc" : "desc");
        } else {
            setSortColumn(column);
            setSortDirection("desc");
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#19069E]">📊 Acompanhamento de Campanhas</h1>
                    <p className="text-sm text-gray-500">Análise detalhada de performance por campanha e criativo</p>
                </div>

                {/* Campaign Filter */}
                <div className="flex items-center gap-3">
                    <select
                        value={selectedCampaign}
                        onChange={(e) => setSelectedCampaign(e.target.value)}
                        className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:ring-2 focus:ring-[#19069E]/20 focus:border-[#19069E]"
                    >
                        <option value="all">Todas as Campanhas</option>
                        {campaignSummary.map((c) => (
                            <option key={c.campaignName} value={c.campaignName}>
                                {c.campaignName}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700">
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-red-500">error</span>
                        <div>
                            <p className="font-bold">Erro ao carregar dados</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* No Sheet Warning */}
            {!settings?.visaoGeralSheetUrl && !settingsLoading && (
                <div className="p-4 rounded-2xl bg-yellow-50 border border-yellow-200 text-yellow-700">
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-yellow-500">info</span>
                        <div>
                            <p className="font-bold">Planilha não configurada</p>
                            <p className="text-sm">Configure a URL do Google Sheets nas configurações.</p>
                            <a href="/configuracoes" className="text-sm font-bold text-[#19069E] hover:underline">
                                Ir para Configurações →
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Row 1: KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <KPICard icon="payments" label="Investimento" value={hasData ? formatCurrency(metrics.totalSpend) : "—"} isLoading={isLoading} />
                <KPICard icon="visibility" label="Impressões" value={hasData ? formatNumber(metrics.totalImpressions) : "—"} isLoading={isLoading} />
                <KPICard icon="ads_click" label="Cliques" value={hasData ? formatNumber(metrics.totalLinkClicks) : "—"} isLoading={isLoading} />
                <KPICard icon="percent" label="CTR" value={hasData ? formatPercent(metrics.avgCtr) : "—"} isLoading={isLoading} />
                <KPICard icon="check_circle" label="Conversões" value={hasData ? formatNumber(metrics.totalResults) : "—"} isLoading={isLoading} />
                <KPICard icon="trending_up" label="ROAS" value={hasData ? metrics.avgRoas.toFixed(2) : "—"} isLoading={isLoading} />
            </div>

            {/* Row 2: Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Line Chart: Daily Evolution */}
                <LineChart
                    data={dailyData}
                    title="📈 Evolução Diária"
                    lines={[
                        { key: "spend", label: "Investimento (R$)", color: "#19069E" },
                        { key: "clicks", label: "Cliques", color: "#C2DF0C" },
                    ]}
                />

                {/* Line Chart: Impressions vs Clicks */}
                <LineChart
                    data={dailyData}
                    title="👁️ Impressões vs Cliques"
                    lines={[
                        { key: "impressions", label: "Impressões", color: "#3B28B8" },
                        { key: "linkClicks", label: "Cliques no Link", color: "#10B981" },
                    ]}
                />
            </div>

            {/* Row 3: Pie Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PieChart
                    data={spendByPie}
                    title="💰 Investimento por Campanha"
                    valueFormatter={formatCurrency}
                />
                <PieChart
                    data={resultsByPie}
                    title="🎯 Conversões por Campanha"
                    valueFormatter={formatNumber}
                />
            </div>

            {/* Row 4: Campaign Table */}
            <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-[#19069E] mb-4">📋 Detalhes por Campanha</h3>

                {isLoading ? (
                    <div className="h-48 flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-gray-300 animate-pulse">hourglass_empty</span>
                    </div>
                ) : sortedCampaigns.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-2 font-bold text-gray-700">Campanha</th>
                                    {[
                                        { key: "spend", label: "Investimento" },
                                        { key: "impressions", label: "Impressões" },
                                        { key: "linkClicks", label: "Cliques" },
                                        { key: "ctr", label: "CTR" },
                                        { key: "leads", label: "Leads" },
                                        { key: "cpc", label: "CPC" },
                                        { key: "cpl", label: "CPL" },
                                    ].map((col) => (
                                        <th
                                            key={col.key}
                                            className="text-right py-3 px-2 font-bold text-gray-700 cursor-pointer hover:text-[#19069E] transition-colors"
                                            onClick={() => handleSort(col.key)}
                                        >
                                            <div className="flex items-center justify-end gap-1">
                                                {col.label}
                                                {sortColumn === col.key && (
                                                    <span className="material-symbols-outlined text-[16px]">
                                                        {sortDirection === "desc" ? "arrow_downward" : "arrow_upward"}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {sortedCampaigns.map((campaign, i) => (
                                    <tr
                                        key={campaign.campaignName}
                                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                                    >
                                        <td className="py-3 px-2">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                                    style={{ backgroundColor: pieColors[i % pieColors.length] }}
                                                />
                                                <span className="font-medium text-gray-900" title={campaign.campaignName}>
                                                    {campaign.campaignName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="text-right py-3 px-2 font-bold text-[#19069E]">{formatCurrency(campaign.spend)}</td>
                                        <td className="text-right py-3 px-2">{formatNumber(campaign.impressions)}</td>
                                        <td className="text-right py-3 px-2">{formatNumber(campaign.linkClicks)}</td>
                                        <td className="text-right py-3 px-2">{formatPercent(campaign.ctr)}</td>
                                        <td className="text-right py-3 px-2">{formatNumber(campaign.leads)}</td>
                                        <td className="text-right py-3 px-2">{formatCurrency(campaign.cpc)}</td>
                                        <td className="text-right py-3 px-2">{formatCurrency(campaign.cpl)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="h-48 flex items-center justify-center text-gray-400">
                        <div className="text-center">
                            <span className="material-symbols-outlined text-4xl">table_chart</span>
                            <p className="mt-2">Nenhuma campanha encontrada</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Row 5: Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#19069E] to-[#3B28B8] text-white">
                    <p className="text-sm opacity-80">Total de Campanhas</p>
                    <p className="text-3xl font-extrabold">{campaignSummary.length}</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#C2DF0C] to-[#B0CC0B] text-[#19069E]">
                    <p className="text-sm opacity-80">Investimento Médio/Campanha</p>
                    <p className="text-3xl font-extrabold">
                        {campaignSummary.length > 0
                            ? formatCurrency(metrics.totalSpend / campaignSummary.length)
                            : "—"}
                    </p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 text-white">
                    <p className="text-sm opacity-80">Melhor CTR</p>
                    <p className="text-3xl font-extrabold">
                        {campaignSummary.length > 0
                            ? formatPercent(Math.max(...campaignSummary.map(c => c.ctr)))
                            : "—"}
                    </p>
                </div>
            </div>
        </div>
    );
}
