'use client';

import { useState, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { ItemCategory, ActionColor, HackingProgram, ProgramQuality, Weapon } from '@/types';
import { ProgramCard } from '@/components/programs/ProgramCard';
import { formatCardText } from '@/lib/formatCardText';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft, List, Square, Columns2, Plus, Edit, Trash2, Upload, Image as ImageIcon } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

type ViewMode = 'list' | 'card' | 'double';

type TabId = 'Gear' | 'Program' | 'Loot' | 'Objective';

const TABS: { id: TabId; label: string; activeClass: string; border: string; text: string; gradient: string; glow: string }[] = [
    {
        id: 'Gear',
        label: 'Gear',
        activeClass: 'bg-secondary text-black',
        border: 'border-secondary',
        text: 'text-secondary',
        gradient: 'from-secondary to-cyan-900',
        glow: 'group-hover:shadow-[0_0_10px_rgba(0,240,255,0.3)]',
    },
    {
        id: 'Program',
        label: 'Programs',
        activeClass: 'bg-cyber-purple text-white',
        border: 'border-cyber-purple',
        text: 'text-cyber-purple',
        gradient: 'from-cyber-purple to-purple-900',
        glow: 'group-hover:shadow-[0_0_10px_rgba(168,85,247,0.3)]',
    },
    {
        id: 'Loot',
        label: 'Loot',
        activeClass: 'bg-primary text-black',
        border: 'border-primary',
        text: 'text-primary',
        gradient: 'from-primary to-yellow-700',
        glow: 'group-hover:shadow-[0_0_10px_rgba(252,238,10,0.3)]',
    },
    {
        id: 'Objective',
        label: 'Objectives',
        activeClass: 'bg-cyber-green text-black',
        border: 'border-cyber-green',
        text: 'text-cyber-green',
        gradient: 'from-cyber-green to-green-900',
        glow: 'group-hover:shadow-[0_0_10px_rgba(57,255,20,0.3)]',
    },
];

const PAGE_TITLES: Record<TabId, { title: string; accent: string; subtitle: string }> = {
    Gear: {
        title: 'Gear',
        accent: 'Locker',
        subtitle: 'Equipment catalog // Weapons, armor & cyberware',
    },
    Program: {
        title: 'Netrunner',
        accent: 'Programs',
        subtitle: 'ICE breakers & daemons // Handle with care',
    },
    Loot: {
        title: 'Street',
        accent: 'Loot',
        subtitle: 'Salvage & contraband // Night City black market',
    },
    Objective: {
        title: 'Mission',
        accent: 'Objectives',
        subtitle: 'Contract targets // Complete for street cred',
    },
};

const QUALITY_STYLES: Record<ProgramQuality, { bg: string; text: string; border: string; glow: string }> = {
    Green: { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500', glow: 'shadow-[0_0_10px_rgba(16,185,129,0.4)]' },
    Yellow: { bg: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500', glow: 'shadow-[0_0_10px_rgba(234,179,8,0.4)]' },
    Red: { bg: 'bg-red-600', text: 'text-red-400', border: 'border-red-600', glow: 'shadow-[0_0_10px_rgba(220,38,38,0.4)]' },
};

// Faction color map (same as FactionsTab)
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
};

/** Upload image to /images/weapons/ via API */
function WeaponImageUpload({ value, weaponName, onChange }: { value: string; weaponName: string; onChange: (url: string) => void }) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const uploadFile = async (file: File, overwrite: boolean) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', weaponName);
        if (overwrite) formData.append('overwrite', 'true');
        const res = await fetch('/api/upload-weapon-image', { method: 'POST', body: formData });
        return await res.json();
    };

    const handleFile = async (file: File) => {
        if (!weaponName.trim()) {
            alert('Enter a weapon name before uploading an image.');
            return;
        }
        setUploading(true);
        try {
            const data = await uploadFile(file, false);

            if (data.exists) {
                // Ask user for confirmation before overwriting
                const confirmed = window.confirm(
                    `An image already exists for "${weaponName}" (${data.existingFiles.join(', ')}).\n\nOld versions will be deleted and replaced by the new image.\n\nOverwrite?`
                );
                if (!confirmed) {
                    setUploading(false);
                    return;
                }
                // Re-upload with overwrite flag
                const data2 = await uploadFile(file, true);
                if (data2.url) onChange(data2.url);
                else alert(data2.error || 'Upload failed');
            } else if (data.url) {
                onChange(data.url);
            } else {
                alert(data.error || 'Upload failed');
            }
        } catch {
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-2">
            <Label className="font-mono-tech text-xs uppercase tracking-widest">Illustration</Label>
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 shrink-0 border border-border bg-black flex items-center justify-center overflow-hidden">
                    {value ? (
                        <img src={value} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    )}
                </div>
                <div className="flex-1 space-y-2">
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
                        className="flex items-center gap-2 px-3 py-1.5 bg-black border border-border text-white font-mono-tech text-xs uppercase tracking-wider hover:border-secondary transition-colors disabled:opacity-50"
                    >
                        <Upload className="w-3.5 h-3.5" />
                        {uploading ? 'Uploading...' : 'Upload Image'}
                    </button>
                    <Input
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Or paste URL..."
                        className="bg-black border-border font-mono-tech text-xs"
                    />
                </div>
            </div>
        </div>
    );
}

const EMPTY_WEAPON: Partial<Weapon> = {
    name: '', cost: 0, isWeapon: true, isGear: false,
    rangeRed: false, rangeYellow: false, rangeGreen: false, rangeLong: false,
    description: '', rarity: 99, keywords: [],
};

export default function ArmoryPage() {
    const { catalog, setCatalog } = useStore();
    const [activeTab, setActiveTab] = useState<TabId>('Gear');
    const [search, setSearch] = useState('');
    // Program filters
    const [factionFilter, setFactionFilter] = useState<string>('all-factions');
    const [qualityFilter, setQualityFilter] = useState<ProgramQuality | 'all'>('all');
    // Gear/Weapon filters
    const [weaponTypeFilter, setWeaponTypeFilter] = useState<'all' | 'weapon' | 'gear'>('all');
    const [highlightNoImage, setHighlightNoImage] = useState(false);
    const [highlightNoPrice, setHighlightNoPrice] = useState(false);
    const [highlightDefaultRarity, setHighlightDefaultRarity] = useState(false);
    // Weapon CRUD
    const [weaponDialogOpen, setWeaponDialogOpen] = useState(false);
    const [editingWeapon, setEditingWeapon] = useState<Weapon | null>(null);
    const [weaponForm, setWeaponForm] = useState<Partial<Weapon>>(EMPTY_WEAPON);
    // Detail view
    const [selectedProgram, setSelectedProgram] = useState<HackingProgram | null>(null);
    // View mode + card flip state
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

    const tab = TABS.find(t => t.id === activeTab)!;
    const page = PAGE_TITLES[activeTab];

    const programs = catalog.programs ?? [];

    const getFactionName = (factionId: string) => {
        if (factionId === 'all') return 'All';
        return catalog.factions.find(f => f.id === factionId)?.name ?? 'Unknown';
    };

    // Get unique faction IDs from programs
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

    const isWeaponHighlighted = (w: Weapon) =>
        (highlightNoImage && !w.imageUrl) ||
        (highlightNoPrice && w.cost === 0) ||
        (highlightDefaultRarity && w.rarity === 99);
    const filteredWeapons = weapons.filter(w => {
        if (weaponTypeFilter === 'weapon' && !w.isWeapon) return false;
        if (weaponTypeFilter === 'gear' && !w.isGear) return false;
        if (highlightNoImage && w.imageUrl) return false;
        if (highlightNoPrice && w.cost !== 0) return false;
        if (highlightDefaultRarity && w.rarity !== 99) return false;
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
            <div className="pb-28">
                {/* Back button */}
                <button
                    onClick={() => setSelectedProgram(null)}
                    className="flex items-center gap-2 text-muted-foreground hover:text-white font-mono-tech text-sm uppercase tracking-wider mb-4 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" /> Back to Programs
                </button>

                {/* Cards + Program Data side by side */}
                <div className="flex flex-col xl:flex-row gap-6 items-start">
                    {/* Cards */}
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

                    {/* Program Data — compact, to the right */}
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
        setWeaponDialogOpen(true);
    };

    const openWeaponCreate = () => {
        setEditingWeapon(null);
        setWeaponForm({ ...EMPTY_WEAPON });
        setWeaponDialogOpen(true);
    };

    const saveWeapon = () => {
        const currentWeapons = catalog.weapons ?? [];
        if (editingWeapon) {
            const updated = currentWeapons.map(w =>
                w.id === editingWeapon.id ? { ...editingWeapon, ...weaponForm } as Weapon : w
            );
            setCatalog({ ...catalog, weapons: updated });
        } else {
            const newWeapon: Weapon = {
                id: uuidv4(),
                name: weaponForm.name || 'New Weapon',
                cost: weaponForm.cost ?? 0,
                isWeapon: weaponForm.isWeapon ?? true,
                isGear: weaponForm.isGear ?? false,
                rangeRed: weaponForm.rangeRed ?? false,
                rangeYellow: weaponForm.rangeYellow ?? false,
                rangeGreen: weaponForm.rangeGreen ?? false,
                rangeLong: weaponForm.rangeLong ?? false,
                description: weaponForm.description ?? '',
                rarity: weaponForm.rarity ?? 99,
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
        setCatalog({ ...catalog, weapons: (catalog.weapons ?? []).filter(w => w.id !== id) });
    };

    const toggleFlip = (id: string) => {
        setFlippedCards(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    return (
        <div className="pb-28">
            {/* Page Title */}
            <div className={`border-l-4 ${tab.border} pl-6 py-2 mb-8`}>
                <h1
                    className="text-5xl md:text-6xl font-display font-bold uppercase tracking-tighter mb-2 glitch-text"
                    data-text={`${page.title} ${page.accent}`}
                >
                    {page.title} <span className={tab.text}>{page.accent}</span>
                </h1>
                <p className="font-mono-tech text-muted-foreground text-sm uppercase tracking-widest">
                    {page.subtitle}
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap border-b-2 border-border mb-6 gap-1">
                {TABS.map(t => {
                    const isActive = activeTab === t.id;
                    return (
                        <button
                            key={t.id}
                            onClick={() => { setActiveTab(t.id); setSearch(''); setSelectedProgram(null); }}
                            className={`clip-tab px-6 md:px-10 py-3 font-display font-bold text-lg uppercase tracking-wider transition-all ${
                                isActive
                                    ? t.activeClass
                                    : 'bg-black text-muted-foreground border border-border border-b-0 hover:text-secondary hover:border-secondary hover:bg-surface-dark'
                            }`}
                        >
                            {t.label}
                            {t.id === 'Gear' && <span className="ml-2 text-xs opacity-70">{weapons.length}</span>}
                            {t.id === 'Program' && <span className="ml-2 text-xs opacity-70">{programs.length}</span>}
                        </button>
                    );
                })}
            </div>

            {/* PROGRAMS TAB */}
            {activeTab === 'Program' ? (
                <>
                    {/* Programs filters bar */}
                    <div className="mb-6 space-y-4">
                        {/* Search + Quality + count */}
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

                        {/* Faction filter — pinned All/Universal + scrollable faction logos */}
                        <div className="flex gap-2 items-stretch">
                            {/* Pinned: All + Universal */}
                            {programFactions.filter(fid => fid === 'all-factions' || fid === 'all').map(fid => {
                                const isActive = factionFilter === fid;
                                const label = fid === 'all-factions' ? 'All' : 'Universal';
                                return (
                                    <button
                                        key={fid}
                                        onClick={() => setFactionFilter(fid)}
                                        className={`w-[120px] shrink-0 flex flex-col items-center justify-center gap-1.5 px-1.5 pb-2 rounded-sm border-2 transition-all ${
                                            isActive
                                                ? 'border-white bg-white/10 ring-1 ring-white/30'
                                                : 'border-border bg-black hover:border-white/30'
                                        }`}
                                    >
                                        <div className="w-full aspect-square flex items-center justify-center">
                                            <span className={`text-2xl font-display font-bold ${isActive ? 'text-white' : 'text-muted-foreground'}`}>
                                                {fid === 'all-factions' ? '★' : '◎'}
                                            </span>
                                        </div>
                                        <span className={`text-[8px] font-mono-tech uppercase tracking-wider text-center leading-tight ${
                                            isActive ? 'text-white font-bold' : 'text-muted-foreground'
                                        }`}>
                                            {label}
                                        </span>
                                    </button>
                                );
                            })}

                            {/* Separator */}
                            <div className="w-px bg-border shrink-0" />

                            {/* Scrollable faction logos */}
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
                                                className={`w-[120px] shrink-0 flex flex-col items-center justify-center gap-1.5 px-1.5 pb-2 rounded-sm border-2 transition-all ${
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
                                                <span className={`text-[8px] font-mono-tech uppercase tracking-wider text-center leading-tight ${
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
                            { mode: 'list' as ViewMode, icon: List, label: 'Liste' },
                            { mode: 'card' as ViewMode, icon: Square, label: 'Carte' },
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

                    {/* === LIST VIEW === */}
                    {viewMode === 'list' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredPrograms.map(prog => {
                                const qs = QUALITY_STYLES[prog.quality];
                                const factionName = getFactionName(prog.factionId);
                                const fColor = FACTION_COLOR_MAP[prog.factionId] ?? 'border-gray-500';

                                return (
                                    <button
                                        key={prog.id}
                                        onClick={() => setSelectedProgram(prog)}
                                        className={`group relative text-left bg-surface-dark border border-border hover:${qs.border} transition-all duration-200 overflow-hidden`}
                                    >
                                        {/* Background illustration */}
                                        {prog.imageUrl && (
                                            <img
                                                src={prog.imageUrl}
                                                alt=""
                                                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                                                style={{
                                                    opacity: 0.5,
                                                    WebkitMaskImage: 'linear-gradient(to top left, black 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.3) 60%, transparent 100%)',
                                                    maskImage: 'linear-gradient(to top left, black 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.3) 60%, transparent 100%)',
                                                }}
                                            />
                                        )}

                                        {/* Faction color top stripe */}
                                        <div className={`relative z-10 h-1 w-full ${fColor.replace('border-', 'bg-')}`} />

                                        <div className="relative z-10 flex">
                                            {/* Quality sidebar + price */}
                                            <div className={`w-8 shrink-0 ${qs.bg} flex flex-col items-center justify-center py-1 relative`}>
                                                <div className="font-display font-black text-sm text-black leading-none">
                                                    {prog.costEB}
                                                </div>
                                                <div className="font-mono-tech text-[7px] text-black/70 font-bold">EB</div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 px-3 py-2 flex flex-col min-h-[100px]">
                                                <h3 className={`font-display font-bold text-base uppercase leading-tight ${qs.text} group-hover:text-white transition-colors`}>
                                                    {prog.name}
                                                </h3>
                                                <span className="text-[10px] font-mono-tech text-muted-foreground uppercase tracking-wider">
                                                    {factionName}
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* === CARD VIEW — front, click to flip with 3D animation === */}
                    {viewMode === 'card' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredPrograms.map(prog => (
                                <div
                                    key={prog.id}
                                    className="card-flip-container w-full cursor-pointer"
                                    onClick={() => toggleFlip(prog.id)}
                                >
                                    <div className={`card-flip-inner ${flippedCards.has(prog.id) ? 'flipped' : ''}`}>
                                        <div className="card-flip-front">
                                            <ProgramCard program={prog} side="front" />
                                        </div>
                                        <div className="card-flip-back">
                                            <ProgramCard program={prog} side="back" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* === DOUBLE VIEW — front + back side by side === */}
                    {viewMode === 'double' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {filteredPrograms.map(prog => (
                                <div key={prog.id} className="flex gap-3">
                                    <div className="flex-1">
                                        <ProgramCard program={prog} side="front" />
                                    </div>
                                    <div className="flex-1">
                                        <ProgramCard program={prog} side="back" />
                                    </div>
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
            ) : activeTab === 'Gear' ? (
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
                        </div>
                    </div>

                    {/* Weapon Edit/Create Dialog */}
                    <Dialog open={weaponDialogOpen} onOpenChange={setWeaponDialogOpen}>
                        <DialogContent className="bg-surface-dark border-border max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="font-display uppercase tracking-wider text-primary">
                                    {editingWeapon ? 'Edit Weapon' : 'New Weapon'}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label className="font-mono-tech text-xs uppercase tracking-widest">Name</Label>
                                    <Input
                                        value={weaponForm.name || ''}
                                        onChange={(e) => setWeaponForm({ ...weaponForm, name: e.target.value })}
                                        placeholder="Weapon Name"
                                        className="bg-black border-border font-mono-tech"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="font-mono-tech text-xs uppercase tracking-widest">Cost (EB)</Label>
                                        <Input
                                            type="number"
                                            value={weaponForm.cost ?? 0}
                                            onChange={(e) => setWeaponForm({ ...weaponForm, cost: Number(e.target.value) })}
                                            className="bg-black border-border font-mono-tech"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-mono-tech text-xs uppercase tracking-widest">Rarity</Label>
                                        <Input
                                            type="number"
                                            value={weaponForm.rarity ?? 99}
                                            onChange={(e) => setWeaponForm({ ...weaponForm, rarity: Number(e.target.value) })}
                                            className="bg-black border-border font-mono-tech"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={weaponForm.isWeapon ?? true}
                                            onChange={(e) => setWeaponForm({ ...weaponForm, isWeapon: e.target.checked })}
                                            className="accent-secondary"
                                        />
                                        <span className="font-mono-tech text-xs uppercase text-white">Weapon</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={weaponForm.isGear ?? false}
                                            onChange={(e) => setWeaponForm({ ...weaponForm, isGear: e.target.checked })}
                                            className="accent-cyan-400"
                                        />
                                        <span className="font-mono-tech text-xs uppercase text-white">Gear</span>
                                    </label>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-mono-tech text-xs uppercase tracking-widest">Range</Label>
                                    <div className="flex gap-3">
                                        {(['rangeRed', 'rangeYellow', 'rangeGreen', 'rangeLong'] as const).map(field => {
                                            const label = field.replace('range', '');
                                            const colors: Record<string, string> = { Red: 'accent-red-500', Yellow: 'accent-yellow-500', Green: 'accent-emerald-500', Long: 'accent-gray-500' };
                                            return (
                                                <label key={field} className="flex items-center gap-1.5 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={(weaponForm[field] as boolean) ?? false}
                                                        onChange={(e) => setWeaponForm({ ...weaponForm, [field]: e.target.checked })}
                                                        className={colors[label]}
                                                    />
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
                                <WeaponImageUpload
                                    value={weaponForm.imageUrl || ''}
                                    weaponName={weaponForm.name || ''}
                                    onChange={(val) => setWeaponForm({ ...weaponForm, imageUrl: val })}
                                />
                                <button
                                    onClick={saveWeapon}
                                    className="w-full bg-primary hover:bg-white text-black font-display font-bold uppercase tracking-wider py-3 clip-corner-br transition-colors"
                                >
                                    Save
                                </button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Weapons grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredWeapons.map(weapon => {
                            const showRange = weapon.isWeapon && (weapon.rangeRed || weapon.rangeYellow || weapon.rangeGreen || weapon.rangeLong);
                            const isMelee = weapon.isWeapon && !weapon.rangeRed && !weapon.rangeYellow && !weapon.rangeGreen && !weapon.rangeLong;

                            // Range arrows: same logic as CharacterCard/ProgramCard
                            const OFF = 'rgba(100,100,100,0.35)';
                            const OFF_STROKE = 'rgba(255,255,255,0.3)';
                            const ON_STROKE = 'white';

                            return (
                                <div
                                    key={weapon.id}
                                    className={`group relative text-left bg-surface-dark border hover:border-secondary transition-all duration-200 overflow-hidden flex flex-col ${
                                        isWeaponHighlighted(weapon) ? 'border-accent border-2' : 'border-border'
                                    }`}
                                >
                                    {/* Background illustration or placeholder */}
                                    {weapon.imageUrl ? (
                                        <img
                                            src={weapon.imageUrl}
                                            alt=""
                                            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                                            style={{
                                                opacity: 0.55,
                                                WebkitMaskImage: 'linear-gradient(to top left, black 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.3) 60%, transparent 90%)',
                                                maskImage: 'linear-gradient(to top left, black 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.3) 60%, transparent 90%)',
                                            }}
                                        />
                                    ) : (
                                        <div className="absolute top-2 right-2 z-0 opacity-[0.06] pointer-events-none">
                                            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                                                {weapon.isWeapon ? (
                                                    <>
                                                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                                        <polyline points="14 2 14 8 20 8" />
                                                        <line x1="8" y1="13" x2="16" y2="13" />
                                                        <line x1="8" y1="17" x2="16" y2="17" />
                                                    </>
                                                ) : (
                                                    <>
                                                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                                    </>
                                                )}
                                            </svg>
                                        </div>
                                    )}

                                    <div className="relative z-10 flex flex-1">
                                        {/* Type sidebar + price */}
                                        <div className={`w-8 shrink-0 self-stretch ${weapon.isWeapon ? 'bg-secondary' : 'bg-cyan-600'} flex flex-col items-center justify-center py-1`}>
                                            <div className="font-display font-black text-sm text-black leading-none">
                                                {weapon.cost}
                                            </div>
                                            <div className="font-mono-tech text-[7px] text-black/70 font-bold">EB</div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 px-3 py-2 flex flex-col gap-1.5">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h3 className="font-display font-bold text-sm uppercase leading-tight text-white group-hover:text-secondary transition-colors">
                                                        {weapon.name}
                                                    </h3>
                                                    <span className={`text-[9px] font-mono-tech uppercase tracking-wider ${weapon.isWeapon ? 'text-secondary' : 'text-cyan-400'}`}>
                                                        {weapon.isWeapon ? (isMelee ? 'Melee' : 'Ranged') : 'Equipment'}
                                                    </span>
                                                </div>
                                                {/* Edit / Delete */}
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => openWeaponEdit(weapon)}
                                                        className="p-1 text-muted-foreground hover:text-secondary transition-colors"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteWeapon(weapon.id)}
                                                        className="p-1 text-muted-foreground hover:text-accent transition-colors"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Range Arrows (interlocking chevrons) */}
                                            {showRange && (
                                                <div className="w-[80%]">
                                                    <svg viewBox="0 0 220 22" className="w-full h-auto" fill="none">
                                                        <polygon points="1,1 54,1 59,11 54,21 6,21"
                                                            fill={weapon.rangeRed ? '#dc2626' : OFF}
                                                            stroke={weapon.rangeRed ? ON_STROKE : OFF_STROKE} strokeWidth="1.5" strokeLinejoin="round"
                                                            opacity={weapon.rangeRed ? 1 : 0.5} />
                                                        <polygon points="62,1 96,1 101,11 96,21 62,21 67,11"
                                                            fill={weapon.rangeYellow ? '#eab308' : OFF}
                                                            stroke={weapon.rangeYellow ? ON_STROKE : OFF_STROKE} strokeWidth="1.5" strokeLinejoin="round"
                                                            opacity={weapon.rangeYellow ? 1 : 0.5} />
                                                        <polygon points="104,1 138,1 143,11 138,21 104,21 109,11"
                                                            fill={weapon.rangeGreen ? '#22c55e' : OFF}
                                                            stroke={weapon.rangeGreen ? ON_STROKE : OFF_STROKE} strokeWidth="1.5" strokeLinejoin="round"
                                                            opacity={weapon.rangeGreen ? 1 : 0.5} />
                                                        {weapon.rangeLong && (
                                                            <>
                                                                <polygon points="146,1 210,1 215,11 210,21 146,21 151,11"
                                                                    fill="#111111" stroke={ON_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
                                                                <line x1="181" y1="8" x2="181" y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                                                <line x1="178" y1="11" x2="184" y2="11" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                                            </>
                                                        )}
                                                    </svg>
                                                </div>
                                            )}

                                            {/* Description with color words + glossary */}
                                            <p className="text-[11px] font-mono-tech text-white/70 leading-snug">
                                                {formatCardText(weapon.description)}
                                            </p>

                                            {/* Rarity */}
                                            {weapon.rarity < 99 && (
                                                <span className="text-[9px] font-mono-tech text-muted-foreground">RAR. {weapon.rarity}</span>
                                            )}
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
            ) : (
                <>
                    {/* Search for Loot, Objectives tabs */}
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

                    {/* Standard list layout for Loot, Objectives */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredItems.map(item => (
                            <div key={item.id} className={`group bg-surface-dark border border-border hover:${tab.border} transition-all ${tab.glow} relative flex overflow-hidden`}>
                                {/* Colored sidebar */}
                                <div className={`w-2 shrink-0 bg-gradient-to-b ${tab.gradient}`} />

                                <div className="flex-1 flex flex-col">
                                    {/* Header */}
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
                                            <div className={`font-display font-bold text-lg ${tab.text}`}>{item.costEB}</div>
                                            <div className="text-[10px] font-mono-tech text-muted-foreground">EB</div>
                                        </div>
                                    </div>

                                    {/* Body */}
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

                                    {/* Footer */}
                                    <div className="px-3 pb-3 flex justify-between items-center">
                                        {item.rarity < 99 && <span className="text-[10px] font-mono-tech text-muted-foreground">RAR.{item.rarity}</span>}
                                        {item.reqStreetCred > 0 && <span className="text-[10px] font-mono-tech text-secondary">SC {item.reqStreetCred}+</span>}
                                        {activeTab === 'Objective' && item.grantsStreetCredBonus && (
                                            <span className="text-[10px] font-mono-tech text-cyber-green">+{item.grantsStreetCredBonus} SC</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {filteredItems.length === 0 && (
                        <div className="border-2 border-dashed border-border bg-black/50 p-12 text-center clip-corner-tl-br">
                            <h3 className="text-xl font-display font-bold uppercase text-muted-foreground mb-2">No {activeTab === 'Objective' ? 'Objectives' : activeTab} Found</h3>
                            <p className="text-xs font-mono-tech text-muted-foreground uppercase tracking-widest">Database query returned zero results.</p>
                        </div>
                    )}
                </>
            )}

            {/* Footer Status */}
            <div className="mt-12 border-t border-border pt-6 flex justify-between items-center text-muted-foreground font-mono-tech text-xs uppercase tracking-widest">
                <div>Connection Secure <span className="text-cyber-green animate-pulse">●</span></div>
                <div className="hidden md:block">Interface: Neural-Link v9.2</div>
                <div>© 2077 Night City Archives</div>
            </div>
        </div>
    );
}
