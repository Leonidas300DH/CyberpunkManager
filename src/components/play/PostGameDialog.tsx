'use client';

import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Campaign, MatchTeam, CatalogData, TokenState, MatchLogEntry, MatchLogRecruit } from '@/types';
import { canHaveTiers, getBaseProfile, getTierLabel } from '@/lib/tiers';
import { MathService } from '@/lib/math';
import { v4 as uuidv4 } from 'uuid';
import { Trophy, Skull, ChevronRight, ShieldAlert, UserPlus, ArrowUp, Ban, Check, AlertTriangle } from 'lucide-react';

type Step = 'result' | 'promotion' | 'casualties' | 'summary';
type MatchResult = 'victory' | 'defeat';
type PromotionChoice = 'promote' | 'recruit-merc' | 'decline';
type CasualtyDecision = 'safe' | 'major-injury';

interface PostGameDialogProps {
    open: boolean;
    onClose: () => void;
    campaign: Campaign;
    activeMatchTeam: MatchTeam;
    catalog: CatalogData;
    onConfirm: (updates: Partial<Campaign>, logEntry: MatchLogEntry) => void;
}

const BTN = "flex items-center gap-2 px-4 py-2.5 font-display font-bold text-sm uppercase tracking-widest transition-colors";
const BTN_PRIMARY = `${BTN} bg-primary text-black hover:bg-white clip-corner-br`;
const BTN_ACCENT = `${BTN} bg-accent text-white hover:bg-red-700 clip-corner-br`;
const BTN_OUTLINE = `${BTN} border border-border text-muted-foreground hover:text-white hover:border-white`;
const STEP_LABEL = "font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground mb-3";

export function PostGameDialog({ open, onClose, campaign, activeMatchTeam, catalog, onConfirm }: PostGameDialogProps) {
    const [step, setStep] = useState<Step>('result');
    const [matchResult, setMatchResult] = useState<MatchResult | null>(null);

    // Promotion state
    const [promotionChoice, setPromotionChoice] = useState<PromotionChoice>('decline');
    const [selectedPromoteId, setSelectedPromoteId] = useState<string | null>(null);
    const [selectedMercLineageId, setSelectedMercLineageId] = useState<string | null>(null);

    // Casualties state
    const [casualtyDecisions, setCasualtyDecisions] = useState<Record<string, CasualtyDecision>>({});

    const tokenStates = activeMatchTeam.tokenStates ?? {};
    const deadModelIds = activeMatchTeam.deadModelIds ?? [];

    // Helpers
    const getProfile = (profileId: string) => catalog.profiles.find(p => p.id === profileId);
    const getLineage = (lineageId: string) => catalog.lineages.find(l => l.id === lineageId);

    // Match roster (characters that were in the match)
    const matchRoster = useMemo(() => {
        return activeMatchTeam.selectedRecruitIds
            .map(id => campaign.hqRoster.find(r => r.id === id))
            .filter(Boolean) as Campaign['hqRoster'];
    }, [activeMatchTeam.selectedRecruitIds, campaign.hqRoster]);

    // Characters eligible for promotion (victory only):
    // - Must have tiers available (canHaveTiers)
    // - Not a Merc
    // - Has a next profile level
    // - Was in the match
    const promotionEligible = useMemo(() => {
        return matchRoster.filter(recruit => {
            const profile = getProfile(recruit.currentProfileId);
            const lineage = profile ? getLineage(profile.lineageId) : null;
            if (!profile || !lineage) return false;
            if (lineage.isMerc) return false;
            if (!canHaveTiers(lineage)) return false;
            const nextProfile = catalog.profiles.find(p => p.lineageId === recruit.lineageId && p.level === profile.level + 1);
            return !!nextProfile;
        });
    }, [matchRoster, catalog.profiles]);

    // Merc lineages available for free recruitment
    const mercLineages = useMemo(() => {
        const recruitedLineageIds = new Set(campaign.hqRoster.map(r => r.lineageId));
        return catalog.lineages.filter(l => {
            if (recruitedLineageIds.has(l.id)) return false;
            if (l.factionIds.includes(campaign.factionId) && !l.isMerc) return false;
            return l.isMerc || l.factionIds.includes('faction-edgerunners');
        });
    }, [catalog.lineages, campaign.hqRoster, campaign.factionId]);

    // Veterans/Elites who were wounded or KIA during the match
    const casualties = useMemo(() => {
        return matchRoster.filter(recruit => {
            const profile = getProfile(recruit.currentProfileId);
            if (!profile || profile.level === 0) return false;
            const lineage = getLineage(recruit.lineageId);
            if (!lineage) return false;

            // Check if wounded (any token with wounded: true)
            const tokens: TokenState[] = tokenStates[recruit.id] ?? [];
            const wasWounded = tokens.some(t => t.wounded);
            const wasKIA = deadModelIds.includes(recruit.id);

            return wasWounded || wasKIA;
        });
    }, [matchRoster, tokenStates, deadModelIds]);

    // Street cred before
    const scBefore = MathService.calculateCampaignStreetCred(campaign, catalog);

    // ── Navigation ──

    const goNext = () => {
        if (step === 'result') {
            if (matchResult === 'victory') {
                setStep('promotion');
            } else {
                if (casualties.length > 0) setStep('casualties');
                else setStep('summary');
            }
        } else if (step === 'promotion') {
            if (casualties.length > 0) setStep('casualties');
            else setStep('summary');
        } else if (step === 'casualties') {
            setStep('summary');
        }
    };

    const goBack = () => {
        if (step === 'promotion') setStep('result');
        else if (step === 'casualties') {
            if (matchResult === 'victory') setStep('promotion');
            else setStep('result');
        } else if (step === 'summary') {
            if (casualties.length > 0) setStep('casualties');
            else if (matchResult === 'victory') setStep('promotion');
            else setStep('result');
        }
    };

    // ── Compute final updates ──

    const computeUpdates = (): { updates: Partial<Campaign>; events: string[] } => {
        const events: string[] = [];
        let newRoster = [...campaign.hqRoster];
        let newEbBank = campaign.ebBank;
        let newCarryingLeaderPenalty = campaign.carryingLeaderPenalty;

        // 1. Promotion
        if (matchResult === 'victory' && promotionChoice === 'promote' && selectedPromoteId) {
            const recruit = newRoster.find(r => r.id === selectedPromoteId);
            if (recruit) {
                const currentProfile = getProfile(recruit.currentProfileId);
                if (currentProfile) {
                    const nextProfile = catalog.profiles.find(p => p.lineageId === recruit.lineageId && p.level === currentProfile.level + 1);
                    if (nextProfile) {
                        const lineage = getLineage(recruit.lineageId);
                        newRoster = newRoster.map(r =>
                            r.id === selectedPromoteId ? { ...r, currentProfileId: nextProfile.id } : r
                        );
                        events.push(`${lineage?.name ?? 'Character'} promoted to ${getTierLabel(nextProfile.level)}`);
                    }
                }
            }
        }

        if (matchResult === 'victory' && promotionChoice === 'recruit-merc' && selectedMercLineageId) {
            const lineage = getLineage(selectedMercLineageId);
            const baseProfile = getBaseProfile(selectedMercLineageId, catalog);
            if (lineage && baseProfile) {
                newRoster = [...newRoster, {
                    id: uuidv4(),
                    lineageId: selectedMercLineageId,
                    currentProfileId: baseProfile.id,
                    equippedItemIds: [],
                    hasMajorInjury: false,
                    quantity: 1,
                    purchasedLevel: 0,
                }];
                events.push(`${lineage.name} recruited as Merc (free)`);
            }
        }

        // 2. Casualties
        for (const recruit of casualties) {
            const decision = casualtyDecisions[recruit.id];
            if (decision !== 'major-injury') continue;

            const profile = getProfile(recruit.currentProfileId);
            const lineage = profile ? getLineage(profile.lineageId) : null;
            if (!profile || !lineage) continue;

            if (lineage.isMerc) {
                // Merc with major injury → removed from HQ
                newRoster = newRoster.filter(r => r.id !== recruit.id);
                events.push(`${lineage.name} (Merc) retired — Major Injury`);
            } else {
                // Non-merc → downgrade to base profile
                const base = getBaseProfile(recruit.lineageId, catalog);
                if (base) {
                    const isLeader = lineage.type === 'Leader';
                    newRoster = newRoster.map(r =>
                        r.id === recruit.id ? { ...r, currentProfileId: base.id, hasMajorInjury: true, purchasedLevel: 0 } : r
                    );
                    events.push(`${lineage.name} downgraded to Base — Major Injury`);
                    if (isLeader) {
                        newCarryingLeaderPenalty = true;
                        events.push('Wounded Leader penalty activated (SC -1)');
                    }
                }
            }
        }

        // Safe casualties — just note them
        for (const recruit of casualties) {
            const decision = casualtyDecisions[recruit.id];
            if (decision === 'safe') {
                const lineage = getLineage(recruit.lineageId);
                events.push(`${lineage?.name ?? 'Character'} — recovered safely`);
            }
        }

        // 3. Loots drawn during match
        const drawnLootIds = activeMatchTeam.drawnLootIds ?? [];
        for (const lootId of drawnLootIds) {
            const loot = (catalog.loots ?? []).find(l => l.id === lootId);
            events.push(`Looted: ${loot?.name ?? lootId}`);
        }

        const updates: Partial<Campaign> = {
            hqRoster: newRoster,
            ebBank: newEbBank,
            carryingLeaderPenalty: newCarryingLeaderPenalty,
        };

        return { updates, events };
    };

    const { updates: previewUpdates, events: previewEvents } = computeUpdates();

    // SC after promotion/casualties
    const campaignAfter = { ...campaign, ...previewUpdates };
    const scAfter = MathService.calculateCampaignStreetCred(campaignAfter, catalog);
    const scChanged = scAfter !== scBefore;

    const handleConfirm = () => {
        const { updates, events } = computeUpdates();

        // Build team snapshot
        const team: MatchLogRecruit[] = matchRoster.map(recruit => {
            const tokens: TokenState[] = tokenStates[recruit.id] ?? [];
            return {
                recruitId: recruit.id,
                lineageId: recruit.lineageId,
                profileId: recruit.currentProfileId,
                equipmentIds: activeMatchTeam.equipmentMap[recruit.id] ?? [],
                wasWounded: tokens.some(t => t.wounded),
                wasKIA: deadModelIds.includes(recruit.id),
            };
        });

        const logEntry: MatchLogEntry = {
            date: new Date().toISOString(),
            result: matchResult!,
            events,
            team,
            targetEB: activeMatchTeam.targetEB,
        };
        // Append to existing matchLog
        const existingLog = campaign.matchLog ?? [];
        updates.matchLog = [...existingLog, logEntry];
        onConfirm(updates, logEntry);
    };

    const allCasualtiesDecided = casualties.every(r => casualtyDecisions[r.id] !== undefined);

    // ── Render helpers ──

    const renderStepIndicator = () => {
        const steps: { key: Step; label: string }[] = [
            { key: 'result', label: 'Result' },
            ...(matchResult === 'victory' ? [{ key: 'promotion' as Step, label: 'Promotion' }] : []),
            ...(casualties.length > 0 ? [{ key: 'casualties' as Step, label: 'Casualties' }] : []),
            { key: 'summary', label: 'Summary' },
        ];
        return (
            <div className="flex items-center gap-1 mb-4">
                {steps.map((s, i) => (
                    <div key={s.key} className="flex items-center gap-1">
                        {i > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground/50" />}
                        <span className={`font-mono-tech text-[10px] uppercase tracking-widest ${step === s.key ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                            {s.label}
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    // ── Step 1: Result ──
    const renderResult = () => (
        <div className="space-y-4">
            <p className={STEP_LABEL}>Step 1 — Match Outcome</p>
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => setMatchResult('victory')}
                    className={`flex flex-col items-center gap-2 p-6 border-2 transition-all ${matchResult === 'victory' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/50 hover:text-white'}`}
                >
                    <Trophy className="w-8 h-8" />
                    <span className="font-display font-bold text-lg uppercase">Victory</span>
                </button>
                <button
                    onClick={() => setMatchResult('defeat')}
                    className={`flex flex-col items-center gap-2 p-6 border-2 transition-all ${matchResult === 'defeat' ? 'border-accent bg-accent/10 text-accent' : 'border-border text-muted-foreground hover:border-accent/50 hover:text-white'}`}
                >
                    <Skull className="w-8 h-8" />
                    <span className="font-display font-bold text-lg uppercase">Defeat</span>
                </button>
            </div>
            <div className="flex justify-end pt-2">
                <button onClick={goNext} disabled={!matchResult} className={`${BTN_PRIMARY} ${!matchResult ? 'opacity-40 cursor-not-allowed' : ''}`}>
                    Continue <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );

    // ── Step 2: Promotion ──
    const renderPromotion = () => (
        <div className="space-y-4">
            <p className={STEP_LABEL}>Step 2 — Promotion Reward</p>
            <p className="text-sm text-muted-foreground">Victory grants one free promotion or Merc recruitment.</p>

            <div className="space-y-2">
                {/* Promote option */}
                <label
                    className={`flex items-start gap-3 p-3 border cursor-pointer transition-colors ${promotionChoice === 'promote' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
                    onClick={() => setPromotionChoice('promote')}
                >
                    <ArrowUp className={`w-5 h-5 mt-0.5 shrink-0 ${promotionChoice === 'promote' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="flex-1">
                        <div className="font-display font-bold text-sm uppercase">Promote a character</div>
                        {promotionChoice === 'promote' && (
                            <div className="mt-2 space-y-1">
                                {promotionEligible.length === 0 ? (
                                    <p className="text-xs text-muted-foreground italic">No eligible characters</p>
                                ) : promotionEligible.map(recruit => {
                                    const profile = getProfile(recruit.currentProfileId)!;
                                    const lineage = getLineage(recruit.lineageId)!;
                                    const nextLevel = profile.level + 1;
                                    return (
                                        <button
                                            key={recruit.id}
                                            onClick={(e) => { e.stopPropagation(); setSelectedPromoteId(recruit.id); }}
                                            className={`w-full text-left px-2 py-1.5 text-xs font-mono-tech border transition-colors ${selectedPromoteId === recruit.id ? 'border-primary text-primary bg-primary/10' : 'border-border text-white hover:border-primary/50'}`}
                                        >
                                            {lineage.name} — {getTierLabel(profile.level)} → {getTierLabel(nextLevel)}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </label>

                {/* Recruit Merc option */}
                <label
                    className={`flex items-start gap-3 p-3 border cursor-pointer transition-colors ${promotionChoice === 'recruit-merc' ? 'border-secondary bg-secondary/5' : 'border-border hover:border-secondary/30'}`}
                    onClick={() => setPromotionChoice('recruit-merc')}
                >
                    <UserPlus className={`w-5 h-5 mt-0.5 shrink-0 ${promotionChoice === 'recruit-merc' ? 'text-secondary' : 'text-muted-foreground'}`} />
                    <div className="flex-1">
                        <div className="font-display font-bold text-sm uppercase">Recruit a Merc</div>
                        {promotionChoice === 'recruit-merc' && (
                            <div className="mt-2 space-y-1">
                                {mercLineages.length === 0 ? (
                                    <p className="text-xs text-muted-foreground italic">No Mercs available</p>
                                ) : mercLineages.map(lineage => {
                                    const base = getBaseProfile(lineage.id, catalog);
                                    if (!base) return null;
                                    return (
                                        <button
                                            key={lineage.id}
                                            onClick={(e) => { e.stopPropagation(); setSelectedMercLineageId(lineage.id); }}
                                            className={`w-full text-left px-2 py-1.5 text-xs font-mono-tech border transition-colors ${selectedMercLineageId === lineage.id ? 'border-secondary text-secondary bg-secondary/10' : 'border-border text-white hover:border-secondary/50'}`}
                                        >
                                            {lineage.name} — {base.costEB} EB (free)
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </label>

                {/* Decline option */}
                <label
                    className={`flex items-center gap-3 p-3 border cursor-pointer transition-colors ${promotionChoice === 'decline' ? 'border-white/50 bg-white/5' : 'border-border hover:border-white/30'}`}
                    onClick={() => setPromotionChoice('decline')}
                >
                    <Ban className={`w-5 h-5 shrink-0 ${promotionChoice === 'decline' ? 'text-white' : 'text-muted-foreground'}`} />
                    <div className="font-display font-bold text-sm uppercase">Decline</div>
                </label>
            </div>

            <div className="flex justify-between pt-2">
                <button onClick={goBack} className={BTN_OUTLINE}>Back</button>
                <button
                    onClick={goNext}
                    disabled={
                        (promotionChoice === 'promote' && !selectedPromoteId) ||
                        (promotionChoice === 'recruit-merc' && !selectedMercLineageId)
                    }
                    className={`${BTN_PRIMARY} ${(promotionChoice === 'promote' && !selectedPromoteId) || (promotionChoice === 'recruit-merc' && !selectedMercLineageId) ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                    Continue <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );

    // ── Step 3: Casualties ──
    const renderCasualties = () => (
        <div className="space-y-4">
            <p className={STEP_LABEL}>Step {matchResult === 'victory' ? 3 : 2} — Casualty Rolls</p>
            <p className="text-sm text-muted-foreground">
                Roll a die for each wounded/KIA Veteran or Elite. On a fumble → Major Injury.
            </p>

            <div className="space-y-2">
                {casualties.map(recruit => {
                    const profile = getProfile(recruit.currentProfileId);
                    const lineage = profile ? getLineage(profile.lineageId) : null;
                    if (!profile || !lineage) return null;

                    const tokens: TokenState[] = tokenStates[recruit.id] ?? [];
                    const wasKIA = deadModelIds.includes(recruit.id);
                    const wasWounded = tokens.some(t => t.wounded);
                    const decision = casualtyDecisions[recruit.id];

                    return (
                        <div key={recruit.id} className="border border-border p-3">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <span className="font-display font-bold text-sm uppercase">{lineage.name}</span>
                                    <span className="font-mono-tech text-[10px] text-muted-foreground ml-2">
                                        {getTierLabel(profile.level)}{lineage.isMerc ? ' · Merc' : ''}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {wasKIA && <span className="font-mono-tech text-[9px] bg-accent/20 text-accent px-1.5 py-0.5 uppercase">KIA</span>}
                                    {wasWounded && !wasKIA && <span className="font-mono-tech text-[9px] bg-yellow-600/20 text-yellow-500 px-1.5 py-0.5 uppercase">Wounded</span>}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setCasualtyDecisions(prev => ({ ...prev, [recruit.id]: 'safe' }))}
                                    className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-display font-bold uppercase border transition-colors ${decision === 'safe' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-border text-muted-foreground hover:border-emerald-500/50'}`}
                                >
                                    <Check className="w-3.5 h-3.5" /> Safe
                                </button>
                                <button
                                    onClick={() => setCasualtyDecisions(prev => ({ ...prev, [recruit.id]: 'major-injury' }))}
                                    className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-display font-bold uppercase border transition-colors ${decision === 'major-injury' ? 'border-accent bg-accent/10 text-accent' : 'border-border text-muted-foreground hover:border-accent/50'}`}
                                >
                                    <AlertTriangle className="w-3.5 h-3.5" /> Major Injury
                                </button>
                            </div>
                            {decision === 'major-injury' && (
                                <p className="text-[10px] font-mono-tech text-accent/80 mt-1.5">
                                    {lineage.isMerc ? '→ Merc will be retired from HQ' : lineage.type === 'Leader' ? '→ Downgraded to Base + Wounded Leader penalty' : '→ Downgraded to Base profile'}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-between pt-2">
                <button onClick={goBack} className={BTN_OUTLINE}>Back</button>
                <button
                    onClick={goNext}
                    disabled={!allCasualtiesDecided}
                    className={`${BTN_PRIMARY} ${!allCasualtiesDecided ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                    Continue <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );

    // ── Step 4: Summary ──
    const renderSummary = () => (
        <div className="space-y-4">
            <p className={STEP_LABEL}>Summary — Post-Game Report</p>

            <div className="border border-border divide-y divide-border">
                {/* Result */}
                <div className="flex items-center gap-2 px-3 py-2">
                    {matchResult === 'victory' ? <Trophy className="w-4 h-4 text-primary" /> : <Skull className="w-4 h-4 text-accent" />}
                    <span className={`font-display font-bold text-sm uppercase ${matchResult === 'victory' ? 'text-primary' : 'text-accent'}`}>
                        {matchResult}
                    </span>
                </div>

                {/* Events */}
                {previewEvents.map((event, i) => (
                    <div key={i} className="flex items-start gap-2 px-3 py-2">
                        <ChevronRight className="w-3 h-3 mt-0.5 text-muted-foreground shrink-0" />
                        <span className="text-xs font-mono-tech text-white">{event}</span>
                    </div>
                ))}

                {previewEvents.length === 0 && (
                    <div className="px-3 py-2 text-xs font-mono-tech text-muted-foreground italic">No changes</div>
                )}

                {/* Street Cred */}
                <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-xs font-mono-tech text-muted-foreground uppercase">Street Cred</span>
                    <span className={`font-mono-tech text-sm font-bold ${scChanged ? 'text-primary' : 'text-white'}`}>
                        {scBefore} {scChanged ? `→ ${scAfter}` : ''}
                    </span>
                </div>

                {/* Supply reminder */}
                {scAfter > scBefore && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-primary/5">
                        <ShieldAlert className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-xs font-mono-tech text-primary">Check Supply — new gear may be available at SC {scAfter}</span>
                    </div>
                )}
            </div>

            <div className="flex justify-between pt-2">
                <button onClick={goBack} className={BTN_OUTLINE}>Back</button>
                <button onClick={handleConfirm} className={BTN_ACCENT}>
                    Return to HQ
                </button>
            </div>
        </div>
    );

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
            <DialogContent className="bg-black border-border max-w-md max-h-[85vh] overflow-y-auto !top-[8vh] !translate-y-0" showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle className="font-display text-xl uppercase tracking-wider text-white">Post-Game</DialogTitle>
                    <DialogDescription className="sr-only">Post-match resolution wizard</DialogDescription>
                </DialogHeader>
                {renderStepIndicator()}
                {step === 'result' && renderResult()}
                {step === 'promotion' && renderPromotion()}
                {step === 'casualties' && renderCasualties()}
                {step === 'summary' && renderSummary()}
            </DialogContent>
        </Dialog>
    );
}
