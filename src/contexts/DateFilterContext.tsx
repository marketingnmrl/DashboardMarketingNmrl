"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type DatePreset = "today" | "yesterday" | "last7days" | "thisMonth" | "lastMonth" | "custom";

interface DateRange {
    startDate: string;
    endDate: string;
}

interface DateFilterContextType {
    preset: DatePreset;
    dateRange: DateRange;
    setPreset: (preset: DatePreset) => void;
    setCustomRange: (startDate: string, endDate: string) => void;
    availableDates: string[];
    setAvailableDates: (dates: string[]) => void;
}

const DateFilterContext = createContext<DateFilterContextType | null>(null);

// Helper to format dates as YYYY-MM-DD
function formatDate(date: Date): string {
    return date.toISOString().split("T")[0];
}

// Get date range for a preset
function getDateRangeForPreset(preset: DatePreset): DateRange {
    const today = new Date();
    const todayStr = formatDate(today);

    switch (preset) {
        case "today":
            return { startDate: todayStr, endDate: todayStr };

        case "yesterday": {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = formatDate(yesterday);
            return { startDate: yesterdayStr, endDate: yesterdayStr };
        }

        case "last7days": {
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
            return { startDate: formatDate(sevenDaysAgo), endDate: todayStr };
        }

        case "thisMonth": {
            const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            return { startDate: formatDate(firstOfMonth), endDate: todayStr };
        }

        case "lastMonth": {
            const firstOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const lastOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
            return { startDate: formatDate(firstOfLastMonth), endDate: formatDate(lastOfLastMonth) };
        }

        case "custom":
        default:
            return { startDate: todayStr, endDate: todayStr };
    }
}

export function DateFilterProvider({ children }: { children: ReactNode }) {
    const [preset, setPresetState] = useState<DatePreset>("last7days");
    const [dateRange, setDateRange] = useState<DateRange>(getDateRangeForPreset("last7days"));
    const [availableDates, setAvailableDates] = useState<string[]>([]);

    const setPreset = useCallback((newPreset: DatePreset) => {
        setPresetState(newPreset);
        if (newPreset !== "custom") {
            setDateRange(getDateRangeForPreset(newPreset));
        }
    }, []);

    const setCustomRange = useCallback((startDate: string, endDate: string) => {
        setPresetState("custom");
        setDateRange({ startDate, endDate });
    }, []);

    return (
        <DateFilterContext.Provider
            value={{
                preset,
                dateRange,
                setPreset,
                setCustomRange,
                availableDates,
                setAvailableDates,
            }}
        >
            {children}
        </DateFilterContext.Provider>
    );
}

export function useDateFilter() {
    const context = useContext(DateFilterContext);
    if (!context) {
        throw new Error("useDateFilter must be used within a DateFilterProvider");
    }
    return context;
}
