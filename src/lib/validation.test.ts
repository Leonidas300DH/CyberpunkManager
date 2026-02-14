import { v4 as uuidv4 } from 'uuid';
import { ValidationService } from './validation';
import { MathService } from './math';
import { Campaign, MatchTeam, StoreState, Faction, ModelLineage, ModelProfile } from '@/types';

// Mock Data
const mockFaction: Faction = { id: 'fac-1', name: 'Mock Gang' };
const mockLeaderLineage: ModelLineage = { id: 'lin-lead', name: 'Leader', factionId: 'fac-1', type: 'Leader', isMerc: false };
const mockGonkLineage: ModelLineage = { id: 'lin-gonk', name: 'Gonk', factionId: 'fac-1', type: 'Gonk', isMerc: false };

const mockLeaderProfile: ModelProfile = {
    id: 'prof-lead', lineageId: 'lin-lead', level: 0, costEB: 30,
    actionTokens: { green: 1, yellow: 1, red: 0 },
    skills: { Reflexes: 0, Ranged: 0, Melee: 0, Medical: 0, Tech: 0, Influence: 3, None: 0 },
    armor: 0, keywords: [], actions: [], passiveRules: ''
};

const mockGonkProfile: ModelProfile = {
    id: 'prof-gonk', lineageId: 'lin-gonk', level: 0, costEB: 10,
    actionTokens: { green: 1, yellow: 0, red: 0 },
    skills: { Reflexes: 0, Ranged: 0, Melee: 0, Medical: 0, Tech: 0, Influence: 0, None: 0 },
    armor: 0, keywords: [], actions: [], passiveRules: ''
};

const mockStore: StoreState['catalog'] = {
    factions: [mockFaction],
    lineages: [mockLeaderLineage, mockGonkLineage],
    profiles: [mockLeaderProfile, mockGonkProfile],
    items: []
};

// Test Helpers
const runTest = (name: string, setup: () => { campaign: Campaign, team: MatchTeam }, expectedErrors: string[]) => {
    console.log(`\nRUNNING: ${name}`);
    const { campaign, team } = setup();
    const errors = ValidationService.validateRoster(campaign, team, mockStore);

    const missing = expectedErrors.filter(e => !errors.some(err => err.includes(e)));
    const unexpected = errors.filter(e => !expectedErrors.some(exp => e.includes(exp)));

    if (missing.length === 0 && unexpected.length === 0) {
        console.log('✅ PASS');
    } else {
        console.error('❌ FAIL');
        if (missing.length > 0) console.error('   Missing expected errors:', missing);
        if (unexpected.length > 0) console.error('   Unexpected errors:', unexpected);
        console.log('   Actual errors:', errors);
    }
};

// SCENARIOS
// 1. Valid Team
runTest('Valid Team (1 Leader, 2 Gonks, Within Budget)', () => {
    const leaderRecruit = { id: 'rec-1', lineageId: 'lin-lead', currentProfileId: 'prof-lead', equippedItemIds: [], hasMajorInjury: false, quantity: 1 };
    const gonkRecruit = { id: 'rec-2', lineageId: 'lin-gonk', currentProfileId: 'prof-gonk', equippedItemIds: [], hasMajorInjury: false, quantity: 2 }; // Influence 3, Gonks 2 = OK

    const campaign: Campaign = {
        id: 'camp-1', name: 'Test Campaign', factionId: 'fac-1', ebBank: 100,
        hqRoster: [leaderRecruit, gonkRecruit], hqStash: [], completedObjectives: []
    };

    const team: MatchTeam = {
        id: 'team-1', campaignId: 'camp-1', targetEB: 100,
        selectedRecruitIds: ['rec-1', 'rec-2'] // Cost: 30 + 10 = 40 (wait, Gonks quantity 2? Spec says base cost used?) 
        // Spec 3.1: SUM(ModelProfile.costEB * quantity). So 30 + (10*2) = 50. OK.
    };

    return { campaign, team };
}, []);

// 2. Missing Leader
runTest('Missing Leader', () => {
    const gonkRecruit = { id: 'rec-2', lineageId: 'lin-gonk', currentProfileId: 'prof-gonk', equippedItemIds: [], hasMajorInjury: false, quantity: 1 };
    const campaign: Campaign = {
        id: 'camp-1', name: 'Test Campaign', factionId: 'fac-1', ebBank: 100,
        hqRoster: [gonkRecruit], hqStash: [], completedObjectives: []
    };
    const team: MatchTeam = { id: 'team-1', campaignId: 'camp-1', targetEB: 100, selectedRecruitIds: ['rec-2'] };
    return { campaign, team };
}, ['Missing Leader!', 'Too many Gonks!']);

// 3. Too many Gonks
runTest('Too many Gonks (Influence 3, Gonks 4)', () => {
    const leaderRecruit = { id: 'rec-1', lineageId: 'lin-lead', currentProfileId: 'prof-lead', equippedItemIds: [], hasMajorInjury: false, quantity: 1 }; // Inf 3
    const gonkRecruit = { id: 'rec-2', lineageId: 'lin-gonk', currentProfileId: 'prof-gonk', equippedItemIds: [], hasMajorInjury: false, quantity: 4 }; // Qty 4

    const campaign: Campaign = {
        id: 'camp-1', name: 'Test Campaign', factionId: 'fac-1', ebBank: 100,
        hqRoster: [leaderRecruit, gonkRecruit], hqStash: [], completedObjectives: []
    };
    const team: MatchTeam = { id: 'team-1', campaignId: 'camp-1', targetEB: 100, selectedRecruitIds: ['rec-1', 'rec-2'] };
    return { campaign, team };
}, ['Too many Gonks!']);

// 4. Budget Exceeded
runTest('Budget Exceeded', () => {
    const leaderRecruit = { id: 'rec-1', lineageId: 'lin-lead', currentProfileId: 'prof-lead', equippedItemIds: [], hasMajorInjury: false, quantity: 1 }; // Cost 30
    const gonkRecruit = { id: 'rec-2', lineageId: 'lin-gonk', currentProfileId: 'prof-gonk', equippedItemIds: [], hasMajorInjury: false, quantity: 8 }; // Cost 80 -> Total 110

    const campaign: Campaign = {
        id: 'camp-1', name: 'Test Campaign', factionId: 'fac-1', ebBank: 200,
        hqRoster: [leaderRecruit, gonkRecruit], hqStash: [], completedObjectives: []
    };
    const team: MatchTeam = { id: 'team-1', campaignId: 'camp-1', targetEB: 100, selectedRecruitIds: ['rec-1', 'rec-2'] };
    return { campaign, team };
}, ['Budget exceeded!', 'Too many Gonks!']);
