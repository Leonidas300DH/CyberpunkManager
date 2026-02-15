'use client';

import { useState } from 'react';
import { FactionsTab } from "@/components/database/FactionsTab";
import { ModelsTab } from "@/components/database/ModelsTab";


type TabId = 'factions' | 'models';

const TABS: { id: TabId; label: string; activeClass: string }[] = [
    { id: 'factions', label: 'Factions', activeClass: 'bg-accent text-white' },
    { id: 'models', label: 'Characters', activeClass: 'bg-secondary text-black' },
];

export default function DatabasePage() {
    const [activeTab, setActiveTab] = useState<TabId>('factions');

    return (
        <div className="pb-28">
            {/* Page Title */}
            <div className="border-l-4 border-primary pl-6 py-2 mb-8">
                <h1
                    className="text-5xl md:text-6xl font-display font-bold text-white uppercase tracking-tighter mb-2 glitch-text"
                    data-text="Faction Registry"
                >
                    Faction <span className="text-primary">Registry</span>
                </h1>
                <p className="font-mono-tech text-secondary text-sm uppercase tracking-widest">
                    Accessing Night City PD Database... Encrypted files decrypted.
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
                                className={`clip-tab px-6 md:px-10 py-3 font-display font-bold text-lg uppercase tracking-wider transition-all ${
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
            {activeTab === 'factions' && <FactionsTab />}
            {activeTab === 'models' && <ModelsTab />}
        </div>
    );
}
