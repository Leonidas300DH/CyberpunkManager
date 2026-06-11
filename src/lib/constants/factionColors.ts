// Single source of truth for faction signature colors.
// IMPORTANT (Tailwind 4): every class must appear as a full literal string —
// never build class names by concatenation or .replace(), or the purge drops them.

// Border classes — superset: 15 factions + objective decks + 'all'/'universal'.
export const FACTION_BORDER_CLASS: Record<string, string> = {
    'faction-arasaka': 'border-red-600',
    'faction-bozos': 'border-purple-500',
    'faction-danger-gals': 'border-pink-400',
    'faction-edgerunners': 'border-emerald-500',
    'faction-gen-red': 'border-white',
    'faction-lawmen': 'border-blue-500',
    'faction-maelstrom': 'border-red-700',
    'faction-trauma-team': 'border-white',
    'faction-tyger-claws': 'border-cyan-400',
    'faction-zoners': 'border-orange-500',
    'faction-6th-street': 'border-amber-500',
    'faction-max-tac': 'border-indigo-400',
    'faction-militech': 'border-lime-500',
    'faction-piranhas': 'border-teal-400',
    'faction-wild-things': 'border-rose-500',
    'deck-corpo-crimes': 'border-red-500',
    'deck-public-enemies': 'border-violet-500',
    'deck-street-justice': 'border-yellow-500',
    'all': 'border-gray-500',
    'universal': 'border-gray-500',
};

// Background classes — same coverage as FACTION_BORDER_CLASS.
export const FACTION_BG_CLASS: Record<string, string> = {
    'faction-arasaka': 'bg-red-600',
    'faction-bozos': 'bg-purple-500',
    'faction-danger-gals': 'bg-pink-400',
    'faction-edgerunners': 'bg-emerald-500',
    'faction-gen-red': 'bg-white',
    'faction-lawmen': 'bg-blue-500',
    'faction-maelstrom': 'bg-red-700',
    'faction-trauma-team': 'bg-white',
    'faction-tyger-claws': 'bg-cyan-400',
    'faction-zoners': 'bg-orange-500',
    'faction-6th-street': 'bg-amber-500',
    'faction-max-tac': 'bg-indigo-400',
    'faction-militech': 'bg-lime-500',
    'faction-piranhas': 'bg-teal-400',
    'faction-wild-things': 'bg-rose-500',
    'deck-corpo-crimes': 'bg-red-500',
    'deck-public-enemies': 'bg-violet-500',
    'deck-street-justice': 'bg-yellow-500',
    'all': 'bg-gray-500',
    'universal': 'bg-gray-500',
};

// Text classes (faction-colored text on dark background).
export const FACTION_TEXT_CLASS: Record<string, string> = {
    'faction-arasaka': 'text-red-600',
    'faction-bozos': 'text-purple-500',
    'faction-danger-gals': 'text-pink-400',
    'faction-edgerunners': 'text-emerald-500',
    'faction-gen-red': 'text-white',
    'faction-lawmen': 'text-blue-500',
    'faction-maelstrom': 'text-red-700',
    'faction-trauma-team': 'text-white',
    'faction-tyger-claws': 'text-cyan-400',
    'faction-zoners': 'text-orange-500',
    'faction-6th-street': 'text-amber-500',
    'faction-max-tac': 'text-indigo-400',
    'faction-militech': 'text-lime-500',
    'faction-piranhas': 'text-teal-400',
    'faction-wild-things': 'text-rose-500',
    'all': 'text-gray-500',
    'universal': 'text-gray-500',
};

// Text color to use ON TOP of a faction-colored background (light backgrounds need black text).
export const FACTION_ON_BG_TEXT_CLASS: Record<string, string> = {
    'faction-gen-red': 'text-black',
    'faction-trauma-team': 'text-black',
    'faction-danger-gals': 'text-black',
    'faction-tyger-claws': 'text-black',
    'faction-6th-street': 'text-black',
    'faction-militech': 'text-black',
    'faction-edgerunners': 'text-black',
    'faction-piranhas': 'text-black',
    'deck-street-justice': 'text-black',
};

// {border, bg, text} trio (FactionsTab) — derived from the maps above for the 15 base factions.
const FACTION_IDS = [
    'faction-arasaka', 'faction-bozos', 'faction-danger-gals', 'faction-edgerunners',
    'faction-gen-red', 'faction-lawmen', 'faction-maelstrom', 'faction-trauma-team',
    'faction-tyger-claws', 'faction-zoners', 'faction-6th-street', 'faction-max-tac',
    'faction-militech', 'faction-piranhas', 'faction-wild-things',
] as const;

export const FACTION_COLOR_TRIO: Record<string, { border: string; bg: string; text: string }> =
    Object.fromEntries(FACTION_IDS.map(id => [id, {
        border: FACTION_BORDER_CLASS[id],
        bg: FACTION_BG_CLASS[id],
        text: FACTION_TEXT_CLASS[id],
    }]));

export const DEFAULT_FACTION_COLOR = { border: 'border-gray-500', bg: 'bg-gray-500', text: 'text-gray-500' };

// Hex sidebar colors (WeaponCard/WeaponTile/ArmoryContent sidebars).
// Deliberately NOT extended to max-tac/militech/piranhas/wild-things — they fall back to #666666 today.
export const FACTION_SIDEBAR_COLOR: Record<string, string> = {
    'universal': '#666666',
    'faction-arasaka': '#dc2626',
    'faction-bozos': '#a855f7',
    'faction-danger-gals': '#f472b6',
    'faction-edgerunners': '#10b981',
    'faction-gen-red': '#ffffff',
    'faction-lawmen': '#3b82f6',
    'faction-maelstrom': '#b91c1c',
    'faction-trauma-team': '#ffffff',
    'faction-tyger-claws': '#22d3ee',
    'faction-zoners': '#f97316',
    'faction-6th-street': '#f59e0b',
};

export function getSidebarGradient(factionId: string): string {
    const color = FACTION_SIDEBAR_COLOR[factionId] ?? '#666666';
    return `linear-gradient(to bottom, ${color} 40%, #ffffff)`;
}

// Identity rail gradients (CharacterCard left rail).
export const FACTION_RAIL_COLORS: Record<string, { dark: string; mid: string; light: string }> = {
    'faction-arasaka':     { dark: '#4a0000', mid: '#b91c1c', light: '#f87171' },
    'faction-bozos':       { dark: '#3b0764', mid: '#a855f7', light: '#d8b4fe' },
    'faction-danger-gals': { dark: '#4a0028', mid: '#f472b6', light: '#fbcfe8' },
    'faction-edgerunners': { dark: '#003322', mid: '#10b981', light: '#6ee7b7' },
    'faction-gen-red':     { dark: '#1a1a1a', mid: '#a0a0a0', light: '#e0e0e0' },
    'faction-lawmen':      { dark: '#001a4a', mid: '#3b82f6', light: '#93c5fd' },
    'faction-maelstrom':   { dark: '#3a0000', mid: '#b91c1c', light: '#dc2626' },
    'faction-trauma-team': { dark: '#1a1a1a', mid: '#a0a0a0', light: '#e0e0e0' },
    'faction-tyger-claws': { dark: '#003a3a', mid: '#22d3ee', light: '#a5f3fc' },
    'faction-zoners':      { dark: '#3a1a00', mid: '#f97316', light: '#fdba74' },
    'faction-6th-street':  { dark: '#3a2a00', mid: '#f59e0b', light: '#fcd34d' },
    'faction-max-tac':     { dark: '#000d1a', mid: '#1d4ed8', light: '#3b82f6' },
    'faction-piranhas':    { dark: '#3a1a00', mid: '#f97316', light: '#fdba74' },
    'faction-militech':    { dark: '#1a2a1a', mid: '#4ade80', light: '#86efac' },
    'faction-wild-things': { dark: '#2a1a00', mid: '#d97706', light: '#fbbf24' },
};

export const DEFAULT_RAIL = { dark: '#1a1a1a', mid: '#8a8a8a', light: '#e0e0e0' };

// Faction keyword names (must match actual profile keywords for reordering).
export const FACTION_DISPLAY_NAMES: Record<string, string> = {
    'faction-arasaka': 'Arasaka', 'faction-bozos': 'Bozo', 'faction-danger-gals': 'Danger Gal',
    'faction-edgerunners': 'Edgerunner', 'faction-gen-red': 'Gen Red', 'faction-lawmen': 'Lawman',
    'faction-maelstrom': 'Maelstrom', 'faction-max-tac': 'Max-Tac', 'faction-militech': 'Militech',
    'faction-piranhas': 'Piranha', 'faction-trauma-team': 'Trauma Team', 'faction-tyger-claws': 'Tyger Claw',
    'faction-wild-things': 'Wild Thing', 'faction-zoners': 'Zoner', 'faction-6th-street': '6th Street',
};
