import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CatalogData, Campaign, MatchTeam, Weapon } from '@/types'
import { FACTIONS, HACKING_PROGRAMS, ITEMS, LINEAGES, PROFILES, WEAPONS } from '@/lib/seed'

// Bump this version whenever seed data changes to force a re-seed
const SEED_VERSION = 20;

const STORAGE_KEY = 'combat-zone-storage';

interface DisplaySettings {
    cardColumns: number;
    fontScale: number;
}

interface StoreState {
    catalog: CatalogData;
    campaigns: Campaign[];
    activeMatchTeam: MatchTeam | null;
    displaySettings: DisplaySettings;

    // Actions
    setCatalog: (data: StoreState['catalog']) => void;
    addCampaign: (campaign: Campaign) => void;
    updateCampaign: (id: string, updates: Partial<Campaign>) => void;
    deleteCampaign: (id: string) => void;
    setActiveMatchTeam: (team: MatchTeam | null) => void;
    setDisplaySettings: (updates: Partial<DisplaySettings>) => void;
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
            const oldWeapons: Weapon[] = oldCatalog?.weapons ?? [];

            // Merge weapons: seed updates descriptions/stats,
            // but user-uploaded imageUrl ALWAYS wins over seed
            const userWeaponsMap = new Map(oldWeapons.map((w: Weapon) => [w.id, w]));
            const mergedWeapons: Weapon[] = WEAPONS.map(seedW => {
                const userW = userWeaponsMap.get(seedW.id);
                if (userW?.imageUrl) {
                    return { ...seedW, imageUrl: userW.imageUrl };
                }
                return seedW;
            });
            // Preserve user-created weapons (IDs not in seed)
            const seedIds = new Set(WEAPONS.map(w => w.id));
            for (const w of oldWeapons) {
                if (!seedIds.has(w.id)) mergedWeapons.push(w);
            }

            const newCatalog: CatalogData = {
                factions: FACTIONS,
                lineages: LINEAGES,
                profiles: PROFILES,
                items: ITEMS,
                programs: HACKING_PROGRAMS,
                weapons: mergedWeapons,
            };

            const newPersisted = {
                state: {
                    ...(parsed?.state ?? {}),
                    catalog: newCatalog,
                },
                version: parsed?.version ?? 0,
            };

            localStorage.setItem(STORAGE_KEY, JSON.stringify(newPersisted));
            localStorage.setItem('seed-version', String(SEED_VERSION));
            console.log(`Seed v${SEED_VERSION}: pre-hydration catalog update (${mergedWeapons.length} weapons)`);
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
            reset: () => set({ campaigns: [], activeMatchTeam: null }),
        }),
        {
            name: STORAGE_KEY,
            merge: (persisted, current) => {
                const persistedState = persisted as Partial<StoreState> | undefined;
                if (!persistedState) return current;
                const defaultCatalog = current.catalog;
                return {
                    ...current,
                    ...persistedState,
                    displaySettings: {
                        ...current.displaySettings,
                        ...(persistedState.displaySettings ?? {}),
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
