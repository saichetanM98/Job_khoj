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
