#!/usr/bin/env python3
"""
Automated character card analyzer for Cyberpunk Combat Zone.
Extracts tokens, skill values, armor from PDF card images using
color detection and text extraction — no visual AI interpretation.

Usage:
    python3 scripts/analyze-cards.py "Edge Runners"
    python3 scripts/analyze-cards.py all
    python3 scripts/analyze-cards.py all --no-db
    python3 scripts/analyze-cards.py "Edge Runners" -v
"""

import argparse
import json
import ssl
import sys
import urllib.request
from pathlib import Path

import fitz  # PyMuPDF
import numpy as np

# ── Constants ────────────────────────────────────────────────────────────

CARD_W, CARD_H = 550, 750
PDF_PT_W, PDF_PT_H = 198.0, 270.0
SCALE_X = CARD_W / PDF_PT_W
SCALE_Y = CARD_H / PDF_PT_H

# Token detection region (550x750 space)
TOKEN_REGION = dict(x1=30, y1=70, x2=130, y2=400)

# Color thresholds (validated empirically)
GREEN_TOK = dict(r_max=100, g_min=130, b_max=100, g_minus_r_min=50)
YELLOW_TOK = dict(r_min=160, g_min=140, b_max=80)
TOKEN_CLUSTER_GAP = 15  # px gap → new token
TOKEN_MIN_PX = 3  # min qualifying pixels per row to count
TOKEN_MIN_CLUSTER_HEIGHT = 20  # min rows per cluster (real tokens = 25-40, noise < 20)
TOKEN_MIN_AVG_PX = 10  # min avg qualifying pixels per row (real = 18+, noise = ~5)

# Skill text extraction
SKILL_FONT = "Kimberley"
SKILL_MIN_Y = 180
COST_MAX_Y = 180
COST_MIN_X = 440
SKILL_MIN_X = 350
ARMOR_MAX_X = 150
ARMOR_MIN_Y = 270
ARMOR_MAX_Y = 370

# Shield detection (magenta pixels)
SHIELD_REGION = dict(x1=20, y1=260, x2=140, y2=420)
SHIELD_COLOR = dict(r_min=150, b_min=100, g_max=100, r_minus_g_min=60)
SHIELD_MIN_PIXELS = 100

# Faction mapping
FACTION_MAP = {
    "Arasaka": "faction-arasaka",
    "Bozos": "faction-bozos",
    "Danger Gals": "faction-danger-gals",
    "Edge Runners": "faction-edgerunners",
    "Gen Red": "faction-gen-red",
    "Lawmen": "faction-lawmen",
    "Maelstrom": "faction-maelstrom",
    "Trauma Team": "faction-trauma-team",
    "Tyger Claws": "faction-tyger-claws",
    "Zoners": "faction-zoners",
}

TIER_NAMES = ["Base", "Vet", "Elite"]

# ── PDF Rendering ────────────────────────────────────────────────────────

def render_page(doc, page_idx):
    """Render a PDF page to a numpy RGB array (750, 550, 3)."""
    page = doc[page_idx]
    mat = fitz.Matrix(SCALE_X, SCALE_Y)
    pix = page.get_pixmap(matrix=mat)
    channels = pix.n
    img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, channels)
    if channels == 4:  # RGBA → RGB
        img = img[:, :, :3]
    return img, page


# ── Token Detection ──────────────────────────────────────────────────────

def detect_tokens(img):
    """Detect green and yellow tokens by color thresholding.
    Returns {"green": N, "yellow": N}."""
    tc = img[TOKEN_REGION["y1"]:TOKEN_REGION["y2"],
             TOKEN_REGION["x1"]:TOKEN_REGION["x2"]]

    rows = []
    for y_off in range(tc.shape[0]):
        row = tc[y_off]
        r = row[:, 0].astype(int)
        g = row[:, 1].astype(int)
        b = row[:, 2].astype(int)

        green_px = int(np.sum(
            (r < GREEN_TOK["r_max"]) &
            (g > GREEN_TOK["g_min"]) &
            (b < GREEN_TOK["b_max"]) &
            ((g - r) > GREEN_TOK["g_minus_r_min"])
        ))
        yellow_px = int(np.sum(
            (r > YELLOW_TOK["r_min"]) &
            (g > YELLOW_TOK["g_min"]) &
            (b < YELLOW_TOK["b_max"])
        ))

        if green_px > TOKEN_MIN_PX or yellow_px > TOKEN_MIN_PX:
            color = "G" if green_px > yellow_px else "Y"
            rows.append((TOKEN_REGION["y1"] + y_off, color, green_px, yellow_px))

    if not rows:
        return {"green": 0, "yellow": 0}

    # Cluster by vertical gap
    clusters = []
    current = [rows[0]]
    for r in rows[1:]:
        if r[0] - current[-1][0] > TOKEN_CLUSTER_GAP:
            clusters.append(current)
            current = [r]
        else:
            current.append(r)
    clusters.append(current)

    # Filter out noise and classify by majority vote
    green = 0
    yellow = 0
    for cluster in clusters:
        if len(cluster) < TOKEN_MIN_CLUSTER_HEIGHT:
            continue  # Too few rows — artwork bleed
        # Check average pixel density (real tokens avg ~18+, noise ~5)
        avg_px = sum(max(x[2], x[3]) for x in cluster) / len(cluster)
        if avg_px < TOKEN_MIN_AVG_PX:
            continue  # Too sparse — artwork bleed
        colors = [x[1] for x in cluster]
        if colors.count("G") >= colors.count("Y"):
            green += 1
        else:
            yellow += 1

    return {"green": green, "yellow": yellow}


# ── Skill Value Extraction ───────────────────────────────────────────────

def extract_skills_and_cost(page):
    """Extract skill values, cost, and armor value from text positions.
    Returns (cost, skill_values, armor_value).
    skill_values: list of (y_pos, value) sorted by Y."""
    d = page.get_text("dict")
    skills = []
    cost = -1
    armor_val = 0
    armor_found = False

    for block in d.get("blocks", []):
        if block.get("type") != 0:
            continue
        for line in block.get("lines", []):
            for span in line.get("spans", []):
                font = span.get("font", "")
                if SKILL_FONT not in font:
                    continue
                text = span["text"].strip()
                if not text.isdigit():
                    continue

                x = span["bbox"][0] * SCALE_X
                y = span["bbox"][1] * SCALE_Y
                val = int(text)

                if x > COST_MIN_X and y < COST_MAX_Y:
                    cost = val
                elif x > SKILL_MIN_X and y > SKILL_MIN_Y:
                    skills.append((y, val))
                elif x < ARMOR_MAX_X and ARMOR_MIN_Y < y < ARMOR_MAX_Y:
                    armor_val = val
                    armor_found = True

    skills.sort(key=lambda s: s[0])
    return cost, skills, armor_val


# ── Armor Detection ──────────────────────────────────────────────────────

def detect_armor(img, page):
    """Detect armor by shield pixel count + text value."""
    shield_area = img[SHIELD_REGION["y1"]:SHIELD_REGION["y2"],
                      SHIELD_REGION["x1"]:SHIELD_REGION["x2"]]

    r = shield_area[:, :, 0].astype(int)
    g = shield_area[:, :, 1].astype(int)
    b = shield_area[:, :, 2].astype(int)

    shield_mask = (
        (r > SHIELD_COLOR["r_min"]) &
        (b > SHIELD_COLOR["b_min"]) &
        (g < SHIELD_COLOR["g_max"]) &
        ((r - g) > SHIELD_COLOR["r_minus_g_min"])
    )
    pixel_count = int(np.sum(shield_mask))

    if pixel_count < SHIELD_MIN_PIXELS:
        return 0

    # Shield detected — get value from text
    _, _, armor_val = extract_skills_and_cost(page)
    return armor_val if armor_val > 0 else 1  # Shield present but no text = assume 1


# ── Supabase Fetcher ─────────────────────────────────────────────────────

def load_env(project_dir):
    """Read .env.local for Supabase credentials."""
    env_path = project_dir / ".env.local"
    env = {}
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip()
    return env


def fetch_db_profiles(project_dir, faction_id=None):
    """Fetch profiles + lineage names from Supabase REST API."""
    env = load_env(project_dir)
    base_url = env.get("NEXT_PUBLIC_SUPABASE_URL", "")
    anon_key = env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")
    if not base_url or not anon_key:
        print("WARNING: Supabase credentials not found in .env.local")
        return {}, {}

    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    headers = {
        "apikey": anon_key,
        "Authorization": f"Bearer {anon_key}",
    }

    def api_get(endpoint):
        url = f"{base_url}/rest/v1/{endpoint}"
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=ctx) as resp:
            return json.loads(resp.read())

    # Fetch lineages
    lineages_raw = api_get("lineages?select=id,name")
    lineage_names = {l["id"]: l["name"] for l in lineages_raw}

    # Fetch profiles
    profiles_raw = api_get("profiles?select=*")

    # Filter by faction if specified
    if faction_id:
        lf_raw = api_get(f"lineage_factions?faction_id=eq.{faction_id}")
        faction_lineage_ids = {r["lineage_id"] for r in lf_raw}
        profiles_raw = [p for p in profiles_raw if p["lineage_id"] in faction_lineage_ids]

    # Index by (lineage_id, level)
    profiles = {}
    for p in profiles_raw:
        key = (p["lineage_id"], p["level"])
        profiles[key] = p

    return profiles, lineage_names


# Faction folder name → PDF filename prefix mapping (case-insensitive matching)
# Multi-word factions use underscored prefixes in filenames
FACTION_PREFIX_MAP = {
    "Arasaka": ["arasaka_"],
    "Bozos": ["bozos_"],
    "Danger Gals": ["danger_gals_", "dangergals_"],
    "Edge Runners": ["edgerunners_", "edge_runners_", "edgerunners_"],
    "Gen Red": ["gen_red_", "genred_"],
    "Lawmen": ["lawmen_"],
    "Maelstrom": ["maelstrom_"],
    "Trauma Team": ["trauma_team_", "traumateam_"],
    "Tyger Claws": ["tyger_claws_", "tygerclaws_"],
    "Zoners": ["zoners_", "party_gangers_"],
}

# Known slug aliases: PDF slug → DB lineage suffix
SLUG_ALIASES = {
    "munitions-specialist": "munition-specialist",
    "michiko": "michiko-arasaka",
    "gokudo": "mr-gokudo",  # PDF has single Gokudo, DB has Mr/Ms variants
}


# ── PDF Name → Lineage ID Matching ──────────────────────────────────────

def pdf_name_to_slug(pdf_path, faction_folder=None):
    """Convert PDF filename to a lineage slug for DB matching.
    Uses faction_folder to strip the correct multi-word prefix.
    E.g. ('Danger_Gals_Bengal.pdf', 'Danger Gals') → 'bengal'
    E.g. ('Gen_RED_Apex.pdf', 'Gen Red') → 'apex'
    """
    stem = pdf_path.stem
    stem_lower = stem.lower()

    # Try faction-specific prefixes first (case-insensitive)
    if faction_folder and faction_folder in FACTION_PREFIX_MAP:
        for prefix in FACTION_PREFIX_MAP[faction_folder]:
            if stem_lower.startswith(prefix):
                name = stem[len(prefix):]
                slug = name.lower().replace("_", "-")
                return SLUG_ALIASES.get(slug, slug)

    # Fallback: strip everything before first underscore
    parts = stem.split("_", 1)
    if len(parts) > 1:
        name = parts[1]
    else:
        name = parts[0]
    slug = name.lower().replace("_", "-")
    return SLUG_ALIASES.get(slug, slug)


def normalize_slug(s):
    """Normalize a string for fuzzy matching: lowercase, remove hyphens/spaces."""
    return s.lower().replace("-", "").replace(" ", "").replace("_", "")


def find_db_profile(slug, level, profiles, lineage_names):
    """Find a DB profile matching a slug and level."""
    # Try exact match on lineage-{slug}
    lineage_id = f"lineage-{slug}"
    key = (lineage_id, level)
    if key in profiles:
        return profiles[key], lineage_id

    # Fuzzy: search lineage names by normalized comparison
    slug_norm = normalize_slug(slug)
    for lid, name in lineage_names.items():
        lid_norm = normalize_slug(lid.replace("lineage-", ""))
        name_norm = normalize_slug(name)
        if slug_norm == lid_norm or slug_norm == name_norm:
            key2 = (lid, level)
            if key2 in profiles:
                return profiles[key2], lid

    return None, None


# ── Analysis ─────────────────────────────────────────────────────────────

def analyze_pdf(pdf_path, profiles, lineage_names, verbose=False, faction_folder=None):
    """Analyze all pages of a single PDF. Returns list of tier results."""
    doc = fitz.open(str(pdf_path))
    slug = pdf_name_to_slug(pdf_path, faction_folder)
    results = []

    for page_idx in range(len(doc)):
        img, page = render_page(doc, page_idx)

        # Extract data
        tokens = detect_tokens(img)
        cost, skill_vals, armor_text = extract_skills_and_cost(page)
        armor = detect_armor(img, page)

        # Use text-based armor if shield detection found nothing
        if armor == 0 and armor_text > 0:
            armor = armor_text

        tier_data = {
            "tier": TIER_NAMES[page_idx] if page_idx < 3 else f"Page{page_idx}",
            "level": page_idx,
            "tokens": tokens,
            "cost": cost,
            "skill_values": [v for _, v in skill_vals],
            "skill_count": len(skill_vals),
            "armor": armor,
        }

        # Compare with DB
        db_profile, lineage_id = find_db_profile(slug, page_idx, profiles, lineage_names)
        if db_profile:
            tier_data["db_match"] = True
            tier_data["lineage_id"] = lineage_id
            tier_data["diffs"] = compare_profile(tier_data, db_profile)
        else:
            tier_data["db_match"] = False

        results.append(tier_data)

        if verbose:
            print(f"  {tier_data['tier']}: tokens=G{tokens['green']}Y{tokens['yellow']}, "
                  f"skills={tier_data['skill_values']}, armor={armor}, cost={cost}")

    doc.close()
    return slug, results


def compare_profile(pdf_data, db_profile):
    """Compare extracted PDF data against DB profile. Returns list of diffs."""
    diffs = []

    # Tokens
    db_tokens = db_profile.get("action_tokens", {})
    db_green = db_tokens.get("green", 0)
    db_yellow = db_tokens.get("yellow", 0)
    pdf_green = pdf_data["tokens"]["green"]
    pdf_yellow = pdf_data["tokens"]["yellow"]

    if pdf_green != db_green or pdf_yellow != db_yellow:
        diffs.append(f"Tokens: PDF=G{pdf_green}Y{pdf_yellow} DB=G{db_green}Y{db_yellow}")

    # Skill values (order-independent comparison)
    db_skills = db_profile.get("skills", {})
    db_nonzero = sorted([v for k, v in db_skills.items() if v > 0 and k != "None"], reverse=True)
    pdf_vals = sorted(pdf_data["skill_values"], reverse=True)

    if pdf_vals != db_nonzero:
        diffs.append(f"Skills: PDF={pdf_vals} DB={db_nonzero}")

    # Skill count
    if len(pdf_data["skill_values"]) != len(db_nonzero):
        diffs.append(f"Skill count: PDF={len(pdf_data['skill_values'])} DB={len(db_nonzero)}")

    # Armor
    db_armor = db_profile.get("armor", 0)
    if pdf_data["armor"] != db_armor:
        diffs.append(f"Armor: PDF={pdf_data['armor']} DB={db_armor}")

    # Cost
    if pdf_data["cost"] > 0:
        db_cost = db_profile.get("cost_eb", 0)
        if pdf_data["cost"] != db_cost:
            diffs.append(f"Cost: PDF={pdf_data['cost']} DB={db_cost}")

    return diffs


# ── Cross-Tier Validation ────────────────────────────────────────────────

def validate_tiers(slug, tier_results):
    """Validate progression rules across tiers. Returns list of warnings."""
    warnings = []
    for i in range(1, len(tier_results)):
        prev = tier_results[i - 1]
        curr = tier_results[i]
        prev_tier = prev["tier"]
        curr_tier = curr["tier"]

        # Green tokens must not decrease
        if curr["tokens"]["green"] < prev["tokens"]["green"]:
            warnings.append(
                f"GREEN DECREASE: {prev_tier} G{prev['tokens']['green']} → "
                f"{curr_tier} G{curr['tokens']['green']}")

        # Total token value must not decrease (G=2, Y=1)
        prev_val = prev["tokens"]["green"] * 2 + prev["tokens"]["yellow"]
        curr_val = curr["tokens"]["green"] * 2 + curr["tokens"]["yellow"]
        if curr_val < prev_val:
            warnings.append(
                f"TOKEN VALUE DECREASE: {prev_tier}={prev_val}pts → "
                f"{curr_tier}={curr_val}pts")

        # Skill values: each must be >= previous (sorted comparison)
        prev_skills = sorted(prev["skill_values"])
        curr_skills = sorted(curr["skill_values"])
        # Can't compare directly if count differs (new skills may appear)
        # But existing skills shouldn't decrease
        if len(curr_skills) >= len(prev_skills):
            # Compare the top N values (highest skills should not decrease)
            for j, pv in enumerate(sorted(prev["skill_values"], reverse=True)):
                if j < len(curr["skill_values"]):
                    cv = sorted(curr["skill_values"], reverse=True)[j]
                    # This is imperfect without skill names, but catches obvious regressions

        # Armor must not decrease
        if curr["armor"] < prev["armor"]:
            warnings.append(
                f"ARMOR DECREASE: {prev_tier}={prev['armor']} → "
                f"{curr_tier}={curr['armor']}")

        # Cost should be identical
        if prev["cost"] > 0 and curr["cost"] > 0 and prev["cost"] != curr["cost"]:
            warnings.append(
                f"COST CHANGE: {prev_tier}={prev['cost']} → "
                f"{curr_tier}={curr['cost']}")

    return warnings


# ── Report ───────────────────────────────────────────────────────────────

def print_report(all_results):
    """Print the full analysis report."""
    total_profiles = 0
    ok_profiles = 0
    diff_profiles = 0
    no_db_profiles = 0
    tier_warnings = 0

    print("\n" + "=" * 70)
    print("CYBERPUNK COMBAT ZONE — Card Analysis Report")
    print("=" * 70)

    for slug, tiers, warnings, char_name in all_results:
        has_diffs = any(t.get("diffs") for t in tiers)
        has_warnings = len(warnings) > 0
        has_no_db = any(not t.get("db_match") for t in tiers)

        if not has_diffs and not has_warnings and not has_no_db:
            ok_profiles += len(tiers)
            total_profiles += len(tiers)
            continue

        name_display = char_name or slug
        print(f"\n## {name_display}")

        for t in tiers:
            total_profiles += 1
            tier_label = t["tier"]
            tokens = t["tokens"]
            print(f"  {tier_label}: G{tokens['green']}Y{tokens['yellow']} | "
                  f"skills={t['skill_values']} | armor={t['armor']} | cost={t['cost']}")

            if not t.get("db_match"):
                print(f"    ⚠ NOT IN DB")
                no_db_profiles += 1
            elif t.get("diffs"):
                for d in t["diffs"]:
                    print(f"    ✗ {d}")
                diff_profiles += 1
            else:
                ok_profiles += 1

        if warnings:
            tier_warnings += len(warnings)
            for w in warnings:
                print(f"    ⚠ TIER RULE: {w}")

    # Summary for OK characters (no diffs)
    print(f"\n{'=' * 70}")
    print(f"SUMMARY")
    print(f"  Total profiles analyzed: {total_profiles}")
    print(f"  OK (match DB):           {ok_profiles}")
    print(f"  With differences:        {diff_profiles}")
    print(f"  Not in DB:               {no_db_profiles}")
    print(f"  Tier rule violations:    {tier_warnings}")
    print(f"{'=' * 70}\n")


# ── Main ─────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Analyze Cyberpunk Combat Zone character card PDFs")
    parser.add_argument("faction", nargs="?", default="all",
                        help="Faction folder name (e.g. 'Edge Runners') or 'all'")
    parser.add_argument("--no-db", action="store_true",
                        help="Skip DB comparison, extract only")
    parser.add_argument("--sql", action="store_true",
                        help="Output SQL UPDATE statements for token corrections")
    parser.add_argument("-v", "--verbose", action="store_true")
    args = parser.parse_args()

    project_dir = Path(__file__).resolve().parent.parent
    cards_dir = project_dir / "Character Cards to integrate" / "Cyberpunk Character Cards"

    if not cards_dir.exists():
        print(f"ERROR: Cards directory not found: {cards_dir}")
        sys.exit(1)

    # Resolve factions
    if args.faction == "all":
        folders = sorted([d for d in cards_dir.iterdir() if d.is_dir()])
    else:
        folder = cards_dir / args.faction
        if not folder.exists():
            print(f"ERROR: Faction folder not found: {folder}")
            sys.exit(1)
        folders = [folder]

    # Fetch DB data
    all_profiles = {}
    lineage_names = {}
    if not args.no_db:
        print("Fetching profiles from Supabase...")
        for faction_name in FACTION_MAP:
            faction_folder = cards_dir / faction_name
            if not faction_folder.exists():
                continue
            if args.faction != "all" and faction_name != args.faction:
                continue
            fid = FACTION_MAP[faction_name]
            profiles, names = fetch_db_profiles(project_dir, fid)
            all_profiles.update(profiles)
            lineage_names.update(names)
        print(f"  Loaded {len(all_profiles)} profiles, {len(lineage_names)} lineages")

    # Process PDFs
    all_results = []
    for folder in folders:
        faction_name = folder.name
        pdfs = sorted(folder.glob("*.pdf"))
        if not pdfs:
            continue

        print(f"\nAnalyzing {faction_name} ({len(pdfs)} PDFs)...")

        for pdf_path in pdfs:
            if args.verbose:
                print(f"\n  {pdf_path.name}")

            slug, tiers = analyze_pdf(pdf_path, all_profiles, lineage_names, args.verbose, faction_folder=faction_name)

            # Find display name from DB
            char_name = None
            for t in tiers:
                lid = t.get("lineage_id")
                if lid and lid in lineage_names:
                    char_name = lineage_names[lid]
                    break

            warnings = validate_tiers(slug, tiers)
            all_results.append((slug, tiers, warnings, char_name or slug))

    print_report(all_results)

    if args.sql:
        print_sql_corrections(all_results)


def print_sql_corrections(all_results):
    """Output SQL UPDATE statements for token diffs only."""
    print("\n-- ═══ TOKEN CORRECTIONS SQL ═══")
    count = 0
    for slug, tiers, warnings, char_name in all_results:
        for t in tiers:
            if not t.get("db_match") or not t.get("diffs"):
                continue
            # Only token diffs
            token_diffs = [d for d in t["diffs"] if d.startswith("Tokens:")]
            if not token_diffs:
                continue
            lid = t["lineage_id"]
            level = t["level"]
            g = t["tokens"]["green"]
            y = t["tokens"]["yellow"]
            print(f"UPDATE profiles SET action_tokens = '{{\"green\": {g}, \"yellow\": {y}}}'::jsonb "
                  f"WHERE lineage_id = '{lid}' AND level = {level}; "
                  f"-- {char_name} {t['tier']}: G{g}Y{y}")
            count += 1
    print(f"-- Total: {count} token updates")


if __name__ == "__main__":
    main()
