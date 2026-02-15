# Design System: Mission Prep Team Builder
**Project ID:** 10881063702047351382
**Stitch Screens:** 6 desktop screens (Mission Prep x2, HQ Dashboard, Faction Database, Netrunner Armory, Active Play Tracker)

## 1. Visual Theme & Atmosphere

The aesthetic is **Industrial Militaristic Night City** — a dense, high-contrast dark UI that feels like a tactical command terminal from 2077. Surfaces are pitch-black with razor-sharp geometry. Every element carries weight through neon glow effects, scanline overlays, and aggressive clip-path chamfers. The mood is tense, utilitarian, and immersive — the interface itself feels like cyberware.

Key atmospheric elements:
- **Scanline overlay**: Fixed fullscreen 4px repeating gradient at 10-20% opacity
- **Grid pattern background**: 40px grid of faint lines (#333 or #2a2a2a) at ~10% opacity
- **Corner bracket decorations**: Fixed L-shaped corner marks in viewport corners
- **Binary data streams**: Decorative monospace digits as ambient texture
- **Grayscale→Color transitions**: Character images start desaturated, colorize on hover/selection

## 2. Color Palette & Roles

### Core Colors
| Name | Hex | Role |
|------|-----|------|
| **Hazard Yellow** | `#FCEE0A` | Primary action, selected states, CTA buttons, leader badges, budget highlights |
| **Holographic Cyan** | `#00F0FF` | Secondary accent, info elements, progress bars, netrunner theme, system status |
| **Glitch Red** | `#FF003C` | Danger, critical status, flatlined state, attack programs, faction threat |
| **Pitch Black** | `#000000` | Page background, deepest surfaces |
| **Industrial Grey** | `#0D0D0D` | Card surfaces, elevated panels |
| **Ash Grey** | `#1A1A1A` | Surface accent, subtle elevation |
| **Void Grey** | `#121212` | Alternative surface, tech panels |

### Semantic Status Colors
| Name | Hex | Role |
|------|-----|------|
| **Matrix Green** | `#22C55E` | Ready/online status, HP healthy, success |
| **Caution Amber** | `#EAB308` | Injured/warning state, medium AP |
| **Danger Red** | `#EF4444` | Critical HP, threat indicators |
| **Cyber Purple** | `#A855F7` | Techie role badge, stat hexagons |
| **Neon Orange** | `#F97316` | Berserker/Maelstrom faction accent |

### Neon Glow Shadows
```
glow-yellow:  0 0 15px rgba(252, 238, 10, 0.6)
glow-cyan:    0 0 10px rgba(0, 240, 255, 0.5), 0 0 20px rgba(0, 240, 255, 0.3)
glow-red:     0 0 10px rgba(255, 0, 60, 0.5), 0 0 20px rgba(255, 0, 60, 0.3)
glow-green:   0 0 8px rgba(34, 197, 94, 0.8)
```

## 3. Typography Rules

### Font Stack
| Role | Family | Weights | Character |
|------|--------|---------|-----------|
| **Display / Headlines** | `Teko` | 500, 600, 700 | Tall condensed stencil. ALWAYS uppercase. Ultra-tight leading (`leading-none`). Wide letter-spacing (`tracking-wider` to `tracking-widest`). Used for names, titles, section headers. |
| **Body / UI Labels** | `Rajdhani` | 500, 600, 700 | Semi-condensed technical. Used for descriptions, button labels, navigation. Uppercase for labels, mixed case for descriptions. |
| **Mono / System** | `Share Tech Mono` | 400 | Fixed-width terminal aesthetic. Used for status readouts, version numbers, coordinates, data labels. ALWAYS uppercase with `tracking-widest`. |

### Scale
- Page titles: `text-6xl` to `text-8xl` Teko (HQ campaign name)
- Section headers: `text-4xl` to `text-5xl` Teko
- Card names: `text-3xl` to `text-4xl` Teko
- Card cost: `text-2xl` to `text-3xl` Teko
- Body text: `text-sm` Rajdhani
- Data labels: `text-[10px]` Share Tech Mono, `tracking-widest`, `uppercase`, `text-gray-500/600`
- Footer/system: `text-[10px]` Share Tech Mono

## 4. Component Stylings

### Buttons
- **Primary CTA** (Deploy): `bg-primary text-black font-cyber font-bold text-2xl uppercase tracking-widest clip-corner-br` with hover→white, active scale-95
- **Sort/Filter**: `bg-black text-gray-400 border border-gray-800 font-mono-tech uppercase clip-corner-tr` with hover→border-gray-500
- **Tab Active**: `clip-tab bg-primary text-black font-display font-bold text-xl uppercase`
- **Tab Inactive**: `clip-tab bg-black text-gray-500 border border-gray-800 hover:text-secondary hover:border-secondary`
- **FAB (floating)**: `bg-primary text-black p-4 clip-corner-tl` with hover spin icon

### Cards — Merc "Wanted Poster" (Mission Prep)
```
Container: bg-surface-dark border border-gray-800 clip-corner-tl-br overflow-hidden
Portrait:  h-64 bg-black, img grayscale→grayscale-0 on hover, scale-110 transition
Role badge: absolute top-2 right-2, bg-black/90 backdrop-blur, colored border+text per role
Name:       text-4xl font-cyber uppercase text-white, hover→text-primary
Cost:       text-3xl font-cyber text-primary (selected) or text-white (unselected)
AP cubes:   w-3 h-3, colored squares with neon glow shadow
Selected:   -left-1 w-2 bg-primary bar + bounce check badge top-right
```

### Cards — Roster (HQ Dashboard)
```
Outer:     clip-corner-both bg-black border border-gray-800 p-1
Glow ring: absolute -inset-0.5 bg-{color} opacity-0 group-hover:opacity-100
Header:    bg-black p-4 border-b, name left + role badge right (clip-corner-bl)
Stats:     HP bar (h-2 colored) + AP rectangles (h-2 w-5 bg-secondary)
Loadout:   4-col grid of icon squares (aspect-square bg-black border)
Status:    Bottom bar — green "Ready", yellow+pulse "Injured", red+pulse "FLATLINED"
```

### Cards — Faction Row (Database)
```
Accordion header: w-full bg-[#1a1a1a] border-l-4 border-{faction-color} p-4 flex between
Faction icon:     h-10 w-10 bg-{color} text-black font-display font-bold
Expanded panel:   bg-black/80 p-6 grid 3-col gap-6
Unit card:        bg-surface-dark border, stat grid (MOV/ARM/COST), skill rows with dice cubes
```

### Stat Bars
```
Container: w-full bg-black h-2 border border-gray-800
Fill:      bg-{color} h-full w-[%] shadow-[0_0_15px_rgba({color},0.4)]
Endpoint:  absolute right-0 w-px bg-white
```

### Budget Tracker (Header)
```
Container: bg-surface-dark px-8 py-2 border border-secondary/50 clip-corner-br
Label:     text-xs font-mono-tech text-secondary uppercase tracking-widest
Value:     text-3xl font-cyber text-white + /2000 EB in text-gray-500
Progress:  h-1 bg-black border border-gray-800, fill bg-secondary with cyan glow
```

### Recruit CTA (Empty Slot)
```
border-2 border-dashed border-gray-800 hover:border-primary
bg-black clip-corner-tl-br min-h-[400px]
Icon: w-24 h-24 clip-corner-tr bg-surface-dark border, hover→bg-primary
Text: font-cyber text-3xl text-gray-600 hover:text-white uppercase
Subtitle: font-mono-tech text-xs text-secondary, opacity-0→100 on hover
```

## 5. Geometry & Shape Language

### Chamfered Corners (Clip-Paths)
The signature visual element — **45-degree chamfers** replace rounded corners everywhere:
```css
/* Bottom-right chamfer (buttons, badges) */
clip-corner-br: polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)

/* Top-left + Bottom-right double chamfer (cards, main containers) */
clip-corner-tl-br: polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)

/* Top-right chamfer (sort buttons, icons) */
clip-corner-tr: polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)

/* Tab shape */
clip-tab: polygon(15px 0, 100% 0, 100% 100%, 0 100%, 0 15px)
```

### Border Radius
Globally set to `0px` — NO rounded corners anywhere except explicit full-round status indicators.

### Depth & Elevation
- **Flat by default** — zero shadow on most elements
- **Neon glow on interaction**: `shadow-[0_0_15px_rgba(color)]` on hover/active states
- **Selection glow**: Primary yellow glow strip on selected card's left edge
- **Hard shadow** on CTA: `shadow-[4px_4px_0px_rgba(0,240,255,0.5)]` (cyan offset)
- **Backdrop blur**: `backdrop-blur-md` on sticky headers only

## 6. Layout Principles

### Spacing
- Page max-width: `max-w-7xl` (80rem / 1280px)
- Page padding: `p-4 md:p-8`
- Card grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`
- Section margin: `mb-8` to `mb-12`
- Card internal padding: `p-4` to `p-5`

### Visual Hierarchy Indicators
- **Section headers**: Left border-4 primary + pl-6 + bg-gradient from surface-dark to transparent
- **Active tab**: Solid primary background, black text
- **Selected card**: Yellow left edge bar + bounce check badge
- **Faction grouping**: Left border-4 in faction color

## 7. Animations & Effects

| Effect | Implementation | Usage |
|--------|---------------|-------|
| **Glitch hover** | `translate(-2px, 2px)` keyframe loop 0.3s | Title text on hover |
| **Scanlines** | Fixed fullscreen repeating gradient 4px | Always-on ambient overlay |
| **Card lift** | `hover:-translate-y-1 transition-transform` | Unselected merc cards |
| **Image zoom** | `group-hover:scale-110 transition-transform duration-500` | Card portraits |
| **Neon pulse** | `animate-pulse` on status indicators | Online dots, deploy arrow |
| **Selection bounce** | `animate-bounce` on check badge | Selected card indicator |
| **Scan sweep** | `translate-x-[-100%] → [100%] duration-1000` | Budget tracker hover |

## 8. Screen Map → App Routes

| Stitch Screen | App Route | Status |
|--------------|-----------|--------|
| Mission Prep Team Builder | `/play` (or `/match/prep`) | To implement |
| HQ Campaign Dashboard | `/hq` | Partial (needs redesign) |
| Faction Database Catalog | `/database` | Partial (needs redesign) |
| Netrunner Program Armory | `/armory` | Stub only |
| Active Play Dataslate Tracker | `/play` (active match) | To implement |
| Character Skill & Activation Panel | Modal/Sheet overlay | To implement |
