'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { CampaignSelector } from '@/components/campaign/CampaignSelector';
import { TeamBuilder } from '@/components/match/TeamBuilder';
import { NewCampaignDialog } from '@/components/campaign/NewCampaignDialog';
import { Plus } from 'lucide-react';

export default function MatchPage() {
    const { campaigns } = useStore();
    const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

    useEffect(() => {
        if (!selectedCampaignId && campaigns.length > 0) {
            setSelectedCampaignId(campaigns[0].id);
        }
    }, [campaigns, selectedCampaignId]);

    const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);

    return (
        <div className="space-y-4">
            <CampaignSelector
                selectedId={selectedCampaignId}
                onSelect={setSelectedCampaignId}
            />

            {selectedCampaign ? (
                <TeamBuilder campaign={selectedCampaign} />
            ) : (
                <div className="border-2 border-dashed border-border bg-black flex flex-col items-center justify-center min-h-[400px] clip-corner-tl-br p-8 text-center">
                    <div className="h-20 w-20 clip-corner-tr bg-surface-dark border border-border flex items-center justify-center mb-6">
                        <Plus className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <p className="font-display text-2xl text-muted-foreground uppercase tracking-widest mb-2">
                        No Campaign Found
                    </p>
                    <p className="font-mono-tech text-xs text-muted-foreground uppercase tracking-wider mb-6">
                        Create a campaign to start building your team
                    </p>
                    <NewCampaignDialog onCampaignCreated={setSelectedCampaignId} />
                </div>
            )}
        </div>
    );
}
