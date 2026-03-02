'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { Faction, ModelLineage, Weapon, HackingProgram, Objective } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ImageInput } from '@/components/ui/image-input';
import { CardPreviewTooltip } from '@/components/ui/CardPreviewTooltip';
import { CharacterCard } from '@/components/characters/CharacterCard';
import { WeaponCard } from '@/components/weapons/WeaponCard';
import { ProgramCard } from '@/components/programs/ProgramCard';
import { ObjectiveCard } from '@/components/shared/ObjectiveCard';
import { resolveVariant } from '@/lib/variants';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Trash2, Edit, ChevronRight } from 'lucide-react';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useCatalog } from '@/hooks/useCatalog';

// Per-faction signature colors (border + bg + text variants)
const FACTION_COLOR_MAP: Record<string, { border: string; bg: string; text: string }> = {
    'faction-arasaka':    { border: 'border-red-600',    bg: 'bg-red-600',    text: 'text-red-600' },
    'faction-bozos':      { border: 'border-purple-500', bg: 'bg-purple-500', text: 'text-purple-500' },
    'faction-danger-gals':{ border: 'border-pink-400',   bg: 'bg-pink-400',   text: 'text-pink-400' },
    'faction-edgerunners':{ border: 'border-emerald-500',bg: 'bg-emerald-500',text: 'text-emerald-500' },
    'faction-gen-red':    { border: 'border-white',      bg: 'bg-white',      text: 'text-white' },
    'faction-lawmen':     { border: 'border-blue-500',   bg: 'bg-blue-500',   text: 'text-blue-500' },
    'faction-maelstrom':  { border: 'border-red-700',    bg: 'bg-red-700',    text: 'text-red-700' },
    'faction-trauma-team':{ border: 'border-white',      bg: 'bg-white',      text: 'text-white' },
    'faction-tyger-claws':{ border: 'border-cyan-400',   bg: 'bg-cyan-400',   text: 'text-cyan-400' },
    'faction-zoners':     { border: 'border-orange-500', bg: 'bg-orange-500', text: 'text-orange-500' },
    'faction-6th-street': { border: 'border-amber-500',  bg: 'bg-amber-500',  text: 'text-amber-500' },
    'faction-max-tac':    { border: 'border-indigo-400', bg: 'bg-indigo-400', text: 'text-indigo-400' },
    'faction-militech':   { border: 'border-lime-500',   bg: 'bg-lime-500',   text: 'text-lime-500' },
    'faction-piranhas':   { border: 'border-teal-400',   bg: 'bg-teal-400',   text: 'text-teal-400' },
    'faction-wild-things':{ border: 'border-rose-500',   bg: 'bg-rose-500',   text: 'text-rose-500' },
};
const DEFAULT_FACTION_COLOR = { border: 'border-gray-500', bg: 'bg-gray-500', text: 'text-gray-500' };

const TYPE_COLORS: Record<ModelLineage['type'], string> = {
    Leader: 'text-accent',
    Character: 'text-white',
    Gonk: 'text-cyber-green',
    Specialist: 'text-secondary',
    Drone: 'text-cyber-orange',
};

const TYPE_ORDER: ModelLineage['type'][] = ['Leader', 'Character', 'Specialist', 'Gonk', 'Drone'];
const TYPE_LABEL: Record<ModelLineage['type'], string> = {
    Leader: 'Leaders',
    Character: 'Characters',
    Gonk: 'Gonks',
    Specialist: 'Specialists',
    Drone: 'Drones',
};

// Base faction IDs that cannot be deleted (hardcoded for safety)
const BASE_FACTION_IDS = new Set([
    'faction-arasaka', 'faction-bozos', 'faction-danger-gals', 'faction-edgerunners',
    'faction-gen-red', 'faction-lawmen', 'faction-maelstrom', 'faction-trauma-team',
    'faction-tyger-claws', 'faction-zoners', 'faction-6th-street',
    'faction-piranhas', 'faction-wild-things',
]);

const QUALITY_BG: Record<string, string> = {
    Red: 'bg-accent',
    Yellow: 'bg-primary',
    Green: 'bg-cyber-green',
};

/* ─── Section Header ─── */

function SectionHeader({ title, count, colorClass }: { title: string; count: number; colorClass: string }) {
    return (
        <div className={`font-display font-bold text-sm uppercase tracking-wider ${colorClass} mb-1`}>
            {title} <span className="text-white/50">{count}</span>
        </div>
    );
}

/* ─── Main Component ─── */

export function FactionsTab({ onNavigateToCard }: { onNavigateToCard?: (tab: string, itemId: string, factionId?: string) => void }) {
    const { catalog, setCatalog } = useStore();
    const isAdmin = useIsAdmin();
    const { saveFaction: saveFactionDb, deleteFaction: deleteFactionDb } = useCatalog();
    const [isOpen, setIsOpen] = useState(false);
    const [editingFaction, setEditingFaction] = useState<Faction | null>(null);
    const [formData, setFormData] = useState<Partial<Faction>>({});
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const handleSave = () => {
        const newFactions = [...catalog.factions];
        if (editingFaction) {
            const index = newFactions.findIndex(f => f.id === editingFaction.id);
            if (index !== -1) {
                newFactions[index] = { ...editingFaction, ...formData } as Faction;
            }
        } else {
            const newFaction: Faction = {
                id: uuidv4(),
                name: formData.name || 'New Faction',
                imageUrl: formData.imageUrl,
            };
            newFactions.push(newFaction);
        }
        const savedFaction = editingFaction
            ? { ...editingFaction, ...formData } as Faction
            : newFactions[newFactions.length - 1];
        setCatalog({ ...catalog, factions: newFactions });
        if (isAdmin) saveFactionDb(savedFaction);
        setIsOpen(false);
        setEditingFaction(null);
        setFormData({});
    };

    const handleDelete = (id: string) => {
        if (BASE_FACTION_IDS.has(id)) return;
        const newFactions = catalog.factions.filter(f => f.id !== id);
        setCatalog({ ...catalog, factions: newFactions });
        if (isAdmin) deleteFactionDb(id);
    };

    const openEdit = (faction: Faction) => {
        setEditingFaction(faction);
        setFormData(faction);
        setIsOpen(true);
    };

    const filteredFactions = catalog.factions
        .filter(f => f.id.startsWith('faction-'))
        .filter(f => {
            const q = search.toLowerCase();
            return f.name.toLowerCase().includes(q) || (f.description?.toLowerCase().includes(q) ?? false);
        })
        .sort((a, b) => a.name.localeCompare(b.name));

    // Faction name lookup for allied labels
    const factionNames = useMemo(() => {
        const map: Record<string, string> = {};
        for (const f of catalog.factions) map[f.id] = f.name;
        return map;
    }, [catalog.factions]);

    // Pre-compute faction data
    type CharEntry = { lineageId: string; name: string; type: ModelLineage['type']; profileCount: number; primaryFactionId: string };
    const factionData = useMemo(() => {
        const result: Record<string, {
            lineages: ModelLineage[];
            native: CharEntry[];
            allied: CharEntry[];
            weapons: Weapon[];
            gears: Weapon[];
            programs: HackingProgram[];
            objectives: Objective[];
        }> = {};

        for (const faction of catalog.factions) {
            const fid = faction.id;
            const lineages = catalog.lineages.filter(l => l.factionIds.includes(fid));
            const native: CharEntry[] = [];
            const allied: CharEntry[] = [];
            for (const l of lineages) {
                const entry: CharEntry = {
                    lineageId: l.id,
                    name: l.name,
                    type: l.type,
                    profileCount: catalog.profiles.filter(p => p.lineageId === l.id).length,
                    primaryFactionId: l.factionIds[0],
                };
                if (l.factionIds[0] === fid) {
                    native.push(entry);
                } else {
                    allied.push(entry);
                }
            }
            const weapons = catalog.weapons.filter(w =>
                w.isWeapon && !w.isAction && w.factionVariants.some(v => v.factionId === fid)
            );
            const gears = catalog.weapons.filter(w =>
                w.isGear && !w.isAction && w.factionVariants.some(v => v.factionId === fid)
            );
            const programs = catalog.programs.filter(p => p.factionId === fid);
            const objectives = catalog.objectives.filter(o => o.factionId === fid);

            result[fid] = { lineages, native, allied, weapons, gears, programs, objectives };
        }
        return result;
    }, [catalog]);

    return (
        <div className="space-y-6">
            {/* Top Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-surface-dark/50 p-4 border border-border">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="SEARCH FACTIONS..."
                        className="bg-black border border-border px-4 py-2 font-mono-tech text-sm uppercase text-white placeholder:text-muted-foreground focus:border-secondary focus:outline-none w-full md:w-64"
                    />
                    <span className="text-muted-foreground font-mono-tech text-xs uppercase tracking-widest whitespace-nowrap">
                        {filteredFactions.length} faction{filteredFactions.length !== 1 ? 's' : ''}
                    </span>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    {isAdmin && (
                        <DialogTrigger asChild>
                            <button
                                onClick={() => { setEditingFaction(null); setFormData({}); }}
                                className="bg-primary hover:bg-white text-black font-display font-bold uppercase tracking-wider px-4 py-2 clip-corner-br transition-colors flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Faction
                            </button>
                        </DialogTrigger>
                    )}
                    <DialogContent className="bg-surface-dark border-border">
                        <DialogHeader>
                            <DialogTitle className="font-display uppercase tracking-wider text-primary">
                                {editingFaction ? 'Edit Faction' : 'New Faction'}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label className="font-mono-tech text-xs uppercase tracking-widest">Name</Label>
                                <Input
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Faction Name"
                                    className="bg-black border-border font-mono-tech"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-mono-tech text-xs uppercase tracking-widest">Description</Label>
                                <Input
                                    value={formData.description || ''}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Short faction description"
                                    className="bg-black border-border font-mono-tech"
                                />
                            </div>
                            <ImageInput
                                value={formData.imageUrl || ''}
                                onChange={(val) => setFormData({ ...formData, imageUrl: val })}
                            />
                            <button
                                onClick={handleSave}
                                className="w-full bg-primary hover:bg-white text-black font-display font-bold uppercase tracking-wider py-3 clip-corner-br transition-colors"
                            >
                                Save
                            </button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Faction Panels */}
            <div className="space-y-3">
                {filteredFactions.length === 0 && (
                    <div className="border border-dashed border-border p-8 text-center text-muted-foreground font-mono-tech uppercase text-xs tracking-widest">
                        No factions found. Add factions to build your database.
                    </div>
                )}

                {filteredFactions.map((faction) => {
                    const factionColor = FACTION_COLOR_MAP[faction.id] ?? DEFAULT_FACTION_COLOR;
                    const data = factionData[faction.id];
                    const isExpanded = expandedId === faction.id;
                    const abbr = faction.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                    const isBase = BASE_FACTION_IDS.has(faction.id);

                    const native = data?.native ?? [];
                    const allied = data?.allied ?? [];
                    const allChars = [...native, ...allied];
                    const weapons = data?.weapons ?? [];
                    const gears = data?.gears ?? [];
                    const programs = data?.programs ?? [];
                    const objectives = data?.objectives ?? [];

                    // Group allied characters by source faction
                    const alliedByFaction = new Map<string, CharEntry[]>();
                    for (const c of allied) {
                        const arr = alliedByFaction.get(c.primaryFactionId) ?? [];
                        arr.push(c);
                        alliedByFaction.set(c.primaryFactionId, arr);
                    }

                    return (
                        <div key={faction.id} className="group">
                            {/* Header */}
                            <div
                                role="button"
                                tabIndex={0}
                                onClick={() => setExpandedId(isExpanded ? null : faction.id)}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedId(isExpanded ? null : faction.id); } }}
                                className={`w-full bg-surface-dark hover:bg-tech-gray border-l-4 ${factionColor.border} px-4 py-0 flex items-center justify-between transition-all duration-300 cursor-pointer`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`h-20 w-20 md:h-24 md:w-24 ${factionColor.bg} flex items-center justify-center text-black font-bold font-display text-2xl overflow-hidden shrink-0`}>
                                        {faction.imageUrl ? (
                                            <img src={faction.imageUrl} className="w-full h-full object-cover" alt={faction.name} />
                                        ) : (
                                            abbr
                                        )}
                                    </div>
                                    <div className="text-left">
                                        <h2 className="text-xl md:text-2xl font-display font-bold uppercase text-white tracking-wide group-hover:text-primary transition-colors">
                                            {faction.name}
                                        </h2>
                                        {faction.description && (
                                            <p className="text-sm font-body text-white/70 mt-0.5 line-clamp-1">
                                                {faction.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {isAdmin && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); openEdit(faction); }}
                                            className="p-1 text-muted-foreground hover:text-secondary transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                    )}
                                    {isAdmin && !isBase && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(faction.id); }}
                                            className="p-1 text-muted-foreground hover:text-accent transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                    <ChevronRight className={`w-6 h-6 text-muted-foreground transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                                </div>
                            </div>

                            {/* Expanded Detail */}
                            <div
                                className="grid transition-all duration-500 ease-in-out"
                                style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
                            >
                                <div className="overflow-hidden">
                                    <div className={`border-l-4 ${factionColor.border} border-b border-r border-border bg-black/80 p-5`}>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                            {/* Characters */}
                                            <div>
                                                <SectionHeader title="Gang Members" count={allChars.length} colorClass={factionColor.text} />
                                                <div className="space-y-2">
                                                    {TYPE_ORDER.map(type => {
                                                        const items = native.filter(c => c.type === type);
                                                        return (
                                                            <div key={type}>
                                                                <div className={`text-xs font-display font-bold uppercase tracking-wider mb-0.5 ${factionColor.text}`}>
                                                                    {TYPE_LABEL[type]}
                                                                </div>
                                                                {items.length === 0 ? (
                                                                    <span className="text-[10px] font-mono-tech text-muted-foreground italic">--</span>
                                                                ) : (
                                                                    <div className="flex flex-wrap gap-1.5">
                                                                        {items.map(c => {
                                                                            const lin = catalog.lineages.find(l => l.id === c.lineageId);
                                                                            const prof = catalog.profiles.find(p => p.lineageId === c.lineageId && (p.level ?? 0) === 0) ?? catalog.profiles.find(p => p.lineageId === c.lineageId);
                                                                            return (
                                                                                <CardPreviewTooltip key={c.lineageId} renderCard={() => lin && prof ? <CharacterCard lineage={lin} profile={prof} catalogWeapons={catalog.weapons} activeFactionId={faction.id} /> : <></>}>
                                                                                    <span
                                                                                        onClick={() => onNavigateToCard?.('models', c.lineageId)}
                                                                                        className={`text-[11px] font-mono-tech px-2.5 py-0.5 bg-black border ${factionColor.border} rounded-full text-white cursor-pointer hover:brightness-125 transition-all`}
                                                                                    >
                                                                                        {c.name}
                                                                                    </span>
                                                                                </CardPreviewTooltip>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                    {alliedByFaction.size > 0 && (
                                                        <div className="mt-2 pt-2 border-t border-border/50">
                                                            {Array.from(alliedByFaction.entries()).map(([srcFactionId, items]) => {
                                                                const srcColor = FACTION_COLOR_MAP[srcFactionId] ?? DEFAULT_FACTION_COLOR;
                                                                return (
                                                                    <div key={srcFactionId} className="mb-1.5">
                                                                        <div className={`text-[10px] font-mono-tech uppercase tracking-widest mb-0.5 ${srcColor.text}`}>
                                                                            {factionNames[srcFactionId] ?? 'Allied'}
                                                                        </div>
                                                                        <div className="flex flex-wrap gap-1.5">
                                                                            {items.map(c => {
                                                                                const lin = catalog.lineages.find(l => l.id === c.lineageId);
                                                                                const prof = catalog.profiles.find(p => p.lineageId === c.lineageId && (p.level ?? 0) === 0) ?? catalog.profiles.find(p => p.lineageId === c.lineageId);
                                                                                return (
                                                                                    <CardPreviewTooltip key={c.lineageId} renderCard={() => lin && prof ? <CharacterCard lineage={lin} profile={prof} catalogWeapons={catalog.weapons} activeFactionId={faction.id} /> : <></>}>
                                                                                        <span
                                                                                            onClick={() => onNavigateToCard?.('models', c.lineageId)}
                                                                                            className={`text-[11px] font-mono-tech px-2.5 py-0.5 bg-black border ${srcColor.border} rounded-full text-white/50 cursor-pointer hover:brightness-125 transition-all`}
                                                                                        >
                                                                                            {c.name}
                                                                                        </span>
                                                                                    </CardPreviewTooltip>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Weapons + Gears */}
                                            <div className="space-y-4">
                                                <div>
                                                    <SectionHeader title="Weapons" count={weapons.length} colorClass="text-accent" />
                                                    {weapons.length === 0 ? (
                                                        <span className="text-[10px] font-mono-tech text-muted-foreground italic">--</span>
                                                    ) : (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {weapons.map(w => (
                                                                <CardPreviewTooltip key={w.id} renderCard={() => <WeaponCard weapon={w} variant={resolveVariant(w.factionVariants, faction.id)} />}>
                                                                    <span
                                                                        onClick={() => onNavigateToCard?.('weapons', w.id, faction.id)}
                                                                        className="text-[11px] font-mono-tech px-2.5 py-0.5 bg-black border border-accent rounded-full text-white cursor-pointer hover:brightness-125 transition-all"
                                                                    >
                                                                        {w.name}
                                                                    </span>
                                                                </CardPreviewTooltip>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <SectionHeader title="Gears" count={gears.length} colorClass="text-secondary" />
                                                    {gears.length === 0 ? (
                                                        <span className="text-[10px] font-mono-tech text-muted-foreground italic">--</span>
                                                    ) : (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {gears.map(g => (
                                                                <CardPreviewTooltip key={g.id} renderCard={() => <WeaponCard weapon={g} variant={resolveVariant(g.factionVariants, faction.id)} />}>
                                                                    <span
                                                                        onClick={() => onNavigateToCard?.('gear', g.id, faction.id)}
                                                                        className="text-[11px] font-mono-tech px-2.5 py-0.5 bg-black border border-secondary rounded-full text-white cursor-pointer hover:brightness-125 transition-all"
                                                                    >
                                                                        {g.name}
                                                                    </span>
                                                                </CardPreviewTooltip>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Programs + Objectives */}
                                            <div className="space-y-4">
                                                <div>
                                                    <SectionHeader title="Programs" count={programs.length} colorClass="text-white" />
                                                    {programs.length === 0 ? (
                                                        <span className="text-[10px] font-mono-tech text-muted-foreground italic">--</span>
                                                    ) : (
                                                        <div className="space-y-1">
                                                            {(['Green', 'Yellow', 'Red'] as const).map(quality => {
                                                                const items = programs.filter(p => p.quality === quality);
                                                                return (
                                                                    <div key={quality}>
                                                                        <div className="flex flex-wrap gap-1.5">
                                                                            {items.map(p => (
                                                                                <CardPreviewTooltip key={p.id} renderCard={() => <ProgramCard program={p} side="front" />}>
                                                                                    <span
                                                                                        onClick={() => onNavigateToCard?.('programs', p.id)}
                                                                                        className={`text-[11px] font-mono-tech font-bold px-2.5 py-0.5 rounded-full ${QUALITY_BG[quality]} text-black cursor-pointer hover:brightness-125 transition-all`}
                                                                                    >
                                                                                        {p.name}
                                                                                    </span>
                                                                                </CardPreviewTooltip>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <SectionHeader title="Objectives" count={objectives.length} colorClass="text-cyber-green" />
                                                    {objectives.length === 0 ? (
                                                        <span className="text-[10px] font-mono-tech text-muted-foreground italic">--</span>
                                                    ) : (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {objectives.map(o => (
                                                                <CardPreviewTooltip key={o.id} renderCard={() => <ObjectiveCard objective={o} />}>
                                                                    <span
                                                                        onClick={() => onNavigateToCard?.('objectives', o.id)}
                                                                        className="text-[11px] font-mono-tech px-2.5 py-0.5 bg-black border border-cyber-green rounded-full text-white cursor-pointer hover:brightness-125 transition-all"
                                                                    >
                                                                        {o.name}
                                                                    </span>
                                                                </CardPreviewTooltip>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
