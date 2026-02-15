'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { ModelLineage } from '@/types';
import { CharacterCard } from '@/components/characters/CharacterCard';

const TYPE_COLORS: Record<ModelLineage['type'], string> = {
    Leader: 'text-accent',
    Character: 'text-white',
    Gonk: 'text-cyber-green',
    Specialist: 'text-secondary',
    Drone: 'text-cyber-orange',
};

const FACTION_ICON_COLORS: Record<string, { bg: string; border: string; text: string }> = {
    'faction-arasaka':     { bg: 'bg-red-600',    border: 'border-red-600',    text: 'text-red-600' },
    'faction-bozos':       { bg: 'bg-purple-500', border: 'border-purple-500', text: 'text-purple-500' },
    'faction-danger-gals': { bg: 'bg-pink-400',   border: 'border-pink-400',   text: 'text-pink-400' },
    'faction-edgerunners': { bg: 'bg-emerald-500',border: 'border-emerald-500',text: 'text-emerald-500' },
    'faction-gen-red':     { bg: 'bg-white',      border: 'border-white',      text: 'text-white' },
    'faction-lawmen':      { bg: 'bg-blue-500',   border: 'border-blue-500',   text: 'text-blue-500' },
    'faction-maelstrom':   { bg: 'bg-red-700',    border: 'border-red-700',    text: 'text-red-700' },
    'faction-trauma-team': { bg: 'bg-white',      border: 'border-white',      text: 'text-white' },
    'faction-tyger-claws': { bg: 'bg-cyan-400',   border: 'border-cyan-400',   text: 'text-cyan-400' },
    'faction-zoners':      { bg: 'bg-orange-500', border: 'border-orange-500', text: 'text-orange-500' },
};
const DEFAULT_FACTION_ICON = { bg: 'bg-gray-500', border: 'border-gray-500', text: 'text-gray-500' };

export function ModelsTab() {
    const { catalog } = useStore();
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
        const matchFaction = factionFilter === 'all' || l.factionId === factionFilter;
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

                {/* Row 2: Faction filter icons */}
                <div className="flex gap-2 flex-wrap items-center">
                    <button
                        onClick={() => setFactionFilter('all')}
                        className={`px-3 py-1.5 font-mono-tech text-xs font-bold uppercase tracking-wider transition-colors ${
                            factionFilter === 'all' ? 'bg-primary text-black' : 'border border-border text-muted-foreground hover:border-secondary hover:text-secondary'
                        }`}
                    >
                        All Factions
                    </button>
                    {factions.map(faction => {
                        if (!faction) return null;
                        const colors = FACTION_ICON_COLORS[faction.id] ?? DEFAULT_FACTION_ICON;
                        const isActive = factionFilter === faction.id;
                        const abbr = faction.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

                        return (
                            <button
                                key={faction.id}
                                onClick={() => setFactionFilter(isActive ? 'all' : faction.id)}
                                className={`flex items-center gap-2 px-3 py-1.5 font-mono-tech text-xs font-bold uppercase tracking-wider transition-colors ${
                                    isActive
                                        ? `${colors.bg} text-black border ${colors.border}`
                                        : `border border-border text-muted-foreground hover:${colors.border} hover:${colors.text}`
                                }`}
                            >
                                {faction.imageUrl ? (
                                    <img src={faction.imageUrl} className="w-5 h-5 object-cover" />
                                ) : (
                                    <span className={`text-[10px] font-bold ${isActive ? 'text-black' : colors.text}`}>{abbr}</span>
                                )}
                                <span className="hidden sm:inline">{faction.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Flat Card Grid */}
            {filtered.length === 0 ? (
                <div className="border border-dashed border-border p-8 text-center text-muted-foreground font-mono-tech uppercase text-xs tracking-widest">
                    No units found.
                </div>
            ) : (
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
            )}
        </div>
    );
}
