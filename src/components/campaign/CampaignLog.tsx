'use client';

import { useState } from 'react';
import { Campaign, MatchLogEntry, MatchLogRecruit } from '@/types';
import { useStore } from '@/store/useStore';
import { parseEquipmentId } from '@/lib/variants';
import { getTierLabel } from '@/lib/tiers';
import { Trophy, Skull, ChevronRight, ChevronDown, Heart, Swords, Shield } from 'lucide-react';

interface CampaignLogProps {
    campaign: Campaign;
}

function RecruitRow({ recruit }: { recruit: MatchLogRecruit }) {
    const { catalog } = useStore();

    const lineage = catalog.lineages.find(l => l.id === recruit.lineageId);
    const profile = catalog.profiles.find(p => p.id === recruit.profileId);
    if (!lineage || !profile) return null;

    const tierLabel = profile.level > 0 ? getTierLabel(profile.level) : null;
    const imageUrl = lineage.imageUrl;

    // Resolve equipment names
    const equipment: { name: string; type: 'weapon' | 'program' }[] = [];
    for (const eqId of recruit.equipmentIds) {
        const parsed = parseEquipmentId(eqId);
        if (parsed.prefix === 'weapon') {
            const weapon = catalog.weapons.find(w => w.id === parsed.baseId);
            if (weapon && !weapon.isAction) equipment.push({ name: weapon.name, type: 'weapon' });
        } else if (parsed.prefix === 'program') {
            const program = catalog.programs.find(p => p.id === parsed.baseId);
            if (program) equipment.push({ name: program.name, type: 'program' });
        }
    }

    return (
        <div className={`flex items-center gap-3 px-3 py-2 ${recruit.wasKIA ? 'opacity-40' : recruit.wasWounded ? 'opacity-70' : ''}`}>
            {/* Portrait */}
            <div className="relative w-10 h-10 shrink-0 border border-border/50 bg-black overflow-hidden">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={lineage.name}
                        className={`w-full h-full object-cover ${lineage.imageFlipX ? 'scale-x-[-1]' : ''} ${lineage.imageFlipY ? 'scale-y-[-1]' : ''}`}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-surface-dark">
                        <span className="font-display text-[10px] text-muted-foreground">{lineage.name[0]}</span>
                    </div>
                )}
                {recruit.wasKIA && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <Skull className="w-4 h-4 text-accent" />
                    </div>
                )}
                {recruit.wasWounded && !recruit.wasKIA && (
                    <div className="absolute bottom-0 left-0 right-0 bg-yellow-600/80 py-px">
                        <Heart className="w-2.5 h-2.5 mx-auto text-black" />
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1.5">
                    <span className="font-display font-bold text-xs uppercase tracking-wide text-white truncate">
                        {lineage.name}
                    </span>
                    {tierLabel && (
                        <span className={`font-mono-tech text-[9px] uppercase ${profile.level === 1 ? 'text-primary' : 'text-accent'}`}>
                            {tierLabel}
                        </span>
                    )}
                    {recruit.wasKIA && <span className="font-mono-tech text-[9px] text-accent font-bold">KIA</span>}
                    {recruit.wasWounded && !recruit.wasKIA && <span className="font-mono-tech text-[9px] text-yellow-500 font-bold">WND</span>}
                </div>
                {equipment.length > 0 && (
                    <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                        {equipment.map((eq, i) => (
                            <span key={i} className={`font-mono-tech text-[9px] ${eq.type === 'program' ? 'text-cyber-purple' : 'text-muted-foreground'}`}>
                                {eq.name}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function MatchEntry({ entry, matchNumber }: { entry: MatchLogEntry; matchNumber: number }) {
    const [expanded, setExpanded] = useState(matchNumber <= 1); // Latest match expanded by default (matchNumber=1 in reversed view)
    const date = new Date(entry.date);
    const dateStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const isVictory = entry.result === 'victory';
    const team = entry.team ?? [];
    const kiaCount = team.filter(r => r.wasKIA).length;
    const woundedCount = team.filter(r => r.wasWounded && !r.wasKIA).length;

    return (
        <div className={`border ${isVictory ? 'border-primary/30' : 'border-accent/30'} bg-black/50 overflow-hidden`}>
            {/* Header — always visible */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.02] transition-colors"
            >
                {isVictory
                    ? <Trophy className="w-5 h-5 text-primary shrink-0" />
                    : <Skull className="w-5 h-5 text-accent shrink-0" />
                }
                <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-display font-bold text-sm uppercase tracking-wider text-white">
                            Match {matchNumber}
                        </span>
                        <span className={`font-mono-tech text-[10px] uppercase tracking-widest font-bold ${isVictory ? 'text-primary' : 'text-accent'}`}>
                            {entry.result}
                        </span>
                        {entry.targetEB && (
                            <span className="font-mono-tech text-[10px] text-muted-foreground">{entry.targetEB} EB</span>
                        )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                        <span className="font-mono-tech text-[10px] text-muted-foreground uppercase">
                            {dateStr} {timeStr}
                        </span>
                        {team.length > 0 && (
                            <span className="font-mono-tech text-[10px] text-muted-foreground">
                                {team.length} units
                                {kiaCount > 0 && <span className="text-accent ml-1">{kiaCount} KIA</span>}
                                {woundedCount > 0 && <span className="text-yellow-500 ml-1">{woundedCount} WND</span>}
                            </span>
                        )}
                    </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${expanded ? '' : '-rotate-90'}`} />
            </button>

            {/* Expanded content */}
            {expanded && (
                <div className={`border-t ${isVictory ? 'border-primary/20' : 'border-accent/20'}`}>
                    {/* Team roster */}
                    {team.length > 0 && (
                        <div className="border-b border-border/30">
                            <div className="px-4 py-1.5 bg-white/[0.02]">
                                <span className="font-mono-tech text-[9px] uppercase tracking-widest text-muted-foreground font-bold">
                                    <Swords className="w-3 h-3 inline mr-1 -mt-px" />
                                    Squad
                                </span>
                            </div>
                            <div className="divide-y divide-border/20">
                                {team.map((recruit, j) => (
                                    <RecruitRow key={j} recruit={recruit} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Post-game events */}
                    {entry.events.length > 0 && (
                        <div>
                            <div className="px-4 py-1.5 bg-white/[0.02]">
                                <span className="font-mono-tech text-[9px] uppercase tracking-widest text-muted-foreground font-bold">
                                    <Shield className="w-3 h-3 inline mr-1 -mt-px" />
                                    Post-Game
                                </span>
                            </div>
                            <div className="divide-y divide-border/20">
                                {entry.events.map((event, j) => (
                                    <div key={j} className="flex items-start gap-2 px-4 py-2">
                                        <ChevronRight className="w-3 h-3 mt-0.5 text-muted-foreground shrink-0" />
                                        <span className="text-xs font-mono-tech text-white/80">{event}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {entry.events.length === 0 && team.length === 0 && (
                        <div className="px-4 py-3">
                            <span className="text-xs font-mono-tech text-muted-foreground italic">No details recorded</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export function CampaignLog({ campaign }: CampaignLogProps) {
    const log = campaign.matchLog ?? [];

    if (log.length === 0) {
        return (
            <div className="border-2 border-dashed border-border bg-black/50 p-12 text-center clip-corner-tl-br">
                <h3 className="text-xl font-display font-bold uppercase text-muted-foreground mb-2">No Records</h3>
                <p className="text-xs font-mono-tech text-muted-foreground uppercase tracking-widest">Complete a match to start your campaign journal.</p>
            </div>
        );
    }

    // Stats banner
    const wins = log.filter(e => e.result === 'victory').length;
    const losses = log.length - wins;

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="flex items-center gap-6 px-4 py-3 border border-border bg-black/50">
                <div className="flex items-center gap-2">
                    <span className="font-mono-tech text-[10px] text-muted-foreground uppercase tracking-widest">Matches</span>
                    <span className="font-display font-bold text-lg text-white">{log.length}</span>
                </div>
                <div className="w-px h-6 bg-border" />
                <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-primary" />
                    <span className="font-display font-bold text-lg text-primary">{wins}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Skull className="w-4 h-4 text-accent" />
                    <span className="font-display font-bold text-lg text-accent">{losses}</span>
                </div>
                {log.length > 0 && (
                    <>
                        <div className="w-px h-6 bg-border" />
                        <div className="flex-1 h-2 bg-accent/30 overflow-hidden">
                            <div className="h-full bg-primary transition-all" style={{ width: `${(wins / log.length) * 100}%` }} />
                        </div>
                    </>
                )}
            </div>

            {/* Match entries */}
            <div className="space-y-3">
                {[...log].reverse().map((entry, i) => (
                    <MatchEntry key={i} entry={entry} matchNumber={log.length - i} />
                ))}
            </div>
        </div>
    );
}
