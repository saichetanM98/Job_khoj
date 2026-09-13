# UI Registry

Visual design patterns and tokens extracted from implemented components to guarantee interface consistency across sessions.

---

### CompletionBanner

File: `components/profile/CompletionBanner.tsx`  
Last updated: September 3, 2026

| Property         | Class |
| ---------------- | ----- |
| Background       | `bg-surface` (card), `bg-[#fff1f2]` (attention tag badge) |
| Border           | `border border-border` (card), `border border-[#fecdd3]` (attention tag) |
| Border radius    | `rounded-2xl` (card), `rounded-full` (attention badges) |
| Text — primary   | `text-text-primary` (`text-lg font-bold`) |
| Text — secondary | `text-text-secondary` (`text-sm`) |
| Spacing          | `p-6` (container), `gap-6` (layout), `gap-2` (tag list) |
| Hover state      | none (static notification card) |
| Shadow           | `shadow-sm` |
| Accent usage     | `text-error` (`#ef4444`) for alert icon & SVG ring progress arc, `#e11d48` for tag text |

**Pattern notes:**
- Used for page-level attention/completeness banners.
- Circular SVG progress ring uses 88px size, 8px stroke, with `#f1f5f9` track and `#ef4444` indicator arc.
- Missing field badges use uppercase tracking-wider font with gentle warning/error tinted background.

---

### ResumeSection

File: `components/profile/ResumeSection.tsx`  
Last updated: September 3, 2026

| Property         | Class |
| ---------------- | ----- |
| Background       | `bg-surface` (card), `bg-surface` / `bg-accent-muted/30` (dropzone idle/drag), `bg-accent` (primary button) |
| Border           | `border border-border` (card), `border-2 border-dashed border-[#e2e8f0]` (dropzone) |
| Border radius    | `rounded-2xl` (card), `rounded-xl` (dropzone & generate button), `rounded-lg` (select button) |
| Text — primary   | `text-text-primary` (`text-lg font-bold`, `text-sm font-semibold`) |
| Text — secondary | `text-text-secondary` (`text-sm`, `text-xs`) |
| Spacing          | `p-6 sm:p-7` (card), `p-8 sm:p-10` (dropzone), `space-y-6` |
| Hover state      | Dropzone: `hover:border-accent/60 hover:bg-surface-secondary/50`; Buttons: `hover:bg-accent-dark`, `hover:bg-surface-secondary` |
| Shadow           | `shadow-sm` |
| Accent usage     | `text-accent`, `bg-accent-light/50` (icon circle), `bg-accent` (primary CTA button), `hover:bg-accent-dark` |

**Pattern notes:**
- Standard dropzone upload pattern with distinct visual feedback on drag-over (`border-accent bg-accent-muted/30`).
- Helper action bar below dropzone uses secondary text description on the left and primary CTA button on the right.

---

### ProfileForm

File: `components/profile/ProfileForm.tsx`  
Last updated: September 3, 2026

| Property         | Class |
| ---------------- | ----- |
| Background       | `bg-surface` (card container & input fields), `bg-surface-secondary` (readonly inputs) |
| Border           | `border border-border` (card, inputs, tag badges, section dividers) |
| Border radius    | `rounded-2xl` (outer card), `rounded-xl` (nested role cards, save button), `rounded-lg` (inputs, selects, tag badges) |
| Text — primary   | `text-text-primary` (`text-xl font-bold` heading, `text-base font-semibold` subheadings, `text-sm` inputs) |
| Text — secondary | `text-text-secondary` (`text-sm`), `text-text-dark` (`text-xs font-semibold uppercase tracking-wider` field labels), `text-text-muted` (placeholders) |
| Spacing          | `p-6 sm:p-8` (outer card), `p-5 sm:p-6` (inner cards), `px-3.5 py-2.5` (inputs), `space-y-8` (sections), `space-y-4` (groups) |
| Hover state      | Inputs: `focus:border-accent focus:ring-1 focus:ring-accent`; Tag chips: `hover:bg-surface-secondary`; Submit: `hover:bg-accent-dark` |
| Shadow           | `shadow-sm` (card), `shadow-2xs` (tag chips), `shadow` (submit button) |
| Accent usage     | `bg-accent` (submit CTA), `text-accent` (interactive "+ Add role" link), `focus:border-accent focus:ring-accent` |

**Pattern notes:**
- Form inputs always pair with `text-xs font-semibold uppercase text-text-dark tracking-wider mb-1.5` labels.
- Select elements use `appearance-none` with absolute positioned `ChevronDown` on the right.
- Skill/Industry tag inputs feature an inline "Add" button integrated directly into the input border box (`border-l border-border bg-surface px-5 py-2.5`).
- Tag pills render with `rounded-lg border border-border bg-surface px-3 py-1 text-xs font-medium` and an `X` remove icon.
- Dynamic nested cards (e.g. Work Experience roles) use `rounded-xl border border-border bg-surface p-5 sm:p-6` with an absolute trash remove icon at `top-4 right-4`.
- Submit button is full-width with `rounded-xl py-3.5 px-6 font-semibold bg-accent text-accent-foreground`.

---

### Navbar

File: `components/Navbar.tsx`  
Last updated: September 3, 2026

| Property         | Class |
| ---------------- | ----- |
| Background       | `bg-surface` (navbar), `bg-overlay-dark` (sign-in / sign-out button) |
| Border           | `border-b border-border` |
| Border radius    | `rounded-md` (action button) |
| Text — primary   | `text-text-primary`, `text-text-dark` |
| Text — secondary | `text-text-secondary`, `text-text-slate-medium` |
| Spacing          | `h-16 px-6 sm:px-10 lg:px-16`, `gap-8` (nav items) |
| Hover state      | Nav links: `hover:text-text-black`; Button: `hover:bg-overlay-dark-hover hover:shadow` |
| Shadow           | `shadow-sm` (button) |
| Accent usage     | `text-accent font-medium` for active navigation route link |

**Pattern notes:**
- Header is `sticky top-0 z-40` with max-width `max-w-[1440px]`.
- Navigation items use 16px Lucide icons alongside 14px labels. Active route uses `text-accent`.
- User authentication button uses high-contrast `bg-overlay-dark` (#131316) with white text.

---

### JobDetailsView

File: `components/job-details/JobDetailsView.tsx`  
Last updated: September 12, 2026

| Property         | Class |
| ---------------- | ----- |
| Background       | `bg-surface` (cards), `bg-surface-secondary` (company logo box, empty state icon box), `bg-emerald-50` (salary box, match badge, matched skill pills), `bg-blue-50` (location box), `bg-purple-50` (job type box, company research icon box), `bg-slate-50` (date found box), `bg-[#f5f3ff]` (gap skills pill), `bg-accent` (primary apply & research buttons) |
| Border           | `border border-border` (cards, logo boxes, external button), `border border-emerald-200` (match badge & matched pills), `border border-purple-200/80` (gap skills pill) |
| Border radius    | `rounded-2xl` (all main section cards), `rounded-xl` (logo boxes, info cards, buttons), `rounded-full` (match badge, skill pills) |
| Text — primary   | `text-text-primary` (headings, info values, description text) |
| Text — secondary | `text-text-secondary` (company name, section labels, back link), `text-text-muted` (uppercase metric labels) |
| Spacing          | `p-6` (large cards), `p-4` (info cards), `space-y-6` (vertical card rhythm), `max-w-5xl` (container width) |
| Hover state      | Buttons: `hover:bg-accent-dark`, `hover:bg-surface-secondary`; Link: `group-hover:-translate-x-0.5` |
| Shadow           | `shadow-sm` (all section cards and primary buttons), `shadow-2xs` (outline buttons) |
| Accent usage     | `bg-accent` (apply CTA button, research button), `text-accent` (icons, gap skills cross), `hover:bg-accent-dark` |

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
| Accent usage     | `bg-accent`, `text-accent`, `hover:bg-accent-dark` |
| Edge highlight   | `text-emerald-800`, `text-emerald-950`, `text-emerald-600` for candidate unique edge |
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

