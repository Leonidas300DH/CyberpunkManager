'use client';

import { Loot } from '@/types';
import { Shield } from 'lucide-react';

const OFF = 'rgba(100,100,100,0.35)';
const OFF_STROKE = 'rgba(255,255,255,0.3)';
const ON_STROKE = 'white';

const PTS = {
    red:    '1,1 44,1 49,11 44,21 5,21',
    yellow: '52,1 95,1 100,11 95,21 52,21 57,11',
    green:  '103,1 145,1 150,11 145,21 103,21 108,11',
    long:   '153,1 218,1 223,11 218,21 153,21 158,11',
    plusCx: 188,
};

const SKILL_ICON: Record<string, string> = {
    Reflexes: 'https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/app-images/skills/reflexes.png',
    Ranged: 'https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/app-images/skills/ranged.png',
    Melee: 'https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/app-images/skills/melee.png',
    Medical: 'https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/app-images/skills/medical.png',
    Tech: 'https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/app-images/skills/tech.png',
    Influence: 'https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/app-images/skills/influence.png',
};

interface LootTileProps {
    loot: Loot;
    overlay?: React.ReactNode;
}

export function LootTile({ loot, overlay }: LootTileProps) {
    const hasSkill = !!(loot.skillReq && SKILL_ICON[loot.skillReq]);
    const hasRange = loot.rangeRed || loot.rangeYellow || loot.rangeGreen || loot.rangeLong;
    const hasArmor = loot.armorBonus != null && loot.armorBonus > 0;

    return (
        <div className="relative group/tile bg-surface-dark border border-border hover:border-purple-400 transition-all overflow-hidden flex">
            {/* Purple sidebar */}
            <div className="relative z-10 w-8 shrink-0 self-stretch flex flex-col items-center justify-center py-1 gap-0.5 bg-purple-600">
                <div className="font-display font-black text-[10px] text-white leading-none uppercase tracking-wider">Loot</div>
            </div>
            <div className="relative z-10 flex-1 px-3 py-2 flex flex-col gap-0.5">
                <h3 className="font-display font-bold text-sm uppercase leading-tight text-purple-300 group-hover/tile:text-purple-200 transition-colors">
                    {loot.name}
                </h3>
                {(() => {
                    const lettrine = (hasSkill || hasArmor) && !hasRange;

                    const skillEl = hasSkill && (
                        <div className="flex items-center shrink-0">
                            <img src={SKILL_ICON[loot.skillReq!]} alt={loot.skillReq!} className="w-12 h-12 -my-[3px] object-contain" />
                            {loot.skillBonus != null && loot.skillBonus !== 0 && (
                                <span className="font-display font-black text-xs text-white leading-none drop-shadow-[0_0_4px_rgba(0,0,0,0.9)] [-webkit-text-stroke:0.5px_rgba(0,0,0,0.6)] -ml-1">
                                    {loot.skillBonus > 0 ? `+${loot.skillBonus}` : loot.skillBonus}
                                </span>
                            )}
                        </div>
                    );
                    const armorEl = hasArmor && (
                        <div className="relative shrink-0 w-9 h-9 flex items-center justify-center -my-[2px]">
                            <svg className="w-[26px] h-[26px] absolute inset-0 m-auto" viewBox="0 0 40 40" fill="none">
                                <path d="M20 4L6 10v10c0 9 5.6 16.8 14 19 8.4-2.2 14-10 14-19V10L20 4z" fill="black" stroke="#3b82f6" strokeWidth="2.5" />
                            </svg>
                            <span className="relative z-10 font-display font-black text-[11px] text-white leading-none drop-shadow-[0_0_4px_rgba(0,0,0,0.9)]">{loot.armorBonus}</span>
                        </div>
                    );

                    const descText = loot.effectText || loot.flavorText;

                    if (lettrine) {
                        return (
                            <div className="-ml-2">
                                <div className="float-left flex items-center mr-1">
                                    {skillEl}
                                    {armorEl}
                                </div>
                                <p className="font-body text-[11px] text-white/70 leading-snug">{descText}</p>
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
                                            <svg viewBox="0 0 228 22" className="w-full h-auto" fill="none">
                                                <polygon points={PTS.red} fill={loot.rangeRed ? '#dc2626' : OFF} stroke={loot.rangeRed ? ON_STROKE : OFF_STROKE} strokeWidth="1.5" strokeLinejoin="round" opacity={loot.rangeRed ? 1 : 0.5} />
                                                <polygon points={PTS.yellow} fill={loot.rangeYellow ? '#eab308' : OFF} stroke={loot.rangeYellow ? ON_STROKE : OFF_STROKE} strokeWidth="1.5" strokeLinejoin="round" opacity={loot.rangeYellow ? 1 : 0.5} />
                                                <polygon points={PTS.green} fill={loot.rangeGreen ? '#22c55e' : OFF} stroke={loot.rangeGreen ? ON_STROKE : OFF_STROKE} strokeWidth="1.5" strokeLinejoin="round" opacity={loot.rangeGreen ? 1 : 0.5} />
                                                {loot.rangeLong && (
                                                    <>
                                                        <polygon points={PTS.long} fill="#111111" stroke={ON_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
                                                        <line x1={PTS.plusCx} y1="8" x2={PTS.plusCx} y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                                        <line x1={PTS.plusCx - 3} y1="11" x2={PTS.plusCx + 3} y2="11" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                                    </>
                                                )}
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            )}
                            <p className="font-body text-[11px] text-white/70 leading-snug line-clamp-2">{descText}</p>
                        </>
                    );
                })()}
            </div>
            {overlay}
        </div>
    );
}
