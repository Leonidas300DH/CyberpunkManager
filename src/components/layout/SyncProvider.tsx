'use client';

import { useSupabaseSync } from '@/hooks/useSupabaseSync';

/** Invisible component that activates Supabase sync when inside AuthProvider. */
export function SyncProvider() {
    useSupabaseSync();
    return null;
}
