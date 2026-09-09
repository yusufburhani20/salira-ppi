---
name: Salira Academic System
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#3f4850'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#707881'
  outline-variant: '#bfc7d2'
  surface-tint: '#006398'
  primary: '#006194'
  on-primary: '#ffffff'
  primary-container: '#007bb9'
  on-primary-container: '#fdfcff'
  inverse-primary: '#93ccff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#825100'
  on-tertiary: '#ffffff'
  tertiary-container: '#a36700'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cce5ff'
  primary-fixed-dim: '#93ccff'
  on-primary-fixed: '#001d31'
  on-primary-fixed-variant: '#004b73'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-xs:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.25rem
  space-xl: 1.5rem
  space-2xl: 2rem
  screen-edge-mobile: 1rem
  screen-edge-tablet: 1.5rem
  card-padding-mobile: 1rem
  card-padding-tablet: 1.5rem
---

## Brand & Style

This design system is engineered for modern vocational high schools (SMK) and contemporary Islamic boarding schools (Pesantren Modern). It provides an agile, mobile-first operational workspace for educators, ustaz, homeroom mentors, and administrative staff.

The emotional core is **efficient, respectful, modern, and trustworthy**. Teachers and pesantren mentors manage intense, multifaceted workflows—from classroom journals and attendance tracking to Islamic character scoring (akhlaq), nighttime boarding checks (belajar malam), and geolocation-based personnel clock-ins. The interface eliminates academic fatigue by blending modern institutional clarity with tactile, fluid mobile navigation patterns.

### Design Movement: Modern Educational Utility with Tactile Softness
- **Card-centric layout**: Generous `rounded-2xl` surfaces (16px radius) floating on soft cool slate backdrops, delivering natural tap targets for thumb-driven handheld operations.
- **Micro-elevation & tinted depth**: Translucent card strokes combined with ambient, tinted drop-shadows to ensure high legibility outdoors or inside bright classrooms.
- **Native mobile hierarchy**: Anchored bottom navigation for core tasks, a sticky modern top app bar with contextual user presence and notifications, quick-action chips, and segmented controls that feel right at home on both iOS and modern Android devices.

## Colors

The color palette pairs authoritative deep ocean teals with optimistic emeralds, grounded on cool slate tones.

- **Primary (`#0284c7`)**: Ocean Teal / Cerulean. Powers primary CTAs, active bottom navigation tabs, primary stat callouts, and key focus states. Reflects modern professional competence.
- **Secondary (`#10b981`)**: Emerald Mint. Represents successful attendance (`Hadir`), verified geotag status, active live indicators, and student achievements.
- **Tertiary (`#f59e0b`)**: Amber Sun. Used for cautionary statuses (`Izin / Sakit`), pending review items, and night study tracking tags (`Belajar Malam`).
- **Critical / Error (`#ef4444`)**: Pure Coral. Reserved for unauthorized absences (`Alpha`), geofence boundary warnings, and failed submissions.
- **Neutral & Surface System**:
  - `Background Canvas`: `#f8fafc` (Cool gray 50) for effortless eye comfort over long grading sessions.
  - `Surface Elevated`: `#ffffff` pure white cards.
  - `Surface Muted`: `#f1f5f9` (Cool gray 100) for unselected segmented pills and input fills.
  - `Text Primary`: `#0f172a` (Slate 900) for crisp, accessible data rows.
  - `Text Secondary`: `#64748b` (Slate 500) for NISN numbers, metadata, and timestamps.
  - `Borders & Separators`: `#e2e8f0` (Slate 200) ensuring soft structural framing without harshness.

## Typography

The typography uses **Plus Jakarta Sans** across all levels. It brings geometric discipline alongside welcoming, open apertures, rendering clearly on low-DPI smartphones and high-resolution tablet screens.

- **Numerals & Metrics**: Large stat counts (e.g., student headcounts, GPA/average values, percentage bars) use `font-bold` with tight tracking (`-0.02em`) for rapid optical scanning.
- **Indonesian & Islamic Naming Clarity**: Generous line heights on table rows and student rosters safeguard complex dual names (e.g., "Muhammad Azqa Faqihufiddin") from clipping or cramped visual flow.
- **Monospaced Accents**: NISN numbers, clock times (`16.50.47 WIB`), and geolocation coordinates (`Lat/Long`) are paired with tabular numeral figures (`font-variant-numeric: tabular-nums`) to prevent jitter during real-time updates.

## Layout & Spacing

This design system uses a **mobile-first fluid columnar framework** that gracefully scales from compact smartphones (360px+) to tablets and web consoles.

### Mobile Grid & Safe Areas
- **Horizontal Screen Inset**: `16px` (`screen-edge-mobile`) gutter padding from viewport edges.
- **Thumb Zone Design**: Primary interactive levers (submit buttons, bottom navigation, floating quick-check buttons) stay within the lower 40% of the display.
- **Bottom Navigation Clearance**: An explicit padding buffer of `84px` is appended to scroll containers to prevent navigation occlusion.

### Breakpoints & Adaptive Reflow
- **Mobile (`< 640px`)**: Single-column vertical stacks. Attendance rosters use horizontal sliding cards or compact row-action cards with touch-optimized segmented pills.
- **Tablet (`640px - 1024px`)**: 2-column dashboard layout with side-by-side metric tiles and expandable split-pane assessment sheets.
- **Desktop (`> 1024px`)**: Left-rail persistent navigation sidebar (260px fixed width) paired with a 12-column content grid, as seen in institutional management views.

## Elevation & Depth

Visual hierarchy uses **ambient tinted shadows** and **subtle surface borders** instead of harsh drop shadows, ensuring clarity in high-glare environments.

- **Level 0 (Flat Canvas)**: `#f8fafc` background base.
- **Level 1 (Cards & Modules)**: Solid `#ffffff` fill with a `1px` border of `#e2e8f0` and an ambient shadow: `box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.05)`.
- **Level 2 (Quick Actions & Hover/Touch Feedback)**: `box-shadow: 0 10px 25px -4px rgba(2, 132, 199, 0.08)`, lifting interactive cards on touch.
- **Level 3 (Sticky Headers & App Bars)**: Pure white with `backdrop-filter: blur(12px)` at 90% opacity, bordered on the bottom with `#e2e8f0`.
- **Level 4 (Modals, Bottom Sheets & Geolocation Scanner)**: Scrim overlay `rgba(15, 23, 42, 0.45)` with rounded top sheet elevation: `box-shadow: 0 -10px 30px rgba(15, 23, 42, 0.12)`.

## Shapes

The interface embraces an approachable, friendly shape language via a **Level 2 (Rounded)** paradigm:

- **Cards & Banners**: `16px` (`rounded-2xl`) for main operational panels, student stat cards, and camera scanning windows.
- **Form Controls & Inputs**: `12px` (`rounded-xl`) for class select dropdowns, text fields, and notes areas.
- **Chips, Pills, & Status Badges**: `9999px` (`rounded-full`) for attendance toggles (`Hadir`, `Sakit`, `Izin`, `Alpha`), role badges, and live indicator tags.
- **Action Buttons**: `12px` to `14px` (`rounded-xl`) maintaining substantial tap affordance.

## Components

### 1. App Bar (Top Navigation)
- Compact `56px` height. Displays school/system logo or breadcrumbs, semester tag (`Ganjil 2026/2027`), notification bell with unread badge dot, and teacher profile avatar with status dot.

### 2. Modern Bottom Navigation
- Fixed at screen bottom, `64px` height with safe-area bottom inset.
- Five core icons: **Beranda**, **Jurnal**, **Presensi**, **Asesmen**, and **Profil**.
- Active icon states feature a soft Ocean Teal badge background (`#e0f2fe`) and bold colored icon (`#0284c7`).

### 3. Roster Attendance Toggle (Segmented Pill Array)
- Dedicated 4-state switch for each student row:
  - **Hadir**: Active fill `#ecfdf5`, border `#10b981`, text `#047857`.
  - **Sakit / Izin**: Active fill `#fef3c7`, border `#f59e0b`, text `#b45309`.
  - **Alpha**: Active fill `#fef2f2`, border `#ef4444`, text `#b91c1c`.
  - **Inactive**: Transparent fill, border `#e2e8f0`, text `#64748b`.
- Touch target: Min `36px` height with subtle haptic tap response.

### 4. Hero Quick-Action Card
- Ocean Teal gradient fill (`linear-gradient(135deg, #0284c7 0%, #0369a1 100%)`).
- Contains daily greeting, class schedule alert, and dual CTA buttons for immediate **Jurnal Mengajar** creation and **Presensi Pegawai (Geotag Check-in)**.

### 5. Form Fields & Class Selectors
- Background `#f8fafc` transitioning to pure `#ffffff` on active focus.
- 1.5px solid ring highlight in `#0284c7` on focus.
- Micro-labels positioned above inputs with clear mandatory asterisk marks in `#ef4444`.

### 6. Geolocation & Scanner Shutter
- Centralized camera scanning viewport with rounded corners (`rounded-2xl`) and an active radar sweep animation.
- Includes clear GPS status pill: "Dalam Radius Kampus (12m)" with a green pulse dot.