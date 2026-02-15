'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { CampaignSelector } from '@/components/campaign/CampaignSelector';
import { CampaignHeader } from '@/components/campaign/CampaignHeader';
import { NewCampaignDialog } from '@/components/campaign/NewCampaignDialog';
import { RosterList } from '@/components/campaign/RosterList';
import { StashList } from '@/components/campaign/StashList';
import { Plus } from 'lucide-react';

type TabId = 'roster' | 'stash' | 'ops' | 'med';

const TABS: { id: TabId; label: string; activeClass: string }[] = [
    { id: 'roster', label: 'Roster', activeClass: 'bg-primary text-black hover:bg-white' },
    { id: 'stash', label: 'Stash', activeClass: 'bg-secondary text-black hover:bg-white' },
    { id: 'ops', label: 'Ops', activeClass: 'bg-accent text-white' },
    { id: 'med', label: 'Med Bay', activeClass: 'bg-white text-black' },
];

export default function HQPage() {
    const { campaigns, catalog } = useStore();
    const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabId>('roster');

    useEffect(() => {
        if (!selectedCampaignId && campaigns.length > 0) {
            setSelectedCampaignId(campaigns[0].id);
        }
    }, [campaigns, selectedCampaignId]);

    const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);
    const selectedFaction = selectedCampaign
        ? catalog.factions.find(f => f.id === selectedCampaign.factionId)
        : undefined;

    return (
        <div className="pb-28">
            <CampaignSelector
                selectedId={selectedCampaignId}
                onSelect={setSelectedCampaignId}
            />

            {selectedCampaign ? (
                <div className="mt-4">
                    <CampaignHeader campaign={selectedCampaign} faction={selectedFaction} />

                    {/* Tab Navigation */}
                    <div className="flex flex-wrap border-b-2 border-border mb-8 gap-1">
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

                    {/* Tab Content */}
                    {activeTab === 'roster' && <RosterList campaign={selectedCampaign} />}
                    {activeTab === 'stash' && <StashList campaign={selectedCampaign} />}
                    {activeTab === 'ops' && (
                        <div className="border-2 border-dashed border-border bg-black/50 p-12 text-center clip-corner-tl-br">
                            <h3 className="text-xl font-display font-bold uppercase text-muted-foreground mb-2">Operations Offline</h3>
                            <p className="text-xs font-mono-tech text-muted-foreground uppercase tracking-widest">System maintenance in progress.</p>
                        </div>
                    )}
                    {activeTab === 'med' && (
                        <div className="border-2 border-dashed border-border bg-black/50 p-12 text-center clip-corner-tl-br">
                            <h3 className="text-xl font-display font-bold uppercase text-muted-foreground mb-2">MedBay Offline</h3>
                            <p className="text-xs font-mono-tech text-muted-foreground uppercase tracking-widest">Auto-doc disabled.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="mt-4 border-2 border-dashed border-border bg-black flex flex-col items-center justify-center min-h-[400px] clip-corner-tl-br p-8 text-center">
                    <div className="h-20 w-20 clip-corner-tr bg-surface-dark border border-border flex items-center justify-center mb-6">
                        <Plus className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <p className="font-display text-2xl text-muted-foreground uppercase tracking-widest mb-2">
                        No Active Campaign
                    </p>
                    <p className="font-mono-tech text-xs text-muted-foreground uppercase tracking-wider mb-6">
                        Initialize new operation in the Combat Zone.
                    </p>
                    <NewCampaignDialog onCampaignCreated={setSelectedCampaignId} />
                </div>
            )}
        </div>
    );
}
