'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { useCardGrid } from '@/hooks/useCardGrid';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useCatalog } from '@/hooks/useCatalog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit, Trash2, Plus } from 'lucide-react';
import type { Objective, ObjectiveRewardType } from '@/types';

const FACTION_COLOR_MAP: Record<string, string> = {
    'faction-arasaka': 'border-red-600',
    'faction-bozos': 'border-purple-500',
    'faction-danger-gals': 'border-pink-400',
    'faction-edgerunners': 'border-emerald-500',
    'faction-gen-red': 'border-white',
    'faction-lawmen': 'border-blue-500',
    'faction-maelstrom': 'border-red-700',
    'faction-trauma-team': 'border-white',
    'faction-tyger-claws': 'border-cyan-400',
    'faction-zoners': 'border-orange-500',
    'faction-6th-street': 'border-amber-500',
    'faction-max-tac': 'border-indigo-400',
    'faction-militech': 'border-lime-500',
    'faction-piranhas': 'border-teal-400',
    'faction-wild-things': 'border-rose-500',
    'deck-corpo-crimes': 'border-red-500',
    'deck-public-enemies': 'border-violet-500',
    'deck-street-justice': 'border-yellow-500',
};

const FACTION_BG_MAP: Record<string, string> = {
    'faction-arasaka': 'bg-red-600',
    'faction-bozos': 'bg-purple-500',
    'faction-danger-gals': 'bg-pink-400',
    'faction-edgerunners': 'bg-emerald-500',
    'faction-gen-red': 'bg-white',
    'faction-lawmen': 'bg-blue-500',
    'faction-maelstrom': 'bg-red-700',
    'faction-trauma-team': 'bg-white',
    'faction-tyger-claws': 'bg-cyan-400',
    'faction-zoners': 'bg-orange-500',
    'faction-6th-street': 'bg-amber-500',
    'faction-max-tac': 'bg-indigo-400',
    'faction-militech': 'bg-lime-500',
    'faction-piranhas': 'bg-teal-400',
    'faction-wild-things': 'bg-rose-500',
    'deck-corpo-crimes': 'bg-red-500',
    'deck-public-enemies': 'bg-violet-500',
    'deck-street-justice': 'bg-yellow-500',
};

const FACTION_TEXT_MAP: Record<string, string> = {
    'faction-gen-red': 'text-black',
    'faction-trauma-team': 'text-black',
    'faction-danger-gals': 'text-black',
    'faction-tyger-claws': 'text-black',
    'faction-6th-street': 'text-black',
    'faction-militech': 'text-black',
    'faction-edgerunners': 'text-black',
    'faction-piranhas': 'text-black',
    'deck-street-justice': 'text-black',
};

const REWARD_BADGE: Record<ObjectiveRewardType, { label: string; cls: string; tooltip: string }> = {
    ongoing: { label: 'ONGOING', cls: 'bg-emerald-600 text-white', tooltip: 'This reward stays active for the rest of the game once the condition is met.' },
    recycle: { label: 'RECYCLE', cls: 'bg-amber-600 text-white', tooltip: 'After resolving, shuffle this card back into the deck. It can be drawn again.' },
    cybergear: { label: 'CYBERGEAR', cls: 'bg-cyan-600 text-white', tooltip: 'Completing this objective grants a permanent Cybergear upgrade to a model.' },
};

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

const isPlaceholder = (o: Objective) =>
    o.description === 'PLACEHOLDER' || o.rewardText === 'PLACEHOLDER';

const EMPTY_OBJECTIVE: Partial<Objective> = {
    name: '',
    factionId: '',
    description: '',
    rewardType: 'ongoing',
    rewardText: '',
    grantsStreetCred: true,
    grantsEB: undefined,
    grantsLuck: undefined,
    grantsCybergearTo: undefined,
    cybergearEffect: undefined,
};

interface ObjectiveCardProps {
    objective: Objective;
    isAdmin?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
}

function ObjectiveCard({ objective, isAdmin, onEdit, onDelete }: ObjectiveCardProps) {
    const { catalog } = useStore();
    const { cardStyle } = useCardGrid();

    const faction = catalog.factions.find(f => f.id === objective.factionId);
    const factionName = faction?.name ?? objective.factionId;
    const borderColor = FACTION_COLOR_MAP[objective.factionId] ?? 'border-gray-500';
    const bgColor = FACTION_BG_MAP[objective.factionId] ?? 'bg-gray-400';
    const textColor = FACTION_TEXT_MAP[objective.factionId] ?? (FACTION_BG_MAP[objective.factionId] ? 'text-white' : 'text-black');
    const badge = REWARD_BADGE[objective.rewardType];
    const placeholder = isPlaceholder(objective);

    return (
        <div
            style={cardStyle}
            className={`group relative bg-surface-dark border ${borderColor} h-[320px] overflow-hidden flex flex-col`}
        >
            {/* Admin buttons (top right overlay) */}
            {isAdmin && (onEdit || onDelete) && (
                <div className="absolute top-1 right-1 z-30 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onEdit && (
                        <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1.5 bg-black/70 border border-border rounded text-muted-foreground hover:text-secondary hover:border-secondary transition-colors">
                            <Edit className="w-3.5 h-3.5" />
                        </button>
                    )}
                    {onDelete && (
                        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 bg-black/70 border border-border rounded text-muted-foreground hover:text-accent hover:border-accent transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            )}

            {/* Faction icon background */}
            {faction?.imageUrl && (
                <img
                    src={faction.imageUrl}
                    alt=""
                    className="absolute inset-0 w-full h-full object-contain opacity-[0.10] pointer-events-none"
                />
            )}

            {/* Faction color bar */}
            <div className={`h-1 w-full ${bgColor} shrink-0 relative z-10`} />

            {/* Header */}
            <div className="px-3 pt-2 pb-1 shrink-0 relative z-10">
                <h3 className="font-display font-bold text-sm uppercase leading-tight text-white truncate">
                    {objective.name}
                </h3>
                <div className="flex items-center gap-2">
                    <span className={`text-[8px] font-mono-tech font-bold uppercase px-1.5 py-px rounded-sm ${bgColor} ${textColor}`}>
                        {factionName}
                    </span>
                    {placeholder && (
                        <span className="text-[8px] font-mono-tech font-bold uppercase px-1.5 py-px rounded-sm bg-orange-600 text-white">
                            INCOMPLETE
                        </span>
                    )}
                </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-3 pb-3 min-h-0 relative z-10">
                {/* Condition */}
                <div className="mb-2">
                    <div className="text-[9px] font-mono-tech text-muted-foreground uppercase tracking-widest mb-0.5">
                        Condition
                    </div>
                    <p className={`text-xs leading-relaxed ${placeholder ? 'text-orange-400/60 italic' : 'text-gray-300'}`}>
                        {placeholder ? 'Awaiting close-up photo...' : objective.description}
                    </p>
                </div>

                {/* Divider */}
                <div className="border-t border-dashed border-border my-2" />

                {/* Reward */}
                <div className="mb-2">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[9px] font-mono-tech text-muted-foreground uppercase tracking-widest">
                            Reward
                        </span>
                        {!placeholder && (
                            <span className={`relative text-[8px] font-mono-tech font-bold uppercase px-1.5 py-px rounded-sm cursor-help group/tip ${badge.cls}`}>
                                {badge.label}
                                <span className="pointer-events-none absolute left-0 top-full mt-1 z-40 w-48 px-2 py-1.5 rounded bg-black/95 border border-border text-[10px] font-mono-tech font-normal normal-case tracking-normal text-gray-200 leading-snug opacity-0 group-hover/tip:opacity-100 transition-opacity">
                                    {badge.tooltip}
                                </span>
                            </span>
                        )}
                    </div>
                    <p className={`text-xs leading-relaxed ${placeholder ? 'text-orange-400/60 italic' : 'text-gray-300'}`}>
                        {placeholder ? 'Awaiting close-up photo...' : objective.rewardText}
                    </p>
                </div>

                {/* Bonus chips */}
                {!placeholder && (objective.grantsStreetCred || objective.grantsEB || objective.grantsLuck) && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                        {objective.grantsStreetCred && (
                            <span className="text-[9px] font-mono-tech font-bold bg-yellow-900/50 text-secondary px-1.5 py-0.5 rounded-sm">
                                Street Cred ★
                            </span>
                        )}
                        {objective.grantsEB != null && objective.grantsEB > 0 && (
                            <span className="text-[9px] font-mono-tech font-bold bg-green-900/50 text-cyber-green px-1.5 py-0.5 rounded-sm">
                                +{objective.grantsEB} EB
                            </span>
                        )}
                        {objective.grantsLuck != null && objective.grantsLuck > 0 && (
                            <span className="text-[9px] font-mono-tech font-bold bg-cyan-900/50 text-cyan-400 px-1.5 py-0.5 rounded-sm">
                                +{objective.grantsLuck} LUCK
                            </span>
                        )}
                    </div>
                )}

                {/* Cybergear block */}
                {!placeholder && objective.rewardType === 'cybergear' && objective.cybergearEffect && (
                    <div className="border-l-2 border-cyan-500 pl-2 py-1 bg-cyan-950/30 rounded-r-sm">
                        {objective.grantsCybergearTo && (
                            <div className="text-[9px] font-mono-tech text-cyan-400 uppercase tracking-wider mb-0.5">
                                Cybergear &rarr; {objective.grantsCybergearTo}
                            </div>
                        )}
                        <p className="text-[11px] text-cyan-200 leading-relaxed">
                            {objective.cybergearEffect}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

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
            grantsStreetCred: objectiveForm.grantsStreetCred ?? true,
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
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={objectiveForm.grantsStreetCred ?? false}
                                    onChange={(e) => updateForm({ grantsStreetCred: e.target.checked })}
                                    className="accent-secondary"
                                />
                                <label className="text-[10px] font-mono-tech text-muted-foreground uppercase">Street Cred</label>
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
