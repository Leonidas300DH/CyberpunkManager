'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { useCardGrid } from '@/hooks/useCardGrid';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useCatalog } from '@/hooks/useCatalog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import type { Objective, ObjectiveRewardType } from '@/types';
import {
    ObjectiveCard,
    FACTION_COLOR_MAP,
    FACTION_BG_MAP,
    isPlaceholder,
} from '@/components/shared/ObjectiveCard';


const FACTION_SLUG: Record<string, string> = {
    'faction-6th-street': '6th',
    'faction-arasaka': 'ara',
    'faction-bozos': 'boz',
    'faction-danger-gals': 'dg',
    'faction-edgerunners': 'er',
    'faction-gen-red': 'gr',
    'faction-lawmen': 'law',
    'faction-maelstrom': 'mael',
    'faction-max-tac': 'mt',
    'faction-piranhas': 'pir',
    'faction-trauma-team': 'tt',
    'faction-tyger-claws': 'tc',
    'faction-wild-things': 'wt',
    'faction-zoners': 'zn',
    'faction-militech': 'mil',
    'deck-corpo-crimes': 'cc',
    'deck-public-enemies': 'pe',
    'deck-street-justice': 'sj',
};

function slugify(name: string): string {
    return name
        .toLowerCase()
        .replace(/[''""]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

const EMPTY_OBJECTIVE: Partial<Objective> = {
    name: '',
    factionId: '',
    description: '',
    rewardType: 'ongoing',
    rewardText: '',
    grantsStreetCred: 1,
    grantsEB: undefined,
    grantsLuck: undefined,
    grantsCybergearTo: undefined,
    cybergearEffect: undefined,
};

export function ObjectivesContent() {
    const { catalog, setCatalog } = useStore();
    const { gridClass } = useCardGrid();
    const isAdmin = useIsAdmin();
    const { saveObjective: saveObjectiveDb, deleteObjective: deleteObjectiveDb } = useCatalog();

    const [search, setSearch] = useState('');
    const [factionFilter, setFactionFilter] = useState<string>('all');
    const [showOnlyIncomplete, setShowOnlyIncomplete] = useState(false);

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingObjective, setEditingObjective] = useState<Objective | null>(null);
    const [objectiveForm, setObjectiveForm] = useState<Partial<Objective>>({ ...EMPTY_OBJECTIVE });

    // Factions that have objectives
    const objectiveFactions = useMemo(() => {
        const fids = Array.from(new Set(catalog.objectives.map(o => o.factionId)));
        const factions = fids.filter(id => id.startsWith('faction-')).sort();
        const decks = fids.filter(id => id.startsWith('deck-')).sort();
        return [...factions, ...decks];
    }, [catalog.objectives]);

    // All possible factions for the select dropdown (factions + decks)
    const allFactionOptions = useMemo(() => {
        const factionIds = catalog.factions.map(f => f.id);
        const deckIds = ['deck-corpo-crimes', 'deck-public-enemies', 'deck-street-justice'];
        return [...factionIds.sort(), ...deckIds];
    }, [catalog.factions]);

    // Counts
    const incompleteCount = useMemo(
        () => catalog.objectives.filter(isPlaceholder).length,
        [catalog.objectives]
    );

    // Filter
    const filteredObjectives = useMemo(() => {
        let list = catalog.objectives;

        if (showOnlyIncomplete) {
            list = list.filter(isPlaceholder);
        }

        if (factionFilter !== 'all') {
            list = list.filter(o => o.factionId === factionFilter);
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(o =>
                o.name.toLowerCase().includes(q) ||
                o.description.toLowerCase().includes(q) ||
                o.rewardText.toLowerCase().includes(q)
            );
        }

        return list;
    }, [catalog.objectives, factionFilter, search, showOnlyIncomplete]);

    // --- Handlers ---

    const openEdit = (objective: Objective) => {
        setEditingObjective(objective);
        setObjectiveForm({ ...objective });
        setDialogOpen(true);
    };

    const openCreate = () => {
        setEditingObjective(null);
        setObjectiveForm({ ...EMPTY_OBJECTIVE, factionId: factionFilter !== 'all' ? factionFilter : '' });
        setDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        const obj = catalog.objectives.find(o => o.id === id);
        if (!obj || !window.confirm(`Delete "${obj.name}"? This cannot be undone.`)) return;
        const updated = catalog.objectives.filter(o => o.id !== id);
        setCatalog({ ...catalog, objectives: updated });
        deleteObjectiveDb(id);
    };

    const handleSave = () => {
        if (!objectiveForm.name?.trim() || !objectiveForm.factionId) return;

        const fSlug = FACTION_SLUG[objectiveForm.factionId!] ?? objectiveForm.factionId!;
        const newId = `obj-${fSlug}-${slugify(objectiveForm.name!)}`;

        const savedObjective: Objective = {
            id: newId,
            name: objectiveForm.name!.trim(),
            factionId: objectiveForm.factionId!,
            description: objectiveForm.description?.trim() || 'PLACEHOLDER',
            rewardType: objectiveForm.rewardType || 'ongoing',
            rewardText: objectiveForm.rewardText?.trim() || 'PLACEHOLDER',
            grantsStreetCred: objectiveForm.grantsStreetCred ?? 1,
            grantsEB: objectiveForm.grantsEB || undefined,
            grantsLuck: objectiveForm.grantsLuck || undefined,
            grantsCybergearTo: objectiveForm.rewardType === 'cybergear' ? objectiveForm.grantsCybergearTo?.trim() || undefined : undefined,
            cybergearEffect: objectiveForm.rewardType === 'cybergear' ? objectiveForm.cybergearEffect?.trim() || undefined : undefined,
        };

        let updatedObjectives: Objective[];

        if (editingObjective) {
            // If ID changed (name or faction changed), remove old
            if (editingObjective.id !== newId) {
                updatedObjectives = catalog.objectives.filter(o => o.id !== editingObjective.id);
                updatedObjectives.push(savedObjective);
                deleteObjectiveDb(editingObjective.id);
            } else {
                updatedObjectives = catalog.objectives.map(o =>
                    o.id === editingObjective.id ? savedObjective : o
                );
            }
        } else {
            updatedObjectives = [...catalog.objectives, savedObjective];
        }

        setCatalog({ ...catalog, objectives: updatedObjectives });
        saveObjectiveDb(savedObjective);
        setDialogOpen(false);
        setEditingObjective(null);
        setObjectiveForm({ ...EMPTY_OBJECTIVE });
    };

    const updateForm = (patch: Partial<Objective>) => {
        setObjectiveForm(prev => ({ ...prev, ...patch }));
    };

    const getFactionLabel = (fid: string) => {
        const f = catalog.factions.find(fc => fc.id === fid);
        if (f) return f.name;
        if (fid === 'deck-corpo-crimes') return 'Corpo Crimes';
        if (fid === 'deck-public-enemies') return 'Public Enemies';
        if (fid === 'deck-street-justice') return 'Street Justice';
        return fid;
    };

    return (
        <>
            {/* Search + count */}
            <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1 max-w-md">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search objectives..."
                        className="w-full bg-black border border-border px-4 py-2 font-mono-tech text-sm text-white placeholder:text-muted-foreground focus:border-cyber-green focus:outline-none"
                    />
                </div>
                {isAdmin && (
                    <button
                        onClick={openCreate}
                        className="shrink-0 flex items-center gap-1.5 px-3 py-2 border border-border bg-black text-muted-foreground hover:border-secondary hover:text-secondary rounded-sm font-mono-tech text-xs uppercase tracking-wider transition-all"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        New
                    </button>
                )}
                {incompleteCount > 0 && (
                    <button
                        onClick={() => setShowOnlyIncomplete(v => !v)}
                        className={`shrink-0 flex items-center gap-2 px-3 py-2 border rounded-sm font-mono-tech text-xs uppercase tracking-wider transition-all ${
                            showOnlyIncomplete
                                ? 'border-orange-500 bg-orange-600/20 text-orange-400'
                                : 'border-border bg-black text-muted-foreground hover:border-orange-500/50'
                        }`}
                    >
                        <span className="text-[10px]">{showOnlyIncomplete ? '●' : '○'}</span>
                        Incomplete
                        <span className={`text-[10px] font-bold ${showOnlyIncomplete ? 'text-orange-300' : 'text-orange-500'}`}>
                            {incompleteCount}
                        </span>
                    </button>
                )}
                <span className="font-mono-tech text-xs text-muted-foreground uppercase tracking-widest ml-auto hidden md:block">
                    <span className="text-cyber-green">{filteredObjectives.length}</span> / {catalog.objectives.length}
                </span>
            </div>

            {/* Faction filter bar */}
            {objectiveFactions.length > 0 && (
                <div className="flex gap-2 items-stretch mb-6">
                    {/* All button */}
                    <button
                        onClick={() => setFactionFilter('all')}
                        className={`w-[80px] shrink-0 flex flex-col items-center justify-center gap-1 px-1 pb-1.5 rounded-sm border-2 transition-all ${
                            factionFilter === 'all'
                                ? 'border-white bg-white/10 ring-1 ring-white/30'
                                : 'border-border bg-black hover:border-white/30'
                        }`}
                    >
                        <div className="w-full aspect-square flex items-center justify-center">
                            <span className={`text-xl font-display font-bold ${factionFilter === 'all' ? 'text-white' : 'text-muted-foreground'}`}>
                                ★
                            </span>
                        </div>
                        <span className={`text-[7px] font-mono-tech uppercase tracking-wider text-center leading-tight ${
                            factionFilter === 'all' ? 'text-white font-bold' : 'text-muted-foreground'
                        }`}>
                            All
                        </span>
                    </button>

                    <div className="w-px bg-border shrink-0" />

                    <div className="flex-1 overflow-x-auto min-w-0 no-scrollbar">
                        <div className="flex gap-2 w-max">
                            {objectiveFactions.map(fid => {
                                const isActive = factionFilter === fid;
                                const faction = catalog.factions.find(f => f.id === fid);
                                const fColor = FACTION_COLOR_MAP[fid] ?? 'border-gray-500';
                                const label = faction?.name ?? fid;
                                return (
                                    <button
                                        key={fid}
                                        onClick={() => setFactionFilter(fid)}
                                        title={label}
                                        className={`w-[80px] shrink-0 flex flex-col items-center justify-center gap-1 px-1 pb-1.5 rounded-sm border-2 transition-all ${
                                            isActive
                                                ? `${fColor} bg-white/10 ring-1 ring-white/30`
                                                : 'border-border bg-black hover:border-white/30'
                                        }`}
                                    >
                                        {faction?.imageUrl && (
                                            <img
                                                src={faction.imageUrl}
                                                alt={label}
                                                className="w-full aspect-square object-contain"
                                                style={{ opacity: isActive ? 1 : 0.4 }}
                                            />
                                        )}
                                        <span className={`text-[7px] font-mono-tech uppercase tracking-wider text-center leading-tight ${
                                            isActive ? 'text-white font-bold' : 'text-muted-foreground'
                                        }`}>
                                            {label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Grid */}
            <div className={gridClass}>
                {filteredObjectives.map(obj => (
                    <ObjectiveCard
                        key={obj.id}
                        objective={obj}
                        isAdmin={isAdmin}
                        onEdit={() => openEdit(obj)}
                        onDelete={() => handleDelete(obj.id)}
                    />
                ))}
            </div>

            {filteredObjectives.length === 0 && (
                <div className="border-2 border-dashed border-border bg-black/50 p-12 text-center clip-corner-tl-br">
                    <h3 className="text-xl font-display font-bold uppercase text-muted-foreground mb-2">No Objectives Found</h3>
                    <p className="text-xs font-mono-tech text-muted-foreground uppercase tracking-widest">Database query returned zero results.</p>
                </div>
            )}

            {/* Edit / Create Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="bg-surface-dark border-border max-w-sm max-h-[85vh] overflow-y-auto !top-[8vh] !translate-y-0">
                    <DialogHeader>
                        <DialogTitle className="font-display uppercase tracking-wider text-primary">
                            {editingObjective ? 'Edit Objective' : 'New Objective'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col gap-3 mt-2">
                        {/* Name */}
                        <div>
                            <label className="text-[10px] font-mono-tech text-muted-foreground uppercase tracking-widest mb-1 block">Name</label>
                            <input
                                type="text"
                                value={objectiveForm.name ?? ''}
                                onChange={(e) => updateForm({ name: e.target.value })}
                                className="w-full bg-black border border-border px-3 py-1.5 font-mono-tech text-sm text-white focus:border-cyber-green focus:outline-none"
                            />
                        </div>

                        {/* Faction */}
                        <div>
                            <label className="text-[10px] font-mono-tech text-muted-foreground uppercase tracking-widest mb-1 block">Faction</label>
                            <select
                                value={objectiveForm.factionId ?? ''}
                                onChange={(e) => updateForm({ factionId: e.target.value })}
                                className="w-full bg-black border border-border px-3 py-1.5 font-mono-tech text-sm text-white focus:border-cyber-green focus:outline-none"
                            >
                                <option value="">Select...</option>
                                {allFactionOptions.map(fid => (
                                    <option key={fid} value={fid}>{getFactionLabel(fid)}</option>
                                ))}
                            </select>
                        </div>

                        {/* Description (Condition) */}
                        <div>
                            <label className="text-[10px] font-mono-tech text-muted-foreground uppercase tracking-widest mb-1 block">Condition</label>
                            <textarea
                                value={objectiveForm.description ?? ''}
                                onChange={(e) => updateForm({ description: e.target.value })}
                                rows={3}
                                className="w-full bg-black border border-border px-3 py-1.5 font-mono-tech text-sm text-white focus:border-cyber-green focus:outline-none resize-y"
                            />
                        </div>

                        {/* Reward Type */}
                        <div>
                            <label className="text-[10px] font-mono-tech text-muted-foreground uppercase tracking-widest mb-1 block">Reward Type</label>
                            <select
                                value={objectiveForm.rewardType ?? 'ongoing'}
                                onChange={(e) => updateForm({ rewardType: e.target.value as ObjectiveRewardType })}
                                className="w-full bg-black border border-border px-3 py-1.5 font-mono-tech text-sm text-white focus:border-cyber-green focus:outline-none"
                            >
                                <option value="ongoing">Ongoing</option>
                                <option value="recycle">Recycle</option>
                                <option value="cybergear">Cybergear</option>
                                <option value="immediate">Immediate</option>
                            </select>
                        </div>

                        {/* Reward Text */}
                        <div>
                            <label className="text-[10px] font-mono-tech text-muted-foreground uppercase tracking-widest mb-1 block">Reward Text</label>
                            <textarea
                                value={objectiveForm.rewardText ?? ''}
                                onChange={(e) => updateForm({ rewardText: e.target.value })}
                                rows={3}
                                className="w-full bg-black border border-border px-3 py-1.5 font-mono-tech text-sm text-white focus:border-cyber-green focus:outline-none resize-y"
                            />
                        </div>

                        {/* Grants row */}
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <label className="text-[10px] font-mono-tech text-muted-foreground uppercase tracking-widest mb-1 block">Street Cred ★</label>
                                <input
                                    type="number"
                                    value={objectiveForm.grantsStreetCred ?? 0}
                                    onChange={(e) => updateForm({ grantsStreetCred: Number(e.target.value) || 0 })}
                                    className="w-full bg-black border border-border px-2 py-1 font-mono-tech text-sm text-white focus:border-cyber-green focus:outline-none"
                                    min={0}
                                    max={2}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-mono-tech text-muted-foreground uppercase tracking-widest mb-1 block">EB</label>
                                <input
                                    type="number"
                                    value={objectiveForm.grantsEB ?? ''}
                                    onChange={(e) => updateForm({ grantsEB: e.target.value ? Number(e.target.value) : undefined })}
                                    className="w-full bg-black border border-border px-2 py-1 font-mono-tech text-sm text-white focus:border-cyber-green focus:outline-none"
                                    min={0}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-mono-tech text-muted-foreground uppercase tracking-widest mb-1 block">Luck</label>
                                <input
                                    type="number"
                                    value={objectiveForm.grantsLuck ?? ''}
                                    onChange={(e) => updateForm({ grantsLuck: e.target.value ? Number(e.target.value) : undefined })}
                                    className="w-full bg-black border border-border px-2 py-1 font-mono-tech text-sm text-white focus:border-cyber-green focus:outline-none"
                                    min={0}
                                />
                            </div>
                        </div>

                        {/* Cybergear fields (only if rewardType = cybergear) */}
                        {objectiveForm.rewardType === 'cybergear' && (
                            <>
                                <div>
                                    <label className="text-[10px] font-mono-tech text-muted-foreground uppercase tracking-widest mb-1 block">Cybergear To</label>
                                    <input
                                        type="text"
                                        value={objectiveForm.grantsCybergearTo ?? ''}
                                        onChange={(e) => updateForm({ grantsCybergearTo: e.target.value })}
                                        placeholder="e.g. Leader"
                                        className="w-full bg-black border border-border px-3 py-1.5 font-mono-tech text-sm text-white placeholder:text-muted-foreground focus:border-cyber-green focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-mono-tech text-muted-foreground uppercase tracking-widest mb-1 block">Cybergear Effect</label>
                                    <textarea
                                        value={objectiveForm.cybergearEffect ?? ''}
                                        onChange={(e) => updateForm({ cybergearEffect: e.target.value })}
                                        rows={2}
                                        className="w-full bg-black border border-border px-3 py-1.5 font-mono-tech text-sm text-white focus:border-cyber-green focus:outline-none resize-y"
                                    />
                                </div>
                            </>
                        )}

                        {/* Save button */}
                        <button
                            onClick={handleSave}
                            disabled={!objectiveForm.name?.trim() || !objectiveForm.factionId}
                            className="w-full py-2 font-mono-tech text-sm font-bold uppercase tracking-wider bg-secondary text-black hover:bg-secondary/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            {editingObjective ? 'Save Changes' : 'Create Objective'}
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
