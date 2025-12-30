"use client";

import Link from "next/link";
import { useEvents } from "@/hooks/useEvents";
import { usePageMetrics } from "@/hooks/usePageMetrics";
import { getQuarter, needsAttention, formatEventDate } from "@/types/event";

export default function EventosTrimestralPage() {
    const { events, isLoading } = useEvents();

    usePageMetrics({
        pagina: "Eventos - Trimestral",
        descricao: "Visão trimestral dos eventos",
        periodo: "anual",
        kpis: {
            total_eventos: events.length,
        },
    });

    const currentYear = new Date().getFullYear();

    // Group events by quarter
    const eventsByQuarter: Record<number, typeof events> = { 1: [], 2: [], 3: [], 4: [] };
    events.forEach((event) => {
        const eventYear = new Date(event.startDate).getFullYear();
        if (eventYear === currentYear) {
            const quarter = getQuarter(event.startDate);
            eventsByQuarter[quarter].push(event);
        }
    });

    const quarterLabels = {
        1: { name: "T1", months: "Jan - Mar", color: "from-blue-500 to-blue-600" },
        2: { name: "T2", months: "Abr - Jun", color: "from-green-500 to-green-600" },
        3: { name: "T3", months: "Jul - Set", color: "from-amber-500 to-amber-600" },
        4: { name: "T4", months: "Out - Dez", color: "from-purple-500 to-purple-600" },
    };

    const statusLabels = {
        bought: { color: "bg-green-100 text-green-700" },
        pending: { color: "bg-yellow-100 text-yellow-700" },
        na: { color: "bg-gray-100 text-gray-500" },
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
                    <h1 className="text-2xl font-extrabold text-[#19069E]">Eventos - Trimestral</h1>
                    <p className="text-sm text-gray-500">Visão por trimestre de {currentYear}</p>
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
                    Visão Geral
                </Link>
                <Link href="/eventos/trimestral" className="px-4 py-2 rounded-lg bg-[#19069E] text-white font-medium text-sm">
                    Trimestral
                </Link>
                <Link href="/eventos/mensal" className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors">
                    Mensal
                </Link>
                <Link href="/eventos/anual" className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors">
                    Anual
                </Link>
            </div>

            {/* Quarter Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((quarter) => {
                    const q = quarter as 1 | 2 | 3 | 4;
                    const quarterEvents = eventsByQuarter[q];
                    const info = quarterLabels[q];

                    return (
                        <div key={quarter} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            {/* Quarter Header */}
                            <div className={`p-4 bg-gradient-to-r ${info.color} text-white`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold">{info.name}</h3>
                                        <p className="text-sm opacity-80">{info.months}</p>
                                    </div>
                                    <span className="text-2xl font-bold">{quarterEvents.length}</span>
                                </div>
                            </div>

                            {/* Events List */}
                            <div className="divide-y divide-gray-100">
                                {quarterEvents.length === 0 ? (
                                    <div className="p-6 text-center text-gray-400 text-sm">
                                        Nenhum evento neste trimestre
                                    </div>
                                ) : (
                                    quarterEvents.map((event) => {
                                        const attention = needsAttention(event);
                                        return (
                                            <Link
                                                key={event.id}
                                                href={`/eventos/${event.id}`}
                                                className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
                                            >
                                                <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center text-xs ${attention ? 'bg-amber-100' : 'bg-[#19069E]/10'}`}>
                                                    <span className={`font-bold ${attention ? 'text-amber-700' : 'text-[#19069E]'}`}>
                                                        {new Date(event.startDate + 'T00:00:00').getDate()}
                                                    </span>
                                                    <span className={`text-[10px] ${attention ? 'text-amber-600' : 'text-[#19069E]/70'}`}>
                                                        {new Date(event.startDate + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 truncate text-sm">{event.name}</p>
                                                    <p className="text-xs text-gray-500 truncate">{event.location}</p>
                                                </div>
                                                {attention && (
                                                    <span className="material-symbols-outlined text-amber-500 text-[18px]">warning</span>
                                                )}
                                            </Link>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
