"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface DateRangePickerProps {
    startDate: Date;
    endDate: Date;
    onChange: (start: Date, end: Date) => void;
    className?: string;
}

// Get days in a month
function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

// Get day of week for first day of month (0 = Sunday)
function getFirstDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 1).getDay();
}

// Format date for display
function formatDate(date: Date): string {
    return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}

// Check if two dates are the same day
function isSameDay(d1: Date, d2: Date): boolean {
    return d1.getDate() === d2.getDate() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getFullYear() === d2.getFullYear();
}

// Check if date is between two dates
function isDateInRange(date: Date, start: Date, end: Date): boolean {
    const d = new Date(date).setHours(0, 0, 0, 0);
    const s = new Date(start).setHours(0, 0, 0, 0);
    const e = new Date(end).setHours(0, 0, 0, 0);
    return d >= s && d <= e;
}

// Month names
const MONTHS = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

// Preset periods
interface Preset {
    label: string;
    getValue: () => { start: Date; end: Date };
}

function getPresets(): Preset[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return [
        {
            label: "Hoje",
            getValue: () => ({ start: new Date(today), end: new Date(today) })
        },
        {
            label: "Ontem",
            getValue: () => {
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                return { start: yesterday, end: yesterday };
            }
        },
        {
            label: "Últimos 7 dias",
            getValue: () => {
                const start = new Date(today);
                start.setDate(start.getDate() - 6);
                return { start, end: new Date(today) };
            }
        },
        {
            label: "Últimos 30 dias",
            getValue: () => {
                const start = new Date(today);
                start.setDate(start.getDate() - 29);
                return { start, end: new Date(today) };
            }
        },
        {
            label: "Este mês",
            getValue: () => {
                const start = new Date(today.getFullYear(), today.getMonth(), 1);
                return { start, end: new Date(today) };
            }
        },
        {
            label: "Mês passado",
            getValue: () => {
                const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                const end = new Date(today.getFullYear(), today.getMonth(), 0);
                return { start, end };
            }
        }
    ];
}

// Calendar component
function Calendar({
    currentDate,
    onDateClick,
    startDate,
    endDate,
    onMonthChange
}: {
    currentDate: Date;
    onDateClick: (date: Date) => void;
    startDate: Date | null;
    endDate: Date | null;
    onMonthChange: (date: Date) => void;
}) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const goToPrevMonth = () => {
        const prev = new Date(year, month - 1, 1);
        onMonthChange(prev);
    };

    const goToNextMonth = () => {
        const next = new Date(year, month + 1, 1);
        onMonthChange(next);
    };

    // Build calendar grid
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    return (
        <div className="w-[280px]">
            {/* Month/Year Header */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={goToPrevMonth}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    type="button"
                >
                    <span className="material-symbols-outlined text-[18px] text-gray-600">chevron_left</span>
                </button>
                <span className="font-bold text-gray-800">
                    {MONTHS[month]} {year}
                </span>
                <button
                    onClick={goToNextMonth}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    type="button"
                >
                    <span className="material-symbols-outlined text-[18px] text-gray-600">chevron_right</span>
                </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
                {WEEKDAYS.map((day, i) => (
                    <div key={i} className="text-center text-xs font-medium text-gray-400 py-1">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
                {days.map((day, i) => {
                    if (day === null) {
                        return <div key={i} className="w-8 h-8" />;
                    }

                    const date = new Date(year, month, day);
                    date.setHours(0, 0, 0, 0);
                    const isToday = isSameDay(date, today);
                    const isStart = startDate && isSameDay(date, startDate);
                    const isEnd = endDate && isSameDay(date, endDate);
                    const isInRange = startDate && endDate && isDateInRange(date, startDate, endDate);
                    const isSelected = isStart || isEnd;

                    let dayClasses = "w-8 h-8 flex items-center justify-center text-sm rounded-lg transition-all cursor-pointer ";

                    if (isSelected) {
                        dayClasses += "bg-[#19069E] text-white font-bold ";
                    } else if (isInRange) {
                        dayClasses += "bg-[#19069E]/10 text-[#19069E] ";
                    } else if (isToday) {
                        dayClasses += "bg-[#C2DF0C] text-[#19069E] font-bold ";
                    } else {
                        dayClasses += "text-gray-700 hover:bg-gray-100 ";
                    }

                    return (
                        <button
                            key={i}
                            type="button"
                            onClick={() => onDateClick(date)}
                            className={dayClasses}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default function DateRangePicker({ startDate, endDate, onChange, className = "" }: DateRangePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectingStart, setSelectingStart] = useState(true);
    const [tempStart, setTempStart] = useState<Date | null>(startDate);
    const [tempEnd, setTempEnd] = useState<Date | null>(endDate);
    const [calendarDate, setCalendarDate] = useState(new Date(endDate));
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Reset temp values when opening
    useEffect(() => {
        if (isOpen) {
            setTempStart(startDate);
            setTempEnd(endDate);
            setSelectingStart(true);
            setCalendarDate(new Date(endDate));
        }
    }, [isOpen, startDate, endDate]);

    const handleDateClick = useCallback((date: Date) => {
        if (selectingStart) {
            setTempStart(date);
            setTempEnd(null);
            setSelectingStart(false);
        } else {
            if (tempStart && date < tempStart) {
                // If selected end is before start, swap
                setTempEnd(tempStart);
                setTempStart(date);
            } else {
                setTempEnd(date);
            }
            setSelectingStart(true);
        }
    }, [selectingStart, tempStart]);

    const handleApply = useCallback(() => {
        if (tempStart && tempEnd) {
            onChange(tempStart, tempEnd);
            setIsOpen(false);
        } else if (tempStart) {
            onChange(tempStart, tempStart);
            setIsOpen(false);
        }
    }, [tempStart, tempEnd, onChange]);

    const handlePresetClick = useCallback((preset: Preset) => {
        const { start, end } = preset.getValue();
        setTempStart(start);
        setTempEnd(end);
        onChange(start, end);
        setIsOpen(false);
    }, [onChange]);

    const presets = getPresets();

    return (
        <div className={`relative ${className}`}>
            {/* Trigger Button */}
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-[#19069E] rounded-xl text-sm font-medium text-[#19069E] hover:bg-[#19069E]/5 transition-all shadow-sm"
            >
                <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                <span className="font-bold">
                    {formatDate(startDate)} - {formatDate(endDate)}
                </span>
                <span className="material-symbols-outlined text-[18px]">
                    {isOpen ? "expand_less" : "expand_more"}
                </span>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div
                    ref={dropdownRef}
                    className="absolute right-0 top-full mt-2 bg-white rounded-2xl border border-gray-200 shadow-2xl z-50 overflow-hidden"
                    style={{ minWidth: "480px" }}
                >
                    <div className="flex">
                        {/* Presets */}
                        <div className="w-[160px] bg-gray-50 border-r border-gray-200 p-3">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">
                                Períodos
                            </p>
                            <div className="space-y-1">
                                {presets.map((preset, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => handlePresetClick(preset)}
                                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-[#19069E]/10 hover:text-[#19069E] rounded-lg transition-colors"
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Calendar */}
                        <div className="p-4">
                            {/* Selection Status */}
                            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
                                <div className={`flex-1 p-3 rounded-xl border-2 transition-all ${selectingStart ? "border-[#19069E] bg-[#19069E]/5" : "border-gray-200"}`}>
                                    <p className="text-xs font-medium text-gray-500 mb-1">Data Início</p>
                                    <p className="font-bold text-[#19069E]">
                                        {tempStart ? formatDate(tempStart) : "Selecione"}
                                    </p>
                                </div>
                                <span className="material-symbols-outlined text-gray-400">arrow_forward</span>
                                <div className={`flex-1 p-3 rounded-xl border-2 transition-all ${!selectingStart ? "border-[#19069E] bg-[#19069E]/5" : "border-gray-200"}`}>
                                    <p className="text-xs font-medium text-gray-500 mb-1">Data Fim</p>
                                    <p className="font-bold text-[#19069E]">
                                        {tempEnd ? formatDate(tempEnd) : "Selecione"}
                                    </p>
                                </div>
                            </div>

                            {/* Calendar */}
                            <Calendar
                                currentDate={calendarDate}
                                onDateClick={handleDateClick}
                                startDate={tempStart}
                                endDate={tempEnd}
                                onMonthChange={setCalendarDate}
                            />

                            {/* Actions */}
                            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-medium text-sm rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleApply}
                                    disabled={!tempStart}
                                    className="flex-1 py-2.5 bg-[#C2DF0C] text-[#19069E] font-bold text-sm rounded-xl hover:bg-[#B0CC0B] transition-colors disabled:opacity-50"
                                >
                                    Aplicar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
