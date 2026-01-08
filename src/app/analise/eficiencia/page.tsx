"use client";

import { usePageMetrics } from "@/hooks/usePageMetrics";
import { useDashboardSettings } from "@/hooks/useDashboardSettings";
import { useStractData } from "@/hooks/useStractData";
import { useDateFilter } from "@/contexts/DateFilterContext";

// Format currency
function formatCurrency(value: number): string {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Format number
function formatNumber(value: number): string {
    return value.toLocaleString("pt-BR");
}

// Format percentage
function formatPercent(value: number): string {
    return `${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}

// KPI Card
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
            <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1 relative z-10">{label}</p>
            {isLoading ? (
                <div className="h-9 w-24 bg-white/20 rounded animate-pulse" />
            ) : (
                <p className="text-3xl font-extrabold text-white relative z-10">{value}</p>
            )}
            {subtitle && <p className="text-xs text-blue-200 mt-2 font-medium relative z-10">{subtitle}</p>}
        </div>
    );
}

// Metric Card
function MetricCard({
    icon,
    label,
    value,
    status,
    isLoading,
}: {
    icon: string;
    label: string;
    value: string;
    status?: "good" | "warning" | "bad";
    isLoading?: boolean;
}) {
    const statusColors = {
        good: "text-green-600",
        warning: "text-yellow-600",
        bad: "text-red-600",
    };

    return (
        <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-[#19069E]/10">
                    <span className="material-symbols-outlined text-[20px] text-[#19069E]">{icon}</span>
                </div>
                {status && <span className={`text-xs font-bold ${statusColors[status]}`}>●</span>}
            </div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">{label}</p>
            {isLoading ? (
                <div className="h-7 w-20 bg-gray-100 rounded animate-pulse" />
            ) : (
                <p className="text-2xl font-extrabold text-[#19069E]">{value}</p>
            )}
        </div>
    );
}

export default function EficienciaPage() {
    const { settings, isLoading: settingsLoading } = useDashboardSettings();
    const { dateRange } = useDateFilter();

    const {
        metrics,
        campaignSummary,
        isLoading: dataLoading,
        error,
    } = useStractData(settings?.visaoGeralSheetUrl, {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
    });

    const isLoading = settingsLoading || dataLoading;
    const hasData = !error && metrics.totalImpressions > 0;

    // Calculate conversion rate (leads/linkClicks)
    const conversionRate = metrics.totalLinkClicks > 0
        ? (metrics.totalLeads / metrics.totalLinkClicks) * 100
        : 0;

    usePageMetrics({
        pagina: "Métricas de Eficiência",
        descricao: "CTR, CPC, CPL e taxas de conversão",
        periodo: `${dateRange.startDate} a ${dateRange.endDate}`,
        kpis: {
            ctr_medio: metrics.avgCtr,
            taxa_conversao: conversionRate,
            cpl_medio: metrics.avgCpl,
            roas_medio: metrics.avgRoas,
        }
    });

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Error */}
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

            {/* No Sheet */}
            {!settings?.visaoGeralSheetUrl && !settingsLoading && (
                <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-700">
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-yellow-500">info</span>
                        <div>
                            <p className="font-bold">Planilha não configurada</p>
                            <a href="/configuracoes" className="text-sm font-bold text-[#19069E] hover:underline">
                                Ir para Configurações
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <KPICard
                    icon="percent"
                    label="CTR Médio"
                    value={hasData ? formatPercent(metrics.avgCtr) : "—"}
                    isLoading={isLoading}
                    subtitle="Taxa de cliques"
                />
                <KPICard
                    icon="conversion_path"
                    label="Taxa de Conversão"
                    value={hasData ? formatPercent(conversionRate) : "—"}
                    isLoading={isLoading}
                    subtitle="Leads / Cliques"
                />
                <KPICard
                    icon="group_add"
                    label="CPL Médio"
                    value={hasData ? formatCurrency(metrics.avgCpl) : "—"}
                    isLoading={isLoading}
                    subtitle="Custo por lead"
                />
                <KPICard
                    icon="trending_up"
                    label="ROAS Médio"
                    value={hasData && metrics.avgRoas > 0 ? `${metrics.avgRoas.toFixed(2)}x` : "—"}
                    isLoading={isLoading}
                    subtitle="Retorno sobre investimento"
                />
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                <MetricCard
                    icon="ads_click"
                    label="CPC Médio"
                    value={hasData ? formatCurrency(metrics.avgCpc) : "—"}
                    status={metrics.avgCpc < 1 ? "good" : metrics.avgCpc < 2 ? "warning" : "bad"}
                    isLoading={isLoading}
                />
                <MetricCard
                    icon="campaign"
                    label="CPM Médio"
                    value={hasData ? formatCurrency(metrics.avgCpm) : "—"}
                    status={metrics.avgCpm < 15 ? "good" : metrics.avgCpm < 30 ? "warning" : "bad"}
                    isLoading={isLoading}
                />
                <MetricCard
                    icon="visibility"
                    label="Total Impressões"
                    value={hasData ? formatNumber(metrics.totalImpressions) : "—"}
                    isLoading={isLoading}
                />
                <MetricCard
                    icon="group"
                    label="Total Alcance"
                    value={hasData ? formatNumber(metrics.totalReach) : "—"}
                    isLoading={isLoading}
                />
            </div>

            {/* Efficiency Funnel */}
            <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-[#19069E]">Funil de Eficiência</h3>
                    <p className="text-sm text-gray-500">Conversão em cada etapa</p>
                </div>

                {isLoading ? (
                    <div className="h-[200px] flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-gray-300 animate-pulse">hourglass_empty</span>
                    </div>
                ) : hasData ? (
                    <div className="space-y-4">
                        {[
                            { stage: "Impressões", value: metrics.totalImpressions, icon: "visibility" },
                            { stage: "Alcance", value: metrics.totalReach, icon: "group" },
                            { stage: "Cliques no Link", value: metrics.totalLinkClicks, icon: "ads_click" },
                            { stage: "LP Views", value: metrics.totalLandingPageViews, icon: "web" },
                            { stage: "Leads", value: metrics.totalLeads, icon: "group_add" },
                            { stage: "Conversões", value: metrics.totalResults, icon: "check_circle" },
                        ].map((item, index, arr) => {
                            const maxVal = Math.max(...arr.map(a => a.value));
                            const barWidth = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
                            const nextItem = arr[index + 1];
                            const convRate = nextItem && item.value > 0 ? ((nextItem.value / item.value) * 100).toFixed(1) : null;

                            return (
                                <div key={item.stage} className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-[#19069E] flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[16px] text-[#C2DF0C]">{item.icon}</span>
                                    </div>
                                    <div className="w-28 text-sm font-medium text-gray-700">{item.stage}</div>
                                    <div className="flex-1 bg-gray-100 h-8 rounded-lg overflow-hidden relative">
                                        <div
                                            className="h-full bg-gradient-to-r from-[#19069E] to-[#C2DF0C] rounded-lg"
                                            style={{ width: `${barWidth}%` }}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-600">
                                            {formatNumber(item.value)}
                                        </span>
                                    </div>
                                    {convRate && (
                                        <span className="text-xs font-bold text-[#19069E] w-16 text-right">→ {convRate}%</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="h-[200px] flex items-center justify-center text-gray-400">
                        <p>Sem dados para o período</p>
                    </div>
                )}
            </div>

            {/* Campaign Efficiency Table */}
            <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-[#19069E] to-[#2B1BB8]">
                    <h3 className="text-lg font-bold text-white">Eficiência por Campanha</h3>
                    <p className="text-sm text-blue-200">CTR, CPC e taxas de conversão</p>
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
                                    <th className="px-6 py-4 text-right">CTR</th>
                                    <th className="px-6 py-4 text-right">CPC</th>
                                    <th className="px-6 py-4 text-right">CPL</th>
                                    <th className="px-6 py-4 text-right">Tx. Conversão</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {campaignSummary.map((campaign) => {
                                    const campConvRate = campaign.linkClicks > 0
                                        ? (campaign.leads / campaign.linkClicks) * 100
                                        : 0;
                                    return (
                                        <tr key={campaign.campaignName} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900 max-w-[300px] truncate" title={campaign.campaignName}>
                                                {campaign.campaignName}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`font-bold ${campaign.ctr >= 2 ? "text-green-600" : campaign.ctr >= 1 ? "text-yellow-600" : "text-red-600"}`}>
                                                    {formatPercent(campaign.ctr)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">{formatCurrency(campaign.cpc)}</td>
                                            <td className="px-6 py-4 text-right font-bold text-[#19069E]">{formatCurrency(campaign.cpl)}</td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`font-bold ${campConvRate >= 5 ? "text-green-600" : campConvRate >= 2 ? "text-yellow-600" : "text-gray-500"}`}>
                                                    {formatPercent(campConvRate)}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-400">
                        <p>Sem dados de campanhas</p>
                    </div>
                )}
            </div>
        </div>
    );
}
