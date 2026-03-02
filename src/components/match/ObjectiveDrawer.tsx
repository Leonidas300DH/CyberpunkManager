'use client';

import { useState } from 'react';
import { Campaign, Objective } from '@/types';
import { TeamBuilderDraft } from '@/store/useStore';
import { getLeaderCard, getEligiblePool, drawObjectives } from '@/lib/objectives';
import { MathService } from '@/lib/math';
import { ChevronDown, ChevronUp, Target, Shuffle, Check } from 'lucide-react';

interface ObjectiveDrawerProps {
    campaign: Campaign;
    objectives: Objective[];
    factionId: string;
    campaignStreetCred: number;
    draft: TeamBuilderDraft;
    onDraftChange: (patch: Partial<TeamBuilderDraft>) => void;
}

function RewardBadge({ type }: { type: string }) {
    const colors: Record<string, string> = {
        ongoing: 'bg-emerald-600 text-white',
        recycle: 'bg-amber-600 text-white',
        cybergear: 'bg-purple-600 text-white',
        immediate: 'bg-blue-600 text-white',
    };
    return (
        <span className={`text-[8px] font-mono-tech uppercase tracking-wider px-1.5 py-0.5 ${colors[type] ?? 'bg-zinc-700 text-white'}`}>
            {type}
        </span>
    );
}

function ScStars({ count }: { count: number }) {
    if (count <= 0) return null;
    return (
        <span className="text-primary text-[10px]">
            {'★'.repeat(count)}
        </span>
    );
}

export function ObjectiveDrawer({ campaign, objectives, factionId, campaignStreetCred, draft, onDraftChange }: ObjectiveDrawerProps) {
    const [open, setOpen] = useState(true);

    const enabled = draft.objectivesEnabled ?? false;
    const carryingLeader = draft.carryingLeaderPenalty ?? false;
    const drawnIds = draft.drawnObjectiveIds ?? [];
    const selectedIds = draft.selectedObjectiveIds ?? [];

    const leaderCard = getLeaderCard(objectives, factionId);
    const hasLeaderCard = !!leaderCard;

    // How many to draw and keep
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
            if (selectedIds.length >= keepCount) return; // already at max
            onDraftChange({ selectedObjectiveIds: [...selectedIds, id] });
        }
    };

    const totalObjectives = carryingLeader ? keepCount + 1 : keepCount; // +1 for leader card
    const readyCount = carryingLeader ? selectedIds.length + 1 : selectedIds.length;
    const isReady = selectedIds.length === keepCount;

    // Faction objectives count
    const factionPool = objectives.filter((o) => o.factionId === factionId);
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

                            {/* Drawn cards */}
                            {drawnObjectives.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {/* Leader card (auto-included, not selectable) */}
                                    {carryingLeader && leaderCard && (
                                        <div className="border-2 border-accent bg-accent/10 p-2 min-w-[120px] max-w-[160px]">
                                            <div className="text-[10px] font-display font-bold text-accent uppercase leading-tight truncate">
                                                {leaderCard.name}
                                            </div>
                                            <div className="flex items-center gap-1 mt-1">
                                                <RewardBadge type={leaderCard.rewardType} />
                                                <ScStars count={leaderCard.grantsStreetCred} />
                                            </div>
                                            <div className="text-[8px] font-mono-tech text-accent/70 mt-1 uppercase">
                                                Auto-included
                                            </div>
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
                                                disabled={!canSelect && !isSelected}
                                                className={`text-left border-2 p-2 min-w-[120px] max-w-[160px] transition-all ${
                                                    isSelected
                                                        ? 'border-emerald-500 bg-emerald-500/10'
                                                        : canSelect
                                                            ? 'border-border hover:border-secondary bg-black/50'
                                                            : 'border-border/30 bg-black/20 opacity-40'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between gap-1">
                                                    <div className="text-[10px] font-display font-bold text-white uppercase leading-tight truncate flex-1">
                                                        {obj.name}
                                                    </div>
                                                    {isSelected && <Check className="w-3 h-3 text-emerald-400 shrink-0" />}
                                                </div>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <RewardBadge type={obj.rewardType} />
                                                    <ScStars count={obj.grantsStreetCred} />
                                                </div>
                                                {obj.grantsEB && obj.grantsEB > 0 && (
                                                    <div className="text-[8px] font-mono-tech text-primary mt-0.5">+{obj.grantsEB} EB</div>
                                                )}
                                                {obj.grantsLuck && obj.grantsLuck > 0 && (
                                                    <div className="text-[8px] font-mono-tech text-purple-400 mt-0.5">+{obj.grantsLuck} Luck</div>
                                                )}
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
