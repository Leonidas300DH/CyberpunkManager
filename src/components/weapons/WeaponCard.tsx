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

// --- Sidebar color logic ---
function getSidebarColor(weapon: Weapon): { gradient: string; solidClass: string } {
    const isW = weapon.isWeapon;
    const isG = weapon.isGear;
    if (isW && !isG) {
        return { gradient: 'linear-gradient(to bottom, #ffffff, #FCEE0A 60%)', solidClass: 'bg-primary' };
    }
    if (isG && !isW) {
        return { gradient: 'linear-gradient(to bottom, #ffffff, #00F0FF 60%)', solidClass: 'bg-secondary' };
    }
    if (isW && isG) {
        return { gradient: 'linear-gradient(to bottom, #ffffff, #FCEE0A 30%, #00F0FF 80%)', solidClass: 'bg-secondary' };
    }
    return { gradient: 'linear-gradient(to bottom, #ffffff, #666666 60%)', solidClass: 'bg-gray-500' };
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

    const hasImage = weapon.imageUrl && weapon.imageUrl !== DEFAULT_WEAPON_IMAGE && !weapon.imageUrl.endsWith('/default.png');
    const showRange = weapon.rangeRed || weapon.rangeYellow || weapon.rangeGreen || weapon.rangeLong;
    const showRange2 = weapon.range2Red || weapon.range2Yellow || weapon.range2Green || weapon.range2Long;
    const skillIcon = weapon.skillReq ? SKILL_ICONS[weapon.skillReq] ?? null : null;
    const hasArmor = weapon.grantsArmor != null && weapon.grantsArmor > 0;
    const hasGauge = !!skillIcon || showRange || hasArmor;

    const variantFactionName = variant.factionId === 'universal'
        ? 'Universal'
        : (catalog.factions.find(f => f.id === variant.factionId)?.name ?? variant.factionId);

    const sidebar = getSidebarColor(weapon);

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
                style={{ background: sidebar.gradient }}
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

                {/* Vertical name */}
                <div
                    className="flex flex-col items-center gap-0 flex-1 justify-center min-h-0"
                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                >
                    <span
                        className="font-display font-black text-sm uppercase tracking-widest text-black drop-shadow-sm truncate max-h-[60%]"
                        style={{ marginRight: '-2px' }}
                    >
                        {weapon.name}
                    </span>
                    <span
                        className="font-mono-tech text-[7px] text-black/50 uppercase tracking-[0.15em] font-bold truncate max-h-[30%]"
                        style={{ marginLeft: '-2px' }}
                    >
                        {variantFactionName}
                    </span>
                </div>
            </div>

            {/* TOP GAUGE BAR */}
            {hasGauge && (
                <div className="absolute top-0 left-[14%] right-0 z-20 bg-black/60 backdrop-blur-sm px-[3%] py-[2%] flex items-center gap-[2%]">
                    {skillIcon && (
                        <div className="flex items-center shrink-0">
                            <img
                                src={skillIcon}
                                alt={weapon.skillReq!}
                                className="w-[18%] min-w-[28px] object-contain"
                            />
                            {weapon.skillBonus != null && weapon.skillBonus !== 0 && (
                                <span className="font-display font-black text-xs text-white leading-none drop-shadow-[0_0_4px_rgba(0,0,0,0.9)] [-webkit-text-stroke:0.5px_rgba(0,0,0,0.6)] -ml-1">
                                    {weapon.skillBonus > 0 ? `+${weapon.skillBonus}` : weapon.skillBonus}
                                </span>
                            )}
                        </div>
                    )}
                    {showRange && (
                        <svg viewBox="0 0 228 22" className="w-[65%] h-auto" fill="none">
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
                    )}
                    {hasArmor && (
                        <div className="relative shrink-0 w-7 h-7 flex items-center justify-center">
                            <svg className="w-[22px] h-[22px] absolute inset-0 m-auto" viewBox="0 0 40 40" fill="none">
                                <path d="M20 4L6 10v10c0 9 5.6 16.8 14 19 8.4-2.2 14-10 14-19V10L20 4z" fill="black" stroke="#3b82f6" strokeWidth="2.5" />
                            </svg>
                            <span className="relative z-10 font-display font-black text-[10px] text-white leading-none drop-shadow-[0_0_4px_rgba(0,0,0,0.9)]">
                                {weapon.grantsArmor}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Range 2 bar (below gauge) */}
            {showRange2 && (
                <div className="absolute left-[14%] right-0 z-20 bg-black/50 backdrop-blur-sm px-[3%] py-[1%] flex items-center gap-[2%]"
                    style={{ top: hasGauge ? 'calc(2% + 32px)' : 0 }}
                >
                    {skillIcon && (
                        <img src={skillIcon} alt={weapon.skillReq!} className="w-[18%] min-w-[28px] object-contain shrink-0" />
                    )}
                    <svg viewBox="0 0 228 22" className="w-[65%] h-auto" fill="none">
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
            )}

            {/* Admin buttons (top right) */}
            {isAdmin && (onEdit || onDelete) && (
                <div className="absolute top-1 right-1 z-30 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onEdit && (
                        <button onClick={onEdit} className="p-1 bg-black/60 rounded text-muted-foreground hover:text-secondary transition-colors">
                            <Edit className="w-3.5 h-3.5" />
                        </button>
                    )}
                    {onDelete && (
                        <button onClick={onDelete} className="p-1 bg-black/60 rounded text-muted-foreground hover:text-accent transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            )}

            {/* BOTTOM TEXT BOX */}
            <div
                className="absolute bottom-[5%] left-[18%] right-[3%] z-20"
                style={{
                    maxHeight: '60%',
                    filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.5)) drop-shadow(0 0 14px rgba(255,255,255,0.25))',
                }}
            >
                <div
                    className="w-full bg-black/80 backdrop-blur-sm border-[0.5px] border-white/30 p-2.5"
                    style={{
                        clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%)',
                    }}
                >
                    {/* Keywords */}
                    {weapon.keywords.length > 0 && (
                        <div className="flex gap-1 flex-wrap mb-1.5">
                            {weapon.keywords.map((kw, i) => (
                                <span
                                    key={i}
                                    className="text-[8px] font-mono-tech uppercase tracking-wider text-white/80 border border-white/20 px-1 py-px"
                                >
                                    {kw}
                                </span>
                            ))}
                        </div>
                    )}
                    {/* Description */}
                    <div
                        ref={textRef}
                        className="font-mono-tech leading-snug whitespace-pre-wrap text-white/90 pr-3 pb-1"
                        style={{ fontSize: `${fontSize}px` }}
                    >
                        {formatCardText(weapon.description)}
                    </div>
                </div>
            </div>
        </div>
    );
}
