'use client';

import { Loot } from '@/types';
import { Shield } from 'lucide-react';
import { useLocalized } from '@/i18n';
import { SKILL_ICON } from '@/lib/constants/skills';
import { RangeArrows } from '@/components/shared/RangeArrows';

interface LootTileProps {
    loot: Loot;
    overlay?: React.ReactNode;
}

export function LootTile({ loot, overlay }: LootTileProps) {
    const loc = useLocalized();
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
                    {loc(loot as unknown as Record<string, unknown>, 'name')}
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

                    const descText = loc(loot as unknown as Record<string, unknown>, 'effectText') || loc(loot as unknown as Record<string, unknown>, 'flavorText');

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
                                            <RangeArrows red={!!loot.rangeRed} yellow={!!loot.rangeYellow} green={!!loot.rangeGreen} long={!!loot.rangeLong} />
                                        </div>
                                    )}
                                </div>
                            )}
                            <p className="font-body text-[11px] text-white/70 leading-snug ">{descText}</p>
                        </>
                    );
                })()}
            </div>
            {overlay}
        </div>
    );
}
