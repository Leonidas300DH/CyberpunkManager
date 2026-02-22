'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStore, TeamBuilderDraft } from '@/store/useStore';
import { supabase } from '@/lib/supabase';
import type { Campaign, Weapon, MatchTeam } from '@/types';

interface PlayViewSettings {
    characterView: 'horizontal' | 'vertical';
    programView: 'card' | 'list';
    hideKIA: boolean;
    enableGlitch: boolean;
    enableCodeRain: boolean;
}

interface DisplaySettings {
    cardColumns: number;
    fontScale: number;
}

interface SyncData {
    campaigns: Campaign[];
    weapons: Weapon[];
    displaySettings: DisplaySettings;
    activeMatchTeam: MatchTeam | null;
    playViewSettings: PlayViewSettings;
    teamBuilderDrafts: Record<string, TeamBuilderDraft>;
}

/**
 * Bidirectional sync between Zustand (localStorage) and Supabase.
 *
 * Everything goes into a single `sync_data` JSONB column.
 * No more schema migrations needed — just add fields to SyncData.
 *
 * On login  → fetch remote data, merge into local store
 * On change → debounced upsert to Supabase
 * On logout → local data stays (offline fallback)
 */
export function useSupabaseSync() {
    const { user, loading: authLoading } = useAuth();
    const campaigns = useStore((s) => s.campaigns);
    const weapons = useStore((s) => s.catalog.weapons);
    const displaySettings = useStore((s) => s.displaySettings);
    const activeMatchTeam = useStore((s) => s.activeMatchTeam);
    const playViewSettings = useStore((s) => s.playViewSettings);
    const teamBuilderDrafts = useStore((s) => s.teamBuilderDrafts);
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
                .select('sync_data')
                .eq('user_id', user.id)
                .maybeSingle();

            if (error) {
                console.error('[Sync] fetch error:', error.message);
                return;
            }

            if (data) {
                const remote = (data.sync_data ?? {}) as Partial<SyncData>;
                const remoteCampaigns = remote.campaigns ?? [];
                const remoteWeapons = remote.weapons ?? [];
                const remoteSettings = remote.displaySettings ?? null;
                const remoteMatch = remote.activeMatchTeam ?? null;
                const remotePlayView = remote.playViewSettings ?? null;
                const remoteDrafts = remote.teamBuilderDrafts ?? {};

                // Merge campaigns: remote wins for existing IDs, local-only kept
                const localCampaigns = useStore.getState().campaigns;
                const remoteCampMap = new Map(remoteCampaigns.map((c) => [c.id, c]));
                const localOnlyCampaigns = localCampaigns.filter((c) => !remoteCampMap.has(c.id));
                const mergedCampaigns = [...remoteCampaigns, ...localOnlyCampaigns];

                // Merge weapons: remote wins for existing IDs, local-only kept
                const localWeapons = useStore.getState().catalog.weapons;
                const remoteWeaponMap = new Map(remoteWeapons.map((w) => [w.id, w]));
                const localOnlyWeapons = localWeapons.filter((w) => !remoteWeaponMap.has(w.id));
                const mergedWeapons = [...remoteWeapons, ...localOnlyWeapons];

                // activeMatchTeam: remote wins (latest play state)
                const mergedMatch = remoteMatch ?? useStore.getState().activeMatchTeam;

                // playViewSettings: remote wins, fallback to local
                const currentPlayView = useStore.getState().playViewSettings;
                const mergedPlayView = remotePlayView
                    ? { ...currentPlayView, ...remotePlayView }
                    : currentPlayView;

                // displaySettings: remote wins, fallback to local
                const currentDisplay = useStore.getState().displaySettings;
                const mergedDisplay = remoteSettings
                    ? { ...currentDisplay, ...remoteSettings }
                    : currentDisplay;

                // teamBuilderDrafts: remote wins for existing keys, local-only kept
                const localDrafts = useStore.getState().teamBuilderDrafts;
                const mergedDrafts = { ...localDrafts, ...remoteDrafts };

                // Mark so the subsequent store update doesn't trigger a save
                skipNextSave.current = true;

                useStore.setState((state) => ({
                    campaigns: mergedCampaigns,
                    catalog: { ...state.catalog, weapons: mergedWeapons },
                    activeMatchTeam: mergedMatch,
                    playViewSettings: mergedPlayView,
                    displaySettings: mergedDisplay,
                    teamBuilderDrafts: mergedDrafts,
                }));

                const merged: SyncData = {
                    campaigns: mergedCampaigns, weapons: mergedWeapons,
                    activeMatchTeam: mergedMatch, playViewSettings: mergedPlayView,
                    displaySettings: mergedDisplay, teamBuilderDrafts: mergedDrafts,
                };
                const mergedJson = JSON.stringify(merged);
                lastSavedJson.current = mergedJson;

                // If merged result differs from remote, push back so local-only data reaches Supabase
                const remoteJson = JSON.stringify({
                    campaigns: remoteCampaigns, weapons: remoteWeapons,
                    activeMatchTeam: remoteMatch,
                    playViewSettings: remotePlayView ?? currentPlayView,
                    displaySettings: remoteSettings ?? currentDisplay,
                    teamBuilderDrafts: remoteDrafts,
                } as SyncData);
                if (mergedJson !== remoteJson) {
                    await upsert(user.id, merged);
                    console.log('[Sync] pushed merged data back to Supabase');
                }

                console.log(
                    `[Sync] loaded ${remoteCampaigns.length} remote campaigns (${localOnlyCampaigns.length} local-only kept), ` +
                    `${remoteWeapons.length} remote weapons (${localOnlyWeapons.length} local-only kept)`
                );
            } else {
                // No remote row yet — push current local data up
                const syncData: SyncData = { campaigns, weapons, displaySettings, activeMatchTeam, playViewSettings, teamBuilderDrafts };
                await upsert(user.id, syncData);
                lastSavedJson.current = JSON.stringify(syncData);
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

        const syncData: SyncData = { campaigns, weapons, displaySettings, activeMatchTeam, playViewSettings, teamBuilderDrafts };
        const json = JSON.stringify(syncData);
        if (json === lastSavedJson.current) return;

        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(async () => {
            await upsert(user.id, syncData);
            lastSavedJson.current = json;
        }, 2000); // 2s debounce

        return () => {
            if (saveTimer.current) clearTimeout(saveTimer.current);
        };
    }, [user, campaigns, weapons, displaySettings, activeMatchTeam, playViewSettings, teamBuilderDrafts]);
}

async function upsert(userId: string, syncData: SyncData) {
    const { error } = await supabase
        .from('user_data')
        .upsert({
            user_id: userId,
            sync_data: syncData,
        });

    if (error) {
        console.error('[Sync] save error:', error.message);
    } else {
        console.log('[Sync] saved to Supabase');
    }
}
