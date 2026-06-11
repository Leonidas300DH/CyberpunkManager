import type { SkillType } from '@/types';

// Single source of truth for skill icon assets.
// Supabase Storage icons are used on all cards/tiles; the local PNGs under
// /images/Skills Icons/ are a distinct asset set used only by ObjectiveCard.
// The local PNGs have an ~3px invisible border compensated with -my-[3px]
// on every <img> — keep that class wherever these icons are rendered.

const SKILL_ICON_BASE = 'https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/app-images/skills';

// color is currently unused by consumers but kept for API stability.
export const SKILL_ICONS: Record<string, { src: string; color: string }> = {
    Ranged:    { src: `${SKILL_ICON_BASE}/ranged.png`,    color: '#9333ea' },
    Melee:     { src: `${SKILL_ICON_BASE}/melee.png`,     color: '#a855f7' },
    Reflexes:  { src: `${SKILL_ICON_BASE}/reflexes.png`,  color: '#d946ef' },
    Medical:   { src: `${SKILL_ICON_BASE}/medical.png`,   color: '#ec4899' },
    Tech:      { src: `${SKILL_ICON_BASE}/tech.png`,      color: '#8b5cf6' },
    Influence: { src: `${SKILL_ICON_BASE}/influence.png`, color: '#c026d3' },
};

export const SKILL_ICON: Record<string, string> = Object.fromEntries(
    Object.entries(SKILL_ICONS).map(([k, v]) => [k, v.src]),
);

// Local PNG set — ObjectiveCard only.
export const SKILL_ICON_LOCAL: Record<string, string> = {
    Reflexes: '/images/Skills Icons/reflexes.png',
    Ranged: '/images/Skills Icons/ranged.png',
    Melee: '/images/Skills Icons/melee.png',
    Medical: '/images/Skills Icons/medical.png',
    Tech: '/images/Skills Icons/tech.png',
    Influence: '/images/Skills Icons/influence.png',
};

export const SKILL_ORDER: SkillType[] = ['Ranged', 'Melee', 'Reflexes', 'Medical', 'Tech', 'Influence'];
