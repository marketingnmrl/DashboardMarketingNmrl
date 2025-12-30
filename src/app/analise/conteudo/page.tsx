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

// Post Card Component
function PostCard({
    title,
    category,
    views,
    shares,
    engagement,
}: {
    title: string;
    category: string;
    views: string;
    shares: string;
    engagement: string;
    image?: string;
}) {
    return (
        <div className="group p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex gap-4">
                <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-[#19069E] to-[#3B28B8] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-3xl text-[#C2DF0C]">article</span>
                </div>
                <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-[#19069E] uppercase tracking-wider">{category}</span>
                    <h4 className="font-bold text-gray-900 mt-1 line-clamp-2 group-hover:text-[#19069E] transition-colors">
                        {title}
                    </h4>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                            {views}
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">share</span>
                            {shares}
                        </span>
                        <span className="flex items-center gap-1 text-[#19069E] font-bold">
                            <span className="material-symbols-outlined text-[16px]">favorite</span>
                            {engagement}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ConteudoPage() {
    usePageMetrics({
        pagina: "Desempenho de Conteúdo",
        descricao: "Métricas de blog e engajamento",
        periodo: "Dezembro 2025",
        kpis: {
            visualizacoes_blog: 145200,
            compartilhamentos: 8450,
            tempo_medio: "3m 24s",
            taxa_engajamento: 4.8,
        }
    });

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <KPICard
                    icon="visibility"
                    label="Visualizações de Blog"
                    value="145.2K"
                    change="12.5%"
                    changeType="positive"
                />
                <KPICard
                    icon="share"
                    label="Compartilhamentos"
                    value="8.450"
                    change="8.2%"
                    changeType="positive"
                />
                <KPICard
                    icon="schedule"
                    label="Tempo Médio na Página"
                    value="3m 24s"
                    change="5.1%"
                    changeType="positive"
                />
                <KPICard
                    icon="favorite"
                    label="Taxa de Engajamento"
                    value="4.8%"
                    change="0.3%"
                    changeType="positive"
                />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Posts */}
                <div className="lg:col-span-2 p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-[#19069E]">Top Posts</h3>
                            <p className="text-sm text-gray-500">Conteúdos com melhor desempenho</p>
                        </div>
                        <button className="text-sm font-bold text-[#19069E] hover:underline">Ver todos</button>
                    </div>

                    <div className="space-y-4">
                        <PostCard
                            title="10 Estratégias para Aumentar suas Vendas Online em 2025"
                            category="Marketing Digital"
                            views="12.4K"
                            shares="890"
                            engagement="6.2%"
                        />
                        <PostCard
                            title="Como Criar Campanhas de Facebook Ads que Convertem"
                            category="Redes Sociais"
                            views="9.8K"
                            shares="654"
                            engagement="5.8%"
                        />
                        <PostCard
                            title="Guia Completo de SEO para E-commerce"
                            category="SEO"
                            views="8.2K"
                            shares="512"
                            engagement="4.9%"
                        />
                        <PostCard
                            title="Email Marketing: Melhores Práticas para 2025"
                            category="Email Marketing"
                            views="7.1K"
                            shares="423"
                            engagement="4.5%"
                        />
                    </div>
                </div>

                {/* Reading Time Trend */}
                <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-[#19069E] mb-1">Tempo de Leitura</h3>
                    <p className="text-sm text-gray-500 mb-6">Tendência dos últimos 7 dias</p>

                    {/* Chart Placeholder */}
                    <div className="relative w-full h-[200px] bg-gradient-to-b from-[#19069E]/5 to-transparent rounded-lg flex items-center justify-center">
                        <div className="text-center">
                            <span className="material-symbols-outlined text-5xl text-[#19069E]/30">schedule</span>
                            <p className="text-xs text-gray-400 mt-2">Gráfico de linha</p>
                        </div>
                    </div>

                    <div className="mt-6 space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Média atual</span>
                            <span className="font-bold text-[#19069E]">3m 24s</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Semana passada</span>
                            <span className="font-bold text-gray-500">3m 15s</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Variação</span>
                            <span className="font-bold text-green-600">+4.6%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Engagement by Category */}
            <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-[#19069E]">Engajamento por Categoria</h3>
                        <p className="text-sm text-gray-500">Desempenho de cada tipo de conteúdo</p>
                    </div>
                </div>

                {/* Horizontal Bar Chart */}
                <div className="space-y-4">
                    {[
                        { name: "Marketing Digital", views: 45200, engagement: 5.8, percentage: 100 },
                        { name: "Redes Sociais", views: 38400, engagement: 5.2, percentage: 85 },
                        { name: "SEO", views: 32100, engagement: 4.6, percentage: 71 },
                        { name: "Email Marketing", views: 18500, engagement: 4.1, percentage: 41 },
                        { name: "Vendas", views: 11000, engagement: 3.8, percentage: 24 },
                    ].map((category) => (
                        <div key={category.name} className="flex items-center gap-4">
                            <div className="w-32 text-sm font-medium text-gray-700 truncate">{category.name}</div>
                            <div className="flex-1 bg-gray-100 h-8 rounded-lg overflow-hidden relative">
                                <div
                                    className="h-full bg-gradient-to-r from-[#19069E] to-[#3B28B8] rounded-lg transition-all duration-500"
                                    style={{ width: `${category.percentage}%` }}
                                ></div>
                            </div>
                            <div className="w-20 text-right text-sm font-bold text-gray-600 tabular-nums">
                                {category.views.toLocaleString()}
                            </div>
                            <div className="w-16 text-right">
                                <span className="text-xs font-bold text-[#C2DF0C] bg-[#19069E] px-2 py-1 rounded-full">
                                    {category.engagement}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Content Table */}
            <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-[#19069E]">Detalhes das Publicações</h3>
                    <p className="text-sm text-gray-500">Todas as publicações do período</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-xs uppercase font-bold text-[#19069E]">
                            <tr>
                                <th className="px-6 py-4">Título</th>
                                <th className="px-6 py-4">Categoria</th>
                                <th className="px-6 py-4">Data</th>
                                <th className="px-6 py-4 text-right">Visitas</th>
                                <th className="px-6 py-4 text-right">Shares</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900 max-w-xs truncate">10 Estratégias para Vendas Online</td>
                                <td className="px-6 py-4">Marketing Digital</td>
                                <td className="px-6 py-4">25 Dez</td>
                                <td className="px-6 py-4 text-right font-bold">12.4K</td>
                                <td className="px-6 py-4 text-right">890</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C2DF0C] text-[#19069E]">
                                        Publicado
                                    </span>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900 max-w-xs truncate">Facebook Ads que Convertem</td>
                                <td className="px-6 py-4">Redes Sociais</td>
                                <td className="px-6 py-4">23 Dez</td>
                                <td className="px-6 py-4 text-right font-bold">9.8K</td>
                                <td className="px-6 py-4 text-right">654</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C2DF0C] text-[#19069E]">
                                        Publicado
                                    </span>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900 max-w-xs truncate">Guia Completo de SEO</td>
                                <td className="px-6 py-4">SEO</td>
                                <td className="px-6 py-4">20 Dez</td>
                                <td className="px-6 py-4 text-right font-bold">8.2K</td>
                                <td className="px-6 py-4 text-right">512</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C2DF0C] text-[#19069E]">
                                        Publicado
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
