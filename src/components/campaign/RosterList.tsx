'use client';

import { Campaign } from '@/types';
import { useStore } from '@/store/useStore';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit } from 'lucide-react';

interface RosterListProps {
    campaign: Campaign;
}

export function RosterList({ campaign }: RosterListProps) {
    const { catalog } = useStore();

    const getProfile = (profileId: string) => catalog.profiles.find(p => p.id === profileId);
    const getLineage = (lineageId: string) => catalog.lineages.find(l => l.id === lineageId);

    return (
        <div className="space-y-3">
            <div className="flex justify-end">
                <Button size="sm"><Plus className="w-3 h-3 mr-1" /> Recruit Model</Button>
            </div>
            {campaign.hqRoster.length === 0 && <div className="text-center text-muted-foreground py-4">No models recruited.</div>}

            {campaign.hqRoster.map(recruit => {
                const profile = getProfile(recruit.currentProfileId);
                const lineage = profile ? getLineage(profile.lineageId) : null;

                if (!profile || !lineage) return null;

                return (
                    <Card key={recruit.id} className="bg-card/50 overflow-hidden">
                        <div className="flex">
                            <div className="w-20 bg-muted shrink-0">
                                {lineage.imageUrl && <img src={lineage.imageUrl} className="w-full h-full object-cover" />}
                            </div>
                            <div className="flex-1 p-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-sm">{lineage.name}</h4>
                                        <div className="text-xs text-muted-foreground">{lineage.type} • Rank {profile.level}</div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-mono text-warning block">{profile.costEB} EB</span>
                                        {recruit.hasMajorInjury && <Badge variant="destructive" className="text-[10px] h-4 px-1">Injured</Badge>}
                                    </div>
                                </div>
                                <div className="mt-2 flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" className="h-6 w-6"><Edit className="w-3 h-3" /></Button>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive"><Trash2 className="w-3 h-3" /></Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}
