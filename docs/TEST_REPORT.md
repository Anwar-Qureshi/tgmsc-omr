# Verification report — 0.4.0

Run date: 2026-11-07. Scope: static app guidance, metadata, input hardening, navigation and responsive presentation. Recognition thresholds were retained.

## Automated tests

14 Node tests passed: reference map shape/order, projective reading, ambiguous-mark flagging, bad geometry, missing anchors, scoring with blanks/invalids, fractions and invalid numeric input, saved configuration validation, 50 map dimensions, 30 automatic rejection, score invariants for 30/50/100, invalid score arguments, 200-question template dimensions (1000 bubbles across 4 columns of 50 rows), 200-question exam validation and scoring (including 5 options A–E and -1/5 penalty), and 200-question projective reading with double-mark flagging.

| Controlled photo set | Cases | Accepted | Blocked | Questions on accepted photos | Automatic readings | Flagged for review | Silent mismatches |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 100 questions | 16 | 10 | 6 | 1,000 | 908 | 92 | 0 |
| 50 questions | 15 | 9 | 6 | 450 | 447 | 3 | 0 |
| 200 questions | 3 | 3 | 0 | 600 | 280 | 320 | 0 |

Every expected rejection occurred; required uncertain responses were flagged. After replacing flags with the known fixture responses, scoring matched the expected answers. This replacement simulates a correct human review; it does not measure human review accuracy. These are controlled reference-derived images, not independent field data. Automatic coverage is 90.8% and 99.33% respectively on accepted cases; the table must not be presented as a real-world accuracy promise.

## Browser checks

In Chromium through the supported cloud browser:

- 100-question fully correct fixture: eight responses required review; after resolving those known fixture responses, result was 100 attempted, 100 correct, zero wrong, zero blank, score 200 at +2 / −2/3.
- 50-question half-answered fixture: 25 attempted, 13 correct, 12 wrong, 25 blank, deduction 4, final score 9 at +1 / −1/3.
- Confirmation disabled until verification; Next student clears result; Back to setup restores fields.
- Restored fraction labels retain 1/3 rather than a long decimal.
- Upload screen measured at frame widths 320, 360, 412, 768 and 1280: no document horizontal overflow. Narrow review inspected at 360; answer controls subsequently stacked below 420px to avoid truncated labels. The updated 360px review was rechecked visually and had no horizontal overflow.

These are CSS layout checks in a desktop browser frame. They are not Android device emulation, physical touch tests, camera tests or low-memory tests. Prior testing claims are not substituted for new evidence.

## Remaining acceptance work

Actual Android capture, permissions/cancel behavior, camera EXIF variants, low-memory endurance, independent 50/100 paper photographs, accessibility assistive technology, and the real 30-question layout remain pending. See RELEASE_CHECKLIST.md. No bug-free or >95% field-accuracy certification is made.

## Reproduce

`npm run check` runs unit tests, both fixture benchmarks and standalone generation. Each sandbox contains the key, fixture responses and expected result CSV. When fixture PNGs are absent from the checkout, benchmark scripts now skip with a warning instead of failing CI. Python Pillow is required only when fixture decoding actually runs. For browser checks, serve dist, enter the corresponding sandbox key and scoring values, then upload the named fixtures. Never use fixture answer keys for a real exam.

Packaging check caught a duplicate variable name when concatenating template modules for the optional standalone export. The build now isolates the 50-question template scope and validates the generated JavaScript syntax before writing the HTML. The corrected build passes. This defect affected the new export builder, not the separately loaded hosted modules.
