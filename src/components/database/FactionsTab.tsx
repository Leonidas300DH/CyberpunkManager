'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Faction, ModelLineage } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ImageInput } from '@/components/ui/image-input';
import { CharacterCard } from '@/components/characters/CharacterCard';
import { FACTIONS } from '@/lib/seed';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Trash2, Edit, ChevronRight } from 'lucide-react';

// Per-faction signature colors (border + bg variants)
const FACTION_COLOR_MAP: Record<string, { border: string; bg: string }> = {
    'faction-arasaka':    { border: 'border-red-600',    bg: 'bg-red-600' },
    'faction-bozos':      { border: 'border-purple-500', bg: 'bg-purple-500' },
    'faction-danger-gals':{ border: 'border-pink-400',   bg: 'bg-pink-400' },
    'faction-edgerunners':{ border: 'border-emerald-500',bg: 'bg-emerald-500' },
    'faction-gen-red':    { border: 'border-white',      bg: 'bg-white' },
    'faction-lawmen':     { border: 'border-blue-500',   bg: 'bg-blue-500' },
    'faction-maelstrom':  { border: 'border-red-700',    bg: 'bg-red-700' },
    'faction-trauma-team':{ border: 'border-white',      bg: 'bg-white' },
    'faction-tyger-claws':{ border: 'border-cyan-400',   bg: 'bg-cyan-400' },
    'faction-zoners':     { border: 'border-orange-500', bg: 'bg-orange-500' },
};
const DEFAULT_FACTION_COLOR = { border: 'border-gray-500', bg: 'bg-gray-500' };

const TYPE_COLORS: Record<ModelLineage['type'], string> = {
    Leader: 'text-accent',
    Character: 'text-white',
    Gonk: 'text-cyber-green',
    Specialist: 'text-secondary',
    Drone: 'text-cyber-orange',
};

// Base faction IDs that cannot be deleted
const BASE_FACTION_IDS = new Set(FACTIONS.map(f => f.id));

export function FactionsTab() {
    const { catalog, setCatalog } = useStore();
    const [isOpen, setIsOpen] = useState(false);
    const [editingFaction, setEditingFaction] = useState<Faction | null>(null);
    const [formData, setFormData] = useState<Partial<Faction>>({});
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<ModelLineage['type'] | 'all'>('all');
    const [viewMode, setViewMode] = useState<'list' | 'card'>('card');
    const [selectedCard, setSelectedCard] = useState<string | null>(null);

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
        setCatalog({ ...catalog, factions: newFactions });
        setIsOpen(false);
        setEditingFaction(null);
        setFormData({});
    };

    const handleDelete = (id: string) => {
        if (BASE_FACTION_IDS.has(id)) return;
        const newFactions = catalog.factions.filter(f => f.id !== id);
        setCatalog({ ...catalog, factions: newFactions });
    };

    const openEdit = (faction: Faction) => {
        setEditingFaction(faction);
        setFormData(faction);
        setIsOpen(true);
    };

    const filteredFactions = catalog.factions
        .filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name));

    const getLineagesForFaction = (factionId: string) =>
        catalog.lineages.filter(l => l.factionId === factionId);

    const getProfilesForLineage = (lineageId: string) =>
        catalog.profiles.filter(p => p.lineageId === lineageId).sort((a, b) => a.level - b.level);

    const filterLineages = (lineages: ModelLineage[]) =>
        lineages.filter(l => {
            const matchSearch = l.name.toLowerCase().includes(search.toLowerCase());
            const matchType = typeFilter === 'all' || l.type === typeFilter;
            return matchSearch && matchType;
        });

    // Collect unique types
    const allTypes = Array.from(new Set(catalog.lineages.map(l => l.type)));

    return (
        <div className="space-y-6">
            {/* Search, Filters & Actions Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-surface-dark/50 p-4 border border-border">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="SEARCH UNITS..."
                    className="bg-black border border-border px-4 py-2 font-mono-tech text-sm uppercase text-white placeholder:text-muted-foreground focus:border-secondary focus:outline-none w-full md:w-64"
                />
                <div className="flex gap-2 font-mono-tech text-xs flex-wrap items-center">
                    <button
                        onClick={() => setTypeFilter('all')}
                        className={`px-4 py-2 font-bold uppercase tracking-wider transition-colors ${
                            typeFilter === 'all' ? 'bg-primary text-black' : 'border border-border text-muted-foreground hover:border-secondary hover:text-secondary'
                        }`}
                    >
                        All Types
                    </button>
                    {allTypes.map(type => (
                        <button
                            key={type}
                            onClick={() => setTypeFilter(type)}
                            className={`px-4 py-2 font-bold uppercase tracking-wider transition-colors ${
                                typeFilter === type ? 'bg-secondary text-black' : 'border border-border text-muted-foreground hover:border-secondary hover:text-secondary'
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                    <div className="w-px h-6 bg-border mx-1" />
                    <button
                        onClick={() => setViewMode(v => v === 'list' ? 'card' : 'list')}
                        className={`px-4 py-2 font-bold uppercase tracking-wider transition-colors border border-border ${
                            viewMode === 'card' ? 'bg-accent text-white border-accent' : 'text-muted-foreground hover:border-secondary hover:text-secondary'
                        }`}
                    >
                        {viewMode === 'card' ? 'Cards' : 'List'}
                    </button>
                    <div className="w-px h-6 bg-border mx-1" />
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <button
                                onClick={() => { setEditingFaction(null); setFormData({}); }}
                                className="bg-primary hover:bg-white text-black font-display font-bold uppercase tracking-wider px-4 py-2 clip-corner-br transition-colors flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Faction
                            </button>
                        </DialogTrigger>
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
            </div>

            {/* Faction Accordion Rows */}
            <div className="space-y-0">
                {filteredFactions.length === 0 && (
                    <div className="border border-dashed border-border p-8 text-center text-muted-foreground font-mono-tech uppercase text-xs tracking-widest">
                        No factions found. Add factions to build your database.
                    </div>
                )}

                {filteredFactions.map((faction) => {
                    const factionColor = FACTION_COLOR_MAP[faction.id] ?? DEFAULT_FACTION_COLOR;
                    const lineages = getLineagesForFaction(faction.id);
                    const filtered = filterLineages(lineages);
                    const isExpanded = expandedId === faction.id;
                    const abbr = faction.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                    const isBase = BASE_FACTION_IDS.has(faction.id);

                    if (filtered.length === 0 && (search || typeFilter !== 'all')) return null;

                    return (
                        <div key={faction.id} className={`group ${!isExpanded ? 'opacity-90 hover:opacity-100' : ''} transition-opacity`}>
                            {/* Faction Row */}
                            <button
                                onClick={() => setExpandedId(isExpanded ? null : faction.id)}
                                className={`w-full bg-surface-dark hover:bg-tech-gray border-l-4 ${factionColor.border} px-4 py-0 flex items-center justify-between transition-all duration-300 clip-corner-br`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`h-32 w-32 md:h-40 md:w-40 ${factionColor.bg} flex items-center justify-center text-black font-bold font-display text-4xl overflow-hidden shrink-0`}>
                                        {faction.imageUrl ? (
                                            <img src={faction.imageUrl} className="w-full h-full object-cover" />
                                        ) : (
                                            abbr
                                        )}
                                    </div>
                                    <div className="text-left">
                                        <h2 className="text-2xl font-display font-bold uppercase text-white tracking-wide group-hover:text-primary transition-colors">
                                            {faction.name}
                                        </h2>
                                        {faction.description && (
                                            <p className="text-sm font-body text-white/70 mt-1 line-clamp-2">
                                                {faction.description}
                                            </p>
                                        )}
                                        <span className="text-xs font-mono-tech text-muted-foreground">
                                            {filtered.length} unit{filtered.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); openEdit(faction); }}
                                        className="p-1 text-muted-foreground hover:text-secondary transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    {!isBase && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(faction.id); }}
                                            className="p-1 text-muted-foreground hover:text-accent transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                    <ChevronRight className={`w-6 h-6 text-muted-foreground transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                                </div>
                            </button>

                            {/* Expanded Panel */}
                            <div
                                className="grid transition-all duration-500 ease-in-out"
                                style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
                            >
                                <div className="overflow-hidden">
                                <div className="border-l border-r border-b border-border bg-black/80 p-6">
                                    {filtered.length === 0 ? (
                                        <div className="text-center text-muted-foreground font-mono-tech text-xs uppercase tracking-widest py-6">
                                            No units registered for this faction.
                                        </div>
                                    ) : viewMode === 'card' ? (
                                        /* ── Card View ── */
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                            {filtered.map(lineage => {
                                                const profiles = getProfilesForLineage(lineage.id);
                                                return profiles.map(profile => (
                                                    <div key={profile.id} className="w-full max-w-[240px]">
                                                        <CharacterCard lineage={lineage} profile={profile} />
                                                        {profiles.length > 1 && (
                                                            <div className="text-center mt-1">
                                                                <span className="font-mono-tech text-[10px] text-muted-foreground uppercase">
                                                                    {profile.level === 0 ? 'Base' : `Rank ${profile.level}`}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ));
                                            })}
                                        </div>
                                    ) : (
                                        /* ── List View (ProgramCard-inspired) ── */
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                            {filtered.map(lineage => {
                                                const profiles = getProfilesForLineage(lineage.id);
                                                const baseProfile = profiles[0];
                                                if (!baseProfile) return null;
                                                const isSelected = selectedCard === lineage.id;

                                                return (
                                                    <div key={lineage.id} className="w-full max-w-[240px]">
                                                        <button
                                                            onClick={() => setSelectedCard(isSelected ? null : lineage.id)}
                                                            className="relative w-full aspect-[3/2] overflow-hidden border border-border hover:border-secondary transition-all group/tile rounded-sm"
                                                        >
                                                            {/* Background image */}
                                                            {lineage.imageUrl ? (
                                                                <img
                                                                    src={lineage.imageUrl}
                                                                    alt={lineage.name}
                                                                    className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover/tile:opacity-60 transition-opacity"
                                                                />
                                                            ) : (
                                                                <div className="absolute inset-0 bg-surface-dark" />
                                                            )}
                                                            {/* Gradient overlay */}
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                                            {/* Scanline */}
                                                            <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.06)_2px,rgba(0,0,0,0.06)_4px)] pointer-events-none" />

                                                            {/* Name + keyword + cost top-left */}
                                                            <div className="absolute top-1.5 left-2 z-10 text-left">
                                                                <div className="font-display font-bold text-sm text-white uppercase tracking-wide leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                                                                    {lineage.name}
                                                                </div>
                                                                {baseProfile.keywords[0] && (
                                                                    <div className="font-mono-tech text-[9px] text-white/60 uppercase tracking-wider mt-0.5">
                                                                        {baseProfile.keywords[0]}
                                                                    </div>
                                                                )}
                                                                <div className="font-mono-tech text-[10px] font-black text-primary mt-0.5">
                                                                    ED {baseProfile.costEB}
                                                                </div>
                                                            </div>
                                                        </button>

                                                        {/* Expanded full CharacterCard */}
                                                        {isSelected && (
                                                            <div className="mt-2 space-y-2">
                                                                {profiles.map(profile => (
                                                                    <div key={profile.id} className="w-full max-w-[240px]">
                                                                        <CharacterCard lineage={lineage} profile={profile} />
                                                                        {profiles.length > 1 && (
                                                                            <div className="text-center mt-1">
                                                                                <span className="font-mono-tech text-[10px] text-muted-foreground uppercase">
                                                                                    {profile.level === 0 ? 'Base' : `Rank ${profile.level}`}
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
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
