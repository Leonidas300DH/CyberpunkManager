import * as fs from 'fs';

const data = JSON.parse(fs.readFileSync('/tmp/seed_dump.json', 'utf-8'));

function stringify(obj: any, indent = 0): string {
  return JSON.stringify(obj, null, 2)
    .split('\n')
    .map((line, i) => (i === 0 ? line : ' '.repeat(indent) + line))
    .join('\n');
}

function toTS(arr: any[], varName: string, typeName: string): string {
  const items = arr.map(item => '    ' + JSON.stringify(item)).join(',\n');
  return `export const ${varName}: ${typeName}[] = [\n${items},\n];\n`;
}

let out = `// Auto-generated from Supabase on ${new Date().toISOString().slice(0, 10)}
// DO NOT EDIT MANUALLY — regenerate with: npx tsx scripts/dump-seed.ts && npx tsx scripts/gen-seed.ts

import type { Faction, ModelLineage, ModelProfile, Weapon, ItemCard, HackingProgram, Objective } from '@/types';

`;

out += toTS(data.factions, 'FACTIONS', 'Faction');
out += '\n';
out += toTS(data.lineages, 'LINEAGES', 'ModelLineage');
out += '\n';
out += toTS(data.profiles, 'PROFILES', 'ModelProfile');
out += '\n';
out += toTS(data.weapons, 'WEAPONS', 'Weapon');
out += '\n';
out += toTS(data.items, 'ITEMS', 'ItemCard');
out += '\n';
out += toTS(data.programs, 'HACKING_PROGRAMS', 'HackingProgram');
out += '\n';
out += toTS(data.objectives ?? [], 'OBJECTIVES', 'Objective');
out += '\n';
out += `export const TIER_SURCHARGES = ${JSON.stringify(data.tierSurcharges)};\n`;

fs.writeFileSync(
  '/Users/danielherbera/Dropbox/Antigravity/Cyberpunk Combat Zone/combat-zone-companion/src/lib/seed.ts',
  out
);

console.log(`Generated seed.ts: ${data.factions.length} factions, ${data.lineages.length} lineages, ${data.profiles.length} profiles, ${data.weapons.length} weapons, ${data.items.length} items, ${data.programs.length} programs, ${(data.objectives ?? []).length} objectives`);
