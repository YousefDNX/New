# Multi-Layout & Multi-Experience Design System Architecture

## 1. Tech Stack & Codebase Overview

- **Framework**: React 19 + TanStack Router / TanStack Start + Vite + TypeScript
- **Styling**: Tailwind CSS v4 + CSS custom properties (`--background`, `--surface`, `--primary`, etc.) + scoped shell selectors (`[data-ux-shell]`, `[data-ux-paradigm]`)
- **State & Persistence**:
  - Domain data & remote sync: TanStack Query + Firebase Auth + Cloud Firestore
  - UI & Experience state: `PreferencesProvider` (`src/lib/preferences.tsx`) + `ExperienceModeProvider` (`src/lib/experience-mode.tsx`) backed by `localStorage` (`nexora.prefs`, `nexora.cmdSidebarCollapsed`, `nexora.uxPreset`)

## 2. Modular Folder Structure

```text
src/
├── lib/
│   ├── ui-experiences.ts         # Architectural definitions, Mode A/B/C metadata, & THEME_UX_PRESETS
│   ├── experience-mode.tsx       # Global UI state manager (useExperienceMode) + Spatial Slide-Over Drawer
│   └── preferences.tsx           # Persisted color theme, density, fonts, RTL language, & uiExperience
├── components/
│   ├── nav/
│   │   ├── Sidebar.tsx           # Classic left navigation rail
│   │   └── UxShellChrome.tsx     # Mode A EditorialMasthead, Mode B CommandOsSidebar & TopBar, Mode C SpatialFloatingDock & Radial Quick Menu
│   ├── adaptive/
│   │   ├── AdaptiveDataView.tsx  # Decoupled data view: Table (Mode A) | Kanban (Mode B) | Master-Detail + Drawer (Mode C)
│   │   └── AdaptiveFormView.tsx  # Decoupled form engine: Vertical (Mode A) | 2-Col Split (Mode B) | Multi-Step Wizard (Mode C)
│   ├── dashboard/
│   │   ├── DashboardUxViews.tsx  # Shell-level home orchestration (Editorial Briefing / 12-Col Bento / Spatial Stage)
│   │   ├── ModuleHub.tsx         # Responsive Grid (Mode A) | Dense Scroll Bento (Mode B) | Horizontal Carousel + Drawer (Mode C)
│   │   └── TasksWidget.tsx       # Shared task state wired into AdaptiveDataView & AdaptiveFormView
│   └── settings/
│       ├── UiExperienceSwitcher.tsx  # Live Switcher, Curated Theme UX Presets, & In-App Architecture Spec Modal
│       └── ThemesLayoutsSection.tsx  # Unified settings orchestration with atomic rollback
```

## 3. Global UI State Manager (`useExperienceMode`)

Exported from `src/lib/experience-mode.tsx` and mounted in `src/routes/__root.tsx`:

| Property / Action                                                | Type                                    | Responsibility                                                                           |
| ---------------------------------------------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------- |
| `mode`                                                           | `UiExperienceId`                        | Active experience (`classic`, `editorial_atelier`, `command_os`, `focus_deck`)           |
| `paradigm`                                                       | `"editorial" \| "command" \| "spatial"` | Structural UI/UX paradigm (`Mode A`, `Mode B`, `Mode C`)                                 |
| `setMode(next)`                                                  | `(id) => void`                          | Switches active shell & structural variants immediately                                  |
| `sidebarCollapsed` / `toggleSidebar()`                           | `boolean` / `() => void`                | Collapses/expands Mode B workspace rail (`w-60` <-> `w-16`), persisted in `localStorage` |
| `radialMenuOpen` / `toggleRadialMenu()`                          | `boolean` / `() => void`                | Controls Mode C radial quick-launcher menu                                               |
| `spatialDrawer` / `openSpatialDrawer()` / `closeSpatialDrawer()` | State + actions                         | Slide-over inspector drawer with backdrop & `Escape` dismissal                           |
| `selectedRecordId` / `setSelectedRecordId()`                     | `string \| null`                        | Active item selection shared by Mode C Master-Detail views                               |
| `applyThemeUxPreset(preset)`                                     | `(preset) => void`                      | Atomically applies coupled Mode + Theme + Accent + Surface styling                       |

## 4. Structural Paradigm Comparison

| Feature Area          | Mode A: Classic / Editorial                                                  | Mode B: Command Center (`command_os`)                                                     | Mode C: Spatial / Interactive (`focus_deck`)                                                        |
| --------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Root Viewport**     | Standard vertical document scroll (`min-h-dvh`)                              | Fixed desktop app viewport (`md:h-dvh md:overflow-hidden`) with internal scrolling panels | Progressive vertical stage with horizontal snap carousels                                           |
| **Navigation Chrome** | Classic left sidebar or top editorial masthead with chapter dropdowns        | Collapsible left-hand workspace rail + top breadcrumb/action strip + `Cmd+K` Spotlight    | Minimal top compass ribbon + floating bottom glass dock + radial quick-menu arc                     |
| **Dashboard Grid**    | Standard cards or 2-column Editorial Briefing                                | 12-column Bento-Box grid with scrollable task, goal, and activity panes                   | Swipeable Stage Carousel + 1-2-3 Guided Flow + Live Drawer preview                                  |
| **Data Lists**        | Structured list (`classic`) or Semantic HTML `<table>` (`editorial_atelier`) | 3-Column Kanban Action Board (`todo`, `in_progress`, `done`)                              | Split-Screen Master-Detail Inspector + Slide-Over Drawer                                            |
| **Forms**             | Vertical stacked form sections                                               | Compact 2-column split workspace form                                                     | Interactive Multi-Step Wizard (`Step 1 -> Step 2`) preserving field state across live mode switches |
| **Modules Showcase**  | 3-column responsive grid                                                     | Internal-scroll 4-column workspace app panel                                              | Horizontal `snap-x` swipeable carousel with Drawer Inspector                                        |

## 5. Accessibility & RTL Guarantee

- All interactive shells preserve semantic landmarks (`<header>`, `<nav>`, `<main id="main-content">`, `role="dialog"`), `40px–44px` minimum touch targets, `Escape` closing for overlays/drawers, and logical RTL CSS properties (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `rtl-flip`) so Arabic (`dir="rtl"`) adapts symmetrically across all three structural paradigms.
