# Image build pipeline

Resolves a **pre-vetted image for every item in `topics.js`** at build time, so
the app never guesses at runtime. The app only shows an image when this
pipeline (plus your review) produced one — everything else falls back to the
text card.

## How it works

1. **Strict resolution** (`lib/resolve.js`) — every label is first pinned to
   one Wikipedia article / Wikidata entity, then artwork is fetched *by that
   entity's identity*, never by a fuzzy name search:
   - Movies/TV → the entity's TMDB ID (Wikidata P4947/P4983) → official
     poster; exact title (+year) search only when Wikidata has no ID
   - People → exact article, entity must be a human (P31) whose description
     fits the topic (an "NFL QBs" topic requires American football); actors
     etc. get the TMDB headshot via the entity's TMDB person ID (P4985),
     everyone else the Wikipedia/Wikidata portrait
   - Music artists → the entity's MusicBrainz ID (P434) → Fanart.tv photo
   - Brands/teams/software → Wikidata official logo (P154); team *seasons*
     use their team's logo (P5138); a team label must describe a team
     ("Liverpool" alone is the city)
   - Products in product topics (cars, phones, consoles…) → a photo of that
     model, never the maker's logo; an article that turns out to be about
     the company is rejected
   - Food/places/characters/everything else → exact article lead image
   - Redirects: an alias ("MIT") is fine; a redirect into a section of a
     broader article is rejected and one to a differently named subject
     ("Sour cream and onion" → "French onion dip") is never auto-shipped
     without the vision gate's confirmation
   - Filename blocklist: flags/maps/logos for photo categories, and cosplay,
     signatures, graves, waxworks, murals… for everything
   - Stock-photo APIs are never auto-chosen on their own.
2. **Validation** (`lib/validate.js`) — bytes must download, decode, and meet
   size/aspect floors.
3. **Focal points** (`lib/focal.js`) — face detection for people (faces are
   never cropped out), saliency cropping for other full-bleed categories.
   A "person" image with no detectable face is flagged for review.
4. **Vision gate** (`lib/verify.js`, on when `ANTHROPIC_API_KEY` is set) —
   Claude looks at every candidate and must confirm, with ≥ 0.8 confidence,
   that it depicts the item *as meant in its topic* ("Cream soda" in "Best
   Sodas": cream soda, not cola; a car model, not its maker's logo). If the
   strict pick fails, the entity's other images and then picture searches are
   tried (up to 4 per item); nothing confirmed → text card. Real people:
   the model is instructed never to identify anyone by their face — it only
   checks picture type and visible context, and identity comes solely from
   the entity pin; picture searches are never used for people. Verdicts are
   cached in the manifest, so each image is checked once.
   Setup: add an `ANTHROPIC_API_KEY` repository secret. Optional: a
   `VERIFY_MAX_CALLS` repository variable caps checks per run (the rest are
   picked up next run); `VERIFY_MODEL` / `VERIFY_EFFORT` env vars override
   the defaults (`claude-opus-5-5`, `medium`).
5. **Outputs**:
   - `images.manifest.json` — full record incl. alternates and verdicts
     (feeds the review page)
   - `images.js` — lean runtime manifest, **only** auto/approved entries

When the rules tighten, `RULES_VERSION` in `build.js` is bumped and every
machine-vetted entry is re-resolved on the next build; human-approved
entries are never second-guessed.

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

Incremental behavior: already-vetted entries are only re-checked for link rot
(and, once the vision gate is on, verified once). A dead URL is re-resolved;
the replacement ships only if the vision gate confirms it and no human had
approved the old image — otherwise it is **demoted to review**. Review
entries wait for a human, except that they get one retry when the vision
gate first becomes available. Rejected entries stay rejected.

Offline test suite (mocked network): `bash test/run-tests.sh`
