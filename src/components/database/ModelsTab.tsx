'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { ModelLineage, ModelProfile, GameAction, SkillType, RangeType, ActionColor, Weapon, FactionVariant } from '@/types';
import { CharacterCard } from '@/components/characters/CharacterCard';
import { useCardGrid } from '@/hooks/useCardGrid';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useCatalog } from '@/hooks/useCatalog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X, Upload, FlipVertical2, ChevronDown, ChevronRight, Edit } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { canHaveTiers, getTierLabel, getTierSurcharges } from '@/lib/tiers';

const SKILL_TYPES: SkillType[] = ['Ranged', 'Melee', 'Reflexes', 'Medical', 'Tech', 'Influence'];
const RANGE_TYPES: RangeType[] = ['Reach', 'Red', 'Yellow', 'Green', 'Long', 'Self'];
const LINEAGE_TYPES: ModelLineage['type'][] = ['Leader', 'Character', 'Gonk', 'Specialist', 'Drone'];

const EMPTY_SKILLS: Record<SkillType, number> = { Ranged: 0, Melee: 0, Reflexes: 0, Medical: 0, Tech: 0, Influence: 0, None: 0 };

const EMPTY_ACTION: () => GameAction = () => ({
    id: uuidv4(),
    name: '',
    skillReq: 'None' as SkillType,
    range: 'Reach' as RangeType,
    isAttack: false,
    keywords: [],
    effectDescription: '',
});

/** Upload image to Supabase Storage → public URL */
function CharacterImageUpload({ value, onChange, charId, flippedY, onFlipY, flippedX, onFlipX }: { value: string; onChange: (url: string) => void; charId: string; flippedY?: boolean; onFlipY?: () => void; flippedX?: boolean; onFlipX?: () => void }) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleFile = async (file: File) => {
        const slug = (charId.replace(/^lineage-/, '') || 'unnamed-char').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        setUploading(true);
        try {
            const { supabase } = await import('@/lib/supabase');
            const filePath = `${slug}.png`;
            const { error } = await supabase.storage
                .from('character-images')
                .upload(filePath, file, { upsert: true, contentType: file.type, cacheControl: '0' });
            if (error) throw error;
            const { data: urlData } = supabase.storage
                .from('character-images')
                .getPublicUrl(filePath);
            // Append cache-buster so browser + CDN serve the fresh file
            const freshUrl = `${urlData.publicUrl}?t=${Date.now()}`;
            onChange(freshUrl);
        } catch (err) {
            console.error('Upload error:', err);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                }}
            />
            <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="relative w-full aspect-square border border-border bg-black flex items-center justify-center overflow-hidden cursor-pointer hover:border-secondary transition-colors group/img disabled:opacity-50"
            >
                {value ? (
                    <img src={value} alt="" className="w-full h-full object-cover" style={(flippedX || flippedY) ? { transform: `${flippedX ? 'scaleX(-1)' : ''} ${flippedY ? 'scaleY(-1)' : ''}`.trim() } : undefined} />
                ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover/img:text-secondary transition-colors">
                        <Upload className="w-8 h-8" />
                        <span className="font-mono-tech text-[10px] uppercase tracking-widest">Click to upload</span>
                    </div>
                )}
                {value && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="flex items-center gap-2 text-white">
                            <Upload className="w-5 h-5" />
                            <span className="font-mono-tech text-xs uppercase tracking-wider">{uploading ? 'Processing...' : 'Replace'}</span>
                        </div>
                    </div>
                )}
            </button>
            {value && (onFlipX || onFlipY) && (
                <div className="flex gap-1 mt-1">
                    {onFlipX && (
                        <button
                            type="button"
                            onClick={onFlipX}
                            className={`flex items-center gap-1.5 px-2 py-1 text-[10px] font-mono-tech uppercase tracking-wider border transition-colors ${flippedX ? 'border-secondary text-secondary bg-secondary/10' : 'border-border text-muted-foreground hover:text-white hover:border-white'}`}
                        >
                            <FlipVertical2 className="w-3.5 h-3.5 rotate-90" />
                            Flip H{flippedX ? ' (on)' : ''}
                        </button>
                    )}
                    {onFlipY && (
                        <button
                            type="button"
                            onClick={onFlipY}
                            className={`flex items-center gap-1.5 px-2 py-1 text-[10px] font-mono-tech uppercase tracking-wider border transition-colors ${flippedY ? 'border-secondary text-secondary bg-secondary/10' : 'border-border text-muted-foreground hover:text-white hover:border-white'}`}
                        >
                            <FlipVertical2 className="w-3.5 h-3.5" />
                            Flip V{flippedY ? ' (on)' : ''}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

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
    'faction-piranhas':    'border-teal-400',
    'faction-wild-things': 'border-rose-500',
};

function slugify(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
}

const EMPTY_ACTION_CATALOG_FORM = {
    name: '',
    description: '',
    skillReq: undefined as Weapon['skillReq'],
    skillBonus: undefined as number | undefined,
    rangeRed: false,
    rangeYellow: false,
    rangeGreen: false,
    rangeLong: false,
};

// ── Range arrows (same coordinates as CharacterCard) ──
const RA = {
    red:    '1,1 44,1 49,11 44,21 5,21',
    yellow: '52,1 95,1 100,11 95,21 52,21 57,11',
    green:  '103,1 145,1 150,11 145,21 103,21 108,11',
    long:   '153,1 218,1 223,11 218,21 153,21 158,11',
    plusCx: 188,
};

function RangeArrowsPreview({ rangeRed, rangeYellow, rangeGreen, rangeLong }: {
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

function LinkedActionSummary({ action, catalog, onEdit }: {
    action: GameAction;
    catalog: { weapons: Weapon[] };
    onEdit: (weapon: Weapon) => void;
}) {
    const linkedWeapon = catalog.weapons.find(w => w.id === action.weaponId);
    const isActionType = linkedWeapon?.isAction;
    return (
        <div className="bg-black/50 border border-border/30 px-2 py-1.5">
            <div className="flex items-start justify-between gap-2">
                <span className="font-mono-tech text-[9px] text-white/60 flex-1">
                    <span className="font-bold text-emerald-400 uppercase">{action.name}</span>
                    {action.skillReq && action.skillReq !== 'None' && <> · {action.skillReq}{linkedWeapon?.skillBonus ? ` +${linkedWeapon.skillBonus}` : ''}</>}
                    {action.keywords.length > 0 && <> · {action.keywords.join(', ')}</>}
                    {action.effectDescription && (
                        <span className="block mt-0.5 text-white/40 text-[8px] leading-tight">{action.effectDescription.slice(0, 120)}{action.effectDescription.length > 120 ? '...' : ''}</span>
                    )}
                </span>
                {isActionType && (
                    <button
                        type="button"
                        onClick={() => linkedWeapon && onEdit(linkedWeapon)}
                        className="shrink-0 p-1 text-muted-foreground hover:text-emerald-400 transition-colors"
                        title="Edit this action in catalog"
                    >
                        <Edit className="w-3 h-3" />
                    </button>
                )}
            </div>
        </div>
    );
}

export function ModelsTab({ highlightId, highlightKey }: { highlightId?: string; highlightKey?: number }) {
    const { catalog, setCatalog } = useStore();
    const { gridClass, cardStyle } = useCardGrid();
    const isAdmin = useIsAdmin();
    const { saveLineage, saveProfile, deleteLineage: deleteLineageDb, deleteProfile: deleteProfileDb, saveTierSurcharges, saveWeapon } = useCatalog();
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<ModelLineage['type'] | 'all'>('all');
    const [factionFilter, setFactionFilter] = useState<string | 'all'>('all');
    const [sourceFilter, setSourceFilter] = useState<'all' | 'Custom' | 'Upload'>('all');
    const [imageFilter, setImageFilter] = useState<'all' | 'default' | 'custom'>('all');

    // Highlight scroll-to effect
    useEffect(() => {
        if (!highlightId) return;
        setSearch('');
        setTypeFilter('all');
        setFactionFilter('all');
        setSourceFilter('all');
        setImageFilter('all');
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

    // ── Expand/collapse state ──
    const [expandedLineages, setExpandedLineages] = useState<Set<string>>(new Set());
    const toggleExpanded = (id: string) => {
        setExpandedLineages(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    // ── Edit dialog state ──
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingLineage, setEditingLineage] = useState<ModelLineage | null>(null);
    const [editingProfile, setEditingProfile] = useState<ModelProfile | null>(null);
    const [lineageForm, setLineageForm] = useState<Partial<ModelLineage>>({});
    const [profileForm, setProfileForm] = useState<Partial<ModelProfile>>({});
    const [actionsForm, setActionsForm] = useState<GameAction[]>([]);

    // ── Action catalog create/edit sub-dialog ──
    const [actionCatalogDialogOpen, setActionCatalogDialogOpen] = useState(false);
    const [editingCatalogAction, setEditingCatalogAction] = useState<Weapon | null>(null);
    const [actionCatalogForm, setActionCatalogForm] = useState(EMPTY_ACTION_CATALOG_FORM);
    const [actionLinkIndex, setActionLinkIndex] = useState<number | null>(null); // index to link after create

    const openCreateAction = (linkIndex: number) => {
        setEditingCatalogAction(null);
        setActionCatalogForm(EMPTY_ACTION_CATALOG_FORM);
        setActionLinkIndex(linkIndex);
        setActionCatalogDialogOpen(true);
    };

    const openEditCatalogAction = (weapon: Weapon) => {
        setEditingCatalogAction(weapon);
        setActionCatalogForm({
            name: weapon.name,
            description: weapon.description,
            skillReq: weapon.skillReq,
            skillBonus: weapon.skillBonus,
            rangeRed: weapon.rangeRed,
            rangeYellow: weapon.rangeYellow,
            rangeGreen: weapon.rangeGreen,
            rangeLong: weapon.rangeLong,
        });
        setActionLinkIndex(null);
        setActionCatalogDialogOpen(true);
    };

    const saveCatalogAction = () => {
        if (!catalog) return;

        if (editingCatalogAction) {
            // Edit existing action
            const updated: Weapon = {
                ...editingCatalogAction,
                name: actionCatalogForm.name || editingCatalogAction.name,
                description: actionCatalogForm.description ?? '',
                skillReq: actionCatalogForm.skillReq,
                skillBonus: actionCatalogForm.skillBonus,
                rangeRed: actionCatalogForm.rangeRed,
                rangeYellow: actionCatalogForm.rangeYellow,
                rangeGreen: actionCatalogForm.rangeGreen,
                rangeLong: actionCatalogForm.rangeLong,
            };
            const updatedWeapons = catalog.weapons.map(w => w.id === updated.id ? updated : w);
            setCatalog({ ...catalog, weapons: updatedWeapons });
            saveWeapon(updated);

            // Update action form if this action is linked to any action in the current form
            setActionsForm(prev => prev.map(a => {
                if (a.weaponId !== updated.id) return a;
                return {
                    ...a,
                    name: updated.name,
                    skillReq: (updated.skillReq ?? 'None') as SkillType,
                    range: (updated.rangeRed ? 'Red' : updated.rangeYellow ? 'Yellow' : updated.rangeGreen ? 'Green' : updated.rangeLong ? 'Long' : 'Reach') as RangeType,
                    keywords: [...updated.keywords],
                    effectDescription: updated.description,
                };
            }));
        } else {
            // Create new action
            const newAction: Weapon = {
                id: `action-${slugify(actionCatalogForm.name || 'unnamed')}-${Date.now().toString(36)}`,
                name: actionCatalogForm.name || 'New Action',
                source: 'Manual',
                factionVariants: [{ factionId: 'universal', cost: 0, rarity: 99, reqStreetCred: 0 }] as FactionVariant[],
                isWeapon: false,
                isGear: false,
                isAction: true,
                skillReq: actionCatalogForm.skillReq,
                skillBonus: actionCatalogForm.skillBonus,
                rangeRed: actionCatalogForm.rangeRed,
                rangeYellow: actionCatalogForm.rangeYellow,
                rangeGreen: actionCatalogForm.rangeGreen,
                rangeLong: actionCatalogForm.rangeLong,
                description: actionCatalogForm.description ?? '',
                keywords: [],
            };
            const updatedWeapons = [...catalog.weapons, newAction];
            setCatalog({ ...catalog, weapons: updatedWeapons });
            saveWeapon(newAction);

            // Auto-link the newly created action to the current action slot
            if (actionLinkIndex !== null) {
                setActionsForm(prev => prev.map((a, i) => i === actionLinkIndex ? {
                    ...a,
                    weaponId: newAction.id,
                    name: newAction.name,
                    skillReq: (newAction.skillReq ?? 'None') as SkillType,
                    range: (newAction.rangeRed ? 'Red' : newAction.rangeYellow ? 'Yellow' : newAction.rangeGreen ? 'Green' : newAction.rangeLong ? 'Long' : 'Reach') as RangeType,
                    keywords: [...newAction.keywords],
                    effectDescription: newAction.description,
                } : a));
            }
        }

        setActionCatalogDialogOpen(false);
        setEditingCatalogAction(null);
        setActionLinkIndex(null);
    };

    const getProfilesForLineage = (lineageId: string) =>
        catalog.profiles.filter(p => p.lineageId === lineageId).sort((a, b) => a.level - b.level);

    // Collect unique types
    const allTypes = Array.from(new Set(catalog.lineages.map(l => l.type)));

    // All factions sorted alphabetically
    const factions = [...catalog.factions].sort((a, b) => a.name.localeCompare(b.name));

    // Filtered lineages (flat, no panels)
    const factionNameMap = Object.fromEntries(catalog.factions.map(f => [f.id, f.name]));
    const filtered = catalog.lineages.filter(l => {
        const matchSearch = l.name.toLowerCase().includes(search.toLowerCase());
        const matchType = typeFilter === 'all' || l.type === typeFilter;
        const matchFaction = factionFilter === 'all' || l.factionIds.includes(factionFilter);
        const matchSource = sourceFilter === 'all' || (l.source ?? 'Custom') === sourceFilter;
        const matchImage = imageFilter === 'all'
            || (imageFilter === 'default' && l.isDefaultImage !== false)
            || (imageFilter === 'custom' && l.isDefaultImage === false);
        return matchSearch && matchType && matchFaction && matchSource && matchImage;
    }).sort((a, b) => {
        // 1. When filtering: native (single-faction) first, then multi-faction guests
        if (factionFilter !== 'all') {
            if (a.factionIds.length !== b.factionIds.length) return a.factionIds.length - b.factionIds.length;
        }
        // 2. Faction alphabétique
        const fA = factionNameMap[a.factionIds[0]] ?? '';
        const fB = factionNameMap[b.factionIds[0]] ?? '';
        if (fA !== fB) return fA.localeCompare(fB);
        // 3. Leaders first, then non-Gonk, then Gonk
        const typeOrder = (t: string) => t === 'Leader' ? 0 : t === 'Gonk' ? 2 : 1;
        const tA = typeOrder(a.type);
        const tB = typeOrder(b.type);
        if (tA !== tB) return tA - tB;
        // 3. Alphabetical within same group
        return a.name.localeCompare(b.name);
    });

    // ── Edit/Delete logic ──

    const openEdit = (lineage: ModelLineage, profile: ModelProfile) => {
        setEditingLineage(lineage);
        setEditingProfile(profile);
        setLineageForm({ ...lineage });
        setProfileForm({ ...profile, skills: { ...profile.skills }, actionTokens: { ...profile.actionTokens } });
        setActionsForm(profile.actions.map(a => ({ ...a, keywords: [...a.keywords] })));
        setEditDialogOpen(true);
    };

    const saveCharacter = () => {
        if (!editingLineage || !editingProfile) return;

        const updatedLineage: ModelLineage = {
            ...editingLineage,
            name: lineageForm.name || editingLineage.name,
            type: lineageForm.type || editingLineage.type,
            factionIds: lineageForm.factionIds || editingLineage.factionIds,
            isMerc: lineageForm.isMerc ?? editingLineage.isMerc,
            imageUrl: lineageForm.imageUrl ?? editingLineage.imageUrl,
            imageFlipY: lineageForm.imageFlipY,
            imageFlipX: lineageForm.imageFlipX,
        };

        const updatedProfile: ModelProfile = {
            ...editingProfile,
            costEB: profileForm.costEB ?? editingProfile.costEB,
            actionTokens: profileForm.actionTokens ?? editingProfile.actionTokens,
            skills: profileForm.skills ?? editingProfile.skills,
            armor: profileForm.armor ?? editingProfile.armor,
            streetCred: profileForm.streetCred ?? editingProfile.streetCred,
            keywords: profileForm.keywords ?? editingProfile.keywords,
            gonkActionColor: profileForm.gonkActionColor,
            actions: actionsForm,
        };

        const updatedCatalog = {
            ...catalog,
            lineages: catalog.lineages.map(l => l.id === updatedLineage.id ? updatedLineage : l),
            profiles: catalog.profiles.map(p => p.id === updatedProfile.id ? updatedProfile : p),
        };

        setCatalog(updatedCatalog);
        if (isAdmin) {
            saveLineage(updatedLineage);
            saveProfile(updatedProfile);
        }
        setEditDialogOpen(false);
        setEditingLineage(null);
        setEditingProfile(null);
    };

    const deleteCharacter = (lineageId: string) => {
        const lineage = catalog.lineages.find(l => l.id === lineageId);
        if (!lineage || !window.confirm(`Delete "${lineage.name}" and all its profiles? This cannot be undone.`)) return;

        const updatedCatalog = {
            ...catalog,
            lineages: catalog.lineages.filter(l => l.id !== lineageId),
            profiles: catalog.profiles.filter(p => p.lineageId !== lineageId),
        };
        setCatalog(updatedCatalog);
        if (isAdmin) deleteLineageDb(lineageId);
    };

    const deleteTier = (profile: ModelProfile) => {
        const lineage = catalog.lineages.find(l => l.id === profile.lineageId);
        const label = profile.level === 1 ? 'Veteran' : 'Elite';
        if (!lineage || !window.confirm(`Delete ${label} tier of "${lineage.name}"?`)) return;

        const updatedCatalog = {
            ...catalog,
            profiles: catalog.profiles.filter(p => p.id !== profile.id),
        };
        setCatalog(updatedCatalog);
        if (isAdmin) deleteProfileDb(profile.id);
    };

    // ── Tier creation ──
    const addTierVersion = (lineage: ModelLineage, level: 1 | 2) => {
        const baseProfile = catalog.profiles.find(p => p.lineageId === lineage.id && p.level === 0);
        if (!baseProfile) return;
        const newProfile: ModelProfile = {
            ...baseProfile,
            id: uuidv4(),
            level,
            streetCred: level,
        };
        const updatedCatalog = {
            ...catalog,
            profiles: [...catalog.profiles, newProfile],
        };
        setCatalog(updatedCatalog);
        if (isAdmin) saveProfile(newProfile);
        // Open edit dialog on the new profile
        openEdit(lineage, newProfile);
        setExpandedLineages(prev => new Set(prev).add(lineage.id));
    };

    // ── Surcharge editing ──
    const surcharges = getTierSurcharges(catalog);
    const updateSurcharges = (field: 'veteran' | 'elite', value: number) => {
        const updated = { ...surcharges, [field]: value };
        const updatedCatalog = { ...catalog, tierSurcharges: updated };
        setCatalog(updatedCatalog);
        if (isAdmin) saveTierSurcharges(updated);
    };

    // ── Action helpers ──

    const updateAction = (index: number, patch: Partial<GameAction>) => {
        setActionsForm(prev => prev.map((a, i) => i === index ? { ...a, ...patch } : a));
    };

    const removeAction = (index: number) => {
        setActionsForm(prev => prev.filter((_, i) => i !== index));
    };

    const addAction = () => {
        setActionsForm(prev => [...prev, EMPTY_ACTION()]);
    };

    const selectWeaponForAction = (actionIndex: number, weaponId: string) => {
        if (!weaponId) {
            // Unlink
            setActionsForm(prev => prev.map((a, i) => i === actionIndex ? { ...a, weaponId: undefined } : a));
            return;
        }
        const weapon = catalog.weapons.find(w => w.id === weaponId);
        if (!weapon) return;
        setActionsForm(prev => prev.map((a, i) => i === actionIndex ? {
            ...a,
            weaponId: weapon.id,
            name: weapon.name,
            skillReq: (weapon.skillReq ?? 'None') as SkillType,
            range: (weapon.rangeRed ? 'Red' : weapon.rangeYellow ? 'Yellow' : weapon.rangeGreen ? 'Green' : weapon.rangeLong ? 'Long' : 'Reach') as RangeType,
            keywords: [...weapon.keywords],
            effectDescription: weapon.description,
        } : a));
    };

    // Weapons available for this lineage: faction-matching + universal
    const lineageFactionIds = lineageForm.factionIds ?? [];
    const availableWeapons = catalog.weapons
        .filter(w => w.factionVariants.some(v => v.factionId === 'universal' || lineageFactionIds.includes(v.factionId)))
        .sort((a, b) => a.name.localeCompare(b.name));

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

                {/* Row 2: Source + Image filters */}
                <div className="flex gap-4 font-mono-tech text-xs flex-wrap items-center">
                    <div className="flex gap-2 items-center">
                        <span className="text-muted-foreground uppercase tracking-widest text-[10px]">Source</span>
                        {(['all', 'Custom', 'Upload'] as const).map(v => (
                            <button
                                key={v}
                                onClick={() => setSourceFilter(v)}
                                className={`px-3 py-1.5 font-bold uppercase tracking-wider transition-colors ${
                                    sourceFilter === v ? 'bg-primary text-black' : 'border border-border text-muted-foreground hover:border-secondary hover:text-secondary'
                                }`}
                            >
                                {v === 'all' ? 'All' : v}
                            </button>
                        ))}
                    </div>
                    <div className="w-px h-6 bg-border" />
                    <div className="flex gap-2 items-center">
                        <span className="text-muted-foreground uppercase tracking-widest text-[10px]">Image</span>
                        {([['all', 'All'], ['custom', 'Custom'], ['default', 'Default']] as const).map(([v, label]) => (
                            <button
                                key={v}
                                onClick={() => setImageFilter(v)}
                                className={`px-3 py-1.5 font-bold uppercase tracking-wider transition-colors ${
                                    imageFilter === v ? 'bg-primary text-black' : 'border border-border text-muted-foreground hover:border-secondary hover:text-secondary'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Row 3: Faction filter icons — same layout as Gear tab */}
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

            {/* Tier Surcharges (admin only) */}
            {isAdmin && (
                <div className="bg-surface-dark/50 border border-border p-4 flex items-center gap-6">
                    <span className="font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground shrink-0">Tier Surcharges</span>
                    <div className="flex items-center gap-2">
                        <label className="font-mono-tech text-[10px] uppercase text-muted-foreground">Veteran</label>
                        <Input
                            type="number"
                            value={surcharges.veteran}
                            onChange={(e) => updateSurcharges('veteran', Number(e.target.value))}
                            className="w-16 h-7 bg-black border-border font-mono-tech text-xs px-2"
                        />
                        <span className="font-mono-tech text-[10px] text-muted-foreground">EB</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="font-mono-tech text-[10px] uppercase text-muted-foreground">Elite</label>
                        <Input
                            type="number"
                            value={surcharges.elite}
                            onChange={(e) => updateSurcharges('elite', Number(e.target.value))}
                            className="w-16 h-7 bg-black border-border font-mono-tech text-xs px-2"
                        />
                        <span className="font-mono-tech text-[10px] text-muted-foreground">EB</span>
                    </div>
                </div>
            )}

            {/* Card Grid with expand/collapse tiers */}
            {filtered.length === 0 ? (
                <div className="border border-dashed border-border p-8 text-center text-muted-foreground font-mono-tech uppercase text-xs tracking-widest">
                    No units found.
                </div>
            ) : (
                <div className={gridClass}>
                    {filtered.map(lineage => {
                        const profiles = getProfilesForLineage(lineage.id);
                        const hasTiers = profiles.length > 1;
                        const isExpanded = expandedLineages.has(lineage.id);
                        const hasVeteran = profiles.some(p => p.level === 1);
                        const hasElite = profiles.some(p => p.level === 2);
                        const showTierControls = isAdmin && canHaveTiers(lineage);

                        if (hasTiers && !isExpanded) {
                            // Collapsed: show base card only + expand chevron
                            const baseProfile = profiles.find(p => p.level === 0) ?? profiles[0];
                            return (
                                <div key={lineage.id} data-card-id={lineage.id} className="w-full" style={cardStyle}>
                                    <CharacterCard
                                        lineage={lineage}
                                        profile={baseProfile}
                                        isAdmin={isAdmin}
                                        onEdit={() => openEdit(lineage, baseProfile)}
                                        onDelete={() => deleteCharacter(lineage.id)}
                                        catalogWeapons={catalog.weapons}
                                        activeFactionId={factionFilter !== 'all' ? factionFilter : undefined}
                                    />
                                    <button
                                        onClick={() => toggleExpanded(lineage.id)}
                                        className="w-full flex items-center justify-center gap-1 mt-1 py-0.5 text-accent hover:text-white transition-colors"
                                    >
                                        <ChevronRight className="w-3 h-3" />
                                        <span className="font-mono-tech text-[10px] uppercase tracking-wider">
                                            {profiles.length} versions
                                        </span>
                                    </button>
                                </div>
                            );
                        }

                        // Expanded (or single profile): show all versions
                        return profiles.map(profile => (
                            <div key={profile.id} data-card-id={lineage.id} className="w-full" style={cardStyle}>
                                <CharacterCard
                                    lineage={lineage}
                                    profile={profile}
                                    isAdmin={isAdmin}
                                    onEdit={() => openEdit(lineage, profile)}
                                    onDelete={profile.level > 0 ? () => deleteTier(profile) : () => deleteCharacter(lineage.id)}
                                    catalogWeapons={catalog.weapons}
                                    activeFactionId={factionFilter !== 'all' ? factionFilter : undefined}
                                />
                                {hasTiers && (
                                    <div className="flex items-center justify-center gap-2 mt-1">
                                        <span className={`font-mono-tech text-[10px] uppercase ${profile.level === 0 ? 'text-muted-foreground' : profile.level === 1 ? 'text-primary' : 'text-accent'}`}>
                                            {getTierLabel(profile.level)}
                                        </span>
                                        {profile.level === 0 && (
                                            <button
                                                onClick={() => toggleExpanded(lineage.id)}
                                                className="text-emerald-500 hover:text-white transition-colors"
                                            >
                                                <ChevronDown className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ));
                    })}
                </div>
            )}

            {/* ── Edit Character Dialog ── */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="bg-surface-dark border-border max-w-md max-h-[85vh] overflow-y-auto !top-[8vh] !translate-y-0">
                    <DialogHeader>
                        <DialogTitle className="font-display uppercase tracking-wider text-primary">
                            Edit Character
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        {/* ── Image ── */}
                        <CharacterImageUpload
                            value={lineageForm.imageUrl || ''}
                            onChange={(val) => setLineageForm({ ...lineageForm, imageUrl: val })}
                            charId={lineageForm.id || ''}
                            flippedY={!!lineageForm.imageFlipY}
                            onFlipY={() => setLineageForm(f => ({ ...f, imageFlipY: !f.imageFlipY }))}
                            flippedX={!!lineageForm.imageFlipX}
                            onFlipX={() => setLineageForm(f => ({ ...f, imageFlipX: !f.imageFlipX }))}
                        />

                        {/* ── Lineage Section ── */}
                        <div className="border border-border/50 p-3 space-y-3">
                            <span className="font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground">Lineage</span>

                            <div className="space-y-2">
                                <Label className="font-mono-tech text-xs uppercase tracking-widest">Name</Label>
                                <Input
                                    value={lineageForm.name || ''}
                                    onChange={(e) => setLineageForm({ ...lineageForm, name: e.target.value })}
                                    className="bg-black border-border font-mono-tech"
                                />
                            </div>

                            <div className="flex gap-3 items-end">
                                <div className="flex-1 space-y-2">
                                    <Label className="font-mono-tech text-xs uppercase tracking-widest">Type</Label>
                                    <select
                                        value={lineageForm.type || 'Character'}
                                        onChange={(e) => setLineageForm({ ...lineageForm, type: e.target.value as ModelLineage['type'] })}
                                        className="w-full bg-black border border-border px-2 py-1.5 font-mono-tech text-xs uppercase text-white"
                                    >
                                        {LINEAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer pb-1.5">
                                    <input
                                        type="checkbox"
                                        checked={lineageForm.isMerc ?? false}
                                        onChange={(e) => setLineageForm({ ...lineageForm, isMerc: e.target.checked })}
                                        className="accent-secondary"
                                    />
                                    <span className="font-mono-tech text-xs uppercase text-white">Merc</span>
                                </label>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-mono-tech text-xs uppercase tracking-widest">Factions</Label>
                                <div className="flex flex-wrap gap-2">
                                    {catalog.factions.map(f => {
                                        const selected = (lineageForm.factionIds ?? []).includes(f.id);
                                        return (
                                            <button
                                                key={f.id}
                                                onClick={() => {
                                                    const ids = lineageForm.factionIds ?? [];
                                                    setLineageForm({
                                                        ...lineageForm,
                                                        factionIds: selected ? ids.filter(id => id !== f.id) : [...ids, f.id],
                                                    });
                                                }}
                                                className={`px-2 py-1 font-mono-tech text-[10px] uppercase border transition-colors ${
                                                    selected ? 'border-secondary bg-secondary/20 text-secondary' : 'border-border text-muted-foreground hover:border-white/30'
                                                }`}
                                            >
                                                {f.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* ── Profile Section ── */}
                        <div className="border border-border/50 p-3 space-y-3">
                            <span className="font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground">Profile</span>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1">
                                    <Label className="font-mono-tech text-[10px] uppercase tracking-widest">Cost EB</Label>
                                    <Input
                                        type="number"
                                        value={profileForm.costEB ?? 0}
                                        onChange={(e) => setProfileForm({ ...profileForm, costEB: Number(e.target.value) })}
                                        className="bg-black border-border font-mono-tech text-xs h-7 px-2"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="font-mono-tech text-[10px] uppercase tracking-widest">Armor</Label>
                                    <Input
                                        type="number"
                                        value={profileForm.armor ?? 0}
                                        onChange={(e) => setProfileForm({ ...profileForm, armor: Number(e.target.value) })}
                                        className="bg-black border-border font-mono-tech text-xs h-7 px-2"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="font-mono-tech text-[10px] uppercase tracking-widest">StreetCred</Label>
                                    <Input
                                        type="number"
                                        value={profileForm.streetCred ?? 0}
                                        onChange={(e) => setProfileForm({ ...profileForm, streetCred: Number(e.target.value) })}
                                        className="bg-black border-border font-mono-tech text-xs h-7 px-2"
                                    />
                                </div>
                            </div>

                            {/* Action Tokens */}
                            <div className="space-y-1">
                                <Label className="font-mono-tech text-[10px] uppercase tracking-widest">Action Tokens</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['green', 'yellow', 'red'] as const).map(color => (
                                        <div key={color} className="flex items-center gap-1.5">
                                            <span className={`w-3 h-3 rounded-full ${color === 'green' ? 'bg-green-500' : color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                                            <Input
                                                type="number"
                                                min={0}
                                                value={profileForm.actionTokens?.[color] ?? 0}
                                                onChange={(e) => setProfileForm({
                                                    ...profileForm,
                                                    actionTokens: { ...(profileForm.actionTokens ?? { green: 0, yellow: 0, red: 0 }), [color]: Number(e.target.value) },
                                                })}
                                                className="bg-black border-border font-mono-tech text-xs h-7 px-2"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Gonk Action Color */}
                            {lineageForm.type === 'Gonk' && (
                                <div className="space-y-1">
                                    <Label className="font-mono-tech text-[10px] uppercase tracking-widest">Gonk Action Color</Label>
                                    <select
                                        value={profileForm.gonkActionColor ?? ''}
                                        onChange={(e) => setProfileForm({ ...profileForm, gonkActionColor: (e.target.value || undefined) as ActionColor | undefined })}
                                        className="w-full bg-black border border-border px-2 py-1 font-mono-tech text-xs uppercase text-white"
                                    >
                                        <option value="">None</option>
                                        <option value="Green">Green</option>
                                        <option value="Yellow">Yellow</option>
                                        <option value="Red">Red</option>
                                    </select>
                                </div>
                            )}

                            {/* Skills */}
                            <div className="space-y-1">
                                <Label className="font-mono-tech text-[10px] uppercase tracking-widest">Skills</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {SKILL_TYPES.map(skill => (
                                        <div key={skill} className="flex items-center gap-1.5">
                                            <span className="font-mono-tech text-[10px] text-muted-foreground w-14 truncate">{skill}</span>
                                            <Input
                                                type="number"
                                                min={0}
                                                value={profileForm.skills?.[skill] ?? 0}
                                                onChange={(e) => setProfileForm({
                                                    ...profileForm,
                                                    skills: { ...(profileForm.skills ?? EMPTY_SKILLS), [skill]: Number(e.target.value) },
                                                })}
                                                className="bg-black border-border font-mono-tech text-xs h-7 px-2 flex-1"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ── Keywords ── */}
                        <div className="space-y-2">
                            <Label className="font-mono-tech text-xs uppercase tracking-widest">Keywords (comma-separated)</Label>
                            <Input
                                value={(profileForm.keywords ?? []).join(', ')}
                                onChange={(e) => setProfileForm({ ...profileForm, keywords: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                placeholder="Netrunner, Cyber-Character..."
                                className="bg-black border-border font-mono-tech text-sm"
                            />
                        </div>

                        {/* ── Actions ── */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="font-mono-tech text-xs uppercase tracking-widest">Actions</Label>
                                <button onClick={addAction} className="flex items-center gap-1 px-2 py-0.5 font-mono-tech text-[10px] uppercase text-secondary border border-secondary/50 hover:bg-secondary/10 transition-colors">
                                    <Plus className="w-3 h-3" /> Add
                                </button>
                            </div>
                            {actionsForm.map((action, i) => (
                                <div key={action.id} className="border border-border/50 p-2 space-y-2 relative">
                                    <button
                                        onClick={() => removeAction(i)}
                                        className="absolute top-1 right-1 p-0.5 text-muted-foreground hover:text-accent transition-colors z-10"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>

                                    {/* Weapon/Gear/Action dropdown + Create New */}
                                    <div className="space-y-0.5 pr-5">
                                        <span className="font-mono-tech text-[9px] text-muted-foreground uppercase">Weapon / Gear / Action</span>
                                        <div className="flex gap-1">
                                            <select
                                                value={action.weaponId || ''}
                                                onChange={(e) => selectWeaponForAction(i, e.target.value)}
                                                className="flex-1 bg-black border border-border px-2 py-1 font-mono-tech text-[10px] uppercase text-white"
                                            >
                                                <option value="">-- None (manual) --</option>
                                                {availableWeapons.filter(w => w.isWeapon).length > 0 && (
                                                    <optgroup label="Weapons">
                                                        {availableWeapons.filter(w => w.isWeapon).map(w => (
                                                            <option key={w.id} value={w.id}>{w.name}</option>
                                                        ))}
                                                    </optgroup>
                                                )}
                                                {availableWeapons.filter(w => w.isGear).length > 0 && (
                                                    <optgroup label="Gear">
                                                        {availableWeapons.filter(w => w.isGear).map(w => (
                                                            <option key={w.id} value={w.id}>{w.name}</option>
                                                        ))}
                                                    </optgroup>
                                                )}
                                                {availableWeapons.filter(w => w.isAction).length > 0 && (
                                                    <optgroup label="Actions">
                                                        {availableWeapons.filter(w => w.isAction).map(w => (
                                                            <option key={w.id} value={w.id}>{w.name}</option>
                                                        ))}
                                                    </optgroup>
                                                )}
                                            </select>
                                            <button
                                                type="button"
                                                onClick={() => openCreateAction(i)}
                                                className="shrink-0 px-2 py-1 bg-emerald-700 hover:bg-emerald-600 text-white font-mono-tech text-[9px] uppercase tracking-wider transition-colors"
                                                title="Create new action in catalog"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>

                                    {action.weaponId ? (
                                        <LinkedActionSummary
                                            action={action}
                                            catalog={catalog}
                                            onEdit={openEditCatalogAction}
                                        />
                                    ) : (
                                        /* ── Manual action form ── */
                                        <>
                                            <Input
                                                value={action.name}
                                                onChange={(e) => updateAction(i, { name: e.target.value })}
                                                placeholder="Action Name"
                                                className="bg-black border-border font-mono-tech text-xs h-7"
                                            />

                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="space-y-0.5">
                                                    <span className="font-mono-tech text-[9px] text-muted-foreground uppercase">Skill</span>
                                                    <select
                                                        value={action.skillReq}
                                                        onChange={(e) => updateAction(i, { skillReq: e.target.value as SkillType })}
                                                        className="w-full bg-black border border-border px-1 py-0.5 font-mono-tech text-[10px] uppercase text-white"
                                                    >
                                                        <option value="None">None</option>
                                                        {SKILL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                </div>
                                                <div className="space-y-0.5">
                                                    <span className="font-mono-tech text-[9px] text-muted-foreground uppercase">Range</span>
                                                    <select
                                                        value={action.range}
                                                        onChange={(e) => updateAction(i, { range: e.target.value as RangeType })}
                                                        className="w-full bg-black border border-border px-1 py-0.5 font-mono-tech text-[10px] uppercase text-white"
                                                    >
                                                        {RANGE_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
                                                    </select>
                                                </div>
                                                <label className="flex items-end gap-1.5 pb-0.5 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={action.isAttack}
                                                        onChange={(e) => updateAction(i, { isAttack: e.target.checked })}
                                                        className="accent-accent"
                                                    />
                                                    <span className="font-mono-tech text-[10px] uppercase text-white">Attack</span>
                                                </label>
                                            </div>

                                            <Input
                                                value={action.keywords.join(', ')}
                                                onChange={(e) => updateAction(i, { keywords: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                                placeholder="Keywords (comma-sep)"
                                                className="bg-black border-border font-mono-tech text-[10px] h-6"
                                            />

                                            <textarea
                                                value={action.effectDescription}
                                                onChange={(e) => updateAction(i, { effectDescription: e.target.value })}
                                                placeholder="Effect description..."
                                                rows={2}
                                                className="w-full bg-black border border-border px-2 py-1 font-mono-tech text-[10px] text-white placeholder:text-muted-foreground focus:border-secondary focus:outline-none resize-none"
                                            />
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* ── Tier Creation (admin, non-Gonk, base profile only) ── */}
                        {isAdmin && editingLineage && editingProfile?.level === 0 && canHaveTiers(editingLineage) && (() => {
                            const profiles = getProfilesForLineage(editingLineage.id);
                            const hasVet = profiles.some(p => p.level === 1);
                            const hasElite = profiles.some(p => p.level === 2);
                            if (hasVet && hasElite) return null;
                            return (
                                <div className="border border-border/50 p-3 space-y-2">
                                    <span className="font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground">Create Tier Version</span>
                                    <div className="flex gap-2">
                                        {!hasVet && (
                                            <button
                                                onClick={() => { saveCharacter(); addTierVersion(editingLineage!, 1); }}
                                                className="flex-1 py-2 font-mono-tech text-xs uppercase tracking-wider border border-primary/50 text-primary hover:bg-primary/10 transition-colors"
                                            >
                                                + Add Veteran
                                            </button>
                                        )}
                                        {hasVet && !hasElite && (
                                            <button
                                                onClick={() => { saveCharacter(); addTierVersion(editingLineage!, 2); }}
                                                className="flex-1 py-2 font-mono-tech text-xs uppercase tracking-wider border border-accent/50 text-accent hover:bg-accent/10 transition-colors"
                                            >
                                                + Add Elite
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* ── Save Button ── */}
                        <button
                            onClick={saveCharacter}
                            className="w-full bg-primary hover:bg-white text-black font-display font-bold uppercase tracking-wider py-3 clip-corner-br transition-colors"
                        >
                            Save
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ── Action Catalog Create/Edit Sub-Dialog ── */}
            <Dialog open={actionCatalogDialogOpen} onOpenChange={setActionCatalogDialogOpen}>
                <DialogContent className="max-w-sm max-h-[75vh] overflow-y-auto bg-black border-emerald-500/50 text-white !top-[12vh] !translate-y-0">
                    <DialogHeader>
                        <DialogTitle className="font-display text-lg tracking-wider text-emerald-400">
                            {editingCatalogAction ? 'Edit Action' : 'Create Action'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        {/* Name */}
                        <div className="space-y-1">
                            <Label className="font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground">Name</Label>
                            <Input
                                value={actionCatalogForm.name}
                                onChange={(e) => setActionCatalogForm(f => ({ ...f, name: e.target.value }))}
                                placeholder="Action name..."
                                className="bg-black border-border font-mono-tech text-sm"
                            />
                        </div>

                        {/* Skill + Bonus */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground">Skill</Label>
                                <select
                                    value={actionCatalogForm.skillReq ?? ''}
                                    onChange={(e) => setActionCatalogForm(f => ({ ...f, skillReq: e.target.value ? e.target.value as Weapon['skillReq'] : undefined }))}
                                    className="w-full bg-black border border-border px-2 py-1.5 font-mono-tech text-xs uppercase text-white"
                                >
                                    <option value="">None</option>
                                    {SKILL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <Label className="font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground">Skill Bonus</Label>
                                <Input
                                    type="number"
                                    value={actionCatalogForm.skillBonus ?? ''}
                                    onChange={(e) => setActionCatalogForm(f => ({ ...f, skillBonus: e.target.value ? Number(e.target.value) : undefined }))}
                                    placeholder="+1, +2..."
                                    className="bg-black border-border font-mono-tech text-sm"
                                    disabled={!actionCatalogForm.skillReq}
                                />
                            </div>
                        </div>

                        {/* Range checkboxes */}
                        <div className="space-y-2">
                            <Label className="font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground">Range</Label>
                            <div className="flex gap-4">
                                {(['rangeRed', 'rangeYellow', 'rangeGreen', 'rangeLong'] as const).map(key => {
                                    const label = key.replace('range', '');
                                    const color = key === 'rangeRed' ? 'text-red-500' : key === 'rangeYellow' ? 'text-yellow-500' : key === 'rangeGreen' ? 'text-green-500' : 'text-white';
                                    return (
                                        <label key={key} className="flex items-center gap-1.5 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={actionCatalogForm[key]}
                                                onChange={(e) => setActionCatalogForm(f => ({ ...f, [key]: e.target.checked }))}
                                                className="accent-emerald-500"
                                            />
                                            <span className={`font-mono-tech text-[10px] uppercase ${color}`}>{label}</span>
                                        </label>
                                    );
                                })}
                            </div>
                            {/* Range preview */}
                            <div className="w-[70%]">
                                <RangeArrowsPreview
                                    rangeRed={actionCatalogForm.rangeRed}
                                    rangeYellow={actionCatalogForm.rangeYellow}
                                    rangeGreen={actionCatalogForm.rangeGreen}
                                    rangeLong={actionCatalogForm.rangeLong}
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-1">
                            <Label className="font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground">Description</Label>
                            <textarea
                                value={actionCatalogForm.description}
                                onChange={(e) => setActionCatalogForm(f => ({ ...f, description: e.target.value }))}
                                placeholder="Effect description..."
                                rows={3}
                                className="w-full bg-black border border-border px-3 py-2 font-mono-tech text-xs text-white placeholder:text-muted-foreground focus:border-emerald-500 focus:outline-none resize-none"
                            />
                        </div>

                        {/* Save */}
                        <button
                            onClick={saveCatalogAction}
                            disabled={!actionCatalogForm.name.trim()}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-black font-display font-bold uppercase tracking-wider py-2.5 clip-corner-br transition-colors"
                        >
                            {editingCatalogAction ? 'Update Action' : 'Create & Link'}
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}
