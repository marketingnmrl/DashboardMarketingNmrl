"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFunnels, createNewStage } from "@/hooks/useFunnels";
import { usePipelines } from "@/hooks/usePipelines";
import { usePageMetrics } from "@/hooks/usePageMetrics";
import type { FunnelSourceType } from "@/types/funnel";

type StageInput = {
    name: string;
    emoji: string;
    unit: "absolute" | "percentage";
    dataSource?: "sheet" | "crm";
    crmStageId?: string;
    crmStageColor?: string;
};

type SourceType = FunnelSourceType | null;

export default function NovoFunilPage() {
    const router = useRouter();
    const { addFunnel, addFunnelFromPipeline, addStage, refresh } = useFunnels();
    const { pipelines, isLoading: isLoadingPipelines } = usePipelines();

    // Source selection step
    const [sourceType, setSourceType] = useState<SourceType>(null);
    const [selectedPipelineId, setSelectedPipelineId] = useState<string>("");

    const [funnelName, setFunnelName] = useState("");

    // Stages for sheet-based funnels
    const [stages, setStages] = useState<StageInput[]>([]);
    const [newStageName, setNewStageName] = useState("");
    const [newStageUnit, setNewStageUnit] = useState<"absolute" | "percentage">("absolute");

    // Stages for pipeline-based funnels (CRM stages + optional sheet stages)
    const [pipelineStages, setPipelineStages] = useState<StageInput[]>([]);
    const [additionalSheetStages, setAdditionalSheetStages] = useState<StageInput[]>([]);
    const [newSheetStageName, setNewSheetStageName] = useState("");
    const [newSheetStageUnit, setNewSheetStageUnit] = useState<"absolute" | "percentage">("absolute");

    // Evaluation stages
    const [evaluationStages, setEvaluationStages] = useState<StageInput[]>([]);
    const [newEvalStageName, setNewEvalStageName] = useState("");
    const [newEvalStageUnit, setNewEvalStageUnit] = useState<"absolute" | "percentage">("absolute");

    const [isSubmitting, setIsSubmitting] = useState(false);

    usePageMetrics({
        pagina: "Criar Novo Funil",
        descricao: "Formulário de criação de funil",
        periodo: "N/A",
        kpis: {},
    });

    // Select a pipeline and load its stages
    const handleSelectPipeline = (pipelineId: string) => {
        setSelectedPipelineId(pipelineId);
        const pipeline = pipelines.find(p => p.id === pipelineId);
        if (pipeline && pipeline.stages) {
            setFunnelName(pipeline.name);
            setPipelineStages(pipeline.stages.map(s => ({
                name: s.name,
                emoji: "",
                unit: "absolute" as const,
                dataSource: "crm" as const,
                crmStageId: s.id,
                crmStageColor: s.color,
            })));
        }
    };

    // Sheet-based stage management
    const handleAddStage = () => {
        if (!newStageName.trim()) return;
        setStages([...stages, {
            name: newStageName.trim(),
            emoji: "",
            unit: newStageUnit,
        }]);
        setNewStageName("");
        if (stages.length === 0) {
            setNewStageUnit("percentage");
        }
    };

    const handleRemoveStage = (index: number) => {
        setStages(stages.filter((_, i) => i !== index));
    };

    // Additional sheet stage for pipeline funnels
    const handleAddSheetStage = () => {
        if (!newSheetStageName.trim()) return;
        setAdditionalSheetStages([...additionalSheetStages, {
            name: newSheetStageName.trim(),
            emoji: "",
            unit: newSheetStageUnit,
            dataSource: "sheet",
        }]);
        setNewSheetStageName("");
    };

    const handleRemoveSheetStage = (index: number) => {
        setAdditionalSheetStages(additionalSheetStages.filter((_, i) => i !== index));
    };

    // Evaluation stages
    const handleAddEvalStage = () => {
        if (!newEvalStageName.trim()) return;
        setEvaluationStages([...evaluationStages, {
            name: newEvalStageName.trim(),
            emoji: "",
            unit: newEvalStageUnit,
        }]);
        setNewEvalStageName("");
    };

    const handleRemoveEvalStage = (index: number) => {
        setEvaluationStages(evaluationStages.filter((_, i) => i !== index));
    };

    // Submit form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!funnelName.trim()) return;

        setIsSubmitting(true);
        try {
            if (sourceType === "pipeline") {
                // Create from pipeline
                const crmStages = pipelineStages.map(s => ({
                    id: s.crmStageId!,
                    name: s.name,
                    color: s.crmStageColor || "#19069E",
                }));
                const newFunnel = await addFunnelFromPipeline(
                    funnelName.trim(),
                    selectedPipelineId,
                    crmStages
                );

                // Add additional sheet stages
                for (let i = 0; i < additionalSheetStages.length; i++) {
                    const stage = additionalSheetStages[i];
                    const stageObj = createNewStage(stage.name, "", stage.unit, "sheet");
                    await addStage(newFunnel.id, stageObj, pipelineStages.length + i, false);
                }

                // Add evaluation stages
                for (let i = 0; i < evaluationStages.length; i++) {
                    const stage = evaluationStages[i];
                    const stageObj = createNewStage(stage.name, "", stage.unit);
                    await addStage(newFunnel.id, stageObj, i, true);
                }

                // Reload funnels data from database before navigating
                refresh();
                router.push(`/funis/${newFunnel.id}`);
            } else {
                // Create from sheet (existing flow)
                if (stages.length === 0) return;

                const newFunnel = await addFunnel(funnelName.trim());

                for (let i = 0; i < stages.length; i++) {
                    const stage = stages[i];
                    const stageObj = createNewStage(stage.name, "", stage.unit);
                    await addStage(newFunnel.id, stageObj, i, false);
                }

                for (let i = 0; i < evaluationStages.length; i++) {
                    const stage = evaluationStages[i];
                    const stageObj = createNewStage(stage.name, "", stage.unit);
                    await addStage(newFunnel.id, stageObj, i, true);
                }

                // Reload funnels data from database before navigating
                refresh();
                router.push(`/funis/${newFunnel.id}`);
            }
        } catch (error) {
            console.error("Error creating funnel:", error);
            setIsSubmitting(false);
        }
    };

    // Step 1: Source selection
    if (sourceType === null) {
        return (
            <div className="max-w-xl mx-auto space-y-8">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#19069E]">Criar Novo Funil</h1>
                    <p className="text-sm text-gray-500">
                        Escolha como você quer criar o funil
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {/* From Sheet */}
                    <button
                        onClick={() => setSourceType("sheet")}
                        className="p-6 rounded-2xl bg-white border-2 border-gray-200 hover:border-[#19069E] text-left transition-colors"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-blue-600 text-2xl">table_chart</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 mb-1">De Planilha</h3>
                                <p className="text-sm text-gray-500">
                                    Todas as etapas buscam dados do Google Sheets
                                </p>
                            </div>
                        </div>
                    </button>

                    {/* From Pipeline */}
                    <button
                        onClick={() => setSourceType("pipeline")}
                        className="p-6 rounded-2xl bg-white border-2 border-gray-200 hover:border-[#19069E] text-left transition-colors"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-purple-600 text-2xl">account_tree</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 mb-1">De Pipeline CRM</h3>
                                <p className="text-sm text-gray-500">
                                    Importa etapas do CRM e conta leads automaticamente
                                </p>
                                <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                    <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                                    Híbrido: CRM + Planilha
                                </span>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        );
    }

    // Step 2: Pipeline selection (only for pipeline source)
    if (sourceType === "pipeline" && !selectedPipelineId) {
        return (
            <div className="max-w-xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setSourceType(null)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <span className="material-symbols-outlined text-gray-500">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-2xl font-extrabold text-[#19069E]">Selecionar Pipeline</h1>
                        <p className="text-sm text-gray-500">
                            Escolha o pipeline do CRM para importar
                        </p>
                    </div>
                </div>

                {isLoadingPipelines ? (
                    <div className="text-center py-12">
                        <span className="material-symbols-outlined text-4xl text-gray-300 animate-pulse">hourglass_empty</span>
                    </div>
                ) : pipelines.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 mb-4">Nenhum pipeline encontrado</p>
                        <a href="/crm/pipelines" className="text-[#19069E] hover:underline">
                            Criar Pipeline no CRM →
                        </a>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {pipelines.map(pipeline => (
                            <button
                                key={pipeline.id}
                                onClick={() => handleSelectPipeline(pipeline.id)}
                                className="w-full p-4 rounded-xl bg-white border-2 border-gray-200 hover:border-[#19069E] text-left transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-gray-800">{pipeline.name}</h3>
                                        <p className="text-sm text-gray-500">
                                            {pipeline.stages?.length || 0} etapas
                                        </p>
                                    </div>
                                    <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                                </div>
                                {pipeline.stages && pipeline.stages.length > 0 && (
                                    <div className="flex gap-1 mt-3">
                                        {pipeline.stages.slice(0, 5).map(stage => (
                                            <span
                                                key={stage.id}
                                                className="px-2 py-0.5 text-xs rounded-full"
                                                style={{
                                                    backgroundColor: stage.color + "20",
                                                    color: stage.color
                                                }}
                                            >
                                                {stage.name}
                                            </span>
                                        ))}
                                        {pipeline.stages.length > 5 && (
                                            <span className="text-xs text-gray-400">+{pipeline.stages.length - 5}</span>
                                        )}
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Step 3: Configure stages
    return (
        <div className="max-w-2xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => {
                        if (sourceType === "pipeline") {
                            setSelectedPipelineId("");
                            setPipelineStages([]);
                        } else {
                            setSourceType(null);
                        }
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                >
                    <span className="material-symbols-outlined text-gray-500">arrow_back</span>
                </button>
                <div>
                    <h1 className="text-2xl font-extrabold text-[#19069E]">Criar Novo Funil</h1>
                    <p className="text-sm text-gray-500">
                        {sourceType === "pipeline"
                            ? "Configurar funil híbrido (CRM + Planilha)"
                            : "Configure as etapas do seu funil"
                        }
                    </p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Funnel Name */}
                <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        Nome do Funil
                    </label>
                    <input
                        type="text"
                        value={funnelName}
                        onChange={(e) => setFunnelName(e.target.value)}
                        placeholder="Ex: Sessão Estratégica"
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#19069E] focus:border-transparent text-sm"
                        required
                    />
                </div>

                {/* Pipeline Stages (CRM) */}
                {sourceType === "pipeline" && pipelineStages.length > 0 && (
                    <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="material-symbols-outlined text-purple-600 text-[18px]">account_tree</span>
                            <h3 className="font-bold text-[#19069E]">Etapas do CRM</h3>
                        </div>
                        <p className="text-xs text-gray-500 mb-4">Contagem automática de leads por etapa</p>

                        <div className="space-y-2">
                            {pipelineStages.map((stage, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 p-3 rounded-lg border"
                                    style={{
                                        backgroundColor: stage.crmStageColor + "10",
                                        borderColor: stage.crmStageColor + "30"
                                    }}
                                >
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: stage.crmStageColor }}
                                    />
                                    <span className="flex-1 font-medium text-sm">{stage.name}</span>
                                    <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded">CRM</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Additional Sheet Stages (for pipeline funnels) */}
                {sourceType === "pipeline" && (
                    <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="material-symbols-outlined text-blue-600 text-[18px]">table_chart</span>
                            <h3 className="font-bold text-[#19069E]">Etapas de Tráfego (opcional)</h3>
                        </div>
                        <p className="text-xs text-gray-500 mb-4">Adicione etapas que buscam dados da planilha</p>

                        {additionalSheetStages.length > 0 && (
                            <div className="space-y-2 mb-4">
                                {additionalSheetStages.map((stage, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100 group"
                                    >
                                        <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-500 text-white text-xs font-bold">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900 text-sm">{stage.name}</p>
                                        </div>
                                        <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded">Planilha</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSheetStage(index)}
                                            className="p-1.5 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">close</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add Sheet Stage */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newSheetStageName}
                                onChange={(e) => setNewSheetStageName(e.target.value)}
                                placeholder="Nome da etapa"
                                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm"
                            />
                            <select
                                value={newSheetStageUnit}
                                onChange={(e) => setNewSheetStageUnit(e.target.value as "absolute" | "percentage")}
                                className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm"
                            >
                                <option value="absolute">Absoluto</option>
                                <option value="percentage">Percentual</option>
                            </select>
                            <button
                                type="button"
                                onClick={handleAddSheetStage}
                                disabled={!newSheetStageName.trim()}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-[18px]">add</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Main Stages (for sheet-based funnels) */}
                {sourceType === "sheet" && (
                    <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-[#19069E] mb-1">Etapas do Funil</h3>
                        <p className="text-xs text-gray-500 mb-4">Etapas que compõem o fluxo principal de conversão</p>

                        {stages.length > 0 && (
                            <div className="space-y-2 mb-6">
                                {stages.map((stage, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-[#19069E]/5 border border-[#19069E]/10 group"
                                    >
                                        <div className="w-6 h-6 flex items-center justify-center rounded-full bg-[#19069E] text-white text-xs font-bold">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900 text-sm">{stage.name}</p>
                                            <p className="text-xs text-gray-500">
                                                {stage.unit === "absolute" ? "Valor absoluto" : "Percentual"}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveStage(index)}
                                            className="p-1.5 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">close</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add New Stage */}
                        <div className="p-4 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50">
                            <p className="text-xs text-gray-400 mb-2">Nova etapa</p>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newStageName}
                                    onChange={(e) => setNewStageName(e.target.value)}
                                    placeholder="Nome da etapa"
                                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                />
                                <select
                                    value={newStageUnit}
                                    onChange={(e) => setNewStageUnit(e.target.value as "absolute" | "percentage")}
                                    className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm"
                                >
                                    <option value="absolute">Absoluto</option>
                                    <option value="percentage">Percentual</option>
                                </select>
                                <button
                                    type="button"
                                    onClick={handleAddStage}
                                    disabled={!newStageName.trim()}
                                    className="px-4 py-2 bg-[#19069E] text-white rounded-lg disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-[18px]">add</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Evaluation Stages */}
                <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-amber-600 text-[18px]">analytics</span>
                        <h3 className="font-bold text-[#19069E]">Etapas de Avaliação (opcional)</h3>
                    </div>
                    <p className="text-xs text-gray-500 mb-4">Métricas complementares que não fazem parte do funil principal</p>

                    {evaluationStages.length > 0 && (
                        <div className="space-y-2 mb-4">
                            {evaluationStages.map((stage, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100 group"
                                >
                                    <div className="w-6 h-6 flex items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 text-sm">{stage.name}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveEvalStage(index)}
                                        className="p-1.5 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">close</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newEvalStageName}
                            onChange={(e) => setNewEvalStageName(e.target.value)}
                            placeholder="Nome da etapa de avaliação"
                            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm"
                        />
                        <select
                            value={newEvalStageUnit}
                            onChange={(e) => setNewEvalStageUnit(e.target.value as "absolute" | "percentage")}
                            className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm"
                        >
                            <option value="absolute">Absoluto</option>
                            <option value="percentage">Percentual</option>
                        </select>
                        <button
                            type="button"
                            onClick={handleAddEvalStage}
                            disabled={!newEvalStageName.trim()}
                            className="px-4 py-2 bg-amber-500 text-white rounded-lg disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                        </button>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => router.push("/funis")}
                        className="px-6 py-3 text-gray-500 hover:bg-gray-100 rounded-xl font-medium"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={
                            isSubmitting ||
                            !funnelName.trim() ||
                            (sourceType === "sheet" && stages.length === 0) ||
                            (sourceType === "pipeline" && pipelineStages.length === 0)
                        }
                        className="px-6 py-3 bg-[#C2DF0C] text-[#19069E] font-bold rounded-xl hover:bg-[#B0CC0B] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                                Criando...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-lg">add_chart</span>
                                Criar Funil
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
