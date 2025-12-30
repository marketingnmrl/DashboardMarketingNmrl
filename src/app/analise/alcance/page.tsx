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

// Platform Card Component
function PlatformCard({
    platform,
    icon,
    impressions,
    percentage,
    color,
}: {
    platform: string;
    icon: string;
    impressions: string;
    percentage: number;
    color: string;
}) {
    return (
        <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${color}`}>
                    <span className="material-symbols-outlined text-[20px] text-white">{icon}</span>
                </div>
                <span className="font-bold text-gray-900">{platform}</span>
            </div>
            <p className="text-2xl font-extrabold text-[#19069E] mb-2">{impressions}</p>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%`, backgroundColor: color.includes("blue") ? "#19069E" : "#4285F4" }}
                ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2 font-medium">{percentage}% do total</p>
        </div>
    );
}

export default function AlcanceExposicaoPage() {
    usePageMetrics({
        pagina: "Alcance & Exposição",
        descricao: "Métricas de impressões e alcance das campanhas",
        periodo: "Dezembro 2025",
        kpis: {
            impressoes_totais: 2400000,
            alcance_total: 890000,
            impressoes_google: 1200000,
            impressoes_meta: 1100000,
            ctr_medio: 3.5,
        },
        dados_adicionais: {
            campanhas: [
                { nome: "Black Friday 2025", plataforma: "Google", impressoes: 580000, ctr: 3.8 },
                { nome: "Remarketing Verão", plataforma: "Meta", impressoes: 420000, ctr: 2.9 },
                { nome: "Lançamento Produto X", plataforma: "Google", impressoes: 350000, ctr: 4.2 },
            ]
        }
    });

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <KPICard
                    icon="visibility"
                    label="Total de Impressões"
                    value="2.4M"
                    change="8.2%"
                    changeType="positive"
                    subtitle="vs. 2.2M (Mês anterior)"
                />
                <KPICard
                    icon="group"
                    label="Alcance Total"
                    value="890K"
                    change="5.1%"
                    changeType="positive"
                    subtitle="Usuários únicos"
                />
                <KPICard
                    icon="campaign"
                    label="Impressões Google"
                    value="1.2M"
                    change="12.3%"
                    changeType="positive"
                />
                <KPICard
                    icon="share"
                    label="Impressões Meta"
                    value="1.1M"
                    change="4.5%"
                    changeType="positive"
                />
            </div>

            {/* Platform Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PlatformCard
                    platform="Google Ads"
                    icon="ads_click"
                    impressions="1.2M"
                    percentage={52}
                    color="bg-blue-600"
                />
                <PlatformCard
                    platform="Meta Ads"
                    icon="thumb_up"
                    impressions="1.1M"
                    percentage={48}
                    color="bg-[#19069E]"
                />
            </div>

            {/* Trend Chart */}
            <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-[#19069E]">Tendência de Impressões</h3>
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

                {/* Chart Placeholder */}
                <div className="relative w-full h-[280px] bg-gradient-to-b from-[#19069E]/5 to-transparent rounded-lg flex items-center justify-center">
                    <div className="text-center">
                        <span className="material-symbols-outlined text-6xl text-[#19069E]/30">show_chart</span>
                        <p className="text-sm text-gray-400 mt-2">Gráfico de linha - Trend de Impressões</p>
                    </div>
                </div>

                <div className="flex justify-between mt-4 text-xs text-gray-400 font-medium">
                    <span>Jul</span>
                    <span>Ago</span>
                    <span>Set</span>
                    <span>Out</span>
                    <span>Nov</span>
                    <span>Dez</span>
                </div>
            </div>

            {/* Campaign Performance Table */}
            <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-[#19069E]">Impressões por Campanha</h3>
                    <p className="text-sm text-gray-500">Detalhamento do desempenho</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-xs uppercase font-bold text-[#19069E]">
                            <tr>
                                <th className="px-6 py-4">Campanha</th>
                                <th className="px-6 py-4">Plataforma</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Impressões</th>
                                <th className="px-6 py-4 text-right">CTR</th>
                                <th className="px-6 py-4 text-right">Custo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">Black Friday 2025</td>
                                <td className="px-6 py-4">
                                    <span className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                        Google Ads
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C2DF0C] text-[#19069E]">
                                        Ativo
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-bold">580K</td>
                                <td className="px-6 py-4 text-right">3.8%</td>
                                <td className="px-6 py-4 text-right font-bold text-[#19069E]">R$ 12.500</td>
                            </tr>
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">Remarketing Verão</td>
                                <td className="px-6 py-4">
                                    <span className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-[#19069E]"></span>
                                        Meta Ads
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C2DF0C] text-[#19069E]">
                                        Ativo
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-bold">420K</td>
                                <td className="px-6 py-4 text-right">2.9%</td>
                                <td className="px-6 py-4 text-right font-bold text-[#19069E]">R$ 8.200</td>
                            </tr>
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">Lançamento Produto X</td>
                                <td className="px-6 py-4">
                                    <span className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                        Google Ads
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                                        Pausado
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-bold">350K</td>
                                <td className="px-6 py-4 text-right">4.2%</td>
                                <td className="px-6 py-4 text-right font-bold text-[#19069E]">R$ 6.800</td>
                            </tr>
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">Promoção Natal</td>
                                <td className="px-6 py-4">
                                    <span className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-[#19069E]"></span>
                                        Meta Ads
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C2DF0C] text-[#19069E]">
                                        Ativo
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-bold">290K</td>
                                <td className="px-6 py-4 text-right">3.1%</td>
                                <td className="px-6 py-4 text-right font-bold text-[#19069E]">R$ 5.400</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
