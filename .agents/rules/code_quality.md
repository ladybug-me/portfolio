---
trigger: always_on
---

# Code Quality & Reusability Standards

Strictly enforce DRY (Don't Repeat Yourself), dead-code hygiene, architectural reuse, and clean composition across the entire codebase.

## 1. Mandatory Discovery Before Creation

Before writing any new component, hook, shader, asset, or test:

- **Scan first**: Search the codebase for existing implementations, abstractions, or patterns that solve the problem.
  - **UI & Sections**: Check `src/components/ui/` (`MaskedText`, `KineticTextScrub`, `CircuitPipeline`, `SectionNavigator`, `ProjectGalleryModal`) and `src/components/sections/` before creating new visual primitives.
  - **3D & Shaders**: Inspect `src/components/canvas/` (`HeroCanvas`, `PetCanvas`, `NeuralCore`, `SphericalPet`, `DistantOrbitParticles`) before adding new WebGL canvases or shader uniforms.
  - **Static Assets**: Check `public/assets/` and `src/icons.ts` before adding duplicate icons, images, or media.
  - **Tests**: Inspect `tests/` (`test_*.sh`) to understand established contracts and invariants before modifying implementation files.
- **Zero duplication**: Never reinvent or reimplement existing functionality. Extend or parameterize existing components instead of creating duplicates.

## 2. Dead Code & Asset Hygiene

- **No orphan files**: Delete unused components, stylesheets, scripts, and static assets immediately when they are replaced or unmounted.
- **No leftover scaffold files**: Do not leave template assets (`react.svg`, `vite.svg`, `App.css`, unused `icons.svg`) or unused brand/header drafts in `src/` or `public/`.
- **Verify zero references**: Before finishing any refactor or removal, confirm no dangling imports, CSS classes, or asset paths remain.

## 3. DRY (Don't Repeat Yourself) & Logic Extraction

- **Rule of Two**: If logic, GSAP timelines, ScrollTrigger configs, or layout patterns appear in two or more places, extract them into:
  - A shared React component in `src/components/ui/` or a reusable hook/helper.
  - A data-driven loop over typed configuration arrays (e.g., repeated `gsap.from` ScrollTrigger title reveals or project/skill card definitions).
- **Parameterize variations**: When behaviors differ slightly between use cases, pass props, callbacks, or config objects rather than cloning files or blocks.

## 4. Modular Composition & Single Responsibility

- **Single Responsibility**: Each file, component, and helper must have one clear responsibility.
- **Decompose monolithic components**: Keep components focused and break oversized files (>200 lines) into dedicated subcomponents, shader modules, or hooks where practical.
- **Pure & predictable helpers**: Keep utility and geometry/particle functions stateless and deterministic wherever possible.

## 5. GitHub Pages & Blocker-Resilient Standards

- **Base-aware asset URLs**: Always reference files under `public/` using `${import.meta.env.BASE_URL}...` in `src/` and relative paths (`./favicon.svg`) in `index.html` so GitHub Pages (`/portfolio/`) resolves every asset cleanly.
- **Zero runtime third-party CDNs**: Bundle fonts locally via `@fontsource/*` in `src/main.tsx` and register every `@iconify/react` icon locally in `src/icons.ts` via `addIcon(...)` so privacy/adblockers never break styling or icons.
- **Graceful browser-API fallbacks**: Guard `ctx.getImageData` and WebGL/canvas effects with `try/catch` and visible DOM fallbacks. Never use adblocker cosmetic-filter keywords (`ad`, `ads`, `advert`, `banner`, `promo`, `sponsor`, `popup`) in class names, IDs, or filenames.

## 6. Test Awareness & Co-Evolution

- **Read tests first**: Before modifying or refactoring any component, read `tests/test_*.sh` first to understand existing contracts and assertions.
- **Update tests when behavior intentionally changes**: When adding new Iconify icons, asset paths, or structural changes, update `src/icons.ts` and `tests/` to match the verified specification.
- **Preserve test rigor**: Never delete failing tests, weaken assertions, or mask failures. Verify with `bash tests/run-tests.sh`, `npm run lint`, and `npm run build`.
