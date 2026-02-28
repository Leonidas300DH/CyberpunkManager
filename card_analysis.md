# Methode d'extraction des cartes de personnages (PDF → donnees)

## Documents de reference

Deux images de reference se trouvent dans `Character Cards to integrate/` :

- **`skills icons.png`** — Planche officielle des 6 icones de skills avec descriptions
- **`character cards.png`** — Schema annote d'une carte de personnage (layout complet)

**Consulter ces deux images AVANT de commencer l'extraction.** Elles constituent la reference absolue pour identifier les icones.

---

## Anatomie d'une carte (page 2 du PDF)

Page 1 = dos de carte (logo de faction). **Toujours ignorer la page 1.**

### Layout de la page 2

```
+--------------------------------------------------+
|  NOM DU PERSONNAGE                    ★★ (cred)  |
|  FACTION, KEYWORDS                   COST EB     |
|                                                    |
|  [TOKEN]     +--ILLUSTRATION--+     [SKILL] val   |
|  [TOKEN]     |                |     [SKILL] val   |
|  [TOKEN]     |                |     [SKILL] val   |
|              +----------------+                    |
|  [ARMOR]                                          |
|                                                    |
|  NOM DE LA REGLE SPECIALE                         |
|  [SKILL ICON]  [R][Y][G][L]                       |
|  Description de l'action/regle...                  |
|                                                    |
|  ================================================  |
|  NOM DE L'ARME                          [GEAR]    |
|  [SKILL ICON]  [R][Y][G][L]                       |
|  Keywords de l'arme                                |
+--------------------------------------------------+
```

---

## Zone 1 — Action Tokens (haut gauche)

Les tokens sont empiles **verticalement** dans la colonne gauche, au-dessus de l'illustration.

### Formes

| Forme | Couleur | Code | Description visuelle |
|---|---|---|---|
| Pentagone | Vert | **G** | Forme a 5 cotes avec un cercle blanc au centre, couleur vert vif |
| Triangle inverse | Jaune | **Y** | Triangle pointe en bas, couleur jaune/or avec cercle blanc au centre |
| Carre | Rouge | **R** | Carre rouge — **N'EXISTE PAS sur les cartes de base imprimees** |

### Regles de comptage

1. Compter **chaque forme separement** de haut en bas dans la colonne
2. Les pentagones verts ont 5 cotes avec un bord arrondi
3. Les triangles jaunes pointent vers le bas et sont plus petits
4. **Il n'y a JAMAIS de carre rouge sur les cartes imprimees.** Si vous pensez en voir un, c'est un element decoratif ou l'icone d'armure (bouclier)
5. L'icone d'armure (bouclier violet/rouge avec un chiffre) est en dessous des tokens — ne PAS la confondre avec un token

### Erreurs frequentes

- Confondre un pentagone vert et un triangle jaune (comparer les formes, pas les couleurs)
- Compter l'icone d'armure comme un token rouge
- Mal compter quand les tokens sont serres (zoomer sur chaque forme)

---

## Zone 2 — Skills (droite)

Les skills sont dans des **hexagones colores** (violets/magenta) empiles verticalement sur le cote droit de la carte. Chaque hexagone contient :
- Un **chiffre** (le score de la skill)
- Une **icone** (identifie le type de skill)

### Les 6 icones de skills

Consulter `Character Cards to integrate/skills icons.png` pour la reference visuelle exacte.

| Icone | Skill | Description visuelle precise |
|---|---|---|
| Eclair / zigzag angulaire | **Reflexes** | Forme de foudre a 3 segments, angles aigus. Ressemble a un Z etire verticalement. |
| Viseur / cible | **Ranged** | Cercle avec 4 lignes de visee (croix) et un point central. Clairement symetrique. |
| Poing / toile | **Melee** | Poing serre avec des lignes d'impact rayonnantes. Sur les cartes Maelstrom, peut ressembler a une toile d'araignee. |
| ECG / battement | **Medical** | Ligne de moniteur cardiaque (plat → pic → plat). Ressemble a un signal de coeur. |
| Prise USB / engrenage | **Tech** | Connecteur/prise avec des broches. Forme de U avec des extensions laterales. |
| Point d'exclamation dans bulle | **Influence** | Point d'exclamation (!) dans un bouclier ou bulle de dialogue. Forme arrondie. |

### Regles de lecture des skills

1. Lire **chaque hexagone de haut en bas** sur le cote droit
2. Identifier l'icone d'abord, puis lire le chiffre
3. Les skills absentes (pas d'hexagone) = score 0
4. La plupart des cartes ont **3 skills**, rarement 4, parfois 2
5. Les hexagones **sombres/vides** sans chiffre sont des **wound slots** (cases de blessure), PAS des skills

### Erreurs frequentes

- Confondre l'icone Reflexes (eclair) avec Melee (poing) — regarder la forme geometrique
- Confondre Tech (prise USB) avec Influence (bulle) — Tech a des extensions laterales droites, Influence a une forme arrondie
- Sur les cartes Maelstrom, l'icone Melee ressemble a une toile d'araignee stylistique — c'est bien Melee
- Compter des wound slots (hexagones sombres vides) comme des skills avec score 0

---

## Zone 3 — Armure (gauche, sous les tokens)

L'armure est representee par un **bouclier violet/rouge** avec un chiffre a l'interieur. Il est positionne dans la colonne gauche, **en dessous** des action tokens.

| Situation | Valeur |
|---|---|
| Bouclier visible avec un chiffre | Armure = ce chiffre (1, 2, 3...) |
| Pas de bouclier visible | Armure = 0 |
| Hexagone sombre sans chiffre | = Wound slot, PAS de l'armure. Armure = 0 |

### Erreur critique

Les **wound slots** (hexagones sombres vides en colonne) ressemblent superficiellement a de l'armure. La difference :
- **Armure** : bouclier avec une couleur vive (violet/rouge) ET un chiffre visible
- **Wound slot** : hexagone sombre, opaque, sans chiffre lisible

---

## Zone 4 — Regle speciale / Action (milieu)

La section centrale peut contenir :

### Passive (pas d'icone de skill)
Un texte en gras (nom de la regle) suivi d'une description. Ce n'est PAS une action — c'est un effet permanent.

Exemple : **INSPIRING** — "After this model inflicts a wound in a Brawl, refresh up to one Action Token on all other visible friendly characters."

### Action (avec icone de skill et chevrons de portee)

Une capacite speciale qui necessite un action token. Identifiable par :
1. Un **nom en gras** (ex: VIDIOT REVOLUTION)
2. Une **icone de skill** (dans un hexagone) a gauche — indique quelle skill est utilisee
3. Des **chevrons de portee** (barres colorees R/Y/G/L) — indiquent la portee
4. Un **texte descriptif** de l'effet

---

## Zone 5 — Arme / Gear (bas)

La barre du bas contient l'equipement du personnage :

1. **Nom de l'arme** en gras dans une barre metallique
2. **Icone de gear** (engrenage) a droite si c'est du gear
3. **Icone de skill** (dans un hexagone) — skill requise pour l'attaque
4. **Chevrons de portee** — barres colorees indiquant la portee
5. **Keywords** de l'arme (ex: "Deadly, Stun 1, Difficult")

---

## Zone 6 — Autres champs (haut)

| Champ | Position | Extraction |
|---|---|---|
| **Nom** | Centre, haut, gros texte | Texte exact |
| **Keywords** | Sous le nom, petites lettres | Ex: "MAELSTROM, LEADER" → `["Maelstrom", "Leader"]` |
| **Street Cred** | Etoiles blanches a droite du nom | 0 = aucune, 1 = une etoile, 2 = deux etoiles |
| **Cost EB** | Coin superieur droit, chiffre + "EB" | Nombre (ex: 15, 20, 25) |

---

## Chevrons de portee (Range)

Les chevrons sont des barres colorees horizontales :

```
[ROUGE] [JAUNE] [VERT] [LONG/+]
```

- **Barre active** : couleur vive (rouge, jaune, vert) ou bleue pour Long
- **Barre inactive** : gris/eteinte

### Mapping portee → valeur `range`

| Barres actives | Valeur range |
|---|---|
| Rouge seul | `Red` |
| Rouge + Jaune | `Yellow` |
| Rouge + Jaune + Vert | `Green` |
| Jaune + Vert | `Green` |
| Jaune + Vert + Long | `Long` |
| Rouge + Jaune + Vert + Long | `Long` |
| Toute combinaison incluant Long | `Long` |
| Arme de melee, pas de barres | `Red` |

La valeur `range` dans le schema = la portee **maximale** active.

---

## Schema de sortie exact

### Lineage (1 par personnage)

```json
{
  "id": "lineage-{kebab-case-name}",
  "name": "Nom Affiche",
  "factionIds": ["faction-{id}"],
  "type": "Character",
  "isMerc": false,
  "imageUrl": "https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/app-images/factions/{faction}.png",
  "isDefaultImage": true
}
```

- `type` : `"Leader"` si "LEADER" dans les keywords, `"Gonk"` si "GONK", sinon `"Character"`
- `isMerc` : `true` si "MERC" dans les keywords
- `id` : tout en minuscules, kebab-case (ex: "CRaB Lord" → `lineage-crab-lord`)

### Profile (1 par tier)

```json
{
  "id": "profile-{kebab-name}-{level}",
  "lineageId": "lineage-{kebab-name}",
  "level": 0,
  "costEB": 15,
  "actionTokens": {
    "green": 1,
    "yellow": 2,
    "red": 0
  },
  "skills": {
    "Reflexes": 0,
    "Ranged": 2,
    "Melee": 0,
    "Medical": 0,
    "Tech": 0,
    "Influence": 1,
    "None": 0
  },
  "armor": 0,
  "keywords": ["Maelstrom", "Leader"],
  "actions": [
    {
      "id": "action-{action-slug}",
      "name": "Nom de l'Action",
      "skillReq": "Influence",
      "range": "Green",
      "isAttack": false,
      "keywords": [],
      "effectDescription": "Target friendly model takes a GREEN action for free.",
      "weaponId": "weapon-{weapon-slug}"
    }
  ],
  "streetCred": 0,
  "passiveRules": "NOM_REGLE: Description complete de la regle.",
  "gonkActionColor": null
}
```

### Regles imperatives du schema

| Champ | Regle |
|---|---|
| `actionTokens.red` | Toujours `0`. Aucune carte imprimee n'a de tokens rouges. |
| `skills` | Les **7 cles** sont TOUJOURS presentes. Valeur `0` si la skill n'est pas sur la carte. |
| `streetCred` | DOIT etre egal a `level` (0, 1, ou 2). |
| `costEB` | IDENTIQUE entre tous les tiers du meme personnage. |
| `armor` | Entier >= 0. `0` si pas de bouclier visible. |
| `keywords` | Tableau de strings. Chaque keyword en Title Case (ex: `"Maelstrom"`, pas `"MAELSTROM"`). |
| `passiveRules` | Format `"NOM: Description."`. Plusieurs regles separees par `\n`. Chaine vide `""` si aucune. |
| `actions` | Tableau. Vide `[]` pour les Gonks. Contient les actions speciales ET les armes. |
| `gonkActionColor` | Seulement si `type === "Gonk"`. Valeurs: `"Green"`, `"Yellow"`, `"Red"`. |
| `actions[].isAttack` | `true` pour les armes/attaques, `false` pour les capacites de support. |
| `actions[].weaponId` | Reference vers un `weapon.id` existant si l'action correspond a une arme connue. |

### Regles de progression entre tiers

Quand un personnage a plusieurs tiers (Base → Vet → Elite), verifier :

| Champ | Contrainte |
|---|---|
| `actionTokens` | Valeur totale (G*2 + Y) ne diminue JAMAIS. Typiquement un Y devient G, ou un token est ajoute. |
| `skills` | Chaque valeur Vet >= Base. Elite >= Vet. Nouvelles skills possibles, jamais retirees. |
| `armor` | Vet >= Base. Elite >= Vet. |
| `costEB` | Identique entre tiers. |
| `keywords` | Stables ou ajoutees. Jamais retirees. |
| `actions` | Stables ou ameliorees. Jamais degradees. |

**Si les donnees extraites violent ces regles, re-lire le PDF** — l'extraction est probablement fausse.

---

## Procedure d'extraction

### Etape 1 — Lire le PDF (page 2)

Utiliser le Read tool sur le fichier PDF. Ne regarder QUE la page 2.

### Etape 2 — Extraire dans l'ordre

1. **Nom** et **Keywords** (haut centre)
2. **Cost EB** (haut droite)
3. **Street Cred** (etoiles a droite du nom)
4. **Action Tokens** (haut gauche) — compter G et Y separement
5. **Skills** (droite) — identifier chaque icone, lire le score
6. **Armor** (gauche, sous les tokens) — bouclier avec chiffre ou 0
7. **Regle speciale** (milieu) — passive ou action
8. **Arme** (bas) — nom, skill, portee, keywords

### Etape 3 — Valider

- Verifier la coherence inter-tiers si plusieurs PDFs
- S'assurer que `streetCred == level`
- S'assurer que `costEB` est identique entre tiers
- S'assurer qu'aucun `actionTokens.red > 0`

### Etape 4 — Construire le JSON

Suivre exactement le schema ci-dessus. Toutes les 7 cles de skills presentes. Le `red` dans actionTokens a 0.

---

## Notes sur les apostrophes

Dans les JSON destines a des INSERT SQL Supabase, utiliser `\u0027` pour les apostrophes dans le texte. Exemple :
- Correct : `"This model\\u0027s attacks gain Deadly."`
- Incorrect : `"This model''s attacks gain Deadly."` (double quote SQL — invalide en JSON)
- Incorrect : `"This model's attacks gain Deadly."` (apostrophe brute — casse le SQL)
