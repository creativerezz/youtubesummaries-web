# Trust Signals Components

Trust signal components designed to improve conversion rates by building credibility and reducing user hesitation.

## Components

### 1. LiveCounter

Shows real-time activity with animated counting and pulse effects.

**Features:**
- Animated counter on mount
- Periodic pulse/glow effect
- Responsive design
- Customizable initial count

**Usage:**
```tsx
import { LiveCounter } from "@/components/trust-signals"

<LiveCounter />
<LiveCounter initialCount={5678} />
```

**Props:**
- `className?: string` - Additional CSS classes
- `initialCount?: number` - Starting count (default: 1234)

**Best Placement:**
- Homepage (below hero section)
- Dashboard
- Features page

---

### 2. UserBadge

Compact badge showing total user count.

**Features:**
- Automatic number formatting (10000 → "10k+")
- Outline badge style
- User icon from lucide-react

**Usage:**
```tsx
import { UserBadge } from "@/components/trust-signals"

<UserBadge />
<UserBadge userCount={25000} />
```

**Props:**
- `className?: string` - Additional CSS classes
- `userCount?: number` - Total users (default: 10000)

**Best Placement:**
- Pricing page
- Homepage header
- Sign-up pages

---

### 3. AccuracyBadge

Highlights transcript accuracy to counter "AI slop" concerns.

**Features:**
- Checkmark icon for verification
- Primary color accent
- Hover effect
- Responsive text sizing

**Usage:**
```tsx
import { AccuracyBadge } from "@/components/trust-signals"

<AccuracyBadge />
```

**Props:**
- `className?: string` - Additional CSS classes

**Best Placement:**
- Features page
- Homepage (above/below video analyzer)
- Product pages

---

### 4. TrustIndicators

Combined component with multiple trust signals.

**Features:**
- Three indicators with icons:
  - 100% Free to Start
  - No Credit Card Required
  - Cancel Anytime
- Horizontal or vertical layout
- Separator lines in horizontal mode

**Usage:**
```tsx
import { TrustIndicators } from "@/components/trust-signals"

// Horizontal (default)
<TrustIndicators />

// Vertical
<TrustIndicators vertical />
```

**Props:**
- `className?: string` - Additional CSS classes
- `vertical?: boolean` - Vertical layout (default: false)

**Best Placement:**
- Below CTAs
- Pricing page
- Sign-up forms
- Checkout flows

---

## Import All Components

```tsx
import {
  LiveCounter,
  UserBadge,
  AccuracyBadge,
  TrustIndicators,
} from "@/components/trust-signals"
```

## Design Principles

All components follow these design guidelines:

1. **Consistent with shadcn/ui**: Uses the same design tokens and styling patterns
2. **Accessible**: Proper ARIA labels, semantic HTML, keyboard navigation
3. **Responsive**: Mobile-first design, works on all screen sizes
4. **Themeable**: Supports light/dark mode via CSS variables
5. **Performant**: Optimized animations, no layout shifts
6. **Type-safe**: Full TypeScript support with proper prop types

## Styling

All components use:
- Tailwind CSS v4 utility classes
- CSS variables for theming
- lucide-react icons
- shadcn/ui design tokens

Colors used:
- `primary` - For accent colors and highlights
- `muted-foreground` - For secondary text
- `border` - For separators and borders
- `card` - For backgrounds

## Animation Details

### LiveCounter
- Initial count-up animation (1 second)
- Pulse effect every 3 seconds
- Smooth transitions with `transition-all duration-300`

### TrustIndicators
- No automatic animations (static)
- Can be enhanced with hover effects if needed

### AccuracyBadge
- Hover state with background color change
- Smooth transition on hover

## Customization

All components accept a `className` prop for additional styling:

```tsx
<LiveCounter className="my-4 mx-auto" />
<UserBadge className="text-lg" />
<AccuracyBadge className="mb-8" />
<TrustIndicators className="mt-6" />
```

## Demo Page

Visit `/trust-signals-demo` to see all components in action.

## GTM Playbook Reference

These components implement trust signals from the GTM (Go-to-Market) playbook:

1. **Social Proof**: LiveCounter, UserBadge
2. **Risk Reduction**: TrustIndicators
3. **Quality Assurance**: AccuracyBadge

## Integration Examples

### Homepage
```tsx
<Hero />

{/* Live Activity Counter */}
<section className="container mx-auto px-4 py-8 flex justify-center">
  <LiveCounter />
</section>

<VideoAnalyzer />
```

### Pricing Page
```tsx
<div className="space-y-6">
  <div className="flex items-center justify-center gap-4">
    <UserBadge />
  </div>

  <PricingCards />

  <div className="flex justify-center">
    <TrustIndicators />
  </div>
</div>
```

### Features Page
```tsx
<section className="space-y-8">
  <h2>Accurate Transcripts</h2>
  <AccuracyBadge />
  <FeatureList />
</section>
```

## Accessibility

All components are accessible:

- Semantic HTML elements
- Proper icon sizing (`aria-hidden` on decorative icons)
- Readable text contrast ratios
- Keyboard navigation support
- Screen reader friendly

## Browser Support

Works in all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Performance

- Minimal JavaScript (client components only where needed)
- No external dependencies beyond lucide-react
- Optimized animations (GPU-accelerated)
- Small bundle size
