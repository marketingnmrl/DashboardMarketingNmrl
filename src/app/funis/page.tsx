"use client";

import { useFunnels } from "@/hooks/useFunnels";
import { usePageMetrics } from "@/hooks/usePageMetrics";
import Link from "next/link";

export default function FunisPage() {
    const { funnels, isLoading, deleteFunnel } = useFunnels();

    usePageMetrics({
        pagina: "Meus Funis",
        descricao: "Lista de funis de vendas personalizados",
        periodo: "Todos",
        kpis: {
            total_funis: funnels.length,
        },
    });

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto flex items-center justify-center h-64">
                <div className="flex items-center gap-3 text-[#19069E]">
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    <span className="font-medium">Carregando funis...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#19069E]">Meus Funis</h1>
                    <p className="text-sm text-gray-500">
                        Gerencie seus funis de vendas e acompanhe a performance
                    </p>
                </div>
                <Link
                    href="/funis/novo"
                    className="flex items-center gap-2 px-5 py-3 bg-[#C2DF0C] hover:bg-[#B0CC0B] text-[#19069E] font-bold rounded-lg shadow-lg transition-all"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Novo Funil
                </Link>
            </div>

            {/* Empty State */}
            {funnels.length === 0 && (
                <div className="p-12 rounded-xl bg-white border border-gray-200 text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#19069E]/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-[#19069E]">filter_alt</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Nenhum funil criado</h3>
                    <p className="text-gray-500 mb-6">Crie seu primeiro funil para começar a acompanhar suas métricas.</p>
                    <Link
                        href="/funis/novo"
                        className="inline-flex items-center gap-2 px-5 py-3 bg-[#19069E] hover:bg-[#12047A] text-white font-bold rounded-lg transition-all"
                    >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        Criar Primeiro Funil
                    </Link>
                </div>
            )}

            {/* Funnel Cards Grid */}
            {funnels.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {funnels.map((funnel) => (
                        <div
                            key={funnel.id}
                            className="group p-6 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all"
                        >
                            {/* Card Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-lg bg-[#19069E]/10">
                                        <span className="material-symbols-outlined text-[24px] text-[#19069E]">
                                            filter_alt
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 group-hover:text-[#19069E] transition-colors">
                                            {funnel.name}
                                        </h3>
                                        <p className="text-xs text-gray-500">
                                            {funnel.stages.length} etapas
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (confirm("Tem certeza que deseja excluir este funil?")) {
                                            deleteFunnel(funnel.id);
                                        }
                                    }}
                                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                </button>
                            </div>

                            {/* Stage Preview */}
                            {funnel.stages.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-4">
                                    {funnel.stages.slice(0, 6).map((stage) => (
                                        <span
                                            key={stage.id}
                                            className="text-lg"
                                            title={stage.name}
                                        >
                                            {stage.emoji}
                                        </span>
                                    ))}
                                    {funnel.stages.length > 6 && (
                                        <span className="text-sm text-gray-400">
                                            +{funnel.stages.length - 6}
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Status */}
                            <div className="flex items-center gap-2 mb-4">
                                {funnel.sheetsUrl ? (
                                    <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                        Planilha conectada
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                                        <span className="material-symbols-outlined text-[14px]">warning</span>
                                        Sem planilha
                                    </span>
                                )}
                            </div>

                            {/* Info */}
                            <p className="text-xs text-gray-400 mb-4">
                                Criado em {new Date(funnel.createdAt).toLocaleDateString("pt-BR")}
                            </p>

                            {/* Action */}
                            <Link
                                href={`/funis/${funnel.id}`}
                                className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#19069E] hover:bg-[#12047A] text-white font-bold text-sm rounded-lg transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">visibility</span>
                                Ver Detalhes
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
