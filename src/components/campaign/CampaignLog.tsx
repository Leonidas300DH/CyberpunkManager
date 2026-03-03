'use client';

import { Campaign } from '@/types';
import { Trophy, Skull, ChevronRight } from 'lucide-react';

interface CampaignLogProps {
    campaign: Campaign;
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

    return (
        <div className="space-y-4">
            {[...log].reverse().map((entry, i) => {
                const matchNumber = log.length - i;
                const date = new Date(entry.date);
                const dateStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                const isVictory = entry.result === 'victory';

                return (
                    <div key={i} className="border border-border bg-black/50">
                        {/* Header */}
                        <div className={`flex items-center gap-3 px-4 py-3 border-b ${isVictory ? 'border-primary/30' : 'border-accent/30'}`}>
                            {isVictory
                                ? <Trophy className="w-5 h-5 text-primary shrink-0" />
                                : <Skull className="w-5 h-5 text-accent shrink-0" />
                            }
                            <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2">
                                    <span className="font-display font-bold text-sm uppercase tracking-wider text-white">
                                        Match {matchNumber}
                                    </span>
                                    <span className={`font-mono-tech text-[10px] uppercase tracking-widest font-bold ${isVictory ? 'text-primary' : 'text-accent'}`}>
                                        {entry.result}
                                    </span>
                                </div>
                                <span className="font-mono-tech text-[10px] text-muted-foreground uppercase">
                                    {dateStr}
                                </span>
                            </div>
                        </div>

                        {/* Events */}
                        {entry.events.length > 0 ? (
                            <div className="divide-y divide-border/50">
                                {entry.events.map((event, j) => (
                                    <div key={j} className="flex items-start gap-2 px-4 py-2">
                                        <ChevronRight className="w-3 h-3 mt-0.5 text-muted-foreground shrink-0" />
                                        <span className="text-xs font-mono-tech text-white/80">{event}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="px-4 py-2">
                                <span className="text-xs font-mono-tech text-muted-foreground italic">No notable events</span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
