# Release and field acceptance checklist

Status: supervised pilot; use this checklist on every release. A checked software test is not a substitute for the physical-device or field checks below.

## Build and source

- [x] Static application, no runtime package dependencies or paid API calls.
- [x] Favicon assets and metadata included with relative paths.
- [x] README, architecture guide, AGENTS.md, changelog and regression tests included.
- [x] .gitignore excludes environment secrets, local artifacts and private data. No .env needed.
- [x] Reproducible standalone export; canonical deployment files in dist.
- [x] Unit and both sandbox suites pass in this release.
- [ ] Run those checks again after any future source change.

## Faculty workflow

- [x] Key count/format, question count versus marks, and scoring inputs explained.
- [x] Unsupported 30-question automatic mode clearly labelled; manual mode available.
- [x] Photo capture, manual corner alignment, answer review and result copying explained.
- [x] No roll number, student-name field or result history.
- [x] Unresolved answers block confirmation; edits clear verification.
- [x] Back navigation and Next student tested in browser.
- [x] Saved settings can be removed. Photos/results remain in the tab only.

## Physical Android acceptance — still required

Use at least a representative lower-memory Android phone and a faculty's usual phone. Record Android version, browser/version and device model. Prefer Chrome, then check the faculty's actual alternative browser if different.

- [ ] Open deployed HTTPS app with the access permissions intended for faculty.
- [ ] Tap Take photo; confirm rear camera behavior. Cancel and retake. Also test gallery upload.
- [ ] Capture upright and sideways; ensure unsuitable orientation requests retake instead of silently wrong output.
- [ ] Test camera-produced JPEG/HEIC/WebP where supported; unsupported images must fail clearly.
- [ ] Test normal resolution, large photos, glare, blur, folds, cropped markers, dark lighting and busy backgrounds.
- [ ] Verify setup, key preview, overlay, crop review, corrections, confirmation and next student with touch and on-screen keyboard.
- [ ] Check portrait/landscape, increased system text size and 200% browser zoom.
- [ ] Grade at least 30 consecutive sheets; observe memory, latency, camera cancellation and any tab reload.
- [ ] Test closing/reopening, private browsing and blocked storage; explain what is and is not retained.

## Real-paper accuracy gate

Use independent, anonymised real photographs for each actual form revision, across phones, lighting and print batches. Do not reuse images used to tune thresholds as the only acceptance set. Have two people verify the ground-truth response strings and resolve disagreements.

Record for each photo: form, device, condition, expected answers, automatic answers, flagged questions, rejection/retake, faculty corrections, expected/final score and elapsed review time. Count:

- Silent error rate = incorrect unflagged answers / all unflagged answers.
- Automatic coverage = unflagged answers / questions on accepted photos.
- Rejection rate = rejected photos / all submitted photos.
- Exact-sheet rate = sheets with every response correct / accepted sheets.
- Final score agreement and review time, including manual work.

Do not deliver a “95% accuracy” headline without specifying the denominator and dataset. A 95% per-answer rate can still leave several errors on a 100-question paper. Require exact score agreement after review; investigate every silent error before expanding the pilot. Acceptance thresholds and sample sizes should be agreed with TGMSC; finite samples cannot guarantee future perfection.

## Hosting and rollback

- [ ] Confirm correct audience; existing Sites deployment is owner-private.
- [ ] Deploy only dist, using HTTPS and correct JS/CSS/image MIME types.
- [ ] Verify favicon references and actual assets on the deployed URL; hard refresh if browser caches an old icon.
- [ ] Run a known-answer sheet on the actual hosted app and check scores.
- [ ] Check no secret/test/student files were included in published assets.
- [ ] Record release commit and previous tested version for rollback.
- [ ] Redeploy previous dist if a regression appears; preserve an anonymised reproduction case locally.

No checklist can certify absence of every bug. Keep the pilot label until field evidence supports broader use.
