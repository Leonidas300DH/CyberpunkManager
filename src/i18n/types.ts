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

    // ── Team Builder ──
    'team.title': string;
    'team.budget': string;
    'team.selectMembers': string;
    'team.equipItem': string;
    'team.ready': string;
    'team.errors': string;

    // ── Play / Match ──
    'play.startMatch': string;
    'play.endMatch': string;
    'play.activateModel': string;
    'play.wound': string;
    'play.kia': string;
    'play.heal': string;
    'play.done': string;

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
