# Character Data Model

How characters (combatants) are modeled in the Combat Zone Companion database.

## Overview

A character is not a single flat object. It is a layered hierarchy that separates **identity** (who they are), **stats** (how strong they are at a given rank), **instance** (a specific recruit in your campaign), and **loadout** (what they carry into a match).

```
Faction
  └─ ModelLineage          (identity: name, type, faction)
       └─ ModelProfile[]   (stats at each rank: level 0, 1, 2, 3)

Campaign
  └─ RecruitedModel        (instance: which lineage, current rank, equipped items, injury state)

MatchTeam
  └─ selectedRecruitIds[]  (which recruits go to this match)
```

## Layer 1 — Faction

| Field       | Type     | Description |
|-------------|----------|-------------|
| id          | string   | Stable unique ID (e.g. `faction-tyger-claws`) |
| name        | string   | Display name (e.g. "Tyger Claws") |
| description | string?  | Optional flavor text |
| imageUrl    | string?  | Faction logo path (`/images/factions/`) |

A team belongs to exactly one Faction. Mercs (`isMerc: true`) can join any team.

## Layer 2 — ModelLineage (Identity)

A Lineage is a **character template** — it defines *who* the model is, not how strong they are.

| Field     | Type    | Description |
|-----------|---------|-------------|
| id        | string  | e.g. `lineage-oyabun` |
| name      | string  | e.g. "Oyabun" |
| factionId | string  | FK → `Faction.id` |
| type      | enum    | `'Leader' \| 'Character' \| 'Gonk' \| 'Specialist' \| 'Drone'` |
| isMerc    | boolean | `true` = can be hired by any faction |
| imageUrl  | string? | Model illustration |

### Model Types

| Type       | Description |
|------------|-------------|
| Leader     | Exactly 1 per team (validation rule). Centerpiece character. |
| Character  | Named characters with multiple Action Tokens and abilities. |
| Gonk       | Rank-and-file muscle. Eliminated by a single wound. Has `quantity` (e.g. 5 bikers). |
| Specialist | Rare individual — max 1 of each Specialist per team. |
| Drone      | Deployed by programs/gear. No standard recruitment cost. |

## Layer 3 — ModelProfile (Stats at a Rank)

A Lineage can have **multiple profiles** — one per experience level (rank). A recruit advances by switching to a higher-level profile.

| Field          | Type                          | Description |
|----------------|-------------------------------|-------------|
| id             | string                        | e.g. `profile-oyabun-1` |
| lineageId      | string                        | FK → `ModelLineage.id` |
| level          | number                        | `0` = Base, `1` = 1-Star Veteran, `2` = 2-Star, `3` = 3-Star |
| costEB         | number                        | Recruitment/match cost in Eurobucks |
| actionTokens   | `{ green, yellow, red }`     | Available Action Tokens by color |
| gonkActionColor | ActionColor?                 | For Gonks only: the single die color they use |
| skills         | `Record<SkillType, number>`   | 7 skills: Reflexes, Ranged, Melee, Medical, Tech, Influence, None |
| armor          | number                        | Native armor value (before Gear) |
| keywords       | string[]                      | e.g. `['Netrunner', 'Cyber-Character', 'Honor Bound']` |
| actions        | GameAction[]                  | Innate actions (weapons, abilities on the character card) |
| passiveRules   | string                        | Free-text passive abilities |

### ActionToken Colors

- **Green** = best die (highest chance of success)
- **Yellow** = medium die
- **Red** = worst die (highest chance of Fumble)

When a character is **wounded**, one Action Token is downgraded to Red. When none remain, the character is **Taken Out**.

### Skills (SkillType)

`'Reflexes' | 'Ranged' | 'Melee' | 'Medical' | 'Tech' | 'Influence' | 'None'`

Each skill is a numeric bonus added to the die roll when performing a related action.

## Layer 4 — GameAction (Innate Actions)

Actions are embedded in `ModelProfile.actions[]` and `ItemCard.grantedActions[]`.

| Field            | Type      | Description |
|------------------|-----------|-------------|
| id               | string    | Unique action ID |
| name             | string    | e.g. "Mono-Katana", "Heavy Pistol" |
| skillReq         | SkillType | Which skill is rolled |
| range            | RangeType | `'Reach' \| 'Red' \| 'Yellow' \| 'Green' \| 'Long' \| 'Self'` |
| isAttack         | boolean   | If `true`, causes wounds on success |
| keywords         | string[]  | Game keywords (e.g. `['Deadly', 'Blast', 'Pierce 2', 'Complex']`) |
| effectDescription | string   | Free-text description of the effect |

## Layer 5 — RecruitedModel (Campaign Instance)

When you **recruit** a Lineage into your Campaign, a `RecruitedModel` is created. This is the persistent instance that tracks rank, equipment, and injuries across matches.

| Field            | Type     | Description |
|------------------|----------|-------------|
| id               | string   | Unique instance ID (UUID) |
| lineageId        | string   | FK → `ModelLineage.id` — who they are |
| currentProfileId | string   | FK → `ModelProfile.id` — their current rank/stats |
| equippedItemIds  | string[] | FK[] → `ItemCard.id` — equipped Gear |
| hasMajorInjury   | boolean  | If `true`, forced to use Rank 0 stats |
| quantity         | number   | For Gonks: how many models in this group (e.g. 5) |

### Rank Advancement

To promote a recruit, change `currentProfileId` to the next-level `ModelProfile` for the same `lineageId`. Each level costs more EB and grants better stats.

### Injury

`hasMajorInjury: true` means the character was severely injured in a previous match. They must use their Level 0 profile stats regardless of their actual rank. (UI for managing this is not yet implemented.)

## Layer 6 — Campaign (HQ)

The persistent state for a series of linked games.

| Field               | Type              | Description |
|---------------------|-------------------|-------------|
| id                  | string            | Campaign UUID |
| name                | string            | e.g. "Night City Showdown" |
| factionId           | string            | FK → `Faction.id` |
| ebBank              | number            | Unspent Eurobucks |
| hqRoster            | RecruitedModel[]  | All recruited characters |
| hqStash             | string[]          | ItemCard IDs owned but not equipped |
| completedObjectives | string[]          | Completed objective IDs (grant Street Cred bonus) |

### Derived Values

- **Street Cred** = `SUM(profile.level for each recruit)` + `SUM(objective.grantsStreetCredBonus)`
- **Influence** = `SUM(profile.skills.Influence)` for Leaders and Characters only
- **Gonk Quota** = max Gonks allowed = total Influence

## Layer 7 — MatchTeam (Game Day)

A selection of recruits from the Campaign HQ for a specific match.

| Field             | Type     | Description |
|-------------------|----------|-------------|
| id                | string   | Match UUID |
| campaignId        | string   | FK → `Campaign.id` |
| targetEB          | number   | Budget limit (e.g. 100, 150, 200 EB) |
| selectedRecruitIds | string[] | FK[] → `RecruitedModel.id` — who's playing |

### Team Cost Calculation

```
Total = SUM(profile.costEB × recruit.quantity) + SUM(equippedItem.costEB)
```

Note: Item cost is **not** multiplied by quantity (per the spec formula).

## Validation Rules (9 rules)

| # | Rule | Description |
|---|------|-------------|
| 1 | Leader | Exactly 1 Leader per team |
| 2 | Gonk Quota | Total Gonk quantity ≤ total Influence |
| 3 | Budget | Team cost ≤ targetEB |
| 4 | Street Cred | All items/profiles require `reqStreetCred ≤ campaign Street Cred` |
| 5 | Rarity | Max copies of a single Gear/Program ≤ its `rarity` value |
| 6 | Bulky | Max 1 Bulky Gear per model |
| 7 | Cybergear | Only Cyber-Characters can equip Cybergear |
| 8 | Netrunner | Only Netrunners can install Programs |
| 9 | Faction | All non-Merc members must match the Campaign faction |

## Storage

All data is persisted in the browser via **Zustand + localStorage** (key: `combat-zone-storage`).

- `catalog` — shared reference data (factions, lineages, profiles, items, programs)
- `campaigns[]` — user's campaign saves
- `activeMatchTeam` — currently-being-built match team

Programs are seeded from a CSV (`src/data/programs_csv.ts`) parsed at startup. Factions, lineages, profiles, and items are seeded from `src/lib/seed.ts`.

## Files

| File | Content |
|------|---------|
| `src/types/index.ts` | All TypeScript interfaces |
| `src/store/useStore.ts` | Zustand store with persistence |
| `src/lib/seed.ts` | Seed data (factions, lineages, profiles, items, programs from CSV) |
| `src/lib/math.ts` | `calculateCampaignStreetCred`, `calculateCampaignInfluence`, `calculateTeamCost` |
| `src/lib/validation.ts` | 9 validation rules for `MatchTeam` |
| `src/components/layout/AppInit.tsx` | Auto-seeds catalog on app load |
