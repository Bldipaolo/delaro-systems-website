---
name: Delaro Systems
description: Architectural editorial design for an operational systems and technology consultancy.
colors:
  deep-navy: "#0B1F33"
  sea-glass: "#4E9D93"
  slate: "#2D3E4A"
  silver-gray: "#B8C0C7"
  warm-white: "#F6F4EE"
  error: "#883636"
  success: "#25685F"
proposedDerivedSurfaces:
  cinematic-ink: "#050D16"
  cinematic-deep: "#081827"
  media-scrim: "rgba(5, 13, 22, 0.34)"
typography:
  display:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(3.55rem, 6.4vw, 5.9rem)"
    fontWeight: 300
    lineHeight: 0.99
    letterSpacing: "-0.038em"
  headline:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(2.65rem, 4.6vw, 4.7rem)"
    fontWeight: 300
    lineHeight: 1.04
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(1.35rem, 2vw, 1.85rem)"
    fontWeight: 300
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.14em"
rounded:
  none: "0"
  control: "4px"
  round: "999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "18px"
  lg: "24px"
  xl: "32px"
  control-x: "19px"
  gutter: "clamp(20px, 5vw, 72px)"
  section: "clamp(96px, 12vw, 176px)"
visualRatios:
  darkField: "75%"
  warmEditorial: "20%"
  seaGlassIntervention: "5% maximum"
components:
  button-primary:
    backgroundColor: "{colors.warm-white}"
    textColor: "{colors.deep-navy}"
    rounded: "{rounded.control}"
    padding: "0 19px"
    height: "50px"
  button-dark:
    backgroundColor: "{colors.deep-navy}"
    textColor: "{colors.warm-white}"
    rounded: "{rounded.control}"
    padding: "0 19px"
    height: "50px"
  input:
    backgroundColor: "transparent"
    textColor: "{colors.deep-navy}"
    rounded: "{rounded.none}"
    padding: "13px 0 14px"
---

# Design System: Delaro Systems

## Overview

**Creative North Star: "The Operating Blueprint"**

Delaro's visual system treats the website as an architectural drawing of a business: measured, spacious, and explicit about relationships. Deep fields establish authority; warm editorial surfaces create moments for analysis; thin lines expose sequence, handoff, and causality.

The composition is premium but not ornamental. Type carries most of the expression, diagrams carry meaning, and Sea Glass appears only where attention or intervention is consequential. The result should feel like an architectural consultancy with technical fluency, never a packaged software product.

**Key Characteristics:**

- Navy-dominant editorial rhythm with selective warm-white analysis sections.
- Asymmetric twelve-column compositions and generous negative space.
- Fine linear diagrams, registers, and the recurring Linear Horizon.
- Restrained, state-driven motion that preserves reading order.
- Static-first cinematic media that remains legible and complete before any optional video enhancement loads.

## Cinematic foundation proposal

The approved brand colors remain unchanged. For photographic stages and deep page transitions, the implementation may derive **Cinematic Ink** (`#050D16`) and **Cinematic Deep** (`#081827`) from Deep Navy. These are proposed layout surfaces—not additions to the official brand palette—and must never replace Deep Navy in logos, brand documentation, or color-critical UI.

The proposed composition ratio is approximately 75% dark field, 20% Warm White editorial relief, and no more than 5% Sea Glass intervention. This ratio describes page rhythm, not a requirement for every viewport. The supplied asset manifest and approved cinematic mockup were reviewed before the homepage media stages were finalized.

## Colors

The palette moves between a cool, authoritative dark field and a warm paper field; Sea Glass is deliberately scarce.

### Primary

- **Deep Navy:** The dominant ground, primary dark control color, and strongest text on warm surfaces.

### Secondary

- **Sea Glass:** Meaningful intervention points, focus states, active navigation, and the Linear Horizon.

### Neutral

- **Slate:** Secondary dark surfaces, subdued copy, and low-contrast structure.
- **Silver Gray:** Dividers, diagram lanes, and quiet structural boundaries.
- **Warm White:** Primary light text and the editorial analysis surface.

**The Intervention Rule.** Sea Glass marks action, focus, or a consequential point in a system; it is not ambient decoration.

**The Two-Ground Rule.** Compose primarily on Deep Navy or Warm White. Slate supports hierarchy but does not become a third competing page ground.

## Typography

**Display Font:** Manrope (with sans-serif fallback)  
**Body Font:** Inter (with system-ui and sans-serif fallbacks)

**Character:** Light Manrope creates precise architectural scale; Inter keeps analysis, navigation, forms, and diagrams direct and highly legible.

### Hierarchy

- **Display:** Light, tightly tracked Manrope for the single dominant page statement.
- **Headline:** Light Manrope for section arguments, with compact line height and balanced wrapping.
- **Title:** Light-to-regular Manrope for capability names, sequence stages, and local headings.
- **Body:** Inter at a comfortable reading line height; long explanatory copy stays narrow enough to scan.
- **Label:** Semibold, tracked Inter for diagram metadata, indexes, and compact functional labels. It is never used as decorative filler.

**The One-Statement Rule.** Each viewport earns one dominant typographic statement; supporting copy remains visibly subordinate.

**The Sentence-Case Rule.** Headings and controls use natural sentence case. Uppercase is reserved for short functional metadata.

## Layout

The system uses a centered container capped at 1380px with a fluid outer gutter. Desktop layouts follow an editorial twelve-column logic expressed as asymmetric 4/8, 5/7, 6/6, and 3/9 divisions. Section spacing is intentionally large, and visible rules align to the same container geometry.

## Motion and media behavior

Motion explains hierarchy and operating relationships; it is not ambient decoration. First-screen copy and navigation use short one-time opacity/transform choreography. Below the fold, only section arguments, ordered sequences, Linear Horizon rules, and meaningful SVG relationships reveal as they enter the viewport. Diagram strokes draw once, then remain static. Interactive feedback stays under 240ms and uses explicit properties rather than `transition: all`.

Optional media video is progressive enhancement. The poster remains the canonical layout and fallback; video is hydrated only near the viewport, pauses offscreen and in hidden documents, and is skipped for reduced motion or data-saving preferences. Looping is opt-in, not the default. Reduced motion removes spatial movement while preserving immediate state feedback and legibility.

At 1060px, dense horizontal sequences begin to reflow. At 820px, navigation becomes a full-width disclosure and multi-column editorial layouts stack. At 620px, sequences become vertical, gutters settle at 22px, and section spacing becomes 90px. Process diagrams may scroll horizontally when preserving their causal structure is clearer than collapsing them.

**The Alignment Rule.** Major type, dividers, and diagram anchors share the container grid; small misalignments are treated as defects, not texture.

Reusable layout primitives include `.editorial-grid-12`, span utilities, `.dark-section`, and `.hairline-rule`. They preserve the existing 1380px container and do not introduce a component framework.

## Media architecture

`.media-stage` is the shared static-first media contract:

- A responsive `<picture>` is always the first visual layer and reserves its dimensions with an explicit aspect ratio and image dimensions.
- Desktop and mobile sources may use independent crops; `--media-position` and `--media-position-mobile` provide per-instance focal control.
- Key headings, body copy, actions, and navigation remain outside the media. Overlay content is supplemental metadata only.
- Optional `data-video-webm` and `data-video-mp4` attributes progressively add silent inline video. The poster remains visible until the video can play.
- Video enhancement is skipped for reduced-motion and Save-Data preferences, and playback pauses outside the viewport.
- Every stage carries an asset ID from the approved manifest. The homepage currently resolves `HERO-01`, `PHIL-01`, and `PARTNER-01` with responsive owner-supplied stills; no stock imagery is substituted.

## Elevation & Depth

The system is flat by default and uses tonal fields, borders, transparency, and whitespace for depth. Shadows do not lift content cards. The only ambient halo is the restrained Sea Glass intervention marker, where it communicates a selected point rather than elevation. The fixed header may use a translucent navy layer and blur while scrolling, with a solid fallback when reduced transparency is preferred.

Motion explains sequence, continuity, and response. The homepage entrance is the single authored focal sequence; supporting pages use shorter entrances, and scrolled content reveals only where hierarchy or process relationships benefit. Interface feedback remains under 300ms, while explanatory linework may run longer. Position changes use transforms, content changes use opacity, and the bounded process diagrams alone may animate stroke progression.

**The Flat-By-Default Rule.** Surfaces remain in the document plane; depth appears only when it clarifies navigation state or an intervention point.

**The Motion-Explains Rule.** Animate only to acknowledge input, preserve navigation continuity, or reveal an operational relationship. Nothing loops, follows the cursor, or moves merely because it is on screen.

## Shapes

Corners are nearly square. Buttons use a restrained control radius; inputs and editorial panels remain square; diagram nodes are circular because they represent events or intervention points. Hairline borders and horizontal rules supply most component boundaries. Large pills, floating capsules, and decorative organic silhouettes do not belong to this system.

## Components

### Buttons

- **Shape:** Compact rectangular control with a subtle 4px corner and a minimum 50px height.
- **Primary:** Warm White on Deep Navy pages; dark form submits invert to Deep Navy on Warm White.
- **Hover / Focus:** A slight two-pixel lift on pointer hover, Sea Glass border or outline, and a global high-visibility focus ring.
- **Active:** Brief 0.98 scale response; all motion collapses under reduced-motion preferences.
- **Variants:** Solid Warm White is reserved for the primary page action. Outline and quiet variants provide hierarchy without introducing Sea Glass-filled controls.

### Text Links

- **Style:** Sentence-case Inter with a thin underline or directional border treatment and a minimum 44px target.
- **State:** Sea Glass appears in the focus outline or directional indicator, not as decorative fill.

### Cards / Containers

- **Corner Style:** Square editorial planes.
- **Background:** Deep Navy, Slate, or Warm White according to section rhythm.
- **Shadow Strategy:** None.
- **Border:** One-pixel Silver Gray, Slate, or translucent variants.
- **Internal Padding:** Fluid and generous; colored containers retain at least 22px on small screens.

### Inputs / Fields

- **Style:** Transparent, square fields with a one-pixel bottom rule and explicit labels.
- **Focus:** Sea Glass rule plus the global focus-visible outline where applicable.
- **Error / Disabled:** Muted red messaging and borders; submit controls visibly enter a waiting state.

### Navigation

The full approved logo anchors a fixed 88px desktop header. The header is transparent over the opening stage and resolves to a subtle Cinematic Ink material after scroll. Links use compact Inter and a one-pixel active indicator. Below 820px, a 44px menu control opens a stacked, full-width dark navigation with 48px minimum row targets.

### Linear Horizon

A one- or two-pixel line connects named business states, process stages, or outcomes. It must encode sequence or relationship; it is not a generic section ornament.

## Do's and Don'ts

### Do:

- **Do** let typography, alignment, and negative space create the premium character.
- **Do** reserve Sea Glass for interventions, focus, and meaningful state changes.
- **Do** use fine rules and diagrams to make operations, causality, and measurement visible.
- **Do** preserve semantic reading order, keyboard access, reduced motion, reduced transparency, and increased contrast support.

### Don't:

- **Don't** introduce gradients, glowing backgrounds, stock business imagery, or cartoon illustration.
- **Don't** turn capabilities into identical product-package cards or invent proof points.
- **Don't** use oversized pills, heavy shadows, centered SaaS layouts, or ornamental motion.
- **Don't** add hero kickers by default; the homepage eyebrow is a specific approved exception, not a reusable page template.
