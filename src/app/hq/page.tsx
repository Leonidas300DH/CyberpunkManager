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
                <div className="space-y-6">
                    <CampaignHeader campaign={selectedCampaign} faction={selectedFaction} />

                    <Tabs defaultValue="roster" className="w-full">
                        <div className="glass rounded-lg p-1 mb-4">
                            <TabsList className="grid w-full grid-cols-4 bg-transparent h-10">
                                <TabsTrigger value="roster" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:backdrop-blur-sm"><Users className="w-4 h-4 mr-2" /><span className="hidden xs:inline">Roster</span></TabsTrigger>
                                <TabsTrigger value="stash" className="data-[state=active]:bg-secondary/20 data-[state=active]:text-secondary data-[state=active]:backdrop-blur-sm"><Briefcase className="w-4 h-4 mr-2" /><span className="hidden xs:inline">Stash</span></TabsTrigger>
                                <TabsTrigger value="ops" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent data-[state=active]:backdrop-blur-sm"><Target className="w-4 h-4 mr-2" /><span className="hidden xs:inline">Ops</span></TabsTrigger>
                                <TabsTrigger value="med" className="data-[state=active]:bg-destructive/20 data-[state=active]:text-destructive data-[state=active]:backdrop-blur-sm"><ShieldPlus className="w-4 h-4 mr-2" /><span className="hidden xs:inline">Med</span></TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="roster" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <RosterList campaign={selectedCampaign} />
                        </TabsContent>
                        <TabsContent value="stash" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <StashList campaign={selectedCampaign} />
                        </TabsContent>
                        <TabsContent value="ops">
                            <div className="glass-card rounded-lg p-8 text-center text-muted-foreground border-dashed">Operations Coming Soon</div>
                        </TabsContent>
                        <TabsContent value="med">
                            <div className="glass-card rounded-lg p-8 text-center text-muted-foreground border-dashed">Med Bay Coming Soon</div>
                        </TabsContent>
                    </Tabs>
                </div>
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
