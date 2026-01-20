"use client";

import { useState, useEffect } from "react";
import { useLeads } from "@/hooks/useLeads";
import { DEFAULT_LEAD_ORIGINS } from "@/types/crm";
import type { CRMLead } from "@/types/crm";

interface QuickEditLeadModalProps {
    lead: CRMLead;
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    availableOrigins: string[];
}

export function QuickEditLeadModal({
    lead,
    isOpen,
    onClose,
    onSave,
    availableOrigins
}: QuickEditLeadModalProps) {
    const { updateLead } = useLeads({});

    const [name, setName] = useState(lead.name);
    const [email, setEmail] = useState(lead.email || "");
    const [phone, setPhone] = useState(lead.phone || "");
    const [origin, setOrigin] = useState(lead.origin || "");
    const [dealValue, setDealValue] = useState(lead.deal_value?.toString() || "");
    const [isSaving, setIsSaving] = useState(false);

    // Reset form when lead changes
    useEffect(() => {
        setName(lead.name);
        setEmail(lead.email || "");
        setPhone(lead.phone || "");
        setOrigin(lead.origin || "");
        setDealValue(lead.deal_value?.toString() || "");
    }, [lead]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateLead(lead.id, {
                name,
                email: email || undefined,
                phone: phone || undefined,
                origin: origin || undefined,
                deal_value: dealValue ? parseFloat(dealValue) : null
            });
            onSave();
            onClose();
        } catch (err) {
            console.error("Error updating lead:", err);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-[#19069E]">Editar Lead</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
                        <span className="material-symbols-outlined text-gray-500">close</span>
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Nome *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#19069E]/20 focus:border-[#19069E]"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#19069E]/20 focus:border-[#19069E]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Telefone</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#19069E]/20 focus:border-[#19069E]"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Origem</label>
                            <input
                                type="text"
                                list="quick-edit-origins"
                                value={origin}
                                onChange={(e) => setOrigin(e.target.value)}
                                placeholder="Selecione ou digite..."
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#19069E]/20 focus:border-[#19069E]"
                            />
                            <datalist id="quick-edit-origins">
                                {availableOrigins.map(o => (
                                    <option key={o} value={o} />
                                ))}
                            </datalist>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Valor da Venda (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={dealValue}
                                onChange={(e) => setDealValue(e.target.value)}
                                placeholder="0,00"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#19069E]/20 focus:border-[#19069E]"
                            />
                        </div>
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
                        className="px-4 py-2 bg-[#C2DF0C] text-[#19069E] font-bold rounded-lg hover:bg-[#B0CC0B] disabled:opacity-50"
                    >
                        {isSaving ? "Salvando..." : "Salvar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
