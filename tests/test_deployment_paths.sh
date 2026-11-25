#!/usr/bin/env bash
# suite: fast

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$REPO_ROOT/tests/helpers.sh"

test_vite_base_path() {
    assert_file_contains "$REPO_ROOT/vite.config.ts" "base: '/'" \
        "vite.config.ts must configure base '/' for root deployment (Vercel)"
    assert_file_not_contains "$REPO_ROOT/vite.config.ts" "/portfolio/" \
        "vite.config.ts must not hardcode GitHub Pages /portfolio/ base path"
}

test_index_html_relative_favicon() {
    assert_file_contains "$REPO_ROOT/index.html" 'href="./favicon.svg"' \
        "index.html must reference ./favicon.svg relatively"
    assert_file_not_contains "$REPO_ROOT/index.html" 'href="/favicon.svg"' \
        "index.html must not use root-relative /favicon.svg"
}

test_no_root_relative_asset_paths_in_src() {
    local matches
    matches="$(grep -rnE "['\"]/assets/" "$REPO_ROOT/src" || true)"
    assert_eq "" "$matches" "src/ must use import.meta.env.BASE_URL instead of hardcoded /assets/ paths"
}

test_github_pages_deploy_workflow_removed() {
    if [[ -e "$REPO_ROOT/.github/workflows/deploy.yml" ]]; then
        fail "unused GitHub Pages workflow .github/workflows/deploy.yml should be removed"
    fi
}

run_tests
