#!/usr/bin/env bash
# suite: fast

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$REPO_ROOT/tests/helpers.sh"

test_lenis_synced_to_gsap_ticker_and_lag_smoothing_disabled() {
    local app="$REPO_ROOT/src/App.tsx"
    assert_file_contains "$app" "autoRaf: false" \
        "App.tsx must set autoRaf: false on Lenis to avoid a competing rAF loop"
    assert_file_contains "$app" "lenis.on('scroll', ScrollTrigger.update)" \
        "App.tsx must sync Lenis scroll updates to ScrollTrigger"
    assert_file_contains "$app" "gsap.ticker.add(updateTicker)" \
        "App.tsx must drive Lenis from gsap.ticker"
    assert_file_contains "$app" "gsap.ticker.lagSmoothing(0)" \
        "App.tsx must disable GSAP lagSmoothing to prevent high-Hz scroll stutter"
}

test_webgl_canvas_dpr_shader_and_shadow_guards() {
    local hero_canvas="$REPO_ROOT/src/components/canvas/HeroCanvas.tsx"
    local pet_canvas="$REPO_ROOT/src/components/canvas/PetCanvas.tsx"
    local neural_core="$REPO_ROOT/src/components/canvas/NeuralCore.tsx"
    local particles="$REPO_ROOT/src/components/canvas/DistantOrbitParticles.tsx"
    local pet="$REPO_ROOT/src/components/canvas/SphericalPet.tsx"

    assert_file_contains "$hero_canvas" "dpr={[1, 1.5]}" \
        "HeroCanvas.tsx must cap DPR at 1.5 to protect 90+ FPS fill-rate"
    assert_file_contains "$hero_canvas" "antialias: false" \
        "HeroCanvas.tsx must keep MSAA disabled on full-screen shader/particle canvas"
    assert_file_contains "$hero_canvas" "depth: false" \
        "HeroCanvas.tsx must disable unused depth buffer"

    assert_file_contains "$pet_canvas" "dpr={[1, 1.25]}" \
        "PetCanvas.tsx must cap DPR at 1.25"
    assert_file_contains "$pet_canvas" "gl.shadowMap.autoUpdate = false" \
        "PetCanvas.tsx must disable automatic per-frame shadow-map rendering"

    assert_file_not_contains "$neural_core" "icosahedronGeometry args={[2.0, 48]}" \
        "NeuralCore.tsx must not use high-vertex 48-subdivision geometry in vertex noise shader"
    assert_file_contains "$neural_core" "lastPaletteId" \
        "NeuralCore.tsx must cache palette ID instead of parsing colors every frame"
    assert_file_contains "$neural_core" "lightningGeometry.dispose()" \
        "NeuralCore.tsx must dispose lightning GPU geometry on unmount"
    assert_file_contains "$neural_core" "lightningMaterial.dispose()" \
        "NeuralCore.tsx must dispose lightning GPU material on unmount"

    assert_file_contains "$particles" "lastPaletteId" \
        "DistantOrbitParticles.tsx must cache palette ID instead of parsing colors every frame"
    assert_file_contains "$particles" "setDrawRange" \
        "DistantOrbitParticles.tsx must scale draw range on mobile viewports"
    assert_file_contains "$particles" "geometry.dispose()" \
        "DistantOrbitParticles.tsx must dispose GPU geometry on unmount"
    assert_file_contains "$particles" "material.dispose()" \
        "DistantOrbitParticles.tsx must dispose GPU material on unmount"

    assert_file_contains "$pet" "shadowMap.needsUpdate = true" \
        "SphericalPet.tsx must only trigger shadowMap updates when pet or platform state changes"

    local clock_misuse
    clock_misuse="$(grep -rn "getElapsedTime()" "$REPO_ROOT/src/components/canvas" || true)"
    assert_eq "" "$clock_misuse" \
        "Canvas components must use state.clock.elapsedTime instead of getElapsedTime() inside useFrame"
}

test_zero_paint_and_zero_reflow_scroll_animations() {
    local kinetic="$REPO_ROOT/src/components/ui/KineticTextScrub.tsx"
    local faq="$REPO_ROOT/src/components/sections/InteractiveFaq.tsx"
    local css="$REPO_ROOT/src/index.css"

    assert_file_not_contains "$kinetic" "willChange: 'transform, color'" \
        "KineticTextScrub.tsx must not promote per-character color paint layers"
    assert_file_not_contains "$kinetic" "color: activePalette" \
        "KineticTextScrub.tsx must animate opacity/transform rather than main-thread CSS color"

    assert_file_not_contains "$faq" "height: 'auto'" \
        "InteractiveFaq.tsx must not tween height: 'auto' during scroll transitions"

    assert_file_not_contains "$css" "transition: all" \
        "index.css must use explicit transition properties instead of transition: all"
    assert_file_contains "$css" "contain: layout style" \
        "index.css .glass-panel must apply CSS layout/style containment"
}

test_sections_avoid_excessive_backdrop_blur() {
    local heavy_blurs
    heavy_blurs="$(grep -rnE "backdrop-blur-(xl|2xl|3xl)" "$REPO_ROOT/src/components/sections" || true)"
    assert_eq "" "$heavy_blurs" \
        "Sections over live WebGL canvas must use backdrop-blur-sm/md max (never xl/2xl/3xl)"

    assert_file_contains "$REPO_ROOT/src/components/sections/ProjectsSection.tsx" "[contain:layout_style]" \
        "ProjectsSection.tsx cards must isolate layout/style via CSS containment"
    assert_file_contains "$REPO_ROOT/src/components/sections/SkillsMatrix.tsx" "[contain:layout_style]" \
        "SkillsMatrix.tsx cards must isolate layout/style via CSS containment"
    assert_file_contains "$REPO_ROOT/src/components/sections/InteractiveFaq.tsx" "[contain:layout_style]" \
        "InteractiveFaq.tsx cards must isolate layout/style via CSS containment"
    assert_file_contains "$REPO_ROOT/src/components/sections/PipelineSection.tsx" "[contain:layout_style]" \
        "PipelineSection.tsx cards must isolate layout/style via CSS containment"
}

test_on_demand_canvas2d_and_idle_cursor_loop() {
    local pixel_canvas="$REPO_ROOT/src/components/ui/PixelDispersionCanvas.tsx"
    local cursor="$REPO_ROOT/src/components/ui/CustomCursor.tsx"

    assert_file_contains "$pixel_canvas" "scheduleRender" \
        "PixelDispersionCanvas.tsx must render on demand via scheduleRender instead of continuous polling"
    assert_file_contains "$pixel_canvas" "IntersectionObserver" \
        "PixelDispersionCanvas.tsx must gate rendering with IntersectionObserver"
    assert_file_contains "$pixel_canvas" "lastFillStyle" \
        "PixelDispersionCanvas.tsx must deduplicate ctx.fillStyle state updates across particles"

    assert_file_contains "$cursor" "if (!settled)" \
        "CustomCursor.tsx must pause requestAnimationFrame when pointer and motes have settled"
    assert_file_contains "$cursor" "startLoop()" \
        "CustomCursor.tsx must wake its rAF loop on pointer activity"
}

run_tests
