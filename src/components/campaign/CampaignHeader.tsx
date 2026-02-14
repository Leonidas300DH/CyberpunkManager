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
        <Card className="glass overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                {/* Background Watermark */}
                {faction?.imageUrl && <img src={faction.imageUrl} className="w-32 h-32 object-contain grayscale" />}
            </div>

            <CardContent className="p-5 relative z-10">
                <div className="flex items-center space-x-5">
                    <div className="w-20 h-20 bg-background/50 rounded-2xl overflow-hidden shrink-0 border border-white/10 shadow-lg ring-1 ring-white/5">
                        {faction?.imageUrl ? <img src={faction.imageUrl} className="object-cover w-full h-full hover:scale-110 transition-transform duration-500" /> : null}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center space-x-2">
                            <h2 className="text-2xl font-bold truncate text-foreground tracking-tight">{campaign.name}</h2>
                            {/* Optional Status Badge */}
                        </div>
                        <p className="text-sm text-primary font-medium tracking-wide uppercase opacity-80">{faction?.name}</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-6">
                    <div className="glass-card p-3 rounded-xl flex flex-col items-center justify-center space-y-1 relative overflow-hidden">
                        <div className="absolute inset-0 bg-warning/5"></div>
                        <div className="flex items-center text-warning text-[10px] uppercase font-bold tracking-wider mb-1 z-10">
                            <Coins className="w-3 h-3 mr-1.5" />
                            <span>Bank</span>
                        </div>
                        <span className="font-mono font-bold text-xl text-foreground z-10">{campaign.ebBank}</span>
                    </div>

                    <div className="glass-card p-3 rounded-xl flex flex-col items-center justify-center space-y-1 relative overflow-hidden">
                        <div className="absolute inset-0 bg-primary/5"></div>
                        <div className="flex items-center text-primary text-[10px] uppercase font-bold tracking-wider mb-1 z-10">
                            <Star className="w-3 h-3 mr-1.5" />
                            <span>Rep</span>
                        </div>
                        <span className="font-mono font-bold text-xl text-foreground z-10">{streetCred}</span>
                    </div>

                    <div className="glass-card p-3 rounded-xl flex flex-col items-center justify-center space-y-1 relative overflow-hidden">
                        <div className="absolute inset-0 bg-purple-500/5"></div>
                        <div className="flex items-center text-accent text-[10px] uppercase font-bold tracking-wider mb-1 z-10">
                            <Trophy className="w-3 h-3 mr-1.5" />
                            <span>Infl</span>
                        </div>
                        <span className="font-mono font-bold text-xl text-foreground z-10">{influence}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
