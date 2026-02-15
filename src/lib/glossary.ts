/**
 * Combat Zone Glossary
 * Source: Cyberpunk_Rulebook_v26.pdf
 */

export const RULEBOOK_SOURCE = 'Cyberpunk_Rulebook_v26.pdf';

export interface GlossaryEntry {
    term: string;
    definition: string;
    page?: string;
    /** Whether this term should be detected & linked in card text */
    highlight?: boolean;
}

export const GLOSSARY: GlossaryEntry[] = [
    // ── A ──
    { term: 'Accurate', definition: 'You may re-roll Accurate actions after rolling. Each die may only be re-rolled once.', page: 'p.39', highlight: true },
    { term: 'Action', definition: 'A single activity performed by a single model (movement, attacking, healing, hacking, etc.).', page: 'p.14' },
    { term: 'Action Dice', definition: 'The GREEN, YELLOW, and RED dice used when attempting an action.', page: 'p.6' },
    { term: 'Action Token', definition: 'A marker indicating whether a character has an action available and the color of die used to resolve that action.', page: 'p.6', highlight: true },
    { term: 'Activate', definition: 'Selecting a model to become the Active Model.', page: 'p.12' },
    { term: 'Active Model', definition: 'The model currently taking an action.', page: 'p.12' },
    { term: 'Armor', definition: 'Protective equipment used for an Opposed Roll instead of a Skill. Armor from a Character Card can always be used. Armor from a Gear Card can only be used until it fails to protect the wearer.', page: 'p.26', highlight: true },
    { term: 'Attack', definition: 'An action that causes a wound if successful. May only target rival models.', page: 'p.15' },

    // ── B ──
    { term: 'Barrier', definition: 'A piece of scenery a model cannot move through (e.g., a solid wall).', page: 'p.20' },
    { term: 'Basic Actions', definition: 'Six standard actions any model may take (one for each Skill).', page: 'p.15\u201317' },
    { term: 'Battlespace', definition: 'The area where the game takes place, including scenery and deployment areas.', page: 'p.38' },
    { term: 'Blast', definition: 'An action affecting models within a radius.', page: 'p.39', highlight: true },
    { term: 'Body Token', definition: 'A marker indicating where a model was taken out. Characters may Loot the Body for equipment.', page: 'p.29', highlight: true },
    { term: 'Brawl', definition: 'A situation where rival models are within reach of each other. Action and targeting options are limited.', page: 'p.26', highlight: true },
    { term: 'Bulky', definition: 'A model may have a maximum of one Bulky Gear.', page: 'p.37', highlight: true },

    // ── C ──
    { term: 'Campaign', definition: 'A series of linked scenarios.', page: 'p.42' },
    { term: 'Character', definition: 'A capable team member, typically with multiple Action Tokens and special abilities.', page: 'p.9' },
    { term: 'Character Card', definition: 'A card showing the rules for a specific character model.', page: 'p.9' },
    { term: 'Climb', definition: 'Moving up or down a vertical barrier.', page: 'p.22' },
    { term: 'Command Action', definition: 'An action allowing a character to activate another model outside the normal exchange of Control.', page: 'p.19' },
    { term: 'Control', definition: 'The active player has Control. Only the player with Control may activate a model.', page: 'p.12' },
    { term: 'Complex Action', definition: 'Cannot be attempted if enemy models are within RED.', page: 'p.40', highlight: true },
    { term: 'Crit', definition: 'The highest value on a die. Usually an automatic success and may trigger additional effects.', page: 'p.17', highlight: true },
    { term: 'Cyber-Character', definition: 'A character equipped with Cybergear.', page: 'p.37' },

    // ── D ──
    { term: 'Dangerous Action', definition: 'If a model rolls a Fumble when attempting this action, he takes a wound.', page: 'p.40', highlight: true },
    { term: 'Deadly', definition: 'Deal an additional wound when they hit.', page: 'p.40', highlight: true },
    { term: 'Deadly Crits', definition: 'Deal an additional wound if a Crit is rolled.', page: 'p.40', highlight: true },
    { term: 'Defense', definition: 'A bonus to the listed Skill that only applies when opposing (defending against) an action.', page: 'p.40', highlight: true },
    { term: 'Deploy', definition: 'Placing a model on the table to enter the Battlespace.', page: 'p.38', highlight: true },
    { term: 'Difficult Action', definition: 'May only be used once until the team is Inspired.', page: 'p.19', highlight: true },
    { term: 'Discard', definition: 'After use, the Gear or Loot card is discarded.', page: 'p.40', highlight: true },
    { term: 'Drag', definition: 'Using a Move Action to relocate a rival or object. Dragging is limited to RED range.', page: 'p.21, 27', highlight: true },

    // ── E ──
    { term: 'Easy Action', definition: 'An action that does not require a roll (an Action Token is still used).', page: 'p.14' },
    { term: 'EB', definition: 'Eurobucks \u2014 The currency used when creating your team.', page: 'p.9, 37' },
    { term: 'Escape', definition: 'Leaving a Brawl using Reflexes opposed by a rival\'s Reflexes.', page: 'p.26' },
    { term: 'Exhaust', definition: 'Flip a card face down. Exhausted cards have no active text until refreshed.', page: 'p.13', highlight: true },

    // ── F ──
    { term: 'Faction', definition: 'One of the groups competing to control the Combat Zone. A team may only include members of one faction (plus Mercs).', page: 'p.36' },
    { term: 'Fail', definition: 'An action is unsuccessful if the total is lower than or equal to the Opposed Roll.', page: 'p.6' },
    { term: 'Fall', definition: 'Involuntary vertical movement that may cause wounds.', page: 'p.22' },
    { term: 'Friendly', definition: 'Models controlled by the same player.', page: 'p.7' },
    { term: 'Free Action', definition: 'An action that does not use an Action Token.', page: 'p.19', highlight: true },
    { term: 'Fumble', definition: 'The lowest value on a die. Automatic failure and may trigger additional effects.', page: 'p.6', highlight: true },

    // ── G ──
    { term: 'Gear', definition: 'Equipment or weapons providing additional actions and/or abilities.', page: 'p.11, 26, 37', highlight: true },
    { term: 'Gonk', definition: 'A novice team member representing rank-and-file muscle.', page: 'p.9', highlight: true },
    { term: 'Gonk Card', definition: 'A card showing the stats and rules for a type of Gonk model.', page: 'p.9' },

    // ── H ──
    { term: 'Hacked', definition: 'A Netrunner places a Hacked token on a rival whose cyberware he has accessed.', page: 'p.35', highlight: true },
    { term: 'Heal', definition: 'Removing a wound and restoring one Action Token to its normal color.', page: 'p.30', highlight: true },

    // ── I ──
    { term: 'Impact Token', definition: 'A marker indicating the center of a Blast.', page: 'p.39', highlight: true },
    { term: 'Indirect', definition: 'Ignores obstacles in the Path of Attack.', page: 'p.40', highlight: true },
    { term: 'Inspire Your Team', definition: 'When gaining Control, activate all Gonks (one action each) while characters refresh their Action Tokens.', page: 'p.12', highlight: true },
    { term: 'Install', definition: 'Assign a program to a Netrunner.', page: 'p.34' },

    // ── J ──
    { term: 'Jump', definition: 'A model may attempt to jump across a gap up to RED.', page: 'p.21' },

    // ── L ──
    { term: 'Launch', definition: 'Use a program\'s effect without spending an action.', page: 'p.34', highlight: true },
    { term: 'Leader', definition: 'The centerpiece of a team. Each team must include exactly one Leader.', page: 'p.36' },
    { term: 'Limiter', definition: 'The measuring device divided into GREEN, YELLOW, and RED lengths. The width measures reach distance.', page: 'p.7' },
    { term: 'Loaded', definition: 'A program that is available to use (Loaded side up).', page: 'p.34', highlight: true },
    { term: 'Long Range', definition: 'The area beyond GREEN range of the Limiter.', page: 'p.14', highlight: true },
    { term: 'Loot', definition: 'Taking Gear or drawing a Loot card from a model that has been taken out.', page: 'p.30', highlight: true },
    { term: 'Luck Token', definition: 'Spend to re-roll a single die. Players typically start with three.', page: 'p.13', highlight: true },

    // ── M ──
    { term: 'Memory Leak', definition: 'When a Netrunner Fumbles a program, he must suffer Stun 1 or take a wound.', page: 'p.35', highlight: true },
    { term: 'Merc', definition: 'A character not loyal to a single faction. May be included in any team.', page: 'p.37' },
    { term: 'Model', definition: 'A single combatant represented by a miniature.', page: 'p.7' },
    { term: 'Move Action', definition: 'An action allowing a model to change location within the Battlespace.', page: 'p.20' },

    // ── N ──
    { term: 'Netrunner', definition: 'A character able to Hack rivals and install programs.', page: 'p.34', highlight: true },

    // ── O ──
    { term: 'Obstacle', definition: 'Scenery that a model can move through or over.', page: 'p.20', highlight: true },
    { term: 'Obstacle Die', definition: 'A black 10-sided die used when no rival model is targeted.', page: 'p.6' },
    { term: 'Opposed Roll', definition: 'A roll made by the target to determine success or failure.', page: 'p.6, 14' },

    // ── P ──
    { term: 'Path of Attack', definition: 'An imaginary straight line between the Active Model and its target, equal to the width of the Limiter.', page: 'p.24', highlight: true },
    { term: 'Pierce', definition: 'Reduces the value of the target\'s Armor.', page: 'p.40', highlight: true },
    { term: 'Program', definition: 'A special action available only to Netrunners.', page: 'p.34\u201335' },
    { term: 'Push', definition: 'Moves the target RED directly away from the Active Model.', page: 'p.40', highlight: true },

    // ── Q ──
    { term: 'Quarter', definition: 'One fourth of the Battlespace.', page: 'p.38' },

    // ── R ──
    { term: 'Range', definition: 'The distance between the Active Model and its target.', page: 'p.14' },
    { term: 'Rapid', definition: 'Allows the same action to be taken without spending additional actions.', page: 'p.41', highlight: true },
    { term: 'Rarity', definition: 'The maximum number of a single Gear or Program card your team may include.', page: 'p.37' },
    { term: 'Reach', definition: 'The width of the Limiter; hand-to-hand distance.', page: 'p.7', highlight: true },
    { term: '[RE]action', definition: 'A special action taken immediately after being wounded.', page: 'p.31', highlight: true },
    { term: 'Ready', definition: 'A face-up Action Token that can be spent.', page: 'p.13', highlight: true },
    { term: 'Red-Lined', definition: 'A character that has only RED Action Tokens remaining.', page: 'p.28', highlight: true },
    { term: 'Refresh', definition: 'Flip Used Action Tokens to Ready or exhausted cards face up.', page: 'p.12, 40', highlight: true },
    { term: 'Reload', definition: 'Flip a program card to the Loaded side.', page: 'p.34', highlight: true },
    { term: 'Reserve', definition: 'A model not deployed at the start of the game.', page: 'p.38' },
    { term: 'Rival', definition: 'A model controlled by the opposing player.', page: 'p.7' },

    // ── S ──
    { term: 'Scenario', definition: 'A single game of Combat Zone.', page: 'p.8, 43' },
    { term: 'Scenario Sheet', definition: 'A page describing setup, rules, and goals for a scenario.', page: 'p.43' },
    { term: 'Scenery', definition: 'Any terrain in the Battlespace (Obstacle or Barrier).', page: 'p.20, 38' },
    { term: 'Silent', definition: '[RE]actions to Silent actions may only target the attacker if the Path of Attack is not obscured.', page: 'p.41', highlight: true },
    { term: 'Skill', definition: 'One of six core abilities: Reflexes, Ranged, Melee, Medical, Tech, Influence.', page: 'p.9\u201314' },
    { term: 'Specialist', definition: 'Rare individual; your team may include only one of each Specialist model.', highlight: true },
    { term: 'Street Cred', definition: 'Reputation required to access certain Gear or characters.', page: 'p.9, 37, 44' },
    { term: 'Stun', definition: 'May force a character to flip Ready Action Tokens or prevent a Gonk from acting during Inspire Your Team.', page: 'p.41', highlight: true },
    { term: 'Succeed', definition: 'An action succeeds if the total is higher than the Opposed Roll.', page: 'p.6, 14' },
    { term: 'Suppression', definition: 'Characters may only [RE]act to Suppression attacks with a Move Action.', page: 'p.41', highlight: true },

    // ── T ──
    { term: 'Taken Out', definition: 'A model eliminated from combat and replaced with a Body Token.', page: 'p.29', highlight: true },
    { term: 'Target', definition: 'The intended recipient of an action\'s effects.', page: 'p.14, 24' },
    { term: 'Team', definition: 'All models controlled by a single player.', page: 'p.8, 44' },
    { term: 'Torrent', definition: 'Targets all models in the Path of Attack, both friendly and rival.', page: 'p.41', highlight: true },

    // ── U ──
    { term: 'Unwieldy', definition: 'Do not add the model\'s Skill to Unwieldy actions.', page: 'p.41', highlight: true },
    { term: 'Used', definition: 'A face-down Action Token that cannot be spent.', page: 'p.13' },

    // ── V ──
    { term: 'Visible', definition: 'A Path of Attack can be drawn without being fully blocked by a Barrier.', page: 'p.24' },
    { term: 'Vulnerable', definition: 'All Skills except Tech are reduced to 0.', page: 'p.34', highlight: true },

    // ── W ──
    { term: 'Walking Fire', definition: 'A penalty applied to Rapid actions targeting multiple models.', page: 'p.41', highlight: true },
    { term: 'Wound', definition: 'A wounded character replaces one Action Token with a RED token. If unable to do so, he is eliminated. A Gonk is eliminated by a single wound.', page: 'p.28', highlight: true },
    { term: 'Wounded', definition: 'A wounded character replaces one Action Token with a RED token. If unable to do so, he is eliminated. A Gonk is eliminated by a single wound.', page: 'p.28', highlight: true },
];

// ── Lookup map (lowercase term → entry) ──

export const GLOSSARY_LOOKUP = new Map<string, GlossaryEntry>(
    GLOSSARY.map(e => [e.term.toLowerCase(), e]),
);

/** Find glossary entry by matched text (case-insensitive) */
export function findGlossaryEntry(word: string): GlossaryEntry | undefined {
    return GLOSSARY_LOOKUP.get(word.toLowerCase());
}

// ── Highlight regex ──

function escapeRegex(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const highlightTerms = GLOSSARY
    .filter(e => e.highlight && !e.term.startsWith('[')) // skip [RE]action for \b regex
    .map(e => e.term)
    .sort((a, b) => b.length - a.length); // longest first for correct alternation

/**
 * Pre-compiled regex to detect highlighted glossary terms in text.
 * Sorted longest-first so "Deadly Crits" matches before "Deadly".
 */
export const GLOSSARY_HIGHLIGHT_REGEX: RegExp | null = highlightTerms.length > 0
    ? new RegExp(`\\b(${highlightTerms.map(escapeRegex).join('|')})\\b`, 'gi')
    : null;

/**
 * Separate regex for [RE]action / [RE]act / [RE]acts
 */
export const REACT_TERM_REGEX = /\[RE\]act(?:ion|s)?/gi;
