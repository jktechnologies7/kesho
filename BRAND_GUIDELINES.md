# KESHO Brand Guidelines

## Brand Identity

**Company:** JK COLLECTIONS  
**Product:** KESHO (Tomorrow)  
**Platform:** Progressive Web App (PWA), Android (future), iOS (future)  
**Target Market:** Kenya & East Africa  
**Currency:** Kenyan Shilling (KES/KSh)

---

## Logo & Branding

### Primary Logo
- **Name:** KESHO
- **Tagline:** "Tomorrow, Today"
- **Icon:** Checkmark (✓) integrated into the 'O'
- **Meaning:** Trust, completion, verified financial management

### Badge Logo
- **KSh** - Kenyan Shilling currency identifier
- Used for quick recognition in app UI
- Represents Kenya-first approach

---

## Color Palette

### Primary Colors
```
Primary Blue:      #6366F1 (Indigo)
Primary Purple:    #8B5CF6 (Violet)
Secondary Blue:    #3B82F6 (Sky Blue)
```

### Semantic Colors
```
Success:    #10B981 (Emerald)
Warning:    #F59E0B (Amber)
Danger:     #EF4444 (Red)
Info:       #0EA5E9 (Cyan)
```

### Neutral Colors
```
White:      #FFFFFF
Gray-50:    #F9FAFB
Gray-100:   #F3F4F6
Gray-200:   #E5E7EB
Gray-300:   #D1D5DB
Gray-400:   #9CA3AF
Gray-500:   #6B7280
Gray-600:   #4B5563
Gray-700:   #374151
Gray-800:   #1F2937
Gray-900:   #111827
```

### Gradients
```
Primary Gradient:   #6366F1 → #8B5CF6 (Blue to Purple)
Secondary Gradient: #8B5CF6 → #3B82F6 (Purple to Sky Blue)
Success Gradient:   #10B981 → #06B6D4 (Emerald to Cyan)
```

---

## Icon System

### Primary Icons (Featured in Branding)
- **Home** (Purple) - Dashboard, overview
- **Lightning Bolt** (Blue) - Bills, payments, fast transactions
- **Water Droplet** (Teal) - Savings, funds, liquid assets
- **Wallet** (Indigo) - Money, accounts
- **Chart/Graph** (Secondary) - Analytics, insights
- **Shield** (Green) - Security, protection
- **Lock** - Authentication, security

### Icon Style
- Rounded, modern design
- Filled circles with colored backgrounds
- 48px base size for UI components
- 24px for inline usage
- Consistent stroke weight: 2px

---

## Typography

### Font Family
**Primary:** Inter or -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto
**Fallback:** Sans-serif

### Font Hierarchy

| Usage | Size | Weight | Line Height |
|-------|------|--------|-------------|
| Hero/Logo | 48px | 700 | 1.2 |
| Page Title | 32px | 700 | 1.3 |
| Section Title | 24px | 600 | 1.4 |
| Heading 3 | 20px | 600 | 1.5 |
| Body Large | 16px | 400 | 1.6 |
| Body Regular | 14px | 400 | 1.5 |
| Body Small | 12px | 400 | 1.4 |
| Caption | 11px | 500 | 1.4 |

---

## Visual Elements

### Cards & Containers
- Border Radius: 16px (primary), 12px (secondary), 8px (small)
- Shadow: Soft elevation shadows
- Spacing: Consistent 16px padding
- Border: 1px, color: Gray-200 (light mode), Gray-700 (dark mode)

### Buttons
- Primary: Gradient (Blue → Purple)
- Secondary: White background, primary border
- Tertiary: Text only
- Size: 48px height (desktop), 44px (mobile)
- Border Radius: 12px

### Spacing Scale
```
4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px
```

---

## App Interface Elements

### Dashboard Layout
- Top navigation bar with KESHO branding
- Left sidebar or bottom nav (mobile)
- Main content area with card-based layout
- Quick action buttons for key features

### Feature Cards (from branding image)
1. **Home** (Purple icon) - Account overview
2. **Lightning/Bills** (Blue icon) - Bill management & payments
3. **Savings** (Teal icon) - Savings goals & funds
4. **Wallet** - Money management & accounts

### Interactive States
- Hover: Subtle shadow increase, slight scale (1.02x)
- Active: Color intensification, underline/highlight
- Disabled: Opacity 50%, cursor not-allowed
- Loading: Spinner animation, color fade

---

## Mobile Design

### Safe Areas
- Top: 44px (iOS notch consideration)
- Bottom: 16px (home indicator)
- Sides: 16px padding

### Touch Targets
- Minimum: 48x48px (WCAG recommendation)
- Preferred: 56x56px for primary actions

### Bottom Navigation
- 5 max items
- Icons + labels
- Height: 56px
- Active indicator: Underline or background color

---

## Animations & Transitions

### Duration
- Quick: 150ms (micro-interactions)
- Standard: 300ms (page transitions)
- Slow: 500ms (complex animations)

### Easing
- Ease-in-out: Standard transitions
- Ease-out: Entrance animations
- Ease-in: Exit animations

### Loading States
- Spinner animation (rotating icon)
- Skeleton screens for content
- Progress bars for uploads

---

## Dark Mode

### Color Adjustments
- Background: #111827 (Gray-900)
- Surface: #1F2937 (Gray-800)
- Text: #F9FAFB (Gray-50)
- Borders: #374151 (Gray-700)
- Gradients: Adjusted opacity/saturation

---

## Voice & Tone

### Brand Voice
- **Professional but approachable**
- Clear, concise communication
- Action-oriented language
- Empowering users financially

### Examples
- ✅ "Start saving today"
- ✅ "Manage bills with ease"
- ✅ "Your financial health score"
- ❌ "Do stuff with money"

---

## Photography & Imagery

### Style
- Modern, clean product photography
- Real-world financial scenarios
- Diverse user representation
- Soft lighting, professional editing

### Usage
- Hero sections: Large, impactful images
- Cards: Subtle, contextual illustrations
- Empty states: Friendly, helpful graphics

---

## Accessibility

### Color Contrast
- Text on background: Minimum 4.5:1 (WCAG AA)
- Large text: Minimum 3:1
- UI components: Minimum 3:1

### Typography
- No text smaller than 12px
- Line height minimum 1.4
- Letter spacing for readability

### Interactive Elements
- Clear focus states (2px outline)
- Keyboard navigation support
- ARIA labels where needed

---

## Deployment Branding

### Netlify/Vercel Badge
- Use official badges only
- Place in footer or README
- Link to deployment platform

### Meta Tags
```html
<meta name="theme-color" content="#6366F1">
<meta name="description" content="KESHO - Tomorrow, Today. Manage your finances with ease.">
<meta property="og:image" content="kesho-og-image.png">
```

### Favicon
- Use KSh badge logo
- Multiple sizes: 16px, 32px, 180px (apple-touch-icon)

---

## File Formats

### Logo
- PNG (transparent, all sizes)
- SVG (scalable, all contexts)
- WebP (optimized)

### Icons
- SVG (primary)
- PNG (fallback)
- Icon font (optional, for performance)

### Images
- WebP (modern browsers)
- JPEG (fallback)
- Compressed & optimized

---

## Reference Assets

See `/design` directory:
- `kesho-logo.svg` - Primary logo
- `kesho-badge.svg` - KSh badge
- `color-palette.png` - Color reference
- `typography-scale.png` - Font hierarchy
- `component-library.fig` - Figma design file
- `brand-guidelines.pdf` - Complete PDF

---

**Last Updated:** 2026-07-11  
**Version:** 1.0  
**Author:** Japhee Ke (JK COLLECTIONS)
