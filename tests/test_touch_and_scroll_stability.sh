#!/usr/bin/env bash
# suite: fast

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$REPO_ROOT/tests/helpers.sh"

test_mobile_resize_scrolltrigger_guard() {
    assert_file_contains "$REPO_ROOT/src/App.tsx" "ignoreMobileResize: true" \
        "App.tsx must enable ScrollTrigger ignoreMobileResize for mobile URL-bar transitions"
    assert_file_contains "$REPO_ROOT/src/components/canvas/HeroCanvas.tsx" "h-[100lvh]" \
        "HeroCanvas.tsx must use h-[100lvh] to prevent WebGL buffer reallocations on mobile scroll"
    assert_file_contains "$REPO_ROOT/src/components/canvas/PetCanvas.tsx" "h-[100lvh]" \
        "PetCanvas.tsx must use h-[100lvh] to prevent WebGL buffer reallocations on mobile scroll"
}

test_pinned_overflow_cached_and_no_card_overscroll_trap() {
    assert_file_contains "$REPO_ROOT/src/utils/scrollPan.ts" "overflowCache" \
        "scrollPan.ts must cache pinned overflow measurements across scroll frames"
    assert_file_contains "$REPO_ROOT/src/utils/scrollPan.ts" "hasDownDistance" \
        "scrollPan.ts must keep page scroll blocked until card scrollTop animation reaches its boundary"
    assert_file_not_contains "$REPO_ROOT/src/components/sections/ProjectsSection.tsx" "data-lenis-prevent" \
        "ProjectsSection.tsx cards must not use data-lenis-prevent (blocks page wheel scroll)"
    assert_file_not_contains "$REPO_ROOT/src/components/sections/ProjectsSection.tsx" "overscroll-contain" \
        "ProjectsSection.tsx cards must allow native touch scroll chaining"
    assert_file_not_contains "$REPO_ROOT/src/components/sections/SkillsMatrix.tsx" "data-lenis-prevent" \
        "SkillsMatrix.tsx cards must not use data-lenis-prevent (blocks page wheel scroll)"
    assert_file_not_contains "$REPO_ROOT/src/components/sections/SkillsMatrix.tsx" "overscroll-contain" \
        "SkillsMatrix.tsx cards must allow native touch scroll chaining"
}

test_no_backdrop_blur_opacity_or_filter_flicker() {
    assert_file_not_contains "$REPO_ROOT/src/components/sections/HeroSection.tsx" "filter: 'blur" \
        "HeroSection.tsx must not animate CSS filter blur during scroll"
    assert_file_not_contains "$REPO_ROOT/src/components/ui/KineticTextScrub.tsx" "textShadow:" \
        "KineticTextScrub.tsx must not animate textShadow across individual characters during scroll"
    assert_file_not_contains "$REPO_ROOT/src/components/sections/ProjectsSection.tsx" "opacity: 0.55" \
        "ProjectsSection.tsx must not scrub fractional opacity on backdrop-blur cards"
    assert_file_not_contains "$REPO_ROOT/src/components/sections/InteractiveFaq.tsx" "opacity: 0.22" \
        "InteractiveFaq.tsx must keep backdrop-blur cards at full opacity"
    assert_file_contains "$REPO_ROOT/src/components/sections/SkillsMatrix.tsx" "tl.set(card, { visibility: 'visible' }" \
        "SkillsMatrix.tsx must use tl.set for visibility instead of discrete fromTo interpolation"
}

test_circuit_pipeline_last_card_text_buffer() {
    assert_file_contains "$REPO_ROOT/src/components/ui/CircuitPipeline.tsx" "assembleEnd" \
        "CircuitPipeline.tsx must reserve scroll progress after card assembly so last card text finishes before unpinning"
    assert_file_contains "$REPO_ROOT/src/components/ui/CircuitPipeline.tsx" "minTextProgress" \
        "CircuitPipeline.tsx must advance the last card text timeline before unpinning"
}

test_touch_interactions_and_mobile_navigator() {
    assert_file_contains "$REPO_ROOT/src/index.css" "-webkit-tap-highlight-color: transparent" \
        "index.css must suppress default mobile tap highlight flashes"
    assert_file_contains "$REPO_ROOT/src/index.css" "@media (hover: hover)" \
        "index.css must scope hover-only card transforms under @media (hover: hover)"
    assert_file_contains "$REPO_ROOT/src/components/ui/CustomCursor.tsx" "e.pointerType === 'touch'" \
        "CustomCursor.tsx must hide on touch input for hybrid devices"
    assert_file_contains "$REPO_ROOT/src/components/ui/PaletteSwitcher.tsx" "pointerdown" \
        "PaletteSwitcher.tsx must use pointerdown for outside-tap dismissal"
    assert_file_contains "$REPO_ROOT/src/components/canvas/SphericalPet.tsx" "e.pointerType === 'touch'" \
        "SphericalPet.tsx must ignore touch scroll swipes"
    assert_file_contains "$REPO_ROOT/src/components/sections/HeroSection.tsx" "aria-expanded={isEducationOpen}" \
        "HeroSection.tsx must allow tapping to toggle education details"
    assert_file_contains "$REPO_ROOT/src/components/ui/SectionNavigator.tsx" "md:hidden" \
        "SectionNavigator.tsx must provide the mobile first-letter scrub rail"
    assert_file_contains "$REPO_ROOT/src/components/ui/ProjectGalleryModal.tsx" "onTouchStart={handleMagnifiedTouchStart}" \
        "ProjectGalleryModal.tsx must support touch swipe navigation"
}

run_tests
