"use client";

import { useState } from "react";
import Link from "next/link";
import { usePipelines } from "@/hooks/usePipelines";

export default function PipelinesPage() {
    const { pipelines, isLoading, error, createPipeline, deletePipeline } = usePipelines();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPipelineName, setNewPipelineName] = useState("");
    const [newPipelineDescription, setNewPipelineDescription] = useState("");
    const [defaultStages, setDefaultStages] = useState([
        { name: "Novo Lead", color: "#19069E" },
        { name: "Qualificado", color: "#3B28B8" },
        { name: "Em Negociação", color: "#7C3AED" },
        { name: "Fechado", color: "#10B981" },
    ]);
    const [isCreating, setIsCreating] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const handleCreate = async () => {
        if (!newPipelineName.trim()) return;

        setIsCreating(true);
        const result = await createPipeline({
            name: newPipelineName,
            description: newPipelineDescription || undefined,
            stages: defaultStages
        });

        if (result) {
            setShowCreateModal(false);
            setNewPipelineName("");
            setNewPipelineDescription("");
        }
        setIsCreating(false);
    };

    const handleDelete = async (id: string) => {
        await deletePipeline(id);
        setDeleteConfirm(null);
    };

    const addDefaultStage = () => {
        setDefaultStages([...defaultStages, { name: "", color: "#19069E" }]);
    };

    const removeDefaultStage = (index: number) => {
        setDefaultStages(defaultStages.filter((_, i) => i !== index));
    };

    const updateDefaultStage = (index: number, field: "name" | "color", value: string) => {
        const updated = [...defaultStages];
        updated[index][field] = value;
        setDefaultStages(updated);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#19069E]">🎯 Pipelines</h1>
                    <p className="text-sm text-gray-500">Gerencie seus pipelines de vendas</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#C2DF0C] text-[#19069E] font-bold rounded-xl hover:bg-[#B0CC0B] transition-colors shadow-sm"
                >
                    <span className="material-symbols-outlined">add</span>
                    Novo Pipeline
                </button>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <span className="material-symbols-outlined text-4xl text-gray-300 animate-pulse">hourglass_empty</span>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700">
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-red-500">error</span>
                        <div>
                            <p className="font-bold">Erro ao carregar pipelines</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && pipelines.length === 0 && (
                <div className="text-center py-16 px-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-4xl text-gray-400">view_kanban</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-700 mb-2">Nenhum pipeline criado</h3>
                    <p className="text-gray-500 mb-6">Crie seu primeiro pipeline para começar a gerenciar leads</p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-[#19069E] text-white font-bold rounded-xl hover:bg-[#0F0466] transition-colors"
                    >
                        Criar Pipeline
                    </button>
                </div>
            )}

            {/* Pipelines Grid */}
            {!isLoading && !error && pipelines.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pipelines.map((pipeline) => {
                        const totalLeads = (pipeline.stages || []).reduce((sum, s) => sum + (s.lead_count || 0), 0);

                        return (
                            <div
                                key={pipeline.id}
                                className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow group"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-[#19069E]">{pipeline.name}</h3>
                                        {pipeline.description && (
                                            <p className="text-sm text-gray-500 mt-1">{pipeline.description}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => setDeleteConfirm(pipeline.id)}
                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Excluir"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Stages Preview */}
                                <div className="flex items-center gap-1 mb-4">
                                    {(pipeline.stages || []).slice(0, 5).map((stage, i) => (
                                        <div
                                            key={stage.id}
                                            className="flex-1 h-2 rounded-full"
                                            style={{ backgroundColor: stage.color }}
                                            title={stage.name}
                                        />
                                    ))}
                                    {(pipeline.stages || []).length > 5 && (
                                        <span className="text-xs text-gray-400">+{(pipeline.stages || []).length - 5}</span>
                                    )}
                                </div>

                                {/* Stats */}
                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                    <div className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[16px]">view_column</span>
                                        {(pipeline.stages || []).length} etapas
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[16px]">people</span>
                                        {totalLeads} leads
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Link
                                        href={`/crm/pipelines/${pipeline.id}`}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#19069E] text-white font-medium rounded-xl hover:bg-[#0F0466] transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">view_kanban</span>
                                        Kanban
                                    </Link>
                                </div>

                                {/* Delete Confirmation */}
                                {deleteConfirm === pipeline.id && (
                                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                                        <p className="text-sm text-red-700 mb-3">Excluir este pipeline e todos os leads?</p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleDelete(pipeline.id)}
                                                className="flex-1 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600"
                                            >
                                                Excluir
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(null)}
                                                className="flex-1 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-[#19069E]">Novo Pipeline</h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nome do Pipeline *
                                </label>
                                <input
                                    type="text"
                                    value={newPipelineName}
                                    onChange={(e) => setNewPipelineName(e.target.value)}
                                    placeholder="Ex: Funil de Vendas"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#19069E]/20 focus:border-[#19069E]"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Descrição (opcional)
                                </label>
                                <textarea
                                    value={newPipelineDescription}
                                    onChange={(e) => setNewPipelineDescription(e.target.value)}
                                    placeholder="Descreva o objetivo deste pipeline..."
                                    rows={2}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#19069E]/20 focus:border-[#19069E] resize-none"
                                />
                            </div>

                            {/* Stages */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Etapas
                                </label>
                                <div className="space-y-2">
                                    {defaultStages.map((stage, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={stage.color}
                                                onChange={(e) => updateDefaultStage(index, "color", e.target.value)}
                                                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={stage.name}
                                                onChange={(e) => updateDefaultStage(index, "name", e.target.value)}
                                                placeholder={`Etapa ${index + 1}`}
                                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#19069E]/20 focus:border-[#19069E]"
                                            />
                                            {defaultStages.length > 1 && (
                                                <button
                                                    onClick={() => removeDefaultStage(index)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">remove</span>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={addDefaultStage}
                                    className="mt-2 flex items-center gap-1 text-sm text-[#19069E] hover:underline"
                                >
                                    <span className="material-symbols-outlined text-[16px]">add</span>
                                    Adicionar etapa
                                </button>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex gap-3 p-6 border-t border-gray-200">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={!newPipelineName.trim() || isCreating}
                                className="flex-1 py-2.5 bg-[#C2DF0C] text-[#19069E] font-bold rounded-xl hover:bg-[#B0CC0B] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCreating ? "Criando..." : "Criar Pipeline"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
