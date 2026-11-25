#!/usr/bin/env bash
# suite: fast

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$REPO_ROOT/tests/helpers.sh"

test_no_hardcoded_cyan_glows_in_ui_and_sections() {
    local matches
    matches="$(
        grep -rnE "(shadow-\[.*(00f2fe|0,242,254|34,211,238|0,255,163)|#67e8f9|#091520|rgba\(34, 211, 238)" \
            "$REPO_ROOT/src/components/ui" "$REPO_ROOT/src/components/sections" || true
    )"
    assert_eq "" "$matches" "UI and section components must use dynamic palette tokens/variables instead of hardcoded cyan/emerald glows or card fills"
}

test_cards_use_palette_surface_token() {
    assert_file_contains "$REPO_ROOT/src/index.css" "--bg-secondary-rgb:" \
        "index.css must expose --bg-secondary-rgb per palette"
    assert_file_contains "$REPO_ROOT/src/components/ui/CircuitPipeline.tsx" "top-1/2 -translate-y-1/2" \
        "CircuitPipeline.tsx SVG line must anchor vertically at the container center"
}

run_tests
