'use client';

import { Campaign, Faction } from '@/types';
import { useStore } from '@/store/useStore';
import { MathService } from '@/lib/math';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Coins, Star } from 'lucide-react';

interface CampaignHeaderProps {
    campaign: Campaign;
    faction: Faction | undefined;
}

export function CampaignHeader({ campaign, faction }: CampaignHeaderProps) {
    const { catalog } = useStore();
    const streetCred = MathService.calculateCampaignStreetCred(campaign, catalog);
    const influence = MathService.calculateCampaignInfluence(campaign, catalog);

    return (
        <Card className="bg-card border-primary/20">
            <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-muted rounded-md overflow-hidden shrink-0 border border-border">
                        {faction?.imageUrl ? <img src={faction.imageUrl} className="object-cover w-full h-full" /> : null}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold truncate text-primary">{campaign.name}</h2>
                        <p className="text-sm text-muted-foreground truncate">{faction?.name}</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="bg-background/50 p-2 rounded flex flex-col items-center">
                        <div className="flex items-center text-warning text-xs mb-1">
                            <Coins className="w-3 h-3 mr-1" />
                            <span>Bank</span>
                        </div>
                        <span className="font-mono font-bold text-lg">{campaign.ebBank}</span>
                    </div>
                    <div className="bg-background/50 p-2 rounded flex flex-col items-center">
                        <div className="flex items-center text-primary text-xs mb-1">
                            <Star className="w-3 h-3 mr-1" />
                            <span>Rep</span>
                        </div>
                        <span className="font-mono font-bold text-lg">{streetCred}</span>
                    </div>
                    <div className="bg-background/50 p-2 rounded flex flex-col items-center">
                        <div className="flex items-center text-purple-400 text-xs mb-1">
                            <Trophy className="w-3 h-3 mr-1" />
                            <span>Infl</span>
                        </div>
                        <span className="font-mono font-bold text-lg">{influence}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
