'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { CampaignSelector } from '@/components/campaign/CampaignSelector';
import { CampaignHeader } from '@/components/campaign/CampaignHeader';
import { NewCampaignDialog } from '@/components/campaign/NewCampaignDialog';
import { RosterList } from '@/components/campaign/RosterList';
import { StashList } from '@/components/campaign/StashList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Users, Briefcase, Target, ShieldPlus } from 'lucide-react';

export default function HQPage() {
    const { campaigns, catalog } = useStore();
    const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

    // Auto-select first campaign if available and none selected
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
        <div className="space-y-4 pb-20">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight text-primary">HQ Dashboard</h1>
            </div>

            <CampaignSelector
                selectedId={selectedCampaignId}
                onSelect={setSelectedCampaignId}
            />

            {selectedCampaign ? (
                <>
                    <CampaignHeader campaign={selectedCampaign} faction={selectedFaction} />

                    <Tabs defaultValue="roster" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="roster"><Users className="w-4 h-4" /></TabsTrigger>
                            <TabsTrigger value="stash"><Briefcase className="w-4 h-4" /></TabsTrigger>
                            <TabsTrigger value="ops"><Target className="w-4 h-4" /></TabsTrigger>
                            <TabsTrigger value="med"><ShieldPlus className="w-4 h-4" /></TabsTrigger>
                        </TabsList>
                        <TabsContent value="roster">
                            <div className="text-center p-4 text-muted-foreground">Roster List Coming Soon</div>
                        </TabsContent>
                        <TabsContent value="stash">
                            <div className="text-center p-4 text-muted-foreground">Stash List Coming Soon</div>
                        </TabsContent>
                        <TabsContent value="ops">
                            <div className="text-center p-4 text-muted-foreground">Operations Coming Soon</div>
                        </TabsContent>
                        <TabsContent value="med">
                            <div className="text-center p-4 text-muted-foreground">Med Bay Coming Soon</div>
                        </TabsContent>
                    </Tabs>
                </>
            ) : (
                <Card className="p-8 flex flex-col items-center text-center space-y-4 border-dashed">
                    <div className="text-muted-foreground">
                        <p>No active campaign found.</p>
                        <p className="text-sm">Start your journey in the Combat Zone.</p>
                    </div>
                    <NewCampaignDialog onCampaignCreated={setSelectedCampaignId} />
                </Card>
            )}
        </div>
    );
}
