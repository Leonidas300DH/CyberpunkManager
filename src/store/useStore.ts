import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CatalogData, Campaign, MatchTeam } from '@/types'

const STORAGE_KEY = 'combat-zone-storage';

interface DisplaySettings {
    cardColumns: number;
    fontScale: number;
    programViewMode?: 'list' | 'card' | 'double';
    gearViewMode?: 'list' | 'card';
    gearStacked?: boolean;
}

interface PlayViewSettings {
    characterView: 'horizontal' | 'vertical';
    programView: 'card' | 'list';
    weaponView: 'card' | 'list';
    hideKIA: boolean;
    enableGlitch: boolean;
    enableCodeRain: boolean;
}

export interface TeamBuilderDraft {
    selectedIds: string[];
    equipmentMap: Record<string, string[]>;
    targetEB: number;
    objectivesEnabled?: boolean;
    carryingLeaderPenalty?: boolean;
    drawnObjectiveIds?: string[];
    selectedObjectiveIds?: string[];
}

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

interface StoreState {
    catalog: CatalogData;
    campaigns: Campaign[];
    activeMatchTeam: MatchTeam | null;
    displaySettings: DisplaySettings;
    playViewSettings: PlayViewSettings;
    teamBuilderDrafts: Record<string, TeamBuilderDraft>;
    syncStatus: SyncStatus;
    syncError: string | null;

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
    setSyncStatus: (status: SyncStatus, error?: string | null) => void;
    reset: () => void;
}

const emptyCatalog: CatalogData = { factions: [], lineages: [], profiles: [], items: [], programs: [], weapons: [], objectives: [] };

// ─── STORE ────────────────────────────────────────────────────────────
// Catalog starts empty — populated by useCatalog from Supabase relational tables.
// If Supabase is unreachable, seed.ts is loaded as fallback (see useCatalog.ts).
export const useStore = create<StoreState>()(
    persist(
        (set) => ({
            catalog: emptyCatalog,
            campaigns: [],
            activeMatchTeam: null,
            displaySettings: { cardColumns: 4, fontScale: 100 },
            playViewSettings: { characterView: 'horizontal', programView: 'card', weaponView: 'card', hideKIA: false, enableGlitch: true, enableCodeRain: true },
            teamBuilderDrafts: {},
            syncStatus: 'idle',
            syncError: null,

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
            setSyncStatus: (status, error = null) => set({ syncStatus: status, syncError: error }),
            reset: () => set({ campaigns: [], activeMatchTeam: null, teamBuilderDrafts: {} }),
        }),
        {
            name: STORAGE_KEY,
            partialize: (state) => {
                // Exclude runtime-only fields from persistence
                const { syncStatus: _ss, syncError: _se, ...rest } = state;
                return rest;
            },
            merge: (persisted, current) => {
                const p = persisted as Partial<StoreState> | undefined;
                if (!p) return current;
                // Ensure activeMatchTeam defaults for old data
                const activeMatch = p.activeMatchTeam
                    ? {
                        ...p.activeMatchTeam,
                        equipmentMap: p.activeMatchTeam.equipmentMap ?? {},
                        tokenStates: p.activeMatchTeam.tokenStates ?? undefined,
                        deadModelIds: p.activeMatchTeam.deadModelIds ?? undefined,
                        luck: p.activeMatchTeam.luck ?? undefined,
                        objectiveIds: p.activeMatchTeam.objectiveIds ?? undefined,
                        completedObjectiveIds: p.activeMatchTeam.completedObjectiveIds ?? undefined,
                        carryingLeaderPenalty: p.activeMatchTeam.carryingLeaderPenalty ?? undefined,
                    }
                    : null;
                return {
                    ...current,
                    ...p,
                    activeMatchTeam: activeMatch,
                    displaySettings: { ...current.displaySettings, ...(p.displaySettings ?? {}) },
                    playViewSettings: { ...current.playViewSettings, ...(p.playViewSettings ?? {}) },
                    // Catalog is populated by useCatalog — don't persist stale catalog from localStorage
                    catalog: current.catalog,
                };
            },
        }
    )
)
