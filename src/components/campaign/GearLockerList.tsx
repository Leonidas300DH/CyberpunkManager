'use client';

import { useState } from 'react';
import { Campaign, Weapon } from '@/types';
import { useStore } from '@/store/useStore';
import { MathService } from '@/lib/math';
import { parseStashEntry, buildStashEntry, resolveVariant } from '@/lib/variants';
import { Plus, Search, X, Trash2, List, Square, ChevronDown } from 'lucide-react';
import { WeaponCard } from '@/components/weapons/WeaponCard';
import { WeaponTile } from '@/components/shared/WeaponTile';
import { CardPreviewTooltip } from '@/components/ui/CardPreviewTooltip';
import { useCardGrid } from '@/hooks/useCardGrid';
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragEndEvent,
} from '@dnd-kit/core';
import { DraggableCapsule, OwnedDropZone, TrashZone } from '@/components/shared/HqDnd';

interface GearLockerListProps {
    campaign: Campaign;
}

const CAPSULE = "inline-flex items-center gap-1 text-[11px] font-mono-tech px-2.5 py-0.5 bg-black border rounded-full text-white hover:brightness-125 transition-all cursor-default";

export function GearLockerList({ campaign }: GearLockerListProps) {
    const { catalog, updateCampaign } = useStore();
    const { gridClass, cardStyle } = useCardGrid();
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'card'>('card');
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
    const [activeDragId, setActiveDragId] = useState<string | null>(null);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    const toggleSection = (key: string) => {
        setExpandedSections(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key); else next.add(key);
            return next;
        });
    };

    const campaignStreetCred = MathService.calculateCampaignStreetCred(campaign, catalog);

    // ── Parse owned gear from stash ──
    const stashGear: Array<{ weapon: Weapon; variantFactionId: string; stashIdx: number }> = [];
    campaign.hqStash.forEach((entry, idx) => {
        const { itemId, variantFactionId } = parseStashEntry(entry);
        const weapon = catalog.weapons.find(w => w.id === itemId);
        if (weapon && weapon.isGear && !weapon.isWeapon && !weapon.isAction) {
            stashGear.push({ weapon, variantFactionId, stashIdx: idx });
        }
    });

    // ── Group owned by item+variant for capsule ──
    const ownedGroups = new Map<string, { weapon: Weapon; variantFactionId: string; indices: number[]; cost: number }>();
    stashGear.forEach(({ weapon, variantFactionId, stashIdx }) => {
        const key = `${weapon.id}@${variantFactionId}`;
        const variant = resolveVariant(weapon.factionVariants, variantFactionId);
        const existing = ownedGroups.get(key);
        if (existing) existing.indices.push(stashIdx);
        else ownedGroups.set(key, { weapon, variantFactionId, indices: [stashIdx], cost: variant.cost });
    });

    // ── Sell handler ──
    const handleRemove = (stashIdx: number) => {
        const entry = campaign.hqStash[stashIdx];
        const { itemId, variantFactionId } = parseStashEntry(entry);
        const weapon = catalog.weapons.find(w => w.id === itemId);
        const refund = weapon ? resolveVariant(weapon.factionVariants, variantFactionId).cost : 0;
        const newStash = [...campaign.hqStash];
        newStash.splice(stashIdx, 1);
        updateCampaign(campaign.id, { hqStash: newStash, ebBank: campaign.ebBank + refund });
    };

    // ── Buy handler ──
    const handleBuy = (weaponId: string, variantFactionId: string, cost: number) => {
        if (campaign.ebBank < cost) return;
        updateCampaign(campaign.id, {
            hqStash: [...campaign.hqStash, buildStashEntry(weaponId, variantFactionId)],
            ebBank: campaign.ebBank - cost,
        });
    };

    // ── Available catalog gear ──
    const filteredGear = catalog.weapons.filter(w => {
        if (!w.isGear || w.isWeapon || w.isAction) return false;
        if (search && !w.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const stashCountOf = (id: string) => campaign.hqStash.filter(s => parseStashEntry(s).itemId === id).length;

    // ─── DnD handlers ────────────────────────────────────────────────
    const handleDragStart = (e: DragStartEvent) => setActiveDragId(e.active.id as string);
    const handleDragEnd = (e: DragEndEvent) => {
        setActiveDragId(null);
        if (!e.over) return;
        const activeId = e.active.id as string;
        const overId = String(e.over.id);

        if (activeId.startsWith('buy:') && overId === 'owned-zone') {
            const rest = activeId.slice('buy:'.length);
            const { itemId, variantFactionId } = parseStashEntry(rest);
            const weapon = catalog.weapons.find(w => w.id === itemId);
            if (!weapon) return;
            const variant = resolveVariant(weapon.factionVariants, variantFactionId);
            handleBuy(weapon.id, variant.factionId, variant.cost);
        }
        if (activeId.startsWith('sell:') && overId === 'trash-zone') {
            const stashIdx = parseInt(activeId.slice('sell:'.length), 10);
            handleRemove(stashIdx);
        }
    };

    const renderDragOverlay = () => {
        if (!activeDragId) return null;
        if (activeDragId.startsWith('buy:')) {
            const rest = activeDragId.slice('buy:'.length);
            const { itemId, variantFactionId } = parseStashEntry(rest);
            const weapon = catalog.weapons.find(w => w.id === itemId);
            if (!weapon) return null;
            const variant = resolveVariant(weapon.factionVariants, variantFactionId);
            return (
                <span className={`${CAPSULE} border-secondary shadow-lg shadow-secondary/30`}>
                    {weapon.name} · {variant.cost}EB
                </span>
            );
        }
        if (activeDragId.startsWith('sell:')) {
            const stashIdx = parseInt(activeDragId.slice('sell:'.length), 10);
            const entry = campaign.hqStash[stashIdx];
            if (!entry) return null;
            const { itemId, variantFactionId } = parseStashEntry(entry);
            const weapon = catalog.weapons.find(w => w.id === itemId);
            if (!weapon) return null;
            const variant = resolveVariant(weapon.factionVariants, variantFactionId);
            return (
                <span className={`${CAPSULE} border-secondary shadow-lg shadow-secondary/30`}>
                    {weapon.name} · {variant.cost}EB
                </span>
            );
        }
        return null;
    };

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="space-y-10">
            {/* ═══ SECTION 1 — YOUR EQUIPMENT ═══ */}
            <section>
                <button
                    onClick={() => toggleSection('owned')}
                    className="flex items-center gap-2 mb-4 group/collapse w-full text-left"
                >
                    <ChevronDown className={`w-5 h-5 text-secondary transition-transform ${!expandedSections.has('owned') ? '-rotate-90' : ''}`} />
                    <div className="border-l-2 border-secondary pl-3">
                        <h3 className="font-display text-xl font-bold uppercase tracking-wider text-white group-hover/collapse:text-secondary transition-colors">Your Equipment</h3>
                        <span className="text-xs font-mono-tech text-muted-foreground uppercase tracking-widest">
                            {stashGear.length} item{stashGear.length !== 1 ? 's' : ''} stored
                        </span>
                    </div>
                </button>

                <OwnedDropZone>
                {stashGear.length === 0 ? (
                    <div className="border-2 border-dashed border-border bg-black/50 p-12 text-center clip-corner-tl-br">
                        <h3 className="text-xl font-display font-bold uppercase text-muted-foreground mb-2">Locker Empty</h3>
                        <p className="text-xs font-mono-tech text-muted-foreground uppercase tracking-widest">Drag equipment here or use the + button below.</p>
                    </div>
                ) : !expandedSections.has('owned') ? (
                    /* Capsule View */
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {Array.from(ownedGroups.values()).map(({ weapon, variantFactionId, indices, cost }) => (
                            <DraggableCapsule key={`${weapon.id}@${variantFactionId}`} id={`sell:${indices[indices.length - 1]}`}>
                            <CardPreviewTooltip
                                renderCard={() => <WeaponCard weapon={weapon} variant={resolveVariant(weapon.factionVariants, variantFactionId)} />}
                            >
                                <span className={`${CAPSULE} border-secondary`}>
                                    <span>{indices.length > 1 ? `${indices.length}× ` : ''}{weapon.name} · {cost}EB</span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleRemove(indices[indices.length - 1]); }}
                                        className="ml-0.5 hover:text-accent transition-colors"
                                        title={`Sell — refund ${cost} EB`}
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            </CardPreviewTooltip>
                            </DraggableCapsule>
                        ))}
                    </div>
                ) : (
                    /* Expanded View */
                    <div>
                        <div className="flex items-center justify-between border-b border-border pb-1 mb-2">
                            <span className="font-mono-tech text-[10px] uppercase tracking-widest text-secondary font-bold">
                                Equipment — {stashGear.length} item{stashGear.length !== 1 ? 's' : ''}
                            </span>
                            <div className="flex gap-1">
                                {([
                                    { mode: 'list' as const, icon: List, label: 'List' },
                                    { mode: 'card' as const, icon: Square, label: 'Card' },
                                ] as const).map(({ mode, icon: Icon, label }) => (
                                    <button
                                        key={mode}
                                        onClick={() => setViewMode(mode)}
                                        className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono-tech uppercase tracking-wider transition-all ${
                                            viewMode === mode ? 'bg-secondary text-black' : 'bg-black border border-border text-muted-foreground hover:text-white'
                                        }`}
                                    >
                                        <Icon className="w-3 h-3" />
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className={gridClass}>
                            {stashGear.map(({ weapon, variantFactionId, stashIdx }) => {
                                const variant = resolveVariant(weapon.factionVariants, variantFactionId);
                                if (viewMode === 'card') {
                                    return (
                                        <div key={`owned-${stashIdx}`} className="relative group/card" style={cardStyle}>
                                            <WeaponCard weapon={weapon} variant={variant} />
                                            <button
                                                onClick={() => handleRemove(stashIdx)}
                                                className="absolute top-1 right-1 z-30 p-1.5 bg-black/80 border border-border text-muted-foreground hover:text-accent hover:border-accent transition-colors opacity-0 group-hover/card:opacity-100 rounded"
                                                title={`Sell — refund ${variant.cost} EB`}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    );
                                }
                                return (
                                    <WeaponTile
                                        key={`owned-${stashIdx}`}
                                        weapon={weapon}
                                        variantFactionId={variantFactionId}
                                        campaignStreetCred={campaignStreetCred}
                                        equippedCount={stashCountOf(weapon.id)}
                                        overlay={
                                            <button
                                                onClick={() => handleRemove(stashIdx)}
                                                className="absolute top-1 right-1 z-20 p-1 bg-black/80 border border-border text-muted-foreground hover:text-accent hover:border-accent transition-colors opacity-0 group-hover/tile:opacity-100"
                                                title={`Sell — refund ${variant.cost} EB`}
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        }
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
                <TrashZone visible={activeDragId?.startsWith('sell:') ?? false} />
                </OwnedDropZone>
            </section>

            <div className="border-t border-border" />

            {/* ═══ SECTION 2 — AVAILABLE EQUIPMENT ═══ */}
            <section>
                <button
                    onClick={() => toggleSection('available')}
                    className="flex items-center gap-2 mb-4 group/collapse w-full text-left"
                >
                    <ChevronDown className={`w-5 h-5 text-secondary transition-transform ${!expandedSections.has('available') ? '-rotate-90' : ''}`} />
                    <div className="border-l-2 border-secondary pl-3">
                        <h3 className="font-display text-xl font-bold uppercase tracking-wider text-white group-hover/collapse:text-secondary transition-colors">Available Equipment</h3>
                        <span className="text-xs font-mono-tech text-muted-foreground uppercase tracking-widest">
                            Drag to locker or click +
                        </span>
                    </div>
                </button>

                {!expandedSections.has('available') ? (
                    /* Capsule View */
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {filteredGear.length === 0 ? (
                            <div className="w-full text-center py-8 text-muted-foreground font-mono-tech text-xs uppercase tracking-widest">No equipment found.</div>
                        ) : filteredGear.map(weapon => {
                            const variant = resolveVariant(weapon.factionVariants, campaign.factionId);
                            const cantAfford = campaign.ebBank < variant.cost;
                            const owned = stashCountOf(weapon.id);
                            return (
                                <DraggableCapsule key={weapon.id} id={`buy:${buildStashEntry(weapon.id, variant.factionId)}`} disabled={cantAfford}>
                                <CardPreviewTooltip
                                    renderCard={() => <WeaponCard weapon={weapon} variant={resolveVariant(weapon.factionVariants, campaign.factionId)} />}
                                >
                                    <span className={`${CAPSULE} border-secondary ${cantAfford ? 'opacity-35' : ''}`}>
                                        <span>{weapon.name}</span>
                                        <span className="text-muted-foreground">·</span>
                                        <span className={cantAfford ? 'text-accent' : ''}>{variant.cost === 0 ? 'Free' : `${variant.cost}EB`}</span>
                                        {owned > 0 && <span className="text-muted-foreground text-[9px]">×{owned}</span>}
                                        {!cantAfford && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleBuy(weapon.id, variant.factionId, variant.cost); }}
                                                className="ml-0.5 hover:text-secondary transition-colors"
                                                title={`Buy — ${variant.cost} EB`}
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        )}
                                    </span>
                                </CardPreviewTooltip>
                                </DraggableCapsule>
                            );
                        })}
                    </div>
                ) : (
                    /* Expanded View */
                    <>
                        <div className="flex gap-2 items-center flex-wrap mb-4">
                            <div className="relative w-full sm:w-52">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="SEARCH..."
                                    className="w-full bg-black border border-border pl-10 pr-8 py-2 font-mono-tech text-sm uppercase text-white placeholder:text-muted-foreground focus:border-secondary focus:outline-none"
                                />
                                {search && (
                                    <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <X className="w-4 h-4 text-muted-foreground hover:text-white" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-1 mb-4">
                            {([
                                { mode: 'list' as const, icon: List, label: 'List' },
                                { mode: 'card' as const, icon: Square, label: 'Card' },
                            ] as const).map(({ mode, icon: Icon, label }) => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono-tech uppercase tracking-wider transition-all ${
                                        viewMode === mode ? 'bg-secondary text-black' : 'bg-black border border-border text-muted-foreground hover:text-white'
                                    }`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {label}
                                </button>
                            ))}
                        </div>

                        <div className={gridClass}>
                            {filteredGear.map(weapon => {
                                const variant = resolveVariant(weapon.factionVariants, campaign.factionId);
                                const cantAfford = campaign.ebBank < variant.cost;
                                const owned = stashCountOf(weapon.id);

                                if (viewMode === 'card') {
                                    return (
                                        <div key={weapon.id} className={`${cantAfford ? 'opacity-35' : ''} transition-all relative group/card`} style={cardStyle}>
                                            <WeaponCard weapon={weapon} variant={variant} />
                                            {!cantAfford && (
                                                <button
                                                    onClick={() => handleBuy(weapon.id, variant.factionId, variant.cost)}
                                                    className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 opacity-0 group-hover/card:opacity-100 transition-opacity font-display font-bold text-xs uppercase tracking-wider bg-secondary text-black px-3 py-1 clip-corner-br flex items-center gap-1 shadow-lg shadow-secondary/30"
                                                >
                                                    <Plus className="w-3.5 h-3.5" /> {variant.cost === 0 ? 'Free' : `${variant.cost} EB`}
                                                </button>
                                            )}
                                            {owned > 0 && (
                                                <div className="text-right mt-0.5">
                                                    <span className="font-mono-tech text-[9px] text-muted-foreground uppercase">x{owned} owned</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                }

                                return (
                                    <div key={weapon.id} className={`${cantAfford ? 'opacity-35' : ''} transition-all`}>
                                        <WeaponTile
                                            weapon={weapon}
                                            variantFactionId={campaign.factionId}
                                            campaignStreetCred={campaignStreetCred}
                                            equippedCount={owned}
                                            overlay={
                                                <button
                                                    disabled={cantAfford}
                                                    onClick={() => handleBuy(weapon.id, variant.factionId, variant.cost)}
                                                    className={`absolute inset-0 z-20 flex items-end justify-end p-2 ${
                                                        cantAfford ? 'cursor-not-allowed' : 'cursor-pointer opacity-0 hover:opacity-100 bg-gradient-to-l from-black/80 via-transparent to-transparent'
                                                    } transition-opacity`}
                                                >
                                                    {!cantAfford ? (
                                                        <span className="font-display font-bold text-xs uppercase tracking-wider bg-secondary text-black px-3 py-1 clip-corner-br flex items-center gap-1 shadow-lg shadow-secondary/30">
                                                            <Plus className="w-3.5 h-3.5" /> {variant.cost === 0 ? 'Free' : `${variant.cost} EB`}
                                                        </span>
                                                    ) : (
                                                        <span className="font-mono-tech text-[10px] text-accent uppercase font-bold bg-black/80 px-2 py-0.5 border border-accent/50">
                                                            {variant.cost} EB
                                                        </span>
                                                    )}
                                                </button>
                                            }
                                        />
                                        {owned > 0 && (
                                            <div className="text-right mt-0.5">
                                                <span className="font-mono-tech text-[9px] text-muted-foreground uppercase">x{owned} owned</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            {filteredGear.length === 0 && (
                                <div className="col-span-full text-center py-8 text-muted-foreground font-mono-tech text-xs uppercase tracking-widest">No equipment found.</div>
                            )}
                        </div>
                    </>
                )}
            </section>
        </div>
        <DragOverlay dropAnimation={null}>
            {renderDragOverlay()}
        </DragOverlay>
        </DndContext>
    );
}
