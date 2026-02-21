'use client';

import { useState } from 'react';
import { Campaign, ModelLineage, Weapon, HackingProgram } from '@/types';
import { useStore } from '@/store/useStore';
import { MathService } from '@/lib/math';
import { parseStashEntry, parseEquipmentId, resolveVariant } from '@/lib/variants';
import { Input } from '@/components/ui/input';
import { AlertTriangle, ChevronDown, ChevronUp, Plus, Users, X, GripVertical, List, Maximize2 } from 'lucide-react';
import { useTeamBuilder } from '@/hooks/useTeamBuilder';
import { useCardGrid } from '@/hooks/useCardGrid';
import { CharacterCard } from '@/components/characters/CharacterCard';
import { WeaponTile } from '@/components/shared/WeaponTile';
import { ProgramCard } from '@/components/programs/ProgramCard';
import { ProgramTile } from '@/components/shared/ProgramTile';
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
    type DragOverEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    useSortable,
    arrayMove,
    horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TeamBuilderProps {
    campaign: Campaign;
}

type FilterType = 'all' | ModelLineage['type'];

// ── Draggable wrapper for equipment items ──
function DraggableItem({ id, children }: { id: string; children: React.ReactNode }) {
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

// ── Sortable squad card — draggable (reorder) + droppable (equipment) ──
function SortableSquadCard({
    id,
    isEquipOver,
    children,
    cardContent,
}: {
    id: string;
    isEquipOver: boolean;
    children: React.ReactNode;
    cardContent: React.ReactNode;
}) {
    const {
        attributes,
        listeners,
        setNodeRef: setSortableRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const { setNodeRef: setDropRef } = useDroppable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 50 : undefined,
    };

    return (
        <div
            ref={(node) => { setSortableRef(node); setDropRef(node); }}
            style={style}
            className={`relative transition-shadow ${isEquipOver ? 'ring-2 ring-secondary shadow-[0_0_20px_rgba(0,240,255,0.4)]' : ''}`}
        >
            {/* Character card — entire card is the drag handle */}
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing touch-none"
            >
                {cardContent}
            </div>

            {/* Equipment + other controls below (not part of drag handle) */}
            {children}

            {isEquipOver && (
                <div className="absolute inset-0 bg-secondary/10 pointer-events-none z-20 flex items-center justify-center">
                    <span className="font-mono-tech text-xs text-secondary uppercase tracking-widest bg-black/80 px-3 py-1 border border-secondary">
                        Drop to equip
                    </span>
                </div>
            )}
        </div>
    );
}

// ── Parse drag ID ──
function parseDragId(id: string): { itemId: string; sourceRecruitId: string | null; isSquadDrag: boolean } {
    if (id.startsWith('equipped:')) {
        const parts = id.split(':');
        return { sourceRecruitId: parts[1], itemId: parts.slice(2).join(':'), isSquadDrag: false };
    }
    // Strip copy index suffix (e.g., weapon-abc@universal#1 → weapon-abc@universal)
    const itemId = id.replace(/#\d+$/, '');
    return { itemId, sourceRecruitId: null, isSquadDrag: false };
}

export function TeamBuilder({ campaign }: TeamBuilderProps) {
    const {
        targetEB,
        setTargetEB,
        totalCost,
        isValid,
        validationErrors,
        selectedIds,
        equipmentMap,
        toggleSelection,
        assignEquip,
        removeEquip,
        moveEquip,
        reorderEquip,
        setSquadOrder,
        handleStartMatch
    } = useTeamBuilder(campaign);

    const { catalog } = useStore();
    const campaignStreetCred = MathService.calculateCampaignStreetCred(campaign, catalog);
    const { gridClass, cardStyle } = useCardGrid();
    const [filter, setFilter] = useState<FilterType>('all');
    const [rosterOpen, setRosterOpen] = useState(true);
    const [gearOpen, setGearOpen] = useState(true);
    const [programsOpen, setProgramsOpen] = useState(true);
    const [activeDragId, setActiveDragId] = useState<string | null>(null);
    const [overId, setOverId] = useState<string | null>(null);
    const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
    const [compactPrograms, setCompactPrograms] = useState<Set<string>>(new Set());

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    const toggleFlip = (id: string) => {
        setFlippedCards(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const toggleCompact = (id: string) => {
        setCompactPrograms(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const getProfile = (profileId: string) => catalog.profiles.find(p => p.id === profileId);
    const getLineage = (lineageId: string) => catalog.lineages.find(l => l.id === lineageId);
    const getFactionName = (factionId: string) => {
        if (factionId === 'all') return 'All';
        return catalog.factions.find(f => f.id === factionId)?.name ?? 'Unknown';
    };

    // ── Squad and roster separation ──
    // Maintain selectedIds order for squad display
    const selectedRecruits = selectedIds
        .map(id => campaign.hqRoster.find(r => r.id === id))
        .filter(Boolean) as typeof campaign.hqRoster;
    const unselectedRoster = campaign.hqRoster.filter(r => !selectedIds.includes(r.id));

    const rosterTypes = Array.from(new Set(
        unselectedRoster.map(r => {
            const p = getProfile(r.currentProfileId);
            return p ? getLineage(p.lineageId)?.type : null;
        }).filter(Boolean)
    )) as ModelLineage['type'][];

    const filteredRoster = unselectedRoster.filter(recruit => {
        if (filter === 'all') return true;
        const profile = getProfile(recruit.currentProfileId);
        if (!profile) return false;
        const lineage = getLineage(profile.lineageId);
        return lineage?.type === filter;
    });

    // ── Stash items from campaign ──
    const stashWeapons: Array<{ weapon: Weapon; variantFactionId: string }> = [];
    const stashPrograms: Array<{ program: HackingProgram; factionName: string }> = [];
    campaign.hqStash.forEach(entry => {
        const { itemId, variantFactionId } = parseStashEntry(entry);
        const weapon = catalog.weapons.find(w => w.id === itemId);
        if (weapon) { stashWeapons.push({ weapon, variantFactionId }); return; }
        const program = catalog.programs.find(p => p.id === itemId);
        if (program) {
            stashPrograms.push({ program, factionName: getFactionName(program.factionId) });
        }
    });

    // ── Count stash copies per item (keyed by weaponId@variantFactionId) ──
    const stashWeaponCounts = new Map<string, { weapon: Weapon; variantFactionId: string; count: number }>();
    stashWeapons.forEach(({ weapon, variantFactionId }) => {
        const key = `${weapon.id}@${variantFactionId}`;
        const e = stashWeaponCounts.get(key);
        if (e) e.count++; else stashWeaponCounts.set(key, { weapon, variantFactionId, count: 1 });
    });
    const stashProgramCounts = new Map<string, { data: { program: HackingProgram; factionName: string }; count: number }>();
    stashPrograms.forEach(sp => {
        const e = stashProgramCounts.get(sp.program.id);
        if (e) e.count++; else stashProgramCounts.set(sp.program.id, { data: sp, count: 1 });
    });

    // ── Count equipped copies per item ──
    const equippedCounts = new Map<string, number>();
    Object.values(equipmentMap).flat().forEach(itemId => {
        equippedCounts.set(itemId, (equippedCounts.get(itemId) ?? 0) + 1);
    });

    // ── Available = stash copies minus equipped copies ──
    const availableWeapons: Array<{ weapon: Weapon; variantFactionId: string; copyIndex: number }> = [];
    stashWeaponCounts.forEach(({ weapon, variantFactionId, count }, key) => {
        const equipped = equippedCounts.get(`weapon-${weapon.id}@${variantFactionId}`) ?? 0;
        for (let i = 0; i < count - equipped; i++) availableWeapons.push({ weapon, variantFactionId, copyIndex: i });
    });
    const availablePrograms: Array<{ program: HackingProgram; factionName: string; copyIndex: number }> = [];
    stashProgramCounts.forEach(({ data, count }) => {
        const equipped = equippedCounts.get(`program-${data.program.id}`) ?? 0;
        for (let i = 0; i < count - equipped; i++) availablePrograms.push({ ...data, copyIndex: i });
    });

    const budgetPercent = Math.min(100, Math.round((totalCost / targetEB) * 100));
    const overBudget = totalCost > targetEB;

    // ── DnD handlers ──
    const handleDragStart = (event: DragStartEvent) => {
        setActiveDragId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        setOverId(event.over?.id != null ? String(event.over.id) : null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragId(null);
        setOverId(null);

        if (!over) return;

        const activeId = String(active.id);
        const ovId = String(over.id);

        // Case 1: Squad card reorder (sortable handles this when active IS a squad member)
        if (selectedIds.includes(activeId) && selectedIds.includes(ovId) && activeId !== ovId) {
            const oldIndex = selectedIds.indexOf(activeId);
            const newIndex = selectedIds.indexOf(ovId);
            setSquadOrder(arrayMove(selectedIds, oldIndex, newIndex));
            return;
        }

        // Case 2: Equipment drop onto a squad card
        if (!selectedIds.includes(ovId)) return;

        const { itemId, sourceRecruitId } = parseDragId(activeId);

        if (sourceRecruitId) {
            if (sourceRecruitId !== ovId) {
                moveEquip(sourceRecruitId, ovId, itemId);
            }
        } else {
            assignEquip(ovId, itemId);
        }
    };

    // ── Drag overlay content ──
    const renderDragOverlay = () => {
        if (!activeDragId) return null;

        // If dragging a squad card, show the character card
        if (selectedIds.includes(activeDragId)) {
            const recruit = campaign.hqRoster.find(r => r.id === activeDragId);
            if (recruit) {
                const profile = getProfile(recruit.currentProfileId);
                const lineage = profile ? getLineage(profile.lineageId) : null;
                if (profile && lineage) {
                    return (
                        <div className="opacity-80 pointer-events-none" style={cardStyle}>
                            <div className="border-2 border-primary shadow-[0_0_20px_rgba(252,238,10,0.4)]">
                                <CharacterCard lineage={lineage} profile={profile} />
                            </div>
                        </div>
                    );
                }
            }
            return null;
        }

        const { itemId } = parseDragId(activeDragId);
        const parsed = parseEquipmentId(itemId);

        if (parsed.prefix === 'weapon') {
            const weapon = catalog.weapons.find(w => w.id === parsed.baseId);
            if (weapon) {
                return (
                    <div className="w-72 opacity-90 pointer-events-none">
                        <WeaponTile weapon={weapon} variantFactionId={parsed.variantFactionId} />
                    </div>
                );
            }
        }

        if (parsed.prefix === 'program') {
            const program = catalog.programs.find(p => p.id === parsed.baseId);
            if (program) {
                return (
                    <div className="w-40 opacity-90 pointer-events-none">
                        <ProgramCard program={program} side="front" />
                    </div>
                );
            }
        }

        return null;
    };

    // Is the current over target receiving an equipment drag (not a squad reorder)?
    const isEquipDragOver = (recruitId: string) => {
        if (overId !== recruitId || !activeDragId) return false;
        // If the active drag is a squad card, it's a reorder — not an equip drop
        if (selectedIds.includes(activeDragId)) return false;
        return true;
    };

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div>
                {/* === STICKY BUDGET + DEPLOY BAR === */}
                <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-border shadow-[0_4px_20px_rgba(0,0,0,0.8)] -mx-4 px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="text-[9px] font-mono-tech text-muted-foreground uppercase tracking-widest shrink-0">
                                Match Budget
                            </div>
                            <div className="flex items-end gap-1">
                                <span className={`text-2xl font-display font-bold leading-none ${overBudget ? 'text-accent' : 'text-white'}`}>
                                    {totalCost}
                                </span>
                                <span className="text-lg font-display text-muted-foreground">/</span>
                                <Input
                                    type="number"
                                    value={targetEB}
                                    onChange={(e) => setTargetEB(Number(e.target.value))}
                                    className="w-14 h-6 text-center bg-transparent border-none p-0 text-lg font-display text-muted-foreground focus-visible:ring-0 focus-visible:text-white"
                                />
                                <span className="text-sm font-mono-tech text-muted-foreground">EB</span>
                            </div>
                            <div className="flex-1 h-1.5 bg-black border border-border min-w-[60px]">
                                <div
                                    className={`h-full transition-all duration-300 ${overBudget ? 'bg-accent shadow-[0_0_8px_rgba(255,0,60,0.8)]' : 'bg-secondary shadow-[0_0_8px_rgba(0,240,255,0.8)]'}`}
                                    style={{ width: `${budgetPercent}%` }}
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleStartMatch}
                            className={`font-display font-bold text-sm px-5 py-2 clip-corner-br uppercase tracking-widest transition-all flex items-center gap-2 shrink-0 ${
                                isValid
                                    ? 'bg-primary hover:bg-white text-black hover:shadow-[0_0_15px_rgba(255,255,255,0.4)] active:scale-95'
                                    : 'bg-primary/70 hover:bg-primary text-black active:scale-95'
                            }`}
                        >
                            {!isValid && <AlertTriangle className="w-4 h-4" />}
                            <span>Deploy</span>
                            <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </button>
                    </div>

                    {validationErrors.length > 0 && (
                        <div className="mt-2">
                            <div className="bg-accent/10 border-l-2 border-accent p-2">
                                <div className="flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-wider mb-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    <span>Warnings</span>
                                </div>
                                <ul className="list-disc list-inside text-[10px] text-muted-foreground font-mono-tech">
                                    {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                {/* ═══════════════════════════════════════════
                    SECTION 1 — SQUAD (sortable + droppable)
                ═══════════════════════════════════════════ */}
                <div className="mt-6 mb-6">
                    <div className="flex items-center gap-3 mb-4 border-l-2 border-secondary pl-4">
                        <Users className="w-4 h-4 text-secondary" />
                        <h2 className="font-display text-2xl text-white uppercase tracking-wider">
                            Squad
                        </h2>
                        <span className="text-xs font-mono-tech text-muted-foreground uppercase tracking-wider">
                            {selectedIds.length} deployed
                        </span>
                    </div>

                    {selectedRecruits.length > 0 ? (
                        <SortableContext items={selectedIds} strategy={horizontalListSortingStrategy}>
                            <div className={gridClass}>
                                {selectedRecruits.map(recruit => {
                                    const profile = getProfile(recruit.currentProfileId);
                                    const lineage = profile ? getLineage(profile.lineageId) : null;
                                    if (!profile || !lineage) return null;

                                    const equippedIds = equipmentMap[recruit.id] ?? [];

                                    // Resolve equipped items in order
                                    const equippedItems = equippedIds.map(eqId => {
                                        const parsed = parseEquipmentId(eqId);
                                        if (parsed.prefix === 'weapon') {
                                            const weapon = catalog.weapons.find(w => w.id === parsed.baseId);
                                            return weapon ? { equipId: eqId, type: 'weapon' as const, weapon, variantFactionId: parsed.variantFactionId, program: null } : null;
                                        }
                                        if (parsed.prefix === 'program') {
                                            const program = catalog.programs.find(p => p.id === parsed.baseId);
                                            return program ? { equipId: eqId, type: 'program' as const, weapon: null, variantFactionId: undefined, program } : null;
                                        }
                                        return null;
                                    }).filter(Boolean) as Array<
                                        | { equipId: string; type: 'weapon'; weapon: Weapon; variantFactionId: string; program: null }
                                        | { equipId: string; type: 'program'; weapon: null; variantFactionId: undefined; program: HackingProgram }
                                    >;

                                    return (
                                        <div key={recruit.id} style={cardStyle}>
                                            <SortableSquadCard
                                                id={recruit.id}
                                                isEquipOver={isEquipDragOver(recruit.id)}
                                                cardContent={
                                                    <div className="relative">
                                                        {/* X button to remove from squad */}
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); toggleSelection(recruit.id); }}
                                                            onPointerDown={(e) => e.stopPropagation()}
                                                            className="absolute -top-2 -right-2 z-30 bg-accent text-white p-1 clip-corner-tr shadow-lg border border-black hover:bg-red-500 hover:shadow-[0_0_10px_rgba(255,0,60,0.6)] transition-all"
                                                            title="Remove from squad"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                        <div className="absolute -left-1 top-0 bottom-0 w-2 bg-primary z-10 glow-primary" />
                                                        <div className="border-2 border-primary">
                                                            <CharacterCard lineage={lineage} profile={profile} />
                                                        </div>
                                                    </div>
                                                }
                                            >
                                                {/* Equipped items */}
                                                <div className="mt-2 space-y-2">
                                                    {equippedItems.map((item, idx) => {
                                                        const dragId = `equipped:${recruit.id}:${item.equipId}`;
                                                        const isFirst = idx === 0;
                                                        const isLast = idx === equippedItems.length - 1;
                                                        const showReorder = equippedItems.length > 1;
                                                        const isCompact = item.type === 'program' && compactPrograms.has(`${recruit.id}:${item.equipId}`);

                                                        return (
                                                            <div key={item.equipId} className="relative group/eq">
                                                                <DraggableItem id={dragId}>
                                                                    {item.type === 'weapon' ? (
                                                                        <WeaponTile
                                                                            weapon={item.weapon}
                                                                            variantFactionId={item.variantFactionId}
                                                                            campaignStreetCred={campaignStreetCred}
                                                                            equippedCount={equippedCounts.get(`weapon-${item.weapon.id}@${item.variantFactionId}`) ?? 0}
                                                                            overlay={
                                                                                <div className="absolute top-1 left-10 z-20">
                                                                                    <GripVertical className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover/eq:opacity-60" />
                                                                                </div>
                                                                            }
                                                                        />
                                                                    ) : isCompact ? (
                                                                        <div className="relative">
                                                                            <ProgramTile program={item.program} factionName={getFactionName(item.program.factionId)} />
                                                                            <div className="absolute top-1 left-1 z-20">
                                                                                <GripVertical className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover/eq:opacity-60" />
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="relative group/card">
                                                                            <div
                                                                                className="card-flip-container w-full cursor-pointer"
                                                                                onClick={(e) => { e.stopPropagation(); toggleFlip(`eq-${item.equipId}`); }}
                                                                            >
                                                                                <div className={`card-flip-inner ${flippedCards.has(`eq-${item.equipId}`) ? 'flipped' : ''}`}>
                                                                                    <div className="card-flip-front">
                                                                                        <ProgramCard program={item.program} side="front" />
                                                                                    </div>
                                                                                    <div className="card-flip-back">
                                                                                        <ProgramCard program={item.program} side="back" />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="absolute top-1 left-1 z-20">
                                                                                <GripVertical className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover/eq:opacity-60" />
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </DraggableItem>

                                                                {/* Controls: compact toggle + reorder + remove */}
                                                                <div className="absolute top-1 right-1 z-20 flex items-center gap-0.5 opacity-0 group-hover/eq:opacity-100 transition-opacity">
                                                                    {item.type === 'program' && (
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); toggleCompact(`${recruit.id}:${item.equipId}`); }}
                                                                            className="p-0.5 bg-black/80 border border-border text-muted-foreground hover:text-cyber-purple hover:border-cyber-purple transition-colors"
                                                                            title={isCompact ? 'Full card' : 'Compact'}
                                                                        >
                                                                            {isCompact ? <Maximize2 className="w-3 h-3" /> : <List className="w-3 h-3" />}
                                                                        </button>
                                                                    )}
                                                                    {showReorder && !isFirst && (
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); reorderEquip(recruit.id, item.equipId, 'up'); }}
                                                                            className="p-0.5 bg-black/80 border border-border text-muted-foreground hover:text-white hover:border-white transition-colors"
                                                                            title="Move up"
                                                                        >
                                                                            <ChevronUp className="w-3 h-3" />
                                                                        </button>
                                                                    )}
                                                                    {showReorder && !isLast && (
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); reorderEquip(recruit.id, item.equipId, 'down'); }}
                                                                            className="p-0.5 bg-black/80 border border-border text-muted-foreground hover:text-white hover:border-white transition-colors"
                                                                            title="Move down"
                                                                        >
                                                                            <ChevronDown className="w-3 h-3" />
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); removeEquip(recruit.id, item.equipId); }}
                                                                        className="p-0.5 bg-black/80 border border-border text-muted-foreground hover:text-accent hover:border-accent transition-colors"
                                                                        title="Unequip"
                                                                    >
                                                                        <X className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                    {equippedIds.length === 0 && (
                                                        <div className="text-[10px] font-mono-tech text-muted-foreground text-center py-1 border border-dashed border-border">
                                                            Drop equipment here
                                                        </div>
                                                    )}
                                                </div>
                                            </SortableSquadCard>
                                        </div>
                                    );
                                })}
                            </div>
                        </SortableContext>
                    ) : (
                        <div className="border border-dashed border-border p-6 text-center">
                            <div className="text-muted-foreground font-mono-tech text-xs uppercase tracking-widest">
                                Select characters from the roster below to build your squad
                            </div>
                        </div>
                    )}
                </div>

                {/* ═══════════════════════════════════════════
                    SECTION 2 — AVAILABLE ROSTER (collapsible)
                ═══════════════════════════════════════════ */}
                <section className="mb-6">
                    <button
                        onClick={() => setRosterOpen(v => !v)}
                        className="flex items-center gap-2 mb-4 group/collapse w-full text-left"
                    >
                        <ChevronDown className={`w-5 h-5 text-primary transition-transform ${rosterOpen ? '' : '-rotate-90'}`} />
                        <div className="border-l-2 border-primary pl-3">
                            <h2 className="font-display text-2xl text-white uppercase tracking-wider group-hover/collapse:text-primary transition-colors">
                                Available Roster
                            </h2>
                            <span className="text-xs font-mono-tech text-muted-foreground uppercase tracking-widest">
                                {unselectedRoster.length} available
                            </span>
                        </div>
                    </button>

                    {rosterOpen && (
                        <>
                            {rosterTypes.length > 1 && (
                                <div className="flex flex-wrap gap-3 mb-4 text-sm font-mono-tech text-muted-foreground uppercase tracking-widest">
                                    <button
                                        onClick={() => setFilter('all')}
                                        className={`transition-colors pb-0.5 ${filter === 'all' ? 'text-secondary border-b border-secondary' : 'hover:text-secondary'}`}
                                    >
                                        [ All ]
                                    </button>
                                    {rosterTypes.map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setFilter(type)}
                                            className={`transition-colors pb-0.5 ${filter === type ? 'text-secondary border-b border-secondary' : 'hover:text-secondary'}`}
                                        >
                                            {type}s
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className={gridClass}>
                                {filteredRoster.length === 0 && unselectedRoster.length === 0 && (
                                    <div className="col-span-full border border-dashed border-border p-8 text-center text-muted-foreground font-mono-tech uppercase text-xs tracking-widest">
                                        {campaign.hqRoster.length === 0
                                            ? 'No Assets Available. Recruit mercs from HQ first.'
                                            : 'All characters deployed to squad.'}
                                    </div>
                                )}

                                {filteredRoster.length === 0 && unselectedRoster.length > 0 && filter !== 'all' && (
                                    <div className="col-span-full border border-dashed border-border p-8 text-center text-muted-foreground font-mono-tech uppercase text-xs tracking-widest">
                                        No {filter}s available
                                    </div>
                                )}

                                {filteredRoster.map(recruit => {
                                    const profile = getProfile(recruit.currentProfileId);
                                    const lineage = profile ? getLineage(profile.lineageId) : null;
                                    if (!profile || !lineage) return null;

                                    return (
                                        <div key={recruit.id} style={cardStyle}>
                                            <div
                                                className="cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                                                onClick={() => toggleSelection(recruit.id)}
                                            >
                                                <CharacterCard lineage={lineage} profile={profile} />
                                            </div>
                                        </div>
                                    );
                                })}

                                {campaign.hqRoster.length > 0 && (
                                    <div style={cardStyle}>
                                        <a
                                            href="/hq"
                                            className="relative group cursor-pointer border-2 border-dashed border-border hover:border-primary transition-all bg-black flex flex-col items-center justify-center aspect-[2/3] clip-corner-tl-br shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"
                                        >
                                            <div className="h-16 w-16 clip-corner-tr bg-surface-dark border border-border flex items-center justify-center group-hover:scale-110 transition-transform mb-4 group-hover:border-primary group-hover:bg-primary group-hover:text-black">
                                                <Plus className="w-8 h-8 text-muted-foreground group-hover:text-black transition-colors" />
                                            </div>
                                            <span className="font-display text-xl text-muted-foreground group-hover:text-white uppercase tracking-widest transition-colors">
                                                Recruit More
                                            </span>
                                            <span className="font-mono-tech text-xs text-secondary mt-3 opacity-0 group-hover:opacity-100 uppercase tracking-wider transition-opacity bg-black px-2 py-1 border border-secondary/30">
                                                Go to HQ Roster
                                            </span>
                                        </a>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </section>

                {/* Divider */}
                <div className="border-t border-border mb-6" />

                {/* ═══════════════════════════════════════════
                    SECTION 3 — WEAPONS & GEAR (collapsible, draggable)
                ═══════════════════════════════════════════ */}
                <section className="mb-6">
                    <button
                        onClick={() => setGearOpen(v => !v)}
                        className="flex items-center gap-2 mb-4 group/collapse w-full text-left"
                    >
                        <ChevronDown className={`w-5 h-5 text-secondary transition-transform ${gearOpen ? '' : '-rotate-90'}`} />
                        <div className="border-l-2 border-secondary pl-3">
                            <h2 className="font-display text-xl font-bold uppercase tracking-wider text-white group-hover/collapse:text-secondary transition-colors">
                                Weapons & Gear
                            </h2>
                            <span className="text-xs font-mono-tech text-muted-foreground uppercase tracking-widest">
                                {availableWeapons.length}/{stashWeapons.length} available
                            </span>
                        </div>
                    </button>

                    {gearOpen && (
                        <>
                            {stashWeapons.length === 0 ? (
                                <div className="border border-dashed border-border p-6 text-center text-muted-foreground font-mono-tech text-xs uppercase tracking-widest">
                                    No weapons or gear in stash. Buy from HQ first.
                                </div>
                            ) : (
                                <div className={gridClass}>
                                    {availableWeapons.map(({ weapon, variantFactionId, copyIndex }) => {
                                        const dragId = `weapon-${weapon.id}@${variantFactionId}#${copyIndex}`;

                                        return (
                                            <div key={`${weapon.id}-${variantFactionId}-${copyIndex}`} style={cardStyle}>
                                                <DraggableItem id={dragId}>
                                                    <WeaponTile
                                                        weapon={weapon}
                                                        variantFactionId={variantFactionId}
                                                        campaignStreetCred={campaignStreetCred}
                                                        equippedCount={equippedCounts.get(`weapon-${weapon.id}@${variantFactionId}`) ?? 0}
                                                        overlay={
                                                            <div className="absolute top-1 left-10 z-20 flex items-center gap-1">
                                                                <GripVertical className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover/tile:opacity-60" />
                                                            </div>
                                                        }
                                                    />
                                                </DraggableItem>
                                            </div>
                                        );
                                    })}
                                    {availableWeapons.length === 0 && stashWeapons.length > 0 && (
                                        <div className="col-span-full text-center py-4 text-muted-foreground font-mono-tech text-xs uppercase tracking-widest">
                                            All gear equipped
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </section>

                {/* ═══════════════════════════════════════════
                    SECTION 4 — PROGRAMS (collapsible, draggable)
                ═══════════════════════════════════════════ */}
                <section className="mb-6">
                    <button
                        onClick={() => setProgramsOpen(v => !v)}
                        className="flex items-center gap-2 mb-4 group/collapse w-full text-left"
                    >
                        <ChevronDown className={`w-5 h-5 text-cyber-purple transition-transform ${programsOpen ? '' : '-rotate-90'}`} />
                        <div className="border-l-2 border-cyber-purple pl-3">
                            <h2 className="font-display text-xl font-bold uppercase tracking-wider text-white group-hover/collapse:text-cyber-purple transition-colors">
                                Programs
                            </h2>
                            <span className="text-xs font-mono-tech text-muted-foreground uppercase tracking-widest">
                                {availablePrograms.length}/{stashPrograms.length} available
                            </span>
                        </div>
                    </button>

                    {programsOpen && (
                        <>
                            {stashPrograms.length === 0 ? (
                                <div className="border border-dashed border-border p-6 text-center text-muted-foreground font-mono-tech text-xs uppercase tracking-widest">
                                    No programs in stash. Buy from HQ first.
                                </div>
                            ) : (
                                <div className={gridClass}>
                                    {availablePrograms.map(({ program, copyIndex }) => {
                                        const dragId = `program-${program.id}#${copyIndex}`;

                                        return (
                                            <div key={`${program.id}-${copyIndex}`} style={cardStyle}>
                                                <DraggableItem id={dragId}>
                                                    <div className="relative group/card">
                                                        <div
                                                            className="card-flip-container w-full cursor-pointer"
                                                            onClick={() => toggleFlip(program.id)}
                                                        >
                                                            <div className={`card-flip-inner ${flippedCards.has(program.id) ? 'flipped' : ''}`}>
                                                                <div className="card-flip-front">
                                                                    <ProgramCard program={program} side="front" />
                                                                </div>
                                                                <div className="card-flip-back">
                                                                    <ProgramCard program={program} side="back" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="absolute top-1 right-1 z-20 flex items-center gap-1">
                                                            <GripVertical className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover/card:opacity-60" />
                                                        </div>
                                                    </div>
                                                </DraggableItem>
                                            </div>
                                        );
                                    })}
                                    {availablePrograms.length === 0 && stashPrograms.length > 0 && (
                                        <div className="col-span-full text-center py-4 text-muted-foreground font-mono-tech text-xs uppercase tracking-widest">
                                            All programs equipped
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </section>
            </div>

            {/* Drag overlay — follows pointer */}
            <DragOverlay dropAnimation={null}>
                {renderDragOverlay()}
            </DragOverlay>
        </DndContext>
    );
}
