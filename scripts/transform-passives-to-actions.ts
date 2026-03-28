/**
 * Transform passive rules into action catalog entries.
 *
 * Reads seed.ts data via import, extracts passiveRules, creates action entries,
 * and outputs the new WEAPONS + PROFILES sections for seed.ts.
 *
 * Usage: npx tsx scripts/transform-passives-to-actions.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Import seed data directly (before we modify the types)
// We cast to bypass TS checking since passiveRules still exists in seed data
const seedPath = path.resolve(__dirname, '../src/lib/seed.ts');
const seedContent = fs.readFileSync(seedPath, 'utf-8');

// Use eval-style parsing: extract each array between brackets
function extractArray(content: string, varName: string): unknown[] {
    const re = new RegExp(`export const ${varName}[^=]*= \\[`);
    const match = re.exec(content);
    if (!match) throw new Error(`Could not find ${varName}`);

    const start = match.index + match[0].length - 1; // position of '['
    let depth = 0;
    let end = start;
    let inString = false;
    let escape = false;
    for (let i = start; i < content.length; i++) {
        const ch = content[i];
        if (escape) { escape = false; continue; }
        if (ch === '\\' && inString) { escape = true; continue; }
        if (ch === '"') { inString = !inString; continue; }
        if (inString) continue;
        if (ch === '[') depth++;
        else if (ch === ']') {
            depth--;
            if (depth === 0) { end = i + 1; break; }
        }
    }
    const jsonStr = content.slice(start, end);
    // Fix trailing commas before ]
    const fixed = jsonStr.replace(/,\s*\]/g, ']');
    return JSON.parse(fixed);
}

const profiles = extractArray(seedContent, 'PROFILES') as Array<Record<string, unknown>>;
const weapons = extractArray(seedContent, 'WEAPONS') as Array<Record<string, unknown>>;

console.log(`Loaded ${profiles.length} profiles, ${weapons.length} weapons`);

// Step 1: Parse passiveRules
interface ParsedPassive {
    name: string;
    description: string;
    rawText: string;
}

function parsePassiveRule(text: string): ParsedPassive {
    const trimmed = text.trim();
    const colonIdx = trimmed.indexOf(': ');
    if (colonIdx > 0 && colonIdx < 30) {
        const name = trimmed.slice(0, colonIdx);
        if (/^[A-Z]/.test(name) && !name.includes('.')) {
            return { name, description: trimmed.slice(colonIdx + 2), rawText: trimmed };
        }
    }
    return { name: '', description: trimmed, rawText: trimmed };
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 40);
}

// Collect unique passives
const passiveMap = new Map<string, ParsedPassive>();
const passiveToId = new Map<string, string>();

for (const profile of profiles) {
    const text = ((profile.passiveRules as string) || '').trim();
    if (!text) continue;

    const parsed = parsePassiveRule(text);
    const key = parsed.name || parsed.rawText;

    if (!passiveMap.has(key)) {
        passiveMap.set(key, parsed);
    }
}

console.log(`Found ${passiveMap.size} unique passive rules`);

// Step 2: Create action entries — deduplicate IDs
const usedIds = new Set<string>(weapons.map(w => w.id as string));
const actionEntries: Record<string, unknown>[] = [];

for (const [key, parsed] of passiveMap.entries()) {
    let baseId = `action-${slugify(parsed.name || parsed.description)}`;
    let actionId = baseId;
    let suffix = 0;
    while (usedIds.has(actionId)) {
        suffix++;
        actionId = `${baseId}-${suffix}`;
    }
    usedIds.add(actionId);
    passiveToId.set(key, actionId);

    actionEntries.push({
        id: actionId,
        name: parsed.name || parsed.description.slice(0, 50),
        source: 'Custom',
        factionVariants: [{ factionId: 'universal', cost: 0, rarity: 99, reqStreetCred: 0 }],
        isWeapon: false,
        isGear: false,
        isAction: true,
        rangeRed: false,
        rangeYellow: false,
        rangeGreen: false,
        rangeLong: false,
        description: parsed.description || parsed.rawText,
        keywords: [],
    });
}

// Step 3: Update profiles
let nextActionNum = 0;
for (const profile of profiles) {
    const text = ((profile.passiveRules as string) || '').trim();
    if (text) {
        const parsed = parsePassiveRule(text);
        const key = parsed.name || parsed.rawText;
        const actionId = passiveToId.get(key);
        if (actionId) {
            const newAction = {
                id: `passive-action-${nextActionNum++}`,
                name: parsed.name || parsed.description.slice(0, 50),
                skillReq: 'None',
                range: 'Self',
                isAttack: false,
                keywords: [],
                effectDescription: '',
                weaponId: actionId,
            };
            const existingActions = (profile.actions as unknown[]) || [];
            profile.actions = [newAction, ...existingActions];
        }
    }
    delete profile.passiveRules;
}

// Step 4: Add isAction to existing weapons + reclassify
for (const weapon of weapons) {
    if (weapon.id === 'weapon-feedback' || weapon.id === 'weapon-pull-rank') {
        weapon.isAction = true;
    } else {
        weapon.isAction = false;
    }
    if (weapon.id === 'weapon-microphone') {
        weapon.isGear = true;
    }
}

const allWeapons = [...weapons, ...actionEntries];

console.log(`\nExisting weapons: ${weapons.length}`);
console.log(`New action entries: ${actionEntries.length}`);
console.log(`Total weapons: ${allWeapons.length}`);

// Print action entries
console.log('\n--- Action Entries ---');
for (const a of actionEntries) {
    console.log(`  ${a.id}: "${a.name}"`);
}

// Step 5: Rebuild seed.ts
// Extract the parts before PROFILES and after WEAPONS

const profilesSectionStart = seedContent.indexOf('export const PROFILES:');
const weaponsSectionStart = seedContent.indexOf('export const WEAPONS:');

// Find end of WEAPONS array using string-aware bracket matching
let weaponsEnd = weaponsSectionStart;
{
    const re = /export const WEAPONS[^=]*= \[/;
    const match = re.exec(seedContent);
    if (!match) throw new Error('WEAPONS not found');
    const bracketStart = match.index + match[0].length - 1;
    let depth = 0;
    let inStr = false;
    let esc = false;
    for (let i = bracketStart; i < seedContent.length; i++) {
        const ch = seedContent[i];
        if (esc) { esc = false; continue; }
        if (ch === '\\' && inStr) { esc = true; continue; }
        if (ch === '"') { inStr = !inStr; continue; }
        if (inStr) continue;
        if (ch === '[') depth++;
        else if (ch === ']') {
            depth--;
            if (depth === 0) { weaponsEnd = i + 1; break; }
        }
    }
}
// Skip the "];" after the weapons array
let afterWeapons = seedContent.slice(weaponsEnd);
if (afterWeapons.startsWith(';\n')) {
    afterWeapons = afterWeapons.slice(2);
} else if (afterWeapons.startsWith(';')) {
    afterWeapons = afterWeapons.slice(1);
}

const beforeProfiles = seedContent.slice(0, profilesSectionStart);

const newSeed = [
    beforeProfiles,
    `export const PROFILES: ModelProfile[] = [\n`,
    profiles.map(p => `    ${JSON.stringify(p)},`).join('\n'),
    `\n];\n\n`,
    `export const WEAPONS: Weapon[] = [\n`,
    allWeapons.map(w => `    ${JSON.stringify(w)},`).join('\n'),
    `\n];`,
    afterWeapons,
].join('');

fs.writeFileSync(seedPath, newSeed);
console.log(`\n✅ seed.ts regenerated (${(newSeed.length / 1024).toFixed(1)} KB)`);

// Save action entries for the migration script
const outDir = path.resolve(__dirname, '../backups/2026-03-02-pre-actions-unification');
fs.writeFileSync(path.join(outDir, 'action-entries.json'), JSON.stringify(actionEntries, null, 2));
console.log('Action entries saved to backups/');
