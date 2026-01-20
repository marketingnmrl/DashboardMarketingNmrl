"use client";

import { useState, useEffect } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";
import { usePipelineAnalytics } from "@/hooks/usePipelineAnalytics";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PipelineAnalyticsModalProps {
    isOpen: boolean;
    onClose: () => void;
    pipelineId: string;
    pipelineName: string;
}

const ORIGIN_COLORS: Record<string, string> = {
    paid: "#2563EB",      // Blue
    organic: "#16A34A",   // Green
    manual: "#4B5563",    // Gray
    webhook: "#9333EA",   // Purple
    instagram: "#E1306C", // Pink
    indicação: "#F59E0B", // Amber
    other: "#F97316"      // Orange
};

export function PipelineAnalyticsModal({
    isOpen,
    onClose,
    pipelineId,
    pipelineName
}: PipelineAnalyticsModalProps) {
    const { data, isLoading, fetchAnalytics } = usePipelineAnalytics(pipelineId);

    // Default to last 30 days
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (isOpen) {
            fetchAnalytics(new Date(dateRange.start), new Date(dateRange.end));
        }
    }, [isOpen, dateRange, fetchAnalytics]);

    if (!isOpen) return null;

    // Prepare data for Recharts
    const chartData = data.map(stage => {
        const item: any = { name: stage.stageName };
        Object.entries(stage.byOrigin).forEach(([origin, count]) => {
            item[origin] = count;
        });
        return item;
    });

    // Get all unique origins found in data
    const allOrigins = Array.from(new Set(data.flatMap(d => Object.keys(d.byOrigin))));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-[#19069E]">Análise do Pipeline</h2>
                        <p className="text-sm text-gray-500">{pipelineName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 space-y-6 flex-1">
                    {/* Filters */}
                    <div className="flex gap-4 items-center bg-gray-50 p-4 rounded-xl">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">De</label>
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Até</label>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            />
                        </div>
                        <div className="flex-1 text-right">
                            <button
                                onClick={() => fetchAnalytics(new Date(dateRange.start), new Date(dateRange.end))}
                                className="px-4 py-2 bg-[#19069E] text-white rounded-lg text-sm hover:bg-[#150580]"
                            >
                                Atualizar
                            </button>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="h-[400px] w-full">
                        {isLoading ? (
                            <div className="h-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-4xl text-gray-300 animate-pulse">hourglass_empty</span>
                            </div>
                        ) : chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fill: '#6B7280', fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fill: '#6B7280', fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend />
                                    {allOrigins.map(origin => (
                                        <Bar
                                            key={origin}
                                            dataKey={origin}
                                            stackId="a"
                                            fill={ORIGIN_COLORS[origin] || ORIGIN_COLORS.other}
                                            name={origin.charAt(0).toUpperCase() + origin.slice(1)}
                                            radius={[4, 4, 0, 0]}
                                        />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <span className="material-symbols-outlined text-4xl mb-2">bar_chart_off</span>
                                <p>Sem dados para o período selecionado</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
