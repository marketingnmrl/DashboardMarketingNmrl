"use client";

import { usePageMetrics } from "@/hooks/usePageMetrics";

// KPI Card Component
function KPICard({
    icon,
    label,
    value,
    change,
    changeType = "positive",
    subtitle,
}: {
    icon: string;
    label: string;
    value: string;
    change: string;
    changeType?: "positive" | "negative" | "neutral";
    subtitle?: string;
}) {
    const changeColors = {
        positive: "bg-[#C2DF0C] text-[#19069E]",
        negative: "bg-red-100 text-red-700",
        neutral: "bg-white/90 text-gray-600",
    };

    const changeIcons = {
        positive: "trending_up",
        negative: "trending_down",
        neutral: "trending_flat",
    };

    return (
        <div className="p-6 rounded-xl bg-[#19069E] text-white shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-[100px] text-white">{icon}</span>
            </div>
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-2.5 bg-white/10 rounded-lg backdrop-blur-sm">
                    <span className="material-symbols-outlined text-[#C2DF0C] text-[24px]">{icon}</span>
                </div>
                <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${changeColors[changeType]}`}>
                    <span className="material-symbols-outlined text-[14px] mr-1">{changeIcons[changeType]}</span>
                    {change}
                </span>
            </div>
            <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1 relative z-10">
                {label}
            </p>
            <p className="text-3xl font-extrabold text-white relative z-10">{value}</p>
            {subtitle && (
                <p className="text-xs text-blue-200 mt-2 font-medium relative z-10">{subtitle}</p>
            )}
        </div>
    );
}

// Metric Gauge Component
function MetricGauge({
    label,
    value,
    target,
    percentage,
    status,
}: {
    label: string;
    value: string;
    target: string;
    percentage: number;
    status: "good" | "warning" | "bad";
}) {
    const statusColors = {
        good: "text-green-600",
        warning: "text-yellow-600",
        bad: "text-red-600",
    };

    const barColors = {
        good: "bg-gradient-to-r from-[#19069E] to-[#C2DF0C]",
        warning: "bg-gradient-to-r from-[#19069E] to-yellow-400",
        bad: "bg-gradient-to-r from-[#19069E] to-red-400",
    };

    return (
        <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start mb-3">
                <p className="text-sm font-bold text-gray-900">{label}</p>
                <span className={`text-xs font-bold ${statusColors[status]}`}>
                    {status === "good" ? "Acima da meta" : status === "warning" ? "Na meta" : "Abaixo da meta"}
                </span>
            </div>
            <p className="text-2xl font-extrabold text-[#19069E] mb-2">{value}</p>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-2">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${barColors[status]}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
            </div>
            <p className="text-xs text-gray-500">Meta: {target}</p>
        </div>
    );
}

export default function EficienciaPage() {
    usePageMetrics({
        pagina: "Métricas de Eficiência",
        descricao: "CTR, taxa de conversão e performance geral",
        periodo: "Dezembro 2025",
        kpis: {
            ctr_total: 3.55,
            taxa_conversao: 14.06,
            cpl_medio: 13.28,
            roas: 2.8,
        }
    });

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <KPICard
                    icon="percent"
                    label="CTR Total"
                    value="3.55%"
                    change="0.5%"
                    changeType="positive"
                    subtitle="vs. 3.05% (Mês anterior)"
                />
                <KPICard
                    icon="swap_horiz"
                    label="Taxa de Conversão"
                    value="14.06%"
                    change="1.2%"
                    changeType="positive"
                    subtitle="vs. 12.86% (Mês anterior)"
                />
                <KPICard
                    icon="payments"
                    label="CPL Médio"
                    value="R$ 13,28"
                    change="-8.5%"
                    changeType="positive"
                    subtitle="Redução de custo"
                />
            </div>

            {/* Efficiency Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <MetricGauge
                    label="CTR Google Ads"
                    value="3.8%"
                    target="3.0%"
                    percentage={127}
                    status="good"
                />
                <MetricGauge
                    label="CTR Meta Ads"
                    value="3.2%"
                    target="3.0%"
                    percentage={107}
                    status="good"
                />
                <MetricGauge
                    label="Taxa Conversão Leads"
                    value="14.06%"
                    target="12.0%"
                    percentage={117}
                    status="good"
                />
                <MetricGauge
                    label="ROAS"
                    value="2.8x"
                    target="2.5x"
                    percentage={112}
                    status="good"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* CTR Trend Chart */}
                <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-[#19069E]">Tendência de CTR</h3>
                            <p className="text-sm text-gray-500">Últimos 30 dias</p>
                        </div>
                        <div className="flex gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-[#19069E]"></span>
                                <span className="text-gray-600">CTR</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-[#C2DF0C]"></span>
                                <span className="text-gray-600">Meta</span>
                            </div>
                        </div>
                    </div>

                    {/* Chart Placeholder */}
                    <div className="relative w-full h-[220px] bg-gradient-to-b from-[#19069E]/5 to-transparent rounded-lg flex items-center justify-center">
                        <div className="text-center">
                            <span className="material-symbols-outlined text-5xl text-[#19069E]/30">show_chart</span>
                            <p className="text-xs text-gray-400 mt-2">Gráfico CTR vs Meta</p>
                        </div>
                    </div>
                </div>

                {/* Conversion Rate Trend */}
                <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-[#19069E]">Taxa de Conversão</h3>
                            <p className="text-sm text-gray-500">Últimos 30 dias</p>
                        </div>
                    </div>

                    {/* Chart Placeholder */}
                    <div className="relative w-full h-[220px] bg-gradient-to-b from-[#19069E]/5 to-transparent rounded-lg flex items-center justify-center">
                        <div className="text-center">
                            <span className="material-symbols-outlined text-5xl text-[#19069E]/30">conversion_path</span>
                            <p className="text-xs text-gray-400 mt-2">Gráfico de conversão</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Efficiency Funnel */}
            <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-[#19069E]">Funil de Eficiência</h3>
                    <p className="text-sm text-gray-500">Conversão por etapa do funil</p>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {[
                        { stage: "Impressões", value: "2.4M", rate: "100%" },
                        { stage: "Cliques", value: "85.3K", rate: "3.55% CTR" },
                        { stage: "Leads", value: "3.200", rate: "3.75% Conv." },
                        { stage: "Oportunidades", value: "890", rate: "27.8% Qual." },
                        { stage: "Vendas", value: "450", rate: "50.5% Close" },
                    ].map((item, index, arr) => (
                        <div key={item.stage} className="flex items-center gap-4">
                            <div className="text-center">
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{item.stage}</p>
                                <p className="text-2xl font-extrabold text-[#19069E] my-1">{item.value}</p>
                                <span className="text-xs font-bold text-[#C2DF0C] bg-[#19069E] px-2 py-0.5 rounded-full">
                                    {item.rate}
                                </span>
                            </div>
                            {index < arr.length - 1 && (
                                <span className="material-symbols-outlined text-3xl text-gray-300 hidden md:block">
                                    arrow_forward
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Campaign Performance Table */}
            <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-[#19069E]">Detalhamento por Campanha</h3>
                    <p className="text-sm text-gray-500">Métricas de eficiência por campanha</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-xs uppercase font-bold text-[#19069E]">
                            <tr>
                                <th className="px-6 py-4">Campanha</th>
                                <th className="px-6 py-4 text-right">Impressões</th>
                                <th className="px-6 py-4 text-right">Cliques</th>
                                <th className="px-6 py-4 text-right">CTR</th>
                                <th className="px-6 py-4 text-right">Conv %</th>
                                <th className="px-6 py-4 text-right">CPA</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">Black Friday 2025</td>
                                <td className="px-6 py-4 text-right">580K</td>
                                <td className="px-6 py-4 text-right">24.360</td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-green-600 font-bold">4.2%</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-green-600 font-bold">14.4%</span>
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-[#19069E]">R$ 69,44</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C2DF0C] text-[#19069E]">
                                        Excelente
                                    </span>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">Remarketing Verão</td>
                                <td className="px-6 py-4 text-right">420K</td>
                                <td className="px-6 py-4 text-right">15.960</td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-green-600 font-bold">3.8%</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-green-600 font-bold">14.0%</span>
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-[#19069E]">R$ 82,22</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C2DF0C] text-[#19069E]">
                                        Excelente
                                    </span>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">Lançamento Produto X</td>
                                <td className="px-6 py-4 text-right">350K</td>
                                <td className="px-6 py-4 text-right">10.150</td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-yellow-600 font-bold">2.9%</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-yellow-600 font-bold">13.7%</span>
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-[#19069E]">R$ 80,00</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                                        Bom
                                    </span>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">Promoção Natal</td>
                                <td className="px-6 py-4 text-right">290K</td>
                                <td className="px-6 py-4 text-right">8.990</td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-green-600 font-bold">3.1%</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-green-600 font-bold">13.9%</span>
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-[#19069E]">R$ 90,00</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C2DF0C] text-[#19069E]">
                                        Excelente
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
