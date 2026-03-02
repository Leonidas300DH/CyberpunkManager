import { Objective } from '@/types';

/**
 * Find the leader penalty card for a faction.
 * Leader cards have "Leader" or "Under Review" in their name and negative or special handling.
 * Convention: id contains "wounded-leader" or name contains "Wounded Leader".
 */
export function getLeaderCard(objectives: Objective[], factionId: string): Objective | undefined {
    return objectives.find(
        (o) => o.factionId === factionId && (
            o.id.includes('wounded-leader') ||
            o.name.toLowerCase().includes('wounded leader')
        )
    );
}

/**
 * Build the eligible draw pool for a faction.
 * Excludes:
 * - Leader cards (handled separately)
 * - Cards whose grantsStreetCred > campaignStreetCred (SC requirement)
 * - ongoing/cybergear cards already completed (permanently in HQ)
 * Includes:
 * - recycle/immediate cards always (they return to supply after use)
 */
export function getEligiblePool(
    objectives: Objective[],
    factionId: string,
    campaignStreetCred: number,
    completedObjectiveIds: string[]
): Objective[] {
    const completedSet = new Set(completedObjectiveIds);

    return objectives.filter((o) => {
        // Must be same faction
        if (o.factionId !== factionId) return false;
        // Exclude leader cards
        if (o.id.includes('wounded-leader') || o.name.toLowerCase().includes('wounded leader')) return false;
        // SC requirement: card's grantsStreetCred acts as the SC tier
        if (o.grantsStreetCred > campaignStreetCred) return false;
        // ongoing/cybergear completed → permanently in HQ, not in supply
        if (completedSet.has(o.id) && (o.rewardType === 'ongoing' || o.rewardType === 'cybergear')) return false;
        // recycle + immediate → always available (they return to supply)
        return true;
    });
}

/**
 * Draw `count` random objectives from the pool (Fisher-Yates shuffle).
 * If pool has fewer than count, returns everything available.
 */
export function drawObjectives(pool: Objective[], count: number): Objective[] {
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
}
