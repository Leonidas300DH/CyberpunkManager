import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Faction, ModelLineage, ModelProfile, ItemCard, Campaign, MatchTeam } from '@/types'

interface StoreState {
    catalog: {
        factions: Faction[];
        lineages: ModelLineage[];
        profiles: ModelProfile[];
        items: ItemCard[];
    };
    campaigns: Campaign[];
    activeMatchTeam: MatchTeam | null;

    // Actions
    setCatalog: (data: StoreState['catalog']) => void;
    addCampaign: (campaign: Campaign) => void;
    updateCampaign: (id: string, updates: Partial<Campaign>) => void;
    deleteCampaign: (id: string) => void;
    setActiveMatchTeam: (team: MatchTeam | null) => void;
    reset: () => void;
}

export const useStore = create<StoreState>()(
    persist(
        (set) => ({
            catalog: { factions: [], lineages: [], profiles: [], items: [] },
            campaigns: [],
            activeMatchTeam: null,

            setCatalog: (data) => set({ catalog: data }),
            addCampaign: (campaign) => set((state) => ({ campaigns: [...state.campaigns, campaign] })),
            updateCampaign: (id, updates) => set((state) => ({
                campaigns: state.campaigns.map((c) => (c.id === id ? { ...c, ...updates } : c)),
            })),
            deleteCampaign: (id) => set((state) => ({
                campaigns: state.campaigns.filter((c) => c.id !== id),
            })),
            setActiveMatchTeam: (team) => set({ activeMatchTeam: team }),
            reset: () => set({ campaigns: [], activeMatchTeam: null }),
        }),
        {
            name: 'combat-zone-storage',
        }
    )
)
