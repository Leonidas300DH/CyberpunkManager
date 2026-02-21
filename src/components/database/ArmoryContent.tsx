'use client';

import { useState, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { ItemCategory, ActionColor, HackingProgram, ProgramQuality, Weapon, FactionVariant } from '@/types';
import { ProgramCard } from '@/components/programs/ProgramCard';
import { formatCardText } from '@/lib/formatCardText';
import { resolveVariant } from '@/lib/variants';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft, List, Square, Columns2, Plus, Edit, Trash2, Upload, X as XIcon } from 'lucide-react';
import { useCardGrid } from '@/hooks/useCardGrid';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { v4 as uuidv4 } from 'uuid';

type ViewMode = 'list' | 'card' | 'double';

const QUALITY_STYLES: Record<ProgramQuality, { bg: string; text: string; border: string; glow: string }> = {
    Green: { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500', glow: 'shadow-[0_0_10px_rgba(16,185,129,0.4)]' },
    Yellow: { bg: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500', glow: 'shadow-[0_0_10px_rgba(234,179,8,0.4)]' },
    Red: { bg: 'bg-red-600', text: 'text-red-400', border: 'border-red-600', glow: 'shadow-[0_0_10px_rgba(220,38,38,0.4)]' },
};

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
    'all': 'border-gray-500',
    'universal': 'border-gray-500',
};

const TAB_STYLES: Record<string, { border: string; text: string; gradient: string; glow: string }> = {
    Gear: { border: 'border-secondary', text: 'text-secondary', gradient: 'from-secondary to-cyan-900', glow: 'group-hover:shadow-[0_0_10px_rgba(0,240,255,0.3)]' },
    Program: { border: 'border-cyber-purple', text: 'text-cyber-purple', gradient: 'from-cyber-purple to-purple-900', glow: 'group-hover:shadow-[0_0_10px_rgba(168,85,247,0.3)]' },
    Loot: { border: 'border-primary', text: 'text-primary', gradient: 'from-primary to-yellow-700', glow: 'group-hover:shadow-[0_0_10px_rgba(252,238,10,0.3)]' },
    Objective: { border: 'border-cyber-green', text: 'text-cyber-green', gradient: 'from-cyber-green to-green-900', glow: 'group-hover:shadow-[0_0_10px_rgba(57,255,20,0.3)]' },
};

/** Resize image client-side and return as data URL */
function resizeImageToDataUrl(file: File, size: number, quality: number): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            if (!ctx) { reject(new Error('Canvas not supported')); return; }
            // Cover crop: use the largest centered square from the source
            const srcSize = Math.min(img.width, img.height);
            const sx = (img.width - srcSize) / 2;
            const sy = (img.height - srcSize) / 2;
            ctx.drawImage(img, sx, sy, srcSize, srcSize, 0, 0, size, size);
            resolve(canvas.toDataURL('image/webp', quality));
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
    });
}

/** Client-side image upload — resizes and stores as data URL */
function WeaponImageUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleFile = async (file: File) => {
        setUploading(true);
        try {
            const dataUrl = await resizeImageToDataUrl(file, 512, 0.8);
            onChange(dataUrl);
        } catch {
            alert('Failed to process image');
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
                className="relative w-full aspect-square border border-border bg-black flex items-center justify-center overflow-hidden cursor-pointer hover:border-secondary transition-colors group disabled:opacity-50"
            >
                {value ? (
                    <img src={value} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-secondary transition-colors">
                        <Upload className="w-8 h-8" />
                        <span className="font-mono-tech text-[10px] uppercase tracking-widest">Click to upload</span>
                    </div>
                )}
                {value && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="flex items-center gap-2 text-white">
                            <Upload className="w-5 h-5" />
                            <span className="font-mono-tech text-xs uppercase tracking-wider">{uploading ? 'Processing...' : 'Replace'}</span>
                        </div>
                    </div>
                )}
            </button>
        </div>
    );
}

const DEFAULT_WEAPON_IMAGE = '/images/weapons/default.png';

const EMPTY_WEAPON: Partial<Weapon> & { variantRows?: FactionVariant[] } = {
    name: '', source: 'Manual', isWeapon: true, isGear: false,
    factionVariants: [{ factionId: 'universal', cost: 0, rarity: 99, reqStreetCred: 0 }],
    rangeRed: false, rangeYellow: false, rangeGreen: false, rangeLong: false,
    description: '', keywords: [], imageUrl: DEFAULT_WEAPON_IMAGE,
};

const hasNoImage = (w: Weapon) => !w.imageUrl || w.imageUrl === DEFAULT_WEAPON_IMAGE;

type ArmoryTab = 'Gear' | 'Program' | 'Loot' | 'Objective';

export function ArmoryContent({ activeTab }: { activeTab: ArmoryTab }) {
    const { catalog, setCatalog } = useStore();
    const { gridClass, cardStyle } = useCardGrid();
    const isAdmin = useIsAdmin();
    const [search, setSearch] = useState('');
    // Program filters
    const [factionFilter, setFactionFilter] = useState<string>('all-factions');
    const [qualityFilter, setQualityFilter] = useState<ProgramQuality | 'all'>('all');
    // Gear/Weapon filters
    const [weaponTypeFilter, setWeaponTypeFilter] = useState<'all' | 'weapon' | 'gear'>('all');
    const [gearFactionFilters, setGearFactionFilters] = useState<Set<string>>(new Set());
    const toggleGearFaction = (fid: string) => {
        setGearFactionFilters(prev => {
            const next = new Set(prev);
            if (next.has(fid)) next.delete(fid); else next.add(fid);
            return next;
        });
    };
    const [highlightNoImage, setHighlightNoImage] = useState(false);
    const [highlightNoPrice, setHighlightNoPrice] = useState(false);
    const [highlightDefaultRarity, setHighlightDefaultRarity] = useState(false);
    // Weapon CRUD
    const [weaponDialogOpen, setWeaponDialogOpen] = useState(false);
    const [editingWeapon, setEditingWeapon] = useState<Weapon | null>(null);
    const [weaponForm, setWeaponForm] = useState<Partial<Weapon>>(EMPTY_WEAPON);
    const [variantRows, setVariantRows] = useState<FactionVariant[]>([{ factionId: 'universal', cost: 0, rarity: 99, reqStreetCred: 0 }]);
    // Detail view
    const [selectedProgram, setSelectedProgram] = useState<HackingProgram | null>(null);
    // View mode + card flip state
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

    const tab = TAB_STYLES[activeTab] ?? TAB_STYLES.Gear;
    const programs = catalog.programs ?? [];

    const getFactionName = (factionId: string) => {
        if (factionId === 'all') return 'All';
        return catalog.factions.find(f => f.id === factionId)?.name ?? 'Unknown';
    };

    const programFactions = ['all-factions', 'all', ...Array.from(new Set(
        programs.filter(p => p.factionId !== 'all').map(p => p.factionId)
    )).sort((a, b) => getFactionName(a).localeCompare(getFactionName(b)))];

    const filteredPrograms = programs.filter(p => {
        if (factionFilter !== 'all-factions') {
            if (factionFilter === 'all' && p.factionId !== 'all') return false;
            if (factionFilter !== 'all' && p.factionId !== factionFilter) return false;
        }
        if (qualityFilter !== 'all' && p.quality !== qualityFilter) return false;
        if (search) {
            const q = search.toLowerCase();
            return p.name.toLowerCase().includes(q) ||
                p.loadedText.toLowerCase().includes(q) ||
                p.runningEffect.toLowerCase().includes(q) ||
                getFactionName(p.factionId).toLowerCase().includes(q);
        }
        return true;
    }).sort((a, b) => a.name.localeCompare(b.name));

    const filteredItems = catalog.items.filter(item => {
        if (item.category !== activeTab) return false;
        if (!search) return true;
        return item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.keywords.some(k => k.toLowerCase().includes(search.toLowerCase())) ||
            item.passiveRules?.toLowerCase().includes(search.toLowerCase());
    });

    const weapons = catalog.weapons ?? [];

    const isWeaponHighlighted = (w: Weapon) => {
        return (highlightNoImage && hasNoImage(w)) ||
            (highlightNoPrice && w.factionVariants.some(fv => fv.cost === 0)) ||
            (highlightDefaultRarity && w.factionVariants.every(fv => fv.rarity === 99));
    };
    const filteredWeapons = weapons.filter(w => {
        if (weaponTypeFilter === 'weapon' && !w.isWeapon) return false;
        if (weaponTypeFilter === 'gear' && !w.isGear) return false;
        if (highlightNoImage && !hasNoImage(w)) return false;
        if (highlightNoPrice && !w.factionVariants.some(fv => fv.cost === 0)) return false;
        if (highlightDefaultRarity && !w.factionVariants.every(fv => fv.rarity === 99)) return false;
        if (gearFactionFilters.size > 0) {
            const hasMatchingVariant = w.factionVariants.some(v => gearFactionFilters.has(v.factionId));
            if (!hasMatchingVariant) return false;
        }
        if (search) {
            const q = search.toLowerCase();
            return w.name.toLowerCase().includes(q) || w.description.toLowerCase().includes(q);
        }
        return true;
    }).sort((a, b) => a.name.localeCompare(b.name));

    // Programs detail view
    if (selectedProgram) {
        const detailQs = QUALITY_STYLES[selectedProgram.quality];
        return (
            <div>
                <button
                    onClick={() => setSelectedProgram(null)}
                    className="flex items-center gap-2 text-muted-foreground hover:text-white font-mono-tech text-sm uppercase tracking-wider mb-4 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" /> Back to Programs
                </button>
                <div className="flex flex-col xl:flex-row gap-6 items-start">
                    <div className="flex flex-col lg:flex-row gap-6 items-start">
                        <div className="flex flex-col items-center w-[300px] shrink-0">
                            <span className="text-[10px] font-mono-tech text-muted-foreground uppercase tracking-[0.3em] mb-2">Loaded</span>
                            <ProgramCard program={selectedProgram} side="front" />
                        </div>
                        <div className="flex flex-col items-center w-[300px] shrink-0">
                            <span className="text-[10px] font-mono-tech text-muted-foreground uppercase tracking-[0.3em] mb-2">Running</span>
                            <ProgramCard program={selectedProgram} side="back" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-[240px]">
                        <div className="bg-surface-dark border border-border">
                            <div className="bg-black px-3 py-2 border-b border-border">
                                <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">{selectedProgram.name}</h3>
                            </div>
                            <div className="divide-y divide-border">
                                {[
                                    ['Faction', getFactionName(selectedProgram.factionId)],
                                    ['Quality', selectedProgram.quality],
                                    ['Cost', `${selectedProgram.costEB} EB`],
                                    ['SC Req', selectedProgram.reqStreetCred > 0 ? `Lvl ${selectedProgram.reqStreetCred}` : '—'],
                                    ['Range', selectedProgram.range],
                                    ['Tech Test', selectedProgram.techTest ? 'Yes' : 'No'],
                                    ['Vulnerable', selectedProgram.vulnerable ? 'Yes' : 'No'],
                                    ['Reload', selectedProgram.reloadCondition],
                                ].map(([label, value]) => (
                                    <div key={label} className="flex justify-between items-center px-3 py-1.5">
                                        <span className="text-[10px] font-mono-tech text-muted-foreground uppercase tracking-wider">{label}</span>
                                        <span className="text-xs font-mono-tech text-white">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const openWeaponEdit = (weapon: Weapon) => {
        setEditingWeapon(weapon);
        setWeaponForm(weapon);
        setVariantRows([...weapon.factionVariants]);
        setWeaponDialogOpen(true);
    };

    const openWeaponCreate = () => {
        setEditingWeapon(null);
        setWeaponForm({ ...EMPTY_WEAPON });
        setVariantRows([{ factionId: 'universal', cost: 0, rarity: 99, reqStreetCred: 0 }]);
        setWeaponDialogOpen(true);
    };

    const saveWeapon = () => {
        const currentWeapons = catalog.weapons ?? [];
        const finalVariants = variantRows.length > 0 ? variantRows : [{ factionId: 'universal', cost: 0, rarity: 99, reqStreetCred: 0 }];
        if (editingWeapon) {
            const updated = currentWeapons.map(w =>
                w.id === editingWeapon.id ? { ...editingWeapon, ...weaponForm, factionVariants: finalVariants } as Weapon : w
            );
            setCatalog({ ...catalog, weapons: updated });
        } else {
            const newWeapon: Weapon = {
                id: uuidv4(),
                name: weaponForm.name || 'New Weapon',
                source: 'Manual',
                factionVariants: finalVariants,
                isWeapon: weaponForm.isWeapon ?? true,
                isGear: weaponForm.isGear ?? false,
                rangeRed: weaponForm.rangeRed ?? false,
                rangeYellow: weaponForm.rangeYellow ?? false,
                rangeGreen: weaponForm.rangeGreen ?? false,
                rangeLong: weaponForm.rangeLong ?? false,
                description: weaponForm.description ?? '',
                skillReq: weaponForm.skillReq,
                keywords: weaponForm.keywords ?? [],
                imageUrl: weaponForm.imageUrl,
            };
            setCatalog({ ...catalog, weapons: [...currentWeapons, newWeapon] });
        }
        setWeaponDialogOpen(false);
        setEditingWeapon(null);
        setWeaponForm(EMPTY_WEAPON);
    };

    const deleteWeapon = (id: string) => {
        const weapon = (catalog.weapons ?? []).find(w => w.id === id);
        if (!weapon || !window.confirm(`Delete "${weapon.name}"? This cannot be undone.`)) return;
        setCatalog({ ...catalog, weapons: (catalog.weapons ?? []).filter(w => w.id !== id) });
    };

    const toggleFlip = (id: string) => {
        setFlippedCards(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const OFF = 'rgba(100,100,100,0.35)';
    const OFF_STROKE = 'rgba(255,255,255,0.3)';
    const ON_STROKE = 'white';
    const AP = {
        red:    '1,1 44,1 49,11 44,21 5,21',
        yellow: '52,1 95,1 100,11 95,21 52,21 57,11',
        green:  '103,1 145,1 150,11 145,21 103,21 108,11',
        long:   '153,1 218,1 223,11 218,21 153,21 158,11',
        plusCx: 188,
    };

    if (activeTab === 'Program') {
        return (
            <>
                {/* Programs filters bar */}
                <div className="mb-6 space-y-4">
                    <div className="flex items-center gap-3 bg-surface-dark/50 p-4 border border-border flex-wrap">
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="SEARCH PROGRAMS..."
                            className="bg-black border border-border px-4 py-2 text-sm font-mono-tech uppercase text-white placeholder:text-muted-foreground focus:border-cyber-purple focus:outline-none w-full md:w-56"
                        />
                        <div className="flex gap-1">
                            {(['all', 'Red', 'Yellow', 'Green'] as const).map(q => {
                                const isActive = qualityFilter === q;
                                const qs = q === 'all' ? null : QUALITY_STYLES[q];
                                return (
                                    <button
                                        key={q}
                                        onClick={() => setQualityFilter(q)}
                                        className={`px-3 py-1.5 text-xs font-mono-tech uppercase tracking-wider transition-all ${
                                            isActive
                                                ? q === 'all'
                                                    ? 'bg-white text-black'
                                                    : `${qs!.bg} text-black font-bold`
                                                : 'bg-black border border-border text-muted-foreground hover:text-white'
                                        }`}
                                    >
                                        {q === 'all' ? 'All' : q}
                                    </button>
                                );
                            })}
                        </div>
                        <span className="font-mono-tech text-xs text-muted-foreground uppercase tracking-widest ml-auto hidden md:block">
                            <span className="text-cyber-purple">{filteredPrograms.length}</span> / {programs.length}
                        </span>
                    </div>

                    {/* Faction filter */}
                    <div className="flex gap-2 items-stretch">
                        {programFactions.filter(fid => fid === 'all-factions' || fid === 'all').map(fid => {
                            const isActive = factionFilter === fid;
                            const label = fid === 'all-factions' ? 'All' : 'Universal';
                            return (
                                <button
                                    key={fid}
                                    onClick={() => setFactionFilter(fid)}
                                    className={`w-[80px] shrink-0 flex flex-col items-center justify-center gap-1 px-1 pb-1.5 rounded-sm border-2 transition-all ${
                                        isActive
                                            ? 'border-white bg-white/10 ring-1 ring-white/30'
                                            : 'border-border bg-black hover:border-white/30'
                                    }`}
                                >
                                    <div className="w-full aspect-square flex items-center justify-center">
                                        <span className={`text-xl font-display font-bold ${isActive ? 'text-white' : 'text-muted-foreground'}`}>
                                            {fid === 'all-factions' ? '★' : '◎'}
                                        </span>
                                    </div>
                                    <span className={`text-[7px] font-mono-tech uppercase tracking-wider text-center leading-tight ${
                                        isActive ? 'text-white font-bold' : 'text-muted-foreground'
                                    }`}>
                                        {label}
                                    </span>
                                </button>
                            );
                        })}
                        <div className="w-px bg-border shrink-0" />
                        <div className="flex-1 overflow-x-auto min-w-0 no-scrollbar">
                            <div className="flex gap-2 w-max">
                                {programFactions.filter(fid => fid !== 'all-factions' && fid !== 'all').map(fid => {
                                    const isActive = factionFilter === fid;
                                    const faction = catalog.factions.find(f => f.id === fid);
                                    const fColor = FACTION_COLOR_MAP[fid] ?? 'border-gray-500';
                                    const label = getFactionName(fid);
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
                </div>

                {/* View mode selector */}
                <div className="flex gap-1 mb-4">
                    {([
                        { mode: 'list' as ViewMode, icon: List, label: 'List' },
                        { mode: 'card' as ViewMode, icon: Square, label: 'Card' },
                        { mode: 'double' as ViewMode, icon: Columns2, label: 'Double' },
                    ]).map(({ mode, icon: Icon, label }) => (
                        <button
                            key={mode}
                            onClick={() => { setViewMode(mode); setFlippedCards(new Set()); }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono-tech uppercase tracking-wider transition-all ${
                                viewMode === mode
                                    ? 'bg-cyber-purple text-white'
                                    : 'bg-black border border-border text-muted-foreground hover:text-white'
                            }`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            {label}
                        </button>
                    ))}
                </div>

                {viewMode === 'list' && (
                    <div className={gridClass}>
                        {filteredPrograms.map(prog => {
                            const qs = QUALITY_STYLES[prog.quality];
                            const factionName = getFactionName(prog.factionId);
                            const fColor = FACTION_COLOR_MAP[prog.factionId] ?? 'border-gray-500';
                            return (
                                <button
                                    key={prog.id}
                                    onClick={() => setSelectedProgram(prog)}
                                    style={cardStyle}
                                    className={`group relative text-left bg-surface-dark border border-border hover:${qs.border} transition-all duration-200 overflow-hidden`}
                                >
                                    {prog.imageUrl && (
                                        <img src={prog.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                                            style={{ opacity: 0.5, WebkitMaskImage: 'linear-gradient(to top left, black 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.3) 60%, transparent 100%)', maskImage: 'linear-gradient(to top left, black 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.3) 60%, transparent 100%)' }} />
                                    )}
                                    <div className={`relative z-10 h-1 w-full ${fColor.replace('border-', 'bg-')}`} />
                                    <div className="relative z-10 flex">
                                        <div className={`w-8 shrink-0 ${qs.bg} flex flex-col items-center justify-center py-1 relative`}>
                                            <div className="font-display font-black text-sm text-black leading-none">{prog.costEB}</div>
                                            <div className="font-mono-tech text-[7px] text-black/70 font-bold">EB</div>
                                        </div>
                                        <div className="flex-1 px-3 py-2 flex flex-col min-h-[100px]">
                                            <h3 className={`font-display font-bold text-base uppercase leading-tight ${qs.text} group-hover:text-white transition-colors`}>{prog.name}</h3>
                                            <span className="text-[10px] font-mono-tech text-muted-foreground uppercase tracking-wider">{factionName}</span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}

                {viewMode === 'card' && (
                    <div className={gridClass}>
                        {filteredPrograms.map(prog => (
                            <div key={prog.id} className="card-flip-container w-full cursor-pointer" style={cardStyle} onClick={() => toggleFlip(prog.id)}>
                                <div className={`card-flip-inner ${flippedCards.has(prog.id) ? 'flipped' : ''}`}>
                                    <div className="card-flip-front"><ProgramCard program={prog} side="front" /></div>
                                    <div className="card-flip-back"><ProgramCard program={prog} side="back" /></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {viewMode === 'double' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredPrograms.map(prog => (
                            <div key={prog.id} className="flex gap-3">
                                <div className="flex-1"><ProgramCard program={prog} side="front" /></div>
                                <div className="flex-1"><ProgramCard program={prog} side="back" /></div>
                            </div>
                        ))}
                    </div>
                )}

                {filteredPrograms.length === 0 && (
                    <div className="border-2 border-dashed border-border bg-black/50 p-12 text-center clip-corner-tl-br">
                        <h3 className="text-xl font-display font-bold uppercase text-muted-foreground mb-2">No Programs Found</h3>
                        <p className="text-xs font-mono-tech text-muted-foreground uppercase tracking-widest">Database query returned zero results.</p>
                    </div>
                )}
            </>
        );
    }

    if (activeTab === 'Gear') {
        return (
            <>
                {/* Gear/Weapons filters + Add button */}
                <div className="mb-6 space-y-4">
                    <div className="flex items-center gap-3 bg-surface-dark/50 p-4 border border-border flex-wrap">
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="SEARCH GEAR..."
                            className="bg-black border border-border px-4 py-2 text-sm font-mono-tech uppercase text-white placeholder:text-muted-foreground focus:border-secondary focus:outline-none w-full md:w-56"
                        />
                        <div className="flex gap-1">
                            {(['all', 'weapon', 'gear'] as const).map(t => (
                                <button
                                    key={t}
                                    onClick={() => setWeaponTypeFilter(t)}
                                    className={`px-3 py-1.5 text-xs font-mono-tech uppercase tracking-wider transition-all ${
                                        weaponTypeFilter === t
                                            ? 'bg-secondary text-black font-bold'
                                            : 'bg-black border border-border text-muted-foreground hover:text-white'
                                    }`}
                                >
                                    {t === 'all' ? 'All' : t === 'weapon' ? 'Weapons' : 'Equipment'}
                                </button>
                            ))}
                        </div>
                        <span className="font-mono-tech text-xs text-muted-foreground uppercase tracking-widest ml-auto hidden md:block">
                            <span className="text-secondary">{filteredWeapons.length}</span> / {weapons.length}
                        </span>
                        {isAdmin && (
                            <>
                                <div className="w-px h-6 bg-border mx-1" />
                                {([
                                    { label: 'No Image', active: highlightNoImage, toggle: () => setHighlightNoImage(v => !v) },
                                    { label: 'No Price', active: highlightNoPrice, toggle: () => setHighlightNoPrice(v => !v) },
                                    { label: 'No Rarity', active: highlightDefaultRarity, toggle: () => setHighlightDefaultRarity(v => !v) },
                                ] as const).map(({ label, active, toggle }) => (
                                    <button
                                        key={label}
                                        onClick={toggle}
                                        className={`px-3 py-1.5 text-xs font-mono-tech uppercase tracking-wider transition-all ${
                                            active
                                                ? 'bg-accent text-white font-bold border border-accent'
                                                : 'bg-black border border-border text-muted-foreground hover:text-white'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                                <button
                                    onClick={openWeaponCreate}
                                    className="bg-primary hover:bg-white text-black font-display font-bold uppercase tracking-wider px-4 py-2 clip-corner-br transition-colors flex items-center gap-2 text-sm"
                                >
                                    <Plus className="w-4 h-4" /> Add
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Gear faction filter — multi-select */}
                <div className="flex gap-2 items-stretch mb-6">
                    <button
                        onClick={() => setGearFactionFilters(new Set())}
                        className={`w-[80px] shrink-0 flex flex-col items-center justify-center gap-1 px-1 pb-1.5 rounded-sm border-2 transition-all ${
                            gearFactionFilters.size === 0
                                ? 'border-white bg-white/10 ring-1 ring-white/30'
                                : 'border-border bg-black hover:border-white/30'
                        }`}
                    >
                        <div className="w-full aspect-square flex items-center justify-center">
                            <span className={`text-xl font-display font-bold ${gearFactionFilters.size === 0 ? 'text-white' : 'text-muted-foreground'}`}>★</span>
                        </div>
                        <span className={`text-[7px] font-mono-tech uppercase tracking-wider text-center leading-tight ${gearFactionFilters.size === 0 ? 'text-white font-bold' : 'text-muted-foreground'}`}>All</span>
                    </button>
                    <button
                        onClick={() => toggleGearFaction('universal')}
                        className={`w-[80px] shrink-0 flex flex-col items-center justify-center gap-1 px-1 pb-1.5 rounded-sm border-2 transition-all ${
                            gearFactionFilters.has('universal')
                                ? 'border-gray-500 bg-white/10 ring-1 ring-white/30'
                                : 'border-border bg-black hover:border-white/30'
                        }`}
                    >
                        <div className="w-full aspect-square flex items-center justify-center">
                            <span className={`text-xl font-display font-bold ${gearFactionFilters.has('universal') ? 'text-white' : 'text-muted-foreground'}`}>◎</span>
                        </div>
                        <span className={`text-[7px] font-mono-tech uppercase tracking-wider text-center leading-tight ${gearFactionFilters.has('universal') ? 'text-white font-bold' : 'text-muted-foreground'}`}>Universal</span>
                    </button>
                    <div className="w-px bg-border shrink-0" />
                    <div className="flex-1 overflow-x-auto min-w-0 no-scrollbar">
                        <div className="flex gap-2 w-max">
                            {catalog.factions.map(faction => {
                                const isActive = gearFactionFilters.has(faction.id);
                                const fColor = FACTION_COLOR_MAP[faction.id] ?? 'border-gray-500';
                                return (
                                    <button
                                        key={faction.id}
                                        onClick={() => toggleGearFaction(faction.id)}
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

                {/* Weapon Edit/Create Dialog */}
                <Dialog open={weaponDialogOpen} onOpenChange={setWeaponDialogOpen}>
                    <DialogContent className="bg-surface-dark border-border max-w-sm max-h-[85vh] overflow-y-auto !top-[8vh] !translate-y-0">
                        <DialogHeader>
                            <DialogTitle className="font-display uppercase tracking-wider text-primary">
                                {editingWeapon ? 'Edit Weapon' : 'New Weapon'}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3 py-2">
                            <WeaponImageUpload value={weaponForm.imageUrl || ''} onChange={(val) => setWeaponForm({ ...weaponForm, imageUrl: val })} />
                            <div className="space-y-2">
                                <Label className="font-mono-tech text-xs uppercase tracking-widest">Name</Label>
                                <Input value={weaponForm.name || ''} onChange={(e) => setWeaponForm({ ...weaponForm, name: e.target.value })} placeholder="Weapon Name" className="bg-black border-border font-mono-tech" />
                            </div>
                            {/* Faction Variants Table */}
                            <div className="space-y-2">
                                <Label className="font-mono-tech text-xs uppercase tracking-widest">Faction Variants</Label>
                                <div className="border border-border bg-black">
                                    <div className="grid grid-cols-[1fr_50px_50px_40px_28px] gap-1 px-2 py-1 border-b border-border text-[9px] font-mono-tech text-muted-foreground uppercase tracking-wider">
                                        <span>Faction</span><span>Cost</span><span>Rar.</span><span>SC</span><span></span>
                                    </div>
                                    {variantRows.map((v, i) => {
                                        const fName = v.factionId === 'universal' ? 'Universal' : (catalog.factions.find(f => f.id === v.factionId)?.name ?? v.factionId);
                                        return (
                                            <div key={i} className="grid grid-cols-[1fr_50px_50px_40px_28px] gap-1 px-2 py-1 border-b border-border/50 items-center">
                                                <span className="font-mono-tech text-[10px] text-white truncate">{fName}</span>
                                                <Input type="number" value={v.cost} onChange={(e) => { const rows = [...variantRows]; rows[i] = { ...rows[i], cost: Number(e.target.value) }; setVariantRows(rows); }} className="bg-black border-border font-mono-tech text-xs h-6 px-1" />
                                                <Input type="number" value={v.rarity} onChange={(e) => { const rows = [...variantRows]; rows[i] = { ...rows[i], rarity: Number(e.target.value) }; setVariantRows(rows); }} className="bg-black border-border font-mono-tech text-xs h-6 px-1" />
                                                <Input type="number" value={v.reqStreetCred} onChange={(e) => { const rows = [...variantRows]; rows[i] = { ...rows[i], reqStreetCred: Number(e.target.value) }; setVariantRows(rows); }} className="bg-black border-border font-mono-tech text-xs h-6 px-1" />
                                                <button onClick={() => setVariantRows(variantRows.filter((_, j) => j !== i))} className="p-0.5 text-muted-foreground hover:text-accent transition-colors" title="Remove variant">
                                                    <XIcon className="w-3 h-3" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                    {/* Add variant row */}
                                    <div className="px-2 py-1.5">
                                        <select
                                            onChange={(e) => {
                                                if (!e.target.value) return;
                                                setVariantRows([...variantRows, { factionId: e.target.value, cost: 0, rarity: 99, reqStreetCred: 0 }]);
                                                e.target.value = '';
                                            }}
                                            className="bg-black border border-border px-2 py-1 font-mono-tech text-[10px] uppercase text-muted-foreground w-full"
                                            defaultValue=""
                                        >
                                            <option value="">+ Add variant...</option>
                                            {!variantRows.some(v => v.factionId === 'universal') && <option value="universal">Universal</option>}
                                            {catalog.factions.filter(f => !variantRows.some(v => v.factionId === f.id)).map(f => (
                                                <option key={f.id} value={f.id}>{f.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-4 items-center">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={weaponForm.isWeapon ?? true} onChange={(e) => setWeaponForm({ ...weaponForm, isWeapon: e.target.checked })} className="accent-secondary" />
                                    <span className="font-mono-tech text-xs uppercase text-white">Weapon</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={weaponForm.isGear ?? false} onChange={(e) => setWeaponForm({ ...weaponForm, isGear: e.target.checked })} className="accent-cyan-400" />
                                    <span className="font-mono-tech text-xs uppercase text-white">Gear</span>
                                </label>
                                <div className="w-px h-5 bg-border" />
                                <Label className="font-mono-tech text-xs uppercase tracking-widest text-muted-foreground">Skill</Label>
                                <select
                                    value={weaponForm.skillReq ?? ''}
                                    onChange={(e) => setWeaponForm({ ...weaponForm, skillReq: (e.target.value as 'Melee' | 'Ranged') || undefined })}
                                    className="bg-black border border-border px-2 py-1 font-mono-tech text-xs uppercase text-white"
                                >
                                    <option value="">None</option>
                                    <option value="Melee">Melee</option>
                                    <option value="Ranged">Ranged</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label className="font-mono-tech text-xs uppercase tracking-widest">Range</Label>
                                <div className="flex gap-3">
                                    {(['rangeRed', 'rangeYellow', 'rangeGreen', 'rangeLong'] as const).map(field => {
                                        const label = field.replace('range', '');
                                        const colors: Record<string, string> = { Red: 'accent-red-500', Yellow: 'accent-yellow-500', Green: 'accent-emerald-500', Long: 'accent-gray-500' };
                                        return (
                                            <label key={field} className="flex items-center gap-1.5 cursor-pointer">
                                                <input type="checkbox" checked={(weaponForm[field] as boolean) ?? false} onChange={(e) => setWeaponForm({ ...weaponForm, [field]: e.target.checked })} className={colors[label]} />
                                                <span className="font-mono-tech text-xs uppercase text-white">{label}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="font-mono-tech text-xs uppercase tracking-widest">Description</Label>
                                <textarea
                                    value={weaponForm.description || ''}
                                    onChange={(e) => setWeaponForm({ ...weaponForm, description: e.target.value })}
                                    placeholder="Weapon effect/rules..."
                                    rows={3}
                                    className="w-full bg-black border border-border px-3 py-2 font-mono-tech text-sm text-white placeholder:text-muted-foreground focus:border-secondary focus:outline-none resize-none"
                                />
                            </div>
                            <button onClick={saveWeapon} className="w-full bg-primary hover:bg-white text-black font-display font-bold uppercase tracking-wider py-3 clip-corner-br transition-colors">Save</button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Weapons grid */}
                <div className={gridClass}>
                    {filteredWeapons.map(weapon => {
                        const showRange = weapon.rangeRed || weapon.rangeYellow || weapon.rangeGreen || weapon.rangeLong;
                        const skillIcon = weapon.skillReq === 'Melee' ? '/images/Skills Icons/melee.png' : weapon.skillReq === 'Ranged' ? '/images/Skills Icons/ranged.png' : null;
                        const displayVariant = resolveVariant(weapon.factionVariants, gearFactionFilters.size === 1 ? [...gearFactionFilters][0] : undefined);
                        return (
                            <div key={weapon.id} style={cardStyle} className={`group relative text-left bg-surface-dark border hover:border-secondary transition-all duration-200 overflow-hidden flex flex-col ${isWeaponHighlighted(weapon) ? 'border-accent border-2' : 'border-border'}`}>
                                {weapon.imageUrl ? (
                                    <img src={weapon.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                                        style={{ opacity: 0.55, WebkitMaskImage: 'linear-gradient(to top left, black 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.3) 60%, transparent 90%)', maskImage: 'linear-gradient(to top left, black 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.3) 60%, transparent 90%)' }} />
                                ) : (
                                    <div className="absolute top-2 right-2 z-0 opacity-[0.06] pointer-events-none">
                                        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                                            {weapon.isWeapon ? (<><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" /></>) : (<><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></>)}
                                        </svg>
                                    </div>
                                )}
                                {/* Variant faction badges */}
                                <div className="absolute top-1 right-1 z-10 flex gap-0.5">
                                    {weapon.factionVariants.map(v => {
                                        const fColor = FACTION_COLOR_MAP[v.factionId] ?? 'border-gray-500';
                                        return <div key={v.factionId} className={`w-2 h-2 border ${fColor} ${fColor.replace('border-', 'bg-')}`} title={v.factionId === 'universal' ? 'Universal' : (catalog.factions.find(f => f.id === v.factionId)?.name ?? v.factionId)} />;
                                    })}
                                </div>
                                <div className="relative z-10 flex flex-1">
                                    <div className={`w-8 shrink-0 self-stretch ${weapon.isWeapon ? 'bg-secondary' : 'bg-cyan-600'} flex flex-col items-center justify-center py-1 gap-0.5`}>
                                        <div className="font-display font-black text-sm text-black leading-none">{displayVariant.cost}</div>
                                        <div className="font-mono-tech text-[7px] text-black/70 font-bold">EB</div>
                                        {displayVariant.rarity < 99 && (
                                            <div className="font-mono-tech text-[8px] font-bold leading-none mt-0.5 text-black/60"
                                                title={`Rarity: max ${displayVariant.rarity} per team`}>
                                                ×{displayVariant.rarity}
                                            </div>
                                        )}
                                        {(displayVariant.reqStreetCred ?? 0) > 0 && (
                                            <div className="font-mono-tech text-[7px] font-bold leading-none text-black/60"
                                                title={`Requires Street Cred ${displayVariant.reqStreetCred}`}>
                                                SC{displayVariant.reqStreetCred}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 px-3 py-2 flex flex-col gap-0.5">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="font-display font-bold text-sm uppercase leading-tight text-white group-hover:text-secondary transition-colors">{weapon.name}</h3>
                                                <span className="text-[9px] font-mono-tech text-muted-foreground uppercase tracking-wider">
                                                    {weapon.factionVariants.map(v => v.factionId === 'universal' ? 'Universal' : (catalog.factions.find(f => f.id === v.factionId)?.name ?? v.factionId)).join(' · ')}
                                                </span>
                                            </div>
                                            {isAdmin && (
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => openWeaponEdit(weapon)} className="p-1 text-muted-foreground hover:text-secondary transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                                                    <button onClick={() => deleteWeapon(weapon.id)} className="p-1 text-muted-foreground hover:text-accent transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                                </div>
                                            )}
                                        </div>
                                        {showRange && (
                                            <div className="-ml-2 flex items-center gap-2">
                                                {skillIcon && (
                                                    <img src={skillIcon} alt={weapon.skillReq!} className="w-12 h-12 -my-[3px] shrink-0 object-contain" />
                                                )}
                                                <div className="w-[60%]">
                                                    <svg viewBox="0 0 228 22" className="w-full h-auto" fill="none">
                                                        <polygon points={AP.red} fill={weapon.rangeRed ? '#dc2626' : OFF} stroke={weapon.rangeRed ? ON_STROKE : OFF_STROKE} strokeWidth="1.5" strokeLinejoin="round" opacity={weapon.rangeRed ? 1 : 0.5} />
                                                        <polygon points={AP.yellow} fill={weapon.rangeYellow ? '#eab308' : OFF} stroke={weapon.rangeYellow ? ON_STROKE : OFF_STROKE} strokeWidth="1.5" strokeLinejoin="round" opacity={weapon.rangeYellow ? 1 : 0.5} />
                                                        <polygon points={AP.green} fill={weapon.rangeGreen ? '#22c55e' : OFF} stroke={weapon.rangeGreen ? ON_STROKE : OFF_STROKE} strokeWidth="1.5" strokeLinejoin="round" opacity={weapon.rangeGreen ? 1 : 0.5} />
                                                        {weapon.rangeLong && (
                                                            <>
                                                                <polygon points={AP.long} fill="#111111" stroke={ON_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
                                                                <line x1={AP.plusCx} y1="8" x2={AP.plusCx} y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                                                <line x1={AP.plusCx - 3} y1="11" x2={AP.plusCx + 3} y2="11" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                                            </>
                                                        )}
                                                    </svg>
                                                </div>
                                            </div>
                                        )}
                                        <p className="text-[11px] font-mono-tech text-white/70 leading-snug">{formatCardText(weapon.description)}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredWeapons.length === 0 && (
                    <div className="border-2 border-dashed border-border bg-black/50 p-12 text-center clip-corner-tl-br">
                        <h3 className="text-xl font-display font-bold uppercase text-muted-foreground mb-2">No Gear Found</h3>
                        <p className="text-xs font-mono-tech text-muted-foreground uppercase tracking-widest">Database query returned zero results.</p>
                    </div>
                )}
            </>
        );
    }

    // Loot & Objectives
    return (
        <>
            <div className="mb-8 flex items-center gap-4 bg-surface-dark/50 p-4 border border-border">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="SEARCH..."
                    className={`bg-black border border-border px-4 py-2 text-sm font-mono-tech uppercase text-white placeholder:text-muted-foreground focus:${tab.border} focus:outline-none w-full md:w-64`}
                />
                <span className="font-mono-tech text-xs text-muted-foreground uppercase tracking-widest hidden md:block">
                    <span className={tab.text}>{filteredItems.length}</span> item{filteredItems.length !== 1 ? 's' : ''} loaded
                </span>
            </div>

            <div className={gridClass}>
                {filteredItems.map(item => (
                    <div key={item.id} style={cardStyle} className={`group bg-surface-dark border border-border hover:${tab.border} transition-all ${tab.glow} relative flex overflow-hidden`}>
                        <div className={`w-2 shrink-0 bg-gradient-to-b ${tab.gradient}`} />
                        <div className="flex-1 flex flex-col">
                            <div className="bg-black p-3 border-b border-border flex justify-between items-start">
                                <div>
                                    <h4 className="font-display text-lg text-white uppercase tracking-tight leading-tight">{item.name}</h4>
                                    {item.keywords.length > 0 && (
                                        <div className="flex gap-2 mt-1 flex-wrap">
                                            {item.keywords.map((kw, i) => (
                                                <span key={i} className="text-[10px] font-mono-tech text-muted-foreground border border-border px-1 uppercase">{kw}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="text-right shrink-0 ml-3">
                                    <div className={`font-display font-bold text-lg ${tab.text}`}>{resolveVariant(item.factionVariants).cost}</div>
                                    <div className="text-[10px] font-mono-tech text-muted-foreground">EB</div>
                                </div>
                            </div>
                            <div className="p-3 flex-1">
                                {item.passiveRules && (
                                    <div className={`bg-black/50 border-l-2 ${tab.border} pl-2 py-1 mb-2`}>
                                        <p className="text-xs font-mono-tech text-muted-foreground leading-tight">{item.passiveRules}</p>
                                    </div>
                                )}
                                {item.grantedActions.length > 0 && (
                                    <div className="space-y-1">
                                        {item.grantedActions.map(action => (
                                            <div key={action.id} className="flex justify-between items-center text-[10px] border-t border-border pt-1">
                                                <span className="font-mono-tech text-white uppercase">{action.name}</span>
                                                <span className={`font-mono-tech ${tab.text}`}>{action.range}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="px-3 pb-3 flex justify-between items-center">
                                {resolveVariant(item.factionVariants).rarity < 99 && <span className="text-[10px] font-mono-tech text-muted-foreground">RAR.{resolveVariant(item.factionVariants).rarity}</span>}
                                {resolveVariant(item.factionVariants).reqStreetCred > 0 && <span className="text-[10px] font-mono-tech text-secondary">SC {resolveVariant(item.factionVariants).reqStreetCred}+</span>}
                                {activeTab === 'Objective' && item.grantsStreetCredBonus && (
                                    <span className="text-[10px] font-mono-tech text-cyber-green">+{item.grantsStreetCredBonus} SC</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredItems.length === 0 && (
                <div className="border-2 border-dashed border-border bg-black/50 p-12 text-center clip-corner-tl-br">
                    <h3 className="text-xl font-display font-bold uppercase text-muted-foreground mb-2">No {activeTab === 'Objective' ? 'Objectives' : activeTab} Found</h3>
                    <p className="text-xs font-mono-tech text-muted-foreground uppercase tracking-widest">Database query returned zero results.</p>
                </div>
            )}
        </>
    );
}
