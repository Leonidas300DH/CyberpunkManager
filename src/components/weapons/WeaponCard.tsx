'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Weapon, FactionVariant } from '@/types';
import { useStore } from '@/store/useStore';
import { formatCardText } from '@/lib/formatCardText';
import { useLocalized } from '@/i18n';
import { Edit, Trash2 } from 'lucide-react';
import { getWeaponImageUrl, WEAPON_IMG_DEFAULT } from '@/lib/variants';
import { SKILL_ICON as SKILL_ICONS } from '@/lib/constants/skills';
import { RangeArrows } from '@/components/shared/RangeArrows';
import { FACTION_TEXT_CLASS as FACTION_TEXT_COLOR_MAP, getSidebarGradient } from '@/lib/constants/factionColors';
import { useAutoNameSize, useAutoFontSize } from '@/hooks/useAutoFontSize';

const DEFAULT_WEAPON_IMAGE = WEAPON_IMG_DEFAULT;

interface WeaponCardProps {
    weapon: Weapon;
    variant: FactionVariant;
    isAdmin?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
}

export function WeaponCard({ weapon, variant, isAdmin, onEdit, onDelete }: WeaponCardProps) {
    const { catalog } = useStore();
    const loc = useLocalized();
    const { cardRef, textRef, fontSize } = useAutoFontSize([weapon.id, variant.factionId], { base: 14, min: 9, bumpWhenSmall: true });
    const weaponName = loc(weapon as unknown as Record<string, unknown>, 'name');
    const { nameRef, nameSize } = useAutoNameSize(weaponName);

    const weaponImgUrl = getWeaponImageUrl(weapon.id, weapon.imageUrl);
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
            {/* z-0: Full-bleed artwork — deterministic URL from weapon ID, onError → default */}
            <img
                src={weaponImgUrl}
                alt={weapon.name}
                className="absolute inset-0 w-full h-full object-cover z-0"
                onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_WEAPON_IMAGE; }}
                style={{ transform: weapon.imageFlipY ? 'scaleY(-1)' : undefined }}
            />

            {/* Scanline overlay */}
            <div className="absolute inset-0 z-[1] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.04)_2px,rgba(0,0,0,0.04)_4px)] pointer-events-none" />

            {/* LEFT SIDEBAR — type color gradient */}
            <div
                className="absolute left-0 top-0 bottom-0 w-[14%] z-10 flex flex-col items-center justify-end py-2"
                style={{ background: sidebarGradient }}
            >
                {/* Vertical name — above stats, mb-2 matches CharacterCard */}
                <div
                    className="mt-auto flex flex-col items-start mb-2"
                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', lineHeight: 0.9, gap: 0 }}
                >
                    <span ref={nameRef} className="mr-[-2px] font-display text-xl uppercase tracking-normal text-black [-webkit-text-stroke:0.5px_rgba(255,255,255,0.6)]" style={{ fontWeight: 900, fontSize: `${nameSize}px` }}>
                        {weaponName}
                    </span>
                    <span className="mr-[-4px] font-mono-tech text-[12px] text-black/80 uppercase tracking-wide [-webkit-text-stroke:0.5px_rgba(255,255,255,0.5)]" style={{ fontWeight: 900 }}>
                        {variantFactionName}
                    </span>
                </div>

                {/* Stats — EB + cost on one line, then rarity, street cred */}
                <div className="flex flex-col items-center gap-px pb-1">
                    <span className="font-mono-tech text-[11px] text-black font-black tracking-wider">EB {variant.cost}</span>
                    {variant.rarity < 99 && (
                        <div className="font-mono-tech text-[10px] text-black/60 font-bold">Rar.{variant.rarity}</div>
                    )}
                    {(variant.reqStreetCred ?? 0) > 0 && (
                        <div className="text-black flex items-center gap-0.5">
                            <span className="text-xs">★</span>
                            <span className="font-display font-black text-sm leading-none">{variant.reqStreetCred}</span>
                        </div>
                    )}
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
                                    <p className="text-[11px] font-mono-tech text-white/70 leading-snug">{formatCardText(loc(weapon as unknown as Record<string, unknown>, 'description'))}</p>
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
                                                <RangeArrows red={!!weapon.rangeRed} yellow={!!weapon.rangeYellow} green={!!weapon.rangeGreen} long={!!weapon.rangeLong} />
                                            </div>
                                        )}
                                    </div>
                                )}
                                <p className="text-[11px] font-mono-tech text-white/70 leading-snug">{formatCardText(loc(weapon as unknown as Record<string, unknown>, 'description'))}</p>
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
                                <RangeArrows red={!!weapon.range2Red} yellow={!!weapon.range2Yellow} green={!!weapon.range2Green} long={!!weapon.range2Long} />
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
