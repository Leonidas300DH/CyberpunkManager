# Cyberpunk Combat Zone: Character Data Structure Guide

This specific guide explains how characters (Models) are structured in the **Combat Zone Companion** codebase. The system separates the "Identity" of a unit from its "Stats/Rank" to handle leveling up (Veterancy) and roster management.

## 1. Concept Hierarchy

The character system is built on three layers:

1.  **Faction**: The gang or organization (e.g., *Tyger Claws*, *Arasaka*).
2.  **ModelLineage** (The "Identity"): Defines **who** the character is (e.g., *Oyabun*, *Medic*, *Security Guard*). It holds the name, image, and base type (Leader, Specialist, Gonk).
3.  **ModelProfile** (The "Rank"): Defines **how strong** they are. A single Lineage can have multiple Profiles (Level 0, Level 1, etc.). This holds the actual stats, skills, and costs.

---

## 2. Data Structures

### A. Faction
Groups characters together.
- **id**: Unique ID (e.g., `faction-tyger-claws`)
- **name**: Display name
- **description**: Flavor text

### B. ModelLineage (Static Data)
Represents the "card" or "concept" of the model.
- **type**: `Leader` | `Character` | `Gonk` | `Specialist` | `Drone`
- **isMerc**: Boolean flag for mercenaries who can join multiple factions.
- **imageUrl**: The portrait used in the UI.

### C. ModelProfile (Static Data)
Represents the specific stats for a given Rank (Level).
- **level**: Number (0 = Base, 1 = Veteran, etc.)
- **costEB**: Cost in Eurobucks to recruit.
- **actionTokens**: The Actions the model can take per activation (Green/Yellow/Red).
    - *Example*: `{ green: 1, yellow: 1, red: 0 }`
- **skills**: Dice values for skill tests.
    - *Types*: Reflexes, Ranged, Melee, Medical, Tech, Influence.
- **armor**: In-built armor value.
- **actions**: Innate abilities/weapons (e.g., *Mono-Katana*).

### D. RecruitedModel (User Data)
Represents a specific unit in a player's Campaign Roster.
- **id**: Unique Instance ID (UUID).
- **lineageId**: Links to the Identity.
- **currentProfileId**: Links to the current Rank (allows leveling up).
- **equippedItemIds**: Array of specific Gear/Weapons assigned to this unit.
- **hasMajorInjury**: Status flag reducing effectiveness.

---

## 3. Example Data (Tyger Claws Oyabun)

### The Lineage
```typescript
{
  id: "lineage-oyabun",
  name: "Oyabun",
  type: "Leader",
  factionId: "faction-tyger-claws"
}
```

### The Profile (Level 0 - Base)
```typescript
{
  id: "profile-oyabun-0",
  lineageId: "lineage-oyabun",
  level: 0,
  costEB: 35,
  armor: 1,
  actionTokens: { green: 1, yellow: 1, red: 0 },
  skills: { 
    Melee: 2, 
    Reflexes: 1, 
    // ...others 0
  },
  actions: [
    { name: "Mono-Katana", range: "Red", skillReq: "Melee", isAttack: true }
  ]
}
```

### The Profile (Level 1 - Veteran)
When the Oyabun levels up, the `RecruitedModel` points to this new profile ID instead:
```typescript
{
  id: "profile-oyabun-1",
  lineageId: "lineage-oyabun",
  level: 1,
  // Stats improve:
  actionTokens: { green: 1, yellow: 1, red: 1 }, // Added Red token
  skills: { Melee: 3 } // Melee skill increased
}
```
