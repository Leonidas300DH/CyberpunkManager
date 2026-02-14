import { useState } from 'react';
import { Campaign, MatchTeam } from '@/types';
import { useStore } from '@/store/useStore';
import { MathService } from '@/lib/math';
import { ValidationService } from '@/lib/validation';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';

export interface TeamBuilderHook {
    targetEB: number;
    setTargetEB: (value: number) => void;
    totalCost: number;
    isValid: boolean;
    validationErrors: string[];
    selectedIds: string[];
    toggleSelection: (id: string) => void;
    handleStartMatch: () => void;
}

export function useTeamBuilder(campaign: Campaign): TeamBuilderHook {
    const router = useRouter();
    const { catalog, setActiveMatchTeam } = useStore();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [targetEB, setTargetEB] = useState(150);

    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

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

    return {
        targetEB,
        setTargetEB,
        totalCost,
        isValid,
        validationErrors,
        selectedIds,
        toggleSelection,
        handleStartMatch
    };
}
