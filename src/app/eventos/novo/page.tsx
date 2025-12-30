"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEvents } from "@/hooks/useEvents";
import { EventFormData } from "@/types/event";
import { usePageMetrics } from "@/hooks/usePageMetrics";

export default function NovoEventoPage() {
    const router = useRouter();
    const { createEvent } = useEvents();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<EventFormData>({
        name: "",
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        location: "",
        participants: "",
        flightStatus: "na",
        lodgingStatus: "na",
        preMarketing: false,
        notes: "",
    });

    usePageMetrics({
        pagina: "Novo Evento",
        descricao: "Formulário de criação de evento",
        periodo: "atual",
        kpis: {},
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!formData.name.trim()) {
            setError("Nome do evento é obrigatório");
            return;
        }
        if (!formData.startDate) {
            setError("Data de início é obrigatória");
            return;
        }
        if (!formData.location.trim()) {
            setError("Local é obrigatório");
            return;
        }
        if (formData.endDate && formData.endDate < formData.startDate) {
            setError("Data de término deve ser maior ou igual à data de início");
            return;
        }

        setIsSubmitting(true);
        try {
            const event = await createEvent(formData);
            router.push(`/eventos/${event.id}`);
        } catch (err) {
            console.error("Error creating event:", err);
            setError("Erro ao criar evento. Tente novamente.");
            setIsSubmitting(false);
        }
    };

    const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#19069E] focus:border-transparent text-sm";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/eventos"
                    className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <div>
                    <h1 className="text-2xl font-extrabold text-[#19069E]">Novo Evento</h1>
                    <p className="text-sm text-gray-500">Preencha as informações do evento</p>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                    <h3 className="font-bold text-[#19069E] flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">info</span>
                        Informações Básicas
                    </h3>

                    <div>
                        <label className={labelClass}>Nome do Evento *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={inputClass}
                            placeholder="Ex: Feira de Marketing Digital 2025"
                            required
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Local *</label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className={inputClass}
                            placeholder="Ex: São Paulo - SP"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Data de Início *</label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className={inputClass}
                                required
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Data de Término</label>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                className={inputClass}
                                min={formData.startDate}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Hora de Início</label>
                            <input
                                type="time"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Hora de Término</label>
                            <input
                                type="time"
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                className={inputClass}
                            />
                        </div>
                    </div>
                </div>

                {/* Participants */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h3 className="font-bold text-[#19069E] flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">group</span>
                        Participantes
                    </h3>
                    <div>
                        <label className={labelClass}>Participantes</label>
                        <input
                            type="text"
                            value={formData.participants}
                            onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
                            className={inputClass}
                            placeholder="Ex: João, Maria, Pedro"
                        />
                        <p className="text-xs text-gray-400 mt-1">Separe os nomes por vírgula</p>
                    </div>
                </div>

                {/* Logistics */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h3 className="font-bold text-[#19069E] flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">flight</span>
                        Logística
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Passagem</label>
                            <select
                                value={formData.flightStatus}
                                onChange={(e) => setFormData({ ...formData, flightStatus: e.target.value as 'bought' | 'pending' | 'na' })}
                                className={inputClass}
                            >
                                <option value="na">Não se aplica</option>
                                <option value="pending">Pendente</option>
                                <option value="bought">Comprada</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Hospedagem</label>
                            <select
                                value={formData.lodgingStatus}
                                onChange={(e) => setFormData({ ...formData, lodgingStatus: e.target.value as 'bought' | 'pending' | 'na' })}
                                className={inputClass}
                            >
                                <option value="na">Não se aplica</option>
                                <option value="pending">Pendente</option>
                                <option value="bought">Comprada</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="preMarketing"
                            checked={formData.preMarketing}
                            onChange={(e) => setFormData({ ...formData, preMarketing: e.target.checked })}
                            className="w-5 h-5 rounded border-gray-300 text-[#19069E] focus:ring-[#19069E]"
                        />
                        <label htmlFor="preMarketing" className="text-sm font-medium text-gray-700">
                            Marketing prévio realizado
                        </label>
                    </div>
                </div>

                {/* Notes */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h3 className="font-bold text-[#19069E] flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">notes</span>
                        Observações
                    </h3>
                    <div>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className={`${inputClass} min-h-[100px] resize-none`}
                            placeholder="Informações adicionais sobre o evento..."
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#C2DF0C] hover:bg-[#B0CC0B] text-[#19069E] font-bold rounded-xl shadow-lg transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                                Salvando...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[20px]">save</span>
                                Criar Evento
                            </>
                        )}
                    </button>
                    <Link
                        href="/eventos"
                        className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                    >
                        Cancelar
                    </Link>
                </div>
            </form>
        </div>
    );
}
