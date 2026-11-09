# Application architecture and future maintenance

## Product contract

TGMSC faculty grade one student's OMR sheet at a time using a common exam key. The application reduces counting and arithmetic while retaining faculty review. Android browsers are the intended field platform. It is a static client application, not a learning model. More use does not train it or improve it automatically. There is no student history, identifier, login, backend, synchronisation, service worker or background job.

## Source of truth and build

The hand-authored HTML, CSS and ES modules in `dist` are both source and deployment assets. This deliberate buildless structure avoids dependency/build complexity. `scripts/build-standalone.mjs` concatenates local modules, removes module import/export declarations, embeds CSS and the SVG icon, and writes an ignored standalone HTML artifact. Update that script if module structure changes: it is a small purpose-specific bundler, not a general JavaScript parser. Node's built-in test runner executes pure logic. Python/Pillow is test-only image decoding. Sandbox benchmark scripts now preflight fixture PNG availability and skip with a warning if those fixture files are not present in the checkout.

## Exam data and validation

`app.mjs` owns `exam`, `draft`, `frame`, `points`, `readings`, `answers`, `photoVersion`, `manual` and `overlay` in module scope.

- Exam: `{title,key,plus,minus,plusText,minusText}`. The key is an uppercase string of 30, 50, 100 or 200 letters (A–D for 30/50/100, A–E for 200); its length selects the reader.
- Marks: nonnegative finite numbers or simple decimal fractions parsed by `parsePoints`; correct points must be positive; each value is at most 1000. No scientific notation or negative penalty input.
- Key parsing removes whitespace and commas only. Numbered keys, PDFs and key images are not imported. Preview invalidates whenever setup inputs change.
- Saved settings use localStorage key `tgmsc-omr-pilot-v1`. On startup `validExam` validates types, length and ranges. Stored textual marks must parse to the corresponding numeric value or are discarded. Storage errors do not prevent in-tab work.
- Local storage is per browser/origin. Moving hosts does not migrate settings. Forget settings removes only the stored configuration; the current in-memory exam remains usable.

## Photo and review lifecycle

`loadPhoto` reads a single file, clears old sheet state, obtains an object URL, decodes into an Image, and scales the longest edge to at most 2000 pixels before copying RGBA pixels to `frame`. Minimum decoded dimension is 600px; files over 25MiB and images over 60 million decoded pixels are rejected. The pixel limit is checked after image decoding, so very large compressed images can still consume decode memory. These guards reduce risk but are not a guarantee against low-memory Android tab termination.

`photoVersion` invalidates a pending decode when the sheet is cleared/replaced. Object URLs are revoked in `finally`. File inputs reset so the same photo can be selected again. The original image is not uploaded. Canvas and typed arrays are in tab memory. Processing is synchronous on the main thread, so older phones may pause briefly; a worker should be considered only if physical measurements justify it.

For 50/100/200 questions, alignment and reading are supported. Missing anchors ask for a retake or manual 4-corner alignment. A reader rejection leaves no gradeable responses. For 30 questions, all answers begin as `?` and require manual entry.

`draw` renders the frame, anchor circles and bubble overlay. Manual clicks translate CSS coordinates into canvas pixels. Four corners must be supplied clockwise: upper left, upper right, lower right, lower left. Realigning discards earlier readings after confirmation. Retake is preferred if the printed grid is not aligned.

Review has Pending, All and Wrong filters. Pending rows use source-image crops with A–D (or A–E for 200-question), Blank and Invalid buttons. Other rows use selects and an optional crop. Answers are `A/B/C/D` (plus `E` for 200 questions), `-` (blank), `X` (faculty-selected invalid/wrong), or `?` (unresolved). Changing a response clears verification. Every `?` must be resolved and the faculty checkbox selected before final confirmation. “Confirmed” means faculty-confirmed, not independently certified by software.

Next student clears the photo and score while retaining the exam. Back to setup warns before dropping an existing photo and restores the exam fields. Reload/closing loses the current student's work. No result history is planned unless explicitly requested.

## Classical computer vision pipeline

`template-100.mjs` exports `grid`; `template-50.mjs` exports `template50` with anchors and grid; `template-200.mjs` exports `template200` with anchors and grid (4 columns of 50 questions, 5 blocks of 10 rows per column, 5 options A–E). Each grid is question-order rows of reference pixel positions in A–D (or A–E) order. Reference space is based on canonical 1200×1600 coordinates. The 100-question anchors are in `reader.mjs`: `[154,167], [978,150], [1072,1288], [145,1341]`. The 200-question anchors are the outer grid corners: `[100,310], [1080,310], [1080,1400], [100,1400]`.

1. `findAnchors` thresholds luminance below 94 and flood-fills connected dark components.
2. Components are filtered by size, shape, density and expected corner regions. The 50-question lower markers have special elongated-shape tolerances. Candidate combinations are ranked by proximity to the template's normalised positions, relative size and valid geometry.
3. Geometry requires large horizontal/vertical spans and clockwise convex cross products. These assumptions favour an upright, full-frame photograph. Arbitrary rotation, severe tilt or a distant sheet can fail.
4. If candidate rankings are close, the reader tests up to six plausible combinations and accepts only a unique match. This is a heuristic, not a calibrated probability.
5. `projection` solves an eight-parameter projective mapping with pivoted elimination. Each reference sample maps into the photograph. This compensates for planar perspective; it cannot undo paper curl, creases, motion blur or lens distortion.
6. `readSheet` measures bubble outlines in eight directions and interior darkness against nearby background. For 50/100 questions, four visible outlines are required for an automatic answer in a row; for 200 questions, three visible outlines are required. Top interior strength below 26 yields blank; top at least 63, second below 32 and gap at least 38 yields the strongest option; otherwise `?`.
7. At least 72% of rows must have three visible bubbles. Blocks of five cannot contain three rows with no visible outline. Out-of-frame samples or failed geometry reject the read.

Thresholds are heuristics tied to these layouts and image conditions. An accepted wrong reading remains possible. A green overlay and zero pending flags do not prove correctness. No deep-learning weights, external CV library or OCR is involved.

## Scoring

`score(key, answers, correctPoints, penalty)` is independent of images and UI. Invalid input or any unresolved response returns `null`.

- `correct`: response equals key.
- `unanswered`: response is `-`.
- `attempted = count - unanswered`.
- `wrong = attempted - correct` (includes faculty-selected `X`).
- `negative = wrong × penalty`.
- `total = correct × correctPoints - negative`.

No minimum score clamp. JavaScript floating-point arithmetic is used; unit tests use tolerance for repeating fractions. Display uses `Intl.NumberFormat('en-IN', {maximumFractionDigits:2})`. Do not round each deduction before adding. Do not infer official scoring from form count.

## Adding the actual 30-question form

Obtain a clean reference plus independent real completed photographs, with manually verified response strings and expected totals. Record form revision, page dimensions, marker geometry, question numbering, option order and different print batches. Add `template-30.mjs`; register it in the reader; generalise sample radii only with measurements. Add auto/manual alignment tests, blank/partial/full sheets, ambiguous marks, distortions and wrong-form rejection. Test actual Android captures on separate data not used to choose thresholds. Only then change the UI support status and enable auto reading. Merely copying the first 30 positions of another template is unsafe.

## Change risk map

Guidance, CSS and icons: verify accessibility, layout and all navigation states. Validation/scoring: expand unit tests and check saved-setting migration. Photo lifecycle: test replacement/cancel/reselection and memory on phones. Recognition: rerun both sandboxes and independent real-paper tests; track silent error, review and rejection rates separately. New storage/network features: explicit product/privacy decision first.

## Deployment and rollback

Ship all dist assets together. Relative URLs support a host subpath. Host HTTPS is preferred. No environment file is required; do not add empty secret/config machinery. Keep each release in Git; rollback by redeploying the previous tested commit's dist directory. Avoid long immutable caching for unversioned HTML/modules/icons, or use a coherent asset-versioning strategy before introducing it. Refresh stale tabs after deployment; no service worker controls cache today.

Do not confuse access to the owner-private Sites preview with public availability for faculty. An externally hosted static copy is independent of ChatGPT inference and subscription use, but its availability remains subject to its hosting provider.

## Known boundaries

Physical Android camera launch, real camera EXIF variants, low-memory behaviour, many sequential papers, Samsung Internet, accessibility assistive technology and independent real-photo accuracy are not fully verified by the controlled suite. 30 auto-reading is absent. Existing synthetic fixtures are based on the same reference geometry as the reader, so they cannot establish generalisation. There is no honest “all edge cases” or “zero bugs” certification.

The standalone builder isolates the 50-question module in a function scope to avoid its local `grid` name colliding with the 100-question export. It checks the resulting script with Node `vm.Script` before saving. For local responsive QA, serve the repository root and open `scripts/responsive-check.html`; this frames the actual dist app at selectable widths. Never deploy that QA utility as a production asset.
