'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { ModelLineage } from '@/types';
import { CharacterCard } from '@/components/characters/CharacterCard';
import { useCardGrid } from '@/hooks/useCardGrid';

const TYPE_COLORS: Record<ModelLineage['type'], string> = {
    Leader: 'text-accent',
    Character: 'text-white',
    Gonk: 'text-cyber-green',
    Specialist: 'text-secondary',
    Drone: 'text-cyber-orange',
};

const FACTION_COLOR_MAP: Record<string, string> = {
    'faction-arasaka':     'border-red-600',
    'faction-bozos':       'border-purple-500',
    'faction-danger-gals': 'border-pink-400',
    'faction-edgerunners': 'border-emerald-500',
    'faction-gen-red':     'border-white',
    'faction-lawmen':      'border-blue-500',
    'faction-maelstrom':   'border-red-700',
    'faction-trauma-team': 'border-white',
    'faction-tyger-claws': 'border-cyan-400',
    'faction-zoners':      'border-orange-500',
    'faction-6th-street':  'border-amber-500',
};

export function ModelsTab() {
    const { catalog } = useStore();
    const { gridClass, cardStyle } = useCardGrid();
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<ModelLineage['type'] | 'all'>('all');
    const [factionFilter, setFactionFilter] = useState<string | 'all'>('all');

    const getProfilesForLineage = (lineageId: string) =>
        catalog.profiles.filter(p => p.lineageId === lineageId).sort((a, b) => a.level - b.level);

    // Collect unique types
    const allTypes = Array.from(new Set(catalog.lineages.map(l => l.type)));

    // All factions sorted alphabetically
    const factions = [...catalog.factions].sort((a, b) => a.name.localeCompare(b.name));

    // Filtered lineages (flat, no panels)
    const filtered = catalog.lineages.filter(l => {
        const matchSearch = l.name.toLowerCase().includes(search.toLowerCase());
        const matchType = typeFilter === 'all' || l.type === typeFilter;
        const matchFaction = factionFilter === 'all' || l.factionIds.includes(factionFilter);
        return matchSearch && matchType && matchFaction;
    });

    return (
        <div className="space-y-6">
            {/* Search & Filters */}
            <div className="flex flex-col gap-4 bg-surface-dark/50 p-4 border border-border">
                {/* Row 1: Search + Type filters */}
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
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
                    </div>
                </div>

                {/* Row 2: Faction filter icons — same layout as Gear tab */}
                <div className="flex gap-2 items-stretch">
                    <button
                        onClick={() => setFactionFilter('all')}
                        className={`w-[80px] shrink-0 flex flex-col items-center justify-center gap-1 px-1 pb-1.5 rounded-sm border-2 transition-all ${
                            factionFilter === 'all'
                                ? 'border-white bg-white/10 ring-1 ring-white/30'
                                : 'border-border bg-black hover:border-white/30'
                        }`}
                    >
                        <div className="w-full aspect-square flex items-center justify-center">
                            <span className={`text-xl font-display font-bold ${factionFilter === 'all' ? 'text-white' : 'text-muted-foreground'}`}>★</span>
                        </div>
                        <span className={`text-[7px] font-mono-tech uppercase tracking-wider text-center leading-tight ${factionFilter === 'all' ? 'text-white font-bold' : 'text-muted-foreground'}`}>All</span>
                    </button>
                    <div className="w-px bg-border shrink-0" />
                    <div className="flex-1 overflow-x-auto min-w-0 no-scrollbar">
                        <div className="flex gap-2 w-max">
                            {factions.map(faction => {
                                const isActive = factionFilter === faction.id;
                                const fColor = FACTION_COLOR_MAP[faction.id] ?? 'border-gray-500';
                                return (
                                    <button
                                        key={faction.id}
                                        onClick={() => setFactionFilter(isActive ? 'all' : faction.id)}
                                        title={faction.name}
                                        className={`w-[80px] shrink-0 flex flex-col items-center justify-center gap-1 px-1 pb-1.5 rounded-sm border-2 transition-all ${
                                            isActive
                                                ? `${fColor} bg-white/10 ring-1 ring-white/30`
                                                : 'border-border bg-black hover:border-white/30'
                                        }`}
                                    >
                                        {faction.imageUrl && (
                                            <img src={faction.imageUrl} alt={faction.name} className="w-full aspect-square object-contain" style={{ opacity: isActive ? 1 : 0.4 }} />
                                        )}
                                        <span className={`text-[7px] font-mono-tech uppercase tracking-wider text-center leading-tight ${isActive ? 'text-white font-bold' : 'text-muted-foreground'}`}>{faction.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Flat Card Grid */}
            {filtered.length === 0 ? (
                <div className="border border-dashed border-border p-8 text-center text-muted-foreground font-mono-tech uppercase text-xs tracking-widest">
                    No units found.
                </div>
            ) : (
                <div className={gridClass}>
                    {filtered.map(lineage => {
                        const profiles = getProfilesForLineage(lineage.id);
                        return profiles.map(profile => (
                            <div key={profile.id} className="w-full" style={cardStyle}>
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
            )}
        </div>
    );
}
