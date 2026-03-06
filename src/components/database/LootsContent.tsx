'use client';

import { useState, useMemo, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Loot } from '@/types';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useCatalog } from '@/hooks/useCatalog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, Trash2, Shield } from 'lucide-react';

// Skill icons (same as ActionsContent)
const SKILL_ICONS: Record<string, { src: string; color: string }> = {
    Ranged:    { src: 'https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/app-images/skills/ranged.png',    color: '#9333ea' },
    Melee:     { src: 'https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/app-images/skills/melee.png',     color: '#a855f7' },
    Reflexes:  { src: 'https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/app-images/skills/reflexes.png',  color: '#d946ef' },
    Medical:   { src: 'https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/app-images/skills/medical.png',   color: '#ec4899' },
    Tech:      { src: 'https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/app-images/skills/tech.png',      color: '#8b5cf6' },
    Influence: { src: 'https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/app-images/skills/influence.png', color: '#c026d3' },
};

// Range arrows (single consistent coordinates)
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

const EMPTY_LOOT_FORM = {
    name: '',
    flavorText: '',
    effectText: '',
    skillReq: undefined as Loot['skillReq'],
    skillBonus: undefined as number | undefined,
    rangeRed: false,
    rangeYellow: false,
    rangeGreen: false,
    rangeLong: false,
    armorBonus: undefined as number | undefined,
};

export function LootsContent({ search = '', triggerCreate = 0 }: { search?: string; triggerCreate?: number }) {
    const { catalog, setCatalog } = useStore();
    const isAdmin = useIsAdmin();
    const { saveLoot, deleteLoot: deleteLootDb } = useCatalog();

    const [editingLoot, setEditingLoot] = useState<Loot | null>(null);
    const [lootForm, setLootForm] = useState(EMPTY_LOOT_FORM);
    const [dialogOpen, setDialogOpen] = useState(false);

    const loots = useMemo(() => {
        if (!catalog) return [];
        return (catalog.loots ?? []).sort((a, b) => a.name.localeCompare(b.name));
    }, [catalog]);

    const filteredLoots = useMemo(() => {
        if (!search.trim()) return loots;
        const q = search.toLowerCase();
        return loots.filter(l =>
            l.name.toLowerCase().includes(q) ||
            l.flavorText.toLowerCase().includes(q) ||
            (l.effectText ?? '').toLowerCase().includes(q)
        );
    }, [loots, search]);

    // Trigger create from parent toolbar
    useEffect(() => {
        if (triggerCreate > 0) openCreate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [triggerCreate]);

    const openCreate = () => {
        setEditingLoot(null);
        setLootForm(EMPTY_LOOT_FORM);
        setDialogOpen(true);
    };

    const openEdit = (loot: Loot) => {
        setEditingLoot(loot);
        setLootForm({
            name: loot.name,
            flavorText: loot.flavorText,
            effectText: loot.effectText ?? '',
            skillReq: loot.skillReq,
            skillBonus: loot.skillBonus,
            rangeRed: loot.rangeRed,
            rangeYellow: loot.rangeYellow,
            rangeGreen: loot.rangeGreen,
            rangeLong: loot.rangeLong,
            armorBonus: loot.armorBonus,
        });
        setDialogOpen(true);
    };

    const handleDelete = (loot: Loot) => {
        if (!catalog) return;
        if (!confirm(`Delete loot "${loot.name}"?`)) return;
        const updatedLoots = (catalog.loots ?? []).filter(l => l.id !== loot.id);
        setCatalog({ ...catalog, loots: updatedLoots });
        deleteLootDb(loot.id);
    };

    const handleSave = () => {
        if (!catalog) return;

        if (editingLoot) {
            const updated: Loot = {
                ...editingLoot,
                name: lootForm.name || editingLoot.name,
                flavorText: lootForm.flavorText,
                effectText: lootForm.effectText || undefined,
                skillReq: lootForm.skillReq,
                skillBonus: lootForm.skillBonus,
                rangeRed: lootForm.rangeRed,
                rangeYellow: lootForm.rangeYellow,
                rangeGreen: lootForm.rangeGreen,
                rangeLong: lootForm.rangeLong,
                armorBonus: lootForm.armorBonus,
            };
            const updatedLoots = (catalog.loots ?? []).map(l => l.id === updated.id ? updated : l);
            setCatalog({ ...catalog, loots: updatedLoots });
            saveLoot(updated);
        } else {
            const newLoot: Loot = {
                id: `loot-${slugify(lootForm.name || 'unnamed')}`,
                name: lootForm.name || 'New Loot',
                flavorText: lootForm.flavorText,
                effectText: lootForm.effectText || undefined,
                skillReq: lootForm.skillReq,
                skillBonus: lootForm.skillBonus,
                rangeRed: lootForm.rangeRed,
                rangeYellow: lootForm.rangeYellow,
                rangeGreen: lootForm.rangeGreen,
                rangeLong: lootForm.rangeLong,
                armorBonus: lootForm.armorBonus,
            };
            const updatedLoots = [...(catalog.loots ?? []), newLoot];
            setCatalog({ ...catalog, loots: updatedLoots });
            saveLoot(newLoot);
        }

        setDialogOpen(false);
        setEditingLoot(null);
    };

    if (!catalog) return null;

    return (
        <div>
            {/* Count */}
            <div className="flex items-center justify-end mb-4">
                <span className="font-mono-tech text-xs text-muted-foreground uppercase tracking-widest">
                    {filteredLoots.length} loots
                </span>
            </div>

            {/* Loots Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredLoots.map(loot => {
                    const hasSkill = !!(loot.skillReq && SKILL_ICONS[loot.skillReq]);
                    const hasRange = loot.rangeRed || loot.rangeYellow || loot.rangeGreen || loot.rangeLong;
                    const hasEffect = hasSkill || hasRange || loot.effectText || loot.armorBonus;

                    return (
                        <div
                            key={loot.id}
                            className="group bg-surface-dark border border-border hover:border-purple-500/50 transition-colors relative overflow-hidden"
                            style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                        >
                            {/* Top color bar */}
                            <div className="h-1 w-full bg-purple-500" />

                            <div className="p-4">
                                {/* Header: name + admin buttons */}
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <h3 className="font-display font-black text-base text-purple-400 uppercase tracking-wide leading-tight">
                                        {loot.name}
                                    </h3>
                                    {isAdmin && (
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                            <button
                                                onClick={() => openEdit(loot)}
                                                className="p-1 bg-black/70 border border-white/30 rounded hover:border-secondary transition-colors"
                                            >
                                                <Edit className="w-3 h-3 text-white" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(loot)}
                                                className="p-1 bg-black/70 border border-white/30 rounded hover:border-accent transition-colors"
                                            >
                                                <Trash2 className="w-3 h-3 text-white" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Flavor text */}
                                {loot.flavorText && (
                                    <p className="font-mono-tech text-xs text-white/50 italic leading-relaxed mb-3">
                                        &ldquo;{loot.flavorText}&rdquo;
                                    </p>
                                )}

                                {/* Effect section */}
                                {hasEffect && (
                                    <div className="border-t border-border/50 pt-2 mb-2">
                                        {/* Skill icon + range arrows row */}
                                        {(hasSkill || hasRange) && (
                                            <div className="flex items-center gap-2 mb-2">
                                                {hasSkill && (
                                                    <div className="flex items-center shrink-0">
                                                        <img
                                                            src={SKILL_ICONS[loot.skillReq!].src}
                                                            alt={loot.skillReq!}
                                                            className="w-10 h-10 -my-[3px] object-contain"
                                                        />
                                                        {loot.skillBonus != null && loot.skillBonus !== 0 && (
                                                            <span className="font-display font-black text-xs text-white leading-none drop-shadow-[0_0_4px_rgba(0,0,0,0.9)] -ml-1">
                                                                {loot.skillBonus > 0 ? `+${loot.skillBonus}` : loot.skillBonus}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                {hasRange && (
                                                    <div className="flex-1 max-w-[180px]">
                                                        <RangeArrowsSmall
                                                            rangeRed={loot.rangeRed}
                                                            rangeYellow={loot.rangeYellow}
                                                            rangeGreen={loot.rangeGreen}
                                                            rangeLong={loot.rangeLong}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Effect text */}
                                        {loot.effectText && (
                                            <p className="font-mono-tech text-xs text-muted-foreground leading-relaxed">
                                                {loot.effectText}
                                            </p>
                                        )}

                                        {/* Armor bonus badge */}
                                        {loot.armorBonus != null && loot.armorBonus > 0 && (
                                            <div className="flex items-center gap-1 mt-2">
                                                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                                                <span className="font-display font-black text-xs text-cyan-400">
                                                    +{loot.armorBonus} Armor
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ID badge */}
                                <span className="font-mono-tech text-[8px] text-white/15 mt-2 block">{loot.id}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredLoots.length === 0 && (
                <div className="border-2 border-dashed border-border rounded-lg p-12 text-center text-muted-foreground font-mono-tech text-sm uppercase tracking-widest">
                    {search ? 'No matching loots' : 'No loots in catalog'}
                </div>
            )}

            {/* Edit / Create Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="bg-surface-dark border-border text-white max-w-sm max-h-[85vh] overflow-y-auto !top-[8vh] !translate-y-0">
                    <DialogHeader>
                        <DialogTitle className="font-display uppercase tracking-wider">
                            {editingLoot ? 'Edit Loot' : 'New Loot'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label className="font-mono-tech text-xs uppercase tracking-widest">Name</Label>
                            <Input
                                value={lootForm.name}
                                onChange={(e) => setLootForm({ ...lootForm, name: e.target.value })}
                                placeholder="Loot name"
                                className="bg-black border-border font-mono-tech text-sm"
                            />
                        </div>

                        {/* Flavor Text */}
                        <div className="space-y-2">
                            <Label className="font-mono-tech text-xs uppercase tracking-widest">Flavor Text</Label>
                            <textarea
                                value={lootForm.flavorText}
                                onChange={(e) => setLootForm({ ...lootForm, flavorText: e.target.value })}
                                placeholder="Atmospheric description..."
                                rows={2}
                                className="w-full bg-black border border-border px-3 py-2 font-mono-tech text-sm text-white placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none"
                            />
                        </div>

                        {/* Effect Text */}
                        <div className="space-y-2">
                            <Label className="font-mono-tech text-xs uppercase tracking-widest">Effect Text</Label>
                            <textarea
                                value={lootForm.effectText}
                                onChange={(e) => setLootForm({ ...lootForm, effectText: e.target.value })}
                                placeholder="Effect description..."
                                rows={3}
                                className="w-full bg-black border border-border px-3 py-2 font-mono-tech text-sm text-white placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none"
                            />
                        </div>

                        {/* Skill + Bonus */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label className="font-mono-tech text-xs uppercase tracking-widest">Skill</Label>
                                <select
                                    value={lootForm.skillReq ?? ''}
                                    onChange={(e) => setLootForm({ ...lootForm, skillReq: (e.target.value || undefined) as Loot['skillReq'] })}
                                    className="w-full bg-black border border-border px-3 py-2 font-mono-tech text-sm text-white"
                                >
                                    <option value="">None</option>
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
                                    value={lootForm.skillBonus ?? ''}
                                    onChange={(e) => setLootForm({ ...lootForm, skillBonus: e.target.value ? Number(e.target.value) : undefined })}
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
                                            checked={lootForm[key]}
                                            onChange={(e) => setLootForm({ ...lootForm, [key]: e.target.checked })}
                                            className="accent-purple-500"
                                        />
                                        {key.replace('range', '')}
                                    </label>
                                ))}
                            </div>
                            {(lootForm.rangeRed || lootForm.rangeYellow || lootForm.rangeGreen || lootForm.rangeLong) && (
                                <div className="w-48 mt-1">
                                    <RangeArrowsSmall
                                        rangeRed={lootForm.rangeRed}
                                        rangeYellow={lootForm.rangeYellow}
                                        rangeGreen={lootForm.rangeGreen}
                                        rangeLong={lootForm.rangeLong}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Armor Bonus */}
                        <div className="space-y-2">
                            <Label className="font-mono-tech text-xs uppercase tracking-widest">Armor Bonus</Label>
                            <Input
                                type="number"
                                value={lootForm.armorBonus ?? ''}
                                onChange={(e) => setLootForm({ ...lootForm, armorBonus: e.target.value ? Number(e.target.value) : undefined })}
                                placeholder="0"
                                className="bg-black border-border font-mono-tech text-sm"
                            />
                        </div>

                        {/* Save */}
                        <button
                            onClick={handleSave}
                            disabled={!lootForm.name.trim()}
                            className="w-full py-3 bg-purple-500 hover:bg-purple-400 disabled:opacity-50 text-white font-display font-bold uppercase tracking-wider text-sm transition-colors clip-corner-br"
                        >
                            {editingLoot ? 'Save Changes' : 'Create Loot'}
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
