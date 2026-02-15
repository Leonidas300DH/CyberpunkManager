'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { CampaignHeader } from '@/components/campaign/CampaignHeader';
import { TeamBuilder } from '@/components/match/TeamBuilder';
import { cn } from '@/lib/utils';

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

export default function MatchPage() {
    const { campaigns, catalog } = useStore();
    const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

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
            {/* Campaign List */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
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
            </div>

            {selectedCampaign ? (
                <div className="mt-4">
                    <CampaignHeader campaign={selectedCampaign} faction={selectedFaction} />
                    <TeamBuilder campaign={selectedCampaign} />
                </div>
            ) : (
                <div className="mt-4 border-2 border-dashed border-border bg-black flex flex-col items-center justify-center min-h-[400px] clip-corner-tl-br p-8 text-center">
                    <p className="font-display text-2xl text-muted-foreground uppercase tracking-widest mb-2">
                        No Campaign Found
                    </p>
                    <p className="font-mono-tech text-xs text-muted-foreground uppercase tracking-wider">
                        Create a campaign in HQ to start building your team.
                    </p>
                </div>
            )}
        </div>
    );
}
