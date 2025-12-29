"use client";

import { usePageMetrics } from "@/hooks/usePageMetrics";

// KPI Card Component
function KPICard({
    icon,
    label,
    value,
    change,
    changeType = "positive",
}: {
    icon: string;
    label: string;
    value: string;
    change: string;
    changeType?: "positive" | "negative" | "neutral";
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
        </div>
    );
}

export default function CampanhasPage() {
    usePageMetrics({
        pagina: "Gestão de Campanhas",
        descricao: "Gerenciamento e performance de campanhas",
        periodo: "Dezembro 2024",
        kpis: {
            investimento_total: 42500,
            impressoes_totais: 2400000,
            leads_totais: 3200,
            conversoes: 450,
        }
    });

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <p className="text-sm text-gray-500">Gerencie suas campanhas de marketing</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-3 bg-[#C2DF0C] hover:bg-[#B0CC0B] text-[#19069E] font-bold rounded-lg shadow-lg transition-all">
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Nova Campanha
                </button>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <KPICard icon="payments" label="Investimento Total" value="R$ 42.500" change="12.5%" changeType="positive" />
                <KPICard icon="visibility" label="Impressões Totais" value="2.4M" change="8.2%" changeType="positive" />
                <KPICard icon="group_add" label="Leads Totais" value="3.200" change="15.3%" changeType="positive" />
                <KPICard icon="shopping_cart_checkout" label="Conversões" value="450" change="22.1%" changeType="positive" />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Investment vs Conversions Chart */}
                <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-[#19069E]">Investimento vs Conversões</h3>
                        <p className="text-sm text-gray-500">Últimos 30 dias</p>
                    </div>

                    <div className="relative w-full h-[200px] bg-gradient-to-b from-[#19069E]/5 to-transparent rounded-lg flex items-center justify-center">
                        <div className="text-center">
                            <span className="material-symbols-outlined text-5xl text-[#19069E]/30">monitoring</span>
                            <p className="text-xs text-gray-400 mt-2">Gráfico de área</p>
                        </div>
                    </div>
                </div>

                {/* Top Ads by Leads */}
                <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-[#19069E]">Top Anúncios por Leads</h3>
                        <p className="text-sm text-gray-500">Melhores performers</p>
                    </div>

                    <div className="space-y-3">
                        {[
                            { name: "Banner Promo 50%", leads: 420, percentage: 100 },
                            { name: "Video Institucional", leads: 380, percentage: 90 },
                            { name: "Carrossel Produtos", leads: 290, percentage: 69 },
                            { name: "Stories Natal", leads: 210, percentage: 50 },
                        ].map((ad) => (
                            <div key={ad.name} className="flex items-center gap-3">
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-700">{ad.name}</span>
                                        <span className="text-sm font-bold text-[#19069E]">{ad.leads}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-[#19069E] to-[#C2DF0C] rounded-full"
                                            style={{ width: `${ad.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Campaigns Table */}
            <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-[#19069E]">Desempenho por Campanha</h3>
                        <p className="text-sm text-gray-500">Todas as campanhas ativas e pausadas</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 text-xs font-bold rounded-full bg-[#19069E] text-white">Todas</button>
                        <button className="px-3 py-1.5 text-xs font-medium rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50">Ativas</button>
                        <button className="px-3 py-1.5 text-xs font-medium rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50">Pausadas</button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-xs uppercase font-bold text-[#19069E]">
                            <tr>
                                <th className="px-6 py-4">Campanha</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Investimento</th>
                                <th className="px-6 py-4 text-right">Impressões</th>
                                <th className="px-6 py-4 text-right">Leads</th>
                                <th className="px-6 py-4 text-right">Conversões</th>
                                <th className="px-6 py-4">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-[#19069E]/10 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-[#19069E]">campaign</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">Black Friday 2024</p>
                                            <p className="text-xs text-gray-500">Google Ads • Meta Ads</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C2DF0C] text-[#19069E]">
                                        Ativo
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-bold">R$ 12.500</td>
                                <td className="px-6 py-4 text-right">580K</td>
                                <td className="px-6 py-4 text-right font-bold">1.250</td>
                                <td className="px-6 py-4 text-right font-bold text-[#19069E]">180</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#19069E] transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">edit</span>
                                        </button>
                                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#19069E] transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">bar_chart</span>
                                        </button>
                                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">pause</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-[#19069E]/10 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-[#19069E]">campaign</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">Remarketing Verão</p>
                                            <p className="text-xs text-gray-500">Meta Ads</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C2DF0C] text-[#19069E]">
                                        Ativo
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-bold">R$ 12.460</td>
                                <td className="px-6 py-4 text-right">420K</td>
                                <td className="px-6 py-4 text-right font-bold">890</td>
                                <td className="px-6 py-4 text-right font-bold text-[#19069E]">125</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#19069E] transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">edit</span>
                                        </button>
                                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#19069E] transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">bar_chart</span>
                                        </button>
                                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">pause</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-gray-400">campaign</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">Lançamento Produto X</p>
                                            <p className="text-xs text-gray-500">Google Ads</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                                        Pausado
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-gray-400">R$ 9.920</td>
                                <td className="px-6 py-4 text-right text-gray-400">350K</td>
                                <td className="px-6 py-4 text-right font-bold text-gray-400">620</td>
                                <td className="px-6 py-4 text-right font-bold text-gray-400">85</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#19069E] transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">edit</span>
                                        </button>
                                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#19069E] transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">bar_chart</span>
                                        </button>
                                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-green-500 transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-[#19069E]/10 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-[#19069E]">campaign</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">Promoção Natal</p>
                                            <p className="text-xs text-gray-500">Meta Ads • Google Ads</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C2DF0C] text-[#19069E]">
                                        Ativo
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-bold">R$ 7.620</td>
                                <td className="px-6 py-4 text-right">290K</td>
                                <td className="px-6 py-4 text-right font-bold">440</td>
                                <td className="px-6 py-4 text-right font-bold text-[#19069E]">60</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#19069E] transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">edit</span>
                                        </button>
                                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#19069E] transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">bar_chart</span>
                                        </button>
                                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">pause</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Ads Table */}
            <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-[#19069E]">Detalhamento por Anúncio</h3>
                    <p className="text-sm text-gray-500">Performance individual de cada criativo</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-xs uppercase font-bold text-[#19069E]">
                            <tr>
                                <th className="px-6 py-4">Anúncio</th>
                                <th className="px-6 py-4">Campanha</th>
                                <th className="px-6 py-4 text-right">Investimento</th>
                                <th className="px-6 py-4 text-right">Cliques</th>
                                <th className="px-6 py-4 text-right">CTR</th>
                                <th className="px-6 py-4 text-right">CPC</th>
                                <th className="px-6 py-4 text-right">CPM</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">Banner Promo 50%</td>
                                <td className="px-6 py-4 text-gray-500">Black Friday 2024</td>
                                <td className="px-6 py-4 text-right">R$ 3.802</td>
                                <td className="px-6 py-4 text-right font-bold">8.450</td>
                                <td className="px-6 py-4 text-right text-green-600 font-bold">4.2%</td>
                                <td className="px-6 py-4 text-right">R$ 0,45</td>
                                <td className="px-6 py-4 text-right font-bold text-[#19069E]">R$ 18,90</td>
                            </tr>
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">Video Institucional</td>
                                <td className="px-6 py-4 text-gray-500">Remarketing Verão</td>
                                <td className="px-6 py-4 text-right">R$ 3.224</td>
                                <td className="px-6 py-4 text-right font-bold">6.200</td>
                                <td className="px-6 py-4 text-right text-green-600 font-bold">3.8%</td>
                                <td className="px-6 py-4 text-right">R$ 0,52</td>
                                <td className="px-6 py-4 text-right font-bold text-[#19069E]">R$ 19,75</td>
                            </tr>
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">Carrossel Produtos</td>
                                <td className="px-6 py-4 text-gray-500">Lançamento Produto X</td>
                                <td className="px-6 py-4 text-right">R$ 3.364</td>
                                <td className="px-6 py-4 text-right font-bold">5.800</td>
                                <td className="px-6 py-4 text-right text-yellow-600 font-bold">2.9%</td>
                                <td className="px-6 py-4 text-right">R$ 0,58</td>
                                <td className="px-6 py-4 text-right font-bold text-[#19069E]">R$ 16,80</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
