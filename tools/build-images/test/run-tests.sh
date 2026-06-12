#!/usr/bin/env bash
# Offline end-to-end test of the build pipeline (mocked fetch, fixture topics).
# Run from tools/build-images:  bash test/run-tests.sh
set -euo pipefail
cd "$(dirname "$0")/.."

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
cp test/fixtures/topics.js test/fixtures/config.js "$WORK/"
echo '{}' > "$WORK/images.overrides.json"

run_build() {
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
check "place flag lead image skipped for the P18 photo" \
  "m['test-island'].confidence==='auto' && m['test-island'].source==='wikidata-p18' && !m['test-island'].url.includes('Flag')"
check "chains topic resolves as brand logo, contain+pad" \
  "m['test-chain'].confidence==='auto' && m['test-chain'].category==='brand' && m['test-chain'].source==='wikidata-p154' && m['test-chain'].pad===true"
check "images.js ships only vetted entries" \
  "Object.keys(shipped).length===5 && shipped['test-movie-2020-film'] && shipped['test-burger'] && shipped['test-brand'] && shipped['test-island'] && shipped['test-chain'] && !shipped['test-qb']"

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

echo
echo "All tests passed."
