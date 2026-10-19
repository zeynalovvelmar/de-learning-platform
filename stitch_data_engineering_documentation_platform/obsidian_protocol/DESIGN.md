---
name: Obsidian Protocol
colors:
  surface: '#121318'
  surface-dim: '#121318'
  surface-bright: '#38393f'
  surface-container-lowest: '#0d0e13'
  surface-container-low: '#1a1b21'
  surface-container: '#1e1f25'
  surface-container-high: '#292a2f'
  surface-container-highest: '#34343a'
  on-surface: '#e3e1e9'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#e3e1e9'
  inverse-on-surface: '#2f3036'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb783'
  on-tertiary: '#4f2500'
  tertiary-container: '#d97721'
  on-tertiary-container: '#452000'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdcc5'
  tertiary-fixed-dim: '#ffb783'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#703700'
  background: '#121318'
  on-background: '#e3e1e9'
  surface-variant: '#34343a'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Geist
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Geist
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-sm:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  code-block:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: -0.01em
  code-inline:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0em
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.06em
  label-ui:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The design system establishes a publication-grade, technical documentation environment crafted for systems architects, infrastructure engineers, and senior developers. The aesthetic blends rigorous Scandinavian minimalism with high-density developer ergonomics, drawing lineage from terminal utilities, modern IDEs, and precision reference volumes.

Key pillars:
- **Quiet Authority**: No gratuitous decoration, illustrations, or celebratory gamification. Visual hierarchy is established through typographic discipline, structural 1px linear divisions, and subtle luminosity shifts.
- **Cognitive Clarity**: Layouts prioritize deep, sustained reading and code scanning. Information density is high yet breathable, favoring predictable geometry, strict horizontal alignments, and clear semantic landmarks.
- **Instrument Precision**: Interactions behave like high-grade hardware tools—instantaneous, tactile through precise border contrast shifts, and zero motion lag.

## Colors

The palette is engineered exclusively for an immersive, zero-fatigue dark experience. Surfaces are divided into structured tonal tiers rather than saturated planes:

- **Canvas Deep Base (`#090a0f`)**: The foundational void. Used for outer gutters, system backdrops, and navigation gutters.
- **Surface Layer 1 (`#12141c`)**: Main editorial panels, article canvases, and high-density content cards.
- **Surface Layer 2 (`#1a1d28`)**: Active interactive layers, dropdowns, sticky headers, and secondary tooling bars.
- **Code Surface (`#0d0e15`)**: Deep-inset container dedicated exclusively to code blocks, payload viewports, and CLI terminal mocks.
- **Structural Outlines (`#27272a` / `#1e293b`)**: Razor-thin dividers that construct the spatial wireframe without visual bulk.
- **Text Primary (`#f8fafc`)**: Crisp, non-glare monochrome text tuned for optical reading against deep slate.
- **Text Muted (`#94a3b8`)**: Secondary technical context, breadcrumbs, timestamps, and metadata.
- **Text Subtle (`#475569`)**: Inactive iconography, placeholder strings, and minor schema dividers.
- **Execution Primary (`#6366f1`)**: Reserved strictly for high-intent operations: focused states, active API version selectors, and primary navigation active markers.
- **Execution Success (`#10b981`)**: Dedicated exclusively to system uptime indicators, HTTP 200/OK tags, live execution statuses, and copy-buffer confirmation.

## Typography

The typography pairs the neutral geometric clarity of Geist with the mechanical precision of JetBrains Mono. 

- **Geist** commands all structural hierarchies: headings, editorial run-text, documentation articles, and core navigation. Line height in running prose (`body-lg`) is calibrated to an open 28px on a 16px base, preventing horizontal tracking fatigue during extended study of technical specifications. Headings maintain negative tracking to maintain density at larger optical weights.
- **JetBrains Mono** governs the entire technical telemetry layer: syntax blocks, payload keys, endpoint URIs, keyboard shortcuts, version tags, and schema specs. Inline code tags adopt a reduced 12px scale embedded within 14px/16px body prose to ensure vertical grid metrics remain unperturbed.

## Layout & Spacing

The layout is architected around a tripartite fixed/fluid desktop reference grid that standardizes documentation platforms:

- **Left Rail (Fixed 260px - 280px)**: Global documentation hierarchy, versioning switches, and high-level section groups.
- **Center Canvas (Fluid, max-width 780px - 840px)**: The reading column. Strict max-width constraint guarantees an optimal 65-75 character reading measure for technical prose.
- **Right Rail (Fixed 220px - 240px)**: In-page "On This Page" outline, schema metadata, and API executor status.

### Form Factor Behavior
- **Desktop (>= 1280px)**: Full three-column layout. Main document column remains pinned to its max-width, horizontally aligned with comfortable outer margins.
- **Tablet (768px - 1279px)**: Right rail collapses into an interactive sticky secondary sub-bar below the global header. Center canvas spans available space between left navigation and the viewport edge.
- **Mobile (< 768px)**: Left navigation folds into an off-canvas drawer. Outer margins compress to 1rem. Content cascades into a single column with full-width code samples and responsive table overflow scrollports.

## Elevation & Depth

This design system rejects heavy blur effects, multi-stop colorful dropshadows, and skeuomorphic layers. Visual elevation relies strictly on **tonal stepping** and **1px structural borders**:

- **Tier 0 (Base)**: `#090a0f` Canvas base.
- **Tier 1 (Surface Cards & Panels)**: `#12141c` bounded by a 1px solid `#1e293b` border. No drop shadow.
- **Tier 2 (Popovers, Flyouts, Search Palettes)**: `#1a1d28` bounded by a 1px solid `#27272a`. Supported only by a micro ambient occlusion shadow: `0 8px 24px -4px rgba(0, 0, 0, 0.6)`.
- **Inset Wells (Code & Terminals)**: Inset `#0d0e15` with a subtle top boundary shadow `inset 0 1px 2px rgba(0, 0, 0, 0.4)` and a 1px exterior perimeter of `#1e293b`.

## Shapes

The geometric vocabulary is clipped, deliberate, and architectural. Roundedness uses soft 0.25rem (4px) values across fundamental controls, expanding to 0.5rem (8px) for larger surface containers and code blocks.

- **Micro Elements (Badges, Buttons, Inputs, Inline Tags)**: 4px (`rounded`).
- **Macro Elements (Code blocks, Cards, Callout Wells, Modals)**: 8px (`rounded-lg`).
- **No pill shapes**: Pill geometries are strictly prohibited to avoid playful or consumer-app connotations.

## Components

### Buttons
- **Primary / Execution**: Background `#6366f1`, text `#ffffff`, border transparent. On hover: `#4f46e5`. Padding: `0.5rem 1rem`. Typography: `label-ui`.
- **Secondary / Default**: Background `#12141c`, text `#f8fafc`, 1px solid border `#27272a`. On hover: border `#475569`, background `#1a1d28`.
- **Ghost / Tooling**: Background transparent, text `#94a3b8`, no border. On hover: text `#f8fafc`, background `#12141c`.

### Code Blocks & Syntax Panels
- Surface `#0d0e15`, 1px solid border `#1e293b`. 
- Header bar: 36px height, displaying the target language in `label-caps` (`#94a3b8`) on the left, and an icon-only "Copy Snippet" button on the right.
- Copy confirmation: Temporarily transitions the icon to an emerald checkmark (`#10b981`) for 1500ms.
- Line numbers styled in JetBrains Mono 12px with `#334155` text color, non-selectable (`user-select: none`).

### Input Fields & Search (Command Bar)
- Background `#090a0f`, text `#f8fafc`, border 1px solid `#27272a`.
- Focus ring: No glowing halos. Focus is signaled solely via a 1px border shift to `#6366f1`.
- Search Palette (`Cmd+K`): Fixed overlay container, background `#12141c`, border 1px solid `#27272a`, with item selection indicated by `#1a1d28` background and a 2px left border accent in `#6366f1`.

### Callouts & Admonitions
- Bordered rectangular wells (8px radius) with a 1px solid outline and a 3px solid vertical left accent border.
- **Info**: Background `rgba(99, 102, 241, 0.05)`, border `rgba(99, 102, 241, 0.2)`, left accent `#6366f1`.
- **Success**: Background `rgba(16, 185, 129, 0.05)`, border `rgba(16, 185, 129, 0.2)`, left accent `#10b981`.
- **Warning**: Background `rgba(245, 158, 11, 0.05)`, border `rgba(245, 158, 11, 0.2)`, left accent `#f59e0b`.

### Checkboxes & Segmented Controls
- Checkboxes: 16px squares, 2px radius, background `#090a0f`, border 1px solid `#27272a`. Checked state: background `#6366f1`, border `#6366f1`, with a sharp white checkmark vector.
- Segmented Switches (e.g., cURL / Node / Python tabs): Enclosed within a `#090a0f` container, 1px border `#1e293b`. Active tab has background `#1a1d28`, text `#f8fafc`, and a crisp 4px radius.

### API Method Badges
- Strict monospaced micro-chips (`label-caps`). 
- `GET`: Background `rgba(16, 185, 129, 0.1)`, text `#10b981`, border 1px solid `rgba(16, 185, 129, 0.2)`.
- `POST`: Background `rgba(99, 102, 241, 0.1)`, text `#818cf8`, border 1px solid `rgba(99, 102, 241, 0.2)`.
- `DELETE`: Background `rgba(239, 68, 68, 0.1)`, text `#f87171`, border 1px solid `rgba(239, 68, 68, 0.2)`.