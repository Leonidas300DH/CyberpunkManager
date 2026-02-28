# Règles d'import Gear/Weapons

## Mapping factions
- "Universal" → `universal`
- "Arasaka" → `faction-arasaka`
- "Bozos" → `faction-bozos`
- "Danger Gals" → `faction-danger-gals`
- "Edgerunners" → `faction-edgerunners`
- "Generation Red" → `faction-gen-red`
- "Lawmen" → `faction-lawmen`
- "Maelstrom" → `faction-maelstrom`
- "Trauma Team" → `faction-trauma-team`
- "Tyger Claws" → `faction-tyger-claws`
- "Zoners" → `faction-zoners`
- **"Badgerrunners" → `faction-edgerunners`** (erreur dans l'export source)

## Armes existantes (même nom)
- Si un gear/arme importé a exactement le même nom qu'un weapon existant dans le seed → utiliser la même `imageUrl`
- Remplacer les factionVariants existantes (les placeholders cost=0/rarity=99/SC=0 du seed) par les vraies valeurs de l'import

## Nouveaux gears/armes
- `source: 'Custom'`
- `imageUrl`: `/images/weapons/default.png` (pas d'illustration par défaut)

## skillReq
- Pas de champ `skillReq` dans les fichiers d'import → déduire :
  - `rangeRed: true` uniquement (pas yellow/green/long) + nom évoquant une arme de mêlée → `'Melee'`
  - `rangeYellow: true` ou `rangeGreen: true` ou `rangeLong: true` → `'Ranged'`
  - `isWeapon: false` (gear only, pas d'arme) → `undefined` (pas de skillReq)
- **Exceptions confirmées par l'utilisateur** :
  - Drugs médicales (Blue Glass, Arasaka Nauseator) → `'Medical'`
  - Gear tech (Blackmail Files, Basic Techtools) → `'Tech'`
  - Bio-Toxin (Cybergear, modifie les attaques mêlée) → `'Melee'` (c'est bien une arme mêlée malgré des ranges false dans l'export)
- En cas de doute → demander à l'utilisateur

## grantsArmor
- Certains gears donnent de l'armure : `grantsArmor: number` sur le type Weapon
- Exemples : Bodyweight Suit (+1), Biomonitor (+1)
- Affiche un shield + valeur sur les cartes (WeaponTile, ArmoryContent)

## Noms ALL CAPS
- Les fichiers d'export utilisent parfois des noms ALL CAPS (ex: "BLACK LACE")
- Normaliser en title case (ex: "Black Lace") pour cohérence avec le seed

## Fusion par nom
- Les entrées avec le même `name` mais des `faction` différentes → fusionner en UN seul weapon avec plusieurs `factionVariants`
- Les autres champs (description, keywords, ranges, isWeapon, isGear) sont pris du premier entry rencontré (normalement identiques entre factions)

## Doublons entre fichiers
- Les fichiers d'export peuvent contenir des doublons entre eux
- Vérifier si l'entrée existe déjà dans le seed avant d'importer → skip si identique

## ID des weapons
- Format : `weapon-{slug}` où slug = nom en kebab-case lowercase
- Ex : "API Rounds" → `weapon-api-rounds`
