# That Place In Space — Filming Locations App

A static site — and installable PWA — that finds the nearest Star Wars
filming locations to the user, with directions, what3words links, an
expandable detail view, and a photo gallery per location.

## Files

```
.
├── index.html              — the app shell (HTML/CSS/JS, no build step, no dependencies)
├── manifest.json           — PWA manifest (name, icons, standalone display)
├── sw.js                   — service worker (offline caching, required for Android install prompt)
├── data/
│   └── locations.json      — the location database (edit this to add/update locations)
├── assets/
│   ├── icons/               — generated PWA/home-screen icons (favicon, apple-touch-icon, 192/512, maskable)
│   └── images/
│       ├── banner.jpg       — header banner artwork ("That Place In Space" logo)
│       ├── gallery/         — photos for the auto-scrolling hero gallery at the top of the page
│       └── <Planet>/         — per-location photo sets, one subfolder per planet/location
│                              (Naboo, Kenari, Coruscant, Scarif, Morlana, ...)
├── source/
│   └── APP_location_test_info_.xls  — original spreadsheet the location data was sourced from
└── README.md
```

This layout is ready to deploy as-is to any static host (GitHub Pages,
Netlify, S3, etc.) — just upload the folder. `source/` is reference material
only and isn't linked from the app; drop it if you don't want it published.

## Installing as an app (PWA)

The site is installable on Android, iPhone, and desktop:

- **Android (Chrome)**: visit the hosted site, then use the "Install app" /
  "Add to Home screen" prompt (or the browser menu). This needs the
  service worker (`sw.js`) and manifest, both already wired up in
  `index.html`'s `<head>`.
- **iPhone (Safari)**: visit the site, tap Share → "Add to Home Screen".
  iOS doesn't use the install prompt or service worker for this — it just
  needs the `apple-touch-icon` link and `apple-mobile-web-app-capable` meta
  tag, both already in `<head>`.
- **Requires HTTPS** (or `localhost`) — like Geolocation, service workers
  and the install prompt don't work over a plain `file://` or `http://`
  URL. This is the same constraint already noted below for Geolocation.
- Icons in `assets/icons/` were auto-generated from the pictogram in the
  existing banner artwork. Swap them for dedicated icon art any time — just
  keep the same filenames/sizes referenced in `manifest.json`.

## How it works

- **Location data** lives in `data/locations.json`, fetched at load time.
  Add a new location by appending an object in this shape:

  ```json
  {
    "id": "tatooine",              // unique, used for anchors + cross-links
    "name": "Chott el Djerid",
    "region": "Tunisia",
    "planet": "Tatooine",
    "show": "A New Hope",
    "note": "The Lars homestead — ...",
    "lat": 33.842870302521774,
    "lng": 7.779035748416805,
    "w3w": "backflips.trained.beak",  // optional — renders a what3words link
    "access": "Free",                 // optional — one of Free / Paid / Restricted / Unknown
    "linkTo": "some-other-id",        // optional — cross-links two entries at the same site
    "image": "https://..."            // optional — main card photo (also used for the mini-gallery)
  }
  ```

  `access` renders as its own row in the expanded card, right under
  Coordinates. Leave it unset (or `"Unknown"`) until the real access
  status for a site is confirmed — don't guess Free/Paid/Restricted.

- **`DATA_URL`** in `index.html`'s `<script>` block points at
  `./data/locations.json`. Point it at a hosted JSON endpoint later (same
  array shape) and the app will fetch from there instead — no other code
  changes needed. `FALLBACK_LOCATIONS`, hardcoded further down in the same
  file, is only a safety net for when the fetch fails (offline, opened
  straight from disk, etc.) — `data/locations.json` is the one to keep
  up to date.

- **Photos**: give a location a real multi-shot gallery by adding an
  `images` array directly to its entry in `data/locations.json` (see e.g.
  `morlana` or `scarif`). If a location only has `image` and no `images`,
  the app falls back to repeating that single photo 5 times as a
  placeholder gallery (see `fivePlaceholder()` in the script).

- **Geolocation**: uses the browser's native Geolocation API. Note this
  requires the page to be served over `https://` or `localhost` — it will
  NOT prompt for permission when opened directly from disk (`file://`) on
  most mobile browsers. There's a manual fallback (type a city name or
  `lat,lng`) that works everywhere, using the free Nominatim geocoding API.

- **Directions**: each result links to
  `https://www.google.com/maps/dir/?api=1&origin=...&destination=...`

- **what3words**: links to `https://what3words.com/<word.word.word>`

## Local testing

`fetch()` of a local JSON file is blocked by CORS when the page is opened
via `file://`, so serve the folder over HTTP to test the data loading:

```
python -m http.server 8000
```

then open `http://localhost:8000/`.

## Known gaps / next steps

- Only 7 locations currently loaded (from the spreadsheet in `source/`).
  More can be added to `data/locations.json` following the same shape.
- Distances are straight-line (haversine), not driving distance.
- No backend/build tooling — it's intentionally a static HTML + JSON site,
  no framework, so it's easy to host anywhere once ready.
