"use client";

import { useState } from "react";
import Link from "next/link";
import { useEvents } from "@/hooks/useEvents";
import { usePageMetrics } from "@/hooks/usePageMetrics";
import { needsAttention, formatEventDate } from "@/types/event";

export default function EventosMensalPage() {
    const { events, isLoading } = useEvents();
    const [selectedDate, setSelectedDate] = useState(() => {
        const now = new Date();
        return { year: now.getFullYear(), month: now.getMonth() };
    });

    usePageMetrics({
        pagina: "Eventos - Mensal",
        descricao: "Visão mensal dos eventos",
        periodo: "mensal",
        kpis: {
            total_eventos: events.length,
        },
    });

    const monthNames = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    // Filter events for selected month
    const monthEvents = events.filter((event) => {
        const eventDate = new Date(event.startDate);
        return eventDate.getFullYear() === selectedDate.year &&
            eventDate.getMonth() === selectedDate.month;
    });

    // Get days in month and first day of week
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfWeek = (year: number, month: number) => new Date(year, month, 1).getDay();

    const daysInMonth = getDaysInMonth(selectedDate.year, selectedDate.month);
    const firstDayOfWeek = getFirstDayOfWeek(selectedDate.year, selectedDate.month);

    // Create calendar grid
    const calendarDays: (number | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) calendarDays.push(null);
    for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

    // Get events for a specific day
    const getEventsForDay = (day: number) => {
        const dateStr = `${selectedDate.year}-${String(selectedDate.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return events.filter((event) => event.startDate === dateStr);
    };

    const goToPrevMonth = () => {
        setSelectedDate((prev) => {
            if (prev.month === 0) return { year: prev.year - 1, month: 11 };
            return { ...prev, month: prev.month - 1 };
        });
    };

    const goToNextMonth = () => {
        setSelectedDate((prev) => {
            if (prev.month === 11) return { year: prev.year + 1, month: 0 };
            return { ...prev, month: prev.month + 1 };
        });
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
                    <h1 className="text-2xl font-extrabold text-[#19069E]">Eventos - Mensal</h1>
                    <p className="text-sm text-gray-500">Calendário de eventos do mês</p>
                </div>
                <Link
                    href="/eventos/novo"
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#C2DF0C] hover:bg-[#B0CC0B] text-[#19069E] font-bold rounded-xl shadow-lg transition-all"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Novo Evento
                </Link>
            </div>

            {/* View Switcher */}
            <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-sm border border-gray-100 w-fit">
                <Link href="/eventos" className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors">
                    Dashboard
                </Link>
                <Link href="/eventos/trimestral" className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors">
                    Trimestral
                </Link>
                <Link href="/eventos/mensal" className="px-4 py-2 rounded-lg bg-[#19069E] text-white font-medium text-sm">
                    Mensal
                </Link>
                <Link href="/eventos/anual" className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors">
                    Anual
                </Link>
            </div>

            {/* Calendar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Month Navigator */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <button
                        onClick={goToPrevMonth}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <h3 className="text-lg font-bold text-[#19069E]">
                        {monthNames[selectedDate.month]} {selectedDate.year}
                    </h3>
                    <button
                        onClick={goToNextMonth}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>

                {/* Calendar Grid */}
                <div className="p-4">
                    {/* Week Headers */}
                    <div className="grid grid-cols-7 mb-2">
                        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                            <div key={day} className="text-center text-xs font-medium text-gray-400 py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, index) => {
                            if (day === null) {
                                return <div key={index} className="aspect-square" />;
                            }

                            const dayEvents = getEventsForDay(day);
                            const today = new Date();
                            const isToday = day === today.getDate() &&
                                selectedDate.month === today.getMonth() &&
                                selectedDate.year === today.getFullYear();

                            return (
                                <div
                                    key={index}
                                    className={`aspect-square rounded-lg p-1 text-sm ${isToday ? 'bg-[#19069E]/10 ring-2 ring-[#19069E]' : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div className={`font-medium text-center ${isToday ? 'text-[#19069E]' : 'text-gray-700'}`}>
                                        {day}
                                    </div>
                                    {dayEvents.length > 0 && (
                                        <div className="mt-1 space-y-0.5">
                                            {dayEvents.slice(0, 2).map((event) => (
                                                <Link
                                                    key={event.id}
                                                    href={`/eventos/${event.id}`}
                                                    className={`block text-[10px] rounded px-1 py-0.5 truncate ${needsAttention(event)
                                                            ? 'bg-amber-100 text-amber-700'
                                                            : 'bg-[#C2DF0C]/50 text-[#19069E]'
                                                        }`}
                                                >
                                                    {event.name}
                                                </Link>
                                            ))}
                                            {dayEvents.length > 2 && (
                                                <span className="text-[10px] text-gray-400">
                                                    +{dayEvents.length - 2} mais
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Events List for Selected Month */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <h3 className="font-bold text-[#19069E]">
                        Eventos em {monthNames[selectedDate.month]} ({monthEvents.length})
                    </h3>
                </div>
                {monthEvents.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                        Nenhum evento neste mês
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {monthEvents.map((event) => {
                            const attention = needsAttention(event);
                            return (
                                <Link
                                    key={event.id}
                                    href={`/eventos/${event.id}`}
                                    className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center ${attention ? 'bg-amber-100' : 'bg-[#19069E]/10'}`}>
                                        <span className={`text-lg font-bold ${attention ? 'text-amber-700' : 'text-[#19069E]'}`}>
                                            {new Date(event.startDate + 'T00:00:00').getDate()}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{event.name}</p>
                                        <p className="text-sm text-gray-500">{event.location}</p>
                                    </div>
                                    {attention && (
                                        <span className="px-2 py-1 rounded-lg bg-amber-100 text-amber-700 text-xs font-medium">
                                            Atenção
                                        </span>
                                    )}
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
