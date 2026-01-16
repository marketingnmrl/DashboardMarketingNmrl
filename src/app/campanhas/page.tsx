"use client";

import { useState, useMemo } from "react";
import { useStractData } from "@/hooks/useStractData";
import { useDashboardSettings } from "@/hooks/useDashboardSettings";
import { useDateFilter } from "@/contexts/DateFilterContext";
import { usePageMetrics } from "@/hooks/usePageMetrics";
import { StractDailyData } from "@/types/stract";
import DateRangePicker from "@/components/DateRangePicker";

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

// Pie Chart Component using Recharts
import {
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
} from "recharts";

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

    const CustomPieTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { label: string; value: number; color: string } }> }) => {
        if (!active || !payload || !payload.length) return null;
        const item = payload[0].payload;
        const percent = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
        return (
            <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl">
                <p className="font-bold">{item.label}</p>
                <p>{valueFormatter(item.value)} ({percent}%)</p>
            </div>
        );
    };

    return (
        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-[#19069E] mb-4">{title}</h3>
            <div className="flex items-center gap-6">
                {/* Pie */}
                <div className="w-36 h-36 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                            <Pie
                                data={data}
                                dataKey="value"
                                nameKey="label"
                                cx="50%"
                                cy="50%"
                                innerRadius={35}
                                outerRadius={60}
                                paddingAngle={2}
                                strokeWidth={0}
                            >
                                {data.map((entry, i) => (
                                    <Cell key={i} fill={entry.color} />
                                ))}
                            </Pie>
                            <RechartsTooltip content={<CustomPieTooltip />} />
                        </RechartsPieChart>
                    </ResponsiveContainer>
                </div>
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

// Line Chart Component using Recharts
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";

function LineChart({
    data,
    title,
    lines
}: {
    data: StractDailyData[];
    title: string;
    lines: { key: keyof StractDailyData; label: string; color: string }[];
}) {
    // Transform data for Recharts - use last 14 days
    const chartData = data.slice(-14).map((day) => ({
        date: String(day.date).slice(5).replace("-", "/"),
        ...lines.reduce((acc, line) => ({
            ...acc,
            [line.key]: Number(day[line.key]) || 0
        }), {} as Record<string, number>)
    }));

    const CustomLineTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) => {
        if (!active || !payload || !payload.length) return null;
        return (
            <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl">
                <p className="font-bold mb-1">{label}</p>
                {payload.map((entry, i) => {
                    const lineConfig = lines.find(l => l.key === entry.dataKey);
                    return (
                        <p key={i} className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            {lineConfig?.label || entry.dataKey}: {formatNumber(entry.value)}
                        </p>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-[#19069E] mb-4">{title}</h3>

            <div className="h-56">
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#9CA3AF", fontSize: 10 }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#9CA3AF", fontSize: 10 }}
                                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toString()}
                            />
                            <Tooltip content={<CustomLineTooltip />} cursor={{ fill: "#f3f4f6" }} />
                            <Legend
                                verticalAlign="top"
                                height={30}
                                iconType="circle"
                                formatter={(value) => {
                                    const lineConfig = lines.find(l => l.key === value);
                                    return <span className="text-gray-600 text-xs">{lineConfig?.label || value}</span>;
                                }}
                            />
                            {lines.map((line) => (
                                <Bar
                                    key={line.key}
                                    dataKey={line.key}
                                    fill={line.color}
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={30}
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
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
    const { dateRange, setCustomRange } = useDateFilter();
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

    // Calculate filtered metrics based on selected campaign
    const filteredMetrics = useMemo(() => {
        if (selectedCampaign === "all") {
            return metrics;
        }
        // Calculate metrics from filtered campaigns
        const filtered = filteredCampaignSummary;
        const totalSpend = filtered.reduce((sum, c) => sum + c.spend, 0);
        const totalImpressions = filtered.reduce((sum, c) => sum + c.impressions, 0);
        const totalLinkClicks = filtered.reduce((sum, c) => sum + c.linkClicks, 0);
        const totalLeads = filtered.reduce((sum, c) => sum + c.leads, 0);
        const totalPurchases = filtered.reduce((sum, c) => sum + c.purchases, 0);
        const avgCtr = totalImpressions > 0 ? (totalLinkClicks / totalImpressions) * 100 : 0;
        const avgRoas = totalSpend > 0 ? (totalPurchases * 100) / totalSpend : 0; // Simplified

        return {
            ...metrics,
            totalSpend,
            totalImpressions,
            totalLinkClicks,
            totalLeads,
            totalPurchases,
            avgCtr,
            avgRoas,
        };
    }, [metrics, selectedCampaign, filteredCampaignSummary]);

    // Sort campaign data
    const sortedCampaigns = useMemo(() => {
        return [...filteredCampaignSummary].sort((a, b) => {
            const aVal = a[sortColumn as keyof typeof a] as number || 0;
            const bVal = b[sortColumn as keyof typeof b] as number || 0;
            return sortDirection === "desc" ? bVal - aVal : aVal - bVal;
        });
    }, [filteredCampaignSummary, sortColumn, sortDirection]);

    // Pie chart data - use filtered campaigns
    const pieColors = ["#19069E", "#C2DF0C", "#3B28B8", "#7C3AED", "#10B981", "#F59E0B", "#EF4444", "#6366F1"];

    const spendByPie = useMemo(() => {
        const data = selectedCampaign === "all" ? campaignSummary : filteredCampaignSummary;
        return data.slice(0, 8).map((c, i) => ({
            label: c.campaignName,
            value: c.spend,
            color: pieColors[i % pieColors.length],
        }));
    }, [campaignSummary, filteredCampaignSummary, selectedCampaign]);

    const purchasesByPie = useMemo(() => {
        const data = selectedCampaign === "all" ? campaignSummary : filteredCampaignSummary;
        return data.slice(0, 8).map((c, i) => ({
            label: c.campaignName,
            value: c.purchases,
            color: pieColors[i % pieColors.length],
        }));
    }, [campaignSummary, filteredCampaignSummary, selectedCampaign]);

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

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Date Range Picker */}
                    <DateRangePicker
                        startDate={new Date(dateRange.startDate + "T00:00:00")}
                        endDate={new Date(dateRange.endDate + "T00:00:00")}
                        onChange={(start, end) => {
                            const formatDate = (d: Date) => d.toISOString().split("T")[0];
                            setCustomRange(formatDate(start), formatDate(end));
                        }}
                    />

                    {/* Campaign Filter */}
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
                <KPICard icon="payments" label="Investimento" value={hasData ? formatCurrency(filteredMetrics.totalSpend) : "—"} isLoading={isLoading} />
                <KPICard icon="visibility" label="Impressões" value={hasData ? formatNumber(filteredMetrics.totalImpressions) : "—"} isLoading={isLoading} />
                <KPICard icon="ads_click" label="Cliques" value={hasData ? formatNumber(filteredMetrics.totalLinkClicks) : "—"} isLoading={isLoading} />
                <KPICard icon="percent" label="CTR" value={hasData ? formatPercent(filteredMetrics.avgCtr) : "—"} isLoading={isLoading} />
                <KPICard icon="check_circle" label="Conversões" value={hasData ? formatNumber(filteredMetrics.totalResults) : "—"} isLoading={isLoading} />
                <KPICard icon="trending_up" label="ROAS" value={hasData ? filteredMetrics.avgRoas.toFixed(2) : "—"} isLoading={isLoading} />
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
                    data={purchasesByPie}
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
