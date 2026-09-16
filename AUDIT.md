# FIRESIDE Blind Rankings — Code & Design Audit

Scope: every file in the repo (`index.html`, `style.css`, `script.js`, `topics.js`,
`config.js`, `sw.js`, `tools/review.html`, `tools/build-images/**`, the workflow,
and the generated manifests). Line references point at the current `main`.

## Verdict

The build-time image pipeline is the strongest part of the project: strict
entity matching, byte validation, focal points, a review loop, an offline test
suite, and idempotent output. It is well-commented and its design decisions are
written down.

The front end has not caught up with that decision. `script.js` still carries
the entire pre-pipeline runtime resolver (roughly 1,060 of 1,662 lines) that is
never called, the page still ships API keys and preconnects to a dozen API
hosts it no longer talks to, and several real bugs sit in the ~600 lines that
do run. The visual design is a competent Material 3 dark theme, but the core
loop has friction a party game cannot afford: no undo, a card that pushes the
primary buttons below the fold on desktop, a busy-state flicker on every tap,
and a mood picker you cannot close without losing progress.

Priorities below are ordered by impact. P0 items are bugs users will hit.

---

## P0 — Bugs in the live app

1. **Reload mid-topic restores inconsistent state.** `App.hydrate()`
   (`script.js:123`) rebuilds the topic list and `_rollItems()` (`script.js:115`)
   re-rolls five random items from `itemPool`, then restores the saved
   `itemIndex` and `ranks`. The remaining items are now a different random set,
   so a user can be asked to rank an item they already placed, or the last
   item never appears. Fix: persist the rolled item labels (or a seed) with the
   state and restore from them instead of re-rolling.

2. **Keyboard 1–5 overwrites a filled rank.** `installKeyboardShortcuts()`
   (`script.js:1584`) never checks whether `App.ranks[n-1]` is taken. Mouse
   users are protected only by `pointer-events: none` on `.placed`
   (`style.css:266`), which does not stop keyboard activation of the button
   either: a placed button is still focusable and Enter fires its click
   handler (`script.js:1547`), overwriting the slot. Fix: guard in one shared
   `placeCurrentItem(rank)` function and set `disabled` (or `aria-disabled`)
   on placed buttons.

3. **Image load has no timeout; the UI can freeze disabled.** `setBusy(true)`
   disables every button, then `loadManifestImage()` (`script.js:1249`) waits
   forever on a stalled CDN request. The old resolver had 12 s timeouts; the
   new loader has none. Fix: race the load against an ~8 s timer and fall
   through to the text card.

4. **Keyboard shortcuts fire behind the mood picker.** Pressing 1–5 while the
   picker is open still places the current item. Guard on picker visibility.

5. **Double network request per image.** The preloading `Image()` sets
   `crossOrigin = 'anonymous'` but `<img id="cardImg">` has no `crossorigin`
   attribute. Chrome treats the CORS/no-CORS pair as different cache keys and
   fetches again. Either add `crossorigin="anonymous"` to the `<img>` or drop
   `crossOrigin` from the preloader (nothing is drawn to a canvas, so it is
   not needed). Same for `prefetchNext()` (`script.js:1311`).

6. **`setBusy()` re-enables the mood "Let's Go" button.**
   `$$('button').forEach(b => b.disabled = false)` (`script.js:174`) clears the
   disabled state on `#moodGoBtn` regardless of selection. Only harmless today
   because the picker is re-initialised on open; it is a trap. Scope busy to
   the stage buttons.

---

## P1 — Architecture and dead code

7. **Delete the runtime resolver.** Lines ~50–1110 of `script.js` (`cfg`,
   `fetchT`, `CATS`, `inferCategory*`, `topicWikiHints`, `buildContext`, the
   seen-set, every provider function, `wikiHintsForCategory`,
   `resolveImageURL`, `applyImageStyle`, `validateRelevance`, `loadImage`) are
   unreachable. `resolveImageURL` is defined at `script.js:881` and called
   nowhere. The only survivors referenced from live code are `resetSeen()`
   (a no-op now) and the `window.BR.resetSeen` export. Removing this drops
   the file to ~600 lines and removes the "mirror any change in script.js"
   note in `tools/build-images/lib/categorize.js`, which is now misleading.

8. **Stop shipping API keys to the browser.** With the resolver gone, nothing
   in the page uses `window.BR_CONFIG`. `config.js` currently publishes TMDB,
   OMDb, Last.fm, TheAudioDB, Fanart.tv and Pixabay keys to every visitor. Move
   the keys the build needs into repository secrets (the workflow already
   reads `PEXELS_KEY`/`UNSPLASH_KEY` that way), delete `config.js` from
   `index.html`, and drop the three keys nothing uses at all (OMDb, Last.fm,
   TheAudioDB). Rotate the published keys after the move.

9. **Trim `index.html` preconnects and the service-worker allow-list.** The
   page preconnects to eleven hosts (`index.html:15–25`); at runtime images
   come from four (`image.tmdb.org`, `upload.wikimedia.org`,
   `commons.wikimedia.org`, `assets.fanart.tv`) plus iTunes podcast art.
   Idle preconnects cost sockets on mobile. `sw.js` `ALLOW` likewise lists
   TVMaze, mzstatic, Last.fm, TheAudioDB, Pixabay, Unsplash, Pexels and Flickr
   hosts that no manifest entry points at. Generate both lists from the
   manifest's actual hostnames.

10. **One placement path.** `bindPlaceButtons()` and
    `installKeyboardShortcuts()` duplicate the place → persist → render →
    advance-or-complete sequence. Extract `placeCurrentItem(rank)`; the P0
    guard then lives in one place.

11. **Build DOM, don't concatenate HTML.** `renderRankSlots()`
    (`script.js:205`) injects `imgUrl` and `label` via `innerHTML`, and
    `imgUrl` is read back from `localStorage`. Data is trusted today; the
    pattern is not. Use `createElement`/`textContent`.

12. **Remove leftovers.** `clamp` (unused), `App.isComplete()` (unused),
    `MOOD_STORAGE.clear()` (unused), the `#live` region (`index.html:115`,
    never written to), `t?.title` fallback in `renderTopicTitle()`, the
    `.confetti.active` class (canvas is toggled with inline `display`), and the
    `window.BR` debug exports if nobody uses them.

---

## P1 — UX and interaction design

13. **Undo / reassign.** One mis-tap is permanent. Add "Undo last" (keeps the
    game fast) and let a filled slot be tapped to swap the current item in,
    bumping the old occupant back into the queue.

14. **Card size on desktop.** `.card { aspect-ratio: 3/4 }` inside a 1.3fr
    column means a ~700 px wide card is ~930 px tall; the place buttons, the
    only actions, land below the fold on a 1080p display. Cap it
    (`max-height: min(62vh, 640px)` and centre the card) or move the buttons
    beside the card on wide screens.

15. **Busy flicker.** Every placement dims all buttons to 38 % opacity for
    the duration of the image load, which is usually one frame because the
    next image is prefetched. Show the spinner only if the load exceeds
    ~150 ms, and never dim buttons for a state that lasts one frame.

16. **Mood picker is a trap.** Opening "Moods" mid-game offers only "Random
    Mix" and "Let's Go", both of which reset progress. Add a Close/Cancel
    (Escape, backdrop click) that returns to the game, and confirm before
    discarding a topic in progress. It should also be a real dialog:
    `role="dialog"`, `aria-modal`, focus trapped and returned.

17. **Mixed image/text cards inside one topic.** 140 of 249 topics contain
    both imaged and text-only items, so a five-card round can flip between a
    poster and a typographic card. Prefer imaged items when rolling from
    `itemPool` (weight them first, fall back to text only when the pool is
    short), and make the text card feel intentional: a gradient or pattern
    keyed to the mood rather than flat surface colour.

18. **Auto-place the last item.** When four slots are filled the fifth is
    forced. Fill it after a short beat instead of asking for a tap, then go
    straight to the completion state.

19. **Rank ordering language.** Progress reads "1 / 5" while buttons read
    "#1…#5". Consider "Item 2 of 5" for progress so the two numbers cannot be
    confused, and label #1 as "Best" in the slot header.

20. **Completion state.** Re-fires confetti on every reload of a completed
    topic (`script.js:1617`). Also the completion badge covers the last card,
    which is the one the user most wants to see; consider a slimmer banner.

21. **"New Topic" mid-round** silently discards progress. Rename to "Skip
    topic" while a round is in progress and "Next topic" once complete.

22. **Share.** Text share is fine; the domain `firesiderankings.com`
    (`script.js:1388`) should be verified as owned. The highest-value next
    step is a rendered share card (canvas → PNG via Web Share `files`), which
    is what a game like this spreads on.

23. **Display labels.** Labels are Wikipedia titles, so users see
    "Old fashioned", "India pale ale", "Pinot noir", "Omega", "Vim" after
    `cleanLabel()` strips the disambiguator. 193 labels are lowercase-ish.
    Add an optional `display` field per item (and keep `label` as the
    canonical lookup key), or title-case at render time with an exception list.

---

## P1 — Accessibility

24. **Heading structure.** There is no `<h1>`; the brand is a `<span>`. Item
    title is `<h2>`, rankings `<h3>`. Make the brand the `<h1>` (visually
    styled as now) and demote the rest one level or use `aria-labelledby`.

25. **`aria-label` on a plain `<div>`** (`index.html:75`) is ignored. Add
    `role="group"`.

26. **Live regions.** `#topicTag`, `#itemTitle` and `#cardText` are all
    `aria-live="polite"`, so a placement announces three times. Use the single
    `#live` region with one composed sentence ("Placed Spirited Away at #2.
    Next: Amélie, 3 of 5").

27. **Tap targets.** "Moods" (`.btn--mood-change`, ~28 px tall) and "Share"
    (~33 px) are under the 44 px minimum. Keep the visual size if you like but
    pad the hit area.

28. **Focus.** After a placement the focus stays on a button that becomes
    inert. Move focus to the next actionable control or to the card.
    `.mood-chip` has no `:focus-visible` style matching `.btn`.

29. **Reduced motion** is respected for ripple, spinner and confetti; the
    `badgePop` keyframe and toast/overlay transitions are not covered. Add
    them to the `prefers-reduced-motion` block.

---

## P2 — Performance and delivery

30. **Prefetch the whole round.** All five items are known when a topic
    starts; prefetch all of them, not just the next one. Combined with the
    busy-state fix this removes spinners entirely.

31. **`images.js` is 316 KB** loaded on every visit for ~25 items per
    session. It gzips to ~60 KB so it is not urgent, but splitting the
    manifest per topic (or fetching it as JSON with a long cache header and
    keeping it in the service worker) is the next step if the catalogue keeps
    growing.

32. **Service worker only caches images.** The app shell (`index.html`,
    `style.css`, `script.js`, `topics.js`, `images.js`) is not cached, so the
    SW gives no offline start. Either precache the shell with a versioned
    cache name or drop the SW; half a PWA is the worst of both. If it stays,
    add a `manifest.webmanifest`, icons and a favicon (the page currently 404s
    on `/favicon.ico`).

33. **Cache trimming is O(n) per put** (`sw.js:44`). Trim on `activate` or
    every Nth put.

34. **Fonts.** Inter is requested at 400–800 but `.card-text` uses
    `font-weight: 900` (`style.css:185`), which is synthesised. Request 900 or
    use 800. Consider `font-display: optional` for a game where FOUT on the
    hero text is worse than a system fallback.

35. **Meta.** No `description`, Open Graph or Twitter card tags, so shared
    links have no preview. Add them with a static OG image.

---

## P2 — CSS

36. **Unused tokens.** `--elev-1`, `--elev-3`, `--surface-top`, `--on-primary`
    are never referenced. Hard-coded values that should be tokens:
    `#1a1a1a` in `.btn--tonal.placed`, `rgba(18,18,18,.6/.7)` overlays,
    `rgba(168,219,139,…)` glows (that is `--tertiary` with alpha; use
    `color-mix()` or an `--tertiary-rgb` token).

37. **`html, body { height: 100% }`** does nothing here and can fight
    `100vh` on mobile; remove it.

38. **`.chip { height: 32px }`** clips long topic names on narrow screens
    when they wrap. Use `min-height` and allow wrapping, or `text-overflow:
    ellipsis` with a title attribute.

39. **`.item-title { min-height: 1.15em }`** reserves a ~38 px blank strip
    above the card in text mode where the title is empty. Collapse it when
    empty (`:empty { display: none }`).

40. **`transition: all`** on `.mood-chip` (`style.css:449`); list the
    properties.

41. **`backdrop-filter`** lacks the `-webkit-` prefix needed on iOS < 18.

42. **Mobile place buttons** collapse to a 3+2 grid under 540 px. Five equal
    columns with smaller padding, or a sticky bottom action bar, reads far
    better than an unbalanced grid.

43. **Ripple** overflows `.mood-chip` (no `overflow: hidden`) and writes an
    inline `position: relative` on every button. Give chips the same base
    styles as `.btn` or restrict the ripple to `.btn`.

---

## P2 — Data (`topics.js`)

44. **Stale header comment.** The file still says "Movies/TV use TMDB…
    Others use Wikipedia PageImages" and advertises `imageUrl` overrides; the
    runtime does neither.

45. **Redundant `items` when `itemPool` exists.** For 137 topics `items` is
    replaced by a roll from the pool on every visit, so the five-item `items`
    array is dead weight (and "Cheeses" has `items` that are not in its pool).
    Make the shape `{ name, mood, items: [...] }` where `items` is the full
    pool and the app rolls five; keep a `fixed: true` flag for topics that
    must not roll.

46. **112 topics have no pool**, so they never vary on replay. Either pad
    them to 10+ or accept and document it; today the two shapes are
    indistinguishable to the player.

47. **`MORE_TOPICS`** concatenation at `topics.js:768` is an accident of
    history; merge into one array.

48. **Add a validation script** (unique labels per topic, ≥ 5 items, valid
    `mood`, no duplicate topic names, `provider`/`mediaType` in the allowed
    set) and run it in CI. It would have caught the "Cheeses" mismatch.

49. **`provider` / `mediaType`** are now build-time hints only. Rename to
    `kind` (or move to a per-topic `category`) so the data does not imply a
    runtime provider that no longer exists.

---

## P2 — Build pipeline (`tools/build-images`)

50. **Approving a review entry re-resolves it first.** In `processUnit()`,
    an `approve` override on a `review` entry falls through to `buildEntry()`
    (`build.js:187–194`) and then approves whatever came back, which may
    differ from the image the human saw. Simplest fix in `tools/review.html`
    (`:175`): emit `{ url: e.url }` on Approve so the approved URL is pinned.
    In `build.js`, an `approve` override should approve `existing.url` and
    only revalidate it.

51. **Link-rot check downloads every image every run.** `revalidateUrl()`
    fetches full bytes and decodes them for all 2,118 shipped entries on any
    push that touches `topics.js`. Use a HEAD request (or a conditional GET
    with the stored `contentHash`/ETag) and only download on a change.

52. **Run the tests in CI.** `test/run-tests.sh` exists but the workflow
    never runs it. Add `"test": "bash test/run-tests.sh"` to `package.json`
    and a step before the build.

53. **Workflow scope.** It triggers on pushes to any branch and commits
    generated files back to that branch with a 3-hour budget. Restrict the
    commit-back to `main`; on other branches run tests plus a
    `--revalidate-only` dry run.

54. **Focal-point code drift.** `focal.js:77` `wantFaces || FACE_CATS.has()`
    is always `FACE_CATS.has()`. The comment "Multiple faces: centre of their
    union box" describes the band branch; solo artists use the largest face.
    `faces: -1` (detector error) surfaces as `no-face-detected`, which sends
    reviewers hunting for a missing face that was never looked for.

55. **README drift.** `tools/build-images/README.md` says people resolve to
    the Wikidata P18 portrait; the code prefers the article lead image and
    falls back to P18. Keep one source of truth.

56. **Dependencies.** `sharp ^0.32.6` is two majors behind and pulls an
    older libvips; `@tensorflow/tfjs` brings the WebGL backend the WASM path
    never uses. Bump sharp; consider `tfjs-core` + `tfjs-converter` +
    `tfjs-backend-wasm` if face-api's node-wasm bundle allows it.

57. **Review page ergonomics.** 425 items await review. Add keyboard flow
    (A approve, R reject, J/K next/prev, digits to pick a candidate) and a
    "download overrides" button; copying JSON into a file by hand does not
    scale.

58. **Band heuristic** (`isBandArtist`): `\bthe\s` and `\bday\b|\bpink\b`
    classify "The Weeknd", "Doris Day" and "Pink" as bands, so they get
    saliency crops instead of face crops. Use MusicBrainz `type`
    ("Person"/"Group"), which the pipeline already queries.

---

## P3 — Repo hygiene

59. **No root README.** Add one: what the game is, a screenshot, how images
    are vetted, how to add topics, how to run the review loop, where it is
    deployed.
60. **No front-end tooling.** A root `package.json` with ESLint (or Biome),
    Prettier, and a single Playwright smoke test (load, pick mood, place five,
    see completion) would catch most of the P0s above automatically.
61. **`.gitignore`** should also cover `.DS_Store`, editor folders and the
    review page's exported JSON if that is ever written to disk.
62. **Commit noise.** `images.manifest.json` (2.1 MB) is rewritten by CI;
    consider `linguist-generated` in `.gitattributes` so diffs collapse on
    GitHub.

---

## Suggested order of work

1. P0 1–6 plus item 10 (one placement path) in a single PR; add the Playwright
   smoke test alongside so the fixes stay fixed.
2. Delete the dead resolver, `config.js`, and prune preconnects/SW hosts
   (items 7–9, 12). This is pure removal and makes every later change easier
   to review.
3. Interaction pass: undo, card sizing, busy flicker, mood-picker close,
   auto-place last, imaged-first rolling (items 13–18).
4. Accessibility pass (24–29) and CSS cleanup (36–43).
5. Build pipeline: pin approved URLs, HEAD revalidation, tests in CI, workflow
   scope (50–53).
6. Data model tidy and validation script (44–49), then the root README.
