"use client";

import { useState } from "react";
import Link from "next/link";
import { useEvents } from "@/hooks/useEvents";
import { usePageMetrics } from "@/hooks/usePageMetrics";
import { needsAttention } from "@/types/event";

export default function EventosAnualPage() {
    const { events, isLoading } = useEvents();
    const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());

    usePageMetrics({
        pagina: "Eventos - Anual",
        descricao: "Visão anual dos eventos",
        periodo: "anual",
        kpis: {
            total_eventos: events.length,
            ano: selectedYear,
        },
    });

    const monthNames = [
        "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
        "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    ];

    // Get events for a specific month
    const getEventsForMonth = (month: number) => {
        return events.filter((event) => {
            const eventDate = new Date(event.startDate);
            return eventDate.getFullYear() === selectedYear && eventDate.getMonth() === month;
        });
    };

    // Get days in month
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfWeek = (year: number, month: number) => new Date(year, month, 1).getDay();

    // Get events for a specific day
    const getEventsForDay = (month: number, day: number) => {
        const dateStr = `${selectedYear}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return events.filter((event) => event.startDate === dateStr);
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
                    <h1 className="text-2xl font-extrabold text-[#19069E]">Eventos - Anual</h1>
                    <p className="text-sm text-gray-500">Calendário completo do ano</p>
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
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-sm border border-gray-100 w-fit">
                    <Link href="/eventos" className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors">
                        Visão Geral
                    </Link>
                    <Link href="/eventos/trimestral" className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors">
                        Trimestral
                    </Link>
                    <Link href="/eventos/mensal" className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors">
                        Mensal
                    </Link>
                    <Link href="/eventos/anual" className="px-4 py-2 rounded-lg bg-[#19069E] text-white font-medium text-sm">
                        Anual
                    </Link>
                </div>

                {/* Year Selector */}
                <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
                    <button
                        onClick={() => setSelectedYear(selectedYear - 1)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                    </button>
                    <span className="text-lg font-bold text-[#19069E] px-4">{selectedYear}</span>
                    <button
                        onClick={() => setSelectedYear(selectedYear + 1)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                    </button>
                </div>
            </div>

            {/* Year Calendar Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {monthNames.map((monthName, monthIndex) => {
                    const monthEvents = getEventsForMonth(monthIndex);
                    const daysInMonth = getDaysInMonth(selectedYear, monthIndex);
                    const firstDayOfWeek = getFirstDayOfWeek(selectedYear, monthIndex);

                    // Create mini calendar
                    const calendarDays: (number | null)[] = [];
                    for (let i = 0; i < firstDayOfWeek; i++) calendarDays.push(null);
                    for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

                    return (
                        <div key={monthIndex} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            {/* Month Header */}
                            <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                                <h4 className="font-bold text-[#19069E]">{monthName}</h4>
                                {monthEvents.length > 0 && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#C2DF0C]/50 text-[#19069E] font-medium">
                                        {monthEvents.length}
                                    </span>
                                )}
                            </div>

                            {/* Mini Calendar */}
                            <div className="p-2">
                                {/* Week Headers */}
                                <div className="grid grid-cols-7 mb-1">
                                    {["D", "S", "T", "Q", "Q", "S", "S"].map((day, i) => (
                                        <div key={i} className="text-center text-[10px] text-gray-400 font-medium">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Days */}
                                <div className="grid grid-cols-7 gap-0.5">
                                    {calendarDays.map((day, i) => {
                                        if (day === null) {
                                            return <div key={i} className="w-6 h-6" />;
                                        }

                                        const dayEvents = getEventsForDay(monthIndex, day);
                                        const hasEvents = dayEvents.length > 0;
                                        const hasAttention = dayEvents.some(needsAttention);
                                        const today = new Date();
                                        const isToday = day === today.getDate() &&
                                            monthIndex === today.getMonth() &&
                                            selectedYear === today.getFullYear();

                                        return (
                                            <div
                                                key={i}
                                                className={`w-6 h-6 flex items-center justify-center text-[11px] rounded ${isToday
                                                    ? 'bg-[#19069E] text-white font-bold'
                                                    : hasAttention
                                                        ? 'bg-amber-100 text-amber-700 font-medium cursor-pointer hover:bg-amber-200'
                                                        : hasEvents
                                                            ? 'bg-[#C2DF0C]/50 text-[#19069E] font-medium cursor-pointer hover:bg-[#C2DF0C]/70'
                                                            : 'text-gray-600'
                                                    }`}
                                                title={hasEvents ? dayEvents.map(e => e.name).join(', ') : undefined}
                                            >
                                                {day}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Events Summary */}
                            {monthEvents.length > 0 && (
                                <div className="px-2 pb-2 space-y-1">
                                    {monthEvents.slice(0, 2).map((event) => (
                                        <Link
                                            key={event.id}
                                            href={`/eventos/${event.id}`}
                                            className={`block text-[11px] rounded px-2 py-1 truncate ${needsAttention(event)
                                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            {new Date(event.startDate + 'T00:00:00').getDate()} - {event.name}
                                        </Link>
                                    ))}
                                    {monthEvents.length > 2 && (
                                        <Link
                                            href={`/eventos/mensal?year=${selectedYear}&month=${monthIndex}`}
                                            className="block text-[11px] text-[#19069E] hover:underline px-2"
                                        >
                                            +{monthEvents.length - 2} mais
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
