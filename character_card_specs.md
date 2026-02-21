# Character Card UI Specifications
*(Based on analysis of `public/images/characters examples/1_Hyena.jpg`)*

## 1. Visual Concept
The character card follows a **"Vertical Datapad Dossier"** aesthetic. It prioritizes the artwork while overlaying critical game information in distinct, high-contrast zones.

### Key Aesthetic Elements1
-   **Orientation**: Portrait (Vertical Card).
-   **Theme**: "Night City Data Stream" — dark semi-transparent overlays, neon accents (Purple/Green/Yellow), and tech-greeble (barcodes, connection lines).
-   **Typography**: Industrial sans-serif (e.g., Teko/Rajdhani).
    -   *Headers*: Rotated vertical text.
    -   *Values*: Large, high-impact numbers.

## 2. Layout Breakdown

The card is divided into layers and zones:

### Layer 1: The Portrait (Background)
-   **Content**: Full-height character artwork (`imageUrl`).
-   **Treatment**: Dark gradient overlay at the bottom to ensure text readability for abilities.

### Layer 2: The HUD Overlays

#### A. Identity Rail (Left Sidebar)
Located along the left edge, reading bottom-to-top.
-   **Text**:
    -   **Name** (Large, Bold): e.g., "Hyena".
    -   **Faction/Archetype** (Smaller, Thin): e.g., "Edgerunner".
-   **Style**: Rotated 90 degrees counter-clockwise.

#### B. Cost & Registration (Bottom Left Corner)
-   **Visual**: A vertical barcode element.
-   **Value**: "ED [Cost]" (e.g., "ED 15").
-   **Data Source**: `ModelProfile.costEB`.

#### C. Action Network (Top Left Floating)
A visual representation of the model's Action Tokens.
-   **Visual**: A vertical connected path.
    -   **Node 1 (Top)**: Green Hexagon (Green Action).
    -   **Node 2 (Middle)**: Yellow Triangle (Yellow Action).
    -   **Node 3 (Bottom)**: Red Square? (If applicable).
-   **Logic**:
    -   Icons light up based on `ModelProfile.actionTokens`.
    -   Connections imply the sequence of available actions.

#### D. Stats Column (Top Right Floating)
A vertical stack of hex-framed icons acting as the primary stat block.
-   **Container**: A dark, semi-transparent panel with a tech-border.
-   **Stat Entries** (Top to Bottom):
    1.  **Melee** (Purple Hex, Fist Icon): Value (e.g., "2").
    2.  **Reflexes** (Purple Hex, Curved Arrow/Evasion Icon): Value (e.g., "1").
    3.  **Influence/Tech** (Purple Hex, Exclamation/Speech Icon): Value (e.g., "1").
-   **Data Source**: `ModelProfile.skills`.

#### E. Ability Panels (Bottom Overlay)
Stacked horizontal panels displaying passive rules and active abilities.
1.  **Passive Ability Block**:
    -   **Header**: Ability Name (e.g., "Scary") in Green.
    -   **Body**: Rules text.
    -   **Data Source**: `ModelProfile.passiveRules` / Keywords.
2.  **Action/Weapon Block**:
    -   **Header**: Action Name (e.g., "Cybernetic Claws") in Green.
    -   **Range Indicator**: A visual bar showing range (Red/Yellow/Green segments).
        -   *Example*: Red segment filled for "Red" range.
    -   **Body**: Effect text (e.g., "+1 to Melee...").
    -   **Data Source**: `ModelProfile.actions`.

## 3. Component Architecture (Proposed)

```typescript
// <CharacterCard />
// -----------------
// Parent container with aspect-ratio and relative positioning.

<div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
  
  {/* 1. Background Image */}
  <img src={lineage.imageUrl} className="absolute inset-0 h-full w-full object-cover" />

  {/* 2. Left Identity Rail */}
  <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black/80 to-transparent">
    <div className="-rotate-90 origin-bottom-left translate-y-full ...">
      <h2 className="text-4xl font-bold uppercase text-white">{lineage.name}</h2>
      <span className="text-xl text-zinc-400">{missionFaction}</span>
    </div>
    {/* Barcode & Cost */}
    <div className="absolute bottom-4 left-2">
      <BarcodeIcon className="h-12 w-8 text-white/50" />
      <span className="font-mono text-lg font-bold text-white">ED {profile.costEB}</span>
    </div>
  </div>

  {/* 3. Action HUD (Top Left, floated right of rail) */}
  <div className="absolute top-4 left-14 flex flex-col items-center gap-1">
    <ActionToken type="green" active={tokens.green > 0} />
    <div className="h-4 w-1 bg-white/20" />
    <ActionToken type="yellow" active={tokens.yellow > 0} />
    {/* ...etc */}
  </div>

  {/* 4. Stats Column (Top Right) */}
  <div className="absolute top-4 right-2 flex flex-col gap-2 bg-black/60 p-1 backdrop-blur-sm border-l-2 border-purple-500 rounded-bl-xl">
    <StatHex icon={<Fist />} value={skills.Melee} color="purple" />
    <StatHex icon={<ArrowUpRight />} value={skills.Reflexes} color="purple" />
    <StatHex icon={<MessageCircle />} value={skills.Influence} color="purple" />
  </div>

  {/* 5. Ability Panels (Bottom Stack) */}
  <div className="absolute bottom-2 right-2 left-14 flex flex-col gap-2">
    {/* Passive */}
    {profile.passiveRules && (
        <AbilityCard title="Passive" text={profile.passiveRules} />
    )}
    
    {/* Weapons/Actions */}
    {profile.actions.map(action => (
        <ActionCard 
            key={action.id}
            name={action.name} 
            range={action.range} 
            effect={action.effectDescription} 
        />
    ))}
  </div>

</div>
```
