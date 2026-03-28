# Objectives — Game Rules & Integration Specs

## 1. Overview

Objective cards are **optional** mission cards that give players goals to pursue during a match. Completing objectives earns rewards (ongoing bonuses, cybergear, extra EB, etc.) that persist across the campaign.

Each faction has its own deck of ~21 objective cards, plus 3 universal decks (Corpo Crimes, Public Enemies, Street Justice) usable by any faction.

**Playing with objectives is entirely optional.** A player can choose to play a match without any objectives.

---

## 2. Card Inventory

| Category | Count | Leader Card | Draw Pool |
|---|---|---|---|
| 6th Street | 21 | Wounded Leader | 20 |
| Arasaka | 21 | Wounded Leader | 20 |
| Bozos | 21 | Wounded Leader | 20 |
| Danger Gals | 21 | Wounded Leader | 20 |
| Edgerunners | 21 | Wounded Leader | 20 |
| Generation Red | 21 | Wounded Leader | 20 |
| Lawmen | 21 | Wounded Leader | 20 |
| Maelstrom | 21 | Wounded Leader | 20 |
| Max-Tac | 20 | Villianized Leader | 19 |
| Piranhas | 21 | Wounded Leader | 20 |
| Trauma Team | 21 | Under Review | 20 |
| Tyger Claws | 21 | Wounded Leader | 20 |
| Wild Things | 21 | Wounded Leader | 20 |
| Zoners | 21 | Wounded Leader | 20 |
| Corpo Crimes (universal) | 21 | Censured Leader | 20 |
| Public Enemies (universal) | 21 | Most Wanted Leader | 20 |
| Street Justice (universal) | 21 | Reticent Leader | 20 |

**Total: 356 cards** (17 leader cards + 339 draw-pool cards)

---

## 3. Card Types

### 3.1 Leader Card — Penalty Card (1 per deck)

Every deck has exactly one "Leader" card (e.g., *Wounded Leader*, *Villianized Leader*, *Under Review*, etc.). It is a **persistent penalty** the player carries when their leader was taken out in a previous game.

- **Never drawn randomly** — the player manually indicates they currently carry this penalty
- **Always negative** — typically reduces Street Cred by 1 (with all consequences: fewer eligible cards in pool, lower campaign influence, etc.)
- **Occupies 1 of the 3 objective slots** — reducing the draw to 3 (keep 2) instead of 4 (keep 3)
- **Discarded when the player wins a game** — the penalty is lifted

### 3.2 Regular Objective Cards (19-20 per deck)

The remaining cards form the **draw pool**. They are drawn randomly before a match.

**Reward types:**

| Type | Count | Description |
|---|---|---|
| **Ongoing** | 167 | Permanent bonus once completed. Stays in play across games. Can be "exhausted" and "refreshed". |
| **Immediate** | 83 | One-time effect that triggers instantly when condition is met during the game. |
| **Recycle** | 60 | Can be discarded for a powerful one-time effect. Returns to the draw pool after use. |
| **Cybergear** | 29 | Grants a permanent cybergear upgrade to a specific model upon completion. |

**Street Cred requirements (on non-leader cards):**

| Requirement | Count | Notes |
|---|---|---|
| SC 0 (none) | 192 | Always available |
| SC 1 (★) | 131 | Requires at least 1 Street Cred to include in draw pool |
| SC 2 (★★) | 16 | Requires at least 2 Street Cred |

---

## 4. Objective Deck Selection

For now, the player uses their **faction deck only**. Universal decks (Corpo Crimes, Public Enemies, Street Justice) are a future extension.

---

## 5. Pre-Match Flow (Team Builder Integration)

### 5.1 Where It Happens

Objective selection occurs in the **Team Builder** (`/match`), during the "Deploy" step, **after** the player has selected their squad and equipment but **before** starting the match.

### 5.2 Draw Mechanics — "Draw 4, Keep 3"

The core mechanic is **draw 4, keep 3**:

1. The player draws **4 random cards** from the eligible pool.
2. The player **discards 1**, keeping a hand of **3 objectives** for the match.

**Wounded Leader penalty:** If the player is currently carrying the Leader penalty card (from a previous game where their leader was taken out), it occupies 1 slot in the hand of 3. The draw then becomes **draw 3, keep 2** (+ Leader penalty = 3 total).

```
NO penalty:                   CARRYING WOUNDED LEADER:
  Draw 4 → Keep 3              Penalty locked in → Draw 3 → Keep 2
  ┌──┐┌──┐┌──┐┌──┐            ┌──────────┐  ┌──┐┌──┐┌──┐
  │O1││O2││O3││O4│            │ WOUNDED  │  │O1││O2││O3│
  └──┘└──┘└──┘└──┘            │ LEADER   │  └──┘└──┘└──┘
       ↓ discard 1             └──────────┘       ↓ discard 1
  ┌──┐┌──┐┌──┐                ┌──────────┐  ┌──┐┌──┐
  │O1││O3││O4│  = 3 cards     │ WOUNDED  │  │O1││O3│  = 3 cards
  └──┘└──┘└──┘                │ LEADER   │  └──┘└──┘
                               └──────────┘
```

### 5.3 Step-by-Step UI Flow

```
┌──────────────────────────────────────────────┐
│  TEAM BUILDER                                │
│  1. Select recruits from roster              │
│  2. Assign equipment                         │
│  3. Validate team                            │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │  OBJECTIVES (optional)                 │  │
│  │                                        │  │
│  │  [ ] Play with objectives              │  │
│  │                                        │  │
│  │  [ ] Carrying Wounded Leader penalty    │  │
│  │                                        │  │
│  │  [🎲 DRAW]                             │  │
│  │                                        │  │
│  │  Drawn (discard 1, keep 3):            │  │
│  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐         │  │
│  │  │ O1 │ │ O2 │ │ O3 │ │ O4 │         │  │
│  │  │ ✓  │ │ ✓  │ │    │ │ ✓  │         │  │
│  │  └────┘ └────┘ └────┘ └────┘         │  │
│  │        3/3 selected — discard O3       │  │
│  │                                        │  │
│  │  [↻ Redraw]                            │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  [START MATCH]                               │
└──────────────────────────────────────────────┘
```

### 5.4 Draw Rules

1. **Toggle objectives** — checkbox "Play with objectives" (off by default). If off, the section is collapsed and no objectives are deployed.
2. **Wounded Leader penalty** — checkbox "Carrying [Leader Card Name]". If checked, the leader penalty card is locked into the hand (slot 1 of 3) and the draw count drops from 4 to 3 (keep 2 instead of 3). This reflects that the player's leader was taken out in a previous game and they haven't won since.
3. **Draw** — Click "Draw" to randomly draw 4 cards (or 3 if carrying leader penalty) from the eligible pool.
4. **Select/discard** — The player taps cards to select which to keep. Must keep exactly 3 total (including leader penalty if present). The unselected card(s) are discarded back to the pool.
5. **Redraw** — Player can redraw (shuffle all back, draw again) before starting the match. Unlimited redraws.

### 5.5 Eligible Pool (Exclusion Rules)

A card is **excluded from the draw pool** if:
- It's a Leader card (always manual, never drawn)
- Its `grantsStreetCred` > campaign's current Street Cred
- Its `id` is in `campaign.completedObjectives` AND its reward type is `ongoing` or `cybergear` (permanent rewards already earned)

> **Note:** `recycle` and `immediate` cards are never excluded — they can be drawn again in future games.

---

## 6. Data Model Changes

### 6.1 MatchTeam (add fields)

```typescript
export interface MatchTeam {
    // ... existing fields ...

    // Objectives
    objectiveIds?: string[];            // IDs of the 3 objective cards for this match (includes leader if present)
    completedObjectiveIds?: string[];   // IDs completed during THIS match (moved to campaign post-game)
}
```

### 6.2 Campaign (already exists)

```typescript
export interface Campaign {
    // ... existing fields ...
    completedObjectives: string[];  // Already exists — IDs of completed objectives across all games
}
```

---

## 7. Active Match Integration

During the match (Play tab), objectives appear as a dedicated section.

### 7.1 Display

- **Objective hand** displayed as a row of mini-cards (same ObjectiveCard component, compact)
- Each card shows: name, condition text, reward type badge
- Leader penalty card visually distinct (red border / warning icon)

### 7.2 Completing an Objective (in-game)

The player can **tap an objective card** to mark it as completed during the game. This triggers:

1. **Confirmation dialog** showing the card name, condition, and **all rewards** that will be applied:

```
┌─────────────────────────────────────┐
│  ✓ COMPLETE OBJECTIVE               │
│                                     │
│  "Hold the Line"                    │
│  ONGOING                            │
│                                     │
│  Rewards:                           │
│  ★ +1 Street Cred                   │
│  +5 EB (permanent bonus per game)   │
│                                     │
│  [CONFIRM]          [CANCEL]        │
└─────────────────────────────────────┘
```

2. **On confirm**, the rewards are applied **immediately to the campaign**:

| Reward | Effect | When |
|---|---|---|
| `grantsStreetCred` > 0 | Campaign Street Cred increases by N. This may unlock higher-tier cards in future draws, affect validation rules, etc. | Immediate |
| `grantsStreetCred` < 0 | Campaign Street Cred decreases (e.g., Wounded Leader on some factions). | Immediate |
| `grantsEB` | Permanent bonus: the player may bring +N EB to all future games. Added to campaign. | Immediate |
| `grantsLuck` | Luck tokens gained for this match (or future matches depending on card text). | Immediate |
| `cybergear` | Cybergear upgrade — prompt to assign to a model (Phase 3). | Post-match |
| `recycle` | Card is discarded for a one-time effect described in `rewardText`. Returns to pool. | Immediate |
| `immediate` | One-time in-game effect described in `rewardText`. | Immediate |

3. **Visual feedback**: completed card gets a checkmark overlay + green border. The card text remains readable.

4. **Wounded Leader completion** (special case): when the player wins a game and confirms completion of the leader penalty card, the Street Cred penalty is lifted (the negative SC effect is removed). The card is discarded from the campaign.

### 7.3 Reward Summary

After completing an objective, a brief toast/notification shows the applied rewards:
- "★ Street Cred +1" (yellow)
- "+5 EB per game" (green)
- "+1 Luck" (cyan)
- "Cybergear unlocked — assign after match" (cyan)

### 7.4 Persistence

- Completing an objective updates `matchTeam.completedObjectiveIds` (persisted in store)
- `ongoing` and `cybergear` completed IDs are also added to `campaign.completedObjectives` (so they won't be drawn again)
- `recycle` and `immediate` cards are NOT added to `campaign.completedObjectives` — they return to the draw pool for future games
- EB bonuses from completed objectives are tracked in the campaign and affect future game budgets

---

## 8. UI Components

| Component | Location | Purpose |
|---|---|---|
| `ObjectiveDrawer` (new) | Team Builder | Toggle, leader choice, draw/select/redraw |
| `ObjectiveHand` (new) | Active Match (Play tab) | Display 3 objectives during game, tap to complete |
| `ObjectiveCard` (existing) | Database tab | Full card display (already implemented) |

---

## 9. Implementation Priority

1. **Phase 1 — Draw in Team Builder**
   - Toggle "Play with objectives"
   - Leader card toggle
   - Draw 4 / keep 3 mechanic (or draw 3 / keep 2 with leader)
   - SC filtering + exclusion rules
   - Redraw
   - Store selected IDs in MatchTeam

2. **Phase 2 — Display in Active Match**
   - Show objective hand during play
   - Tap to mark completed
   - Visual feedback

3. **Phase 3 — Post-Match Integration**
   - Move completed objectives to campaign
   - Apply rewards (EB, cybergear)
   - Handle recycle vs permanent completion
