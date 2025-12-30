"use client";

import { useState } from "react";
import Link from "next/link";
import { useEvents } from "@/hooks/useEvents";
import { usePageMetrics } from "@/hooks/usePageMetrics";
import { needsAttention } from "@/types/event";

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

    // Get days in month and first day of week
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfWeek = (year: number, month: number) => new Date(year, month, 1).getDay();

    const daysInMonth = getDaysInMonth(selectedDate.year, selectedDate.month);
    const firstDayOfWeek = getFirstDayOfWeek(selectedDate.year, selectedDate.month);

    // Create calendar grid - enough rows for all days
    const calendarDays: (number | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) calendarDays.push(null);
    for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);
    // Pad to complete the last week
    while (calendarDays.length % 7 !== 0) calendarDays.push(null);

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
            <div className="h-full flex items-center justify-center">
                <div className="flex items-center gap-3 text-[#19069E]">
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    <span className="font-medium">Carregando eventos...</span>
                </div>
            </div>
        );
    }

    const numRows = Math.ceil(calendarDays.length / 7);

    return (
        <div className="h-full flex flex-col">
            {/* Header - Fixed height */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-[#19069E]">Eventos - Mensal</h1>
                        <p className="text-sm text-gray-500">Calendário de eventos do mês</p>
                    </div>
                </div>
                <Link
                    href="/eventos/novo"
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#C2DF0C] hover:bg-[#B0CC0B] text-[#19069E] font-bold rounded-xl shadow-lg transition-all"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Novo Evento
                </Link>
            </div>

            {/* View Switcher - Fixed height */}
            <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-sm border border-gray-100 w-fit mb-4">
                <Link href="/eventos" className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors">
                    Visão Geral
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

            {/* Calendar - Takes remaining height */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex-1 flex flex-col min-h-0 overflow-hidden">
                {/* Month Navigator */}
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
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

                {/* Calendar Grid - Fills remaining space */}
                <div className="flex-1 flex flex-col min-h-0 p-2">
                    {/* Week Headers */}
                    <div className="grid grid-cols-7 flex-shrink-0">
                        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                            <div key={day} className="text-center text-xs font-medium text-gray-400 py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days Grid - Uses CSS Grid with equal rows */}
                    <div
                        className="flex-1 grid grid-cols-7 gap-1"
                        style={{ gridTemplateRows: `repeat(${numRows}, 1fr)` }}
                    >
                        {calendarDays.map((day, index) => {
                            if (day === null) {
                                return <div key={index} className="bg-gray-50/50 rounded-lg" />;
                            }

                            const dayEvents = getEventsForDay(day);
                            const today = new Date();
                            const isToday = day === today.getDate() &&
                                selectedDate.month === today.getMonth() &&
                                selectedDate.year === today.getFullYear();

                            return (
                                <div
                                    key={index}
                                    className={`rounded-lg p-1.5 flex flex-col overflow-hidden ${isToday ? 'bg-[#19069E]/10 ring-2 ring-[#19069E]' : 'hover:bg-gray-50 border border-gray-100'
                                        }`}
                                >
                                    <div className={`text-sm font-semibold ${isToday ? 'text-[#19069E]' : 'text-gray-700'}`}>
                                        {day}
                                    </div>
                                    {dayEvents.length > 0 && (
                                        <div className="flex-1 mt-1 space-y-0.5 overflow-hidden">
                                            {dayEvents.slice(0, 3).map((event) => (
                                                <Link
                                                    key={event.id}
                                                    href={`/eventos/${event.id}`}
                                                    className={`block text-[10px] rounded px-1.5 py-0.5 truncate font-medium ${needsAttention(event)
                                                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                                            : 'bg-[#C2DF0C]/60 text-[#19069E] hover:bg-[#C2DF0C]'
                                                        }`}
                                                    title={event.name}
                                                >
                                                    {event.name}
                                                </Link>
                                            ))}
                                            {dayEvents.length > 3 && (
                                                <span className="text-[10px] text-gray-400 pl-1">
                                                    +{dayEvents.length - 3}
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
        </div>
    );
}
