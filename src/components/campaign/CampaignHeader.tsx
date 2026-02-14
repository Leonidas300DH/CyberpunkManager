'use client';

import { Campaign, Faction } from '@/types';
import { useStore } from '@/store/useStore';
import { MathService } from '@/lib/math';
import { Trophy, Coins, Star, Activity } from 'lucide-react';

interface CampaignHeaderProps {
    campaign: Campaign;
    faction: Faction | undefined;
}

export function CampaignHeader({ campaign, faction }: CampaignHeaderProps) {
    const { catalog } = useStore();
    const streetCred = MathService.calculateCampaignStreetCred(campaign, catalog);
    const influence = MathService.calculateCampaignInfluence(campaign, catalog);

    return (
        <div className="relative w-full group">
            {/* Datashard Card Container */}
            <div className="bg-card border-l-4 border-primary p-5 relative overflow-hidden cp-cut-tr">
                {/* Background Tech Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none">
                    {/* Barcode Pattern */}
                    <div className="w-full h-full flex gap-1 transform -rotate-12 translate-x-10 -translate-y-10">
                        {[...Array(20)].map((_, i) => (
                            <div key={i} className="bg-primary h-full" style={{ width: Math.random() * 4 + 1, opacity: Math.random() }} />
                        ))}
                    </div>
                </div>

                <div className="flex items-start space-x-5 relative z-10">
                    {/* Avatar Frame with Glitch Border */}
                    <div className="relative">
                        <div className="w-24 h-24 bg-black border border-primary/30 p-1 cp-cut-bl">
                            {faction?.imageUrl ? (
                                <img
                                    src={faction.imageUrl}
                                    className="object-cover w-full h-full grayscale contrast-125 hover:grayscale-0 hover:contrast-100 transition-all duration-300"
                                />
                            ) : null}
                        </div>
                        {/* Corner Accent */}
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary" />
                    </div>

                    <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-center space-x-2 mb-1">
                            <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground glitch-text" data-text={campaign.name}>
                                {campaign.name}
                            </h2>
                        </div>
                        <div className="flex items-center space-x-2 text-primary font-mono text-xs tracking-widest uppercase">
                            <span className="bg-primary/20 px-1 py-0.5">Faction_ID</span>
                            <span>{faction?.name}</span>
                        </div>
                    </div>
                </div>

                {/* Stats Matrix using Grid and localized borders */}
                <div className="grid grid-cols-3 gap-px bg-muted mt-6 border border-muted">
                    <div className="bg-card p-3 flex flex-col items-center justify-center relative group/stat hover:bg-primary/5 transition-colors">
                        <div className="flex items-center text-warning text-[10px] uppercase font-bold tracking-wider mb-1">
                            <Coins className="w-3 h-3 mr-1.5" />
                            <span>EDB</span>
                        </div>
                        <span className="font-mono font-bold text-2xl text-foreground group-hover/stat:text-primary transition-colors">{campaign.ebBank}</span>
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-warning transform scale-x-0 group-hover/stat:scale-x-100 transition-transform origin-left" />
                    </div>

                    <div className="bg-card p-3 flex flex-col items-center justify-center relative group/stat hover:bg-primary/5 transition-colors">
                        <div className="flex items-center text-secondary text-[10px] uppercase font-bold tracking-wider mb-1">
                            <Star className="w-3 h-3 mr-1.5" />
                            <span>SC</span>
                        </div>
                        <span className="font-mono font-bold text-2xl text-foreground group-hover/stat:text-secondary transition-colors">{streetCred}</span>
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-secondary transform scale-x-0 group-hover/stat:scale-x-100 transition-transform origin-left" />
                    </div>

                    <div className="bg-card p-3 flex flex-col items-center justify-center relative group/stat hover:bg-primary/5 transition-colors">
                        <div className="flex items-center text-accent text-[10px] uppercase font-bold tracking-wider mb-1">
                            <Trophy className="w-3 h-3 mr-1.5" />
                            <span>INFL</span>
                        </div>
                        <span className="font-mono font-bold text-2xl text-foreground group-hover/stat:text-accent transition-colors">{influence}</span>
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-accent transform scale-x-0 group-hover/stat:scale-x-100 transition-transform origin-left" />
                    </div>
                </div>
            </div>

            {/* Decorative Connection Line */}
            <div className="absolute -left-1 top-10 bottom-10 w-0.5 bg-primary/50" />
        </div>
    );
}
