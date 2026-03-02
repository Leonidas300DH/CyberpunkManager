'use client';

import { useState } from 'react';
import { Objective } from '@/types';
import { useCardGrid } from '@/hooks/useCardGrid';
import { ObjectiveCard, FACTION_COLOR_MAP as OBJ_FACTION_COLOR } from '@/components/shared/ObjectiveCard';
import { CardPreviewTooltip } from '@/components/ui/CardPreviewTooltip';
import { Target, ChevronDown, ChevronUp, Check, AlertTriangle, Undo2 } from 'lucide-react';

interface ObjectiveHandProps {
    objectives: Objective[];
    completedIds: string[];
    carryingLeaderPenalty?: boolean;
    leaderCardId?: string;
    onComplete: (objectiveId: string) => void;
    onUncomplete: (objectiveId: string) => void;
}

export function ObjectiveHand({ objectives, completedIds, carryingLeaderPenalty, leaderCardId, onComplete, onUncomplete }: ObjectiveHandProps) {
    const [open, setOpen] = useState(true);
    const [confirmingId, setConfirmingId] = useState<string | null>(null);
    const { gridClass } = useCardGrid();

    const completedSet = new Set(completedIds);
    const completedCount = completedIds.length;
    const totalCount = objectives.length;

    const isLeaderCard = (id: string) => carryingLeaderPenalty && id === leaderCardId;

    return (
        <div className="mb-4 -mx-4 px-4">
            {/* Header */}
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 w-full text-left py-1.5"
            >
                <Target className="w-3.5 h-3.5 text-primary" />
                <span className="font-display text-xs font-bold text-white uppercase tracking-wider">
                    Objectives
                </span>
                <span className="text-[9px] font-mono-tech text-muted-foreground">
                    {completedCount}/{totalCount} completed
                </span>
                {open ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground ml-auto" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-auto" />}
            </button>

            {/* Collapsed: capsule view with hover preview */}
            {!open && (
                <div className="mt-1 flex flex-wrap gap-1.5 px-1">
                    {objectives.map((obj) => {
                        const isCompleted = completedSet.has(obj.id);
                        const fColor = OBJ_FACTION_COLOR[obj.factionId] ?? 'border-gray-500';
                        return (
                            <CardPreviewTooltip key={obj.id} renderCard={() => <ObjectiveCard objective={obj} />}>
                                <span className={`inline-flex items-center gap-1 text-[11px] font-mono-tech px-2.5 py-0.5 bg-black border ${fColor} rounded-full text-white cursor-default hover:brightness-125 transition-all`}>
                                    {isCompleted && <Check className="w-3 h-3 text-emerald-400 shrink-0" />}
                                    {obj.name}
                                </span>
                            </CardPreviewTooltip>
                        );
                    })}
                </div>
            )}

            {open && (
                <div className={`mt-1 ${gridClass}`}>
                    {objectives.map((obj) => {
                        const isCompleted = completedSet.has(obj.id);
                        const isLeader = isLeaderCard(obj.id);
                        const isConfirming = confirmingId === obj.id;

                        return (
                            <button
                                key={obj.id}
                                onClick={() => {
                                    if (isConfirming) {
                                        if (isCompleted) {
                                            onUncomplete(obj.id);
                                        } else {
                                            onComplete(obj.id);
                                        }
                                        setConfirmingId(null);
                                    } else {
                                        setConfirmingId(obj.id);
                                    }
                                }}
                                onBlur={() => setTimeout(() => setConfirmingId(null), 200)}
                                className="relative text-left"
                            >
                                <ObjectiveCard
                                    objective={obj}
                                    overlay={
                                        <>
                                            {/* Completed overlay */}
                                            {isCompleted && !isConfirming && (
                                                <>
                                                    <div className="absolute inset-0 z-20 border-2 border-emerald-500 pointer-events-none" />
                                                    <div className="absolute inset-0 z-20 bg-emerald-900/20 pointer-events-none" />
                                                    <div className="absolute top-2 right-2 z-30 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center pointer-events-none">
                                                        <Check className="w-4 h-4 text-white" />
                                                    </div>
                                                </>
                                            )}
                                            {/* Leader penalty border */}
                                            {isLeader && !isCompleted && !isConfirming && (
                                                <>
                                                    <div className="absolute inset-0 z-20 border-2 border-accent pointer-events-none" />
                                                    <div className="absolute top-2 right-2 z-30 pointer-events-none">
                                                        <AlertTriangle className="w-5 h-5 text-accent" />
                                                    </div>
                                                </>
                                            )}
                                            {/* Confirm tap overlay — complete */}
                                            {isConfirming && !isCompleted && (
                                                <div className="absolute inset-0 z-20 bg-black/60 flex items-center justify-center">
                                                    <div className="text-center">
                                                        <Check className="w-8 h-8 text-emerald-400 mx-auto mb-1" />
                                                        <span className="text-[10px] font-mono-tech text-emerald-400 uppercase tracking-wider animate-pulse">
                                                            Tap again to complete
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                            {/* Confirm tap overlay — uncomplete */}
                                            {isConfirming && isCompleted && (
                                                <div className="absolute inset-0 z-20 bg-black/60 flex items-center justify-center">
                                                    <div className="text-center">
                                                        <Undo2 className="w-8 h-8 text-amber-400 mx-auto mb-1" />
                                                        <span className="text-[10px] font-mono-tech text-amber-400 uppercase tracking-wider animate-pulse">
                                                            Tap again to undo
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    }
                                />
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
