/**
 * Convert remaining inline actions (no weaponId) to catalog entries.
 * Updates seed.ts + pushes to Supabase.
 *
 * Usage: npx tsx scripts/convert-inline-actions.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load env
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env: Record<string, string> = {};
for (const line of envContent.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) env[match[1].trim()] = match[2].trim();
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function slugify(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
}

function extractArray(content: string, varName: string): unknown[] {
    const re = new RegExp(`export const ${varName}[^=]*= \\[`);
    const match = re.exec(content);
    if (!match) throw new Error(`Could not find ${varName}`);
    const start = match.index + match[0].length - 1;
    let depth = 0, inStr = false, esc = false, end = start;
    for (let i = start; i < content.length; i++) {
        const ch = content[i];
        if (esc) { esc = false; continue; }
        if (ch === '\\' && inStr) { esc = true; continue; }
        if (ch === '"') { inStr = !inStr; continue; }
        if (inStr) continue;
        if (ch === '[') depth++;
        else if (ch === ']') { depth--; if (depth === 0) { end = i + 1; break; } }
    }
    return JSON.parse(content.slice(start, end).replace(/,\s*\]/g, ']'));
}

function findArrayEnd(content: string, varName: string): number {
    const re = new RegExp(`export const ${varName}[^=]*= \\[`);
    const match = re.exec(content);
    if (!match) throw new Error(`${varName} not found`);
    const bracketStart = match.index + match[0].length - 1;
    let depth = 0, inStr = false, esc = false;
    for (let i = bracketStart; i < content.length; i++) {
        const ch = content[i];
        if (esc) { esc = false; continue; }
        if (ch === '\\' && inStr) { esc = true; continue; }
        if (ch === '"') { inStr = !inStr; continue; }
        if (inStr) continue;
        if (ch === '[') depth++;
        else if (ch === ']') { depth--; if (depth === 0) return i + 1; }
    }
    throw new Error('Unmatched bracket');
}

async function main() {
    const seedPath = path.resolve(__dirname, '../src/lib/seed.ts');
    const seedContent = fs.readFileSync(seedPath, 'utf-8');

    const profiles = extractArray(seedContent, 'PROFILES') as Array<Record<string, unknown>>;
    const weapons = extractArray(seedContent, 'WEAPONS') as Array<Record<string, unknown>>;
    const existingIds = new Set(weapons.map(w => w.id as string));

    // Find unique inline actions (no weaponId)
    const inlineMap = new Map<string, Record<string, unknown>>();
    const nameToId = new Map<string, string>();

    for (const profile of profiles) {
        for (const action of (profile.actions as Array<Record<string, unknown>>) || []) {
            if (action.weaponId) continue;
            const name = action.name as string;
            if (inlineMap.has(name)) continue;
            inlineMap.set(name, action);
        }
    }

    console.log(`Found ${inlineMap.size} unique inline actions to convert:\n`);

    // Create catalog entries
    const newEntries: Record<string, unknown>[] = [];
    for (const [name, action] of inlineMap.entries()) {
        let baseId = `action-${slugify(name)}`;
        let actionId = baseId;
        let suffix = 0;
        while (existingIds.has(actionId)) { suffix++; actionId = `${baseId}-${suffix}`; }
        existingIds.add(actionId);
        nameToId.set(name, actionId);

        const skillReq = action.skillReq as string;
        const range = action.range as string;
        const hasSkill = skillReq && skillReq !== 'None';
        const rangeRed = range === 'Red' || range === 'Yellow' || range === 'Green' || range === 'Long';
        const rangeYellow = range === 'Yellow' || range === 'Green' || range === 'Long';
        const rangeGreen = range === 'Green' || range === 'Long';
        const rangeLong = range === 'Long';

        const entry = {
            id: actionId,
            name,
            source: 'Custom',
            factionVariants: [{ factionId: 'universal', cost: 0, rarity: 99, reqStreetCred: 0 }],
            isWeapon: false,
            isGear: false,
            isAction: true,
            skillReq: hasSkill ? skillReq : undefined,
            rangeRed: range !== 'Self' && range !== 'Reach' ? rangeRed : false,
            rangeYellow: range !== 'Self' && range !== 'Reach' ? rangeYellow : false,
            rangeGreen: range !== 'Self' && range !== 'Reach' ? rangeGreen : false,
            rangeLong: range !== 'Self' && range !== 'Reach' ? rangeLong : false,
            description: (action.effectDescription as string) || '',
            keywords: (action.keywords as string[]) || [],
        };
        newEntries.push(entry);
        console.log(`  ${actionId}: "${name}" [${skillReq}/${range}]`);
    }

    // Update profiles: set weaponId on matching inline actions
    let updatedCount = 0;
    for (const profile of profiles) {
        let changed = false;
        const actions = (profile.actions as Array<Record<string, unknown>>) || [];
        for (const action of actions) {
            if (action.weaponId) continue;
            const name = action.name as string;
            const actionId = nameToId.get(name);
            if (actionId) {
                action.weaponId = actionId;
                changed = true;
            }
        }
        if (changed) updatedCount++;
    }
    console.log(`\nUpdated ${updatedCount} profiles`);

    // Rebuild seed.ts
    const allWeapons = [...weapons, ...newEntries];
    const profilesSectionStart = seedContent.indexOf('export const PROFILES:');
    const weaponsEnd = findArrayEnd(seedContent, 'WEAPONS');
    const beforeProfiles = seedContent.slice(0, profilesSectionStart);
    let afterWeapons = seedContent.slice(weaponsEnd);
    if (afterWeapons.startsWith(';')) afterWeapons = afterWeapons.slice(1);
    if (afterWeapons.startsWith('\n')) afterWeapons = afterWeapons.slice(1);

    const newSeed = [
        beforeProfiles,
        `export const PROFILES: ModelProfile[] = [\n`,
        profiles.map(p => `    ${JSON.stringify(p)},`).join('\n'),
        `\n];\n\nexport const WEAPONS: Weapon[] = [\n`,
        allWeapons.map(w => `    ${JSON.stringify(w)},`).join('\n'),
        `\n];\n`,
        afterWeapons,
    ].join('');

    fs.writeFileSync(seedPath, newSeed);
    console.log(`\nseed.ts updated (${(newSeed.length / 1024).toFixed(1)} KB)`);

    // Push to Supabase — insert action entries
    console.log('\nPushing to Supabase...');
    const rows = newEntries.map(e => ({
        id: e.id,
        name: e.name,
        source: e.source ?? 'Custom',
        faction_variants: e.factionVariants,
        is_weapon: false,
        is_gear: false,
        is_action: true,
        skill_req: e.skillReq ?? null,
        range_red: e.rangeRed ?? false,
        range_yellow: e.rangeYellow ?? false,
        range_green: e.rangeGreen ?? false,
        range_long: e.rangeLong ?? false,
        description: e.description ?? '',
        keywords: e.keywords ?? [],
        updated_at: new Date().toISOString(),
    }));

    const { error: insertErr } = await supabase.from('weapons').upsert(rows);
    if (insertErr) console.error('  Insert failed:', insertErr.message);
    else console.log(`  ${rows.length} action entries upserted`);

    // Update profiles in Supabase
    console.log('Updating profiles in Supabase...');
    let dbUpdated = 0;
    for (const profile of profiles) {
        const actions = profile.actions as unknown[];
        const hasInline = actions.some((a: Record<string, unknown>) => nameToId.has(a.name as string));
        if (!hasInline) continue;

        const { error } = await supabase.from('profiles').update({
            actions,
            updated_at: new Date().toISOString(),
        }).eq('id', profile.id);

        if (error) console.error(`  ${profile.id}: ${error.message}`);
        else dbUpdated++;
    }
    console.log(`  ${dbUpdated} profiles updated in Supabase`);

    console.log('\nDone!');
}

main().catch(console.error);
