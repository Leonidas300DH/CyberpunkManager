'use client';

import { Weapon } from '@/types';

const OFF = 'rgba(100,100,100,0.35)';
const OFF_STROKE = 'rgba(255,255,255,0.3)';
const ON_STROKE = 'white';

export function WeaponRangeArrows({ weapon }: { weapon: Weapon }) {
    const showRange = weapon.rangeRed || weapon.rangeYellow || weapon.rangeGreen || weapon.rangeLong;
    if (!showRange) return null;
    return (
        <svg viewBox="0 0 220 22" className="w-full h-auto" fill="none">
            <polygon points="1,1 54,1 59,11 54,21 6,21"
                fill={weapon.rangeRed ? '#dc2626' : OFF}
                stroke={weapon.rangeRed ? ON_STROKE : OFF_STROKE} strokeWidth="1.5" strokeLinejoin="round"
                opacity={weapon.rangeRed ? 1 : 0.5} />
            <polygon points="62,1 96,1 101,11 96,21 62,21 67,11"
                fill={weapon.rangeYellow ? '#eab308' : OFF}
                stroke={weapon.rangeYellow ? ON_STROKE : OFF_STROKE} strokeWidth="1.5" strokeLinejoin="round"
                opacity={weapon.rangeYellow ? 1 : 0.5} />
            <polygon points="104,1 138,1 143,11 138,21 104,21 109,11"
                fill={weapon.rangeGreen ? '#22c55e' : OFF}
                stroke={weapon.rangeGreen ? ON_STROKE : OFF_STROKE} strokeWidth="1.5" strokeLinejoin="round"
                opacity={weapon.rangeGreen ? 1 : 0.5} />
            {weapon.rangeLong && (
                <>
                    <polygon points="146,1 210,1 215,11 210,21 146,21 151,11"
                        fill="#111111" stroke={ON_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
                    <line x1="181" y1="8" x2="181" y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="178" y1="11" x2="184" y2="11" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </>
            )}
        </svg>
    );
}

export function WeaponTile({ weapon, overlay }: { weapon: Weapon; overlay?: React.ReactNode }) {
    const isMelee = weapon.rangeRed && !weapon.rangeYellow && !weapon.rangeGreen && !weapon.rangeLong;
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
            <div className={`relative z-10 w-8 shrink-0 self-stretch ${weapon.isWeapon ? 'bg-secondary' : 'bg-cyan-600'} flex flex-col items-center justify-center py-1`}>
                <div className="font-display font-black text-sm text-black leading-none">{weapon.cost}</div>
                <div className="font-mono-tech text-[7px] text-black/70 font-bold">EB</div>
            </div>
            <div className="relative z-10 flex-1 px-3 py-2 flex flex-col gap-1">
                <div>
                    <h3 className="font-display font-bold text-sm uppercase leading-tight text-white group-hover/tile:text-secondary transition-colors">
                        {weapon.name}
                    </h3>
                    <span className={`text-[9px] font-mono-tech uppercase tracking-wider ${weapon.isWeapon ? 'text-secondary' : 'text-cyan-400'}`}>
                        {weapon.isWeapon ? (isMelee ? 'Melee' : 'Ranged') : 'Equipment'}
                    </span>
                </div>
                <div className="w-[80%]">
                    <WeaponRangeArrows weapon={weapon} />
                </div>
                <p className="font-body text-[11px] text-white/70 leading-snug line-clamp-2">{weapon.description}</p>
            </div>
            {overlay}
        </div>
    );
}
