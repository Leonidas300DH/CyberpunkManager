import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const supabase = createClient(
  'https://nknlxlmmliccsfsndnba.supabase.co',
  'sb_publishable_wvYE8RPLNKruSr9eUAdj2Q_H9jWWLbu'
);

async function generate() {
  const [linRes, lfRes, profRes, weapRes, itemRes, progRes, factionsRes, configRes] = await Promise.all([
    supabase.from('lineages').select('*').order('name'),
    supabase.from('lineage_factions').select('*'),
    supabase.from('profiles').select('*').order('lineage_id').order('level'),
    supabase.from('weapons').select('*').order('name'),
    supabase.from('items').select('*').order('name'),
    supabase.from('programs').select('*').order('name'),
    supabase.from('factions').select('*').order('name'),
    supabase.from('app_config').select('*').eq('key', 'tier_surcharges').maybeSingle(),
  ]);

  for (const [name, res] of Object.entries({ linRes, lfRes, profRes, weapRes, itemRes, progRes, factionsRes })) {
    if ((res as any).error) {
      console.error(`${name} error:`, (res as any).error.message);
      process.exit(1);
    }
  }

  // Build faction map
  const factionMap: Record<string, string[]> = {};
  for (const r of lfRes.data ?? []) {
    const lid = r.lineage_id as string;
    if (!factionMap[lid]) factionMap[lid] = [];
    factionMap[lid].push(r.faction_id as string);
  }

  const factions = (factionsRes.data ?? []).map((r: any) => ({
    id: r.id,
    name: r.name,
    description: r.description || undefined,
    imageUrl: r.image_url || undefined,
  }));

  const lineages = (linRes.data ?? []).map((r: any) => {
    const obj: any = {
      id: r.id,
      name: r.name,
      factionIds: factionMap[r.id] || [],
      type: r.type,
      isMerc: r.is_merc,
    };
    if (r.image_url) obj.imageUrl = r.image_url;
    if (r.is_default_image) obj.isDefaultImage = true;
    if (r.image_flip_x) obj.imageFlipX = true;
    return obj;
  });

  const profiles = (profRes.data ?? []).map((r: any) => {
    const obj: any = {
      id: r.id,
      lineageId: r.lineage_id,
      level: r.level,
      costEB: r.cost_eb,
      actionTokens: { green: r.action_tokens?.green ?? 0, yellow: r.action_tokens?.yellow ?? 0, red: r.action_tokens?.red ?? 0 },
      skills: r.skills,
      armor: r.armor ?? 0,
      keywords: r.keywords ?? [],
      actions: r.actions ?? [],
      streetCred: r.street_cred ?? 0,
      passiveRules: r.passive_rules ?? '',
    };
    if (r.gonk_action_color) obj.gonkActionColor = r.gonk_action_color;
    return obj;
  });

  const weapons = (weapRes.data ?? []).map((r: any) => {
    const obj: any = {
      id: r.id,
      name: r.name,
      source: r.source ?? 'Custom',
      factionVariants: r.faction_variants ?? [],
      isWeapon: r.is_weapon ?? true,
      isGear: r.is_gear ?? false,
      skillReq: r.skill_req ?? undefined,
    };
    if (r.skill_bonus != null) obj.skillBonus = r.skill_bonus;
    if (r.grants_armor != null) obj.grantsArmor = r.grants_armor;
    if (r.grants_netrunner) obj.grantsNetrunner = true;
    obj.rangeRed = r.range_red ?? false;
    obj.rangeYellow = r.range_yellow ?? false;
    obj.rangeGreen = r.range_green ?? false;
    obj.rangeLong = r.range_long ?? false;
    if (r.range2_red) obj.range2Red = true;
    if (r.range2_yellow) obj.range2Yellow = true;
    if (r.range2_green) obj.range2Green = true;
    if (r.range2_long) obj.range2Long = true;
    obj.description = r.description ?? '';
    obj.keywords = r.keywords ?? [];
    if (r.image_url) obj.imageUrl = r.image_url;
    return obj;
  });

  const items = (itemRes.data ?? []).map((r: any) => ({
    id: r.id,
    name: r.name,
    category: r.category ?? 'Gear',
    factionVariants: r.faction_variants ?? [],
    keywords: r.keywords ?? [],
    grantedActions: r.granted_actions ?? [],
    passiveRules: r.passive_rules ?? '',
    imageUrl: r.image_url || undefined,
  }));

  const programs = (progRes.data ?? []).map((r: any) => ({
    id: r.id,
    name: r.name,
    factionId: r.faction_id ?? 'all',
    costEB: r.cost_eb ?? 0,
    reqStreetCred: r.req_street_cred ?? 0,
    rarity: r.rarity ?? 99,
    imageUrl: r.image_url ?? '',
    quality: r.quality,
    range: r.range,
    techTest: r.tech_test ?? false,
    flavorText: r.flavor_text ?? '',
    loadedText: r.loaded_text ?? '',
    vulnerable: r.vulnerable ?? false,
    runningEffect: r.running_effect ?? '',
    reloadCondition: r.reload_condition,
  }));

  const tierSurcharges = (configRes.data?.value as any) ?? { veteran: 5, elite: 10 };

  fs.writeFileSync('/tmp/seed_dump.json', JSON.stringify({
    factions, lineages, profiles, weapons, items, programs, tierSurcharges
  }));

  console.log(`Dumped: ${factions.length} factions, ${lineages.length} lineages, ${profiles.length} profiles, ${weapons.length} weapons, ${items.length} items, ${programs.length} programs`);
}

generate();
