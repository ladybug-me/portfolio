#!/usr/bin/env bash
# suite: fast

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$REPO_ROOT/tests/helpers.sh"

test_no_external_font_cdn_links() {
    assert_file_not_contains "$REPO_ROOT/index.html" "fonts.googleapis.com" \
        "index.html must not depend on external fonts.googleapis.com"
    assert_file_not_contains "$REPO_ROOT/index.html" "fonts.gstatic.com" \
        "index.html must not depend on external fonts.gstatic.com"
}

test_local_fonts_imported_in_main() {
    assert_file_contains "$REPO_ROOT/src/main.tsx" "@fontsource/plus-jakarta-sans" \
        "main.tsx must import local Plus Jakarta Sans fontsource styles"
    assert_file_contains "$REPO_ROOT/src/main.tsx" "@fontsource/jetbrains-mono" \
        "main.tsx must import local JetBrains Mono fontsource styles"
    assert_file_contains "$REPO_ROOT/src/main.tsx" "./icons" \
        "main.tsx must import local icon registrations"
}

test_all_iconify_icons_registered_locally() {
    local icons_file="$REPO_ROOT/src/icons.ts"
    assert_file_exists "$icons_file"

    local used_icons icon
    used_icons="$(
        grep -rnE "(icon=|icon:)[[:space:]]*['\"][a-z0-9-]+:[a-z0-9-]+['\"]" "$REPO_ROOT/src" \
            | sed -E "s/.*['\"]([a-z0-9-]+:[a-z0-9-]+)['\"].*/\1/" \
            | sort -u
    )"

    while IFS= read -r icon; do
        [[ -z "$icon" ]] && continue
        assert_file_contains "$icons_file" "\"$icon\"" \
            "Icon '$icon' must be registered locally in src/icons.ts to prevent runtime api.iconify.design requests"
    done <<< "$used_icons"
}

test_circuit_pipeline_canvas_fallback() {
    local file="$REPO_ROOT/src/components/ui/CircuitPipeline.tsx"
    assert_file_contains "$file" "try {" \
        "CircuitPipeline.tsx must guard ctx.getImageData with try/catch"
    assert_file_contains "$file" "snap.particles.length === 0" \
        "CircuitPipeline.tsx must fall back to visible DOM cards when pixel sampling is blocked"
}

test_no_adblocker_cosmetic_keywords() {
    local matches
    matches="$(
        grep -rnE "\b(ad|ads|advert|banner|promo|sponsor|popup)\b" "$REPO_ROOT/src" "$REPO_ROOT/index.html" \
            || true
    )"
    assert_eq "" "$matches" "Avoid adblocker cosmetic-filter keywords in src/ and index.html"
}

run_tests
