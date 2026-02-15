'use client';

import { ModelLineage, ModelProfile } from '@/types';
import { Check } from 'lucide-react';

interface MercCardProps {
    lineage: ModelLineage;
    profile: ModelProfile;
    isSelected: boolean;
    onClick: () => void;
}

const TYPE_STYLES: Record<string, { text: string; border: string; glow: string }> = {
    Leader:     { text: 'text-primary',       border: 'border-primary',       glow: 'shadow-[0_0_10px_rgba(252,238,10,0.3)]' },
    Character:  { text: 'text-secondary',     border: 'border-secondary',     glow: 'shadow-[0_0_10px_rgba(0,240,255,0.3)]' },
    Gonk:       { text: 'text-cyber-orange',  border: 'border-cyber-orange',  glow: 'shadow-[0_0_10px_rgba(249,115,22,0.3)]' },
    Specialist: { text: 'text-cyber-purple',  border: 'border-cyber-purple',  glow: 'shadow-[0_0_10px_rgba(168,85,247,0.3)]' },
    Drone:      { text: 'text-cyber-green',   border: 'border-cyber-green',   glow: 'shadow-[0_0_10px_rgba(34,197,94,0.3)]' },
};

export function MercCard({ lineage, profile, isSelected, onClick }: MercCardProps) {
    const style = TYPE_STYLES[lineage.type] ?? TYPE_STYLES.Character;

    return (
        <div className="relative group cursor-pointer" onClick={onClick}>
            {/* Selection left bar */}
            {isSelected && (
                <>
                    <div className="absolute -left-1 top-0 bottom-0 w-2 bg-primary z-10 glow-primary" />
                    <div className="absolute -top-3 -right-3 z-20 bg-primary text-black p-1 clip-corner-tr shadow-lg animate-bounce border border-black">
                        <Check className="w-4 h-4" strokeWidth={3} />
                    </div>
                </>
            )}

            <div className={`h-full bg-surface-dark border ${isSelected ? 'border-primary' : 'border-border hover:border-white'} clip-corner-tl-br flex flex-col relative overflow-hidden transition-colors shadow-2xl`}>
                {/* Portrait */}
                <div className="relative h-48 overflow-hidden bg-black border-b border-border">
                    {lineage.imageUrl ? (
                        <img
                            alt={lineage.name}
                            className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500 grayscale group-hover:grayscale-0 contrast-125"
                            src={lineage.imageUrl}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <span className="font-display text-6xl uppercase opacity-20">{lineage.name[0]}</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-dark via-transparent to-transparent opacity-90" />

                    {/* Role badge */}
                    <div className={`absolute top-2 right-2 bg-black/90 backdrop-blur ${style.text} ${style.border} border px-3 py-1 text-xs font-mono-tech uppercase tracking-wider ${style.glow}`}>
                        {lineage.type}
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-grow relative bg-surface-dark">
                    {/* Divider line */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />

                    {/* Name + Cost */}
                    <div className="flex justify-between items-start mb-2">
                        <h3 className={`text-2xl font-display uppercase leading-none tracking-wide transition-colors ${isSelected ? 'text-primary' : 'text-white group-hover:text-primary'}`}>
                            {lineage.name}
                        </h3>
                        <div className="text-right shrink-0 ml-2">
                            <span className={`block text-2xl font-display leading-none ${isSelected ? 'text-primary' : 'text-white'}`}>
                                {profile.costEB}
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono-tech">
                                Credits
                            </span>
                        </div>
                    </div>

                    {/* Description */}
                    {profile.passiveRules && (
                        <p className="text-muted-foreground text-xs mb-4 leading-relaxed font-mono-tech border-l-2 border-border pl-2 line-clamp-2">
                            {profile.passiveRules}
                        </p>
                    )}

                    {/* Stats */}
                    <div className="mt-auto space-y-3">
                        {/* Action Points */}
                        <div className="flex justify-between items-center border-b border-border pb-2">
                            <span className="text-[10px] text-muted-foreground uppercase font-mono-tech tracking-wider">
                                AP Config
                            </span>
                            <div className="flex gap-1">
                                {[...Array(profile.actionTokens.green)].map((_, i) => (
                                    <div key={`g${i}`} className="w-3 h-3 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                                ))}
                                {[...Array(profile.actionTokens.yellow)].map((_, i) => (
                                    <div key={`y${i}`} className="w-3 h-3 bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
                                ))}
                                {[...Array(profile.actionTokens.red)].map((_, i) => (
                                    <div key={`r${i}`} className="w-3 h-3 bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
                                ))}
                                {/* Empty slots */}
                                {profile.actionTokens.green + profile.actionTokens.yellow + profile.actionTokens.red < 4 &&
                                    [...Array(4 - profile.actionTokens.green - profile.actionTokens.yellow - profile.actionTokens.red)].map((_, i) => (
                                        <div key={`e${i}`} className="w-3 h-3 bg-black border border-border" />
                                    ))
                                }
                            </div>
                        </div>

                        {/* Armor */}
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] text-muted-foreground uppercase font-mono-tech tracking-wider">
                                Armor
                            </span>
                            <span className="text-sm font-bold text-white font-mono-tech tracking-widest">
                                {profile.armor}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Hover data-verified tag */}
                <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[9px] text-primary font-mono-tech tracking-tighter bg-black px-1">DATA_VERIFIED</span>
                </div>
            </div>
        </div>
    );
}
