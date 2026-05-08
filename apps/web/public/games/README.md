# Game Images

Drop image files here, named to match each game's `slug` field in `src/pages/HomePage.tsx`.

## Expected filenames

```
array-basics.png
loop-master.png
recursion-quest.png
algorithm-race.png
data-structure.png
gravity-sim.png
force-calc.png
motion-lab.png
vocab-builder.png
grammar-run.png
speed-reading.png
calculus-quest.png
algebra-master.png
geometry-pro.png
```

## Recommended specs

- **Format:** `.png` (or change the extension in `HomePage.tsx`)
- **Dimensions:** 400×300px (4:3 ratio) — cards display at 208×128, so 2× this looks crisp on retina screens
- **Size:** under ~150 KB each (compress with [tinypng.com](https://tinypng.com) or `pngquant`)

## Adding a new game

1. Add an entry to the `GAMES` array in `apps/web/src/pages/HomePage.tsx` with a unique `slug`
2. Drop `<slug>.png` in this folder
3. That's it — Vite serves anything in `/public` at the root URL automatically (no rebuild needed in dev)

## What if an image is missing?

The card falls back to a gradient + emoji automatically (via `onError` on the `<img>`). So you can ship without all images and add them over time without breaking anything.

## Switching to .jpg or .webp

In `HomePage.tsx`, change one line in `GameCard`:
```tsx
const imageUrl = `/games/${game.slug}.png`;
//                                         ↑ change extension
```
