# Avatar images go here

Drop your avatar art in this folder (`public/avatars/`). Files here are served
at `/avatars/<filename>` and are **bundled as-is** by Vite — no import needed.

## Recommended

- **Format:** PNG with a transparent background (or square JPG if you don't have PNG)
- **Size:** 512×512 or 1024×1024 (square). The renderer scales to fit.
- **Naming:** lowercase, hyphenated, stable — e.g. `blaze-ranger.png`

## How they get wired in

The avatar is **layered**. Each layer is one slot:

| Slot        | What it is                          |
| ----------- | ----------------------------------- |
| `base`      | the main character (biggest impact) |
| `skin`      | body colour / creature body         |
| `hair`      | hair, hats, crowns                  |
| `outfit`    | clothes / armour                    |
| `accessory` | glasses, headphones, masks          |
| `pet`       | companion beside the character      |
| `aura`      | glow / sparkles behind              |

To turn a code-drawn layer into an image layer, add an `image` field to that
item in `src/data/wardrobe.ts`:

```ts
{
  id: 'base-blaze',
  slot: 'base',
  name: 'Blaze Ranger',
  rarity: 'epic',
  cost: 300,
  description: 'A brave fox ranger.',
  image: '/avatars/blaze-ranger.png', // <-- raster overrides code art
}
```

When `image` is set, `Avatar.tsx` draws that image instead of the built-in SVG
art for that layer. Files still work if the image is a full-body composite; a
`base` image replaces the whole drawing.

## Current placeholder art

The app currently ships **code-drawn SVG art** for every item, so it looks
complete with zero image files. Images are purely additive — drop them in and
point the matching wardrobe item at them when ready.
