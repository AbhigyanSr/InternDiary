# InternTrack Premium Dark Theme Guide

## Overview
A modern, minimal, premium dark theme for the InternTrack dashboard with clean aesthetics and excellent readability.

## Color System

### Background Colors
- **Page Background**: `#0A0C10` - Deep dark with subtle gradient
- **Sidebar Background**: `#0F1218` - Slightly lighter than page
- **Card Background**: `#141821` - Elevated surface for content
- **Input Background**: `#0E131B` - Darker for form fields

### Text Colors
- **Primary Text**: `#E6EAF2` - High contrast for headings and important content
- **Secondary/Muted Text**: `#9AA3B2` - Lower contrast for descriptions
- **Inverse Text**: `#1A1305` - For text on accent backgrounds

### Accent Color
- **Primary Accent**: `#F59E0B` (Amber) - Buttons, links, highlights
- **Accent Hover**: `#F6B94A` - Lighter amber for hover states
- **Accent Soft**: `rgba(245, 158, 11, 0.12)` - Subtle accent backgrounds

### Borders & Separators
- **Soft Border**: `rgba(255, 255, 255, 0.05)` - Minimal separation
- **Medium Border**: `rgba(255, 255, 255, 0.08)` - More visible borders
- **Separator**: `rgba(255, 255, 255, 0.06)` - For dividing sections

## Typography

### Font Family
- **Primary**: `Inter` - Modern, clean, highly readable
- Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Headings
- Font weight: **600** (semibold)
- Letter spacing: `-0.01em` (tight for modern look)
- Line height: `1.3`

### Body Text
- Font weight: **400-500**
- Line height: `1.6-1.7`
- Comfortable reading experience

## Component Styles

### Cards (`.card`)
- Background: `var(--bg-card)`
- Border: `1px solid var(--border-soft)`
- Border radius: `12px`
- Box shadow: Soft elevation shadow
- Hover effect (`.card-hover`): Lift and enhanced shadow

### Buttons

#### Primary Button (`.btn-primary`)
- Background: Accent color (`#F59E0B`)
- Text: Dark inverse color
- Border radius: `10px`
- Hover: Lifts and brightens
- Font weight: **600**

#### Outline Button (`.btn-outline`)
- Border: `1.5px solid accent`
- Background: Transparent
- Hover: Soft accent background

#### Secondary Button (`.btn-secondary`)
- Background: `rgba(255, 255, 255, 0.06)`
- Subtle appearance for secondary actions

### Badges/Chips (`.chip`)
- Border radius: Full (`9999px`)
- Padding: `0.35rem 0.75rem`
- Font size: `0.75rem`
- Font weight: **600**

Variants:
- **Default**: Accent soft background
- **Neutral** (`.chip-neutral`): Gray tones
- **Success** (`.chip-success`): Green tones
- **Warning** (`.chip-warning`): Yellow tones
- **Danger** (`.chip-danger`): Red tones

### Form Fields (`.field`)
- Background: `var(--bg-input)`
- Border: `1.5px solid border-soft`
- Border radius: `10px`
- Focus: Accent border with glow shadow
- Padding: `0.7rem 1rem`

### Tables (`.table`)
- Clean, minimal design
- Header: Uppercase, small font, muted color
- Rows (`.table-row`): Subtle hover background
- Soft border separators

### Sidebar
- Background: `var(--bg-sidebar)`
- Border right: Soft border
- Menu items (`.sidebar-item`): Rounded, smooth transitions
- Active state (`.sidebar-item-active`): Accent soft background

## Spacing & Layout

### Border Radius
- **Small**: `8px`
- **Medium**: `10px`
- **Large**: `12px` (cards)
- **Full**: `9999px` (pills/chips)

### Shadows
- **Soft**: `0 10px 28px rgba(0, 0, 0, 0.32)` - Default card elevation
- **Elevated**: `0 14px 30px rgba(0, 0, 0, 0.35)` - Hover states
- **Input Focus**: `0 0 0 3px rgba(245, 158, 11, 0.16)` - Accent glow

## Usage Examples

### Creating a Card
```jsx
<div className="card p-6">
  <h3 className="text-lg font-semibold mb-2">Card Title</h3>
  <p className="text-muted">Card description text</p>
</div>
```

### Primary Button
```jsx
<button className="btn-primary px-6 py-3">
  Click Me
</button>
```

### Form Field
```jsx
<div>
  <label htmlFor="email">Email</label>
  <input
    id="email"
    type="email"
    className="field"
    placeholder="you@example.com"
  />
</div>
```

### Status Badge
```jsx
<span className="chip chip-success">Active</span>
<span className="chip chip-warning">Pending</span>
<span className="chip chip-danger">Rejected</span>
```

## Accessibility

- All interactive elements have `:focus-visible` styles
- Sufficient color contrast (WCAG AA compliant)
- Readable font sizes (minimum 0.75rem)
- Clear visual hierarchy
- Semantic HTML with proper labels

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Custom Properties (CSS Variables)
- Flexbox and Grid layouts
- Backdrop filter for modal overlays

## Customization

To modify the theme, edit the CSS custom properties in `client/src/index.css`:

```css
:root {
  --bg-page: #0a0c10;
  --accent: #f59e0b;
  /* ... other variables */
}
```

## Tailwind Integration

Extended Tailwind config includes:
- Custom colors matching the theme
- Extended border radius
- Custom shadows
- Font family configuration

See `client/tailwind.config.js` for details.

---

**Design Principles:**
1. **Minimal**: Remove unnecessary visual noise
2. **Premium**: Quality over quantity in design elements
3. **Readable**: Text legibility is paramount
4. **Consistent**: Unified design language throughout
5. **Modern**: Contemporary SaaS dashboard aesthetics
