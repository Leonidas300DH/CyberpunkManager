'use client';

import { useState } from 'react';
import { Objective } from '@/types';
import { Target, ChevronDown, ChevronUp, Check, AlertTriangle } from 'lucide-react';

interface ObjectiveHandProps {
    objectives: Objective[];
    completedIds: string[];
    carryingLeaderPenalty?: boolean;
    leaderCardId?: string;
    onComplete: (objectiveId: string) => void;
}

function RewardBadge({ type }: { type: string }) {
    const colors: Record<string, string> = {
        ongoing: 'bg-emerald-600 text-white',
        recycle: 'bg-amber-600 text-white',
        cybergear: 'bg-purple-600 text-white',
        immediate: 'bg-blue-600 text-white',
    };
    return (
        <span className={`text-[7px] font-mono-tech uppercase tracking-wider px-1 py-0.5 ${colors[type] ?? 'bg-zinc-700 text-white'}`}>
            {type}
        </span>
    );
}

export function ObjectiveHand({ objectives, completedIds, carryingLeaderPenalty, leaderCardId, onComplete }: ObjectiveHandProps) {
    const [open, setOpen] = useState(true);
    const [confirmingId, setConfirmingId] = useState<string | null>(null);

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
                <div className="flex flex-wrap gap-2 mt-1">
                    {objectives.map((obj) => {
                        const isCompleted = completedSet.has(obj.id);
                        const isLeader = isLeaderCard(obj.id);
                        const isConfirming = confirmingId === obj.id;

                        return (
                            <div key={obj.id} className="relative">
                                <button
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
                                    className={`text-left border-2 p-2 min-w-[100px] max-w-[150px] transition-all ${
                                        isCompleted
                                            ? 'border-emerald-500 bg-emerald-500/10'
                                            : isLeader
                                                ? 'border-accent bg-accent/10'
                                                : isConfirming
                                                    ? 'border-primary bg-primary/10'
                                                    : 'border-border bg-black/50 hover:border-secondary'
                                    }`}
                                >
                                    {/* Name + check */}
                                    <div className="flex items-start justify-between gap-1">
                                        <div className={`text-[9px] font-display font-bold uppercase leading-tight truncate flex-1 ${
                                            isCompleted ? 'text-emerald-400' : isLeader ? 'text-accent' : 'text-white'
                                        }`}>
                                            {obj.name}
                                        </div>
                                        {isCompleted && <Check className="w-3 h-3 text-emerald-400 shrink-0" />}
                                        {isLeader && !isCompleted && <AlertTriangle className="w-3 h-3 text-accent shrink-0" />}
                                    </div>

                                    {/* Badges */}
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <RewardBadge type={obj.rewardType} />
                                        {obj.grantsStreetCred > 0 && (
                                            <span className="text-primary text-[9px]">{'★'.repeat(obj.grantsStreetCred)}</span>
                                        )}
                                    </div>

                                    {/* Rewards preview */}
                                    {obj.grantsEB && obj.grantsEB > 0 && (
                                        <div className="text-[7px] font-mono-tech text-primary mt-0.5">+{obj.grantsEB} EB</div>
                                    )}
                                    {obj.grantsLuck && obj.grantsLuck > 0 && (
                                        <div className="text-[7px] font-mono-tech text-purple-400 mt-0.5">+{obj.grantsLuck} Luck</div>
                                    )}

                                    {/* Confirm tap overlay */}
                                    {isConfirming && !isCompleted && (
                                        <div className="mt-1 text-[8px] font-mono-tech text-primary uppercase tracking-wider animate-pulse">
                                            Tap again to complete
                                        </div>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
