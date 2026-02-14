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
        <div className="space-y-4 pb-28">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black tracking-tighter text-primary uppercase glitch-text" data-text="HQ Dashboard">HQ Dashboard</h1>
            </div>

            <CampaignSelector
                selectedId={selectedCampaignId}
                onSelect={setSelectedCampaignId}
            />

            {selectedCampaign ? (
                <div className="space-y-6">
                    <CampaignHeader campaign={selectedCampaign} faction={selectedFaction} />

                    <Tabs defaultValue="roster" className="w-full">
                        {/* Cyberpunk Tabs Container */}
                        <div className="bg-card border border-muted p-1 mb-6 cp-cut-both">
                            <TabsList className="grid w-full grid-cols-4 bg-black h-12 p-0 gap-1">
                                <TabsTrigger value="roster" className="data-[state=active]:bg-primary data-[state=active]:text-black h-full rounded-none uppercase font-bold tracking-wider data-[state=active]:shadow-[0_0_10px_rgba(252,238,10,0.4)] transition-all">
                                    <Users className="w-4 h-4 mr-2" />
                                    <span className="hidden xs:inline">Roster</span>
                                </TabsTrigger>
                                <TabsTrigger value="stash" className="data-[state=active]:bg-secondary data-[state=active]:text-black h-full rounded-none uppercase font-bold tracking-wider data-[state=active]:shadow-[0_0_10px_rgba(0,240,255,0.4)] transition-all">
                                    <Briefcase className="w-4 h-4 mr-2" />
                                    <span className="hidden xs:inline">Stash</span>
                                </TabsTrigger>
                                <TabsTrigger value="ops" className="data-[state=active]:bg-accent data-[state=active]:text-white h-full rounded-none uppercase font-bold tracking-wider data-[state=active]:shadow-[0_0_10px_rgba(255,0,60,0.4)] transition-all">
                                    <Target className="w-4 h-4 mr-2" />
                                    <span className="hidden xs:inline">Ops</span>
                                </TabsTrigger>
                                <TabsTrigger value="med" className="data-[state=active]:bg-white data-[state=active]:text-black h-full rounded-none uppercase font-bold tracking-wider transition-all">
                                    <ShieldPlus className="w-4 h-4 mr-2" />
                                    <span className="hidden xs:inline">Med</span>
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="roster" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <RosterList campaign={selectedCampaign} />
                        </TabsContent>
                        <TabsContent value="stash" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <StashList campaign={selectedCampaign} />
                        </TabsContent>
                        <TabsContent value="ops">
                            <div className="border-2 border-dashed border-muted bg-card/50 p-12 text-center">
                                <h3 className="text-xl font-bold uppercase text-muted-foreground mb-2">Operations Offline</h3>
                                <p className="text-xs font-mono text-muted-foreground">System maintenance in progress.</p>
                            </div>
                        </TabsContent>
                        <TabsContent value="med">
                            <div className="border-2 border-dashed border-muted bg-card/50 p-12 text-center">
                                <h3 className="text-xl font-bold uppercase text-muted-foreground mb-2">MedBay Offline</h3>
                                <p className="text-xs font-mono text-muted-foreground">Auto-doc disabled.</p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            ) : (
                <div className="p-8 flex flex-col items-center text-center space-y-6 border-2 border-dashed border-muted bg-card/20 rounded-none">
                    <div className="text-muted-foreground space-y-2">
                        <p className="font-bold uppercase tracking-widest">No Active Campaign</p>
                        <p className="text-xs font-mono">Initialize new operation in the Combat Zone.</p>
                    </div>
                    <NewCampaignDialog onCampaignCreated={setSelectedCampaignId} />
                </div>
            )}
        </div>
    );
}
