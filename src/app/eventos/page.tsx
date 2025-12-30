"use client";

import Link from "next/link";
import { useEvents } from "@/hooks/useEvents";
import { usePageMetrics } from "@/hooks/usePageMetrics";
import { needsAttention, formatEventDate } from "@/types/event";

export default function EventosPage() {
    const { events, upcomingEvents, eventsNeedingAttention, next30DaysEvents, isLoading } = useEvents();

    usePageMetrics({
        pagina: "Eventos",
        descricao: "Dashboard de eventos presenciais da equipe",
        periodo: "atual",
        kpis: {
            total_eventos: events.length,
            eventos_proximos_30_dias: next30DaysEvents.length,
            eventos_atencao: eventsNeedingAttention.length,
        },
    });

    const statusLabels = {
        bought: { label: "Comprado", color: "bg-green-100 text-green-700" },
        pending: { label: "Pendente", color: "bg-yellow-100 text-yellow-700" },
        na: { label: "N/A", color: "bg-gray-100 text-gray-500" },
    };

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto flex items-center justify-center h-64">
                <div className="flex items-center gap-3 text-[#19069E]">
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    <span className="font-medium">Carregando eventos...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#19069E]">Eventos</h1>
                    <p className="text-sm text-gray-500">Gerencie os eventos presenciais da equipe</p>
                </div>
                <Link
                    href="/eventos/novo"
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#C2DF0C] hover:bg-[#B0CC0B] text-[#19069E] font-bold rounded-xl shadow-lg transition-all"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Novo Evento
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Events */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#19069E]/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[#19069E] text-[24px]">event</span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total de Eventos</p>
                            <p className="text-2xl font-extrabold text-[#19069E]">{events.length}</p>
                        </div>
                    </div>
                </div>

                {/* Needs Attention */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${eventsNeedingAttention.length > 0 ? 'bg-amber-100' : 'bg-green-100'}`}>
                            <span className={`material-symbols-outlined text-[24px] ${eventsNeedingAttention.length > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                                {eventsNeedingAttention.length > 0 ? 'warning' : 'check_circle'}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Precisam de Atenção</p>
                            <p className={`text-2xl font-extrabold ${eventsNeedingAttention.length > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                                {eventsNeedingAttention.length}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Next 30 Days */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                            <span className="material-symbols-outlined text-blue-600 text-[24px]">calendar_month</span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Próximos 30 Dias</p>
                            <p className="text-2xl font-extrabold text-blue-600">{next30DaysEvents.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* View Switcher */}
            <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-sm border border-gray-100 w-fit">
                <Link href="/eventos" className="px-4 py-2 rounded-lg bg-[#19069E] text-white font-medium text-sm">
                    Dashboard
                </Link>
                <Link href="/eventos/trimestral" className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors">
                    Trimestral
                </Link>
                <Link href="/eventos/mensal" className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors">
                    Mensal
                </Link>
                <Link href="/eventos/anual" className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors">
                    Anual
                </Link>
            </div>

            {/* Upcoming Events List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-[#19069E]">Próximos Eventos</h2>
                </div>

                {upcomingEvents.length === 0 ? (
                    <div className="p-12 text-center">
                        <span className="material-symbols-outlined text-gray-300 text-[48px] mb-4">event_busy</span>
                        <p className="text-gray-500">Nenhum evento programado</p>
                        <Link
                            href="/eventos/novo"
                            className="inline-flex items-center gap-2 mt-4 text-[#19069E] font-medium hover:underline"
                        >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            Criar primeiro evento
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {upcomingEvents.slice(0, 10).map((event) => {
                            const attention = needsAttention(event);
                            return (
                                <Link
                                    key={event.id}
                                    href={`/eventos/${event.id}`}
                                    className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                                >
                                    {/* Date Badge */}
                                    <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center ${attention ? 'bg-amber-100' : 'bg-[#19069E]/10'}`}>
                                        <span className={`text-xs font-medium ${attention ? 'text-amber-600' : 'text-[#19069E]'}`}>
                                            {new Date(event.startDate + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}
                                        </span>
                                        <span className={`text-xl font-bold ${attention ? 'text-amber-700' : 'text-[#19069E]'}`}>
                                            {new Date(event.startDate + 'T00:00:00').getDate()}
                                        </span>
                                    </div>

                                    {/* Event Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-gray-900 truncate">{event.name}</p>
                                            {attention && (
                                                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                                                    Atenção
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[16px]">location_on</span>
                                                {event.location}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                                                {formatEventDate(event.startDate)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Status Badges */}
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${statusLabels[event.flightStatus].color}`}>
                                            ✈️ {statusLabels[event.flightStatus].label}
                                        </span>
                                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${statusLabels[event.lodgingStatus].color}`}>
                                            🏨 {statusLabels[event.lodgingStatus].label}
                                        </span>
                                    </div>

                                    <span className="material-symbols-outlined text-gray-300">chevron_right</span>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
