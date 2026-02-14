import { Campaign, MatchTeam, StoreState } from '@/types';
import { useStore } from '@/store/useStore';

export const MathService = {
    /**
     * Calculates Total Campaign Street Cred (Stars).
     * Sum of ModelProfile levels + Sum of Completed Objective bonuses.
     */
    calculateCampaignStreetCred: (campaign: Campaign, store: StoreState['catalog']): number => {
        let totalCred = 0;

        // 1. Sum Profile Levels
        campaign.hqRoster.forEach((recruit) => {
            const profile = store.profiles.find((p) => p.id === recruit.currentProfileId);
            if (profile) {
                totalCred += profile.level;
            }
        });

        // 2. Sum Objective Bonuses
        campaign.completedObjectives.forEach((objId) => {
            const item = store.items.find((i) => i.id === objId);
            if (item && item.grantsStreetCredBonus) {
                totalCred += item.grantsStreetCredBonus;
            }
        });

        return totalCred;
    },

    /**
     * Calculates Total Campaign Influence.
     * Sum of Influence skill of all Leaders/Characters in Roster.
     */
    calculateCampaignInfluence: (campaign: Campaign, store: StoreState['catalog']): number => {
        let totalInfluence = 0;

        campaign.hqRoster.forEach((recruit) => {
            const lineage = store.lineages.find((l) => l.id === recruit.lineageId);
            const profile = store.profiles.find((p) => p.id === recruit.currentProfileId);

            if (lineage && profile && (lineage.type === 'Leader' || lineage.type === 'Character')) {
                totalInfluence += profile.skills.Influence || 0;
            }
        });

        return totalInfluence;
    },

    /**
     * Calculates Total Cost (EB) of a Match Team.
     * Sum of Recruit Costs + Equipped Item Costs.
     */
    calculateTeamCost: (team: MatchTeam, campaign: Campaign, store: StoreState['catalog']): number => {
        let totalCost = 0;

        team.selectedRecruitIds.forEach((recruitId) => {
            const recruit = campaign.hqRoster.find((r) => r.id === recruitId);
            if (!recruit) return;

            const profile = store.profiles.find((p) => p.id === recruit.currentProfileId);
            const quantity = recruit.quantity || 1;

            // Base Cost * Quantity
            if (profile) {
                totalCost += profile.costEB * quantity;
            }

            // Items Cost
            recruit.equippedItemIds.forEach((itemId) => {
                const item = store.items.find((i) => i.id === itemId);
                if (item) {
                    totalCost += item.costEB; // Items cost same regardless of quantity? Usually per model. 
                    // Note: If quantity > 1 (e.g. 5 Gonks), do they all have the item? 
                    // Rules usually imply equipment is per model. 
                    // Spec says "Total Roster Cost... SUM(Equipped ItemCard.costEB)".
                    // If a recruit represents 5 models, and has 1 item equipped in the array, is that 1 item total or 5 items?
                    // Standard interpretation: One recruited entry = 1 distinct unit or group.
                    // Spec 3.2.2 says "Gonk Quota... quantity...".
                    // If I equip a pistol to a "Group of 5 Gonks", usually it's per model cost.
                    // Let's assume cost is multiplied by quantity if strict.
                    // Spec 3.1: "SUM(ModelProfile.costEB * quantity) + SUM(Equipped ItemCard.costEB)"
                    // This implies Item Cost is NOT multiplied by quantity in the aggregation formula provided in Spec.
                    // So I will follow Spec EXACTLY: "SUM(Equipped ItemCard.costEB)".
                }
            });
        });

        return totalCost;
    }
};
