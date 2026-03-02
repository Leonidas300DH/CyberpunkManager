import { useCallback } from 'react';
import { Campaign, MatchTeam } from '@/types';
import { useStore, TeamBuilderDraft } from '@/store/useStore';
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
    equipmentMap: Record<string, string[]>;
    draft: TeamBuilderDraft;
    setDraftPatch: (patch: Partial<TeamBuilderDraft>) => void;
    toggleSelection: (id: string) => void;
    assignEquip: (recruitId: string, itemId: string) => void;
    removeEquip: (recruitId: string, itemId: string) => void;
    moveEquip: (fromRecruitId: string, toRecruitId: string, itemId: string) => void;
    reorderEquip: (recruitId: string, itemId: string, direction: 'up' | 'down') => void;
    reorderSquad: (recruitId: string, direction: 'up' | 'down') => void;
    setSquadOrder: (newIds: string[]) => void;
    handleStartMatch: () => void;
}

export function useTeamBuilder(campaign: Campaign): TeamBuilderHook {
    const router = useRouter();
    const { catalog, setActiveMatchTeam, teamBuilderDrafts, setTeamBuilderDraft, clearTeamBuilderDraft } = useStore();

    const draft = teamBuilderDrafts[campaign.id] ?? { selectedIds: [], equipmentMap: {}, targetEB: 150 };
    const { selectedIds, equipmentMap, targetEB } = draft;

    const setTargetEB = useCallback((value: number) => {
        setTeamBuilderDraft(campaign.id, { targetEB: value });
    }, [campaign.id, setTeamBuilderDraft]);

    const toggleSelection = useCallback((id: string) => {
        const current = teamBuilderDrafts[campaign.id] ?? { selectedIds: [], equipmentMap: {}, targetEB: 150 };
        if (current.selectedIds.includes(id)) {
            const newEquipMap = { ...current.equipmentMap };
            delete newEquipMap[id];
            setTeamBuilderDraft(campaign.id, {
                selectedIds: current.selectedIds.filter(x => x !== id),
                equipmentMap: newEquipMap,
            });
        } else {
            setTeamBuilderDraft(campaign.id, {
                selectedIds: [...current.selectedIds, id],
            });
        }
    }, [campaign.id, teamBuilderDrafts, setTeamBuilderDraft]);

    const assignEquip = useCallback((recruitId: string, itemId: string) => {
        const current = teamBuilderDrafts[campaign.id] ?? { selectedIds: [], equipmentMap: {}, targetEB: 150 };
        const existing = current.equipmentMap[recruitId] ?? [];
        if (existing.includes(itemId)) return;
        setTeamBuilderDraft(campaign.id, {
            equipmentMap: { ...current.equipmentMap, [recruitId]: [...existing, itemId] },
        });
    }, [campaign.id, teamBuilderDrafts, setTeamBuilderDraft]);

    const removeEquip = useCallback((recruitId: string, itemId: string) => {
        const current = teamBuilderDrafts[campaign.id] ?? { selectedIds: [], equipmentMap: {}, targetEB: 150 };
        const existing = current.equipmentMap[recruitId] ?? [];
        const filtered = existing.filter(x => x !== itemId);
        const newMap = { ...current.equipmentMap };
        if (filtered.length === 0) {
            delete newMap[recruitId];
        } else {
            newMap[recruitId] = filtered;
        }
        setTeamBuilderDraft(campaign.id, { equipmentMap: newMap });
    }, [campaign.id, teamBuilderDrafts, setTeamBuilderDraft]);

    const moveEquip = useCallback((fromRecruitId: string, toRecruitId: string, itemId: string) => {
        const current = teamBuilderDrafts[campaign.id] ?? { selectedIds: [], equipmentMap: {}, targetEB: 150 };
        const newMap = { ...current.equipmentMap };
        // Remove from source
        const fromList = (newMap[fromRecruitId] ?? []).filter(x => x !== itemId);
        if (fromList.length === 0) { delete newMap[fromRecruitId]; } else { newMap[fromRecruitId] = fromList; }
        // Add to target
        const toList = newMap[toRecruitId] ?? [];
        if (!toList.includes(itemId)) { newMap[toRecruitId] = [...toList, itemId]; }
        setTeamBuilderDraft(campaign.id, { equipmentMap: newMap });
    }, [campaign.id, teamBuilderDrafts, setTeamBuilderDraft]);

    const reorderEquip = useCallback((recruitId: string, itemId: string, direction: 'up' | 'down') => {
        const current = teamBuilderDrafts[campaign.id] ?? { selectedIds: [], equipmentMap: {}, targetEB: 150 };
        const list = [...(current.equipmentMap[recruitId] ?? [])];
        const idx = list.indexOf(itemId);
        if (idx < 0) return;
        const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= list.length) return;
        [list[idx], list[swapIdx]] = [list[swapIdx], list[idx]];
        setTeamBuilderDraft(campaign.id, { equipmentMap: { ...current.equipmentMap, [recruitId]: list } });
    }, [campaign.id, teamBuilderDrafts, setTeamBuilderDraft]);

    const reorderSquad = useCallback((recruitId: string, direction: 'up' | 'down') => {
        const current = teamBuilderDrafts[campaign.id] ?? { selectedIds: [], equipmentMap: {}, targetEB: 150 };
        const list = [...current.selectedIds];
        const idx = list.indexOf(recruitId);
        if (idx < 0) return;
        const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= list.length) return;
        [list[idx], list[swapIdx]] = [list[swapIdx], list[idx]];
        setTeamBuilderDraft(campaign.id, { selectedIds: list });
    }, [campaign.id, teamBuilderDrafts, setTeamBuilderDraft]);

    const setSquadOrder = useCallback((newIds: string[]) => {
        setTeamBuilderDraft(campaign.id, { selectedIds: newIds });
    }, [campaign.id, setTeamBuilderDraft]);

    const setDraftPatch = useCallback((patch: Partial<TeamBuilderDraft>) => {
        setTeamBuilderDraft(campaign.id, patch);
    }, [campaign.id, setTeamBuilderDraft]);

    const currentTeam: MatchTeam = {
        id: 'temp-team',
        campaignId: campaign.id,
        targetEB: targetEB,
        selectedRecruitIds: selectedIds,
        equipmentMap: equipmentMap,
    };

    const validationErrors = ValidationService.validateRoster(currentTeam, campaign, catalog);
    const totalCost = MathService.calculateTeamCost(currentTeam, campaign, catalog);
    const isValid = validationErrors.length === 0;

    const handleStartMatch = () => {
        // Build objective IDs: selected + leader card if carrying
        let objectiveIds: string[] | undefined;
        let carryingLeaderPenalty: boolean | undefined;
        if (draft.objectivesEnabled && draft.selectedObjectiveIds && draft.selectedObjectiveIds.length > 0) {
            objectiveIds = [...draft.selectedObjectiveIds];
            if (draft.carryingLeaderPenalty) {
                // Find the leader card for this faction and prepend it
                const leaderCard = catalog.objectives.find(
                    (o) => o.factionId === campaign.factionId && (
                        o.id.includes('wounded-leader') || o.name.toLowerCase().includes('wounded leader')
                    )
                );
                if (leaderCard) objectiveIds.unshift(leaderCard.id);
                carryingLeaderPenalty = true;
            }
        }

        const matchTeam: MatchTeam = {
            id: uuidv4(),
            campaignId: campaign.id,
            targetEB,
            selectedRecruitIds: selectedIds,
            equipmentMap: equipmentMap,
            objectiveIds,
            carryingLeaderPenalty,
        };
        setActiveMatchTeam(matchTeam);
        clearTeamBuilderDraft(campaign.id);
        router.push('/play');
    };

    return {
        targetEB,
        setTargetEB,
        totalCost,
        isValid,
        validationErrors,
        selectedIds,
        equipmentMap,
        draft,
        setDraftPatch,
        toggleSelection,
        assignEquip,
        removeEquip,
        moveEquip,
        reorderEquip,
        reorderSquad,
        setSquadOrder,
        handleStartMatch,
    };
}
