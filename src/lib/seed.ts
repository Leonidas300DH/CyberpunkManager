import { v4 as uuidv4 } from 'uuid';
import { Faction, ModelLineage, ModelProfile, ItemCard, GameAction, HackingProgram, ProgramQuality, ProgramRange, ReloadCondition, Weapon } from '@/types';
import { useStore } from '@/store/useStore';
import Papa from 'papaparse';
import { HACKING_PROGRAMS_CSV } from '@/data/programs_csv';

// ============================================================
// OFFICIAL FACTIONS — fixed IDs for stable FK references
// ============================================================
export const FACTIONS: Faction[] = [
    {
        id: 'faction-arasaka',
        name: 'Arasaka',
        description: 'Corporate agents equipped with the pinnacle of modern military hardware.',
        imageUrl: '/images/factions/arasaka.png',
    },
    {
        id: 'faction-bozos',
        name: 'Bozos',
        description: 'Sadistic biosculpted clowns exploiting childhood fears with brutal violence.',
        imageUrl: '/images/factions/bozos.png',
    },
    {
        id: 'faction-danger-gals',
        name: 'Danger Gals',
        description: 'Elite private investigation and security neo-corp operatives.',
        imageUrl: '/images/factions/danger-gals.png',
    },
    {
        id: 'faction-edgerunners',
        name: 'Edgerunners',
        description: 'Skilled mercenaries and guns-for-hire working for the highest bidder.',
        imageUrl: '/images/factions/edgerunners.png',
    },
    {
        id: 'faction-gen-red',
        name: 'Generation Red',
        description: 'A gaggle of tech-savvy orphans and runaways: scrappy, stabby, and born into tech.',
        imageUrl: '/images/factions/gen-red.png',
    },
    {
        id: 'faction-lawmen',
        name: 'Lawmen',
        description: 'Well-trained, well-equipped, and well-led enforcers battling to maintain order.',
        imageUrl: '/images/factions/lawmen.png',
    },
    {
        id: 'faction-maelstrom',
        name: 'Maelstrom',
        description: 'Heavily modified, hulking fighters focused on cyberwear and brutal melee combat.',
        imageUrl: '/images/factions/maelstrom.png',
    },
    {
        id: 'faction-trauma-team',
        name: 'Trauma Team',
        description: 'A hyper-elite, heavily armed private emergency response unit that deploys instantly to extract and save premium clients, no matter the level of violence on site.',
        imageUrl: '/images/factions/trauma-team.png',
    },
    {
        id: 'faction-tyger-claws',
        name: 'Tyger Claws',
        description: 'Fast and agile fighters relying on speed, guile, and sharp blades.',
        imageUrl: '/images/factions/tyger-claws.png',
    },
    {
        id: 'faction-zoners',
        name: 'Zoners',
        description: 'Warlords and survivalists making a living off illicit trade, salvage, and grit.',
        imageUrl: '/images/factions/zoners.png',
    },
];

// Helper: resolve faction name → id (for CSV parsing)
// "All" → undefined (wildcard), "Generation Red" / "Gen Red" → faction-gen-red
export function resolveFactionId(name: string): string | undefined {
    if (name === 'All' || !name) return undefined;
    const normalized = name === 'Gen Red' ? 'Generation Red' : name;
    return FACTIONS.find(f => f.name === normalized)?.id;
}

// ============================================================
// PARSE PROGRAMS CSV
// ============================================================
interface ProgramCSVRow {
    Name: string;
    Faction: string;
    CostEB: string;
    ReqCred: string;
    Rarity: string;
    ImageURL: string;
    Quality: string;
    Range: string;
    TechTest: string;
    LoadedText: string;
    Vulnerable: string;
    RunningEffect: string;
    ReloadCondition: string;
}

const parsePrograms = (): HackingProgram[] => {
    const results = Papa.parse<ProgramCSVRow>(HACKING_PROGRAMS_CSV, {
        header: true,
        skipEmptyLines: true,
    });

    return results.data.map((row) => {
        // Handle LoadedText splitting (Flavor | Effect)
        const parts = row.LoadedText.split('|').map(s => s.trim());
        const flavorText = parts.length > 1 ? parts[0] : '';
        const loadedText = parts.length > 1 ? parts.slice(1).join(' | ') : parts[0];

        return {
            id: `program-${row.Name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
            name: row.Name,
            factionId: resolveFactionId(row.Faction) || 'all',
            costEB: parseInt(row.CostEB) || 0,
            reqStreetCred: parseInt(row.ReqCred) || 0,
            rarity: parseInt(row.Rarity) || 1,
            imageUrl: `/images/Netrunning Programs Illustrations/${row.ImageURL}`,
            quality: (row.Quality as ProgramQuality) || 'Red',
            range: (row.Range as ProgramRange) || 'Red',
            techTest: row.TechTest.toUpperCase() === 'TRUE',
            flavorText,
            loadedText,
            vulnerable: row.Vulnerable.toUpperCase() === 'TRUE',
            runningEffect: row.RunningEffect,
            reloadCondition: (row.ReloadCondition as ReloadCondition) || 'Inspire',
        };
    });
};

export const HACKING_PROGRAMS = parsePrograms();

// ============================================================
// LINEAGES, PROFILES, ITEMS
// ============================================================

// --- Actions ---
const actionKatana: GameAction = {
    id: 'action-katana',
    name: 'Mono-Katana',
    skillReq: 'Melee',
    range: 'Red',
    isAttack: true,
    keywords: ['Deadly', 'Armor Piercing'],
    effectDescription: 'Deal critical damage on Yellow result.',
};


const actionClaws: GameAction = {
    id: 'action-cybernetic-claws',
    name: 'Cybernetic Claws',
    skillReq: 'Melee',
    range: 'Red',
    isAttack: true,
    keywords: [],
    effectDescription: '+1 to Melee when attacking, -1 to Melee when defending.',
};

const actionBat: GameAction = {
    id: 'action-spiked-bat',
    name: 'Spiked Baseball Bat',
    skillReq: 'Melee',
    range: 'Red',
    isAttack: true,
    keywords: ['Deadly Crits'],
    effectDescription: '[RE]actions made using this attack gain Accurate.',
};

// --- Lineages ---
export const LINEAGES: ModelLineage[] = [
    // Tyger Claws
    { id: 'lineage-oyabun', name: 'Oyabun', factionId: 'faction-tyger-claws', type: 'Leader', isMerc: false, imageUrl: '/images/characters/86 Oyabun.png' },
    // Edgerunners
    { id: 'lineage-hyena', name: 'Hyena', factionId: 'faction-edgerunners', type: 'Character', isMerc: false, imageUrl: '/images/characters/01 Hyena.png' },
    { id: 'lineage-morgan', name: 'Morgan', factionId: 'faction-edgerunners', type: 'Leader', isMerc: false, imageUrl: '/images/characters/04 Morgan.png' },
    { id: 'lineage-mike-feature', name: 'Mike Feature', factionId: 'faction-edgerunners', type: 'Character', isMerc: false, imageUrl: '/images/characters/56 Mike "Feature".png' },
    { id: 'lineage-black-site-agent', name: 'Black Site Agent', factionId: 'faction-edgerunners', type: 'Gonk', isMerc: false, imageUrl: '/images/characters/09 Blacksite Agent.png' },
    { id: 'lineage-black-site-agent-2', name: 'Black Site Agent', factionId: 'faction-edgerunners', type: 'Gonk', isMerc: false, imageUrl: '/images/characters/10 Blacksite Agent.png' },
    { id: 'lineage-tacteam-officer', name: 'Tacteam Officer', factionId: 'faction-lawmen', type: 'Gonk', isMerc: false, imageUrl: '/images/characters/06 Tacteam Officer.png' },
    { id: 'lineage-tacteam-officer-2', name: 'Tacteam Officer', factionId: 'faction-lawmen', type: 'Gonk', isMerc: false, imageUrl: '/images/characters/07 Tacteam Officer.png' },
    { id: 'lineage-jackie', name: 'Jackie', factionId: 'faction-edgerunners', type: 'Character', isMerc: false, imageUrl: '/images/characters/38 Jack Welles.png' },
    { id: 'lineage-panam', name: 'Panam', factionId: 'faction-edgerunners', type: 'Character', isMerc: false, imageUrl: '/images/characters/45 Panam.png' },
    { id: 'lineage-judy', name: 'Judy', factionId: 'faction-edgerunners', type: 'Character', isMerc: false, imageUrl: '/images/characters/46 Judy Alvarez.png' },
    { id: 'lineage-johnny', name: 'Johnny', factionId: 'faction-edgerunners', type: 'Character', isMerc: false, imageUrl: '/images/characters/48 Johnny Silverhand.png' },
    { id: 'lineage-k-9', name: 'K-9', factionId: 'faction-lawmen', type: 'Character', isMerc: false, imageUrl: '/images/characters/59 K9.png' },
    { id: 'lineage-k-9-handler', name: 'K-9 Handler', factionId: 'faction-lawmen', type: 'Character', isMerc: false, imageUrl: '/images/characters/60 K-9 Handler.png' },
    { id: 'lineage-maximum-mike', name: 'Maximum Mike', factionId: 'faction-lawmen', type: 'Leader', isMerc: false, imageUrl: '/images/characters/61 Maximum Mike.png' },
    { id: 'lineage-police-sniper', name: 'Police Sniper', factionId: 'faction-lawmen', type: 'Character', isMerc: false, imageUrl: '/images/characters/62 Police Sniper.png' },
    { id: 'lineage-riot-duty-rookie', name: 'Riot Duty Rookie', factionId: 'faction-lawmen', type: 'Gonk', isMerc: false, imageUrl: '/images/characters/63 Riot Duty Rookie.png' },
    { id: 'lineage-rookie', name: 'Rookie', factionId: 'faction-lawmen', type: 'Gonk', isMerc: false, imageUrl: '/images/characters/64 Rookie.png' },
    { id: 'lineage-sarge', name: 'Sarge', factionId: 'faction-lawmen', type: 'Character', isMerc: false, imageUrl: '/images/characters/65 Sarge.png' },
    { id: 'lineage-tactical-response', name: 'Tactical Response', factionId: 'faction-lawmen', type: 'Character', isMerc: false, imageUrl: '/images/characters/66 Tactical Response.png' },
    { id: 'lineage-trooper', name: 'Trooper', factionId: 'faction-lawmen', type: 'Character', isMerc: false, imageUrl: '/images/characters/67 Trooper.png' },
    { id: 'lineage-alpha', name: 'Alpha', factionId: 'faction-zoners', type: 'Character', isMerc: false, imageUrl: '/images/characters/68 Alpha.png' },
    { id: 'lineage-blaze', name: 'Blaze', factionId: 'faction-zoners', type: 'Character', isMerc: false, imageUrl: '/images/characters/69 Blaze.png' },
    { id: 'lineage-forty-mike-mike', name: 'Forty Mike Mike', factionId: 'faction-zoners', type: 'Character', isMerc: false, imageUrl: '/images/characters/70 Forty Mike Mike.png' },
    { id: 'lineage-nemo', name: 'Nemo', factionId: 'faction-zoners', type: 'Character', isMerc: false, imageUrl: '/images/characters/71 Nemo.png' },
    { id: 'lineage-operator', name: 'Operator', factionId: 'faction-zoners', type: 'Character', isMerc: false, imageUrl: '/images/characters/72 Operator.png' },
    { id: 'lineage-over-under-mr-studd', name: 'Over-Under : Mr. Studd', factionId: 'faction-zoners', type: 'Character', isMerc: false, imageUrl: '/images/characters/73 Over-Under Mr Studd.png' },
    { id: 'lineage-scrub', name: 'Scrub', factionId: 'faction-zoners', type: 'Gonk', isMerc: false, imageUrl: '/images/characters/74 Scrub.png' },
    { id: 'lineage-street-king', name: 'Street King', factionId: 'faction-zoners', type: 'Leader', isMerc: false, imageUrl: '/images/characters/75 Street King.png' },
    { id: 'lineage-wrecker', name: 'Wrecker', factionId: 'faction-zoners', type: 'Gonk', isMerc: false, imageUrl: '/images/characters/76 Wrecker.png' },
    { id: 'lineage-warlord', name: 'Warlord', factionId: 'faction-maelstrom', type: 'Leader', isMerc: false, imageUrl: '/images/characters/77 Warlord.png' },
    { id: 'lineage-hammerlord', name: 'Hammerlord', factionId: 'faction-maelstrom', type: 'Leader', isMerc: false, imageUrl: '/images/characters/78 Hammerlord.png' },
    { id: 'lineage-flenser', name: 'Flenser', factionId: 'faction-maelstrom', type: 'Character', isMerc: false, imageUrl: '/images/characters/79 Flenser.png' },
    { id: 'lineage-crusher', name: 'Crusher', factionId: 'faction-maelstrom', type: 'Character', isMerc: false, imageUrl: '/images/characters/80 Crusher.png' },
    { id: 'lineage-munition-specialist', name: 'Munition Specialist', factionId: 'faction-maelstrom', type: 'Character', isMerc: false, imageUrl: '/images/characters/81 Munitions Specialist.png' },
    { id: 'lineage-ranged-specialist', name: 'Ranged Specialist', factionId: 'faction-maelstrom', type: 'Character', isMerc: false, imageUrl: '/images/characters/82 Ranged Specialist.png' },
    { id: 'lineage-berserker', name: 'Berserker', factionId: 'faction-maelstrom', type: 'Character', isMerc: false, imageUrl: '/images/characters/83 Berserker.png' },
    { id: 'lineage-ripper', name: 'Ripper', factionId: 'faction-maelstrom', type: 'Character', isMerc: false, imageUrl: '/images/characters/84 Ripper.png' },
    { id: 'lineage-pledge', name: 'Pledge', factionId: 'faction-maelstrom', type: 'Gonk', isMerc: false, imageUrl: '/images/characters/85 Pledge.png' },
    { id: 'lineage-wakagashira', name: 'Wakagashira', factionId: 'faction-tyger-claws', type: 'Character', isMerc: false, imageUrl: '/images/characters/87 Wakagashira.png' },
    { id: 'lineage-hr-rep', name: 'HR Rep', factionId: 'faction-tyger-claws', type: 'Character', isMerc: false, imageUrl: '/images/characters/88 HR Rep.png' },
    { id: 'lineage-ronin-assassin', name: 'Ronin Assassin', factionId: 'faction-tyger-claws', type: 'Character', isMerc: false, imageUrl: '/images/characters/89 Ronin Assassin.png' },
    { id: 'lineage-ronin-sniper', name: 'Ronin Sniper', factionId: 'faction-tyger-claws', type: 'Character', isMerc: false, imageUrl: '/images/characters/90 Ronin Sniper.png' },
    { id: 'lineage-kyodai', name: 'Kyodai', factionId: 'faction-tyger-claws', type: 'Character', isMerc: false, imageUrl: '/images/characters/91 Kyodai.png' },
    { id: 'lineage-onee-san', name: 'Onee-San', factionId: 'faction-tyger-claws', type: 'Character', isMerc: false, imageUrl: '/images/characters/92 Onee-San.png' },
    { id: 'lineage-shatei', name: 'Shatei', factionId: 'faction-tyger-claws', type: 'Gonk', isMerc: false, imageUrl: '/images/characters/93 Shatei.png' },
    { id: 'lineage-cipher', name: 'Cipher', factionId: 'faction-edgerunners', type: 'Character', isMerc: false, imageUrl: '/images/characters/94 Tech.png' },
    { id: 'lineage-cygnus', name: 'Cygnus', factionId: 'faction-edgerunners', type: 'Character', isMerc: false, imageUrl: '/images/characters/95 Nomad.png' },
    { id: 'lineage-velocity', name: 'Velocity', factionId: 'faction-edgerunners', type: 'Character', isMerc: false, imageUrl: '/images/characters/96 Solo Bodyguard.png' },
    { id: 'lineage-chrome', name: 'Chrome', factionId: 'faction-edgerunners', type: 'Character', isMerc: false, imageUrl: '/images/characters/97 Solo Stalker.png' },
    { id: 'lineage-synapse', name: 'Synapse', factionId: 'faction-edgerunners', type: 'Character', isMerc: false, imageUrl: '/images/characters/98 Netrunner.png' },
    { id: 'lineage-sarah-wallace', name: 'Sarah Wallace', factionId: 'faction-edgerunners', type: 'Character', isMerc: false, imageUrl: '/images/characters/99 Media.png' },
    { id: 'lineage-fury', name: 'Fury', factionId: 'faction-edgerunners', type: 'Character', isMerc: false, imageUrl: '/images/characters/100 Powermetal Rockerboy.png' },
    { id: 'lineage-eclipse', name: 'Eclipse', factionId: 'faction-edgerunners', type: 'Character', isMerc: false, imageUrl: '/images/characters/101 Electronica Rockerboy.png' },
    { id: 'lineage-scarlett-lokken', name: 'Scarlett Lokken', factionId: 'faction-edgerunners', type: 'Character', isMerc: false, imageUrl: '/images/characters/102 Exec CEO.png' },
    { id: 'lineage-michiko-arasaka', name: 'Michiko Arasaka', factionId: 'faction-danger-gals', type: 'Leader', isMerc: false, imageUrl: '/images/characters/103 Michiko Arasaka.png' },
    { id: 'lineage-mouse', name: 'Mouse', factionId: 'faction-danger-gals', type: 'Character', isMerc: false, imageUrl: '/images/characters/104 Mouse.png' },
    { id: 'lineage-tigress', name: 'Tigress', factionId: 'faction-danger-gals', type: 'Character', isMerc: false, imageUrl: '/images/characters/105 Tigress.png' },
    { id: 'lineage-doc-mittens', name: 'Doc Mittens', factionId: 'faction-danger-gals', type: 'Character', isMerc: false, imageUrl: '/images/characters/106 Doc Mittens.png' },
    { id: 'lineage-pantera', name: 'Pantera', factionId: 'faction-danger-gals', type: 'Character', isMerc: false, imageUrl: '/images/characters/107 Panthera.png' },
    { id: 'lineage-lynx', name: 'Lynx', factionId: 'faction-danger-gals', type: 'Character', isMerc: false, imageUrl: '/images/characters/108 Lynx.png' },
    { id: 'lineage-teammate', name: 'Teammate', factionId: 'faction-danger-gals', type: 'Gonk', isMerc: false, imageUrl: '/images/characters/109 Teammate.png' },
    { id: 'lineage-prankster', name: 'Prankster', factionId: 'faction-bozos', type: 'Character', isMerc: false, imageUrl: '/images/characters/110 Prankster.png' },
    { id: 'lineage-centwit', name: 'Centwit', factionId: 'faction-bozos', type: 'Character', isMerc: false, imageUrl: '/images/characters/111 Cenwit.png' },
    { id: 'lineage-tomfool', name: 'Tomfool', factionId: 'faction-bozos', type: 'Character', isMerc: false, imageUrl: '/images/characters/112 Tomfool.png' },
];

// --- Profiles ---
const oyabunBase: ModelProfile = {
    id: 'profile-oyabun-0',
    lineageId: 'lineage-oyabun',
    level: 0,
    costEB: 35,
    actionTokens: { green: 1, yellow: 1, red: 0 },
    skills: { Reflexes: 1, Ranged: 0, Melee: 2, Medical: 0, Tech: 0, Influence: 3, None: 0 },
    armor: 1,
    keywords: ['Leader'],
    actions: [actionKatana],
    passiveRules: 'May reroll one Melee die per turn.',
};

export const PROFILES: ModelProfile[] = [
    oyabunBase,
    { id: 'profile-hyena-0', lineageId: 'lineage-hyena', level: 0, costEB: 15, actionTokens: { green: 1, yellow: 1, red: 0 }, skills: { Reflexes: 1, Ranged: 0, Melee: 2, Medical: 0, Tech: 0, Influence: 1, None: 0 }, armor: 0, keywords: ['Edgerunner'], actions: [actionClaws], passiveRules: 'Scary: Gonks must roll against the Environment Dice to do a Melee or Ranged attack against this model.' },
    { id: 'profile-morgan-0', lineageId: 'lineage-morgan', level: 0, costEB: 20, actionTokens: { green: 2, yellow: 0, red: 0 }, skills: { Reflexes: 1, Ranged: 0, Melee: 2, Medical: 0, Tech: 0, Influence: 3, None: 0 }, armor: 0, keywords: ['Leader'], actions: [actionBat], passiveRules: 'Connected: When you activate this model, you may refresh an action on a visible, friendly character.' },
    { id: 'profile-mike-feature-0', lineageId: 'lineage-mike-feature', level: 0, costEB: 20, actionTokens: { green: 2, yellow: 1, red: 0 }, skills: { Reflexes: 2, Ranged: 2, Melee: 0, Medical: 0, Tech: 2, Influence: 0, None: 0 }, armor: 0, keywords: ['Tech'], actions: [{ id: 'action-assault-rifle', name: 'Assault Rifle', skillReq: 'Ranged', range: 'Long', isAttack: true, keywords: ['Rapid 2'], effectDescription: 'Rapid 2 if not at max range.' }], passiveRules: '' },
    { id: 'profile-black-site-agent-0', lineageId: 'lineage-black-site-agent', level: 0, costEB: 15, actionTokens: { green: 1, yellow: 1, red: 0 }, skills: { Reflexes: 2, Ranged: 2, Melee: 1, Medical: 0, Tech: 0, Influence: 0, None: 0 }, armor: 1, keywords: ['Gonk'], actions: [{ id: 'action-smg', name: 'SMG', skillReq: 'Ranged', range: 'Yellow', isAttack: true, keywords: ['Suppression'], effectDescription: 'Suppression.' }], passiveRules: 'Efficient: After this models activation, activate another Arasaka within RED, if this model has taken out a rival during its activation.', gonkActionColor: 'Green' },
    { id: 'profile-black-site-agent-2-0', lineageId: 'lineage-black-site-agent-2', level: 0, costEB: 15, actionTokens: { green: 0, yellow: 2, red: 0 }, skills: { Reflexes: 0, Ranged: 2, Melee: 1, Medical: 0, Tech: 0, Influence: 2, None: 0 }, armor: 1, keywords: ['Gonk'], actions: [{ id: 'action-assault-rifle', name: 'Assault Rifle', skillReq: 'Ranged', range: 'Long', isAttack: true, keywords: ['Rapid 2'], effectDescription: 'Rapid 2 if not at max range.' }], passiveRules: 'Efficient: After this models activation, activate another Arasaka within RED, if this model has taken out a rival during its activation.', gonkActionColor: 'Yellow' },
    { id: 'profile-tacteam-officer-0', lineageId: 'lineage-tacteam-officer', level: 0, costEB: 15, actionTokens: { green: 1, yellow: 1, red: 0 }, skills: { Reflexes: 1, Ranged: 2, Melee: 0, Medical: 0, Tech: 0, Influence: 2, None: 0 }, armor: 1, keywords: ['Gonk'], actions: [{ id: 'action-assault-carbine', name: 'Assault Carbine', skillReq: 'Ranged', range: 'Green', isAttack: true, keywords: ['Suppression'], effectDescription: 'Suppression.' }], passiveRules: 'Precise: When making a Ranged Attack at a target in YELLOW, gains Accurate.', gonkActionColor: 'Green' },
    { id: 'profile-tacteam-officer-2-0', lineageId: 'lineage-tacteam-officer-2', level: 0, costEB: 15, actionTokens: { green: 1, yellow: 2, red: 0 }, skills: { Reflexes: 1, Ranged: 0, Melee: 2, Medical: 0, Tech: 0, Influence: 2, None: 0 }, armor: 1, keywords: ['Gonk'], actions: [{ id: 'action-heavy-pistol', name: 'Heavy Pistol', skillReq: 'Ranged', range: 'Yellow', isAttack: true, keywords: ['Deadly Crits'], effectDescription: 'Deadly Crits.' }], passiveRules: 'Precise: When making a Ranged Attack at a target in YELLOW, gains Accurate.', gonkActionColor: 'Green' },
    { id: 'profile-jackie-0', lineageId: 'lineage-jackie', level: 0, costEB: 20, actionTokens: { green: 1, yellow: 2, red: 0 }, skills: { Reflexes: 2, Ranged: 2, Melee: 2, Medical: 0, Tech: 0, Influence: 0, None: 0 }, armor: 1, keywords: ['Edgerunner'], actions: [{ id: 'action-dual-pistols', name: 'Dual Pistols', skillReq: 'Ranged', range: 'Yellow', isAttack: true, keywords: ['Accurate'], effectDescription: 'Accurate.' }], passiveRules: 'Bulletproof & Loyal: This model may spend a Luck token to negate a wound. When a visible friendly Leader is wounded, this model may [RE]act.' },
    { id: 'profile-panam-0', lineageId: 'lineage-panam', level: 0, costEB: 20, actionTokens: { green: 0, yellow: 3, red: 0 }, skills: { Reflexes: 2, Ranged: 2, Melee: 0, Medical: 0, Tech: 2, Influence: 0, None: 0 }, armor: 0, keywords: ['Nomad'], actions: [{ id: 'action-sniper-rifle', name: 'Sniper Rifle', skillReq: 'Ranged', range: 'Long', isAttack: true, keywords: ['Deadly Crits', 'Bulky'], effectDescription: 'Deadly Crits, Bulky.' }], passiveRules: 'Sniper\'s Nest: If this model did not move during its activation, its ranged attacks gain Accurate and Deadly.' },
    { id: 'profile-judy-0', lineageId: 'lineage-judy', level: 0, costEB: 15, actionTokens: { green: 1, yellow: 2, red: 0 }, skills: { Reflexes: 1, Ranged: 0, Melee: 0, Medical: 0, Tech: 2, Influence: 2, None: 0 }, armor: 0, keywords: ['Netrunner'], actions: [{ id: 'action-net-deck', name: 'Net Deck', skillReq: 'Tech', range: 'Self', isAttack: false, keywords: [], effectDescription: 'May equip programs.' }], passiveRules: 'Braindance & Cripple: On successful Tech test, a visible rival within YELLOW exchanges 1 GREEN for 1 YELLOW Action Token.' },
    { id: 'profile-johnny-0', lineageId: 'lineage-johnny', level: 0, costEB: 20, actionTokens: { green: 2, yellow: 1, red: 0 }, skills: { Reflexes: 2, Ranged: 0, Melee: 2, Medical: 0, Tech: 0, Influence: 3, None: 0 }, armor: 0, keywords: ['Rockerboy'], actions: [{ id: 'action-malorian-arms-3516', name: 'Malorian Arms 3516', skillReq: 'Ranged', range: 'Green', isAttack: true, keywords: ['Deadly Crits'], effectDescription: 'Deadly Crits. +1 to Ranged when attacking.' }], passiveRules: 'Never Fade Away: When this model would be taken out, roll against Environment Dice. On success, stay with 1 wound remaining.' },
    { id: 'profile-k-9-0', lineageId: 'lineage-k-9', level: 0, costEB: 0, actionTokens: { green: 0, yellow: 1, red: 0 }, skills: { Reflexes: 2, Ranged: 0, Melee: 2, Medical: 0, Tech: 0, Influence: 0, None: 0 }, armor: 0, keywords: ['Animal'], actions: [], passiveRules: 'Pack Hunter: This model gains +1 Melee while within RED of the K-9 Handler.' },
    { id: 'profile-k-9-handler-0', lineageId: 'lineage-k-9-handler', level: 0, costEB: 15, actionTokens: { green: 1, yellow: 1, red: 0 }, skills: { Reflexes: 1, Ranged: 1, Melee: 1, Medical: 0, Tech: 0, Influence: 0, None: 0 }, armor: 1, keywords: ['Lawman'], actions: [{ id: 'action-assault-carbine', name: 'Assault Carbine', skillReq: 'Ranged', range: 'Green', isAttack: true, keywords: ['Suppression'], effectDescription: 'Suppression.' }], passiveRules: 'K9 Handler: When this model is Active, a visible, friendly K9 may also take actions as if it was active.' },
    { id: 'profile-maximum-mike-0', lineageId: 'lineage-maximum-mike', level: 0, costEB: 15, actionTokens: { green: 2, yellow: 1, red: 0 }, skills: { Reflexes: 2, Ranged: 2, Melee: 0, Medical: 0, Tech: 0, Influence: 2, None: 0 }, armor: 0, keywords: ['Leader'], actions: [], passiveRules: 'Singular Focus & Pull Ranks: When refreshed, choose a visible rival. Until refreshed, friendly models ranged attacks vs. him are ACCURATE. Activate another Lawman within GREEN with successful Influence Roll.' },
    { id: 'profile-police-sniper-0', lineageId: 'lineage-police-sniper', level: 0, costEB: 20, actionTokens: { green: 0, yellow: 2, red: 0 }, skills: { Reflexes: 1, Ranged: 2, Melee: 0, Medical: 0, Tech: 1, Influence: 0, None: 0 }, armor: 0, keywords: ['Lawman'], actions: [{ id: 'action-sniper-rifle', name: 'Sniper Rifle', skillReq: 'Ranged', range: 'Long', isAttack: true, keywords: ['Deadly Crits', 'Bulky'], effectDescription: 'Deadly Crits, Bulky.' }], passiveRules: 'Steady: If the first action of this model\'s activation is a ranged attack, it gains Accurate and Deadly.' },
    { id: 'profile-riot-duty-rookie-0', lineageId: 'lineage-riot-duty-rookie', level: 0, costEB: 5, actionTokens: { green: 0, yellow: 1, red: 0 }, skills: { Reflexes: 1, Ranged: 0, Melee: 1, Medical: 0, Tech: 0, Influence: 0, None: 0 }, armor: 0, keywords: ['Gonk'], actions: [], passiveRules: 'Stun Baton & Riot Shield: Can move and attack during the same action.', gonkActionColor: 'Yellow' },
    { id: 'profile-rookie-0', lineageId: 'lineage-rookie', level: 0, costEB: 5, actionTokens: { green: 0, yellow: 1, red: 0 }, skills: { Reflexes: 1, Ranged: 0, Melee: 1, Medical: 0, Tech: 0, Influence: 0, None: 0 }, armor: 0, keywords: ['Gonk'], actions: [], passiveRules: '', gonkActionColor: 'Yellow' },
    { id: 'profile-sarge-0', lineageId: 'lineage-sarge', level: 0, costEB: 20, actionTokens: { green: 1, yellow: 1, red: 0 }, skills: { Reflexes: 0, Ranged: 2, Melee: 1, Medical: 0, Tech: 0, Influence: 2, None: 0 }, armor: 2, keywords: ['Lawman'], actions: [{ id: 'action-assault-carbine', name: 'Assault Carbine', skillReq: 'Ranged', range: 'Green', isAttack: true, keywords: ['Suppression'], effectDescription: 'Suppression.' }], passiveRules: 'Chain of command: Any friendly Lawman within RED of this model may use its skill modifier instead of its own.' },
    { id: 'profile-tactical-response-0', lineageId: 'lineage-tactical-response', level: 0, costEB: 10, actionTokens: { green: 0, yellow: 2, red: 0 }, skills: { Reflexes: 0, Ranged: 1, Melee: 1, Medical: 1, Tech: 0, Influence: 0, None: 0 }, armor: 3, keywords: ['Lawman'], actions: [{ id: 'action-tactical-shield', name: 'Tactical Shield', skillReq: 'None', range: 'Self', isAttack: false, keywords: ['Bulky'], effectDescription: 'May not carry any bulky gear. +3 to Armor.' }], passiveRules: 'Protector: If this model is in a rival\'s path of attack, the attack must target this model instead of the initial one.' },
    { id: 'profile-trooper-0', lineageId: 'lineage-trooper', level: 0, costEB: 15, actionTokens: { green: 1, yellow: 1, red: 0 }, skills: { Reflexes: 1, Ranged: 1, Melee: 1, Medical: 0, Tech: 0, Influence: 0, None: 0 }, armor: 2, keywords: ['Lawman'], actions: [{ id: 'action-assault-carbine', name: 'Assault Carbine', skillReq: 'Ranged', range: 'Green', isAttack: true, keywords: ['Suppression'], effectDescription: 'Suppression.' }], passiveRules: '' },
    { id: 'profile-alpha-0', lineageId: 'lineage-alpha', level: 0, costEB: 20, actionTokens: { green: 2, yellow: 0, red: 0 }, skills: { Reflexes: 2, Ranged: 0, Melee: 0, Medical: 0, Tech: 2, Influence: 2, None: 0 }, armor: 0, keywords: ['Zoner'], actions: [], passiveRules: 'Canny: When starting a move action, all friendly Gonks within RED may also move the same color range.' },
    { id: 'profile-blaze-0', lineageId: 'lineage-blaze', level: 0, costEB: 15, actionTokens: { green: 1, yellow: 1, red: 0 }, skills: { Reflexes: 1, Ranged: 2, Melee: 1, Medical: 0, Tech: 0, Influence: 0, None: 0 }, armor: 0, keywords: ['Zoner'], actions: [{ id: 'action-molotov-cocktail', name: 'Molotov Cocktail', skillReq: 'Ranged', range: 'Yellow', isAttack: true, keywords: ['Blast', 'Dangerous', 'Unwieldy'], effectDescription: 'Blast, Dangerous, Unwieldy. Uses Reflex skill.' }], passiveRules: 'Instigator: When this model activates, a friendly Gonk within RED may immediately take one action.' },
    { id: 'profile-forty-mike-mike-0', lineageId: 'lineage-forty-mike-mike', level: 0, costEB: 20, actionTokens: { green: 0, yellow: 3, red: 0 }, skills: { Reflexes: 1, Ranged: 1, Melee: 0, Medical: 0, Tech: 1, Influence: 0, None: 0 }, armor: 0, keywords: ['Zoner'], actions: [{ id: 'action-grenade-launcher', name: 'Grenade Launcher', skillReq: 'Ranged', range: 'Long', isAttack: true, keywords: ['Blast', 'Indirect', 'Difficult', 'Bulky', 'Unwieldy'], effectDescription: 'Blast, Indirect, Difficult, Bulky, Unwieldy.' }], passiveRules: '' },
    { id: 'profile-nemo-0', lineageId: 'lineage-nemo', level: 0, costEB: 10, actionTokens: { green: 1, yellow: 1, red: 0 }, skills: { Reflexes: 3, Ranged: 1, Melee: 1, Medical: 0, Tech: 0, Influence: 0, None: 0 }, armor: 0, keywords: ['Zoner'], actions: [], passiveRules: 'Lockout: After you finish Nemo\'s Activation you may choose a visible friend or enemy to activate.' },
    { id: 'profile-operator-0', lineageId: 'lineage-operator', level: 0, costEB: 20, actionTokens: { green: 1, yellow: 1, red: 0 }, skills: { Reflexes: 2, Ranged: 2, Melee: 0, Medical: 0, Tech: 2, Influence: 0, None: 0 }, armor: 0, keywords: ['Zoner'], actions: [{ id: 'action-silenced-smg', name: 'Silenced SMG', skillReq: 'Ranged', range: 'Yellow', isAttack: true, keywords: ['Rapid 2', 'Silent'], effectDescription: 'Rapid 2, Silent.' }], passiveRules: 'Predator: Add 2 to Attacks rolls when targeting wounded rivals.' },
    { id: 'profile-over-under-mr-studd-0', lineageId: 'lineage-over-under-mr-studd', level: 0, costEB: 15, actionTokens: { green: 0, yellow: 2, red: 0 }, skills: { Reflexes: 1, Ranged: 2, Melee: 2, Medical: 0, Tech: 0, Influence: 0, None: 0 }, armor: 0, keywords: ['Zoner'], actions: [{ id: 'action-sawnoff-shotgun', name: 'Sawnoff Shotgun', skillReq: 'Ranged', range: 'Red', isAttack: true, keywords: ['Torrent'], effectDescription: 'Torrent.' }], passiveRules: '' },
    { id: 'profile-scrub-0', lineageId: 'lineage-scrub', level: 0, costEB: 5, actionTokens: { green: 0, yellow: 1, red: 0 }, skills: { Reflexes: 1, Ranged: 1, Melee: 1, Medical: 0, Tech: 0, Influence: 0, None: 0 }, armor: 0, keywords: ['Gonk'], actions: [], passiveRules: 'Got Your Back: Friendly characters within RED of this model gain Accurate to their basic ranged attacks.', gonkActionColor: 'Yellow' },
    { id: 'profile-street-king-0', lineageId: 'lineage-street-king', level: 0, costEB: 25, actionTokens: { green: 2, yellow: 1, red: 0 }, skills: { Reflexes: 2, Ranged: 2, Melee: 0, Medical: 0, Tech: 0, Influence: 3, None: 0 }, armor: 0, keywords: ['Leader'], actions: [{ id: 'action-dual-pistols', name: 'Dual Pistols', skillReq: 'Ranged', range: 'Yellow', isAttack: true, keywords: ['Accurate'], effectDescription: 'Accurate.' }], passiveRules: 'Mastermind: After finishing this character\'s activation, you may activate any other friendly Zoner.' },
    { id: 'profile-wrecker-0', lineageId: 'lineage-wrecker', level: 0, costEB: 5, actionTokens: { green: 0, yellow: 1, red: 0 }, skills: { Reflexes: 1, Ranged: 0, Melee: 1, Medical: 0, Tech: 0, Influence: 0, None: 0 }, armor: 0, keywords: ['Gonk'], actions: [{ id: 'action-crowbar', name: 'Crowbar', skillReq: 'Melee', range: 'Red', isAttack: true, keywords: ['Stunning Crits'], effectDescription: 'Stunning Crits.' }], passiveRules: 'Witness Me: This model gains +1 Melee while within YELLOW of another friendly character.', gonkActionColor: 'Yellow' },
    { id: 'profile-warlord-0', lineageId: 'lineage-warlord', level: 0, costEB: 15, actionTokens: { green: 1, yellow: 2, red: 0 }, skills: { Reflexes: 0, Ranged: 1, Melee: 2, Medical: 0, Tech: 0, Influence: 1, None: 0 }, armor: 1, keywords: ['Leader'], actions: [{ id: 'action-smg', name: 'SMG', skillReq: 'Ranged', range: 'Yellow', isAttack: true, keywords: ['Suppression'], effectDescription: 'Suppression.' }], passiveRules: 'Inspiring: After this model inflicts a wound in melee, refresh up to one Action Token on all other visible friendly characters.' },
    { id: 'profile-hammerlord-0', lineageId: 'lineage-hammerlord', level: 0, costEB: 15, actionTokens: { green: 1, yellow: 2, red: 0 }, skills: { Reflexes: 0, Ranged: 1, Melee: 2, Medical: 0, Tech: 0, Influence: 1, None: 0 }, armor: 1, keywords: ['Leader'], actions: [{ id: 'action-sledgehammer', name: 'Sledgehammer', skillReq: 'Melee', range: 'Red', isAttack: true, keywords: ['Deadly', 'Stun 1', 'Difficult'], effectDescription: 'Deadly, Stun 1, Difficult.' }], passiveRules: 'Inspiring: After this model inflicts a wound in melee, refresh up to one Action Token on all other visible friendly characters.' },
    { id: 'profile-flenser-0', lineageId: 'lineage-flenser', level: 0, costEB: 15, actionTokens: { green: 1, yellow: 2, red: 0 }, skills: { Reflexes: 2, Ranged: 0, Melee: 2, Medical: 0, Tech: 0, Influence: 2, None: 0 }, armor: 1, keywords: ['Maelstrom'], actions: [{ id: 'action-wolver', name: 'Wolver', skillReq: 'Melee', range: 'Red', isAttack: true, keywords: ['Deadly Crits', 'Accurate'], effectDescription: 'Deadly Crits. [RE]actions made using this attack gain Accurate.' }], passiveRules: 'Mind Link: On successful Influence test, she can activate a friendly model within GREEN (instead of RED).' },
    { id: 'profile-crusher-0', lineageId: 'lineage-crusher', level: 0, costEB: 15, actionTokens: { green: 0, yellow: 2, red: 0 }, skills: { Reflexes: 1, Ranged: 2, Melee: 2, Medical: 0, Tech: 0, Influence: 0, None: 0 }, armor: 2, keywords: ['Maelstrom'], actions: [{ id: 'action-cybernetic-weapons', name: 'Cybernetic Weapons', skillReq: 'Melee', range: 'Red', isAttack: true, keywords: ['Deadly Crits'], effectDescription: 'All of this model\'s attack gain Deadly Crits.' }], passiveRules: 'Brawler: After being hit by a successful attack, refresh all of this model\'s Action Tokens. This model ignores Unwieldy on gear.' },
    { id: 'profile-munition-specialist-0', lineageId: 'lineage-munition-specialist', level: 0, costEB: 15, actionTokens: { green: 0, yellow: 3, red: 0 }, skills: { Reflexes: 2, Ranged: 2, Melee: 0, Medical: 0, Tech: 2, Influence: 0, None: 0 }, armor: 0, keywords: ['Maelstrom'], actions: [{ id: 'action-grenade-launcher', name: 'Grenade Launcher', skillReq: 'Ranged', range: 'Long', isAttack: true, keywords: ['Blast', 'Indirect', 'Difficult', 'Bulky', 'Unwieldy'], effectDescription: 'Blast, Indirect, Difficult, Bulky, Unwieldy.' }], passiveRules: 'Grenadier: When using Blast attacks, this model may move the Impact token after succeeding, as long as the original target is still hit by the Blast.' },
    { id: 'profile-ranged-specialist-0', lineageId: 'lineage-ranged-specialist', level: 0, costEB: 15, actionTokens: { green: 0, yellow: 3, red: 0 }, skills: { Reflexes: 2, Ranged: 2, Melee: 1, Medical: 0, Tech: 0, Influence: 0, None: 0 }, armor: 0, keywords: ['Maelstrom'], actions: [{ id: 'action-assault-rifle', name: 'Assault Rifle', skillReq: 'Ranged', range: 'Long', isAttack: true, keywords: ['Rapid 2'], effectDescription: 'Rapid 2 if not at max range.' }], passiveRules: '' },
    { id: 'profile-berserker-0', lineageId: 'lineage-berserker', level: 0, costEB: 8, actionTokens: { green: 1, yellow: 2, red: 0 }, skills: { Reflexes: 2, Ranged: 0, Melee: 2, Medical: 1, Tech: 0, Influence: 0, None: 0 }, armor: 0, keywords: ['Maelstrom'], actions: [], passiveRules: 'Berserker: If the first action of this model\'s activation is a melee attack, it gains Accurate.' },
    { id: 'profile-ripper-0', lineageId: 'lineage-ripper', level: 0, costEB: 8, actionTokens: { green: 0, yellow: 2, red: 0 }, skills: { Reflexes: 0, Ranged: 1, Melee: 2, Medical: 0, Tech: 0, Influence: 1, None: 0 }, armor: 0, keywords: ['Maelstrom'], actions: [{ id: 'action-wolver', name: 'Wolver', skillReq: 'Melee', range: 'Red', isAttack: true, keywords: ['Deadly Crits', 'Accurate'], effectDescription: 'Deadly Crits. [RE]actions made using this attack gain Accurate.' }], passiveRules: 'Bravado: This model gains +1 to its melee attacks if another friendly model is visible.' },
    { id: 'profile-pledge-0', lineageId: 'lineage-pledge', level: 0, costEB: 5, actionTokens: { green: 0, yellow: 1, red: 0 }, skills: { Reflexes: 1, Ranged: 1, Melee: 1, Medical: 0, Tech: 0, Influence: 0, None: 0 }, armor: 0, keywords: ['Gonk'], actions: [], passiveRules: '', gonkActionColor: 'Yellow' },
    { id: 'profile-wakagashira-0', lineageId: 'lineage-wakagashira', level: 0, costEB: 15, actionTokens: { green: 1, yellow: 2, red: 0 }, skills: { Reflexes: 2, Ranged: 0, Melee: 1, Medical: 0, Tech: 0, Influence: 2, None: 0 }, armor: 0, keywords: ['Tyger Claw'], actions: [{ id: 'action-katana', name: 'Katana', skillReq: 'Melee', range: 'Red', isAttack: true, keywords: ['Deadly Crits', 'Accurate'], effectDescription: 'Deadly Crits. [RE]actions made using this attack gain Accurate.' }], passiveRules: 'Company Man: Whenever your opponent Inspires his Team, refresh one of this model\'s Action Tokens.' },
    { id: 'profile-hr-rep-0', lineageId: 'lineage-hr-rep', level: 0, costEB: 15, actionTokens: { green: 1, yellow: 2, red: 0 }, skills: { Reflexes: 2, Ranged: 1, Melee: 0, Medical: 0, Tech: 0, Influence: 2, None: 0 }, armor: 0, keywords: ['Tyger Claw'], actions: [{ id: 'action-assault-rifle', name: 'Assault Rifle', skillReq: 'Ranged', range: 'Long', isAttack: true, keywords: ['Rapid 2'], effectDescription: 'Rapid 2 if not at max range.' }], passiveRules: 'Company Man: Whenever your opponent Inspires his Team, refresh one of this model\'s Action Tokens.' },
    { id: 'profile-ronin-assassin-0', lineageId: 'lineage-ronin-assassin', level: 0, costEB: 15, actionTokens: { green: 0, yellow: 3, red: 0 }, skills: { Reflexes: 3, Ranged: 0, Melee: 2, Medical: 0, Tech: 2, Influence: 0, None: 0 }, armor: 0, keywords: ['Tyger Claw'], actions: [{ id: 'action-katana', name: 'Katana', skillReq: 'Melee', range: 'Red', isAttack: true, keywords: ['Deadly Crits', 'Accurate'], effectDescription: 'Deadly Crits. [RE]actions made using this attack gain Accurate.' }], passiveRules: 'Devious: If this model is not visible to any rivals when it is activated, may move YELLOW for free.' },
    { id: 'profile-ronin-sniper-0', lineageId: 'lineage-ronin-sniper', level: 0, costEB: 20, actionTokens: { green: 0, yellow: 3, red: 0 }, skills: { Reflexes: 2, Ranged: 2, Melee: 0, Medical: 0, Tech: 2, Influence: 0, None: 0 }, armor: 0, keywords: ['Tyger Claw'], actions: [{ id: 'action-sniper-rifle', name: 'Sniper Rifle', skillReq: 'Ranged', range: 'Long', isAttack: true, keywords: ['Deadly Crits', 'Bulky'], effectDescription: 'Deadly Crits, Bulky.' }], passiveRules: 'Focused: If no rivals are within YELLOW, this model\'s ranged attacks gain Accurate.' },
    { id: 'profile-kyodai-0', lineageId: 'lineage-kyodai', level: 0, costEB: 8, actionTokens: { green: 0, yellow: 2, red: 0 }, skills: { Reflexes: 1, Ranged: 0, Melee: 2, Medical: 0, Tech: 0, Influence: 1, None: 0 }, armor: 0, keywords: ['Tyger Claw'], actions: [{ id: 'action-katana', name: 'Katana', skillReq: 'Melee', range: 'Red', isAttack: true, keywords: ['Deadly Crits', 'Accurate'], effectDescription: 'Deadly Crits. [RE]actions made using this attack gain Accurate.' }], passiveRules: 'Protector: This model may [RE]act when any visible friendly model within RED is wounded, instead of the target.' },
    { id: 'profile-onee-san-0', lineageId: 'lineage-onee-san', level: 0, costEB: 15, actionTokens: { green: 0, yellow: 2, red: 0 }, skills: { Reflexes: 1, Ranged: 2, Melee: 0, Medical: 0, Tech: 0, Influence: 1, None: 0 }, armor: 0, keywords: ['Tyger Claw'], actions: [{ id: 'action-assault-rifle', name: 'Assault Rifle', skillReq: 'Ranged', range: 'Long', isAttack: true, keywords: ['Rapid 2'], effectDescription: 'Rapid 2 if not at max range.' }], passiveRules: 'Steady Hand: This model ignores walking fire penalties when making Rapid attacks.' },
    { id: 'profile-shatei-0', lineageId: 'lineage-shatei', level: 0, costEB: 5, actionTokens: { green: 0, yellow: 1, red: 0 }, skills: { Reflexes: 0, Ranged: 0, Melee: 1, Medical: 0, Tech: 0, Influence: 0, None: 0 }, armor: 0, keywords: ['Gonk'], actions: [], passiveRules: 'Expendable & Loyal: After being taken out, make one GREEN [RE]action before being removed. If it is in the Path of Attack to a higher-INF Tyger Claw, it may become the target before dice are rolled.', gonkActionColor: 'Yellow' },
    { id: 'profile-cipher-0', lineageId: 'lineage-cipher', level: 0, costEB: 15, actionTokens: { green: 0, yellow: 3, red: 0 }, skills: { Reflexes: 1, Ranged: 0, Melee: 1, Medical: 0, Tech: 2, Influence: 0, None: 0 }, armor: 0, keywords: ['Tech'], actions: [], passiveRules: 'Quick-Rip: Can Heal 1 wound on a cyberequipped character after a successful Tech skill test.' },
    { id: 'profile-cygnus-0', lineageId: 'lineage-cygnus', level: 0, costEB: 20, actionTokens: { green: 2, yellow: 1, red: 0 }, skills: { Reflexes: 1, Ranged: 2, Melee: 2, Medical: 0, Tech: 0, Influence: 0, None: 0 }, armor: 0, keywords: ['Nomad'], actions: [{ id: 'action-assault-rifle', name: 'Assault Rifle', skillReq: 'Ranged', range: 'Long', isAttack: true, keywords: ['Rapid 2'], effectDescription: 'Rapid 2 if not at max range.' }], passiveRules: 'Survivor: This model may spend a Luck token instead of taking a wound.' },
    { id: 'profile-velocity-0', lineageId: 'lineage-velocity', level: 0, costEB: 15, actionTokens: { green: 2, yellow: 1, red: 0 }, skills: { Reflexes: 2, Ranged: 3, Melee: 2, Medical: 0, Tech: 0, Influence: 0, None: 0 }, armor: 0, keywords: ['Solo Bodygard'], actions: [], passiveRules: 'Protector: This model may [RE]act when any visible friendly model within RED is wounded, instead of the target.' },
    { id: 'profile-chrome-0', lineageId: 'lineage-chrome', level: 0, costEB: 15, actionTokens: { green: 2, yellow: 1, red: 0 }, skills: { Reflexes: 2, Ranged: 3, Melee: 2, Medical: 0, Tech: 0, Influence: 0, None: 0 }, armor: 0, keywords: ['Solo Stalker'], actions: [], passiveRules: 'Devious: If this model is not visible to any rivals when it is activated, may move YELLOW for free.' },
    { id: 'profile-synapse-0', lineageId: 'lineage-synapse', level: 0, costEB: 15, actionTokens: { green: 2, yellow: 1, red: 0 }, skills: { Reflexes: 1, Ranged: 0, Melee: 0, Medical: 0, Tech: 2, Influence: 1, None: 0 }, armor: 0, keywords: ['Netrunner'], actions: [{ id: 'action-net-deck', name: 'Net Deck', skillReq: 'Tech', range: 'Self', isAttack: false, keywords: [], effectDescription: 'May equip programs.' }], passiveRules: 'Cripple: Target within RED exchanges 1 GREEN for 1 YELLOW Action Token after a successfully passes a Tech skill test.' },
    { id: 'profile-sarah-wallace-0', lineageId: 'lineage-sarah-wallace', level: 0, costEB: 10, actionTokens: { green: 0, yellow: 2, red: 0 }, skills: { Reflexes: 1, Ranged: 0, Melee: 0, Medical: 0, Tech: 2, Influence: 2, None: 0 }, armor: 0, keywords: ['Media'], actions: [], passiveRules: 'Surveillance Scan: If there are any visible rivals when this model activates, it may move YELLOW for free.' },
    { id: 'profile-fury-0', lineageId: 'lineage-fury', level: 0, costEB: 10, actionTokens: { green: 0, yellow: 2, red: 0 }, skills: { Reflexes: 1, Ranged: 1, Melee: 0, Medical: 0, Tech: 0, Influence: 2, None: 0 }, armor: 0, keywords: ['Rockerboy'], actions: [], passiveRules: 'Feedback: This action targets all rivals within GREEN range. Select one action token on each rival who failed an opposed Influence skill test and flip it to exhausted.' },
    { id: 'profile-eclipse-0', lineageId: 'lineage-eclipse', level: 0, costEB: 10, actionTokens: { green: 1, yellow: 1, red: 0 }, skills: { Reflexes: 1, Ranged: 0, Melee: 0, Medical: 0, Tech: 1, Influence: 1, None: 0 }, armor: 0, keywords: ['Rockergirl'], actions: [], passiveRules: 'Synthesize: All other visible friendly models may refresh 1 Action Token if this model passes an Influence skill test against the obstacle dice (one test per model).' },
    { id: 'profile-scarlett-lokken-0', lineageId: 'lineage-scarlett-lokken', level: 0, costEB: 20, actionTokens: { green: 2, yellow: 1, red: 0 }, skills: { Reflexes: 2, Ranged: 0, Melee: 0, Medical: 0, Tech: 2, Influence: 2, None: 0 }, armor: 0, keywords: ['Executive'], actions: [], passiveRules: 'Power Influence: Activate a visible friendly character if this model passes an Influence skill test against the obstacle dice.' },
    { id: 'profile-michiko-arasaka-0', lineageId: 'lineage-michiko-arasaka', level: 0, costEB: 25, actionTokens: { green: 2, yellow: 1, red: 0 }, skills: { Reflexes: 2, Ranged: 2, Melee: 0, Medical: 0, Tech: 0, Influence: 3, None: 0 }, armor: 1, keywords: ['Leader'], actions: [{ id: 'action-rocket-launcher', name: 'Rocket Launcher', skillReq: 'Ranged', range: 'Long', isAttack: true, keywords: ['Blast', 'Bulky'], effectDescription: 'Blast, Bulky.' }], passiveRules: 'The Gal With The Plan: When a visible model is targeted with a successful Blast, you may immediately move one friendly model within the Blast radius YELLOW.' },
    { id: 'profile-mouse-0', lineageId: 'lineage-mouse', level: 0, costEB: 8, actionTokens: { green: 0, yellow: 2, red: 0 }, skills: { Reflexes: 1, Ranged: 1, Melee: 0, Medical: 0, Tech: 0, Influence: 2, None: 0 }, armor: 0, keywords: ['Mercenary'], actions: [{ id: 'action-heavy-pistol', name: 'Heavy Pistol', skillReq: 'Ranged', range: 'Yellow', isAttack: true, keywords: ['Deadly Crits', 'Accurate'], effectDescription: 'Deadly Crits. [RE]actions made using this attack gain Accurate.' }], passiveRules: 'Sweet Tongue: This model may always choose to defend against Melee attacks targeting it with its Influence instead of its Melee.' },
    { id: 'profile-tigress-0', lineageId: 'lineage-tigress', level: 0, costEB: 15, actionTokens: { green: 1, yellow: 2, red: 0 }, skills: { Reflexes: 2, Ranged: 1, Melee: 1, Medical: 0, Tech: 0, Influence: 0, None: 0 }, armor: 0, keywords: ['Mercenary'], actions: [{ id: 'action-assault-rifle', name: 'Assault Rifle', skillReq: 'Ranged', range: 'Long', isAttack: true, keywords: ['Rapid 2'], effectDescription: 'Rapid 2 if not at max range.' }], passiveRules: 'Tactical Training: After discarding a Gear card for any reason, this model may refresh one of its Action Tokens.' },
    { id: 'profile-doc-mittens-0', lineageId: 'lineage-doc-mittens', level: 0, costEB: 18, actionTokens: { green: 1, yellow: 2, red: 0 }, skills: { Reflexes: 2, Ranged: 0, Melee: 0, Medical: 2, Tech: 2, Influence: 0, None: 0 }, armor: 1, keywords: ['Mercenary'], actions: [{ id: 'action-ripper-doc-kit', name: 'Ripper Doc Kit', skillReq: 'Medical', range: 'Self', isAttack: false, keywords: [], effectDescription: 'Heal 1 after a successful Heal skill test.' }], passiveRules: 'Always Prepared: Once per game, when you Inspire Your Team, you may select one Gear worth 2 ED or less that this model could have legally equipped before the game and equip it for free.' },
    { id: 'profile-pantera-0', lineageId: 'lineage-pantera', level: 0, costEB: 15, actionTokens: { green: 0, yellow: 3, red: 0 }, skills: { Reflexes: 1, Ranged: 0, Melee: 2, Medical: 0, Tech: 2, Influence: 0, None: 0 }, armor: 0, keywords: ['Mercenary'], actions: [{ id: 'action-net-suit', name: 'Net Suit', skillReq: 'Tech', range: 'Self', isAttack: false, keywords: [], effectDescription: 'When this model ends a move, another visible friendly model may move same distance.' }], passiveRules: '' },
    { id: 'profile-lynx-0', lineageId: 'lineage-lynx', level: 0, costEB: 15, actionTokens: { green: 1, yellow: 2, red: 0 }, skills: { Reflexes: 1, Ranged: 2, Melee: 1, Medical: 0, Tech: 0, Influence: 0, None: 0 }, armor: 0, keywords: ['Mercenary'], actions: [{ id: 'action-shotgun', name: 'Shotgun', skillReq: 'Ranged', range: 'Red', isAttack: true, keywords: ['Deadly Crits', 'Torrent'], effectDescription: 'Torrent, Deadly Crits.' }], passiveRules: 'Bandolier: When this model would discard a Gear card for any reason, it may choose to discard a Luck token instead.' },
    { id: 'profile-teammate-0', lineageId: 'lineage-teammate', level: 0, costEB: 4, actionTokens: { green: 0, yellow: 1, red: 0 }, skills: { Reflexes: 1, Ranged: 0, Melee: 1, Medical: 0, Tech: 0, Influence: 0, None: 0 }, armor: 0, keywords: ['Gonk'], actions: [], passiveRules: 'Prove your worth: Attacks with Blast that target rival models within RED gain Accurate.', gonkActionColor: 'Yellow' },
    { id: 'profile-prankster-0', lineageId: 'lineage-prankster', level: 0, costEB: 10, actionTokens: { green: 0, yellow: 2, red: 0 }, skills: { Reflexes: 1, Ranged: 1, Melee: 2, Medical: 0, Tech: 0, Influence: 0, None: 0 }, armor: 0, keywords: ['Bozo'], actions: [{ id: 'action-flower-gag', name: 'Flower Gag', skillReq: 'Melee', range: 'Self', isAttack: false, keywords: [], effectDescription: 'This model gains +2 to Melee while opposing Melee Attacks which target it.' }], passiveRules: 'Juggler: This model\'s Melee Attacks are Accurate.' },
    { id: 'profile-centwit-0', lineageId: 'lineage-centwit', level: 0, costEB: 15, actionTokens: { green: 0, yellow: 2, red: 0 }, skills: { Reflexes: 0, Ranged: 1, Melee: 1, Medical: 0, Tech: 1, Influence: 0, None: 0 }, armor: 2, keywords: ['Bozo'], actions: [], passiveRules: 'Lucky Charm & Sewer Savvy: When this model takes out a rival, gain one luck token. If no rivals have line of sight to this model when its activation ends, it may move GREEN.' },
    { id: 'profile-tomfool-0', lineageId: 'lineage-tomfool', level: 0, costEB: 12, actionTokens: { green: 1, yellow: 1, red: 0 }, skills: { Reflexes: 1, Ranged: 2, Melee: 1, Medical: 0, Tech: 0, Influence: 0, None: 0 }, armor: 0, keywords: ['Bozo'], actions: [{ id: 'action-acid-soaker', name: 'Acid Soaker', skillReq: 'Ranged', range: 'Yellow', isAttack: true, keywords: [], effectDescription: 'Target discards 1 random Gear card. Discard a Luck token to choose a different one.' }], passiveRules: 'Cruel Joke: When a visible character fumbles, refresh an action token.' },
];

// --- Items ---
export const ITEMS: ItemCard[] = [
    { id: 'item-cyberarm', name: 'Cyberarm with Popup Shield', category: 'Gear', costEB: 15, reqStreetCred: 2, rarity: 2, keywords: ['Cybergear'], grantedActions: [], passiveRules: 'Grants +1 Armor when attacked from the front.', imageUrl: '/images/cyberarm.png' },
];

// ============================================================
// WEAPONS — full catalog of weapons & gear cards
// ============================================================
export const WEAPONS: Weapon[] = [
    { id: 'weapon-acid-soaker', name: 'Acid Soaker', cost: 0, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: true, rangeGreen: false, rangeLong: false, description: 'Target discards 1 random Gear card. Discard a Luck token to choose a different one.', rarity: 99, keywords: [], imageUrl: '/images/weapons/acid-soaker.png' },
    { id: 'weapon-arasaka-quickstrike-blade', name: 'Arasaka Quickstrike Blade', cost: 0, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: false, rangeGreen: false, rangeLong: false, description: 'Deadly Crits. [RE]actions made using this attack gain Accurate.', rarity: 99, keywords: [], imageUrl: '/images/weapons/arasaka-quickstrike-blade.png' },
    { id: 'weapon-assault-carbine', name: 'Assault Carbine', cost: 0, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: true, rangeGreen: true, rangeLong: false, description: 'Suppression.', rarity: 99, keywords: [], imageUrl: '/images/weapons/assault-carbine.png' },
    { id: 'weapon-assault-rifle', name: 'Assault Rifle', cost: 10, isWeapon: true, isGear: false, rangeRed: false, rangeYellow: true, rangeGreen: true, rangeLong: true, description: 'Rapid 2 if not at max range.', rarity: 99, keywords: [], imageUrl: '/images/weapons/assault-rifle.png' },
    { id: 'weapon-autoblade', name: 'Autoblade', cost: 0, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: false, rangeGreen: false, rangeLong: false, description: 'On a Crit, this model may do another Melee attack with this weapon again for free.', rarity: 99, keywords: [], imageUrl: '/images/weapons/autoblade.png' },
    { id: 'weapon-automatic-shotgun', name: 'Automatic Shotgun', cost: 0, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: false, rangeGreen: false, rangeLong: false, description: 'Rapid 2, Torrent, Deadly Crits, Difficult.', rarity: 99, keywords: [], imageUrl: '/images/weapons/automatic-shotgun.png' },
    { id: 'weapon-axe', name: 'Axe', cost: 0, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: false, rangeGreen: false, rangeLong: false, description: 'Deadly Crits, Dangerous.', rarity: 99, keywords: [], imageUrl: '/images/weapons/axe.png' },
    { id: 'weapon-bludgeon', name: 'Bludgeon', cost: 0, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: false, rangeGreen: false, rangeLong: false, description: 'Melee Weapon. Crits: Stun 1.', rarity: 99, keywords: [], imageUrl: '/images/weapons/bludgeon.png' },
    { id: 'weapon-box-launcher', name: 'Box Launcher', cost: 0, isWeapon: true, isGear: false, rangeRed: false, rangeYellow: false, rangeGreen: false, rangeLong: true, description: 'Blast, Complex, Difficult. If this actions deals at least 1 wound, refresh 1 Action Token.', rarity: 99, keywords: [], imageUrl: '/images/weapons/box-launcher.png' },
    { id: 'weapon-bozo-bombs', name: 'Bozo Bombs', cost: 0, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: true, rangeGreen: false, rangeLong: false, description: 'Before rolling, you may discard a Luck token to give this action Deadly. Reflexes skill.', rarity: 99, keywords: [], imageUrl: '/images/weapons/bozo-bombs.png' },
    { id: 'weapon-breaching-hammer', name: 'Breaching Hammer', cost: 0, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: false, rangeGreen: false, rangeLong: false, description: 'Deadly, Stun 1, Difficult.', rarity: 99, keywords: [], imageUrl: '/images/weapons/breaching-hammer.png' },
    { id: 'weapon-butchers-hooks', name: 'Butcher\'s hooks', cost: 0, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: false, rangeGreen: false, rangeLong: false, description: 'Deadly Crits, -1 to Melee when defending.', rarity: 99, keywords: [], imageUrl: '/images/weapons/butcher-s-hooks.png' },
    { id: 'weapon-chainsaws', name: 'Chainsaws', cost: 0, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: false, rangeGreen: false, rangeLong: false, description: 'Rapid 2, Deadly crits, Unwieldy.', rarity: 99, keywords: [], imageUrl: '/images/weapons/chainsaws.png' },
    { id: 'weapon-cool-mohawk', name: 'Cool Mohawk', cost: 0, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: false, rangeGreen: false, rangeLong: false, description: 'Melee weapon, Stun 1.', rarity: 99, keywords: [], imageUrl: '/images/weapons/cool-mohawk.png' },
    { id: 'weapon-concealed-automatic-pistols', name: 'Concealed Automatic Pistols', cost: 0, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: false, rangeGreen: false, rangeLong: false, description: 'Rapid 2.', rarity: 99, keywords: [], imageUrl: '/images/weapons/concealed-automatic-pistols.png' },
    { id: 'weapon-constitution-cyclone-ssg', name: 'Constitution Cyclone SSG', cost: 0, isWeapon: true, isGear: false, rangeRed: false, rangeYellow: false, rangeGreen: true, rangeLong: true, description: 'Rapid 3, Difficult, Bulky.', rarity: 99, keywords: [], imageUrl: '/images/weapons/constitution-cyclone-ssg.png' },
    { id: 'weapon-constitution-hurricane-assault', name: 'Constitution Hurricane Assault', cost: 15, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: true, rangeGreen: true, rangeLong: false, description: 'Rapid 2, Torrent, Suppression, Bulky.', rarity: 99, keywords: [], imageUrl: '/images/weapons/constitution-hurricane-assault.png' },
    { id: 'weapon-crowbar', name: 'Crowbar', cost: 0, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: false, rangeGreen: false, rangeLong: false, description: 'Stunning Crits.', rarity: 99, keywords: [], imageUrl: '/images/weapons/crowbar.png' },
    { id: 'weapon-cybernetic-arms-and-net-deck', name: 'Cybernetic Arms and Net Deck', cost: 0, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: false, rangeGreen: false, rangeLong: false, description: 'All of this model\'s Melee attack gain Deadly Crits. Can equip programs.', rarity: 99, keywords: [], imageUrl: '/images/weapons/cybernetic-arms-and-net-deck.png' },
    { id: 'weapon-cybernetic-claws', name: 'Cybernetic Claws', cost: 0, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: false, rangeGreen: false, rangeLong: false, description: '+1 to Melee when attacking, -1 to Melee when defending.', rarity: 99, keywords: [], imageUrl: '/images/weapons/cybernetic-claws.png' },
    { id: 'weapon-cybernetic-weapons', name: 'Cybernetic Weapons', cost: 0, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: false, rangeGreen: false, rangeLong: false, description: 'All of this model\'s attack gain Deadly Crits.', rarity: 99, keywords: [], imageUrl: '/images/weapons/cybernetic-weapons.png' },
    { id: 'weapon-dual-machine-guns', name: 'Dual Machine Guns', cost: 0, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: true, rangeGreen: true, rangeLong: false, description: 'Rapid 4, Unwieldy or Deadly Crits.', rarity: 99, keywords: [], imageUrl: '/images/weapons/dual-machine-guns.png' },
    { id: 'weapon-dual-pistols', name: 'Dual Pistols', cost: 0, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: true, rangeGreen: true, rangeLong: false, description: 'Accurate.', rarity: 99, keywords: [], imageUrl: '/images/weapons/dual-pistols.png' },
    { id: 'weapon-flamethrower', name: 'Flamethrower', cost: 0, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: true, rangeGreen: false, rangeLong: false, description: 'Torrent, Push, Bulky.', rarity: 99, keywords: [], imageUrl: '/images/weapons/flamethrower.png' },
    { id: 'weapon-flower-gag', name: 'Flower Gag', cost: 0, isWeapon: false, isGear: true, rangeRed: false, rangeYellow: false, rangeGreen: false, rangeLong: false, description: 'This model gains +2 to Melee while opposing Melee Attacks which target it.', rarity: 99, keywords: [], imageUrl: '/images/weapons/flower-gag.png' },
    { id: 'weapon-giggle-juicer', name: 'Giggle Juicer', cost: 0, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: false, rangeGreen: false, rangeLong: false, description: 'Replace target Gonk with a Fool under your control.', rarity: 99, keywords: [], imageUrl: '/images/weapons/giggle-juicer.png' },
    { id: 'weapon-grenade-launcher', name: 'Grenade Launcher', cost: 15, isWeapon: true, isGear: false, rangeRed: false, rangeYellow: false, rangeGreen: true, rangeLong: true, description: 'Blast, Indirect, Difficult, Bulky, Unwieldy.', rarity: 99, keywords: [], imageUrl: '/images/weapons/grenade-launcher.png' },
    { id: 'weapon-heavy-knife', name: 'Heavy Knife', cost: 0, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: false, rangeGreen: false, rangeLong: false, description: 'Pierce 2.', rarity: 99, keywords: [], imageUrl: '/images/weapons/heavy-knife.png' },
    { id: 'weapon-heavy-mg', name: 'Heavy MG', cost: 10, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: true, rangeGreen: true, rangeLong: true, description: 'Rapid 2, Deadly Crits.', rarity: 99, keywords: [], imageUrl: '/images/weapons/heavy-mg.png' },
    { id: 'weapon-heavy-pistol', name: 'Heavy Pistol', cost: 2, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: true, rangeGreen: true, rangeLong: false, description: 'Deadly Crits. [RE]actions made using this attack gain Accurate.', rarity: 99, keywords: [], imageUrl: '/images/weapons/heavy-pistol.png' },
    { id: 'weapon-heavy-smg', name: 'Heavy SMG', cost: 0, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: true, rangeGreen: true, rangeLong: false, description: 'Rapid 2, Suppression.', rarity: 99, keywords: [], imageUrl: '/images/weapons/heavy-smg.png' },
    { id: 'weapon-katana', name: 'Katana', cost: 1, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: false, rangeGreen: false, rangeLong: false, description: 'Deadly Crits. [RE]actions made using this attack gain Accurate.', rarity: 99, keywords: [], imageUrl: '/images/weapons/katana.png' },
    { id: 'weapon-katana-and-net-deck', name: 'Katana and Net Deck', cost: 0, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: false, rangeGreen: false, rangeLong: false, description: 'All of this model\'s Melee attack gain Deadly Crits. Can equip programs.', rarity: 99, keywords: [], imageUrl: '/images/weapons/katana-and-net-deck.png' },
    { id: 'weapon-machine-gun', name: 'Machine Gun', cost: 0, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: true, rangeGreen: true, rangeLong: true, description: 'Accurate, Suppression.', rarity: 99, keywords: [], imageUrl: '/images/weapons/machine-gun.png' },
    { id: 'weapon-malorian-arms-3516', name: 'Malorian Arms 3516', cost: 0, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: true, rangeGreen: false, rangeLong: false, description: 'Deadly.', rarity: 99, keywords: [], imageUrl: '/images/weapons/malorian-arms-3516.png' },
    { id: 'weapon-militech-crusher-ssg', name: 'Militech Crusher SSG', cost: 0, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: false, rangeGreen: false, rangeLong: false, description: 'Torrent, Suppression.', rarity: 99, keywords: [], imageUrl: '/images/weapons/militech-crusher-ssg.png' },
    { id: 'weapon-molotov-cocktail', name: 'Molotov Cocktail', cost: 0, isWeapon: true, isGear: false, rangeRed: false, rangeYellow: true, rangeGreen: false, rangeLong: false, description: 'Blast, Dangerous, Unwieldy. Uses Reflex skill.', rarity: 99, keywords: [], imageUrl: '/images/weapons/molotov-cocktail.png' },
    { id: 'weapon-mono-katana', name: 'Mono Katana', cost: 2, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: false, rangeGreen: false, rangeLong: false, description: 'Deadly Crits, Pierce 2, Dangerous.', rarity: 99, keywords: [], imageUrl: '/images/weapons/mono-katana.png' },
    { id: 'weapon-motorcycle', name: 'Motorcycle', cost: 0, isWeapon: false, isGear: true, rangeRed: false, rangeYellow: false, rangeGreen: false, rangeLong: false, description: 'Equipable and unequipable for free. Double the movement range on flat surface.', rarity: 99, keywords: [], imageUrl: '/images/weapons/motorcycle.png' },
    { id: 'weapon-net-deck', name: 'Net Deck', cost: 2, isWeapon: false, isGear: true, rangeRed: false, rangeYellow: false, rangeGreen: false, rangeLong: false, description: 'May equip programs.', rarity: 99, keywords: [], imageUrl: '/images/weapons/net-deck.png' },
    { id: 'weapon-net-suit', name: 'Net Suit', cost: 0, isWeapon: false, isGear: true, rangeRed: false, rangeYellow: false, rangeGreen: false, rangeLong: false, description: 'When this model ends a move, another visible friendly model may move same distance.', rarity: 99, keywords: [], imageUrl: '/images/weapons/net-suit.png' },
    { id: 'weapon-old-machine-gun', name: 'Old Machine Gun', cost: 0, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: true, rangeGreen: false, rangeLong: false, description: 'Deadly, Unwieldy, Bulky.', rarity: 99, keywords: [], imageUrl: '/images/weapons/old-machine-gun.png' },
    { id: 'weapon-pneumatic-cyber-fist', name: 'Pneumatic Cyber Fist', cost: 5, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: false, rangeGreen: false, rangeLong: false, description: 'Dangerous, Deadly.', rarity: 99, keywords: [], imageUrl: '/images/weapons/pneumatic-cyber-fist.png' },
    { id: 'weapon-power-glove', name: 'Power Glove', cost: 0, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: false, rangeGreen: false, rangeLong: false, description: 'If target is wounded, not killed, takes 1 free action controlled by the model\'s controller.', rarity: 99, keywords: [], imageUrl: '/images/weapons/power-glove.png' },
    { id: 'weapon-rattle-cans', name: 'Rattle Cans', cost: 0, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: false, rangeGreen: false, rangeLong: false, description: 'Melee Weapon. Rapid 2, Stun 2.', rarity: 99, keywords: [], imageUrl: '/images/weapons/rattle-cans.png' },
    { id: 'weapon-remington-gyro-sniper-rifle', name: 'Remington Gyro Sniper Rifle', cost: 0, isWeapon: true, isGear: false, rangeRed: false, rangeYellow: true, rangeGreen: true, rangeLong: true, description: 'Deadly Crits, Accurate, Bulky.', rarity: 99, keywords: [], imageUrl: '/images/weapons/remington-gyro-sniper-rifle.png' },
    { id: 'weapon-ripper-doc-kit', name: 'Ripper Doc Kit', cost: 0, isWeapon: false, isGear: true, rangeRed: false, rangeYellow: false, rangeGreen: false, rangeLong: false, description: 'Heal 1 after a successful Heal skill test.', rarity: 99, keywords: [], imageUrl: '/images/weapons/ripper-doc-kit.png' },
    { id: 'weapon-rocket-launcher', name: 'Rocket Launcher', cost: 0, isWeapon: true, isGear: false, rangeRed: false, rangeYellow: false, rangeGreen: true, rangeLong: true, description: 'Blast, Bulky.', rarity: 99, keywords: [], imageUrl: '/images/weapons/rocket-launcher.png' },
    { id: 'weapon-rocket-skates', name: 'Rocket Skates', cost: 0, isWeapon: false, isGear: true, rangeRed: false, rangeYellow: false, rangeGreen: false, rangeLong: false, description: 'When activates, may move GREEN for free, basic move actions gain Dangerous.', rarity: 99, keywords: [], imageUrl: '/images/weapons/rocket-skates.png' },
    { id: 'weapon-rostivic-rocket-launcher', name: 'Rostivic Rocket Launcher', cost: 0, isWeapon: true, isGear: false, rangeRed: false, rangeYellow: true, rangeGreen: true, rangeLong: false, description: 'Blast.', rarity: 99, keywords: [], imageUrl: '/images/weapons/rostivic-rocket-launcher.png' },
    { id: 'weapon-salvaged-mortar', name: 'Salvaged Mortar', cost: 15, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: true, rangeGreen: true, rangeLong: false, description: 'Indirect, Blast, Bulky, Dangerous, Difficult.', rarity: 99, keywords: [], imageUrl: '/images/weapons/salvaged-mortar.png' },
    { id: 'weapon-sawnoff-shotgun', name: 'Sawnoff Shotgun', cost: 0, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: false, rangeGreen: false, rangeLong: false, description: 'Torrent.', rarity: 99, keywords: [], imageUrl: '/images/weapons/sawnoff-shotgun.png' },
    { id: 'weapon-shotgun', name: 'Shotgun', cost: 5, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: false, rangeGreen: false, rangeLong: false, description: 'Torrent, Deadly Crits.', rarity: 99, keywords: [], imageUrl: '/images/weapons/shotgun.png' },
    { id: 'weapon-silenced-smg', name: 'Silenced SMG', cost: 0, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: true, rangeGreen: false, rangeLong: false, description: 'Rapid 2, Silent.', rarity: 99, keywords: [], imageUrl: '/images/weapons/silenced-smg.png' },
    { id: 'weapon-sledgehammer', name: 'Sledgehammer', cost: 2, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: false, rangeGreen: false, rangeLong: false, description: 'Deadly, Stun 1, Difficult.', rarity: 99, keywords: [], imageUrl: '/images/weapons/sledgehammer.png' },
    { id: 'weapon-smg', name: 'SMG', cost: 7, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: true, rangeGreen: true, rangeLong: false, description: 'Suppression.', rarity: 99, keywords: [], imageUrl: '/images/weapons/smg.png' },
    { id: 'weapon-sniper-rifle', name: 'Sniper Rifle', cost: 10, isWeapon: true, isGear: false, rangeRed: false, rangeYellow: true, rangeGreen: true, rangeLong: true, description: 'Deadly Crits, Bulky.', rarity: 99, keywords: [], imageUrl: '/images/weapons/sniper-rifle.png' },
    { id: 'weapon-spiked-baseball-bat', name: 'Spiked Baseball Bat', cost: 0, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: false, rangeGreen: false, rangeLong: false, description: 'Deadly Crits. [RE]actions made using this attack gain Accurate.', rarity: 99, keywords: [], imageUrl: '/images/weapons/spiked-baseball-bat.png' },
    { id: 'weapon-stun-baton-and-riot-shield', name: 'Stun Baton & Riot Shield', cost: 0, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: false, rangeGreen: false, rangeLong: false, description: 'Stun 1, Force enemy model to reroll melee dice 1 per activation.', rarity: 99, keywords: [], imageUrl: '/images/weapons/stun-baton-riot-shield.png' },
    { id: 'weapon-stun-gun', name: 'Stun Gun', cost: 0, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: true, rangeGreen: false, rangeLong: false, description: 'Stun 2.', rarity: 99, keywords: [], imageUrl: '/images/weapons/stun-gun.png' },
    { id: 'weapon-tactical-rifle', name: 'Tactical Rifle', cost: 0, isWeapon: true, isGear: false, rangeRed: false, rangeYellow: true, rangeGreen: true, rangeLong: true, description: 'Accurate, Deadly Crits.', rarity: 99, keywords: [], imageUrl: '/images/weapons/tactical-rifle.png' },
    { id: 'weapon-tactical-shield', name: 'Tactical Shield', cost: 0, isWeapon: false, isGear: true, rangeRed: false, rangeYellow: false, rangeGreen: false, rangeLong: false, description: 'May not carry any bulky gear. +3 to Armor.', rarity: 99, keywords: [], imageUrl: '/images/weapons/tactical-shield.png' },
    { id: 'weapon-tanto', name: 'Tanto', cost: 5, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: false, rangeGreen: false, rangeLong: false, description: 'This model\'s melee attack gain Accurate.', rarity: 99, keywords: [], imageUrl: '/images/weapons/tanto.png' },
    { id: 'weapon-technotrica-microwaver', name: 'Technotrica Microwaver', cost: 8, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: true, rangeGreen: true, rangeLong: false, description: 'Torrent, Stun 1, Silent.', rarity: 99, keywords: [], imageUrl: '/images/weapons/technotrica-microwaver.png' },
    { id: 'weapon-tonfas', name: 'Tonfas', cost: 0, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: false, rangeGreen: false, rangeLong: false, description: '+1 to Melee when defending, -1 to Melee when attacking.', rarity: 99, keywords: [], imageUrl: '/images/weapons/tonfas.png' },
    { id: 'weapon-tsunami-arms-helix', name: 'Tsunami Arms Helix', cost: 15, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: true, rangeGreen: true, rangeLong: false, description: 'Torrent, Deadly Crits, Suppression, Difficult, Bulky.', rarity: 99, keywords: [], imageUrl: '/images/weapons/tsunami-arms-helix.png' },
    { id: 'weapon-tool-kit', name: 'Tool Kit', cost: 0, isWeapon: false, isGear: true, rangeRed: false, rangeYellow: false, rangeGreen: false, rangeLong: false, description: 'When this model discards a Loot card, it may roll a RED die. On a 5+, not discarded.', rarity: 99, keywords: [], imageUrl: '/images/weapons/tool-kit.png' },
    { id: 'weapon-wholloper', name: 'Wholloper', cost: 0, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: false, rangeGreen: false, rangeLong: false, description: 'Stun 1.', rarity: 99, keywords: [], imageUrl: '/images/weapons/wholloper.png' },
    { id: 'weapon-wolver', name: 'Wolver', cost: 0, isWeapon: true, isGear: false, rangeRed: true, rangeYellow: false, rangeGreen: false, rangeLong: false, description: 'Deadly Crits. [RE]actions made using this attack gain Accurate.', rarity: 99, keywords: [], imageUrl: '/images/weapons/wolver.png' },
];

// ============================================================
// seedData — pushes all reference data into the Zustand store
// ============================================================
export const seedData = () => {
    const state = useStore.getState();

    if (state.catalog.factions.length === 0) {
        state.setCatalog({
            factions: FACTIONS,
            lineages: LINEAGES,
            profiles: PROFILES,
            items: ITEMS,
            programs: HACKING_PROGRAMS,
            weapons: WEAPONS,
        });
        console.log('Seed data populated: factions, lineages, profiles, items, programs, weapons');
    } else if (state.catalog.programs.length === 0) {
        state.setCatalog({
            ...state.catalog,
            programs: HACKING_PROGRAMS,
        });
        console.log(`Seeded ${HACKING_PROGRAMS.length} programs from CSV.`);
    }
};
