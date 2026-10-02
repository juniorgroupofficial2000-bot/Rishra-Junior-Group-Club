# RJGC Design System — Ink & Alta

Visual system for **Rishra Junior Group Club** / **রিশরা জুনিয়র গ্রুপ ক্লাব**.

## Intent

Communicate community, heritage, Bengali cultural identity, Saraswati Puja, trust, longevity, and a modern organization — without looking like a generic SaaS dashboard or festival template.

## Direction: Ink & Alta

| Signal | Token family | Role |
|--------|--------------|------|
| Knowledge / trust | `ink-*` | Primary surfaces, type, structure |
| Bengali pulse | `alta-*` | Accent, CTAs, active indicators |
| Longevity / ritual | `marigold-*` | Heritage highlights (sparingly) |
| Continuity | `lotus-*` | Success / calm secondary |
| Paper | `jasmine-*` | Cool canvas (not warm cream cliché) |

## Typography

| Role | Family | CSS |
|------|--------|-----|
| English display | Fraunces | `.font-display` / `--font-display` |
| English UI | Source Sans 3 | `--font-sans` |
| Bengali | Noto Sans Bengali | `.font-bengali` / `--font-bengali` |
| Mono (IDs, receipts) | IBM Plex Mono | `--font-mono` |

Pair English display with Bengali UI lines for bilingual section headers (`SectionHeader.bilingualTitle`).

## Tokens

Source of truth: [`styles/tokens.css`](../styles/tokens.css)

Covers color, surfaces, borders, shadows, radius, spacing, containers, breakpoints, type scale, and motion durations.

## Components

| Layer | Path |
|-------|------|
| Primitives | `components/ui/*` |
| Club patterns | `components/club/*` |
| Motion | `components/motion/*`, `lib/motion.ts` |

## Animation principles

- Elegant, smooth, purposeful, subtle
- Prefer enter/exit fade-rise; avoid continuous decoration
- Always respect `prefers-reduced-motion` (CSS + `useReducedMotion`)

## Showcase

Browse live samples at `/design-system`.

## Placeholders

Do not invent club history, counts, or testimonials in product UI. Use `[PLACEHOLDER: …]` until real content exists.
