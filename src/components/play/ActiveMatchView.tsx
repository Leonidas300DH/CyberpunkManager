'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Weapon, HackingProgram, TokenState, ProgramQuality } from '@/types';
import { Swords, Skull, Zap, Heart, RotateCw, Cross, Minus, Plus, GripVertical, List, Square, Eye, EyeOff, ChevronDown, Rows3, Columns3 } from 'lucide-react';
import { useRef } from 'react';
import { useCardGrid } from '@/hooks/useCardGrid';
import { CharacterCard } from '@/components/characters/CharacterCard';
import { WeaponTile } from '@/components/shared/WeaponTile';
import { ProgramCard } from '@/components/programs/ProgramCard';
import {
    DndContext,
    DragOverlay,
    useDraggable,
    useDroppable,
    PointerSensor,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    useSortable,
    horizontalListSortingStrategy,
    verticalListSortingStrategy,
    arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ── Token Shape (interactive, rendered on card) ──

function TokenShape({
    color,
    spent,
    size = 31,
    selected = false,
    onClick,
}: {
    color: 'green' | 'yellow' | 'red';
    spent: boolean;
    size?: number;
    selected?: boolean;
    onClick?: (e: React.MouseEvent) => void;
}) {
    const fills: Record<string, { active: string; dim: string; stroke: string }> = {
        green:  { active: '#22c55e', dim: '#0f3d1e', stroke: '#166534' },
        yellow: { active: '#eab308', dim: '#3d3003', stroke: '#854d0e' },
        red:    { active: '#dc2626', dim: '#3d0a0a', stroke: '#991b1b' },
    };
    const { active, dim, stroke } = fills[color];
    const fill = spent ? dim : active;
    const strokeColor = spent ? stroke : 'black';
    const glow = !spent ? `drop-shadow(0 0 3px ${active}80)` : 'none';
    const selGlow = selected ? `drop-shadow(0 0 6px white)` : glow;

    if (color === 'green') {
        const cx = size / 2, cy = size / 2, r = size * 0.42;
        const pts = Array.from({ length: 5 }, (_, i) => {
            const angle = (2 * Math.PI / 5) * i + Math.PI / 2;
            return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
        }).join(' ');
        return (
            <button className="transition-transform" style={{ transform: selected ? 'scale(1.2)' : undefined }} onClick={onClick}>
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ filter: selGlow }}>
                    <polygon points={pts} fill={fill} stroke={strokeColor} strokeWidth="1.2" />
                </svg>
            </button>
        );
    }

    if (color === 'yellow') {
        const s = size;
        const pts = `${s * 0.1},${s * 0.15} ${s * 0.9},${s * 0.15} ${s * 0.5},${s * 0.88}`;
        return (
            <button className="transition-transform" style={{ transform: selected ? 'scale(1.2)' : undefined }} onClick={onClick}>
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ filter: selGlow }}>
                    <polygon points={pts} fill={fill} stroke={strokeColor} strokeWidth="1.2" />
                </svg>
            </button>
        );
    }

    // Red: square
    const inset = size * 0.12;
    return (
        <button className="transition-transform" style={{ transform: selected ? 'scale(1.2)' : undefined }} onClick={onClick}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ filter: selGlow }}>
                <rect x={inset} y={inset} width={size - inset * 2} height={size - inset * 2}
                    fill={fill} stroke={strokeColor} strokeWidth="1.2" rx="2" />
            </svg>
        </button>
    );
}

// ── Tiny Action Button ──

function ActionBtn({
    onClick,
    title,
    borderColor,
    children,
}: {
    onClick: (e: React.MouseEvent) => void;
    title: string;
    borderColor: string;
    children: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            title={title}
            className={`w-[22px] h-[22px] bg-black/90 border flex items-center justify-center transition-colors hover:brightness-150 ${borderColor}`}
        >
            {children}
        </button>
    );
}

// ── Draggable wrapper for equipped items ──

function DraggableEquip({ id, children }: { id: string; children: React.ReactNode }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });
    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={`touch-none ${isDragging ? 'opacity-30' : ''}`}
        >
            {children}
        </div>
    );
}

// ── Sortable + Droppable card wrapper ──

function SortableCard({ id, isOver, isDraggingCharacter, children }: { id: string; isOver: boolean; isDraggingCharacter: boolean; children: React.ReactNode }) {
    const {
        attributes,
        listeners,
        setNodeRef: setSortableRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: `squad-${id}` });
    const { setNodeRef: setDropRef } = useDroppable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={(node) => { setSortableRef(node); setDropRef(node); }}
            style={style}
            className={`relative transition-shadow touch-none cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-30' : ''} ${isOver && !isDraggingCharacter ? 'ring-2 ring-secondary shadow-[0_0_20px_rgba(0,240,255,0.4)]' : ''}`}
            {...attributes}
            {...listeners}
        >
            {children}
            {isOver && !isDraggingCharacter && (
                <div className="absolute inset-0 bg-secondary/10 pointer-events-none z-20" />
            )}
        </div>
    );
}

// ── Program quality styles (shared with Database) ──

const QUALITY_STYLES: Record<ProgramQuality, { bg: string; text: string; border: string }> = {
    Green:  { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500' },
    Yellow: { bg: 'bg-yellow-500',  text: 'text-yellow-400',  border: 'border-yellow-500' },
    Red:    { bg: 'bg-red-600',     text: 'text-red-400',     border: 'border-red-600' },
};

// ── Faction color map (shared with Database) ──

const FACTION_COLOR_MAP: Record<string, string> = {
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
    'all': 'border-gray-500',
};

// ── Compact program tile (matches Database list view exactly) ──

function ProgramTileCompact({ program, factionName, onClick }: { program: HackingProgram; factionName: string; onClick?: () => void }) {
    const qs = QUALITY_STYLES[program.quality];
    const fColor = FACTION_COLOR_MAP[program.factionId] ?? 'border-gray-500';
    return (
        <button
            onClick={onClick}
            className={`group relative w-full text-left bg-surface-dark border border-border hover:${qs.border} transition-all duration-200 overflow-hidden`}
        >
            {program.imageUrl && (
                <img src={program.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    style={{ opacity: 0.5, WebkitMaskImage: 'linear-gradient(to top left, black 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.3) 60%, transparent 100%)', maskImage: 'linear-gradient(to top left, black 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.3) 60%, transparent 100%)' }} />
            )}
            <div className={`relative z-10 h-1 w-full ${fColor.replace('border-', 'bg-')}`} />
            <div className="relative z-10 flex">
                <div className={`w-8 shrink-0 ${qs.bg} flex flex-col items-center justify-center py-1 relative`}>
                    <div className="font-display font-black text-sm text-black leading-none">{program.costEB}</div>
                    <div className="font-mono-tech text-[7px] text-black/70 font-bold">EB</div>
                </div>
                <div className="flex-1 px-3 py-2 flex flex-col min-h-[100px]">
                    <h3 className={`font-display font-bold text-base uppercase leading-tight ${qs.text} group-hover:text-white transition-colors`}>{program.name}</h3>
                    <span className="text-[10px] font-mono-tech text-muted-foreground uppercase tracking-wider">{factionName}</span>
                </div>
            </div>
        </button>
    );
}

// ── Parse drag ID ──

function parseDragId(id: string): { itemId: string; sourceRecruitId: string } {
    // Format: "equipped:{recruitId}:{equipId}"
    const parts = id.split(':');
    return { sourceRecruitId: parts[1], itemId: parts.slice(2).join(':') };
}

// ── Main Component ──

export function ActiveMatchView() {
    const router = useRouter();
    const { catalog, campaigns, activeMatchTeam, setActiveMatchTeam, displaySettings, playViewSettings, setPlayViewSettings } = useStore();
    const { gridClass, cardStyle } = useCardGrid();
    const cardColumns = displaySettings?.cardColumns ?? 4;
    const surveillanceOn = displaySettings?.surveillanceFilter ?? true;
    // Column width matching CSS grid (gap-4 = 16px) — used for vertical layout
    const cardColW = `calc((100% - ${(cardColumns - 1) * 16}px) / ${cardColumns})`;

    // Persisted play state — read from store, write back on change
    const tokenStates = activeMatchTeam?.tokenStates ?? {};
    const deadModelIds = activeMatchTeam?.deadModelIds ?? [];
    const deadModels = useMemo(() => new Set(deadModelIds), [deadModelIds]);
    const luck = activeMatchTeam?.luck ?? 0;

    const updatePlayState = useCallback((patch: Partial<Pick<NonNullable<typeof activeMatchTeam>, 'tokenStates' | 'deadModelIds' | 'luck'>>) => {
        if (!activeMatchTeam) return;
        setActiveMatchTeam({ ...activeMatchTeam, ...patch });
    }, [activeMatchTeam, setActiveMatchTeam]);

    const setTokenStates = useCallback((updater: (prev: Record<string, TokenState[]>) => Record<string, TokenState[]>) => {
        updatePlayState({ tokenStates: updater(tokenStates) });
    }, [tokenStates, updatePlayState]);

    const setLuck = useCallback((updater: (prev: number) => number) => {
        updatePlayState({ luck: updater(luck) });
    }, [luck, updatePlayState]);

    // UI-only state (not persisted)
    const [selectedToken, setSelectedToken] = useState<{ recruitId: string; index: number } | null>(null);
    const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
    const [activeDragId, setActiveDragId] = useState<string | null>(null);
    const [overId, setOverId] = useState<string | null>(null);
    const { characterView, programView, hideKIA } = playViewSettings;
    const setCharacterView = (v: 'horizontal' | 'vertical') => setPlayViewSettings({ characterView: v });
    const setProgramView = (v: 'card' | 'list') => setPlayViewSettings({ programView: v });
    const setHideKIA = (v: boolean | ((prev: boolean) => boolean)) => {
        const next = typeof v === 'function' ? v(hideKIA) : v;
        setPlayViewSettings({ hideKIA: next });
    };
    const [viewsOpen, setViewsOpen] = useState(false);
    const viewsRef = useRef<HTMLDivElement>(null);
    const [cardHeights, setCardHeights] = useState<Record<string, number>>({});
    const [cardWidths, setCardWidths] = useState<Record<string, number>>({});

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    // Close Views dropdown on outside click
    useEffect(() => {
        if (!viewsOpen) return;
        const handler = (e: MouseEvent) => {
            if (viewsRef.current && !viewsRef.current.contains(e.target as Node)) setViewsOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [viewsOpen]);

    const campaign = useMemo(() => {
        if (!activeMatchTeam) return null;
        return campaigns.find(c => c.id === activeMatchTeam.campaignId) ?? null;
    }, [activeMatchTeam, campaigns]);

    const matchRoster = useMemo(() => {
        if (!activeMatchTeam || !campaign) return [];
        // Preserve order from selectedRecruitIds
        return activeMatchTeam.selectedRecruitIds
            .map(id => campaign.hqRoster.find(r => r.id === id))
            .filter(Boolean) as typeof campaign.hqRoster;
    }, [activeMatchTeam, campaign]);

    const getProfile = useCallback(
        (profileId: string) => catalog.profiles.find(p => p.id === profileId),
        [catalog.profiles],
    );
    const getLineage = useCallback(
        (lineageId: string) => catalog.lineages.find(l => l.id === lineageId),
        [catalog.lineages],
    );
    const getFactionName = useCallback(
        (factionId: string) => catalog.factions.find(f => f.id === factionId)?.name ?? '',
        [catalog.factions],
    );

    // Initialize token states once (only if not already persisted)
    useEffect(() => {
        if (matchRoster.length > 0 && Object.keys(tokenStates).length === 0) {
            const states: Record<string, TokenState[]> = {};
            matchRoster.forEach(recruit => {
                const profile = getProfile(recruit.currentProfileId);
                if (!profile) return;
                const tokens: TokenState[] = [];
                for (let i = 0; i < profile.actionTokens.green; i++)
                    tokens.push({ baseColor: 'green', wounded: false, spent: false });
                for (let i = 0; i < profile.actionTokens.yellow; i++)
                    tokens.push({ baseColor: 'yellow', wounded: false, spent: false });
                for (let i = 0; i < profile.actionTokens.red; i++)
                    tokens.push({ baseColor: 'red', wounded: false, spent: false });
                states[recruit.id] = tokens;
            });
            setTokenStates(() => states);
        }
    }, [matchRoster, getProfile, tokenStates, setTokenStates]);

    // ── Token Actions ──

    const updateToken = (recruitId: string, index: number, update: Partial<TokenState>) => {
        setTokenStates(prev => {
            const tokens = [...(prev[recruitId] ?? [])];
            tokens[index] = { ...tokens[index], ...update };
            return { ...prev, [recruitId]: tokens };
        });
        setSelectedToken(null);
    };

    const spendToken = (recruitId: string, idx: number) => updateToken(recruitId, idx, { spent: true });
    const reactivateToken = (recruitId: string, idx: number) => updateToken(recruitId, idx, { spent: false });
    const woundToken = (recruitId: string, idx: number) => updateToken(recruitId, idx, { wounded: true });
    const healToken = (recruitId: string, idx: number) => updateToken(recruitId, idx, { wounded: false });

    const inspireTeam = () => {
        setTokenStates(prev => {
            const next: Record<string, TokenState[]> = {};
            for (const [id, tokens] of Object.entries(prev)) {
                next[id] = tokens.map(t => ({ ...t, spent: false }));
            }
            return next;
        });
        setSelectedToken(null);
    };

    const toggleKill = (id: string) => {
        if (deadModels.has(id)) {
            updatePlayState({ deadModelIds: deadModelIds.filter(d => d !== id) });
        } else {
            updatePlayState({ deadModelIds: [...deadModelIds, id] });
        }
    };

    const toggleFlip = (key: string) => {
        setFlippedCards(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key); else next.add(key);
            return next;
        });
    };

    // ── DnD Handlers ──

    const handleDragStart = (event: DragStartEvent) => {
        setActiveDragId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragId(null);
        setOverId(null);

        if (!over || !activeMatchTeam) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // ── Character reorder ──
        if (activeId.startsWith('squad-')) {
            const fromId = activeId.replace('squad-', '');
            const toId = overId.replace('squad-', '');
            if (fromId === toId) return;

            const ids = [...activeMatchTeam.selectedRecruitIds];
            const oldIndex = ids.indexOf(fromId);
            const newIndex = ids.indexOf(toId);
            if (oldIndex === -1 || newIndex === -1) return;

            const reordered = arrayMove(ids, oldIndex, newIndex);
            setActiveMatchTeam({ ...activeMatchTeam, selectedRecruitIds: reordered });
            return;
        }

        // ── Equipment transfer ──
        const toRecruitId = overId.replace('squad-', ''); // handle both droppable and sortable ids
        const actualToId = activeMatchTeam.selectedRecruitIds.includes(toRecruitId) ? toRecruitId : overId;
        const { sourceRecruitId, itemId } = parseDragId(activeId);

        // Only transfer if dropping on a different character
        if (sourceRecruitId === actualToId) return;
        // Only drop on squad members
        if (!activeMatchTeam.selectedRecruitIds.includes(actualToId)) return;

        const map = { ...activeMatchTeam.equipmentMap };
        // Remove from source
        const fromList = [...(map[sourceRecruitId] ?? [])];
        const idx = fromList.indexOf(itemId);
        if (idx >= 0) fromList.splice(idx, 1);
        if (fromList.length === 0) delete map[sourceRecruitId]; else map[sourceRecruitId] = fromList;
        // Add to target
        map[actualToId] = [...(map[actualToId] ?? []), itemId];
        setActiveMatchTeam({ ...activeMatchTeam, equipmentMap: map });
    };

    const isDraggingCharacter = !!activeDragId?.startsWith('squad-');

    const renderDragOverlay = () => {
        if (!activeDragId || !activeMatchTeam) return null;

        // Character drag overlay
        if (activeDragId.startsWith('squad-')) {
            const recruitId = activeDragId.replace('squad-', '');
            const recruit = matchRoster.find(r => r.id === recruitId);
            if (!recruit) return null;
            const profile = getProfile(recruit.currentProfileId);
            const lineage = profile ? getLineage(profile.lineageId) : null;
            if (!profile || !lineage) return null;
            return (
                <div className="opacity-80 pointer-events-none" style={{ width: `${100 / cardColumns}vw`, maxWidth: '250px' }}>
                    <CharacterCard lineage={lineage} profile={profile} hideTokens surveillance={surveillanceOn} />
                </div>
            );
        }

        // Equipment drag overlay
        const { itemId } = parseDragId(activeDragId);
        if (itemId.startsWith('weapon-')) {
            const weapon = catalog.weapons.find(w => w.id === itemId.replace('weapon-', ''));
            if (weapon) return <div className="w-72 opacity-90 pointer-events-none"><WeaponTile weapon={weapon} /></div>;
        }
        if (itemId.startsWith('program-')) {
            const program = catalog.programs.find(p => p.id === itemId.replace('program-', ''));
            if (program) return <div className="w-40 opacity-90 pointer-events-none"><ProgramCard program={program} side="front" /></div>;
        }
        return null;
    };

    // ── Status Helpers ──

    const getDisplayColor = (t: TokenState): 'green' | 'yellow' | 'red' => {
        if (t.wounded || t.baseColor === 'red') return 'red';
        return t.baseColor;
    };

    const isDone = (tokens: TokenState[]) => tokens.length > 0 && tokens.every(t => t.spent);
    const isRedLined = (tokens: TokenState[]) =>
        tokens.length > 0 && tokens.every(t => t.wounded || t.baseColor === 'red');

    const nonGonkRoster = matchRoster.filter(r => {
        const p = getProfile(r.currentProfileId);
        const l = p ? getLineage(p.lineageId) : null;
        return l?.type !== 'Gonk';
    });
    const doneCount = nonGonkRoster.filter(r => isDone(tokenStates[r.id] ?? [])).length;

    // ── Empty state ──

    if (!activeMatchTeam || !campaign) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                <div className="h-20 w-20 clip-corner-tr bg-surface-dark border border-border flex items-center justify-center">
                    <Swords className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="font-display text-3xl text-muted-foreground uppercase tracking-widest">No Active Match</h2>
                <p className="font-mono-tech text-xs text-muted-foreground uppercase tracking-wider">
                    Go to Team Builder to deploy your squad
                </p>
                <button
                    onClick={() => router.push('/match')}
                    className="bg-primary text-black font-display font-bold text-sm px-6 py-3 clip-corner-br uppercase tracking-widest hover:bg-white transition-colors"
                >
                    Build Team
                </button>
            </div>
        );
    }

    const handleEndMatch = () => {
        if (confirm("End the match? Progress will be lost.")) {
            setActiveMatchTeam(null);
            router.push('/hq');
        }
    };

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragOver={(event) => setOverId(event.over?.id as string ?? null)}
            onDragEnd={handleDragEnd}
        >
        <div className="pb-28" onClick={() => setSelectedToken(null)}>
            {/* === STICKY HEADER === */}
            <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-border shadow-[0_4px_20px_rgba(0,0,0,0.8)] -mx-4 px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Swords className="w-5 h-5 text-primary" />
                        <div>
                            <h2 className="font-display text-lg font-bold text-white uppercase tracking-wider leading-none">
                                Active Match
                            </h2>
                            <span className="text-[9px] font-mono-tech text-secondary uppercase tracking-widest">
                                {campaign.name} // {doneCount}/{nonGonkRoster.length} done
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Luck counter */}
                        <div className="flex items-center justify-center gap-1.5 h-9 px-4 border border-purple-500 bg-black text-purple-400 font-display font-bold text-xs uppercase tracking-wider">
                            <span>Luck</span>
                            <button
                                onClick={(e) => { e.stopPropagation(); setLuck(l => Math.max(0, l - 1)); }}
                                className="w-5 h-5 flex items-center justify-center hover:text-white transition-colors"
                            >
                                <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-mono-tech text-sm font-bold w-4 text-center">{luck}</span>
                            <button
                                onClick={(e) => { e.stopPropagation(); setLuck(l => l + 1); }}
                                className="w-5 h-5 flex items-center justify-center hover:text-white transition-colors"
                            >
                                <Plus className="w-3 h-3" />
                            </button>
                        </div>

                        <button
                            onClick={(e) => { e.stopPropagation(); inspireTeam(); }}
                            className="flex items-center justify-center gap-1.5 h-9 px-4 border border-secondary bg-secondary/20 text-secondary font-display font-bold text-xs uppercase tracking-wider hover:bg-secondary hover:text-black transition-colors"
                            title="Inspire — reactivate all tokens"
                        >
                            <Zap className="w-4 h-4" />
                            Inspire
                        </button>

                        {/* Views dropdown */}
                        <div ref={viewsRef} className="relative">
                            <button
                                onClick={(e) => { e.stopPropagation(); setViewsOpen(v => !v); }}
                                className="flex items-center justify-center gap-1.5 h-9 px-4 border border-primary bg-black text-primary font-display font-bold text-xs uppercase tracking-wider hover:text-white transition-colors"
                            >
                                <Eye className="w-4 h-4" />
                                Views
                                <ChevronDown className={`w-3 h-3 transition-transform ${viewsOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {viewsOpen && (
                                <div className="absolute right-0 top-full mt-1 w-56 bg-black border border-primary/40 shadow-[0_4px_20px_rgba(252,238,10,0.15)] z-50" onClick={(e) => e.stopPropagation()}>
                                    {/* Characters View */}
                                    <div className="px-3 py-2 border-b border-border">
                                        <div className="text-[10px] font-mono-tech text-primary uppercase tracking-widest mb-1.5">Characters View</div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => setCharacterView('horizontal')}
                                                className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 text-[10px] font-mono-tech uppercase tracking-wider transition-all ${characterView === 'horizontal' ? 'bg-primary text-black font-bold' : 'bg-black border border-border text-muted-foreground hover:text-white'}`}
                                            >
                                                <Columns3 className="w-3 h-3" /> Horizontal
                                            </button>
                                            <button
                                                onClick={() => setCharacterView('vertical')}
                                                className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 text-[10px] font-mono-tech uppercase tracking-wider transition-all ${characterView === 'vertical' ? 'bg-primary text-black font-bold' : 'bg-black border border-border text-muted-foreground hover:text-white'}`}
                                            >
                                                <Rows3 className="w-3 h-3" /> Vertical
                                            </button>
                                        </div>
                                    </div>
                                    {/* Programs View */}
                                    <div className="px-3 py-2 border-b border-border">
                                        <div className="text-[10px] font-mono-tech text-primary uppercase tracking-widest mb-1.5">Programs View</div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => setProgramView('card')}
                                                className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 text-[10px] font-mono-tech uppercase tracking-wider transition-all ${programView === 'card' ? 'bg-primary text-black font-bold' : 'bg-black border border-border text-muted-foreground hover:text-white'}`}
                                            >
                                                <Square className="w-3 h-3" /> Card
                                            </button>
                                            <button
                                                onClick={() => setProgramView('list')}
                                                className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 text-[10px] font-mono-tech uppercase tracking-wider transition-all ${programView === 'list' ? 'bg-primary text-black font-bold' : 'bg-black border border-border text-muted-foreground hover:text-white'}`}
                                            >
                                                <List className="w-3 h-3" /> List
                                            </button>
                                        </div>
                                    </div>
                                    {/* Hide KIA */}
                                    <div className="px-3 py-2">
                                        <button
                                            onClick={() => setHideKIA(h => !h)}
                                            className="flex items-center gap-2 w-full text-left text-[10px] font-mono-tech uppercase tracking-wider text-muted-foreground hover:text-white transition-colors"
                                        >
                                            {hideKIA ? <EyeOff className="w-3.5 h-3.5 text-accent" /> : <Eye className="w-3.5 h-3.5" />}
                                            {hideKIA ? 'Show KIA' : 'Hide KIA'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleEndMatch}
                            className="flex items-center justify-center h-9 px-4 bg-accent text-white font-display font-bold text-xs uppercase tracking-widest clip-corner-br hover:bg-red-700 transition-colors"
                        >
                            End Match
                        </button>
                    </div>
                </div>
            </div>

            {/* === UNIT CARDS === */}
            <SortableContext items={matchRoster.map(r => `squad-${r.id}`)} strategy={characterView === 'vertical' ? verticalListSortingStrategy : horizontalListSortingStrategy}>
            <div className={characterView === 'vertical' ? 'mt-4 flex flex-col gap-4' : `mt-4 ${gridClass}`}>
                {matchRoster.map(recruit => {
                    const profile = getProfile(recruit.currentProfileId);
                    const lineage = profile ? getLineage(profile.lineageId) : null;
                    if (!profile || !lineage) return null;

                    const isGonk = lineage.type === 'Gonk';
                    const dead = deadModels.has(recruit.id);
                    const tokens = tokenStates[recruit.id] ?? [];
                    const done = !isGonk && isDone(tokens);
                    const redLined = !isGonk && isRedLined(tokens);

                    // Hide KIA
                    if (hideKIA && dead) return null;

                    // Resolve equipment
                    const equippedIds = activeMatchTeam.equipmentMap?.[recruit.id] ?? [];
                    const equippedItems = equippedIds.map(eqId => {
                        if (eqId.startsWith('weapon-')) {
                            const weapon = catalog.weapons.find(w => w.id === eqId.replace('weapon-', ''));
                            return weapon ? { equipId: eqId, type: 'weapon' as const, weapon, program: null } : null;
                        }
                        if (eqId.startsWith('program-')) {
                            const program = catalog.programs.find(p => p.id === eqId.replace('program-', ''));
                            return program ? { equipId: eqId, type: 'program' as const, weapon: null, program } : null;
                        }
                        return null;
                    }).filter(Boolean) as Array<
                        | { equipId: string; type: 'weapon'; weapon: Weapon; program: null }
                        | { equipId: string; type: 'program'; weapon: null; program: HackingProgram }
                    >;

                    // ── Shared sub-components ──

                    const characterCardBlock = (
                        <div className="relative">
                            <div className={`transition-all ${
                                dead
                                    ? 'border-2 border-accent/60 grayscale'
                                    : redLined
                                        ? 'border-2 border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5),0_0_40px_rgba(220,38,38,0.2)]'
                                        : done
                                            ? 'border-2 border-border opacity-50 saturate-0'
                                            : 'border-2 border-transparent'
                            }`}>
                                <CharacterCard lineage={lineage} profile={profile} hideTokens={!isGonk} surveillance={surveillanceOn} />
                            </div>

                            {/* KIA overlay */}
                            {dead && (
                                <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                                    <div className="border-[3px] border-red-600 px-4 py-2 rounded-sm"
                                        style={{ transform: 'rotate(-30deg)', boxShadow: '0 0 12px rgba(220,38,38,0.5), inset 0 0 12px rgba(220,38,38,0.15)' }}>
                                        <span className="font-display text-base font-black uppercase tracking-[0.2em] leading-none whitespace-nowrap"
                                            style={{ color: '#dc2626', textShadow: '0 0 6px rgba(220,38,38,0.6)' }}>
                                            Killed<br/>In Action
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Done overlay */}
                            {done && !dead && !redLined && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-30">
                                    <span className="font-display text-2xl font-bold text-muted-foreground uppercase tracking-[0.3em] rotate-[-15deg] drop-shadow-lg">Done</span>
                                </div>
                            )}

                            {/* Red Lined overlay */}
                            {redLined && !dead && (
                                <div className="absolute inset-x-0 top-0 z-30 pointer-events-none">
                                    <div className="bg-gradient-to-b from-red-950/80 to-transparent px-3 pt-4 pb-8 flex items-start justify-center">
                                        <span className="font-display text-lg font-black uppercase tracking-[0.25em]"
                                            style={{ color: '#ff2020', textShadow: '0 0 8px rgba(255,0,0,0.8), 0 0 20px rgba(255,0,0,0.4), 0 0 40px rgba(255,0,0,0.2)' }}>
                                            Red Lined
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Interactive Token Strip */}
                            {!isGonk && !dead && (
                                <div className="absolute top-3 left-[8.5%] -translate-x-1/2 z-30 flex flex-col items-center">
                                    {tokens.map((token, idx) => {
                                        const displayColor = getDisplayColor(token);
                                        const isSel = selectedToken?.recruitId === recruit.id && selectedToken?.index === idx;
                                        const canWound = token.baseColor !== 'red' && !token.wounded;
                                        return (
                                            <React.Fragment key={idx}>
                                                {idx > 0 && <div className="-my-[3px] w-px h-2.5 bg-black/70 z-10" />}
                                                <div className="relative flex items-center">
                                                    <TokenShape color={displayColor} spent={token.spent} selected={isSel} size={31}
                                                        onClick={(e) => { e.stopPropagation(); isSel ? setSelectedToken(null) : setSelectedToken({ recruitId: recruit.id, index: idx }); }} />
                                                    {isSel && (
                                                        <div className="absolute left-full ml-1 flex gap-[3px] z-40">
                                                            {!token.spent ? (
                                                                <ActionBtn onClick={(e) => { e.stopPropagation(); spendToken(recruit.id, idx); }} title="Spend" borderColor="border-white/40">
                                                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6.5L5 9.5L10 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" /></svg>
                                                                </ActionBtn>
                                                            ) : (
                                                                <ActionBtn onClick={(e) => { e.stopPropagation(); reactivateToken(recruit.id, idx); }} title="Reactivate" borderColor="border-secondary/50">
                                                                    <RotateCw className="w-3 h-3 text-secondary" />
                                                                </ActionBtn>
                                                            )}
                                                            {canWound && (
                                                                <ActionBtn onClick={(e) => { e.stopPropagation(); woundToken(recruit.id, idx); }} title="Wound" borderColor="border-accent/50">
                                                                    <Cross className="w-3 h-3 text-accent" />
                                                                </ActionBtn>
                                                            )}
                                                            {token.wounded && (
                                                                <ActionBtn onClick={(e) => { e.stopPropagation(); healToken(recruit.id, idx); }} title="Heal" borderColor="border-green-500/50">
                                                                    <Heart className="w-3 h-3 text-green-500" />
                                                                </ActionBtn>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </React.Fragment>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );

                    const controlsBlock = (
                        <>
                            {/* Gonk Controls */}
                            {isGonk && (
                                <div className="flex gap-2 mt-1">
                                    {!dead ? (
                                        <>
                                            <button onClick={() => inspireTeam()} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-secondary/20 border border-secondary text-secondary font-display font-bold text-xs uppercase tracking-wider hover:bg-secondary hover:text-black transition-all clip-corner-tr">
                                                <Zap className="w-3.5 h-3.5" /> Inspire
                                            </button>
                                            <button onClick={() => toggleKill(recruit.id)} className="px-3 py-2 bg-accent/20 border border-accent text-accent font-display font-bold text-xs uppercase tracking-wider hover:bg-accent hover:text-white transition-all clip-corner-br" title="Kill Gonk">
                                                <Skull className="w-3.5 h-3.5" />
                                            </button>
                                        </>
                                    ) : (
                                        <button onClick={() => toggleKill(recruit.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-surface-dark border border-border text-muted-foreground font-display font-bold text-xs uppercase tracking-wider hover:text-white hover:border-white transition-all">
                                            <Heart className="w-3.5 h-3.5" /> Revive
                                        </button>
                                    )}
                                </div>
                            )}
                            {/* Kill / Revive (non-Gonk) */}
                            {!isGonk && (redLined || dead) && (
                                <div className="mt-1">
                                    {!dead ? (
                                        <button onClick={() => toggleKill(recruit.id)} className="w-full flex items-center justify-center gap-1.5 py-2 bg-accent/20 border border-accent text-accent font-display font-bold text-xs uppercase tracking-wider hover:bg-accent hover:text-white transition-all clip-corner-br">
                                            <Skull className="w-3.5 h-3.5" /> Kill
                                        </button>
                                    ) : (
                                        <button onClick={() => toggleKill(recruit.id)} className="w-full flex items-center justify-center gap-1.5 py-2 bg-surface-dark border border-border text-muted-foreground font-display font-bold text-xs uppercase tracking-wider hover:text-white hover:border-white transition-all">
                                            <Heart className="w-3.5 h-3.5" /> Revive
                                        </button>
                                    )}
                                </div>
                            )}
                        </>
                    );

                    const equippedBlock = equippedItems.length > 0 && (
                        <div className={characterView === 'vertical' ? 'flex flex-col gap-2' : 'mt-2 space-y-2'}>
                            {equippedItems.map(item => {
                                const dragId = `equipped:${recruit.id}:${item.equipId}`;
                                return (
                                    <div key={item.equipId} className="relative group/equip">
                                        <DraggableEquip id={dragId}>
                                            {item.type === 'weapon' ? (
                                                <WeaponTile weapon={item.weapon} overlay={
                                                    <div className="absolute top-1 left-1 z-20"><GripVertical className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover/equip:opacity-60" /></div>
                                                } />
                                            ) : programView === 'list' ? (
                                                <ProgramTileCompact program={item.program} factionName={getFactionName(item.program.factionId)} onClick={() => toggleFlip(`play-${recruit.id}-${item.equipId}`)} />
                                            ) : (
                                                <div className="relative">
                                                    <div className="card-flip-container w-full cursor-pointer" onClick={() => toggleFlip(`play-${recruit.id}-${item.equipId}`)}>
                                                        <div className={`card-flip-inner ${flippedCards.has(`play-${recruit.id}-${item.equipId}`) ? 'flipped' : ''}`}>
                                                            <div className="card-flip-front"><ProgramCard program={item.program} side="front" /></div>
                                                            <div className="card-flip-back"><ProgramCard program={item.program} side="back" /></div>
                                                        </div>
                                                    </div>
                                                    <div className="absolute top-1 left-1 z-20"><GripVertical className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover/equip:opacity-60" /></div>
                                                </div>
                                            )}
                                        </DraggableEquip>
                                    </div>
                                );
                            })}
                        </div>
                    );

                    // ── HORIZONTAL LAYOUT ──
                    if (characterView === 'horizontal') {
                        return (
                            <div key={recruit.id} style={cardStyle} className="group/unit" onClick={(e) => e.stopPropagation()}>
                                <SortableCard id={recruit.id} isOver={overId === recruit.id && !!activeDragId} isDraggingCharacter={isDraggingCharacter}>
                                    {characterCardBlock}
                                    {controlsBlock}
                                    {equippedBlock}
                                </SortableCard>
                            </div>
                        );
                    }

                    // ── VERTICAL LAYOUT ──
                    const measuredW = cardWidths[recruit.id];
                    const measuredH = cardHeights[recruit.id];

                    return (
                        <div key={recruit.id} className="group/unit" onClick={(e) => e.stopPropagation()}>
                            <SortableCard id={recruit.id} isOver={overId === recruit.id && !!activeDragId} isDraggingCharacter={isDraggingCharacter}>
                                <div className="flex gap-4 items-start">
                                    {/* Character card — measure width + height */}
                                    <div
                                        ref={(node) => {
                                            if (node) {
                                                const h = node.offsetHeight;
                                                const w = node.offsetWidth;
                                                if (h > 0 && (cardHeights[recruit.id] !== h || cardWidths[recruit.id] !== w)) {
                                                    setCardHeights(prev => prev[recruit.id] === h ? prev : { ...prev, [recruit.id]: h });
                                                    setCardWidths(prev => prev[recruit.id] === w ? prev : { ...prev, [recruit.id]: w });
                                                }
                                            }
                                        }}
                                        style={{ width: cardColW, ...cardStyle }}
                                        className="shrink-0"
                                    >
                                        {characterCardBlock}
                                        {controlsBlock}
                                    </div>

                                    {/* All equipment — stacked vertically, wraps to next column if exceeds card height */}
                                    {equippedItems.length > 0 && (
                                        <div
                                            className="flex flex-col flex-wrap gap-2 content-start"
                                            style={{ maxHeight: measuredH || undefined }}
                                        >
                                            {equippedItems.map(item => {
                                                const dragId = `equipped:${recruit.id}:${item.equipId}`;
                                                return (
                                                    <div key={item.equipId} style={measuredW ? { width: measuredW } : undefined} className="relative group/equip">
                                                        <DraggableEquip id={dragId}>
                                                            {item.type === 'weapon' ? (
                                                                <WeaponTile weapon={item.weapon} overlay={
                                                                    <div className="absolute top-1 left-1 z-20"><GripVertical className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover/equip:opacity-60" /></div>
                                                                } />
                                                            ) : programView === 'list' ? (
                                                                <ProgramTileCompact program={item.program} factionName={getFactionName(item.program.factionId)} onClick={() => toggleFlip(`play-${recruit.id}-${item.equipId}`)} />
                                                            ) : (
                                                                <div className="relative">
                                                                    <div className="card-flip-container w-full cursor-pointer" onClick={() => toggleFlip(`play-${recruit.id}-${item.equipId}`)}>
                                                                        <div className={`card-flip-inner ${flippedCards.has(`play-${recruit.id}-${item.equipId}`) ? 'flipped' : ''}`}>
                                                                            <div className="card-flip-front"><ProgramCard program={item.program} side="front" /></div>
                                                                            <div className="card-flip-back"><ProgramCard program={item.program} side="back" /></div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="absolute top-1 left-1 z-20"><GripVertical className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover/equip:opacity-60" /></div>
                                                                </div>
                                                            )}
                                                        </DraggableEquip>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </SortableCard>
                        </div>
                    );
                })}
            </div>
            </SortableContext>

            <DragOverlay dropAnimation={null}>
                {renderDragOverlay()}
            </DragOverlay>
        </div>
        </DndContext>
    );
}
