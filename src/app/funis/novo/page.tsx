"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFunnels, createNewStage } from "@/hooks/useFunnels";
import { usePageMetrics } from "@/hooks/usePageMetrics";

export default function NovoFunilPage() {
    const router = useRouter();
    const { addFunnel, addStage } = useFunnels();
    const [funnelName, setFunnelName] = useState("");
    const [stages, setStages] = useState<Array<{
        name: string;
        emoji: string;
        unit: "absolute" | "percentage";
    }>>([]);
    const [newStageName, setNewStageName] = useState("");
    const [newStageUnit, setNewStageUnit] = useState<"absolute" | "percentage">("absolute");
    const [isSubmitting, setIsSubmitting] = useState(false);

    usePageMetrics({
        pagina: "Criar Novo Funil",
        descricao: "Formulário de criação de funil",
        periodo: "N/A",
        kpis: {},
    });

    const handleAddStage = () => {
        if (!newStageName.trim()) return;
        setStages([...stages, {
            name: newStageName.trim(),
            emoji: "", // Removed emoji
            unit: newStageUnit,
        }]);
        setNewStageName("");
        if (stages.length === 0) {
            setNewStageUnit("percentage"); // After first stage, default to percentage
        }
    };

    const handleRemoveStage = (index: number) => {
        setStages(stages.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!funnelName.trim() || stages.length === 0) return;

        setIsSubmitting(true);
        try {
            const newFunnel = await addFunnel(funnelName.trim());

            // Add all stages
            for (const stage of stages) {
                const stageObj = createNewStage(stage.name, "", stage.unit);
                await addStage(newFunnel.id, stageObj);
            }

            router.push(`/funis/${newFunnel.id}`);
        } catch (error) {
            console.error("Error creating funnel:", error);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-extrabold text-[#19069E]">Criar Novo Funil</h1>
                <p className="text-sm text-gray-500">
                    Configure as etapas do seu funil de vendas
                </p>
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

                {/* Stages */}
                <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-[#19069E] mb-4">Etapas do Funil</h3>

                    {/* Current Stages */}
                    {stages.length > 0 && (
                        <div className="space-y-2 mb-6">
                            {stages.map((stage, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 group"
                                >
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
                        <p className="text-xs font-medium text-gray-500 mb-3">ADICIONAR ETAPA</p>
                        <div className="flex flex-col gap-3">
                            <div className="flex gap-2">
                                {/* Stage Name */}
                                <input
                                    type="text"
                                    value={newStageName}
                                    onChange={(e) => setNewStageName(e.target.value)}
                                    placeholder="Nome da etapa"
                                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#19069E] focus:border-transparent text-sm"
                                />
                            </div>

                            <div className="flex gap-2">
                                {/* Unit Type */}
                                <div className="flex-1 flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setNewStageUnit("absolute")}
                                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${newStageUnit === "absolute"
                                            ? "bg-[#19069E] text-white"
                                            : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                                            }`}
                                    >
                                        Valor/dia
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewStageUnit("percentage")}
                                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${newStageUnit === "percentage"
                                            ? "bg-[#19069E] text-white"
                                            : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                                            }`}
                                    >
                                        Percentual %
                                    </button>
                                </div>

                                {/* Add Button */}
                                <button
                                    type="button"
                                    onClick={handleAddStage}
                                    disabled={!newStageName.trim()}
                                    className="px-4 py-2 bg-[#C2DF0C] hover:bg-[#B0CC0B] text-[#19069E] font-bold text-sm rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="material-symbols-outlined text-[18px]">add</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {stages.length === 0 && (
                        <p className="text-center text-sm text-gray-400 mt-4">
                            Adicione pelo menos uma etapa para criar o funil
                        </p>
                    )}
                </div>

                {/* Info */}
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                    <div className="flex gap-3">
                        <span className="material-symbols-outlined text-blue-500">info</span>
                        <div className="text-sm text-blue-700">
                            <p className="font-medium mb-1">Próximos passos:</p>
                            <ul className="list-disc list-inside text-blue-600 space-y-1">
                                <li>Após criar o funil, você poderá configurar a planilha de dados</li>
                                <li>Os critérios (Ótimo/OK/Ruim) podem ser editados depois</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex-1 py-3 border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || !funnelName.trim() || stages.length === 0}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#C2DF0C] hover:bg-[#B0CC0B] text-[#19069E] font-bold rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <span className="material-symbols-outlined animate-spin text-[20px]">
                                    progress_activity
                                </span>
                                Criando...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[20px]">add</span>
                                Criar Funil
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
