'use client';

import { useState } from 'react';
import { Campaign, HackingProgram } from '@/types';
import { useStore } from '@/store/useStore';
import { parseStashEntry } from '@/lib/variants';
import { Plus, Search, X, Trash2, List, Square, Columns2, ChevronDown } from 'lucide-react';
import { ProgramCard } from '@/components/programs/ProgramCard';
import { ProgramTile, QUALITY_COLORS } from '@/components/shared/ProgramTile';
import { CardPreviewTooltip } from '@/components/ui/CardPreviewTooltip';
import { useCardGrid } from '@/hooks/useCardGrid';

interface ProgramVaultListProps {
    campaign: Campaign;
}

type ViewMode = 'list' | 'card' | 'double';

const CAPSULE = "inline-flex items-center gap-1 text-[11px] font-mono-tech px-2.5 py-0.5 bg-black border rounded-full text-white hover:brightness-125 transition-all cursor-default";

export function ProgramVaultList({ campaign }: ProgramVaultListProps) {
    const { catalog, updateCampaign } = useStore();
    const { gridClass, cardStyle } = useCardGrid();
    const [search, setSearch] = useState('');
    const [qualityFilter, setQualityFilter] = useState<'all' | 'Green' | 'Yellow' | 'Red'>('all');
    const [viewMode, setViewMode] = useState<ViewMode>('card');
    const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

    const toggleSection = (key: string) => {
        setExpandedSections(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key); else next.add(key);
            return next;
        });
    };

    const toggleFlip = (id: string) => {
        setFlippedCards(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const getFactionName = (factionId: string) => {
        if (factionId === 'all') return 'All';
        return catalog.factions.find(f => f.id === factionId)?.name ?? 'Unknown';
    };

    // ── Parse owned programs from stash ──
    const stashPrograms: Array<{ program: HackingProgram; stashIdx: number }> = [];
    campaign.hqStash.forEach((entry, idx) => {
        const { itemId } = parseStashEntry(entry);
        const program = catalog.programs.find(p => p.id === itemId);
        if (program) stashPrograms.push({ program, stashIdx: idx });
    });

    // ── Group owned for capsule ──
    const ownedGroups = new Map<string, { program: HackingProgram; indices: number[] }>();
    stashPrograms.forEach(({ program, stashIdx }) => {
        const existing = ownedGroups.get(program.id);
        if (existing) existing.indices.push(stashIdx);
        else ownedGroups.set(program.id, { program, indices: [stashIdx] });
    });

    // ── Sell handler ──
    const handleRemove = (stashIdx: number) => {
        const entry = campaign.hqStash[stashIdx];
        const { itemId } = parseStashEntry(entry);
        const program = catalog.programs.find(p => p.id === itemId);
        const refund = program?.costEB ?? 0;
        const newStash = [...campaign.hqStash];
        newStash.splice(stashIdx, 1);
        updateCampaign(campaign.id, { hqStash: newStash, ebBank: campaign.ebBank + refund });
    };

    // ── Buy handler ──
    const handleBuy = (programId: string, cost: number) => {
        if (campaign.ebBank < cost) return;
        updateCampaign(campaign.id, {
            hqStash: [...campaign.hqStash, programId],
            ebBank: campaign.ebBank - cost,
        });
    };

    // ── Available catalog programs (filtered, faction-restricted) ──
    const filteredPrograms = catalog.programs.filter(p => {
        if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
        if (qualityFilter !== 'all' && p.quality !== qualityFilter) return false;
        if (p.factionId !== 'all' && p.factionId !== campaign.factionId) return false;
        return true;
    });

    const stashCountOf = (id: string) => campaign.hqStash.filter(s => parseStashEntry(s).itemId === id).length;

    return (
        <div className="space-y-10">
            {/* ═══ SECTION 1 — YOUR PROGRAMS ═══ */}
            <section>
                <button
                    onClick={() => toggleSection('owned')}
                    className="flex items-center gap-2 mb-4 group/collapse w-full text-left"
                >
                    <ChevronDown className={`w-5 h-5 text-cyber-purple transition-transform ${!expandedSections.has('owned') ? '-rotate-90' : ''}`} />
                    <div className="border-l-2 border-cyber-purple pl-3">
                        <h3 className="font-display text-xl font-bold uppercase tracking-wider text-white group-hover/collapse:text-cyber-purple transition-colors">Your Programs</h3>
                        <span className="text-xs font-mono-tech text-muted-foreground uppercase tracking-widest">
                            {stashPrograms.length} program{stashPrograms.length !== 1 ? 's' : ''} stored
                        </span>
                    </div>
                </button>

                {stashPrograms.length === 0 ? (
                    <div className="border-2 border-dashed border-border bg-black/50 p-12 text-center clip-corner-tl-br">
                        <h3 className="text-xl font-display font-bold uppercase text-muted-foreground mb-2">Vault Empty</h3>
                        <p className="text-xs font-mono-tech text-muted-foreground uppercase tracking-widest">Acquire programs from the catalog below.</p>
                    </div>
                ) : !expandedSections.has('owned') ? (
                    /* Capsule View */
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {Array.from(ownedGroups.values()).map(({ program, indices }) => (
                            <CardPreviewTooltip
                                key={program.id}
                                renderCard={() => <ProgramCard program={program} side="front" />}
                            >
                                <span className={`${CAPSULE} border-cyber-purple`}>
                                    <span>{indices.length > 1 ? `${indices.length}× ` : ''}{program.name} · {program.costEB}EB</span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleRemove(indices[indices.length - 1]); }}
                                        className="ml-0.5 hover:text-accent transition-colors"
                                        title={`Sell — refund ${program.costEB} EB`}
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            </CardPreviewTooltip>
                        ))}
                    </div>
                ) : (
                    /* Expanded View */
                    <div>
                        <div className="font-mono-tech text-[10px] uppercase tracking-widest text-cyber-purple font-bold border-b border-border pb-1 mb-2">
                            Netrunning Programs — {stashPrograms.length} program{stashPrograms.length !== 1 ? 's' : ''}
                        </div>
                        <div className={gridClass}>
                            {stashPrograms.map(({ program, stashIdx }) => (
                                <div key={`owned-prog-${stashIdx}`} className="relative group/card" style={cardStyle}>
                                    <div
                                        className="card-flip-container w-full cursor-pointer"
                                        onClick={() => toggleFlip(`owned-${stashIdx}`)}
                                    >
                                        <div className={`card-flip-inner ${flippedCards.has(`owned-${stashIdx}`) ? 'flipped' : ''}`}>
                                            <div className="card-flip-front">
                                                <ProgramCard program={program} side="front" />
                                            </div>
                                            <div className="card-flip-back">
                                                <ProgramCard program={program} side="back" />
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleRemove(stashIdx); }}
                                        className="absolute top-1 right-1 z-30 p-1.5 bg-black/80 border border-border text-muted-foreground hover:text-accent hover:border-accent transition-colors opacity-0 group-hover/card:opacity-100"
                                        title={`Sell — refund ${program.costEB} EB`}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            <div className="border-t border-border" />

            {/* ═══ SECTION 2 — AVAILABLE PROGRAMS ═══ */}
            <section>
                <button
                    onClick={() => toggleSection('available')}
                    className="flex items-center gap-2 mb-4 group/collapse w-full text-left"
                >
                    <ChevronDown className={`w-5 h-5 text-cyber-purple transition-transform ${!expandedSections.has('available') ? '-rotate-90' : ''}`} />
                    <div className="border-l-2 border-cyber-purple pl-3">
                        <h3 className="font-display text-xl font-bold uppercase tracking-wider text-white group-hover/collapse:text-cyber-purple transition-colors">Available Programs</h3>
                        <span className="text-xs font-mono-tech text-muted-foreground uppercase tracking-widest">
                            {filteredPrograms.length} program{filteredPrograms.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </button>

                {!expandedSections.has('available') ? (
                    /* Capsule View */
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {filteredPrograms.length === 0 ? (
                            <div className="w-full text-center py-8 text-muted-foreground font-mono-tech text-xs uppercase tracking-widest">No programs available.</div>
                        ) : filteredPrograms.map(program => {
                            const cantAfford = campaign.ebBank < program.costEB;
                            const owned = stashCountOf(program.id);
                            return (
                                <CardPreviewTooltip
                                    key={program.id}
                                    renderCard={() => <ProgramCard program={program} side="front" />}
                                >
                                    <span className={`${CAPSULE} border-cyber-purple ${cantAfford ? 'opacity-35' : ''}`}>
                                        <span>{program.name}</span>
                                        <span className="text-muted-foreground">·</span>
                                        <span className={cantAfford ? 'text-accent' : ''}>{program.costEB}EB</span>
                                        {owned > 0 && <span className="text-muted-foreground text-[9px]">×{owned}</span>}
                                        {!cantAfford && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleBuy(program.id, program.costEB); }}
                                                className="ml-0.5 hover:text-cyber-purple transition-colors"
                                                title={`Buy — ${program.costEB} EB`}
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        )}
                                    </span>
                                </CardPreviewTooltip>
                            );
                        })}
                    </div>
                ) : (
                    /* Expanded View */
                    <>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                            <div className="flex gap-2 items-center flex-wrap">
                                <div className="relative w-full sm:w-52">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="SEARCH..."
                                        className="w-full bg-black border border-border pl-10 pr-8 py-2 font-mono-tech text-sm uppercase text-white placeholder:text-muted-foreground focus:border-purple-400 focus:outline-none"
                                    />
                                    {search && (
                                        <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <X className="w-4 h-4 text-muted-foreground hover:text-white" />
                                        </button>
                                    )}
                                </div>
                                <div className="flex gap-1 font-mono-tech text-xs">
                                    {(['all', 'Green', 'Yellow', 'Red'] as const).map(q => (
                                        <button
                                            key={q}
                                            onClick={() => setQualityFilter(q)}
                                            className={`px-3 py-2 font-bold uppercase tracking-wider transition-colors ${
                                                qualityFilter === q
                                                    ? q === 'all' ? 'bg-cyber-purple text-white' : `${QUALITY_COLORS[q].bg} ${QUALITY_COLORS[q].text}`
                                                    : 'border border-border text-muted-foreground hover:border-purple-400 hover:text-purple-400'
                                            }`}
                                        >
                                            {q === 'all' ? 'All' : q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-1 mb-4">
                            {([
                                { mode: 'list' as ViewMode, icon: List, label: 'Liste' },
                                { mode: 'card' as ViewMode, icon: Square, label: 'Carte' },
                                { mode: 'double' as ViewMode, icon: Columns2, label: 'Double' },
                            ]).map(({ mode, icon: Icon, label }) => (
                                <button
                                    key={mode}
                                    onClick={() => { setViewMode(mode); setFlippedCards(new Set()); }}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono-tech uppercase tracking-wider transition-all ${
                                        viewMode === mode ? 'bg-cyber-purple text-white' : 'bg-black border border-border text-muted-foreground hover:text-white'
                                    }`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* === LIST VIEW === */}
                        {viewMode === 'list' && (
                            <div className={gridClass}>
                                {filteredPrograms.map(program => {
                                    const cantAfford = campaign.ebBank < program.costEB;
                                    const owned = stashCountOf(program.id);
                                    return (
                                        <div key={program.id} className={`${cantAfford ? 'opacity-35' : ''} transition-all`} style={cardStyle}>
                                            <ProgramTile
                                                program={program}
                                                factionName={getFactionName(program.factionId)}
                                                overlay={
                                                    <button
                                                        disabled={cantAfford}
                                                        onClick={() => handleBuy(program.id, program.costEB)}
                                                        className={`absolute inset-0 z-20 flex items-end justify-end p-2 ${
                                                            cantAfford ? 'cursor-not-allowed' : 'cursor-pointer opacity-0 hover:opacity-100 bg-gradient-to-l from-black/80 via-transparent to-transparent'
                                                        } transition-opacity`}
                                                    >
                                                        {!cantAfford ? (
                                                            <span className="font-display font-bold text-xs uppercase tracking-wider bg-cyber-purple text-white px-3 py-1 clip-corner-br flex items-center gap-1 shadow-lg shadow-purple-500/30">
                                                                <Plus className="w-3.5 h-3.5" /> {program.costEB} EB
                                                            </span>
                                                        ) : (
                                                            <span className="font-mono-tech text-[10px] text-accent uppercase font-bold bg-black/80 px-2 py-0.5 border border-accent/50">
                                                                {program.costEB} EB
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
                            </div>
                        )}

                        {/* === CARD VIEW — front, click to flip === */}
                        {viewMode === 'card' && (
                            <div className={gridClass}>
                                {filteredPrograms.map(program => {
                                    const cantAfford = campaign.ebBank < program.costEB;
                                    const owned = stashCountOf(program.id);
                                    return (
                                        <div key={program.id} className={`${cantAfford ? 'opacity-35' : ''} transition-all`} style={cardStyle}>
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
                                                {!cantAfford && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleBuy(program.id, program.costEB); }}
                                                        className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 opacity-0 group-hover/card:opacity-100 transition-opacity font-display font-bold text-xs uppercase tracking-wider bg-cyber-purple text-white px-3 py-1 clip-corner-br flex items-center gap-1 shadow-lg shadow-purple-500/30"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" /> {program.costEB} EB
                                                    </button>
                                                )}
                                            </div>
                                            {owned > 0 && (
                                                <div className="text-right mt-0.5">
                                                    <span className="font-mono-tech text-[9px] text-muted-foreground uppercase">x{owned} owned</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* === DOUBLE VIEW — front + back side by side === */}
                        {viewMode === 'double' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {filteredPrograms.map(program => {
                                    const cantAfford = campaign.ebBank < program.costEB;
                                    const owned = stashCountOf(program.id);
                                    return (
                                        <div key={program.id} className={`${cantAfford ? 'opacity-35' : ''} transition-all`} style={cardStyle}>
                                            <div className="relative group/card">
                                                <div className="flex gap-3">
                                                    <div className="flex-1">
                                                        <ProgramCard program={program} side="front" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <ProgramCard program={program} side="back" />
                                                    </div>
                                                </div>
                                                {!cantAfford && (
                                                    <button
                                                        onClick={() => handleBuy(program.id, program.costEB)}
                                                        className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 opacity-0 group-hover/card:opacity-100 transition-opacity font-display font-bold text-xs uppercase tracking-wider bg-cyber-purple text-white px-3 py-1 clip-corner-br flex items-center gap-1 shadow-lg shadow-purple-500/30"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" /> {program.costEB} EB
                                                    </button>
                                                )}
                                            </div>
                                            {owned > 0 && (
                                                <div className="text-right mt-0.5">
                                                    <span className="font-mono-tech text-[9px] text-muted-foreground uppercase">x{owned} owned</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {filteredPrograms.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground font-mono-tech text-xs uppercase tracking-widest">No programs available.</div>
                        )}
                    </>
                )}
            </section>
        </div>
    );
}
