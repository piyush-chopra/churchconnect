---
name: ChurchConnect
description: A calm ministry careers workspace with editorial warmth.
colors:
  ink: "#243d31"
  muted: "#5e6c62"
  green: "#254e3f"
  green-hover: "#183c2e"
  border: "#d9e1d8"
  paper: "#f5f7f3"
  sage: "#eaf0e6"
  white: "#fff"
  metadata: "#5e6c62"
  focus: "#8baf99"
  hero-sage: "#eaf0e6"
  nav-active: "#eaf0e6"
  field-surface: "#f5f7f3"
  field-border: "#d9e1d8"
  card-border: "#d9e1d8"
  error-surface: "#fff0ed"
  error-ink: "#903d31"
typography:
  display:
    fontFamily: "Lora, serif"
    fontSize: "42px"
    fontWeight: 400
    lineHeight: 1.18
    letterSpacing: "-1.2px"
  headline:
    fontFamily: "Lora, serif"
    fontSize: "31px"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "-0.9px"
  title:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    letterSpacing: "-0.4px"
  body:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "12px"
    fontWeight: 600
  metadata:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "11px"
rounded:
  tag: "4px"
  category: "6px"
  control: "7px"
  navigation: "8px"
  inset: "10px"
  card: "11px"
  panel: "12px"
  hero: "13px"
  dialog: "15px"
spacing:
  compact: "4px"
  small: "8px"
  medium: "12px"
  regular: "16px"
  roomy: "24px"
  panel: "28px"
  desktop-gutter: "40px"
components:
  button-primary:
    backgroundColor: "{colors.green}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "11px 17px"
  button-primary-hover:
    backgroundColor: "{colors.green-hover}"
  button-secondary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.green}"
    rounded: "{rounded.control}"
    padding: "11px 17px"
  input:
    backgroundColor: "{colors.field-surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "11px 12px"
  nav-active:
    backgroundColor: "{colors.nav-active}"
    textColor: "{colors.green}"
    rounded: "{rounded.navigation}"
    padding: "13px 14px"
  category:
    rounded: "{rounded.category}"
    padding: "7px 10px"
  job-card:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.card}"
    padding: "22px 21px 19px"
  hero:
    backgroundColor: "{colors.hero-sage}"
    rounded: "{rounded.hero}"
    padding: "34px 39px"
  dialog:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.dialog}"
    padding: "28px"
---

# Design System: ChurchConnect

## Overview

**Creative North Star: "Community Garden"**

The Community Garden direction pairs warm paper and sage surfaces with deep forest actions. Lora gives welcome and guidance headings an editorial voice; DM Sans keeps search, application, and account controls compact and direct. A generated community photograph replaces the decorative arches. Product headings use DM Sans; the inherited Lora welcome headline retains the brand’s editorial voice.

This is a scan of the implemented React interface, merging the provisional direction contract into the current system. The direction was implemented in code after the user requested proceeding from the reference; no image composition was approved. The descriptive language records that inherited direction rather than an additional user approval.

**Key Characteristics:**

- Warm neutral canvas and restrained green actions.
- Serif editorial headings paired with compact sans-serif task controls.
- Flat bordered job cards and gently rounded inset panels.
- Persistent desktop navigation that becomes a mobile drawer and bottom bar.

## Colors

The palette uses forest green for commitment, pale sage for support, and warm near-white for the working canvas. The frontmatter records the reusable source values; one-off logo and illustration tints remain in the stylesheet.

### Primary

- **Forest action:** `green` and `green-hover` identify primary actions and their hover state.
- **Sage support:** `sage`, `hero-sage`, and `nav-active` provide restrained section and selection emphasis.

### Neutral

- **Forest ink:** `ink` carries primary reading content; `muted` supports secondary copy.
- **Readable metadata:** `metadata` is the final override for location/work details, salary suffixes, and sample notices.
- **Warm paper and white:** `paper` is the page canvas; `white` is the sidebar, cards, and dialogs.
- **Soft borders:** `border`, `field-border`, and `card-border` separate surfaces without heavy elevation.
- **Field surface:** `field-surface` distinguishes editable fields from white containers.

Focus uses the visible sage outline token. Errors pair the warm error surface with dark red text. These status treatments supplement text rather than replacing it.

## Typography

**Display Font:** Lora, serif fallback. **Body Font:** DM Sans, sans-serif fallback.

Editorial headings use regular weight with tight spacing; job titles, labels, and actions use sans-serif medium or semibold weight. The frontmatter reflects the standard desktop roles rather than a mathematical scale. Paragraphs normally use a comfortable line height; individual supporting sections range from 1.5 to 1.9.

The Taste refinement uses 30px DM Sans page headings, a 30–42px Lora hero, 18px job titles (16–17px on phones), 12–13px metadata, and 16px form inputs. See `frontend/src/taste.css` for the final responsive values.

## Layout

Desktop uses a fixed 238px sidebar, an 88px top bar, and a centered content region with 40px side gutters and a 1440px maximum width. The job board is a flexible results column with a 246px supporting résumé rail and a 27px gap. Search spans the content region above the board. Spacing is tuned per component; the frontmatter lists recurring values, not an enforced universal scale.

- At 1550px and wider, content expands to a 1450px maximum and the rail to 280px with a 35px gap.
- At 1200px and below, the sidebar is 212px, gutters are 28px, and the rail is 218px.
- At 1000px and below, the sidebar is 194px with 25px gutters; the board becomes one column and the support rail becomes two columns below the results.
- At 760px and below, the sidebar becomes a 240px drawer, hidden with `visibility: hidden` while closed. A scrim covers the workspace while open. The main offset disappears, the top bar is 68px, and content gutters are 20px. Bottom navigation stays fixed with safe-area padding. Search changes to a full-width query row above location and submit. Categories scroll horizontally. Application rows wrap, informational pages stack, and toasts clear the bottom navigation.
- At 420px and below, content gutters are 16px, the support rail and form grids become single columns, and the hero decoration recedes further.

The body supports a 320px minimum width. Footer spacing reserves room for mobile navigation. The 390px, 768px, and 1440px sizes in the initial direction are review targets, not CSS breakpoints. See TESTING.md for the browser verification record.

## Elevation & Depth

Most of the workspace is flat: borders, white surfaces, and sage insets create hierarchy. Job cards change border color on hover. The search bar uses a near-imperceptible shadow; selected segmented controls use a small lift. Dialogs and toast notifications have stronger shadows because they sit above the workspace. Exact shadow values are in the sidecar.

Motion is functional: state transitions are 150–180ms, buttons press to 0.98 scale, and the drawer translates horizontally. Focused-button presses suppress scaling. Job discovery loading uses three static skeleton cards that mirror the result layout. Reduced-motion settings disable animations and transitions.

## Shapes

Controls have gentle corners, cards and panels use slightly broader rounding, and dialogs use the largest ordinary corner radius. Avatars and status dots are circular; status pills are fully rounded. The upload target uses a dashed border. The welcome photograph is decorative and carries no claim about a real organization. Icons use consistent Lucide outlines.

## Components

### Buttons

Primary buttons use forest fill and white semibold text with a 43px minimum height. Secondary buttons use white fill, forest text, and a fine green-gray border. Text actions remain compact and underline on hover. Icon actions use a 36px square baseline; mobile bookmarks become 40px squares. Hover changes fill, visible focus has a 3px outline with a 3px offset, and disabled buttons reduce opacity to 0.55. Dialog actions have a 45px mobile minimum height.

### Chips

Category filters are outlined rounded rectangles; active filters use sage fill, a stronger green border, and semibold text. Mobile categories have a 40px minimum height. Passive skill tags use pale backgrounds and the final 11px metadata size; match tags have stronger green emphasis. Saved and selected states remain explicit in the accessible control state.

### Cards / Containers

Job cards are white, thinly bordered, and shadowless, with a stronger hover border. Their information order is organization and title, location/work metadata, then tags and salary separated by a subtle rule. Résumé prompts use a sage inset and editorial heading. Workspace panels hold account and hiring tasks in a larger bordered container.

### Inputs / Fields

Inputs, selects, and textareas use a pale field surface, a thin border, and rounded corners with an associated visible label. Standard fields have a 43px minimum height; textareas resize vertically with a 90px minimum. Search groups query and location controls within a shared white container. The global visible-focus outline applies to keyboard operation. Inline errors use readable red text on a warm pale background. The upload dropzone changes border and background while dragging.

### Navigation

Desktop navigation combines an outline icon, label, and optional count. Active rows use sage fill and heavier green text; hover uses a lighter fill. On mobile, four bottom actions complement the drawer. Closed drawer visibility is removed as well as translated offscreen, preventing hidden navigation from remaining focusable.

### Welcome arch panel

The signature welcome panel is a pale sage field with a large Lora headline, italic green emphasis, one action, and overlapping rounded arches. The illustration crops more aggressively on narrow screens and its caption disappears. Preserve the clear foreground reading order.

### Dialogs and feedback

Native modal dialogs use a 480px maximum width, or 680px for wide content, constrained to the viewport with scrolling. Opening uses `showModal()` and closing restores the prior focus. Loading, empty, error, saved, and applied states are explicit. Toasts announce through a status region and sit above mobile navigation. Frontend installation guidance uses the same dialog treatment; private API responses are not part of the offline cache.

## Do's and Don'ts

### Do:

- Do use Lora for editorial headings and DM Sans for controls and job data.
- Do preserve salary, work arrangement, sample notices, and explicit saved/applied states.
- Do apply the final metadata contrast and sizing overrides when adding job cards.
- Do keep mobile navigation reachable, the closed drawer hidden, and focus visible.
- Do preserve reduced-motion support and focus restoration for native dialogs.

### Don't:

- Don't introduce heavy card shadows into the flat job board.
- Don't use the arch illustration behind form labels or dense job information.
- Don't remove sample-data labeling or imply that keyword matches assess qualifications.
- Don't substitute icon-only actions for the existing labeled primary actions.


## Taste refinement · 4 October 2026

The final refinement layer is `frontend/src/taste.css`, imported after the original layout stylesheet. It takes precedence over baseline component measurements above. This is a preservation redesign with variance 5, motion 3, and density 4; existing routes, labels, form order, logo, and privacy copy remain stable.

- Desktop top bar: 76px. Cards and dialogs: 12px radius. Controls: 8px radius and at least 44px for primary actions.
- Hero: asymmetric copy/photo split, content determines height; mobile stacks a 130px photograph below the copy. Image is 124 KB WebP, with dimensions reserved and high fetch priority.
- Results: 18px titles, 13px organization and work metadata, 14px salary; support rail moves below listings at 1080px.
- Forms: 16px input text, 14px labels. Signup mode and dialog heading now share state.
- Theme: system preference on first visit; explicit top-bar switch persists locally. No account data is stored with the theme.
- Dark tokens: canvas #142019, surface #1b2a21, ink #edf3eb, muted #b2c0b2, borders #3e5143, accent #b5d8b5, action text #193323.
- Motion remains limited to interaction feedback and existing drawer transitions. Reduced-motion overrides continue to apply.

### Image provenance

Built-in image generation created `frontend/src/assets/community.webp`; it is an illustrative fictional scene. Prompt: “Use case: photorealistic-natural. Asset type: decorative hero photograph for ChurchConnect community job board. Generate an editorial candid photograph of three adult community volunteers chatting while arranging small potted plants on a wooden table in a bright church community courtyard. Authentic casual clothing in muted green and neutral shades, natural expressions, varied ages and backgrounds, dappled daylight, warm welcoming atmosphere, rich natural green leaves, simple pale brick architecture. Horizontal 3:2 composition, people centrally grouped with faces fully visible and sufficient breathing room. High quality documentary photography, subtle film texture, realistic hands. No text, no logos, no UI, no overlay, no border. This is an illustrative fictional community scene, not a real organization.”
