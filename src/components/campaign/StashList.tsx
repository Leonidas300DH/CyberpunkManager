'use client';

import { useState } from 'react';
import { Campaign, Weapon, HackingProgram } from '@/types';
import { useStore } from '@/store/useStore';
import { Plus, Search, X, Trash2, List, Square, Columns2 } from 'lucide-react';
import { ProgramCard } from '@/components/programs/ProgramCard';
import { useCardGrid } from '@/hooks/useCardGrid';

interface StashListProps {
    campaign: Campaign;
}

const QUALITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    Green: { bg: 'bg-cyber-green', text: 'text-black', border: 'border-cyber-green' },
    Yellow: { bg: 'bg-yellow-400', text: 'text-black', border: 'border-yellow-400' },
    Red: { bg: 'bg-accent', text: 'text-white', border: 'border-accent' },
};

// Range arrows SVG (reused from armory)
const OFF = 'rgba(100,100,100,0.35)';
const OFF_STROKE = 'rgba(255,255,255,0.3)';
const ON_STROKE = 'white';

function WeaponRangeArrows({ weapon }: { weapon: Weapon }) {
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

/** Inline weapon/gear card tile (armory-style) with background image */
function WeaponTile({ weapon, overlay }: { weapon: Weapon; overlay?: React.ReactNode }) {
    const isMelee = weapon.rangeRed && !weapon.rangeYellow && !weapon.rangeGreen && !weapon.rangeLong;
    return (
        <div className="relative group/tile bg-surface-dark border border-border hover:border-secondary transition-all overflow-hidden flex">
            {/* Background image */}
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
            {/* Type sidebar + price */}
            <div className={`relative z-10 w-8 shrink-0 self-stretch ${weapon.isWeapon ? 'bg-secondary' : 'bg-cyan-600'} flex flex-col items-center justify-center py-1`}>
                <div className="font-display font-black text-sm text-black leading-none">{weapon.cost}</div>
                <div className="font-mono-tech text-[7px] text-black/70 font-bold">EB</div>
            </div>
            {/* Content */}
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

/** Inline program tile (compact, list view) with background image */
function ProgramTile({ program, factionName, overlay }: { program: HackingProgram; factionName: string; overlay?: React.ReactNode }) {
    const qColor = QUALITY_COLORS[program.quality];
    return (
        <div className="relative group/tile bg-surface-dark border border-border hover:border-purple-400 transition-all overflow-hidden flex">
            {/* Background image */}
            {program.imageUrl && (
                <img
                    src={program.imageUrl}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    style={{
                        opacity: 0.5,
                        WebkitMaskImage: 'linear-gradient(to top left, black 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.3) 60%, transparent 90%)',
                        maskImage: 'linear-gradient(to top left, black 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.3) 60%, transparent 90%)',
                    }}
                />
            )}
            {/* Quality sidebar */}
            <div className={`relative z-10 w-8 shrink-0 self-stretch ${qColor.bg} flex flex-col items-center justify-center py-1`}>
                <div className={`font-display font-black text-sm ${qColor.text} leading-none`}>{program.costEB}</div>
                <div className={`font-mono-tech text-[7px] ${qColor.text} opacity-70 font-bold`}>EB</div>
            </div>
            {/* Content */}
            <div className="relative z-10 flex-1 px-3 py-2 flex flex-col gap-0.5">
                <h3 className="font-display font-bold text-sm uppercase leading-tight text-white group-hover/tile:text-purple-400 transition-colors">
                    {program.name}
                </h3>
                <div className="flex gap-2 items-center">
                    <span className={`text-[9px] font-mono-tech uppercase tracking-wider font-bold ${qColor.text === 'text-black' ? 'text-muted-foreground' : qColor.text}`}>
                        {program.quality}
                    </span>
                    <span className="text-[9px] font-mono-tech text-muted-foreground uppercase">{factionName}</span>
                    {program.reqStreetCred > 0 && (
                        <span className="text-[9px] font-mono-tech text-yellow-500 uppercase">SC {program.reqStreetCred}</span>
                    )}
                </div>
                <p className="font-body text-[11px] text-white/70 leading-snug line-clamp-2">{program.loadedText}</p>
            </div>
            {overlay}
        </div>
    );
}

type ViewMode = 'list' | 'card' | 'double';

export function StashList({ campaign }: StashListProps) {
    const { catalog, updateCampaign } = useStore();
    const { gridClass, cardStyle } = useCardGrid();
    const [gearSearch, setGearSearch] = useState('');
    const [gearTypeFilter, setGearTypeFilter] = useState<'all' | 'weapon' | 'gear'>('all');
    const [programSearch, setProgramSearch] = useState('');
    const [programQualityFilter, setProgramQualityFilter] = useState<'all' | 'Green' | 'Yellow' | 'Red'>('all');
    const [programViewMode, setProgramViewMode] = useState<ViewMode>('list');
    const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

    const toggleFlip = (id: string) => {
        setFlippedCards(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const getFactionName = (factionId: string) => {
        if (factionId === 'all') return 'All';
        return catalog.factions.find(f => f.id === factionId)?.name ?? 'Unknown';
    };

    // ── Resolve stash items ──
    const stashWeapons: Array<{ weapon: Weapon; stashIdx: number }> = [];
    const stashPrograms: Array<{ program: HackingProgram; stashIdx: number }> = [];

    campaign.hqStash.forEach((itemId, idx) => {
        const weapon = catalog.weapons.find(w => w.id === itemId);
        if (weapon) { stashWeapons.push({ weapon, stashIdx: idx }); return; }
        const program = catalog.programs.find(p => p.id === itemId);
        if (program) { stashPrograms.push({ program, stashIdx: idx }); }
    });

    // ── Remove from stash ──
    const handleRemove = (stashIdx: number) => {
        const itemId = campaign.hqStash[stashIdx];
        const weapon = catalog.weapons.find(w => w.id === itemId);
        const program = catalog.programs.find(p => p.id === itemId);
        const refund = weapon?.cost ?? program?.costEB ?? 0;

        const newStash = [...campaign.hqStash];
        newStash.splice(stashIdx, 1);
        updateCampaign(campaign.id, {
            hqStash: newStash,
            ebBank: campaign.ebBank + refund,
        });
    };

    // ── Buy handlers ──
    const handleBuyWeapon = (weaponId: string, cost: number) => {
        if (campaign.ebBank < cost) return;
        updateCampaign(campaign.id, {
            hqStash: [...campaign.hqStash, weaponId],
            ebBank: campaign.ebBank - cost,
        });
    };

    const handleBuyProgram = (programId: string, cost: number) => {
        if (campaign.ebBank < cost) return;
        updateCampaign(campaign.id, {
            hqStash: [...campaign.hqStash, programId],
            ebBank: campaign.ebBank - cost,
        });
    };

    // ── Available gear (filtered) ──
    const filteredWeapons = catalog.weapons.filter(w => {
        if (gearSearch && !w.name.toLowerCase().includes(gearSearch.toLowerCase())) return false;
        if (gearTypeFilter === 'weapon' && !w.isWeapon) return false;
        if (gearTypeFilter === 'gear' && !w.isGear) return false;
        return true;
    });

    // ── Available programs (filtered, faction-restricted) ──
    const filteredPrograms = catalog.programs.filter(p => {
        if (programSearch && !p.name.toLowerCase().includes(programSearch.toLowerCase())) return false;
        if (programQualityFilter !== 'all' && p.quality !== programQualityFilter) return false;
        if (p.factionId !== 'all' && p.factionId !== campaign.factionId) return false;
        return true;
    });

    const stashCountOf = (id: string) => campaign.hqStash.filter(s => s === id).length;

    return (
        <div className="space-y-10">
            {/* ═══════════════════════════════════════════
                SECTION 1 — YOUR STASH
            ═══════════════════════════════════════════ */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <div className="border-l-2 border-secondary pl-3">
                        <h3 className="font-display text-xl font-bold uppercase tracking-wider text-white">Your Stash</h3>
                        <span className="text-xs font-mono-tech text-muted-foreground uppercase tracking-widest">
                            {campaign.hqStash.length} item{campaign.hqStash.length !== 1 ? 's' : ''} stored
                        </span>
                    </div>
                </div>

                {campaign.hqStash.length === 0 ? (
                    <div className="border-2 border-dashed border-border bg-black/50 p-12 text-center clip-corner-tl-br">
                        <h3 className="text-xl font-display font-bold uppercase text-muted-foreground mb-2">Stash Empty</h3>
                        <p className="text-xs font-mono-tech text-muted-foreground uppercase tracking-widest">Acquire gear and programs from the catalog below.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Owned Gear */}
                        {stashWeapons.length > 0 && (
                            <div>
                                <div className="font-mono-tech text-[10px] uppercase tracking-widest text-secondary font-bold border-b border-border pb-1 mb-2">
                                    Gear — {stashWeapons.length} item{stashWeapons.length !== 1 ? 's' : ''}
                                </div>
                                <div className={gridClass}>
                                    {stashWeapons.map(({ weapon, stashIdx }) => (
                                        <WeaponTile
                                            key={`owned-${stashIdx}`}
                                            weapon={weapon}
                                            overlay={
                                                <button
                                                    onClick={() => handleRemove(stashIdx)}
                                                    className="absolute top-1 right-1 z-20 p-1 bg-black/80 border border-border text-muted-foreground hover:text-accent hover:border-accent transition-colors opacity-0 group-hover/tile:opacity-100"
                                                    title={`Sell — refund ${weapon.cost} EB`}
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            }
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Owned Programs — Full flippable ProgramCard */}
                        {stashPrograms.length > 0 && (
                            <div>
                                <div className="font-mono-tech text-[10px] uppercase tracking-widest text-cyber-purple font-bold border-b border-border pb-1 mb-2">
                                    Netrunning Programs — {stashPrograms.length} program{stashPrograms.length !== 1 ? 's' : ''}
                                </div>
                                <div className={gridClass}>
                                    {stashPrograms.map(({ program, stashIdx }) => (
                                        <div key={`owned-prog-${stashIdx}`} className="relative group/card" style={cardStyle}>
                                            <div
                                                className="card-flip-container w-full cursor-pointer"
                                                onClick={() => toggleFlip(`owned-${stashIdx}`)}
                                            >
                                                <div className={`card-flip-inner ${flippedCards.has(`owned-${stashIdx}`) ? 'flipped' : ''}`}>
                                                    <div className="card-flip-front">
                                                        <ProgramCard program={program} side="front" />
                                                    </div>
                                                    <div className="card-flip-back">
                                                        <ProgramCard program={program} side="back" />
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Sell button */}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleRemove(stashIdx); }}
                                                className="absolute top-1 right-1 z-30 p-1.5 bg-black/80 border border-border text-muted-foreground hover:text-accent hover:border-accent transition-colors opacity-0 group-hover/card:opacity-100"
                                                title={`Sell — refund ${program.costEB} EB`}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* ═══════════════════════════════════════════
                SECTION 2 — AVAILABLE GEAR
            ═══════════════════════════════════════════ */}
            <section>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                    <div className="border-l-2 border-secondary pl-3">
                        <h3 className="font-display text-xl font-bold uppercase tracking-wider text-white">Available Gear</h3>
                        <span className="text-xs font-mono-tech text-muted-foreground uppercase tracking-widest">
                            Click to buy
                        </span>
                    </div>
                    <div className="flex gap-2 items-center flex-wrap">
                        {/* Search */}
                        <div className="relative w-full sm:w-52">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                value={gearSearch}
                                onChange={(e) => setGearSearch(e.target.value)}
                                placeholder="SEARCH..."
                                className="w-full bg-black border border-border pl-10 pr-8 py-2 font-mono-tech text-sm uppercase text-white placeholder:text-muted-foreground focus:border-secondary focus:outline-none"
                            />
                            {gearSearch && (
                                <button onClick={() => setGearSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <X className="w-4 h-4 text-muted-foreground hover:text-white" />
                                </button>
                            )}
                        </div>
                        {/* Type filter */}
                        <div className="flex gap-1 font-mono-tech text-xs">
                            {(['all', 'weapon', 'gear'] as const).map(f => (
                                <button
                                    key={f}
                                    onClick={() => setGearTypeFilter(f)}
                                    className={`px-3 py-2 font-bold uppercase tracking-wider transition-colors ${
                                        gearTypeFilter === f ? 'bg-secondary text-black' : 'border border-border text-muted-foreground hover:border-secondary hover:text-secondary'
                                    }`}
                                >
                                    {f === 'all' ? 'All' : f === 'weapon' ? 'Weapons' : 'Equipment'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={gridClass}>
                    {filteredWeapons.map(weapon => {
                        const cantAfford = campaign.ebBank < weapon.cost;
                        const owned = stashCountOf(weapon.id);

                        return (
                            <div key={weapon.id} className={`${cantAfford ? 'opacity-35' : ''} transition-all`}>
                                <WeaponTile
                                    weapon={weapon}
                                    overlay={
                                        <button
                                            disabled={cantAfford}
                                            onClick={() => handleBuyWeapon(weapon.id, weapon.cost)}
                                            className={`absolute inset-0 z-20 flex items-end justify-end p-2 ${
                                                cantAfford
                                                    ? 'cursor-not-allowed'
                                                    : 'cursor-pointer opacity-0 hover:opacity-100 bg-gradient-to-l from-black/80 via-transparent to-transparent'
                                            } transition-opacity`}
                                        >
                                            {!cantAfford ? (
                                                <span className="font-display font-bold text-xs uppercase tracking-wider bg-secondary text-black px-3 py-1 clip-corner-br flex items-center gap-1 shadow-lg shadow-secondary/30">
                                                    <Plus className="w-3.5 h-3.5" /> {weapon.cost === 0 ? 'Free' : `${weapon.cost} EB`}
                                                </span>
                                            ) : (
                                                <span className="font-mono-tech text-[10px] text-accent uppercase font-bold bg-black/80 px-2 py-0.5 border border-accent/50">
                                                    {weapon.cost} EB
                                                </span>
                                            )}
                                        </button>
                                    }
                                />
                                {owned > 0 && (
                                    <div className="text-right mt-0.5">
                                        <span className="font-mono-tech text-[9px] text-muted-foreground uppercase">x{owned} owned</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {filteredWeapons.length === 0 && (
                        <div className="col-span-full text-center py-8 text-muted-foreground font-mono-tech text-xs uppercase tracking-widest">No gear found.</div>
                    )}
                </div>
            </section>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* ═══════════════════════════════════════════
                SECTION 3 — NETRUNNING PROGRAMS
            ═══════════════════════════════════════════ */}
            <section>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                    <div className="border-l-2 border-cyber-purple pl-3">
                        <h3 className="font-display text-xl font-bold uppercase tracking-wider text-white">Netrunning Programs</h3>
                        <span className="text-xs font-mono-tech text-muted-foreground uppercase tracking-widest">
                            {filteredPrograms.length} program{filteredPrograms.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <div className="flex gap-2 items-center flex-wrap">
                        {/* Search */}
                        <div className="relative w-full sm:w-52">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                value={programSearch}
                                onChange={(e) => setProgramSearch(e.target.value)}
                                placeholder="SEARCH..."
                                className="w-full bg-black border border-border pl-10 pr-8 py-2 font-mono-tech text-sm uppercase text-white placeholder:text-muted-foreground focus:border-purple-400 focus:outline-none"
                            />
                            {programSearch && (
                                <button onClick={() => setProgramSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <X className="w-4 h-4 text-muted-foreground hover:text-white" />
                                </button>
                            )}
                        </div>
                        {/* Quality filter */}
                        <div className="flex gap-1 font-mono-tech text-xs">
                            {(['all', 'Green', 'Yellow', 'Red'] as const).map(q => (
                                <button
                                    key={q}
                                    onClick={() => setProgramQualityFilter(q)}
                                    className={`px-3 py-2 font-bold uppercase tracking-wider transition-colors ${
                                        programQualityFilter === q
                                            ? q === 'all' ? 'bg-cyber-purple text-white' : `${QUALITY_COLORS[q].bg} ${QUALITY_COLORS[q].text}`
                                            : 'border border-border text-muted-foreground hover:border-purple-400 hover:text-purple-400'
                                    }`}
                                >
                                    {q === 'all' ? 'All' : q}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* View mode selector */}
                <div className="flex gap-1 mb-4">
                    {([
                        { mode: 'list' as ViewMode, icon: List, label: 'Liste' },
                        { mode: 'card' as ViewMode, icon: Square, label: 'Carte' },
                        { mode: 'double' as ViewMode, icon: Columns2, label: 'Double' },
                    ]).map(({ mode, icon: Icon, label }) => (
                        <button
                            key={mode}
                            onClick={() => { setProgramViewMode(mode); setFlippedCards(new Set()); }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono-tech uppercase tracking-wider transition-all ${
                                programViewMode === mode
                                    ? 'bg-cyber-purple text-white'
                                    : 'bg-black border border-border text-muted-foreground hover:text-white'
                            }`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            {label}
                        </button>
                    ))}
                </div>

                {/* === LIST VIEW === */}
                {programViewMode === 'list' && (
                    <div className={gridClass}>
                        {filteredPrograms.map(program => {
                            const cantAfford = campaign.ebBank < program.costEB;
                            const owned = stashCountOf(program.id);

                            return (
                                <div key={program.id} className={`${cantAfford ? 'opacity-35' : ''} transition-all`} style={cardStyle}>
                                    <ProgramTile
                                        program={program}
                                        factionName={getFactionName(program.factionId)}
                                        overlay={
                                            <button
                                                disabled={cantAfford}
                                                onClick={() => handleBuyProgram(program.id, program.costEB)}
                                                className={`absolute inset-0 z-20 flex items-end justify-end p-2 ${
                                                    cantAfford
                                                        ? 'cursor-not-allowed'
                                                        : 'cursor-pointer opacity-0 hover:opacity-100 bg-gradient-to-l from-black/80 via-transparent to-transparent'
                                                } transition-opacity`}
                                            >
                                                {!cantAfford ? (
                                                    <span className="font-display font-bold text-xs uppercase tracking-wider bg-cyber-purple text-white px-3 py-1 clip-corner-br flex items-center gap-1 shadow-lg shadow-purple-500/30">
                                                        <Plus className="w-3.5 h-3.5" /> {program.costEB} EB
                                                    </span>
                                                ) : (
                                                    <span className="font-mono-tech text-[10px] text-accent uppercase font-bold bg-black/80 px-2 py-0.5 border border-accent/50">
                                                        {program.costEB} EB
                                                    </span>
                                                )}
                                            </button>
                                        }
                                    />
                                    {owned > 0 && (
                                        <div className="text-right mt-0.5">
                                            <span className="font-mono-tech text-[9px] text-muted-foreground uppercase">x{owned} owned</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* === CARD VIEW — front, click to flip === */}
                {programViewMode === 'card' && (
                    <div className={gridClass}>
                        {filteredPrograms.map(program => {
                            const cantAfford = campaign.ebBank < program.costEB;
                            const owned = stashCountOf(program.id);

                            return (
                                <div key={program.id} className={`${cantAfford ? 'opacity-35' : ''} transition-all`} style={cardStyle}>
                                    <div className="relative group/card">
                                        <div
                                            className="card-flip-container w-full cursor-pointer"
                                            onClick={() => toggleFlip(program.id)}
                                        >
                                            <div className={`card-flip-inner ${flippedCards.has(program.id) ? 'flipped' : ''}`}>
                                                <div className="card-flip-front">
                                                    <ProgramCard program={program} side="front" />
                                                </div>
                                                <div className="card-flip-back">
                                                    <ProgramCard program={program} side="back" />
                                                </div>
                                            </div>
                                        </div>
                                        {/* Buy overlay */}
                                        {!cantAfford && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleBuyProgram(program.id, program.costEB); }}
                                                className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 opacity-0 group-hover/card:opacity-100 transition-opacity font-display font-bold text-xs uppercase tracking-wider bg-cyber-purple text-white px-3 py-1 clip-corner-br flex items-center gap-1 shadow-lg shadow-purple-500/30"
                                            >
                                                <Plus className="w-3.5 h-3.5" /> {program.costEB} EB
                                            </button>
                                        )}
                                    </div>
                                    {owned > 0 && (
                                        <div className="text-right mt-0.5">
                                            <span className="font-mono-tech text-[9px] text-muted-foreground uppercase">x{owned} owned</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* === DOUBLE VIEW — front + back side by side === */}
                {programViewMode === 'double' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredPrograms.map(program => {
                            const cantAfford = campaign.ebBank < program.costEB;
                            const owned = stashCountOf(program.id);

                            return (
                                <div key={program.id} className={`${cantAfford ? 'opacity-35' : ''} transition-all`} style={cardStyle}>
                                    <div className="relative group/card">
                                        <div className="flex gap-3">
                                            <div className="flex-1">
                                                <ProgramCard program={program} side="front" />
                                            </div>
                                            <div className="flex-1">
                                                <ProgramCard program={program} side="back" />
                                            </div>
                                        </div>
                                        {/* Buy overlay */}
                                        {!cantAfford && (
                                            <button
                                                onClick={() => handleBuyProgram(program.id, program.costEB)}
                                                className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 opacity-0 group-hover/card:opacity-100 transition-opacity font-display font-bold text-xs uppercase tracking-wider bg-cyber-purple text-white px-3 py-1 clip-corner-br flex items-center gap-1 shadow-lg shadow-purple-500/30"
                                            >
                                                <Plus className="w-3.5 h-3.5" /> {program.costEB} EB
                                            </button>
                                        )}
                                    </div>
                                    {owned > 0 && (
                                        <div className="text-right mt-0.5">
                                            <span className="font-mono-tech text-[9px] text-muted-foreground uppercase">x{owned} owned</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {filteredPrograms.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground font-mono-tech text-xs uppercase tracking-widest">No programs available.</div>
                )}
            </section>
        </div>
    );
}
