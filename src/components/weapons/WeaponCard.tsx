'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Weapon, FactionVariant } from '@/types';
import { useStore } from '@/store/useStore';
import { formatCardText } from '@/lib/formatCardText';
import { Edit, Trash2 } from 'lucide-react';

// --- Skill icon URLs (same as ArmoryContent) ---
const SKILL_ICONS: Record<string, string> = {
    Reflexes: 'https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/app-images/skills/reflexes.png',
    Ranged: 'https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/app-images/skills/ranged.png',
    Melee: 'https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/app-images/skills/melee.png',
    Medical: 'https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/app-images/skills/medical.png',
    Tech: 'https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/app-images/skills/tech.png',
    Influence: 'https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/app-images/skills/influence.png',
};

// --- Range arrow constants (single set — must match all 4 files) ---
const AP = {
    red:    '1,1 44,1 49,11 44,21 5,21',
    yellow: '52,1 95,1 100,11 95,21 52,21 57,11',
    green:  '103,1 145,1 150,11 145,21 103,21 108,11',
    long:   '153,1 218,1 223,11 218,21 153,21 158,11',
    plusCx: 188,
};
const OFF = 'rgba(100,100,100,0.35)';
const OFF_STROKE = 'rgba(255,255,255,0.3)';
const ON_STROKE = 'white';

const DEFAULT_WEAPON_IMAGE = 'https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/weapon-images/default.png';

const FACTION_TEXT_COLOR_MAP: Record<string, string> = {
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
    'all': 'text-gray-500',
    'universal': 'text-gray-500',
};

// --- Auto font size (same logic as ProgramCard) ---
const BASE_FONT = 14;
const MIN_FONT = 9;
const BOTTOM_MARGIN = 5;
const MAX_BOX_PCT = 80;

function useAutoFontSize(deps: unknown[]) {
    const cardRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const [fontSize, setFontSize] = useState(BASE_FONT);

    const recalc = useCallback(() => {
        const card = cardRef.current;
        const text = textRef.current;
        if (!card || !text) return;
        const cardH = card.clientHeight;
        const usableH = cardH * (1 - BOTTOM_MARGIN / 100);
        const maxH = usableH * (MAX_BOX_PCT / 100);
        let size = BASE_FONT;
        text.style.fontSize = `${size}px`;
        while (text.scrollHeight > maxH && size > MIN_FONT) {
            size -= 0.5;
            text.style.fontSize = `${size}px`;
        }
        // If text box is small (<15% of card height), bump font +1pt
        if (cardH > 0 && text.scrollHeight < cardH * 0.15 && size + 1 <= BASE_FONT) {
            size += 1;
            text.style.fontSize = `${size}px`;
        }
        setFontSize(size);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    useEffect(() => {
        recalc();
        const ro = new ResizeObserver(recalc);
        if (cardRef.current) ro.observe(cardRef.current);
        return () => ro.disconnect();
    }, [recalc]);

    return { cardRef, textRef, fontSize };
}

// --- Faction → sidebar hex color ---
const FACTION_SIDEBAR_COLOR: Record<string, string> = {
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
    return `linear-gradient(to bottom, #ffffff, ${color} 60%)`;
}

interface WeaponCardProps {
    weapon: Weapon;
    variant: FactionVariant;
    isAdmin?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
}

export function WeaponCard({ weapon, variant, isAdmin, onEdit, onDelete }: WeaponCardProps) {
    const { catalog } = useStore();
    const { cardRef, textRef, fontSize } = useAutoFontSize([weapon.id, variant.factionId]);

    const hasImage = !!weapon.imageUrl;
    const showRange = weapon.rangeRed || weapon.rangeYellow || weapon.rangeGreen || weapon.rangeLong;
    const showRange2 = weapon.range2Red || weapon.range2Yellow || weapon.range2Green || weapon.range2Long;
    const skillIcon = weapon.skillReq ? SKILL_ICONS[weapon.skillReq] ?? null : null;
    const hasArmor = weapon.grantsArmor != null && weapon.grantsArmor > 0;

    const variantFactionName = variant.factionId === 'universal'
        ? 'Universal'
        : (catalog.factions.find(f => f.id === variant.factionId)?.name ?? variant.factionId);
    const variantTextColor = FACTION_TEXT_COLOR_MAP[variant.factionId] ?? 'text-gray-500';

    const sidebarGradient = getSidebarGradient(variant.factionId);

    return (
        <div
            ref={cardRef}
            className="group relative w-full aspect-[2.5/3.5] bg-black text-white font-sans overflow-hidden shadow-2xl rounded-md"
        >
            {/* z-0: Full-bleed artwork or fallback */}
            {hasImage ? (
                <img
                    src={weapon.imageUrl}
                    alt={weapon.name}
                    className="absolute inset-0 w-full h-full object-cover z-0"
                />
            ) : (
                <div className="absolute inset-0 z-0 bg-black flex items-center justify-center">
                    <svg
                        width="40%"
                        height="40%"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="0.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-white/10"
                    >
                        {weapon.isWeapon ? (
                            <>
                                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="8" y1="13" x2="16" y2="13" />
                                <line x1="8" y1="17" x2="16" y2="17" />
                            </>
                        ) : (
                            <>
                                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                            </>
                        )}
                    </svg>
                </div>
            )}

            {/* Scanline overlay */}
            <div className="absolute inset-0 z-[1] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.04)_2px,rgba(0,0,0,0.04)_4px)] pointer-events-none" />

            {/* LEFT SIDEBAR — type color gradient */}
            <div
                className="absolute left-0 top-0 bottom-0 w-[14%] z-10 flex flex-col items-center justify-between py-3"
                style={{ background: sidebarGradient }}
            >
                {/* Stats at top */}
                <div className="flex flex-col items-center gap-0.5 pt-1">
                    <div className="font-display font-black text-2xl text-black leading-none">{variant.cost}</div>
                    <div className="font-mono-tech text-[9px] text-black/70 font-bold">EB</div>
                    {variant.rarity < 99 && (
                        <div className="font-mono-tech text-[8px] text-black/60 font-bold mt-1">Rar.{variant.rarity}</div>
                    )}
                    {(variant.reqStreetCred ?? 0) > 0 && (
                        <div className="text-black flex items-center gap-0.5 mt-0.5">
                            <span className="text-xs">★</span>
                            <span className="font-display font-black text-sm leading-none">{variant.reqStreetCred}</span>
                        </div>
                    )}
                </div>

                {/* Vertical name — aligned bottom so long names have room */}
                <div
                    className="flex flex-col items-center gap-0 flex-1 justify-end min-h-0 overflow-hidden"
                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                >
                    <span
                        className="font-display font-black text-sm uppercase tracking-widest text-black drop-shadow-sm"
                        style={{ marginRight: '-2px' }}
                    >
                        {weapon.name}
                    </span>
                    <span
                        className="font-mono-tech text-[7px] text-black/50 uppercase tracking-[0.15em] font-bold shrink-0"
                        style={{ marginLeft: '-2px' }}
                    >
                        {variantFactionName}
                    </span>
                </div>
            </div>

            {/* Admin buttons (top right overlay) */}
            {isAdmin && (onEdit || onDelete) && (
                <div className="absolute top-1 right-1 z-30 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onEdit && (
                        <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1.5 bg-black/70 border border-border rounded text-muted-foreground hover:text-secondary hover:border-secondary transition-colors">
                            <Edit className="w-3.5 h-3.5" />
                        </button>
                    )}
                    {onDelete && (
                        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 bg-black/70 border border-border rounded text-muted-foreground hover:text-accent hover:border-accent transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            )}

            {/* BOTTOM CONTENT BOX — same layout as list view */}
            <div
                className="absolute bottom-[3%] left-[16%] right-[2%] z-20"
                style={{
                    maxHeight: '70%',
                    filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.5)) drop-shadow(0 0 14px rgba(255,255,255,0.25))',
                }}
            >
                <div
                    ref={textRef}
                    className="w-full bg-black/80 backdrop-blur-sm border-[0.5px] border-white/30 px-3 py-2 flex flex-col gap-0.5"
                    style={{
                        clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%)',
                        fontSize: `${fontSize}px`,
                    }}
                >
                    {/* Skill icon + armor + range (lettrine logic from list view) */}
                    {(() => {
                        const lettrine = (!!skillIcon || hasArmor) && !showRange;

                        const skillEl = skillIcon && (
                            <div className="flex items-center shrink-0">
                                <img src={skillIcon} alt={weapon.skillReq!} className="w-12 h-12 -my-[3px] object-contain" />
                                {weapon.skillBonus != null && weapon.skillBonus !== 0 && (
                                    <span className="font-display font-black text-xs text-white leading-none drop-shadow-[0_0_4px_rgba(0,0,0,0.9)] [-webkit-text-stroke:0.5px_rgba(0,0,0,0.6)] -ml-1">{weapon.skillBonus > 0 ? `+${weapon.skillBonus}` : weapon.skillBonus}</span>
                                )}
                            </div>
                        );
                        const armorEl = hasArmor && (
                            <div className="relative shrink-0 w-9 h-9 flex items-center justify-center -my-[2px]">
                                <svg className="w-[26px] h-[26px] absolute inset-0 m-auto" viewBox="0 0 40 40" fill="none">
                                    <path d="M20 4L6 10v10c0 9 5.6 16.8 14 19 8.4-2.2 14-10 14-19V10L20 4z" fill="black" stroke="#3b82f6" strokeWidth="2.5" />
                                </svg>
                                <span className="relative z-10 font-display font-black text-[11px] text-white leading-none drop-shadow-[0_0_4px_rgba(0,0,0,0.9)]">{weapon.grantsArmor}</span>
                            </div>
                        );

                        if (lettrine) {
                            return (
                                <div className="-ml-2">
                                    <div className="float-left flex items-center mr-1">
                                        {skillEl}
                                        {armorEl}
                                    </div>
                                    <p className="text-[11px] font-mono-tech text-white/70 leading-snug">{formatCardText(weapon.description)}</p>
                                </div>
                            );
                        }
                        return (
                            <>
                                {(showRange || skillIcon || hasArmor) && (
                                    <div className="-ml-2 flex items-center gap-2">
                                        {skillEl}
                                        {armorEl}
                                        {showRange && (
                                            <div className="w-[60%]">
                                                <svg viewBox="0 0 228 22" className="w-full h-auto" fill="none">
                                                    <polygon points={AP.red} fill={weapon.rangeRed ? '#dc2626' : OFF} stroke={weapon.rangeRed ? ON_STROKE : OFF_STROKE} strokeWidth="1.5" strokeLinejoin="round" opacity={weapon.rangeRed ? 1 : 0.5} />
                                                    <polygon points={AP.yellow} fill={weapon.rangeYellow ? '#eab308' : OFF} stroke={weapon.rangeYellow ? ON_STROKE : OFF_STROKE} strokeWidth="1.5" strokeLinejoin="round" opacity={weapon.rangeYellow ? 1 : 0.5} />
                                                    <polygon points={AP.green} fill={weapon.rangeGreen ? '#22c55e' : OFF} stroke={weapon.rangeGreen ? ON_STROKE : OFF_STROKE} strokeWidth="1.5" strokeLinejoin="round" opacity={weapon.rangeGreen ? 1 : 0.5} />
                                                    {weapon.rangeLong && (
                                                        <>
                                                            <polygon points={AP.long} fill="#111111" stroke={ON_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
                                                            <line x1={AP.plusCx} y1="8" x2={AP.plusCx} y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                                            <line x1={AP.plusCx - 3} y1="11" x2={AP.plusCx + 3} y2="11" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                                        </>
                                                    )}
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <p className="text-[11px] font-mono-tech text-white/70 leading-snug">{formatCardText(weapon.description)}</p>
                            </>
                        );
                    })()}
                    {/* Range 2 */}
                    {showRange2 && (
                        <div className="-ml-2 flex items-center gap-2">
                            {skillIcon && (
                                <img src={skillIcon} alt={weapon.skillReq!} className="w-12 h-12 -my-[3px] shrink-0 object-contain" />
                            )}
                            <div className="w-[60%]">
                                <svg viewBox="0 0 228 22" className="w-full h-auto" fill="none">
                                    <polygon points={AP.red} fill={weapon.range2Red ? '#dc2626' : OFF} stroke={weapon.range2Red ? ON_STROKE : OFF_STROKE} strokeWidth="1.5" strokeLinejoin="round" opacity={weapon.range2Red ? 1 : 0.5} />
                                    <polygon points={AP.yellow} fill={weapon.range2Yellow ? '#eab308' : OFF} stroke={weapon.range2Yellow ? ON_STROKE : OFF_STROKE} strokeWidth="1.5" strokeLinejoin="round" opacity={weapon.range2Yellow ? 1 : 0.5} />
                                    <polygon points={AP.green} fill={weapon.range2Green ? '#22c55e' : OFF} stroke={weapon.range2Green ? ON_STROKE : OFF_STROKE} strokeWidth="1.5" strokeLinejoin="round" opacity={weapon.range2Green ? 1 : 0.5} />
                                    {weapon.range2Long && (
                                        <>
                                            <polygon points={AP.long} fill="#111111" stroke={ON_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
                                            <line x1={AP.plusCx} y1="8" x2={AP.plusCx} y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                            <line x1={AP.plusCx - 3} y1="11" x2={AP.plusCx + 3} y2="11" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                        </>
                                    )}
                                </svg>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- Thin sidebar strip for stacked cards ---
interface WeaponCardStripProps {
    variant: FactionVariant;
    factionName: string;
    isFirst?: boolean; // leftmost strip gets rounded-l-md
}

export function WeaponCardStrip({ variant, factionName, isFirst }: WeaponCardStripProps) {
    const gradient = getSidebarGradient(variant.factionId);
    return (
        <div
            className={`w-6 shrink-0 flex flex-col items-center justify-between py-2 border-r border-black/30 ${isFirst ? 'rounded-l-md' : ''}`}
            style={{ background: gradient, boxShadow: '4px 0 12px rgba(0,0,0,0.5), 2px 0 4px rgba(0,0,0,0.3)' }}
        >
            <div className="flex flex-col items-center gap-0.5">
                <span className="font-display font-black text-[10px] text-black leading-none">{variant.cost}</span>
                <span className="font-mono-tech text-[5px] text-black/70 font-bold">EB</span>
            </div>
            <div
                className="flex-1 flex items-end overflow-hidden min-h-0"
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
            >
                <span className="font-mono-tech text-[6px] text-black/50 uppercase tracking-[0.1em] font-bold truncate">
                    {factionName}
                </span>
            </div>
        </div>
    );
}
