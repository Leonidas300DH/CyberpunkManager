'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Swords, Shield, Skull, RotateCcw, Minus, Plus, Crosshair, Cpu } from 'lucide-react';
import { resolveEquipmentItem } from '@/lib/math';

export function ActiveMatchView() {
    const router = useRouter();
    const { catalog, campaigns, activeMatchTeam, setActiveMatchTeam } = useStore();

    const [activatedModels, setActivatedModels] = useState<Record<string, boolean>>({});
    const [wounds, setWounds] = useState<Record<string, number>>({});

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
                        {/* Reset activations */}
                        <button
                            onClick={() => setActivatedModels({})}
                            className="p-2 border border-border bg-surface-dark text-secondary hover:bg-secondary hover:text-black transition-colors clip-corner-tr"
                            title="New round — reset activations"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>

                        {/* End match */}
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
            <div className="mt-6 space-y-3">
                {matchRoster.map(recruit => {
                    const profile = getProfile(recruit.currentProfileId);
                    const lineage = profile ? getLineage(profile.lineageId) : null;
                    if (!profile || !lineage) return null;

                    const isActivated = activatedModels[recruit.id];
                    const currentWounds = wounds[recruit.id] || 0;
                    const isCasualty = currentWounds >= 4;

                    return (
                        <div
                            key={recruit.id}
                            className={`border bg-surface-dark clip-corner-tl-br overflow-hidden transition-all ${
                                isCasualty
                                    ? 'border-accent bg-accent/5'
                                    : isActivated
                                        ? 'border-border opacity-50 saturate-0'
                                        : 'border-border'
                            }`}
                        >
                            <div className="flex">
                                {/* Portrait */}
                                <div
                                    className="w-24 shrink-0 relative cursor-pointer bg-black overflow-hidden"
                                    onClick={() => toggleActivation(recruit.id)}
                                >
                                    {lineage.imageUrl && (
                                        <img
                                            src={lineage.imageUrl}
                                            alt={lineage.name}
                                            className="w-full h-full object-cover"
                                        />
                                    )}

                                    {/* Activated overlay */}
                                    {isActivated && !isCasualty && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                                            <span className="font-display text-xs font-bold text-muted-foreground uppercase tracking-widest rotate-[-15deg]">
                                                Done
                                            </span>
                                        </div>
                                    )}

                                    {/* Casualty overlay */}
                                    {isCasualty && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-accent/60">
                                            <Skull className="w-8 h-8 text-white" />
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 p-3 min-w-0">
                                    {/* Name + Type + Armor */}
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="min-w-0">
                                            <h4 className="font-display text-base font-bold text-white uppercase tracking-wider leading-none truncate">
                                                {lineage.name}
                                            </h4>
                                            <span className="text-[10px] font-mono-tech text-muted-foreground uppercase tracking-wider">
                                                {lineage.type}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0 ml-2">
                                            <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                                            <span className="font-mono-tech text-sm font-bold text-white">{profile.armor}</span>
                                        </div>
                                    </div>

                                    {/* Action Tokens */}
                                    <div className="flex gap-1.5 mb-3">
                                        {[...Array(profile.actionTokens.green)].map((_, i) => (
                                            <div key={`g${i}`} className="w-4 h-4 bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
                                        ))}
                                        {[...Array(profile.actionTokens.yellow)].map((_, i) => (
                                            <div key={`y${i}`} className="w-4 h-4 bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.6)]" />
                                        ))}
                                        {[...Array(profile.actionTokens.red)].map((_, i) => (
                                            <div key={`r${i}`} className="w-4 h-4 bg-red-600 shadow-[0_0_6px_rgba(220,38,38,0.6)]" />
                                        ))}
                                    </div>

                                    {/* Wounds Tracker */}
                                    <div className="flex items-center justify-between bg-black/50 border border-border p-1.5">
                                        <span className="text-[10px] font-mono-tech text-muted-foreground uppercase tracking-wider pl-1">
                                            Wounds
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => healWound(recruit.id)}
                                                className="w-6 h-6 border border-border bg-surface-dark flex items-center justify-center text-muted-foreground hover:text-secondary hover:border-secondary transition-colors"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className={`font-mono-tech text-sm font-bold w-4 text-center ${
                                                isCasualty ? 'text-accent' : currentWounds > 0 ? 'text-primary' : 'text-white'
                                            }`}>
                                                {currentWounds}
                                            </span>
                                            <button
                                                onClick={() => addWound(recruit.id)}
                                                className="w-6 h-6 border border-border bg-surface-dark flex items-center justify-center text-muted-foreground hover:text-accent hover:border-accent transition-colors"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Innate Actions */}
                                    {profile.actions.length > 0 && (
                                        <div className="mt-2 bg-black/50 border border-border p-1.5">
                                            <div className="flex items-center gap-1 mb-1">
                                                <Crosshair className="w-3 h-3 text-muted-foreground" />
                                                <span className="text-[9px] font-mono-tech text-muted-foreground uppercase tracking-wider">
                                                    Actions
                                                </span>
                                            </div>
                                            <div className="space-y-0.5">
                                                {profile.actions.map(action => (
                                                    <div key={action.id} className="flex items-center justify-between text-[10px] font-mono-tech">
                                                        <span className="text-white truncate">{action.name}</span>
                                                        <span className={`shrink-0 ml-1 px-1 ${
                                                            action.range === 'Red' ? 'text-red-400' :
                                                            action.range === 'Yellow' ? 'text-yellow-400' :
                                                            action.range === 'Green' ? 'text-green-400' :
                                                            'text-muted-foreground'
                                                        }`}>
                                                            {action.range}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Bonus Equipment */}
                                    {activeMatchTeam.equipmentMap && activeMatchTeam.equipmentMap[recruit.id]?.length > 0 && (
                                        <div className="mt-1 bg-black/50 border border-secondary/30 p-1.5">
                                            <div className="flex items-center gap-1 mb-1">
                                                <Cpu className="w-3 h-3 text-secondary" />
                                                <span className="text-[9px] font-mono-tech text-secondary uppercase tracking-wider">
                                                    Equipment
                                                </span>
                                            </div>
                                            <div className="space-y-0.5">
                                                {activeMatchTeam.equipmentMap[recruit.id].map(itemId => {
                                                    const resolved = resolveEquipmentItem(itemId, catalog);
                                                    if (!resolved) return null;
                                                    return (
                                                        <div key={itemId} className="text-[10px] font-mono-tech text-white">
                                                            {resolved.name}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
