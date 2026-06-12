# Image build pipeline

Resolves a **pre-vetted image for every item in `topics.js`** at build time, so
the app never guesses at runtime. The app only shows an image when this
pipeline (plus your review) produced one — everything else falls back to the
text card.

## How it works

1. **Strict resolution** (`lib/resolve.js`) — per category, exact-match only:
   - Movies/TV → TMDB exact title (+year) → official poster
   - People → exact Wikipedia article → Wikidata portrait (P18), with the
     entity description checked against the topic context (an "NFL QBs" topic
     requires an American-football description)
   - Music artists → MusicBrainz exact name → Fanart.tv artist photo
   - Brands/teams/software → Wikidata official logo (P154)
   - Food/places/everything else → exact Wikipedia article lead image
   - Stock-photo APIs are never auto-chosen (they're the accuracy risk);
     they only appear as review-page candidates.
2. **Validation** (`lib/validate.js`) — bytes must download, decode, and meet
   size/aspect floors.
3. **Focal points** (`lib/focal.js`) — face detection for people (faces are
   never cropped out), saliency cropping for other full-bleed categories.
   A "person" image with no detectable face is flagged for review.
4. **Outputs**:
   - `images.manifest.json` — full record incl. alternates (feeds the review page)
   - `images.js` — lean runtime manifest, **only** auto/approved entries

## Review loop

1. Serve the repo root (`python3 -m http.server`) and open
   `http://localhost:8000/tools/review.html` (or the same path on GitHub Pages).
2. Approve / reject / swap images; click **Copy overrides JSON**.
3. Paste into `images.overrides.json`, commit, push — the GitHub workflow
   rebuilds `images.js` with your decisions baked in.

## Running

Runs automatically via `.github/workflows/build-images.yml` whenever
`topics.js`, `images.overrides.json` or this tool changes (or manually via
workflow dispatch). Locally:

```sh
cd tools/build-images
npm ci
node build.js                  # incremental: only new/changed items hit the network
node build.js --topic "Sci-Fi" # limit to topics matching a substring
node build.js --label "Mahomes"
node build.js --force          # re-resolve everything
```

Incremental behavior: already-vetted entries are only re-checked for link rot.
A dead URL is re-resolved but **demoted to review** — a vetted image is never
silently swapped. Review/rejected entries wait for a human.

Offline test suite (mocked network): `bash test/run-tests.sh`
