---
version: alpha
name: WebM8
description: Website design for small businesses in the UK and US
colors:
  primary: '#0e2f56'
  background: '#f8f5f0'
  surface: '#ffffff'
  border: '#ddd6ca'
  muted: '#5b6b7e'
  brand: '#d4ff35'
  success: '#11823b'
  error: '#db2424'
typography:
  sans:
    fontFamily: 'Geist, sans-serif'
  display:
    fontFamily: 'Funnel Display, sans-serif'
  mono:
    fontFamily: 'Geist Mono, monospace'
rounded:
  control: '0.75rem'
  card: '1.5rem'
  button: '9999px'
omitted:
  - section: spacing
    reason: Existing Tailwind utilities own responsive spacing.
components:
  button: {}
  input: {}
  select: {}
  textarea: {}
---

# WebM8 Design System

## Overview

The existing site combines an editorial portfolio with a practical enquiry flow. Keep its navy, warm paper and lime identity. UK and US small-business owners across industries are the audience (owner brief, October 2026). English content uses the existing British spelling. Marketing pages are expressive; form feedback is direct and quiet. The fanned phone previews are the visual signature.

Runtime-canonical model: `app/globals.css` and the existing shared components own tokens; this file documents them. Review token changes against those sources in the same change. No new theme or component library is introduced.

## Colors

Navy is primary text and focus; warm paper is the background; white cards use the beige border. Lime highlights primary actions with navy text. Errors and successes always include text, never color alone. Preserve existing dark marketing sections; this change adds no separate dark form theme.

## Typography

Geist is body and controls; Funnel Display is large headings; Geist Mono is the default small uppercase field-label treatment. Contact uses the shared `labelVariant="contact"`: 14px, sentence-case Geist labels for easier reading. Other forms retain their existing labels. Keep inputs at 16px for phone usability. Use readable line height and wrap long status text.

## Layout

Keep `container-page`, natural document scrolling and existing Tailwind breakpoints. Contact has a compact introduction on the left and the form on the right at `lg`. On phones, the order is introduction, form, then email and demo alternatives; no separate hero or contact card delays the first field. The form has one column on phones and two at `sm`; plan, message and website span both. Pending state preserves the form footprint and reserves button width. No fixed-height form panel.

About stays company-focused: a light split hero with real demo screenshots, an editorial explanation of the approach, a navy panel explaining responsibilities, and native FAQ disclosures. Label portfolio examples as demos. Use ruled rows for static information rather than interactive-looking feature cards. Keep the shared demo close as the getting-started sequence; do not repeat the homepage process above it.

The shared header uses the compact menu below `lg` so its navigation and demo action do not wrap on tablets. Resizing to desktop closes the drawer and releases its scroll lock.

Instant Websites follows the owner's `/free-demo/` reference: a compact offer heading, white rounded form frame on `bg-alt`, and the shared navy phone sketch on the right. The form leads the document order at every viewport; the sketch follows on mobile. The shared tilted demo wall comes after the entire signup section on a navy ground. Keep the three-stage progress inside the form and the price beside the page heading. This route reuses `DemoSketch`, `DemoWall` and the shared form controls rather than recreating their visual systems.

`DemoSketch` is one shared component for `/free-demo/` and `/instant/`. Its navy stage takes the chosen trade's colour, the phone leans towards a mouse, and each of the 16 trades has its own template in `components/demo/SketchTemplates.tsx`, built round one moving thing (a pipe that draws itself, a neon sign, a map). Instant's "Local services" uses the extra `local` template, which shows the visitor's town. Two small cards sit behind the phone on stages wide enough for them. The templates' palettes and display faces belong to the example sites, not to WebM8's tokens. Source: owner request, 9 November 2026.

## Elevation & Depth

Use the existing `shadow-card` and border for the form. Validation requires no modal or floating overlay.

## Shapes

Existing controls use rounded-xl, contact card rounded-3xl, buttons rounded-full. Preserve the current icon family in `components/ui/Icon.tsx`.

## Components

`components/forms/FormField.tsx` owns labelled inputs, textareas, native selects and form status. Native plan selection deliberately uses platform popup geometry and keyboard behavior. `components/ui/Button.tsx` owns actions. Textarea has five visible rows on contact, fixed resize behavior and natural overflow for longer messages.

Every field has an associated label and inline error. Focus uses the existing navy ring. Disabled controls remain visible; a busy button has explicit text. The contact status uses one polite live region. Success appears only after the CRM confirms the save. Motion uses existing transitions and reduced-motion rules; it does not delay form feedback. Keep the initial demo image visible at first paint and high priority.

Instant Websites billing keeps the payment form inside the existing second step. Stripe's Payment Element owns secure card fields; `InstantPayment` maps the canonical navy, white, muted, border and error tokens to Stripe's Appearance API and uses a system-font fallback inside the isolated iframe. The surrounding page retains Geist and Funnel Display, the shared lime Button, 12px input radius, inline errors and natural document scrolling. Payment fields load only after the customer acknowledges the trial terms. Never draw imitation card fields or expose API credentials in the page.

## Do's and Don'ts

- Do reuse shared field and button owners.
- Do preserve entered answers after a recoverable error.
- Don't show a sent confirmation when an email draft merely opens.
- Don't use decorative motion, new palette values or overlays for basic validation.

The live Instant Websites checkout places the payment form first, above the order and contact summary. Card is the first expanded payment option. Reuse the existing Stripe appearance adapter and shared controls; no token changes are needed. Source: owner request, 9 November 2026.
