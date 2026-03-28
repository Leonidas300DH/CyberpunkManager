# i18n (EN/FR) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add bilingual EN/FR support to the Combat Zone Companion with a lightweight custom i18n system, Supabase `_fr` columns for catalog data, and a language toggle in Display Settings.

**Architecture:** Custom TypeScript i18n with two hooks: `useT()` for static UI strings (typed keys) and `useLocalized()` for dynamic catalog fields. Locale stored in Zustand `DisplaySettings`, persisted in localStorage. Supabase gets `_fr` columns on translatable tables; `useCatalog` mappers pass them through. Translation is progressive: untranslated content falls back to English.

**Tech Stack:** TypeScript, Zustand, React, Supabase (SQL migration), Next.js 16 App Router

**Spec:** `docs/superpowers/specs/2026-03-28-i18n-design.md`

---

## File Structure

```
src/i18n/
  types.ts         → Translations type (all UI string keys)
  en.ts            → English translations
  fr.ts            → French translations
  index.ts         → useT() and useLocalized() hooks

Modified:
  src/store/useStore.ts           → add locale to DisplaySettings
  src/types/index.ts              → add _fr optional fields
  src/hooks/useCatalog.ts         → map _fr columns
  src/lib/glossary.ts             → add definition_fr to entries
  src/lib/validation.ts           → use t() for error messages
  src/components/ui/DisplaySettings.tsx  → language toggle
  src/components/layout/BottomNav.tsx    → translated tab labels
  src/components/database/FactionsTab.tsx
  src/components/play/PostGameDialog.tsx
  src/components/play/ActiveMatchView.tsx
  src/components/database/ArmoryContent.tsx
  src/components/database/ActionsContent.tsx
  src/components/campaign/RosterList.tsx
  src/components/match/TeamBuilder.tsx
  + all other components with hardcoded UI strings
```

---

## Task 1: Create i18n type system and English translation file

**Files:**
- Create: `src/i18n/types.ts`
- Create: `src/i18n/en.ts`

- [ ] **Step 1: Create the Translations type**

Create `src/i18n/types.ts`:

```ts
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
```

- [ ] **Step 2: Create the English translation file**

Create `src/i18n/en.ts`:

```ts
import type { Translations } from './types';

export const en: Translations = {
    // ── Navigation ──
    'nav.hq': 'HQ',
    'nav.teamBuilder': 'Team Builder',
    'nav.play': 'Play',
    'nav.database': 'Database',
    'nav.settings': 'Settings',

    // ── Settings ──
    'settings.title': 'Display settings',
    'settings.cardsPerRow': 'Cards per row',
    'settings.cardScale': 'Card scale',
    'settings.language': 'Language',
    'settings.tierSurcharges': 'Tier Surcharges',
    'settings.veteran': 'Veteran',
    'settings.elite': 'Elite',

    // ── Types ──
    'types.leader': 'Leaders',
    'types.character': 'Characters',
    'types.gonk': 'Gonks',
    'types.specialist': 'Specialists',
    'types.drone': 'Drones',

    // ── Validation ──
    'validation.missingLeader': 'Missing Leader!',
    'validation.onlyOneLeader': 'Only one Leader allowed!',
    'validation.tooManyGonks': 'Too many Gonks! ({count}/{max})',
    'validation.budgetExceeded': 'Budget exceeded! ({cost}/{budget} EB)',
    'validation.itemRequiresStreetCred': "Item '{name}' requires Street Cred {required} (Have: {have})",
    'validation.itemExceedsRarity': "Item '{name}' exceeds rarity limit ({count}/{max})",
    'validation.tooManyBulky': '{name} has too many Bulky items ({count})',
    'validation.cannotEquipCybergear': "{name} cannot equip Cybergear '{item}'",
    'validation.cannotEquipPrograms': '{name} cannot equip Programs (needs Netrunner keyword or a Net Deck)',
    'validation.tooManyPrograms': '{name} has too many Programs ({count}/{max})',
    'validation.wrongFaction': '{name} belongs to wrong Faction!',

    // ── Database tabs ──
    'database.factions': 'Factions',
    'database.models': 'Models',
    'database.armory': 'Armory',
    'database.weapons': 'Weapons',
    'database.gear': 'Gear',
    'database.actions': 'Actions',
    'database.programs': 'Programs',
    'database.objectives': 'Objectives',
    'database.loots': 'Loots',
    'database.items': 'Items',
    'database.gangMembers': 'Gang Members',
    'database.noFactions': 'No factions found.',
    'database.editFaction': 'Edit Faction',
    'database.newFaction': 'New Faction',
    'database.name': 'Name',
    'database.description': 'Description',
    'database.search': 'Search...',
    'database.clickToUpload': 'Click to upload',
    'database.replace': 'Replace',
    'database.processing': 'Processing...',
    'database.save': 'Save',
    'database.cancel': 'Cancel',
    'database.delete': 'Delete',
    'database.add': 'Add',

    // ── HQ / Campaign ──
    'hq.title': 'Headquarters',
    'hq.newCampaign': 'New Campaign',
    'hq.campaignName': 'Campaign Name',
    'hq.selectFaction': 'Select Faction',
    'hq.startingBudget': 'Starting Budget',
    'hq.roster': 'Roster',
    'hq.recruit': 'Recruit',
    'hq.dismiss': 'Dismiss',
    'hq.equipment': 'Equipment',
    'hq.stash': 'Stash',
    'hq.ebBank': 'EB Bank',
    'hq.streetCred': 'Street Cred',
    'hq.influence': 'Influence',
    'hq.noRecruits': 'No recruits yet.',
    'hq.confirmDismiss': 'Dismiss this recruit?',

    // ── Team Builder ──
    'team.title': 'Team Builder',
    'team.budget': 'Budget',
    'team.selectMembers': 'Select Members',
    'team.equipItem': 'Equip Item',
    'team.ready': 'Ready!',
    'team.errors': 'Errors',

    // ── Play / Match ──
    'play.startMatch': 'Start Match',
    'play.endMatch': 'End Match',
    'play.activateModel': 'Activate',
    'play.wound': 'Wound',
    'play.kia': 'KIA',
    'play.heal': 'Heal',
    'play.done': 'Done',

    // ── Post-Game Dialog ──
    'postGame.step1': 'Step 1',
    'postGame.matchOutcome': 'Match Outcome',
    'postGame.victory': 'Victory',
    'postGame.defeat': 'Defeat',
    'postGame.step2': 'Step 2',
    'postGame.promotionReward': 'Promotion Reward',
    'postGame.promotionDesc': 'Victory grants one free promotion. Choose one:',
    'postGame.promoteCharacter': 'Promote a character',
    'postGame.noEligible': 'No eligible characters',
    'postGame.recruitMerc': 'Recruit a Merc',
    'postGame.noMercs': 'No Mercs available',
    'postGame.free': 'free',
    'postGame.decline': 'Decline',
    'postGame.casualtyRolls': 'Casualty Rolls',
    'postGame.casualtyDesc': 'Roll a die for each wounded/KIA character:',
    'postGame.safe': 'Safe',
    'postGame.majorInjury': 'Major Injury',
    'postGame.wounded': 'Wounded',
    'postGame.postGameReport': 'Post-Game Report',
    'postGame.checkSupply': 'Check Supply — new gear may be available at this Street Cred level.',
    'postGame.returnToHQ': 'Return to HQ',

    // ── Merc ──
    'merc.merc': 'Merc',

    // ── Tiers ──
    'tiers.base': 'Base',
    'tiers.veteran': 'Veteran',
    'tiers.elite': 'Elite',

    // ── Common ──
    'common.confirm': 'Confirm',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.close': 'Close',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.empty': 'Nothing here yet.',
    'common.yes': 'Yes',
    'common.no': 'No',
};
```

- [ ] **Step 3: Verify types compile**

Run: `cd combat-zone-companion && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to i18n files (they are not yet imported)

- [ ] **Step 4: Commit**

```bash
git add src/i18n/types.ts src/i18n/en.ts
git commit -m "feat(i18n): add Translations type and English translation file"
```

---

## Task 2: Create French translation file

**Files:**
- Create: `src/i18n/fr.ts`

- [ ] **Step 1: Create the French translation file**

Create `src/i18n/fr.ts`:

```ts
import type { Translations } from './types';

export const fr: Translations = {
    // ── Navigation ──
    'nav.hq': 'QG',
    'nav.teamBuilder': 'Composition',
    'nav.play': 'Partie',
    'nav.database': 'Base de Données',
    'nav.settings': 'Réglages',

    // ── Settings ──
    'settings.title': 'Réglages d\'affichage',
    'settings.cardsPerRow': 'Cartes par ligne',
    'settings.cardScale': 'Taille des cartes',
    'settings.language': 'Langue',
    'settings.tierSurcharges': 'Surcoûts de Rang',
    'settings.veteran': 'Vétéran',
    'settings.elite': 'Élite',

    // ── Types ──
    'types.leader': 'Leaders',
    'types.character': 'Personnages',
    'types.gonk': 'Gonks',
    'types.specialist': 'Spécialistes',
    'types.drone': 'Drones',

    // ── Validation ──
    'validation.missingLeader': 'Leader manquant !',
    'validation.onlyOneLeader': 'Un seul Leader autorisé !',
    'validation.tooManyGonks': 'Trop de Gonks ! ({count}/{max})',
    'validation.budgetExceeded': 'Budget dépassé ! ({cost}/{budget} EB)',
    'validation.itemRequiresStreetCred': "L'objet « {name} » nécessite Street Cred {required} (Actuel : {have})",
    'validation.itemExceedsRarity': "L'objet « {name} » dépasse la limite de rareté ({count}/{max})",
    'validation.tooManyBulky': '{name} a trop d\'objets Encombrants ({count})',
    'validation.cannotEquipCybergear': "{name} ne peut pas équiper le Cybergear « {item} »",
    'validation.cannotEquipPrograms': '{name} ne peut pas équiper de Programmes (nécessite Netrunner ou un Net Deck)',
    'validation.tooManyPrograms': '{name} a trop de Programmes ({count}/{max})',
    'validation.wrongFaction': '{name} appartient à la mauvaise Faction !',

    // ── Database tabs ──
    'database.factions': 'Factions',
    'database.models': 'Modèles',
    'database.armory': 'Armurerie',
    'database.weapons': 'Armes',
    'database.gear': 'Équipement',
    'database.actions': 'Actions',
    'database.programs': 'Programmes',
    'database.objectives': 'Objectifs',
    'database.loots': 'Butins',
    'database.items': 'Objets',
    'database.gangMembers': 'Membres du Gang',
    'database.noFactions': 'Aucune faction trouvée.',
    'database.editFaction': 'Modifier la Faction',
    'database.newFaction': 'Nouvelle Faction',
    'database.name': 'Nom',
    'database.description': 'Description',
    'database.search': 'Rechercher...',
    'database.clickToUpload': 'Cliquer pour importer',
    'database.replace': 'Remplacer',
    'database.processing': 'Traitement...',
    'database.save': 'Enregistrer',
    'database.cancel': 'Annuler',
    'database.delete': 'Supprimer',
    'database.add': 'Ajouter',

    // ── HQ / Campaign ──
    'hq.title': 'Quartier Général',
    'hq.newCampaign': 'Nouvelle Campagne',
    'hq.campaignName': 'Nom de la Campagne',
    'hq.selectFaction': 'Choisir une Faction',
    'hq.startingBudget': 'Budget Initial',
    'hq.roster': 'Effectifs',
    'hq.recruit': 'Recruter',
    'hq.dismiss': 'Renvoyer',
    'hq.equipment': 'Équipement',
    'hq.stash': 'Réserve',
    'hq.ebBank': 'Caisse EB',
    'hq.streetCred': 'Street Cred',
    'hq.influence': 'Influence',
    'hq.noRecruits': 'Aucune recrue pour le moment.',
    'hq.confirmDismiss': 'Renvoyer cette recrue ?',

    // ── Team Builder ──
    'team.title': 'Composition d\'Équipe',
    'team.budget': 'Budget',
    'team.selectMembers': 'Sélectionner les Membres',
    'team.equipItem': 'Équiper un Objet',
    'team.ready': 'Prêt !',
    'team.errors': 'Erreurs',

    // ── Play / Match ──
    'play.startMatch': 'Lancer la Partie',
    'play.endMatch': 'Fin de Partie',
    'play.activateModel': 'Activer',
    'play.wound': 'Blessure',
    'play.kia': 'Hors Combat',
    'play.heal': 'Soigner',
    'play.done': 'Terminé',

    // ── Post-Game Dialog ──
    'postGame.step1': 'Étape 1',
    'postGame.matchOutcome': 'Résultat du Match',
    'postGame.victory': 'Victoire',
    'postGame.defeat': 'Défaite',
    'postGame.step2': 'Étape 2',
    'postGame.promotionReward': 'Récompense de Promotion',
    'postGame.promotionDesc': 'La victoire accorde une promotion gratuite. Choisissez :',
    'postGame.promoteCharacter': 'Promouvoir un personnage',
    'postGame.noEligible': 'Aucun personnage éligible',
    'postGame.recruitMerc': 'Recruter un Merc',
    'postGame.noMercs': 'Aucun Merc disponible',
    'postGame.free': 'gratuit',
    'postGame.decline': 'Décliner',
    'postGame.casualtyRolls': 'Jets de Pertes',
    'postGame.casualtyDesc': 'Lancez un dé pour chaque blessé/hors combat :',
    'postGame.safe': 'Sauf',
    'postGame.majorInjury': 'Blessure Grave',
    'postGame.wounded': 'Blessé',
    'postGame.postGameReport': 'Rapport d\'Après-Match',
    'postGame.checkSupply': 'Vérifiez l\'Approvisionnement — du nouvel équipement est peut-être disponible à ce niveau de Street Cred.',
    'postGame.returnToHQ': 'Retour au QG',

    // ── Merc ──
    'merc.merc': 'Merc',

    // ── Tiers ──
    'tiers.base': 'Base',
    'tiers.veteran': 'Vétéran',
    'tiers.elite': 'Élite',

    // ── Common ──
    'common.confirm': 'Confirmer',
    'common.cancel': 'Annuler',
    'common.save': 'Enregistrer',
    'common.edit': 'Modifier',
    'common.delete': 'Supprimer',
    'common.close': 'Fermer',
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.empty': 'Rien ici pour le moment.',
    'common.yes': 'Oui',
    'common.no': 'Non',
};
```

- [ ] **Step 2: Commit**

```bash
git add src/i18n/fr.ts
git commit -m "feat(i18n): add French translation file"
```

---

## Task 3: Create useT() and useLocalized() hooks

**Files:**
- Create: `src/i18n/index.ts`

**Depends on:** Task 1 (types.ts, en.ts), Task 2 (fr.ts)

- [ ] **Step 1: Create the i18n index with both hooks**

Create `src/i18n/index.ts`:

```ts
import { useStore } from '@/store/useStore';
import { en } from './en';
import { fr } from './fr';
import type { Translations, Locale } from './types';

export type { Locale, Translations };

const translations: Record<Locale, Translations> = { en, fr };

/**
 * Hook for static UI string translation.
 * Returns t(key, vars?) — resolves key from current locale, falls back to 'en'.
 * Interpolates {varName} placeholders from vars object.
 */
export function useT() {
    const locale = useStore(s => s.displaySettings.locale ?? 'en') as Locale;

    return function t(key: keyof Translations, vars?: Record<string, string | number>): string {
        let str = translations[locale]?.[key] ?? translations.en[key] ?? key;
        if (vars) {
            for (const [k, v] of Object.entries(vars)) {
                str = str.replaceAll(`{${k}}`, String(v));
            }
        }
        return str;
    };
}

/**
 * Hook for dynamic catalog field localization.
 * Returns loc(item, field) — resolves item[field_fr] if locale=fr and non-empty, else item[field].
 */
export function useLocalized() {
    const locale = useStore(s => s.displaySettings.locale ?? 'en') as Locale;

    return function loc<T extends Record<string, unknown>>(item: T, field: string): string {
        if (locale !== 'en') {
            const localizedKey = `${field}_${locale}`;
            const localizedValue = item[localizedKey];
            if (typeof localizedValue === 'string' && localizedValue.length > 0) {
                return localizedValue;
            }
        }
        const value = item[field];
        return typeof value === 'string' ? value : '';
    };
}

/**
 * Standalone t() for non-component code (validation.ts, etc.).
 * Reads locale from store directly.
 */
export function getT(locale: Locale) {
    return function t(key: keyof Translations, vars?: Record<string, string | number>): string {
        let str = translations[locale]?.[key] ?? translations.en[key] ?? key;
        if (vars) {
            for (const [k, v] of Object.entries(vars)) {
                str = str.replaceAll(`{${k}}`, String(v));
            }
        }
        return str;
    };
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd combat-zone-companion && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: May warn about `locale` not existing on DisplaySettings yet (Task 4 fixes this). Ignore for now.

- [ ] **Step 3: Commit**

```bash
git add src/i18n/index.ts
git commit -m "feat(i18n): add useT, useLocalized, and getT hooks"
```

---

## Task 4: Add locale to Zustand store

**Files:**
- Modify: `src/store/useStore.ts:7-13` (DisplaySettings interface)
- Modify: `src/store/useStore.ts:60` (default state)

- [ ] **Step 1: Add locale to DisplaySettings interface**

In `src/store/useStore.ts`, add `locale` to the `DisplaySettings` interface (line 7-13):

```ts
interface DisplaySettings {
    cardColumns: number;
    fontScale: number;
    programViewMode?: 'list' | 'card' | 'double';
    gearViewMode?: 'list' | 'card';
    gearStacked?: boolean;
    locale?: 'en' | 'fr';
}
```

Note: `locale` is optional (`?`) for backwards compatibility with existing localStorage data that doesn't have it. The `useT()` hook already handles `?? 'en'` fallback.

- [ ] **Step 2: Verify it compiles**

Run: `cd combat-zone-companion && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: PASS (no errors)

- [ ] **Step 3: Commit**

```bash
git add src/store/useStore.ts
git commit -m "feat(i18n): add locale field to DisplaySettings in store"
```

---

## Task 5: Add language toggle to DisplaySettings component

**Files:**
- Modify: `src/components/ui/DisplaySettings.tsx:136` (after Card scale section)

- [ ] **Step 1: Add import for useT**

At the top of `src/components/ui/DisplaySettings.tsx`, add:

```ts
import { useT } from '@/i18n';
```

- [ ] **Step 2: Add the language toggle section**

After the "Card scale" `</div>` (line 136), before the tier surcharges section (line 138), insert a new language section:

```tsx
                    {/* Language */}
                    <div>
                        <label className="font-mono-tech text-xs text-muted-foreground uppercase tracking-widest block mb-2">
                            {t('settings.language')}
                        </label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setDisplaySettings({ locale: 'en' })}
                                className={cn(
                                    "flex-1 px-3 py-2 border text-xs font-mono-tech uppercase tracking-wider transition-colors",
                                    (displaySettings.locale ?? 'en') === 'en'
                                        ? 'border-secondary bg-secondary text-black'
                                        : 'border-border text-muted-foreground hover:text-white hover:border-secondary'
                                )}
                            >
                                EN
                            </button>
                            <button
                                onClick={() => setDisplaySettings({ locale: 'fr' })}
                                className={cn(
                                    "flex-1 px-3 py-2 border text-xs font-mono-tech uppercase tracking-wider transition-colors",
                                    displaySettings.locale === 'fr'
                                        ? 'border-secondary bg-secondary text-black'
                                        : 'border-border text-muted-foreground hover:text-white hover:border-secondary'
                                )}
                            >
                                FR
                            </button>
                        </div>
                    </div>
```

- [ ] **Step 3: Add t() call in the component**

Inside the `DisplaySettings` function body (after the existing destructuring), add:

```ts
const t = useT();
```

Also translate the existing labels — replace `"Cards per row"` (line 93) with `{t('settings.cardsPerRow')}`, `"Card scale"` (line 117) with `{t('settings.cardScale')}`, `title="Display settings"` (line 71) with `title={t('settings.title')}`, `"Tier Surcharges"` (line 142) with `{t('settings.tierSurcharges')}`, `"Veteran"` (line 146) with `{t('settings.veteran')}`, `"Elite"` (line 156) with `{t('settings.elite')}`, and `"Settings"` (line 77) with `{t('nav.settings')}`.

- [ ] **Step 4: Verify it compiles and renders**

Run: `cd combat-zone-companion && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: PASS

Run: `cd combat-zone-companion && npm run dev` — open app, toggle the language. All DisplaySettings labels should switch.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/DisplaySettings.tsx
git commit -m "feat(i18n): add EN/FR language toggle in DisplaySettings"
```

---

## Task 6: Add _fr fields to TypeScript types

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: Add optional _fr fields to each catalog type**

In `src/types/index.ts`, add the following fields:

**Faction** (after line 11 `description?: string;`):
```ts
    description_fr?: string;
```

**Weapon** (after line 164 `description: string;`):
```ts
    description_fr?: string;
```

**ItemCard** (after line 69 `passiveRules: string;`):
```ts
    passiveRules_fr?: string;
```

**HackingProgram** (after line 94 `flavorText: string;`):
```ts
    flavorText_fr?: string;
```
After line 95 `loadedText: string;`:
```ts
    loadedText_fr?: string;
```
After line 97 `runningEffect: string;`:
```ts
    runningEffect_fr?: string;
```

**Objective** (after line 109 `name: string;`):
```ts
    name_fr?: string;
```
After line 111 `description: string;`:
```ts
    description_fr?: string;
```
After line 113 `rewardText: string;`:
```ts
    rewardText_fr?: string;
```
After line 131 `factionBanner?: string;`):
```ts
    factionBanner_fr?: string;
```

**Loot** (after line 174 `name: string;`):
```ts
    name_fr?: string;
```
After line 175 `flavorText: string;`:
```ts
    flavorText_fr?: string;
```
After line 176 `effectText?: string;`:
```ts
    effectText_fr?: string;
```

- [ ] **Step 2: Add definition_fr to GlossaryEntry**

In `src/lib/glossary.ts`, modify the `GlossaryEntry` interface (lines 8-14):

```ts
export interface GlossaryEntry {
    term: string;
    definition: string;
    definition_fr?: string;
    page?: string;
    /** Whether this term should be detected & linked in card text */
    highlight?: boolean;
}
```

- [ ] **Step 3: Verify it compiles**

Run: `cd combat-zone-companion && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: PASS (all new fields are optional, no breaking changes)

- [ ] **Step 4: Commit**

```bash
git add src/types/index.ts src/lib/glossary.ts
git commit -m "feat(i18n): add _fr optional fields to all catalog types"
```

---

## Task 7: Update useCatalog mappers for _fr columns

**Files:**
- Modify: `src/hooks/useCatalog.ts:22-119` (mapper functions)

- [ ] **Step 1: Update mapFaction** (line 22-29)

Add after `imageUrl` line:

```ts
        description_fr: r.description_fr as string | undefined,
```

- [ ] **Step 2: Update mapWeapon** (line 61-86)

Add after `imageUrl` line:

```ts
        description_fr: r.description_fr as string | undefined,
```

- [ ] **Step 3: Update mapItem** (line 88-99)

Add after `passiveRules` line:

```ts
        passiveRules_fr: (r.passive_rules_fr as string) ?? undefined,
```

- [ ] **Step 4: Update mapProgram** (line 101-119)

Add after `flavorText`:
```ts
        flavorText_fr: (r.flavor_text_fr as string) ?? undefined,
```
After `loadedText`:
```ts
        loadedText_fr: (r.loaded_text_fr as string) ?? undefined,
```
After `runningEffect`:
```ts
        runningEffect_fr: (r.running_effect_fr as string) ?? undefined,
```

- [ ] **Step 5: Update mapObjective and mapLoot**

Read the file to find exact line numbers for `mapObjective` and `mapLoot`, then add corresponding `_fr` fields:

For objectives: `name_fr`, `description_fr`, `rewardText_fr`, `factionBanner_fr`
For loots: `name_fr`, `flavorText_fr`, `effectText_fr`

- [ ] **Step 6: Update reverse mappers (TypeScript → DB rows)**

Search for `toDbRow` or reverse mapper functions in `useCatalog.ts`. Add `_fr` fields to the DB row objects so admin edits can save French translations too. Map them with snake_case: `description_fr` → `description_fr` (same key since it's already snake_case in the column name).

- [ ] **Step 7: Verify it compiles**

Run: `cd combat-zone-companion && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add src/hooks/useCatalog.ts
git commit -m "feat(i18n): map _fr columns in useCatalog mappers"
```

---

## Task 8: Supabase migration — add _fr columns

**Files:**
- No file created — SQL executed directly against Supabase

- [ ] **Step 1: Run SQL migration**

Execute the following SQL against the Supabase project `nknlxlmmliccsfsndnba`:

```sql
-- Factions
ALTER TABLE factions ADD COLUMN IF NOT EXISTS description_fr TEXT;

-- Weapons
ALTER TABLE weapons ADD COLUMN IF NOT EXISTS description_fr TEXT;

-- Items
ALTER TABLE items ADD COLUMN IF NOT EXISTS passive_rules_fr TEXT;

-- Programs
ALTER TABLE programs ADD COLUMN IF NOT EXISTS flavor_text_fr TEXT;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS loaded_text_fr TEXT;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS running_effect_fr TEXT;

-- Objectives
ALTER TABLE objectives ADD COLUMN IF NOT EXISTS name_fr TEXT;
ALTER TABLE objectives ADD COLUMN IF NOT EXISTS description_fr TEXT;
ALTER TABLE objectives ADD COLUMN IF NOT EXISTS reward_text_fr TEXT;
ALTER TABLE objectives ADD COLUMN IF NOT EXISTS faction_banner_fr TEXT;

-- Loots
ALTER TABLE loots ADD COLUMN IF NOT EXISTS name_fr TEXT;
ALTER TABLE loots ADD COLUMN IF NOT EXISTS flavor_text_fr TEXT;
ALTER TABLE loots ADD COLUMN IF NOT EXISTS effect_text_fr TEXT;
```

- [ ] **Step 2: Verify columns exist**

Run: `SELECT column_name FROM information_schema.columns WHERE table_name = 'weapons' AND column_name LIKE '%_fr';`
Expected: `description_fr`

- [ ] **Step 3: Regenerate seed.ts (if using dump/gen scripts)**

Run the seed generation script so `seed.ts` includes the new `_fr` fields (all `null`/empty initially).

---

## Task 9: Translate validation.ts with getT()

**Files:**
- Modify: `src/lib/validation.ts`

- [ ] **Step 1: Import getT and update function signature**

At the top of `src/lib/validation.ts`, add:

```ts
import { getT } from '@/i18n';
import type { Locale } from '@/i18n';
```

Change the `validateRoster` signature to accept locale:

```ts
validateRoster: (team: MatchTeam, campaign: Campaign, store: CatalogData, locale: Locale = 'en'): string[] => {
```

Add at the start of the function body:

```ts
        const t = getT(locale);
```

- [ ] **Step 2: Replace all hardcoded error strings**

Replace each `errors.push(...)` call:

Line 20: `errors.push('Missing Leader!')` →
```ts
errors.push(t('validation.missingLeader'));
```

Line 21: `errors.push('Only one Leader allowed!')` →
```ts
errors.push(t('validation.onlyOneLeader'));
```

Line 31: →
```ts
errors.push(t('validation.tooManyGonks', { count: gonkQuantity, max: totalInfluence }));
```

Line 37: →
```ts
errors.push(t('validation.budgetExceeded', { cost: totalCost, budget: team.targetEB }));
```

Line 50: →
```ts
errors.push(t('validation.itemRequiresStreetCred', { name: item.name, required: variant.reqStreetCred, have: campaignStreetCred }));
```

Line 69: →
```ts
errors.push(t('validation.itemExceedsRarity', { name: item.name, count, max: variant.rarity }));
```

Line 89: →
```ts
errors.push(t('validation.tooManyBulky', { name: lineage.name, count: bulkyCount }));
```

Line 96: →
```ts
errors.push(t('validation.cannotEquipCybergear', { name: lineage.name, item: i.name }));
```

Line 118: →
```ts
errors.push(t('validation.cannotEquipPrograms', { name: lineage.name }));
```

Line 121: →
```ts
errors.push(t('validation.tooManyPrograms', { name: lineage.name, count: totalProgramCount, max: profile.skills.Tech }));
```

Line 127: →
```ts
errors.push(t('validation.wrongFaction', { name: lineage.name }));
```

- [ ] **Step 3: Update all callers of validateRoster to pass locale**

Search for `validateRoster` calls (likely in `useTeamBuilder.ts` or similar). Add the locale parameter:

```ts
const locale = useStore.getState().displaySettings.locale ?? 'en';
const errors = ValidationService.validateRoster(team, campaign, catalog, locale);
```

- [ ] **Step 4: Verify it compiles**

Run: `cd combat-zone-companion && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/validation.ts src/hooks/useTeamBuilder.ts
git commit -m "feat(i18n): translate validation error messages"
```

---

## Task 10: Translate BottomNav

**Files:**
- Modify: `src/components/layout/BottomNav.tsx`

- [ ] **Step 1: Add useT import and translate tab labels**

Import `useT` and replace hardcoded navigation tab names.

Find the nav items array (likely around line 24-27) and replace the static `name` strings with translated values. Since the hook must be called inside the component, move the items definition inside the component body:

```ts
const t = useT();
const items = [
    { name: t('nav.hq'), ... },
    { name: t('nav.teamBuilder'), ... },
    { name: t('nav.play'), ... },
    { name: t('nav.database'), ... },
];
```

Also translate any tooltip texts like `title="Signed in as..."` and `title="Your campaigns are stored locally..."`.

- [ ] **Step 2: Verify it compiles and renders**

Run: `cd combat-zone-companion && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: PASS

Open app, toggle EN/FR — nav tabs should update.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/BottomNav.tsx
git commit -m "feat(i18n): translate navigation tab labels"
```

---

## Task 11: Translate FactionsTab and TYPE_LABEL

**Files:**
- Modify: `src/components/database/FactionsTab.tsx`

- [ ] **Step 1: Replace TYPE_LABEL with translated values**

Import `useT` and `useLocalized`. Replace the static `TYPE_LABEL` map with dynamic translation:

```ts
const t = useT();
const loc = useLocalized();

const TYPE_LABEL: Record<ModelLineage['type'], string> = {
    Leader: t('types.leader'),
    Character: t('types.character'),
    Gonk: t('types.gonk'),
    Specialist: t('types.specialist'),
    Drone: t('types.drone'),
};
```

- [ ] **Step 2: Replace other hardcoded strings**

Replace all hardcoded strings in the component:
- `"Gang Members"` → `t('database.gangMembers')`
- `"Weapons"` → `t('database.weapons')`
- `"Gears"` → `t('database.gear')`
- `"Programs"` → `t('database.programs')`
- `"Objectives"` → `t('database.objectives')`
- `"Edit Faction"` / `"New Faction"` → `t('database.editFaction')` / `t('database.newFaction')`
- `"Name"` → `t('database.name')`
- `"Description"` → `t('database.description')`
- `"No factions found."` → `t('database.noFactions')`

For faction descriptions, use `loc(faction, 'description')` instead of `faction.description`.

- [ ] **Step 3: Verify and commit**

Run: `cd combat-zone-companion && npx tsc --noEmit --pretty 2>&1 | head -20`

```bash
git add src/components/database/FactionsTab.tsx
git commit -m "feat(i18n): translate FactionsTab labels and descriptions"
```

---

## Task 12: Translate PostGameDialog

**Files:**
- Modify: `src/components/play/PostGameDialog.tsx`

- [ ] **Step 1: Import useT and replace all hardcoded strings**

This component has ~28 hardcoded strings. Import `useT`:

```ts
import { useT } from '@/i18n';
```

Inside the component:
```ts
const t = useT();
```

Replace each string using the `postGame.*` translation keys defined in Task 1-2. Key replacements:

- `"Step 1 — Match Outcome"` → `` `${t('postGame.step1')} — ${t('postGame.matchOutcome')}` ``
- `"Victory"` → `t('postGame.victory')`
- `"Defeat"` → `t('postGame.defeat')`
- `"Promote a character"` → `t('postGame.promoteCharacter')`
- `"No eligible characters"` → `t('postGame.noEligible')`
- `"Recruit a Merc"` → `t('postGame.recruitMerc')`
- `"(free)"` → `(${t('postGame.free')})`
- `"Decline"` → `t('postGame.decline')`
- `"Safe"` → `t('postGame.safe')`
- `"Major Injury"` → `t('postGame.majorInjury')`
- `"Return to HQ"` → `t('postGame.returnToHQ')`
- etc.

- [ ] **Step 2: Verify and commit**

Run: `cd combat-zone-companion && npx tsc --noEmit --pretty 2>&1 | head -20`

```bash
git add src/components/play/PostGameDialog.tsx
git commit -m "feat(i18n): translate PostGameDialog wizard steps"
```

---

## Task 13: Translate remaining database components

**Files:**
- Modify: `src/components/database/ArmoryContent.tsx`
- Modify: `src/components/database/ActionsContent.tsx`
- Modify: `src/components/database/ModelsTab.tsx` (if present)
- Modify: `src/components/database/ObjectivesContent.tsx` (if present)
- Modify: `src/components/database/LootsContent.tsx` (if present)

- [ ] **Step 1: For each file, import useT and useLocalized**

Pattern is the same for all:
```ts
import { useT, useLocalized } from '@/i18n';
// Inside component:
const t = useT();
const loc = useLocalized();
```

- [ ] **Step 2: Replace UI labels with t() calls**

For each component, find hardcoded strings and replace with appropriate `t()` keys. Add missing keys to `types.ts`, `en.ts`, and `fr.ts` as needed.

For catalog descriptions, use `loc(item, 'description')` or `loc(item, 'passiveRules')` etc.

- [ ] **Step 3: Verify and commit**

Run: `cd combat-zone-companion && npx tsc --noEmit --pretty 2>&1 | head -20`

```bash
git add src/components/database/
git commit -m "feat(i18n): translate database tab components"
```

---

## Task 14: Translate HQ and campaign components

**Files:**
- Modify: `src/components/campaign/RosterList.tsx`
- Modify: `src/components/campaign/CampaignManager.tsx` (or similar)
- Modify: `src/components/match/TeamBuilder.tsx`

- [ ] **Step 1: Import useT in each component**

Same pattern as previous tasks.

- [ ] **Step 2: Replace hardcoded strings with t() calls**

Use `hq.*` and `team.*` keys. Add any missing keys to the three translation files.

- [ ] **Step 3: Verify and commit**

```bash
git add src/components/campaign/ src/components/match/
git commit -m "feat(i18n): translate HQ, roster, and team builder components"
```

---

## Task 15: Translate play/match components

**Files:**
- Modify: `src/components/play/ActiveMatchView.tsx`
- Modify: `src/components/characters/CharacterCard.tsx` (label overlays only)
- Modify: `src/components/characters/MercCard.tsx`

- [ ] **Step 1: Import useT and useLocalized**

- [ ] **Step 2: Replace play-related hardcoded strings**

Use `play.*` keys. For weapon/item descriptions on cards, use `loc()`.

- [ ] **Step 3: Verify and commit**

```bash
git add src/components/play/ src/components/characters/
git commit -m "feat(i18n): translate play and match components"
```

---

## Task 16: Translate GlossaryTooltip with useLocalized

**Files:**
- Modify: `src/components/ui/GlossaryTooltip.tsx`

- [ ] **Step 1: Use useLocalized for glossary definitions**

```ts
import { useLocalized } from '@/i18n';
// Inside component:
const loc = useLocalized();
// Replace:
//   entry.definition → loc(entry, 'definition')
```

- [ ] **Step 2: Verify and commit**

```bash
git add src/components/ui/GlossaryTooltip.tsx
git commit -m "feat(i18n): localize glossary tooltip definitions"
```

---

## Task 17: Final verification and cleanup

- [ ] **Step 1: Full type check**

Run: `cd combat-zone-companion && npx tsc --noEmit --pretty`
Expected: PASS with zero errors

- [ ] **Step 2: Build check**

Run: `cd combat-zone-companion && npm run build`
Expected: Build succeeds

- [ ] **Step 3: Manual smoke test**

1. Open app in browser
2. Default language should be English — verify all text is identical to pre-i18n state
3. Open DisplaySettings → toggle to FR
4. Verify: nav tabs switch (QG, Composition, Partie, Base de Données)
5. Verify: validation messages are in French (create a team with errors)
6. Verify: PostGameDialog labels are in French
7. Verify: Database tab labels are in French
8. Verify: faction/weapon descriptions still show English (no French content in Supabase yet)
9. Toggle back to EN — everything returns to English
10. Refresh page — locale persists (localStorage)

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat(i18n): complete EN/FR bilingual support — all UI strings translated"
```

---

## Notes for future work (NOT in this plan)

- **Content translation:** French descriptions for all catalog data (weapons, items, programs, factions, glossary) need to be added to Supabase `_fr` columns progressively. This is a content task, not a code task.
- **New translation keys:** When adding new UI features, add keys to all three files (`types.ts`, `en.ts`, `fr.ts`). The TypeScript compiler will error if a key is missing in either language file.
- **Adding a 3rd language:** Add a new file (e.g., `es.ts`), extend the `Locale` type, add to the `translations` map in `index.ts`. No architectural changes needed.
