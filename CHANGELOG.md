# Changelog

## 0.5.0 — 2026-11-09

- Added 200-question TGMSC Police Constable & SI Grand Test layout support (`dist/template-200.mjs`) with 1000 bubbles (4 columns of 50 questions, 5 blocks of 10 rows per column, 5 options A–E).
- Added automatic registration marker and boundary detection for 200-question sheets in `findAnchors()`, eliminating mandatory manual corner taps while retaining fallback safety.
- Extended exam validation to accept 200-question keys with uppercase A–E letters and preserve strict A–D validation for 30, 50, and 100 question forms.
- Updated review interface dynamically to render Option E buttons, selects, and filter handling for 200-question exams while keeping 4-option displays for other layouts.
- Calibrated bubble outline edge detection (`edges[4]`) and minimum outline threshold (`minOutlines = 3`) for dense 200-question grid geometry without regressions on 50/100 question benchmarks.
- Updated standalone single-file HTML builder (`scripts/build-standalone.mjs`) to include template-200 with IIFE variable scope isolation and syntax verification.
- Added fixture-presence guards for `sandbox/*/run-benchmark.mjs` so CI skips sandbox benchmark execution with an explicit warning when fixture PNGs are not present in the repository checkout.
- Maintained strict human-in-the-loop review policy: ambiguous marks remain `?` and block confirmation until reviewed; blanks score 0.
- Preserved existing zero-dependency buildless architecture and backward compatibility across 30, 50, and 100 question workflows.

## 0.4.0 — 2026-11-07

- Added local SVG/PNG favicon, theme colour and page description.
- Added contextual key-format, marking-rule, capture, review, privacy and result-copying guidance.
- Kept latest back navigation and no-student-identifier workflow.
- Added Forget saved exam settings without introducing student history.
- Validated stored exam types/ranges and preserved valid fraction labels on reload.
- Added file-size and decoded-resolution guards; strengthened score input validation.
- Stacked answer controls on narrow screens so labels remain readable.
- Added README, architecture/agent handoff, release checklist, test report, GitHub CI and reproducible standalone build.
- Preserved recognition thresholds and the 30-question manual-only restriction.

Known limitation: physical Android camera/low-memory checks and independent real-paper accuracy validation remain pending.
- Fixed template name collision in the standalone builder and added generated-script syntax validation.
