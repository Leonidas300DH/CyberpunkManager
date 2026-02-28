# Migration Architecture — Blob JSONB vers Tables Relationnelles + Auth

**Date** : 2026-02-26
**Projet** : Combat Zone Companion
**Supabase project** : `nknlxlmmliccsfsndnba`

---

## Contexte

L'architecture actuelle stocke l'integalite du catalogue (factions, personnages, armes, programmes, items) dans un unique blob JSONB (`reference_data.data`, key='catalog', ~328 KB). Les donnees utilisateur (campaigns, matches, drafts, preferences) sont dans localStorage uniquement.

### Problemes

- **Blob monolithique** : chaque edit admin reecrit 328 KB. Pas de requetes ciblees, pas de contraintes d'integrite.
- **Pas de persistance user** : changement de navigateur ou clear cache = perte de toutes les campagnes.
- **Pas d'auth** : impossible de distinguer les utilisateurs.
- **Conflits concurrents** : deux admins editent en meme temps, le dernier ecrase tout.

### Quick win realise (2026-02-26)

Avant cette migration, le quick win a ete deploye :
- Suppression du bloc pre-hydration dans `useStore.ts` (257 -> 122 lignes)
- Suppression de `SEED_VERSION` et de la logique de merge seed/localStorage
- Supabase est desormais la source unique. seed.ts n'est qu'un fallback dynamique si Supabase echoue.
- Backups : `backups/2026-02-26-quick-win/` + Supabase key `catalog_backup_2026_02_26`

---

## Principes

1. **Supabase = source de verite** pour le catalogue partage (public en lecture)
2. **Dual mode user** : anonyme = localStorage, authentifie = Supabase
3. **Migration progressive** : l'app fonctionne a chaque etape, pas de big bang
4. **Compatibilite** : l'interface `CatalogData` en TypeScript reste le contrat entre les hooks et les composants

---

## Phase 1 — Schema catalogue (tables relationnelles)

### Tables

```sql
-- Factions
CREATE TABLE factions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Lineages (identite d'un personnage, partagee entre tiers)
CREATE TABLE lineages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'Character',  -- Character | Gonk | Leader | Specialist | Drone
    is_merc BOOLEAN DEFAULT false,
    image_url TEXT,
    is_default_image BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Lineage <-> Faction (many-to-many)
CREATE TABLE lineage_factions (
    lineage_id TEXT REFERENCES lineages(id) ON DELETE CASCADE,
    faction_id TEXT REFERENCES factions(id) ON DELETE CASCADE,
    PRIMARY KEY (lineage_id, faction_id)
);

-- Profiles (fiche de stats d'un personnage a un tier donne)
-- Un lineage a 1 a 3 profiles : base (level 0), veteran (level 1), elite (level 2)
CREATE TABLE profiles (
    id TEXT PRIMARY KEY,
    lineage_id TEXT NOT NULL REFERENCES lineages(id) ON DELETE CASCADE,
    level INTEGER NOT NULL DEFAULT 0,
    cost_eb INTEGER NOT NULL,
    action_tokens JSONB NOT NULL,       -- { "green": 1, "yellow": 2, "red": 0 }
    skills JSONB NOT NULL,              -- { "Reflexes": 0, "Ranged": 2, ... "None": 0 }
    armor INTEGER DEFAULT 0,
    keywords TEXT[] DEFAULT '{}',
    actions JSONB DEFAULT '[]',         -- array of action objects with weaponId references
    street_cred INTEGER DEFAULT 0,
    passive_rules TEXT,
    gonk_action_color TEXT,             -- Green | Yellow | Red (Gonks only)
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (lineage_id, level)
);

-- Weapons
CREATE TABLE weapons (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    skill_req TEXT,
    range TEXT,
    is_attack BOOLEAN DEFAULT true,
    keywords TEXT[] DEFAULT '{}',
    description TEXT,
    image_url TEXT,
    source TEXT DEFAULT 'Custom',       -- Custom | Manual | Upload
    is_gear BOOLEAN DEFAULT false,
    grants_armor INTEGER,
    skill_bonus INTEGER,
    faction_variants JSONB DEFAULT '[{"factionId":"universal","cost":0,"rarity":99,"reqStreetCred":0}]',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Items (gear non-arme)
CREATE TABLE items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    is_gear BOOLEAN DEFAULT false,
    faction_variants JSONB DEFAULT '[{"factionId":"universal","cost":0,"rarity":99,"reqStreetCred":0}]',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Hacking Programs
CREATE TABLE programs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    quality TEXT,
    range TEXT,
    reload_condition TEXT,
    keywords TEXT[] DEFAULT '{}',
    description TEXT,
    image_url TEXT,
    faction_variants JSONB DEFAULT '[{"factionId":"universal","cost":0,"rarity":99,"reqStreetCred":0}]',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Config globale
CREATE TABLE app_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Index

```sql
CREATE INDEX idx_profiles_lineage ON profiles(lineage_id);
CREATE INDEX idx_lineage_factions_faction ON lineage_factions(faction_id);
CREATE INDEX idx_lineage_factions_lineage ON lineage_factions(lineage_id);
```

### RLS (Row Level Security)

```sql
-- Catalogue : lecture publique, ecriture admin uniquement
ALTER TABLE factions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lineages ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE weapons ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

-- Lecture publique
CREATE POLICY "public_read" ON factions FOR SELECT USING (true);
CREATE POLICY "public_read" ON lineages FOR SELECT USING (true);
CREATE POLICY "public_read" ON profiles FOR SELECT USING (true);
CREATE POLICY "public_read" ON weapons FOR SELECT USING (true);
CREATE POLICY "public_read" ON items FOR SELECT USING (true);
CREATE POLICY "public_read" ON programs FOR SELECT USING (true);
CREATE POLICY "public_read" ON app_config FOR SELECT USING (true);

-- Ecriture admin (a definir : role admin ou liste d'emails)
-- CREATE POLICY "admin_write" ON factions FOR ALL USING (auth.jwt() ->> 'email' IN (...));
```

### Livrable

- Migration SQL appliquee via `mcp__claude_ai_Supabase__apply_migration`
- Tables vides creees, prete pour la Phase 2

---

## Phase 2 — Migration des donnees (blob -> tables)

### Script SQL

Extraction des donnees du blob `reference_data.data` existant et insertion dans les nouvelles tables.

```
1. INSERT INTO factions   SELECT ... FROM jsonb_array_elements(data->'factions')
2. INSERT INTO lineages   SELECT ... FROM jsonb_array_elements(data->'lineages')
3. INSERT INTO lineage_factions  (extraction des factionIds arrays)
4. INSERT INTO profiles   SELECT ... FROM jsonb_array_elements(data->'profiles')
5. INSERT INTO weapons    SELECT ... FROM jsonb_array_elements(data->'weapons')
6. INSERT INTO items      SELECT ... FROM jsonb_array_elements(data->'items')
7. INSERT INTO programs   SELECT ... FROM jsonb_array_elements(data->'programs')
8. INSERT INTO app_config VALUES ('tier_surcharges', data->'tierSurcharges')
```

### Verification

```sql
SELECT 'factions' as t, count(*) FROM factions
UNION ALL SELECT 'lineages', count(*) FROM lineages
UNION ALL SELECT 'profiles', count(*) FROM profiles
UNION ALL SELECT 'weapons', count(*) FROM weapons
UNION ALL SELECT 'items', count(*) FROM items
UNION ALL SELECT 'programs', count(*) FROM programs;
```

Comparer avec les counts du blob actuel.

### Livrable

- Donnees migrees dans les tables relationnelles
- Blob `reference_data` conserve comme backup (pas supprime)

---

## Phase 3 — Auth Supabase

### Methode d'authentification

- **Magic link** (email) : simple, pas de mot de passe
- **OAuth Google** : optionnel, pratique pour les joueurs
- Supabase Auth gere les deux nativement

### Implementation

1. Composant `AuthButton` : login / logout dans le header
2. Hook `useAuth()` : expose `user`, `isAuthenticated`, `isAdmin`
3. Middleware cote client : detecte l'etat auth, bascule le mode de stockage

### Admin

Definir la politique admin (exemples) :
- Liste d'emails hardcodee dans `app_config`
- Ou role `admin` dans les user metadata Supabase

### Livrable

- Auth fonctionnelle (login/logout)
- Hook `useAuth()` disponible dans toute l'app
- Le reste de l'app continue de fonctionner identiquement

---

## Phase 4 — Donnees utilisateur dans Supabase

### Tables

```sql
-- Campaigns (HQ)
CREATE TABLE user_campaigns (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    faction_id TEXT REFERENCES factions(id),
    eb_bank INTEGER DEFAULT 150,
    street_cred INTEGER DEFAULT 0,
    influence INTEGER DEFAULT 0,
    hq_roster JSONB DEFAULT '[]',    -- array of RecruitedModel
    hq_stash JSONB DEFAULT '[]',     -- array of stash entries
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Matches en cours
CREATE TABLE user_matches (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    campaign_id TEXT REFERENCES user_campaigns(id) ON DELETE SET NULL,
    selected_ids TEXT[] DEFAULT '{}',
    equipment_map JSONB DEFAULT '{}',
    token_states JSONB,
    dead_model_ids TEXT[] DEFAULT '{}',
    luck JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Team Builder drafts
CREATE TABLE user_team_drafts (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    campaign_id TEXT NOT NULL,
    selected_ids TEXT[] DEFAULT '{}',
    equipment_map JSONB DEFAULT '{}',
    target_eb INTEGER DEFAULT 150,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Preferences utilisateur
CREATE TABLE user_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    card_columns INTEGER DEFAULT 4,
    font_scale INTEGER DEFAULT 100,
    character_view TEXT DEFAULT 'horizontal',
    program_view TEXT DEFAULT 'card',
    weapon_view TEXT DEFAULT 'card',
    hide_kia BOOLEAN DEFAULT false,
    enable_glitch BOOLEAN DEFAULT true,
    enable_code_rain BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

### RLS

```sql
-- Chaque user ne voit/modifie que ses propres donnees
CREATE POLICY "own_data" ON user_campaigns
    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_data" ON user_matches
    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_data" ON user_team_drafts
    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_data" ON user_settings
    FOR ALL USING (auth.uid() = user_id);
```

### Dual mode (anonyme / authentifie)

```typescript
// hooks/useStorage.ts
export function useStorage() {
    const { user } = useAuth();

    if (user) {
        // Mode authentifie : lecture/ecriture Supabase
        return { provider: 'supabase', userId: user.id };
    } else {
        // Mode anonyme : lecture/ecriture localStorage (Zustand persist)
        return { provider: 'local', userId: null };
    }
}
```

Les hooks existants (`useStore` pour campaigns, match, drafts) sont wrapes :
- Anonyme : comportement actuel (Zustand + localStorage)
- Authentifie : read/write Supabase, Zustand comme cache local

### Livrable

- Tables user creees avec RLS
- Hook `useStorage()` dual mode
- Transition transparente : login = sync localStorage -> Supabase, puis Supabase-first

---

## Phase 5 — Hooks catalogue (lecture tables relationnelles)

### Remplacement de useReferenceData

```typescript
// hooks/useCatalog.ts
export function useCatalog() {
    // Fetch en parallele depuis les tables relationnelles
    // Assemble en CatalogData pour compatibilite
    // Cache local (SWR, React Query, ou simple useRef)
}
```

### Mutations admin ciblees

```typescript
// hooks/mutations/useSaveProfile.ts
export function useSaveProfile() {
    return async (profile: ModelProfile) => {
        await supabase.from('profiles').upsert(toDbRow(profile));
        // Invalider le cache local
    };
}

// hooks/mutations/useSaveWeapon.ts
export function useSaveWeapon() {
    return async (weapon: Weapon) => {
        await supabase.from('weapons').upsert(toDbRow(weapon));
    };
}

// Pareil pour factions, lineages, items, programs
```

### Avantages

- Edit un profil = UPDATE 1 ligne (~500 bytes) au lieu de 328 KB
- Requetes ciblees : `SELECT * FROM profiles WHERE lineage_id = ?`
- Pas de conflit concurrent (lignes differentes)

### Livrable

- `useCatalog()` remplace `useReferenceData()`
- Mutations ciblees remplacent `saveCatalog(blob)`
- Les composants React ne changent pas (meme interface `CatalogData`)

---

## Phase 6 — Adaptation des composants admin

### Composants concernes

| Composant | Actuellement | Cible |
|---|---|---|
| `ModelsTab.tsx` | Edit lineage/profile -> saveCatalog(full blob) | useSaveLineage + useSaveProfile |
| `ArmoryContent.tsx` | Edit weapon -> saveCatalog(full blob) | useSaveWeapon |
| `FactionsTab.tsx` | Edit faction -> saveCatalog(full blob) | useSaveFaction |
| `ProgramsTab.tsx` | (si editable) | useSaveProgram |

### Principe

Les composants passent de :
```typescript
// Avant
const updated = { ...catalog, weapons: newWeapons };
setCatalog(updated);
saveCatalog(updated);
```

A :
```typescript
// Apres
await saveWeapon(updatedWeapon);
invalidateCatalog(); // refresh le hook useCatalog
```

### Livrable

- Tous les editeurs admin utilisent des mutations ciblees
- Plus de réécriture du blob complet

---

## Phase 7 — Nettoyage

1. **Supprimer `reference_data` blob** (une fois les tables stabilisees, apres ~1 semaine de fonctionnement)
2. **Reduire `seed.ts`** a un fichier de constantes statiques minimales (noms de factions de base, tier surcharges par defaut) — ou le supprimer entierement
3. **Supprimer `src/lib/variants.ts`** migration logic (dead code depuis le quick win)
4. **Mettre a jour le skill `/integrate-character`** pour utiliser des INSERT directs dans les tables
5. **Supprimer le backup Supabase** `catalog_backup_2026_02_26` une fois la migration validee

---

## Rollback

A chaque phase, rollback possible :

| Phase | Rollback |
|---|---|
| 1 (schema) | DROP TABLE ... |
| 2 (migration) | Blob `reference_data` toujours la |
| 3 (auth) | Retirer AuthButton, pas d'impact sur le reste |
| 4 (user data) | Revenir au mode localStorage-only |
| 5 (hooks catalogue) | Revenir a `useReferenceData` + blob |
| 6 (composants) | Revenir a `saveCatalog(blob)` |
| 7 (nettoyage) | Restore du backup |

---

## Ordre recommande

```
Phase 1 (schema) -> Phase 2 (migration donnees) -> Phase 5 (hooks lecture)
    -> Phase 6 (composants admin) -> Phase 3 (auth) -> Phase 4 (user data)
        -> Phase 7 (nettoyage)
```

Le catalogue partage (phases 1-2-5-6) est independant de l'auth (phases 3-4).
On peut livrer le catalogue relationnel d'abord, puis l'auth et les donnees user ensuite.
