// Event types
export interface Event {
    id: string;
    name: string;
    startDate: string; // YYYY-MM-DD
    endDate?: string;
    startTime?: string; // HH:mm
    endTime?: string;
    location: string;
    participants: string;
    flightStatus: 'bought' | 'pending' | 'na';
    lodgingStatus: 'bought' | 'pending' | 'na';
    preMarketing: boolean;
    notes: string;
    createdAt: string;
    updatedAt: string;
}

export interface EventFormData {
    name: string;
    startDate: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    location: string;
    participants: string;
    flightStatus: 'bought' | 'pending' | 'na';
    lodgingStatus: 'bought' | 'pending' | 'na';
    preMarketing: boolean;
    notes: string;
}

// Check if event needs attention
export function needsAttention(event: Event): boolean {
    const today = new Date();
    const startDate = new Date(event.startDate);
    const daysUntil = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // Event is in the past
    if (daysUntil < 0) return false;

    // Event is within 30 days AND has pending items
    if (daysUntil <= 30) {
        if (event.flightStatus === 'pending') return true;
        if (event.lodgingStatus === 'pending') return true;
        if (!event.preMarketing) return true;
    }

    return false;
}

// Get quarter from date (T1, T2, T3, T4)
export function getQuarter(date: string): number {
    const month = new Date(date).getMonth(); // 0-11
    return Math.floor(month / 3) + 1;
}

// Format date for display
export function formatEventDate(date: string): string {
    return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

// Format time for display
export function formatEventTime(time: string): string {
    return time.slice(0, 5); // HH:mm
}
