#!/usr/bin/env bash
if [[ -z "${PORTFOLIO_TEST_HELPERS_SOURCED:-}" ]]; then
PORTFOLIO_TEST_HELPERS_SOURCED=1

PORTFOLIO_TEST_FAILURES=0
PORTFOLIO_TEST_COUNT=0

fail() {
    PORTFOLIO_TEST_FAILURES=$((PORTFOLIO_TEST_FAILURES + 1))
    printf '    FAIL: %s\n' "$*" >&2
}

assert_eq() {
    local expected="$1" actual="$2" message="${3:-values differ}"
    if [[ "$expected" != "$actual" ]]; then
        fail "$message (expected: $(printf '%q' "$expected"), actual: $(printf '%q' "$actual"))"
    fi
}

assert_file_exists() {
    local path="$1"
    [[ -e "$path" ]] || fail "expected to exist: $path"
}

assert_file_contains() {
    local path="$1" needle="$2" message="${3:-substring not found}"
    if [[ ! -f "$path" ]]; then
        fail "$message (no such file: $path)"
        return 0
    fi
    if ! grep -qF -- "$needle" "$path"; then
        fail "$message ($(basename "$path") does not contain $(printf '%q' "$needle"))"
    fi
}

assert_file_not_contains() {
    local path="$1" needle="$2" message="${3:-unexpected substring found}"
    if [[ ! -f "$path" ]]; then
        fail "$message (no such file: $path)"
        return 0
    fi
    if grep -qF -- "$needle" "$path"; then
        fail "$message ($(basename "$path") still contains $(printf '%q' "$needle"))"
    fi
}

assert_file_matches() {
    local path="$1" pattern="$2" message="${3:-no line matches}"
    if [[ ! -f "$path" ]]; then
        fail "$message (no such file: $path)"
        return 0
    fi
    if ! grep -qE -- "$pattern" "$path"; then
        fail "$message ($(basename "$path") has no line matching $(printf '%q' "$pattern"))"
    fi
}

run_tests() {
    local fn
    while IFS= read -r fn; do
        PORTFOLIO_TEST_COUNT=$((PORTFOLIO_TEST_COUNT + 1))
        printf '  %s\n' "$fn"
        "$fn"
    done < <(declare -F | awk '{ print $3 }' | grep '^test_' | sort)

    if [[ "$PORTFOLIO_TEST_FAILURES" -gt 0 ]]; then
        printf '  %s assertion(s) failed across %s test(s)\n' \
            "$PORTFOLIO_TEST_FAILURES" "$PORTFOLIO_TEST_COUNT" >&2
        return 1
    fi
    printf '  %s test(s) passed\n' "$PORTFOLIO_TEST_COUNT"
    return 0
}

fi
