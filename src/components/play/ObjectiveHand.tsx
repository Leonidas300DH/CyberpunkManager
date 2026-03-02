'use client';

import { useState } from 'react';
import { Objective } from '@/types';
import { useCardGrid } from '@/hooks/useCardGrid';
import { ObjectiveCard } from '@/components/shared/ObjectiveCard';
import { Target, ChevronDown, ChevronUp, Check, AlertTriangle } from 'lucide-react';

interface ObjectiveHandProps {
    objectives: Objective[];
    completedIds: string[];
    carryingLeaderPenalty?: boolean;
    leaderCardId?: string;
    onComplete: (objectiveId: string) => void;
}

export function ObjectiveHand({ objectives, completedIds, carryingLeaderPenalty, leaderCardId, onComplete }: ObjectiveHandProps) {
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
                                    if (isCompleted) return;
                                    if (isConfirming) {
                                        onComplete(obj.id);
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
                                            {isCompleted && (
                                                <>
                                                    <div className="absolute inset-0 z-20 border-2 border-emerald-500 pointer-events-none" />
                                                    <div className="absolute inset-0 z-20 bg-emerald-900/20 pointer-events-none" />
                                                    <div className="absolute top-2 right-2 z-30 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center pointer-events-none">
                                                        <Check className="w-4 h-4 text-white" />
                                                    </div>
                                                </>
                                            )}
                                            {/* Leader penalty border */}
                                            {isLeader && !isCompleted && (
                                                <>
                                                    <div className="absolute inset-0 z-20 border-2 border-accent pointer-events-none" />
                                                    <div className="absolute top-2 right-2 z-30 pointer-events-none">
                                                        <AlertTriangle className="w-5 h-5 text-accent" />
                                                    </div>
                                                </>
                                            )}
                                            {/* Confirm tap overlay */}
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
