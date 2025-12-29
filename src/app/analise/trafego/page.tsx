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

// Traffic Source Card
function SourceCard({
    source,
    icon,
    clicks,
    percentage,
    color,
}: {
    source: string;
    icon: string;
    clicks: string;
    percentage: number;
    color: string;
}) {
    return (
        <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className={`p-3 rounded-lg ${color}`}>
                <span className="material-symbols-outlined text-[24px] text-white">{icon}</span>
            </div>
            <div className="flex-1">
                <p className="font-bold text-gray-900">{source}</p>
                <p className="text-sm text-gray-500">{clicks} cliques</p>
            </div>
            <div className="text-right">
                <p className="text-xl font-extrabold text-[#19069E]">{percentage}%</p>
            </div>
        </div>
    );
}

export default function TrafegoPage() {
    usePageMetrics({
        pagina: "Análise de Tráfego",
        descricao: "Métricas de cliques e fontes de tráfego",
        periodo: "Dezembro 2024",
        kpis: {
            cliques_totais: 85340,
            cliques_unicos: 72150,
            cliques_google: 48200,
            cliques_meta: 37140,
            cpc_medio: 0.50,
            ctr_medio: 3.55,
        },
        dados_adicionais: {
            fontes: { google_ads: 38, meta_ads: 33, organico: 19, direto: 10 }
        }
    });

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <KPICard
                    icon="ads_click"
                    label="Total de Cliques"
                    value="85.340"
                    change="5.4%"
                    changeType="positive"
                    subtitle="vs. 80.950 (Mês anterior)"
                />
                <KPICard
                    icon="touch_app"
                    label="Cliques Únicos"
                    value="72.150"
                    change="4.2%"
                    changeType="positive"
                    subtitle="Visitantes únicos"
                />
                <KPICard
                    icon="search"
                    label="Cliques Google"
                    value="48.200"
                    change="7.1%"
                    changeType="positive"
                />
                <KPICard
                    icon="thumb_up"
                    label="Cliques Meta"
                    value="37.140"
                    change="3.8%"
                    changeType="positive"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Traffic Trend Chart */}
                <div className="lg:col-span-2 p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-[#19069E]">Tendência de Cliques</h3>
                            <p className="text-sm text-gray-500">Comparativo com mês anterior</p>
                        </div>
                        <div className="flex gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-[#19069E]"></span>
                                <span className="text-gray-600">Este mês</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-gray-300"></span>
                                <span className="text-gray-600">Mês anterior</span>
                            </div>
                        </div>
                    </div>

                    {/* Chart Placeholder */}
                    <div className="relative w-full h-[280px] bg-gradient-to-b from-[#19069E]/5 to-transparent rounded-lg flex items-center justify-center">
                        <div className="text-center">
                            <span className="material-symbols-outlined text-6xl text-[#19069E]/30">trending_up</span>
                            <p className="text-sm text-gray-400 mt-2">Gráfico de área - Evolução de cliques</p>
                        </div>
                    </div>

                    <div className="flex justify-between mt-4 text-xs text-gray-400 font-medium">
                        <span>Sem 1</span>
                        <span>Sem 2</span>
                        <span>Sem 3</span>
                        <span>Sem 4</span>
                    </div>
                </div>

                {/* Traffic Sources */}
                <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-[#19069E] mb-1">Fontes de Tráfego</h3>
                    <p className="text-sm text-gray-500 mb-6">Distribuição por origem</p>

                    <div className="space-y-3">
                        <SourceCard source="Google Ads" icon="ads_click" clicks="32.5K" percentage={38} color="bg-blue-500" />
                        <SourceCard source="Meta Ads" icon="thumb_up" clicks="28.2K" percentage={33} color="bg-[#19069E]" />
                        <SourceCard source="Orgânico" icon="search" clicks="15.8K" percentage={19} color="bg-[#C2DF0C]" />
                        <SourceCard source="Direto" icon="link" clicks="8.8K" percentage={10} color="bg-gray-400" />
                    </div>
                </div>
            </div>

            {/* Clicks by Campaign Chart */}
            <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-[#19069E]">Cliques por Campanha</h3>
                        <p className="text-sm text-gray-500">Top 5 campanhas por performance</p>
                    </div>
                </div>

                {/* Horizontal Bar Chart Placeholder */}
                <div className="space-y-4">
                    {[
                        { name: "Black Friday 2024", clicks: 18500, percentage: 85 },
                        { name: "Remarketing Verão", clicks: 14200, percentage: 65 },
                        { name: "Lançamento Produto X", clicks: 12800, percentage: 59 },
                        { name: "Promoção Natal", clicks: 9400, percentage: 43 },
                        { name: "Campanha Institucional", clicks: 6200, percentage: 28 },
                    ].map((campaign) => (
                        <div key={campaign.name} className="flex items-center gap-4">
                            <div className="w-48 text-sm font-medium text-gray-700 truncate">{campaign.name}</div>
                            <div className="flex-1 bg-gray-100 h-8 rounded-lg overflow-hidden relative">
                                <div
                                    className="h-full bg-gradient-to-r from-[#19069E] to-[#3B28B8] rounded-lg transition-all duration-500"
                                    style={{ width: `${campaign.percentage}%` }}
                                ></div>
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-600">
                                    {campaign.clicks.toLocaleString()} cliques
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Ad Performance Table */}
            <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-[#19069E]">Desempenho por Anúncio</h3>
                    <p className="text-sm text-gray-500">Métricas detalhadas de cada anúncio</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-xs uppercase font-bold text-[#19069E]">
                            <tr>
                                <th className="px-6 py-4">Anúncio</th>
                                <th className="px-6 py-4">Campanha</th>
                                <th className="px-6 py-4 text-right">Cliques</th>
                                <th className="px-6 py-4 text-right">CTR</th>
                                <th className="px-6 py-4 text-right">CPC</th>
                                <th className="px-6 py-4 text-right">Custo Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">Banner Promo 50%</td>
                                <td className="px-6 py-4">Black Friday 2024</td>
                                <td className="px-6 py-4 text-right font-bold">8.450</td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-green-600 font-bold">4.2%</span>
                                </td>
                                <td className="px-6 py-4 text-right">R$ 0,45</td>
                                <td className="px-6 py-4 text-right font-bold text-[#19069E]">R$ 3.802</td>
                            </tr>
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">Video Institucional</td>
                                <td className="px-6 py-4">Remarketing Verão</td>
                                <td className="px-6 py-4 text-right font-bold">6.200</td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-green-600 font-bold">3.8%</span>
                                </td>
                                <td className="px-6 py-4 text-right">R$ 0,52</td>
                                <td className="px-6 py-4 text-right font-bold text-[#19069E]">R$ 3.224</td>
                            </tr>
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">Carrossel Produtos</td>
                                <td className="px-6 py-4">Lançamento Produto X</td>
                                <td className="px-6 py-4 text-right font-bold">5.800</td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-yellow-600 font-bold">2.9%</span>
                                </td>
                                <td className="px-6 py-4 text-right">R$ 0,58</td>
                                <td className="px-6 py-4 text-right font-bold text-[#19069E]">R$ 3.364</td>
                            </tr>
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">Stories Natal</td>
                                <td className="px-6 py-4">Promoção Natal</td>
                                <td className="px-6 py-4 text-right font-bold">4.120</td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-green-600 font-bold">3.5%</span>
                                </td>
                                <td className="px-6 py-4 text-right">R$ 0,48</td>
                                <td className="px-6 py-4 text-right font-bold text-[#19069E]">R$ 1.978</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
