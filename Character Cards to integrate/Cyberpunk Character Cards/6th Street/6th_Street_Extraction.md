# 6th Street — Extraction VALIDEE

**Date** : 2026-03-01
**Source** : Photos IMG_0565 à IMG_0577
**Factions** : `["faction-6th-street", "faction-zoners", "faction-lawmen"]` (confirmé)
**Status** : PRET POUR INTEGRATION

---

## 1. Watch Captain (Leader) — UPDATE EXISTANT

**Status DB** : Existe (`lineage-watch-captain`), actuellement Zoners uniquement, 2 tiers (Base+Vet)
**Action requise** : Remplacer stats existantes par celles-ci, ajouter factions 6th-street + lawmen, ajouter tier Elite

| | Base (★0) | Veteran (★1) | Elite (★2) |
|---|---|---|---|
| Cost EB | 20 | 20 | 20 |
| Tokens | G2 Y1 | G2 Y1 | G3 Y0 |
| Reflexes | 0 | 0 | 0 |
| Ranged | 2 | 3 | 3 |
| Melee | 0 | 0 | 0 |
| Medical | 2 | 2 | 2 |
| Tech | 0 | 0 | 0 |
| Influence | 2 | 3 | 3 |
| Armor | 1 | 1 | 1 |
| Street Cred | 0 | 1 | 2 |

**Arme** : Remington Gyro-Sniper Rifle (`weapon-remington-gyro-sniper-rifle`)
**Action** : weapon-linked → `effectDescription: ""`, `keywords: []`
**Passive** : HOOD WATCH: When a visible rival takes out a friendly model, this model may make a free Ranged attack against the rival.

---

## 2. Street Ranger (Character, Specialist) — NOUVEAU

| | Base (★0) | Veteran (★1) |
|---|---|---|
| Cost EB | 20 | 20 |
| Tokens | Y3 | Y3 |
| Reflexes | 2 | 2 |
| Ranged | 2 | 3 |
| Melee | 0 | 0 |
| Medical | 2 | 3 |
| Tech | 0 | 0 |
| Influence | 0 | 0 |
| Armor | 2 | 2 |
| Street Cred | 0 | 1 |

**Keywords** : `["Specialist"]`
**Arme** : Assault Rifle (`weapon-assault-rifle-2`)
**Action** : weapon-linked → `effectDescription: ""`, `keywords: []`
**Passive** : CAREFUL AIM: When shooting into a brawl, this model attacks normally (it does not risk hitting other brawling targets).

---

## 3. Militia Operator (Character) — NOUVEAU

| | Base (★0) | Veteran (★1) |
|---|---|---|
| Cost EB | 17 | 17 |
| Tokens | Y3 | Y3 |
| Reflexes | 2 | 2 |
| Ranged | 2 | 3 |
| Melee | 0 | 0 |
| Medical | 1 | 2 |
| Tech | 0 | 0 |
| Influence | 0 | 0 |
| Armor | 2 | 2 |
| Street Cred | 0 | 1 |

**Arme** : Tech Rifle (`weapon-tech-rifle`) — A CREER
- Skill : Ranged
- Range : Yellow, Green, Long (PAS Red)
- Keywords : `["Accurate"]`
- Description : `"Accurate"`

**Action** : weapon-linked → `effectDescription: ""`, `keywords: []`
**Passive** : REPEL: This model does not suffer damage from falling.

---

## 4. Wingman (Character) — NOUVEAU

| | Base (★0) | Veteran (★1) |
|---|---|---|
| Cost EB | 11 | 11 |
| Tokens | G1 Y1 | G1 Y1 |
| Reflexes | 0 | 0 |
| Ranged | 2 | 3 |
| Melee | 2 | 2 |
| Medical | 0 | 0 |
| Tech | 1 | 2 |
| Influence | 0 | 0 |
| Armor | 2 | 2 |
| Street Cred | 0 | 1 |

**Arme** : Shotgun (`weapon-shotgun`)
**Action** : weapon-linked → `effectDescription: ""`, `keywords: []`
**Passive** : BUDDY SYSTEM: When a friendly model within RED suffers a wound, this model may move RED for free.

---

## 5. Trapper (Character) — NOUVEAU

| | Base (★0) | Veteran (★1) |
|---|---|---|
| Cost EB | 15 | 15 |
| Tokens | G1 Y1 | G1 Y1 |
| Reflexes | 2 | 3 |
| Ranged | 1 | 2 |
| Melee | 0 | 0 |
| Medical | 0 | 0 |
| Tech | 2 | 2 |
| Influence | 0 | 0 |
| Armor | 0 | 0 |
| Street Cred | 0 | 1 |

**Arme** : Heavy Pistol (`weapon-heavy-pistol`)
**Action** : weapon-linked → `effectDescription: ""`, `keywords: []`
**Passive** : STREET SNARES: Rival's basic Move actions that start within RED of this model lose Easy and gain Dangerous.

---

## 6. Demolisher (Character) — NOUVEAU

| | Base (★0) | Veteran (★1) |
|---|---|---|
| Cost EB | 15 | 15 |
| Tokens | G1 Y1 | G1 Y1 |
| Reflexes | 1 | 1 |
| Ranged | 0 | 0 |
| Melee | 2 | 3 |
| Medical | 0 | 0 |
| Tech | 1 | 2 |
| Influence | 0 | 0 |
| Armor | 2 | 2 |
| Street Cred | 0 | 1 |

**Arme** : Battering Ram (`weapon-battering-ram`)
**Action** : weapon-linked → `effectDescription: ""`, `keywords: []`
**Passive** : BREACHER: This model gains +2 on Attack rolls opposed by the Obstacle die.

---

## Resume final

| # | Personnage | Type | Status | Tiers | Arme | Arme en DB ? |
|---|---|---|---|---|---|---|
| 1 | Watch Captain | Leader | UPDATE | 3 (Base+Vet+Elite) | Remington Gyro-Sniper Rifle | OUI |
| 2 | Street Ranger | Character (Specialist) | NOUVEAU | 2 (Base+Vet) | Assault Rifle | OUI |
| 3 | Militia Operator | Character | NOUVEAU | 2 (Base+Vet) | Tech Rifle | NON — A CREER |
| 4 | Wingman | Character | NOUVEAU | 2 (Base+Vet) | Shotgun | OUI |
| 5 | Trapper | Character | NOUVEAU | 2 (Base+Vet) | Heavy Pistol | OUI |
| 6 | Demolisher | Character | NOUVEAU | 2 (Base+Vet) | Battering Ram | OUI |

### Checklist pre-integration
- [x] Stats validees par Daniel
- [x] Passifs extraits des cartes
- [x] Factions confirmees : 6th-street + zoners + lawmen
- [x] Watch Captain = remplacement des stats existantes
- [x] Tech Rifle : Ranged, portee YGL (pas Red), "Accurate"
- [x] Demolisher skills : Melee 2/3, Reflexes 1/1, Tech 1/2, Armor 2
- [ ] **GO pour integration**
