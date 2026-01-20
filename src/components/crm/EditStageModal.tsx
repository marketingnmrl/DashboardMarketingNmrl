"use client";

import { useState, useEffect } from "react";
import { usePipelines } from "@/hooks/usePipelines";
import type { CRMPipelineStage } from "@/types/crm";

interface EditStageModalProps {
    stage: CRMPipelineStage;
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}

export function EditStageModal({
    stage,
    isOpen,
    onClose,
    onSave
}: EditStageModalProps) {
    const { updateStage } = usePipelines();

    const [name, setName] = useState(stage.name);
    const [color, setColor] = useState(stage.color);
    const [defaultValue, setDefaultValue] = useState(stage.default_value?.toString() || "");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setName(stage.name);
        setColor(stage.color);
        setDefaultValue(stage.default_value?.toString() || "");
    }, [stage]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const success = await updateStage(
                stage.id,
                name,
                color,
                defaultValue ? parseFloat(defaultValue) : null
            );

            if (success) {
                onSave();
                onClose();
            } else {
                alert("Erro ao atualizar etapa. Verifique o console ou a conexão.");
            }
        } catch (err: any) {
            console.error("Error updating stage:", err);
            alert(`Erro ao atualizar etapa: ${err.message || JSON.stringify(err)}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-[#19069E]">Editar Etapa</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
                        <span className="material-symbols-outlined text-gray-500">close</span>
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Nome da Etapa *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#19069E]/20 focus:border-[#19069E]"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Cor</label>
                        <div className="flex gap-2 flex-wrap">
                            {["#19069E", "#C2DF0C", "#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899"].map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${color === c ? "ring-2 ring-offset-2 ring-gray-400" : ""}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Valor Padrão (R$)</label>
                        <p className="text-[10px] text-gray-400 mb-2">
                            Leads que entrarem nesta etapa herdarão este valor se não tiverem um definido.
                        </p>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={defaultValue}
                            onChange={(e) => setDefaultValue(e.target.value)}
                            placeholder="0,00"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#19069E]/20 focus:border-[#19069E]"
                        />
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !name.trim()}
                        className="px-4 py-2 bg-[#19069E] text-white font-bold rounded-lg hover:bg-[#150580] disabled:opacity-50"
                    >
                        {isSaving ? "Salvando..." : "Salvar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
