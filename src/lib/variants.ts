import { FactionVariant, Weapon, ItemCard } from '@/types';

/**
 * Resolve the best variant for a given faction.
 * Priority: exact faction match > 'universal' > first variant.
 */
export function resolveVariant(variants: FactionVariant[], factionId?: string): FactionVariant {
    if (factionId) {
        const exact = variants.find(v => v.factionId === factionId);
        if (exact) return exact;
    }
    const universal = variants.find(v => v.factionId === 'universal');
    if (universal) return universal;
    return variants[0];
}

/**
 * Get all variants applicable to a faction (faction-specific + universal).
 */
export function getAvailableVariants(variants: FactionVariant[], factionId?: string): FactionVariant[] {
    return variants.filter(v => v.factionId === 'universal' || v.factionId === factionId);
}

/**
 * Parse a stash entry like "weapon-katana@universal" into { itemId, variantFactionId }.
 * Legacy entries without @ default to 'universal'.
 */
export function parseStashEntry(entry: string): { itemId: string; variantFactionId: string } {
    const atIdx = entry.indexOf('@');
    if (atIdx === -1) return { itemId: entry, variantFactionId: 'universal' };
    return { itemId: entry.substring(0, atIdx), variantFactionId: entry.substring(atIdx + 1) };
}

/**
 * Build a stash entry string: "weapon-katana@faction-arasaka"
 */
export function buildStashEntry(itemId: string, variantFactionId: string): string {
    return `${itemId}@${variantFactionId}`;
}

/**
 * Parse an equipment ID like "weapon-weapon-katana@universal#0"
 * into { prefix, baseId, variantFactionId, copyIndex }.
 * Legacy entries without @ default to 'universal'.
 */
export function parseEquipmentId(equipId: string): {
    prefix: 'weapon' | 'program';
    baseId: string;
    variantFactionId: string;
    copyIndex: number | null;
} {
    // Strip copy index (#N)
    let copyIndex: number | null = null;
    let rest = equipId;
    const hashIdx = rest.lastIndexOf('#');
    if (hashIdx !== -1) {
        copyIndex = parseInt(rest.substring(hashIdx + 1), 10);
        rest = rest.substring(0, hashIdx);
    }

    // Determine prefix
    let prefix: 'weapon' | 'program';
    let afterPrefix: string;
    if (rest.startsWith('weapon-')) {
        prefix = 'weapon';
        afterPrefix = rest.substring(7); // "weapon-katana@universal"
    } else if (rest.startsWith('program-')) {
        prefix = 'program';
        afterPrefix = rest.substring(8);
    } else {
        prefix = 'weapon';
        afterPrefix = rest;
    }

    // Parse variant
    const atIdx = afterPrefix.indexOf('@');
    if (atIdx === -1) {
        return { prefix, baseId: afterPrefix, variantFactionId: 'universal', copyIndex };
    }
    return {
        prefix,
        baseId: afterPrefix.substring(0, atIdx),
        variantFactionId: afterPrefix.substring(atIdx + 1),
        copyIndex,
    };
}

/**
 * Get the cost of a weapon for a specific variant faction.
 */
export function getWeaponCost(weapon: Weapon, variantFactionId?: string): number {
    return resolveVariant(weapon.factionVariants, variantFactionId).cost;
}

/**
 * Migrate a legacy weapon (with flat cost/rarity/reqStreetCred) to the new format.
 */
export function migrateWeaponToVariants(legacy: Record<string, unknown>): Weapon {
    // Already migrated?
    if (Array.isArray(legacy.factionVariants)) return legacy as unknown as Weapon;

    const cost = (legacy.cost as number) ?? 0;
    const rarity = (legacy.rarity as number) ?? 99;
    const reqStreetCred = (legacy.reqStreetCred as number) ?? 0;

    const { cost: _, rarity: _r, reqStreetCred: _s, ...rest } = legacy;
    return {
        ...rest,
        source: (legacy.source as Weapon['source']) ?? 'Custom',
        factionVariants: [{ factionId: 'universal', cost, rarity, reqStreetCred }],
    } as Weapon;
}

/**
 * Migrate a legacy ItemCard (with flat costEB/rarity/reqStreetCred) to the new format.
 */
export function migrateItemToVariants(legacy: Record<string, unknown>): ItemCard {
    if (Array.isArray(legacy.factionVariants)) return legacy as unknown as ItemCard;

    const costEB = (legacy.costEB as number) ?? 0;
    const rarity = (legacy.rarity as number) ?? 99;
    const reqStreetCred = (legacy.reqStreetCred as number) ?? 0;

    const { costEB: _, rarity: _r, reqStreetCred: _s, ...rest } = legacy;
    return {
        ...rest,
        factionVariants: [{ factionId: 'universal', cost: costEB, rarity, reqStreetCred }],
    } as ItemCard;
}

/**
 * Migrate a stash entry: if it doesn't contain '@', append '@universal'.
 */
export function migrateStashEntry(entry: string): string {
    if (entry.includes('@')) return entry;
    return `${entry}@universal`;
}

/**
 * Migrate an equipment ID: if it doesn't contain '@', insert '@universal' before '#'.
 */
export function migrateEquipmentId(equipId: string): string {
    if (equipId.includes('@')) return equipId;
    const hashIdx = equipId.lastIndexOf('#');
    if (hashIdx === -1) return `${equipId}@universal`;
    return `${equipId.substring(0, hashIdx)}@universal${equipId.substring(hashIdx)}`;
}
