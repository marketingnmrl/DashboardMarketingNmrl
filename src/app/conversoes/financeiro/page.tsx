"use client";

import { useState, useEffect } from "react";
import { usePageMetrics } from "@/hooks/usePageMetrics";
import { useFinancialData } from "@/hooks/useFinancialData";


// Editable Value Component
function EditableValue({
    label,
    value,
    onSave,
    icon,
    color = "primary",
}: {
    label: string;
    value: number;
    onSave: (newValue: number) => void;
    icon: string;
    color?: "primary" | "green" | "orange";
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value.toString());

    const handleSave = () => {
        const numValue = parseFloat(editValue.replace(/[^\d.-]/g, "")) || 0;
        onSave(numValue);
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleSave();
        if (e.key === "Escape") {
            setEditValue(value.toString());
            setIsEditing(false);
        }
    };

    useEffect(() => {
        setEditValue(value.toString());
    }, [value]);

    const cardColors = {
        primary: "bg-[#19069E]",
        green: "bg-green-600",
        orange: "bg-orange-500",
    };

    return (
        <div className={`p-6 rounded-xl ${cardColors[color]} text-white shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden group`}>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-[100px] text-white">{icon}</span>
            </div>
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-2.5 bg-white/10 rounded-lg backdrop-blur-sm">
                    <span className="material-symbols-outlined text-white text-[24px]">{icon}</span>
                </div>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                    title="Editar valor"
                >
                    <span className="material-symbols-outlined text-white text-[18px]">
                        {isEditing ? "close" : "edit"}
                    </span>
                </button>
            </div>
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1 relative z-10">
                {label}
            </p>

            {isEditing ? (
                <div className="flex items-center gap-2 relative z-10">
                    <span className="text-2xl font-bold">R$</span>
                    <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={handleSave}
                        autoFocus
                        className="w-full px-2 py-1 text-2xl font-extrabold bg-white/20 rounded-lg border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                        placeholder="0"
                    />
                </div>
            ) : (
                <p className="text-3xl font-extrabold text-white relative z-10">
                    R$ {value.toLocaleString("pt-BR")}
                </p>
            )}

            <p className="text-xs text-white/70 mt-2 font-medium relative z-10">
                {isEditing ? "Pressione Enter para salvar" : "Clique no lápis para editar"}
            </p>
        </div>
    );
}

// Large KPI Card for main metrics (non-editable)
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
    onEditGoal,
}: {
    currentValue: number;
    goalValue: number;
    label: string;
    onEditGoal: () => void;
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
                <div className="flex items-center gap-2">
                    <button
                        onClick={onEditGoal}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#19069E] transition-colors"
                        title="Editar meta"
                    >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${isAchieved ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                        {isAchieved ? "✓ Atingida" : `Faltam R$ ${remaining.toLocaleString("pt-BR")}`}
                    </div>
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

// Edit Modal Component
function EditModal({
    isOpen,
    title,
    value,
    onSave,
    onClose,
}: {
    isOpen: boolean;
    title: string;
    value: number;
    onSave: (value: number) => void;
    onClose: () => void;
}) {
    const [inputValue, setInputValue] = useState(value.toString());

    useEffect(() => {
        setInputValue(value.toString());
    }, [value, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        const numValue = parseFloat(inputValue.replace(/[^\d.-]/g, "")) || 0;
        onSave(numValue);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-[#19069E]">{title}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
                        <span className="material-symbols-outlined text-gray-500">close</span>
                    </button>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Valor (R$)</label>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#19069E] focus:border-transparent text-lg font-bold"
                        placeholder="0"
                        autoFocus
                    />
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 py-3 bg-[#C2DF0C] hover:bg-[#B0CC0B] text-[#19069E] font-bold rounded-lg transition-colors"
                    >
                        Salvar
                    </button>
                </div>
            </div>
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
    const { data: financialData, saveData, isLoading } = useFinancialData();
    const [editingMeta, setEditingMeta] = useState(false);

    // Static data (could also be made editable)
    const vendas = 42500;
    const aReceber = 28000;

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
            vendas_mes: vendas,
            a_receber: aReceber,
            meta_mensal: financialData.meta,
            pipeline_total: totalPipeline,
            negocios_abertos: openDeals.length,
        }
    });

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto flex items-center justify-center h-64">
                <div className="flex items-center gap-3 text-[#19069E]">
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    <span className="font-medium">Carregando...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Main Financial KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <EditableValue
                    icon="account_balance"
                    label="Dinheiro em Caixa"
                    value={financialData.caixa}
                    onSave={(value) => saveData({ caixa: value })}
                    color="primary"
                />
                <MainKPICard
                    icon="point_of_sale"
                    label="Vendas do Mês"
                    value={`R$ ${vendas.toLocaleString("pt-BR")}`}
                    change="12.3%"
                    changeType="positive"
                    subtitle="15 vendas fechadas"
                    color="green"
                />
                <MainKPICard
                    icon="schedule"
                    label="A Receber"
                    value={`R$ ${aReceber.toLocaleString("pt-BR")}`}
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
                    currentValue={vendas}
                    goalValue={financialData.meta}
                    label="Meta de Vendas"
                    onEditGoal={() => setEditingMeta(true)}
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

            {/* Edit Meta Modal */}
            <EditModal
                isOpen={editingMeta}
                title="Editar Meta de Vendas"
                value={financialData.meta}
                onSave={(value) => saveData({ meta: value })}
                onClose={() => setEditingMeta(false)}
            />
        </div>
    );
}
