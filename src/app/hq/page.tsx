'use client';

import { useState, useEffect, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { CampaignHeader } from '@/components/campaign/CampaignHeader';
import { NewCampaignDialog } from '@/components/campaign/NewCampaignDialog';
import { RosterList } from '@/components/campaign/RosterList';
import { StashList } from '@/components/campaign/StashList';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';

const FACTION_ACCENT: Record<string, string> = {
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
};

const STARTER_IMAGES = Array.from({ length: 18 }, (_, i) => {
    const ids = [
        '35427469-67fa-4ba3-be22-b0685991a472_0',
        '35427469-67fa-4ba3-be22-b0685991a472_1',
        '35427469-67fa-4ba3-be22-b0685991a472_2',
        '35427469-67fa-4ba3-be22-b0685991a472_3',
        '577136d2-0f2c-4b0b-bfff-959d38cacd8f_0',
        '577136d2-0f2c-4b0b-bfff-959d38cacd8f_1',
        '59686ec5-e1e1-49fc-8263-c285b3a91287_0',
        '59686ec5-e1e1-49fc-8263-c285b3a91287_1',
        '59686ec5-e1e1-49fc-8263-c285b3a91287_2',
        '59686ec5-e1e1-49fc-8263-c285b3a91287_3',
        'edc97f40-b13d-4274-b7d3-c1911dc54eec_0',
        'edc97f40-b13d-4274-b7d3-c1911dc54eec_1',
        'edc97f40-b13d-4274-b7d3-c1911dc54eec_2',
        'edc97f40-b13d-4274-b7d3-c1911dc54eec_3',
        'f4c34555-ee61-4e42-be29-316794e0cb20_0',
        'f4c34555-ee61-4e42-be29-316794e0cb20_1',
        'f4c34555-ee61-4e42-be29-316794e0cb20_2',
        'f4c34555-ee61-4e42-be29-316794e0cb20_3',
    ];
    return `/images/Campaign Starter/leonidas300_Static_wide_shot_of_the_streets_of_Neo-Tokyo_at_n_${ids[i]}.png`;
});

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

    const starterImage = useMemo(() => STARTER_IMAGES[Math.floor(Math.random() * STARTER_IMAGES.length)], []);

    const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);
    const selectedFaction = selectedCampaign
        ? catalog.factions.find(f => f.id === selectedCampaign.factionId)
        : undefined;

    return (
        <div className="pb-28">
            {/* ── Campaign Selector Bar ── */}
            <div className="flex items-stretch gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {/* Existing campaigns */}
                {campaigns.map(c => {
                    const faction = catalog.factions.find(f => f.id === c.factionId);
                    const isActive = c.id === selectedCampaignId;
                    const accent = FACTION_ACCENT[c.factionId] ?? 'border-gray-500';

                    return (
                        <button
                            key={c.id}
                            onClick={() => setSelectedCampaignId(c.id)}
                            className={cn(
                                'shrink-0 flex items-center gap-2 px-4 py-2 border-l-4 transition-all clip-corner-tr',
                                accent,
                                isActive
                                    ? 'bg-surface-dark border-r border-t border-b border-border'
                                    : 'bg-black/50 border-r border-t border-b border-transparent hover:bg-surface-dark/50 hover:border-border opacity-60 hover:opacity-100'
                            )}
                        >
                            {faction?.imageUrl ? (
                                <img src={faction.imageUrl} className="w-8 h-8 object-cover shrink-0" />
                            ) : (
                                <div className="w-8 h-8 bg-surface-dark flex items-center justify-center shrink-0">
                                    <span className="font-display text-xs text-muted-foreground">{faction?.name?.[0] ?? '?'}</span>
                                </div>
                            )}
                            <div className="text-left">
                                <div className={cn(
                                    'font-display text-sm uppercase tracking-wide leading-tight',
                                    isActive ? 'text-white' : 'text-muted-foreground'
                                )}>
                                    {c.name}
                                </div>
                                <div className="font-mono-tech text-[9px] text-muted-foreground uppercase">
                                    €${c.ebBank.toLocaleString()}
                                </div>
                            </div>
                        </button>
                    );
                })}

                {/* New Campaign button */}
                <NewCampaignDialog
                    onCampaignCreated={setSelectedCampaignId}
                    trigger={
                        <button className="shrink-0 flex items-center gap-2 px-4 py-2 border border-dashed border-border bg-black/50 hover:border-primary hover:bg-surface-dark transition-all clip-corner-tr">
                            <div className="w-8 h-8 border border-border bg-black flex items-center justify-center">
                                <Plus className="w-4 h-4 text-primary" />
                            </div>
                            <span className="font-display text-sm text-muted-foreground uppercase tracking-wide hover:text-primary transition-colors">
                                New Campaign
                            </span>
                        </button>
                    }
                />
            </div>

            {/* ── Campaign Content ── */}
            {selectedCampaign ? (
                <div className="mt-4">
                    <CampaignHeader campaign={selectedCampaign} faction={selectedFaction} />

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
                <div className="mt-4 relative overflow-hidden border-2 border-dashed border-border bg-black flex flex-col items-center justify-center min-h-[400px] clip-corner-tl-br p-8 text-center">
                    <img src={starterImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60" />
                    <div className="relative z-10 flex flex-col items-center">
                        <p className="font-display text-2xl text-white uppercase tracking-widest mb-2 drop-shadow-lg">
                            No Active Campaign
                        </p>
                        <p className="font-mono-tech text-xs text-white/70 uppercase tracking-wider mb-6 drop-shadow">
                            Initialize new operation in the Combat Zone.
                        </p>
                        <NewCampaignDialog onCampaignCreated={setSelectedCampaignId} />
                    </div>
                </div>
            )}
        </div>
    );
}
