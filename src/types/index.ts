export type ActionColor = 'Green' | 'Yellow' | 'Red';
export type SkillType = 'Reflexes' | 'Ranged' | 'Melee' | 'Medical' | 'Tech' | 'Influence' | 'None';
export type RangeType = 'Reach' | 'Red' | 'Yellow' | 'Green' | 'Long' | 'Self';
export type ItemCategory = 'Gear' | 'Program' | 'Loot' | 'Objective';

// --- DYNAMIC FACTIONS ---
export interface Faction {
    id: string;
    name: string; // e.g., "Tyger Claws", "Custom Gang"
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
    factionId: string; // FK to Faction
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
}

// Store catalog shape used by services
export interface CatalogData {
    factions: Faction[];
    lineages: ModelLineage[];
    profiles: ModelProfile[];
    items: ItemCard[];
}
