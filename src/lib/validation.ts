import { Campaign, MatchTeam, CatalogData } from '@/types';
import { MathService } from './math';

export const ValidationService = {
    validateRoster: (team: MatchTeam, campaign: Campaign, store: CatalogData): string[] => {
        const errors: string[] = [];

        // Helper to get recruited models
        const recruits = team.selectedRecruitIds
            .map(id => campaign.hqRoster.find(r => r.id === id))
            .filter((r): r is NonNullable<typeof r> => !!r);

        // 1. Leader Rule: Exactly ONE member where type === 'Leader'
        const leaderCount = recruits.filter(r => {
            const lineage = store.lineages.find(l => l.id === r.lineageId);
            return lineage?.type === 'Leader';
        }).length;

        if (leaderCount === 0) errors.push('Missing Leader!');
        if (leaderCount > 1) errors.push('Only one Leader allowed!');

        // 2. Gonk Quota: Total quantity of 'Gonk' <= Total Influence
        const gonkQuantity = recruits.reduce((sum, r) => {
            const lineage = store.lineages.find(l => l.id === r.lineageId);
            return lineage?.type === 'Gonk' ? sum + r.quantity : sum;
        }, 0);

        const totalInfluence = MathService.calculateCampaignInfluence(campaign, store);
        if (gonkQuantity > totalInfluence) {
            errors.push(`Too many Gonks! (${gonkQuantity}/${totalInfluence})`);
        }

        // 3. Budget Limit: Total Roster Cost <= MatchTeam.targetEB
        const totalCost = MathService.calculateTeamCost(team, campaign, store);
        if (totalCost > team.targetEB) {
            errors.push(`Budget exceeded! (${totalCost}/${team.targetEB} EB)`);
        }

        // 4. Street Cred Limit: Item reqStreetCred <= Total Street Cred
        const campaignStreetCred = MathService.calculateCampaignStreetCred(campaign, store);

        // Check all equipped items in the team
        recruits.forEach(r => {
            r.equippedItemIds.forEach(itemId => {
                const item = store.items.find(i => i.id === itemId);
                if (item && item.reqStreetCred > campaignStreetCred) {
                    errors.push(`Item '${item.name}' requires Street Cred ${item.reqStreetCred} (Have: ${campaignStreetCred})`);
                }
            });
        });

        // 5. Rarity Limit: Count of identical ItemCards <= rarity
        const itemCounts = new Map<string, number>();
        recruits.forEach(r => {
            r.equippedItemIds.forEach(itemId => {
                itemCounts.set(itemId, (itemCounts.get(itemId) || 0) + 1);
            });
        });

        itemCounts.forEach((count, itemId) => {
            const item = store.items.find(i => i.id === itemId);
            if (item && count > item.rarity) {
                errors.push(`Item '${item.name}' exceeds rarity limit (${count}/${item.rarity})`);
            }
        });

        // 6. Bulky Limit: Max 1 Bulky item per model
        // 7. Cybergear Limit: Only Cyber-Character
        // 8. Netrunner Limit: Only Netrunner can equip Programs. Max Programs <= Tech
        // 9. Faction Purity

        recruits.forEach(r => {
            const lineage = store.lineages.find(l => l.id === r.lineageId);
            const profile = store.profiles.find(p => p.id === r.currentProfileId);
            if (!lineage || !profile) return;

            const items = r.equippedItemIds.map(id => store.items.find(i => i.id === id)).filter((i): i is NonNullable<typeof i> => !!i);

            // 6. Bulky
            const bulkyCount = items.filter(i => i.keywords.includes('Bulky')).length;
            if (bulkyCount > 1) {
                errors.push(`${lineage.name} has too many Bulky items (${bulkyCount})`);
            }

            // 7. Cybergear
            const isCyberChar = profile.keywords.includes('Cyber-Character');
            items.forEach(i => {
                if (i.keywords.includes('Cybergear') && !isCyberChar) {
                    errors.push(`${lineage.name} cannot equip Cybergear '${i.name}'`);
                }
            });

            // 8. Netrunner Limit — Netrunner keyword OR a grantsNetrunner weapon/gear
            const isNetrunner = profile.keywords.includes('Netrunner');
            const matchEquipIds = team.equipmentMap[r.id] ?? [];
            const hasNetDeck = matchEquipIds.some(eqId => {
                if (!eqId.startsWith('weapon-')) return false;
                const weapon = store.weapons.find(w => w.id === eqId.replace('weapon-', ''));
                return weapon?.grantsNetrunner === true;
            });
            const canRunPrograms = isNetrunner || hasNetDeck;

            // Count programs assigned via team builder equipmentMap
            const matchProgramCount = matchEquipIds.filter(eqId => eqId.startsWith('program-')).length;
            // Count programs from HQ equippedItemIds
            const hqPrograms = items.filter(i => i.category === 'Program');
            const totalProgramCount = matchProgramCount + hqPrograms.length;

            if (totalProgramCount > 0 && !canRunPrograms) {
                errors.push(`${lineage.name} cannot equip Programs (needs Netrunner keyword or a Net Deck)`);
            }
            if (totalProgramCount > 0 && canRunPrograms && totalProgramCount > profile.skills.Tech) {
                errors.push(`${lineage.name} has too many Programs (${totalProgramCount}/${profile.skills.Tech})`);
            }

            // 9. Faction Purity — Edgerunners are recruitable by any faction
            const isEdgerunner = lineage.factionIds.includes('faction-edgerunners');
            if (!lineage.isMerc && !isEdgerunner && !lineage.factionIds.includes(campaign.factionId)) {
                errors.push(`${lineage.name} belongs to wrong Faction!`);
            }
        });

        return errors;
    }
};
