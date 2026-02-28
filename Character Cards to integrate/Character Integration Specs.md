
# CZ Character Card Import — Claude Code Workflow

## 1. Overview

Interactive workflow for extracting character data from **Cyberpunk Red: Combat Zone** PDF cards and inserting them into the companion app's Supabase database. Claude Code reads the PDFs visually, extracts the data, presents it for user verification, then writes to Supabase.

---

## 2. Supabase Target

- **Project**: `nknlxlmmliccsfsndnba` (cyberpunk-combat-zone)
- **Table**: `reference_data`
- **Key**: `catalog` (object with sub-arrays: `lineages`, `profiles`, `factions`, `weapons`, `items`, `programs`)

Data goes into two sub-arrays:
- `data->'lineages'` — one entry per character identity (shared across all levels)
- `data->'profiles'` — one entry per character level (base, veteran, elite)

---

## 3. Workflow Steps

### Step 1 — Read PDF
- Read the PDF file (page 2 = actual card, page 1 = faction logo back, skip it)
- PDFs are in: `Character Cards to integrate/Cyberpunk Character Cards/{Faction}/`

### Step 2 — Visual Extraction
Read page 2 and extract:

| Field | Where on card |
|---|---|
| Name | Large text, top center |
| Faction | Keyword below name (e.g. TYGER CLAW) |
| Type | After faction (GONK = Gonk type, no mention = Character, LEADER = Leader) |
| Street Cred | White stars ★ near name (0 = base, 1 = vet, 2 = elite) |
| Cost EB | Number + "EB" top-right |
| Actions | Left side hexagonal tokens: GREEN/YELLOW/RED, count each |
| Armor | Purple shield icon with number (null if absent) |
| Skills | Right side hexagonal icons with numbers (see icon guide below) |
| Special rules | Middle section: bold title + description text |
| Gear/Weapons | Bottom section: weapon name, skill icon, range bars, keywords |

**Skill Icon Guide:**
- Reflexes = lightning bolt / double slash
- Ranged = crosshair / target
- Melee = fist / knuckles
- Medical = cross / heartbeat
- Tech = gear / wrench
- Influence = exclamation mark

**Range Bars:** Only list colors with FILLED/ACTIVE chevrons (not greyed out). Values: `Red` (close), `Yellow` (medium), `Green` (long), `Long` (extra long).

### Step 3 — Show User for Verification
Present extracted data as a clear summary table + JSON. Wait for user approval.

### Step 4 — Check Duplicates
Before inserting, check if lineage and profiles already exist:

```sql
-- Check lineage
SELECT elem->>'id' FROM reference_data, jsonb_array_elements(data->'lineages') as elem
WHERE key = 'catalog' AND elem->>'id' = 'lineage-{slug}';

-- Check profiles
SELECT elem->>'id' FROM reference_data, jsonb_array_elements(data->'profiles') as elem
WHERE key = 'catalog' AND elem->>'lineageId' = 'lineage-{slug}';
```

### Step 5 — Insert into Supabase
Insert lineage (if new) then profiles into `catalog`:

```sql
-- Add lineage (only if doesn't exist yet)
UPDATE reference_data
SET data = jsonb_set(data, '{lineages}', data->'lineages' || '[{...}]'::jsonb),
    updated_at = now()
WHERE key = 'catalog';

-- Add profiles
UPDATE reference_data
SET data = jsonb_set(data, '{profiles}', data->'profiles' || '[{...}]'::jsonb),
    updated_at = now()
WHERE key = 'catalog';
```

### Step 6 — Move PDF to Archives
```bash
mv "source.pdf" "{Faction}/Archives/"
```

### Step 7 — Verify
```sql
SELECT elem->>'id' as id, elem->>'level' as level
FROM reference_data, jsonb_array_elements(data->'profiles') as elem
WHERE key = 'catalog' AND elem->>'lineageId' = 'lineage-{slug}';
```

---

## 4. Data Formats

### 4.1 ModelLineage

```json
{
  "id": "lineage-{slug}",
  "name": "Display Name",
  "type": "Character",
  "isMerc": false,
  "imageUrl": "https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/app-images/factions/{faction}.png",
  "isDefaultImage": true,
  "factionIds": ["faction-{faction-slug}"]
}
```

**Type values:** `Leader` | `Character` | `Gonk` | `Specialist` | `Drone`

**Faction IDs:**
| Faction | ID |
|---|---|
| Arasaka | `faction-arasaka` |
| Bozos | `faction-bozos` |
| Danger Gals | `faction-danger-gals` |
| Edgerunners | `faction-edgerunners` |
| Generation Red | `faction-generation-red` |
| Lawmen | `faction-lawmen` |
| Maelstrom | `faction-maelstrom` |
| Trauma Team | `faction-trauma-team` |
| Tyger Claws | `faction-tyger-claws` |
| Zoners | `faction-zoners` |

**Default faction images:**
| Faction | imageUrl path |
|---|---|
| Tyger Claws | `app-images/factions/tyger-claws.png` |
| Arasaka | `app-images/factions/arasaka.png` |
| Maelstrom | `app-images/factions/maelstrom.png` |
| Lawmen | `app-images/factions/lawmen.png` |
| Edgerunners | `app-images/factions/edgerunners.png` |
| Zoners | `app-images/factions/zoners.png` |
| Bozos | `app-images/factions/bozos.png` |
| Danger Gals | `app-images/factions/danger-gals.png` |
| Generation Red | `app-images/factions/generation-red.png` |
| Trauma Team | `app-images/factions/trauma-team.png` |

### 4.2 ModelProfile

```json
{
  "id": "profile-{slug}-{level}",
  "lineageId": "lineage-{slug}",
  "level": 0,
  "costEB": 15,
  "actionTokens": { "green": 1, "yellow": 2, "red": 0 },
  "skills": {
    "Reflexes": 2,
    "Ranged": 1,
    "Melee": 0,
    "Medical": 0,
    "Tech": 0,
    "Influence": 2,
    "None": 0
  },
  "armor": 0,
  "keywords": ["Tyger Claw"],
  "actions": [
    {
      "id": "action-{slug}-{weapon-slug}",
      "name": "Assault Rifle",
      "skillReq": "Ranged",
      "range": "Long",
      "isAttack": true,
      "keywords": ["Rapid 2", "Deadly Crits"],
      "effectDescription": "Rapid 2 if not at max range.",
      "weaponId": "weapon-{weapon-slug}"
    }
  ],
  "streetCred": 0,
  "passiveRules": "RULE NAME: Description text."
}
```

**Critical rules:**
- `skills`: ALL 7 keys required (Reflexes, Ranged, Melee, Medical, Tech, Influence, None) — unused = 0
- `streetCred` matches `level` (0 = base, 1 = veteran, 2 = elite)
- `gonkActionColor` field only for Gonk type (value: `"Green"` | `"Yellow"` | `"Red"`)
- `actions[].range` values: `Reach` | `Red` | `Yellow` | `Green` | `Long` | `Self`
- `actions[].skillReq` values: `Reflexes` | `Ranged` | `Melee` | `Medical` | `Tech` | `Influence` | `None`

### 4.3 Mapping PDF → Profile

| PDF card field | Profile field | Notes |
|---|---|---|
| Name | lineage.name + profile.id slug | Lowercase, hyphenated for IDs |
| Faction | lineage.factionIds | Use faction ID format |
| Type (GONK/LEADER/etc) | lineage.type | Default: "Character" |
| Street Cred (stars) | profile.streetCred + profile.level | Same value |
| Cost EB | profile.costEB | |
| Action tokens | profile.actionTokens | Count each color |
| Armor (shield) | profile.armor | 0 if absent |
| Skills | profile.skills | Map icons to PascalCase names, fill missing with 0 |
| Special rules | profile.passiveRules | "NAME: description" format, join multiple with newline |
| Gear | profile.actions[] | Each weapon = one GameAction entry |

### 4.4 Weapon Range Mapping

| PDF range bars active | actions[].range value |
|---|---|
| Red only | `Red` |
| Red + Yellow | `Yellow` |
| Yellow + Green | `Long` |
| Red + Yellow + Green | `Long` |
| No range (melee) | `Red` or `Reach` |

---

## 5. Card Anatomy — Visual Reference

```
┌─────────────────────────────────────────┐
│  ★★  NAME                    25 EB      │  ← stars = streetCred, top-right = cost
│       FACTION, TYPE                      │
│                                          │
│  ●G  ┌──────────────┐   2 ⚡ Reflexes   │  ← left: action tokens (G/Y/R)
│  │   │              │   1 ◎ Ranged      │  ← right: skills with icons
│  ●Y  │   portrait   │   2 ! Influence   │
│  │   │              │                    │
│  ●Y  └──────────────┘                   │
│  🛡2                                     │  ← shield = armor
│                                          │
│  PASSIVE RULE NAME                       │
│  Rule description text...                │
│                                          │
│  ┌─ WEAPON NAME ──────────── ⚙ ─┐       │
│  │ ◎  ▸▸▸  ▸▸▸  ▸▸▸             │       │  ← skill icon + range bars
│  │    red  yel  grn              │       │
│  │ ☠ Rapid 2, Deadly Crits      │       │  ← keywords
│  └──────────────────────────────┘       │
└─────────────────────────────────────────┘
```

---

## 6. Examples

### Gonk (Shatei — no gear, 1 action)

**Lineage:**
```json
{ "id": "lineage-shatei", "name": "Shatei", "type": "Gonk", "isMerc": false,
  "imageUrl": "https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/app-images/characters/93 Shatei.png",
  "factionIds": ["faction-tyger-claws"] }
```

**Profile (level 0):**
```json
{ "id": "profile-shatei-0", "lineageId": "lineage-shatei", "level": 0,
  "costEB": 5, "gonkActionColor": "Yellow",
  "actionTokens": { "green": 0, "yellow": 1, "red": 0 },
  "skills": { "Reflexes": 0, "Ranged": 0, "Melee": 1, "Medical": 0, "Tech": 0, "Influence": 0, "None": 0 },
  "armor": 0, "keywords": ["Tyger Claw"],
  "actions": [],
  "streetCred": 0,
  "passiveRules": "UNDYING LOYALTY: When this model is taken out, it may make one GREEN [RE]action before being removed.\nDUTIFUL: If this model is in the Path of Attack to a Tyger Claw with a higher INF Skill, it may become the target before dice are rolled." }
```

### Character with weapon (Gokudo — base + veteran)

**Lineage:**
```json
{ "id": "lineage-gokudo", "name": "Gokudo", "type": "Character", "isMerc": false,
  "imageUrl": "https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/app-images/factions/tyger-claws.png",
  "isDefaultImage": true,
  "factionIds": ["faction-tyger-claws"] }
```

**Profile (level 0 — base):**
```json
{ "id": "profile-gokudo-0", "lineageId": "lineage-gokudo", "level": 0,
  "costEB": 15,
  "actionTokens": { "green": 1, "yellow": 2, "red": 0 },
  "skills": { "Reflexes": 2, "Ranged": 1, "Melee": 0, "Medical": 0, "Tech": 0, "Influence": 2, "None": 0 },
  "armor": 0, "keywords": ["Tyger Claw"],
  "actions": [{ "id": "action-gokudo-assault-rifle", "name": "Assault Rifle",
    "skillReq": "Ranged", "range": "Long", "isAttack": true,
    "keywords": ["Rapid 2", "Deadly Crits"],
    "effectDescription": "Rapid 2 if not at max range.",
    "weaponId": "weapon-assault-rifle" }],
  "streetCred": 0,
  "passiveRules": "HIGH GROUND: When you Inspire Your Team, if this model is on elevated terrain, it may make a ranged attack for free." }
```

**Profile (level 1 — veteran):**
```json
{ "id": "profile-gokudo-1", "lineageId": "lineage-gokudo", "level": 1,
  "costEB": 15,
  "actionTokens": { "green": 2, "yellow": 1, "red": 0 },
  "skills": { "Reflexes": 2, "Ranged": 2, "Melee": 0, "Medical": 0, "Tech": 0, "Influence": 2, "None": 0 },
  "armor": 0, "keywords": ["Tyger Claw"],
  "actions": [{ "id": "action-gokudo-assault-rifle", "name": "Assault Rifle",
    "skillReq": "Ranged", "range": "Long", "isAttack": true,
    "keywords": ["Rapid 2", "Deadly Crits"],
    "effectDescription": "Rapid 2 if not at max range.",
    "weaponId": "weapon-assault-rifle" }],
  "streetCred": 1,
  "passiveRules": "HIGH GROUND: When you Inspire Your Team, if this model is on elevated terrain, it may make a ranged attack for free." }
```

---

## 7. Known Edge Cases

- **Multi-page PDFs**: page 1 = card back (faction logo), page 2 = actual card. Always read page 2.
- **Gonks**: only 1 action token, usually no gear. Set `gonkActionColor` to the token color, `actions: []`.
- **Multiple passive rules**: join with `\n` in `passiveRules` field.
- **Weapon "- OR -" modes**: e.g. "Rapid 2 - OR - Deadly Crits" = both keywords in the array, player chooses one per attack.
- **No armor visible**: set `armor: 0` (not null).
- **Veteran/Elite vs Base**: same lineage, different profile. Compare cards side by side to identify stat changes (usually: action tokens upgrade, 1-2 skills increase, streetCred increments).