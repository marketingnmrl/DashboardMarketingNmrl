import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
    if (!supabaseInstance && supabaseUrl && supabaseAnonKey) {
        supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    }

    if (!supabaseInstance) {
        // Return a dummy client for SSR/build time - will be replaced on client
        if (typeof window === 'undefined') {
            // During SSR, return a placeholder that won't be used
            return createClient('https://placeholder.supabase.co', 'placeholder-key');
        }
        throw new Error('Supabase client not initialized. Check environment variables.');
    }

    return supabaseInstance;
}

// For backwards compatibility
export const supabase = typeof window !== 'undefined' && supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null as unknown as SupabaseClient;

