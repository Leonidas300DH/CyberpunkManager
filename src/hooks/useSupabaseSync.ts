'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/store/useStore';
import { supabase } from '@/lib/supabase';
import type { Campaign } from '@/types';

/**
 * Bidirectional sync between Zustand (localStorage) and Supabase.
 *
 * On login  → fetch remote data, merge into local store
 * On change → debounced upsert to Supabase
 * On logout → local data stays (offline fallback)
 */
export function useSupabaseSync() {
    const { user, loading: authLoading } = useAuth();
    const campaigns = useStore((s) => s.campaigns);
    const displaySettings = useStore((s) => s.displaySettings);
    const skipNextSave = useRef(false);
    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastSavedJson = useRef<string>('');
    const hasFetchedRef = useRef(false);

    // ─── FETCH on login ─────────────────────────────────────────────────
    useEffect(() => {
        if (authLoading || !user) {
            hasFetchedRef.current = false;
            return;
        }
        if (hasFetchedRef.current) return;
        hasFetchedRef.current = true;

        (async () => {
            const { data, error } = await supabase
                .from('user_data')
                .select('campaigns, display_settings')
                .eq('user_id', user.id)
                .maybeSingle();

            if (error) {
                console.error('[Sync] fetch error:', error.message);
                return;
            }

            if (data) {
                const remoteCampaigns = (data.campaigns ?? []) as Campaign[];
                const remoteSettings = data.display_settings as { cardColumns?: number; fontScale?: number } | null;

                // Merge strategy: remote wins for existing IDs, local-only kept
                const localCampaigns = useStore.getState().campaigns;
                const remoteMap = new Map(remoteCampaigns.map((c) => [c.id, c]));
                const localOnly = localCampaigns.filter((c) => !remoteMap.has(c.id));
                const merged = [...remoteCampaigns, ...localOnly];

                // Mark so the subsequent store update doesn't trigger a save
                skipNextSave.current = true;
                lastSavedJson.current = JSON.stringify(merged);
                useStore.setState({ campaigns: merged });

                if (remoteSettings) {
                    useStore.setState({
                        displaySettings: {
                            ...useStore.getState().displaySettings,
                            ...remoteSettings,
                        },
                    });
                }

                console.log(`[Sync] loaded ${remoteCampaigns.length} remote campaigns, ${localOnly.length} local-only kept`);
            } else {
                // No remote row yet — push current local data up
                await upsert(user.id, campaigns, displaySettings);
                lastSavedJson.current = JSON.stringify(campaigns);
                console.log('[Sync] initial push to Supabase');
            }
        })();
    }, [user, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

    // ─── SAVE on change (debounced) ─────────────────────────────────────
    useEffect(() => {
        if (!user) return;

        // Skip the save triggered by remote fetch merge
        if (skipNextSave.current) {
            skipNextSave.current = false;
            return;
        }

        const json = JSON.stringify(campaigns);
        if (json === lastSavedJson.current) return;

        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(async () => {
            await upsert(user.id, campaigns, displaySettings);
            lastSavedJson.current = json;
        }, 2000); // 2s debounce

        return () => {
            if (saveTimer.current) clearTimeout(saveTimer.current);
        };
    }, [user, campaigns, displaySettings]);
}

async function upsert(
    userId: string,
    campaigns: Campaign[],
    displaySettings: { cardColumns: number; fontScale: number },
) {
    const { error } = await supabase
        .from('user_data')
        .upsert({
            user_id: userId,
            campaigns,
            display_settings: displaySettings,
        });

    if (error) {
        console.error('[Sync] save error:', error.message);
    } else {
        console.log('[Sync] saved to Supabase');
    }
}
