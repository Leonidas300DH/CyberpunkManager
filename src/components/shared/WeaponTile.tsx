'use client';

import { Weapon } from '@/types';
import { resolveVariant } from '@/lib/variants';
import { formatCardText } from '@/lib/formatCardText';

const OFF = 'rgba(100,100,100,0.35)';
const OFF_STROKE = 'rgba(255,255,255,0.3)';
const ON_STROKE = 'white';

// Single consistent layout — Red 48px, Yellow 48px, Green 47px, Long 70px (the widest)
const PTS = {
    red:    '1,1 44,1 49,11 44,21 5,21',
    yellow: '52,1 95,1 100,11 95,21 52,21 57,11',
    green:  '103,1 145,1 150,11 145,21 103,21 108,11',
    long:   '153,1 218,1 223,11 218,21 153,21 158,11',
    plusCx: 188,
};

export function WeaponRangeArrows({ weapon }: { weapon: Weapon }) {
    const showRange = weapon.rangeRed || weapon.rangeYellow || weapon.rangeGreen || weapon.rangeLong;
    if (!showRange) return null;
    return (
        <svg viewBox="0 0 228 22" className="w-full h-auto" fill="none">
            <polygon points={PTS.red}
                fill={weapon.rangeRed ? '#dc2626' : OFF}
                stroke={weapon.rangeRed ? ON_STROKE : OFF_STROKE} strokeWidth="1.5" strokeLinejoin="round"
                opacity={weapon.rangeRed ? 1 : 0.5} />
            <polygon points={PTS.yellow}
                fill={weapon.rangeYellow ? '#eab308' : OFF}
                stroke={weapon.rangeYellow ? ON_STROKE : OFF_STROKE} strokeWidth="1.5" strokeLinejoin="round"
                opacity={weapon.rangeYellow ? 1 : 0.5} />
            <polygon points={PTS.green}
                fill={weapon.rangeGreen ? '#22c55e' : OFF}
                stroke={weapon.rangeGreen ? ON_STROKE : OFF_STROKE} strokeWidth="1.5" strokeLinejoin="round"
                opacity={weapon.rangeGreen ? 1 : 0.5} />
            {weapon.rangeLong && (
                <>
                    <polygon points={PTS.long}
                        fill="#111111" stroke={ON_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
                    <line x1={PTS.plusCx} y1="8" x2={PTS.plusCx} y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1={PTS.plusCx - 3} y1="11" x2={PTS.plusCx + 3} y2="11" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </>
            )}
        </svg>
    );
}

interface WeaponTileProps {
    weapon: Weapon;
    variantFactionId?: string;
    overlay?: React.ReactNode;
    campaignStreetCred?: number;
    equippedCount?: number;
}

const SKILL_ICON: Record<string, string> = {
    Reflexes: 'https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/app-images/skills/reflexes.png',
    Ranged: 'https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/app-images/skills/ranged.png',
    Melee: 'https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/app-images/skills/melee.png',
    Medical: 'https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/app-images/skills/medical.png',
    Tech: 'https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/app-images/skills/tech.png',
    Influence: 'https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/app-images/skills/influence.png',
};

export function WeaponTile({ weapon, variantFactionId, overlay, campaignStreetCred, equippedCount }: WeaponTileProps) {
    const variant = resolveVariant(weapon.factionVariants, variantFactionId);
    const showRarity = variant.rarity < 99;
    const showStreetCred = (variant.reqStreetCred ?? 0) > 0;
    const rarityExceeded = showRarity && equippedCount != null && equippedCount >= variant.rarity;
    const streetCredInsufficient = showStreetCred && campaignStreetCred != null && campaignStreetCred < variant.reqStreetCred;

    return (
        <div className="relative group/tile bg-surface-dark border border-border hover:border-secondary transition-all overflow-hidden flex">
            {weapon.imageUrl && (
                <img
                    src={weapon.imageUrl}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    style={{
                        opacity: 0.5,
                        WebkitMaskImage: 'linear-gradient(to top left, black 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.3) 60%, transparent 90%)',
                        maskImage: 'linear-gradient(to top left, black 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.3) 60%, transparent 90%)',
                    }}
                />
            )}
            <div className={`relative z-10 w-8 shrink-0 self-stretch ${weapon.isWeapon ? 'bg-secondary' : 'bg-cyan-600'} flex flex-col items-center justify-center py-1 gap-0.5`}>
                <div className="font-display font-black text-base text-black leading-none">{variant.cost}</div>
                <div className="font-mono-tech text-[8px] text-black/70 font-bold">EB</div>
                {showRarity && (
                    <div className={`font-mono-tech text-[6px] font-bold leading-none mt-1.5 ${rarityExceeded ? 'text-red-600' : 'text-black/60'}`}
                        title={`Rarity: max ${variant.rarity} per team`}>
                        RAR {variant.rarity}
                    </div>
                )}
                {showStreetCred && (
                    <div className={`font-mono-tech text-[6px] font-bold leading-none ${streetCredInsufficient ? 'text-red-600' : 'text-black/60'}`}
                        title={`Requires Street Cred ${variant.reqStreetCred}`}>
                        CRED {variant.reqStreetCred}
                    </div>
                )}
            </div>
            <div className="relative z-10 flex-1 px-3 py-2 flex flex-col gap-0.5">
                <h3 className="font-display font-bold text-sm uppercase leading-tight text-white group-hover/tile:text-secondary transition-colors">
                    {weapon.name}
                </h3>
                {(() => {
                    const hasSkill = !!(weapon.skillReq && SKILL_ICON[weapon.skillReq]);
                    const hasArmor = weapon.grantsArmor != null && weapon.grantsArmor > 0;
                    const hasRange = weapon.rangeRed || weapon.rangeYellow || weapon.rangeGreen || weapon.rangeLong;
                    const lettrine = (hasSkill || hasArmor) && !hasRange;

                    const skillEl = hasSkill && (
                        <div className="flex items-center shrink-0">
                            <img src={SKILL_ICON[weapon.skillReq!]} alt={weapon.skillReq!} className="w-12 h-12 -my-[3px] object-contain" />
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
                                <p className="font-body text-[11px] text-white/70 leading-snug">{formatCardText(weapon.description)}</p>
                            </div>
                        );
                    }
                    return (
                        <>
                            {(hasRange || hasSkill || hasArmor) && (
                                <div className="-ml-2 flex items-center gap-2">
                                    {skillEl}
                                    {armorEl}
                                    {hasRange && (
                                        <div className="w-[60%]">
                                            <WeaponRangeArrows weapon={weapon} />
                                        </div>
                                    )}
                                </div>
                            )}
                            <p className="font-body text-[11px] text-white/70 leading-snug line-clamp-2">{formatCardText(weapon.description)}</p>
                        </>
                    );
                })()}
                {(weapon.range2Red || weapon.range2Yellow || weapon.range2Green || weapon.range2Long) && (
                    <div className="-ml-2 flex items-center gap-2">
                        {weapon.skillReq && SKILL_ICON[weapon.skillReq] && (
                            <img src={SKILL_ICON[weapon.skillReq]} alt={weapon.skillReq} className="w-12 h-12 -my-[3px] shrink-0 object-contain" />
                        )}
                        <div className="w-[60%]">
                            <svg viewBox="0 0 228 22" className="w-full h-auto" fill="none">
                                <polygon points={PTS.red} fill={weapon.range2Red ? '#dc2626' : OFF} stroke={weapon.range2Red ? ON_STROKE : OFF_STROKE} strokeWidth="1.5" strokeLinejoin="round" opacity={weapon.range2Red ? 1 : 0.5} />
                                <polygon points={PTS.yellow} fill={weapon.range2Yellow ? '#eab308' : OFF} stroke={weapon.range2Yellow ? ON_STROKE : OFF_STROKE} strokeWidth="1.5" strokeLinejoin="round" opacity={weapon.range2Yellow ? 1 : 0.5} />
                                <polygon points={PTS.green} fill={weapon.range2Green ? '#22c55e' : OFF} stroke={weapon.range2Green ? ON_STROKE : OFF_STROKE} strokeWidth="1.5" strokeLinejoin="round" opacity={weapon.range2Green ? 1 : 0.5} />
                                {weapon.range2Long && (
                                    <>
                                        <polygon points={PTS.long} fill="#111111" stroke={ON_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
                                        <line x1={PTS.plusCx} y1="8" x2={PTS.plusCx} y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                        <line x1={PTS.plusCx - 3} y1="11" x2={PTS.plusCx + 3} y2="11" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                    </>
                                )}
                            </svg>
                        </div>
                    </div>
                )}
            </div>
            {overlay}
        </div>
    );
}
