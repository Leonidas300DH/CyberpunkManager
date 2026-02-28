# Cyberpunk Combat Zone Companion - Audit technique

## Vue d'ensemble

Application companion pour le jeu de figurines **Cyberpunk Red: Combat Zone**.
Permet de creer des equipes, gerer des campagnes, recruter des personnages, equiper des armes/programmes, et jouer des matchs.

- **Stack** : Next.js 16.1.6 + React 19 + TypeScript 5 + Tailwind CSS 4 + Zustand 5 + shadcn/ui
- **Hebergement** : Vercel (deploy manuel via `npx vercel --prod`)
- **Base de donnees** : Supabase (PostgreSQL)
- **GitHub** : `Leonidas300DH/CyberpunkManager` (public, branche `main`)

---

## Connexion Supabase

| Cle | Valeur |
|---|---|
| Project ID | `nknlxlmmliccsfsndnba` |
| URL | `https://nknlxlmmliccsfsndnba.supabase.co` |
| Anon Key (publishable) | `sb_publishable_wvYE8RPLNKruSr9eUAdj2Q_H9jWWLbu` |
| Admin Email | `herbera.daniel@gmail.com` |

Variables d'environnement dans `.env.local` :
```
NEXT_PUBLIC_SUPABASE_URL=https://nknlxlmmliccsfsndnba.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_wvYE8RPLNKruSr9eUAdj2Q_H9jWWLbu
NEXT_PUBLIC_ADMIN_EMAIL=herbera.daniel@gmail.com
```

---

## Architecture des donnees

### Source de verite

Supabase est la **source de verite unique**. Le flux :

1. `useCatalog.ts` fetch 8 tables en parallele au montage de l'app
2. Assemble un objet `CatalogData` et le met dans le store Zustand
3. Si Supabase echoue, fallback sur `src/lib/seed.ts` (import dynamique)
4. `localStorage` ne persiste que les **campagnes, settings, match actif** — jamais le catalogue

### Pipeline seed.ts

Pour regenerer le fichier fallback depuis Supabase :
```bash
cd "/Users/danielherbera/Dropbox/Antigravity/Cyberpunk Combat Zone/combat-zone-companion"
npx tsx scripts/dump-seed.ts && npx tsx scripts/gen-seed.ts
```

- `dump-seed.ts` : fetch toutes les tables → ecrit `/tmp/seed_dump.json`
- `gen-seed.ts` : lit le JSON → genere `src/lib/seed.ts` avec les exports TypeScript

---

## Schema de la base de donnees

### Table `factions`

| Colonne | Type | Nullable | Default | Contrainte |
|---|---|---|---|---|
| `id` | text | NO | - | PRIMARY KEY |
| `name` | text | NO | - | - |
| `description` | text | YES | - | - |
| `image_url` | text | YES | - | - |
| `created_at` | timestamptz | YES | `now()` | - |
| `updated_at` | timestamptz | YES | `now()` | - |

**Factions existantes** : 6th Street, Arasaka, Bozos, Danger Gals, Edge Runners, Gen Red, Lawmen, Maelstrom, Trauma Team, Tyger Claws, Zoners (11 total).

IDs : `faction-6th-street`, `faction-arasaka`, `faction-bozos`, `faction-danger-gals`, `faction-edgerunners`, `faction-gen-red`, `faction-lawmen`, `faction-maelstrom`, `faction-trauma-team`, `faction-tyger-claws`, `faction-zoners`

---

### Table `lineages`

Un lineage = une identite de personnage (ex: "Point Man"). Partage entre tous les tiers (Base, Veteran, Elite).

| Colonne | Type | Nullable | Default | Contrainte |
|---|---|---|---|---|
| `id` | text | NO | - | PRIMARY KEY |
| `name` | text | NO | - | - |
| `type` | text | NO | `'Character'` | Valeurs: `Leader`, `Character`, `Gonk`, `Specialist`, `Drone` |
| `is_merc` | boolean | YES | `false` | Mercenaire (peut etre recrute par n'importe quelle faction) |
| `image_url` | text | YES | - | URL Supabase storage |
| `is_default_image` | boolean | YES | `true` | `true` = utilise l'image de faction par defaut |
| `image_flip_x` | boolean | YES | `false` | Miroir horizontal |
| `created_at` | timestamptz | YES | `now()` | - |
| `updated_at` | timestamptz | YES | `now()` | - |

**Convention ID** : `lineage-{kebab-case-name}` (ex: `lineage-point-man`, `lineage-nox-arya`)

**196 lineages** en base actuellement.

---

### Table `lineage_factions` (junction)

Lie un lineage a une ou plusieurs factions. Cle primaire composite.

| Colonne | Type | Nullable | Contrainte |
|---|---|---|---|
| `lineage_id` | text | NO | PK + FK → `lineages.id` |
| `faction_id` | text | NO | PK + FK → `factions.id` |

---

### Table `profiles`

Un profile = un tier specifique d'un personnage (Base/Vet/Elite). C'est la table la plus importante.

| Colonne | Type | Nullable | Default | Contrainte |
|---|---|---|---|---|
| `id` | text | NO | - | PRIMARY KEY |
| `lineage_id` | text | NO | - | FK → `lineages.id` + UNIQUE(lineage_id, level) |
| `level` | integer | NO | `0` | 0=Base, 1=Veteran, 2=Elite. UNIQUE(lineage_id, level) |
| `cost_eb` | integer | NO | - | Cout en Eurobucks |
| `action_tokens` | jsonb | NO | - | `{"green": N, "yellow": N, "red": N}` |
| `skills` | jsonb | NO | - | `{"Reflexes": N, "Ranged": N, "Melee": N, "Medical": N, "Tech": N, "Influence": N, "None": N}` |
| `armor` | integer | YES | `0` | Valeur d'armure |
| `keywords` | text[] | YES | `'{}'` | Ex: `["Maelstrom", "Leader"]` |
| `actions` | jsonb | YES | `'[]'` | Tableau de `GameAction` (voir schema ci-dessous) |
| `street_cred` | integer | YES | `0` | DOIT etre egal a `level` |
| `passive_rules` | text | YES | - | Format: `"NOM_REGLE: Description."` |
| `gonk_action_color` | text | YES | - | Seulement pour type Gonk: `"Green"`, `"Yellow"` ou `"Red"` |
| `created_at` | timestamptz | YES | `now()` | - |
| `updated_at` | timestamptz | YES | `now()` | - |

**Convention ID** : `profile-{kebab-name}-{level}` (ex: `profile-point-man-0`, `profile-point-man-1`)

**308 profiles** en base actuellement.

#### Schema `action_tokens` (jsonb)

```json
{
  "green": 2,    // Pentagones verts
  "yellow": 1,   // Triangles inverses jaunes
  "red": 0       // Carres rouges (toujours 0 en pratique — aucune carte de base n'a de red)
}
```

#### Schema `skills` (jsonb)

Les 7 cles sont **toujours presentes**. Valeur 0 si la skill n'existe pas.

```json
{
  "Reflexes": 1,
  "Ranged": 2,
  "Melee": 0,
  "Medical": 0,
  "Tech": 0,
  "Influence": 1,
  "None": 0
}
```

#### Schema `actions[]` (jsonb)

Chaque action dans le tableau :

```json
{
  "id": "action-assault-rifle",
  "name": "Assault Rifle",
  "skillReq": "Ranged",       // SkillType
  "range": "Long",            // "Reach" | "Red" | "Yellow" | "Green" | "Long" | "Self"
  "isAttack": true,           // true = attaque, false = support/ability
  "keywords": ["Rapid 2"],
  "effectDescription": "Rapid 2 if not at max range.",
  "weaponId": "weapon-assault-rifle"  // Reference optionnelle vers la table weapons
}
```

---

### Table `weapons`

| Colonne | Type | Nullable | Default | Contrainte |
|---|---|---|---|---|
| `id` | text | NO | - | PRIMARY KEY |
| `name` | text | NO | - | - |
| `source` | text | YES | `'Custom'` | `Custom`, `Manual`, `Upload` |
| `skill_req` | text | YES | - | Skill requise |
| `is_weapon` | boolean | YES | `true` | - |
| `is_gear` | boolean | YES | `false` | - |
| `skill_bonus` | integer | YES | - | Bonus de skill accorde |
| `grants_armor` | integer | YES | - | Armure accordee |
| `grants_netrunner` | boolean | YES | `false` | Donne le keyword Netrunner |
| `faction_variants` | jsonb | YES | `[{"cost":0,"rarity":99,"factionId":"universal","reqStreetCred":0}]` | Variantes par faction |
| `range_red` | boolean | YES | `false` | Portee rouge active |
| `range_yellow` | boolean | YES | `false` | Portee jaune active |
| `range_green` | boolean | YES | `false` | Portee verte active |
| `range_long` | boolean | YES | `false` | Portee longue active |
| `range2_red` | boolean | YES | `false` | 2e mode de tir — rouge |
| `range2_yellow` | boolean | YES | `false` | 2e mode de tir — jaune |
| `range2_green` | boolean | YES | `false` | 2e mode de tir — vert |
| `range2_long` | boolean | YES | `false` | 2e mode de tir — long |
| `keywords` | text[] | YES | `'{}'` | Ex: `["Rapid 2", "Deadly"]` |
| `description` | text | YES | - | Texte descriptif |
| `image_url` | text | YES | - | URL image |
| `created_at` | timestamptz | YES | `now()` | - |
| `updated_at` | timestamptz | YES | `now()` | - |

**268 weapons** en base.

---

### Table `items`

| Colonne | Type | Nullable | Default |
|---|---|---|---|
| `id` | text | NO | - |
| `name` | text | NO | - |
| `category` | text | YES | - |
| `faction_variants` | jsonb | YES | `[{"cost":0,"rarity":99,"factionId":"universal","reqStreetCred":0}]` |
| `keywords` | text[] | YES | `'{}'` |
| `passive_rules` | text | YES | - |
| `granted_actions` | jsonb | YES | `'[]'` |
| `image_url` | text | YES | - |
| `description` | text | YES | - |
| `is_gear` | boolean | YES | `false` |

---

### Table `programs`

| Colonne | Type | Nullable | Default |
|---|---|---|---|
| `id` | text | NO | PK |
| `name` | text | NO | - |
| `faction_id` | text | YES | - |
| `cost_eb` | integer | YES | - |
| `req_street_cred` | integer | YES | `0` |
| `rarity` | integer | YES | - |
| `quality` | text | YES | - |
| `range` | text | YES | - |
| `tech_test` | boolean | YES | `false` |
| `vulnerable` | boolean | YES | `false` |
| `flavor_text` | text | YES | - |
| `loaded_text` | text | YES | - |
| `running_effect` | text | YES | - |
| `reload_condition` | text | YES | - |
| `image_url` | text | YES | - |
| `faction_variants` | jsonb | YES | `[{"cost":0,"rarity":99,"factionId":"universal","reqStreetCred":0}]` |

**63 programs** en base.

---

### Table `app_config`

Configuration globale (key-value store).

| Colonne | Type | Nullable |
|---|---|---|
| `key` | text | NO (PK) |
| `value` | jsonb | NO |
| `updated_at` | timestamptz | YES |

Cle existante : `tier_surcharges` → `{"veteran": 5, "elite": 10}`

---

### Tables historiques (non utilisees)

- `reference_data` : ancien blob JSON unique (remplace par les tables relationnelles)
- `user_data` : donnees utilisateur synchronisees (auth Supabase)

---

## Structure du code

### Pages (src/app/)

| Route | Fichier | Description |
|---|---|---|
| `/` | `page.tsx` | Accueil |
| `/hq` | `hq/page.tsx` | QG : campagnes, roster, stash |
| `/armory` | `armory/page.tsx` | Armurerie (armes/gear) |
| `/database` | `database/page.tsx` | Database : models, factions, items |
| `/match` | `match/page.tsx` | Team builder |
| `/play` | `play/page.tsx` | Match en cours (play view) |

### Composants cles

| Composant | Fichier | Description |
|---|---|---|
| `CharacterCard` | `characters/CharacterCard.tsx` | Carte de personnage avec stats, actions, glitch FX |
| `WeaponCard` | `weapons/WeaponCard.tsx` | Carte d'arme |
| `ProgramCard` | `programs/ProgramCard.tsx` | Carte de programme hacking |
| `ActiveMatchView` | `play/ActiveMatchView.tsx` | Vue de jeu en cours |
| `TeamBuilder` | `match/TeamBuilder.tsx` | Constructeur d'equipe |
| `RosterList` | `campaign/RosterList.tsx` | Liste du roster de campagne |
| `ModelsTab` | `database/ModelsTab.tsx` | Onglet models dans la database |
| `ArmoryContent` | `database/ArmoryContent.tsx` | Contenu de l'armurerie |
| `GlitchCanvas` | `effects/GlitchCanvas.tsx` | Effet glitch visuel |

### Hooks

| Hook | Fichier | Description |
|---|---|---|
| `useCatalog` | `hooks/useCatalog.ts` | Fetch catalogue Supabase + mutations ciblees |
| `useTeamBuilder` | `hooks/useTeamBuilder.ts` | Etat du team builder + validation |
| `useCardGrid` | `hooks/useCardGrid.ts` | Grille responsive pour les cartes |
| `useIsAdmin` | `hooks/useIsAdmin.ts` | Detection admin (email match) |

### Librairies

| Module | Fichier | Description |
|---|---|---|
| `seed.ts` | `lib/seed.ts` | Donnees fallback auto-generees (NE PAS EDITER) |
| `validation.ts` | `lib/validation.ts` | 9 regles de validation d'equipe |
| `math.ts` | `lib/math.ts` | Calculs de street cred, influence, cout |
| `tiers.ts` | `lib/tiers.ts` | Gestion des tiers (surcharges, labels) |
| `variants.ts` | `lib/variants.ts` | Systeme de variantes faction pour armes/items |
| `glossary.ts` | `lib/glossary.ts` | 85 entrees de glossaire avec tooltips |
| `supabase.ts` | `lib/supabase.ts` | Client Supabase |

### Store (Zustand)

`src/store/useStore.ts` — Store persistant via `zustand/persist` dans `localStorage`.

**Persiste** : campaigns, activeMatchTeam, displaySettings, playViewSettings, teamBuilderDrafts
**Ne persiste PAS** : catalog (toujours fetch depuis Supabase au montage)

---

## Regles de coherence des profils

| Champ | Regle |
|---|---|
| `action_tokens` | Pas de red en pratique. G > Y. Vet >= Base. Elite >= Vet. Valeur totale (G*2+Y) ne diminue jamais. |
| `skills` | Chaque valeur Vet >= Base. Elite >= Vet. Nouvelles skills possibles, jamais retirees. |
| `armor` | Vet >= Base. Elite >= Vet. Jamais decroissant. |
| `cost_eb` | Identique entre tous les tiers du meme lineage. |
| `street_cred` | DOIT etre egal a `level` (0=Base, 1=Vet, 2=Elite). |
| `keywords` | Stables ou ajoutees. Jamais retirees entre tiers. |

---

## Tier System

- **Base** (level 0) : personnage de base, street_cred = 0
- **Veteran** (level 1) : ameliore, street_cred = 1, surcharge +5 EB
- **Elite** (level 2) : meilleur tier, street_cred = 2, surcharge +10 EB
- Les Gonks ne peuvent PAS avoir de tiers
- Surcharges configurables via `app_config.tier_surcharges`

---

## Images

### Storage Supabase

Bucket : `app-images`
Base URL : `https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/app-images/`

Sous-dossiers :
- `factions/` — logos de faction (ex: `arasaka.png`)
- `characters/` — portraits de personnages (ex: `01 Point Man.png`)

### Images locales (public/)

- `public/images/characters/` — 136 portraits
- `public/images/factions/` — 11 logos
- `public/images/weapons/` — 72 illustrations d'armes
- `public/images/Skills Icons/` — 6 icones de skills (melee.png, ranged.png, etc.)
- `public/images/Netrunning Programs Illustrations/` — 64 illustrations de programmes

---

## Scripts utiles

| Script | Commande | Description |
|---|---|---|
| Dump + gen seed | `npx tsx scripts/dump-seed.ts && npx tsx scripts/gen-seed.ts` | Regenere seed.ts depuis Supabase |
| Build | `npx next build` | Build production |
| Deploy | `npx vercel --prod` | Deploy sur Vercel |
| Dev | `npm run dev` | Serveur de dev (port 3000) |
