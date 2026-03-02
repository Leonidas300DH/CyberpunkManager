'use client';

import { useState, useMemo, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useCardGrid } from '@/hooks/useCardGrid';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useCatalog } from '@/hooks/useCatalog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// Plus removed — create triggered from parent toolbar
import type { Objective, ObjectiveRewardType } from '@/types';
import {
    ObjectiveCard,
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

export function ObjectivesContent({ highlightId, highlightKey, factionFilter = 'all', search = '', showOnlyIncomplete = false, triggerCreate = 0 }: { highlightId?: string; highlightKey?: number; factionFilter?: string; search?: string; showOnlyIncomplete?: boolean; triggerCreate?: number }) {
    const { catalog, setCatalog } = useStore();
    const { gridClass } = useCardGrid();
    const isAdmin = useIsAdmin();
    const { saveObjective: saveObjectiveDb, deleteObjective: deleteObjectiveDb } = useCatalog();

    // Highlight scroll-to effect
    useEffect(() => {
        if (!highlightId) return;
        const timer = setTimeout(() => {
            const el = document.querySelector(`[data-card-id="${highlightId}"]`) as HTMLElement;
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('highlight-flash');
                setTimeout(() => el.classList.remove('highlight-flash'), 2000);
            }
        }, 150);
        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [highlightId, highlightKey]);

    // Trigger create from parent toolbar
    useEffect(() => {
        if (triggerCreate > 0) openCreate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [triggerCreate]);

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingObjective, setEditingObjective] = useState<Objective | null>(null);
    const [objectiveForm, setObjectiveForm] = useState<Partial<Objective>>({ ...EMPTY_OBJECTIVE });

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
            {/* Count */}
            <div className="flex items-center justify-end mb-4">
                <span className="font-mono-tech text-xs text-muted-foreground uppercase tracking-widest">
                    <span className="text-cyber-green">{filteredObjectives.length}</span> / {catalog.objectives.length}
                </span>
            </div>

            {/* Grid */}
            <div className={gridClass}>
                {filteredObjectives.map(obj => (
                    <div key={obj.id} data-card-id={obj.id}>
                        <ObjectiveCard
                            objective={obj}
                            isAdmin={isAdmin}
                            onEdit={() => openEdit(obj)}
                            onDelete={() => handleDelete(obj.id)}
                        />
                    </div>
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
