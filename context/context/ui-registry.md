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

### ResumeSection

File: `components/profile/ResumeSection.tsx`  
Last updated: September 7, 2026

| Property         | Class |
| ---------------- | ----- |
| Background       | `bg-surface` (card), `bg-surface` / `bg-accent-muted/30` (dropzone idle/drag), `bg-accent` (primary generate button), `bg-accent-muted` (extract button) |
| Border           | `border border-border` (card), `border-2 border-dashed border-[#e2e8f0]` (dropzone), `border border-accent/40` (extract button) |
| Border radius    | `rounded-2xl` (card), `rounded-xl` (dropzone, generate button, view button), `rounded-lg` (select button, extract button, download button) |
| Text — primary   | `text-text-primary` (`text-lg font-bold`, `text-sm font-semibold`) |
| Text — secondary | `text-text-secondary` (`text-sm`, `text-xs`) |
| Spacing          | `p-6 sm:p-7` (card), `p-8 sm:p-10` (dropzone), `space-y-6` |
| Hover state      | Dropzone: `hover:border-accent/60 hover:bg-surface-secondary/50`; Buttons: `hover:bg-accent-dark`, `hover:bg-surface-secondary`, `hover:bg-accent-light` |
| Shadow           | `shadow-sm`, `shadow-2xs` |
| Accent usage     | `text-accent`, `bg-accent-light/50` (icon circle), `bg-accent` (primary CTA button), `hover:bg-accent-dark` |

**Pattern notes:**
- Upload dropzone supports drag-and-drop with active feedback state (`border-accent bg-accent-muted/30`).
- When a resume exists (`hasResume === true`), secondary actions appear directly in the dropzone: "Extract Profile from Resume" (accent-tinted button) and "Download Resume" (authorized `/api/resume/download` link).
- Bottom helper bar provides "View Current Resume" (`/api/resume/preview` inline streaming) and "Generate Resume from Profile" (AI-polish trigger with loading spinner).

---

### JobDetailsView

File: `components/job-details/JobDetailsView.tsx`  
Last updated: September 12, 2026

| Property         | Class |
| ---------------- | ----- |
| Background       | `bg-surface` (section cards), `bg-surface-secondary` (logo square, empty state container), `bg-emerald-50` (salary square, match score pill, matched skill pills), `bg-blue-50` (location square), `bg-purple-50` (job type square, company research square), `bg-slate-50` (date found square), `bg-[#f5f3ff]` (gap skills pill), `bg-accent` (primary action buttons) |
| Border           | `border border-border` (cards, logo squares, outline buttons), `border border-emerald-200` (match pill & matched badges), `border border-purple-200/80` (gap skills badge) |
| Border radius    | `rounded-2xl` (all section cards), `rounded-xl` (logo boxes, info cards, buttons), `rounded-full` (match pill, skill badges) |
| Text — primary   | `text-text-primary` (headings, values, description) |
| Text — secondary | `text-text-secondary` (company name, section headers, back link), `text-text-muted` (uppercase metric labels) |
| Spacing          | `p-6` (large cards), `p-4` (info cards), `space-y-6` (vertical rhythm), `max-w-5xl` (container width) |
| Hover state      | Buttons: `hover:bg-accent-dark`, `hover:bg-surface-secondary`; Link: `group-hover:-translate-x-0.5` |
| Shadow           | `shadow-sm` (section cards, primary buttons), `shadow-2xs` (outline buttons) |
| Accent usage     | `bg-accent` (apply CTA button, research button), `text-accent` (icons, gap skills cross, toggle button), `hover:bg-accent-dark` |

**Pattern notes:**
- Exact match to `job-details.png` layout hierarchy.
- Badge distinction: Emerald green (`✓`) for profile matches, Lavender/Violet (`✕`) for gap skills.
- Info cards display 4-column metric strip with color-coded square icon containers.
- Expandable job description: Smooth gradient fade when collapsed (>280 chars), interactive "Show more" / "Show less" toggle, and upstream feed truncation fallback link.
- Company research card provides empty state, multi-stage loading indicator (resolving domain -> browsing pages -> synthesizing briefing), and full 9-field structured dossier view with candidate edge and gap strategy highlights.

---

### CompanyResearchCard (Feature 13)

File: `components/job-details/CompanyResearchCard.tsx`  
Last updated: September 13, 2026

| Property         | Class |
| ---------------- | ----- |
| Background       | `bg-surface` (card), `bg-surface-secondary/50` (overview, why role, tech stack, culture, questions, prep), `bg-emerald-50/70` (Your Edge card), `bg-purple-50/70` (Gaps to Address strategy card), `bg-purple-50` (icon box), `bg-accent` (primary CTA), `bg-red-50` (error banner) |
| Border           | `border border-border/70` (dossier sections), `border border-emerald-200/80` (Your Edge), `border border-purple-200/80` (Gaps to Address), `border border-border` (main card, tech pills, re-run button) |
| Border radius    | `rounded-2xl` (card), `rounded-xl` (section boxes, icon box, CTA buttons), `rounded-lg` (tech stack pills, retry button), `rounded-full` (progress indicators, bullet dots) |
| Text — primary   | `text-text-primary` (overview, why role, headings) |
| Text — secondary | `text-text-secondary` (subtitles, questions, culture bullets), `text-text-muted` (uppercase section tags, sources label) |
| Gap strategy     | `text-purple-900`, `text-purple-950`, `bg-accent` bullet for strategic reframing |

---

### Dashboard (Feature 14)

File: `components/dashboard/DashboardClient.tsx` (and subcomponents `StatCards.tsx`, `RecentActivityCard.tsx`, `CompanyResearchChart.tsx`, `JobsOverTimeChart.tsx`, `MatchDistributionChart.tsx`, `DashboardBanner.tsx`)  
Last updated: September 13, 2026

| Property         | Class |
| ---------------- | ----- |
| Background       | `bg-surface` (cards), `bg-background` (page canvas) |
| Border           | `border border-border` (cards), `border-b-2 border-accent` (Navbar active tab), `#E2E8F0` (timeline connector line) |
| Border radius    | `rounded-2xl` (stat cards, timeline card, chart cards), `rounded-full` (badges, timeline dots), `radius={[6, 6, 0, 0]}` (Recharts bars) |
| Text — primary   | `text-slate-900` (`text-3xl font-bold` for stat numbers, `text-base sm:text-lg font-bold` for card headings) |
| Text — secondary | `text-slate-500` (stat titles), `text-slate-400` (sublabels, timestamps, chart axes) |
| Spacing          | `p-6` (stat cards), `p-6 sm:p-8` (activity & chart cards), `space-y-6` (vertical sections, timeline items), `gap-6` (grid items) |
| Hover state      | Stat cards: `hover:shadow-md`; Navbar links: `hover:text-text-black` |
| Shadow           | `shadow-sm` (all cards), `shadow-xs` (banner) |
| Accent usage     | `border-accent text-accent font-semibold` (active nav indicator), `#7C3AED` (Jobs Over Time line & gradient), `#5096FF` (Company Research bars), `#10B981` (Match Distribution bars) |

**Pattern notes:**
- Layout mirrors `dashboard.png`: 4 stat cards in top row, 2-column equal split for middle row, 12-column grid (7 cols / 5 cols) for bottom row.
- Recharts stability pattern: Charts in CSS Grid/Flex containers must use explicit numeric height on both the wrapper `style={{ height: 260, minHeight: 260 }}` and `<ResponsiveContainer height={260} minHeight={260}>`, paired with `min-w-0` on parent grid columns to prevent `ResizeObserver` 0-dimension collapse.
- React 19 SVG animation: Recharts bars and area curves include `isAnimationActive={false}` to guarantee immediate SVG geometry rendering during hydration.
- Activity timeline: Status dots use `block h-2.5 w-2.5 rounded-full` with 4px pastel ring box-shadows (`#EDE9FE` for purple, `#DBEAFE` for blue, `#D1FAE5` for emerald) connected by a 2px `#E2E8F0` vertical line.
- Profile completeness banner: Renders above stat cards when profile is incomplete with `bg-gradient-to-r from-amber-50/80 via-orange-50/40 to-amber-50/60`, missing field badges, and a direct CTA to `/profile`.


