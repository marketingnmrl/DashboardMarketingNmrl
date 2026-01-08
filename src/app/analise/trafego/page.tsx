"use client";

import { usePageMetrics } from "@/hooks/usePageMetrics";
import { useDashboardSettings } from "@/hooks/useDashboardSettings";
import { useStractData } from "@/hooks/useStractData";
import { useDateFilter } from "@/contexts/DateFilterContext";

// Format number
function formatNumber(value: number): string {
    return value.toLocaleString("pt-BR");
}

// Format currency
function formatCurrency(value: number): string {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Format percentage
function formatPercent(value: number): string {
    return `${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}

// KPI Card Component
function KPICard({
    icon,
    label,
    value,
    subtitle,
    isLoading,
}: {
    icon: string;
    label: string;
    value: string;
    subtitle?: string;
    isLoading?: boolean;
}) {
    return (
        <div className="p-6 rounded-xl bg-[#19069E] text-white shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-[100px] text-white">{icon}</span>
            </div>
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-2.5 bg-white/10 rounded-lg backdrop-blur-sm">
                    <span className="material-symbols-outlined text-[#C2DF0C] text-[24px]">{icon}</span>
                </div>
            </div>
            <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1 relative z-10">
                {label}
            </p>
            {isLoading ? (
                <div className="h-9 w-24 bg-white/20 rounded animate-pulse" />
            ) : (
                <p className="text-3xl font-extrabold text-white relative z-10">{value}</p>
            )}
            {subtitle && (
                <p className="text-xs text-blue-200 mt-2 font-medium relative z-10">{subtitle}</p>
            )}
        </div>
    );
}

export default function TrafegoPage() {
    const { settings, isLoading: settingsLoading } = useDashboardSettings();
    const { dateRange } = useDateFilter();

    const {
        metrics,
        campaignSummary,
        dailyData,
        isLoading: dataLoading,
        error,
    } = useStractData(settings?.visaoGeralSheetUrl, {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
    });

    const isLoading = settingsLoading || dataLoading;
    const hasData = !error && metrics.totalImpressions > 0;

    usePageMetrics({
        pagina: "Análise de Tráfego",
        descricao: "Métricas de cliques e fontes de tráfego",
        periodo: `${dateRange.startDate} a ${dateRange.endDate}`,
        kpis: {
            cliques_totais: metrics.totalClicks,
            cliques_link: metrics.totalLinkClicks,
            cpc_medio: metrics.avgCpc,
            ctr_medio: metrics.avgCtr,
        },
    });

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Error Message */}
            {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
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
                <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-700">
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-yellow-500">info</span>
                        <div>
                            <p className="font-bold">Planilha não configurada</p>
                            <p className="text-sm">Configure a URL do Google Sheets nas Configurações.</p>
                            <a href="/configuracoes" className="inline-flex items-center gap-1 mt-2 text-sm font-bold text-[#19069E] hover:underline">
                                <span className="material-symbols-outlined text-[16px]">settings</span>
                                Ir para Configurações
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <KPICard
                    icon="ads_click"
                    label="Cliques no Link"
                    value={hasData ? formatNumber(metrics.totalLinkClicks) : "—"}
                    isLoading={isLoading}
                    subtitle="Cliques para o site"
                />
                <KPICard
                    icon="touch_app"
                    label="Cliques Totais"
                    value={hasData ? formatNumber(metrics.totalClicks) : "—"}
                    isLoading={isLoading}
                    subtitle="Engajamento total"
                />
                <KPICard
                    icon="percent"
                    label="CTR Médio"
                    value={hasData ? formatPercent(metrics.avgCtr) : "—"}
                    isLoading={isLoading}
                    subtitle="Taxa de cliques"
                />
                <KPICard
                    icon="price_change"
                    label="CPC Médio"
                    value={hasData ? formatCurrency(metrics.avgCpc) : "—"}
                    isLoading={isLoading}
                    subtitle="Custo por clique"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Traffic Trend Chart */}
                <div className="lg:col-span-2 p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-[#19069E]">Evolução de Cliques</h3>
                        <p className="text-sm text-gray-500">Cliques diários no período selecionado</p>
                    </div>

                    {isLoading ? (
                        <div className="h-[200px] flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl text-gray-300 animate-pulse">hourglass_empty</span>
                        </div>
                    ) : dailyData.length > 0 ? (
                        <div className="space-y-2">
                            {dailyData.slice(-10).map((day) => {
                                const maxClicks = Math.max(...dailyData.map(d => d.linkClicks));
                                const barWidth = maxClicks > 0 ? (day.linkClicks / maxClicks) * 100 : 0;
                                return (
                                    <div key={day.date} className="flex items-center gap-3 group">
                                        <span className="text-xs text-gray-500 w-16 font-mono">{day.date.slice(5)}</span>
                                        <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-[#19069E] to-blue-400 h-full rounded-full flex items-center justify-end pr-2"
                                                style={{ width: `${Math.max(barWidth, 8)}%` }}
                                            >
                                                <span className="text-[10px] text-white font-bold">
                                                    {formatNumber(day.linkClicks)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="h-[200px] flex items-center justify-center text-gray-400">
                            <div className="text-center">
                                <span className="material-symbols-outlined text-4xl">show_chart</span>
                                <p className="text-sm mt-2">Sem dados para o período</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Stats */}
                <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-[#19069E] mb-1">Resumo de Tráfego</h3>
                    <p className="text-sm text-gray-500 mb-6">Métricas consolidadas</p>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600">Impressões</span>
                            <span className="font-bold text-[#19069E]">{hasData ? formatNumber(metrics.totalImpressions) : "—"}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600">Alcance</span>
                            <span className="font-bold text-[#19069E]">{hasData ? formatNumber(metrics.totalReach) : "—"}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600">LP Views</span>
                            <span className="font-bold text-[#19069E]">{hasData ? formatNumber(metrics.totalLandingPageViews) : "—"}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600">Campanhas</span>
                            <span className="font-bold text-[#19069E]">{hasData ? metrics.uniqueCampaigns : "—"}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Clicks by Campaign */}
            <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-[#19069E]">Cliques por Campanha</h3>
                    <p className="text-sm text-gray-500">Performance de tráfego por campanha</p>
                </div>

                {isLoading ? (
                    <div className="h-[150px] flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-gray-300 animate-pulse">hourglass_empty</span>
                    </div>
                ) : campaignSummary.length > 0 ? (
                    <div className="space-y-4">
                        {campaignSummary.slice(0, 5).map((campaign) => {
                            const maxClicks = Math.max(...campaignSummary.map(c => c.linkClicks));
                            const barWidth = maxClicks > 0 ? (campaign.linkClicks / maxClicks) * 100 : 0;
                            const shortName = campaign.campaignName.length > 40 ? campaign.campaignName.slice(0, 40) + "..." : campaign.campaignName;

                            return (
                                <div key={campaign.campaignName} className="flex items-center gap-4">
                                    <div className="w-48 text-sm font-medium text-gray-700 truncate" title={campaign.campaignName}>
                                        {shortName}
                                    </div>
                                    <div className="flex-1 bg-gray-100 h-8 rounded-lg overflow-hidden relative">
                                        <div
                                            className="h-full bg-gradient-to-r from-[#19069E] to-[#3B28B8] rounded-lg transition-all duration-500"
                                            style={{ width: `${barWidth}%` }}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-600">
                                            {formatNumber(campaign.linkClicks)} cliques | CTR: {formatPercent(campaign.ctr)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="h-[150px] flex items-center justify-center text-gray-400">
                        <div className="text-center">
                            <span className="material-symbols-outlined text-4xl">bar_chart</span>
                            <p className="text-sm mt-2">Sem dados de campanhas</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Campaign Table */}
            <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-[#19069E] to-[#2B1BB8]">
                    <h3 className="text-lg font-bold text-white">Desempenho Detalhado</h3>
                    <p className="text-sm text-blue-200">Métricas de tráfego por campanha</p>
                </div>

                {isLoading ? (
                    <div className="p-8 flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-gray-300 animate-pulse">hourglass_empty</span>
                    </div>
                ) : campaignSummary.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-xs uppercase font-bold text-[#19069E]">
                                <tr>
                                    <th className="px-6 py-4">Campanha</th>
                                    <th className="px-6 py-4 text-right">Impressões</th>
                                    <th className="px-6 py-4 text-right">Alcance</th>
                                    <th className="px-6 py-4 text-right">Cliques</th>
                                    <th className="px-6 py-4 text-right">CTR</th>
                                    <th className="px-6 py-4 text-right">CPC</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {campaignSummary.map((campaign) => (
                                    <tr key={campaign.campaignName} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 max-w-[300px] truncate" title={campaign.campaignName}>
                                            {campaign.campaignName}
                                        </td>
                                        <td className="px-6 py-4 text-right">{formatNumber(campaign.impressions)}</td>
                                        <td className="px-6 py-4 text-right">{formatNumber(campaign.reach)}</td>
                                        <td className="px-6 py-4 text-right font-bold">{formatNumber(campaign.linkClicks)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`font-bold ${campaign.ctr >= 2 ? "text-green-600" : campaign.ctr >= 1 ? "text-yellow-600" : "text-red-600"}`}>
                                                {formatPercent(campaign.ctr)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">{formatCurrency(campaign.cpc)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-[#19069E]/5 font-bold">
                                <tr>
                                    <td className="px-6 py-4 text-[#19069E]">Total</td>
                                    <td className="px-6 py-4 text-right text-[#19069E]">{formatNumber(metrics.totalImpressions)}</td>
                                    <td className="px-6 py-4 text-right text-[#19069E]">{formatNumber(metrics.totalReach)}</td>
                                    <td className="px-6 py-4 text-right text-[#19069E]">{formatNumber(metrics.totalLinkClicks)}</td>
                                    <td className="px-6 py-4 text-right text-[#19069E]">{formatPercent(metrics.avgCtr)}</td>
                                    <td className="px-6 py-4 text-right text-[#19069E]">{formatCurrency(metrics.avgCpc)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-400">
                        <span className="material-symbols-outlined text-4xl">table_chart</span>
                        <p className="text-sm mt-2">Sem dados de campanhas</p>
                    </div>
                )}
            </div>
        </div>
    );
}
