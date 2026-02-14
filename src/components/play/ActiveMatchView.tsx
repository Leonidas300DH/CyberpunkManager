'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress'; // Need to make sure Progress is installed or use custom
import { Swords, Shield, Zap, Skull, RotateCcw } from 'lucide-react';

export function ActiveMatchView() {
    const router = useRouter();
    const { catalog, activeMatchTeam, setActiveMatchTeam } = useStore();

    // Local state for the match session
    const [activatedModels, setActivatedModels] = useState<Record<string, boolean>>({});
    const [wounds, setWounds] = useState<Record<string, number>>({});

    if (!activeMatchTeam) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <h2 className="text-xl font-bold">No Active Match</h2>
                <p className="text-muted-foreground">Go to Match Builder to start.</p>
                <Button onClick={() => router.push('/match')}>
                    <Swords className="w-4 h-4 mr-2" /> Build Team
                </Button>
            </div>
        );
    }

    const getProfile = (profileId: string) => catalog.profiles.find(p => p.id === profileId);
    const getLineage = (lineageId: string) => catalog.lineages.find(l => l.id === lineageId);

    // Filter roster to only include selected recruits
    const matchRoster = useStore(state => {
        const campaign = state.campaigns.find(c => c.id === activeMatchTeam.campaignId);
        return campaign?.hqRoster.filter(r => activeMatchTeam.selectedRecruitIds.includes(r.id)) || [];
    });

    const handleEndMatch = () => {
        if (confirm("End the match? Progress will be lost (for now).")) {
            setActiveMatchTeam(null);
            router.push('/hq');
        }
    };

    const toggleActivation = (id: string) => {
        setActivatedModels(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const addWound = (id: string) => {
        setWounds(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    };

    const healWound = (id: string) => {
        setWounds(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) }));
    };

    return (
        <div className="space-y-4 pb-20">
            <div className="flex justify-between items-center sticky top-0 z-10 bg-background/95 backdrop-blur py-2 -mx-4 px-4 border-b">
                <h2 className="font-bold text-lg text-primary flex items-center">
                    <Swords className="w-5 h-5 mr-2" /> Match In Progress
                </h2>
                <Button variant="destructive" size="sm" onClick={handleEndMatch}>End Match</Button>
            </div>

            <div className="space-y-3">
                {matchRoster.map(recruit => {
                    const profile = getProfile(recruit.profileId);
                    const lineage = profile ? getLineage(profile.lineageId) : null;

                    if (!profile || !lineage) return null;

                    const isActivated = activatedModels[recruit.id];
                    const currentWounds = wounds[recruit.id] || 0;
                    const isCasualty = currentWounds >= 4; // Assuming 4 wounds is generically bad for now, rules vary

                    return (
                        <Card key={recruit.id} className={`overflow-hidden transition-all ${isActivated ? 'opacity-60 saturate-0' : ''} ${isCasualty ? 'border-destructive bg-destructive/10' : ''}`}>
                            <div className="flex">
                                <div className="w-24 bg-muted shrink-0 relative" onClick={() => toggleActivation(recruit.id)}>
                                    {lineage.imageUrl && <img src={lineage.imageUrl} className="w-full h-full object-cover" />}
                                    {isActivated && <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white font-bold">DONE</div>}
                                    {isCasualty && <div className="absolute inset-0 flex items-center justify-center bg-destructive/50 text-white font-bold"><Skull className="w-8 h-8" /></div>}
                                </div>
                                <div className="flex-1 p-3">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-bold text-sm">{recruit.name || lineage.name}</h4>
                                            <div className="text-xs text-muted-foreground">{lineage.type} • Mv {profile.movement.yellow}"/{profile.movement.green}"</div>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Shield className="w-3 h-3 text-muted-foreground" />
                                            <span className="font-mono text-sm">{profile.armor}</span>
                                        </div>
                                    </div>

                                    {/* Action Tokens */}
                                    <div className="flex gap-2 text-xs mb-3">
                                        {profile.actionTokens.green > 0 && <Badge className="bg-green-600 hover:bg-green-700 h-5 px-1">{profile.actionTokens.green} Grn</Badge>}
                                        {profile.actionTokens.yellow > 0 && <Badge className="bg-yellow-600 hover:bg-yellow-700 h-5 px-1">{profile.actionTokens.yellow} Yel</Badge>}
                                        {profile.actionTokens.red > 0 && <Badge className="bg-red-600 hover:bg-red-700 h-5 px-1">{profile.actionTokens.red} Red</Badge>}
                                    </div>

                                    {/* Wounds Tracker */}
                                    <div className="flex items-center justify-between bg-muted/50 p-1 rounded">
                                        <span className="text-xs font-semibold pl-1">Wounds</span>
                                        <div className="flex items-center space-x-2">
                                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => healWound(recruit.id)}>-</Button>
                                            <span className={`font-mono font-bold ${currentWounds > 0 ? 'text-destructive' : ''}`}>{currentWounds}</span>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => addWound(recruit.id)}>+</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            <div className="fixed bottom-20 right-4">
                <Button size="icon" className="h-12 w-12 rounded-full shadow-lg" onClick={() => setActivatedModels({})}>
                    <RotateCcw className="w-6 h-6" />
                </Button>
            </div>
        </div>
    );
}
