"use client";

import { useState, useMemo } from "react";
import { useStractData } from "@/hooks/useStractData";
import { useDashboardSettings } from "@/hooks/useDashboardSettings";
import { useDateFilter } from "@/contexts/DateFilterContext";
import { usePageMetrics } from "@/hooks/usePageMetrics";
import { StractDailyData } from "@/types/stract";
import DateRangePicker from "@/components/DateRangePicker";
import {
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ComposedChart,
    Area,
    Line,
    Funnel,
    FunnelChart,
    LabelList,
} from "recharts";

// Format helpers
function formatCurrency(value: number): string {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatNumber(value: number): string {
    return value.toLocaleString("pt-BR");
}

function formatPercent(value: number): string {
    return `${value.toFixed(2)}%`;
}

// Executive KPI Card - Larger and more prominent
function ExecutiveKPI({
    label,
    value,
    subvalue,
    icon,
    trend,
    color = "primary",
    isLoading
}: {
    label: string;
    value: string;
    subvalue?: string;
    icon: string;
    trend?: "up" | "down" | "neutral";
    color?: "primary" | "accent" | "success" | "warning";
    isLoading?: boolean;
}) {
    const colorClasses = {
        primary: "from-[#19069E] to-[#3B28B8] text-white",
        accent: "from-[#C2DF0C] to-[#B0CC0B] text-[#19069E]",
        success: "from-emerald-500 to-emerald-600 text-white",
        warning: "from-amber-500 to-amber-600 text-white",
    };

    return (
        <div className={`p-5 rounded-2xl bg-gradient-to-br ${colorClasses[color]} shadow-lg`}>
            {isLoading ? (
                <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-white/30 rounded w-20" />
                    <div className="h-8 bg-white/30 rounded w-28" />
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium opacity-80">{label}</span>
                        <span className="material-symbols-outlined text-xl opacity-60">{icon}</span>
                    </div>
                    <p className="text-3xl font-extrabold">{value}</p>
                    {subvalue && <p className="text-xs mt-1 opacity-70">{subvalue}</p>}
                </>
            )}
        </div>
    );
}

// Mini KPI Card for secondary metrics
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
            {isLoading ? (
                <div className="animate-pulse space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-16" />
                    <div className="h-6 bg-gray-200 rounded w-20" />
                </div>
            ) : (
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#19069E] text-xl">{icon}</span>
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
                        <p className="text-lg font-bold text-gray-900">{value}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

// Funnel Stage Card
function FunnelStage({
    label,
    value,
    rate,
    icon,
    color,
    isFirst = false
}: {
    label: string;
    value: number;
    rate?: number;
    icon: string;
    color: string;
    isFirst?: boolean;
}) {
    return (
        <div className="flex-1 relative">
            {!isFirst && (
                <div className="absolute -left-4 top-1/2 -translate-y-1/2 text-gray-300">
                    <span className="material-symbols-outlined">arrow_forward</span>
                </div>
            )}
            <div className="text-center p-3 rounded-xl bg-white border border-gray-200">
                <span className="material-symbols-outlined text-2xl" style={{ color }}>{icon}</span>
                <p className="text-xs text-gray-500 mt-1">{label}</p>
                <p className="text-lg font-bold text-gray-900">{formatNumber(value)}</p>
                {rate !== undefined && (
                    <p className="text-xs font-medium" style={{ color }}>{rate.toFixed(1)}%</p>
                )}
            </div>
        </div>
    );
}

// Custom Tooltip for PieChart
const CustomPieTooltip = ({ active, payload, total, valueFormatter }: {
    active?: boolean;
    payload?: Array<{ payload: { label: string; value: number; color: string } }>;
    total: number;
    valueFormatter: (v: number) => string;
}) => {
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

// Pie Chart Component using Recharts
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

    return (
        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-[#19069E] mb-4">{title}</h3>
            <div className="flex items-center gap-6">
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
                            <RechartsTooltip content={<CustomPieTooltip total={total} valueFormatter={valueFormatter} />} />
                        </RechartsPieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2 max-h-32 overflow-y-auto">
                    {data.slice(0, 6).map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="text-gray-600 truncate flex-1" title={item.label}>
                                {item.label.length > 20 ? `${item.label.slice(0, 20)}...` : item.label}
                            </span>
                            <span className="font-bold text-gray-900">{valueFormatter(item.value)}</span>
                        </div>
                    ))}
                    {data.length > 6 && <p className="text-xs text-gray-400">+{data.length - 6} mais...</p>}
                </div>
            </div>
        </div>
    );
}

// ROAS Trend Chart
function ROASTrendChart({ dailyData, isLoading }: { dailyData: StractDailyData[]; isLoading: boolean }) {
    const chartData = dailyData.slice(-14).map((d) => ({
        date: String(d.date).slice(5).replace("-", "/"),
        spend: d.spend,
        revenue: d.purchaseValue,
        roas: d.spend > 0 ? d.purchaseValue / d.spend : 0,
    }));

    return (
        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-[#19069E] mb-4">📈 Tendência ROAS</h3>
            <div className="h-56">
                {isLoading ? (
                    <div className="h-full bg-gray-100 animate-pulse rounded-lg" />
                ) : dailyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="roasGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#C2DF0C" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#C2DF0C" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 10 }} />
                            <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 10 }} />
                            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 10 }} />
                            <Tooltip
                                content={({ active, payload, label }) => {
                                    if (!active || !payload) return null;
                                    return (
                                        <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl">
                                            <p className="font-bold mb-1">{label}</p>
                                            {payload.map((p, i) => (
                                                <p key={i}>{p.name}: {p.name === "ROAS" ? `${Number(p.value).toFixed(2)}x` : formatCurrency(Number(p.value))}</p>
                                            ))}
                                        </div>
                                    );
                                }}
                            />
                            <Legend verticalAlign="top" height={30} />
                            <Bar yAxisId="left" dataKey="spend" name="Investimento" fill="#19069E" radius={[4, 4, 0, 0]} maxBarSize={25} />
                            <Area yAxisId="left" type="monotone" dataKey="revenue" name="Faturamento" stroke="#C2DF0C" fill="url(#roasGradient)" strokeWidth={2} />
                            <Line yAxisId="right" type="monotone" dataKey="roas" name="ROAS" stroke="#10B981" strokeWidth={3} dot={{ fill: "#10B981", r: 4 }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">Sem dados</div>
                )}
            </div>
        </div>
    );
}

// Heatmap color based on value relative to average
function getHeatmapColor(value: number, avg: number, isGoodWhenHigh: boolean): string {
    if (avg === 0) return "bg-gray-50";
    const ratio = value / avg;
    if (isGoodWhenHigh) {
        if (ratio >= 1.2) return "bg-emerald-100 text-emerald-700";
        if (ratio >= 0.8) return "bg-yellow-50 text-yellow-700";
        return "bg-red-50 text-red-600";
    } else {
        if (ratio <= 0.8) return "bg-emerald-100 text-emerald-700";
        if (ratio <= 1.2) return "bg-yellow-50 text-yellow-700";
        return "bg-red-50 text-red-600";
    }
}

export default function CampanhasPage() {
    const { settings, isLoading: settingsLoading } = useDashboardSettings();
    const { dateRange, setCustomRange } = useDateFilter();
    const [selectedAccount, setSelectedAccount] = useState<string>("");
    const [selectedCampaign, setSelectedCampaign] = useState<string>("all");
    const [sortColumn, setSortColumn] = useState<string>("spend");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

    const {
        metrics,
        dailyData,
        campaignSummary,
        filteredData,
        uniqueAccounts,
        isLoading: dataLoading,
        error,
    } = useStractData(settings?.visaoGeralSheetUrl, {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        accountName: selectedAccount || undefined,
    });

    // Top Creatives aggregated by adName with thumbnails - filtered by selected campaign
    const topCreatives = useMemo(() => {
        if (!filteredData || filteredData.length === 0) return [];

        // Filter by selected campaign if not "all"
        const dataToUse = selectedCampaign === "all"
            ? filteredData
            : filteredData.filter(row => row.campaignName === selectedCampaign);

        if (dataToUse.length === 0) return [];

        const byAd = new Map<string, {
            adName: string;
            thumbnailUrl: string;
            videoUrl: string;
            campaignName: string;
            spend: number;
            impressions: number;
            linkClicks: number;
            leads: number;
            purchases: number;
            purchaseValue: number;
            postEngagement: number;
            postReactions: number;
            postComments: number;
            postShares: number;
        }>();

        dataToUse.forEach(row => {
            const key = row.adName || 'Sem nome';
            const existing = byAd.get(key);
            if (existing) {
                existing.spend += row.spend || 0;
                existing.impressions += row.impressions || 0;
                existing.linkClicks += row.linkClicks || 0;
                existing.leads += row.leads || 0;
                existing.purchases += row.purchases || 0;
                existing.purchaseValue += row.purchaseValue || 0;
                existing.postEngagement += row.postEngagement || 0;
                existing.postReactions += row.postReactions || 0;
                existing.postComments += row.postComments || 0;
                existing.postShares += row.postShares || 0;
                // Keep first thumbnail/video found
                if (!existing.thumbnailUrl && row.thumbnailUrl) {
                    existing.thumbnailUrl = row.thumbnailUrl;
                }
                if (!existing.videoUrl && row.videoUrl) {
                    existing.videoUrl = row.videoUrl;
                }
            } else {
                byAd.set(key, {
                    adName: key,
                    thumbnailUrl: row.thumbnailUrl || '',
                    videoUrl: row.videoUrl || '',
                    campaignName: row.campaignName || '',
                    spend: row.spend || 0,
                    impressions: row.impressions || 0,
                    linkClicks: row.linkClicks || 0,
                    leads: row.leads || 0,
                    purchases: row.purchases || 0,
                    purchaseValue: row.purchaseValue || 0,
                    postEngagement: row.postEngagement || 0,
                    postReactions: row.postReactions || 0,
                    postComments: row.postComments || 0,
                    postShares: row.postShares || 0,
                });
            }
        });

        return Array.from(byAd.values())
            .map(ad => ({
                ...ad,
                roas: ad.spend > 0 ? ad.purchaseValue / ad.spend : 0,
                ctr: ad.impressions > 0 ? (ad.linkClicks / ad.impressions) * 100 : 0,
                conversions: ad.leads + ad.purchases,
                totalEngagement: ad.linkClicks + ad.postEngagement,
            }))
            // Sort by ENGAGEMENT (clicks + post engagement)
            .sort((a, b) => b.totalEngagement - a.totalEngagement)
            .slice(0, 6);
    }, [filteredData, selectedCampaign]);

    // State for creative preview modal
    const [selectedCreative, setSelectedCreative] = useState<typeof topCreatives[0] | null>(null);

    const isLoading = settingsLoading || dataLoading;
    const hasData = !error && metrics.totalImpressions > 0;

    // Calculate filtered metrics based on selected campaign
    const filteredMetrics = useMemo(() => {
        if (selectedCampaign === "all") {
            return metrics;
        }

        // Filter raw data by campaign
        const campData = filteredData.filter(row => row.campaignName === selectedCampaign);
        if (campData.length === 0) return metrics;

        // Aggregate filtered data
        const totalSpend = campData.reduce((sum, r) => sum + (r.spend || 0), 0);
        const totalImpressions = campData.reduce((sum, r) => sum + (r.impressions || 0), 0);
        const totalLinkClicks = campData.reduce((sum, r) => sum + (r.linkClicks || 0), 0);
        const totalLandingPageViews = campData.reduce((sum, r) => sum + (r.landingPageViews || 0), 0);
        const totalCheckouts = campData.reduce((sum, r) => sum + (r.checkouts || 0), 0);
        const totalPurchases = campData.reduce((sum, r) => sum + (r.purchases || 0), 0);
        const totalPurchaseValue = campData.reduce((sum, r) => sum + (r.purchaseValue || 0), 0);
        const totalLeads = campData.reduce((sum, r) => sum + (r.leads || 0), 0);
        const totalReach = campData.reduce((sum, r) => sum + (r.reach || 0), 0);

        return {
            ...metrics,
            totalSpend,
            totalImpressions,
            totalLinkClicks,
            totalLandingPageViews,
            totalCheckouts,
            totalPurchases,
            totalPurchaseValue,
            totalLeads,
            totalReach,
            avgCtr: totalImpressions > 0 ? (totalLinkClicks / totalImpressions) * 100 : 0,
            avgFrequency: totalReach > 0 ? totalImpressions / totalReach : 0,
        };
    }, [metrics, filteredData, selectedCampaign]);

    // Executive KPIs calculations - NOW USES filteredMetrics
    const executiveKPIs = useMemo(() => {
        const spend = filteredMetrics.totalSpend || 0;
        const purchaseValue = filteredMetrics.totalPurchaseValue || 0;
        const purchases = filteredMetrics.totalPurchases || 0;
        const leads = filteredMetrics.totalLeads || 0;

        return {
            roas: spend > 0 ? purchaseValue / spend : 0,
            cac: purchases > 0 ? spend / purchases : 0,
            cpl: leads > 0 ? spend / leads : 0,
            ticketMedio: purchases > 0 ? purchaseValue / purchases : 0,
        };
    }, [filteredMetrics]);

    // Funnel data - NOW USES filteredMetrics
    const funnelData = useMemo(() => {
        const impressions = filteredMetrics.totalImpressions || 0;
        const clicks = filteredMetrics.totalLinkClicks || 0;
        const landingPageViews = filteredMetrics.totalLandingPageViews || 0;
        const checkouts = filteredMetrics.totalCheckouts || 0;
        const purchases = filteredMetrics.totalPurchases || 0;

        return {
            impressions,
            clicks,
            landingPageViews,
            checkouts,
            purchases,
            ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
            connectRate: clicks > 0 ? (landingPageViews / clicks) * 100 : 0,
            checkoutRate: landingPageViews > 0 ? (checkouts / landingPageViews) * 100 : 0,
            purchaseRate: checkouts > 0 ? (purchases / checkouts) * 100 : 0,
        };
    }, [filteredMetrics]);

    // Provide metrics for AI Assistant
    usePageMetrics({
        pagina: "Acompanhamento de Campanhas",
        descricao: "Análise detalhada de performance por campanha e criativo",
        periodo: `${dateRange.startDate} a ${dateRange.endDate}`,
        kpis: {
            roas: executiveKPIs.roas,
            cac: executiveKPIs.cac,
            cpl: executiveKPIs.cpl,
            ticket_medio: executiveKPIs.ticketMedio,
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

    const roasByPie = useMemo(() => {
        return campaignSummary
            .filter(c => c.roas > 0)
            .sort((a, b) => b.roas - a.roas)
            .slice(0, 8)
            .map((c, i) => ({
                label: c.campaignName,
                value: c.roas,
                color: pieColors[i % pieColors.length],
            }));
    }, [campaignSummary]);

    // Average metrics for heatmap
    const avgMetrics = useMemo(() => {
        if (campaignSummary.length === 0) return { roas: 0, ctr: 0, cpl: 0 };
        return {
            roas: campaignSummary.reduce((sum, c) => sum + (c.roas || 0), 0) / campaignSummary.length,
            ctr: campaignSummary.reduce((sum, c) => sum + (c.ctr || 0), 0) / campaignSummary.length,
            cpl: campaignSummary.reduce((sum, c) => sum + (c.cpl || 0), 0) / campaignSummary.length,
        };
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
                    <h1 className="text-2xl font-extrabold text-[#19069E]">📊 Gestão de Campanhas</h1>
                    <p className="text-sm text-gray-500">Métricas estratégicas para tomada de decisão</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <DateRangePicker
                        startDate={new Date(dateRange.startDate + "T00:00:00")}
                        endDate={new Date(dateRange.endDate + "T00:00:00")}
                        onChange={(start, end) => {
                            const formatDate = (d: Date) => d.toISOString().split("T")[0];
                            setCustomRange(formatDate(start), formatDate(end));
                        }}
                    />

                    {/* Account Selector - always visible */}
                    <select
                        value={selectedAccount}
                        onChange={(e) => setSelectedAccount(e.target.value)}
                        disabled={dataLoading || uniqueAccounts.length === 0}
                        className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:ring-2 focus:ring-[#19069E]/20 focus:border-[#19069E] max-w-[200px] disabled:opacity-50"
                    >
                        <option value="">
                            {dataLoading ? "🏢 Carregando..." : uniqueAccounts.length === 0 ? "🏢 Sem contas" : "🏢 Todas as Contas"}
                        </option>
                        {uniqueAccounts.map((account) => (
                            <option key={account} value={account}>
                                {account}
                            </option>
                        ))}
                    </select>

                    {/* Enhanced Campaign Selector with ROAS preview */}
                    <select
                        value={selectedCampaign}
                        onChange={(e) => setSelectedCampaign(e.target.value)}
                        className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:ring-2 focus:ring-[#19069E]/20 focus:border-[#19069E] max-w-xs"
                    >
                        <option value="all">🎯 Todas as Campanhas ({campaignSummary.length})</option>
                        {campaignSummary.map((c) => (
                            <option key={c.campaignName} value={c.campaignName}>
                                {c.campaignName.slice(0, 30)} | ROAS: {c.roas?.toFixed(1) || "0"}x
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Error/Warning States */}
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

            {!settings?.visaoGeralSheetUrl && !settingsLoading && (
                <div className="p-4 rounded-2xl bg-yellow-50 border border-yellow-200 text-yellow-700">
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-yellow-500">info</span>
                        <div>
                            <p className="font-bold">Planilha não configurada</p>
                            <a href="/configuracoes" className="text-sm font-bold text-[#19069E] hover:underline">
                                Ir para Configurações →
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Row 1: Executive KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <ExecutiveKPI
                    label="ROAS"
                    value={hasData ? `${executiveKPIs.roas.toFixed(2)}x` : "—"}
                    subvalue="Retorno sobre investimento"
                    icon="trending_up"
                    color="primary"
                    isLoading={isLoading}
                />
                <ExecutiveKPI
                    label="CAC"
                    value={hasData ? formatCurrency(executiveKPIs.cac) : "—"}
                    subvalue="Custo por aquisição"
                    icon="person_add"
                    color="warning"
                    isLoading={isLoading}
                />
                <ExecutiveKPI
                    label="CPL"
                    value={hasData ? formatCurrency(executiveKPIs.cpl) : "—"}
                    subvalue="Custo por lead"
                    icon="contact_mail"
                    color="accent"
                    isLoading={isLoading}
                />
                <ExecutiveKPI
                    label="Ticket Médio"
                    value={hasData ? formatCurrency(executiveKPIs.ticketMedio) : "—"}
                    subvalue="Valor médio por venda"
                    icon="receipt_long"
                    color="success"
                    isLoading={isLoading}
                />
            </div>

            {/* Row 2: Funnel Visualization */}
            <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-[#19069E] mb-4">🎯 Funil de Conversão</h3>
                {isLoading ? (
                    <div className="h-24 bg-gray-100 animate-pulse rounded-lg" />
                ) : (
                    <div className="flex items-center justify-between gap-2">
                        <FunnelStage
                            label="Impressões"
                            value={funnelData.impressions}
                            icon="visibility"
                            color="#19069E"
                            isFirst
                        />
                        <FunnelStage
                            label="Cliques"
                            value={funnelData.clicks}
                            rate={funnelData.ctr}
                            icon="ads_click"
                            color="#3B28B8"
                        />
                        <FunnelStage
                            label="LP Views"
                            value={funnelData.landingPageViews}
                            rate={funnelData.connectRate}
                            icon="web"
                            color="#7C3AED"
                        />
                        <FunnelStage
                            label="Checkouts"
                            value={funnelData.checkouts}
                            rate={funnelData.checkoutRate}
                            icon="shopping_cart"
                            color="#C2DF0C"
                        />
                        <FunnelStage
                            label="Compras"
                            value={funnelData.purchases}
                            rate={funnelData.purchaseRate}
                            icon="paid"
                            color="#10B981"
                        />
                    </div>
                )}
            </div>

            {/* Row 3: Secondary KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                <KPICard icon="payments" label="Investimento" value={hasData ? formatCurrency(filteredMetrics.totalSpend) : "—"} isLoading={isLoading} />
                <KPICard icon="attach_money" label="Faturamento" value={hasData ? formatCurrency(filteredMetrics.totalPurchaseValue) : "—"} isLoading={isLoading} />
                <KPICard icon="group" label="Leads" value={hasData ? formatNumber(filteredMetrics.totalLeads) : "—"} isLoading={isLoading} />
                <KPICard icon="shopping_bag" label="Vendas" value={hasData ? formatNumber(filteredMetrics.totalPurchases) : "—"} isLoading={isLoading} />
                <KPICard icon="percent" label="CTR" value={hasData ? formatPercent(filteredMetrics.avgCtr) : "—"} isLoading={isLoading} />
                <KPICard icon="speed" label="Frequência" value={hasData ? filteredMetrics.avgFrequency.toFixed(2) : "—"} isLoading={isLoading} />
            </div>

            {/* Row 4: Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ROASTrendChart dailyData={dailyData} isLoading={isLoading} />
                <PieChart data={spendByPie} title="💰 Investimento por Campanha" valueFormatter={formatCurrency} />
            </div>

            {/* Row 5: Campaign Table with Heatmap */}
            <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-[#19069E] mb-4">📋 Performance por Campanha</h3>

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
                                        { key: "spend", label: "Invest." },
                                        { key: "roas", label: "ROAS" },
                                        { key: "cpl", label: "CPL" },
                                        { key: "ctr", label: "CTR" },
                                        { key: "leads", label: "Leads" },
                                        { key: "purchases", label: "Vendas" },
                                        { key: "conversionRate", label: "Conv%" },
                                    ].map((col) => (
                                        <th
                                            key={col.key}
                                            className="text-right py-3 px-2 font-bold text-gray-700 cursor-pointer hover:text-[#19069E] transition-colors"
                                            onClick={() => handleSort(col.key)}
                                        >
                                            <div className="flex items-center justify-end gap-1">
                                                {col.label}
                                                {sortColumn === col.key && (
                                                    <span className="material-symbols-outlined text-[14px]">
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
                                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="py-3 px-2">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                                    style={{ backgroundColor: pieColors[i % pieColors.length] }}
                                                />
                                                <span className="font-medium text-gray-900 truncate max-w-[200px]" title={campaign.campaignName}>
                                                    {campaign.campaignName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="text-right py-3 px-2 font-bold text-[#19069E]">{formatCurrency(campaign.spend)}</td>
                                        <td className={`text-right py-3 px-2 font-bold rounded ${getHeatmapColor(campaign.roas || 0, avgMetrics.roas, true)}`}>
                                            {(campaign.roas || 0).toFixed(2)}x
                                        </td>
                                        <td className={`text-right py-3 px-2 rounded ${getHeatmapColor(campaign.cpl, avgMetrics.cpl, false)}`}>
                                            {formatCurrency(campaign.cpl)}
                                        </td>
                                        <td className={`text-right py-3 px-2 rounded ${getHeatmapColor(campaign.ctr, avgMetrics.ctr, true)}`}>
                                            {formatPercent(campaign.ctr)}
                                        </td>
                                        <td className="text-right py-3 px-2">{formatNumber(campaign.leads)}</td>
                                        <td className="text-right py-3 px-2 font-bold">{formatNumber(campaign.purchases)}</td>
                                        <td className="text-right py-3 px-2">{formatPercent(campaign.conversionRate || 0)}</td>
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

            {/* Row 6: Top Creatives with Thumbnails */}
            <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[#19069E]">🎨 Top Criativos por Engajamento</h3>
                    {selectedCampaign !== "all" && (
                        <span className="text-xs bg-[#19069E]/10 text-[#19069E] px-2 py-1 rounded-full">
                            Filtrado: {selectedCampaign.slice(0, 25)}...
                        </span>
                    )}
                </div>
                {isLoading ? (
                    <div className="h-32 bg-gray-100 animate-pulse rounded-lg" />
                ) : topCreatives.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {topCreatives.map((creative, i) => (
                            <div
                                key={creative.adName}
                                className="flex gap-3 p-3 rounded-xl border border-gray-100 hover:border-[#19069E]/30 hover:shadow-md transition-all cursor-pointer"
                                onClick={() => setSelectedCreative(creative)}
                            >
                                {/* Thumbnail */}
                                <div className="w-20 h-20 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden relative group">
                                    {creative.thumbnailUrl ? (
                                        <>
                                            <img
                                                src={creative.thumbnailUrl}
                                                alt={creative.adName}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="material-symbols-outlined text-white text-2xl">
                                                    {creative.videoUrl ? 'play_circle' : 'fullscreen'}
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <span className="material-symbols-outlined text-2xl">image</span>
                                        </div>
                                    )}
                                </div>
                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm text-gray-900 truncate" title={creative.adName}>
                                        {creative.adName.length > 25 ? `${creative.adName.slice(0, 25)}...` : creative.adName}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">{creative.campaignName.slice(0, 30)}</p>
                                    <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
                                        <div>
                                            <span className="text-gray-500">Engaj.</span>
                                            <p className="font-bold text-[#C2DF0C]">{formatNumber(creative.totalEngagement)}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Spend</span>
                                            <p className="font-bold text-[#19069E]">{formatCurrency(creative.spend)}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">CTR</span>
                                            <p className="font-bold">{creative.ctr.toFixed(2)}%</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Conv</span>
                                            <p className="font-bold">{creative.conversions}</p>
                                        </div>
                                    </div>
                                </div>
                                {/* Rank badge */}
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i === 0 ? 'bg-yellow-400 text-yellow-900' :
                                    i === 1 ? 'bg-gray-300 text-gray-700' :
                                        i === 2 ? 'bg-amber-600 text-white' :
                                            'bg-gray-100 text-gray-500'
                                    }`}>
                                    {i + 1}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-32 flex items-center justify-center text-gray-400">
                        <div className="text-center">
                            <span className="material-symbols-outlined text-3xl">photo_library</span>
                            <p className="mt-1 text-sm">Nenhum criativo encontrado</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Creative Preview Modal */}
            {selectedCreative && (
                <div
                    className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
                    onClick={() => setSelectedCreative(null)}
                >
                    <div
                        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <div>
                                <h3 className="font-bold text-lg text-[#19069E]">{selectedCreative.adName}</h3>
                                <p className="text-sm text-gray-500">{selectedCreative.campaignName}</p>
                            </div>
                            <button
                                onClick={() => setSelectedCreative(null)}
                                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            {/* Media Preview */}
                            <div className="bg-gray-900 rounded-xl overflow-hidden mb-6 flex flex-col items-center justify-center relative" style={{ minHeight: '300px' }}>
                                {selectedCreative.thumbnailUrl ? (
                                    <img
                                        src={selectedCreative.thumbnailUrl}
                                        alt={selectedCreative.adName}
                                        className="max-w-full max-h-[400px] object-contain"
                                    />
                                ) : (
                                    <div className="text-gray-500 text-center p-8">
                                        <span className="material-symbols-outlined text-6xl">image_not_supported</span>
                                        <p className="mt-2">Mídia não disponível</p>
                                    </div>
                                )}

                                {/* Open Media Button */}
                                {(selectedCreative.videoUrl || selectedCreative.thumbnailUrl) && (
                                    <a
                                        href={selectedCreative.videoUrl || selectedCreative.thumbnailUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-[#19069E] hover:bg-[#3B28B8] text-white rounded-full shadow-lg transition-colors"
                                    >
                                        <span className="material-symbols-outlined">
                                            {selectedCreative.videoUrl ? 'play_circle' : 'open_in_new'}
                                        </span>
                                        <span className="font-medium">
                                            {selectedCreative.videoUrl ? 'Abrir Vídeo' : 'Abrir Imagem'}
                                        </span>
                                    </a>
                                )}
                            </div>

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 bg-gradient-to-br from-[#C2DF0C] to-[#B0CC0B] rounded-xl text-center">
                                    <p className="text-xs text-[#19069E]/70">Engajamento Total</p>
                                    <p className="text-2xl font-extrabold text-[#19069E]">{formatNumber(selectedCreative.totalEngagement)}</p>
                                </div>
                                <div className="p-4 bg-gradient-to-br from-[#19069E] to-[#3B28B8] rounded-xl text-center text-white">
                                    <p className="text-xs opacity-70">Investimento</p>
                                    <p className="text-2xl font-extrabold">{formatCurrency(selectedCreative.spend)}</p>
                                </div>
                                <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl text-center text-white">
                                    <p className="text-xs opacity-70">ROAS</p>
                                    <p className="text-2xl font-extrabold">{selectedCreative.roas.toFixed(2)}x</p>
                                </div>
                                <div className="p-4 bg-gray-100 rounded-xl text-center">
                                    <p className="text-xs text-gray-500">Conversões</p>
                                    <p className="text-2xl font-extrabold text-gray-900">{selectedCreative.conversions}</p>
                                </div>
                            </div>

                            {/* Detailed Metrics */}
                            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-gray-500">Impressões</p>
                                    <p className="font-bold">{formatNumber(selectedCreative.impressions)}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-gray-500">Cliques</p>
                                    <p className="font-bold">{formatNumber(selectedCreative.linkClicks)}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-gray-500">CTR</p>
                                    <p className="font-bold">{selectedCreative.ctr.toFixed(2)}%</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-gray-500">Faturamento</p>
                                    <p className="font-bold">{formatCurrency(selectedCreative.purchaseValue)}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-gray-500">Reações</p>
                                    <p className="font-bold">{formatNumber(selectedCreative.postReactions)}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-gray-500">Comentários</p>
                                    <p className="font-bold">{formatNumber(selectedCreative.postComments)}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-gray-500">Compartilhamentos</p>
                                    <p className="font-bold">{formatNumber(selectedCreative.postShares)}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-gray-500">Leads + Vendas</p>
                                    <p className="font-bold">{selectedCreative.leads} + {selectedCreative.purchases}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Row 7: Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#19069E] to-[#3B28B8] text-white">
                    <p className="text-sm opacity-80">Total de Campanhas</p>
                    <p className="text-3xl font-extrabold">{campaignSummary.length}</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#C2DF0C] to-[#B0CC0B] text-[#19069E]">
                    <p className="text-sm opacity-80">Melhor ROAS</p>
                    <p className="text-3xl font-extrabold">
                        {campaignSummary.length > 0
                            ? `${Math.max(...campaignSummary.map(c => c.roas || 0)).toFixed(1)}x`
                            : "—"}
                    </p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                    <p className="text-sm opacity-80">Total Conversões</p>
                    <p className="text-3xl font-extrabold">
                        {hasData ? formatNumber(metrics.totalPurchases + metrics.totalLeads) : "—"}
                    </p>
                </div>
            </div>
        </div>
    );
}
