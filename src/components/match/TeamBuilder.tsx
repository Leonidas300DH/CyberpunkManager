'use client';

import { useState } from 'react';
import { Campaign, ModelLineage } from '@/types';
import { useStore } from '@/store/useStore';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Plus } from 'lucide-react';
import { useTeamBuilder } from '@/hooks/useTeamBuilder';
import { MercCard } from './MercCard';

interface TeamBuilderProps {
    campaign: Campaign;
}

type FilterType = 'all' | ModelLineage['type'];

export function TeamBuilder({ campaign }: TeamBuilderProps) {
    const {
        targetEB,
        setTargetEB,
        totalCost,
        isValid,
        validationErrors,
        selectedIds,
        toggleSelection,
        handleStartMatch
    } = useTeamBuilder(campaign);

    const { catalog } = useStore();
    const [filter, setFilter] = useState<FilterType>('all');

    const getProfile = (profileId: string) => catalog.profiles.find(p => p.id === profileId);
    const getLineage = (lineageId: string) => catalog.lineages.find(l => l.id === lineageId);

    // Collect unique types from roster
    const rosterTypes = Array.from(new Set(
        campaign.hqRoster.map(r => {
            const p = getProfile(r.currentProfileId);
            return p ? getLineage(p.lineageId)?.type : null;
        }).filter(Boolean)
    )) as ModelLineage['type'][];

    // Filter roster
    const filteredRoster = campaign.hqRoster.filter(recruit => {
        if (filter === 'all') return true;
        const profile = getProfile(recruit.currentProfileId);
        if (!profile) return false;
        const lineage = getLineage(profile.lineageId);
        return lineage?.type === filter;
    });

    const budgetPercent = Math.min(100, Math.round((totalCost / targetEB) * 100));

    return (
        <div className="pb-28">
            {/* === STICKY HEADER === */}
            <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-border shadow-[0_4px_20px_rgba(0,0,0,0.8)] -mx-4 px-4">
                <div className="max-w-7xl mx-auto py-3 flex items-center justify-between gap-4">
                    {/* Left: Logo + Title */}
                    <div className="flex items-center space-x-3 shrink-0">
                        <div className="h-10 w-10 bg-surface-dark border border-primary flex items-center justify-center clip-corner-tr hover:bg-primary group transition-colors duration-300">
                            <svg className="w-5 h-5 text-primary group-hover:text-black transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                            </svg>
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="font-display text-2xl font-bold uppercase leading-none tracking-widest text-white">
                                Combat Zone
                            </h1>
                            <p className="text-xs text-secondary font-mono-tech uppercase tracking-[0.2em]">
                                Mission Prep // v2.077
                            </p>
                        </div>
                    </div>

                    {/* Center: Budget Tracker */}
                    <div className="hidden md:flex flex-col items-center justify-center bg-surface-dark px-6 py-2 border border-secondary/50 relative overflow-hidden group clip-corner-br">
                        <div className="absolute inset-0 bg-secondary/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        <span className="text-secondary text-xs font-mono-tech uppercase tracking-widest mb-1">
                            Squad Budget
                        </span>
                        <div className="flex items-end space-x-2">
                            <span className={`text-3xl font-display font-bold leading-none tracking-wide ${totalCost > targetEB ? 'text-accent' : 'text-white'}`}>
                                {totalCost}
                            </span>
                            <span className="text-xl font-display text-muted-foreground mb-0.5">/</span>
                            <div className="flex items-center gap-1 mb-0.5">
                                <Input
                                    type="number"
                                    value={targetEB}
                                    onChange={(e) => setTargetEB(Number(e.target.value))}
                                    className="w-14 h-6 text-center bg-transparent border-none p-0 text-xl font-display text-muted-foreground focus-visible:ring-0 focus-visible:text-white"
                                />
                                <span className="text-xl font-display text-muted-foreground">EB</span>
                            </div>
                        </div>
                        <div className="w-full h-1 bg-black mt-1 border border-border">
                            <div
                                className={`h-full transition-all duration-300 ${totalCost > targetEB ? 'bg-accent shadow-[0_0_8px_rgba(255,0,60,0.8)]' : 'bg-secondary shadow-[0_0_8px_rgba(0,240,255,0.8)]'}`}
                                style={{ width: `${budgetPercent}%` }}
                            />
                        </div>
                    </div>

                    {/* Right: Deploy Button */}
                    <button
                        onClick={handleStartMatch}
                        disabled={!isValid}
                        className={`
                            font-display font-bold text-xl px-6 py-2 clip-corner-br uppercase tracking-widest transition-all flex items-center gap-2 shrink-0
                            ${isValid
                                ? 'bg-primary hover:bg-white text-black hover:shadow-[0_0_15px_rgba(255,255,255,0.4)] active:scale-95'
                                : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                            }
                        `}
                    >
                        <span>{isValid ? 'Deploy' : 'Invalid'}</span>
                        {isValid && (
                            <svg className="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Mobile budget bar */}
                <div className="md:hidden pb-2 px-1">
                    <div className="flex items-center justify-between text-xs font-mono-tech text-muted-foreground uppercase tracking-wider mb-1">
                        <span className="text-secondary">Squad Budget</span>
                        <span className={totalCost > targetEB ? 'text-accent' : ''}>
                            {totalCost} / {targetEB} EB
                        </span>
                    </div>
                    <div className="w-full h-1 bg-black border border-border">
                        <div
                            className={`h-full transition-all ${totalCost > targetEB ? 'bg-accent' : 'bg-secondary shadow-[0_0_8px_rgba(0,240,255,0.8)]'}`}
                            style={{ width: `${budgetPercent}%` }}
                        />
                    </div>
                </div>

                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                    <div className="pb-3 px-1">
                        <div className="bg-accent/10 border-l-2 border-accent p-2">
                            <div className="flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-wider mb-1">
                                <AlertTriangle className="h-3 w-3" />
                                <span>Deployment Error</span>
                            </div>
                            <ul className="list-disc list-inside text-[10px] text-muted-foreground font-mono-tech">
                                {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
                            </ul>
                        </div>
                    </div>
                )}
            </header>

            {/* === SECTION HEADER + FILTERS === */}
            <div className="mt-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-end border-l-2 border-primary pl-4 md:pl-6 py-3 bg-surface-dark/50 backdrop-blur-sm">
                <div>
                    <h2 className="font-display text-3xl md:text-5xl text-white uppercase tracking-wider mb-2">
                        Available Mercs
                    </h2>
                    <div className="flex flex-wrap gap-3 md:gap-6 text-sm font-mono-tech text-muted-foreground uppercase tracking-widest">
                        <button
                            onClick={() => setFilter('all')}
                            className={`transition-colors pb-0.5 ${filter === 'all' ? 'text-secondary border-b border-secondary' : 'hover:text-secondary hover:border-b hover:border-secondary'}`}
                        >
                            [ All ]
                        </button>
                        {rosterTypes.map(type => (
                            <button
                                key={type}
                                onClick={() => setFilter(type)}
                                className={`transition-colors pb-0.5 ${filter === type ? 'text-secondary border-b border-secondary' : 'hover:text-secondary hover:border-b hover:border-secondary'}`}
                            >
                                {type}s
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* === CARD GRID === */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredRoster.length === 0 && filter === 'all' && (
                    <div className="col-span-full border border-dashed border-border p-8 text-center text-muted-foreground font-mono-tech uppercase text-xs tracking-widest">
                        No Assets Available. Recruit mercs from HQ first.
                    </div>
                )}

                {filteredRoster.map(recruit => {
                    const profile = getProfile(recruit.currentProfileId);
                    const lineage = profile ? getLineage(profile.lineageId) : null;
                    if (!profile || !lineage) return null;

                    return (
                        <MercCard
                            key={recruit.id}
                            lineage={lineage}
                            profile={profile}
                            isSelected={selectedIds.includes(recruit.id)}
                            onClick={() => toggleSelection(recruit.id)}
                        />
                    );
                })}

                {/* Recruit Merc CTA */}
                <a
                    href="/hq"
                    className="relative group cursor-pointer border-2 border-dashed border-border hover:border-primary transition-all bg-black flex flex-col items-center justify-center min-h-[350px] clip-corner-tl-br shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"
                >
                    <div className="h-20 w-20 clip-corner-tr bg-surface-dark border border-border flex items-center justify-center group-hover:scale-110 transition-transform mb-4 group-hover:border-primary group-hover:bg-primary group-hover:text-black">
                        <Plus className="w-10 h-10 text-muted-foreground group-hover:text-black transition-colors" />
                    </div>
                    <span className="font-display text-2xl text-muted-foreground group-hover:text-white uppercase tracking-widest transition-colors">
                        Recruit Merc
                    </span>
                    <span className="font-mono-tech text-xs text-secondary mt-3 opacity-0 group-hover:opacity-100 uppercase tracking-wider transition-opacity bg-black px-2 py-1 border border-secondary/30">
                        Go to HQ Roster
                    </span>
                </a>
            </div>

            {/* === FOOTER DECORATION === */}
            <div className="fixed bottom-24 left-4 hidden lg:block opacity-30 z-0 pointer-events-none">
                <div className="w-32 h-32 border-l border-b border-primary/20 relative">
                    <div className="absolute bottom-0 left-0 w-2 h-2 bg-primary" />
                    <div className="text-[10px] text-primary font-mono-tech absolute bottom-2 left-4 tracking-[0.2em]">SYS.MONITORING</div>
                </div>
            </div>
            <div className="fixed bottom-24 right-4 hidden lg:block opacity-30 z-0 text-right pointer-events-none">
                <div className="text-secondary font-display text-6xl opacity-10 select-none tracking-tighter leading-none">2077</div>
                <div className="flex justify-end gap-1 mt-2">
                    <div className="w-16 h-1 bg-secondary/20" />
                    <div className="w-4 h-1 bg-secondary/20" />
                    <div className="w-2 h-1 bg-secondary/40 animate-pulse" />
                </div>
            </div>
        </div>
    );
}
