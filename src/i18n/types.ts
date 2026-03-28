export type Locale = 'en' | 'fr';

export type Translations = {
    // ── Navigation ──
    'nav.hq': string;
    'nav.teamBuilder': string;
    'nav.play': string;
    'nav.database': string;
    'nav.settings': string;

    // ── Settings ──
    'settings.title': string;
    'settings.cardsPerRow': string;
    'settings.cardScale': string;
    'settings.language': string;
    'settings.tierSurcharges': string;
    'settings.veteran': string;
    'settings.elite': string;

    // ── Types / Lineage Types ──
    'types.leader': string;
    'types.character': string;
    'types.gonk': string;
    'types.specialist': string;
    'types.drone': string;

    // ── Validation ──
    'validation.missingLeader': string;
    'validation.onlyOneLeader': string;
    'validation.tooManyGonks': string;
    'validation.budgetExceeded': string;
    'validation.itemRequiresStreetCred': string;
    'validation.itemExceedsRarity': string;
    'validation.tooManyBulky': string;
    'validation.cannotEquipCybergear': string;
    'validation.cannotEquipPrograms': string;
    'validation.tooManyPrograms': string;
    'validation.wrongFaction': string;

    // ── Database tabs ──
    'database.factions': string;
    'database.models': string;
    'database.armory': string;
    'database.weapons': string;
    'database.gear': string;
    'database.actions': string;
    'database.programs': string;
    'database.objectives': string;
    'database.loots': string;
    'database.items': string;
    'database.gangMembers': string;
    'database.noFactions': string;
    'database.editFaction': string;
    'database.newFaction': string;
    'database.name': string;
    'database.description': string;
    'database.search': string;
    'database.clickToUpload': string;
    'database.replace': string;
    'database.processing': string;
    'database.save': string;
    'database.cancel': string;
    'database.delete': string;
    'database.add': string;
    // ── Database CRUD dialogs ──
    'database.editWeapon': string;
    'database.newWeapon': string;
    'database.editProgram': string;
    'database.newProgram': string;
    'database.editAction': string;
    'database.newAction': string;
    'database.editObjective': string;
    'database.newObjective': string;
    'database.editLoot': string;
    'database.newLoot': string;
    'database.editCharacter': string;
    'database.saveChanges': string;
    'database.createAction': string;
    'database.createProgram': string;
    'database.createLoot': string;
    'database.createObjective': string;
    'database.createAndLink': string;
    'database.updateAction': string;
    // ── Database empty states ──
    'database.noUnitsFound': string;
    'database.noResultsFound': string;
    'database.databaseQueryEmpty': string;
    'database.noActionsFound': string;
    'database.noLootsFound': string;
    'database.noObjectivesFound': string;
    'database.noItemsFound': string;
    // ── Database misc labels ──
    'database.allFactions': string;
    'database.allItems': string;
    'database.factionVariants': string;
    'database.lineage': string;
    'database.profile': string;
    'database.backToPrograms': string;
    'database.usedBy': string;
    'database.versions': string;
    'database.addVeteran': string;
    'database.addElite': string;
    'database.createTierVersion': string;
    'database.flipVertical': string;

    // ── HQ / Campaign ──
    'hq.title': string;
    'hq.newCampaign': string;
    'hq.campaignName': string;
    'hq.selectFaction': string;
    'hq.startingBudget': string;
    'hq.roster': string;
    'hq.recruit': string;
    'hq.dismiss': string;
    'hq.equipment': string;
    'hq.stash': string;
    'hq.ebBank': string;
    'hq.streetCred': string;
    'hq.influence': string;
    'hq.noRecruits': string;
    'hq.confirmDismiss': string;
    'hq.funds': string;
    'hq.selectCampaign': string;
    'hq.startNewCampaign': string;
    'hq.startCampaign': string;
    'hq.yourRoster': string;
    'hq.availableMercs': string;
    'hq.mercenaries': string;
    'hq.rosterEmpty': string;
    'hq.dragMercHere': string;
    'hq.recruited': string;
    'hq.yourWeapons': string;
    'hq.yourEquipment': string;
    'hq.yourPrograms': string;
    'hq.availableWeapons': string;
    'hq.availableEquipment': string;
    'hq.availablePrograms': string;
    'hq.armoryEmpty': string;
    'hq.lockerEmpty': string;
    'hq.vaultEmpty': string;
    'hq.dragWeaponHere': string;
    'hq.dragEquipmentHere': string;
    'hq.dragProgramHere': string;
    'hq.dragToArmory': string;
    'hq.dragToLocker': string;
    'hq.dragToVault': string;
    'hq.dragToRoster': string;
    'hq.noWeaponsFound': string;
    'hq.noEquipmentFound': string;
    'hq.noProgramsFound': string;
    'hq.noRecords': string;
    'hq.completeMatchJournal': string;
    'hq.matches': string;
    'hq.faction': string;
    'hq.netrunningPrograms': string;
    'hq.objectives': string;
    'hq.objectivesComingSoon': string;

    // ── Team Builder ──
    'team.title': string;
    'team.budget': string;
    'team.selectMembers': string;
    'team.equipItem': string;
    'team.ready': string;
    'team.errors': string;
    'team.matchBudget': string;
    'team.deploy': string;
    'team.warnings': string;
    'team.squad': string;
    'team.deployed': string;
    'team.availableRoster': string;
    'team.available': string;
    'team.weaponsAndGear': string;
    'team.programs': string;
    'team.dropToEquip': string;
    'team.dropEquipmentHere': string;
    'team.allGearEquipped': string;
    'team.allProgramsEquipped': string;
    'team.noWeaponsInStash': string;
    'team.noProgramsInStash': string;
    'team.noAssetsAvailable': string;
    'team.allDeployed': string;
    'team.recruitMore': string;
    'team.goToHqRoster': string;
    'team.removeFromSquad': string;
    'team.addToSquad': string;
    'team.equipTo': string;
    'team.addCharactersFirst': string;
    'team.selectCharsFromRoster': string;
    'team.unequip': string;

    // ── Play / Match ──
    'play.startMatch': string;
    'play.endMatch': string;
    'play.activateModel': string;
    'play.wound': string;
    'play.kia': string;
    'play.heal': string;
    'play.done': string;
    'play.noActiveMatch': string;
    'play.goToBuildTeam': string;
    'play.buildTeam': string;
    'play.activeMatch': string;
    'play.loot': string;
    'play.luck': string;
    'play.inspire': string;
    'play.views': string;
    'play.charactersView': string;
    'play.horizontal': string;
    'play.vertical': string;
    'play.programsView': string;
    'play.card': string;
    'play.list': string;
    'play.weaponsGearView': string;
    'play.showKia': string;
    'play.hideKia': string;
    'play.glitchFxOn': string;
    'play.glitchFxOff': string;
    'play.codeFxOn': string;
    'play.codeFxOff': string;
    'play.killedInAction': string;
    'play.redLined': string;
    'play.kill': string;
    'play.revive': string;
    'play.lootDrawn': string;
    'play.assignTo': string;
    'play.selectCharacter': string;
    'play.discard': string;
    'play.assign': string;
    'play.objectives': string;
    'play.completedCount': string;
    'play.tapToComplete': string;
    'play.tapToUndo': string;

    // ── Post-Game Dialog ──
    'postGame.step1': string;
    'postGame.matchOutcome': string;
    'postGame.victory': string;
    'postGame.defeat': string;
    'postGame.step2': string;
    'postGame.promotionReward': string;
    'postGame.promotionDesc': string;
    'postGame.promoteCharacter': string;
    'postGame.noEligible': string;
    'postGame.recruitMerc': string;
    'postGame.noMercs': string;
    'postGame.free': string;
    'postGame.decline': string;
    'postGame.casualtyRolls': string;
    'postGame.casualtyDesc': string;
    'postGame.safe': string;
    'postGame.majorInjury': string;
    'postGame.wounded': string;
    'postGame.postGameReport': string;
    'postGame.checkSupply': string;
    'postGame.returnToHQ': string;

    // ── Merc ──
    'merc.merc': string;

    // ── Tiers ──
    'tiers.base': string;
    'tiers.veteran': string;
    'tiers.elite': string;

    // ── Common ──
    'common.confirm': string;
    'common.cancel': string;
    'common.save': string;
    'common.edit': string;
    'common.delete': string;
    'common.close': string;
    'common.loading': string;
    'common.error': string;
    'common.empty': string;
    'common.yes': string;
    'common.no': string;
};
