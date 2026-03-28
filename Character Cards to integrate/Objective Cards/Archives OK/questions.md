# Objective Cards — Questions & Extraction Notes

> Generated from close-up photos IMG_0740–0844 (+ Archives OK for 6th Street).
> All errata labels on all cards read **"Errata: None"**.

---

## Global Issues

### 1. New Reward Type: "Immediate"
Many cards (especially Max-Tac, Trauma Team, Corpo Crimes, Public Enemies, Street Justice) have a reward type labeled **"Immediate"** on the card. This is NOT in the current `ObjectiveRewardType` (`ongoing | recycle | cybergear`). It needs to be added. ANSWER --> YES

**Immediate** means the reward fires the instant the objective condition is met during the game (e.g. "Heal 1 a Character of your choice", "Gain a Luck token", "Choose a model to take a free Basic action").

### 2. Unlabeled Reward Type (Post-Game / Campaign)
Several cards in Max-Tac, Trauma Team, Corpo Crimes, Public Enemies, and Street Justice have rewards with **NO sub-type label** (no "Ongoing", "Immediate", "Recycles", or "Cybergear"). These are campaign-level post-game effects:
- "Add a basic Merc to your HQ"
- "Add a Gear/Program card of your Street Cred or lower to your HQ"
- "Your Characters that weren't Taken Out automatically pass any Major Injury rolls"
- "Choose a surviving rival character to promote"

**Question**: Should these get a new type like `reward` or `postgame`? Or classify them as `ongoing`? ANSWER --> no label. 

### 3. Double Street Cred (2 Stars)
Some cards have **two star icons** in the header, granting 2 Street Cred instead of 1. Should the `grantsStreetCred` field be a number instead of a boolean?  ANSWER --> YES

Cards with 2 stars:
- **Bozos**: Big Tent Gang, Ship of Fools
- **Danger Gals**: Reaction Time, Not a Hair Out of Place
- **Gen Red**: Too Young to Die
- **Lawmen**: Elite Squad (verify)
- **Tyger Claws**: Unblemished Paragon
- **Wild Things**: Title Bout
- **Zoners**: Blood Feud, Rule the Block

### 4. Missing Card
- **"Stocking"** (Corpo Crimes) — NOT found in any photo from IMG_0819 through IMG_0844. Only 21 of 22 expected Corpo Crimes cards were found. Was this card photographed? ANSWER -->  this card does not exist. Remove it.

---

## Skill Icons — Cards to Double-Check

These cards have hexagonal skill icons, range bars, or stat modifiers that I flagged for your verification:

| # | Faction | Card | Skill/Icon | Details |
|---|---------|------|-----------|---------|
| 1 | Arasaka | **Proprietary Tech** | Hacking +2 | Cybergear "Predictive Algorithms" grants +2 Hacking |
| 2 | Arasaka | **They'll Fix You** | Melee +1, Ranged +1 | Cybergear "First Aid Protocols" grants +1 Melee and +1 Ranged |
| 3 | Gen Red | **Deliver a Message** | +2 (stat unclear) | Cybergear "Neural Enhancers: +2" — which stat does the +2 apply to? |
| 4 | Lawmen | **"Sensitivity" Training** | +1 hex icon | Reward gives Gonks +1 (hex icon). Is it +1 Armor? +1 to a skill? |
| 5 | Lawmen | **I'm a Mess** | Complex cybergear | "Reconstruction" effect: armor + "all attacks gain Deadly Crits" — text was hard to read, needs verification |
| 6 | Lawmen | **Termination Warrant** | +1 to two stats | "Tactical Lidar" shows +1 to two hexagonal icon stats — which stats? |
| 7 | Maelstrom | **Overwhelming Force** | Melee +1 | Cybergear "Gorilla Arms" grants +1 Melee |
| 8 | Zoners | **Scrapmetal** | Hacking +1 | Cybergear "Old Cyberdeck" grants Netrunner + Hacking icon (+1) |
| 9 | **Tyger Claws** | **Commanding Presence** | **Influence + RYG range bar** | Grants all characters an action: [Influence hex icon] [R-Y-G chevrons] "Activate target friendly model with lower Influence." This is an Influence-skill action with Red-Yellow-Green range. |
| 10 | Wild Things | **Be a Contender** | Influence +2 | Reward: "Your Leader gains [hex icon] +2" — is this +2 Influence? |

---

## Name Discrepancies

These card names differ between the `insert-all-objectives.ts` script and what's actually printed on the cards: ANSWER -->  take what's printed on the card

| # | Faction | Script Name | Actual Card Name | Action Needed |
|---|---------|-------------|-----------------|---------------|
| 1 | Arasaka | OpSec Research | **Oppo Research** | Rename in script + DB |
| 2 | Tyger Claws | Hisaishi's Arrow | **Heaven's Arrow** | Rename in script + DB |
| 3 | Tyger Claws | Grit | **Giri** | Rename in script + DB |
| 4 | Tyger Claws | Splash Hit | **Splash the Net** | Rename in script + DB |
| 5 | Wild Things | The Boot | **Title Bout** | Rename in script + DB |
| 6 | Piranhas | Watch These Guys, You're Gonna Love 'Em | **Watch These Guys, They're Trouble** | Rename in script + DB |
| 7 | Trauma Team | Follow Us, Here's Helpers | **Follow Us Helpers** | Rename in script + DB |
| 8 | Public Enemies | Bring a Song to His Lips | **Bring a King to His Knees** | Rename in script + DB |
| 9 | Public Enemies | Firerunning As Rebellion | **Freerunning As Rebellion** | Rename (typo: Fire→Free) |
| 10 | Street Justice | A Chomba's Score to Settle | **A Choomba's Score to Settle** | Rename (Chomba→Choomba) |
| 11 | Street Justice | "Accidental" Tragedy | **"Accidental"... Uh... "Tragedy"?** | Rename (longer name) |
| 12 | Street Justice | Finders Keepers | **Finders = Keepers** | Rename |
| 13 | Corpo Crimes | Befuddle the Competition | **Befuddle the Opposition** | Rename (Competition→Opposition) |
| 14 | Street Justice | Propaganda Images | **Propoganda Images** | Card has typo — keep typo or fix? |
| 15 | Gen Red | Mess With the Best | **Mess With the Best, Die Like the Rest** | Full name is longer |

---

## Faction Label Discrepancies ANSWER --> I don't understand the issue

| Faction | Expected Label | Actual Card Label |
|---------|---------------|-------------------|
| Max-Tac | MAX-TAC | **THREAT RESPONSE** |
| Trauma Team | TRAUMA TEAM | **FIRST RESPONSE** |
| Max-Tac Leader | Villainized Leader | **Villianized Leader** (possible typo on card) |

---

## Per-Faction Detailed Notes

### ARASAKA (21 cards — IMG_0740–0746)

**Cybergear cards (3):**
- **Proprietary Tech** → "Predictive Algorithms: [Hacking hex] +2" (equip to 1 character)
- **They'll Fix You** → "First Aid Protocols: [Melee hex] +1, [Ranged hex] +1" (equip to 1 character)
- **Slush Fund** → cybergear, exact effect: equip to 1 character

**Recycle cards (5):** Aggressive Recruiting, Hard Stop, Circle Back, Line in the Sand, Let's Table This

**Ongoing cards (13):** Rest of the cards

**Stars:** Wounded Leader (1, negative), Show of Force (1), Spec This Equipment (1), Hostile Acquisition (1), Urban Renewal (1), Necessary Research (1), Employee Retention (2)

**EB grants:** Profit Margins (+5), Necessary Research (+10), Employee Retention (+15)

**Questions:**
1. **Proprietary Tech**: Confirm Hacking +2 icon on the cybergear?
2. **They'll Fix You**: Confirm Melee +1 AND Ranged +1 icons on the cybergear?
3. **Slush Fund**: What's the exact cybergear name and effect? (hard to read in photo)

---

### BOZOS (21 cards — IMG_0747–0753)

**Cybergear cards (2):**
- **Freakshow** → "Extra Limbs: +2" (equip to Izzy — which stat?)
- **Explosive Personality** → "Periscope Eyes: This model's Blast actions gain Accurate" (equip to 1 character)

**Recycle cards (4):** Back at Ya, Joke's on You, Improv Show, Tough Crowd, The Ultimate Prank

**Stars (2):** Big Tent Gang (2 stars), Ship of Fools (2 stars)

**No skill icons observed.**

**Questions:**
1. **Freakshow**: "Extra Limbs: +2" — +2 to which stat?
2. **Tick Tick TickTickTick**: Very dense reward text with Impact tokens and Reflexes rolls — is my reading correct?

---

### DANGER GALS (21 cards — IMG_0754–0761)

**Cybergear cards (1):**
- **Scouting Mission** → "Neural Uplink: All friendly Gonks may move YELLOW at the start of the game" (equip to 1 character)

**Recycle cards (6):** Path to Promotion, Outpost, Make Sure They're Not Recognizable, Recruitment Drive, Spy Op, The Whites of Their Eyes

**Stars:** Reaction Time (2), Hold the Center (1), Map the Area (1), Get Down! (1), Not a Hair Out of Place (2), Arms Race (1), Spare Parts (1)

**No skill icons observed.**

**No questions for this faction.**

---

### GENERATION RED (21 cards — IMG_0762–0769)

**Cybergear cards (2):**
- **Hideout** → "Advanced Targeting Matrix" (equip to Izzy)
- **Deliver a Message** → "Neural Enhancers: +2" (equip to 1 character)

**Recycle cards (5):** Keep Your Heads Down, Nice Shoes Ya Got There, Rigged to Blow, Torch the Place, She Knows Too Much

**Stars:** Wounded Leader (1, negative), Too Young to Die (2), Timmy NOOOO! (1), Pick Their Pockets (1), Our Turf Our Stuff (1), Mess With the Best Die Like the Rest (1), Anything You Can Do I Can Do Better (1)

**Questions:**
1. **Deliver a Message**: "Neural Enhancers: +2" — +2 to which stat?
2. **Hideout**: "Advanced Targeting Matrix" — what's the exact effect text?
3. **Make It Look Like an Accident**: Reward text was partially obscured — can you confirm the ongoing effect?

---

### LAWMEN (21 cards — IMG_0770–0777)

**Cybergear cards (4):**
- **I'm a Mess** → "Reconstruction" (equip to the character that was taken out)
- **Hit 'em First, Hit 'em Hard** → "Descrambler" (equip to Leader)
- **Termination Warrant** → "Tactical Lidar" (equip to a Sarge) — shows +1 to two stats
- **Target Practice** → "Teleoptics" (equip to 1 character)

**Recycle cards (5):** The Best Defense, Gather Evidence, Reinforcements, Legendary Status, Tough as Nails

**Stars:** Well-Trained (1), Teamwork=Dreamwork (1), Search the Place (1), Preserve the Scene (1), Elite Squad (1 or 2?), Loyal Brotherhood (1), Training Day (1)

**Questions:**
1. **"Sensitivity" Training**: The reward gives Gonks "+1 [hex icon]" — is it +1 Armor? +1 to which skill?
2. **I'm a Mess / Reconstruction**: The cybergear text was very hard to read. It involves armor and "Deadly Crits"? Can you confirm the full text?
3. **Termination Warrant / Tactical Lidar**: The +1 is applied to two stats shown as hexagonal icons — which two stats?
4. **Target Practice / Teleoptics**: What's the exact effect?
5. **Protect & Serve**: Has a "Protection:" sub-label in the reward text — is this just flavor or a game keyword?

---

### MAELSTROM (21 cards — IMG_0778–0784)

**Cybergear cards (7):**
- **Lucky Shot** → cybergear
- **Booster Boosters** → cybergear
- **Cyber-Rage** → cybergear
- **Metal Over Meat** → cybergear
- **Kneel Before Maelstrom** → cybergear
- **A New Gang Rises** → cybergear
- **Overwhelming Force** → "Gorilla Arms: [Melee hex] +1" (equip to 1 character)

**Stars:** Taking Heads (1), Sub-Dermal Implants (1), Reinforced Mods (1), Beatdown (1), Flesh is Weak (1), Trophies (1), Flawless (2)

**Questions:**
1. **Overwhelming Force**: Confirm Melee +1 icon on Gorilla Arms?
2. Could you provide the exact cybergear names and effects for Lucky Shot, Booster Boosters, Cyber-Rage, Metal Over Meat, Kneel Before Maelstrom, and A New Gang Rises? (Some were hard to read)

---

### MAX-TAC / THREAT RESPONSE (20 cards — IMG_0785–0789)

**NEW: "Immediate" reward type (11 cards):**
Clear & Present, Just a Day's Work, Make the News, Coordinated Threat, Hit Hard, Pose for the Camera, A Symbol of Stability, Decisive Action, Disproportionate Response, Qualified Immunity, Stick & Move

**Unlabeled/campaign rewards (8 cards):**
By the Book, Clean Report, Clear the Civilians, In Broad Daylight, Priority Target, Keep Your Hands Clean, Oppressive Presence, This is "Evidence"

**Stars:** A Symbol of Stability (1), By the Book (1), Clean Report (1), Clear the Civilians (1), Decisive Action (1), Disproportionate Response (1), In Broad Daylight (1), Priority Target (1), Qualified Immunity (1), Keep Your Hands Clean (1), Oppressive Presence (1), Stick & Move (1), This is "Evidence" (1) — 13 out of 20 have stars

**No skill icons observed.**

**Questions:**
1. The card says **"Villianized Leader"** — is this a typo for "Villainized" or intended?
2. How should unlabeled post-game rewards be classified? New type `reward`/`postgame`, or just `ongoing`?
3. Max-Tac cards are labeled "THREAT RESPONSE" not "MAX-TAC" — does this matter for the app?

---

### PIRANHAS (21 cards — IMG_0789–0795)

**Cybergear cards (1):**
- **Have A Blast** → "Periscope Eyes: This model's Blast actions gain Accurate" (equip to 1 character)

**Recycle cards (5):** Killer Party, Lost and Found, Newcomers Welcome, This Guy Again, Who Invited Her?

**Stars:** Reckless and Wild (1), Party Favors (1), Mosh Pit (1), Party Crashers (1), Block Party (1), Who's Gonna Clean This Up? (1), Safety First (1)

**EB grants:** Wild Night (+5), Who's Gonna Clean This Up? (+10), Safety First (+15)

**No skill icons observed.**

**Questions:**
1. **To-Go Bag**: Very dense reward text involving Impact tokens, RED die rolls, and Obstacle die. Is my reading correct?
2. Confirm name: **"Watch These Guys, They're Trouble"** (script says "Watch These Guys, You're Gonna Love 'Em")

---

### TRAUMA TEAM / FIRST RESPONSE (21 cards — IMG_0796–0802)

**NEW: "Immediate" reward type (11 cards):**
Clear the LZ, Medical Search, Limited Liability, Just Doin' Our Jobs, Field Diagnosis, Offensive Care, Creative Solutions, Exec Evac, It Never Gets Any Easier, Organ "Donor", Make a Hole

**Unlabeled/campaign rewards (9 cards):**
Altruism Is Its Own Reward, Eliminate Patient Threat, Follow Us Helpers, Play God, Hedge Next Year's Budget, Textbook Success, Lay of the Land, Secure the Perimeter, Ulterior Motives

**Stars:** Altruism Is Its Own Reward (1), Eliminate Patient Threat (1), Follow Us Helpers (1), Creative Solutions (1), Exec Evac (1), It Never Gets Any Easier (1), Play God (1), Hedge Next Year's Budget (1), Organ "Donor" (1), Make a Hole (1), Textbook Success (1), Lay of the Land (1), Secure the Perimeter (1), Ulterior Motives (1)

**No cybergear cards. No skill icons observed.**

**Questions:**
1. **Follow Us Helpers**: Script says "Follow Us, Here's Helpers" — card reads just "Follow Us Helpers". Which is correct?
2. Same unlabeled reward type question as Max-Tac.

---

### TYGER CLAWS (21 cards — IMG_0803–0809)

**Cybergear cards (3):**
- **Splash the Net** → "Tech Savvy: This model gains Netrunner" (equip to a character)
- **The Shredder** → "Cyber-Claws: This model does not need to roll when climbing and its Basic Melee Attack gains Accurate" (equip to a character)
- **Strike for the Head** → "Talon Foot: This model may jump up to YELLOW across gaps. This model's Basic Melee Attack gains Rapid 2" (equip to a character)

**Recycle cards (2):** Impressive Kill, Giri, Upheld Honor

**Stars:** Rule the Cool (1), Lookout Post (1), A Flow of Goods (1), Lucrative Holdings (1), Commanding Presence (1), Second Wind (1), Unblemished Paragon (2)

**EB grants:** A Few EB's More (+5), A Flow of Goods (+10), Lucrative Holdings (+15)

**CRITICAL — Commanding Presence:**
- Grants all friendly characters an action with **Influence skill icon (hex)** and **RYG range bar (Red-Yellow-Green chevrons)**
- Action text: "Activate target friendly model with lower Influence."
- This is the ONLY card with a full range bar (chevrons like on weapon cards)

**Questions:**
1. **Commanding Presence**: Confirm the Influence icon + RYG range bar. How should this be stored in the DB? New fields for action skill/range?
2. **Heaven's Arrow** (was "Hisaishi's Arrow" in script): Confirm the actual name?
3. **Giri** (was "Grit" in script): Confirm spelling?
4. **Splash the Net** (was "Splash Hit" in script): Confirm actual name?

---

### WILD THINGS (21 cards — IMG_0810–0816)

**No cybergear cards.**

**Recycle cards (7):** Blood in the Water, B-Show, Keep it Clean, Alpha-Dog, Every Match a Death Match, On the Hunt, This is Ours Now

**Stars:** Trophies (1), Purge The Weakness (1), Be a Contender (1), Finish Him! (1), The A-Show (1), Unexpected Tactics (1), Title Bout (2)

**EB grants:** New Kings of this Jungle (+5), Trophies (+10), Finish Him! (+10)

**Skill icon: Be a Contender** — Reward says "Your Leader gains [hex icon] +2" — appears to be Influence +2.

**Questions:**
1. **Be a Contender**: Confirm Leader gains +2 Influence (hex icon)?
2. **Title Bout** (was "The Boot" in script): Confirm the actual name? These are very different names.
3. **RAGE!!!**: Is it 2 or 3 exclamation marks? Card seems to show 3, script has 2.

---

### ZONERS (21 cards — IMG_0817–0823)

**Cybergear cards (4):**
- **Buck-Smart** → "Targeting Cyber Eye: This model gains +1 to ranged attack rolls" (equip to 1 character)
- **Initiation** → "Pain Matrix: Whenever a visible friendly Gonk would suffer a wound, this model may choose to suffer the wound instead" (equip to 1 character)
- **Stall & Shade** → "Grapple Hand: This model automatically passes any Reflexes roll for climbing" (equip to 1 character)
- **Scrapmetal** → "Old Cyberdeck: +1 [Hacking hex icon]. This model gains Netrunner" (equip to 1 character)

**Recycle cards (5):** Earning Your Keep, Hidden Stash, Grab & Stash, Street Justice, Surrounded

**Stars:** Scrapmetal (1), Street Proven (1), Don't Miss (1), Sucks for You (1), Find a Score (1), Blood Feud (2), Rule the Block (2)

**EB grants:** Defend Your Turf (+5), Find a Score (+10), Rule the Block (+15)

**Skill icon: Scrapmetal** — Hacking hex icon (+1) in the cybergear.

**No questions for this faction.**

---

### CORPO CRIMES (21 found / 22 expected — IMG_0824–0830)

**NEW: "Immediate" reward type (12 cards):**
Pump & Dump, Efficiency Experts, Re-Assess Priorities, "In the Trenches" Management, Reach Out to Them, Promises of Advancement, Get the Big Picture, Give 110 Percent, Long Term Projections, Re-Assigned Action Items, Workflow Sandbagging, Realign Core Synergies

**Unlabeled/campaign rewards (8 cards):**
Core Competency, Destabilize the Competition, Forced Absenteeism, Befuddle the Opposition, Opposition Analysis, Stock Blocking, The New Normal, Off the Books

**Stars:** Censured Leader (1, negative), Core Competency (1), Destabilize the Competition (1), Forced Absenteeism (1), Befuddle the Opposition (1), Get the Big Picture (1), Give 110 Percent (1), Opposition Analysis (1), Workflow Sandbagging (1), Long Term Projections (1), Re-Assigned Action Items (1), Stock Blocking (1), The New Normal (1), Realign Core Synergies (1), Off the Books (1)

**No cybergear. No skill icons observed.**

**Questions:**
1. **"Stocking"** — not found in any photo. Was it photographed? Is it a real card?
2. **Befuddle the Opposition** (script says "Befuddle the Competition"): Confirm the actual name?
3. **Censured Leader**: Reward is "Your Leader's Influence is reduced by 2 (minimum 0)" — this is different from the standard Wounded Leader effect. Confirm?

---

### PUBLIC ENEMIES (21 cards — IMG_0831–0837)

**NEW: "Immediate" reward type (11 cards):**
Lose an Eye Take a Head, Freerunning As Rebellion, Reckless Mischief, Insults With Injuries, Who Says Crime Doesn't Pay?, Like Good 'Lil Soldiers, Careless Disregard, Get Creative, Give It All, Shake Down, Take It All

**Unlabeled/campaign rewards (9 cards):**
Bring It to Their House, Gamble With the Future, Bring a King to His Knees, Play It Close to the Chest, This is Mine Now, Leave Bloody Concrete, Run Amok, Like a Ghost, Own the Block

**Stars:** Most Wanted Leader (1, negative), Careless Disregard (1), Bring a King to His Knees (1), Get Creative (1), Give It All (1), Bring It to Their House (1), Play It Close to the Chest (1), This is Mine Now (1), Leave Bloody Concrete (1), Run Amok (1), Like a Ghost (1), Shake Down (1), Own the Block (1), Gamble With the Future (1), Take It All (1)

**No cybergear. No skill icons observed.**

**Questions:**
1. **Bring a King to His Knees** (script says "Bring a Song to His Lips"): These are completely different names. Confirm?
2. **Freerunning As Rebellion** (script says "Firerunning"): Fire vs Free — which is correct?
3. **Most Wanted Leader**: Negative effect is "Your rival gains +1 Luck token" — different from standard Wounded Leader. Confirm?

---

### STREET JUSTICE (21 cards — IMG_0838–0844)

**NEW: "Immediate" reward type (12 cards):**
Pilfer and Pillage, Camera-Ready Corpo Victim, Propoganda Images, A Symbol for the People, Disruption is the Point, Samaritans, Finders = Keepers, "Accidental"... Uh... "Tragedy"?, They'll Never Prove It, The Streets Provide, Make It Look Like a Mugging, Take It for the Cause

**Unlabeled/campaign rewards (8 cards):**
A Choomba's Score to Settle, A True Victory, Crisis Actors, Fight the Power or Wield It?, Occupy All Streets, It's Not Theft It's Reclamation, Manufacture a Villain, Target the One Percent

**Stars:** Reticent Leader (1, negative), A Symbol for the People (1), A Choomba's Score to Settle (1), "Accidental"... Uh... "Tragedy"? (1), A True Victory (1), Crisis Actors (1), Fight the Power or Wield It? (1), Occupy All Streets (1), They'll Never Prove It (1), It's Not Theft It's Reclamation (1), The Streets Provide (1), Make It Look Like a Mugging (1), Take It for the Cause (1), Manufacture a Villain (1), Target the One Percent (1)

**No cybergear. No skill icons observed.**

**Questions:**
1. **Propoganda Images**: Card has "PROPOGANDA" — is this a typo on the card? Should we keep the typo or correct to "Propaganda"?
2. **"Accidental"... Uh... "Tragedy"?** — full name is much longer than in script. Keep the full name?
3. **Finders = Keepers**: Card uses equals sign. Keep it?
4. **A Choomba's Score to Settle** (script says "Chomba"): Confirm "Choomba" spelling?
5. **Reticent Leader**: Negative effect is "Your rival begins the game with Control" — different from standard Wounded Leader. Confirm?

---

## 6th Street (processed previously — Archives OK)
6th Street objective cards (IMG_0733–0739) were processed in a prior session and archived. No new extraction needed. The "Wrecker" card was confirmed as non-existent and deleted from DB.

---

## Summary: All Skill Icons Found

| Faction | Card | Icon(s) | Range Bar? |
|---------|------|---------|-----------|
| Arasaka | Proprietary Tech | Hacking +2 | No |
| Arasaka | They'll Fix You | Melee +1, Ranged +1 | No |
| Gen Red | Deliver a Message | +2 (unknown stat) | No |
| Lawmen | "Sensitivity" Training | +1 (unknown — Armor?) | No |
| Lawmen | Termination Warrant | +1 to 2 stats (unknown) | No |
| Maelstrom | Overwhelming Force | Melee +1 | No |
| Zoners | Scrapmetal | Hacking +1 | No |
| **Tyger Claws** | **Commanding Presence** | **Influence** | **YES — RYG** |
| Wild Things | Be a Contender | Influence +2 | No |

Only **Commanding Presence** has an actual range bar with chevrons (like weapon cards).
