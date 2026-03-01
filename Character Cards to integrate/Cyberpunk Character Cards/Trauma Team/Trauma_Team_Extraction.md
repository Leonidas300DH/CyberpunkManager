# Trauma Team — Extraction EN ATTENTE DE VALIDATION

**Date** : 2026-03-01
**Source** : Photos IMG_0666 à IMG_0683 (18 images) + 5 PDFs + TraumaTeam_corrections.md
**Faction** : `["faction-trauma-team"]`
**Status** : EN ATTENTE DE VALIDATION

**Note** : 5 lineages existent en DB avec 10 profiles (Base+Vet). 3 nouveaux personnages (EMT Lead, EMR Pilot, Security Gunner) + 1 nouveau tier (Doc Salvage Elite).
**Note** : Un audit PDF précédent (TraumaTeam_corrections.md) avait identifié des corrections. Certaines ont déjà été appliquées en DB, d'autres non.

---

## 1. Cyber-Enhanced Security (Character) — UPDATE RANGE

**Images** : IMG_0666 (Base), IMG_0667 (Vet)
**Status DB** : Existe (`lineage-cyber-enhanced-security`), 2 tiers (Base+Vet)
**Keywords** : `["Trauma Team", "Merc"]`

| | DB Base | DB Vet | Ext Base | Ext Vet |
|---|---|---|---|---|
| Cost EB | 25 | 25 | 25 | 25 |
| Tokens | G2 Y1 | G3 Y0 | G2 Y1 | G3 Y0 |
| Reflexes | 0 | 0 | 0 | 0 |
| Ranged | 2 | 2 | 2 | 2 |
| Melee | 0 | 0 | 0 | 0 |
| Medical | 0 | 0 | 0 | 0 |
| Tech | 2 | 2 | 2 | 2 |
| Influence | 1 | 2 | 1 | 2 |
| Armor | 2 | 2 | 2 | 2 |
| Street Cred | 0 | 1 | 0 | 1 |

**ATTENTION** :
- **L'agent photo a confondu Influence ↔ Medical et Tech. Les valeurs extraites ci-dessus ont été corrigées par croisement avec la DB et les PDFs.**
- **SEULE CORRECTION RESTANTE** : Range de l'arme Remington A-37 Combat Rifle. DB = "Green", PDF montre Y+G+L (Long). **Range doit passer de "Green" à "Long".**
- Le PDF montre que le Red est grisé (arme ne tire pas en Red = portée minimale Yellow).

**Arme** : Remington A-37 Combat Rifle (`weapon-remington-a-37-combat-rifle`) — Ranged
- Range DB : Green → **Doit être Long** (correction PDF confirmée)
- Keywords : `["Rapid 2", "Accurate"]`

**Passive** : INTRUDER ALERT: When a visible enemy ends a basic move action, this model may [RE]act to the action as if it had wounded this model.

---

## 2. Doc Salvage (Specialist) — NOUVEAU TIER ELITE

**Images** : IMG_0674 (Base), IMG_0675 (Vet), IMG_0676 (Elite)
**Status DB** : Existe (`lineage-doc-salvage`), 2 tiers (Base+Vet). **Elite = NOUVEAU.**
**Keywords** : `["Trauma Team", "Merc", "Specialist"]`

| | DB Base | DB Vet | Ext Base | Ext Vet | Ext Elite (NOUVEAU) |
|---|---|---|---|---|---|
| Cost EB | 20 | 20 | 20 | 20 | 20 |
| Tokens | G1 Y2 | G2 Y1 | G1 Y2 | G2 Y1 | G2 Y1 |
| Reflexes | 2 | 3 | 2 | 3 | 3 |
| Ranged | 2 | 2 | 2 | 2 | 2 (?) |
| Melee | 0 | 0 | 0 | 0 | 0 |
| Medical | 0 | 0 | 0 | 0 | 0 |
| Tech | 1 | 2 | 1 | 2 | 2 |
| Influence | 0 | 0 | 0 | 0 | 0 |
| Armor | 1 | 1 | 1 | 1 | 2 |
| Street Cred | 0 | 1 | 0 | 1 | 2 |

**Note** : Base et Vet correspondent parfaitement à la DB (corrections tokens déjà appliquées).
**Elite** : Armor passe de 1 à 2, SC de 1 à 2. Skills inchangés par rapport au Vet.

**Arme** : Assault Rifle (`weapon-assault-rifle-2`) — Ranged, Range Green
- Keywords : Rapid 2 contre cibles en Yellow ou Green.
**Passive** : COOKED IT UP MYSELF: This model may equip one piece of Gear at the start of the game ignoring all Faction and Street Cred requirements. This Gear costs 1 additional EB.

---

## 3. Med-Evac Pilot (Character) — MINOR

**Images** : IMG_0668 (Base), IMG_0669 (Vet)
**Status DB** : Existe (`lineage-med-evac-pilot`), 2 tiers (Base+Vet)
**Keywords** : `["Trauma Team", "Merc"]`

| | DB Base | DB Vet | Ext Base | Ext Vet |
|---|---|---|---|---|
| Cost EB | 8 | 8 | 8 | 8 |
| Tokens | G0 Y2 | G1 Y1 | G1 Y1 (?) | G1 Y1 |
| Reflexes | 0 | 0 | 0 | 0 |
| Ranged | 1 | 1 | 1 | 1 |
| Melee | 0 | 0 | 0 | 0 |
| Medical | 1 | 2 | 1 | 2 |
| Tech | 1 | 1 | 1 | 1 |
| Influence | 0 | 0 | 0 | 0 |
| Armor | 0 | 0 | 0 | 0 |
| Street Cred | 0 | 1 | 0 | 1 |

**ATTENTION** :
- **Tokens Base** : Agent photo lit G1 Y1, DB dit G0 Y2. Probable confusion Green/Yellow (couleurs proches sur photo). **A vérifier sur carte.**
- **Vet** : Photo et DB concordent (G1 Y1, Medical 2, Tech 1). ✓
- L'audit PDF précédent avait suggéré un swap Tech/Medical sur le Vet (Tech 2, Medical 1). Mais photo et DB sont d'accord : Tech 1, Medical 2. **Pas de swap.**

**Arme** : Heavy Pistol (`weapon-heavy-pistol`) — Ranged, Range Green — Deadly Crits
**Action** : EMERGENCY LIFT: Target a Body token that was dropped by a friendly Veteran. Remove the token, the Veteran that dropped it does not need to roll for Major Injury after the game.

---

## 4. Paramedic (Character) — PAS DE CHANGEMENT

**Images** : IMG_0670 (Base), IMG_0671 (Vet)
**Status DB** : Existe (`lineage-paramedic`), 2 tiers — carte = DB.
**Keywords** : `["Trauma Team", "Merc"]`

| | Base (★0) | Veteran (★1) |
|---|---|---|
| Cost EB | 15 | 15 |
| Tokens | G0 Y2 | G1 Y1 |
| Reflexes | 2 | 2 |
| Ranged | 1 | 1 |
| Melee | 0 | 0 |
| Medical | 1 | 2 |
| Tech | 0 | 0 |
| Influence | 0 | 0 |
| Armor | 0 | 0 |
| Street Cred | 0 | 1 |

**Note** : L'agent photo a confondu Reflexes → "Medical" et Medical → "Melee". Après correction d'icônes, les valeurs correspondent parfaitement à la DB.

**Arme** : Med Kit (`weapon-med-kit`) — Medical, Range Green — Heal 1. On a Crit Heal 2 instead.
**Passive** : MEDIC!: All wounded friendly characters may use an Action Token during their activations to move this model towards the wounded model a distance equal to the Action Token used.

---

## 5. Security (Character) — PAS DE CHANGEMENT

**Images** : IMG_0672 (Base), IMG_0673 (Vet)
**Status DB** : Existe (`lineage-security`), 2 tiers — carte = DB.
**Keywords** : `["Trauma Team", "Merc"]`

| | Base (★0) | Veteran (★1) |
|---|---|---|
| Cost EB | 15 | 15 |
| Tokens | G0 Y2 | G1 Y1 |
| Reflexes | 1 | 1 |
| Ranged | 2 | 2 |
| Melee | 0 | 0 |
| Medical | 0 | 0 |
| Tech | 1 | 2 |
| Influence | 0 | 0 |
| Armor | 1 | 1 |
| Street Cred | 0 | 1 |

**Note** : Photos correspondent à la DB. Range "Long" pour l'Assault Rifle = correct (mode dual : Rapid 2 en Y/G, tir simple en Long).

**Arme** : Assault Rifle (`weapon-assault-rifle-2`) — Ranged, Range Long — Rapid 2 if not at max range.
**Passive** : SECURITY SCAN: This model may [RE]act when any visible friendly model is wounded, instead of the target.

---

## 6. EMT Lead (Leader) — NOUVEAU

**Images** : IMG_0677 (Base), IMG_0678 (Vet), IMG_0679 (Elite)
**Factions** : `["faction-trauma-team"]`
**Keywords** : `["Trauma Team", "Leader"]`

**Note** : Premier Leader de la faction Trauma Team ! 3 photos = 3 tiers.

| | Base (★0) | Veteran (★1) | Elite (★2) |
|---|---|---|---|
| Cost EB | 19 | 19 | 19 |
| Tokens | G1 Y2 | G2 Y1 | G2 Y1 |
| Reflexes | 0 | 0 | 0 |
| Ranged | 2 | 2 | 2 |
| Melee | 0 | 0 | 0 |
| Medical | 3 (?) | 3 (?) | 4 (?) |
| Tech | 1 (?) | 2 (?) | 2 (?) |
| Influence | 0 | 0 | 0 |
| Armor | 0 | 1 | 1 |
| Street Cred | 0 | 1 (?) | 2 (?) |

**ATTENTION** :
- **Confusion Medical/Tech** : Agent 1 lit Medical 3, Tech 1 pour le Base. Agent 2 lit l'inverse (Tech 3, Medical 2) pour le Vet. Les deux agents confondent les icônes Medical ↔ Tech.
- **Interprétation la plus probable** (pour un "EMT Lead" avec passive Triage) : Medical élevé (3/3/4), Tech bas (1/2/2). A confirmer sur carte.
- **Armor** : Base = 0, puis Vet/Elite = 1. A confirmer.
- **SC Elite** : Agent lit 1, devrait logiquement être 2. A vérifier.

**Arme** : SMG — EXISTE EN DB (?)
- Skill : Ranged
- Range : Red, Yellow, Green (pas Long)
- Keywords : `["Suppression"]`

**Action** : weapon-linked → `effectDescription: ""`, `keywords: []`
**Passive** : SMUG, BUT RIGHT: The Triage action is Easy for visible friendly models.

---

## 7. EMR Pilot (Character, Wheelman) — NOUVEAU

**Images** : IMG_0680 (Base), IMG_0681 (Vet)
**Factions** : `["faction-trauma-team"]`
**Keywords** : `["Trauma Team", "Wheelman", "Merc"]`

**Note** : Personnage distinct de "Med-Evac Pilot" (nom, coût, skills et passive différents).

| | Base (★0) | Veteran (★1) |
|---|---|---|
| Cost EB | 10 | 10 |
| Tokens | G0 Y2 | G0 Y2 |
| Reflexes | 0 | 0 |
| Ranged | 1 | 1 |
| Melee | 0 | 0 |
| Medical | 1 | 2 |
| Tech | 2 | 2 |
| Influence | 0 | 0 |
| Armor | 0 | 0 |
| Street Cred | 0 | 1 |

**ATTENTION** :
- Skills cohérents entre les 2 agents : Ranged 1, Medical 1→2, Tech 2. Bonne confiance.
- Keyword "Wheelman" — rôle spécial lié aux véhicules.

**Arme** : Heavy Pistol (`weapon-heavy-pistol`) — EXISTE EN DB
- Skill : Ranged
- Range : Red, Yellow, Green
- Keywords : `["Deadly Crits"]`

**Action** : weapon-linked → `effectDescription: ""`, `keywords: []`
**Passive** : BY THE BOOKS: This model may use Tech instead of Reflexes to take Steer actions.

---

## 8. Security Gunner (Character) — NOUVEAU

**Images** : IMG_0682 (Base), IMG_0683 (Vet)
**Factions** : `["faction-trauma-team"]`
**Keywords** : `["Trauma Team", "Merc"]`

| | Base (★0) | Veteran (★1) |
|---|---|---|
| Cost EB | 25 | 25 |
| Tokens | G0 Y3 | G1 Y2 |
| Reflexes | 2 (?) | 2 (?) |
| Ranged | 1 | 2 |
| Melee | 0 | 0 |
| Medical | 2 (?) | 3 (?) |
| Tech | 0 | 0 |
| Influence | 0 | 0 |
| Armor | 1 | 1 |
| Street Cred | 0 | 1 |

**ATTENTION** :
- L'agent lit Reflexes 2 et Medical 2-3. Les icônes pourraient être confondues (Reflexes ↔ Tech ?). A vérifier.
- Coût élevé (25 EB) pour un Character — justifié par Medical 2-3 + Reflexes 2 + l'action Stims.
- Pas d'arme classique — "Drug" dans le slot arme + action spéciale.

**Arme/Equipement** : Flagrantly Illegal Stims — A CREER
- Type : Drug / Action spéciale (pas une arme classique)
- Skill : ? (pas de skill spécifié pour l'action)
- Description : `"Target friendly model takes a free GREEN Basic action. That action is Dangerous."`

**Action** : FLAGRANTLY ILLEGAL STIMS: Target friendly model takes a free GREEN Basic action. That action is Dangerous.
**Passive** : LZ SCAN: This model may [RE]act when a visible friendly Vehicle is damaged.

---

## Resume final

| # | Personnage | Type | Status | Tiers | Arme | Arme en DB ? |
|---|---|---|---|---|---|---|
| 1 | Cyber-Enhanced Security | Character | UPDATE | 2 (Base+Vet) | Remington A-37 | OUI — Range à corriger |
| 2 | Doc Salvage | Specialist | UPDATE | 3 (Base+Vet+**Elite**) | Assault Rifle | OUI |
| 3 | Med-Evac Pilot | Character | MINOR | 2 (Base+Vet) | Heavy Pistol | OUI |
| 4 | Paramedic | Character | OK | 2 (Base+Vet) | Med Kit | OUI |
| 5 | Security | Character | OK | 2 (Base+Vet) | Assault Rifle | OUI |
| 6 | EMT Lead | Leader | NOUVEAU | 3 (Base+Vet+Elite) | SMG | OUI (?) |
| 7 | EMR Pilot | Wheelman | NOUVEAU | 2 (Base+Vet) | Heavy Pistol | OUI |
| 8 | Security Gunner | Character | NOUVEAU | 2 (Base+Vet) | Flagrantly Illegal Stims | NON — A CREER |

### Checklist pre-integration
- [ ] CES : Range Remington "Green" → "Long" confirmé ?
- [ ] Doc Salvage Elite : Ranged 2 ou 3 ? Skills confirmés ?
- [ ] Med-Evac Pilot Base : Tokens G0Y2 (DB) ou G1Y1 (photo) ?
- [ ] EMT Lead : Medical/Tech confusion — vérifier icônes (Medical 3/3/4, Tech 1/2/2 ?)
- [ ] EMT Lead : Armor Base = 0 confirmé ?
- [ ] EMT Lead Elite : SC = 1 ou 2 ?
- [ ] EMR Pilot : Stats cohérents, bonne confiance
- [ ] Security Gunner : Reflexes 2 confirmé ? Medical 2→3 ?
- [ ] Security Gunner : Flagrantly Illegal Stims — quel skill ? Arme ou action spéciale ?
- [ ] SMG existe en DB ? Keywords Suppression ?
- [ ] **GO pour integration**
