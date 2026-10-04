# RJGC Design System — Ink & Alta

Visual system for **Rishra Junior Group Club**.

## Intent

Communicate community, heritage, cultural identity around Saraswati Puja, trust, longevity, and a modern organization — without looking like a generic SaaS dashboard or festival template.

Site language: **English only**.

## Direction: Ink & Alta

| Signal | Token family | Role |
|--------|--------------|------|
| Knowledge / trust | `ink-*` | Primary surfaces, type, structure |
| Accent pulse | `alta-*` | Accent, CTAs, active indicators |
| Longevity / ritual | `marigold-*` | Heritage highlights (sparingly) |
| Continuity | `lotus-*` | Success / calm secondary |
| Paper | `jasmine-*` | Cool canvas (not warm cream cliché) |

## Typography

| Role | Family | CSS |
|------|--------|-----|
| English display | Fraunces | `.font-display` / `--font-display` |
| English UI | Source Sans 3 | `--font-sans` |
| Mono (IDs, receipts) | IBM Plex Mono | `--font-mono` |

## Tokens

Source of truth: [`styles/tokens.css`](../styles/tokens.css)

Covers color, surfaces, borders, shadows, radius, spacing, containers, breakpoints, type scale, and motion durations.

## Components

| Layer | Path |
|-------|------|
| Primitives | `components/ui/*` |
| Club patterns | `components/club/*` |
| Public shell | `components/public/*` |
| Motion | `components/motion/*`, `lib/motion.ts` |

## Animation principles

- Elegant, smooth, purposeful, subtle
- Prefer enter/exit fade-rise; avoid continuous decoration
- Always respect `prefers-reduced-motion` (CSS + `useReducedMotion`)

## Showcase

Browse live samples at `/design-system`.

## Placeholders

Do not invent club history, counts, or testimonials in product UI. Use `[PLACEHOLDER: …]` until real content exists.
