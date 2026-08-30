# UI Registry

Living document. Updated after every component is built. Read this before building any new component — match existing patterns exactly before inventing new ones.

---

## How to Use

Before building any component:

1. Check if a similar component already exists here
2. If yes — match its exact classes
3. If no — build it following ui-rules.md and ui-tokens.md, then add it here

After building any component — update this file with the component name, file path, and exact classes used.

---

## Components

### Homepage

**Path:** `app/page.tsx`

**Purpose:** Complete public landing page matching `context/context/designs/landing-page.png`.

**Sections and primary classes:**

- Header: `border-b border-border bg-surface`, inner wrapper `mx-auto flex h-24 max-w-[1440px] items-center justify-between px-6 sm:px-10 lg:px-20`
- Header logo: `h-[50px] w-auto`
- Header nav: `hidden items-center gap-12 md:flex`, links `text-[17px] font-medium leading-6 text-text-dark`
- Header CTA: `rounded-md bg-overlay px-6 py-4 text-[17px] font-semibold leading-6 text-accent-foreground shadow-button`
- Page frame: `mx-auto max-w-[1440px] border-x border-border`
- Hero sections: `hero-gradient px-6 pb-20 pt-24 text-center sm:px-10 lg:px-20 lg:pb-28 lg:pt-32`
- Hero heading: `mx-auto max-w-[760px] text-[clamp(48px,6vw,76px)] font-bold leading-[1.08] text-text-black`
- Hero body: `mx-auto mt-8 max-w-[720px] text-[23px] font-normal leading-9 text-text-slate-medium`
- Primary landing button: global helper class `primary-landing-button`
- Secondary landing button: global helper class `secondary-landing-button`
- Dashboard preview band: `border-y border-border bg-surface-tertiary px-6 py-14 sm:px-10 lg:px-20`
- Browser frame: `browser-frame mx-auto max-w-[1160px] overflow-hidden rounded-[24px] bg-surface`
- Feature grid: `grid border-b border-border lg:grid-cols-2`
- Feature rows: global helper class `feature-row`; active accents use `feature-row-active` and `feature-row-success`
- Image panels: `flex items-center justify-center bg-surface-muted px-6 py-16 sm:px-10 lg:px-14`
- Hatched separators: global helper class `hatched-divider`
- Testimonial section: `border-b border-border bg-surface px-6 py-24 text-center sm:px-10 lg:px-20`
- Footer: `flex flex-col gap-10 bg-surface px-8 py-16 sm:px-14 lg:flex-row lg:items-center lg:justify-between lg:px-20`

**Global helpers added in `app/globals.css`:**

- `hero-gradient`
- `primary-landing-button`
- `secondary-landing-button`
- `button-caret`
- `browser-frame`
- `shadow-button`
- `feature-row`
- `feature-row-active`
- `feature-row-success`
- `hatched-divider`

### LoginPage

File: `app/login/page.tsx`
Last updated: August 29, 2026

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `hero-gradient` (outer page), `bg-surface` (card) |
| Border           | `border border-border` (card), `border border-border` (buttons), `border border-error-border` (error alert) |
| Border radius    | `rounded-xl` (card), `rounded-md` (buttons, error alert) |
| Text — primary   | `text-text-black` (heading), `text-text-primary` (buttons), `text-accent-foreground` (spinner) |
| Text — secondary | `text-text-secondary` (subheading, link hover), `text-text-muted` (footer terms) |
| Spacing          | `px-6 py-12` (page), `p-8 md:p-10` (card), `py-2 px-4` (buttons), `p-3` (error banner), `gap-4` (button group) |
| Hover state      | `hover:bg-surface-secondary hover:shadow-sm` (OAuth buttons), `hover:text-text-secondary` (links) |
| Shadow           | `shadow-lg` (card) |
| Accent usage     | `border-t-accent` (loading spinner) |

**Pattern notes:**
- Sits in the center of the viewport via `min-h-screen flex items-center justify-center hero-gradient px-6 py-12`.
- Form is wrapped in `<Suspense>` with a pulse skeleton fallback `h-64 w-full max-w-[440px] animate-pulse rounded-xl bg-surface`.
- Dynamic query parameter error banner uses `bg-error-light border border-error-border text-error rounded-md p-3 text-sm`.
- OAuth provider buttons use full-width flex layout with provider brand SVG and loading spinner animation.

### ProfileClient

File: `components/profile/ProfileClient.tsx`
Last updated: August 29, 2026

| Property         | Class |
| ---------------- | ----- |
| Background       | `bg-background` (page), `bg-surface` (cards, inputs, navbar), `bg-surface-secondary` (work experience items), `bg-surface-muted` (disabled inputs) |
| Border           | `border border-border` (cards, inputs, dividers), `border-2 border-dashed border-border-muted` (upload dropzone) |
| Border radius    | `rounded-2xl` (cards, banner), `rounded-xl` (nested work experience cards, upload dropzone), `rounded-md` (inputs, buttons), `rounded-full` (badges, tags, completeness circle) |
| Text — primary   | `text-text-primary` (headings, body, inputs), `text-text-dark` (labels, nav links), `text-accent-foreground` (primary buttons) |
| Text — secondary | `text-text-secondary` (subtitles, descriptions), `text-text-muted` (placeholders, hints) |
| Spacing          | `p-6` (cards, banner), `px-3 py-2` (inputs), `px-6 py-3` / `py-2.5 px-4` (buttons), `gap-6` (card stack), `gap-4` (grid rows) |
| Interactive states | `focus:ring-1 focus:ring-accent focus:outline-none` (inputs), `hover:bg-accent-dark` (primary button), `hover:bg-surface-secondary` (secondary button), `hover:border-accent` (upload dropzone) |
| Shadow           | `shadow-sm` (cards), `shadow` (save button) |
| Accent usage     | `bg-accent` / `text-accent-foreground` (primary action), `bg-accent-light` / `text-accent` (skills tags), `bg-accent-muted` / `text-accent` (missing tags), `stroke-accent` (progress ring) |

**Pattern notes:**
- **Card Hierarchy**: Standard form sections use `rounded-2xl border border-border bg-surface p-6 shadow-sm` with `h3.text-base.font-semibold.text-text-primary` headers accompanied by Lucide icons (`h-5 w-5 text-accent`).
- **Form Inputs**: Adhere strictly to `bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:ring-1 focus:ring-accent focus:outline-none`.
- **Feedback States**: Success banners use `bg-success-lightest border-success-light text-success-dark rounded-lg p-4`; error banners use `bg-error-light border-error-border text-error rounded-lg p-4`.
- **Tags & Badges**: All tags use `rounded-full` pill shape with `text-xs px-2.5 py-1 font-medium`.
- **Top Navbar**: Sticky header with `h-16 border-b border-border bg-surface`, max-width `1440px`, color-only active state (`text-accent font-medium`, no underline).



