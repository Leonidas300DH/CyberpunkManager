'use client';

import { useState, useMemo, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Weapon, FactionVariant } from '@/types';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useCatalog } from '@/hooks/useCatalog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, Trash2, ChevronDown, ChevronRight } from 'lucide-react';

// ── Skill icons (same as CharacterCard) ──
const SKILL_ICONS: Record<string, { src: string; color: string }> = {
    Ranged:    { src: 'https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/app-images/skills/ranged.png',    color: '#9333ea' },
    Melee:     { src: 'https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/app-images/skills/melee.png',     color: '#a855f7' },
    Reflexes:  { src: 'https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/app-images/skills/reflexes.png',  color: '#d946ef' },
    Medical:   { src: 'https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/app-images/skills/medical.png',   color: '#ec4899' },
    Tech:      { src: 'https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/app-images/skills/tech.png',      color: '#8b5cf6' },
    Influence: { src: 'https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/app-images/skills/influence.png', color: '#c026d3' },
};

// ── Range arrows (same coordinates as CharacterCard) ──
const RA = {
    red:    '1,1 44,1 49,11 44,21 5,21',
    yellow: '52,1 95,1 100,11 95,21 52,21 57,11',
    green:  '103,1 145,1 150,11 145,21 103,21 108,11',
    long:   '153,1 218,1 223,11 218,21 153,21 158,11',
    plusCx: 188,
};

function RangeArrowsSmall({ rangeRed, rangeYellow, rangeGreen, rangeLong }: {
    rangeRed: boolean; rangeYellow: boolean; rangeGreen: boolean; rangeLong: boolean;
}) {
    if (!rangeRed && !rangeYellow && !rangeGreen && !rangeLong) return null;
    const OFF = 'rgba(100,100,100,0.35)';
    const OFF_STROKE = 'rgba(255,255,255,0.3)';
    const ON_STROKE = 'white';
    return (
        <svg viewBox="0 0 228 22" className="w-full h-auto" fill="none">
            <polygon points={RA.red}
                fill={rangeRed ? '#dc2626' : OFF}
                stroke={rangeRed ? ON_STROKE : OFF_STROKE} strokeWidth="1.5" strokeLinejoin="round"
                opacity={rangeRed ? 1 : 0.5} />
            <polygon points={RA.yellow}
                fill={rangeYellow ? '#eab308' : OFF}
                stroke={rangeYellow ? ON_STROKE : OFF_STROKE} strokeWidth="1.5" strokeLinejoin="round"
                opacity={rangeYellow ? 1 : 0.5} />
            <polygon points={RA.green}
                fill={rangeGreen ? '#22c55e' : OFF}
                stroke={rangeGreen ? ON_STROKE : OFF_STROKE} strokeWidth="1.5" strokeLinejoin="round"
                opacity={rangeGreen ? 1 : 0.5} />
            {rangeLong && (
                <>
                    <polygon points={RA.long}
                        fill="#111111" stroke={ON_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
                    <line x1={RA.plusCx} y1="8" x2={RA.plusCx} y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1={RA.plusCx - 3} y1="11" x2={RA.plusCx + 3} y2="11" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </>
            )}
        </svg>
    );
}

function slugify(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
}

const EMPTY_ACTION_FORM = {
    name: '',
    description: '',
    skillReq: undefined as Weapon['skillReq'],
    skillBonus: undefined as number | undefined,
    rangeRed: false,
    rangeYellow: false,
    rangeGreen: false,
    rangeLong: false,
};

export function ActionsContent({ search = '', triggerCreate = 0 }: { search?: string; triggerCreate?: number }) {
    const { catalog, setCatalog } = useStore();
    const isAdmin = useIsAdmin();
    const { saveWeapon, deleteWeapon: deleteWeaponDb } = useCatalog();

    const [editingAction, setEditingAction] = useState<Weapon | null>(null);
    const [actionForm, setActionForm] = useState(EMPTY_ACTION_FORM);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Filter actions from catalog
    const actions = useMemo(() => {
        if (!catalog) return [];
        return catalog.weapons
            .filter(w => w.isAction)
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [catalog]);

    const filteredActions = useMemo(() => {
        if (!search.trim()) return actions;
        const q = search.toLowerCase();
        return actions.filter(a =>
            a.name.toLowerCase().includes(q) ||
            a.description.toLowerCase().includes(q)
        );
    }, [actions, search]);

    // Build action → characters lookup
    const actionToCharacters = useMemo(() => {
        if (!catalog) return new Map<string, Array<{ lineageName: string; profileId: string }>>();
        const map = new Map<string, Array<{ lineageName: string; profileId: string }>>();
        for (const profile of catalog.profiles) {
            for (const action of profile.actions) {
                if (!action.weaponId) continue;
                if (!map.has(action.weaponId)) map.set(action.weaponId, []);
                const lineage = catalog.lineages.find(l => l.id === profile.lineageId);
                const entry = { lineageName: lineage?.name ?? profile.lineageId, profileId: profile.id };
                // Deduplicate by lineage name (multiple tiers of same lineage share the action)
                const list = map.get(action.weaponId)!;
                if (!list.some(e => e.lineageName === entry.lineageName)) {
                    list.push(entry);
                }
            }
        }
        return map;
    }, [catalog]);

    // Trigger create from parent toolbar
    useEffect(() => {
        if (triggerCreate > 0) openCreate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [triggerCreate]);

    // Open create dialog
    const openCreate = () => {
        setEditingAction(null);
        setActionForm(EMPTY_ACTION_FORM);
        setDialogOpen(true);
    };

    // Open edit dialog
    const openEdit = (action: Weapon) => {
        setEditingAction(action);
        setActionForm({
            name: action.name,
            description: action.description,
            skillReq: action.skillReq,
            skillBonus: action.skillBonus,
            rangeRed: action.rangeRed,
            rangeYellow: action.rangeYellow,
            rangeGreen: action.rangeGreen,
            rangeLong: action.rangeLong,
        });
        setDialogOpen(true);
    };

    // Delete action
    const handleDelete = (action: Weapon) => {
        if (!catalog) return;
        if (!confirm(`Delete action "${action.name}"?`)) return;
        const updatedWeapons = catalog.weapons.filter(w => w.id !== action.id);
        setCatalog({ ...catalog, weapons: updatedWeapons });
        deleteWeaponDb(action.id);
    };

    // Save action
    const handleSave = () => {
        if (!catalog) return;

        if (editingAction) {
            const updated: Weapon = {
                ...editingAction,
                name: actionForm.name || editingAction.name,
                description: actionForm.description ?? '',
                skillReq: actionForm.skillReq,
                skillBonus: actionForm.skillBonus,
                rangeRed: actionForm.rangeRed,
                rangeYellow: actionForm.rangeYellow,
                rangeGreen: actionForm.rangeGreen,
                rangeLong: actionForm.rangeLong,
            };
            const updatedWeapons = catalog.weapons.map(w => w.id === updated.id ? updated : w);
            setCatalog({ ...catalog, weapons: updatedWeapons });
            saveWeapon(updated);
        } else {
            const newAction: Weapon = {
                id: `action-${slugify(actionForm.name || 'unnamed')}`,
                name: actionForm.name || 'New Action',
                source: 'Manual',
                factionVariants: [{ factionId: 'universal', cost: 0, rarity: 99, reqStreetCred: 0 }] as FactionVariant[],
                isWeapon: false,
                isGear: false,
                isAction: true,
                skillReq: actionForm.skillReq,
                skillBonus: actionForm.skillBonus,
                rangeRed: actionForm.rangeRed,
                rangeYellow: actionForm.rangeYellow,
                rangeGreen: actionForm.rangeGreen,
                rangeLong: actionForm.rangeLong,
                description: actionForm.description ?? '',
                keywords: [],
            };
            const updatedWeapons = [...catalog.weapons, newAction];
            setCatalog({ ...catalog, weapons: updatedWeapons });
            saveWeapon(newAction);
        }

        setDialogOpen(false);
        setEditingAction(null);
    };

    if (!catalog) return null;

    return (
        <div>
            {/* Count */}
            <div className="flex items-center justify-end mb-4">
                <span className="font-mono-tech text-xs text-muted-foreground uppercase tracking-widest">
                    {filteredActions.length} actions
                </span>
            </div>

            {/* Actions Grid — card layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredActions.map(action => {
                    const hasSkill = !!(action.skillReq && SKILL_ICONS[action.skillReq]);
                    const hasRange = action.rangeRed || action.rangeYellow || action.rangeGreen || action.rangeLong;
                    const isPassive = !hasSkill && !hasRange;
                    const characters = actionToCharacters.get(action.id) ?? [];
                    const isExpanded = expandedId === action.id;

                    return (
                        <div
                            key={action.id}
                            className="group bg-surface-dark border border-border hover:border-emerald-500/50 transition-colors relative overflow-hidden"
                            style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                        >
                            {/* Top color bar */}
                            <div className={`h-1 w-full ${isPassive ? 'bg-emerald-500' : 'bg-secondary'}`} />

                            <div className="p-4">
                                {/* Header: name + admin buttons */}
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <h3 className="font-display font-black text-base text-emerald-400 uppercase tracking-wide leading-tight">
                                        {action.name}
                                    </h3>
                                    {isAdmin && (
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                            <button
                                                onClick={() => openEdit(action)}
                                                className="p-1 bg-black/70 border border-white/30 rounded hover:border-secondary transition-colors"
                                            >
                                                <Edit className="w-3 h-3 text-white" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(action)}
                                                className="p-1 bg-black/70 border border-white/30 rounded hover:border-accent transition-colors"
                                            >
                                                <Trash2 className="w-3 h-3 text-white" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Skill icon + range arrows row */}
                                {(hasSkill || hasRange) && (
                                    <div className="flex items-center gap-2 mb-2">
                                        {hasSkill && (
                                            <div className="flex items-center shrink-0">
                                                <img
                                                    src={SKILL_ICONS[action.skillReq!].src}
                                                    alt={action.skillReq!}
                                                    className="w-10 h-10 -my-[3px] object-contain"
                                                />
                                                {action.skillBonus != null && action.skillBonus !== 0 && (
                                                    <span className="font-display font-black text-xs text-white leading-none drop-shadow-[0_0_4px_rgba(0,0,0,0.9)] -ml-1">
                                                        {action.skillBonus > 0 ? `+${action.skillBonus}` : action.skillBonus}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        {hasRange && (
                                            <div className="flex-1 max-w-[180px]">
                                                <RangeArrowsSmall
                                                    rangeRed={action.rangeRed}
                                                    rangeYellow={action.rangeYellow}
                                                    rangeGreen={action.rangeGreen}
                                                    rangeLong={action.rangeLong}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Description */}
                                {action.description && (
                                    <p className="font-mono-tech text-xs text-muted-foreground leading-relaxed mb-3">
                                        {action.description}
                                    </p>
                                )}

                                {/* Used by characters — collapsible */}
                                {characters.length > 0 && (
                                    <div className="border-t border-border/50 pt-2 mt-auto">
                                        <button
                                            onClick={() => setExpandedId(isExpanded ? null : action.id)}
                                            className="flex items-center gap-1 w-full text-left"
                                        >
                                            {isExpanded
                                                ? <ChevronDown className="w-3 h-3 text-muted-foreground" />
                                                : <ChevronRight className="w-3 h-3 text-muted-foreground" />
                                            }
                                            <span className="font-mono-tech text-[10px] text-muted-foreground uppercase tracking-widest">
                                                Used by {characters.length} character{characters.length > 1 ? 's' : ''}
                                            </span>
                                        </button>
                                        {isExpanded && (
                                            <div className="mt-1.5 flex flex-wrap gap-1">
                                                {characters.map(c => (
                                                    <span
                                                        key={c.profileId}
                                                        className="px-2 py-0.5 bg-black/60 border border-border/40 font-mono-tech text-[10px] text-white/70 uppercase"
                                                    >
                                                        {c.lineageName}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ID badge */}
                                <span className="font-mono-tech text-[8px] text-white/15 mt-2 block">{action.id}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredActions.length === 0 && (
                <div className="border-2 border-dashed border-border rounded-lg p-12 text-center text-muted-foreground font-mono-tech text-sm uppercase tracking-widest">
                    {search ? 'No matching actions' : 'No actions in catalog'}
                </div>
            )}

            {/* Edit / Create Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="bg-surface-dark border-border text-white max-w-sm max-h-[85vh] overflow-y-auto !top-[8vh] !translate-y-0">
                    <DialogHeader>
                        <DialogTitle className="font-display uppercase tracking-wider">
                            {editingAction ? 'Edit Action' : 'New Action'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label className="font-mono-tech text-xs uppercase tracking-widest">Name</Label>
                            <Input
                                value={actionForm.name}
                                onChange={(e) => setActionForm({ ...actionForm, name: e.target.value })}
                                placeholder="Action name"
                                className="bg-black border-border font-mono-tech text-sm"
                            />
                        </div>

                        {/* Skill + Bonus */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label className="font-mono-tech text-xs uppercase tracking-widest">Skill</Label>
                                <select
                                    value={actionForm.skillReq ?? ''}
                                    onChange={(e) => setActionForm({ ...actionForm, skillReq: (e.target.value || undefined) as Weapon['skillReq'] })}
                                    className="w-full bg-black border border-border px-3 py-2 font-mono-tech text-sm text-white"
                                >
                                    <option value="">None (passive)</option>
                                    <option value="Ranged">Ranged</option>
                                    <option value="Melee">Melee</option>
                                    <option value="Reflexes">Reflexes</option>
                                    <option value="Medical">Medical</option>
                                    <option value="Tech">Tech</option>
                                    <option value="Influence">Influence</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label className="font-mono-tech text-xs uppercase tracking-widest">Skill Bonus</Label>
                                <Input
                                    type="number"
                                    value={actionForm.skillBonus ?? ''}
                                    onChange={(e) => setActionForm({ ...actionForm, skillBonus: e.target.value ? Number(e.target.value) : undefined })}
                                    placeholder="0"
                                    className="bg-black border-border font-mono-tech text-sm"
                                />
                            </div>
                        </div>

                        {/* Range */}
                        <div className="space-y-2">
                            <Label className="font-mono-tech text-xs uppercase tracking-widest">Range</Label>
                            <div className="flex gap-4">
                                {(['rangeRed', 'rangeYellow', 'rangeGreen', 'rangeLong'] as const).map(key => (
                                    <label key={key} className="flex items-center gap-1.5 font-mono-tech text-xs">
                                        <input
                                            type="checkbox"
                                            checked={actionForm[key]}
                                            onChange={(e) => setActionForm({ ...actionForm, [key]: e.target.checked })}
                                            className="accent-emerald-500"
                                        />
                                        {key.replace('range', '')}
                                    </label>
                                ))}
                            </div>
                            {/* Preview */}
                            {(actionForm.rangeRed || actionForm.rangeYellow || actionForm.rangeGreen || actionForm.rangeLong) && (
                                <div className="w-48 mt-1">
                                    <RangeArrowsSmall
                                        rangeRed={actionForm.rangeRed}
                                        rangeYellow={actionForm.rangeYellow}
                                        rangeGreen={actionForm.rangeGreen}
                                        rangeLong={actionForm.rangeLong}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label className="font-mono-tech text-xs uppercase tracking-widest">Description</Label>
                            <textarea
                                value={actionForm.description}
                                onChange={(e) => setActionForm({ ...actionForm, description: e.target.value })}
                                placeholder="Action description..."
                                rows={4}
                                className="w-full bg-black border border-border px-3 py-2 font-mono-tech text-sm text-white placeholder:text-muted-foreground focus:border-emerald-500 focus:outline-none resize-none"
                            />
                        </div>

                        {/* Save */}
                        <button
                            onClick={handleSave}
                            disabled={!actionForm.name.trim()}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-black font-display font-bold uppercase tracking-wider text-sm transition-colors clip-corner-br"
                        >
                            {editingAction ? 'Save Changes' : 'Create Action'}
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
