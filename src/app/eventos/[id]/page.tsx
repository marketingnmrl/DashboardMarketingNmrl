"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEvents } from "@/hooks/useEvents";
import { EventFormData, needsAttention, formatEventDate } from "@/types/event";
import { usePageMetrics } from "@/hooks/usePageMetrics";

export default function EventoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const { events, getEvent, updateEvent, deleteEvent, isLoading } = useEvents();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const event = getEvent(resolvedParams.id);

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

    useEffect(() => {
        if (event) {
            setFormData({
                name: event.name,
                startDate: event.startDate,
                endDate: event.endDate || "",
                startTime: event.startTime || "",
                endTime: event.endTime || "",
                location: event.location,
                participants: event.participants,
                flightStatus: event.flightStatus,
                lodgingStatus: event.lodgingStatus,
                preMarketing: event.preMarketing,
                notes: event.notes,
            });
        }
    }, [event]);

    usePageMetrics({
        pagina: "Detalhe do Evento",
        descricao: event ? `Visualizando evento: ${event.name}` : "Carregando evento",
        periodo: "atual",
        kpis: event ? {
            nome: event.name,
            data_inicio: event.startDate,
            local: event.location,
            precisa_atencao: needsAttention(event) ? "sim" : "nao",
        } : {},
    });

    const handleSave = async () => {
        setError(null);
        if (!formData.name.trim() || !formData.startDate || !formData.location.trim()) {
            setError("Preencha todos os campos obrigatórios");
            return;
        }

        setIsSaving(true);
        try {
            await updateEvent(resolvedParams.id, formData);
            setIsEditing(false);
        } catch (err) {
            console.error("Error updating event:", err);
            setError("Erro ao salvar evento");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Tem certeza que deseja excluir este evento?")) return;

        setIsDeleting(true);
        try {
            await deleteEvent(resolvedParams.id);
            router.push("/eventos");
        } catch (err) {
            console.error("Error deleting event:", err);
            setError("Erro ao excluir evento");
            setIsDeleting(false);
        }
    };

    const statusLabels = {
        bought: { label: "Comprado", color: "bg-green-100 text-green-700", icon: "check_circle" },
        pending: { label: "Pendente", color: "bg-yellow-100 text-yellow-700", icon: "schedule" },
        na: { label: "Não se aplica", color: "bg-gray-100 text-gray-500", icon: "remove" },
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto flex items-center justify-center h-64">
                <div className="flex items-center gap-3 text-[#19069E]">
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    <span className="font-medium">Carregando evento...</span>
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="max-w-4xl mx-auto text-center py-12">
                <span className="material-symbols-outlined text-gray-300 text-[64px] mb-4">event_busy</span>
                <p className="text-gray-500 mb-4">Evento não encontrado</p>
                <Link href="/eventos" className="text-[#19069E] font-medium hover:underline">
                    Voltar para eventos
                </Link>
            </div>
        );
    }

    const attention = needsAttention(event);
    const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#19069E] focus:border-transparent text-sm";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                <Link
                    href="/eventos"
                    className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors self-start"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-[#19069E]">{event.name}</h1>
                        {attention && (
                            <span className="px-2 sm:px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs sm:text-sm font-medium flex items-center gap-1 whitespace-nowrap">
                                <span className="material-symbols-outlined text-[14px] sm:text-[16px]">warning</span>
                                Atenção
                            </span>
                        )}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        {formatEventDate(event.startDate)} • {event.location}
                    </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-center">
                    {!isEditing ? (
                        <>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-[#19069E] text-white rounded-xl font-medium hover:bg-[#0D0450] transition-colors text-sm"
                            >
                                <span className="material-symbols-outlined text-[16px] sm:text-[18px]">edit</span>
                                Editar
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-[#C2DF0C] text-[#19069E] rounded-xl font-bold hover:bg-[#B0CC0B] transition-colors disabled:opacity-50 text-sm"
                            >
                                {isSaving ? (
                                    <span className="material-symbols-outlined animate-spin text-[16px] sm:text-[18px]">progress_activity</span>
                                ) : (
                                    <span className="material-symbols-outlined text-[16px] sm:text-[18px]">save</span>
                                )}
                                Salvar
                            </button>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-3 sm:px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors text-sm"
                            >
                                Cancelar
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                </div>
            )}

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                        <h3 className="font-bold text-[#19069E] flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">info</span>
                            Informações do Evento
                        </h3>

                        {isEditing ? (
                            <div className="space-y-4">
                                <div>
                                    <label className={labelClass}>Nome *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Local *</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className={inputClass}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Data Início *</label>
                                        <input
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Data Término</label>
                                        <input
                                            type="date"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                            className={inputClass}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Hora Início</label>
                                        <input
                                            type="time"
                                            value={formData.startTime}
                                            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Hora Término</label>
                                        <input
                                            type="time"
                                            value={formData.endTime}
                                            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                            className={inputClass}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Participantes</label>
                                    <input
                                        type="text"
                                        value={formData.participants}
                                        onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Observações</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className={`${inputClass} min-h-[80px]`}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <span className="material-symbols-outlined text-[20px]">location_on</span>
                                    <span>{event.location}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                                    <span>
                                        {formatEventDate(event.startDate)}
                                        {event.endDate && event.endDate !== event.startDate && ` - ${formatEventDate(event.endDate)}`}
                                    </span>
                                </div>
                                {(event.startTime || event.endTime) && (
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <span className="material-symbols-outlined text-[20px]">schedule</span>
                                        <span>
                                            {event.startTime || "--:--"} - {event.endTime || "--:--"}
                                        </span>
                                    </div>
                                )}
                                {event.participants && (
                                    <div className="flex items-start gap-3 text-gray-600">
                                        <span className="material-symbols-outlined text-[20px]">group</span>
                                        <span>{event.participants}</span>
                                    </div>
                                )}
                                {event.notes && (
                                    <div className="pt-3 border-t border-gray-100">
                                        <p className="text-sm text-gray-600">{event.notes}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar - Logistics */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                        <h3 className="font-bold text-[#19069E] flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">checklist</span>
                            Logística
                        </h3>

                        {isEditing ? (
                            <div className="space-y-4">
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
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="preMarketing"
                                        checked={formData.preMarketing}
                                        onChange={(e) => setFormData({ ...formData, preMarketing: e.target.checked })}
                                        className="w-5 h-5 rounded"
                                    />
                                    <label htmlFor="preMarketing" className="text-sm">Marketing prévio</label>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">✈️ Passagem</span>
                                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${statusLabels[event.flightStatus].color}`}>
                                        {statusLabels[event.flightStatus].label}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">🏨 Hospedagem</span>
                                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${statusLabels[event.lodgingStatus].color}`}>
                                        {statusLabels[event.lodgingStatus].label}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">📢 Marketing</span>
                                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${event.preMarketing ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {event.preMarketing ? 'Realizado' : 'Pendente'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
