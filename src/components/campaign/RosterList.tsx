'use client';

import { Campaign } from '@/types';
import { useStore } from '@/store/useStore';
import { Plus } from 'lucide-react';

interface RosterListProps {
    campaign: Campaign;
}

const STATUS_STYLES = {
    ready: { bg: 'bg-black', text: 'text-cyber-green', label: 'Ready', dot: 'bg-cyber-green glow-green' },
    injured: { bg: 'bg-black', text: 'text-yellow-500', label: 'Injured', dot: '' },
    flatlined: { bg: 'bg-accent/20', text: 'text-accent animate-pulse', label: 'FLATLINED', dot: '' },
};

export function RosterList({ campaign }: RosterListProps) {
    const { catalog } = useStore();

    const getProfile = (profileId: string) => catalog.profiles.find(p => p.id === profileId);
    const getLineage = (lineageId: string) => catalog.lineages.find(l => l.id === lineageId);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaign.hqRoster.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground py-8 font-mono-tech uppercase tracking-widest text-xs">
                    No models recruited. Add mercs to your roster.
                </div>
            )}

            {campaign.hqRoster.map(recruit => {
                const profile = getProfile(recruit.currentProfileId);
                const lineage = profile ? getLineage(profile.lineageId) : null;
                if (!profile || !lineage) return null;

                const status = recruit.hasMajorInjury ? 'injured' : 'ready';
                const statusStyle = STATUS_STYLES[status];
                const isLeader = lineage.type === 'Leader';
                const hoverColor = isLeader ? 'bg-primary' : 'bg-secondary';

                return (
                    <div key={recruit.id} className="relative group h-full">
                        {/* Hover glow ring */}
                        <div className={`absolute -inset-0.5 ${hoverColor} opacity-0 group-hover:opacity-100 clip-corner-both transition duration-300`} />

                        <div className="relative bg-black clip-corner-both border border-border p-1 h-full flex flex-col">
                            <div className="bg-surface-dark flex-grow clip-corner-both relative overflow-hidden flex flex-col">
                                {/* Header */}
                                <div className="bg-black p-4 border-b border-border flex justify-between items-center">
                                    <span className="font-display font-bold text-2xl text-white uppercase tracking-wider">
                                        {lineage.name}
                                    </span>
                                    <span className={`text-xs font-mono-tech font-bold px-3 py-1 uppercase clip-corner-bl ${isLeader ? 'bg-primary text-black' : 'bg-black border border-border text-muted-foreground'}`}>
                                        {lineage.type}
                                    </span>
                                </div>

                                {/* Body: Portrait + Stats */}
                                <div className="p-4 flex gap-4">
                                    {/* Portrait */}
                                    <div className="w-48 h-56 bg-black shrink-0 relative overflow-hidden border border-border shadow-inner">
                                        {lineage.imageUrl ? (
                                            <img
                                                src={lineage.imageUrl}
                                                className="w-full h-full object-cover grayscale contrast-125 brightness-90 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="font-display text-3xl text-muted-foreground opacity-30">{lineage.name[0]}</span>
                                            </div>
                                        )}
                                        {/* Bottom health indicator */}
                                        <div className={`absolute bottom-0 left-0 w-full h-1 ${status === 'injured' ? 'bg-yellow-600' : 'bg-cyber-green'}`} />
                                    </div>

                                    {/* Stats */}
                                    <div className="flex-1 space-y-3 pt-1">
                                        {/* Armor */}
                                        <div>
                                            <div className="flex justify-between text-[10px] font-mono-tech font-bold text-muted-foreground uppercase mb-1 tracking-wider">
                                                <span>Armor</span>
                                                <span className="text-white">{profile.armor}</span>
                                            </div>
                                            <div className="w-full bg-black h-2 border border-border">
                                                <div
                                                    className="bg-cyber-green h-full glow-green"
                                                    style={{ width: `${Math.min(100, profile.armor * 25)}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Action Points */}
                                        <div>
                                            <div className="flex justify-between text-[10px] font-mono-tech font-bold text-muted-foreground uppercase mb-1 tracking-wider">
                                                <span>Action Points</span>
                                                <span className="text-white">
                                                    {profile.actionTokens.green + profile.actionTokens.yellow + profile.actionTokens.red}
                                                </span>
                                            </div>
                                            <div className="flex gap-1.5">
                                                {[...Array(profile.actionTokens.green)].map((_, i) => (
                                                    <div key={`g${i}`} className="h-2 w-5 bg-cyber-green shadow-[0_0_5px_rgba(34,197,94,0.4)]" />
                                                ))}
                                                {[...Array(profile.actionTokens.yellow)].map((_, i) => (
                                                    <div key={`y${i}`} className="h-2 w-5 bg-yellow-400 shadow-[0_0_5px_rgba(250,204,21,0.4)]" />
                                                ))}
                                                {[...Array(profile.actionTokens.red)].map((_, i) => (
                                                    <div key={`r${i}`} className="h-2 w-5 bg-red-600 shadow-[0_0_5px_rgba(220,38,38,0.4)]" />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Loadout Grid */}
                                <div className="px-4 pb-4 mt-auto">
                                    <div className="text-[10px] font-mono-tech text-muted-foreground uppercase mb-2 border-b border-border pb-1 font-bold tracking-widest">
                                        Loadout
                                    </div>
                                    <div className="grid grid-cols-4 gap-2">
                                        {recruit.equippedItemIds.map(itemId => {
                                            const item = catalog.items.find(i => i.id === itemId);
                                            return (
                                                <div key={itemId} className="aspect-square bg-black border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors text-muted-foreground" title={item?.name}>
                                                    <span className="text-[10px] font-mono-tech uppercase truncate px-1">{item?.name?.[0] ?? '?'}</span>
                                                </div>
                                            );
                                        })}
                                        {/* Empty slots */}
                                        {[...Array(Math.max(0, 4 - recruit.equippedItemIds.length))].map((_, i) => (
                                            <div key={`empty-${i}`} className="aspect-square border border-dashed border-border flex items-center justify-center opacity-30">
                                                <span className="text-xs text-muted-foreground font-bold">+</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Status Footer */}
                                <div className={`${statusStyle.bg} p-3 text-center border-t border-border relative overflow-hidden`}>
                                    <span className={`text-xs font-mono-tech uppercase flex justify-center items-center gap-2 font-bold tracking-wide ${statusStyle.text}`}>
                                        {statusStyle.dot && <span className={`w-2 h-2 ${statusStyle.dot} block`} />}
                                        {status === 'injured' && (
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                                            </svg>
                                        )}
                                        {statusStyle.label}
                                    </span>
                                    {status === 'injured' && <div className="absolute inset-0 bg-yellow-500/5 animate-pulse" />}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Recruit Merc CTA */}
            <div className="group cursor-pointer min-h-[300px]">
                <div className="relative bg-black clip-corner-both border-2 border-dashed border-border p-1 h-full hover:border-primary/80 hover:bg-surface-dark transition-all duration-300">
                    <div className="h-full clip-corner-both flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-black border border-border flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-primary group-hover:shadow-[0_0_15px_rgba(252,238,10,0.3)] transition-all duration-300">
                            <Plus className="w-8 h-8 text-muted-foreground group-hover:text-primary" />
                        </div>
                        <span className="font-mono-tech text-muted-foreground uppercase tracking-[0.2em] text-sm group-hover:text-primary font-bold">
                            Recruit Merc
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
