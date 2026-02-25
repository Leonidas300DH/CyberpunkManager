import { CatalogData, ModelLineage, ModelProfile, RecruitedModel } from '@/types';

export const DEFAULT_TIER_SURCHARGES = { veteran: 5, elite: 10 };

export function getTierSurcharges(catalog: CatalogData): { veteran: number; elite: number } {
    return catalog.tierSurcharges ?? DEFAULT_TIER_SURCHARGES;
}

export function getSurchargeForLevel(level: number, catalog: CatalogData): number {
    if (level <= 0) return 0;
    const surcharges = getTierSurcharges(catalog);
    if (level === 1) return surcharges.veteran;
    return surcharges.elite;
}

export function getBaseProfile(lineageId: string, catalog: CatalogData): ModelProfile | undefined {
    return catalog.profiles.find(p => p.lineageId === lineageId && p.level === 0);
}

export function canHaveTiers(lineage: ModelLineage): boolean {
    return lineage.type !== 'Gonk';
}

export function getRecruitBudgetCost(recruit: RecruitedModel, catalog: CatalogData): number {
    const profile = catalog.profiles.find(p => p.lineageId === recruit.lineageId && p.level === 0);
    const baseCost = profile?.costEB ?? 0;
    const purchasedLevel = recruit.purchasedLevel ?? 0;
    return (baseCost + getSurchargeForLevel(purchasedLevel, catalog)) * (recruit.quantity || 1);
}

export function getTierLabel(level: number): string {
    if (level === 1) return 'Veteran';
    if (level === 2) return 'Elite';
    return 'Base';
}
