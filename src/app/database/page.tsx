'use client';

import { useState, useCallback } from 'react';
import { FactionsTab } from "@/components/database/FactionsTab";
import { ModelsTab } from "@/components/database/ModelsTab";
import { ArmoryContent } from "@/components/database/ArmoryContent";
import { ObjectivesContent } from "@/components/database/ObjectivesContent";
import { ActionsContent } from "@/components/database/ActionsContent";

type TabId = 'factions' | 'models' | 'weapons' | 'gear' | 'programs' | 'loot' | 'objectives' | 'actions';

const TABS: { id: TabId; label: string; activeClass: string }[] = [
    { id: 'factions', label: 'Factions', activeClass: 'bg-accent text-white' },
    { id: 'models', label: 'Characters', activeClass: 'bg-secondary text-black' },
    { id: 'weapons', label: 'Weapons', activeClass: 'bg-accent text-white' },
    { id: 'gear', label: 'Gears', activeClass: 'bg-secondary text-black' },
    { id: 'programs', label: 'Programs', activeClass: 'bg-cyber-purple text-white' },
    { id: 'loot', label: 'Loot', activeClass: 'bg-primary text-black' },
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
    loot: 'Loot',
};

export default function DatabasePage() {
    const [activeTab, setActiveTab] = useState<TabId>('factions');
    const [highlightTarget, setHighlightTarget] = useState<{ tab: string; itemId: string; factionId?: string; ts: number } | null>(null);

    const navigateToCard = useCallback((tab: string, itemId: string, factionId?: string) => {
        setActiveTab(tab as TabId);
        setHighlightTarget({ tab, itemId, factionId, ts: Date.now() });
    }, []);

    const page = PAGE_TITLE[activeTab];

    return (
        <div className="pb-28">
            {/* Page Title */}
            <div className="border-l-4 border-primary pl-6 py-2 mb-8">
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

            {/* Tab Navigation */}
            <div className="flex items-end border-b-2 border-border mb-8 gap-1">
                <div className="flex flex-wrap gap-1 flex-1">
                    {TABS.map(tab => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
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
            {activeTab === 'factions' && <FactionsTab onNavigateToCard={navigateToCard} />}
            {activeTab === 'models' && (
                <ModelsTab
                    highlightId={highlightTarget?.tab === 'models' ? highlightTarget.itemId : undefined}
                    highlightKey={highlightTarget?.tab === 'models' ? highlightTarget.ts : undefined}
                />
            )}
            {activeTab === 'objectives' && (
                <ObjectivesContent
                    highlightId={highlightTarget?.tab === 'objectives' ? highlightTarget.itemId : undefined}
                    highlightKey={highlightTarget?.tab === 'objectives' ? highlightTarget.ts : undefined}
                />
            )}
            {activeTab === 'actions' && <ActionsContent />}
            {ARMORY_MAP[activeTab] && (
                <ArmoryContent
                    activeTab={ARMORY_MAP[activeTab]}
                    highlightId={highlightTarget && ARMORY_MAP[highlightTarget.tab as TabId] === ARMORY_MAP[activeTab] ? highlightTarget.itemId : undefined}
                    highlightFactionId={highlightTarget?.factionId}
                    highlightKey={highlightTarget && ARMORY_MAP[highlightTarget.tab as TabId] === ARMORY_MAP[activeTab] ? highlightTarget.ts : undefined}
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
