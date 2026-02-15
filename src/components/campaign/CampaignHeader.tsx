'use client';

import { Campaign, Faction } from '@/types';
import { useStore } from '@/store/useStore';
import { MathService } from '@/lib/math';

interface CampaignHeaderProps {
    campaign: Campaign;
    faction: Faction | undefined;
}

export function CampaignHeader({ campaign, faction }: CampaignHeaderProps) {
    const { catalog } = useStore();
    const streetCred = MathService.calculateCampaignStreetCred(campaign, catalog);
    const influence = MathService.calculateCampaignInfluence(campaign, catalog);

    return (
        <div className="relative z-10">
            {/* Title Row */}
            <div className="flex flex-col md:flex-row justify-between items-end border-b-2 border-surface-dark pb-4 mb-4 relative">
                <div>
                    <div className="inline-block bg-surface-dark px-2 py-1 mb-2 border-l-2 border-secondary">
                        <div className="text-xs font-mono-tech text-secondary tracking-widest uppercase flex items-center gap-2 font-bold">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                            </svg>
                            Campaign Datashard_v2.04
                        </div>
                    </div>
                    <h1
                        className="text-5xl md:text-7xl font-display font-bold uppercase text-white tracking-tighter leading-none glitch-text mb-2"
                        data-text={campaign.name}
                    >
                        {campaign.name}
                    </h1>
                </div>

                {/* Faction Badge */}
                <div className="mt-4 md:mt-0 relative">
                    <div className="clip-corner-both bg-black border border-border p-1 shadow-lg">
                        <div className="bg-surface-dark border border-border p-4 flex items-center gap-4 clip-corner-both">
                            <div className="text-right">
                                <div className="text-[10px] font-mono-tech text-muted-foreground uppercase tracking-widest mb-1">Faction Allegiance</div>
                                <div className="text-xl font-display font-bold text-primary uppercase tracking-wide">{faction?.name ?? 'Unknown'}</div>
                            </div>
                            <div className="w-40 h-40 md:w-48 md:h-48 bg-black border-2 border-primary flex items-center justify-center relative overflow-hidden glow-primary">
                                {faction?.imageUrl ? (
                                    <img src={faction.imageUrl} className="w-full h-full object-cover grayscale contrast-125 hover:grayscale-0 transition-all" />
                                ) : (
                                    <span className="font-display text-primary text-2xl font-bold">{faction?.name?.[0] ?? '?'}</span>
                                )}
                                <div className="absolute inset-0 bg-primary opacity-10" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* System Status Bar */}
            <div className="flex justify-between items-center text-xs font-mono-tech text-muted-foreground uppercase tracking-wider bg-black/50 p-2 border-l-2 border-border mb-6">
                <div>System: <span className="text-cyber-green font-bold">Online</span> // Connection: <span className="text-cyber-green font-bold">Secure</span></div>
                <div className="hidden md:block">Night City Time: <span className="text-white">23:42:09</span></div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Funds */}
                <div className="bg-black border border-border p-6 relative overflow-hidden clip-corner-tr group hover:border-muted-foreground transition-colors">
                    <div className="absolute inset-0 bg-surface-dark -z-10" />
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-muted-foreground font-mono-tech text-xs uppercase tracking-widest font-bold">Funds (EB)</span>
                        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="text-4xl font-mono-tech font-bold text-white mb-4 tracking-tight">
                        €$ {campaign.ebBank.toLocaleString()}
                    </div>
                    <div className="w-full bg-black h-2 border border-border">
                        <div className="bg-primary h-full w-3/4 shadow-[0_0_15px_rgba(252,238,10,0.4)] relative">
                            <div className="absolute right-0 top-0 bottom-0 w-px bg-white" />
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 p-1"><div className="w-3 h-3 bg-primary" /></div>
                </div>

                {/* Street Cred */}
                <div className="bg-black border border-border p-6 relative overflow-hidden clip-corner-tr group hover:border-muted-foreground transition-colors">
                    <div className="absolute inset-0 bg-surface-dark -z-10" />
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-muted-foreground font-mono-tech text-xs uppercase tracking-widest font-bold">Street Cred</span>
                        <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582" />
                        </svg>
                    </div>
                    <div className="text-4xl font-mono-tech font-bold text-white mb-4 tracking-tight">
                        LVL {streetCred}
                    </div>
                    <div className="w-full bg-black h-2 border border-border">
                        <div className="bg-secondary h-full w-1/2 shadow-[0_0_15px_rgba(0,240,255,0.4)] relative">
                            <div className="absolute right-0 top-0 bottom-0 w-px bg-white" />
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 p-1"><div className="w-3 h-3 bg-secondary" /></div>
                </div>

                {/* Influence */}
                <div className="bg-black border border-border p-6 relative overflow-hidden clip-corner-tr group hover:border-muted-foreground transition-colors">
                    <div className="absolute inset-0 bg-surface-dark -z-10" />
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-muted-foreground font-mono-tech text-xs uppercase tracking-widest font-bold">Influence</span>
                        <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
                        </svg>
                    </div>
                    <div className="text-4xl font-mono-tech font-bold text-white mb-4 tracking-tight">
                        {influence > 5 ? 'HIGH' : influence > 2 ? 'MED' : 'LOW'}
                    </div>
                    <div className="w-full bg-black h-2 border border-border">
                        <div className="bg-accent h-full shadow-[0_0_15px_rgba(255,0,60,0.4)] relative" style={{ width: `${Math.min(100, influence * 15)}%` }}>
                            <div className="absolute right-0 top-0 bottom-0 w-px bg-white" />
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 p-1"><div className="w-3 h-3 bg-accent" /></div>
                </div>
            </div>
        </div>
    );
}
