# TGMSC OMR Evaluator

### From an internship observation to a working faculty tool.

A browser-based application that helps faculty check mock-test OMR sheets from a photograph, review the detected answers and calculate the final score.

**[Open the live app](https://tgmsc-omr.pages.dev/) · [View the source](https://github.com/Anwar-Qureshi/tgmsc-omr)**

Built by **Mohammed Anwar Qureshi** during his internship at **Telangana Minorities Study Circle, Hyderabad**.

---

## The problem I noticed

TGMSC conducts mock tests for UPSC, Groups and SI students twice a week. After each test, faculty compare the filled OMR sheets with a common answer key, count correct, wrong and unanswered questions, and calculate marks with negative marking.

A shared scanner was available, but depending on one device would limit how faculty could use a digital solution. I focused the project on a simpler workflow: **open a website on a phone, photograph a sheet and review its evaluation.**

## What I built

TGMSC OMR Evaluator brings photo reading, answer review and score calculation into one lightweight website.

| Faculty need | What the app provides |
| --- | --- |
| Evaluate a stack of papers using the same key | Set up the exam once, then move to the next student |
| Use an Android phone | Take a photo or choose an existing image |
| Work with different marking rules | Enter correct-answer marks and a wrong-answer deduction, including fractions such as `2/3` |
| Check what the software detected | View green circles over the bubbles and inspect answer crops |
| Resolve faint or unclear marks | Review uncertain answers before confirming a result |
| Copy totals onto the original paper | See attempted, correct, wrong and unanswered counts, marks deducted and final score |
| Avoid maintaining student records | Process one sheet at a time without student names, roll numbers or a database |

**Faculty review is part of the workflow.** The app supports the decision; the faculty member confirms the result.

## The workflow

1. **Set up the exam.** Choose the question count and enter its marking rules.
2. **Check the answer key.** Type or paste A–D answers in question order and verify the numbered preview.
3. **Add a sheet.** Take or upload a clear photograph with the whole form visible.
4. **Review the reading.** Check that the green circles line up with the printed bubbles, inspect answers and resolve uncertain marks.
5. **Confirm and continue.** Copy the result onto the paper, then select **Next student** to keep using the same exam and key.

Answer-key images are not imported. The key must be typed or pasted as letters; spaces, commas and line breaks are accepted.

## Supported forms

| Form | Available today |
| --- | --- |
| **100 questions** | Automatic photo reading for the supplied TGMSC layout, followed by faculty review |
| **50 questions** | Trial photo reader based on a layout recreated from a marked reference sheet; fresh real-paper validation remains pending |
| **30 questions** | Manual entry of student responses from the photo, with automatic score calculation |

The layout matters as well as the question count. A different 50- or 100-question form is not automatically compatible.

## How a photograph becomes a score

The reader uses **classical computer vision**: it finds the printed corner marks, adjusts for the photograph's perspective, and checks how dark each answer bubble is. A position map tells it where to look for each question's A–D choices.

It then compares the responses with the faculty's answer key. Unclear readings are flagged for review, and unsuitable images can be rejected. Manual corner selection is available when automatic alignment fails.

```text
Final score = (correct answers × marks awarded) − (wrong answers × deduction)
```

Unanswered questions score zero. Faculty can classify an invalid response as wrong when the exam rules require it. Scores are displayed to two decimal places.

This approach runs directly in the browser, without a trained model, paid AI API or grading server. Photo quality still matters: blur, glare, shadows, folds and severe camera angles can affect the reading.

## Engineering work and decisions

My work covered identifying the faculty workflow, defining the phone-based interaction, and developing and refining the application with AI-assisted development.

The implementation includes:

- **Image alignment and bubble reading:** separate position maps for the supported 100- and 50-question layouts.
- **A review step before scoring:** uncertain responses prevent result confirmation until the faculty resolves them.
- **Configurable scoring:** exam-specific marks and negative marking, with input validation.
- **Responsive presentation:** readable controls and answer review on narrow screens.
- **Deliberate session behavior:** fresh setup on opening or reloading, separate actions for editing and starting a new exam, and the same key retained for the next student.
- **A lightweight deployment:** plain HTML, CSS and JavaScript hosted on Cloudflare Pages.

The project is designed to reduce repeated counting and arithmetic. Time saved in day-to-day faculty use has not yet been measured.

## Validation and current status

**Live, supervised pilot.** Deployment makes the application accessible; broader field validation is still in progress.

Controlled photo checks covered **31 cases** across the two automatic readers, including blank, partially answered, fully correct, fully wrong and mixed sheets, along with difficult image conditions.

| Controlled dataset | Cases | Accepted for review | Blocked | Automatic readings | Answers flagged | Silent mismatches in automatic readings |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 100-question sheets | 16 | 10 | 6 | 908 | 92 | 0 |
| 50-question sheets | 15 | 9 | 6 | 447 | 3 | 0 |

These are reference-based sandbox results, not a measured field-accuracy rate. Scores after resolving flagged answers against the known test responses matched expectations. Separate checks covered scoring, input validation and navigation behavior. Test datasets and reports are maintained outside this deployment repository.

**Next validation steps:** physical Android camera behavior, repeated grading on lower-memory phones and independent photographs of actual completed papers. Automatic support for the real 30-question form also remains future work.

## Privacy and session behavior

The evaluator processes photos on the user's device and does not upload them to a grading service. It does not maintain a student database or result history.

- **Next student** clears the previous sheet and result, keeping the exam and key.
- **Edit current exam** returns to the existing settings for editing.
- **Home / New exam** clears the exam after confirmation.
- **Reloading or closing the tab** clears the current work.

Copy each confirmed score before continuing. Keep student photographs and real exam keys out of the repository.

## Technology and source files

**HTML · CSS · JavaScript ES modules · Canvas API · Cloudflare Pages**

| File | Responsibility |
| --- | --- |
| `index.html` | Page structure and faculty instructions |
| `style.css` | Layout, typography and responsive styles |
| `app.mjs` | Exam setup, photo handling, review and navigation |
| `reader.mjs` | Corner detection, image alignment, bubble reading and scoring |
| `validation.mjs` | Validation of marking values |
| `template-100.mjs` | Bubble positions for the 100-question reference |
| `template-50.mjs` | Bubble positions for the reconstructed 50-question reference |
| `favicon.svg`, `favicon-32.png` | Website icons |

## Run locally

Download or clone the repository, open a terminal in its folder, and run:

```sh
python3 -m http.server 8000
```

On Windows, `py -m http.server 8000` is another option. Open **http://localhost:8000** in your browser.

Python is used only to serve the files locally. The hosted application needs no package installation, database, environment variables or model files. Serve it over HTTP or HTTPS; opening `index.html` directly from a folder may block its JavaScript modules.

## Deployment

The live application is hosted on **Cloudflare Pages**. To deploy a copy, connect the repository and use:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Framework preset | None |
| Build command | `exit 0` |
| Build output directory | `.` |

Keep all runtime files together at the repository root. Changes pushed to the connected production branch trigger a new deployment.

---

**Mohammed Anwar Qureshi** · B.E. Artificial Intelligence & Data Science, 2027  
[GitHub](https://github.com/Anwar-Qureshi)
