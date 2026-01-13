"use client";

import { useState } from "react";
import Link from "next/link";
import { useLeads } from "@/hooks/useLeads";
import { usePipelines } from "@/hooks/usePipelines";
import type { CRMLead, LeadOrigin } from "@/types/crm";

export default function LeadsPage() {
    const { pipelines } = usePipelines();
    const [filterPipeline, setFilterPipeline] = useState<string>("all");
    const [filterOrigin, setFilterOrigin] = useState<LeadOrigin | "all">("all");
    const [searchTerm, setSearchTerm] = useState("");

    const { leads, isLoading, error, deleteLead } = useLeads(
        filterPipeline !== "all" ? { pipelineId: filterPipeline } : {}
    );

    // Filter leads
    const filteredLeads = leads.filter(lead => {
        // Origin filter
        if (filterOrigin !== "all" && lead.origin !== filterOrigin) return false;

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            return (
                lead.name.toLowerCase().includes(term) ||
                lead.email?.toLowerCase().includes(term) ||
                lead.phone?.includes(term) ||
                lead.company?.toLowerCase().includes(term)
            );
        }

        return true;
    });

    const handleDelete = async (id: string) => {
        if (confirm("Excluir este lead?")) {
            await deleteLead(id);
        }
    };

    const originLabels: Record<LeadOrigin, string> = {
        organic: "Orgânico",
        paid: "Pago",
        manual: "Manual",
        webhook: "Webhook"
    };

    const originColors: Record<LeadOrigin, string> = {
        organic: "bg-green-100 text-green-700",
        paid: "bg-blue-100 text-blue-700",
        manual: "bg-gray-100 text-gray-700",
        webhook: "bg-purple-100 text-purple-700"
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#19069E]">👥 Leads</h1>
                    <p className="text-sm text-gray-500">Todos os leads cadastrados</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                        search
                    </span>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar por nome, email, telefone..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#19069E]/20 focus:border-[#19069E]"
                    />
                </div>

                {/* Pipeline Filter */}
                <select
                    value={filterPipeline}
                    onChange={(e) => setFilterPipeline(e.target.value)}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#19069E]/20 focus:border-[#19069E]"
                >
                    <option value="all">Todos os Pipelines</option>
                    {pipelines.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>

                {/* Origin Filter */}
                <select
                    value={filterOrigin}
                    onChange={(e) => setFilterOrigin(e.target.value as LeadOrigin | "all")}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#19069E]/20 focus:border-[#19069E]"
                >
                    <option value="all">Todas as Origens</option>
                    <option value="organic">Orgânico</option>
                    <option value="paid">Tráfego Pago</option>
                    <option value="manual">Manual</option>
                    <option value="webhook">Webhook</option>
                </select>
            </div>

            {/* Stats */}
            <div className="flex gap-4 text-sm">
                <span className="text-gray-500">
                    <strong className="text-[#19069E]">{filteredLeads.length}</strong> leads encontrados
                </span>
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <span className="material-symbols-outlined text-4xl text-gray-300 animate-pulse">hourglass_empty</span>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700">
                    <p className="font-bold">Erro ao carregar leads</p>
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && filteredLeads.length === 0 && (
                <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-4xl text-gray-400">people</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-700 mb-2">Nenhum lead encontrado</h3>
                    <p className="text-gray-500">Adicione leads pelo Kanban ou via webhook</p>
                </div>
            )}

            {/* Leads Table */}
            {!isLoading && !error && filteredLeads.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="text-left py-4 px-4 font-bold text-gray-700">Nome</th>
                                    <th className="text-left py-4 px-4 font-bold text-gray-700">Email</th>
                                    <th className="text-left py-4 px-4 font-bold text-gray-700">Telefone</th>
                                    <th className="text-left py-4 px-4 font-bold text-gray-700">Pipeline</th>
                                    <th className="text-left py-4 px-4 font-bold text-gray-700">Etapa</th>
                                    <th className="text-left py-4 px-4 font-bold text-gray-700">Origem</th>
                                    <th className="text-left py-4 px-4 font-bold text-gray-700">Data</th>
                                    <th className="text-center py-4 px-4 font-bold text-gray-700">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLeads.map((lead, i) => (
                                    <tr
                                        key={lead.id}
                                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                                            }`}
                                    >
                                        <td className="py-3 px-4">
                                            <Link
                                                href={`/crm/leads/${lead.id}`}
                                                className="font-bold text-[#19069E] hover:underline"
                                            >
                                                {lead.name}
                                            </Link>
                                            {lead.company && (
                                                <p className="text-xs text-gray-500">{lead.company}</p>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-gray-600">
                                            {lead.email || "—"}
                                        </td>
                                        <td className="py-3 px-4 text-gray-600">
                                            {lead.phone || "—"}
                                        </td>
                                        <td className="py-3 px-4 text-gray-600">
                                            {lead.pipeline?.name || "—"}
                                        </td>
                                        <td className="py-3 px-4">
                                            {lead.current_stage && (
                                                <span
                                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                                                    style={{
                                                        backgroundColor: lead.current_stage.color + "20",
                                                        color: lead.current_stage.color
                                                    }}
                                                >
                                                    <div
                                                        className="w-2 h-2 rounded-full"
                                                        style={{ backgroundColor: lead.current_stage.color }}
                                                    />
                                                    {lead.current_stage.name}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`text-xs px-2 py-1 rounded-full ${originColors[lead.origin]}`}>
                                                {originLabels[lead.origin]}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-500 text-sm">
                                            {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <Link
                                                    href={`/crm/leads/${lead.id}`}
                                                    className="p-1.5 text-gray-400 hover:text-[#19069E] hover:bg-[#19069E]/10 rounded-lg"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(lead.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
