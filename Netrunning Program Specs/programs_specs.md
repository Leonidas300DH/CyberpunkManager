# 🚀 FEATURE SPECIFICATION: Hacking Programs Database & Native Card Rendering
*AI Agent Instruction: The user is migrating AWAY from a legacy image-generation workflow. The application MUST act as the ultimate card manager and rendering engine. The app must ingest ALL 32 raw columns from the provided CSV, store them in the database, and use the boolean flags to dynamically render the cards natively in the UI (HTML/CSS) using the data and base artwork URLs. Do NOT expect pre-rendered full card images.*

### 1. DATA MODEL (TypeScript)
Create the following schema to perfectly match the user's 32-column CSV structure. Do not omit any column.

```typescript
export interface HackingProgram {
  id: string; // UUID (Auto-generated)
  name: string; // Maps to HackingName
  factionId: string; // Maps to Faction
  costEB: number; // Maps to CostEB
  reqStreetCred: number; // Maps to ReqCred
  rarity: number; // Maps to Rarity
  
  // -- BASE ARTWORKS (Just the illustration, not the full card) --
  imageFrontUrl: string; // Maps to ImageFront
  imageBackUrl: string;  // Maps to ImageBack
  
  // -- TEXTS --
  textFront: string; // Maps to Text_Front
  textEffectBack: string; // Maps to TextEffect_Back

  // -- RENDERING FLAGS (Booleans used to conditionally render UI elements) --
  
  // Background/Quality Colors
  catRed: boolean; 
  catYellow: boolean; 
  catGreen: boolean; 
  
  // Range & Skill Indicators
  isSkillTest: boolean; 
  isRed: boolean; // Maps to IsRED
  isYellow: boolean; 
  isGreen: boolean; 
  isLongRange: boolean; 
  
  // Front Specific Badges / UI Layers (IS3 to IS7)
  is3_Front: boolean; is4_Front: boolean; is5_Front: boolean; 
  is6_Front: boolean; is7_Front: boolean;

  // Back Specific Badges / UI Layers (IS3 to IS12)
  is3_Back: boolean; is4_Back: boolean; is5_Back: boolean; 
  is6_Back: boolean; is7_Back: boolean; is8_Back: boolean; 
  is9_Back: boolean; is10_Back: boolean; is11_Back: boolean; 
  is12_Back: boolean;
}
```

### 2. CSV SEEDING SCRIPT
Write a robust script (using `papaparse` or `csv-parse`) to ingest the user's `programs.csv` file. 

**Critical Parsing Rules:**
1.  **Text Fields:** `Text_Front` and `TextEffect_Back` contain literal line breaks (newlines inside quotes). The parser MUST preserve them.
2.  **Booleans:** Convert the strings `"TRUE"` and `"FALSE"` from the CSV into actual TypeScript booleans (`true` / `false`).
3.  **Integers:** Parse `CostEB`, `ReqCred`, and `Rarity` as numbers.
4.  **Column Mapping:** Map the CSV headers exactly to the interface properties above (e.g., `HackingName` -> `name`, `ImageFront` -> `imageFrontUrl`, `IsRED` -> `isRed`).

### 3. UI/UX REQUIREMENTS

You must build TWO specific views for this module:

#### View A: The Database Table (List View)
*   **Purpose:** A data table to view, filter, and manage all Hacking Programs.
*   **Columns:** Name, Faction, Cost, Cred, Rarity. Add visual badges for Quality (Red/Yellow/Green derived from the `cat...` booleans) and Range (Derived from `isRed/isYellow/isGreen/isLongRange`).
*   **Interaction:** Clicking a row opens the Detail View (View B).

#### View B: The Visual Card Viewer (Side-by-Side Dynamic Rendering)
*   **Purpose:** To dynamically render the physical cards using React/Vue components and Tailwind CSS.
*   **Layout:** Display the Front card and the Back card **side-by-side** (or stacked vertically on small screens).
*   **Native Rendering Logic (Build a `<ProgramCard />` component):**
    *   **Background Theme:** Use `catRed`, `catYellow`, `catGreen` to apply a specific border/header color to the card component (e.g., `if (program.catRed) apply 'bg-red-900 border-red-500'`).
    *   **Art:** Display the `imageFrontUrl` / `imageBackUrl` as the card's main artwork layer (`object-cover`).
    *   **Text:** Overlay `textFront` and `textEffectBack` with readable styling (e.g., dark semi-transparent background, white text). Handle line breaks correctly using `whitespace-pre-wrap`.
    *   **Icons Overlay (The boolean flags):** Create an absolute positioned overlay area for badges. Conditionally render placeholders for the boolean flags. 
        * *Example:* `{program.isSkillTest && <Icon name="gear" />}`
        * *Example:* `{program.isRed && <Badge color="red">Red Range</Badge>}`
        * *Example:* `{program.is3_Front && <Badge>IS3 Front</Badge>}` (Use generic visual placeholders for the unknown `IS...` flags until the user maps exact graphic assets to them later).