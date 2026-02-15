'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Weapon, HackingProgram } from '@/types';
import { Swords, Skull, RotateCcw, Minus, Plus } from 'lucide-react';
import { useCardGrid } from '@/hooks/useCardGrid';
import { CharacterCard } from '@/components/characters/CharacterCard';
import { WeaponTile } from '@/components/shared/WeaponTile';
import { ProgramCard } from '@/components/programs/ProgramCard';

export function ActiveMatchView() {
    const router = useRouter();
    const { catalog, campaigns, activeMatchTeam, setActiveMatchTeam } = useStore();
    const { gridClass, cardStyle } = useCardGrid();

    const [activatedModels, setActivatedModels] = useState<Record<string, boolean>>({});
    const [wounds, setWounds] = useState<Record<string, number>>({});
    const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

    const toggleFlip = (key: string) => {
        setFlippedCards(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key); else next.add(key);
            return next;
        });
    };

    const campaign = useMemo(() => {
        if (!activeMatchTeam) return null;
        return campaigns.find(c => c.id === activeMatchTeam.campaignId) ?? null;
    }, [activeMatchTeam, campaigns]);

    const matchRoster = useMemo(() => {
        if (!activeMatchTeam || !campaign) return [];
        return campaign.hqRoster.filter(r => activeMatchTeam.selectedRecruitIds.includes(r.id));
    }, [activeMatchTeam, campaign]);

    if (!activeMatchTeam || !campaign) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                <div className="h-20 w-20 clip-corner-tr bg-surface-dark border border-border flex items-center justify-center">
                    <Swords className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="font-display text-3xl text-muted-foreground uppercase tracking-widest">No Active Match</h2>
                <p className="font-mono-tech text-xs text-muted-foreground uppercase tracking-wider">
                    Go to Team Builder to deploy your squad
                </p>
                <button
                    onClick={() => router.push('/match')}
                    className="bg-primary text-black font-display font-bold text-sm px-6 py-3 clip-corner-br uppercase tracking-widest hover:bg-white transition-colors"
                >
                    Build Team
                </button>
            </div>
        );
    }

    const getProfile = (profileId: string) => catalog.profiles.find(p => p.id === profileId);
    const getLineage = (lineageId: string) => catalog.lineages.find(l => l.id === lineageId);

    const handleEndMatch = () => {
        if (confirm("End the match? Progress will be lost.")) {
            setActiveMatchTeam(null);
            router.push('/hq');
        }
    };

    const toggleActivation = (id: string) => {
        setActivatedModels(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const addWound = (id: string) => {
        setWounds(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    };

    const healWound = (id: string) => {
        setWounds(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) }));
    };

    const activatedCount = Object.values(activatedModels).filter(Boolean).length;

    return (
        <div className="pb-28">
            {/* === STICKY HEADER === */}
            <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-border shadow-[0_4px_20px_rgba(0,0,0,0.8)] -mx-4 px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Swords className="w-5 h-5 text-primary" />
                        <div>
                            <h2 className="font-display text-lg font-bold text-white uppercase tracking-wider leading-none">
                                Active Match
                            </h2>
                            <span className="text-[9px] font-mono-tech text-secondary uppercase tracking-widest">
                                {campaign.name} // {activatedCount}/{matchRoster.length} activated
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setActivatedModels({})}
                            className="p-2 border border-border bg-surface-dark text-secondary hover:bg-secondary hover:text-black transition-colors clip-corner-tr"
                            title="New round — reset activations"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleEndMatch}
                            className="px-4 py-2 bg-accent text-white font-display font-bold text-xs uppercase tracking-widest clip-corner-br hover:bg-red-700 transition-colors"
                        >
                            End Match
                        </button>
                    </div>
                </div>
            </div>

            {/* === UNIT CARDS === */}
            <div className={`mt-6 ${gridClass}`}>
                {matchRoster.map(recruit => {
                    const profile = getProfile(recruit.currentProfileId);
                    const lineage = profile ? getLineage(profile.lineageId) : null;
                    if (!profile || !lineage) return null;

                    const isActivated = activatedModels[recruit.id];
                    const currentWounds = wounds[recruit.id] || 0;
                    const isCasualty = currentWounds >= 4;

                    const equippedIds = activeMatchTeam.equipmentMap?.[recruit.id] ?? [];

                    // Resolve equipped items into full objects
                    const equippedItems = equippedIds.map(eqId => {
                        if (eqId.startsWith('weapon-')) {
                            const weapon = catalog.weapons.find(w => w.id === eqId.replace('weapon-', ''));
                            return weapon ? { equipId: eqId, type: 'weapon' as const, weapon, program: null } : null;
                        }
                        if (eqId.startsWith('program-')) {
                            const program = catalog.programs.find(p => p.id === eqId.replace('program-', ''));
                            return program ? { equipId: eqId, type: 'program' as const, weapon: null, program } : null;
                        }
                        return null;
                    }).filter(Boolean) as Array<
                        | { equipId: string; type: 'weapon'; weapon: Weapon; program: null }
                        | { equipId: string; type: 'program'; weapon: null; program: HackingProgram }
                    >;

                    return (
                        <div key={recruit.id} style={cardStyle}>
                            {/* Card + overlays */}
                            <div
                                className="relative cursor-pointer"
                                onClick={() => toggleActivation(recruit.id)}
                            >
                                <div className={`transition-all ${
                                    isCasualty
                                        ? 'border-2 border-accent'
                                        : isActivated
                                            ? 'border-2 border-border opacity-50 saturate-0'
                                            : 'border-2 border-transparent'
                                }`}>
                                    <CharacterCard lineage={lineage} profile={profile} />
                                </div>

                                {/* Activated overlay */}
                                {isActivated && !isCasualty && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-30">
                                        <span className="font-display text-2xl font-bold text-muted-foreground uppercase tracking-[0.3em] rotate-[-15deg] drop-shadow-lg">
                                            Done
                                        </span>
                                    </div>
                                )}

                                {/* Casualty overlay */}
                                {isCasualty && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-accent/40 z-30">
                                        <Skull className="w-16 h-16 text-white drop-shadow-lg" />
                                    </div>
                                )}
                            </div>

                            {/* Wounds tracker */}
                            <div className="flex items-center justify-between bg-surface-dark border border-border mt-1 p-1.5">
                                <span className="text-[10px] font-mono-tech text-muted-foreground uppercase tracking-wider pl-1">
                                    Wounds
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => healWound(recruit.id)}
                                        className="w-7 h-7 border border-border bg-black flex items-center justify-center text-muted-foreground hover:text-secondary hover:border-secondary transition-colors"
                                    >
                                        <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <span className={`font-mono-tech text-sm font-bold w-4 text-center ${
                                        isCasualty ? 'text-accent' : currentWounds > 0 ? 'text-primary' : 'text-white'
                                    }`}>
                                        {currentWounds}
                                    </span>
                                    <button
                                        onClick={() => addWound(recruit.id)}
                                        className="w-7 h-7 border border-border bg-black flex items-center justify-center text-muted-foreground hover:text-accent hover:border-accent transition-colors"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Equipped items — full cards */}
                            {equippedItems.length > 0 && (
                                <div className="mt-2 space-y-2">
                                    {equippedItems.map(item => {
                                        if (item.type === 'weapon') {
                                            return (
                                                <WeaponTile key={item.equipId} weapon={item.weapon} />
                                            );
                                        }
                                        const flipKey = `play-${recruit.id}-${item.equipId}`;
                                        return (
                                            <div
                                                key={item.equipId}
                                                className="card-flip-container w-full cursor-pointer"
                                                onClick={(e) => { e.stopPropagation(); toggleFlip(flipKey); }}
                                            >
                                                <div className={`card-flip-inner ${flippedCards.has(flipKey) ? 'flipped' : ''}`}>
                                                    <div className="card-flip-front">
                                                        <ProgramCard program={item.program} side="front" />
                                                    </div>
                                                    <div className="card-flip-back">
                                                        <ProgramCard program={item.program} side="back" />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
