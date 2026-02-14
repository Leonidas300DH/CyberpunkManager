import { v4 as uuidv4 } from 'uuid';
import { Faction, ModelLineage, ModelProfile, ItemCard, GameAction } from '@/types';
import { useStore } from '@/store/useStore';

export const seedData = () => {
    // 1. Faction
    const tygerClawsId = uuidv4();
    const tygerClaws: Faction = {
        id: tygerClawsId,
        name: 'Tyger Claws',
        imageUrl: '/images/tyger_claws.png',
    };

    // 2. Lineages & Profiles
    // Leader: Oyabun
    const oyabunId = uuidv4();
    const oyabunLineage: ModelLineage = {
        id: oyabunId,
        name: 'Oyabun',
        factionId: tygerClawsId,
        type: 'Leader',
        isMerc: false,
        imageUrl: '/images/oyabun.png'
    };

    const actionKatana: GameAction = {
        id: uuidv4(),
        name: 'Mono-Katana',
        skillReq: 'Melee',
        range: 'Red',
        isAttack: true,
        keywords: ['Deadly', 'Armor Piercing'],
        effectDescription: 'Deal critical damage on Yellow result.'
    };

    const oyabunProfileBase: ModelProfile = {
        id: uuidv4(),
        lineageId: oyabunId,
        level: 0,
        costEB: 35,
        actionTokens: { green: 1, yellow: 1, red: 0 },
        skills: { Reflexes: 1, Ranged: 0, Melee: 2, Medical: 0, Tech: 0, Influence: 3, None: 0 },
        armor: 1,
        keywords: ['Honor Bound'],
        actions: [actionKatana],
        passiveRules: 'May reroll one Melee die per turn.'
    };

    const oyabunProfileVet: ModelProfile = {
        ...oyabunProfileBase,
        id: uuidv4(),
        level: 1,
        actionTokens: { green: 1, yellow: 1, red: 1 },
        skills: { ...oyabunProfileBase.skills, Melee: 3 },
    };

    // Gonk: Tyger Claw Biker
    const bikerId = uuidv4();
    const bikerLineage: ModelLineage = {
        id: bikerId,
        name: 'Tyger Claw Biker',
        factionId: tygerClawsId,
        type: 'Gonk',
        isMerc: false,
        imageUrl: '/images/biker.png'
    };

    const actionPistol: GameAction = {
        id: uuidv4(),
        name: 'Heavy Pistol',
        skillReq: 'Ranged',
        range: 'Yellow',
        isAttack: true,
        keywords: [],
        effectDescription: 'Standard range attack.'
    };

    const bikerProfile: ModelProfile = {
        id: uuidv4(),
        lineageId: bikerId,
        level: 0,
        costEB: 12,
        actionTokens: { green: 1, yellow: 0, red: 0 },
        gonkActionColor: 'Green',
        skills: { Reflexes: 1, Ranged: 1, Melee: 1, Medical: 0, Tech: 0, Influence: 0, None: 0 },
        armor: 0,
        keywords: [],
        actions: [actionPistol],
        passiveRules: ''
    };

    // Drone: Surveillance Drone
    const droneId = uuidv4();
    const droneLineage: ModelLineage = {
        id: droneId,
        name: 'Surveillance Drone',
        factionId: tygerClawsId, // Generic or Faction specific
        type: 'Drone',
        isMerc: false,
        imageUrl: '/images/drone.png'
    };

    const droneProfile: ModelProfile = {
        id: uuidv4(),
        lineageId: droneId,
        level: 0,
        costEB: 0, // Costs nothing, summoned by program
        actionTokens: { green: 0, yellow: 1, red: 0 }, // Drones usually have specific movement
        skills: { Reflexes: 2, Ranged: 0, Melee: 0, Medical: 0, Tech: 0, Influence: 0, None: 0 },
        armor: 0,
        keywords: ['Flying', 'Small'],
        actions: [],
        passiveRules: 'Can be activated by a Netrunner.'
    };

    // Items
    // Gear: Cyberarm
    const gearCyberarm: ItemCard = {
        id: uuidv4(),
        name: 'Cyberarm with Popup Shield',
        category: 'Gear',
        costEB: 15,
        reqStreetCred: 2,
        rarity: 2,
        keywords: ['Cybergear'],
        grantedActions: [],
        passiveRules: 'Grants +1 Armor when attacked from the front.',
        imageUrl: '/images/cyberarm.png'
    };

    // Program: Summon Drone
    const progSummon: ItemCard = {
        id: uuidv4(),
        name: 'Drone Controller v1.0',
        category: 'Program',
        costEB: 20,
        reqStreetCred: 5,
        rarity: 1,
        keywords: [],
        grantedActions: [{
            id: uuidv4(),
            name: 'Activate Drone',
            skillReq: 'Tech',
            range: 'Long',
            isAttack: false,
            keywords: ['Complex'],
            effectDescription: 'Activate a friendly Drone within range.'
        }],
        passiveRules: 'Allows deployment of one Surveillance Drone.',
        summonsDroneLineageId: droneId,
        imageUrl: '/images/program.png'
    };

    // Populate Store only if empty or forced
    const state = useStore.getState();
    if (state.catalog.factions.length === 0) {
        state.setCatalog({
            factions: [tygerClaws],
            lineages: [oyabunLineage, bikerLineage, droneLineage],
            profiles: [oyabunProfileBase, oyabunProfileVet, bikerProfile, droneProfile],
            items: [gearCyberarm, progSummon]
        });
        console.log('Seed data populated successfully');
    } else {
        console.log('Catalog already populated');
    }
};
