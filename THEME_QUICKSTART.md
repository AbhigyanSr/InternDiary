# Intern Diary Dark Theme - Quick Start

## What's Been Implemented

A complete premium dark theme has been applied across the entire Intern Diary application with:

### ✅ Core Theme System
- **CSS Custom Properties** for easy customization
- **Tailwind Config** extended with theme colors
- **Consistent naming** and reusable classes
- **Production-quality** CSS with proper organization

### ✅ Updated Components
1. **Layout** (`layout.jsx`) - Sidebar with gradient logo, improved navigation
2. **Dashboard** (`dashboard.jsx`) - Clean card grid, loading states
3. **Job Cards** (`jobCard.jsx`) - Refined modal, better buttons
4. **Applications** (`application.jsx`) - Premium table, modal dialogs
5. **Planner** (`planner.jsx`) - Streamlined task management
6. **Profile** (`profile.jsx`) - Elegant file upload, clean sections
7. **Admin Dashboard** (`adminDashboard.jsx`) - Professional forms, job management
8. **Login/Signup** - Centered auth cards with branding

### 🎨 Design Features
- **Page background**: Subtle gradient (#0A0C10)
- **Cards**: Elevated with soft shadows (12px radius)
- **Sidebar**: Darker background with active state highlighting
- **Buttons**: Multiple variants (primary, outline, secondary)
- **Forms**: Polished inputs with focus states
- **Tables**: Hover effects and clean separators
- **Typography**: Inter font with proper hierarchy
- **Color chips**: Status badges for applications
- **Animations**: Smooth transitions and hover effects

### 🎯 Key Classes Available

**Layout & Structure:**
- `.app-shell` - Main app wrapper
- `.sidebar` - Navigation sidebar
- `.card` - Content cards
- `.card-hover` - Cards with hover effect

**Buttons:**
- `.btn-primary` - Main actions (amber)
- `.btn-outline` - Secondary actions
- `.btn-secondary` - Tertiary actions

**Forms:**
- `.field` - Input, textarea, select fields
- `label` - Form labels (styled globally)

**Badges:**
- `.chip` - Base badge style
- `.chip-neutral` - Gray badge
- `.chip-success` - Green badge
- `.chip-warning` - Yellow badge
- `.chip-danger` - Red badge

**Tables:**
- `.table` - Table wrapper
- `.table-row` - Table rows with hover

**Utilities:**
- `.text-muted` - Secondary text color
- `.text-gradient` - Accent gradient text
- `.divider` - Horizontal separator
- `.loading-spinner` - Loading animation
- `.modal-backdrop` - Modal overlay

## Running the Application

### Start the Development Server
```powershell
# Start backend
cd server
npm start

# Start frontend (in a new terminal)
cd client
npm start
```

The app will open at `http://localhost:3000` with the new dark theme applied.

## Customizing the Theme

### Change the Accent Color
Edit `client/src/index.css`:
```css
:root {
  --accent: #f59e0b; /* Change this to your preferred color */
  --accent-hover: #f6b94a; /* Lighter version for hover */
  --accent-soft: rgba(245, 158, 11, 0.12); /* 12% opacity for backgrounds */
}
```

Also update `client/tailwind.config.js`:
```javascript
colors: {
  'accent': '#F59E0B', // Your new color
  'accent-hover': '#F6B94A',
  // ...
}
```

### Adjust Spacing/Sizing
Modify these variables in `client/src/index.css`:
```css
:root {
  --radius-sm: 8px;
  --radius-md: 10px;
  --radius-lg: 12px; /* Card border radius */
  --shadow-soft: 0 10px 28px rgba(0, 0, 0, 0.32); /* Card shadows */
}
```

### Modify Colors
All colors use CSS variables for easy theme-wide changes:
```css
:root {
  --bg-page: #0a0c10;
  --bg-sidebar: #0f1218;
  --bg-card: #141821;
  --text-primary: #e6eaf2;
  --text-secondary: #9aa3b2;
  /* ... etc */
}
```

## Design Principles

1. **Hierarchy**: Clear visual separation between backgrounds (page → sidebar → cards)
2. **Minimalism**: Remove unnecessary decorations, focus on content
3. **Readability**: High contrast text with comfortable spacing
4. **Consistency**: Same components look the same everywhere
5. **Premium Feel**: Subtle shadows, smooth transitions, quality over quantity

## Browser DevTools Tip

To see the theme in action, open Chrome DevTools → Elements → Inspect any component.
The CSS custom properties are defined in `:root` and can be modified in real-time.

## Color Contrast

All text colors meet WCAG AA standards for accessibility:
- Primary text (#E6EAF2) on dark backgrounds: 12:1 ratio
- Muted text (#9AA3B2) on dark backgrounds: 7:1 ratio
- Accent (#F59E0B) provides sufficient contrast for links and buttons

## Responsive Design

The theme is fully responsive:
- **Desktop**: Full sidebar, multi-column grids
- **Tablet**: 2-column grids, compact spacing
- **Mobile**: Single column, hidden sidebar (mobile header shown)

## Next Steps

1. Review pages in the browser to see the new theme
2. Customize accent color if desired (see above)
3. Adjust spacing/shadows to your preference
4. Add any additional custom components using the theme classes

---

For detailed documentation, see `THEME_GUIDE.md`
