'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Campaign, MatchTeam } from '@/types';
import { useStore } from '@/store/useStore';
import { MathService } from '@/lib/math';
import { ValidationService } from '@/lib/validation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, AlertTriangle, Swords } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface TeamBuilderProps {
    campaign: Campaign;
}

export function TeamBuilder({ campaign }: TeamBuilderProps) {
    const router = useRouter();
    const { catalog, setActiveMatchTeam } = useStore();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [targetEB, setTargetEB] = useState(150);

    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    // Construct temporary team for validation
    const currentTeam: MatchTeam = {
        id: 'temp-team',
        campaignId: campaign.id,
        targetEB: targetEB,
        selectedRecruitIds: selectedIds
    };

    const validationErrors = ValidationService.validateRoster(currentTeam, campaign, catalog);
    const totalCost = MathService.calculateTeamCost(currentTeam, campaign, catalog);
    const isValid = validationErrors.length === 0;

    const handleStartMatch = () => {
        if (!isValid) return;
        const matchTeam: MatchTeam = {
            id: uuidv4(),
            campaignId: campaign.id,
            targetEB,
            selectedRecruitIds: selectedIds
        };
        setActiveMatchTeam(matchTeam);
        router.push('/play');
    };

    const getProfile = (profileId: string) => catalog.profiles.find(p => p.id === profileId);
    const getLineage = (lineageId: string) => catalog.lineages.find(l => l.id === lineageId);

    return (
        <div className="space-y-4 pb-28">
            <Card className="sticky top-0 z-20 rounded-b-2xl rounded-t-none -mx-4 px-6 py-4 glass border-x-0 border-t-0 shadow-lg transition-all duration-300">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <h2 className="font-bold text-lg text-foreground tracking-tight">Team Builder</h2>
                        <span className={`text-3xl font-mono font-bold tracking-tighter ${totalCost > targetEB ? 'text-destructive drop-shadow-[0_0_8px_rgba(255,0,60,0.5)]' : 'text-primary drop-shadow-[0_0_8px_rgba(252,238,10,0.5)]'}`}>
                            {totalCost}
                            <span className="text-sm font-sans font-medium text-muted-foreground ml-2 tracking-normal">/ {targetEB} EB</span>
                        </span>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center space-x-2 bg-background/30 backdrop-blur rounded-lg p-1 border border-white/5">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground px-2">Max</span>
                            <Input
                                type="number"
                                value={targetEB}
                                onChange={(e) => setTargetEB(Number(e.target.value))}
                                className="w-16 h-7 text-right bg-transparent border-none focus-visible:ring-0 font-mono text-sm p-0 pr-2"
                            />
                        </div>
                    </div>
                </div>

                <Button
                    onClick={handleStartMatch}
                    disabled={!isValid}
                    className={`w-full font-bold tracking-wider uppercase transition-all duration-300 ${isValid ? 'shadow-[0_0_20px_rgba(252,238,10,0.3)] hover:shadow-[0_0_30px_rgba(252,238,10,0.5)] scale-100' : 'opacity-80'}`}
                    variant={isValid ? 'default' : 'secondary'}
                >
                    <Swords className="w-4 h-4 mr-2" />
                    {isValid ? 'Iniate Combat' : 'Invalid Roster'}
                </Button>

                {validationErrors.length > 0 && (
                    <div className="mt-3 bg-destructive/10 border border-destructive/20 rounded-lg p-3 animate-in slide-in-from-top-2">
                        <div className="flex items-center gap-2 text-destructive text-xs font-bold uppercase tracking-wider mb-1">
                            <AlertTriangle className="h-3 w-3" />
                            <span>Roster Issues</span>
                        </div>
                        <ul className="list-disc list-inside text-[10px] text-destructive-foreground/80 space-y-0.5">
                            {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
                        </ul>
                    </div>
                )}
            </Card>

            <div className="space-y-2">
                {campaign.hqRoster.length === 0 && <div className="text-center text-muted-foreground py-8">No models to recruit. Go to HQ.</div>}
                {campaign.hqRoster.map(recruit => {
                    const profile = getProfile(recruit.profileId);
                    const lineage = profile ? getLineage(profile.lineageId) : null;
                    if (!profile || !lineage) return null;

                    const isSelected = selectedIds.includes(recruit.id);

                    return (
                        <div
                            key={recruit.id}
                            className={`
                                relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer group
                                ${isSelected
                                    ? 'bg-primary/10 border-primary/50 shadow-[0_0_15px_rgba(252,238,10,0.15)]'
                                    : 'bg-card/40 border-white/5 hover:bg-white/5 hover:border-white/10'
                                }
                            `}
                            onClick={() => toggleSelection(recruit.id)}
                        >
                            <div className="flex p-3 items-center gap-4">
                                <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-black/20 shrink-0 ring-1 ring-white/10 group-hover:ring-white/20 transition-all">
                                    {lineage.imageUrl && <img src={lineage.imageUrl} className={`w-full h-full object-cover transition-all duration-500 ${isSelected ? 'scale-110 saturate-100' : 'saturate-50 group-hover:scale-105'}`} />}

                                    {/* Rank Badge */}
                                    <div className="absolute bottom-0 right-0 bg-background/80 backdrop-blur text-[9px] font-mono px-1 rounded-tl">
                                        R{profile.level}
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className={`font-bold text-sm tracking-tight truncate ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                                                {recruit.name || lineage.name}
                                            </h4>
                                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                                {lineage.type}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="font-mono font-bold text-sm text-foreground">{profile.costEB}</span>
                                            <span className="text-[8px] text-muted-foreground font-mono">EB</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isSelected ? 'border-primary bg-primary text-black scale-100' : 'border-muted-foreground/30 scale-90 opacity-50'}`}>
                                    {isSelected && <CheckCircle2 className="w-4 h-4" />}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
