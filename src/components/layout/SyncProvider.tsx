'use client';

import { useSupabaseSync } from '@/hooks/useSupabaseSync';
import { useCatalog } from '@/hooks/useCatalog';

/** Invisible component that activates Supabase sync and loads shared catalog. */
export function SyncProvider() {
    useSupabaseSync();
    useCatalog();
    return null;
}
