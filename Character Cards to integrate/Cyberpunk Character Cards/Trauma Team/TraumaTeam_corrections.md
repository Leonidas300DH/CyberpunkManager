# Trauma Team -- PDF vs Seed Audit Report
Generated: 2026-02-27

---

## 1. CZ_CharacterCards_TraumaTeam_Security.pdf

### Security (Base)
**Lineage**: Security | **Level**: 0 | **Seed Profile ID**: `profile-security-0`
**Status**: ERRORS FOUND

| Field | PDF Card Value | Seed Value | Match? |
|-------|---------------|------------|--------|
| Name | Security | Security | OK |
| Cost (EB) | 15 | 15 | OK |
| Action Tokens | 2 Yellow, 0 Green, 0 Red | 1 Green, 1 Yellow, 0 Red | MISMATCH |
| Keywords | Trauma Team, Merc | Trauma Team, Merc | OK |
| Armor | 1 | 1 | OK |
| Ranged (crosshair) | 2 | 2 | OK |
| Reflexes (curved arrow) | 1 | 1 | OK |
| Tech (wrench) | 1 | 1 | OK |
| Medical | 0 (not shown) | 0 | OK |
| Melee | 0 (not shown) | 0 | OK |
| Influence | 0 (not shown) | 0 | OK |
| Passive Name | SECURITY SCAN | SECURITY SCAN | OK |
| Passive Text | This model may [RE]act when any visible friendly model is wounded, instead of the target. | This model may [RE]act when any visible friendly model is wounded, instead of the target. | OK |
| Action Name | Assault Rifle | Assault Rifle | OK |
| Action Skill | Ranged (crosshair) | Ranged | OK |
| Action Range | Red+Yellow+Green (3 chevrons lit) | Long | MISMATCH |
| Action Keywords | Rapid 2 -OR- (second line with skull, implying Melee alt) | Rapid 2 if not at max range. | MISMATCH |

**Discrepancies:**
1. **Action Tokens**: PDF shows 2 Yellow tokens (both pentagon shapes are yellow-filled). Seed says 1 Green + 1 Yellow. The PDF card's top token appears to be Yellow (not Green). **However**, re-examining the image more carefully: the top token has a yellow pentagon inside a grey circle, and the second token also has a yellow pentagon. Both tokens are yellow. Seed expects green=1, yellow=1. --> **PDF = 0G/2Y/0R vs Seed = 1G/1Y/0R**
2. **Action Range**: PDF shows Red+Yellow+Green chevrons lit (3 active chevrons), with a 4th (Long) chevron greyed out. This means range = "Green" per the convention (Red+Yellow+Green = Green). But the seed says "Long". The PDF also shows a second range bar below "-OR-" that has a long chevron with a "+" symbol. This seems to depict an alternate fire mode at Long range. **The primary range bar shows Green, but the seed says Long.** Looking again at the card layout: there are TWO range bars. The top bar shows Red(grey)+Yellow+Green = "Green" range. The bottom bar (after -OR-) shows all chevrons to Long with a "+" = Long range. The seed stores only one range value "Long" which appears to correspond to the maximum possible range across both modes. The PDF effectively shows two modes: Green range with Rapid 2, OR Long range (without Rapid 2). The seed's `effectDescription` "Rapid 2 if not at max range." captures this dual-mode. **The seed range "Long" is the maximum range; the PDF shows the dual-mode visually. This is a representation difference, not a data error.** The seed is correct to say "Long" as the weapon's range.
3. **Action effectDescription**: PDF shows "Rapid 2 -OR-" with a second fire mode (melee/long range alt). Seed says "Rapid 2 if not at max range." The meaning is the same: Rapid 2 at non-max range, or a single shot at Long. Text wording differs but semantics match. **Not a data error -- seed wording is a summary of the visual card.**

**REVISED STATUS**: CORRECT (action tokens need verification -- see note below)

**RE-EXAMINATION of Action Tokens**: Looking at the PDF image very carefully again:
- Top token: Yellow pentagon in grey circle
- Bottom token: Yellow pentagon in grey circle
- PDF text extraction shows the numbers "2, 1, 1, 1" on the text layer

The tokens on the card image both appear YELLOW. But wait -- the filename mapping says this is the base (level 0) version. In the seed, Security level 0 has green=1, yellow=1. The visual on the card shows two tokens that both look yellow-gold colored. This could be a visual rendering issue or the PDF truly shows 2 yellow.

**FINAL STATUS**: NEEDS VERIFICATION

| Issue | Detail |
|-------|--------|
| Action Tokens | PDF visually shows 2 yellow tokens. Seed expects 1 green + 1 yellow. Possible card error or visual ambiguity. |

---

## 2. CZ_CharacterCards_TraumaTeam_Security_Vet1.pdf

### Security (Veteran)
**Lineage**: Security | **Level**: 1 | **Seed Profile ID**: `profile-security-1`
**Status**: ERRORS FOUND

| Field | PDF Card Value | Seed Value | Match? |
|-------|---------------|------------|--------|
| Name | Security | Security | OK |
| Level | 1 (star shown) | 1 | OK |
| Cost (EB) | 15 | 15 | OK |
| Action Tokens | 1 Green, 1 Yellow, 0 Red | 1 Green, 1 Yellow, 0 Red | OK |
| Keywords | Trauma Team, Merc | Trauma Team, Merc | OK |
| Armor | 1 | 1 | OK |
| Ranged (crosshair) | 2 | 2 | OK |
| Reflexes (curved arrow) | 1 | 1 | OK |
| Tech (wrench) | 2 | 2 | OK |
| Medical | 0 (not shown) | 0 | OK |
| Melee | 0 (not shown) | 0 | OK |
| Influence | 0 (not shown) | 0 | OK |
| Passive Name | SECURITY SCAN | SECURITY SCAN | OK |
| Passive Text | This model may [RE]act when any visible friendly model is wounded, instead of the target. | This model may [RE]act when any visible friendly model is wounded, instead of the target. | OK |
| Action Name | Assault Rifle | Assault Rifle | OK |
| Action Skill | Ranged (crosshair) | Ranged | OK |
| Action Range | Green (primary) / Long (alt mode) | Long | OK (see Security base note) |
| Action Keywords | Rapid 2 -OR- (alt mode) | Rapid 2 if not at max range. | OK (same dual-mode representation) |

**Discrepancies:** None found. All fields match the seed.

**FINAL STATUS**: CORRECT

---

## 3. CZ_CharacterCards_TraumaTeam_Cyber-EnhancedSecurity.pdf

### Cyber-Enhanced Security (Base)
**Lineage**: Cyber-Enhanced Security | **Level**: 0 | **Seed Profile ID**: `profile-cyber-enhanced-security-0`
**Status**: ERRORS FOUND

| Field | PDF Card Value | Seed Value | Match? |
|-------|---------------|------------|--------|
| Name | Cyber-Enhanced Security | Cyber-Enhanced Security | OK |
| Cost (EB) | 25 | 25 | OK |
| Action Tokens | 2 Green, 1 Yellow, 0 Red | 2 Green, 1 Yellow, 0 Red | OK |
| Keywords | Trauma Team, Merc | Trauma Team, Merc | OK |
| Armor | 2 | 2 | OK |
| Ranged (crosshair) | 2 | 2 | OK |
| Tech (wrench) | 2 | 2 | OK |
| Influence (exclamation/star icon) | 1 | 1 | OK |
| Reflexes | 0 (not shown) | 0 | OK |
| Melee | 0 (not shown) | 0 | OK |
| Medical | 0 (not shown) | 0 | OK |
| Passive Name | INTRUDER ALERT | INTRUDER ALERT | OK |
| Passive Text | When a visible enemy ends a basic move action, this model may [RE]act to the action as if it had wounded this model. | When a visible enemy ends a basic move action, this model may [RE]act to the action as if it had wounded this model. | OK |
| Action Name | Remington A-37 Combat Rifle | Remington A-37 Combat Rifle | OK |
| Action Skill | Ranged (crosshair) | Ranged | OK |
| Action Range | Red(grey)+Yellow+Green+Long(with +) = Long | Green | MISMATCH |
| Action Keywords | Rapid 2, Accurate | Rapid 2, Accurate | OK |
| Action effectDescription | Rapid 2, Accurate | Rapid 2, Accurate. | OK |

**Discrepancies:**
1. **Action Range**: PDF shows range chevrons: Red(grey), Yellow(lit), Green(lit), Long(lit with "+"). This means the weapon fires from Yellow out to Long. The Long chevron is clearly active/lit with a "+" symbol. **Seed says "Green" but PDF clearly shows Long range.** This is a data error in the seed.

**FINAL STATUS**: ERRORS FOUND

| Issue | Detail |
|-------|--------|
| Action Range | PDF shows Long range (Yellow+Green+Long chevrons lit). Seed has "Green". **Seed should be "Long".** |

---

## 4. CZ_CharacterCards_TraumaTeam_Cyber-EnhancedSecurity_Vet1.pdf

### Cyber-Enhanced Security (Veteran)
**Lineage**: Cyber-Enhanced Security | **Level**: 1 | **Seed Profile ID**: `profile-cyber-enhanced-security-1`
**Status**: ERRORS FOUND

| Field | PDF Card Value | Seed Value | Match? |
|-------|---------------|------------|--------|
| Name | Cyber-Enhanced Security | Cyber-Enhanced Security | OK |
| Level | 1 (star shown) | 1 | OK |
| Cost (EB) | 25 | 25 | OK |
| Action Tokens | 3 Green, 0 Yellow, 0 Red | 3 Green, 0 Yellow, 0 Red | OK |
| Keywords | Trauma Team, Merc | Trauma Team, Merc | OK |
| Armor | 2 | 2 | OK |
| Ranged (crosshair) | 2 | 2 | OK |
| Tech (wrench) | 2 | 2 | OK |
| Influence (exclamation/star icon) | 2 | 1 | MISMATCH |
| Reflexes | 0 (not shown) | 0 | OK |
| Melee | 0 (not shown) | 0 | OK |
| Medical | 0 (not shown) | 0 | OK |
| Passive Name | INTRUDER ALERT | INTRUDER ALERT | OK |
| Passive Text | When a visible enemy ends a basic move action, this model may [RE]act to the action as if it had wounded this model. | When a visible enemy ends a basic move action, this model may [RE]act to the action as if it had wounded this model. | OK |
| Action Name | Remington A-37 Combat Rifle | Remington A-37 Combat Rifle | OK |
| Action Skill | Ranged (crosshair) | Ranged | OK |
| Action Range | Long (Yellow+Green+Long chevrons lit) | Green | MISMATCH |
| Action Keywords | Rapid 2, Accurate | Rapid 2, Accurate | OK |

**Discrepancies:**
1. **Influence**: PDF shows 2 on the exclamation/star icon (Influence). Seed has Influence = 1. **Seed should be 2 for the Veteran.**
2. **Action Range**: Same as base -- PDF shows Long, seed says Green. **Seed should be "Long".**

**FINAL STATUS**: ERRORS FOUND

| Issue | Detail |
|-------|--------|
| Influence | PDF shows 2. Seed has 1. **Seed should be 2.** |
| Action Range | PDF shows Long. Seed has "Green". **Seed should be "Long".** |

---

## 5. CZ_CharacterCards_TraumaTeam_DocSalvage.pdf

### Doc Salvage (Base)
**Lineage**: Doc Salvage | **Level**: 0 | **Seed Profile ID**: `profile-doc-salvage-0`
**Status**: ERRORS FOUND

| Field | PDF Card Value | Seed Value | Match? |
|-------|---------------|------------|--------|
| Name | Doc Salvage | Doc Salvage | OK |
| Cost (EB) | 20 | 20 | OK |
| Action Tokens | 1 Green, 2 Yellow, 0 Red | 1 Green, 1 Yellow, 0 Red | MISMATCH |
| Keywords | Trauma Team, Merc, Specialist | Trauma Team, Merc, Specialist | OK |
| Armor | 1 | 1 | OK |
| Ranged (crosshair) | 2 | 2 | OK |
| Tech (wrench) | 1 | 1 | OK |
| Reflexes (curved arrow) | 2 | 2 | OK |
| Medical | 0 (not shown) | 0 | OK |
| Melee | 0 (not shown) | 0 | OK |
| Influence | 0 (not shown) | 0 | OK |
| Passive Name | COOKED IT UP MYSELF | Cooked It Up Myself | OK (case difference only) |
| Passive Text | This model may equip one piece of Gear at the start of the game ignoring all Faction and Street Cred requirements. This Gear costs 1 additional EB. | This model may equip one piece of Gear at the start of the game ignoring all Faction and Street Cred requirements. This Gear costs 1 additional EB. | OK |
| Action Name | Assault Rifle | Assault Rifle | OK |
| Action Skill | Ranged (crosshair) | Ranged | OK |
| Action Range | Green (primary) / Long (alt mode with +) | Green | OK |
| Action Keywords | Rapid 2 -OR- (alt melee mode) | Rapid 2 -OR- Melee. | OK (visual shows dual mode) |

**Discrepancies:**
1. **Action Tokens**: PDF shows 1 Green (top, hexagonal green fill) + 2 Yellow (middle and bottom, yellow pentagon fill). Seed says 1 Green + 1 Yellow. **PDF has 3 tokens total (1G+2Y), seed has 2 tokens (1G+1Y).**

**FINAL STATUS**: ERRORS FOUND

| Issue | Detail |
|-------|--------|
| Action Tokens | PDF shows 1 Green + 2 Yellow (3 total). Seed has 1 Green + 1 Yellow (2 total). **Seed should be green=1, yellow=2.** |

---

## 6. CZ_CharacterCards_TraumaTeam_DocSalvage_Vet1.pdf

### Doc Salvage (Veteran)
**Lineage**: Doc Salvage | **Level**: 1 | **Seed Profile ID**: `profile-doc-salvage-1`
**Status**: ERRORS FOUND

| Field | PDF Card Value | Seed Value | Match? |
|-------|---------------|------------|--------|
| Name | Doc Salvage | Doc Salvage | OK |
| Level | 1 (star shown) | 1 | OK |
| Cost (EB) | 20 | 20 | OK |
| Action Tokens | 1 Green, 2 Yellow (wait -- re-checking...) | 1 Green, 1 Yellow, 0 Red | CHECK |
| Keywords | Trauma Team, Merc, Specialist | Trauma Team, Merc, Specialist | OK |
| Armor | 1 | 1 | OK |
| Ranged (crosshair) | 2 | 2 | OK |
| Tech (wrench) | 2 | 2 | OK |
| Reflexes (curved arrow) | 3 | 3 | OK |
| Medical | 0 (not shown) | 0 | OK |
| Melee | 0 (not shown) | 0 | OK |
| Influence | 0 (not shown) | 0 | OK |
| Passive Name | COOKED IT UP MYSELF | Cooked It Up Myself | OK (case difference only) |
| Passive Text | This model may equip one piece of Gear at the start of the game ignoring all Faction and Street Cred requirements. This Gear costs 1 additional EB. | This model may equip one piece of Gear at the start of the game ignoring all Faction and Street Cred requirements. This Gear costs 1 additional EB. | OK |
| Action Name | Assault Rifle | Assault Rifle | OK |
| Action Skill | Ranged (crosshair) | Ranged | OK |
| Action Range | Green (primary) / Long (alt) | Green | OK |
| Action Keywords | Rapid 2 -OR- (alt mode) | Rapid 2 -OR- Melee. | OK |

**Action Tokens re-check**: PDF Vet1 shows: top token = Green (hexagonal, green fill), middle token = Green (hexagonal, green fill), bottom token = Yellow (pentagon, yellow fill). That is **2 Green + 1 Yellow**.

| Field | PDF Card Value | Seed Value | Match? |
|-------|---------------|------------|--------|
| Action Tokens | 2 Green, 1 Yellow, 0 Red | 1 Green, 1 Yellow, 0 Red | MISMATCH |

**Discrepancies:**
1. **Action Tokens**: PDF shows 2 Green + 1 Yellow (3 total). Seed says 1 Green + 1 Yellow (2 total). **Seed should be green=2, yellow=1.**

**FINAL STATUS**: ERRORS FOUND

| Issue | Detail |
|-------|--------|
| Action Tokens | PDF shows 2 Green + 1 Yellow (3 total). Seed has 1 Green + 1 Yellow (2 total). **Seed should be green=2, yellow=1.** |

---

## 7. CZ_CharacterCards_TraumaTeam_Med-EvacPilot.pdf

### Med-Evac Pilot (Base)
**Lineage**: Med-Evac Pilot | **Level**: 0 | **Seed Profile ID**: `profile-med-evac-pilot-0`
**Status**: CORRECT

| Field | PDF Card Value | Seed Value | Match? |
|-------|---------------|------------|--------|
| Name | Med-Evac Pilot | Med-Evac Pilot | OK |
| Cost (EB) | 8 | 8 | OK |
| Action Tokens | 1 Yellow, 1 Yellow (2Y total) | 1 Green, 1 Yellow, 0 Red | CHECK |
| Keywords | Trauma Team, Merc | Trauma Team, Merc | OK |
| Armor | 0 (not shown) | 0 | OK |
| Ranged (crosshair) | 1 | 1 | OK |
| Tech (wrench) | 1 | 1 | OK |
| Medical (cross/wrench icon) | 1 | 1 | OK |
| Reflexes | 0 (not shown) | 0 | OK |
| Melee | 0 (not shown) | 0 | OK |
| Influence | 0 (not shown) | 0 | OK |
| Passive Name | EMERGENCY LIFT | EMERGENCY LIFT | OK |
| Passive Text | Target a Body token that was dropped by a friendly Veteran. Remove the token, the Veteran that dropped it does not need to roll for Major Injury after the game. | Target a Body token that was dropped by a friendly Veteran. Remove the token, the Veteran that dropped it does not need to roll for Major Injury after the game. | OK |
| Action Name | Heavy Pistol | Heavy Pistol | OK |
| Action Keyword tag | Pistol | (not in seed) | NOTE |
| Action Skill | Ranged (crosshair) | Ranged | OK |
| Action Range | Red+Yellow+Green = Green | Green | OK |
| Action Keywords | Deadly Crits | Deadly Crits | OK |

**Action Tokens re-check**: Looking at the PDF image carefully:
- Top token: Yellow pentagon in grey circle
- Bottom token: Yellow pentagon in grey circle
Both tokens appear yellow. Seed says green=1, yellow=1.

**RE-EXAMINATION**: The top token on the Med-Evac Pilot card -- is it truly yellow or is it slightly different? Looking at the image, both tokens appear to be the same yellow/gold color. However, comparing with the Vet1 version where the top token is clearly green (different shade), the base version tokens both look yellow.

**Discrepancies:**
1. **Action Tokens**: PDF shows 2 Yellow tokens. Seed says 1 Green + 1 Yellow. Same issue as Security base.
2. **"Pistol" keyword tag**: The card shows "Pistol" as a weapon keyword next to the action name. This is not stored in the seed action keywords (only "Deadly Crits" is). This may be a weapon-type tag rather than an action keyword per se.

**REVISED STATUS**: ERRORS FOUND

| Issue | Detail |
|-------|--------|
| Action Tokens | PDF shows 2 Yellow tokens. Seed has 1 Green + 1 Yellow. **Seed should be green=0, yellow=2 -- OR the top token is Green and the card rendering is ambiguous.** |
| Weapon keyword "Pistol" | PDF shows "Pistol" as a weapon tag. Not in seed action keywords. May need to be added if weapon type tags are tracked. |

---

## 8. CZ_CharacterCards_TraumaTeam_Med-EvacPilot_Vet1.pdf

### Med-Evac Pilot (Veteran)
**Lineage**: Med-Evac Pilot | **Level**: 1 | **Seed Profile ID**: `profile-med-evac-pilot-1`
**Status**: CORRECT

| Field | PDF Card Value | Seed Value | Match? |
|-------|---------------|------------|--------|
| Name | Med-Evac Pilot | Med-Evac Pilot | OK |
| Level | 1 (star shown) | 1 | OK |
| Cost (EB) | 8 | 8 | OK |
| Action Tokens | 1 Green, 1 Yellow, 0 Red | 1 Green, 1 Yellow, 0 Red | OK |
| Keywords | Trauma Team, Merc | Trauma Team, Merc | OK |
| Armor | 0 (not shown) | 0 | OK |
| Ranged (crosshair) | 1 | 1 | OK |
| Tech (wrench) | 2 | 1 | MISMATCH |
| Medical (cross icon) | 1 | 2 | MISMATCH |
| Reflexes | 0 (not shown) | 0 | OK |
| Melee | 0 (not shown) | 0 | OK |
| Influence | 0 (not shown) | 0 | OK |
| Passive Name | EMERGENCY LIFT | EMERGENCY LIFT | OK |
| Passive Text | Target a Body token that was dropped by a friendly Veteran. Remove the token, the Veteran that dropped it does not need to roll for Major Injury after the game. | Target a Body token that was dropped by a friendly Veteran. Remove the token, the Veteran that dropped it does not need to roll for Major Injury after the game. | OK |
| Action Name | Heavy Pistol | Heavy Pistol | OK |
| Action Keyword tag | Pistol | (not in seed) | NOTE |
| Action Skill | Ranged (crosshair) | Ranged | OK |
| Action Range | Red+Yellow+Green = Green | Green | OK |
| Action Keywords | Deadly Crits | Deadly Crits | OK |

**Skill icon re-check for Vet1**: Looking at the PDF card image:
- Top hex: 1 + crosshair icon (Ranged) = 1
- Middle hex: 2 + wrench-like icon = this needs careful identification. The icon shows a symbol that could be Tech (wrench) or Medical (cross). Looking at the visual: it appears to be a cross/plus with prongs -- this is the **Tech** icon (wrench/gears). Value = 2.
- Bottom hex: 1 + a rounded icon = this appears to be the **Medical** (cross) icon. Value = 1.

Wait -- let me re-examine. The PDF text layer says "1, 2, 1" for the skills. The card shows three skill hexes:
- 1 with crosshair = Ranged 1
- 2 with a complex icon = ?
- 1 with another icon = ?

Looking at the Vet1 card image more carefully:
- Middle icon (value 2): The icon has cross-like prongs pointing outward -- this looks like the **Tech** (wrench/gear) icon
- Bottom icon (value 1): The icon looks like a helmet/dome shape with prongs -- this is the **Medical** icon (or possibly Tech)

Comparing with the base card (document 7):
- Base shows: 1 crosshair (Ranged), 1 wrench (Tech), 1 cross (Medical) -- matching seed (Ranged=1, Tech=1, Medical=1)
- Vet1 shows: 1 crosshair (Ranged), 2 [icon], 1 [icon]

The seed for Vet1 says: Ranged=1, Tech=1, Medical=2. But the PDF shows the "2" value on what appears to be the Tech/wrench icon, and "1" on the Medical icon. If the PDF is correct with Tech=2, Medical=1, then the seed has them swapped.

**Discrepancies:**
1. **Tech vs Medical swap**: PDF appears to show Tech=2, Medical=1. Seed has Tech=1, Medical=2. The values appear swapped between Tech and Medical in the seed.

**REVISED STATUS**: ERRORS FOUND

| Issue | Detail |
|-------|--------|
| Tech skill | PDF shows 2. Seed has 1. **Seed should be 2.** |
| Medical skill | PDF shows 1. Seed has 2. **Seed should be 1.** |
| Note | Tech and Medical values appear swapped in the seed for the Veteran level. |
| Weapon keyword "Pistol" | PDF shows "Pistol" weapon tag. Not in seed action keywords. |

---

## 9. CZ_CharacterCards_TraumaTeam_Paramedic.pdf

### Paramedic (Base)
**Lineage**: Paramedic | **Level**: 0 | **Seed Profile ID**: `profile-paramedic-0`
**Status**: ERRORS FOUND

| Field | PDF Card Value | Seed Value | Match? |
|-------|---------------|------------|--------|
| Name | Paramedic | Paramedic | OK |
| Cost (EB) | 15 | 15 | OK |
| Action Tokens | 1 Yellow, 1 Yellow (2Y) | 1 Green, 1 Yellow, 0 Red | CHECK |
| Keywords | Trauma Team, Merc | Trauma Team, Merc | OK |
| Armor | 0 (not shown) | 0 | OK |
| Reflexes (curved arrow) | 2 | 2 | OK |
| Medical (cross icon) | 1 | 1 | OK |
| Ranged (crosshair) | 1 | 1 | OK |
| Tech | 0 (not shown) | 0 | OK |
| Melee | 0 (not shown) | 0 | OK |
| Influence | 0 (not shown) | 0 | OK |
| Passive Name | MEDIC! | MEDIC! | OK |
| Passive Text | All wounded friendly characters may use an Action Token during their activations to move this model towards the wounded model a distance equal to the Action Token used. | All wounded friendly characters may use an Action Token during their activations to move this model towards the wounded model a distance equal to the Action Token used. | OK |
| Action Name | Med Kit | Med Kit | OK |
| Action Skill | Medical (cross icon) | Medical | OK |
| Action Range | Red+Yellow+Green = Green | Green | OK |
| Action Keywords | Heal 1. On a Crit Heal 2 instead. | Heal 1. On a Crit Heal 2 instead. | OK |

**Action Tokens re-check**: The PDF image shows:
- Top token: Yellow pentagon in grey circle
- Bottom token: Yellow pentagon in grey circle
Both appear yellow. Seed says green=1, yellow=1.

Same ambiguity as Security base and Med-Evac Pilot base. The tokens appear visually yellow in the PDF rendering.

**Discrepancies:**
1. **Action Tokens**: PDF appears to show 2 Yellow tokens. Seed says 1 Green + 1 Yellow. Possible card rendering ambiguity (the Green token may render similarly to Yellow in the PDF).

**NOTE on skill order**: PDF shows skills top-to-bottom as: Reflexes 2, Medical/cross 1, Ranged 1. The seed has Reflexes=2, Medical=1, Ranged=1. **Skills match** despite different display order.

**FINAL STATUS**: NEEDS VERIFICATION

| Issue | Detail |
|-------|--------|
| Action Tokens | PDF appears to show 2 Yellow tokens. Seed has 1 Green + 1 Yellow. Same ambiguity as other base cards. |

---

## 10. CZ_CharacterCards_TraumaTeam_Paramedic_Vet1.pdf

### Paramedic (Veteran)
**Lineage**: Paramedic | **Level**: 1 | **Seed Profile ID**: `profile-paramedic-1`
**Status**: CORRECT

| Field | PDF Card Value | Seed Value | Match? |
|-------|---------------|------------|--------|
| Name | Paramedic | Paramedic | OK |
| Level | 1 (star shown) | 1 | OK |
| Cost (EB) | 15 | 15 | OK |
| Action Tokens | 1 Green, 1 Yellow, 0 Red | 2 Green, 0 Yellow, 0 Red | MISMATCH |
| Keywords | Trauma Team, Merc | Trauma Team, Merc | OK |
| Armor | 0 (not shown) | 0 | OK |
| Reflexes (curved arrow) | 2 | 2 | OK |
| Medical (cross icon) | 2 | 2 | OK |
| Ranged (crosshair) | 1 | 1 | OK |
| Tech | 0 (not shown) | 0 | OK |
| Melee | 0 (not shown) | 0 | OK |
| Influence | 0 (not shown) | 0 | OK |
| Passive Name | MEDIC! | MEDIC! | OK |
| Passive Text | All wounded friendly characters may use an Action Token during their activations to move this model towards the wounded model a distance equal to the Action Token used. | All wounded friendly characters may use an Action Token during their activations to move this model towards the wounded model a distance equal to the Action Token used. | OK |
| Action Name | Med Kit | Med Kit | OK |
| Action Skill | Medical (cross icon) | Medical | OK |
| Action Range | Red+Yellow+Green = Green | Green | OK |
| Action Keywords | Heal 1. On a Crit Heal 2 instead. | Heal 1. On a Crit Heal 2 instead. | OK |

**Action Tokens re-check**: The PDF Vet1 shows:
- Top token: Green hexagonal pentagon (clearly green fill)
- Bottom token: Yellow pentagon
This is 1 Green + 1 Yellow. Seed says 2 Green + 0 Yellow.

**Discrepancies:**
1. **Action Tokens**: PDF shows 1 Green + 1 Yellow. Seed says 2 Green + 0 Yellow. **Seed should be green=1, yellow=1.**

**REVISED STATUS**: ERRORS FOUND

| Issue | Detail |
|-------|--------|
| Action Tokens | PDF shows 1 Green + 1 Yellow. Seed has 2 Green + 0 Yellow. **Seed should be green=1, yellow=1.** |

---

# Summary of All Discrepancies

## Confirmed Errors (Seed Must Be Updated)

| # | Card | Field | PDF Value | Seed Value | Fix |
|---|------|-------|-----------|------------|-----|
| 1 | Cyber-Enhanced Security (Base) | Action Range | Long | Green | Change to "Long" |
| 2 | Cyber-Enhanced Security (Vet1) | Action Range | Long | Green | Change to "Long" |
| 3 | Cyber-Enhanced Security (Vet1) | Influence | 2 | 1 | Change to 2 |
| 4 | Doc Salvage (Base) | Action Tokens | 1G+2Y | 1G+1Y | Change to green=1, yellow=2 |
| 5 | Doc Salvage (Vet1) | Action Tokens | 2G+1Y | 1G+1Y | Change to green=2, yellow=1 |
| 6 | Med-Evac Pilot (Vet1) | Tech | 2 | 1 | Change to 2 |
| 7 | Med-Evac Pilot (Vet1) | Medical | 1 | 2 | Change to 1 |
| 8 | Paramedic (Vet1) | Action Tokens | 1G+1Y | 2G+0Y | Change to green=1, yellow=1 |

## Needs Visual Verification (Ambiguous Yellow vs Green tokens on base cards)

These base-level cards show tokens that could be Yellow or Green depending on PDF rendering:

| # | Card | Field | PDF Appears | Seed Value | Needs Check |
|---|------|-------|-------------|------------|-------------|
| 9 | Security (Base) | Action Tokens | 2Y? | 1G+1Y | Verify physical card |
| 10 | Med-Evac Pilot (Base) | Action Tokens | 2Y? | 1G+1Y | Verify physical card |
| 11 | Paramedic (Base) | Action Tokens | 2Y? | 1G+1Y | Verify physical card |

**Note**: On all Veteran cards where Green tokens ARE present, they are clearly distinguishable from Yellow (green hexagonal fill vs yellow pentagon fill). The base cards listed above show tokens that appear uniformly yellow, suggesting either (a) the PDF rendering of green is ambiguous at this resolution, or (b) the token colors are genuinely different from the seed. Cross-reference with physical cards recommended.

## Notes (Non-Errors)

| Card | Note |
|------|------|
| Med-Evac Pilot (both) | Card shows "Pistol" weapon type tag next to Heavy Pistol. Not tracked in seed action keywords. Consider adding if weapon type tags become a data field. |
| Security (both) | Assault Rifle has dual-mode visual (Rapid 2 at Green range -OR- single shot at Long). Seed correctly stores range as "Long" (max range) with effectDescription "Rapid 2 if not at max range." |
| Doc Salvage (both) | Assault Rifle also has dual-mode visual (Rapid 2 -OR- Melee). Seed stores range "Green" and effectDescription "Rapid 2 -OR- Melee." |
