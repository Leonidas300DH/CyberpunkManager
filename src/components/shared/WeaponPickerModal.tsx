'use client';

import { useState, useMemo } from 'react';
import { Weapon, Faction } from '@/types';
import { WeaponTile } from '@/components/shared/WeaponTile';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search } from 'lucide-react';

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
    'faction-max-tac':     'border-indigo-400',
    'faction-militech':    'border-lime-500',
};

interface WeaponPickerModalProps {
    open: boolean;
    onClose: () => void;
    onSelect: (weapon: Weapon) => void;
    weapons: Weapon[];
    factions: Faction[];
    preFilterFactionId?: string;
}

export function WeaponPickerModal({ open, onClose, onSelect, weapons, factions, preFilterFactionId }: WeaponPickerModalProps) {
    const [search, setSearch] = useState('');
    const [factionFilter, setFactionFilter] = useState<string | 'all'>(preFilterFactionId || 'all');

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return weapons.filter(w => {
            const matchSearch = !q || w.name.toLowerCase().includes(q) || w.description.toLowerCase().includes(q);
            const matchFaction = factionFilter === 'all' || w.factionVariants.some(v => v.factionId === factionFilter || v.factionId === 'universal');
            return matchSearch && matchFaction;
        });
    }, [weapons, search, factionFilter]);

    const handleSelect = (weapon: Weapon) => {
        onSelect(weapon);
        onClose();
        setSearch('');
    };

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) { onClose(); setSearch(''); } }}>
            <DialogContent className="bg-surface-dark border-border max-w-md max-h-[85vh] overflow-y-auto !top-[8vh] !translate-y-0">
                <DialogHeader>
                    <DialogTitle className="font-display uppercase tracking-wider text-primary">
                        Link Weapon / Gear
                    </DialogTitle>
                </DialogHeader>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search weapons & gear..."
                        className="w-full bg-black border border-border pl-9 pr-3 py-2 font-mono-tech text-sm text-white placeholder:text-muted-foreground focus:border-secondary focus:outline-none"
                        autoFocus
                    />
                </div>

                {/* Faction filter */}
                <div className="flex gap-1.5 flex-wrap">
                    <button
                        onClick={() => setFactionFilter('all')}
                        className={`px-2 py-1 font-mono-tech text-[10px] uppercase border transition-colors ${
                            factionFilter === 'all' ? 'border-white bg-white/10 text-white' : 'border-border text-muted-foreground hover:border-white/30'
                        }`}
                    >
                        All
                    </button>
                    {factions.map(f => {
                        const active = factionFilter === f.id;
                        const fColor = FACTION_COLOR_MAP[f.id] ?? 'border-gray-500';
                        return (
                            <button
                                key={f.id}
                                onClick={() => setFactionFilter(active ? 'all' : f.id)}
                                className={`px-2 py-1 font-mono-tech text-[10px] uppercase border transition-colors ${
                                    active ? `${fColor} bg-white/10 text-white` : 'border-border text-muted-foreground hover:border-white/30'
                                }`}
                            >
                                {f.name}
                            </button>
                        );
                    })}
                </div>

                {/* Results */}
                <div className="flex flex-col gap-1 max-h-[50vh] overflow-y-auto">
                    {filtered.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground font-mono-tech text-xs uppercase tracking-widest">
                            No weapons found.
                        </div>
                    ) : (
                        filtered.map(weapon => (
                            <button
                                key={weapon.id}
                                onClick={() => handleSelect(weapon)}
                                className="text-left hover:ring-1 hover:ring-secondary transition-all"
                            >
                                <WeaponTile weapon={weapon} variantFactionId={factionFilter !== 'all' ? factionFilter : undefined} />
                            </button>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
