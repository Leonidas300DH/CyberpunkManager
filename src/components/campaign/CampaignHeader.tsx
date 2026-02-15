'use client';

import { useState, useRef, useEffect } from 'react';
import { Campaign, Faction } from '@/types';
import { useStore } from '@/store/useStore';
import { MathService } from '@/lib/math';
import { Pencil } from 'lucide-react';

const FACTION_COLORS: Record<string, { border: string; text: string; bg: string; glow: string }> = {
    'faction-arasaka':    { border: 'border-red-600',     text: 'text-red-500',     bg: 'bg-red-600',     glow: 'shadow-[0_0_20px_rgba(220,38,38,0.4)]' },
    'faction-bozos':      { border: 'border-purple-500',  text: 'text-purple-400',  bg: 'bg-purple-500',  glow: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]' },
    'faction-danger-gals':{ border: 'border-pink-400',    text: 'text-pink-400',    bg: 'bg-pink-400',    glow: 'shadow-[0_0_20px_rgba(244,114,182,0.4)]' },
    'faction-edgerunners':{ border: 'border-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-500', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.4)]' },
    'faction-gen-red':    { border: 'border-white',       text: 'text-white',       bg: 'bg-white',       glow: 'shadow-[0_0_20px_rgba(255,255,255,0.3)]' },
    'faction-lawmen':     { border: 'border-blue-500',    text: 'text-blue-400',    bg: 'bg-blue-500',    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.4)]' },
    'faction-maelstrom':  { border: 'border-red-700',     text: 'text-red-600',     bg: 'bg-red-700',     glow: 'shadow-[0_0_20px_rgba(185,28,28,0.4)]' },
    'faction-trauma-team':{ border: 'border-white',       text: 'text-white',       bg: 'bg-white',       glow: 'shadow-[0_0_20px_rgba(255,255,255,0.3)]' },
    'faction-tyger-claws':{ border: 'border-cyan-400',    text: 'text-cyan-400',    bg: 'bg-cyan-400',    glow: 'shadow-[0_0_20px_rgba(34,211,238,0.4)]' },
    'faction-zoners':     { border: 'border-orange-500',  text: 'text-orange-400',  bg: 'bg-orange-500',  glow: 'shadow-[0_0_20px_rgba(249,115,22,0.4)]' },
};
const DEFAULT_FC = { border: 'border-primary', text: 'text-primary', bg: 'bg-primary', glow: 'glow-primary' };

interface CampaignHeaderProps {
    campaign: Campaign;
    faction: Faction | undefined;
}

export function CampaignHeader({ campaign, faction }: CampaignHeaderProps) {
    const { catalog, updateCampaign } = useStore();
    const streetCred = MathService.calculateCampaignStreetCred(campaign, catalog);
    const influence = MathService.calculateCampaignInfluence(campaign, catalog);
    const fc = (faction ? FACTION_COLORS[faction.id] : null) ?? DEFAULT_FC;

    // Editable name
    const [editing, setEditing] = useState(false);
    const [nameValue, setNameValue] = useState(campaign.name);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { setNameValue(campaign.name); }, [campaign.name]);
    useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

    const commitName = () => {
        const trimmed = nameValue.trim();
        if (trimmed && trimmed !== campaign.name) {
            updateCampaign(campaign.id, { name: trimmed });
        } else {
            setNameValue(campaign.name);
        }
        setEditing(false);
    };

    return (
        <div className="relative z-10 mb-6">
            <div className="flex items-start gap-4">
                {/* Left: Title + Stats */}
                <div className="flex-1 min-w-0">
                    {/* Editable Campaign Name */}
                    <div className="group/name flex items-center gap-2 mb-3">
                        {editing ? (
                            <input
                                ref={inputRef}
                                value={nameValue}
                                onChange={(e) => setNameValue(e.target.value)}
                                onBlur={commitName}
                                onKeyDown={(e) => { if (e.key === 'Enter') commitName(); if (e.key === 'Escape') { setNameValue(campaign.name); setEditing(false); } }}
                                className="text-3xl md:text-5xl font-display font-bold uppercase text-white tracking-tighter leading-none bg-transparent border-b-2 border-secondary focus:outline-none w-full"
                            />
                        ) : (
                            <h1
                                className="text-3xl md:text-5xl font-display font-bold uppercase text-white tracking-tighter leading-none glitch-text cursor-pointer truncate"
                                data-text={campaign.name}
                                onClick={() => setEditing(true)}
                            >
                                {campaign.name}
                            </h1>
                        )}
                        {!editing && (
                            <button onClick={() => setEditing(true)} className="opacity-0 group-hover/name:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-secondary">
                                <Pencil className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Compact Stats Row */}
                    <div className="flex flex-wrap gap-4 md:gap-6">
                        {/* Funds */}
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-8 bg-primary" />
                            <div>
                                <div className="text-[9px] font-mono-tech text-muted-foreground uppercase tracking-widest leading-none">Funds</div>
                                <div className="text-xl font-mono-tech font-bold text-primary leading-tight">€${campaign.ebBank.toLocaleString()}</div>
                            </div>
                        </div>
                        {/* Street Cred */}
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-8 bg-secondary" />
                            <div>
                                <div className="text-[9px] font-mono-tech text-muted-foreground uppercase tracking-widest leading-none">Street Cred</div>
                                <div className="text-xl font-mono-tech font-bold text-secondary leading-tight">LVL {streetCred}</div>
                            </div>
                        </div>
                        {/* Influence */}
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-8 bg-accent" />
                            <div className="text-center">
                                <div className="text-[9px] font-mono-tech text-muted-foreground uppercase tracking-widest leading-none">Influence</div>
                                <div className="text-xl font-mono-tech font-bold text-accent leading-tight">{influence}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Faction Badge (compact) */}
                <div className="shrink-0">
                    <div className={`bg-black border-2 ${fc.border} flex flex-col items-center overflow-hidden ${fc.glow}`}>
                        <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center">
                            {faction?.imageUrl ? (
                                <img src={faction.imageUrl} className="w-full h-full object-cover" />
                            ) : (
                                <span className={`font-display ${fc.text} text-2xl font-bold`}>{faction?.name?.[0] ?? '?'}</span>
                            )}
                        </div>
                        <div className={`w-full text-center py-0.5 text-[8px] font-mono-tech ${fc.text} uppercase tracking-wider font-bold bg-black/80 border-t ${fc.border}`}>
                            {faction?.name ?? 'Unknown'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
