export type ActionColor = 'Green' | 'Yellow' | 'Red';
export type SkillType = 'Reflexes' | 'Ranged' | 'Melee' | 'Medical' | 'Tech' | 'Influence' | 'None';
export type RangeType = 'Reach' | 'Red' | 'Yellow' | 'Green' | 'Long' | 'Self';
export type ItemCategory = 'Gear' | 'Program' | 'Loot' | 'Objective';
export type ObjectiveRewardType = 'ongoing' | 'recycle' | 'cybergear' | 'immediate';

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
    weaponId?: string;  // FK vers Weapon.id — quand présent, render depuis les données de l'arme
}

// --- CHARACTER & DRONE MODELLING ---
export interface ModelLineage {
    id: string;
    name: string; // e.g., "Ronin Sniper", "Media Drone"
    factionIds: string[]; // FK to Faction(s) — supports multi-faction lineages
    type: 'Leader' | 'Character' | 'Gonk' | 'Specialist' | 'Drone';
    isMerc: boolean;
    imageUrl?: string; // Rendered as aspect-square
    imageFlipY?: boolean; // CSS scaleY(-1) flip
    imageFlipX?: boolean; // CSS scaleX(-1) flip
    isDefaultImage?: boolean; // true = using faction fallback image, needs real portrait
    source?: 'Custom' | 'Upload'; // origin: Custom = original seed, Upload = imported from PDF
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
    streetCred: number; // 0 = Normal, 1 = Veteran, 2 = Elite
}

// --- ITEMS (GEAR, PROGRAMS, LOOT) ---
export interface ItemCard {
    id: string;
    name: string;
    category: ItemCategory; // 'Program' handles Hacking
    factionVariants: FactionVariant[];
    source?: WeaponSource;
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

// --- OBJECTIVES ---
export interface SkillBonus {
    skill: SkillType;
    value: number;
}

export interface Objective {
    id: string;
    name: string;
    factionId: string;           // FK to Faction
    description: string;         // Condition text
    rewardType: ObjectiveRewardType;
    rewardText: string;          // Reward description
    grantsStreetCred: number;          // 0 = none, 1 = one star, 2 = two stars
    grantsEB?: number;
    grantsLuck?: number;
    grantsCybergearTo?: string;  // Target description for cybergear
    cybergearEffect?: string;    // Cybergear effect text
    unlocksCardId?: string;      // FK to item/weapon unlocked
    imageUrl?: string;
    // Skill bonuses displayed as hex icons on the card
    skillBonuses?: SkillBonus[];
    armorBonus?: number;
    // Action granted by the objective (e.g., Commanding Presence)
    actionSkill?: SkillType;
    actionRangeRed?: boolean;
    actionRangeYellow?: boolean;
    actionRangeGreen?: boolean;
    actionRangeLong?: boolean;
    // Faction banner flavor text (e.g., "THREAT RESPONSE" for Max-Tac)
    factionBanner?: string;
}

// --- FACTION VARIANTS ---
export type WeaponSource = 'Custom' | 'Manual' | 'Upload';

export interface FactionVariant {
    factionId: string;    // 'universal' | 'faction-xxx'
    cost: number;
    rarity: number;       // 99 = unlimited
    reqStreetCred: number;
}

// --- WEAPONS & GEAR ---
export interface Weapon {
    id: string;
    name: string;
    source: WeaponSource;
    factionVariants: FactionVariant[];
    isWeapon: boolean;
    isGear: boolean;
    isAction: boolean;   // true for innate actions & passive rules
    skillReq?: 'Reflexes' | 'Ranged' | 'Melee' | 'Medical' | 'Tech' | 'Influence'; // Skill used — undefined for gear/equipment
    skillBonus?: number; // Bonus value displayed next to skill icon (e.g. +1 Medical)
    grantsArmor?: number; // Armor bonus granted when equipped
    rangeRed: boolean;
    rangeYellow: boolean;
    rangeGreen: boolean;
    rangeLong: boolean;
    range2Red?: boolean;
    range2Yellow?: boolean;
    range2Green?: boolean;
    range2Long?: boolean;
    description: string;
    keywords: string[];    // e.g., ['Bulky', 'Deadly']
    grantsNetrunner?: boolean; // true = equipping this allows hacking programs
    imageUrl?: string;     // Illustration in /images/weapons/
    imageFlipY?: boolean;  // CSS scaleY(-1) flip
}

// --- LOOTS ---
export interface Loot {
    id: string;
    name: string;           // title
    flavorText: string;     // texte d'ambiance
    effectText?: string;    // description de l'effet
    skillReq?: SkillType;
    skillBonus?: number;
    rangeRed: boolean;
    rangeYellow: boolean;
    rangeGreen: boolean;
    rangeLong: boolean;
    armorBonus?: number;
}

// --- CAMPAIGN & ROSTER MODELLING ---
export interface RecruitedModel {
    id: string; // Unique instance ID
    lineageId: string;
    currentProfileId: string; // Points to their current ModelProfile (Rank)
    equippedItemIds: string[]; // IDs of ItemCards equipped
    hasMajorInjury: boolean; // If true, forces fallback to Rank 0 stats
    quantity: number; // Used for generic Gonks (e.g., quantity: 5)
    purchasedLevel?: number; // 0 = base, 1 = veteran direct, 2 = elite direct
}

// Snapshot of a recruit in a match log
export interface MatchLogRecruit {
    recruitId: string;
    lineageId: string;
    profileId: string;
    equipmentIds: string[]; // weapon/program IDs from equipmentMap
    wasWounded: boolean;
    wasKIA: boolean;
}

// Match log entry for campaign journal
export interface MatchLogEntry {
    date: string; // ISO timestamp
    result: 'victory' | 'defeat';
    events: string[]; // Human-readable event descriptions
    team?: MatchLogRecruit[]; // Full team snapshot
    targetEB?: number;
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
    carryingLeaderPenalty?: boolean; // Wounded Leader active
    matchLog?: MatchLogEntry[]; // Post-game journal
}

// Token state during active play
export interface TokenState {
    baseColor: 'green' | 'yellow' | 'red';
    wounded: boolean;
    spent: boolean;
}

// A specific Match list built from the Campaign HQ
export interface MatchTeam {
    id: string;
    campaignId: string;
    targetEB: number; // e.g., 100, 150, or 200
    selectedRecruitIds: string[]; // Array of RecruitedModel IDs going to the match
    equipmentMap: Record<string, string[]>; // recruitId → item IDs (prefix: weapon-* | program-*)
    // Objectives
    objectiveIds?: string[];           // IDs of 3 objectives for this match
    completedObjectiveIds?: string[];  // IDs completed during THIS match
    carryingLeaderPenalty?: boolean;   // true if Wounded Leader is active
    // Play state (persisted across navigation)
    tokenStates?: Record<string, TokenState[]>;
    deadModelIds?: string[];
    drawnLootIds?: string[];
    luck?: number;
    flippedCardKeys?: string[]; // Program card flip state (keys in flippedCards Set)
}

// Store catalog shape used by services
export interface CatalogData {
    factions: Faction[];
    lineages: ModelLineage[];
    profiles: ModelProfile[];
    items: ItemCard[];
    programs: HackingProgram[];
    weapons: Weapon[];
    objectives: Objective[];
    loots: Loot[];
    tierSurcharges?: { veteran: number; elite: number };
}
