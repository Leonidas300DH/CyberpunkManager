export type ActionColor = 'Green' | 'Yellow' | 'Red';
export type SkillType = 'Reflexes' | 'Ranged' | 'Melee' | 'Medical' | 'Tech' | 'Influence' | 'None';
export type RangeType = 'Reach' | 'Red' | 'Yellow' | 'Green' | 'Long' | 'Self';
export type ItemCategory = 'Gear' | 'Program' | 'Loot' | 'Objective';

// --- DYNAMIC FACTIONS ---
export interface Faction {
    id: string;
    name: string; // e.g., "Tyger Claws", "Custom Gang"
    description?: string;
    imageUrl?: string; // Rendered as aspect-square
}

// --- ACTIONS MODELLING ---
export interface GameAction {
    id: string;
    name: string;
    skillReq: SkillType;
    range: RangeType;
    isAttack: boolean;
    keywords: string[]; // e.g., ['Deadly', 'Blast', 'Pierce 2', 'Complex', 'Difficult']
    effectDescription: string;
}

// --- CHARACTER & DRONE MODELLING ---
export interface ModelLineage {
    id: string;
    name: string; // e.g., "Ronin Sniper", "Media Drone"
    factionIds: string[]; // FK to Faction(s) — supports multi-faction lineages
    type: 'Leader' | 'Character' | 'Gonk' | 'Specialist' | 'Drone';
    isMerc: boolean;
    imageUrl?: string; // Rendered as aspect-square
}

// A specific experience level (Rank/Star) of a Lineage
export interface ModelProfile {
    id: string;
    lineageId: string; // FK to ModelLineage
    level: number; // 0 (Base), 1 (1-Star Veteran), 2 (2-Star), 3 (3-Star)
    costEB: number;
    actionTokens: {
        green: number;
        yellow: number;
        red: number;
    }; // Gonks and Drones might have 0 tokens here depending on rules
    gonkActionColor?: ActionColor;
    skills: Record<SkillType, number>;
    armor: number; // Native armor
    keywords: string[]; // e.g., ['Netrunner', 'Cyber-Character']
    actions: GameAction[]; // Innate actions
    passiveRules: string;
}

// --- ITEMS (GEAR, PROGRAMS, LOOT) ---
export interface ItemCard {
    id: string;
    name: string;
    category: ItemCategory; // 'Program' handles Hacking
    costEB: number;
    reqStreetCred: number; // Minimum Campaign Street Cred required to buy/equip
    rarity: number; // Max copies allowed per team
    keywords: string[]; // e.g., ['Bulky', 'Cybergear']
    grantedActions: GameAction[]; // Actions added to the model equipping it
    passiveRules: string;
    grantsStreetCredBonus?: number; // Used mainly for Completed Objectives
    summonsDroneLineageId?: string; // FK to ModelLineage if this program deploys a Drone
    imageUrl?: string; // Rendered as aspect-square
    // Program-specific fields
    programDifficulty?: ActionColor; // Green, Yellow, Red — required difficulty to run
    programFactionId?: string; // FK to Faction, undefined = "All" factions
}

// --- HACKING PROGRAMS (Netrunner) ---
export type ProgramQuality = 'Red' | 'Yellow' | 'Green';
export type ProgramRange = 'Red' | 'Yellow' | 'Green' | 'Long' | 'LongOnly' | 'GreenLong' | 'Self';
export type ReloadCondition = 'Inspire' | 'TakenOut' | 'Wounded' | 'Discard' | 'Manual';

export interface HackingProgram {
    id: string;
    name: string;
    factionId: string;           // FK to Faction, 'all' = universal
    costEB: number;
    reqStreetCred: number;
    rarity: number;
    imageUrl: string;            // Illustration in /images/programs/
    quality: ProgramQuality;     // Card color theme (Red/Yellow/Green)
    range: ProgramRange;         // Range indicator
    techTest: boolean;           // Requires a Tech skill test
    flavorText: string;           // Flavor/ambiance text (italics + quotes on front)
    loadedText: string;          // Front card rules text
    vulnerable: boolean;         // Grants Vulnerable keyword
    runningEffect: string;       // Back card effect text
    reloadCondition: ReloadCondition; // How to reload/flip the card back
}

// --- WEAPONS & GEAR ---
export interface Weapon {
    id: string;
    name: string;
    cost: number;
    isWeapon: boolean;
    isGear: boolean;
    rangeRed: boolean;
    rangeYellow: boolean;
    rangeGreen: boolean;
    rangeLong: boolean;
    description: string;
    rarity: number;        // Max copies per team (99 = unlimited)
    keywords: string[];    // e.g., ['Bulky', 'Deadly']
    grantsNetrunner?: boolean; // true = equipping this allows hacking programs
    imageUrl?: string;     // Illustration in /images/weapons/
}

// --- CAMPAIGN & ROSTER MODELLING ---
export interface RecruitedModel {
    id: string; // Unique instance ID
    lineageId: string;
    currentProfileId: string; // Points to their current ModelProfile (Rank)
    equippedItemIds: string[]; // IDs of ItemCards equipped
    hasMajorInjury: boolean; // If true, forces fallback to Rank 0 stats
    quantity: number; // Used for generic Gonks (e.g., quantity: 5)
}

// The persistent Campaign state (The "HQ")
export interface Campaign {
    id: string;
    name: string;
    factionId: string; // FK to Faction
    ebBank: number; // Unspent Eurobucks
    hqRoster: RecruitedModel[]; // Recruited characters
    hqStash: string[]; // IDs of ItemCards owned but not equipped
    completedObjectives: string[]; // IDs of Objective ItemCards
}

// A specific Match list built from the Campaign HQ
export interface MatchTeam {
    id: string;
    campaignId: string;
    targetEB: number; // e.g., 100, 150, or 200
    selectedRecruitIds: string[]; // Array of RecruitedModel IDs going to the match
    equipmentMap: Record<string, string[]>; // recruitId → item IDs (prefix: weapon-* | program-*)
}

// Store catalog shape used by services
export interface CatalogData {
    factions: Faction[];
    lineages: ModelLineage[];
    profiles: ModelProfile[];
    items: ItemCard[];
    programs: HackingProgram[];
    weapons: Weapon[];
}
