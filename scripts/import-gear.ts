#!/usr/bin/env npx tsx
/**
 * Import Gear Script
 * Reads JSON files from "Import Gear/", merges weapons/gear into seed.ts,
 * and bumps SEED_VERSION in useStore.ts.
 *
 * Usage: npx tsx scripts/import-gear.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================
// PATHS
// ============================================================
const PROJECT_ROOT = path.resolve(__dirname, '..');
const IMPORT_DIR = path.resolve(PROJECT_ROOT, '..', 'Import Gear');
const SEED_PATH = path.join(PROJECT_ROOT, 'src', 'lib', 'seed.ts');
const STORE_PATH = path.join(PROJECT_ROOT, 'src', 'store', 'useStore.ts');

// ============================================================
// TYPES (mirrored from src/types — script runs standalone)
// ============================================================
interface FactionVariant {
    factionId: string;
    cost: number;
    rarity: number;
    reqStreetCred: number;
}

interface Weapon {
    id: string;
    name: string;
    source: 'Custom' | 'Manual' | 'Upload';
    factionVariants: FactionVariant[];
    isWeapon: boolean;
    isGear: boolean;
    skillReq?: 'Melee' | 'Ranged';
    rangeRed: boolean;
    rangeYellow: boolean;
    rangeGreen: boolean;
    rangeLong: boolean;
    description: string;
    keywords: string[];
    grantsNetrunner?: boolean;
    imageUrl?: string;
}

interface Faction {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
}

// ============================================================
// IMPORT JSON ENTRY FORMAT
// ============================================================
interface ImportEntry {
    techId: string;
    name: string;
    faction: string;
    cost: number;
    rarity: number;
    reqStreetCred: number;
    isWeapon: boolean;
    isGear: boolean;
    rangeRed: boolean;
    rangeYellow: boolean;
    rangeGreen: boolean;
    rangeLong: boolean;
    description: string;
    keywords: string[];
}

// ============================================================
// FACTION NAME → ID MAPPING
// ============================================================
const FACTION_NAME_MAP: Record<string, string> = {
    'Universal': 'universal',
    'Arasaka': 'faction-arasaka',
    'Bozos': 'faction-bozos',
    'Danger Gals': 'faction-danger-gals',
    'Edgerunners': 'faction-edgerunners',
    'Generation Red': 'faction-gen-red',
    'Lawmen': 'faction-lawmen',
    'Maelstrom': 'faction-maelstrom',
    'Trauma Team': 'faction-trauma-team',
    'Tyger Claws': 'faction-tyger-claws',
    'Zoners': 'faction-zoners',
};

// Typos / OCR errors seen in extractions → corrected faction name
const FACTION_ALIASES: Record<string, string> = {
    'Badgerrunners': 'Edgerunners',
    'Gen Red': 'Generation Red',
};

// Track unknown factions encountered during import
const unknownFactions: { name: string; weapons: string[] }[] = [];

function slugify(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function resolveFactionName(raw: string): string {
    if (FACTION_ALIASES[raw]) {
        console.warn(`  ⚠ Faction "${raw}" corrigee en "${FACTION_ALIASES[raw]}" (alias connu)`);
        return FACTION_ALIASES[raw];
    }
    return raw;
}

function factionNameToId(name: string, weaponName?: string): string {
    if (FACTION_NAME_MAP[name]) return FACTION_NAME_MAP[name];
    // Unknown faction — track it and auto-generate
    const existing = unknownFactions.find(f => f.name === name);
    if (existing) {
        if (weaponName && !existing.weapons.includes(weaponName)) existing.weapons.push(weaponName);
    } else {
        unknownFactions.push({ name, weapons: weaponName ? [weaponName] : [] });
    }
    const id = `faction-${slugify(name)}`;
    FACTION_NAME_MAP[name] = id;
    return id;
}

// ============================================================
// SKILL DEDUCTION
// ============================================================
function deduceSkillReq(entry: { isWeapon: boolean; rangeRed: boolean; rangeYellow: boolean; rangeGreen: boolean; rangeLong: boolean; name: string }): 'Melee' | 'Ranged' | undefined {
    if (!entry.isWeapon) return undefined;

    const hasYellowPlus = entry.rangeYellow || entry.rangeGreen || entry.rangeLong;
    if (hasYellowPlus) return 'Ranged';
    if (entry.rangeRed && !hasYellowPlus) return 'Melee';

    // No range at all but is a weapon — ambiguous
    console.warn(`  ⚠ Ambiguous skillReq for "${entry.name}" (isWeapon but no range) — defaulting to undefined`);
    return undefined;
}

// ============================================================
// PARSE EXISTING WEAPONS FROM seed.ts
// ============================================================
function parseWeaponsFromSeed(seedContent: string): Weapon[] {
    // Find the WEAPONS array block
    const startMatch = seedContent.match(/export const WEAPONS:\s*Weapon\[\]\s*=\s*\[/);
    if (!startMatch || startMatch.index === undefined) {
        throw new Error('Could not find WEAPONS array in seed.ts');
    }

    const arrayStart = startMatch.index + startMatch[0].length;

    // Find matching closing bracket by counting brackets
    let depth = 1;
    let i = arrayStart;
    while (i < seedContent.length && depth > 0) {
        if (seedContent[i] === '[') depth++;
        else if (seedContent[i] === ']') depth--;
        i++;
    }
    const arrayEnd = i - 1; // position of the closing ]
    const arrayContent = seedContent.substring(arrayStart, arrayEnd);

    // Parse each weapon object line
    // Each weapon is on one line: { id: '...', ... },
    const weapons: Weapon[] = [];
    const objectRegex = /\{[^}]+\}/g;

    // Use a more robust approach: eval-like parsing via Function constructor
    // We wrap the content in an array and evaluate it
    try {
        const evalCode = `return [${arrayContent}];`;
        const fn = new Function(evalCode);
        const parsed = fn() as Weapon[];
        return parsed;
    } catch (e) {
        console.error('Failed to parse WEAPONS array from seed.ts:', e);
        throw e;
    }
}

// ============================================================
// PARSE EXISTING FACTIONS FROM seed.ts
// ============================================================
function parseFactionsFromSeed(seedContent: string): Faction[] {
    const startMatch = seedContent.match(/export const FACTIONS:\s*Faction\[\]\s*=\s*\[/);
    if (!startMatch || startMatch.index === undefined) {
        throw new Error('Could not find FACTIONS array in seed.ts');
    }

    const arrayStart = startMatch.index + startMatch[0].length;
    let depth = 1;
    let i = arrayStart;
    while (i < seedContent.length && depth > 0) {
        if (seedContent[i] === '[') depth++;
        else if (seedContent[i] === ']') depth--;
        i++;
    }
    const arrayEnd = i - 1;
    const arrayContent = seedContent.substring(arrayStart, arrayEnd);

    try {
        const fn = new Function(`return [${arrayContent}];`);
        return fn() as Faction[];
    } catch (e) {
        console.error('Failed to parse FACTIONS array from seed.ts:', e);
        throw e;
    }
}

// ============================================================
// SERIALIZE WEAPON TO TS ONE-LINER
// ============================================================
function serializeWeapon(w: Weapon): string {
    const parts: string[] = [];
    parts.push(`id: ${JSON.stringify(w.id)}`);
    parts.push(`name: ${JSON.stringify(w.name)}`);
    parts.push(`source: ${JSON.stringify(w.source)}`);
    parts.push(`factionVariants: [${w.factionVariants.map(v =>
        `{ factionId: ${JSON.stringify(v.factionId)}, cost: ${v.cost}, rarity: ${v.rarity}, reqStreetCred: ${v.reqStreetCred} }`
    ).join(', ')}]`);
    parts.push(`isWeapon: ${w.isWeapon}`);
    parts.push(`isGear: ${w.isGear}`);
    if (w.skillReq !== undefined) parts.push(`skillReq: ${JSON.stringify(w.skillReq)}`);
    parts.push(`rangeRed: ${w.rangeRed}`);
    parts.push(`rangeYellow: ${w.rangeYellow}`);
    parts.push(`rangeGreen: ${w.rangeGreen}`);
    parts.push(`rangeLong: ${w.rangeLong}`);
    parts.push(`description: ${JSON.stringify(w.description)}`);
    parts.push(`keywords: [${w.keywords.map(k => JSON.stringify(k)).join(', ')}]`);
    if (w.grantsNetrunner) parts.push(`grantsNetrunner: true`);
    if (w.imageUrl) parts.push(`imageUrl: ${JSON.stringify(w.imageUrl)}`);
    return `    { ${parts.join(', ')} },`;
}

// ============================================================
// SERIALIZE FACTION TO TS
// ============================================================
function serializeFaction(f: Faction): string {
    const parts: string[] = [];
    parts.push(`        id: ${JSON.stringify(f.id)}`);
    parts.push(`        name: ${JSON.stringify(f.name)}`);
    if (f.description) parts.push(`        description: ${JSON.stringify(f.description)}`);
    if (f.imageUrl) parts.push(`        imageUrl: ${JSON.stringify(f.imageUrl)}`);
    return `    {\n${parts.join(',\n')},\n    }`;
}

// ============================================================
// REPLACE BLOCK IN seed.ts
// ============================================================
function replaceBlock(content: string, exportName: string, typeName: string, serialized: string): string {
    const regex = new RegExp(
        `(export const ${exportName}:\\s*${typeName}\\[\\]\\s*=\\s*\\[)[\\s\\S]*?(\\];)`,
    );
    const match = content.match(regex);
    if (!match) {
        throw new Error(`Could not find ${exportName} block in seed.ts`);
    }
    return content.replace(regex, `$1\n${serialized}\n$2`);
}

// ============================================================
// BUMP SEED_VERSION
// ============================================================
function bumpSeedVersion(storePath: string): number {
    let content = fs.readFileSync(storePath, 'utf-8');
    const match = content.match(/const SEED_VERSION\s*=\s*(\d+);/);
    if (!match) throw new Error('Could not find SEED_VERSION in useStore.ts');
    const oldVersion = parseInt(match[1]);
    const newVersion = oldVersion + 1;
    content = content.replace(
        /const SEED_VERSION\s*=\s*\d+;/,
        `const SEED_VERSION = ${newVersion};`
    );
    fs.writeFileSync(storePath, content, 'utf-8');
    return newVersion;
}

// ============================================================
// MAIN
// ============================================================
function main() {
    console.log('=== Cyberpunk Combat Zone — Gear Import ===\n');

    // 1. Read JSON files from Import Gear/
    if (!fs.existsSync(IMPORT_DIR)) {
        console.error(`❌ Import directory not found: ${IMPORT_DIR}`);
        process.exit(1);
    }

    const jsonFiles = fs.readdirSync(IMPORT_DIR).filter(f => f.endsWith('.json'));
    if (jsonFiles.length === 0) {
        console.log('No JSON files found in Import Gear/ — nothing to do.');
        process.exit(0);
    }

    console.log(`Found ${jsonFiles.length} JSON file(s): ${jsonFiles.join(', ')}\n`);

    // 2. Parse all entries
    const allEntries: ImportEntry[] = [];
    for (const file of jsonFiles) {
        const filePath = path.join(IMPORT_DIR, file);
        const raw = fs.readFileSync(filePath, 'utf-8');
        try {
            const data = JSON.parse(raw);
            const entries: ImportEntry[] = Array.isArray(data) ? data : [data];
            console.log(`  📄 ${file}: ${entries.length} entries`);
            allEntries.push(...entries);
        } catch (e) {
            console.error(`  ❌ Failed to parse ${file}:`, e);
        }
    }

    if (allEntries.length === 0) {
        console.log('\nNo entries found — nothing to do.');
        process.exit(0);
    }
    console.log(`\nTotal entries: ${allEntries.length}`);

    // 3. Resolve faction aliases on all entries
    for (const entry of allEntries) {
        entry.faction = resolveFactionName(entry.faction);
    }

    // 4. Group by name → build imported weapons
    const byName = new Map<string, ImportEntry[]>();
    for (const entry of allEntries) {
        const key = entry.name.toLowerCase();
        if (!byName.has(key)) byName.set(key, []);
        byName.get(key)!.push(entry);
    }

    const importedWeapons: Weapon[] = [];
    const newFactionNames = new Set<string>();

    for (const [, entries] of byName) {
        const first = entries[0];

        // Build faction variants
        const variants: FactionVariant[] = entries.map(e => ({
            factionId: factionNameToId(e.faction, e.name),
            cost: e.cost,
            rarity: e.rarity,
            reqStreetCred: e.reqStreetCred,
        }));

        // Track new factions needed in seed
        for (const e of entries) {
            const id = factionNameToId(e.faction, e.name);
            if (id !== 'universal' && !Object.values(FACTION_NAME_MAP).includes(id)) {
                newFactionNames.add(e.faction);
            }
        }

        const skillReq = deduceSkillReq(first);

        const weapon: Weapon = {
            id: `weapon-${slugify(first.name)}`,
            name: first.name,
            source: 'Upload',
            factionVariants: variants,
            isWeapon: first.isWeapon,
            isGear: first.isGear,
            skillReq,
            rangeRed: first.rangeRed,
            rangeYellow: first.rangeYellow,
            rangeGreen: first.rangeGreen,
            rangeLong: first.rangeLong,
            description: first.description,
            keywords: first.keywords || [],
        };

        importedWeapons.push(weapon);
    }

    console.log(`\nGrouped into ${importedWeapons.length} unique weapon(s)`);

    // 4. Load existing seed.ts
    let seedContent = fs.readFileSync(SEED_PATH, 'utf-8');
    const existingWeapons = parseWeaponsFromSeed(seedContent);
    const existingFactions = parseFactionsFromSeed(seedContent);

    console.log(`Existing weapons in seed: ${existingWeapons.length}`);
    console.log(`Existing factions in seed: ${existingFactions.length}`);

    // 5. Merge
    let added = 0;
    let updated = 0;
    let variantsAdded = 0;

    const weaponMap = new Map<string, Weapon>();
    for (const w of existingWeapons) {
        weaponMap.set(w.name.toLowerCase(), w);
    }

    for (const imported of importedWeapons) {
        const key = imported.name.toLowerCase();
        const existing = weaponMap.get(key);

        if (existing) {
            // Merge faction variants
            for (const v of imported.factionVariants) {
                const existingVariantIdx = existing.factionVariants.findIndex(
                    ev => ev.factionId === v.factionId
                );
                if (existingVariantIdx >= 0) {
                    existing.factionVariants[existingVariantIdx] = v; // overwrite
                } else {
                    existing.factionVariants.push(v);
                    variantsAdded++;
                }
            }

            // Update base properties from import (import = source of truth for content)
            existing.description = imported.description;
            existing.keywords = imported.keywords;
            existing.rangeRed = imported.rangeRed;
            existing.rangeYellow = imported.rangeYellow;
            existing.rangeGreen = imported.rangeGreen;
            existing.rangeLong = imported.rangeLong;
            existing.isWeapon = imported.isWeapon;
            existing.isGear = imported.isGear;

            // Update skillReq only if currently undefined and deducible
            if (existing.skillReq === undefined && imported.skillReq !== undefined) {
                existing.skillReq = imported.skillReq;
            }

            // Preserve: source stays 'Custom', imageUrl, grantsNetrunner

            updated++;
            console.log(`  ✏️  Updated: ${existing.name} (+${imported.factionVariants.length} variant(s))`);
        } else {
            // New weapon
            weaponMap.set(key, imported);
            added++;
            console.log(`  ✅ Added: ${imported.name} (${imported.factionVariants.length} variant(s))`);
        }
    }

    // 6. Handle new factions
    const existingFactionIds = new Set(existingFactions.map(f => f.id));
    const newFactions: Faction[] = [];

    for (const name of newFactionNames) {
        const id = factionNameToId(name);
        if (!existingFactionIds.has(id)) {
            newFactions.push({
                id,
                name,
                description: `Imported faction: ${name}.`,
            });
            console.log(`  🆕 New faction: ${name} (${id})`);
        }
    }

    // 7. Rewrite FACTIONS in seed.ts
    const allFactions = [...existingFactions, ...newFactions];
    const factionsTs = allFactions.map(f => serializeFaction(f)).join(',\n');
    seedContent = replaceBlock(seedContent, 'FACTIONS', 'Faction', factionsTs);

    // 8. Rewrite WEAPONS in seed.ts
    // Sort: existing order first, then new ones alphabetically
    const finalWeapons = Array.from(weaponMap.values());
    const weaponsTs = finalWeapons.map(w => serializeWeapon(w)).join('\n');
    seedContent = replaceBlock(seedContent, 'WEAPONS', 'Weapon', weaponsTs);

    fs.writeFileSync(SEED_PATH, seedContent, 'utf-8');

    // 9. Bump SEED_VERSION
    const newVersion = bumpSeedVersion(STORE_PATH);

    // 10. Warn about unknown/suspicious factions
    if (unknownFactions.length > 0) {
        console.log('\n🚨 FACTIONS INCONNUES — probablement des erreurs d\'extraction :');
        for (const { name, weapons } of unknownFactions) {
            console.log(`   ❓ "${name}" → auto-mapped to faction-${slugify(name)}`);
            console.log(`      Armes concernees: ${weapons.join(', ')}`);
            console.log(`      → Verifier si c'est un alias/typo d'une faction existante.`);
            console.log(`         Si oui, ajouter dans FACTION_ALIASES du script.`);
        }
    }

    // 11. Summary
    console.log('\n=== Import Summary ===');
    console.log(`  Weapons added:    ${added}`);
    console.log(`  Weapons updated:  ${updated}`);
    console.log(`  Variants added:   ${variantsAdded}`);
    console.log(`  New factions:     ${newFactions.length}`);
    console.log(`  SEED_VERSION:     v${newVersion}`);
    if (unknownFactions.length > 0) {
        console.log(`\n  ⚠ ${unknownFactions.length} faction(s) inconnue(s) detectee(s) — voir ci-dessus`);
    }
    console.log(`\n✅ seed.ts and useStore.ts updated successfully.`);
}

main();
