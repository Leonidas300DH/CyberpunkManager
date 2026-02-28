/**
 * Generate a CSV of all weapons/gear with the default image,
 * with intelligent AI image prompts based on item analysis.
 *
 * Usage: npx tsx scripts/gen-missing-images-csv.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const SEED_PATH = path.resolve(__dirname, '..', 'src', 'lib', 'seed.ts');
const OUTPUT_PATH = path.resolve(__dirname, '..', 'Import Gear', 'weapons_missing_images.csv');

// ─── Parse weapons from seed ───
interface Weapon {
  name: string;
  isWeapon: boolean;
  isGear: boolean;
  description: string;
  keywords: string[];
  skillReq?: string;
  rangeRed: boolean;
  rangeYellow: boolean;
  rangeGreen: boolean;
  rangeLong: boolean;
  imageUrl?: string;
}

function parseWeapons(): Weapon[] {
  const seed = fs.readFileSync(SEED_PATH, 'utf-8');

  const startMarker = 'export const WEAPONS: Weapon[] = [';
  const startIdx = seed.indexOf(startMarker);
  if (startIdx < 0) throw new Error('WEAPONS array not found');

  const weapons: Weapon[] = [];
  const lines = seed.substring(startIdx).split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('{ id:') && !trimmed.startsWith('{id:')) continue;
    if (trimmed.startsWith('];')) break;

    // Delimiter-aware string extractor: finds key: "..." or key: '...'
    // and reads until the matching closing delimiter (handles escaped quotes)
    const getStr = (key: string): string => {
      const keyPattern = `${key}: `;
      const idx = trimmed.indexOf(keyPattern);
      if (idx < 0) return '';
      const afterKey = idx + keyPattern.length;
      // Skip whitespace
      let pos = afterKey;
      while (pos < trimmed.length && trimmed[pos] === ' ') pos++;
      const delim = trimmed[pos];
      if (delim !== '"' && delim !== "'") return '';
      pos++; // skip opening delimiter
      let result = '';
      while (pos < trimmed.length) {
        const ch = trimmed[pos];
        if (ch === '\\' && pos + 1 < trimmed.length) {
          // Escaped char
          const next = trimmed[pos + 1];
          if (next === delim) { result += delim; pos += 2; continue; }
          if (next === 'n') { result += '\n'; pos += 2; continue; }
          if (next === '\\') { result += '\\'; pos += 2; continue; }
          result += next; pos += 2; continue;
        }
        if (ch === delim) break; // closing delimiter
        result += ch;
        pos++;
      }
      return result;
    };

    const getBool = (key: string): boolean => {
      const m = trimmed.match(new RegExp(`${key}:\\s*(true|false)`));
      return m ? m[1] === 'true' : false;
    };

    const getKeywords = (): string[] => {
      // Find the LAST keywords: [...] (not factionVariants keywords)
      const kIdx = trimmed.lastIndexOf('keywords:');
      if (kIdx < 0) return [];
      const sub = trimmed.substring(kIdx);
      const m = sub.match(/keywords:\s*\[([^\]]*)\]/);
      if (!m || !m[1].trim()) return [];
      return m[1].split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    };

    weapons.push({
      name: getStr('name'),
      isWeapon: getBool('isWeapon'),
      isGear: getBool('isGear'),
      description: getStr('description'),
      keywords: getKeywords(),
      skillReq: getStr('skillReq') || undefined,
      rangeRed: getBool('rangeRed'),
      rangeYellow: getBool('rangeYellow'),
      rangeGreen: getBool('rangeGreen'),
      rangeLong: getBool('rangeLong'),
      imageUrl: getStr('imageUrl'),
    });
  }

  return weapons;
}

// ─── Item classification ───

type ItemCategory =
  | 'melee-blade' | 'melee-blunt' | 'melee-fist' | 'melee-other'
  | 'ranged-pistol' | 'ranged-smg' | 'ranged-rifle' | 'ranged-shotgun'
  | 'ranged-sniper' | 'ranged-heavy' | 'ranged-other'
  | 'grenade' | 'explosive'
  | 'cybergear-arm' | 'cybergear-eye' | 'cybergear-neural'
  | 'cybergear-body' | 'cybergear-other'
  | 'armor' | 'drug' | 'medical' | 'tech-tool' | 'hacking'
  | 'vehicle' | 'ammo' | 'badge-token' | 'clothing' | 'generic';

function classify(w: Weapon): ItemCategory {
  const n = w.name.toLowerCase();
  const d = w.description.toLowerCase();
  const kw = w.keywords.map(k => k.toLowerCase()).join(' ');

  // Drugs — check first (description often starts with "Drug")
  if (d.startsWith('drug') || kw.includes('drug') || n.includes('lace') || n.includes('stim') || n.includes('synthcoke') || n.includes('smash') || n.includes('boost'))
    return 'drug';

  // Ammo / Rounds
  if (n.includes('rounds') || n.includes('ammo') || n.includes('incendiary rounds'))
    return 'ammo';

  // Grenades / Bombs
  if (n.includes('grenade') || n.includes('bomb') || n.includes('flashbang') || n.includes('racate'))
    return 'grenade';

  // Explosive / ordnance / mines
  if (n.includes('mine') || n.includes('caltrops') || n.includes('designator') || n.includes('pie grenade'))
    return 'explosive';

  // Armor — check before weapons
  if (d.includes('armor') || n.includes('armor') || n.includes('helmet') || n.includes('armorjack') || n.includes('kevlar') || n.includes('metalgear') || n.includes('deflector') || n.includes('loadout') || n.includes('kabuto'))
    if (!w.isWeapon || w.isGear)
      return 'armor';

  // Medical
  if (w.skillReq === 'Medical' || d.includes('triage') || d.includes('heal') || n.includes('medic') || n.includes('airhypo') || n.includes('trauma') || n.includes('sprayskin'))
    return 'medical';

  // Hacking / Net
  if (n.includes('cyberdeck') || n.includes('brain-box') || n.includes('netlink') || d.includes('netrunner') || d.includes('program'))
    return 'hacking';

  // Vehicle
  if (n.includes('motorcycle') || n.includes('vehicle') || n.includes('skates') || n.includes('saddle'))
    return 'vehicle';

  // Badge / Token / authority / social
  if (n.includes('badge') || n.includes('butter bar') || n.includes('blackmail') || n.includes('warrant') || n.includes('credential') || n.includes('id scanner'))
    return 'badge-token';

  // Clothing / suit
  if (n.includes('suit') || n.includes('cloak') || n.includes('coat') || n.includes('jacket') || n.includes('kimono') || n.includes('hoody') || n.includes('leathers') || n.includes('trench'))
    return 'clothing';

  // Tech tools
  if (w.skillReq === 'Tech' || n.includes('tool') || n.includes('techtools') || d.includes('repair') || n.includes('drone') || n.includes('recorder') || n.includes('scanner') || n.includes('detector') || n.includes('microwaver'))
    return 'tech-tool';

  // Cybergear — check description AND keywords
  if (d.includes('cybergear') || kw.includes('cybergear') || n.includes('cyber-') || n.includes('cyberarm') || n.includes('cyberleg') || n.includes('cyberaudio') || n.includes('cybereye')) {
    if (n.includes('arm') || n.includes('fist') || n.includes('knuck') || n.includes('claw') || n.includes('wolver') || n.includes('saw'))
      return 'cybergear-arm';
    if (n.includes('eye') || n.includes('optic') || n.includes('kiroshi') || n.includes('camo'))
      return 'cybergear-eye';
    if (n.includes('brain') || n.includes('neural') || n.includes('chip') || n.includes('reflex') || n.includes('sandevistan') || n.includes('uplink') || n.includes('reprogram'))
      return 'cybergear-neural';
    if (n.includes('skin') || n.includes('body') || n.includes('sub-dermal') || n.includes('monitor') || n.includes('subdermal'))
      return 'cybergear-body';
    return 'cybergear-other';
  }

  // Weapons
  if (w.isWeapon) {
    // Melee — only range red, or skillReq Melee
    if (w.skillReq === 'Melee' || (!w.rangeYellow && !w.rangeGreen && !w.rangeLong && w.rangeRed)) {
      if (n.includes('katana') || n.includes('blade') || n.includes('knife') || n.includes('shiv') || n.includes('tanto') || n.includes('sword') || n.includes('tonfa') || n.includes('axe') || n.includes('machete') || n.includes('scissors') || n.includes('kleaver'))
        return 'melee-blade';
      if (n.includes('hammer') || n.includes('bat') || n.includes('bludgeon') || n.includes('ram') || n.includes('crowbar') || n.includes('mace') || n.includes('baton'))
        return 'melee-blunt';
      if (n.includes('knuck') || n.includes('fist') || n.includes('glove') || n.includes('claw') || n.includes('hook') || n.includes('brass'))
        return 'melee-fist';
      return 'melee-other';
    }

    // Ranged subtypes
    if (n.includes('pistol') || n.includes('revolver') || n.includes('handcannon'))
      return 'ranged-pistol';
    if (n.includes('smg') || n.includes('submachine'))
      return 'ranged-smg';
    if (n.includes('shotgun') || n.includes('ssg') || n.includes('ssw'))
      return 'ranged-shotgun';
    if (n.includes('sniper'))
      return 'ranged-sniper';
    if (n.includes('rifle') || n.includes('carbine'))
      return 'ranged-rifle';
    if (n.includes('launcher') || n.includes('mortar') || n.includes('heavy mg') || n.includes('machine gun') || n.includes('minigun') || n.includes('flamethrower') || n.includes('flame-thrower') || n.includes('canon') || n.includes('rpg'))
      return 'ranged-heavy';

    // Melee fallback for weapons without range data
    if (n.includes('chainsaw') || n.includes('torch') || n.includes('saw'))
      return 'melee-other';

    return 'ranged-other';
  }

  return 'generic';
}

// ─── Visual description generator ───

function describeVisually(w: Weapon, cat: ItemCategory): string {
  const n = w.name;

  // Per-category visual template, enriched with item-specific details
  const templates: Record<ItemCategory, string> = {
    'melee-blade': `a sleek cyberpunk combat blade called "${n}", sharp high-tech edge with carbon-fiber grip and faint neon accents along the spine, battle-worn finish`,
    'melee-blunt': `a brutal cyberpunk impact weapon called "${n}", heavy industrial construction with reinforced striking head, wrapped grip, scratched chrome and battle damage`,
    'melee-fist': `a pair of cyberpunk close-combat knuckle weapons called "${n}", armored plating over the knuckles with micro-servos, worn metallic finish with impact marks`,
    'melee-other': `a menacing cyberpunk melee weapon called "${n}", improvised street-tech construction mixing salvaged metal, chrome plating, and rust patina`,
    'ranged-pistol': `a futuristic cyberpunk handgun called "${n}", compact angular frame with glowing barrel heat vents, textured polymer grip, and integrated targeting laser`,
    'ranged-smg': `a compact cyberpunk submachine gun called "${n}", folding stock, extended polymer magazine, integrated tactical rail with holographic sight`,
    'ranged-rifle': `a military-grade cyberpunk assault rifle called "${n}", angular bullpup design with digital scope, foregrip, and matte black polymer body with worn edges`,
    'ranged-shotgun': `a brutal cyberpunk combat shotgun called "${n}", short barrel with heat dispersal fins, drum magazine, aggressive tactical finish with orange warning stripes`,
    'ranged-sniper': `a precision cyberpunk sniper rifle called "${n}", long carbon-fiber barrel with glowing advanced optics, folding bipod, and integrated suppressor`,
    'ranged-heavy': `a devastating cyberpunk heavy weapon called "${n}", massive barrel assembly with ammo feed system, heat-sink cooling vanes, and reinforced shoulder brace`,
    'ranged-other': `a customized cyberpunk ranged weapon called "${n}", unique street-modified design with jury-rigged attachments and aftermarket modifications`,
    'grenade': `a futuristic cyberpunk grenade called "${n}", compact cylindrical casing with digital detonation timer display, safety pin, and textured grip band`,
    'explosive': `a cyberpunk tactical explosive device called "${n}", rugged military-spec casing with hazard markings, blinking status LED, and electronic trigger mechanism`,
    'cybergear-arm': `a cybernetic arm implant called "${n}", exposed chrome servos and carbon-fiber tendons, articulated joints with subtle blue LED status indicators`,
    'cybergear-eye': `a cybernetic optic implant called "${n}", polished chrome sphere with glowing iris ring, micro-etched circuitry patterns on the housing`,
    'cybergear-neural': `a cybernetic neural processor called "${n}", sleek titanium chip-module with micro-connectors and faintly pulsing blue data-flow traces`,
    'cybergear-body': `a cybernetic body implant called "${n}", sub-dermal plating with visible micro-circuitry, biometric sensor nodes, and brushed titanium finish`,
    'cybergear-other': `a cybernetic augmentation module called "${n}", chrome and matte-black casing with glowing status LEDs, precision-machined mounting points`,
    'armor': `a piece of cyberpunk tactical armor called "${n}", layered composite plates with chamfered edges, ballistic weave panels, and modular attachment rails`,
    'drug': `a cyberpunk combat drug called "${n}", glowing liquid inside a sleek auto-injector vial, neon color through translucent casing, dosage markings and biohazard micro-label`,
    'medical': `a cyberpunk field medical instrument called "${n}", compact chrome device with sterile surfaces, biometric readout display, and emergency indicator lights`,
    'tech-tool': `a cyberpunk tech instrument called "${n}", precision multi-tool with micro-components, diagnostic display, and rugged shock-resistant housing`,
    'hacking': `a cyberpunk neural hacking deck called "${n}", compact black module with data-jack ports, holographic display strip, and encryption-chip slots glowing cyan`,
    'vehicle': `a futuristic cyberpunk vehicle component or ride called "${n}", angular industrial design with neon underglow accents, exposed mechanical parts, street-modified`,
    'ammo': `a box of futuristic cyberpunk ammunition called "${n}", high-tech cartridges in a sleek magazine or ammo case, glowing tips, military-grade packaging with caliber markings`,
    'badge-token': `a cyberpunk authority token called "${n}", holographic data-chip embedded in scratched chrome casing, encrypted data strip with glowing verification indicator`,
    'clothing': `a cyberpunk tactical garment called "${n}", armored street-tech fabric with woven circuitry lines, matte ballistic panels, and subtle neon piping at the seams`,
    'generic': `a cyberpunk street-tech item called "${n}", utilitarian design with brushed chrome and dark polymer, function-first engineering with subtle status indicators`,
  };

  return templates[cat] || templates['generic'];
}

// ─── Prompt builder ───

function buildPrompt(w: Weapon, cat: ItemCategory): string {
  const visualDesc = describeVisually(w, cat);

  const composition = 'isolated on a dark matte surface, single centered object, no hands no humans no text';

  // Category-specific lighting mood
  let lighting: string;
  if (cat.startsWith('cybergear')) {
    lighting = 'dramatic rim lighting with cool cyan and warm amber accents, clinical precision, subtle reflections on chrome';
  } else if (cat === 'drug') {
    lighting = 'moody neon backlighting casting purple and green reflections through translucent liquid, atmospheric haze';
  } else if (cat === 'medical') {
    lighting = 'clean clinical top lighting with cool blue tones, sterile precision, soft shadows';
  } else if (cat.startsWith('melee')) {
    lighting = 'hard directional side lighting with warm amber edge highlights, dramatic shadows revealing scratched metal texture';
  } else if (cat.startsWith('ranged')) {
    lighting = 'cinematic three-point lighting with subtle red accent from barrel glow, matte-finish reflections';
  } else if (cat === 'grenade' || cat === 'explosive') {
    lighting = 'dramatic low-angle lighting with orange hazard glow, deep ominous shadows';
  } else if (cat === 'armor' || cat === 'clothing') {
    lighting = 'studio fashion lighting with sharp edge highlights revealing material textures, dark vignette';
  } else if (cat === 'ammo') {
    lighting = 'macro product photography lighting, sharp detail on cartridge tips, subtle warm metallic reflections';
  } else {
    lighting = 'cinematic product lighting with subtle colored reflections, dark studio backdrop with depth';
  }

  return `Product hero shot of ${visualDesc}, ${composition}, ${lighting}, ultra-high detail, premium advertising photography, in the style of Cyberpunk 2077 weapon iconography`;
}

// ─── Main ───

function main() {
  const weapons = parseWeapons();
  const missing = weapons.filter(w =>
    !w.imageUrl || w.imageUrl.includes('default.png')
  );

  console.log(`Total weapons: ${weapons.length}`);
  console.log(`Missing images: ${missing.length}\n`);

  // CSV header
  const rows: string[] = ['Name,Weapon,Gear,Description,Suggested Prompt'];

  for (const w of missing) {
    const cat = classify(w);
    const prompt = buildPrompt(w, cat);

    const escapeCsv = (s: string) => `"${s.replace(/"/g, '""').replace(/\n/g, ' ')}"`;

    rows.push([
      escapeCsv(w.name),
      w.isWeapon ? 'Yes' : 'No',
      w.isGear ? 'Yes' : 'No',
      escapeCsv(w.description),
      escapeCsv(prompt),
    ].join(','));

    console.log(`  [${cat.padEnd(16)}] ${w.name}`);
  }

  fs.writeFileSync(OUTPUT_PATH, rows.join('\n'), 'utf-8');
  console.log(`\nWritten to: ${OUTPUT_PATH}`);
}

main();
