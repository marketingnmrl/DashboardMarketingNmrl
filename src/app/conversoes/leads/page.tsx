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

export default function LeadsPage() {
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
    const hasData = !error && metrics.totalLeads > 0;

    // Conversion rate
    const conversionRate = metrics.totalLinkClicks > 0
        ? (metrics.totalLeads / metrics.totalLinkClicks) * 100
        : 0;

    usePageMetrics({
        pagina: "Conversões e Leads",
        descricao: "Leads gerados e taxas de conversão",
        periodo: `${dateRange.startDate} a ${dateRange.endDate}`,
        kpis: {
            leads_totais: metrics.totalLeads,
            conversoes: metrics.totalResults,
            cpl_medio: metrics.avgCpl,
            taxa_conversao: conversionRate,
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
                    icon="group_add"
                    label="Total de Leads"
                    value={hasData ? formatNumber(metrics.totalLeads) : "—"}
                    isLoading={isLoading}
                    subtitle={`${dailyData.length} dias de dados`}
                />
                <KPICard
                    icon="check_circle"
                    label="Conversões"
                    value={hasData ? formatNumber(metrics.totalResults) : "—"}
                    isLoading={isLoading}
                    subtitle="Resultados finais"
                />
                <KPICard
                    icon="price_change"
                    label="CPL Médio"
                    value={hasData ? formatCurrency(metrics.avgCpl) : "—"}
                    isLoading={isLoading}
                    subtitle="Custo por lead"
                />
                <KPICard
                    icon="conversion_path"
                    label="Taxa de Conversão"
                    value={hasData ? formatPercent(conversionRate) : "—"}
                    isLoading={isLoading}
                    subtitle="Leads / Cliques"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Leads Evolution Chart */}
                <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-[#19069E]">Leads por Dia</h3>
                        <p className="text-sm text-gray-500">Evolução de captação</p>
                    </div>

                    {isLoading ? (
                        <div className="h-[200px] flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl text-gray-300 animate-pulse">hourglass_empty</span>
                        </div>
                    ) : dailyData.length > 0 ? (
                        <div className="space-y-2 max-h-[250px] overflow-y-auto">
                            {dailyData.slice(-10).map((day) => {
                                const maxLeads = Math.max(...dailyData.map(d => d.leads));
                                const barWidth = maxLeads > 0 ? (day.leads / maxLeads) * 100 : 0;
                                return (
                                    <div key={day.date} className="flex items-center gap-3 group">
                                        <span className="text-xs text-gray-500 w-16 font-mono">{day.date.slice(5)}</span>
                                        <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-[#19069E] to-[#C2DF0C] h-full rounded-full flex items-center justify-end pr-2"
                                                style={{ width: `${Math.max(barWidth, 8)}%` }}
                                            >
                                                <span className="text-[10px] text-white font-bold">
                                                    {day.leads}
                                                </span>
                                            </div>
                                        </div>
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

                {/* Leads Funnel */}
                <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-[#19069E]">Funil de Conversão</h3>
                        <p className="text-sm text-gray-500">Jornada do usuário</p>
                    </div>

                    {isLoading ? (
                        <div className="h-[200px] flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl text-gray-300 animate-pulse">hourglass_empty</span>
                        </div>
                    ) : hasData ? (
                        <div className="space-y-4">
                            {[
                                { stage: "Cliques no Link", value: metrics.totalLinkClicks, icon: "ads_click" },
                                { stage: "LP Views", value: metrics.totalLandingPageViews, icon: "web" },
                                { stage: "Leads", value: metrics.totalLeads, icon: "group_add" },
                                { stage: "Conversões", value: metrics.totalResults, icon: "check_circle" },
                            ].map((item, index, arr) => {
                                const maxVal = arr[0].value || 1;
                                const barWidth = (item.value / maxVal) * 100;
                                const prevItem = arr[index - 1];
                                const dropRate = prevItem && prevItem.value > 0
                                    ? ((1 - item.value / prevItem.value) * 100).toFixed(1)
                                    : null;

                                return (
                                    <div key={item.stage}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-lg bg-[#19069E] flex items-center justify-center">
                                                <span className="material-symbols-outlined text-[16px] text-[#C2DF0C]">{item.icon}</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="font-medium text-gray-700">{item.stage}</span>
                                                    <span className="font-bold text-[#19069E]">{formatNumber(item.value)}</span>
                                                </div>
                                                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-[#19069E] to-[#C2DF0C] rounded-full"
                                                        style={{ width: `${barWidth}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        {dropRate && (
                                            <p className="text-xs text-gray-400 ml-12 mt-1">↓ {dropRate}% de perda</p>
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
            </div>

            {/* Campaign Leads Table */}
            <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-[#19069E] to-[#2B1BB8]">
                    <h3 className="text-lg font-bold text-white">Leads por Campanha</h3>
                    <p className="text-sm text-blue-200">Detalhamento de captação</p>
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
                                    <th className="px-6 py-4 text-right">Cliques</th>
                                    <th className="px-6 py-4 text-right">Leads</th>
                                    <th className="px-6 py-4 text-right">Conversões</th>
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
                                            <td className="px-6 py-4 text-right">{formatNumber(campaign.linkClicks)}</td>
                                            <td className="px-6 py-4 text-right font-bold text-[#19069E]">{formatNumber(campaign.leads)}</td>
                                            <td className="px-6 py-4 text-right">{formatNumber(campaign.purchases)}</td>
                                            <td className="px-6 py-4 text-right">{formatCurrency(campaign.cpl)}</td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`font-bold ${campConvRate >= 5 ? "text-green-600" : campConvRate >= 2 ? "text-yellow-600" : "text-gray-500"}`}>
                                                    {formatPercent(campConvRate)}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot className="bg-[#19069E]/5 font-bold">
                                <tr>
                                    <td className="px-6 py-4 text-[#19069E]">Total</td>
                                    <td className="px-6 py-4 text-right text-[#19069E]">{formatNumber(metrics.totalLinkClicks)}</td>
                                    <td className="px-6 py-4 text-right text-[#19069E]">{formatNumber(metrics.totalLeads)}</td>
                                    <td className="px-6 py-4 text-right text-[#19069E]">{formatNumber(metrics.totalResults)}</td>
                                    <td className="px-6 py-4 text-right text-[#19069E]">{formatCurrency(metrics.avgCpl)}</td>
                                    <td className="px-6 py-4 text-right text-[#19069E]">{formatPercent(conversionRate)}</td>
                                </tr>
                            </tfoot>
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
