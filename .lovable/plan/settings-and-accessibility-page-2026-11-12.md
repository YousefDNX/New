# Settings and Accessibility page

## What students get

A real Settings page (replacing the "coming soon" page) with four sections. Every change applies instantly and is saved to the student's account, so it follows them to any device.

1. **Display and accessibility**
   - Text size slider (90%–150%) — the whole app grows or shrinks.
   - Dyslexia-friendly font (switches to Atkinson Hyperlegible, a free font made for readability, plus wider spacing).
   - High contrast — stronger text and borders.
   - Reduced motion — turns off animations.
   - Theme: dark / light.
2. **Language and region**
   - English / Arabic (Arabic flips the layout right-to-left).
   - Region: Kuwait, GCC, Global.
3. **What NEXORA AI can see** — three switches: my profile, my tasks and study, my Growth Map progress. Saved now; the AI will obey them when it is built. Private journal and mood are never shared (stated on the page).
4. **Profile** — display name.

A short "Saved" confirmation appears after each change; if saving fails, the choice is undone and an error shows.

## How it behaves

- On sign-in, the account's saved settings load and replace whatever this browser had.
- Signed-out pages (welcome, sign-in) keep using the browser's last choices.
- The language switches in the top menu and welcome page also save to the account when signed in.

## Technical details

- No database changes: user_settings (theme, font_scale, dyslexia_font, high_contrast, reduced_motion, ai_share_*) and profiles (language, region, display_name) already exist; a settings row is created at signup. Add an upsert fallback in case an older account has no row.
- `src/lib/preferences.tsx`: add `syncFromAccount(settings, profile)` and an optional `onChange` persistence hook; keep localStorage fallback.
- New `src/lib/settings.ts`: pure mapping between database rows and preferences (clamping font scale 0.9–1.5), plus save functions using the browser client (RLS restricts to own row).
- New `src/hooks/use-settings.ts`: load + mutate with React Query; app layout syncs on load.
- `src/styles.css`: dyslexia class sets the Atkinson Hyperlegible font family; font link added in `__root.tsx`.
- `src/routes/_authenticated/app.settings.tsx`: the page, using existing Switch, Slider, Select, Card components and design tokens.
- `src/lib/i18n-dict.ts`: English + Arabic labels for all new text.
- Tests: `src/test/settings.test.ts` — font scale clamped to 0.9–1.5, row↔preference mapping round-trips, region limited to kuwait/gcc/global.
- Verify in browser with a signed-in account: change each control, reload, confirm it persisted and visibly applies (including Arabic RTL).
- Update NEXORA_BUILD_STATUS.md and roadmap.md.
