import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CatalogData, Campaign, MatchTeam, Weapon } from '@/types'
import { FACTIONS, HACKING_PROGRAMS, ITEMS, LINEAGES, PROFILES, WEAPONS } from '@/lib/seed'
import { migrateWeaponToVariants, migrateItemToVariants, migrateStashEntry, migrateEquipmentId } from '@/lib/variants'

// Bump this version whenever seed data changes to force a re-seed
const SEED_VERSION = 26;

const STORAGE_KEY = 'combat-zone-storage';

interface DisplaySettings {
    cardColumns: number;
    fontScale: number;
}

interface PlayViewSettings {
    characterView: 'horizontal' | 'vertical';
    programView: 'card' | 'list';
    hideKIA: boolean;
    enableGlitch: boolean;
    enableCodeRain: boolean;
}

export interface TeamBuilderDraft {
    selectedIds: string[];
    equipmentMap: Record<string, string[]>;
    targetEB: number;
}

interface StoreState {
    catalog: CatalogData;
    campaigns: Campaign[];
    activeMatchTeam: MatchTeam | null;
    displaySettings: DisplaySettings;
    playViewSettings: PlayViewSettings;
    teamBuilderDrafts: Record<string, TeamBuilderDraft>;

    // Actions
    setCatalog: (data: StoreState['catalog']) => void;
    addCampaign: (campaign: Campaign) => void;
    updateCampaign: (id: string, updates: Partial<Campaign>) => void;
    deleteCampaign: (id: string) => void;
    setActiveMatchTeam: (team: MatchTeam | null) => void;
    setDisplaySettings: (updates: Partial<DisplaySettings>) => void;
    setPlayViewSettings: (updates: Partial<PlayViewSettings>) => void;
    setTeamBuilderDraft: (campaignId: string, draft: Partial<TeamBuilderDraft>) => void;
    clearTeamBuilderDraft: (campaignId: string) => void;
    reset: () => void;
}

const emptyCatalog: CatalogData = { factions: [], lineages: [], profiles: [], items: [], programs: [], weapons: [] };

// ─── PRE-HYDRATION SEED ───────────────────────────────────────────────
// Runs synchronously BEFORE the store is created.
// Patches localStorage directly so Zustand hydrates already-seeded data.
// No race condition possible.
if (typeof window !== 'undefined') {
    const storedVersion = Number(localStorage.getItem('seed-version') ?? '0');

    if (storedVersion < SEED_VERSION) {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : null;
            const oldCatalog = parsed?.state?.catalog;
            const oldWeapons: Record<string, unknown>[] = oldCatalog?.weapons ?? [];

            // Merge weapons: seed updates descriptions/stats,
            // but user-uploaded imageUrl ALWAYS wins over seed
            const userWeaponsMap = new Map(oldWeapons.map((w) => [w.id as string, w]));
            const mergedWeapons: Weapon[] = WEAPONS.map(seedW => {
                const userW = userWeaponsMap.get(seedW.id);
                if (userW?.imageUrl) {
                    return { ...seedW, imageUrl: userW.imageUrl as string };
                }
                return seedW;
            });
            // Preserve user-created weapons (IDs not in seed) — migrate them to variants format
            const seedIds = new Set(WEAPONS.map(w => w.id));
            for (const w of oldWeapons) {
                if (!seedIds.has(w.id as string)) {
                    mergedWeapons.push(migrateWeaponToVariants(w));
                }
            }

            // Migrate items to variants format
            const oldItems = oldCatalog?.items ?? [];
            const migratedItems = ITEMS.length > 0 ? ITEMS : oldItems.map((i: Record<string, unknown>) => migrateItemToVariants(i));

            // Migrate campaigns: stash entries + equipmentMap
            const oldCampaigns: Campaign[] = parsed?.state?.campaigns ?? [];
            const migratedCampaigns = oldCampaigns.map((c: Campaign) => ({
                ...c,
                hqStash: c.hqStash.map(migrateStashEntry),
            }));

            // Migrate activeMatchTeam equipmentMap
            const oldMatch = parsed?.state?.activeMatchTeam;
            let migratedMatch = oldMatch;
            if (oldMatch?.equipmentMap) {
                const newEqMap: Record<string, string[]> = {};
                for (const [recruitId, ids] of Object.entries(oldMatch.equipmentMap)) {
                    newEqMap[recruitId] = (ids as string[]).map(migrateEquipmentId);
                }
                migratedMatch = { ...oldMatch, equipmentMap: newEqMap };
            }

            // Migrate teamBuilderDrafts equipmentMap
            const oldDrafts = parsed?.state?.teamBuilderDrafts ?? {};
            const migratedDrafts: Record<string, unknown> = {};
            for (const [key, draft] of Object.entries(oldDrafts)) {
                const d = draft as { selectedIds: string[]; equipmentMap: Record<string, string[]>; targetEB: number };
                const newEqMap: Record<string, string[]> = {};
                if (d.equipmentMap) {
                    for (const [recruitId, ids] of Object.entries(d.equipmentMap)) {
                        newEqMap[recruitId] = ids.map(migrateEquipmentId);
                    }
                }
                migratedDrafts[key] = { ...d, equipmentMap: newEqMap };
            }

            const newCatalog: CatalogData = {
                factions: FACTIONS,
                lineages: LINEAGES,
                profiles: PROFILES,
                items: migratedItems,
                programs: HACKING_PROGRAMS,
                weapons: mergedWeapons,
            };

            const newPersisted = {
                state: {
                    ...(parsed?.state ?? {}),
                    catalog: newCatalog,
                    campaigns: migratedCampaigns,
                    activeMatchTeam: migratedMatch,
                    teamBuilderDrafts: migratedDrafts,
                },
                version: parsed?.version ?? 0,
            };

            localStorage.setItem(STORAGE_KEY, JSON.stringify(newPersisted));
            localStorage.setItem('seed-version', String(SEED_VERSION));
            console.log(`Seed v${SEED_VERSION}: pre-hydration catalog update (${mergedWeapons.length} weapons, variant migration)`);
        } catch (e) {
            console.error('Seed pre-hydration error:', e);
        }
    }
}

// ─── STORE ────────────────────────────────────────────────────────────
export const useStore = create<StoreState>()(
    persist(
        (set) => ({
            catalog: emptyCatalog,
            campaigns: [],
            activeMatchTeam: null,
            displaySettings: { cardColumns: 4, fontScale: 100 },
            playViewSettings: { characterView: 'horizontal', programView: 'card', hideKIA: false, enableGlitch: true, enableCodeRain: true },
            teamBuilderDrafts: {},

            setCatalog: (data) => set({ catalog: data }),
            addCampaign: (campaign) => set((state) => ({ campaigns: [...state.campaigns, campaign] })),
            updateCampaign: (id, updates) => set((state) => ({
                campaigns: state.campaigns.map((c) => (c.id === id ? { ...c, ...updates } : c)),
            })),
            deleteCampaign: (id) => set((state) => ({
                campaigns: state.campaigns.filter((c) => c.id !== id),
            })),
            setActiveMatchTeam: (team) => set({ activeMatchTeam: team }),
            setDisplaySettings: (updates) => set((state) => ({
                displaySettings: { ...state.displaySettings, ...updates },
            })),
            setPlayViewSettings: (updates) => set((state) => ({
                playViewSettings: { ...state.playViewSettings, ...updates },
            })),
            setTeamBuilderDraft: (campaignId, draft) => set((state) => ({
                teamBuilderDrafts: {
                    ...state.teamBuilderDrafts,
                    [campaignId]: {
                        ...(state.teamBuilderDrafts[campaignId] ?? { selectedIds: [], equipmentMap: {}, targetEB: 150 }),
                        ...draft,
                    },
                },
            })),
            clearTeamBuilderDraft: (campaignId) => set((state) => {
                const next = { ...state.teamBuilderDrafts };
                delete next[campaignId];
                return { teamBuilderDrafts: next };
            }),
            reset: () => set({ campaigns: [], activeMatchTeam: null, teamBuilderDrafts: {} }),
        }),
        {
            name: STORAGE_KEY,
            merge: (persisted, current) => {
                const persistedState = persisted as Partial<StoreState> | undefined;
                if (!persistedState) return current;
                const defaultCatalog = current.catalog;
                // Ensure activeMatchTeam defaults for old data
                const activeMatch = persistedState.activeMatchTeam
                    ? {
                        ...persistedState.activeMatchTeam,
                        equipmentMap: persistedState.activeMatchTeam.equipmentMap ?? {},
                        tokenStates: persistedState.activeMatchTeam.tokenStates ?? undefined,
                        deadModelIds: persistedState.activeMatchTeam.deadModelIds ?? undefined,
                        luck: persistedState.activeMatchTeam.luck ?? undefined,
                    }
                    : null;
                return {
                    ...current,
                    ...persistedState,
                    activeMatchTeam: activeMatch,
                    displaySettings: {
                        ...current.displaySettings,
                        ...(persistedState.displaySettings ?? {}),
                    },
                    playViewSettings: {
                        ...current.playViewSettings,
                        ...(persistedState.playViewSettings ?? {}),
                    },
                    catalog: {
                        ...defaultCatalog,
                        ...(persistedState.catalog ?? {}),
                        weapons: persistedState.catalog?.weapons ?? defaultCatalog.weapons,
                    },
                };
            },
        }
    )
)
