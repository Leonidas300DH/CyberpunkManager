'use client';

import { useState } from 'react';
import { Campaign, Objective } from '@/types';
import { TeamBuilderDraft } from '@/store/useStore';
import { getLeaderCard, getEligiblePool, drawObjectives } from '@/lib/objectives';
import { useCardGrid } from '@/hooks/useCardGrid';
import { ObjectiveCard } from '@/components/shared/ObjectiveCard';
import { ChevronDown, ChevronUp, Target, Shuffle, Check } from 'lucide-react';

interface ObjectiveDrawerProps {
    campaign: Campaign;
    objectives: Objective[];
    factionId: string;
    campaignStreetCred: number;
    draft: TeamBuilderDraft;
    onDraftChange: (patch: Partial<TeamBuilderDraft>) => void;
}

export function ObjectiveDrawer({ campaign, objectives, factionId, campaignStreetCred, draft, onDraftChange }: ObjectiveDrawerProps) {
    const [open, setOpen] = useState(true);
    const { gridClass } = useCardGrid();

    const enabled = draft.objectivesEnabled ?? false;
    const carryingLeader = draft.carryingLeaderPenalty ?? false;
    const drawnIds = draft.drawnObjectiveIds ?? [];
    const selectedIds = draft.selectedObjectiveIds ?? [];

    const leaderCard = getLeaderCard(objectives, factionId);
    const hasLeaderCard = !!leaderCard;

    const drawCount = carryingLeader ? 3 : 4;
    const keepCount = carryingLeader ? 2 : 3;

    const drawnObjectives = drawnIds
        .map((id) => objectives.find((o) => o.id === id))
        .filter(Boolean) as Objective[];

    const selectedSet = new Set(selectedIds);

    const handleDraw = () => {
        const pool = getEligiblePool(objectives, factionId, campaignStreetCred, campaign.completedObjectives);
        const drawn = drawObjectives(pool, drawCount);
        onDraftChange({
            drawnObjectiveIds: drawn.map((o) => o.id),
            selectedObjectiveIds: [],
        });
    };

    const toggleCard = (id: string) => {
        if (selectedSet.has(id)) {
            onDraftChange({ selectedObjectiveIds: selectedIds.filter((x) => x !== id) });
        } else {
            if (selectedIds.length >= keepCount) return;
            onDraftChange({ selectedObjectiveIds: [...selectedIds, id] });
        }
    };

    const isReady = selectedIds.length === keepCount;
    const poolSize = getEligiblePool(objectives, factionId, campaignStreetCred, campaign.completedObjectives).length;

    return (
        <div className="mb-4">
            {/* Header */}
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-3 w-full text-left border-l-2 border-primary pl-4 py-1"
            >
                <Target className="w-4 h-4 text-primary" />
                <h2 className="font-display text-lg text-white uppercase tracking-wider">
                    Objectives
                </h2>
                <span className="text-[9px] font-mono-tech text-muted-foreground uppercase tracking-widest">
                    optional
                </span>
                {open ? <ChevronUp className="w-4 h-4 text-muted-foreground ml-auto" /> : <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto" />}
            </button>

            {open && (
                <div className="mt-3 pl-6 space-y-3">
                    {/* Toggle: Play with objectives */}
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={enabled}
                            onChange={(e) => onDraftChange({
                                objectivesEnabled: e.target.checked,
                                ...(e.target.checked ? {} : { drawnObjectiveIds: [], selectedObjectiveIds: [], carryingLeaderPenalty: false }),
                            })}
                            className="accent-primary w-4 h-4"
                        />
                        <span className="text-xs font-mono-tech text-white uppercase tracking-wider">
                            Play with objectives
                        </span>
                        {poolSize > 0 && (
                            <span className="text-[9px] font-mono-tech text-muted-foreground">
                                ({poolSize} available)
                            </span>
                        )}
                    </label>

                    {enabled && (
                        <>
                            {/* Leader penalty toggle */}
                            {hasLeaderCard && (
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={carryingLeader}
                                        onChange={(e) => onDraftChange({
                                            carryingLeaderPenalty: e.target.checked,
                                            drawnObjectiveIds: [],
                                            selectedObjectiveIds: [],
                                        })}
                                        className="accent-accent w-4 h-4"
                                    />
                                    <span className="text-xs font-mono-tech text-accent uppercase tracking-wider">
                                        Carrying Wounded Leader
                                    </span>
                                    <span className="text-[9px] font-mono-tech text-muted-foreground">(-1 SC)</span>
                                </label>
                            )}

                            {/* Draw / Redraw buttons */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleDraw}
                                    disabled={poolSize === 0}
                                    className="flex items-center gap-2 px-4 py-1.5 bg-primary text-black font-display font-bold text-xs uppercase tracking-widest clip-corner-br hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <Shuffle className="w-3.5 h-3.5" />
                                    {drawnIds.length > 0 ? 'Redraw' : 'Draw'}
                                </button>
                                {drawnIds.length > 0 && (
                                    <span className="text-[10px] font-mono-tech text-muted-foreground">
                                        {selectedIds.length}/{keepCount} selected
                                        {!isReady && drawnIds.length > 0 && ' — tap to keep'}
                                    </span>
                                )}
                                {isReady && (
                                    <span className="text-[10px] font-mono-tech text-emerald-400 flex items-center gap-1">
                                        <Check className="w-3 h-3" /> Ready
                                    </span>
                                )}
                            </div>

                            {/* Drawn cards — full ObjectiveCard layout */}
                            {(drawnObjectives.length > 0 || (carryingLeader && leaderCard)) && (
                                <div className={gridClass}>
                                    {/* Leader card (auto-included) */}
                                    {carryingLeader && leaderCard && (
                                        <div className="relative cursor-default">
                                            <ObjectiveCard
                                                objective={leaderCard}
                                                overlay={
                                                    <div className="absolute inset-0 z-20 border-2 border-accent pointer-events-none flex items-end justify-center pb-2">
                                                        <span className="text-[9px] font-mono-tech font-bold text-accent uppercase tracking-wider bg-black/80 px-2 py-0.5">
                                                            Auto-included
                                                        </span>
                                                    </div>
                                                }
                                            />
                                        </div>
                                    )}

                                    {/* Drawn objectives (selectable) */}
                                    {drawnObjectives.map((obj) => {
                                        const isSelected = selectedSet.has(obj.id);
                                        const canSelect = isSelected || selectedIds.length < keepCount;
                                        return (
                                            <button
                                                key={obj.id}
                                                onClick={() => toggleCard(obj.id)}
                                                className="relative text-left"
                                            >
                                                <ObjectiveCard
                                                    objective={obj}
                                                    overlay={
                                                        <>
                                                            {/* Selection border */}
                                                            <div className={`absolute inset-0 z-20 border-2 pointer-events-none transition-colors ${
                                                                isSelected
                                                                    ? 'border-emerald-500'
                                                                    : canSelect
                                                                        ? 'border-transparent hover:border-secondary'
                                                                        : 'border-transparent'
                                                            }`} />
                                                            {/* Dim unselectable cards */}
                                                            {!canSelect && !isSelected && (
                                                                <div className="absolute inset-0 z-20 bg-black/50 pointer-events-none" />
                                                            )}
                                                            {/* Checkmark */}
                                                            {isSelected && (
                                                                <div className="absolute top-2 right-2 z-30 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                                                                    <Check className="w-4 h-4 text-white" />
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

                            {/* Discarded card info */}
                            {isReady && drawnObjectives.length > keepCount && (
                                <div className="text-[9px] font-mono-tech text-muted-foreground">
                                    {drawnObjectives.filter((o) => !selectedSet.has(o.id)).map((o) => o.name).join(', ')} will be discarded
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
