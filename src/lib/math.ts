import { Campaign, MatchTeam, CatalogData, Weapon, HackingProgram } from '@/types';

export function resolveEquipmentItem(
    itemId: string,
    catalog: CatalogData
): { name: string; cost: number } | null {
    if (itemId.startsWith('weapon-')) {
        const weapon = catalog.weapons.find((w: Weapon) => w.id === itemId.replace('weapon-', ''));
        return weapon ? { name: weapon.name, cost: weapon.cost } : null;
    }
    if (itemId.startsWith('program-')) {
        const program = catalog.programs.find((p: HackingProgram) => p.id === itemId.replace('program-', ''));
        return program ? { name: program.name, cost: program.costEB } : null;
    }
    return null;
}

export function calculateEquipmentCost(
    equipmentMap: Record<string, string[]>,
    catalog: CatalogData
): number {
    let total = 0;
    for (const itemIds of Object.values(equipmentMap)) {
        for (const itemId of itemIds) {
            const resolved = resolveEquipmentItem(itemId, catalog);
            if (resolved) total += resolved.cost;
        }
    }
    return total;
}

export const MathService = {
    calculateCampaignStreetCred: (campaign: Campaign, store: CatalogData): number => {
        let totalCred = 0;

        // 1. Sum Profile Levels + Character Street Cred
        campaign.hqRoster.forEach((recruit) => {
            const profile = store.profiles.find((p) => p.id === recruit.currentProfileId);
            if (profile) {
                totalCred += profile.level;
                totalCred += profile.streetCred ?? 0;
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

    calculateCampaignInfluence: (campaign: Campaign, store: CatalogData): number => {
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

    calculateTeamCost: (team: MatchTeam, campaign: Campaign, store: CatalogData): number => {
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

            // Items Cost (permanent HQ equipment)
            recruit.equippedItemIds.forEach((itemId) => {
                const item = store.items.find((i) => i.id === itemId);
                if (item) {
                    totalCost += item.costEB;
                }
            });
        });

        // Match equipment cost (weapons + programs from equipmentMap)
        if (team.equipmentMap) {
            totalCost += calculateEquipmentCost(team.equipmentMap, store);
        }

        return totalCost;
    }
};
