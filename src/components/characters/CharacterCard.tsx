'use client';

import React from 'react';
import { ModelLineage, ModelProfile, SkillType, RangeType, Weapon } from '@/types';
import { GLOSSARY_HIGHLIGHT_REGEX, REACT_TERM_REGEX, findGlossaryEntry } from '@/lib/glossary';
import { GlossaryTooltip } from '@/components/ui/GlossaryTooltip';
import { GlitchCanvas } from '@/components/effects/GlitchCanvas';
import { Edit, Trash2 } from 'lucide-react';

// ── Faction colors for the Identity Rail ──
const FACTION_RAIL_COLORS: Record<string, { dark: string; mid: string; light: string }> = {
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
};
const DEFAULT_RAIL = { dark: '#1a1a1a', mid: '#8a8a8a', light: '#e0e0e0' };

// ── Color words ──
const COLOR_WORDS: Record<string, string> = {
    RED: '#dc2626',
    YELLOW: '#eab308',
    GREEN: '#22c55e',
};

// ── Glossary term linking ──

function linkGlossaryTerms(text: string, keyBase: number): React.ReactNode[] {
    if (!GLOSSARY_HIGHLIGHT_REGEX && !REACT_TERM_REGEX) return [text];
    const matches: Array<{ index: number; length: number; word: string }> = [];
    if (GLOSSARY_HIGHLIGHT_REGEX) {
        const re = new RegExp(GLOSSARY_HIGHLIGHT_REGEX.source, 'gi');
        let m: RegExpExecArray | null;
        while ((m = re.exec(text)) !== null) {
            matches.push({ index: m.index, length: m[0].length, word: m[0] });
        }
    }
    {
        const re = new RegExp(REACT_TERM_REGEX.source, 'gi');
        let m: RegExpExecArray | null;
        while ((m = re.exec(text)) !== null) {
            matches.push({ index: m.index, length: m[0].length, word: m[0] });
        }
    }
    if (matches.length === 0) return [text];
    matches.sort((a, b) => a.index - b.index || b.length - a.length);
    const deduped: typeof matches = [];
    for (const m of matches) {
        const prev = deduped[deduped.length - 1];
        if (prev && m.index < prev.index + prev.length) continue;
        deduped.push(m);
    }
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let k = keyBase;
    for (const m of deduped) {
        if (m.index > lastIndex) parts.push(text.slice(lastIndex, m.index));
        const lookupWord = m.word.startsWith('[') ? '[RE]action' : m.word;
        const entry = findGlossaryEntry(lookupWord);
        if (entry) {
            parts.push(<GlossaryTooltip key={`g${k++}`} entry={entry}>{m.word}</GlossaryTooltip>);
        } else {
            parts.push(m.word);
        }
        lastIndex = m.index + m.length;
    }
    if (lastIndex < text.length) parts.push(text.slice(lastIndex));
    return parts;
}

/** Colorize RED/YELLOW/GREEN words (bold + colored), then link glossary terms */
function formatCardText(text: string, keyBase: number): React.ReactNode[] {
    const colorRe = /\b(RED|YELLOW|GREEN)\b/g;
    const afterColors: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = colorRe.exec(text)) !== null) {
        if (match.index > lastIndex) {
            afterColors.push(text.slice(lastIndex, match.index));
        }
        const word = match[1];
        afterColors.push(
            <span
                key={`clr${match.index}`}
                className="font-bold"
                style={{ color: COLOR_WORDS[word], WebkitTextStroke: '0.3px rgba(255,255,255,0.4)' }}
            >
                {word}
            </span>,
        );
        lastIndex = colorRe.lastIndex;
    }
    if (lastIndex < text.length) {
        afterColors.push(text.slice(lastIndex));
    }
    // For each remaining string segment, detect glossary terms
    const result: React.ReactNode[] = [];
    let keyCounter = keyBase;
    for (const part of afterColors) {
        if (typeof part === 'string') {
            result.push(...linkGlossaryTerms(part, keyCounter));
            keyCounter += 200;
        } else {
            result.push(part);
        }
    }
    return result;
}

// ── Config ──

const SKILL_ICONS: Record<string, { src: string; color: string }> = {
    Ranged:    { src: 'https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/app-images/skills/ranged.png',    color: '#9333ea' },
    Melee:     { src: 'https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/app-images/skills/melee.png',     color: '#a855f7' },
    Reflexes:  { src: 'https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/app-images/skills/reflexes.png',  color: '#d946ef' },
    Medical:   { src: 'https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/app-images/skills/medical.png',   color: '#ec4899' },
    Tech:      { src: 'https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/app-images/skills/tech.png',      color: '#8b5cf6' },
    Influence: { src: 'https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/app-images/skills/influence.png', color: '#c026d3' },
};

const SKILL_ORDER: SkillType[] = ['Ranged', 'Melee', 'Reflexes', 'Medical', 'Tech', 'Influence'];

// ── Sub-components ──

/** Single action token shape: green=pentagon, yellow=inverted triangle, red=square */
function ActionTokenShape({ color, size = 31 }: { color: 'green' | 'yellow' | 'red'; size?: number }) {
    const fills = { green: '#22c55e', yellow: '#eab308', red: '#dc2626' };
    const fill = fills[color];

    if (color === 'green') {
        // Inverted pentagon (pointe en bas)
        const cx = size / 2;
        const cy = size / 2;
        const r = size * 0.42;
        const pts = Array.from({ length: 5 }, (_, i) => {
            const angle = (2 * Math.PI / 5) * i + Math.PI / 2;
            return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
        }).join(' ');
        return (
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ filter: 'drop-shadow(1.5px 1.5px 1px rgba(0,0,0,0.4))' }}>
                <polygon points={pts} fill={fill} stroke="black" strokeWidth="1.2" />
            </svg>
        );
    }

    if (color === 'yellow') {
        // Inverted triangle (pointe en bas)
        const s = size;
        const pts = `${s * 0.1},${s * 0.15} ${s * 0.9},${s * 0.15} ${s * 0.5},${s * 0.88}`;
        return (
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ filter: 'drop-shadow(1.5px 1.5px 1px rgba(0,0,0,0.4))' }}>
                <polygon points={pts} fill={fill} stroke="black" strokeWidth="1.2" />
            </svg>
        );
    }

    // Red: rounded square
    const inset = size * 0.12;
    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <rect x={inset} y={inset} width={size - inset * 2} height={size - inset * 2}
                fill={fill} stroke="black" strokeWidth="1.2" rx="2" />
        </svg>
    );
}

const RA = {
    red:    '1,1 44,1 49,11 44,21 5,21',
    yellow: '52,1 95,1 100,11 95,21 52,21 57,11',
    green:  '103,1 145,1 150,11 145,21 103,21 108,11',
    long:   '153,1 218,1 223,11 218,21 153,21 158,11',
    plusCx: 188,
};

/** Range arrows (interlocking chevrons) */
function RangeArrows({ range }: { range: RangeType }) {
    if (range === 'Self' || range === 'Reach') return null;

    const OFF = 'rgba(100,100,100,0.35)';
    const OFF_STROKE = 'rgba(255,255,255,0.3)';
    const ON_STROKE = 'white';

    const yellowActive = ['Yellow', 'Green', 'Long'].includes(range);
    const greenActive = ['Green', 'Long'].includes(range);
    const hasLong = range === 'Long';

    return (
        <svg viewBox="0 0 228 22" className="w-full h-auto" fill="none">
            <polygon points={RA.red}
                fill="#dc2626" stroke={ON_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
            <polygon points={RA.yellow}
                fill={yellowActive ? '#eab308' : OFF}
                stroke={yellowActive ? ON_STROKE : OFF_STROKE} strokeWidth="1.5" strokeLinejoin="round"
                opacity={yellowActive ? 1 : 0.5} />
            <polygon points={RA.green}
                fill={greenActive ? '#22c55e' : OFF}
                stroke={greenActive ? ON_STROKE : OFF_STROKE} strokeWidth="1.5" strokeLinejoin="round"
                opacity={greenActive ? 1 : 0.5} />
            {hasLong && (
                <>
                    <polygon points={RA.long}
                        fill="#111111" stroke={ON_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
                    <line x1={RA.plusCx} y1="8" x2={RA.plusCx} y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1={RA.plusCx - 3} y1="11" x2={RA.plusCx + 3} y2="11" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </>
            )}
        </svg>
    );
}

/** Range arrows from weapon booleans (for weapon-linked actions) */
function WeaponRangeArrowsCC({ rangeRed, rangeYellow, rangeGreen, rangeLong }: {
    rangeRed: boolean; rangeYellow: boolean; rangeGreen: boolean; rangeLong: boolean;
}) {
    if (!rangeRed && !rangeYellow && !rangeGreen && !rangeLong) return null;
    const OFF = 'rgba(100,100,100,0.35)';
    const OFF_STROKE = 'rgba(255,255,255,0.3)';
    const ON_STROKE = 'white';
    return (
        <svg viewBox="0 0 228 22" className="w-full h-auto" fill="none">
            <polygon points={RA.red}
                fill={rangeRed ? '#dc2626' : OFF}
                stroke={rangeRed ? ON_STROKE : OFF_STROKE} strokeWidth="1.5" strokeLinejoin="round"
                opacity={rangeRed ? 1 : 0.5} />
            <polygon points={RA.yellow}
                fill={rangeYellow ? '#eab308' : OFF}
                stroke={rangeYellow ? ON_STROKE : OFF_STROKE} strokeWidth="1.5" strokeLinejoin="round"
                opacity={rangeYellow ? 1 : 0.5} />
            <polygon points={RA.green}
                fill={rangeGreen ? '#22c55e' : OFF}
                stroke={rangeGreen ? ON_STROKE : OFF_STROKE} strokeWidth="1.5" strokeLinejoin="round"
                opacity={rangeGreen ? 1 : 0.5} />
            {rangeLong && (
                <>
                    <polygon points={RA.long}
                        fill="#111111" stroke={ON_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
                    <line x1={RA.plusCx} y1="8" x2={RA.plusCx} y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1={RA.plusCx - 3} y1="11" x2={RA.plusCx + 3} y2="11" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </>
            )}
        </svg>
    );
}

/** Small armor badge for weapon-linked actions */
function ArmorBadgeSmall({ value }: { value: number }) {
    return (
        <div className="relative shrink-0 w-9 h-9 flex items-center justify-center -my-[2px]">
            <svg className="w-[22px] h-[22px] absolute inset-0 m-auto" viewBox="0 0 40 40" fill="none">
                <path d="M20 4L6 10v10c0 9 5.6 16.8 14 19 8.4-2.2 14-10 14-19V10L20 4z" fill="black" stroke="#3b82f6" strokeWidth="2.5" />
            </svg>
            <span className="relative z-10 font-display font-black text-[10px] text-white leading-none drop-shadow-[0_0_4px_rgba(0,0,0,0.9)]">{value}</span>
        </div>
    );
}

/** Skill icon badge — compact */
function StatHex({ value, iconSrc }: { value: number; iconSrc: string }) {
    return (
        <div className="flex items-center -gap-px -my-[2px]">
            <span className="w-3 text-center font-display font-black text-xs text-white leading-none drop-shadow-[0_0_4px_rgba(0,0,0,0.9)] [-webkit-text-stroke:0.5px_rgba(0,0,0,0.6)] -mr-0.5">
                {value}
            </span>
            <img src={iconSrc} alt="" className="w-7 h-7 object-contain" />
        </div>
    );
}

/** Armor badge — compact */
function ArmorHex({ value }: { value: number }) {
    return (
        <div className="flex items-center -gap-px -my-[2px]">
            <span className="w-3 text-center font-display font-black text-xs text-white leading-none drop-shadow-[0_0_4px_rgba(0,0,0,0.9)] [-webkit-text-stroke:0.5px_rgba(0,0,0,0.6)] -mr-0.5">
                {value}
            </span>
            <div className="w-7 h-7 flex items-center justify-start pl-[3px]">
            <svg className="w-[22px] h-[22px]" viewBox="0 0 40 40" fill="none">
                <path d="M20 4L6 10v10c0 9 5.6 16.8 14 19 8.4-2.2 14-10 14-19V10L20 4z"
                    fill="#3b82f6" stroke="#1e3a5f" strokeWidth="2" />
                <path d="M20 8L10 12.5v7.5c0 6.8 4.2 12.6 10 14.2 5.8-1.6 10-7.4 10-14.2v-7.5L20 8z"
                    fill="#60a5fa" stroke="#2563eb" strokeWidth="1" />
                <path d="M20 4L6 10v10c0 9 5.6 16.8 14 19 8.4-2.2 14-10 14-19V10L20 4z"
                    fill="url(#armorShine)" />
                <defs>
                    <linearGradient id="armorShine" x1="6" y1="4" x2="34" y2="40">
                        <stop offset="0%" stopColor="white" stopOpacity="0.3" />
                        <stop offset="50%" stopColor="white" stopOpacity="0" />
                    </linearGradient>
                </defs>
            </svg>
            </div>
        </div>
    );
}

/** Parse "Name: description" from passiveRules string */
function parsePassiveRules(text: string): Array<{ name: string; description: string }> {
    if (!text) return [];
    const colonIdx = text.indexOf(': ');
    if (colonIdx > 0 && colonIdx < 30) {
        const name = text.slice(0, colonIdx);
        // Verify the name part looks like a title (starts with uppercase, no long sentences)
        if (/^[A-Z]/.test(name) && !name.includes('.')) {
            return [{ name, description: text.slice(colonIdx + 2) }];
        }
    }
    return [{ name: '', description: text }];
}

// ── Main Component ──

interface CharacterCardProps {
    lineage: ModelLineage;
    profile: ModelProfile;
    hideTokens?: boolean;
    enableGlitch?: boolean;
    /** 0 (healthy) to 1 (red-lined). Drives glitch intensity. */
    glitchDamage?: number;
    /** KIA — permanent static snow. */
    isKIA?: boolean;
    /** Increment to trigger an immediate glitch (on wound). */
    triggerGlitch?: number;
    isAdmin?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
    /** Catalog weapons for weapon-linked action rendering */
    catalogWeapons?: Weapon[];
}

export function CharacterCard({ lineage, profile, hideTokens = false, enableGlitch = false, glitchDamage = 0, isKIA = false, triggerGlitch = 0, isAdmin = false, onEdit, onDelete, catalogWeapons }: CharacterCardProps) {

    // Weapon lookup for weapon-linked actions
    const resolveWeapon = (weaponId?: string): Weapon | undefined =>
        weaponId ? (catalogWeapons ?? []).find(w => w.id === weaponId) : undefined;

    // Faction rail color
    const rail = FACTION_RAIL_COLORS[lineage.factionIds[0]] ?? DEFAULT_RAIL;

    // Archetype label: first keyword or lineage type
    const archetype = profile.keywords[0] || lineage.type;

    // Build action token list
    const tokens: Array<'green' | 'yellow' | 'red'> = [];
    for (let i = 0; i < profile.actionTokens.green; i++) tokens.push('green');
    for (let i = 0; i < profile.actionTokens.yellow; i++) tokens.push('yellow');
    for (let i = 0; i < profile.actionTokens.red; i++) tokens.push('red');

    // Visible stats (non-zero skills + armor)
    const visibleSkills = SKILL_ORDER
        .filter(skill => profile.skills[skill] > 0 && SKILL_ICONS[skill])
        .map(skill => ({ skill, value: profile.skills[skill], ...SKILL_ICONS[skill] }));

    // Stats box: auto-height from content (no fixed pixel height)

    // Parse passive rules
    const passives = parsePassiveRules(profile.passiveRules);

    return (
        <div className="group relative w-full aspect-[2/3] bg-black text-white font-sans overflow-hidden shadow-2xl rounded-md">
            {/* 1. Background Image */}
            {lineage.imageUrl && (
                enableGlitch ? (
                    <GlitchCanvas
                        imageUrl={lineage.imageUrl}
                        alt={lineage.name}
                        className="absolute inset-0 w-full h-full object-cover z-0"
                        damage={glitchDamage}
                        isKIA={isKIA}
                        triggerGlitch={triggerGlitch}
                    />
                ) : (
                    <img
                        src={lineage.imageUrl}
                        alt={lineage.name}
                        className="absolute inset-0 w-full h-full object-cover z-0"
                        style={(lineage.imageFlipY || lineage.imageFlipX) ? { transform: `${lineage.imageFlipX ? 'scaleX(-1)' : ''} ${lineage.imageFlipY ? 'scaleY(-1)' : ''}`.trim() } : undefined}
                    />
                )
            )}

            {/* Tier stars (Veteran = 1 star, Elite = 2 stars) */}
            {profile.level > 0 && (
                <div className="absolute top-1 left-1 z-20 flex gap-0.5">
                    {Array.from({ length: profile.level }, (_, i) => (
                        <span key={i} className="text-primary text-lg leading-none drop-shadow-[0_0_4px_rgba(252,238,10,0.8)]">★</span>
                    ))}
                </div>
            )}

            {/* Bottom gradient for text readability */}
            <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Scanline overlay */}
            <div className="absolute inset-0 z-[2] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.04)_2px,rgba(0,0,0,0.04)_4px)] pointer-events-none" />

            {/* 2. Left Identity Rail */}
            <div
                className="absolute left-0 top-0 bottom-0 w-[17%] z-10 flex flex-col items-center justify-between py-1"
                style={{
                    background: `linear-gradient(to bottom, ${rail.dark}, ${rail.mid} 50%, ${rail.light})`,
                }}
            >
                {/* Vertical Name (bottom-to-top, anchored above EB cost) */}
                <div
                    className="mt-auto flex flex-col items-start mb-2"
                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', lineHeight: 0.9, gap: 0 }}
                >
                    <span className="mr-[-2px] font-display text-xl uppercase tracking-normal text-black [-webkit-text-stroke:0.5px_rgba(255,255,255,0.6)]" style={{ fontWeight: 900 }}>
                        {lineage.name}
                    </span>
                    <span className="mr-[-4px] font-mono-tech text-[12px] text-black/80 uppercase tracking-wide [-webkit-text-stroke:0.5px_rgba(255,255,255,0.5)]" style={{ fontWeight: 900 }}>
                        {archetype}
                    </span>
                </div>

                {/* Cost at bottom */}
                <span className="font-mono-tech text-[11px] text-black font-black tracking-wider pb-1">
                    EB {profile.costEB}
                </span>
            </div>

            {/* 3. Action Token Chain (centered on rail) */}
            {!hideTokens && tokens.length > 0 && (
                <div className="absolute top-3 left-[8.5%] -translate-x-1/2 z-20 flex flex-col items-center">
                    {tokens.map((color, i) => (
                        <React.Fragment key={i}>
                            {i > 0 && (
                                <div className="-my-[3px] w-px h-2.5 bg-black/70" />
                            )}
                            <ActionTokenShape color={color} size={31} />
                        </React.Fragment>
                    ))}
                </div>
            )}

            {/* 4. Stats Column + Admin buttons (Top Right) — auto-height from content */}
            <div className="absolute top-2 right-1 z-20 flex items-start gap-1">
                {/* Admin Edit/Delete buttons — auto-positioned left of stats box */}
                {isAdmin && (onEdit || onDelete) && (
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onEdit && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                                className="p-1.5 bg-black/70 border border-white/40 rounded hover:bg-black/90 hover:border-white/70 transition-colors"
                            >
                                <Edit className="w-3.5 h-3.5 text-white" />
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                                className="p-1.5 bg-black/70 border border-white/40 rounded hover:bg-black/90 hover:border-white/70 transition-colors"
                            >
                                <Trash2 className="w-3.5 h-3.5 text-white" />
                            </button>
                        )}
                    </div>
                )}
                {/* Stats box */}
                <div
                    style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.6)) drop-shadow(0 0 12px rgba(255,255,255,0.3))' }}
                >
                    <div className="relative">
                        {/* Border layer (white, chamfered) — stretches to match content */}
                        <div
                            className="absolute inset-0"
                            style={{
                                background: 'rgba(255,255,255,0.5)',
                                clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
                            }}
                        />
                        {/* Content layer (black, inset by 1px) — relative, drives height */}
                        <div
                            className="relative flex flex-col items-center pl-0.5 pt-[3px] pb-[3px]"
                            style={{
                                margin: '1px',
                                background: 'rgba(0,0,0,0.82)',
                                clipPath: 'polygon(9px 0, 100% 0, 100% calc(100% - 9px), calc(100% - 9px) 100%, 0 100%, 0 9px)',
                            }}
                        >
                            {visibleSkills.map(({ skill, value, src }) => (
                                <StatHex key={skill} value={value} iconSrc={src} />
                            ))}
                            {profile.armor > 0 && <ArmorHex value={profile.armor} />}
                        </div>
                    </div>
                </div>
            </div>

            {/* 5. Bottom Ability Panel (single unified zone) */}
            <div
                className="absolute bottom-1 right-2 left-[19%] z-20"
                style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.5)) drop-shadow(0 0 14px rgba(255,255,255,0.25))' }}
            >
                <div
                    className="bg-black/80 backdrop-blur-sm border-[0.5px] border-white/30 px-3 py-px"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                >
                    {/* Passive Rules */}
                    {passives.map((passive, i) => (
                        passive.description && (
                            <div key={`p${i}`}>
                                {passive.name && (
                                    <div className="font-display font-black text-sm text-[#22c55e] uppercase tracking-wide">
                                        {formatCardText(passive.name, i * 100)}
                                    </div>
                                )}
                                <div className="font-body text-[11px] leading-snug text-white/90">
                                    {formatCardText(passive.description, i * 100 + 50)}
                                </div>
                            </div>
                        )
                    ))}

                    {/* Weapon / Action entries */}
                    {profile.actions.map((action, i) => {
                        const weapon = resolveWeapon(action.weaponId);
                        const src = weapon ? {
                            name: weapon.name,
                            skillReq: weapon.skillReq,
                            skillBonus: weapon.skillBonus,
                            grantsArmor: weapon.grantsArmor,
                            rangeRed: weapon.rangeRed,
                            rangeYellow: weapon.rangeYellow,
                            rangeGreen: weapon.rangeGreen,
                            rangeLong: weapon.rangeLong,
                            range2Red: weapon.range2Red,
                            range2Yellow: weapon.range2Yellow,
                            range2Green: weapon.range2Green,
                            range2Long: weapon.range2Long,
                            keywords: weapon.keywords,
                            description: weapon.description,
                        } : null;

                        if (src) {
                            const hasSkill = !!(src.skillReq && SKILL_ICONS[src.skillReq]);
                            const hasArmor = (src.grantsArmor ?? 0) > 0;
                            const hasRange = src.rangeRed || src.rangeYellow || src.rangeGreen || src.rangeLong;
                            const hasRange2 = src.range2Red || src.range2Yellow || src.range2Green || src.range2Long;
                            const lettrine = (hasSkill || hasArmor) && !hasRange;

                            const skillEl = hasSkill && (
                                <div className="flex items-center shrink-0">
                                    <img src={SKILL_ICONS[src.skillReq!].src} alt={src.skillReq!} className="w-12 h-12 -my-[3px] object-contain" />
                                    {src.skillBonus != null && src.skillBonus !== 0 && (
                                        <span className="font-display font-black text-xs text-white leading-none drop-shadow-[0_0_4px_rgba(0,0,0,0.9)] [-webkit-text-stroke:0.5px_rgba(0,0,0,0.6)] -ml-1">
                                            {src.skillBonus > 0 ? `+${src.skillBonus}` : src.skillBonus}
                                        </span>
                                    )}
                                </div>
                            );
                            const armorEl = hasArmor && (
                                <div className="relative shrink-0 w-9 h-9 flex items-center justify-center -my-[2px]">
                                    <svg className="w-[26px] h-[26px] absolute inset-0 m-auto" viewBox="0 0 40 40" fill="none">
                                        <path d="M20 4L6 10v10c0 9 5.6 16.8 14 19 8.4-2.2 14-10 14-19V10L20 4z" fill="black" stroke="#3b82f6" strokeWidth="2.5" />
                                    </svg>
                                    <span className="relative z-10 font-display font-black text-[11px] text-white leading-none drop-shadow-[0_0_4px_rgba(0,0,0,0.9)]">{src.grantsArmor}</span>
                                </div>
                            );

                            // Build description: keywords + description, but skip description
                            // if it only repeats the keywords (some weapons store keywords in both fields)
                            const kwText = src.keywords.length > 0 ? src.keywords.join('. ') : '';
                            const kwPhrases = new Set(src.keywords.map((k: string) => k.toLowerCase().trim()));
                            const descPhrases = (src.description ?? '')
                                .split(/[.,;]+/)
                                .map((s: string) => s.replace(/^[\s[\]()]+|[\s[\]()]+$/g, '').toLowerCase())
                                .filter(Boolean);
                            const descIsRedundant = descPhrases.length > 0 && descPhrases.every((p: string) => kwPhrases.has(p));
                            const descriptionText = descIsRedundant
                                ? kwText
                                : [kwText, src.description].filter(Boolean).join('. ');

                            return (
                                <div key={action.id}>
                                    <div className="font-display font-bold text-sm text-[#22c55e] uppercase leading-tight">
                                        {src.name}
                                    </div>
                                    {lettrine ? (
                                        <div className="-ml-2">
                                            <div className="float-left flex items-center mr-1">
                                                {skillEl}
                                                {armorEl}
                                            </div>
                                            <p className="font-body text-[11px] text-white/70 leading-snug">{formatCardText(descriptionText, (i + 10) * 100)}</p>
                                        </div>
                                    ) : (
                                        <>
                                            {(hasRange || hasSkill || hasArmor) && (
                                                <div className="-ml-2 flex items-center gap-2">
                                                    {skillEl}
                                                    {armorEl}
                                                    {hasRange && (
                                                        <div className="w-[60%]">
                                                            <WeaponRangeArrowsCC rangeRed={src.rangeRed} rangeYellow={src.rangeYellow} rangeGreen={src.rangeGreen} rangeLong={src.rangeLong} />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            <p className="font-body text-[11px] text-white/70 leading-snug line-clamp-2">{formatCardText(descriptionText, (i + 10) * 100)}</p>
                                        </>
                                    )}
                                    {hasRange2 && (
                                        <div className="-ml-2 flex items-center gap-2">
                                            {hasSkill && (
                                                <img src={SKILL_ICONS[src.skillReq!].src} alt={src.skillReq!} className="w-12 h-12 -my-[3px] shrink-0 object-contain" />
                                            )}
                                            <div className="w-[60%]">
                                                <WeaponRangeArrowsCC rangeRed={!!src.range2Red} rangeYellow={!!src.range2Yellow} rangeGreen={!!src.range2Green} rangeLong={!!src.range2Long} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        // ── Standard action rendering (no weaponId or weapon deleted) ──
                        return (
                            <div key={action.id}>
                                <div className="font-display font-black text-sm text-[#22c55e] uppercase tracking-wide">
                                    {action.name}
                                </div>
                                {action.range !== 'Self' && action.range !== 'Reach' ? (
                                    <>
                                        <div className="-ml-2 flex items-center gap-1.5">
                                            {action.skillReq && SKILL_ICONS[action.skillReq] && (
                                                <img src={SKILL_ICONS[action.skillReq].src} alt={action.skillReq} className="w-11 h-11 -my-[3px] shrink-0 object-contain" />
                                            )}
                                            <div className="w-[60%]">
                                                <RangeArrows range={action.range} />
                                            </div>
                                        </div>
                                        <div className="font-body text-[11px] leading-snug text-white/90">
                                            {action.keywords.length > 0 && (
                                                <span>
                                                    {action.keywords.map((kw, j) => (
                                                        <React.Fragment key={j}>
                                                            {j > 0 && '. '}
                                                            {formatCardText(kw, (i + 10) * 100 + j * 20)}
                                                        </React.Fragment>
                                                    ))}
                                                    {action.effectDescription ? '. ' : '.'}
                                                </span>
                                            )}
                                            {action.effectDescription && formatCardText(action.effectDescription, (i + 10) * 100 + 80)}
                                        </div>
                                    </>
                                ) : action.skillReq && SKILL_ICONS[action.skillReq] ? (
                                    <div className="-ml-2 flex items-center gap-1">
                                        <img src={SKILL_ICONS[action.skillReq].src} alt={action.skillReq} className="w-11 h-11 -my-[3px] shrink-0 object-contain" />
                                        <p className="font-body text-[11px] text-white/90 leading-snug">
                                            {action.keywords.length > 0 && (
                                                <span>
                                                    {action.keywords.map((kw, j) => (
                                                        <React.Fragment key={j}>
                                                            {j > 0 && '. '}
                                                            {formatCardText(kw, (i + 10) * 100 + j * 20)}
                                                        </React.Fragment>
                                                    ))}
                                                    {action.effectDescription ? '. ' : '.'}
                                                </span>
                                            )}
                                            {action.effectDescription && formatCardText(action.effectDescription, (i + 10) * 100 + 80)}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="font-body text-[11px] leading-snug text-white/90">
                                        {action.keywords.length > 0 && (
                                            <span>
                                                {action.keywords.map((kw, j) => (
                                                    <React.Fragment key={j}>
                                                        {j > 0 && '. '}
                                                        {formatCardText(kw, (i + 10) * 100 + j * 20)}
                                                    </React.Fragment>
                                                ))}
                                                {action.effectDescription ? '. ' : '.'}
                                            </span>
                                        )}
                                        {action.effectDescription && formatCardText(action.effectDescription, (i + 10) * 100 + 80)}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
