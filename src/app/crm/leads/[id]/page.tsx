"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useLeads } from "@/hooks/useLeads";
import { usePipelines } from "@/hooks/usePipelines";
import { useCustomFields } from "@/hooks/useCustomFields";
import type { CRMLead, CRMLeadStageHistory, CRMLeadInteraction, InteractionType } from "@/types/crm";

export default function LeadDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const leadId = params.id as string;

    const { getLead, getLeadHistory, getLeadInteractions, updateLead, moveLead, addInteraction, deleteLead, deleteStageHistory } = useLeads();
    const { pipelines } = usePipelines();
    const { customFields: globalCustomFields } = useCustomFields();

    const [lead, setLead] = useState<CRMLead | null>(null);
    const [history, setHistory] = useState<CRMLeadStageHistory[]>([]);
    const [interactions, setInteractions] = useState<CRMLeadInteraction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", company: "" });
    const [customFields, setCustomFields] = useState<Record<string, string>>({});
    const [showAddInteraction, setShowAddInteraction] = useState(false);
    const [newInteraction, setNewInteraction] = useState({ type: "note" as InteractionType, title: "", content: "" });
    const [isSavingCustom, setIsSavingCustom] = useState(false);

    // Load lead data
    const loadData = useCallback(async () => {
        setIsLoading(true);
        const leadData = await getLead(leadId);
        if (leadData) {
            setLead(leadData);
            setEditForm({
                name: leadData.name,
                email: leadData.email || "",
                phone: leadData.phone || "",
                company: leadData.company || ""
            });
            setCustomFields(leadData.custom_fields as Record<string, string> || {});

            const [historyData, interactionsData] = await Promise.all([
                getLeadHistory(leadId),
                getLeadInteractions(leadId)
            ]);
            setHistory(historyData);
            setInteractions(interactionsData);
        }
        setIsLoading(false);
    }, [leadId, getLead, getLeadHistory, getLeadInteractions]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Save lead edits
    const handleSave = async () => {
        if (!lead) return;
        await updateLead(lead.id, { ...editForm, custom_fields: customFields });
        setIsEditing(false);
        await loadData();
    };

    // Save custom fields
    const handleSaveCustomFields = async () => {
        if (!lead) return;
        setIsSavingCustom(true);
        await updateLead(lead.id, { custom_fields: customFields });
        setIsSavingCustom(false);
    };

    // Update single custom field
    const updateCustomFieldValue = (key: string, value: string) => {
        setCustomFields(prev => ({ ...prev, [key]: value }));
    };

    // Add interaction
    const handleAddInteraction = async () => {
        if (!newInteraction.content.trim()) return;
        await addInteraction({
            lead_id: leadId,
            type: newInteraction.type,
            title: newInteraction.title || undefined,
            content: newInteraction.content,
            created_by: "Usuário"
        });
        setNewInteraction({ type: "note", title: "", content: "" });
        setShowAddInteraction(false);
        await loadData();
    };

    // Delete lead
    const handleDelete = async () => {
        if (confirm("Excluir este lead permanentemente?")) {
            await deleteLead(leadId);
            router.push("/crm/leads");
        }
    };

    // Move to stage
    const handleMoveStage = async (stageId: string) => {
        await moveLead(leadId, stageId, "user");
        await loadData();
    };

    // Delete history entry
    const handleDeleteHistory = async (historyId: string) => {
        if (confirm("Excluir esta movimentação do histórico? Isso afetará as métricas do funil.")) {
            const success = await deleteStageHistory(historyId);
            if (success) {
                setHistory(prev => prev.filter(h => h.id !== historyId));
            }
        }
    };

    const currentPipeline = pipelines.find(p => p.id === lead?.pipeline_id);

    const interactionIcons: Record<InteractionType, string> = {
        note: "description",
        call: "call",
        email: "email",
        meeting: "event",
        task: "task"
    };

    const interactionLabels: Record<InteractionType, string> = {
        note: "Nota",
        call: "Ligação",
        email: "Email",
        meeting: "Reunião",
        task: "Tarefa"
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <span className="material-symbols-outlined text-4xl text-gray-300 animate-pulse">hourglass_empty</span>
            </div>
        );
    }

    if (!lead) {
        return (
            <div className="text-center py-16">
                <h2 className="text-xl font-bold text-gray-700">Lead não encontrado</h2>
                <Link href="/crm/leads" className="text-[#19069E] hover:underline mt-4 inline-block">
                    ← Voltar para Leads
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/crm/leads"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <span className="material-symbols-outlined text-gray-500">arrow_back</span>
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-extrabold text-[#19069E]">{lead.name}</h1>
                    <p className="text-sm text-gray-500">
                        Criado em {new Date(lead.created_at).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                        })}
                    </p>
                </div>
                <button
                    onClick={handleDelete}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                >
                    <span className="material-symbols-outlined">delete</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Contact Card */}
                    <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-800">📇 Informações de Contato</h3>
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="text-sm text-[#19069E] hover:underline"
                                >
                                    Editar
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSave}
                                        className="px-3 py-1 bg-[#C2DF0C] text-[#19069E] text-sm font-bold rounded-lg"
                                    >
                                        Salvar
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-3 py-1 text-gray-500 text-sm hover:bg-gray-100 rounded-lg"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            )}
                        </div>

                        {isEditing ? (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Nome</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Empresa</label>
                                    <input
                                        type="text"
                                        value={editForm.company}
                                        onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Telefone</label>
                                    <input
                                        type="tel"
                                        value={editForm.phone}
                                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs text-gray-500">Nome</span>
                                    <p className="font-medium">{lead.name}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500">Empresa</span>
                                    <p className="font-medium">{lead.company || "—"}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500">Email</span>
                                    <p className="font-medium">{lead.email || "—"}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500">Telefone</span>
                                    <p className="font-medium">{lead.phone || "—"}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Custom Fields Card */}
                    <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-800">🏷️ Campos Personalizados</h3>
                            <button
                                onClick={handleSaveCustomFields}
                                disabled={isSavingCustom}
                                className="text-sm px-3 py-1 bg-[#C2DF0C] text-[#19069E] font-bold rounded-lg disabled:opacity-50"
                            >
                                {isSavingCustom ? "Salvando..." : "Salvar"}
                            </button>
                        </div>

                        {globalCustomFields.length === 0 ? (
                            <div className="text-center py-6">
                                <p className="text-gray-400 text-sm">Nenhum campo personalizado definido</p>
                                <Link href="/crm/configuracoes" className="text-xs text-[#19069E] hover:underline mt-1 inline-block">
                                    Criar campos em Configurações
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {globalCustomFields.map(field => (
                                    <div key={field.id} className="flex items-center gap-3">
                                        <label className="w-1/3 text-sm text-gray-600 truncate">
                                            {field.name}
                                        </label>
                                        <div className="flex-1">
                                            {field.field_type === "text" && (
                                                <input
                                                    type="text"
                                                    value={customFields[field.field_key] || ""}
                                                    onChange={(e) => updateCustomFieldValue(field.field_key, e.target.value)}
                                                    placeholder="Digite..."
                                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                                                />
                                            )}
                                            {field.field_type === "number" && (
                                                <input
                                                    type="number"
                                                    value={customFields[field.field_key] || ""}
                                                    onChange={(e) => updateCustomFieldValue(field.field_key, e.target.value)}
                                                    placeholder="0"
                                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                                                />
                                            )}
                                            {field.field_type === "date" && (
                                                <input
                                                    type="date"
                                                    value={customFields[field.field_key] || ""}
                                                    onChange={(e) => updateCustomFieldValue(field.field_key, e.target.value)}
                                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                                                />
                                            )}
                                            {field.field_type === "select" && (
                                                <select
                                                    value={customFields[field.field_key] || ""}
                                                    onChange={(e) => updateCustomFieldValue(field.field_key, e.target.value)}
                                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white"
                                                >
                                                    <option value="">Selecione...</option>
                                                    {(field.options as string[] || []).map(opt => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            )}
                                            {field.field_type === "boolean" && (
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => updateCustomFieldValue(field.field_key, "true")}
                                                        className={`px-3 py-1.5 text-sm rounded-lg ${customFields[field.field_key] === "true"
                                                            ? "bg-green-500 text-white"
                                                            : "bg-gray-100 text-gray-600"
                                                            }`}
                                                    >
                                                        Sim
                                                    </button>
                                                    <button
                                                        onClick={() => updateCustomFieldValue(field.field_key, "false")}
                                                        className={`px-3 py-1.5 text-sm rounded-lg ${customFields[field.field_key] === "false"
                                                            ? "bg-red-500 text-white"
                                                            : "bg-gray-100 text-gray-600"
                                                            }`}
                                                    >
                                                        Não
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Interactions */}
                    <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-800">💬 Interações</h3>
                            <button
                                onClick={() => setShowAddInteraction(true)}
                                className="flex items-center gap-1 text-sm text-[#19069E] hover:underline"
                            >
                                <span className="material-symbols-outlined text-[16px]">add</span>
                                Adicionar
                            </button>
                        </div>

                        {/* Add Interaction Form */}
                        {showAddInteraction && (
                            <div className="mb-4 p-4 bg-gray-50 rounded-xl space-y-3">
                                <div className="flex gap-2">
                                    {(["note", "call", "email", "meeting", "task"] as InteractionType[]).map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setNewInteraction({ ...newInteraction, type })}
                                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${newInteraction.type === type
                                                ? "bg-[#19069E] text-white"
                                                : "bg-white text-gray-600 border border-gray-200"
                                                }`}
                                        >
                                            <span className="material-symbols-outlined text-[16px]">{interactionIcons[type]}</span>
                                            {interactionLabels[type]}
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    value={newInteraction.title}
                                    onChange={(e) => setNewInteraction({ ...newInteraction, title: e.target.value })}
                                    placeholder="Título (opcional)"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                                />
                                <textarea
                                    value={newInteraction.content}
                                    onChange={(e) => setNewInteraction({ ...newInteraction, content: e.target.value })}
                                    placeholder="Descreva a interação..."
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleAddInteraction}
                                        disabled={!newInteraction.content.trim()}
                                        className="px-4 py-2 bg-[#C2DF0C] text-[#19069E] font-bold rounded-lg disabled:opacity-50"
                                    >
                                        Salvar
                                    </button>
                                    <button
                                        onClick={() => setShowAddInteraction(false)}
                                        className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Interactions List */}
                        {interactions.length === 0 ? (
                            <p className="text-gray-400 text-sm text-center py-6">Nenhuma interação registrada</p>
                        ) : (
                            <div className="space-y-3">
                                {interactions.map(interaction => (
                                    <div key={interaction.id} className="flex gap-3 p-4 bg-gray-50 rounded-xl">
                                        <div className="w-10 h-10 bg-[#19069E]/10 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined text-[#19069E] text-[20px]">
                                                {interactionIcons[interaction.type]}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-gray-800">
                                                    {interaction.title || interactionLabels[interaction.type]}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(interaction.created_at).toLocaleDateString("pt-BR")}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">{interaction.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Pipeline & Stage */}
                    <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-4">📍 Pipeline</h3>

                        {currentPipeline && (
                            <div className="space-y-3">
                                <div>
                                    <span className="text-xs text-gray-500">Pipeline</span>
                                    <p className="font-medium">{currentPipeline.name}</p>
                                </div>

                                <div>
                                    <span className="text-xs text-gray-500 mb-2 block">Etapa Atual</span>
                                    <div className="space-y-1">
                                        {(currentPipeline.stages || []).map(stage => (
                                            <button
                                                key={stage.id}
                                                onClick={() => handleMoveStage(stage.id)}
                                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${lead.current_stage_id === stage.id
                                                    ? "bg-[#19069E] text-white"
                                                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                                    }`}
                                            >
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: lead.current_stage_id === stage.id ? "white" : stage.color }}
                                                />
                                                <span className="text-sm">{stage.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Origin & UTMs */}
                    <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-4">🔗 Origem</h3>
                        <div className="space-y-3">
                            <div>
                                <span className="text-xs text-gray-500">Origem</span>
                                <p className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${lead.origin === "paid" ? "bg-blue-100 text-blue-700" :
                                    lead.origin === "organic" ? "bg-green-100 text-green-700" :
                                        lead.origin === "webhook" ? "bg-purple-100 text-purple-700" :
                                            "bg-gray-100 text-gray-700"
                                    }`}>
                                    {lead.origin === "paid" ? "Tráfego Pago" :
                                        lead.origin === "organic" ? "Orgânico" :
                                            lead.origin === "webhook" ? "Webhook" : "Manual"}
                                </p>
                            </div>
                            {lead.utm_source && (
                                <div>
                                    <span className="text-xs text-gray-500">UTM Source</span>
                                    <p className="text-sm">{lead.utm_source}</p>
                                </div>
                            )}
                            {lead.utm_medium && (
                                <div>
                                    <span className="text-xs text-gray-500">UTM Medium</span>
                                    <p className="text-sm">{lead.utm_medium}</p>
                                </div>
                            )}
                            {lead.utm_campaign && (
                                <div>
                                    <span className="text-xs text-gray-500">UTM Campaign</span>
                                    <p className="text-sm">{lead.utm_campaign}</p>
                                </div>
                            )}
                            {lead.utm_content && (
                                <div>
                                    <span className="text-xs text-gray-500">UTM Content</span>
                                    <p className="text-sm">{lead.utm_content}</p>
                                </div>
                            )}
                            {lead.utm_term && (
                                <div>
                                    <span className="text-xs text-gray-500">UTM Term</span>
                                    <p className="text-sm">{lead.utm_term}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* History */}
                    <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-4">📜 Histórico</h3>
                        {history.length === 0 ? (
                            <p className="text-gray-400 text-sm text-center">Sem movimentações</p>
                        ) : (
                            <div className="space-y-3">
                                {history.slice(0, 10).map(h => (
                                    <div key={h.id} className="flex items-start gap-2 group">
                                        <div className="w-2 h-2 bg-[#19069E] rounded-full mt-2" />
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-600">
                                                {h.from_stage?.name || "Entrada"} → {h.to_stage?.name}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {new Date(h.moved_at).toLocaleDateString("pt-BR")} às {new Date(h.moved_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteHistory(h.id)}
                                            className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 transition-all"
                                            title="Excluir movimentação"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">delete</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
