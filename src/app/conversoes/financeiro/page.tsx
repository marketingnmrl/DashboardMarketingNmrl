"use client";

import { usePageMetrics } from "@/hooks/usePageMetrics";

// Large KPI Card for main metrics
function MainKPICard({
    icon,
    label,
    value,
    change,
    changeType = "positive",
    subtitle,
    color = "primary",
}: {
    icon: string;
    label: string;
    value: string;
    change?: string;
    changeType?: "positive" | "negative" | "neutral";
    subtitle?: string;
    color?: "primary" | "green" | "orange" | "red";
}) {
    const changeColors = {
        positive: "bg-green-100 text-green-700",
        negative: "bg-red-100 text-red-700",
        neutral: "bg-gray-100 text-gray-600",
    };

    const changeIcons = {
        positive: "trending_up",
        negative: "trending_down",
        neutral: "trending_flat",
    };

    const cardColors = {
        primary: "bg-[#19069E]",
        green: "bg-green-600",
        orange: "bg-orange-500",
        red: "bg-red-500",
    };

    const iconBgColors = {
        primary: "bg-white/10",
        green: "bg-white/20",
        orange: "bg-white/20",
        red: "bg-white/20",
    };

    return (
        <div className={`p-6 rounded-xl ${cardColors[color]} text-white shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden group`}>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-[100px] text-white">{icon}</span>
            </div>
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`p-2.5 ${iconBgColors[color]} rounded-lg backdrop-blur-sm`}>
                    <span className="material-symbols-outlined text-white text-[24px]">{icon}</span>
                </div>
                {change && (
                    <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${changeColors[changeType]}`}>
                        <span className="material-symbols-outlined text-[14px] mr-1">{changeIcons[changeType]}</span>
                        {change}
                    </span>
                )}
            </div>
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1 relative z-10">
                {label}
            </p>
            <p className="text-3xl font-extrabold text-white relative z-10">{value}</p>
            {subtitle && (
                <p className="text-xs text-white/70 mt-2 font-medium relative z-10">{subtitle}</p>
            )}
        </div>
    );
}

// Goal Progress Component
function GoalProgress({
    currentValue,
    goalValue,
    label,
}: {
    currentValue: number;
    goalValue: number;
    label: string;
}) {
    const percentage = Math.min((currentValue / goalValue) * 100, 100);
    const remaining = goalValue - currentValue;
    const isAchieved = currentValue >= goalValue;

    return (
        <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h4 className="text-lg font-bold text-[#19069E]">{label}</h4>
                    <p className="text-sm text-gray-500">Meta mensal</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${isAchieved ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                    {isAchieved ? "✓ Atingida" : `Faltam R$ ${remaining.toLocaleString("pt-BR")}`}
                </div>
            </div>

            <div className="flex items-end justify-between mb-3">
                <div>
                    <p className="text-sm text-gray-500">Atual</p>
                    <p className="text-3xl font-extrabold text-[#19069E]">
                        R$ {currentValue.toLocaleString("pt-BR")}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Meta</p>
                    <p className="text-xl font-bold text-gray-400">
                        R$ {goalValue.toLocaleString("pt-BR")}
                    </p>
                </div>
            </div>

            <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-500 ${isAchieved ? "bg-green-500" : "bg-[#C2DF0C]"}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <p className="text-sm text-gray-500 mt-2 text-center font-medium">
                {percentage.toFixed(1)}% da meta
            </p>
        </div>
    );
}

// Deal/Lead Card
function DealCard({
    name,
    value,
    stage,
    probability,
    daysOpen,
}: {
    name: string;
    value: number;
    stage: string;
    probability: number;
    daysOpen: number;
}) {
    const stageColors: Record<string, string> = {
        "Proposta": "bg-blue-100 text-blue-700",
        "Negociação": "bg-yellow-100 text-yellow-700",
        "Fechamento": "bg-green-100 text-green-700",
        "Qualificação": "bg-purple-100 text-purple-700",
    };

    return (
        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-gray-900 text-sm">{name}</h4>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${stageColors[stage] || "bg-gray-100 text-gray-600"}`}>
                    {stage}
                </span>
            </div>
            <p className="text-xl font-extrabold text-[#19069E] mb-2">
                R$ {value.toLocaleString("pt-BR")}
            </p>
            <div className="flex justify-between text-xs text-gray-500">
                <span>{probability}% probabilidade</span>
                <span>{daysOpen} dias aberto</span>
            </div>
        </div>
    );
}

export default function FinanceiroPage() {
    // Mock data - would come from Google Sheets or API
    const financialData = {
        caixa: 85000,
        vendas: 42500,
        aReceber: 28000,
        meta: 60000,
        vendido: 42500,
    };

    const openDeals = [
        { name: "Empresa ABC Ltda", value: 15000, stage: "Proposta", probability: 60, daysOpen: 5 },
        { name: "Tech Solutions", value: 8500, stage: "Negociação", probability: 75, daysOpen: 12 },
        { name: "Marketing Pro", value: 12000, stage: "Fechamento", probability: 90, daysOpen: 3 },
        { name: "Startup XYZ", value: 5000, stage: "Qualificação", probability: 40, daysOpen: 8 },
        { name: "Consultoria Max", value: 22000, stage: "Proposta", probability: 55, daysOpen: 7 },
    ];

    const totalPipeline = openDeals.reduce((sum, deal) => sum + deal.value, 0);
    const weightedPipeline = openDeals.reduce((sum, deal) => sum + (deal.value * deal.probability / 100), 0);

    usePageMetrics({
        pagina: "Gestão Financeira",
        descricao: "Visão gerencial da empresa",
        periodo: "Dezembro 2024",
        kpis: {
            dinheiro_caixa: financialData.caixa,
            vendas_mes: financialData.vendas,
            a_receber: financialData.aReceber,
            meta_mensal: financialData.meta,
            pipeline_total: totalPipeline,
            negocios_abertos: openDeals.length,
        }
    });

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Main Financial KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <MainKPICard
                    icon="account_balance"
                    label="Dinheiro em Caixa"
                    value={`R$ ${financialData.caixa.toLocaleString("pt-BR")}`}
                    change="8.5%"
                    changeType="positive"
                    subtitle="Saldo disponível"
                    color="primary"
                />
                <MainKPICard
                    icon="point_of_sale"
                    label="Vendas do Mês"
                    value={`R$ ${financialData.vendas.toLocaleString("pt-BR")}`}
                    change="12.3%"
                    changeType="positive"
                    subtitle="15 vendas fechadas"
                    color="green"
                />
                <MainKPICard
                    icon="schedule"
                    label="A Receber"
                    value={`R$ ${financialData.aReceber.toLocaleString("pt-BR")}`}
                    subtitle="8 faturas pendentes"
                    color="orange"
                />
                <MainKPICard
                    icon="groups"
                    label="Negócios em Aberto"
                    value={openDeals.length.toString()}
                    subtitle={`Pipeline: R$ ${totalPipeline.toLocaleString("pt-BR")}`}
                    color="primary"
                />
            </div>

            {/* Goal Progress Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GoalProgress
                    currentValue={financialData.vendido}
                    goalValue={financialData.meta}
                    label="Meta de Vendas"
                />

                {/* Quick Stats */}
                <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                    <h4 className="text-lg font-bold text-[#19069E] mb-4">Resumo do Mês</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-green-50 border border-green-100">
                            <p className="text-xs text-green-600 font-medium mb-1">Entradas</p>
                            <p className="text-xl font-extrabold text-green-700">R$ 52.000</p>
                        </div>
                        <div className="p-4 rounded-lg bg-red-50 border border-red-100">
                            <p className="text-xs text-red-600 font-medium mb-1">Saídas</p>
                            <p className="text-xl font-extrabold text-red-700">R$ 18.500</p>
                        </div>
                        <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                            <p className="text-xs text-blue-600 font-medium mb-1">Ticket Médio</p>
                            <p className="text-xl font-extrabold text-blue-700">R$ 2.833</p>
                        </div>
                        <div className="p-4 rounded-lg bg-purple-50 border border-purple-100">
                            <p className="text-xs text-purple-600 font-medium mb-1">Pipeline Ponderado</p>
                            <p className="text-xl font-extrabold text-purple-700">R$ {weightedPipeline.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Open Deals / Leads to Close */}
            <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-[#19069E]">Negócios em Aberto</h3>
                        <p className="text-sm text-gray-500">Leads a fechar para atingir a meta</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="px-3 py-1.5 rounded-lg bg-[#19069E]/10 text-[#19069E] text-sm font-bold">
                            Total: R$ {totalPipeline.toLocaleString("pt-BR")}
                        </div>
                        <div className="px-3 py-1.5 rounded-lg bg-[#C2DF0C] text-[#19069E] text-sm font-bold">
                            Ponderado: R$ {weightedPipeline.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {openDeals.map((deal, index) => (
                        <DealCard key={index} {...deal} />
                    ))}
                </div>
            </div>

            {/* Receivables Table */}
            <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-[#19069E]">A Receber</h3>
                    <p className="text-sm text-gray-500">Faturas pendentes de pagamento</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-xs uppercase font-bold text-[#19069E]">
                            <tr>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4 text-right">Valor</th>
                                <th className="px-6 py-4 text-right">Vencimento</th>
                                <th className="px-6 py-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">Empresa ABC Ltda</td>
                                <td className="px-6 py-4 text-right font-bold text-[#19069E]">R$ 8.500</td>
                                <td className="px-6 py-4 text-right">05/01/2025</td>
                                <td className="px-6 py-4 text-center">
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">No prazo</span>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">Tech Solutions</td>
                                <td className="px-6 py-4 text-right font-bold text-[#19069E]">R$ 12.000</td>
                                <td className="px-6 py-4 text-right">02/01/2025</td>
                                <td className="px-6 py-4 text-center">
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Vence em breve</span>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">Marketing Pro</td>
                                <td className="px-6 py-4 text-right font-bold text-[#19069E]">R$ 7.500</td>
                                <td className="px-6 py-4 text-right">28/12/2024</td>
                                <td className="px-6 py-4 text-center">
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Atrasado</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
