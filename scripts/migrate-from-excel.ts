/**
 * Migration script: parse "Updated Gears and Weapons.xlsx" and regenerate WEAPONS in seed.ts
 *
 * Usage: npx tsx scripts/migrate-from-excel.ts
 *
 * - Uses xlsx library for proper multi-line cell handling
 * - Matches Excel rows to existing weapons by name (case-insensitive)
 * - Preserves id, imageUrl from existing weapons
 * - Updates all other fields from Excel
 * - New weapons (no match) get auto-generated id
 * - Outputs diff summary at the end
 *
 * To rollback: cp src/lib/seed.ts.backup-20260224 src/lib/seed.ts
 */

import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

// ---------- 1. Parse existing weapons for id + imageUrl preservation ----------
const seedPath = path.resolve(__dirname, '../src/lib/seed.ts');
const seedContent = fs.readFileSync(seedPath, 'utf-8');

const weaponsMatch = seedContent.match(/export const WEAPONS: Weapon\[\] = \[([\s\S]*?)\n\];/);
if (!weaponsMatch) { console.error('Could not find WEAPONS array in seed.ts'); process.exit(1); }

interface ExistingWeapon { id: string; imageUrl?: string; source: string }
const existingByName = new Map<string, ExistingWeapon>();

const weaponLines = weaponsMatch[1].split('\n').filter(l => l.trim().startsWith('{'));
for (const line of weaponLines) {
    const idMatch = line.match(/id:\s*"([^"]+)"/);
    const nameMatch = line.match(/name:\s*"((?:[^"\\]|\\.)*)"/);
    const imgMatch = line.match(/imageUrl:\s*'([^']+)'/);
    const sourceMatch = line.match(/source:\s*"([^"]+)"/);
    if (idMatch && nameMatch) {
        // Normalize: unescape quotes for matching against Excel names
        const normName = nameMatch[1].toLowerCase().trim().replace(/\\"/g, '"');
        existingByName.set(normName, {
            id: idMatch[1],
            imageUrl: imgMatch?.[1],
            source: sourceMatch?.[1] || 'Upload',
        });
    }
}
console.log(`Found ${existingByName.size} existing weapons in seed.ts`);

// ---------- 2. Parse Excel with xlsx library ----------
const wb = XLSX.readFile(path.resolve(__dirname, '../Updated Gears and Weapons.xlsx'));
const ws = wb.Sheets[wb.SheetNames[0]];

// Read as array of arrays (raw, no header mapping) to handle merged header rows
const raw: (string | number | boolean | undefined)[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

// Row 0 = header (Name, Source, W, G, Skill, ±, A, NR, Range..., Description, Keywords, Universal..., Arasaka..., etc.)
// Row 1 = sub-header (blank, blank, ..., R, Y, G, L, ..., CRED, EB, RAR, ...)
// Row 2+ = data
console.log(`Sheet "${wb.SheetNames[0]}": ${raw.length} rows (including 2 header rows)`);
console.log('Header:', (raw[0] || []).slice(0, 20).join(' | '));

const FACTION_ORDER = [
    'universal',
    'faction-arasaka',
    'faction-bozos',
    'faction-danger-gals',
    'faction-edgerunners',
    'faction-gen-red',
    'faction-lawmen',
    'faction-maelstrom',
    'faction-tyger-claws',
    'faction-zoners',
    'faction-6th-street',
];

interface FactionVariant {
    factionId: string;
    cost: number;
    rarity: number;
    reqStreetCred: number;
}

interface ParsedWeapon {
    name: string;
    source: string;
    isWeapon: boolean;
    isGear: boolean;
    skillReq?: string;
    skillBonus?: number;
    grantsArmor?: number;
    grantsNetrunner?: boolean;
    rangeRed: boolean;
    rangeYellow: boolean;
    rangeGreen: boolean;
    rangeLong: boolean;
    range2Red: boolean;
    range2Yellow: boolean;
    range2Green: boolean;
    range2Long: boolean;
    description: string;
    keywords: string[];
    factionVariants: FactionVariant[];
}

const parsedWeapons: ParsedWeapon[] = [];

function str(v: unknown): string {
    if (v === null || v === undefined) return '';
    return String(v).trim();
}

function isCheck(v: unknown): boolean {
    const s = str(v).toLowerCase();
    return s === '✓' || s === 'x' || s === 'true' || s === '1';
}

for (let r = 2; r < raw.length; r++) {
    const row = raw[r];
    if (!row || !row.length) continue;

    const name = str(row[0]);
    if (!name) continue;

    const source = str(row[1]) || 'Upload';
    const isWeapon = isCheck(row[2]);
    const isGear = isCheck(row[3]);

    const skillRaw = str(row[4]);
    const skillReq = ['Reflexes', 'Ranged', 'Melee', 'Medical', 'Tech', 'Influence']
        .find(s => s.toLowerCase() === skillRaw.toLowerCase());
    const bonusRaw = str(row[5]);
    const skillBonus = bonusRaw && !isNaN(Number(bonusRaw)) ? Number(bonusRaw) : undefined;
    const armorRaw = str(row[6]);
    const grantsArmor = armorRaw && !isNaN(Number(armorRaw)) && Number(armorRaw) > 0 ? Number(armorRaw) : undefined;
    const grantsNetrunner = isCheck(row[7]);

    const rangeRed = isCheck(row[8]);
    const rangeYellow = isCheck(row[9]);
    const rangeGreen = isCheck(row[10]);
    const rangeLong = isCheck(row[11]);
    const range2Red = isCheck(row[12]);
    const range2Yellow = isCheck(row[13]);
    const range2Green = isCheck(row[14]);
    const range2Long = isCheck(row[15]);

    // Description may contain newlines — flatten to single line
    const description = str(row[16]).replace(/\r?\n/g, ' ').replace(/\s+/g, ' ');
    const keywordsRaw = str(row[17]);
    const keywords = keywordsRaw ? keywordsRaw.split(';').map(k => k.trim()).filter(Boolean) : [];

    // Parse faction variants (cols 18+, groups of 3: CRED, EB, RAR)
    const factionVariants: FactionVariant[] = [];
    for (let fi = 0; fi < FACTION_ORDER.length; fi++) {
        const baseCol = 18 + fi * 3;
        const credRaw = str(row[baseCol]);
        const ebRaw = str(row[baseCol + 1]);
        const rarRaw = str(row[baseCol + 2]);

        // All empty = no variant for this faction
        if (!credRaw && !ebRaw && !rarRaw) continue;

        // All dashes = exists with defaults (cost 0, rarity 99, sc 0)
        if (credRaw === '–' && ebRaw === '–' && rarRaw === '–') {
            factionVariants.push({ factionId: FACTION_ORDER[fi], cost: 0, rarity: 99, reqStreetCred: 0 });
            continue;
        }

        // Mixed: dash or empty = default for that field
        const cred = credRaw === '–' || credRaw === '' ? 0 : Number(credRaw);
        const eb = ebRaw === '–' || ebRaw === '' ? 0 : Number(ebRaw);
        const rar = rarRaw === '–' || rarRaw === '' ? 99 : Number(rarRaw);

        factionVariants.push({
            factionId: FACTION_ORDER[fi],
            cost: isNaN(eb) ? 0 : eb,
            rarity: isNaN(rar) ? 99 : rar,
            reqStreetCred: isNaN(cred) ? 0 : cred,
        });
    }

    if (factionVariants.length === 0) {
        factionVariants.push({ factionId: 'universal', cost: 0, rarity: 99, reqStreetCred: 0 });
    }

    parsedWeapons.push({
        name, source, isWeapon, isGear, skillReq, skillBonus, grantsArmor, grantsNetrunner,
        rangeRed, rangeYellow, rangeGreen, rangeLong,
        range2Red, range2Yellow, range2Green, range2Long,
        description, keywords, factionVariants,
    });
}

console.log(`Parsed ${parsedWeapons.length} weapons from Excel`);

// ---------- 3. Generate WEAPONS array ----------
let matched = 0, unmatched = 0;
const diffLog: string[] = [];

function slugify(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function escapeStr(s: string): string {
    return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

const weaponEntries: string[] = [];

for (const pw of parsedWeapons) {
    const key = pw.name.toLowerCase().trim();
    const existing = existingByName.get(key);
    const id = existing?.id || `weapon-${slugify(pw.name)}`;
    const imageUrl = existing?.imageUrl || 'https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/weapon-images/default.png';

    if (existing) { matched++; } else { unmatched++; diffLog.push(`NEW: ${pw.name} (id: ${id})`); }

    const parts: string[] = [];
    parts.push(`id: "${id}"`);
    parts.push(`name: "${escapeStr(pw.name)}"`);
    parts.push(`source: "${pw.source}"`);

    const fvStrs = pw.factionVariants.map(fv =>
        `{ factionId: "${fv.factionId}", cost: ${fv.cost}, rarity: ${fv.rarity}, reqStreetCred: ${fv.reqStreetCred} }`
    );
    parts.push(`factionVariants: [${fvStrs.join(', ')}]`);

    parts.push(`isWeapon: ${pw.isWeapon}`);
    parts.push(`isGear: ${pw.isGear}`);

    if (pw.skillReq) parts.push(`skillReq: "${pw.skillReq}"`);
    if (pw.skillBonus !== undefined) parts.push(`skillBonus: ${pw.skillBonus}`);
    if (pw.grantsArmor !== undefined) parts.push(`grantsArmor: ${pw.grantsArmor}`);
    if (pw.grantsNetrunner) parts.push(`grantsNetrunner: true`);

    parts.push(`rangeRed: ${pw.rangeRed}`);
    parts.push(`rangeYellow: ${pw.rangeYellow}`);
    parts.push(`rangeGreen: ${pw.rangeGreen}`);
    parts.push(`rangeLong: ${pw.rangeLong}`);

    if (pw.range2Red || pw.range2Yellow || pw.range2Green || pw.range2Long) {
        parts.push(`range2Red: ${pw.range2Red}`);
        parts.push(`range2Yellow: ${pw.range2Yellow}`);
        parts.push(`range2Green: ${pw.range2Green}`);
        parts.push(`range2Long: ${pw.range2Long}`);
    }

    parts.push(`description: "${escapeStr(pw.description)}"`);
    parts.push(`keywords: [${pw.keywords.map(k => `"${escapeStr(k)}"`).join(', ')}]`);
    parts.push(`imageUrl: '${imageUrl}'`);

    weaponEntries.push(`    { ${parts.join(', ')} },`);
}

// ---------- 4. Replace in seed.ts ----------
const newWeaponsBlock = `export const WEAPONS: Weapon[] = [\n${weaponEntries.join('\n')}\n];`;
const updatedSeed = seedContent.replace(/export const WEAPONS: Weapon\[\] = \[[\s\S]*?\n\];/, newWeaponsBlock);

fs.writeFileSync(seedPath, updatedSeed, 'utf-8');

console.log('\n=== MIGRATION SUMMARY ===');
console.log(`Matched: ${matched}`);
console.log(`New (unmatched): ${unmatched}`);
if (diffLog.length > 0) {
    console.log('\nNew weapons:');
    diffLog.forEach(l => console.log('  ' + l));
}
console.log(`\nWrote ${parsedWeapons.length} weapons to seed.ts`);
console.log('\nTo rollback: cp src/lib/seed.ts.backup-20260224 src/lib/seed.ts');
