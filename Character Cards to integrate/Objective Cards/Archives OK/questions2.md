# Objective Cards — Questions v2 (remaining open questions)

> Resolved items from v1:
> - "Immediate" reward type → **ADD IT** to ObjectiveRewardType
> - Unlabeled post-game rewards → **NO LABEL** (store as null/empty in reward_type)
> - Double Street Cred → **YES**, `grants_street_cred` becomes a number (0, 1, or 2)
> - "Stocking" (Corpo Crimes) → **DOES NOT EXIST**, remove from script + DB
> - Name discrepancies → **USE WHAT'S PRINTED ON THE CARD** for all 15 renames
> - Propoganda Images → keeping card's spelling (typo on card = official name)

---

## Faction Label Clarification

The physical cards for Max-Tac and Trauma Team use different faction names than what's in the app:

- **Max-Tac** cards are printed with "THREAT RESPONSE" as the faction banner (not "MAX-TAC")
- **Trauma Team** cards are printed with "FIRST RESPONSE" as the faction banner (not "TRAUMA TEAM")
- Max-Tac's leader card is printed **"Villianized Leader"** (not "Villainized" — possible typo on the card)

This is purely informational — no changes needed in the app unless you want to rename these factions. The `faction_id` in the DB stays `faction-max-tac` and `faction-trauma-team`.
ANSWER --> affiche les 2. Ex : Max Tac en faction, et THREAT RESPONSE en texte d'ambiance.

**Question**: Should we keep "Villianized" (as printed) or correct to "Villainized"? ANSWER --> corrige la type

---

## Skill Icons — Cards to Verify

I need you to confirm the skill icons on these cards. I can read the hex shapes but identifying which skill they represent is tricky from photos.

| # | Faction | Card | What I see | Question |
|---|---------|------|-----------|----------|
| 1 | Arasaka | **Proprietary Tech** | Hacking hex +2 | Confirm it's Hacking +2? | ANSWER --> il n'existe pas de sill Hacking. C'est l'icone TECH. Regarde la liste des skills  et de leurs icones dans le répertoire
| 2 | Arasaka | **They'll Fix You** | Melee hex +1, Ranged hex +1 | Confirm Melee +1 AND Ranged +1? | ANSWER --> YES. +1 sur ces 3 skills. Afficher l'icone de la skill sur la carte.
| 3 | Gen Red | **Deliver a Message** | Hex icon +2 | **Which stat is the +2?** |ANSWER -->  Reflexes
| 4 | Lawmen | **"Sensitivity" Training** | Hex icon +1 (for Gonks) | **Which stat is the +1?** | ANSWER --> Melee
| 5 | Lawmen | **I'm a Mess** | "Reconstruction" cybergear | **Full cybergear text?** (hard to read — armor + Deadly Crits?) | ANSWER --> +2 armor et +2 Tech
| 6 | Lawmen | **Termination Warrant** | "Tactical Lidar" +1 to 2 hex icons | **Which two stats get +1?** | ANSWER --> Termination warrant + 1 en Melee et en Ranged. "Tactical Lidar" --> je ne vois pas de quoi tu marles.
| 7 | Maelstrom | **Overwhelming Force** | Melee hex +1 | Confirm it's Melee +1? | ANSWER --> +1 Melee et +1 reflexes
| 8 | Zoners | **Scrapmetal** | Hacking hex +1 | Confirm Hacking +1? | ANSWER --> +1 Tech
| 9 | **Tyger Claws** | **Commanding Presence** | **Influence hex + RYG chevrons** | Confirm Influence skill + Red-Yellow-Green range bar? How to store this in the DB? | --> met à jour la db pour permettre ça.
| 10 | Wild Things | **Be a Contender** | Hex icon +2 | **Is it Influence +2?** | ANSWER --> oui, c'est Influence

---

## Per-Faction Open Questions

### ARASAKA
1. **Slush Fund**: What's the exact cybergear name and effect? (hard to read in photo)
ANSWER --> 
OBJECTIVE
Use the Corporate Credit Card to equip Loot to three or more characters this game.
REWARD
Ongoing
You may bring +5 EB to games it must be spent on Gear.

### BOZOS
1. **Freakshow**: "Extra Limbs: +2" — **+2 to which stat?**
ANSWER --> Melee

2. **Tick Tick TickTickTick**: Very dense reward text (Impact tokens, Reflexes rolls, Obstacle die). Is my reading accurate?
ANSWER --> 
REWARD
Ongoing
At the start of the game, attach this card to any rival model. Every time that model activates, roll a RED die. On a critical or fumble discard this card and do the following: Place an Impact token in base contact with the model (it is the original targot), All models within REO must win a Reflexes roll vs. the Obstacle die or suffer a wound. The Obstacle die gains a bonus equal to the number of Luck tokens the player who controls this card has.

### GENERATION RED
1. **Hideout**: "Advanced Targeting Matrix" — **what's the full effect text?**
ANSWER --> 
OBJECTIVE
After setup, select a piece of terrain that is not in your deployment zone and announce it to your opponent, showing them this objective. End the game with more friendly models than rivals within reach of the selected terrain.
REWARD
Cybergear
Equip 1 Izzy with:
Advanced Targeting Matrix:
All of this model's non-melee attacks gain Accurate.

2. **Make It Look Like an Accident**: Reward text was partially obscured — can you confirm the ongoing effect?
ANSWER --> 
OBJECTIVE
Take out a rival using an action from a Loot card.
REWARD
Ongoing
Exhaust this card when you have control to move a friendly model YELLOW.


### LAWMEN
1. **Target Practice / Teleoptics**: What's the exact effect?
ANSWER --> 
Take out all of the rival team's Gonks. This Objective may only be completed if the rival team tarted with at least one Gonk.
REWARD
Cybergear
Equip 1 character with:
Teleoptics:
If the first action of this model's activation is a anged attack, it gains Deadly
--> La carte c'est Target Practice, pas Teleoptics

2. **Hit 'em First, Hit 'em Hard / Descrambler**: What's the exact effect?
ANSWER --> 
OBJECTIVE
Take out a rival that is farther than GREEN from your active model using a ranged attack.
REWARD
Cybergear
Equip your Leader with Descrambler:
+ 1 Influence +1 Tech

3. **Protect & Serve**: Has a "Protection:" sub-label in the reward — is this a game keyword or just flavor? --> not a keyword, just in the description
ANSWER --> 
 **Protect & Serve**:
OBJECTIVE
End a game with all rivals wounded or taken out.
REWARD
Ongoing
Protection:
Draw one Loot card during setup and equip it to any character

### MAELSTROM
1. **6 cybergear cards** with hard-to-read effects — can you provide exact names/effects for:
   - Lucky Shot ANSWER --> 
Cybergear
Equip 1 Specialist with:
Al Targeting Chip:
This model's ranged attacks gain Accurate.

   - Booster Boosters
Cybergear ANSWER --> 
Equip 1 Flenser with:
Blood Pump:
When a friendly model within RED takes a wound on a GREEN Action Token, replace it with a YELLOW Action Token (instead of RED).

   - Cyber-Rage ANSWER --> 
Ongoing
When activated, the first action taken by a Cyber-Character must be a melee attack if a rival is within RED.
That attack is Deadly.

   - Metal Over Meat ANSWER --> 
Cybergear
Equip your Leader with:
Faith In Metal:
During setup, place 3 Luck tokens on this model. Only friendly Cyber.
Characters may use these tokens.

   - Kneel Before Maelstrom ANSWER --> 
Recycles
Discard when Inspiring Your Team to Heal 1 wound from each friendly Cyber-Character.

   - A New Gang Rises ANSWER --> 
Ongoing
You may bring +5 EB to games.

### MAX-TAC
1. **Villianized Leader** — keep card's spelling or correct to "Villainized"? ANSWER --> Keep spelling (I said the opposite in an other answer, but final answer : keep spelling)

### PIRANHAS
1. **To-Go Bag**: Very dense reward text — can you verify the bomb mechanic description?
ANSWER --> 
At the start of the game, attach this card to any rival madal. Every time that model activates, roll a RED die.
On a critical or fumble discard this card and do the follawing: Place an Impact token in base contact with the model (it is the original target). All models within RED must win a Reflexes roll vs. the Obstacle die or suffer a wound. The Obstacle die gains a bonus equal to the number of Luck tokens the player who controls this card has.

### TYGER CLAWS
1. **Commanding Presence**: How should the Influence action with RYG range be stored? New DB fields needed? ANSWER --> YES

### WILD THINGS
1. **RAGE!!!** — 2 or 3 exclamation marks? Script has 2 (`RAGE!!`), card seems to show 3. ANSWER --> 3
