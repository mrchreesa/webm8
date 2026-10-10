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

Geist is body and controls; Funnel Display is large headings; Geist Mono is the small uppercase field-label treatment. Keep inputs at 16px for phone usability. Use readable line height and wrap long status text.

## Layout

Keep `container-page`, natural document scrolling and existing Tailwind breakpoints. The contact form has one column on phones and two at `sm`; plan, website and message span both. Pending state preserves the form footprint and reserves button width. No fixed-height form panel.

## Elevation & Depth

Use the existing `shadow-card` and border for the form. Validation requires no modal or floating overlay.

## Shapes

Existing controls use rounded-xl, contact card rounded-3xl, buttons rounded-full. Preserve the current icon family in `components/ui/Icon.tsx`.

## Components

`components/forms/FormField.tsx` owns labelled inputs, textareas, native selects and form status. Native plan selection deliberately uses platform popup geometry and keyboard behavior. `components/ui/Button.tsx` owns actions. Textarea has five visible rows on contact, fixed resize behavior and natural overflow for longer messages.

Every field has an associated label and inline error. Focus uses the existing navy ring. Disabled controls remain visible; a busy button has explicit text. The contact status uses one polite live region. Success appears only after the CRM confirms the save. Motion uses existing transitions and reduced-motion rules; it does not delay form feedback. Keep the initial demo image visible at first paint and high priority.

## Do's and Don'ts

- Do reuse shared field and button owners.
- Do preserve entered answers after a recoverable error.
- Don't show a sent confirmation when an email draft merely opens.
- Don't use decorative motion, new palette values or overlays for basic validation.
