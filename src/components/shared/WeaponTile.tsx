'use client';

import { Weapon } from '@/types';
import { resolveVariant, getWeaponImageUrl, WEAPON_IMG_DEFAULT } from '@/lib/variants';
import { formatCardText } from '@/lib/formatCardText';
import { FACTION_SIDEBAR_COLOR } from '@/lib/constants/factionColors';
import { SKILL_ICON } from '@/lib/constants/skills';
import { useLocalized } from '@/i18n';
import { RangeArrows } from '@/components/shared/RangeArrows';

export function WeaponRangeArrows({ weapon }: { weapon: Weapon }) {
    return <RangeArrows red={weapon.rangeRed} yellow={weapon.rangeYellow} green={weapon.rangeGreen} long={weapon.rangeLong} />;
}

interface WeaponTileProps {
    weapon: Weapon;
    variantFactionId?: string;
    activeFactionId?: string;
    overlay?: React.ReactNode;
    campaignStreetCred?: number;
    equippedCount?: number;
}

export function WeaponTile({ weapon, variantFactionId, activeFactionId, overlay, campaignStreetCred, equippedCount }: WeaponTileProps) {
    const loc = useLocalized();
    const variant = resolveVariant(weapon.factionVariants, variantFactionId);
    const showRarity = variant.rarity < 99;
    const showStreetCred = (variant.reqStreetCred ?? 0) > 0;
    const rarityExceeded = showRarity && equippedCount != null && equippedCount >= variant.rarity;
    const streetCredInsufficient = showStreetCred && campaignStreetCred != null && campaignStreetCred < variant.reqStreetCred;
    // Color band: use activeFactionId (character's faction) if provided, otherwise variant's factionId
    const bandFactionId = activeFactionId ?? variant.factionId;

    return (
        <div className="relative group/tile bg-surface-dark border border-border hover:border-secondary transition-all overflow-hidden flex">
            <img
                src={getWeaponImageUrl(weapon.id, weapon.imageUrl)}
                alt=""
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                style={{
                    opacity: 0.5,
                    transform: weapon.imageFlipY ? 'scaleY(-1)' : undefined,
                    WebkitMaskImage: 'linear-gradient(to top left, black 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.3) 60%, transparent 90%)',
                    maskImage: 'linear-gradient(to top left, black 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.3) 60%, transparent 90%)',
                }}
            />
            <div className="relative z-10 w-8 shrink-0 self-stretch flex flex-col items-center justify-center py-1 gap-0.5" style={{ backgroundColor: FACTION_SIDEBAR_COLOR[bandFactionId] ?? '#666666' }}>
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
                    {loc(weapon as unknown as Record<string, unknown>, 'name')}
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
                                <p className="font-body text-[11px] text-white/70 leading-snug">{formatCardText(loc(weapon as unknown as Record<string, unknown>, 'description'))}</p>
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
                            <p className="font-body text-[11px] text-white/70 leading-snug line-clamp-2">{formatCardText(loc(weapon as unknown as Record<string, unknown>, 'description'))}</p>
                        </>
                    );
                })()}
                {(weapon.range2Red || weapon.range2Yellow || weapon.range2Green || weapon.range2Long) && (
                    <div className="-ml-2 flex items-center gap-2">
                        {weapon.skillReq && SKILL_ICON[weapon.skillReq] && (
                            <img src={SKILL_ICON[weapon.skillReq]} alt={weapon.skillReq} className="w-12 h-12 -my-[3px] shrink-0 object-contain" />
                        )}
                        <div className="w-[60%]">
                            <RangeArrows red={!!weapon.range2Red} yellow={!!weapon.range2Yellow} green={!!weapon.range2Green} long={!!weapon.range2Long} />
                        </div>
                    </div>
                )}
            </div>
            {overlay}
        </div>
    );
}
