# Plan de verification des profils — v1

## Contexte

308 profils en base (Supabase relational tables, projet `nknlxlmmliccsfsndnba`).
Import de masse par agents (Opus waves 1-9, Sonnet waves 10-11) a introduit des erreurs systematiques :
- Tokens rouges fantomes (R n'existe pas)
- Skills mal identifiees (icons confondus)
- Green/Yellow inverses
- Armor hallucinee

## Regles de coherence (validees par l'utilisateur)

| Champ | Regle |
|---|---|
| Tokens | Pas de rouge. G (pentagone) > Y (triangle). Vet >= Base. Elite >= Vet. |
| Skills | Chaque score Vet >= Base. Elite >= Vet. Nouvelles skills possibles, jamais retirees. |
| Armor | Vet >= Base. Elite >= Vet. Jamais decroissant. |
| Cost EB | Identique entre tiers. |
| Street Cred | = level (0/1/2). |
| Keywords | Stables ou ajoutees. Jamais retirees. |

## Scope

- **Inclus** : Tous les profils qui ont un PDF dans les Archives (8 factions)
- **Exclus** : Tyger Claws et Zoners (verification manuelle ou vague 3)
- **Factions couvertes** : Arasaka, Bozos, Danger Gals, Edge Runners, Gen Red, Lawmen, Maelstrom, Trauma Team

## Focus de verification PDF

Pour chaque carte relue, extraire UNIQUEMENT :
1. **Action tokens** : type (G pentagon / Y triangle) + nombre exact
2. **Skills** : type (Reflexes/Ranged/Melee/Medical/Tech/Influence) + nombre de skills + score de chaque
3. **Armor** : presence de l'icone bouclier + valeur

Ne PAS re-verifier : nom, faction, type, keywords, weapons, passives, cost (consideres corrects).

---

## VAGUE 1 — Detection par coherence + correction ciblee

### Etape 1.1 — Requete de coherence

Executer les requetes SQL suivantes sur Supabase pour detecter les profils incoherents :

```sql
-- 1. Profils avec tokens rouges (erreur certaine)
SELECT p.id, l.name, p.level, p.action_tokens
FROM profiles p JOIN lineages l ON l.id = p.lineage_id
WHERE (p.action_tokens->>'red')::int > 0;

-- 2. Profils Vet/Elite ou un skill a baisse par rapport au tier inferieur
SELECT cur.id, l.name, cur.level,
  cur.skills AS cur_skills, prev.skills AS prev_skills
FROM profiles cur
JOIN profiles prev ON prev.lineage_id = cur.lineage_id AND prev.level = cur.level - 1
JOIN lineages l ON l.id = cur.lineage_id
WHERE (
  (cur.skills->>'Reflexes')::int < (prev.skills->>'Reflexes')::int OR
  (cur.skills->>'Ranged')::int < (prev.skills->>'Ranged')::int OR
  (cur.skills->>'Melee')::int < (prev.skills->>'Melee')::int OR
  (cur.skills->>'Medical')::int < (prev.skills->>'Medical')::int OR
  (cur.skills->>'Tech')::int < (prev.skills->>'Tech')::int OR
  (cur.skills->>'Influence')::int < (prev.skills->>'Influence')::int
);

-- 3. Armor decroissante entre tiers
SELECT cur.id, l.name, cur.level, cur.armor, prev.armor AS prev_armor
FROM profiles cur
JOIN profiles prev ON prev.lineage_id = cur.lineage_id AND prev.level = cur.level - 1
JOIN lineages l ON l.id = cur.lineage_id
WHERE cur.armor < prev.armor;

-- 4. Cost qui change entre tiers
SELECT p1.id, l.name, p1.level, p1.cost_eb, p2.cost_eb AS other_cost
FROM profiles p1
JOIN profiles p2 ON p2.lineage_id = p1.lineage_id AND p2.level != p1.level
JOIN lineages l ON l.id = p1.lineage_id
WHERE p1.cost_eb != p2.cost_eb;

-- 5. Street cred != level
SELECT p.id, l.name, p.level, p.street_cred
FROM profiles p JOIN lineages l ON l.id = p.lineage_id
WHERE p.street_cred != p.level;

-- 6. Token value qui decroit (G=2pts, Y=1pt)
SELECT cur.id, l.name, cur.level,
  cur.action_tokens, prev.action_tokens AS prev_tokens
FROM profiles cur
JOIN profiles prev ON prev.lineage_id = cur.lineage_id AND prev.level = cur.level - 1
JOIN lineages l ON l.id = cur.lineage_id
WHERE (
  (COALESCE((cur.action_tokens->>'green')::int, 0) * 2 +
   COALESCE((cur.action_tokens->>'yellow')::int, 0)) <
  (COALESCE((prev.action_tokens->>'green')::int, 0) * 2 +
   COALESCE((prev.action_tokens->>'yellow')::int, 0))
);
```

### Etape 1.2 — Filtrage

- Exclure les lineages Tyger Claws et Zoners (via lineage_factions)
- Exclure les lineages qui n'ont PAS de PDF dans les Archives
- Fusionner les resultats : liste unique de lineage_ids a re-verifier

### Etape 1.3 — Relecture PDF (agents Opus)

Pour chaque lineage flaggee :
- Trouver TOUS les PDFs (Base + Vet + Elite) dans `{Faction}/Archives/`
- Lancer un agent Opus par personnage (ou 2 persos/agent si beaucoup)
- Chaque agent lit page 2 de chaque PDF et extrait : tokens, skills, armor
- L'agent compare avec les donnees DB fournies et rapporte les differences

**Modele** : Opus (obligatoire, pas Sonnet)
**Parallelisme** : Maximum d'agents en parallele (9 par vague)

### Etape 1.4 — Tableau de corrections

Generer un fichier `VAGUE1_CORRECTIONS.md` dans ce repertoire avec le format :

```
## {Nom du personnage} — {Faction}

| | Base (★0) | Vet (★1) | Elite (★2) |
|---|---|---|---|
| Tokens | G1 Y2 | G2 Y1 | — |
| Reflexes | 1 | 2 | — |
| Ranged | 2 | 2 | — |
| Melee | 0 | 0 | — |
| Medical | 0 | 0 | — |
| Tech | 0 | 0 | — |
| Influence | 1 | 2 | — |
| Armor | 0 | 0 | — |

Corrections :
- Base tokens : ~~R1 G1 Y1~~ -> G1 Y2
- Vet Reflexes : ~~1~~ -> 2
```

### Etape 1.5 — Validation utilisateur

L'utilisateur verifie le fichier VAGUE1_CORRECTIONS.md et approuve/corrige.

### Etape 1.6 — Application

Apres approbation :
1. UPDATE des profils en erreur dans Supabase
2. Regenerer seed.ts (`dump-seed.ts` + `gen-seed.ts`)
3. Build + Deploy

---

## VAGUE 2 — Verification exhaustive des profils restants

### Scope

- TOUS les profils qui ont PASSE la coherence en vague 1
- Uniquement ceux avec PDF disponible
- Exclus : Tyger Claws, Zoners
- Inclus : profils Base uniques (1 seul tier) qui n'avaient pas d'erreur de tokens rouges

### Etape 2.1 — Inventaire

Lister tous les lineage_ids restants (pas dans vague 1, pas Tyger/Zoners, avec PDF).

### Etape 2.2 — Relecture PDF (agents Opus)

Meme protocole que vague 1 :
- Agent Opus par personnage (ou 2/agent)
- Focus : tokens + skills + armor
- Comparaison avec DB

### Etape 2.3 — Tableau de corrections

Generer `VAGUE2_CORRECTIONS.md` meme format.

### Etape 2.4 — Validation + Application

Idem vague 1.

---

## VAGUE 3 (optionnelle) — Tyger Claws + Zoners

Verification manuelle par l'utilisateur, ou meme protocole agents si demande.

---

## Contraintes techniques

- **Modele agents** : Opus 4.6 uniquement (pas Sonnet)
- **Parallelisme** : 9 agents max par batch (limite rate)
- **PDFs** : Page 2 uniquement (page 1 = dos de carte faction)
- **Tokens** : Pentagone vert = G, Triangle inverse jaune = Y. Pas de carre rouge.
- **Armor** : Bouclier violet/rouge avec chiffre. Absent = 0.
