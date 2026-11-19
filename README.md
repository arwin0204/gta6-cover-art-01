# Vice Sunset Cover Studio

[![gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/arwin0204/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/arwin0204/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

An entry for the [Make GTA 6 Cover Art](https://make.fun/bounty/gta6-cover-art-01) bounty on make.fun.

Turn a photo and a caption into a Vice-style poster cover: multi-panel
layouts (Poster, Triptych, Grid 2×2, Single), per-panel crop and position,
bold caption lettering, and a sunset or neon colour grade. Export the cover
as a PNG in 1080 × 1080, 1080 × 1350 or 1920 × 1080.

## Try it

Serve `app/` with any static server and open `index.html` in desktop Chrome:

```sh
node serve.ts
# app/ is on http://localhost:8080
```

Everything runs offline: every script, font and image is a file under `app/`,
and photos are read on your own machine, never uploaded.

## How it works

- **Photo** — pick one of the three built-in sample scenes (drawn
  procedurally on canvas: Boulevard Dusk, Neon Pier, Palm Beach) or upload
  your own photo, then click a panel in the preview to crop and position it.
  One photo can fill every panel, or each panel can hold a different one.
- **Panels** — four poster layouts. The Poster layout pairs one large hero
  panel with two small ones; Triptych splits the cover into three vertical
  panels; Grid makes four; Single is one full-bleed photo.
- **Caption** — a title in Bebas Neue, Anton or Pacifico, in white, gold,
  pink or cyan, at the top or the bottom, plus a script tagline.
- **Colour grade** — Sunset, Neon Nights, Golden Hour or Noir, with a
  vignette and film grain over the whole cover.
- **Export** — renders the cover at the exact post size and downloads it
  as a PNG.

## Files

- `main.ts` — the entrypoint: copies `app/` and `screenshots/` to
  `/output` and writes `/output/dossier.json`.
- `app/` — the static web app (`index.html`, `style.css`, `src/`,
  `fonts/`).
- `app/fonts/` — Bebas Neue, Anton and Pacifico, all under the SIL Open
  Font License (`OFL.txt`).
- `screenshots/` — screenshots taken while building the app; the first by
  name is the cover.
- `shots.json` — the fixed scenes the screenshots were taken from.
- `serve.ts` — a tiny static server for local testing.
- `vendor/makefun-app.ts` — the kit's dossier library, unchanged.

## License

MIT. See [LICENSE](LICENSE).
