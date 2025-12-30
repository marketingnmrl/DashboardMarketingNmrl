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

// Platform Lead Card
function PlatformLeadCard({
    platform,
    icon,
    leads,
    cost,
    cpl,
    trend,
}: {
    platform: string;
    icon: string;
    leads: string;
    cost: string;
    cpl: string;
    trend: "up" | "down";
}) {
    return (
        <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                <div className="p-2 rounded-lg bg-[#19069E]">
                    <span className="material-symbols-outlined text-[20px] text-[#C2DF0C]">{icon}</span>
                </div>
                <span className="font-bold text-gray-900">{platform}</span>
                <span className={`ml-auto text-xs font-bold flex items-center gap-1 ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
                    <span className="material-symbols-outlined text-[16px]">{trend === "up" ? "trending_up" : "trending_down"}</span>
                </span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                    <p className="text-xs text-gray-500">Leads</p>
                    <p className="text-xl font-extrabold text-[#19069E]">{leads}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500">Custo</p>
                    <p className="text-xl font-extrabold text-[#19069E]">{cost}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500">CPL</p>
                    <p className="text-xl font-extrabold text-[#C2DF0C] bg-[#19069E] px-2 py-1 rounded-lg">{cpl}</p>
                </div>
            </div>
        </div>
    );
}

export default function LeadsPage() {
    usePageMetrics({
        pagina: "Conversões e Leads",
        descricao: "Métricas de leads e conversões por campanha",
        periodo: "Dezembro 2025",
        kpis: {
            leads_totais: 3200,
            leads_meta: 1480,
            leads_google: 1720,
            conversoes: 450,
            cpl_medio: 13.28,
            taxa_conversao: 14.06,
        }
    });

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <KPICard
                    icon="group_add"
                    label="Leads Totais"
                    value="3.200"
                    change="15.3%"
                    changeType="positive"
                    subtitle="vs. 2.775 (Mês anterior)"
                />
                <KPICard
                    icon="thumb_up"
                    label="Leads Meta"
                    value="1.480"
                    change="12.1%"
                    changeType="positive"
                />
                <KPICard
                    icon="shopping_cart_checkout"
                    label="Conversões"
                    value="450"
                    change="22.1%"
                    changeType="positive"
                />
                <KPICard
                    icon="payments"
                    label="Custo por Lead"
                    value="R$ 13,28"
                    change="-8.5%"
                    changeType="positive"
                    subtitle="Otimização positiva"
                />
            </div>

            {/* Platform Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PlatformLeadCard
                    platform="Meta Ads"
                    icon="thumb_up"
                    leads="1.480"
                    cost="R$ 18.500"
                    cpl="R$ 12,50"
                    trend="up"
                />
                <PlatformLeadCard
                    platform="Google Ads"
                    icon="search"
                    leads="1.720"
                    cost="R$ 24.080"
                    cpl="R$ 14,00"
                    trend="up"
                />
            </div>

            {/* Funnel Visualization */}
            <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-[#19069E]">Funil de Conversão</h3>
                    <p className="text-sm text-gray-500">Jornada do usuário até a conversão</p>
                </div>

                <div className="grid grid-cols-4 gap-4">
                    {[
                        { stage: "Impressões", value: "2.4M", icon: "visibility", color: "bg-[#19069E]" },
                        { stage: "Cliques", value: "85.3K", icon: "ads_click", color: "bg-[#3B28B8]" },
                        { stage: "Leads", value: "3.200", icon: "group_add", color: "bg-[#6B5CD4]" },
                        { stage: "Conversões", value: "450", icon: "shopping_cart_checkout", color: "bg-[#C2DF0C]" },
                    ].map((item, index, arr) => (
                        <div key={item.stage} className="relative">
                            <div className={`p-4 rounded-xl ${item.color} text-center`}>
                                <span className={`material-symbols-outlined text-3xl ${item.color === "bg-[#C2DF0C]" ? "text-[#19069E]" : "text-white"}`}>
                                    {item.icon}
                                </span>
                                <p className={`text-2xl font-extrabold mt-2 ${item.color === "bg-[#C2DF0C]" ? "text-[#19069E]" : "text-white"}`}>
                                    {item.value}
                                </p>
                                <p className={`text-xs font-medium mt-1 ${item.color === "bg-[#C2DF0C]" ? "text-[#19069E]/70" : "text-white/70"}`}>
                                    {item.stage}
                                </p>
                            </div>
                            {index < arr.length - 1 && (
                                <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                                    <span className="material-symbols-outlined text-gray-300 text-2xl">arrow_forward</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-6 grid grid-cols-3 gap-4 text-center pt-4 border-t border-gray-100">
                    <div>
                        <p className="text-xs text-gray-500">CTR</p>
                        <p className="text-lg font-bold text-[#19069E]">3.55%</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Taxa Lead</p>
                        <p className="text-lg font-bold text-[#19069E]">3.75%</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Taxa Conversão</p>
                        <p className="text-lg font-bold text-[#19069E]">14.06%</p>
                    </div>
                </div>
            </div>

            {/* Leads by Campaign */}
            <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-[#19069E]">Leads por Campanha</h3>
                    <p className="text-sm text-gray-500">Distribuição de leads entre campanhas</p>
                </div>

                <div className="space-y-4">
                    {[
                        { name: "Black Friday 2025", leads: 1250, percentage: 39 },
                        { name: "Remarketing Verão", leads: 890, percentage: 28 },
                        { name: "Lançamento Produto X", leads: 620, percentage: 19 },
                        { name: "Promoção Natal", leads: 440, percentage: 14 },
                    ].map((campaign) => (
                        <div key={campaign.name} className="flex items-center gap-4">
                            <div className="w-44 text-sm font-medium text-gray-700 truncate">{campaign.name}</div>
                            <div className="flex-1 bg-gray-100 h-8 rounded-lg overflow-hidden relative">
                                <div
                                    className="h-full bg-gradient-to-r from-[#19069E] to-[#3B28B8] rounded-lg"
                                    style={{ width: `${campaign.percentage}%` }}
                                ></div>
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-white">
                                    {campaign.leads} leads
                                </span>
                            </div>
                            <div className="w-12 text-right text-sm font-bold text-[#19069E]">{campaign.percentage}%</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Leads Table */}
            <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-[#19069E]">Detalhamento por Campanha</h3>
                    <p className="text-sm text-gray-500">Métricas de leads e conversões</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-xs uppercase font-bold text-[#19069E]">
                            <tr>
                                <th className="px-6 py-4">Campanha</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Leads</th>
                                <th className="px-6 py-4 text-right">Custo</th>
                                <th className="px-6 py-4 text-right">CPL</th>
                                <th className="px-6 py-4 text-right">Conversões</th>
                                <th className="px-6 py-4 text-right">Taxa Conv.</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">Black Friday 2025</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C2DF0C] text-[#19069E]">
                                        Ativo
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-bold">1.250</td>
                                <td className="px-6 py-4 text-right">R$ 12.500</td>
                                <td className="px-6 py-4 text-right font-bold text-[#19069E]">R$ 10,00</td>
                                <td className="px-6 py-4 text-right font-bold">180</td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-green-600 font-bold">14.4%</span>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">Remarketing Verão</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C2DF0C] text-[#19069E]">
                                        Ativo
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-bold">890</td>
                                <td className="px-6 py-4 text-right">R$ 12.460</td>
                                <td className="px-6 py-4 text-right font-bold text-[#19069E]">R$ 14,00</td>
                                <td className="px-6 py-4 text-right font-bold">125</td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-green-600 font-bold">14.0%</span>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">Lançamento Produto X</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                                        Pausado
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-bold">620</td>
                                <td className="px-6 py-4 text-right">R$ 9.920</td>
                                <td className="px-6 py-4 text-right font-bold text-[#19069E]">R$ 16,00</td>
                                <td className="px-6 py-4 text-right font-bold">85</td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-yellow-600 font-bold">13.7%</span>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">Promoção Natal</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C2DF0C] text-[#19069E]">
                                        Ativo
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-bold">440</td>
                                <td className="px-6 py-4 text-right">R$ 7.620</td>
                                <td className="px-6 py-4 text-right font-bold text-[#19069E]">R$ 17,32</td>
                                <td className="px-6 py-4 text-right font-bold">60</td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-green-600 font-bold">13.6%</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
