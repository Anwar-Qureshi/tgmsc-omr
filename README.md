# TGMSC OMR Evaluator

A lightweight faculty tool for checking mock-test answer sheets, reviewing uncertain readings, and copying a confirmed score onto the paper. Photos are processed in the browser. There is no backend, paid AI API, trained model, student database, or account system in the application.

**Release 0.5.0 — supervised pilot.** This is not certified for unattended grading. Passing synthetic tests does not establish accuracy on actual Android photographs. Review each sheet before confirming its result.

## What works today

| Form | Current support |
| --- | --- |
| 200 questions | Automatic photo reading for TGMSC 5-option (A–E) grand test layout; faculty review required |
| 100 questions | Automatic reading for the supplied TGMSC layout; faculty review required |
| 50 questions | Automatic reading for a reconstructed reference; real-paper validation pending |
| 30 questions | Manual response entry and scoring; no automatic bubble map yet |

The form selection is the **question count**, not the exam's maximum marks. Each exam has its own faculty-entered positive marks and wrong-answer deduction. No official scoring scheme is inferred from a course name.

## Faculty workflow

1. Choose a form, name the exam, and enter its marking rules. Fractions such as `2/3` are accepted.
2. Paste exactly 30, 50, 100, or 200 letters (`A`, `B`, `C`, `D`, and `E` for 200 questions) in question order. Spaces, commas, and line breaks are accepted. Do not include numbers, headers, explanations, or image files. Check the numbered preview and confirm the key.
3. Take or upload one photograph with the entire form visible. The supported readers start automatically.
4. Check the green overlay. Retake misaligned, blurred, shadowed or cropped photographs. Manual alignment uses the four printed corner marks clockwise from the upper left.
5. Resolve flagged answers, inspect other readings using **All questions**, then confirm the result. Enter what the student marked, not what the key says.
6. Copy the result to the paper before selecting **Next student**. Use **Back to exam setup** for another exam.

`X / Invalid` counts as a wrong attempted answer only when the faculty chooses it. A double mark is flagged for review; it is never automatically assigned a policy. Blank answers score zero. Results display two decimal places, with no per-question rounding.

## Run locally

Production has **zero runtime dependencies**. For development, use Node.js 20+ and Python 3.10+:

```sh
python3 -m http.server 8000 --directory dist
```

Open `http://localhost:8000`. ES modules need an HTTP server; do not double-click `dist/index.html`.

For an optional single-file copy:

```sh
npm run build
```

Open `artifacts/Open_Faculty_Pilot.html`. It is generated from the same sources; never edit it separately. Browser local-file storage/camera behavior varies, so HTTPS hosting is preferred for faculty use.

## Verify changes

```sh
npm test
python3 -m pip install -r requirements-test.txt
npm run test:sandbox
npm run build
```

`npm run check` runs all three checks. There is no `npm install` requirement because this project has no Node dependencies. Pillow is used only to decode sandbox fixtures, never by the hosted app. GitHub Actions runs the same checks.

Sandbox: 16 controlled 100-question cases and 15 reconstructed 50-question cases include blank, half-answered, fully correct, fully wrong, mixed, faint/double marks, tilt, blur, glare, compression, cropping, dimness and wrong layouts. See [test report](docs/TEST_REPORT.md) for evidence and limitations.

## Deploy

Upload **only `dist/`** to an HTTPS static host. Keep every file together and set the host's publish directory to `dist`. No server plan, database, environment variables, model downloads or API secrets are needed. A host with a suitable free static tier can serve this app; check that host's current quotas and terms. Hosting access controls, if any, are separate from this application.

For GitHub: create a repository, commit this project, and use your chosen static hosting integration. For GitHub Pages, publish the contents of `dist` through your Pages deployment workflow. Do not point Pages at the repository root. Relative asset paths support subdirectory hosting.

The `.openai/hosting.json` file is specific to the existing Sites deployment. Preserve its identity when updating that Site; it is not needed by other hosts. The existing Site remains owner-private unless its owner changes access. A deployed private URL alone does not grant faculty access.

## Project map

| Path | Purpose |
| --- | --- |
| `dist/index.html` | Accessible page structure, faculty guidance and metadata |
| `dist/style.css` | Responsive visual styles; 44px minimum standard controls |
| `dist/app.mjs` | Exam setup, photo lifecycle, review UI, confirmation and storage |
| `dist/validation.mjs` | Mark parsing and saved-exam validation |
| `dist/reader.mjs` | Geometry, anchor detection, bubble classification and score calculation |
| `dist/template-100.mjs`, `dist/template-50.mjs` | Fixed bubble-position maps |
| `dist/favicon.svg`, `dist/favicon-32.png` | Local favicon assets |
| `tests/` | Unit and geometry regression tests |
| `sandbox/` | Controlled images, keys, expected responses and benchmark runners |
| `scripts/build-standalone.mjs` | Reproducible single-file export |
| `docs/APP_GUIDE.md` | Architecture and maintenance handoff |
| `docs/RELEASE_CHECKLIST.md` | Deployment and physical Android acceptance checks |
| `AGENTS.md` | Rules for future IDE agents |

## Privacy and maintenance

Only the exam title, key and marking rules are saved in browser local storage. Photos, readings and scores exist in the current tab only. No roll number or student name is collected. The help panel can remove saved exam settings. Browser/host logs and access controls are governed by the hosting provider; do not describe the entire hosting service as log-free.

Keep real student photographs out of Git and test archives. Use anonymised captures with permission for local validation. Report issues with the form version, browser, reproduction steps, expected result, actual result and an anonymised example. See [release checklist](docs/RELEASE_CHECKLIST.md) before routine faculty use.
