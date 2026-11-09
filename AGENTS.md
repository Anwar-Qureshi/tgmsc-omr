# Maintenance contract

Read README.md, docs/APP_GUIDE.md, docs/TEST_REPORT.md and docs/RELEASE_CHECKLIST.md before editing.

- Canonical application source is dist/. Keep the static, local-processing architecture unless explicitly asked otherwise.
- Do not add student history, identity fields, telemetry, paid APIs, model training, or a database by default.
- Do not silently guess uncertain marks. Keep `?` unresolved and block confirmation until resolved.
- Do not advertise 30-question automatic reading until its actual form is mapped and independently tested. Question count alone does not identify a layout.
- Preserve the reviewed distinction between synthetic fixture performance and field accuracy. Never claim zero bugs or guaranteed accuracy.
- Marking values are exam inputs, not assumptions derived from question count. Preserve fractions, validate numeric ranges, and round only for display.
- Use textContent for user text. Do not introduce unsafe HTML interpolation, upload photo data, or store images in localStorage.
- Never tune recognition thresholds solely to make existing fixtures pass. Add a new failing case and independently annotated real photographs for recognition changes.
- Keep original fixtures immutable; add cases instead of weakening expected results. Review rejection/flag rates as well as silent errors.
- Run npm run check. Document browser/Android verification that was actually done. If unavailable, mark it pending.
- Generate the standalone file with npm run build; never hand-edit that output.
- Deploy only dist; exclude sandbox, local student data, reports and development tools from public assets.
- Maintain existing Site identity and audience. Do not make private hosting public without user authorization.
- Update architecture, changelog and test report when behavior changes. Record limitations and rollback steps.
