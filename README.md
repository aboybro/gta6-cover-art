# Vice Sunset Cover Studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/aboybro/gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/aboybro/gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Turn your photos and a caption into multi-panel sunset cover art, in the style of a GTA 6 poster — free, offline, in the browser. Upload your own photos (they never leave your machine), fill up to 9 panels from one photo or several, crop and position each panel, letter the caption in halftone, outline, gradient or solid type, pick one of 6 sunset/neon colour grades, and export the cover as a PNG in all three post sizes at once: 1080 x 1080, 1080 x 1350 and 1920 x 1080.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. Or serve `app/` with any static file server — the app is plain static files with no build step and makes no network request.

## How it works

- **6 layouts** — Hero, Split Duo, Triple Strip, Mosaic 5, Grid 6 and Grid 9, with diagonal comic-book panel edges.
- **Per-panel crop** — click a panel to select it, drag to pan, scroll to zoom, or use the sliders. One photo can fill every panel with a different crop, or each panel can take its own photo.
- **6 colour grades** — Vice Sunset, Neon Pink, Coral Coast, Midnight, Palm Gold and Mono Noir.
- **Caption lettering** — Anton (SIL Open Font License, shipped under `app/fonts/`), in halftone, solid, outline or gradient styles, top or bottom, with a letterspaced subtitle.
- **Poster finish** — a retro striped sun, deterministic film grain, vignette and a poster frame.
- **Export** — one size, or all three post sizes in one click, as PNG files.

Everything in this entry is original: the art is drawn with the canvas API, and no Rockstar Games logo, artwork or font is used.

## License

SPDX-License-Identifier: MIT — see [LICENSE](LICENSE). The Anton font in `app/fonts/` is licensed under the SIL Open Font License 1.1 (see `app/fonts/OFL.txt`).

---

<sub>Entered on [make.fun](https://make.fun/?ref=mbyg0687&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
