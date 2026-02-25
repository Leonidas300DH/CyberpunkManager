'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { supabase } from '@/lib/supabase';
import { PROFILES } from '@/lib/seed';
import type { CatalogData, Weapon } from '@/types';

/**
 * Shared reference data stored in Supabase `reference_data` table.
 *
 * Everything visible in the Database tab is reference data (shared for all users):
 *   factions, lineages, profiles (characters), items, programs, weapons (gear)
 *
 * Everything in HQ, Team Builder, Play is per-user (stored in user_data).
 *
 * - On app load: fetch shared catalog from Supabase → replace store catalog
 * - If no shared data exists: seed is used as fallback
 * - Admin edits: call saveCatalog() to push full catalog to Supabase
 * - Non-admin users: read-only (RLS enforced)
 */
export function useReferenceData() {
    const hasFetchedRef = useRef(false);

    // ─── FETCH shared catalog on mount ───────────────────────────────────
    useEffect(() => {
        if (hasFetchedRef.current) return;
        hasFetchedRef.current = true;

        (async () => {
            const { data, error } = await supabase
                .from('reference_data')
                .select('data')
                .eq('key', 'catalog')
                .maybeSingle();

            if (error) {
                console.error('[Ref] fetch error:', error.message);
                return;
            }

            if (data?.data) {
                const shared = data.data as CatalogData;

                // Merge missing weaponId from seed into Supabase profiles
                const seedMap = new Map(PROFILES.map(p => [p.id, p]));
                let patched = 0;
                for (const profile of shared.profiles ?? []) {
                    const seedProfile = seedMap.get(profile.id);
                    if (!seedProfile?.actions?.length || !profile.actions?.length) continue;
                    for (const action of profile.actions) {
                        if (action.weaponId) continue;
                        const seedAction = seedProfile.actions.find(
                            (sa: { id?: string; name?: string }) => sa.id === action.id || sa.name === action.name
                        );
                        if (seedAction?.weaponId) {
                            action.weaponId = seedAction.weaponId;
                            patched++;
                        }
                    }
                }

                useStore.setState({ catalog: shared });
                console.log(`[Ref] loaded shared catalog from Supabase (${shared.weapons?.length ?? 0} weapons, ${shared.factions?.length ?? 0} factions, ${shared.profiles?.length ?? 0} profiles)`);

                // If weaponIds were patched, save back to Supabase (one-time migration)
                if (patched > 0) {
                    console.log(`[Ref] patched ${patched} missing weaponId(s) from seed — saving back`);
                    supabase
                        .from('reference_data')
                        .upsert({ key: 'catalog', data: shared, updated_at: new Date().toISOString() })
                        .then(({ error: saveErr }) => {
                            if (saveErr) console.error('[Ref] weaponId migration save error:', saveErr.message);
                            else console.log('[Ref] weaponId migration saved to Supabase');
                        });
                }
            } else {
                console.log('[Ref] no shared catalog in Supabase — using seed');
            }
        })();
    }, []);

    // ─── SAVE full catalog (admin only) ──────────────────────────────────
    const saveCatalog = useCallback(async (catalog: CatalogData) => {
        const { error } = await supabase
            .from('reference_data')
            .upsert({
                key: 'catalog',
                data: catalog,
                updated_at: new Date().toISOString(),
            });

        if (error) {
            console.error('[Ref] save error:', error.message);
        } else {
            console.log(`[Ref] saved catalog to Supabase (${catalog.weapons?.length ?? 0} weapons)`);
        }
    }, []);

    // ─── Convenience: save just weapons (updates catalog with new weapons) ─
    const saveWeapons = useCallback(async (weapons: Weapon[]) => {
        const currentCatalog = useStore.getState().catalog;
        const updatedCatalog = { ...currentCatalog, weapons };
        await saveCatalog(updatedCatalog);
    }, [saveCatalog]);

    return { saveCatalog, saveWeapons };
}
