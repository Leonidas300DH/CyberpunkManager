/**
 * Character Card Integration Script — One-by-One Mode
 *
 * Processes each PDF individually:
 *   1. Extract card data via Claude Vision
 *   2. Display extracted data for review
 *   3. Ask confirmation (y/n/skip)
 *   4. Push to Supabase immediately on confirm
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... npx tsx scripts/integrate-characters.ts <path-to-folder-or-pdf>
 *
 * Options:
 *   --dry-run     Show extraction without pushing
 *   --yes         Auto-confirm all (skip prompts)
 *   --start=N     Start at file index N (0-based), useful to resume
 */

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

// ─── Constants ────────────────────────────────────────────────────────────────

const SUPABASE_URL = 'https://nknlxlmmliccsfsndnba.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_wvYE8RPLNKruSr9eUAdj2Q_H9jWWLbu';
const SUPABASE_IMG_BASE = 'https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/app-images';

const PROJECT_ROOT = path.resolve(__dirname, '..');

// Faction folder name → faction ID
const FACTION_FOLDER_MAP: Record<string, string> = {
    'Arasaka': 'faction-arasaka',
    'Bozos': 'faction-bozos',
    'Danger Gals': 'faction-danger-gals',
    'Edge Runners': 'faction-edgerunners',
    'Gen Red': 'faction-gen-red',
    'Lawmen': 'faction-lawmen',
    'Maelstrom': 'faction-maelstrom',
    'Trauma Team': 'faction-trauma-team',
    'Tyger Claws': 'faction-tyger-claws',
    'Zoners': 'faction-zoners',
};

// Card text → faction ID
const FACTION_TEXT_MAP: Record<string, string> = {
    'ARASAKA': 'faction-arasaka',
    'BOZOS': 'faction-bozos', 'BOZO': 'faction-bozos',
    'DANGER GALS': 'faction-danger-gals', 'DANGER GAL': 'faction-danger-gals',
    'EDGERUNNER': 'faction-edgerunners', 'EDGERUNNERS': 'faction-edgerunners', 'EDGE RUNNER': 'faction-edgerunners',
    'GENERATION RED': 'faction-gen-red', 'GEN RED': 'faction-gen-red',
    'LAWMEN': 'faction-lawmen', 'LAWMAN': 'faction-lawmen', 'NCPD': 'faction-lawmen',
    'MAELSTROM': 'faction-maelstrom',
    'TRAUMA TEAM': 'faction-trauma-team',
    'TYGER CLAW': 'faction-tyger-claws', 'TYGER CLAWS': 'faction-tyger-claws',
    'ZONER': 'faction-zoners', 'ZONERS': 'faction-zoners',
};

const SKILL_MAP: Record<string, string> = {
    'reflexes': 'Reflexes', 'ranged': 'Ranged', 'melee': 'Melee',
    'medical': 'Medical', 'tech': 'Tech', 'influence': 'Influence',
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface CatalogData {
    factions: any[];
    lineages: any[];
    profiles: any[];
    items: any[];
    programs: any[];
    weapons: any[];
    tierSurcharges?: { veteran: number; elite: number };
}

interface CZCard {
    name: string;
    faction: string;
    type?: string;
    street_cred: number;
    cost_eb: number;
    actions: { green: number; yellow: number; red: number };
    armor: number | null;
    skills: Record<string, number | null>;
    special_rule: { name: string; description: string } | null;
    gear: Array<{
        name: string;
        skill: string;
        range_bands: string[];  // includes "long" if applicable
        keywords: string[];
    }>;
}

interface ParsedFilename {
    factionFolder: string;
    factionId: string;
    characterName: string;
    level: number;
    filePath: string;
}

// ─── Readline helper ─────────────────────────────────────────────────────────

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
function ask(question: string): Promise<string> {
    return new Promise(resolve => rl.question(question, resolve));
}

// ─── Parse PDF filename ──────────────────────────────────────────────────────

function parseFilename(filePath: string): ParsedFilename | null {
    const basename = path.basename(filePath, '.pdf');
    const parentDir = path.basename(path.dirname(filePath));
    const factionId = FACTION_FOLDER_MAP[parentDir] || '';

    let level = 0;
    let nameFromFile = basename;

    const vetMatch = basename.match(/_Vet(\d)$/);
    if (vetMatch) {
        level = parseInt(vetMatch[1]);
        nameFromFile = basename.replace(/_Vet\d$/, '');
    }

    nameFromFile = nameFromFile.replace(/_\(\d+\)$/, '');
    nameFromFile = nameFromFile.replace(/^CZ_CharacterCards_/, '');

    const factionPrefixes = [
        'Arasaka_', 'Bozos_', 'DangerGals_', 'Edgerunners_',
        'GenRED_', 'Lawmen_', 'Maelstrom_', 'TraumaTeam_',
        'TygerClaws_', 'Zoners_',
    ];
    for (const prefix of factionPrefixes) {
        if (nameFromFile.startsWith(prefix)) {
            nameFromFile = nameFromFile.substring(prefix.length);
            break;
        }
    }

    const readableName = nameFromFile
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
        .trim();

    return { factionFolder: parentDir, factionId, characterName: readableName, level, filePath };
}

// ─── Claude Vision extraction ────────────────────────────────────────────────

const CZ_EXTRACTION_SYSTEM_PROMPT = `You are an expert data extractor for "Cyberpunk Red: Combat Zone" character cards.

CARD ANATOMY:
- TOP: Name (large), Faction + Role below, Cost (number + "EB" top-right), Street Cred (★ stars next to name, 0=none)
- LEFT: Hexagonal action tokens on vertical line. GREEN=standard, YELLOW=caution, RED=desperate. Count each color.
- LEFT: Purple SHIELD with number = ARMOR (if present)
- RIGHT: Skills in purple hexagons with values (0-5):
  REFLEXES (lightning bolt), RANGED (crosshair), MELEE (fist), MEDICAL (cross), TECH (gear/wrench), INFLUENCE (exclamation mark)
- MIDDLE: Special rule title + description
- BOTTOM: Gear bar with weapon name, skill icon, colored range bands (RED=close, YELLOW=medium, GREEN=long), and optionally a LONG range bar (extends beyond green, often with "+")
  Keywords below (e.g. "Deadly Crits, Pierce 2")

IMPORTANT:
- range_bands: list ALL active colors including "long" if there is a separate long-range bar
- The "- OR -" pattern means the weapon can fire in two modes: mode 1 (e.g. Yellow+Green with Rapid 2) OR mode 2 (Long range without Rapid). Include ALL ranges: ["yellow","green","long"]
- Only extract page 2 (the card face). Page 1 is always the card back.
- Return ONLY valid JSON array, no markdown fences.

OUTPUT FORMAT:
[{
  "name": "CHARACTER NAME",
  "faction": "FACTION NAME",
  "type": "Leader" | "Character" | "Gonk" | "Specialist" | "Ronin",
  "street_cred": 0,
  "cost_eb": 25,
  "actions": { "green": 2, "yellow": 1, "red": 0 },
  "armor": 0,
  "skills": { "reflexes": null, "ranged": null, "melee": 2, "medical": null, "tech": null, "influence": 2 },
  "special_rule": { "name": "RULE NAME", "description": "Rule text..." },
  "gear": [{
    "name": "WEAPON NAME",
    "skill": "melee",
    "range_bands": ["red"],
    "keywords": ["Deadly Crits", "Pierce 2"]
  }]
}]

Use null for unreadable values. If no card found: [{"error":"No card detected"}]`;

async function extractFromPDF(client: Anthropic, pdfPath: string): Promise<CZCard[]> {
    const base64 = fs.readFileSync(pdfPath).toString('base64');

    const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        temperature: 0,
        system: CZ_EXTRACTION_SYSTEM_PROMPT,
        messages: [{
            role: 'user',
            content: [
                { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } } as any,
                { type: 'text', text: 'Extract the character card data from page 2 of this PDF. Return valid JSON array only.' },
            ],
        }],
    });

    const text = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map(b => b.text).join('').trim();

    const cleaned = text.replace(/```(?:json)?\s?|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : [parsed];
}

// ─── Weapon matching ─────────────────────────────────────────────────────────

function normalizeWeaponName(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
}

function findWeaponMatch(gearName: string, weapons: any[]): { weapon: any; score: number } | null {
    const norm = normalizeWeaponName(gearName);

    const exact = weapons.find(w => normalizeWeaponName(w.name) === norm);
    if (exact) return { weapon: exact, score: 1.0 };

    const contains = weapons.find(w => {
        const nw = normalizeWeaponName(w.name);
        return norm.includes(nw) || nw.includes(norm);
    });
    if (contains) return { weapon: contains, score: 0.8 };

    const gearWords = norm.split(' ').filter(w => w.length > 2);
    let bestMatch: any = null, bestScore = 0;
    for (const weapon of weapons) {
        const ww = normalizeWeaponName(weapon.name).split(' ').filter((w: string) => w.length > 2);
        if (!ww.length) continue;
        const overlap = gearWords.filter(gw => ww.some((w: string) => gw === w || gw.includes(w) || w.includes(gw)));
        const score = overlap.length / Math.max(gearWords.length, ww.length);
        if (score > bestScore && score >= 0.5) { bestScore = score; bestMatch = weapon; }
    }
    return bestMatch ? { weapon: bestMatch, score: bestScore } : null;
}

async function resolveWeapon(
    gear: CZCard['gear'][0],
    weapons: any[],
    confirmedMatches: Map<string, string | null>,
    autoYes: boolean,
): Promise<string | null> {
    const norm = normalizeWeaponName(gear.name);
    if (confirmedMatches.has(norm)) return confirmedMatches.get(norm) ?? null;

    const match = findWeaponMatch(gear.name, weapons);

    if (match && match.score >= 0.8) {
        console.log(`    ✓ Weapon "${gear.name}" → "${match.weapon.name}" (${match.weapon.id}) [score=${match.score.toFixed(1)}]`);
        confirmedMatches.set(norm, match.weapon.id);
        return match.weapon.id;
    }

    if (match && match.score >= 0.5 && !autoYes) {
        const ans = await ask(`    ? Weapon "${gear.name}" → "${match.weapon.name}" (score=${match.score.toFixed(2)})  Accept? (y/n/skip): `);
        if (ans.toLowerCase() === 'y') { confirmedMatches.set(norm, match.weapon.id); return match.weapon.id; }
        if (ans.toLowerCase() === 'skip') { confirmedMatches.set(norm, null); return null; }
    }

    // No match — auto-create
    const newId = 'weapon-' + gear.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    console.log(`    ✨ New weapon needed: "${gear.name}" → ${newId}`);
    confirmedMatches.set(norm, newId);
    return newId;
}

// ─── Mapping helpers ─────────────────────────────────────────────────────────

function toLineageId(name: string): string {
    return 'lineage-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
function toProfileId(lineageId: string, level: number): string {
    return lineageId.replace('lineage-', 'profile-') + '-' + level;
}

function mapSkills(czSkills: Record<string, number | null>): Record<string, number> {
    const result: Record<string, number> = { Reflexes: 0, Ranged: 0, Melee: 0, Medical: 0, Tech: 0, Influence: 0, None: 0 };
    for (const [key, value] of Object.entries(czSkills)) {
        const appKey = SKILL_MAP[key.toLowerCase()];
        if (app