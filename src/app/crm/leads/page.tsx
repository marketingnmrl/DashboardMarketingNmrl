"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useLeads } from "@/hooks/useLeads";
import { usePipelines } from "@/hooks/usePipelines";
import type { LeadOrigin } from "@/types/crm";

export default function LeadsPage() {
    const { pipelines } = usePipelines();
    const [filterPipeline, setFilterPipeline] = useState<string>("all");
    const [filterOrigin, setFilterOrigin] = useState<LeadOrigin | "all">("all");
    const [filterUtmSource, setFilterUtmSource] = useState<string>("all");
    const [filterUtmCampaign, setFilterUtmCampaign] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [showUtmFilters, setShowUtmFilters] = useState(false);

    const { leads, isLoading, error, deleteLead } = useLeads(
        filterPipeline !== "all" ? { pipelineId: filterPipeline } : {}
    );

    // Extract unique UTM values for filter options
    const utmOptions = useMemo(() => {
        const sources = new Set<string>();
        const campaigns = new Set<string>();

        leads.forEach(lead => {
            if (lead.utm_source) sources.add(lead.utm_source);
            if (lead.utm_campaign) campaigns.add(lead.utm_campaign);
        });

        return {
            sources: Array.from(sources).sort(),
            campaigns: Array.from(campaigns).sort()
        };
    }, [leads]);

    // Filter leads
    const filteredLeads = leads.filter(lead => {
        // Origin filter
        if (filterOrigin !== "all" && lead.origin !== filterOrigin) return false;

        // UTM filters
        if (filterUtmSource !== "all" && lead.utm_source !== filterUtmSource) return false;
        if (filterUtmCampaign !== "all" && lead.utm_campaign !== filterUtmCampaign) return false;

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            return (
                lead.name.toLowerCase().includes(term) ||
                lead.email?.toLowerCase().includes(term) ||
                lead.phone?.includes(term) ||
                lead.company?.toLowerCase().includes(term) ||
                lead.utm_source?.toLowerCase().includes(term) ||
                lead.utm_campaign?.toLowerCase().includes(term)
            );
        }

        return true;
    });

    const handleDelete = async (id: string) => {
        if (confirm("Excluir este lead?")) {
            await deleteLead(id);
        }
    };

    const clearFilters = () => {
        setFilterPipeline("all");
        setFilterOrigin("all");
        setFilterUtmSource("all");
        setFilterUtmCampaign("all");
        setSearchTerm("");
    };

    const hasActiveFilters = filterPipeline !== "all" || filterOrigin !== "all" ||
        filterUtmSource !== "all" || filterUtmCampaign !== "all" || searchTerm !== "";

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

            {/* Filters Row 1 */}
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
                        placeholder="Buscar por nome, email, telefone, UTM..."
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

                {/* Toggle UTM Filters */}
                <button
                    onClick={() => setShowUtmFilters(!showUtmFilters)}
                    className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl transition-colors ${showUtmFilters || filterUtmSource !== "all" || filterUtmCampaign !== "all"
                            ? "border-[#19069E] bg-[#19069E]/5 text-[#19069E]"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                >
                    <span className="material-symbols-outlined text-[18px]">tune</span>
                    UTMs
                    {(filterUtmSource !== "all" || filterUtmCampaign !== "all") && (
                        <span className="w-2 h-2 bg-[#19069E] rounded-full" />
                    )}
                </button>

                {/* Clear Filters */}
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="flex items-center gap-1 px-3 py-2.5 text-gray-500 hover:text-red-500 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                        Limpar
                    </button>
                )}
            </div>

            {/* UTM Filters Row */}
            {showUtmFilters && (
                <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">link</span>
                        Filtros UTM:
                    </span>

                    {/* UTM Source */}
                    <select
                        value={filterUtmSource}
                        onChange={(e) => setFilterUtmSource(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-[#19069E]/20 focus:border-[#19069E]"
                    >
                        <option value="all">Todos os Sources</option>
                        {utmOptions.sources.map(source => (
                            <option key={source} value={source}>{source}</option>
                        ))}
                    </select>

                    {/* UTM Campaign */}
                    <select
                        value={filterUtmCampaign}
                        onChange={(e) => setFilterUtmCampaign(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-[#19069E]/20 focus:border-[#19069E]"
                    >
                        <option value="all">Todas as Campaigns</option>
                        {utmOptions.campaigns.map(campaign => (
                            <option key={campaign} value={campaign}>{campaign}</option>
                        ))}
                    </select>
                </div>
            )}

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
                                    <th className="text-left py-4 px-4 font-bold text-gray-700">Pipeline</th>
                                    <th className="text-left py-4 px-4 font-bold text-gray-700">Etapa</th>
                                    <th className="text-left py-4 px-4 font-bold text-gray-700">Origem</th>
                                    <th className="text-left py-4 px-4 font-bold text-gray-700">UTM</th>
                                    <th className="text-left py-4 px-4 font-bold text-gray-700">Criado em</th>
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
                                            {lead.phone && (
                                                <p className="text-xs text-gray-400">{lead.phone}</p>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-gray-600 text-sm">
                                            {lead.email || "—"}
                                        </td>
                                        <td className="py-3 px-4 text-gray-600 text-sm">
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
                                        <td className="py-3 px-4 text-xs text-gray-500">
                                            {lead.utm_source && (
                                                <div><strong>source:</strong> {lead.utm_source}</div>
                                            )}
                                            {lead.utm_campaign && (
                                                <div><strong>campaign:</strong> {lead.utm_campaign}</div>
                                            )}
                                            {!lead.utm_source && !lead.utm_campaign && "—"}
                                        </td>
                                        <td className="py-3 px-4 text-gray-500 text-sm">
                                            {new Date(lead.created_at).toLocaleDateString("pt-BR", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit"
                                            })}
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
