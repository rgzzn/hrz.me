# Hyper Animated Landing

A Vite + React landing page with kinetic neon visuals, pixel cursor effects, magnetic orbs, and animated typography. The experience is driven by canvas rendering, SVG path animation, and CSS-based glow/float effects.

## Features

- **Pixel cursor trail** rendered on a full-screen canvas with configurable trail length and colors.
- **Interactive magnetic orbs** with hover glow, floating animations, and external links.
- **Dynamic typography** that cycles through multiple font families with a ghost/glitch overlay.
- **Animated rope connection** between orbs using an SVG quadratic curve with glow.
- **Ambient background effects** including scanlines, vignette, noise texture, and grid.

## Tech Stack

- **React 19 + TypeScript** for the UI and component logic.
- **Vite** for development and builds.
- **Lucide React** for iconography.

## Project Structure

- `App.tsx`: Top-level layout, mouse tracking, orb positioning, and SVG rope animation.
- `components/PixelCursor.tsx`: Canvas cursor/trail renderer.
- `components/Orb.tsx`: Floating orb links and hover states.
- `components/DynamicText.tsx`: Animated title text with randomized fonts.
- `types.ts`: Shared interfaces for props and canvas points.

## Scripts

```bash
npm run dev     # start dev server
npm run build   # build for production
npm run preview # preview production build
```

Scripts are defined in `package.json`.

## Notes

- The pixel cursor is hidden on small screens (`md` breakpoint) for performance and readability.
- The orbs link out to external destinations (RGZZN and DASHB).
