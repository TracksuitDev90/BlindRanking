#!/usr/bin/env bash
# Offline end-to-end test of the build pipeline (mocked fetch, fixture topics).
# Run from tools/build-images:  bash test/run-tests.sh
set -euo pipefail
cd "$(dirname "$0")/.."

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
cp test/fixtures/topics.js test/fixtures/config.js "$WORK/"
echo '{}' > "$WORK/images.overrides.json"

# Rules-only runs: no API key, so the vision gate is off.
run_build() {
  env -u ANTHROPIC_API_KEY -u ANTHROPIC_BASE_URL -u ANTHROPIC_AUTH_TOKEN \
    BR_ROOT="$WORK" node --import ./test/mock-fetch.mjs build.js "$@"
}
# Vision-gate runs: the mocked api.anthropic.com answers (see mock-fetch.mjs).
run_build_vision() { # run_build_vision <api key> [args…]
  local key="$1"; shift
  env -u ANTHROPIC_BASE_URL -u ANTHROPIC_AUTH_TOKEN ANTHROPIC_API_KEY="$key" \
    BR_ROOT="$WORK" node --import ./test/mock-fetch.mjs build.js "$@"
}

check() { # check <description> <node -e expression that must print true>
  local desc="$1" expr="$2"
  local got
  got=$(node -e "
    const m = require('$WORK/images.manifest.json').items;
    const fs = require('fs');
    const imagesJs = fs.readFileSync('$WORK/images.js','utf8');
    const shipped = (() => { const window={}; eval(imagesJs.replace('window.BR_IMAGES','window.BR_IMAGES')); return window.BR_IMAGES; })();
    console.log(!!($expr));
  ")
  if [[ "$got" == "true" ]]; then echo "PASS: $desc"; else echo "FAIL: $desc"; exit 1; fi
}

echo "=== Run 0: an exhausted time budget still writes outputs and exits cleanly ==="
WORK0="$(mktemp -d)"
cp test/fixtures/topics.js test/fixtures/config.js "$WORK0/"
echo '{}' > "$WORK0/images.overrides.json"
if env -u ANTHROPIC_API_KEY -u ANTHROPIC_BASE_URL BR_ROOT="$WORK0" BUILD_TIME_BUDGET_MIN=0.00001 \
     node --import ./test/mock-fetch.mjs build.js > "$WORK0/run0.log" 2>&1 \
   && grep -q "units deferred to the next run" "$WORK0/run0.log" && [[ -f "$WORK0/images.js" ]]; then
  echo "PASS: budgeted run deferred work, wrote outputs, exited 0"
else
  echo "FAIL: budgeted run"; tail -20 "$WORK0/run0.log"; rm -rf "$WORK0"; exit 1
fi
rm -rf "$WORK0"

echo "=== Run 1: fresh build ==="
run_build

check "movie auto-accepted from exact TMDB match" \
  "m['test-movie-2020-film'].confidence==='auto' && m['test-movie-2020-film'].source==='tmdb' && m['test-movie-2020-film'].fit==='contain'"
check "QB entity pinned but flagged (no face in test image)" \
  "m['test-qb'].confidence==='review' && m['test-qb'].reviewReason==='no-face-detected' && m['test-qb'].url"
check "context mismatch caught (cricketer in an NFL topic)" \
  "m['wrong-guy'].confidence==='review' && m['wrong-guy'].reviewReason.startsWith('context-mismatch')"
check "food auto-accepted with cover fit and saliency focal" \
  "m['test-burger'].confidence==='auto' && m['test-burger'].fit==='cover' && Number.isFinite(m['test-burger'].focusX)"
check "missing wikipedia page goes to review" \
  "m['missing-thing'].confidence==='review' && m['missing-thing'].reviewReason==='no-wikipedia-page'"
check "brand logo via Wikidata P154, contain+pad" \
  "m['test-brand'].confidence==='auto' && m['test-brand'].source==='wikidata-p154' && m['test-brand'].pad===true"
check "current logo chosen over a historical one listed first" \
  "m['test-brand'].url.includes('Test_Brand_logo.svg') && !m['test-brand'].url.includes('1990')"
check "place flag lead image skipped for the P18 photo" \
  "m['test-island'].confidence==='auto' && m['test-island'].source==='wikidata-p18' && !m['test-island'].url.includes('Flag')"
check "chains topic resolves as brand logo, contain+pad" \
  "m['test-chain'].confidence==='auto' && m['test-chain'].category==='brand' && m['test-chain'].source==='wikidata-p154' && m['test-chain'].pad===true"
check "redirect into an article section is never trusted" \
  "m['sour-thing'].confidence==='review' && m['sour-thing'].reviewReason.startsWith('redirect-to-section')"
check "redirect to a differently named subject needs review" \
  "m['fizzy-pop'].confidence==='review' && m['fizzy-pop'].reviewReason.startsWith('redirect-mismatch')"
check "car model in a cars topic shows the car photo, not the maker's logo" \
  "m['tesla-model-z'].category==='device' && m['tesla-model-z'].confidence==='auto' && m['tesla-model-z'].source==='wikipedia'"
check "film resolved by its Wikidata TMDB ID, not the same-title search hit" \
  "m['twin-title-2001-film'].confidence==='auto' && m['twin-title-2001-film'].url.endsWith('/right-twin.jpg') && m['twin-title-2001-film'].sourceId==='tmdb-movie:777:wikidata'"
check "person topic item that is not a human goes to review" \
  "m['test-channel'].confidence==='review' && m['test-channel'].reviewReason.startsWith('not-a-person')"
check "team label that pins to a city goes to review" \
  "m['test-city'].confidence==='review' && m['test-city'].reviewReason.startsWith('context-mismatch')"
check "cosplay lead image never shipped; a game's Wikidata photo needs a second opinion" \
  "m['test-game'].confidence==='review' && m['test-game'].reviewReason==='wikidata-image-unvetted-for-game' && !m['test-game'].url.includes('cosplay')"
check "a board game's Wikidata photo (the game itself) ships" \
  "m['test-board-game'].category==='game' && m['test-board-game'].confidence==='auto' && m['test-board-game'].source==='wikidata-p18'"
check "club whose only picture is a stadium photo stays text" \
  "m['test-fc'].category==='team' && m['test-fc'].confidence==='review' && m['test-fc'].reviewReason==='wikidata-image-unvetted-for-team'"
check "'S30' in a cars topic is a car, not a TV season" \
  "m['testla-s30'].category==='device' && m['testla-s30'].confidence==='auto'"
check "product built by a 'Corporation' is not mistaken for a company" \
  "m['plymouth-test'].confidence==='auto'"
check "team season shows the team's logo" \
  "m['2000-test-team-season'].confidence==='auto' && m['2000-test-team-season'].source==='wikidata-p154' && m['2000-test-team-season'].sourceId.endsWith(':season-of')"
check "entries record the rules version and gate" \
  "m['test-brand'].rules===4 && m['test-brand'].gate==='rules'"
check "images.js ships only vetted entries" \
  "Object.keys(shipped).length===12 && shipped['test-movie-2020-film'] && shipped['testla-s30'] && shipped['test-board-game'] && !shipped['test-game'] && !shipped['test-fc'] && shipped['test-burger'] && shipped['test-brand'] && shipped['test-island'] && shipped['test-chain'] && shipped['tesla-model-z'] && !shipped['test-qb'] && !shipped['sour-thing'] && !shipped['fizzy-pop']"

echo "=== Run 2: idempotence ==="
cp "$WORK/images.manifest.json" "$WORK/manifest.run1.json"
cp "$WORK/images.js" "$WORK/images.run1.js"
run_build > /dev/null
if cmp -s "$WORK/images.manifest.json" "$WORK/manifest.run1.json" && cmp -s "$WORK/images.js" "$WORK/images.run1.js"; then
  echo "PASS: second run produced zero diff"
else
  echo "FAIL: second run changed generated files"; diff "$WORK/manifest.run1.json" "$WORK/images.manifest.json" | head; exit 1
fi

echo "=== Run 3: overrides (approve / reject / replace URL) ==="
cat > "$WORK/images.overrides.json" <<'EOF'
{
  "test-qb": { "approve": true },
  "missing-thing": { "reject": true },
  "wrong-guy": { "url": "https://example.com/correct-guy.jpg" }
}
EOF
run_build > /dev/null
check "approve override ships the reviewed pick" \
  "m['test-qb'].confidence==='approved' && shipped['test-qb']"
check "reject override keeps item text-only" \
  "m['missing-thing'].confidence==='rejected' && !shipped['missing-thing']"
check "url override is validated, focal-pointed and approved" \
  "m['wrong-guy'].confidence==='approved' && m['wrong-guy'].source==='override' && shipped['wrong-guy'].u==='https://example.com/correct-guy.jpg'"

echo "=== Run 4: link rot demotes to review, never silently swaps ==="
node -e "
  const fs=require('fs');
  const doc=JSON.parse(fs.readFileSync('$WORK/images.manifest.json','utf8'));
  doc.items['test-burger'].url='https://upload.wikimedia.org/dead-burger.jpg';
  fs.writeFileSync('$WORK/images.manifest.json', JSON.stringify(doc,null,2)+'\n');
"
run_build > /dev/null
check "dead URL demoted to review with fresh pick attached" \
  "m['test-burger'].confidence==='review' && m['test-burger'].reviewReason==='dead-url' && !shipped['test-burger']"

echo "=== Run 5: vision gate with a bad API key never demotes anything ==="
cp "$WORK/images.js" "$WORK/images.run4.js"
run_build_vision bad-key > "$WORK/run5.log" 2>&1
if cmp -s "$WORK/images.js" "$WORK/images.run4.js" && grep -q "vision verification disabled" "$WORK/run5.log"; then
  echo "PASS: auth failure disabled the gate and shipped set is unchanged"
else
  echo "FAIL: bad key changed images.js or did not disable the gate"; diff "$WORK/images.run4.js" "$WORK/images.js" | head; tail -20 "$WORK/run5.log"; exit 1
fi

echo "=== Run 6: vision gate on ==="
run_build_vision test-key > "$WORK/run6.log" 2>&1 || { tail -40 "$WORK/run6.log"; exit 1; }
check "existing images get verified and keep shipping" \
  "m['test-brand'].confidence==='auto' && m['test-brand'].verify.verdict==='match' && shipped['test-brand']"
check "rejected pick swapped for a search result the gate confirms" \
  "m['test-soda'].confidence==='auto' && m['test-soda'].url.includes('/green/') && m['test-soda'].verify.verdict==='match' && shipped['test-soda'].u.includes('/green/')"
check "pick the gate rejects with no confirmed alternate stops shipping" \
  "m['test-island'].confidence==='review' && m['test-island'].reviewReason.startsWith('vision-mismatch') && !shipped['test-island']"
check "inexact (redirect) pick ships once the gate confirms it" \
  "m['fizzy-pop'].confidence==='auto' && m['fizzy-pop'].verify.verdict==='match'"
check "redirect-to-section item whose pictures fail the gate stays text" \
  "m['sour-thing'].confidence==='review' && !shipped['sour-thing']"
check "non-human person item is never rescued by a picture search" \
  "m['test-channel'].confidence==='review' && !shipped['test-channel']"
check "human decisions are untouched by the gate" \
  "m['test-qb'].confidence==='approved' && !m['test-qb'].verify && m['wrong-guy'].source==='override' && m['missing-thing'].confidence==='rejected'"
check "a game's Wikidata photo ships once the gate confirms it" \
  "m['test-game'].confidence==='auto' && m['test-game'].verify.verdict==='match'"
check "every machine-shipped image carries a match verdict" \
  "Object.values(m).filter(e => e.confidence==='auto').every(e => e.verify && e.verify.verdict==='match' && e.verify.confidence>=0.8)"

echo "=== Run 7: vision-gate idempotence ==="
cp "$WORK/images.manifest.json" "$WORK/manifest.run6.json"
run_build_vision test-key > "$WORK/run7.log" 2>&1
if cmp -s "$WORK/images.manifest.json" "$WORK/manifest.run6.json" && grep -q "vision gate: 0 checks this run" "$WORK/run7.log"; then
  echo "PASS: verdicts are cached — second run made no calls and no changes"
else
  echo "FAIL: second vision run changed files or re-verified"; grep "vision gate" "$WORK/run7.log"; diff "$WORK/manifest.run6.json" "$WORK/images.manifest.json" | head -30; exit 1
fi

echo
echo "All tests passed."
