'use client';

import React from 'react';
import { useStore } from '@/store/useStore';
import { useCardGrid } from '@/hooks/useCardGrid';
import type { Objective } from '@/types';

export const FACTION_COLOR_MAP: Record<string, string> = {
    'faction-arasaka': 'border-red-600',
    'faction-bozos': 'border-purple-500',
    'faction-danger-gals': 'border-pink-400',
    'faction-edgerunners': 'border-emerald-500',
    'faction-gen-red': 'border-white',
    'faction-lawmen': 'border-blue-500',
    'faction-maelstrom': 'border-red-700',
    'faction-trauma-team': 'border-white',
    'faction-tyger-claws': 'border-cyan-400',
    'faction-zoners': 'border-orange-500',
    'faction-6th-street': 'border-amber-500',
    'faction-max-tac': 'border-indigo-400',
    'faction-militech': 'border-lime-500',
    'faction-piranhas': 'border-teal-400',
    'faction-wild-things': 'border-rose-500',
    'deck-corpo-crimes': 'border-red-500',
    'deck-public-enemies': 'border-violet-500',
    'deck-street-justice': 'border-yellow-500',
};

export const FACTION_BG_MAP: Record<string, string> = {
    'faction-arasaka': 'bg-red-600',
    'faction-bozos': 'bg-purple-500',
    'faction-danger-gals': 'bg-pink-400',
    'faction-edgerunners': 'bg-emerald-500',
    'faction-gen-red': 'bg-white',
    'faction-lawmen': 'bg-blue-500',
    'faction-maelstrom': 'bg-red-700',
    'faction-trauma-team': 'bg-white',
    'faction-tyger-claws': 'bg-cyan-400',
    'faction-zoners': 'bg-orange-500',
    'faction-6th-street': 'bg-amber-500',
    'faction-max-tac': 'bg-indigo-400',
    'faction-militech': 'bg-lime-500',
    'faction-piranhas': 'bg-teal-400',
    'faction-wild-things': 'bg-rose-500',
    'deck-corpo-crimes': 'bg-red-500',
    'deck-public-enemies': 'bg-violet-500',
    'deck-street-justice': 'bg-yellow-500',
};

export const FACTION_TEXT_MAP: Record<string, string> = {
    'faction-gen-red': 'text-black',
    'faction-trauma-team': 'text-black',
    'faction-danger-gals': 'text-black',
    'faction-tyger-claws': 'text-black',
    'faction-6th-street': 'text-black',
    'faction-militech': 'text-black',
    'faction-edgerunners': 'text-black',
    'faction-piranhas': 'text-black',
    'deck-street-justice': 'text-black',
};

export const REWARD_BADGE: Record<string, { label: string; cls: string; tooltip: string }> = {
    ongoing: { label: 'ONGOING', cls: 'bg-emerald-600 text-white', tooltip: 'This reward stays active for the rest of the game once the condition is met.' },
    recycle: { label: 'RECYCLE', cls: 'bg-amber-600 text-white', tooltip: 'After resolving, shuffle this card back into the deck. It can be drawn again.' },
    cybergear: { label: 'CYBERGEAR', cls: 'bg-cyan-600 text-white', tooltip: 'Completing this objective grants a permanent Cybergear upgrade to a model.' },
    immediate: { label: 'IMMEDIATE', cls: 'bg-red-600 text-white', tooltip: 'This reward fires instantly when the objective condition is met during the game.' },
};

const SKILL_ICON: Record<string, string> = {
    Reflexes: '/images/Skills Icons/reflexes.png',
    Ranged: '/images/Skills Icons/ranged.png',
    Melee: '/images/Skills Icons/melee.png',
    Medical: '/images/Skills Icons/medical.png',
    Tech: '/images/Skills Icons/tech.png',
    Influence: '/images/Skills Icons/influence.png',
};

const COLOR_WORDS: Record<string, string> = {
    RED: '#dc2626',
    YELLOW: '#eab308',
    GREEN: '#22c55e',
};

export function colorizeText(text: string): React.ReactNode[] {
    const parts: React.ReactNode[] = [];
    const re = /\b(RED|YELLOW|GREEN)\b/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
        if (m.index > last) parts.push(text.slice(last, m.index));
        parts.push(
            <span
                key={`c${m.index}`}
                className="font-bold"
                style={{ color: COLOR_WORDS[m[1]], WebkitTextStroke: '0.3px rgba(255,255,255,0.4)' }}
            >
                {m[1]}
            </span>,
        );
        last = re.lastIndex;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts;
}

export const isPlaceholder = (o: Objective) =>
    o.description === 'PLACEHOLDER' || o.rewardText === 'PLACEHOLDER';

interface ObjectiveCardProps {
    objective: Objective;
    isAdmin?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
    overlay?: React.ReactNode;
}

export function ObjectiveCard({ objective, isAdmin, onEdit, onDelete, overlay }: ObjectiveCardProps) {
    const { catalog } = useStore();
    const { cardStyle } = useCardGrid();

    const faction = catalog.factions.find(f => f.id === objective.factionId);
    const factionName = faction?.name ?? objective.factionId;
    const borderColor = FACTION_COLOR_MAP[objective.factionId] ?? 'border-gray-500';
    const bgColor = FACTION_BG_MAP[objective.factionId] ?? 'bg-gray-400';
    const textColor = FACTION_TEXT_MAP[objective.factionId] ?? (FACTION_BG_MAP[objective.factionId] ? 'text-white' : 'text-black');
    const badge = REWARD_BADGE[objective.rewardType];
    const placeholder = isPlaceholder(objective);

    return (
        <div
            style={cardStyle}
            className={`group relative bg-surface-dark border ${borderColor} h-[254px] overflow-hidden flex flex-col`}
        >
            {/* Admin buttons (top right overlay) */}
            {isAdmin && (onEdit || onDelete) && (
                <div className="absolute top-1 right-1 z-30 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onEdit && (
                        <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1.5 bg-black/70 border border-border rounded text-muted-foreground hover:text-secondary hover:border-secondary transition-colors">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        </button>
                    )}
                    {onDelete && (
                        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 bg-black/70 border border-border rounded text-muted-foreground hover:text-accent hover:border-accent transition-colors">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                        </button>
                    )}
                </div>
            )}

            {/* Custom overlay (selection, completion, etc.) */}
            {overlay}

            {/* Faction icon background */}
            {faction?.imageUrl && (
                <img
                    src={faction.imageUrl}
                    alt=""
                    className="absolute inset-0 w-full h-full object-contain opacity-[0.10] pointer-events-none"
                />
            )}

            {/* Faction color bar */}
            <div className={`h-1 w-full ${bgColor} shrink-0 relative z-10`} />

            {/* Header */}
            <div className="px-3 pt-2 pb-1 shrink-0 relative z-10">
                <h3 className="font-display font-bold text-sm uppercase leading-tight text-white truncate">
                    {objective.name}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[8px] font-mono-tech font-bold uppercase px-1.5 py-px rounded-sm ${bgColor} ${textColor}`}>
                        {factionName}
                    </span>
                    {objective.factionBanner && (
                        <span className="text-[8px] font-mono-tech italic text-muted-foreground">
                            {objective.factionBanner}
                        </span>
                    )}
                    {placeholder && (
                        <span className="text-[8px] font-mono-tech font-bold uppercase px-1.5 py-px rounded-sm bg-orange-600 text-white">
                            INCOMPLETE
                        </span>
                    )}
                </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-3 pb-3 min-h-0 relative z-10">
                {/* Condition */}
                <div className="mb-2">
                    <div className="text-[9px] font-mono-tech text-muted-foreground uppercase tracking-widest mb-0.5">
                        Condition
                    </div>
                    <p className={`text-xs leading-relaxed ${placeholder ? 'text-orange-400/60 italic' : 'text-gray-300'}`}>
                        {placeholder ? 'Awaiting close-up photo...' : colorizeText(objective.description)}
                    </p>
                </div>

                {/* Divider */}
                <div className="border-t border-dashed border-border my-2" />

                {/* Reward */}
                <div className="mb-2">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-[9px] font-mono-tech text-muted-foreground uppercase tracking-widest">
                            Reward
                        </span>
                        {!placeholder && (
                            <span className={`relative text-[8px] font-mono-tech font-bold uppercase px-1.5 py-px rounded-sm cursor-help group/tip ${badge.cls}`}>
                                {badge.label}
                                <span className="pointer-events-none absolute left-0 top-full mt-1 z-40 w-48 px-2 py-1.5 rounded bg-black/95 border border-border text-[10px] font-mono-tech font-normal normal-case tracking-normal text-gray-200 leading-snug opacity-0 group-hover/tip:opacity-100 transition-opacity">
                                    {badge.tooltip}
                                </span>
                            </span>
                        )}
                        {!placeholder && objective.grantsStreetCred > 0 && (
                            <span className="text-[9px] font-mono-tech font-bold text-secondary">
                                Street Cred {'★'.repeat(objective.grantsStreetCred)}
                            </span>
                        )}
                        {!placeholder && objective.grantsEB != null && objective.grantsEB > 0 && (
                            <span className="text-[9px] font-mono-tech font-bold text-cyber-green">
                                +{objective.grantsEB} EB
                            </span>
                        )}
                        {!placeholder && objective.grantsLuck != null && objective.grantsLuck > 0 && (
                            <span className="text-[9px] font-mono-tech font-bold text-cyan-400">
                                +{objective.grantsLuck} LUCK
                            </span>
                        )}
                    </div>
                    <p className={`text-xs leading-relaxed ${placeholder ? 'text-orange-400/60 italic' : 'text-gray-300'}`}>
                        {placeholder ? 'Awaiting close-up photo...' : colorizeText(objective.rewardText)}
                    </p>
                </div>

                {/* Cybergear block */}
                {!placeholder && objective.rewardType === 'cybergear' && objective.cybergearEffect && (
                    <div className="border-l-2 border-cyan-500 pl-2 py-1 bg-cyan-950/30 rounded-r-sm">
                        {objective.grantsCybergearTo && (
                            <div className="text-[9px] font-mono-tech text-cyan-400 uppercase tracking-wider mb-0.5">
                                Cybergear &rarr; {objective.grantsCybergearTo}
                            </div>
                        )}
                        <p className="text-[11px] text-cyan-200 leading-relaxed">
                            {colorizeText(objective.cybergearEffect)}
                        </p>
                    </div>
                )}

                {/* Skill bonuses + Armor + Action range */}
                {!placeholder && ((objective.skillBonuses && objective.skillBonuses.length > 0) || objective.armorBonus || objective.actionSkill) && (
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                        {objective.skillBonuses?.map((sb, i) => (
                            <div key={i} className="flex items-center gap-1">
                                {SKILL_ICON[sb.skill] && (
                                    <img src={SKILL_ICON[sb.skill]} alt={sb.skill} className="w-10 h-10 -my-[3px]" />
                                )}
                                <span className="text-sm font-mono-tech font-bold text-secondary">+{sb.value}</span>
                            </div>
                        ))}
                        {objective.armorBonus != null && objective.armorBonus > 0 && (
                            <div className="flex items-center gap-1">
                                <svg viewBox="0 0 22 22" className="w-10 h-10 text-gray-300">
                                    <path d="M11 1 L21 6 L21 12 Q21 20 11 21 Q1 20 1 12 L1 6 Z" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="1" />
                                </svg>
                                <span className="text-sm font-mono-tech font-bold text-gray-300">+{objective.armorBonus}</span>
                            </div>
                        )}
                        {objective.actionSkill && (
                            <div className="flex items-center gap-1">
                                {SKILL_ICON[objective.actionSkill] && (
                                    <img src={SKILL_ICON[objective.actionSkill]} alt={objective.actionSkill} className="w-10 h-10 -my-[3px]" />
                                )}
                                <svg viewBox="0 0 228 22" className="h-[18px] w-auto">
                                    {objective.actionRangeRed && (
                                        <polygon points="1,1 44,1 49,11 44,21 5,21" fill="#ef4444" opacity="0.8" />
                                    )}
                                    {objective.actionRangeYellow && (
                                        <polygon points="52,1 95,1 100,11 95,21 52,21 57,11" fill="#eab308" opacity="0.8" />
                                    )}
                                    {objective.actionRangeGreen && (
                                        <polygon points="103,1 145,1 150,11 145,21 103,21 108,11" fill="#22c55e" opacity="0.8" />
                                    )}
                                    {objective.actionRangeLong && (
                                        <polygon points="153,1 218,1 223,11 218,21 153,21 158,11" fill="#3b82f6" opacity="0.8" />
                                    )}
                                </svg>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
