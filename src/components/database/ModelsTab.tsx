'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { ModelLineage, ModelProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, User, Shield, Zap } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export function ModelsTab() {
    const { catalog } = useStore();
    // Group Lineages by Faction
    const lineagesByFaction = catalog.lineages.reduce((acc, lineage) => {
        const faction = catalog.factions.find(f => f.id === lineage.factionId);
        const factionName = faction ? faction.name : 'Unknown Faction';
        if (!acc[factionName]) acc[factionName] = [];
        acc[factionName].push(lineage);
        return acc;
    }, {} as Record<string, ModelLineage[]>);

    const getProfilesForLineage = (lineageId: string) => {
        return catalog.profiles.filter(p => p.lineageId === lineageId).sort((a, b) => a.level - b.level);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Button>
                    <Plus className="w-4 h-4 mr-2" /> Add Lineage (Coming Soon)
                </Button>
            </div>

            {Object.entries(lineagesByFaction).map(([factionName, lineages]) => (
                <div key={factionName} className="space-y-2">
                    <h3 className="text-lg font-bold text-primary border-b border-border pb-1">{factionName}</h3>

                    <Accordion type="single" collapsible className="w-full">
                        {lineages.map((lineage) => (
                            <AccordionItem key={lineage.id} value={lineage.id}>
                                <AccordionTrigger className="hover:no-underline">
                                    <div className="flex items-center space-x-3 w-full">
                                        <div className="w-10 h-10 bg-muted rounded overflow-hidden shrink-0">
                                            {lineage.imageUrl && <img src={lineage.imageUrl} className="w-full h-full object-cover" />}
                                        </div>
                                        <div className="text-left flex-1">
                                            <div className="font-semibold">{lineage.name}</div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                <Badge variant="outline" className="text-[10px] h-5">{lineage.type}</Badge>
                                                {lineage.isMerc && <Badge variant="secondary" className="text-[10px] h-5">Merc</Badge>}
                                            </div>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="pl-4 border-l-2 border-muted space-y-3 pt-2">
                                        {getProfilesForLineage(lineage.id).map(profile => (
                                            <Card key={profile.id} className="bg-card/50">
                                                <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between space-y-0">
                                                    <CardTitle className="text-sm font-medium flex items-center">
                                                        {profile.level === 0 ? 'Base Profile' : `Run ${profile.level} Veteran`}
                                                    </CardTitle>
                                                    <span className="text-xs font-mono text-warning">{profile.costEB} EB</span>
                                                </CardHeader>
                                                <CardContent className="p-3 pt-2 text-xs text-muted-foreground space-y-1">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="flex items-center gap-1"><Shield className="w-3 h-3" /> Armor: {profile.armor}</div>
                                                        <div className="flex items-center gap-1"><Zap className="w-3 h-3 text-green-500" /> Actions: {profile.actionTokens.green}/{profile.actionTokens.yellow}/{profile.actionTokens.red}</div>
                                                    </div>
                                                    <div>Skills: {Object.entries(profile.skills).filter(([_, v]) => v > 0).map(([k, v]) => `${k} ${v}`).join(', ')}</div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                        <Button variant="outline" size="sm" className="w-full mt-2">
                                            <Plus className="w-3 h-3 mr-1" /> Add Rank
                                        </Button>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            ))}
        </div>
    );
}
