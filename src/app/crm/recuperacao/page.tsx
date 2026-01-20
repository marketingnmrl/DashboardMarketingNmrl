"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePipelines } from "@/hooks/usePipelines";
import { useRecovery } from "@/hooks/useRecovery";
import type { CRMPipelineStage } from "@/types/crm";

export default function RecoveryPage() {
    const { pipelines, fetchPipelines } = usePipelines();
    const { leads, isLoading, isProcessing, fetchRecoveryLeads, moveLeads } = useRecovery();

    const [selectedPipelineId, setSelectedPipelineId] = useState("");
    const [passedStageId, setPassedStageId] = useState("");
    const [excludeStageId, setExcludeStageId] = useState("");
    const [targetStageId, setTargetStageId] = useState("");
    const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
    const [showBulkAction, setShowBulkAction] = useState(false);

    useEffect(() => {
        fetchPipelines();
    }, [fetchPipelines]);

    const selectedPipeline = pipelines.find(p => p.id === selectedPipelineId);

    const handleSearch = () => {
        if (selectedPipelineId && passedStageId && excludeStageId) {
            fetchRecoveryLeads(selectedPipelineId, passedStageId, excludeStageId);
            setSelectedLeads([]);
            setShowBulkAction(false);
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedLeads(leads.map(l => l.id));
        } else {
            setSelectedLeads([]);
        }
    };

    const handleSelectLead = (id: string) => {
        setSelectedLeads(prev =>
            prev.includes(id) ? prev.filter(lId => lId !== id) : [...prev, id]
        );
    };

    const handleBulkMove = async () => {
        if (!targetStageId) return;
        if (confirm(`Mover ${selectedLeads.length} leads para a nova etapa?`)) {
            const success = await moveLeads(selectedLeads, targetStageId);
            if (success) {
                alert("Leads movidos com sucesso!");
                setShowBulkAction(false);
                setSelectedLeads([]);
            }
        }
    };

    const handleExport = () => {
        if (leads.length === 0) return;

        const headers = ["Nome", "Email", "Telefone", "Etapa Atual", "Data Criação", "Origem"];
        const csvContent = [
            headers.join(","),
            ...leads.map(lead => [
                `"${lead.name}"`,
                `"${lead.email || ""}"`,
                `"${lead.phone || ""}"`,
                `"${lead.current_stage?.name || ""}"`,
                `"${new Date(lead.created_at).toLocaleDateString()}"`,
                `"${lead.origin || ""}"`
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `recuperacao_leads_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/crm/pipelines"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <span className="material-symbols-outlined text-gray-500">arrow_back</span>
                </Link>
                <div>
                    <h1 className="text-2xl font-extrabold text-[#19069E]">Recuperação de Leads</h1>
                    <p className="text-sm text-gray-500">Encontre leads perdidos e faça novas ofertas.</p>
                </div>
            </div>

            {/* Filters Card */}
            <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Pipeline</label>
                        <select
                            value={selectedPipelineId}
                            onChange={(e) => {
                                setSelectedPipelineId(e.target.value);
                                setPassedStageId("");
                                setExcludeStageId("");
                            }}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                        >
                            <option value="">Selecione um pipeline...</option>
                            {pipelines.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">
                            Passou pela etapa (Gatilho)
                        </label>
                        <select
                            value={passedStageId}
                            onChange={(e) => setPassedStageId(e.target.value)}
                            disabled={!selectedPipelineId}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg disabled:bg-gray-50"
                        >
                            <option value="">Selecione (ex: Call Realizada)...</option>
                            {selectedPipeline?.stages?.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">
                            NÃO está na etapa (Sucesso)
                        </label>
                        <select
                            value={excludeStageId}
                            onChange={(e) => setExcludeStageId(e.target.value)}
                            disabled={!selectedPipelineId}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg disabled:bg-gray-50"
                        >
                            <option value="">Selecione (ex: Venda Acelera)...</option>
                            {selectedPipeline?.stages?.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex justify-end">
                    <button
                        onClick={handleSearch}
                        disabled={!selectedPipelineId || !passedStageId || !excludeStageId || isLoading}
                        className="px-6 py-2 bg-[#19069E] text-white font-bold rounded-xl hover:bg-[#150580] disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                        {isLoading ? (
                            <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                        ) : (
                            <span className="material-symbols-outlined text-sm">search</span>
                        )}
                        Buscar Leads
                    </button>
                </div>
            </div>

            {/* Results */}
            {leads.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <div className="flex items-center gap-4">
                            <h3 className="font-bold text-gray-700">
                                {leads.length} leads encontrados
                            </h3>
                            <button
                                onClick={handleExport}
                                className="text-sm text-[#19069E] hover:underline flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-[16px]">download</span>
                                Exportar CSV
                            </button>
                        </div>
                        {selectedLeads.length > 0 && (
                            <div className="flex items-center gap-2 animate-fadeIn">
                                <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-lg border border-gray-200">
                                    {selectedLeads.length} selecionados
                                </span>
                                <select
                                    value={targetStageId}
                                    onChange={(e) => setTargetStageId(e.target.value)}
                                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm w-48"
                                >
                                    <option value="">Mover para...</option>
                                    {selectedPipeline?.stages?.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleBulkMove}
                                    disabled={!targetStageId || isProcessing}
                                    className="px-4 py-1.5 bg-[#C2DF0C] text-[#19069E] font-bold rounded-lg text-sm hover:bg-[#B0CC0B] disabled:opacity-50"
                                >
                                    {isProcessing ? "Processando..." : "Confirmar"}
                                </button>
                            </div>
                        )}
                    </div>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="p-4 w-10">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={selectedLeads.length === leads.length && leads.length > 0}
                                        className="rounded border-gray-300"
                                    />
                                </th>
                                <th className="p-4 font-medium">Nome</th>
                                <th className="p-4 font-medium">Email</th>
                                <th className="p-4 font-medium">Telefone</th>
                                <th className="p-4 font-medium">Etapa Atual</th>
                                <th className="p-4 font-medium">Data Criação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {leads.map(lead => (
                                <tr key={lead.id} className="hover:bg-gray-50">
                                    <td className="p-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedLeads.includes(lead.id)}
                                            onChange={() => handleSelectLead(lead.id)}
                                            className="rounded border-gray-300"
                                        />
                                    </td>
                                    <td className="p-4 font-medium text-gray-900">
                                        <Link href={`/crm/leads/${lead.id}`} className="hover:text-[#19069E] hover:underline">
                                            {lead.name}
                                        </Link>
                                    </td>
                                    <td className="p-4 text-gray-500">{lead.email || "—"}</td>
                                    <td className="p-4 text-gray-500">{lead.phone || "—"}</td>
                                    <td className="p-4">
                                        <span
                                            className="px-2 py-1 rounded-full text-xs font-medium"
                                            style={{
                                                backgroundColor: (lead.current_stage?.color || "#9CA3AF") + "20",
                                                color: lead.current_stage?.color || "#4B5563"
                                            }}
                                        >
                                            {lead.current_stage?.name || "Sem etapa"}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-500">
                                        {new Date(lead.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
