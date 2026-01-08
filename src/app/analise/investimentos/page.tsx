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

// Secondary Metric Card
function MetricCard({
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
        <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-[#19069E]/10">
                    <span className="material-symbols-outlined text-[20px] text-[#19069E]">{icon}</span>
                </div>
            </div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">{label}</p>
            {isLoading ? (
                <div className="h-7 w-20 bg-gray-100 rounded animate-pulse" />
            ) : (
                <p className="text-2xl font-extrabold text-[#19069E]">{value}</p>
            )}
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
    );
}

export default function InvestimentosPage() {
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
    const hasData = !error && metrics.totalSpend > 0;

    usePageMetrics({
        pagina: "Investimentos em Marketing",
        descricao: "Custos e ROI das campanhas",
        periodo: `${dateRange.startDate} a ${dateRange.endDate}`,
        kpis: {
            investimento_total: metrics.totalSpend,
            cpm_medio: metrics.avgCpm,
            cpc_medio: metrics.avgCpc,
            cpl_medio: metrics.avgCpl,
        }
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

            {/* No Sheet Configured Warning */}
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
                    icon="payments"
                    label="Investimento Total"
                    value={hasData ? formatCurrency(metrics.totalSpend) : "—"}
                    isLoading={isLoading}
                    subtitle={`${dailyData.length} dias de dados`}
                />
                <KPICard
                    icon="visibility"
                    label="Impressões"
                    value={hasData ? formatNumber(metrics.totalImpressions) : "—"}
                    isLoading={isLoading}
                />
                <KPICard
                    icon="ads_click"
                    label="Cliques no Link"
                    value={hasData ? formatNumber(metrics.totalLinkClicks) : "—"}
                    isLoading={isLoading}
                />
                <KPICard
                    icon="group_add"
                    label="Leads Gerados"
                    value={hasData ? formatNumber(metrics.totalLeads) : "—"}
                    isLoading={isLoading}
                />
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                <MetricCard
                    icon="view_cozy"
                    label="CPM Médio"
                    value={hasData ? formatCurrency(metrics.avgCpm) : "—"}
                    subtitle="Custo por mil impressões"
                    isLoading={isLoading}
                />
                <MetricCard
                    icon="ads_click"
                    label="CPC Médio"
                    value={hasData ? formatCurrency(metrics.avgCpc) : "—"}
                    subtitle="Custo por clique"
                    isLoading={isLoading}
                />
                <MetricCard
                    icon="group_add"
                    label="CPL Médio"
                    value={hasData ? formatCurrency(metrics.avgCpl) : "—"}
                    subtitle="Custo por lead"
                    isLoading={isLoading}
                />
                <MetricCard
                    icon="percent"
                    label="CTR Médio"
                    value={hasData ? formatPercent(metrics.avgCtr) : "—"}
                    subtitle="Taxa de cliques"
                    isLoading={isLoading}
                />
            </div>

            {/* Cost Funnel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-[#19069E]">Funil de Custos</h3>
                        <p className="text-sm text-gray-500">Custo por etapa do funil</p>
                    </div>

                    <div className="space-y-4">
                        {[
                            { stage: "CPM", value: hasData ? formatCurrency(metrics.avgCpm) : "—", desc: "Custo por 1.000 impressões" },
                            { stage: "CPC", value: hasData ? formatCurrency(metrics.avgCpc) : "—", desc: "Custo por clique no link" },
                            { stage: "CPL", value: hasData ? formatCurrency(metrics.avgCpl) : "—", desc: "Custo por lead" },
                        ].map((item, index) => (
                            <div key={item.stage} className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-[#19069E] flex items-center justify-center text-white font-bold text-sm">
                                    {item.stage}
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-gray-900">{item.value}</p>
                                    <p className="text-xs text-gray-500">{item.desc}</p>
                                </div>
                                {index < 2 && (
                                    <span className="material-symbols-outlined text-gray-300">arrow_downward</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Daily Investment Chart */}
                <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-[#19069E]">Investimento Diário</h3>
                        <p className="text-sm text-gray-500">Distribuição por dia</p>
                    </div>

                    {isLoading ? (
                        <div className="h-[200px] flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl text-gray-300 animate-pulse">hourglass_empty</span>
                        </div>
                    ) : dailyData.length > 0 ? (
                        <div className="space-y-2 max-h-[250px] overflow-y-auto">
                            {dailyData.slice(-10).map((day) => {
                                const maxSpend = Math.max(...dailyData.map(d => d.spend));
                                const barWidth = maxSpend > 0 ? (day.spend / maxSpend) * 100 : 0;
                                return (
                                    <div key={day.date} className="flex items-center gap-3 group">
                                        <span className="text-xs text-gray-500 w-16 font-mono">{day.date.slice(5)}</span>
                                        <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-[#19069E] to-[#C2DF0C] h-full rounded-full flex items-center justify-end pr-2 group-hover:shadow-md transition-shadow"
                                                style={{ width: `${Math.max(barWidth, 8)}%` }}
                                            >
                                                <span className="text-[10px] text-white font-bold">
                                                    {formatCurrency(day.spend)}
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
                                <span className="material-symbols-outlined text-4xl">bar_chart</span>
                                <p className="text-sm mt-2">Sem dados para o período</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Campaign Investment Table */}
            <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-[#19069E] to-[#2B1BB8]">
                    <h3 className="text-lg font-bold text-white">Investimento por Campanha</h3>
                    <p className="text-sm text-blue-200">Detalhamento financeiro por campanha</p>
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
                                    <th className="px-6 py-4 text-right">Investimento</th>
                                    <th className="px-6 py-4 text-right">Impressões</th>
                                    <th className="px-6 py-4 text-right">Cliques</th>
                                    <th className="px-6 py-4 text-right">Leads</th>
                                    <th className="px-6 py-4 text-right">CPC</th>
                                    <th className="px-6 py-4 text-right">CPL</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {campaignSummary.map((campaign) => (
                                    <tr key={campaign.campaignName} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 max-w-[300px] truncate" title={campaign.campaignName}>
                                            {campaign.campaignName}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-[#19069E]">{formatCurrency(campaign.spend)}</td>
                                        <td className="px-6 py-4 text-right">{formatNumber(campaign.impressions)}</td>
                                        <td className="px-6 py-4 text-right">{formatNumber(campaign.linkClicks)}</td>
                                        <td className="px-6 py-4 text-right">{formatNumber(campaign.leads)}</td>
                                        <td className="px-6 py-4 text-right">{formatCurrency(campaign.cpc)}</td>
                                        <td className="px-6 py-4 text-right font-bold text-[#19069E]">{formatCurrency(campaign.cpl)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-[#19069E]/5 font-bold">
                                <tr>
                                    <td className="px-6 py-4 text-[#19069E]">Total</td>
                                    <td className="px-6 py-4 text-right text-[#19069E]">{formatCurrency(metrics.totalSpend)}</td>
                                    <td className="px-6 py-4 text-right text-[#19069E]">{formatNumber(metrics.totalImpressions)}</td>
                                    <td className="px-6 py-4 text-right text-[#19069E]">{formatNumber(metrics.totalLinkClicks)}</td>
                                    <td className="px-6 py-4 text-right text-[#19069E]">{formatNumber(metrics.totalLeads)}</td>
                                    <td className="px-6 py-4 text-right text-[#19069E]">{formatCurrency(metrics.avgCpc)}</td>
                                    <td className="px-6 py-4 text-right text-[#19069E]">{formatCurrency(metrics.avgCpl)}</td>
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
