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
        <div className="space-y-4 pb-20">
            <Card className="sticky top-0 z-10 border-b shadow-sm rounded-none -mx-4 px-4 pt-4 bg-background/95 backdrop-blur">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="font-bold text-lg">Team Builder</h2>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">Target EB:</span>
                        <Input
                            type="number"
                            value={targetEB}
                            onChange={(e) => setTargetEB(Number(e.target.value))}
                            className="w-20 h-8"
                        />
                    </div>
                </div>
                <div className="flex justify-between items-center mb-4">
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Total Cost</span>
                        <span className={`text-xl font-mono font-bold ${totalCost > targetEB ? 'text-destructive' : 'text-primary'}`}>
                            {totalCost} <span className="text-sm text-muted-foreground">/ {targetEB}</span>
                        </span>
                    </div>
                    <Button onClick={handleStartMatch} disabled={!isValid} variant={isValid ? 'default' : 'secondary'}>
                        <Swords className="w-4 h-4 mr-2" /> Fight!
                    </Button>
                </div>

                {validationErrors.length > 0 && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Invalid Team</AlertTitle>
                        <AlertDescription>
                            <ul className="list-disc pl-4 text-xs">
                                {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
                            </ul>
                        </AlertDescription>
                    </Alert>
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
                        <Card
                            key={recruit.id}
                            className={`cursor-pointer transition-all ${isSelected ? 'border-primary ring-1 ring-primary bg-primary/10' : 'hover:bg-accent'}`}
                            onClick={() => toggleSelection(recruit.id)}
                        >
                            <CardContent className="p-3 flex items-center space-x-3">
                                <div className="w-12 h-12 bg-muted rounded overflow-hidden shrink-0">
                                    {lineage.imageUrl && <img src={lineage.imageUrl} className="w-full h-full object-cover" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <span className="font-bold text-sm">{recruit.name || lineage.name}</span>
                                        <span className="text-xs font-mono text-warning">{profile.costEB} EB</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground flex justify-between items-center mt-1">
                                        <span>{lineage.type} • Rank {profile.level}</span>
                                        {isSelected && <CheckCircle2 className="w-4 h-4 text-primary" />}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
