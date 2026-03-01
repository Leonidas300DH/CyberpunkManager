# Maelstrom — Extraction EN ATTENTE DE VALIDATION

**Date** : 2026-03-01
**Source** : Photos IMG_0620 à IMG_0637 (18 images)
**Faction** : `["faction-maelstrom"]`
**Status** : EN ATTENTE DE VALIDATION

**Note** : 9 lineages existent en DB. 8 ont des cartes physiques. 1 nouveau personnage (Intimidator) absent de la DB. Munition Specialist n'a pas de photo.

---

## 1. Warlord (Leader) — DISCREPANCES AVEC DB

**Images** : IMG_0620 (Base), IMG_0621 (Vet), IMG_0622 (Elite)
**Status DB** : Existe (`lineage-warlord`), 3 tiers (Base+Vet+Elite)
**Keywords** : `["Maelstrom", "Leader"]`

| | DB Base | DB Vet | DB Elite | Ext Base | Ext Vet | Ext Elite |
|---|---|---|---|---|---|---|
| Cost EB | 15 | 15 | 15 | 15 | 15 | 15 |
| Tokens | G1 Y2 | G2 Y1 | G3 Y0 | G1 Y2 (?) | G2 Y1 (?) | G3 Y0 |
| Reflexes | 0 | 0 | 0 | 2 (?) | 2 (?) | 2 (?) |
| Ranged | 1 | 2 | 3 | 2 (?) | 2 | 3 |
| Melee | 2 | 3 | 3 | 3 (?) | 3 | 3 |
| Medical | 0 | 0 | 0 | 0 | 0 | 0 |
| Tech | 0 | 0 | 0 | 0 | 0 | 0 |
| Influence | 1 | 2 | 2 | 0 (?) | 0 (?) | 0 (?) |
| Armor | 1 | 2 | 2 | 2 (?) | 2 | 2 |
| Street Cred | 0 | 1 | 2 | 0 (?) | 1 (?) | 2 (?) |

**ATTENTION** :
- Les valeurs extraites du **Base** (Melee 3, Ranged 2, Armor 2) correspondent exactement au **Vet en DB**. Possible confusion de tier, ou vraie mise à jour des cartes.
- L'agent lit "Reflexes" là où la DB a "Influence" — confusion d'icône classique. A vérifier.
- L'agent lisait également "R1" dans les tokens — probablement le bouclier d'armure.
- Elite extrait correspond à la DB Elite (Melee 3, Ranged 3, Armor 2).

**Arme** : SMG (`weapon-smg`) — Ranged
- Range DB : Yellow | Range carte : Red/Yellow/Green (?) — Suppression (keyword carte)
**Passive** : INSPIRING: After this model inflicts a wound in a Brawl, refresh up to one Action Token on all other visible friendly characters.

---

## 2. Hammerlord (Leader) — DISCREPANCES AVEC DB

**Images** : IMG_0634 (Base), IMG_0635 (Vet)
**Status DB** : Existe (`lineage-hammerlord`), 2 tiers (Base+Vet)
**Keywords** : `["Leader"]`

| | DB Base | DB Vet | Ext Base | Ext Vet |
|---|---|---|---|---|
| Cost EB | 15 | 15 | 15 | 15 |
| Tokens | G1 Y2 | G2 Y1 | G1 Y2 (?) | G1 Y2 (?) |
| Reflexes | 0 | 0 | 2 (?) | 2 (?) |
| Ranged | 1 | 2 | 1 | 2 |
| Melee | 2 | 3 | 2 | 3 |
| Medical | 0 | 0 | 0 | 0 |
| Tech | 0 | 0 | 0 | 0 |
| Influence | 1 | 2 | 1 | 2 |
| Armor | 1 | 2 | 2 (?) | 2 |
| Street Cred | 0 | 1 | 0 | 0 (?) |

**ATTENTION** :
- L'agent lit **Reflexes 2** sur les 2 tiers — skill absent de la DB. Si confirmé, c'est un ajout significatif.
- Armor Base : extrait 2, DB 1. A vérifier.
- Tokens Vet : agent lit G1Y2 (même que Base), DB dit G2Y1. A vérifier.
- Agent lit aussi "R1" dans les tokens — probablement Armor.

**Arme** : Sledgehammer (`weapon-sledgehammer`) — Melee, Red — Deadly, Stun 1, Difficult
**Passive** : INSPIRING: After this model inflicts a wound in a Brawl, refresh up to one Action Token on all other visible friendly characters.

---

## 3. Flenser (Character) — DISCREPANCE COST BASE

**Images** : IMG_0629 (Base), IMG_0630 (Vet)
**Status DB** : Existe (`lineage-flenser`), 2 tiers (Base+Vet)
**Keywords** : `["Maelstrom"]`

| | DB Base | DB Vet | Ext Base | Ext Vet |
|---|---|---|---|---|
| Cost EB | 15 | 20 | 20 (?) | 20 |
| Tokens | G1 Y2 | G2 Y1 | G1 Y1 (?) | G2 Y1 |
| Reflexes | 2 | 2 | 2 | 2 |
| Ranged | 0 | 0 | 0 | 0 |
| Melee | 2 | 3 | 2 | 3 |
| Medical | 0 | 0 | 0 | 0 |
| Tech | 0 | 0 | 0 | 0 |
| Influence | 2 | 2 | 2 | 2 |
| Armor | 1 | 1 | 1 | 1 |
| Street Cred | 0 | 1 | 0 | 1 |

**ATTENTION** :
- **Cost Base** : carte lit 20 EB, DB dit 15. Si confirmé, DB à corriger.
- **Tokens Base** : agent lit G1 Y1 (2 tokens), DB dit G1 Y2 (3 tokens). Un Yellow manquant ? Photo difficile.
- Vet correspond parfaitement à la DB.

**Arme** : Wolver (`weapon-wolver`) — Melee, Red — Deadly Crits
**Action 2** : Mind Link — Influence, Range Green — "Activate friendly model."
**Passive** : (aucun)

---

## 4. Ranged Specialist (Character, Specialist) — DISCREPANCE ARMOR

**Images** : IMG_0623 (Base), IMG_0624 (Vet)
**Status DB** : Existe (`lineage-ranged-specialist`), 2 tiers (Base+Vet)
**Keywords** : `["Maelstrom", "Specialist"]`

| | DB Base | DB Vet | Ext Base | Ext Vet |
|---|---|---|---|---|
| Cost EB | 15 | 15 | 15 | 15 |
| Tokens | G0 Y3 | G1 Y2 | G0 Y3 | G1 Y2 |
| Reflexes | 2 | 2 | 2 | 2 |
| Ranged | 2 | 3 | 2 | 3 |
| Melee | 1 | 1 | 1 | 1 |
| Medical | 0 | 0 | 0 | 0 |
| Tech | 0 | 0 | 0 | 0 |
| Influence | 0 | 0 | 0 | 0 |
| Armor | 0 | 0 | 2 (?) | 2 (?) |
| Street Cred | 0 | 1 | 0 (?) | 1 (?) |

**ATTENTION** :
- **Armor** : agent lit 2 sur les 2 tiers, DB dit 0. Discrepance significative — à vérifier sur carte.
- Keywords carte : Cybergear (pas dans keywords DB pour cette lineage)

**Arme** : Assault Rifle (`weapon-assault-rifle-2`) — Ranged, Long — "Rapid 2 against targets in Yellow or Green range."
**Passive** : NEURAL UPLINK (Cybergear): All visible friendly Gonks may move YELLOW.

---

## 5. Berserker (Character) — MINOR

**Images** : IMG_0625 (Base), IMG_0626 (Vet)
**Status DB** : Existe (`lineage-berserker`), 2 tiers (Base+Vet)
**Keywords** : `["Maelstrom"]`

| | DB Base | DB Vet | Ext Base | Ext Vet |
|---|---|---|---|---|
| Cost EB | 8 | 8 | 8 | 8 |
| Tokens | G1 Y2 | G2 Y1 | G1 Y2 | G2 Y1 |
| Reflexes | 2 | 2 | 2 | 2 |
| Ranged | 0 | 0 | 0 | 0 |
| Melee | 2 | 2 | 2 | 2 |
| Medical | 1 | 1 | 1 (?) | 1 |
| Tech | 0 | 0 | 0 | 0 |
| Influence | 0 | 0 | 0 | 0 |
| Armor | 0 | 0 | 1 (?) | 0 |
| Street Cred | 0 | 1 | 0 | 1 |

**ATTENTION** :
- Medical Base : un agent l'a manqué, l'autre le confirme. Probablement OK.
- Armor Base : un agent lit 1, l'autre lit 0 (= DB). Incertain.
- Vet correspond à la DB.

**Arme** : (pas d'arme)
**Passive** : RAGE: If the first action of this model's activation is a melee attack, it gains Accurate.

---

## 6. Crusher (Character) — PAS DE CHANGEMENT

**Images** : IMG_0627 (Base), IMG_0628 (Vet)
**Status DB** : Existe (`lineage-crusher`), 2 tiers — carte = DB.

| | Base (★0) | Veteran (★1) |
|---|---|---|
| Cost EB | 15 | 15 |
| Tokens | G0 Y2 | G0 Y3 |
| Reflexes | 1 | 1 |
| Ranged | 2 | 2 |
| Melee | 2 | 3 |
| Medical | 0 | 0 |
| Tech | 0 | 0 |
| Influence | 0 | 0 |
| Armor | 2 | 3 |
| Street Cred | 0 | 1 |

**Arme** : Cybernetic Weapons (`weapon-cybernetic-weapons`) — Melee, Red — "All of this model's attacks gain Deadly Crits."
**Passive** : BRAWLER: When this model is hit by a successful attack, refresh all of its Action Tokens. This model ignores Unwieldy on Gear.

---

## 7. Ripper (Character) — MINOR

**Images** : IMG_0631 (Base), IMG_0632 (Vet)
**Status DB** : Existe (`lineage-ripper`), 2 tiers
**Keywords** : `["Maelstrom"]`

| | DB Base | DB Vet | Ext Base | Ext Vet |
|---|---|---|---|---|
| Cost EB | 8 | 8 | 8 | 8 |
| Tokens | G0 Y2 | G1 Y1 | G0 Y2 | G1 Y1 |
| Reflexes | 0 | 0 | 0 | 1 (?) |
| Ranged | 1 | 2 | 1 | 2 |
| Melee | 2 | 2 | 2 | 2 |
| Medical | 0 | 0 | 0 | 0 |
| Tech | 0 | 0 | 0 | 0 |
| Influence | 1 | 1 | 1 | 0 (?) |
| Armor | 0 | 0 | 0 | 1 (?) |
| Street Cred | 0 | 1 | 0 | 0 (?) |

**ATTENTION** :
- Base extrait = DB Base ✓
- Vet : agent lit "Reflexes 1" au lieu de "Influence 1" (confusion d'icône), et "Armor 1" (DB 0).
- En cas de doute, la DB est probablement correcte.

**Arme** : Wolver (`weapon-wolver`) — Melee, Red — Deadly Crits
**Passive** : BRAVADO: This model gains +1 to its melee attacks if another friendly model is visible.

---

## 8. Pledge (Gonk) — PAS DE CHANGEMENT

**Image** : IMG_0633
**Status DB** : Existe (`lineage-pledge`), 1 tier — carte = DB.

| | Base (★0) |
|---|---|
| Cost EB | 5 |
| Tokens | Y1 |
| Reflexes | 1 |
| Ranged | 1 |
| Melee | 1 |
| Medical | 0 |
| Tech | 0 |
| Influence | 0 |
| Armor | 0 |
| Street Cred | 0 |

**Arme** : (pas d'arme, Gonk)
**Passive** : (aucun)

---

## 9. Intimidator (Character) — NOUVEAU

**Images** : IMG_0636 (Base), IMG_0637 (Vet)
**Factions** : `["faction-maelstrom"]`
**Keywords** : `["Maelstrom"]`

| | Base (★0) | Veteran (★1) |
|---|---|---|
| Cost EB | 20 | 20 |
| Tokens | G2 Y0 | G2 Y0 |
| Reflexes | 1 | 2 |
| Ranged | 0 | 0 |
| Melee | 2 | 3 |
| Medical | 1 | 1 |
| Tech | 0 | 0 |
| Influence | 0 | 0 |
| Armor | 4 | 4 |
| Street Cred | 0 (?) | 0 (?) |

**ATTENTION** :
- "Medical 1" pourrait être un autre skill — icône à confirmer.
- Armor 4 est très élevé — à vérifier.
- SC lu 0 partout — normalement Vet = 1.
- Pas de passive visible sur la carte.

**Arme** : Iron Throw — A CREER
- Skill : Melee
- Range : Red
- Keywords : `["Push"]`
- Description : `"Push. If this attack crits, move the target YELLOW (instead of RED)."`

**Passive** : (aucun visible)

---

## Sans photo

| Lineage | Type | Tiers en DB | Note |
|---|---|---|---|
| Munition Specialist | Character | 2 (Base+Vet) | Pas de photo |

---

## Resume final

| # | Personnage | Type | Status | Tiers | Arme | Carte = DB ? |
|---|---|---|---|---|---|---|
| 1 | Warlord | Leader | DISCREPANCES | 3 (Base+Vet+Elite) | SMG | **NON** — valeurs Base suspectes |
| 2 | Hammerlord | Leader | DISCREPANCES | 2 (Base+Vet) | Sledgehammer | **NON** — Reflexes extra, Armor diff |
| 3 | Flenser | Character | DISCREPANCE COST | 2 (Base+Vet) | Wolver + Mind Link | **NON** — Cost Base 20 vs 15 |
| 4 | Ranged Specialist | Specialist | DISCREPANCE | 2 (Base+Vet) | Assault Rifle | **NON** — Armor 2 vs 0 |
| 5 | Berserker | Character | MINOR | 2 (Base+Vet) | — (pas d'arme) | ~OUI (Armor Base ?) |
| 6 | Crusher | Character | OK | 2 (Base+Vet) | Cybernetic Weapons | OUI |
| 7 | Ripper | Character | MINOR | 2 (Base+Vet) | Wolver | ~OUI (icon confusion Vet) |
| 8 | Pledge | Gonk | OK | 1 (Base) | — | OUI |
| 9 | Intimidator | Character | NOUVEAU | 2 (Base+Vet) | Iron Throw | NON — A CREER |

### Checklist pre-integration
- [ ] Warlord : valeurs Base à vérifier (correspondent au Vet DB)
- [ ] Warlord : "Reflexes" ou "Influence" ? Vérifier icône
- [ ] Warlord SMG : range R/Y/G ou Yellow seul ?
- [ ] Hammerlord : Reflexes 2 existe-t-il vraiment sur la carte ?
- [ ] Hammerlord : Armor Base (1 ou 2 ?), Tokens Vet (G1Y2 ou G2Y1 ?)
- [ ] Flenser Base : Cost 20 ou 15 ? Tokens G1Y1 ou G1Y2 ?
- [ ] Ranged Specialist : Armor 2 ou 0 ?
- [ ] Berserker Base : Armor 0 ou 1 ?
- [ ] Intimidator : Medical 1 ou autre skill ? Armor 4 confirmé ? SC ?
- [ ] Munition Specialist : pas de photo — à photographier ?
- [ ] **GO pour integration**
