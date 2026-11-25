#!/usr/bin/env bash
# suite: fast

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$REPO_ROOT/tests/helpers.sh"

test_vite_base_path() {
    assert_file_contains "$REPO_ROOT/vite.config.ts" "base: '/portfolio/'" \
        "vite.config.ts must configure base '/portfolio/' for GitHub Pages"
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

test_deploy_workflow_present() {
    local wf="$REPO_ROOT/.github/workflows/deploy.yml"
    assert_file_exists "$wf"
    assert_file_contains "$wf" "npm run build" "deploy workflow must run npm run build"
    assert_file_contains "$wf" "actions/deploy-pages" "deploy workflow must use actions/deploy-pages"
}

run_tests
