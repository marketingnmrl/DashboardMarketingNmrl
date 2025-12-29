"use client";

import { usePageMetrics } from "@/hooks/usePageMetrics";

// KPI Card Component
function KPICard({
    icon,
    label,
    value,
    secondaryValue,
    secondaryLabel,
}: {
    icon: string;
    label: string;
    value: string;
    secondaryValue?: string;
    secondaryLabel?: string;
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
            <p className="text-3xl font-extrabold text-white relative z-10">{value}</p>
            {secondaryValue && (
                <p className="text-xs text-blue-200 mt-2 font-medium relative z-10">
                    <span className="text-[#C2DF0C] font-bold">{secondaryValue}</span> {secondaryLabel}
                </p>
            )}
        </div>
    );
}

// Funnel Stage Component
function FunnelStage({
    stage,
    value,
    percentage,
    conversionRate,
    width,
    color,
}: {
    stage: string;
    value: string;
    percentage: string;
    conversionRate?: string;
    width: string;
    color: string;
}) {
    return (
        <div className="relative">
            {conversionRate && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-[#19069E] bg-[#C2DF0C] px-2 py-0.5 rounded-full whitespace-nowrap">
                    {conversionRate} conversão
                </div>
            )}
            <div
                className={`mx-auto rounded-lg py-4 px-6 text-center transition-all hover:scale-105 ${color}`}
                style={{ width }}
            >
                <p className="text-white text-xs font-bold uppercase tracking-wider opacity-80">{stage}</p>
                <p className="text-white text-2xl font-extrabold my-1">{value}</p>
                <p className="text-white/70 text-xs font-medium">{percentage}</p>
            </div>
        </div>
    );
}

// Channel Efficiency Card
function ChannelCard({
    channel,
    icon,
    ctr,
    cpl,
    conversions,
    investment,
}: {
    channel: string;
    icon: string;
    ctr: string;
    cpl: string;
    conversions: string;
    investment: string;
}) {
    return (
        <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                <div className="p-2 rounded-lg bg-[#19069E]">
                    <span className="material-symbols-outlined text-[20px] text-[#C2DF0C]">{icon}</span>
                </div>
                <span className="font-bold text-gray-900">{channel}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-xs text-gray-500 font-medium">CTR</p>
                    <p className="text-lg font-bold text-[#19069E]">{ctr}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 font-medium">CPL</p>
                    <p className="text-lg font-bold text-[#19069E]">{cpl}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 font-medium">Conversões</p>
                    <p className="text-lg font-bold text-[#19069E]">{conversions}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 font-medium">Investimento</p>
                    <p className="text-lg font-bold text-[#19069E]">{investment}</p>
                </div>
            </div>
        </div>
    );
}

export default function FunilPage() {
    usePageMetrics({
        pagina: "Métricas de Funil",
        descricao: "Visualização do funil de conversão",
        periodo: "Dezembro 2024",
        kpis: {
            impressoes: 2400000,
            cliques: 85300,
            leads: 3200,
            conversoes: 450,
            ctr: 3.55,
            taxa_lead: 3.75,
            taxa_conversao: 14.06,
            cpm: 17.70,
            cpc: 0.50,
            cpl: 13.28,
            cac: 94.44,
        }
    });

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <KPICard
                    icon="visibility"
                    label="Impressões"
                    value="2.4M"
                    secondaryValue="R$ 17,70"
                    secondaryLabel="CPM médio"
                />
                <KPICard
                    icon="ads_click"
                    label="Cliques"
                    value="85.3K"
                    secondaryValue="3.55%"
                    secondaryLabel="CTR médio"
                />
                <KPICard
                    icon="group_add"
                    label="Leads"
                    value="3.200"
                    secondaryValue="R$ 13,28"
                    secondaryLabel="CPL médio"
                />
                <KPICard
                    icon="shopping_cart_checkout"
                    label="Conversões"
                    value="450"
                    secondaryValue="R$ 94,44"
                    secondaryLabel="CAC médio"
                />
            </div>

            {/* Funnel Visualization */}
            <div className="p-8 rounded-xl bg-white border border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-[#19069E]">Visualização do Funil</h3>
                        <p className="text-sm text-gray-500">Jornada do cliente desde impressões até conversões</p>
                    </div>
                </div>

                {/* Funnel */}
                <div className="space-y-8 py-4">
                    <FunnelStage
                        stage="Impressões"
                        value="2.4M"
                        percentage="100%"
                        width="100%"
                        color="bg-[#19069E]"
                    />
                    <FunnelStage
                        stage="Cliques"
                        value="85.3K"
                        percentage="3.55%"
                        conversionRate="3.55%"
                        width="75%"
                        color="bg-[#3B28B8]"
                    />
                    <FunnelStage
                        stage="Leads"
                        value="3.200"
                        percentage="3.75% dos cliques"
                        conversionRate="3.75%"
                        width="50%"
                        color="bg-[#6B5CD4]"
                    />
                    <FunnelStage
                        stage="Conversões"
                        value="450"
                        percentage="14.06% dos leads"
                        conversionRate="14.06%"
                        width="25%"
                        color="bg-[#C2DF0C]"
                    />
                </div>

                {/* Funnel Summary */}
                <div className="mt-8 pt-6 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Taxa Geral</p>
                        <p className="text-xl font-extrabold text-[#19069E]">0.019%</p>
                        <p className="text-xs text-gray-400">Impressão → Conversão</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Custo por Impressão</p>
                        <p className="text-xl font-extrabold text-[#19069E]">R$ 0,018</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Custo por Clique</p>
                        <p className="text-xl font-extrabold text-[#19069E]">R$ 0,50</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">ROI Estimado</p>
                        <p className="text-xl font-extrabold text-[#C2DF0C] bg-[#19069E] inline-flex px-3 py-1 rounded-full">2.8x</p>
                    </div>
                </div>
            </div>

            {/* Channel Efficiency Cards */}
            <div>
                <h3 className="text-lg font-bold text-[#19069E] mb-4">Eficiência por Canal</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ChannelCard
                        channel="Google Ads"
                        icon="search"
                        ctr="3.8%"
                        cpl="R$ 12,50"
                        conversions="210"
                        investment="R$ 21.000"
                    />
                    <ChannelCard
                        channel="Meta Ads"
                        icon="thumb_up"
                        ctr="3.2%"
                        cpl="R$ 14,20"
                        conversions="180"
                        investment="R$ 18.500"
                    />
                    <ChannelCard
                        channel="Email Marketing"
                        icon="mail"
                        ctr="4.5%"
                        cpl="R$ 8,50"
                        conversions="60"
                        investment="R$ 3.000"
                    />
                </div>
            </div>

            {/* Conversion Rates Table */}
            <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-[#19069E]">Taxas de Conversão por Etapa</h3>
                    <p className="text-sm text-gray-500">Análise detalhada do funil por campanha</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-xs uppercase font-bold text-[#19069E]">
                            <tr>
                                <th className="px-6 py-4">Campanha</th>
                                <th className="px-6 py-4 text-right">Impressões</th>
                                <th className="px-6 py-4 text-right">CTR</th>
                                <th className="px-6 py-4 text-right">Leads</th>
                                <th className="px-6 py-4 text-right">Taxa Lead</th>
                                <th className="px-6 py-4 text-right">Conversões</th>
                                <th className="px-6 py-4 text-right">Taxa Conv.</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">Black Friday 2024</td>
                                <td className="px-6 py-4 text-right">580K</td>
                                <td className="px-6 py-4 text-right font-bold text-green-600">4.2%</td>
                                <td className="px-6 py-4 text-right">1.250</td>
                                <td className="px-6 py-4 text-right font-bold text-green-600">5.1%</td>
                                <td className="px-6 py-4 text-right">180</td>
                                <td className="px-6 py-4 text-right">
                                    <span className="font-bold text-[#C2DF0C] bg-[#19069E] px-2 py-0.5 rounded-full">14.4%</span>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">Remarketing Verão</td>
                                <td className="px-6 py-4 text-right">420K</td>
                                <td className="px-6 py-4 text-right font-bold text-green-600">3.8%</td>
                                <td className="px-6 py-4 text-right">890</td>
                                <td className="px-6 py-4 text-right font-bold text-green-600">5.6%</td>
                                <td className="px-6 py-4 text-right">125</td>
                                <td className="px-6 py-4 text-right">
                                    <span className="font-bold text-[#C2DF0C] bg-[#19069E] px-2 py-0.5 rounded-full">14.0%</span>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">Lançamento Produto X</td>
                                <td className="px-6 py-4 text-right">350K</td>
                                <td className="px-6 py-4 text-right font-bold text-yellow-600">2.9%</td>
                                <td className="px-6 py-4 text-right">620</td>
                                <td className="px-6 py-4 text-right font-bold text-yellow-600">6.1%</td>
                                <td className="px-6 py-4 text-right">85</td>
                                <td className="px-6 py-4 text-right">
                                    <span className="font-bold text-[#C2DF0C] bg-[#19069E] px-2 py-0.5 rounded-full">13.7%</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
