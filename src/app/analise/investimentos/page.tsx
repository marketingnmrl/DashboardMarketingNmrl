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

// Secondary Metric Card
function MetricCard({
    icon,
    label,
    value,
    subtitle,
}: {
    icon: string;
    label: string;
    value: string;
    subtitle?: string;
}) {
    return (
        <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-[#19069E]/10">
                    <span className="material-symbols-outlined text-[20px] text-[#19069E]">{icon}</span>
                </div>
            </div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">{label}</p>
            <p className="text-2xl font-extrabold text-[#19069E]">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
    );
}

export default function InvestimentosPage() {
    usePageMetrics({
        pagina: "Investimentos em Marketing",
        descricao: "Custos e ROI das campanhas",
        periodo: "Dezembro 2025",
        kpis: {
            investimento_total: 42500,
            investimento_meta: 18500,
            investimento_google: 24000,
            roi_geral: 2.8,
            cpm_medio: 17.70,
            cpc_medio: 0.50,
            cpl_medio: 13.28,
            cac_medio: 94.44,
        }
    });

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <KPICard
                    icon="payments"
                    label="Investimento Total"
                    value="R$ 42.500"
                    change="12.5%"
                    changeType="positive"
                    subtitle="vs. R$ 37.800 (Mês anterior)"
                />
                <KPICard
                    icon="thumb_up"
                    label="Investimento Meta"
                    value="R$ 18.500"
                    change="8.2%"
                    changeType="positive"
                />
                <KPICard
                    icon="search"
                    label="Investimento Google"
                    value="R$ 24.000"
                    change="15.1%"
                    changeType="positive"
                />
                <KPICard
                    icon="trending_up"
                    label="ROI Geral"
                    value="2.8x"
                    change="0.3x"
                    changeType="positive"
                    subtitle="Retorno sobre investimento"
                />
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                <MetricCard icon="view_cozy" label="CPM Médio" value="R$ 17,70" subtitle="Custo por mil" />
                <MetricCard icon="ads_click" label="CPC Médio" value="R$ 0,50" subtitle="Custo por clique" />
                <MetricCard icon="group_add" label="CPL Médio" value="R$ 13,28" subtitle="Custo por lead" />
                <MetricCard icon="shopping_cart" label="CAC Médio" value="R$ 94,44" subtitle="Custo de aquisição" />
            </div>

            {/* Cost Distribution by Channel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart Placeholder */}
                <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-[#19069E]">Distribuição por Canal</h3>
                        <p className="text-sm text-gray-500">Investimento por plataforma</p>
                    </div>

                    <div className="flex items-center justify-center min-h-[200px]">
                        <div className="relative w-48 h-48 rounded-full border-[24px] border-[#19069E] flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-[24px] border-transparent border-t-blue-400 border-r-blue-400" style={{ transform: "rotate(90deg)" }}></div>
                            <div className="flex flex-col items-center">
                                <span className="text-3xl font-extrabold text-[#19069E]">56%</span>
                                <span className="text-xs text-gray-500">Google</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-[#19069E]"></span>
                                <span className="text-gray-600">Google Ads</span>
                            </div>
                            <span className="font-bold text-gray-900">R$ 24.000 (56%)</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-blue-400"></span>
                                <span className="text-gray-600">Meta Ads</span>
                            </div>
                            <span className="font-bold text-gray-900">R$ 18.500 (44%)</span>
                        </div>
                    </div>
                </div>

                {/* Cost Funnel */}
                <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-[#19069E]">Funil de Custos</h3>
                        <p className="text-sm text-gray-500">Custo por etapa do funil</p>
                    </div>

                    <div className="space-y-4">
                        {[
                            { stage: "CPM", value: "R$ 17,70", desc: "Custo por 1.000 impressões" },
                            { stage: "CPC", value: "R$ 0,50", desc: "Custo por clique" },
                            { stage: "CPL", value: "R$ 13,28", desc: "Custo por lead" },
                            { stage: "CAC", value: "R$ 94,44", desc: "Custo de aquisição de cliente" },
                        ].map((item, index) => (
                            <div key={item.stage} className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-[#19069E] flex items-center justify-center text-white font-bold text-sm">
                                    {item.stage}
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-gray-900">{item.value}</p>
                                    <p className="text-xs text-gray-500">{item.desc}</p>
                                </div>
                                {index < 3 && (
                                    <span className="material-symbols-outlined text-gray-300">arrow_downward</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Investment History Chart */}
            <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-[#19069E]">Histórico de Investimento</h3>
                        <p className="text-sm text-gray-500">Últimos 6 meses</p>
                    </div>
                    <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-[#19069E]"></span>
                            <span className="text-gray-600">Google</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-[#C2DF0C]"></span>
                            <span className="text-gray-600">Meta</span>
                        </div>
                    </div>
                </div>

                {/* Bar Chart Placeholder */}
                <div className="flex items-end justify-around h-[200px] gap-4 px-4">
                    {[
                        { month: "Jul", google: 18, meta: 14 },
                        { month: "Ago", google: 22, meta: 16 },
                        { month: "Set", google: 20, meta: 15 },
                        { month: "Out", google: 25, meta: 18 },
                        { month: "Nov", google: 28, meta: 20 },
                        { month: "Dez", google: 24, meta: 18.5 },
                    ].map((item) => (
                        <div key={item.month} className="flex flex-col items-center gap-2 flex-1">
                            <div className="flex items-end gap-1 h-[150px]">
                                <div
                                    className="w-6 bg-[#19069E] rounded-t-lg transition-all hover:opacity-80"
                                    style={{ height: `${item.google * 5}px` }}
                                ></div>
                                <div
                                    className="w-6 bg-[#C2DF0C] rounded-t-lg transition-all hover:opacity-80"
                                    style={{ height: `${item.meta * 5}px` }}
                                ></div>
                            </div>
                            <span className="text-xs font-medium text-gray-500">{item.month}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Campaign Investment Table */}
            <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-[#19069E]">Investimento por Campanha</h3>
                    <p className="text-sm text-gray-500">Detalhamento financeiro por campanha</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-xs uppercase font-bold text-[#19069E]">
                            <tr>
                                <th className="px-6 py-4">Campanha</th>
                                <th className="px-6 py-4 text-right">Investimento</th>
                                <th className="px-6 py-4 text-right">CPC</th>
                                <th className="px-6 py-4 text-right">Leads</th>
                                <th className="px-6 py-4 text-right">CPL</th>
                                <th className="px-6 py-4 text-right">ROAS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">Black Friday 2025</td>
                                <td className="px-6 py-4 text-right font-bold text-[#19069E]">R$ 12.500</td>
                                <td className="px-6 py-4 text-right">R$ 0,51</td>
                                <td className="px-6 py-4 text-right">1.250</td>
                                <td className="px-6 py-4 text-right font-bold text-[#19069E]">R$ 10,00</td>
                                <td className="px-6 py-4 text-right">
                                    <span className="font-bold text-[#C2DF0C] bg-[#19069E] px-2 py-0.5 rounded-full">3.2x</span>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">Remarketing Verão</td>
                                <td className="px-6 py-4 text-right font-bold text-[#19069E]">R$ 12.460</td>
                                <td className="px-6 py-4 text-right">R$ 0,78</td>
                                <td className="px-6 py-4 text-right">890</td>
                                <td className="px-6 py-4 text-right font-bold text-[#19069E]">R$ 14,00</td>
                                <td className="px-6 py-4 text-right">
                                    <span className="font-bold text-[#C2DF0C] bg-[#19069E] px-2 py-0.5 rounded-full">2.8x</span>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">Lançamento Produto X</td>
                                <td className="px-6 py-4 text-right font-bold text-[#19069E]">R$ 9.920</td>
                                <td className="px-6 py-4 text-right">R$ 0,98</td>
                                <td className="px-6 py-4 text-right">620</td>
                                <td className="px-6 py-4 text-right font-bold text-[#19069E]">R$ 16,00</td>
                                <td className="px-6 py-4 text-right">
                                    <span className="font-bold text-[#C2DF0C] bg-[#19069E] px-2 py-0.5 rounded-full">2.4x</span>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">Promoção Natal</td>
                                <td className="px-6 py-4 text-right font-bold text-[#19069E]">R$ 7.620</td>
                                <td className="px-6 py-4 text-right">R$ 0,85</td>
                                <td className="px-6 py-4 text-right">440</td>
                                <td className="px-6 py-4 text-right font-bold text-[#19069E]">R$ 17,32</td>
                                <td className="px-6 py-4 text-right">
                                    <span className="font-bold text-[#C2DF0C] bg-[#19069E] px-2 py-0.5 rounded-full">2.6x</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
