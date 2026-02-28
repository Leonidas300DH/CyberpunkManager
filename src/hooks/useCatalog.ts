'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { supabase } from '@/lib/supabase';
import type {
    CatalogData,
    Faction,
    ModelLineage,
    ModelProfile,
    Weapon,
    ItemCard,
    HackingProgram,
} from '@/types';

// ─── DB row → TypeScript mappers ────────────────────────────────────────────

function mapFaction(r: Record<string, unknown>): Faction {
    return {
        id: r.id as string,
        name: r.name as string,
        description: r.description as string | undefined,
        imageUrl: r.image_url as string | undefined,
    };
}

function mapLineage(r: Record<string, unknown>, factionIds: string[]): ModelLineage {
    return {
        id: r.id as string,
        name: r.name as string,
        type: r.type as ModelLineage['type'],
        isMerc: r.is_merc as boolean,
        imageUrl: r.image_url as string | undefined,
        isDefaultImage: r.is_default_image as boolean | undefined,
        imageFlipX: r.image_flip_x as boolean | undefined,
        source: (r.source as ModelLineage['source']) ?? 'Custom',
        factionIds,
    };
}

function mapProfile(r: Record<string, unknown>): ModelProfile {
    return {
        id: r.id as string,
        lineageId: r.lineage_id as string,
        level: r.level as number,
        costEB: r.cost_eb as number,
        actionTokens: r.action_tokens as ModelProfile['actionTokens'],
        skills: r.skills as ModelProfile['skills'],
        armor: (r.armor as number) ?? 0,
        keywords: (r.keywords as string[]) ?? [],
        actions: (r.actions as ModelProfile['actions']) ?? [],
        streetCred: (r.street_cred as number) ?? 0,
        passiveRules: (r.passive_rules as string) ?? '',
        gonkActionColor: r.gonk_action_color as ModelProfile['gonkActionColor'],
    };
}

function mapWeapon(r: Record<string, unknown>): Weapon {
    return {
        id: r.id as string,
        name: r.name as string,
        source: (r.source as Weapon['source']) ?? 'Custom',
        factionVariants: (r.faction_variants as Weapon['factionVariants']) ?? [],
        isWeapon: (r.is_weapon as boolean) ?? true,
        isGear: (r.is_gear as boolean) ?? false,
        skillReq: r.skill_req as Weapon['skillReq'],
        skillBonus: r.skill_bonus as number | undefined,
        grantsArmor: r.grants_armor as number | undefined,
        grantsNetrunner: r.grants_netrunner as boolean | undefined,
        rangeRed: (r.range_red as boolean) ?? false,
        rangeYellow: (r.range_yellow as boolean) ?? false,
        rangeGreen: (r.range_green as boolean) ?? false,
        rangeLong: (r.range_long as boolean) ?? false,
        range2Red: r.range2_red as boolean | undefined,
        range2Yellow: r.range2_yellow as boolean | undefined,
        range2Green: r.range2_green as boolean | undefined,
        range2Long: r.range2_long as boolean | undefined,
        description: (r.description as string) ?? '',
        keywords: (r.keywords as string[]) ?? [],
        imageUrl: r.image_url as string | undefined,
    };
}

function mapItem(r: Record<string, unknown>): ItemCard {
    return {
        id: r.id as string,
        name: r.name as string,
        category: (r.category as ItemCard['category']) ?? 'Gear',
        factionVariants: (r.faction_variants as ItemCard['factionVariants']) ?? [],
        keywords: (r.keywords as string[]) ?? [],
        grantedActions: (r.granted_actions as ItemCard['grantedActions']) ?? [],
        passiveRules: (r.passive_rules as string) ?? '',
        imageUrl: r.image_url as string | undefined,
    };
}

function mapProgram(r: Record<string, unknown>): HackingProgram {
    return {
        id: r.id as string,
        name: r.name as string,
        factionId: (r.faction_id as string) ?? 'all',
        costEB: (r.cost_eb as number) ?? 0,
        reqStreetCred: (r.req_street_cred as number) ?? 0,
        rarity: (r.rarity as number) ?? 99,
        imageUrl: (r.image_url as string) ?? '',
        quality: r.quality as HackingProgram['quality'],
        range: r.range as HackingProgram['range'],
        techTest: (r.tech_test as boolean) ?? false,
        flavorText: (r.flavor_text as string) ?? '',
        loadedText: (r.loaded_text as string) ?? '',
        vulnerable: (r.vulnerable as boolean) ?? false,
        runningEffect: (r.running_effect as string) ?? '',
        reloadCondition: r.reload_condition as HackingProgram['reloadCondition'],
    };
}

// ─── TypeScript → DB row mappers (for mutations) ───────────────────────────

function factionToRow(f: Faction) {
    return {
        id: f.id,
        name: f.name,
        description: f.description,
        image_url: f.imageUrl,
        updated_at: new Date().toISOString(),
    };
}

function lineageToRow(l: ModelLineage) {
    return {
        id: l.id,
        name: l.name,
        type: l.type,
        is_merc: l.isMerc,
        image_url: l.imageUrl,
        is_default_image: l.isDefaultImage,
        image_flip_x: l.imageFlipX,
        updated_at: new Date().toISOString(),
    };
}

function profileToRow(p: ModelProfile) {
    return {
        id: p.id,
        lineage_id: p.lineageId,
        level: p.level,
        cost_eb: p.costEB,
        action_tokens: p.actionTokens,
        skills: p.skills,
        armor: p.armor,
        keywords: p.keywords,
        actions: p.actions,
        street_cred: p.streetCred,
        passive_rules: p.passiveRules,
        gonk_action_color: p.gonkActionColor,
        updated_at: new Date().toISOString(),
    };
}

function weaponToRow(w: Weapon) {
    return {
        id: w.id,
        name: w.name,
        skill_req: w.skillReq,
        is_weapon: w.isWeapon,
        is_gear: w.isGear,
        keywords: w.keywords,
        description: w.description,
        image_url: w.imageUrl,
        source: w.source,
        grants_armor: w.grantsArmor,
        grants_netrunner: w.grantsNetrunner,
        skill_bonus: w.skillBonus,
        faction_variants: w.factionVariants,
        range_red: w.rangeRed,
        range_yellow: w.rangeYellow,
        range_green: w.rangeGreen,
        range_long: w.rangeLong,
        range2_red: w.range2Red,
        range2_yellow: w.range2Yellow,
        range2_green: w.range2Green,
        range2_long: w.range2Long,
        updated_at: new Date().toISOString(),
    };
}

function itemToRow(i: ItemCard) {
    return {
        id: i.id,
        name: i.name,
        image_url: i.imageUrl,
        faction_variants: i.factionVariants,
        category: i.category,
        keywords: i.keywords,
        passive_rules: i.passiveRules,
        granted_actions: i.grantedActions,
        updated_at: new Date().toISOString(),
    };
}

function programToRow(p: HackingProgram) {
    return {
        id: p.id,
        name: p.name,
        quality: p.quality,
        range: p.range,
        reload_condition: p.reloadCondition,
        image_url: p.imageUrl,
        faction_variants: [{
            factionId: p.factionId ?? 'universal',
            cost: p.costEB ?? 0,
            rarity: p.rarity ?? 99,
            reqStreetCred: p.reqStreetCred ?? 0,
        }],
        cost_eb: p.costEB,
        faction_id: p.factionId,
        rarity: p.rarity,
        req_street_cred: p.reqStreetCred,
        flavor_text: p.flavorText,
        loaded_text: p.loadedText,
        running_effect: p.runningEffect,
        tech_test: p.techTest,
        vulnerable: p.vulnerable,
        updated_at: new Date().toISOString(),
    };
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useCatalog() {
    const hasFetchedRef = useRef(false);

    // ─── FETCH from relational tables on mount ──────────────────────────
    useEffect(() => {
        if (hasFetchedRef.current) return;
        hasFetchedRef.current = true;

        (async () => {
            try {
                const [factionsRes, lineagesRes, lfRes, profilesRes, weaponsRes, itemsRes, programsRes, configRes] = await Promise.all([
                    supabase.from('factions').select('*'),
                    supabase.from('lineages').select('*'),
                    supabase.from('lineage_factions').select('*'),
                    supabase.from('profiles').select('*'),
                    supabase.from('weapons').select('*'),
                    supabase.from('items').select('*'),
                    supabase.from('programs').select('*'),
                    supabase.from('app_config').select('*').eq('key', 'tier_surcharges').maybeSingle(),
                ]);

                if (factionsRes.error || lineagesRes.error || profilesRes.error || weaponsRes.error) {
                    throw new Error(`Table fetch failed: ${factionsRes.error?.message || lineagesRes.error?.message || profilesRes.error?.message || weaponsRes.error?.message}`);
                }

                // Build factionIds lookup from junction table
                const factionIdsMap: Record<string, string[]> = {};
                for (const row of lfRes.data ?? []) {
                    const lid = row.lineage_id as string;
                    if (!factionIdsMap[lid]) factionIdsMap[lid] = [];
                    factionIdsMap[lid].push(row.faction_id as string);
                }

                const catalog: CatalogData = {
                    factions: (factionsRes.data ?? []).map(mapFaction),
                    lineages: (lineagesRes.data ?? []).map(r => mapLineage(r, factionIdsMap[r.id as string] ?? [])),
                    profiles: (profilesRes.data ?? []).map(mapProfile),
                    weapons: (weaponsRes.data ?? []).map(mapWeapon),
                    items: (itemsRes.data ?? []).map(mapItem),
                    programs: (programsRes.data ?? []).map(mapProgram),
                    tierSurcharges: (configRes.data?.value as { veteran: number; elite: number }) ?? { veteran: 5, elite: 10 },
                };

                useStore.setState({ catalog });
                console.log(`[Catalog] Loaded from tables (${catalog.profiles.length} profiles, ${catalog.weapons.length} weapons)`);
            } catch (err) {
                console.error('[Catalog] Table fetch failed, falling back to seed:', err);
                try {
                    const seed = await import('@/lib/seed');
                    const fallback: CatalogData = {
                        factions: seed.FACTIONS,
                        lineages: seed.LINEAGES,
                        profiles: seed.PROFILES,
                        items: seed.ITEMS,
                        programs: seed.HACKING_PROGRAMS,
                        weapons: seed.WEAPONS,
                        tierSurcharges: seed.TIER_SURCHARGES,
                    };
                    useStore.setState({ catalog: fallback });
                    console.log(`[Catalog] Seed fallback loaded (${fallback.profiles.length} profiles)`);
                } catch (seedErr) {
                    console.error('[Catalog] Seed fallback also failed:', seedErr);
                }
            }
        })();
    }, []);

    // ─── Targeted mutations ─────────────────────────────────────────────

    const saveFaction = useCallback(async (faction: Faction) => {
        const { error } = await supabase.from('factions').upsert(factionToRow(faction));
        if (error) console.error('[Catalog] saveFaction error:', error.message);
    }, []);

    const deleteFaction = useCallback(async (factionId: string) => {
        const { error } = await supabase.from('factions').delete().eq('id', factionId);
        if (error) console.error('[Catalog] deleteFaction error:', error.message);
    }, []);

    const saveLineage = useCallback(async (lineage: ModelLineage) => {
        const { error } = await supabase.from('lineages').upsert(lineageToRow(lineage));
        if (error) {
            console.error('[Catalog] saveLineage error:', error.message);
            return;
        }
        // Sync faction associations
        await supabase.from('lineage_factions').delete().eq('lineage_id', lineage.id);
        if (lineage.factionIds.length > 0) {
            await supabase.from('lineage_factions').insert(
                lineage.factionIds.map(fid => ({ lineage_id: lineage.id, faction_id: fid }))
            );
        }
    }, []);

    const deleteLineage = useCallback(async (lineageId: string) => {
        const { error } = await supabase.from('lineages').delete().eq('id', lineageId);
        if (error) console.error('[Catalog] deleteLineage error:', error.message);
    }, []);

    const saveProfile = useCallback(async (profile: ModelProfile) => {
        const { error } = await supabase.from('profiles').upsert(profileToRow(profile));
        if (error) console.error('[Catalog] saveProfile error:', error.message);
    }, []);

    const deleteProfile = useCallback(async (profileId: string) => {
        const { error } = await supabase.from('profiles').delete().eq('id', profileId);
        if (error) console.error('[Catalog] deleteProfile error:', error.message);
    }, []);

    const saveWeapon = useCallback(async (weapon: Weapon) => {
        const { error } = await supabase.from('weapons').upsert(weaponToRow(weapon));
        if (error) console.error('[Catalog] saveWeapon error:', error.message);
    }, []);

    const deleteWeapon = useCallback(async (weaponId: string) => {
        const { error } = await supabase.from('weapons').delete().eq('id', weaponId);
        if (error) console.error('[Catalog] deleteWeapon error:', error.message);
    }, []);

    const saveItem = useCallback(async (item: ItemCard) => {
        const { error } = await supabase.from('items').upsert(itemToRow(item));
        if (error) console.error('[Catalog] saveItem error:', error.message);
    }, []);

    const saveProgram = useCallback(async (program: HackingProgram) => {
        const { error } = await supabase.from('programs').upsert(programToRow(program));
        if (error) console.error('[Catalog] saveProgram error:', error.message);
    }, []);

    const saveTierSurcharges = useCallback(async (surcharges: { veteran: number; elite: number }) => {
        const { error } = await supabase.from('app_config').upsert({
            key: 'tier_surcharges',
            value: surcharges,
            updated_at: new Date().toISOString(),
        });
        if (error) console.error('[Catalog] saveTierSurcharges error:', error.message);
    }, []);

    return {
        saveFaction,
        deleteFaction,
        saveLineage,
        deleteLineage,
        saveProfile,
        deleteProfile,
        saveWeapon,
        deleteWeapon,
        saveItem,
        saveProgram,
        saveTierSurcharges,
    };
}
