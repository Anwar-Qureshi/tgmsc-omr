# TGMSC OMR Evaluator

A small website built to help faculty at Telangana Minorities Study Circle check mock-test OMR answer sheets using a phone or computer.

Faculty currently compare each sheet with an answer key and count the results manually. This app reads supported sheets, highlights answers that need checking, and calculates the score after faculty review.

## How to use it

1. Enter an exam name and choose the number of questions.
2. Enter marks for a correct answer and the deduction for a wrong answer. Fractions such as `2/3` are accepted. Use the actual rules for that exam.
3. Type or paste the answer key using only A, B, C and D in question order. Spaces, commas and line breaks are allowed. Check the numbered preview before continuing.
4. Take or upload a clear, upright photo of the whole sheet. Keep the paper flat and all four printed corner marks visible.
5. Check that the green circles line up with the printed bubbles. Review the readings and resolve any uncertain answers.
6. Confirm the result and copy it onto the paper. Select **Next student** to evaluate another sheet with the same key.

Image answer keys are not supported. The faculty must type or paste the key.

## Supported sheets

| Sheet | Current support |
| --- | --- |
| 100 questions | Automatic reading for the supplied TGMSC layout, with faculty review |
| 50 questions | Automatic reading for a reconstructed reference layout; validation on fresh real sheets is still needed |
| 30 questions | Faculty enters the student responses manually; the app calculates the result |

Question count alone does not make an unfamiliar layout compatible. Automatic reading for the actual 30-question form has not been added yet.

## Results

The app shows attempted, correct, wrong and unanswered counts, marks deducted and the final score.

**Score = correct answers × marks per correct answer − wrong answers × deduction.**

Unanswered questions receive zero. An uncertain response must be resolved before confirmation. Faculty should select Invalid only when the exam's rules treat that response as wrong. Scores are displayed to two decimal places.

## Navigation and privacy

- Opening or reloading the app starts with an empty exam setup.
- **New exam / Home** clears the current exam after confirmation.
- **Edit current exam** keeps its fields so faculty can change them.
- **Next student** clears the previous sheet and result while keeping the current exam and key.
- Exam settings, photos and scores remain only in the open tab. There is no student history, student name field or roll number field.
- The evaluator processes photos on the user's device; it does not send them to a grading server.

Copy a result before moving on. Reloading or closing the tab loses the current exam and result.

## How it works

The app uses image processing rather than a trained AI model. It looks for printed corner marks to align the photograph with a map of bubble positions, then compares darkness inside the bubbles. It compares the detected responses with the faculty's key and calculates the score.

Blur, shadows, glare, folds and unusual camera angles can affect readings. Retake the photo if alignment is poor. Manual alignment is available for supported sheets: select the four printed corner marks clockwise from the top left.

## Testing and current status

This is a supervised faculty pilot. The earlier recognition checks passed 31 controlled photo cases across the 50- and 100-question layouts, with no silent mismatches among accepted automatic readings. Uncertain readings were flagged, and unsuitable cases were blocked. Those results come from controlled reference-based test images, not an independent collection of real faculty photographs.

The latest navigation update was checked for clean startup, editing, starting a new exam, cancelling a reset, keeping the key for the next student, and returning through browser history. Recognition and scoring files were unchanged in that update.

Physical Android camera testing, repeated use on lower-memory phones and independent real-paper accuracy checks remain pending. The project does not claim guaranteed accuracy, zero bugs or readiness for unattended grading. Faculty must check each result.

## Files and deployment

Keep these nine files together at the top level of the repository:

- `index.html`
- `style.css`
- `app.mjs`
- `reader.mjs`
- `validation.mjs`
- `template-100.mjs`
- `template-50.mjs`
- `favicon.svg`
- `favicon-32.png`

The website needs no database, model download, paid AI service or environment variables. Publish these files using an HTTPS static website host, such as Cloudflare Pages or GitHub Pages. The README is documentation and is not needed to run the app. Upload the extracted files, not the deployment ZIP.

For Cloudflare Pages, connect the GitHub repository, choose `main`, select no framework, leave the build command empty and publish the repository root (`.`).

For GitHub Pages, choose **Settings → Pages → Deploy from a branch → main → /(root)**.

To run locally, use a local web server, for example `python3 -m http.server 8000`, and open `http://localhost:8000`. Opening `index.html` directly from a folder may prevent its JavaScript modules from loading.

## Project purpose

The project aims to reduce manual counting and score calculation while keeping faculty in control of the final result. Actual time saved and field accuracy must be measured during a real faculty pilot.

Do not commit student photographs, real exam answer keys, credentials or other private information to this repository.
