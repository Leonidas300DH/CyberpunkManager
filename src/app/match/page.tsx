'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { CampaignSelector } from '@/components/campaign/CampaignSelector';
import { TeamBuilder } from '@/components/match/TeamBuilder';
import { Card } from '@/components/ui/card';
import { NewCampaignDialog } from '@/components/campaign/NewCampaignDialog';

export default function MatchPage() {
    const { campaigns } = useStore();
    const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

    // Auto-select first campaign
    useEffect(() => {
        if (!selectedCampaignId && campaigns.length > 0) {
            setSelectedCampaignId(campaigns[0].id);
        }
    }, [campaigns, selectedCampaignId]);

    const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight text-primary">Match Builder</h1>
            </div>

            <CampaignSelector
                selectedId={selectedCampaignId}
                onSelect={setSelectedCampaignId}
            />

            {selectedCampaign ? (
                <TeamBuilder campaign={selectedCampaign} />
            ) : (
                <Card className="p-8 flex flex-col items-center text-center space-y-4 border-dashed">
                    <div className="text-muted-foreground">
                        <p>No active campaign found.</p>
                        <p className="text-sm">Create a campaign first.</p>
                    </div>
                    <NewCampaignDialog onCampaignCreated={setSelectedCampaignId} />
                </Card>
            )}
        </div>
    );
}
