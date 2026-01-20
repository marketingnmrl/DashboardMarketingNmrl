"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { usePipelines } from "@/hooks/usePipelines";
import { useLeads } from "@/hooks/useLeads";
import type { CRMPipeline, CRMLead, CRMPipelineStage } from "@/types/crm";
import { DEFAULT_LEAD_ORIGINS } from "@/types/crm";
import { PipelineAnalyticsModal } from "@/components/crm/PipelineAnalyticsModal";

export default function PipelineKanbanPage() {
    const params = useParams();
    const router = useRouter();
    const pipelineId = params.id as string;

    const { getPipeline, addStage, updateStage, deleteStage, reorderStages } = usePipelines();
    const { leads, createLead, moveLead, deleteLead, fetchLeads } = useLeads({ pipelineId });

    const [pipeline, setPipeline] = useState<CRMPipeline | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [draggedLead, setDraggedLead] = useState<string | null>(null);
    const [showAddLead, setShowAddLead] = useState<string | null>(null); // stage id
    const [newLeadName, setNewLeadName] = useState("");
    const [newLeadEmail, setNewLeadEmail] = useState("");
    const [newLeadPhone, setNewLeadPhone] = useState("");
    const [newLeadOrigin, setNewLeadOrigin] = useState("");
    const [showAddStage, setShowAddStage] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [newStageName, setNewStageName] = useState("");
    const [newStageColor, setNewStageColor] = useState("#19069E");
    const [newStageValue, setNewStageValue] = useState<string>("");

    // Fetch pipeline data
    const loadPipeline = useCallback(async () => {
        setIsLoading(true);
        const data = await getPipeline(pipelineId);
        if (data) {
            setPipeline(data);
        }
        setIsLoading(false);
    }, [pipelineId, getPipeline]);

    useEffect(() => {
        loadPipeline();
    }, [loadPipeline]);

    // Group leads by stage
    const leadsByStage = (pipeline?.stages || []).reduce((acc, stage) => {
        acc[stage.id] = leads.filter(lead => lead.current_stage_id === stage.id);
        return acc;
    }, {} as Record<string, CRMLead[]>);

    // Compute all available origins from defaults + existing leads
    const availableOrigins = Array.from(new Set([
        ...DEFAULT_LEAD_ORIGINS,
        ...leads.map(l => l.origin).filter(Boolean)
    ])).sort();

    // Drag handlers
    const handleDragStart = (leadId: string) => {
        setDraggedLead(leadId);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = async (stageId: string) => {
        if (draggedLead) {
            await moveLead(draggedLead, stageId, "user");
            setDraggedLead(null);
            await loadPipeline();
        }
    };

    // Add lead
    const handleAddLead = async (stageId: string) => {
        if (!newLeadName.trim()) return;

        await createLead({
            pipeline_id: pipelineId,
            stage_id: stageId,
            name: newLeadName,
            email: newLeadEmail || undefined,
            phone: newLeadPhone || undefined,
            origin: newLeadOrigin || "manual"
        });

        setNewLeadName("");
        setNewLeadEmail("");
        setNewLeadPhone("");
        setNewLeadOrigin("");
        setShowAddLead(null);
        await loadPipeline();
    };


    // Add stage
    const handleAddStage = async () => {
        if (!newStageName.trim()) return;

        const defaultValue = newStageValue ? parseFloat(newStageValue) : null;
        await addStage(pipelineId, newStageName, newStageColor, defaultValue);
        setNewStageName("");
        setNewStageColor("#19069E");
        setNewStageValue("");
        setShowAddStage(false);
        await loadPipeline();
    };

    // Delete lead
    const handleDeleteLead = async (leadId: string) => {
        if (confirm("Excluir este lead?")) {
            await deleteLead(leadId);
            await loadPipeline();
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <span className="material-symbols-outlined text-4xl text-gray-300 animate-pulse">hourglass_empty</span>
            </div>
        );
    }

    if (!pipeline) {
        return (
            <div className="text-center py-16">
                <h2 className="text-xl font-bold text-gray-700">Pipeline não encontrado</h2>
                <Link href="/crm/pipelines" className="text-[#19069E] hover:underline mt-4 inline-block">
                    ← Voltar para Pipelines
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-full mx-auto space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/crm/pipelines"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-gray-500">arrow_back</span>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-extrabold text-[#19069E]">{pipeline.name}</h1>
                        <p className="text-sm text-gray-500">
                            {leads.length} leads • {pipeline.stages?.length || 0} etapas
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowAnalytics(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:text-[#19069E] transition-colors shadow-sm"
                    >
                        <span className="material-symbols-outlined text-[18px]">bar_chart</span>
                        Gráfico
                    </button>
                    <button
                        onClick={() => setShowAddStage(true)}
                        className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-xl hover:border-[#19069E] hover:text-[#19069E] transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Adicionar Etapa
                    </button>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="overflow-x-auto pb-4">
                <div className="flex gap-4 min-w-min">
                    {(pipeline.stages || []).map((stage) => (
                        <div
                            key={stage.id}
                            className="w-80 flex-shrink-0"
                            onDragOver={handleDragOver}
                            onDrop={() => handleDrop(stage.id)}
                        >
                            {/* Column Header */}
                            <div
                                className="flex items-center justify-between p-3 rounded-t-xl"
                                style={{ backgroundColor: stage.color + "20" }}
                            >
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: stage.color }}
                                    />
                                    <span className="font-bold text-gray-800">{stage.name}</span>
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                        {leadsByStage[stage.id]?.length || 0}
                                    </span>
                                </div>
                            </div>

                            {/* Column Body */}
                            <div
                                className="bg-gray-50 p-3 rounded-b-xl min-h-[60vh] space-y-3"
                                style={{ borderTop: `3px solid ${stage.color}` }}
                            >
                                {/* Lead Cards */}
                                {(leadsByStage[stage.id] || []).map((lead) => (
                                    <div
                                        key={lead.id}
                                        draggable
                                        onDragStart={() => handleDragStart(lead.id)}
                                        className={`p-4 bg-white rounded-xl border border-gray-200 shadow-sm cursor-move hover:shadow-md transition-shadow group ${draggedLead === lead.id ? "opacity-50" : ""
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <Link
                                                    href={`/crm/leads/${lead.id}`}
                                                    className="font-bold text-gray-900 hover:text-[#19069E] block truncate"
                                                >
                                                    {lead.name}
                                                </Link>
                                                {lead.email && (
                                                    <p className="text-xs text-gray-500 truncate">{lead.email}</p>
                                                )}
                                                {lead.phone && (
                                                    <p className="text-xs text-gray-500">{lead.phone}</p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleDeleteLead(lead.id)}
                                                className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">close</span>
                                            </button>
                                        </div>

                                        {/* Origin Badge + Deal Value */}
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${lead.origin === "paid" ? "bg-blue-100 text-blue-700" :
                                                lead.origin === "organic" ? "bg-green-100 text-green-700" :
                                                    lead.origin === "webhook" ? "bg-purple-100 text-purple-700" :
                                                        lead.origin === "manual" ? "bg-gray-100 text-gray-600" :
                                                            "bg-orange-100 text-orange-700"
                                                }`}>
                                                {lead.origin === "paid" ? "Pago" :
                                                    lead.origin === "organic" ? "Orgânico" :
                                                        lead.origin === "webhook" ? "Webhook" :
                                                            lead.origin === "manual" ? "Manual" :
                                                                lead.origin}
                                            </span>
                                            {lead.deal_value && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold">
                                                    R$ {lead.deal_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* Add Lead Button/Form */}
                                {showAddLead === stage.id ? (
                                    <div className="p-3 bg-white rounded-xl border-2 border-[#19069E] space-y-2">
                                        <input
                                            type="text"
                                            value={newLeadName}
                                            onChange={(e) => setNewLeadName(e.target.value)}
                                            placeholder="Nome do lead *"
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#19069E]/20 focus:border-[#19069E]"
                                            autoFocus
                                        />
                                        <input
                                            type="email"
                                            value={newLeadEmail}
                                            onChange={(e) => setNewLeadEmail(e.target.value)}
                                            placeholder="Email (opcional)"
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#19069E]/20 focus:border-[#19069E]"
                                        />
                                        <input
                                            type="tel"
                                            value={newLeadPhone}
                                            onChange={(e) => setNewLeadPhone(e.target.value)}
                                            placeholder="Telefone (opcional)"
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#19069E]/20 focus:border-[#19069E]"
                                        />
                                        <div className="relative">
                                            <input
                                                type="text"
                                                list={`origins-${stage.id}`}
                                                value={newLeadOrigin}
                                                onChange={(e) => setNewLeadOrigin(e.target.value)}
                                                placeholder="Origem (ex: Indicação)"
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#19069E]/20 focus:border-[#19069E]"
                                            />
                                            <datalist id={`origins-${stage.id}`}>
                                                {availableOrigins.map(origin => (
                                                    <option key={origin} value={origin} />
                                                ))}
                                            </datalist>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleAddLead(stage.id)}
                                                disabled={!newLeadName.trim()}
                                                className="flex-1 py-2 bg-[#C2DF0C] text-[#19069E] text-sm font-bold rounded-lg hover:bg-[#B0CC0B] disabled:opacity-50"
                                            >
                                                Adicionar
                                            </button>
                                            <button
                                                onClick={() => setShowAddLead(null)}
                                                className="px-3 py-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">close</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setShowAddLead(stage.id)}
                                        className="w-full py-3 border-2 border-dashed border-gray-200 text-gray-400 rounded-xl hover:border-[#19069E] hover:text-[#19069E] transition-colors flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">add</span>
                                        Adicionar Lead
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Add Stage Column */}
                    {showAddStage && (
                        <div className="w-80 flex-shrink-0">
                            <div className="p-4 bg-white rounded-xl border-2 border-dashed border-[#19069E] space-y-3">
                                <input
                                    type="text"
                                    value={newStageName}
                                    onChange={(e) => setNewStageName(e.target.value)}
                                    placeholder="Nome da etapa"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#19069E]/20 focus:border-[#19069E]"
                                    autoFocus
                                />
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">Cor:</span>
                                    <input
                                        type="color"
                                        value={newStageColor}
                                        onChange={(e) => setNewStageColor(e.target.value)}
                                        className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">Valor padrão:</span>
                                    <input
                                        type="number"
                                        value={newStageValue}
                                        onChange={(e) => setNewStageValue(e.target.value)}
                                        placeholder="R$ 0,00"
                                        step="0.01"
                                        min="0"
                                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#19069E]/20 focus:border-[#19069E]"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleAddStage}
                                        disabled={!newStageName.trim()}
                                        className="flex-1 py-2 bg-[#C2DF0C] text-[#19069E] font-bold rounded-lg hover:bg-[#B0CC0B] disabled:opacity-50"
                                    >
                                        Criar
                                    </button>
                                    <button
                                        onClick={() => setShowAddStage(false)}
                                        className="px-3 py-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">close</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {pipeline && (
                <PipelineAnalyticsModal
                    isOpen={showAnalytics}
                    onClose={() => setShowAnalytics(false)}
                    pipelineId={pipelineId}
                    pipelineName={pipeline.name}
                />
            )}
        </div>
    );
}
