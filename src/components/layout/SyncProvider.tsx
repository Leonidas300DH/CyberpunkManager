'use client';

import { useSupabaseSync } from '@/hooks/useSupabaseSync';
import { useReferenceData } from '@/hooks/useReferenceData';

/** Invisible component that activates Supabase sync and loads shared reference data. */
export function SyncProvider() {
    useSupabaseSync();
    useReferenceData();
    return null;
}
