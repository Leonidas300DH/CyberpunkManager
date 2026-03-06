'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { FACTION_COLOR_MAP } from '@/components/shared/ObjectiveCard';
import { FactionsTab } from "@/components/database/FactionsTab";
import { ModelsTab } from "@/components/database/ModelsTab";
import { ArmoryContent } from "@/components/database/ArmoryContent";
import { ObjectivesContent } from "@/components/database/ObjectivesContent";
import { ActionsContent } from "@/components/database/ActionsContent";
import { LootsContent } from "@/components/database/LootsContent";
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { Search, Plus, Eye, SlidersHorizontal } from 'lucide-react';
import type { ProgramQuality } from '@/types';

type TabId = 'factions' | 'models' | 'weapons' | 'gear' | 'programs' | 'loot' | 'objectives' | 'actions';
type ViewMode = 'list' | 'card' | 'double';

const TABS: { id: TabId; label: string; activeClass: string }[] = [
    { id: 'factions', label: 'Factions', activeClass: 'bg-accent text-white' },
    { id: 'models', label: 'Characters', activeClass: 'bg-secondary text-black' },
    { id: 'weapons', label: 'Weapons', activeClass: 'bg-accent text-white' },
    { id: 'gear', label: 'Gears', activeClass: 'bg-secondary text-black' },
    { id: 'programs', label: 'Programs', activeClass: 'bg-cyber-purple text-white' },
    { id: 'loot', label: 'Loot', activeClass: 'bg-purple-500 text-white' },
    { id: 'objectives', label: 'Objectives', activeClass: 'bg-cyber-green text-black' },
    { id: 'actions', label: 'Actions', activeClass: 'bg-emerald-500 text-black' },
];

const PAGE_TITLE: Record<TabId, { title: string; accent: string; subtitle: string }> = {
    factions: { title: 'Faction', accent: 'Registry', subtitle: 'Accessing Night City PD Database... Encrypted files decrypted.' },
    models: { title: 'Character', accent: 'Database', subtitle: 'Known operatives // Profiles & lineages' },
    weapons: { title: 'Weapon', accent: 'Arsenal', subtitle: 'Firearms & blades // Night City armory clearance' },
    gear: { title: 'Gear', accent: 'Locker', subtitle: 'Equipment catalog // Armor & cyberware' },
    programs: { title: 'Netrunner', accent: 'Programs', subtitle: 'ICE breakers & daemons // Handle with care' },
    loot: { title: 'Street', accent: 'Loot', subtitle: 'Salvage & contraband // Night City black market' },
    objectives: { title: 'Mission', accent: 'Objectives', subtitle: 'Contract targets // Complete for street cred' },
    actions: { title: 'Action', accent: 'Library', subtitle: 'Innate abilities & passive rules // Character actions catalog' },
};

const ARMORY_MAP: Record<string, 'Weapon' | 'Gear' | 'Program' | 'Loot'> = {
    weapons: 'Weapon',
    gear: 'Gear',
    programs: 'Program',
};

const SEARCH_PLACEHOLDER: Record<TabId, string> = {
    factions: 'Search factions...',
    models: 'Search characters...',
    weapons: 'Search weapons...',
    gear: 'Search gear...',
    programs: 'Search programs...',
    loot: 'Search loot...',
    objectives: 'Search objectives...',
    actions: 'Search actions...',
};

// Tabs that support +New
const TABS_WITH_CREATE: TabId[] = ['factions', 'models', 'weapons', 'gear', 'programs', 'loot', 'objectives', 'actions'];

// Tabs that have view modes
const TABS_WITH_VIEWS: TabId[] = ['programs', 'weapons', 'gear'];

// Tabs that have admin filters
const TABS_WITH_FILTERS: TabId[] = ['models', 'weapons', 'gear', 'programs', 'objectives'];

export default function DatabasePage() {
    const [activeTab, setActiveTab] = useState<TabId>('factions');
    const [highlightTarget, setHighlightTarget] = useState<{ tab: string; itemId: string; factionId?: string; ts: number } | null>(null);
    const [factionFilter, setFactionFilter] = useState<string>('all');
    const isAdmin = useIsAdmin();

    const { catalog, displaySettings, setDisplaySettings } = useStore();

    // ── Persisted view modes (from displaySettings) ──
    const programViewMode = (displaySettings.programViewMode ?? 'list') as ViewMode;
    const gearViewMode = displaySettings.gearViewMode ?? 'card';
    const gearStacked = displaySettings.gearStacked ?? true;
    const setProgramViewMode = (m: ViewMode) => setDisplaySettings({ programViewMode: m });
    const setGearViewMode = (m: 'list' | 'card') => setDisplaySettings({ gearViewMode: m });
    const setGearStacked = (fn: (prev: boolean) => boolean) => setDisplaySettings({ gearStacked: fn(gearStacked) });

    // ── Lifted state (session-only) ──
    const [search, setSearch] = useState('');
    const [triggerCreate, setTriggerCreate] = useState(0);

    // Models filters
    const [modelsTypeFilter, setModelsTypeFilter] = useState<string>('all');
    const [modelsSourceFilter, setModelsSourceFilter] = useState<'all' | 'Custom' | 'Upload'>('all');
    const [modelsImageFilter, setModelsImageFilter] = useState<'all' | 'default' | 'custom'>('all');

    // Programs filter
    const [qualityFilter, setQualityFilter] = useState<ProgramQuality | 'all'>('all');

    // Weapons/Gear filters
    const [highlightNoImage, setHighlightNoImage] = useState(false);
    const [highlightNoPrice, setHighlightNoPrice] = useState(false);
    const [highlightDefaultRarity, setHighlightDefaultRarity] = useState(false);
    const [armorySourceFilter, setArmorySourceFilter] = useState<'all' | 'Custom' | 'Upload' | 'Manual'>('all');

    // Objectives
    const [showOnlyIncomplete, setShowOnlyIncomplete] = useState(false);

    // Reset search on tab change
    const handleTabChange = useCallback((tab: TabId) => {
        setActiveTab(tab);
        setSearch('');
    }, []);

    // Regular factions sorted alphabetically, then deck factions at the end
    const allBarFactions = useMemo(() => {
        const regular = catalog.factions.filter(f => !f.id.startsWith('deck-')).sort((a, b) => a.name.localeCompare(b.name));
        const decks = catalog.factions.filter(f => f.id.startsWith('deck-'));
        return [...regular, ...decks];
    }, [catalog.factions]);

    const navigateToCard = useCallback((tab: string, itemId: string, factionId?: string) => {
        setActiveTab(tab as TabId);
        setFactionFilter('all');
        setSearch('');
        setHighlightTarget({ tab, itemId, factionId, ts: Date.now() });
    }, []);

    // ── Popover state ──
    const [viewsOpen, setViewsOpen] = useState(false);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const viewsRef = useRef<HTMLDivElement>(null);
    const viewsBtnRef = useRef<HTMLButtonElement>(null);
    const filtersRef = useRef<HTMLDivElement>(null);
    const filtersBtnRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!viewsOpen && !filtersOpen) return;
        function handleClick(e: MouseEvent) {
            if (viewsOpen && viewsRef.current && !viewsRef.current.contains(e.target as Node) && viewsBtnRef.current && !viewsBtnRef.current.contains(e.target as Node)) {
                setViewsOpen(false);
            }
            if (filtersOpen && filtersRef.current && !filtersRef.current.contains(e.target as Node) && filtersBtnRef.current && !filtersBtnRef.current.contains(e.target as Node)) {
                setFiltersOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [viewsOpen, filtersOpen]);

    const page = PAGE_TITLE[activeTab];

    const showCreate = isAdmin && TABS_WITH_CREATE.includes(activeTab);
    const showViews = TABS_WITH_VIEWS.includes(activeTab);
    const showFilters = isAdmin && TABS_WITH_FILTERS.includes(activeTab);

    // All lineage types for models filter
    const allModelTypes = useMemo(() => Array.from(new Set(catalog.lineages.map(l => l.type))), [catalog.lineages]);

    return (
        <div className="pb-28">
            {/* Page Title + Toolbar */}
            <div className="flex items-start justify-between gap-4 mb-8">
                <div className="border-l-4 border-primary pl-6 py-2">
                    <h1
                        className="text-5xl md:text-6xl font-display font-bold text-white uppercase tracking-tighter mb-2 glitch-text"
                        data-text={`${page.title} ${page.accent}`}
                    >
                        {page.title} <span className="text-primary">{page.accent}</span>
                    </h1>
                    <p className="font-mono-tech text-secondary text-sm uppercase tracking-widest">
                        {page.subtitle}
                    </p>
                </div>

                {/* Unified Toolbar */}
                <div className="flex flex-col items-end gap-1.5 shrink-0 pt-3">
                    {/* Row 1: Search + New + Filters */}
                    <div className="flex items-center gap-2">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={SEARCH_PLACEHOLDER[activeTab]}
                                className="bg-black border border-border pl-8 pr-3 py-1.5 font-mono-tech text-xs text-white placeholder:text-muted-foreground focus:border-secondary focus:outline-none w-44 md:w-56"
                            />
                        </div>

                        {/* +New */}
                        {showCreate && (
                            <button
                                onClick={() => setTriggerCreate(v => v + 1)}
                                className="flex items-center gap-1.5 px-3 py-1.5 border border-border bg-black text-muted-foreground hover:border-secondary hover:text-secondary font-mono-tech text-xs uppercase tracking-wider transition-all"
                                title="Create new"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span className="hidden md:inline">New</span>
                            </button>
                        )}

                        {/* Filters */}
                    {showFilters && (
                        <div className="relative">
                            <button
                                ref={filtersBtnRef}
                                onClick={() => { setFiltersOpen(v => !v); setViewsOpen(false); }}
                                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 border font-mono-tech text-xs uppercase tracking-wider transition-all md:min-w-[100px] ${
                                    filtersOpen ? 'border-secondary text-secondary bg-secondary/10' : 'border-border bg-black text-muted-foreground hover:border-secondary hover:text-secondary'
                                }`}
                                title="Filters"
                            >
                                <SlidersHorizontal className="w-3.5 h-3.5" />
                                <span className="hidden md:inline">Filters</span>
                            </button>
                            {filtersOpen && (
                                <div ref={filtersRef} className="absolute z-50 top-full mt-1 right-0 w-72 bg-surface-dark border border-border p-3 space-y-3">

                                    {/* Models filters */}
                                    {activeTab === 'models' && (
                                        <>
                                            <div>
                                                <div className="font-mono-tech text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5">Type</div>
                                                <div className="flex gap-1 flex-wrap">
                                                    <button onClick={() => setModelsTypeFilter('all')} className={`px-2.5 py-1 text-[10px] font-mono-tech uppercase tracking-wider transition-all ${modelsTypeFilter === 'all' ? 'bg-primary text-black font-bold' : 'bg-black border border-border text-muted-foreground hover:text-white'}`}>All</button>
                                                    {allModelTypes.map(type => (
                                                        <button key={type} onClick={() => setModelsTypeFilter(type)} className={`px-2.5 py-1 text-[10px] font-mono-tech uppercase tracking-wider transition-all ${modelsTypeFilter === type ? 'bg-secondary text-black font-bold' : 'bg-black border border-border text-muted-foreground hover:text-white'}`}>{type}</button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-mono-tech text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5">Source</div>
                                                <div className="flex gap-1 flex-wrap">
                                                    {(['all', 'Custom', 'Upload'] as const).map(v => (
                                                        <button key={v} onClick={() => setModelsSourceFilter(v)} className={`px-2.5 py-1 text-[10px] font-mono-tech uppercase tracking-wider transition-all ${modelsSourceFilter === v ? 'bg-primary text-black font-bold' : 'bg-black border border-border text-muted-foreground hover:text-white'}`}>{v === 'all' ? 'All' : v}</button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-mono-tech text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5">Image</div>
                                                <div className="flex gap-1 flex-wrap">
                                                    {([['all', 'All'], ['custom', 'Custom'], ['default', 'Default']] as const).map(([v, label]) => (
                                                        <button key={v} onClick={() => setModelsImageFilter(v)} className={`px-2.5 py-1 text-[10px] font-mono-tech uppercase tracking-wider transition-all ${modelsImageFilter === v ? 'bg-primary text-black font-bold' : 'bg-black border border-border text-muted-foreground hover:text-white'}`}>{label}</button>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Weapons/Gear filters */}
                                    {(activeTab === 'weapons' || activeTab === 'gear') && (
                                        <>
                                            <div>
                                                <div className="font-mono-tech text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5">Highlight</div>
                                                <div className="flex gap-1 flex-wrap">
                                                    {([
                                                        { label: 'No Image', active: highlightNoImage, toggle: () => setHighlightNoImage(v => !v) },
                                                        { label: 'No Price', active: highlightNoPrice, toggle: () => setHighlightNoPrice(v => !v) },
                                                        { label: 'No Rarity', active: highlightDefaultRarity, toggle: () => setHighlightDefaultRarity(v => !v) },
                                                    ]).map(({ label, active, toggle }) => (
                                                        <button key={label} onClick={toggle} className={`px-2.5 py-1 text-[10px] font-mono-tech uppercase tracking-wider transition-all ${active ? 'bg-accent text-white font-bold border border-accent' : 'bg-black border border-border text-muted-foreground hover:text-white'}`}>{label}</button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-mono-tech text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5">Source</div>
                                                <div className="flex gap-1 flex-wrap">
                                                    {(['all', 'Custom', 'Upload', 'Manual'] as const).map(src => (
                                                        <button key={src} onClick={() => setArmorySourceFilter(src)} className={`px-2.5 py-1 text-[10px] font-mono-tech uppercase tracking-wider transition-all ${armorySourceFilter === src ? 'bg-secondary text-black font-bold border border-secondary' : 'bg-black border border-border text-muted-foreground hover:text-white'}`}>{src === 'all' ? 'All' : src}</button>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Programs filter */}
                                    {activeTab === 'programs' && (
                                        <div>
                                            <div className="font-mono-tech text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5">Quality</div>
                                            <div className="flex gap-1 flex-wrap">
                                                {(['all', 'Red', 'Yellow', 'Green'] as const).map(q => (
                                                    <button key={q} onClick={() => setQualityFilter(q)} className={`px-2.5 py-1 text-[10px] font-mono-tech uppercase tracking-wider transition-all ${qualityFilter === q ? (q === 'all' ? 'bg-white text-black font-bold' : q === 'Red' ? 'bg-red-600 text-black font-bold' : q === 'Yellow' ? 'bg-yellow-500 text-black font-bold' : 'bg-emerald-500 text-black font-bold') : 'bg-black border border-border text-muted-foreground hover:text-white'}`}>{q === 'all' ? 'All' : q}</button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Objectives filter */}
                                    {activeTab === 'objectives' && (
                                        <div>
                                            <div className="font-mono-tech text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5">Show</div>
                                            <button
                                                onClick={() => setShowOnlyIncomplete(v => !v)}
                                                className={`px-2.5 py-1 text-[10px] font-mono-tech uppercase tracking-wider transition-all ${showOnlyIncomplete ? 'bg-orange-600/20 border border-orange-500 text-orange-400 font-bold' : 'bg-black border border-border text-muted-foreground hover:text-white'}`}
                                            >
                                                Incomplete only
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    </div>

                    {/* Row 2: Views (right-aligned below row 1) */}
                    {showViews && (
                        <div className="relative">
                            <button
                                ref={viewsBtnRef}
                                onClick={() => { setViewsOpen(v => !v); setFiltersOpen(false); }}
                                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 border font-mono-tech text-xs uppercase tracking-wider transition-all md:min-w-[100px] ${
                                    viewsOpen ? 'border-secondary text-secondary bg-secondary/10' : 'border-border bg-black text-muted-foreground hover:border-secondary hover:text-secondary'
                                }`}
                                title="View mode"
                            >
                                <Eye className="w-3.5 h-3.5" />
                                <span className="hidden md:inline">Views</span>
                            </button>
                            {viewsOpen && (
                                <div ref={viewsRef} className="absolute z-50 top-full mt-1 right-0 w-48 bg-surface-dark border border-border p-3 space-y-2">
                                    {activeTab === 'programs' && (
                                        <>
                                            <div className="font-mono-tech text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Program View</div>
                                            {(['list', 'card', 'double'] as ViewMode[]).map(mode => (
                                                <button
                                                    key={mode}
                                                    onClick={() => { setProgramViewMode(mode); setViewsOpen(false); }}
                                                    className={`block w-full text-left px-2 py-1 font-mono-tech text-xs uppercase tracking-wider transition-all ${
                                                        programViewMode === mode ? 'text-cyber-purple bg-cyber-purple/10' : 'text-muted-foreground hover:text-white'
                                                    }`}
                                                >
                                                    {mode === 'list' ? 'List' : mode === 'card' ? 'Card' : 'Double'}
                                                </button>
                                            ))}
                                        </>
                                    )}
                                    {(activeTab === 'weapons' || activeTab === 'gear') && (
                                        <>
                                            <div className="font-mono-tech text-[10px] text-muted-foreground uppercase tracking-widest mb-1">View Mode</div>
                                            {(['list', 'card'] as const).map(mode => (
                                                <button
                                                    key={mode}
                                                    onClick={() => { setGearViewMode(mode); setViewsOpen(false); }}
                                                    className={`block w-full text-left px-2 py-1 font-mono-tech text-xs uppercase tracking-wider transition-all ${
                                                        gearViewMode === mode ? 'text-secondary bg-secondary/10' : 'text-muted-foreground hover:text-white'
                                                    }`}
                                                >
                                                    {mode === 'list' ? 'List' : 'Card'}
                                                </button>
                                            ))}
                                            <div className="border-t border-border pt-2 mt-2">
                                                <button
                                                    onClick={() => setGearStacked(s => !s)}
                                                    className={`block w-full text-left px-2 py-1 font-mono-tech text-xs uppercase tracking-wider transition-all ${
                                                        gearStacked ? 'text-secondary bg-secondary/10' : 'text-muted-foreground hover:text-white'
                                                    }`}
                                                >
                                                    {gearStacked ? 'Stacked' : 'Flat'}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Faction Filter Bar */}
            <div className="flex gap-2 items-stretch mb-6">
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
                        {allBarFactions.map(faction => {
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
                                        <img
                                            src={faction.imageUrl}
                                            alt={faction.name}
                                            className="w-full aspect-square object-contain"
                                            style={{ opacity: isActive ? 1 : 0.4 }}
                                        />
                                    )}
                                    {!faction.imageUrl && (
                                        <div className="w-full aspect-square flex items-center justify-center">
                                            <span className={`text-xs font-display font-bold ${isActive ? 'text-white' : 'text-muted-foreground'}`}>
                                                {faction.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    <span className={`text-[7px] font-mono-tech uppercase tracking-wider text-center leading-tight ${
                                        isActive ? 'text-white font-bold' : 'text-muted-foreground'
                                    }`}>
                                        {faction.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-end border-b-2 border-border mb-8 gap-1">
                <div className="flex flex-wrap gap-1 flex-1">
                    {TABS.map(tab => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`clip-tab px-3 md:px-5 py-2.5 font-display font-bold text-sm md:text-base uppercase tracking-wider transition-all ${
                                    isActive
                                        ? tab.activeClass
                                        : 'bg-black text-muted-foreground border border-border border-b-0 hover:text-secondary hover:border-secondary hover:bg-surface-dark'
                                }`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'factions' && (
                <FactionsTab
                    onNavigateToCard={navigateToCard}
                    factionFilter={factionFilter}
                    search={search}
                    triggerCreate={triggerCreate}
                />
            )}
            {activeTab === 'models' && (
                <ModelsTab
                    highlightId={highlightTarget?.tab === 'models' ? highlightTarget.itemId : undefined}
                    highlightKey={highlightTarget?.tab === 'models' ? highlightTarget.ts : undefined}
                    factionFilter={factionFilter}
                    search={search}
                    typeFilter={modelsTypeFilter}
                    sourceFilter={modelsSourceFilter}
                    imageFilter={modelsImageFilter}
                    triggerCreate={triggerCreate}
                />
            )}
            {activeTab === 'objectives' && (
                <ObjectivesContent
                    highlightId={highlightTarget?.tab === 'objectives' ? highlightTarget.itemId : undefined}
                    highlightKey={highlightTarget?.tab === 'objectives' ? highlightTarget.ts : undefined}
                    factionFilter={factionFilter}
                    search={search}
                    showOnlyIncomplete={showOnlyIncomplete}
                    triggerCreate={triggerCreate}
                />
            )}
            {activeTab === 'actions' && (
                <ActionsContent
                    search={search}
                    triggerCreate={triggerCreate}
                />
            )}
            {activeTab === 'loot' && (
                <LootsContent
                    search={search}
                    triggerCreate={triggerCreate}
                />
            )}
            {ARMORY_MAP[activeTab] && (
                <ArmoryContent
                    activeTab={ARMORY_MAP[activeTab]}
                    highlightId={highlightTarget && ARMORY_MAP[highlightTarget.tab as TabId] === ARMORY_MAP[activeTab] ? highlightTarget.itemId : undefined}
                    highlightFactionId={highlightTarget?.factionId}
                    highlightKey={highlightTarget && ARMORY_MAP[highlightTarget.tab as TabId] === ARMORY_MAP[activeTab] ? highlightTarget.ts : undefined}
                    factionFilter={factionFilter}
                    search={search}
                    qualityFilter={qualityFilter}
                    highlightNoImage={highlightNoImage}
                    highlightNoPrice={highlightNoPrice}
                    highlightDefaultRarity={highlightDefaultRarity}
                    sourceFilter={armorySourceFilter}
                    viewMode={programViewMode}
                    gearViewMode={gearViewMode}
                    gearStacked={gearStacked}
                    triggerCreate={triggerCreate}
                />
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
