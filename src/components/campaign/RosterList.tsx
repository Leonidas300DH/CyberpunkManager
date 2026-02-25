'use client';

import { useState } from 'react';
import { Campaign } from '@/types';
import { useStore } from '@/store/useStore';
import { Plus, Search, X, Trash2, ChevronRight, ChevronDown, ArrowUp } from 'lucide-react';
import { CharacterCard } from '@/components/characters/CharacterCard';
import { useCardGrid } from '@/hooks/useCardGrid';
import { v4 as uuidv4 } from 'uuid';
import { canHaveTiers, getSurchargeForLevel, getTierLabel, getTierSurcharges } from '@/lib/tiers';

interface RosterListProps {
    campaign: Campaign;
}

export function RosterList({ campaign }: RosterListProps) {
    const { catalog, updateCampaign } = useStore();
    const { gridClass, cardStyle } = useCardGrid();
    const [search, setSearch] = useState('');
    const [expandedAvailable, setExpandedAvailable] = useState<Set<string>>(new Set());

    const toggleExpandAvailable = (id: string) => {
        setExpandedAvailable(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const getProfile = (profileId: string) => catalog.profiles.find(p => p.id === profileId);
    const getLineage = (lineageId: string) => catalog.lineages.find(l => l.id === lineageId);
    const getProfilesForLineage = (lineageId: string) =>
        catalog.profiles.filter(p => p.lineageId === lineageId).sort((a, b) => a.level - b.level);

    const recruitedLineageIds = new Set(campaign.hqRoster.map(r => r.lineageId));

    const getBaseProfile = (lineageId: string) =>
        catalog.profiles.find(p => p.lineageId === lineageId && p.level === 0);

    // Faction lineages
    const factionLineages = catalog.lineages.filter(l =>
        l.factionIds.includes(campaign.factionId) && !l.isMerc
    );

    // Mercenaries
    const mercLineages = catalog.lineages.filter(l => {
        if (l.factionIds.includes(campaign.factionId) && !l.isMerc) return false;
        return l.isMerc || l.factionIds.includes('faction-edgerunners');
    });

    const filterBySearch = (name: string) =>
        !search || name.toLowerCase().includes(search.toLowerCase());

    const surcharges = getTierSurcharges(catalog);

    const handleRecruit = (lineageId: string, level: number = 0) => {
        const profile = catalog.profiles.find(p => p.lineageId === lineageId && p.level === level);
        if (!profile) return;
        const baseProfile = getBaseProfile(lineageId);
        const baseCost = baseProfile?.costEB ?? profile.costEB;
        const totalCost = baseCost + getSurchargeForLevel(level, catalog);
        if (campaign.ebBank < totalCost) return;

        updateCampaign(campaign.id, {
            hqRoster: [...campaign.hqRoster, {
                id: uuidv4(),
                lineageId,
                currentProfileId: profile.id,
                equippedItemIds: [] as string[],
                hasMajorInjury: false,
                quantity: 1,
                purchasedLevel: level,
            }],
            ebBank: campaign.ebBank - totalCost,
        });
    };

    const handleUpgrade = (recruitId: string) => {
        const recruit = campaign.hqRoster.find(r => r.id === recruitId);
        if (!recruit) return;
        const currentProfile = getProfile(recruit.currentProfileId);
        if (!currentProfile) return;
        const nextLevel = currentProfile.level + 1;
        const nextProfile = catalog.profiles.find(p => p.lineageId === recruit.lineageId && p.level === nextLevel);
        if (!nextProfile) return;

        // Delta surcharge cost
        const currentSurcharge = getSurchargeForLevel(currentProfile.level, catalog);
        const nextSurcharge = getSurchargeForLevel(nextLevel, catalog);
        const deltaCost = nextSurcharge - currentSurcharge;
        if (campaign.ebBank < deltaCost) return;

        updateCampaign(campaign.id, {
            hqRoster: campaign.hqRoster.map(r =>
                r.id === recruitId ? { ...r, currentProfileId: nextProfile.id } : r
            ),
            ebBank: campaign.ebBank - deltaCost,
            // purchasedLevel stays unchanged — upgrade ≠ direct purchase
        });
    };

    const handleDismiss = (recruitId: string) => {
        const recruit = campaign.hqRoster.find(r => r.id === recruitId);
        if (!recruit) return;
        const baseProfile = getBaseProfile(recruit.lineageId);
        const baseCost = baseProfile?.costEB ?? 0;
        // Refund = baseCost + surcharge for purchased level + delta upgrade cost
        const currentProfile = getProfile(recruit.currentProfileId);
        const currentLevel = currentProfile?.level ?? 0;
        const purchasedLevel = recruit.purchasedLevel ?? 0;
        const refund = baseCost + getSurchargeForLevel(currentLevel, catalog);

        updateCampaign(campaign.id, {
            hqRoster: campaign.hqRoster.filter(r => r.id !== recruitId),
            ebBank: campaign.ebBank + refund,
        });
    };

    const factionName = catalog.factions.find(f => f.id === campaign.factionId)?.name ?? 'Faction';

    return (
        <div className="space-y-10">
            {/* ═══════════════════════════════════════════
                SECTION 1 — MY ROSTER
            ═══════════════════════════════════════════ */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <div className="border-l-2 border-primary pl-3">
                        <h3 className="font-display text-xl font-bold uppercase tracking-wider text-white">Your Roster</h3>
                        <span className="text-xs font-mono-tech text-muted-foreground uppercase tracking-widest">
                            {campaign.hqRoster.length} merc{campaign.hqRoster.length !== 1 ? 's' : ''} recruited
                        </span>
                    </div>
                </div>

                {campaign.hqRoster.length === 0 ? (
                    <div className="border-2 border-dashed border-border bg-black/50 p-12 text-center clip-corner-tl-br">
                        <h3 className="text-xl font-display font-bold uppercase text-muted-foreground mb-2">Roster Empty</h3>
                        <p className="text-xs font-mono-tech text-muted-foreground uppercase tracking-widest">Recruit mercs from the catalog below.</p>
                    </div>
                ) : (
                    <div className={gridClass}>
                        {campaign.hqRoster.map(recruit => {
                            const profile = getProfile(recruit.currentProfileId);
                            const lineage = profile ? getLineage(profile.lineageId) : null;
                            if (!profile || !lineage) return null;

                            // Check if upgrade is available
                            const nextLevel = profile.level + 1;
                            const nextProfile = catalog.profiles.find(p => p.lineageId === recruit.lineageId && p.level === nextLevel);
                            const canUpgrade = nextProfile && canHaveTiers(lineage);
                            const upgradeCost = canUpgrade ? getSurchargeForLevel(nextLevel, catalog) - getSurchargeForLevel(profile.level, catalog) : 0;
                            const baseCost = getBaseProfile(recruit.lineageId)?.costEB ?? 0;
                            const refundAmount = baseCost + getSurchargeForLevel(profile.level, catalog);

                            return (
                                <div key={recruit.id} className="relative group/card" style={cardStyle}>
                                    <CharacterCard lineage={lineage} profile={profile} catalogWeapons={catalog.weapons} />
                                    {/* Dismiss button — top right overlay */}
                                    <button
                                        onClick={() => handleDismiss(recruit.id)}
                                        className="absolute top-1 right-1 z-30 p-1.5 bg-black/80 border border-border text-muted-foreground hover:text-accent hover:border-accent transition-colors opacity-0 group-hover/card:opacity-100"
                                        title={`Dismiss — refund ${refundAmount} EB`}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                    {/* Upgrade button */}
                                    {canUpgrade && (
                                        <button
                                            onClick={() => handleUpgrade(recruit.id)}
                                            disabled={campaign.ebBank < upgradeCost}
                                            className={`absolute bottom-1 right-1 z-30 flex items-center gap-1 px-2 py-1 font-mono-tech text-[10px] uppercase border transition-colors opacity-0 group-hover/card:opacity-100 ${
                                                campaign.ebBank >= upgradeCost
                                                    ? 'border-primary/70 text-primary bg-black/80 hover:bg-primary/20'
                                                    : 'border-border text-muted-foreground bg-black/80 cursor-not-allowed'
                                            }`}
                                            title={`Upgrade to ${getTierLabel(nextLevel)} — ${upgradeCost} EB`}
                                        >
                                            <ArrowUp className="w-3 h-3" />
                                            {getTierLabel(nextLevel)} {upgradeCost}EB
                                        </button>
                                    )}
                                    {/* Injury indicator */}
                                    {recruit.hasMajorInjury && (
                                        <div className="absolute bottom-0 left-0 right-0 bg-yellow-600/80 text-center py-0.5 z-20">
                                            <span className="font-mono-tech text-[10px] text-black font-bold uppercase tracking-widest">Injured</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* ═══════════════════════════════════════════
                SECTION 2 — AVAILABLE FOR RECRUITMENT
            ═══════════════════════════════════════════ */}
            <section>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                    <div className="border-l-2 border-secondary pl-3">
                        <h3 className="font-display text-xl font-bold uppercase tracking-wider text-white">Available Mercs</h3>
                        <span className="text-xs font-mono-tech text-muted-foreground uppercase tracking-widest">
                            Click a card to recruit
                        </span>
                    </div>
                    {/* Search */}
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="SEARCH..."
                            className="w-full bg-black border border-border pl-10 pr-8 py-2 font-mono-tech text-sm uppercase text-white placeholder:text-muted-foreground focus:border-secondary focus:outline-none"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                                <X className="w-4 h-4 text-muted-foreground hover:text-white" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Faction characters */}
                {factionLineages.filter(l => filterBySearch(l.name)).length > 0 && (
                    <div className="mb-8">
                        <div className="font-mono-tech text-[10px] uppercase tracking-widest text-primary font-bold border-b border-border pb-1 mb-3">
                            {factionName}
                        </div>
                        <div className={gridClass}>
                            {factionLineages.filter(l => filterBySearch(l.name)).map(lineage => {
                                const profiles = getProfilesForLineage(lineage.id);
                                const baseProfile = profiles.find(p => p.level === 0) ?? profiles[0];
                                if (!baseProfile) return null;
                                const hasTiers = profiles.length > 1 && canHaveTiers(lineage);
                                const isExpanded = expandedAvailable.has(lineage.id);
                                const alreadyRecruited = recruitedLineageIds.has(lineage.id);

                                if (hasTiers && isExpanded) {
                                    // Show all tier versions
                                    return profiles.map(profile => {
                                        const cost = baseProfile.costEB + getSurchargeForLevel(profile.level, catalog);
                                        const cantAfford = campaign.ebBank < cost;
                                        const disabled = alreadyRecruited || cantAfford;
                                        return (
                                            <div key={profile.id} className="relative group/card" style={cardStyle}>
                                                <div className={`w-full ${disabled ? 'opacity-35 saturate-50' : ''} transition-all`}>
                                                    <CharacterCard lineage={lineage} profile={profile} catalogWeapons={catalog.weapons} />
                                                </div>
                                                <div className="text-center mt-1">
                                                    <span className={`font-mono-tech text-[10px] uppercase ${profile.level === 0 ? 'text-muted-foreground' : profile.level === 1 ? 'text-primary' : 'text-accent'}`}>
                                                        {getTierLabel(profile.level)} — {cost} EB
                                                    </span>
                                                    {profile.level === 0 && (
                                                        <button onClick={() => toggleExpandAvailable(lineage.id)} className="ml-1 text-emerald-500 hover:text-white">
                                                            <ChevronDown className="w-3 h-3 inline" />
                                                        </button>
                                                    )}
                                                </div>
                                                {alreadyRecruited ? (
                                                    <div className="absolute inset-0 z-30 flex items-center justify-center">
                                                        <span className="font-mono-tech text-[10px] text-muted-foreground uppercase tracking-widest font-bold bg-black/80 px-2 py-0.5 border border-border">Recruited</span>
                                                    </div>
                                                ) : (
                                                    <button
                                                        disabled={cantAfford}
                                                        onClick={() => handleRecruit(lineage.id, profile.level)}
                                                        className={`absolute inset-0 z-30 flex items-end justify-center pb-2 ${cantAfford ? 'cursor-not-allowed' : 'cursor-pointer opacity-0 hover:opacity-100 bg-gradient-to-t from-black/80 via-transparent to-transparent'} transition-opacity`}
                                                    >
                                                        {!cantAfford ? (
                                                            <span className="font-display font-bold text-xs uppercase tracking-wider bg-primary text-black px-3 py-1 clip-corner-br flex items-center gap-1 shadow-lg shadow-primary/30">
                                                                <Plus className="w-3.5 h-3.5" /> {cost} EB
                                                            </span>
                                                        ) : (
                                                            <span className="font-mono-tech text-[10px] text-accent uppercase font-bold bg-black/80 px-2 py-0.5 border border-accent/50">{cost} EB</span>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    });
                                }

                                // Collapsed view (single base card)
                                const cost = baseProfile.costEB;
                                const cantAfford = campaign.ebBank < cost;
                                const disabled = alreadyRecruited || cantAfford;

                                return (
                                    <div key={lineage.id} className="relative group/card" style={cardStyle}>
                                        <div className={`w-full ${disabled ? 'opacity-35 saturate-50' : ''} transition-all`}>
                                            <CharacterCard lineage={lineage} profile={baseProfile} catalogWeapons={catalog.weapons} />
                                        </div>
                                        {hasTiers && (
                                            <button
                                                onClick={() => toggleExpandAvailable(lineage.id)}
                                                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 px-2 py-0.5 bg-black/80 border border-border text-muted-foreground hover:text-white hover:border-white transition-colors font-mono-tech text-[9px] uppercase"
                                            >
                                                <ChevronRight className="w-3 h-3" />
                                                {profiles.length} tiers
                                            </button>
                                        )}
                                        {alreadyRecruited ? (
                                            <div className="absolute inset-0 z-30 flex items-center justify-center">
                                                <span className="font-mono-tech text-[10px] text-muted-foreground uppercase tracking-widest font-bold bg-black/80 px-2 py-0.5 border border-border">Recruited</span>
                                            </div>
                                        ) : (
                                            <button
                                                disabled={cantAfford}
                                                onClick={() => handleRecruit(lineage.id)}
                                                className={`absolute inset-0 z-30 flex items-end justify-center pb-2 ${cantAfford ? 'cursor-not-allowed' : 'cursor-pointer opacity-0 hover:opacity-100 bg-gradient-to-t from-black/80 via-transparent to-transparent'} transition-opacity`}
                                            >
                                                {!cantAfford ? (
                                                    <span className="font-display font-bold text-xs uppercase tracking-wider bg-primary text-black px-3 py-1 clip-corner-br flex items-center gap-1 shadow-lg shadow-primary/30">
                                                        <Plus className="w-3.5 h-3.5" /> {cost} EB
                                                    </span>
                                                ) : (
                                                    <span className="font-mono-tech text-[10px] text-accent uppercase font-bold bg-black/80 px-2 py-0.5 border border-accent/50">{cost} EB</span>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Mercenaries */}
                {mercLineages.filter(l => filterBySearch(l.name)).length > 0 && (
                    <div>
                        <div className="font-mono-tech text-[10px] uppercase tracking-widest text-secondary font-bold border-b border-border pb-1 mb-3">
                            Mercenaries
                        </div>
                        <div className={gridClass}>
                            {mercLineages.filter(l => filterBySearch(l.name)).map(lineage => {
                                const profiles = getProfilesForLineage(lineage.id);
                                const baseProfile = profiles.find(p => p.level === 0) ?? profiles[0];
                                if (!baseProfile) return null;
                                const hasTiers = profiles.length > 1 && canHaveTiers(lineage);
                                const isExpanded = expandedAvailable.has(lineage.id);
                                const alreadyRecruited = recruitedLineageIds.has(lineage.id);

                                if (hasTiers && isExpanded) {
                                    return profiles.map(profile => {
                                        const cost = baseProfile.costEB + getSurchargeForLevel(profile.level, catalog);
                                        const cantAfford = campaign.ebBank < cost;
                                        const disabled = alreadyRecruited || cantAfford;
                                        return (
                                            <div key={profile.id} className="relative group/card" style={cardStyle}>
                                                <div className={`w-full ${disabled ? 'opacity-35 saturate-50' : ''} transition-all`}>
                                                    <CharacterCard lineage={lineage} profile={profile} catalogWeapons={catalog.weapons} />
                                                </div>
                                                <div className="text-center mt-1">
                                                    <span className={`font-mono-tech text-[10px] uppercase ${profile.level === 0 ? 'text-muted-foreground' : profile.level === 1 ? 'text-primary' : 'text-accent'}`}>
                                                        {getTierLabel(profile.level)} — {cost} EB
                                                    </span>
                                                    {profile.level === 0 && (
                                                        <button onClick={() => toggleExpandAvailable(lineage.id)} className="ml-1 text-emerald-500 hover:text-white">
                                                            <ChevronDown className="w-3 h-3 inline" />
                                                        </button>
                                                    )}
                                                </div>
                                                {alreadyRecruited ? (
                                                    <div className="absolute inset-0 z-30 flex items-center justify-center">
                                                        <span className="font-mono-tech text-[10px] text-muted-foreground uppercase tracking-widest font-bold bg-black/80 px-2 py-0.5 border border-border">Recruited</span>
                                                    </div>
                                                ) : (
                                                    <button
                                                        disabled={cantAfford}
                                                        onClick={() => handleRecruit(lineage.id, profile.level)}
                                                        className={`absolute inset-0 z-30 flex items-end justify-center pb-2 ${cantAfford ? 'cursor-not-allowed' : 'cursor-pointer opacity-0 hover:opacity-100 bg-gradient-to-t from-black/80 via-transparent to-transparent'} transition-opacity`}
                                                    >
                                                        {!cantAfford ? (
                                                            <span className="font-display font-bold text-xs uppercase tracking-wider bg-secondary text-black px-3 py-1 clip-corner-br flex items-center gap-1 shadow-lg shadow-secondary/30">
                                                                <Plus className="w-3.5 h-3.5" /> {cost} EB
                                                            </span>
                                                        ) : (
                                                            <span className="font-mono-tech text-[10px] text-accent uppercase font-bold bg-black/80 px-2 py-0.5 border border-accent/50">{cost} EB</span>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    });
                                }

                                const cost = baseProfile.costEB;
                                const cantAfford = campaign.ebBank < cost;
                                const disabled = alreadyRecruited || cantAfford;

                                return (
                                    <div key={lineage.id} className="relative group/card" style={cardStyle}>
                                        <div className={`w-full ${disabled ? 'opacity-35 saturate-50' : ''} transition-all`}>
                                            <CharacterCard lineage={lineage} profile={baseProfile} catalogWeapons={catalog.weapons} />
                                        </div>
                                        {hasTiers && (
                                            <button
                                                onClick={() => toggleExpandAvailable(lineage.id)}
                                                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 px-2 py-0.5 bg-black/80 border border-border text-muted-foreground hover:text-white hover:border-white transition-colors font-mono-tech text-[9px] uppercase"
                                            >
                                                <ChevronRight className="w-3 h-3" />
                                                {profiles.length} tiers
                                            </button>
                                        )}
                                        {alreadyRecruited ? (
                                            <div className="absolute inset-0 z-30 flex items-center justify-center">
                                                <span className="font-mono-tech text-[10px] text-muted-foreground uppercase tracking-widest font-bold bg-black/80 px-2 py-0.5 border border-border">Recruited</span>
                                            </div>
                                        ) : (
                                            <button
                                                disabled={cantAfford}
                                                onClick={() => handleRecruit(lineage.id)}
                                                className={`absolute inset-0 z-30 flex items-end justify-center pb-2 ${cantAfford ? 'cursor-not-allowed' : 'cursor-pointer opacity-0 hover:opacity-100 bg-gradient-to-t from-black/80 via-transparent to-transparent'} transition-opacity`}
                                            >
                                                {!cantAfford ? (
                                                    <span className="font-display font-bold text-xs uppercase tracking-wider bg-secondary text-black px-3 py-1 clip-corner-br flex items-center gap-1 shadow-lg shadow-secondary/30">
                                                        <Plus className="w-3.5 h-3.5" /> {cost} EB
                                                    </span>
                                                ) : (
                                                    <span className="font-mono-tech text-[10px] text-accent uppercase font-bold bg-black/80 px-2 py-0.5 border border-accent/50">{cost} EB</span>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
