'use client';

import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, AlertTriangle, Crosshair } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import { useTeamBuilder } from '@/hooks/useTeamBuilder';
import { TEAM_bUILDER_TEXT } from '@/data/referenceData';

interface TeamBuilderProps {
    campaign: Campaign;
}

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
    const getProfile = (profileId: string) => catalog.profiles.find(p => p.id === profileId);
    const getLineage = (lineageId: string) => catalog.lineages.find(l => l.id === lineageId);

    return (
        <div className="space-y-6 pb-28">
            {/* Cyberpunk Sticky Header */}
            <div className="sticky top-0 z-30 pt-4 -mx-4 px-4 bg-background/95 border-b-2 border-primary/20 backdrop-blur pb-4">
                <div className="flex justify-between items-end">
                    <div className="space-y-1">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{TEAM_bUILDER_TEXT.superTitle}</div>
                        <h2 className="font-black text-xl uppercase tracking-tighter text-primary glitch-text" data-text={TEAM_bUILDER_TEXT.title}>{TEAM_bUILDER_TEXT.title}</h2>
                        <div className="flex items-baseline space-x-2">
                            <span className={`text-4xl font-black font-mono tracking-tighter leading-none ${totalCost > targetEB ? 'text-destructive glitch-text' : 'text-foreground'}`} data-text={totalCost}>
                                {totalCost}
                            </span>
                            <span className="text-sm font-bold text-muted-foreground">/ {targetEB} {TEAM_bUILDER_TEXT.currency}</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center border border-muted bg-card px-2 py-1 cp-cut-bl">
                            <span className="text-[10px] uppercase font-bold text-primary mr-2">{TEAM_bUILDER_TEXT.limitLabel}</span>
                            <Input
                                type="number"
                                value={targetEB}
                                onChange={(e) => setTargetEB(Number(e.target.value))}
                                className="w-16 h-6 text-right bg-transparent border-none p-0 text-foreground font-mono focus-visible:ring-0"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex gap-2">
                    <button
                        onClick={handleStartMatch}
                        disabled={!isValid}
                        className={`
                            flex-1 p-3 font-black uppercase tracking-widest text-sm flex items-center justify-center transition-all duration-200
                            cp-cut-tr
                            ${isValid
                                ? 'bg-primary text-black hover:bg-white hover:text-black hover:scale-[1.02] shadow-[4px_4px_0px_rgba(255,255,255,0.2)]'
                                : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                            }
                        `}
                    >
                        <Crosshair className="w-4 h-4 mr-2" />
                        {isValid ? TEAM_bUILDER_TEXT.deployButton.valid : TEAM_bUILDER_TEXT.deployButton.invalid}
                    </button>
                </div>

                {validationErrors.length > 0 && (
                    <div className="mt-3 bg-destructive/10 border-l-2 border-destructive p-2 animate-in slide-in-from-top-2">
                        <div className="flex items-center gap-2 text-destructive text-xs font-bold uppercase tracking-wider mb-1">
                            <AlertTriangle className="h-3 w-3" />
                            <span>{TEAM_bUILDER_TEXT.errorTitle}</span>
                        </div>
                        <ul className="list-disc list-inside text-[10px] text-destructive-foreground/80 font-mono">
                            {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
                        </ul>
                    </div>
                )}
            </div>

            <div className="space-y-3">
                {campaign.hqRoster.length === 0 && (
                    <div className="border border-dashed border-muted p-8 text-center text-muted-foreground font-mono uppercase text-xs">
                        {TEAM_bUILDER_TEXT.emptyState}
                    </div>
                )}
                {campaign.hqRoster.map(recruit => {
                    const profile = getProfile(recruit.profileId);
                    const lineage = profile ? getLineage(profile.lineageId) : null;
                    if (!profile || !lineage) return null;

                    const isSelected = selectedIds.includes(recruit.id);

                    return (
                        <div
                            key={recruit.id}
                            className={`
                                relative p-1 transition-all duration-200 cursor-pointer group select-none
                                ${isSelected
                                    ? 'bg-primary pl-2'
                                    : 'bg-card hover:bg-muted pl-0'
                                }
                            `}
                            onClick={() => toggleSelection(recruit.id)}
                        >
                            <div className="bg-card w-full h-full flex p-3 border border-muted relative z-10">
                                {/* Left: Avatar */}
                                <div className="w-16 h-16 bg-black grayscale group-hover:grayscale-0 transition-all duration-300 relative border border-white/10 shrink-0">
                                    {lineage.imageUrl && <img src={lineage.imageUrl} className="w-full h-full object-cover" />}
                                    <div className="absolute bottom-0 right-0 bg-primary text-black text-[9px] font-black px-1 font-mono leading-3">
                                        R{profile.level}
                                    </div>
                                </div>

                                <div className="flex-1 pl-4 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className={`font-bold text-sm uppercase tracking-tight ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                                                {recruit.name || lineage.name}
                                            </h4>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-mono text-muted-foreground bg-muted px-1">
                                                    {lineage.type}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="font-mono font-bold text-lg text-foreground">{profile.costEB}<span className="text-[10px] ml-1 text-muted-foreground">EB</span></span>
                                    </div>

                                    <div className="flex justify-between items-end mt-2">
                                        {/* Status Indicators */}
                                        <div className="flex gap-1">
                                            {[...Array(profile.actionTokens.green)].map((_, i) => <div key={`g${i}`} className="w-1.5 h-1.5 bg-green-500 rounded-sm" />)}
                                            {[...Array(profile.actionTokens.yellow)].map((_, i) => <div key={`y${i}`} className="w-1.5 h-1.5 bg-yellow-500 rounded-sm" />)}
                                            {[...Array(profile.actionTokens.red)].map((_, i) => <div key={`r${i}`} className="w-1.5 h-1.5 bg-red-500 rounded-sm" />)}
                                        </div>

                                        {isSelected && (
                                            <div className="flex items-center text-primary text-[10px] font-black uppercase tracking-widest animate-pulse">
                                                <Check className="w-3 h-3 mr-1" /> Selected
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Selected Background Visuals */}
                            {isSelected && (
                                <div className="absolute inset-0 bg-primary opacity-20 transform translate-x-1 translate-y-1 -z-10" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
