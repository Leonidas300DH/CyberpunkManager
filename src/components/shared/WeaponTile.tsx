'use client';

import { Weapon } from '@/types';

const OFF = 'rgba(100,100,100,0.35)';
const OFF_STROKE = 'rgba(255,255,255,0.3)';
const ON_STROKE = 'white';

// 3-chevron layout — full size in viewBox 180
const P3 = {
    red:    '1,1 54,1 59,11 54,21 6,21',
    yellow: '62,1 96,1 101,11 96,21 62,21 67,11',
    green:  '104,1 138,1 143,11 138,21 104,21 109,11',
};

// 4-chevron layout — proportionally scaled (220→180) so Long is the longest bar
const P4 = {
    red:    '1,1 44,1 49,11 44,21 5,21',
    yellow: '52,1 79,1 84,11 79,21 52,21 57,11',
    green:  '87,1 113,1 118,11 113,21 87,21 92,11',
    long:   '121,1 171,1 176,11 171,21 121,21 126,11',
    plusCx: 151,
};

export function WeaponRangeArrows({ weapon }: { weapon: Weapon }) {
    const showRange = weapon.rangeRed || weapon.rangeYellow || weapon.rangeGreen || weapon.rangeLong;
    if (!showRange) return null;

    const hasLong = weapon.rangeLong;
    const p = hasLong ? P4 : P3;

    return (
        <svg viewBox="0 0 180 22" className="w-full h-auto" fill="none">
            <polygon points={p.red}
                fill={weapon.rangeRed ? '#dc2626' : OFF}
                stroke={weapon.rangeRed ? ON_STROKE : OFF_STROKE} strokeWidth="1.5" strokeLinejoin="round"
                opacity={weapon.rangeRed ? 1 : 0.5} />
            <polygon points={p.yellow}
                fill={weapon.rangeYellow ? '#eab308' : OFF}
                stroke={weapon.rangeYellow ? ON_STROKE : OFF_STROKE} strokeWidth="1.5" strokeLinejoin="round"
                opacity={weapon.rangeYellow ? 1 : 0.5} />
            <polygon points={p.green}
                fill={weapon.rangeGreen ? '#22c55e' : OFF}
                stroke={weapon.rangeGreen ? ON_STROKE : OFF_STROKE} strokeWidth="1.5" strokeLinejoin="round"
                opacity={weapon.rangeGreen ? 1 : 0.5} />
            {hasLong && (
                <>
                    <polygon points={P4.long}
                        fill="#111111" stroke={ON_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
                    <line x1={P4.plusCx} y1="8" x2={P4.plusCx} y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1={P4.plusCx - 3} y1="11" x2={P4.plusCx + 3} y2="11" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </>
            )}
        </svg>
    );
}

interface WeaponTileProps {
    weapon: Weapon;
    overlay?: React.ReactNode;
    /** Current campaign street cred — when provided, enables street cred warning */
    campaignStreetCred?: number;
    /** How many copies of this weapon are already in the team — when provided, enables rarity warning */
    equippedCount?: number;
}

const SKILL_ICON: Record<string, string> = {
    Melee: '/images/Skills Icons/melee.png',
    Ranged: '/images/Skills Icons/ranged.png',
};

export function WeaponTile({ weapon, overlay, campaignStreetCred, equippedCount }: WeaponTileProps) {
    const showRarity = weapon.rarity < 99;
    const showStreetCred = (weapon.reqStreetCred ?? 0) > 0;
    const rarityExceeded = showRarity && equippedCount != null && equippedCount >= weapon.rarity;
    const streetCredInsufficient = showStreetCred && campaignStreetCred != null && campaignStreetCred < weapon.reqStreetCred;

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
                <div className="font-display font-black text-sm text-black leading-none">{weapon.cost}</div>
                <div className="font-mono-tech text-[7px] text-black/70 font-bold">EB</div>
                {showRarity && (
                    <div className={`font-mono-tech text-[8px] font-bold leading-none mt-0.5 ${rarityExceeded ? 'text-red-600' : 'text-black/60'}`}
                        title={`Rarity: max ${weapon.rarity} per team`}>
                        ×{weapon.rarity}
                    </div>
                )}
                {showStreetCred && (
                    <div className={`font-mono-tech text-[7px] font-bold leading-none ${streetCredInsufficient ? 'text-red-600' : 'text-black/60'}`}
                        title={`Requires Street Cred ${weapon.reqStreetCred}`}>
                        SC{weapon.reqStreetCred}
                    </div>
                )}
            </div>
            <div className="relative z-10 flex-1 px-3 py-2 flex flex-col gap-1">
                <h3 className="font-display font-bold text-sm uppercase leading-tight text-white group-hover/tile:text-secondary transition-colors">
                    {weapon.name}
                </h3>
                {(weapon.rangeRed || weapon.rangeYellow || weapon.rangeGreen || weapon.rangeLong) && (
                    <div className="flex items-center gap-2">
                        {weapon.skillReq && SKILL_ICON[weapon.skillReq] && (
                            <img src={SKILL_ICON[weapon.skillReq]} alt={weapon.skillReq} className="w-12 h-12 shrink-0 object-contain" />
                        )}
                        <div className="w-[60%]">
                            <WeaponRangeArrows weapon={weapon} />
                        </div>
                    </div>
                )}
                <p className="font-body text-[11px] text-white/70 leading-snug line-clamp-2">{weapon.description}</p>
            </div>
            {overlay}
        </div>
    );
}
