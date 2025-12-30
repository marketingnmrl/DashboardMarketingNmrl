"use client";

import { useState, useEffect, useCallback } from "react";
import { Event, EventFormData, needsAttention } from "@/types/event";
import { getSupabase } from "@/lib/supabase";

// Database to app conversion
interface DBEvent {
    id: string;
    name: string;
    start_date: string;
    end_date: string | null;
    start_time: string | null;
    end_time: string | null;
    location: string;
    participants: string;
    flight_status: 'bought' | 'pending' | 'na';
    lodging_status: 'bought' | 'pending' | 'na';
    pre_marketing: boolean;
    notes: string;
    created_at: string;
    updated_at: string;
}

function dbToEvent(db: DBEvent): Event {
    return {
        id: db.id,
        name: db.name,
        startDate: db.start_date,
        endDate: db.end_date || undefined,
        startTime: db.start_time || undefined,
        endTime: db.end_time || undefined,
        location: db.location,
        participants: db.participants || '',
        flightStatus: db.flight_status,
        lodgingStatus: db.lodging_status,
        preMarketing: db.pre_marketing,
        notes: db.notes || '',
        createdAt: db.created_at,
        updatedAt: db.updated_at,
    };
}

export function useEvents() {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load events
    const loadEvents = useCallback(async () => {
        if (typeof window === 'undefined') return;

        try {
            setIsLoading(true);
            const supabase = getSupabase();

            const { data, error: fetchError } = await supabase
                .from('events')
                .select('*')
                .order('start_date', { ascending: true });

            if (fetchError) throw fetchError;

            const loadedEvents = (data || []).map((e) => dbToEvent(e as DBEvent));
            setEvents(loadedEvents);
            setError(null);
        } catch (err) {
            console.error("Error loading events:", err);
            setError(err instanceof Error ? err.message : "Erro ao carregar eventos");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadEvents();
    }, [loadEvents]);

    // Create event
    const createEvent = useCallback(async (data: EventFormData): Promise<Event> => {
        const supabase = getSupabase();

        const { data: newEvent, error } = await supabase
            .from('events')
            .insert({
                name: data.name,
                start_date: data.startDate,
                end_date: data.endDate || null,
                start_time: data.startTime || null,
                end_time: data.endTime || null,
                location: data.location,
                participants: data.participants,
                flight_status: data.flightStatus,
                lodging_status: data.lodgingStatus,
                pre_marketing: data.preMarketing,
                notes: data.notes,
            })
            .select()
            .single();

        if (error) throw error;

        const event = dbToEvent(newEvent as DBEvent);
        setEvents((prev) => [...prev, event].sort((a, b) =>
            a.startDate.localeCompare(b.startDate)
        ));
        return event;
    }, []);

    // Update event
    const updateEvent = useCallback(async (id: string, data: Partial<EventFormData>): Promise<void> => {
        const supabase = getSupabase();

        const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (data.name !== undefined) updates.name = data.name;
        if (data.startDate !== undefined) updates.start_date = data.startDate;
        if (data.endDate !== undefined) updates.end_date = data.endDate || null;
        if (data.startTime !== undefined) updates.start_time = data.startTime || null;
        if (data.endTime !== undefined) updates.end_time = data.endTime || null;
        if (data.location !== undefined) updates.location = data.location;
        if (data.participants !== undefined) updates.participants = data.participants;
        if (data.flightStatus !== undefined) updates.flight_status = data.flightStatus;
        if (data.lodgingStatus !== undefined) updates.lodging_status = data.lodgingStatus;
        if (data.preMarketing !== undefined) updates.pre_marketing = data.preMarketing;
        if (data.notes !== undefined) updates.notes = data.notes;

        const { error } = await supabase
            .from('events')
            .update(updates)
            .eq('id', id);

        if (error) throw error;

        setEvents((prev) => prev.map((e) =>
            e.id === id ? { ...e, ...data, updatedAt: updates.updated_at as string } : e
        ).sort((a, b) => a.startDate.localeCompare(b.startDate)));
    }, []);

    // Delete event
    const deleteEvent = useCallback(async (id: string): Promise<void> => {
        const supabase = getSupabase();

        const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', id);

        if (error) throw error;

        setEvents((prev) => prev.filter((e) => e.id !== id));
    }, []);

    // Get event by ID
    const getEvent = useCallback((id: string): Event | undefined => {
        return events.find((e) => e.id === id);
    }, [events]);

    // Computed values
    const upcomingEvents = events.filter((e) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return new Date(e.startDate) >= today;
    });

    const eventsNeedingAttention = events.filter(needsAttention);

    const next30DaysEvents = events.filter((e) => {
        const today = new Date();
        const in30Days = new Date();
        in30Days.setDate(in30Days.getDate() + 30);
        const eventDate = new Date(e.startDate);
        return eventDate >= today && eventDate <= in30Days;
    });

    return {
        events,
        upcomingEvents,
        eventsNeedingAttention,
        next30DaysEvents,
        isLoading,
        error,
        createEvent,
        updateEvent,
        deleteEvent,
        getEvent,
        refresh: loadEvents,
    };
}
