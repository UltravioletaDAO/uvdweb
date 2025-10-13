# SwapWidget V2 - shadcn/ui Implementation

## Overview

SwapWidgetV2 is a complete redesign of the original SwapWidget component using shadcn/ui components for a more modern, polished, and maintainable design.

## Key Improvements

### 1. **Design System Integration**
- ✅ Uses shadcn/ui components (Button, Card, Badge, Slider, Tabs)
- ✅ Consistent design tokens and styling across the application
- ✅ Better accessibility with proper ARIA labels and semantic HTML
- ✅ Improved visual hierarchy and spacing

### 2. **Enhanced User Experience**
- ✅ Cleaner, more modern interface with glassmorphism effects
- ✅ Better visual feedback for interactions (hover states, animations)
- ✅ Improved transaction status display with AnimatePresence
- ✅ More intuitive slippage controls with visual slider
- ✅ Enhanced token selector component with ambient effects

### 3. **Component Architecture**
- ✅ Modular TokenSelector component (reusable across app)
- ✅ Separated TransactionStatus component for better code organization
- ✅ Better separation of concerns
- ✅ Easier to maintain and extend

### 4. **Visual Enhancements**
- ✅ Gradient backgrounds and ambient lighting effects
- ✅ Smooth animations with Framer Motion
- ✅ Better color usage with ultraviolet theme integration
- ✅ Icons from lucide-react for consistency
- ✅ Improved loading states

## Components Installed

The following shadcn/ui components were installed:

```bash
- button      # Primary action buttons
- card        # Container cards with header/content
- input       # Form inputs (prepared for future use)
- badge       # Status badges and labels
- slider      # Slippage tolerance slider
- tabs        # Tab navigation (prepared for future use)
```

## File Structure

```
src/
├── components/
│   ├── SwapWidget.js           # Original implementation
│   ├── SwapWidgetV2.jsx        # New shadcn/ui version
│   ├── SwapWidgetV2Example.jsx # Usage examples
│   └── ui/
│       ├── button.jsx          # shadcn/ui Button
│       ├── card.jsx            # shadcn/ui Card
│       ├── badge.jsx           # shadcn/ui Badge
│       ├── slider.jsx          # shadcn/ui Slider
│       ├── tabs.jsx            # shadcn/ui Tabs
│       └── token-selector.jsx  # Custom TokenSelector
└── lib/
    └── utils.js                # cn() utility function
```

## Configuration Files

### `components.json`
shadcn/ui configuration file that defines:
- Component style (default)
- Path aliases (@/components, @/lib/utils)
- Tailwind configuration paths
- CSS variable usage

### `jsconfig.json`
JavaScript configuration for path aliases:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## Usage

### Basic Usage

```jsx
import SwapWidgetV2 from '@/components/SwapWidgetV2';

function App() {
  return (
    <div className="container mx-auto p-8">
      <SwapWidgetV2 />
    </div>
  );
}
```

### With Wallet Connection

```jsx
import SwapWidgetV2 from '@/components/SwapWidgetV2';
import { ConnectButton } from 'thirdweb/react';

function SwapPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Token Swap</h1>
          <ConnectButton client={client} />
        </div>
        <SwapWidgetV2 />
      </div>
    </div>
  );
}
```

## Features

### Token Selection
- Visual token images with fallback gradients
- Real-time balance display
- Quick amount selection buttons (25%, 50%, 75%, MAX)

### Slippage Control
- Visual slider for precise adjustment (0% - 10%)
- Default 1% slippage tolerance
- Real-time updates

### Transaction Status
- Animated status cards with icons
- Clear transaction states:
  - Submitted (blue, spinning)
  - Pending (yellow, pulsing)
  - Success (green, checkmark)
  - Error (red, x-circle)
- Direct links to Snowtrace explorer

### Auto-Refresh
- Price quotes refresh every 5 seconds
- Manual refresh button with visual feedback
- Balance updates every 10 seconds

### Approval Flow
- Automatic detection of required approvals
- Separate approval button for UVD → AVAX swaps
- Clear approval status display

## Styling

The component uses Tailwind CSS with custom theme colors:

```js
// Key colors used
- ultraviolet       // Primary brand color
- ultraviolet-light // Lighter variant
- background        // Dark background
- foreground        // Primary text
- muted-foreground  // Secondary text
- border            // Border colors
- card              // Card backgrounds
```

## Comparison: V1 vs V2

| Feature | V1 (Original) | V2 (shadcn/ui) |
|---------|---------------|----------------|
| Design System | Custom components | shadcn/ui |
| Icons | @heroicons/react | lucide-react |
| Card Layout | Custom divs | Card component |
| Buttons | Custom styled | Button component |
| Slippage Control | Button grid | Slider component |
| Status Display | Inline alerts | Animated cards |
| Code Organization | Single file | Modular components |
| Accessibility | Basic | Enhanced ARIA |
| Animations | Basic framer-motion | Advanced framer-motion |

## Migration Guide

To migrate from SwapWidget to SwapWidgetV2:

1. Update imports:
```jsx
// Before
import SwapWidget from '@/components/SwapWidget';

// After
import SwapWidgetV2 from '@/components/SwapWidgetV2';
```

2. Update component usage (no prop changes needed):
```jsx
// Before
<SwapWidget />

// After
<SwapWidgetV2 />
```

3. All existing functionality is preserved:
- Same Web3 integration (thirdweb)
- Same contract interactions
- Same translation keys
- Same wallet connection flow

## Future Enhancements

Potential improvements for future versions:

1. **Token Selection Modal**
   - Add support for multiple token pairs
   - Token search functionality
   - Token list with logos and balances

2. **Advanced Settings**
   - Transaction deadline customization
   - Custom gas price controls
   - Multi-hop routing

3. **Analytics Integration**
   - Swap history
   - Price charts
   - Volume statistics

4. **Additional Features**
   - Price impact warnings
   - Limit orders
   - Swap routing optimization

## Testing

To test the component:

1. Start the development server:
```bash
npm start
```

2. Navigate to a page using SwapWidgetV2

3. Connect your wallet

4. Test swap functionality:
   - AVAX → UVD swap
   - UVD → AVAX swap (with approval)
   - Settings adjustment
   - Transaction status updates

## Dependencies

New dependencies installed:
- `@radix-ui/react-slider` - Slider primitive
- `@radix-ui/react-slot` - Slot primitive
- `@radix-ui/react-tabs` - Tabs primitive
- `lucide-react` - Icons (already installed)

Existing dependencies used:
- `framer-motion` - Animations
- `thirdweb` - Web3 integration
- `react-i18next` - Translations
- `tailwindcss` - Styling

## Support

For issues or questions:
- Check the example file: `SwapWidgetV2Example.jsx`
- Review shadcn/ui docs: https://ui.shadcn.com
- Check thirdweb docs: https://portal.thirdweb.com

## License

Same as project license (ISC)
