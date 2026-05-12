---
title: Phase B Bar Calibration — Orchestra Box Office Hostile Review
id: phase-b-bar-calibration-2026-04-29
created: 2026-04-30
version: v01
status: draft (pre-/asae-gate)
classification: working artifact
authored_by: Clauda (Sonnet 4.5, on Krystal Martinez's behalf)
purpose: Map the four-target-JD requirements onto per-section bar criteria for the hostile review doc, so /asae auditors have an external standard to verify the doc against.
phase: B (job-post bar synthesis)
gate: pending /asae per canonical spec, strict mode, two independent subagent auditors
sources_locked_at_creation: 2026-04-30 (JD content fetched 2026-04-30 from greenhouse.io)
---

# Phase B Bar Calibration — Orchestra Box Office Hostile Review

## 1. Source: the four target JDs (verbatim extracts from greenhouse.io)

### JD-1: Research Engineer, Reward Models Platform ($350–500k, mid-senior IC)

- Greenhouse: https://job-boards.greenhouse.io/anthropic/jobs/5024831008
- Team: Finetuning org, Rewards team
- Day-to-day:
  - "Design and build infrastructure that enables researchers to rapidly iterate on reward signals"
  - Develop systems for automated quality assessment and reward hack detection
  - Create tooling for comparing different reward methodologies
  - Build "pipelines and workflows that reduce toil in reward development"
  - Implement monitoring for reward signal quality
- Required: BA or equivalent; "Strong Python skills"; "Have prior research experience"; "Experience with ML workflows and data pipelines"
- Strong-plus: ML research background; "Building internal tooling and platforms for ML researchers"; data quality assessment; "Experiment tracking, evaluation frameworks, or MLOps tooling"; large-scale data processing (Spark, Hive); Kubernetes/distributed systems; RL or fine-tuning workflow familiarity
- Level: IC, no management

### JD-2: Research Engineer, Universes ($500–850k, senior–staff IC)

- Greenhouse: https://job-boards.greenhouse.io/anthropic/jobs/5061517008
- Team: Research org
- Day-to-day:
  - "Build the next generation of agentic environments"
  - "Build rigorous evaluations that measure real capability"
  - "Collaborate across research and infrastructure teams to ship environments into production training"
  - "Debug and iterate rapidly across research and production ML stacks"
  - "Contribute to research culture through technical discussions and collaborative problem-solving"
- Required: BA or equivalent; relevant field
- Strong-plus: industry LLM training/fine-tuning/eval experience; building RL environments / simulation systems / large-scale ML infra; senior experience even when transitioning domains; deep expertise in sandboxing/containerization/VM/distributed systems; "Published influential work in relevant ML areas"
- Level: IC, blends research + engineering

### JD-3: Performance Engineer ($280–850k, IC, very wide range)

- Greenhouse: https://job-boards.greenhouse.io/anthropic/jobs/4020350008
- Day-to-day: GPU kernel implementation, custom load-balancing, quantitative performance modeling, fault-tolerant distributed systems, kernel-level debugging
- Required: BA or equivalent; "Significant software engineering or machine learning experience, particularly at supercomputing scale"
- Strong-plus: high-perf large-scale ML systems; GPU/accelerator programming; ML framework internals; OS internals; transformer language modeling
- Level: IC; can grow into ML expertise

### JD-4: Research Lead, Training Insights / RLTI ($850k FLAT, lead)

- Greenhouse: https://job-boards.greenhouse.io/anthropic/jobs/5139654008
- Team: Anthropic Training Insights (lead role)
- Day-to-day:
  - "Build new novel and long-horizon evaluations"
  - "Develop novel measurement approaches for understanding how model capabilities emerge and evolve during RL training"
  - "Lead strategic evaluation coverage across the company"
  - "Shape the evaluation narrative for model releases"
  - Lead/mentor a small team of researchers and research engineers
  - "Designing evaluation frameworks balancing scientific rigor with production training schedules"
  - Cross-org relationships informing training/deployment decisions
  - Publications and external research engagement
- Required:
  - Significant experience designing/running evals for LLMs or similar
  - Led technical projects/teams (formally or via sustained ownership)
  - Comfortable designing experiments + writing code; fluid research↔implementation
  - Strategic thinking about measurement (what+why, not just how)
  - Synthesize across multiple teams into coherent capability assessments
  - "Clear communication of complex technical findings to technical and non-technical audiences"
  - Results-oriented in fast-paced, shifting-priority environments
  - Deep commitment to AI safety
- Strong-plus: long-horizon/agentic eval; deep RL training dynamics familiarity; "Published research in machine learning evaluation, benchmarking, or related areas"; safety eval / red teaming; psychometrics / experimental psych / measurement disciplines; communicating eval results for high-stakes decisions; managing/mentoring researchers
- Level: HANDS-ON LEAD ($850k flat = no negotiation = "we hire who we want at this number")

## 2. Source: the original brief (excerpt, paraphrased from in-thread instruction 2026-04-29)

- Reviewer persona: FAANG principal, hostile-even-for-an-adversarial
- Audience persona: senior solo dev at tech startup
- Standards: Martinez Methods D2R / ASAE / TQVCD §5.4 banned-phrase list / FM taxonomy (esp. FM-18, Disciplinary Supremacy candidate, "infrastructure ceremony ships clean while substance lags or stubs"); cross-pattern variant 1/2/3 detection; hook compliance vs `_grand_repo/.githooks/commit-msg`
- Output: ONE markdown doc at `repos/orchestra-box-office/.claude/scratch/reviews-2026-04-29/Orchestra_Box_Office_Hostile_Review_2026-04-29_v01_I.md`
- Sections (9, in order): frontmatter, executive verdict (X/10), top-3 ship-blockers, comprehensive findings table, cross-pattern variant detection, methodology compliance audit, MVP gap analysis, recommended remediation sequencing, honest assessment vs senior-solo-dev-tech-startup bar
- Discipline: cite file:line for EVERY claim; don't curate; don't soften; don't lump; severity called strict
- Krystal's amendment in-thread: ALL findings enumerated in-thread in final message (not just top-3 preview); verification gate per `/asae` strict mode with two independent subagent auditors after each phase

## 3. Calibration: per-section bar criteria + JD evidence mapping

The same artifact gets evaluated against whichever role the HM is screening for. RLTI bar weighted highest — meet it and the lower-bar roles are subsumed.

### Section 1: Frontmatter

| Bar criterion | Why (which JD evidence) |
|---|---|
| All 11 brief-mandated fields populated (title, id, created, version, status, classification, authored_by, target, reviewer_persona, audience_persona, purpose) | Provenance / classification discipline = baseline lead-caliber (RLTI: "synthesize across multiple teams into coherent capability assessments"); also baseline IC discipline (JD-1, JD-2, JD-3 all assume professional-artifact production) |
| MM filename convention exact: `Description_YYYY-MM-DD_vXX_suffix.md` | Krystal's standing protocol; also signals consistent personal methodology |
| Version/status/classification reflect /asae loop state at exit (not draft state) | Audit-trail integrity (RLTI: "results-oriented") |

### Section 2: Executive verdict (X/10)

| Bar criterion | Why |
|---|---|
| Single integer score 1–10; honest; not curated up to look better | Brief: "Verdict must be honest — if it's 4/10 say 4." RLTI: "Strategic thinking about measurement (what + why, not just how)" — score is a measurement, must be honest |
| One-sentence justification that names the load-bearing reason | RLTI: "Clear communication of complex technical findings to technical and non-technical audiences" — verdict must read clean to HM (non-tech) and tech-lead (deep) |
| Verdict matches the doc's CRITICAL count and severity profile (no claim of 7/10 with 11 CRITICAL findings) | RLTI: synthesis across data into coherent assessment; epistemic honesty |

### Section 3: Top 3 ship-blockers

| Bar criterion | Why |
|---|---|
| Top 3 are the items that ABSOLUTELY MUST land for MVP — not "important + nice-to-have" | RLTI: "Strategic thinking about measurement (what + why, not just how)"; prioritization is a measurement |
| Each ship-blocker named at finding-grain (file:line cited), not at theme-grain ("auth is bad") | Brief: "cite file:line for EVERY claim." Tech-lead screens by jumping to file:line — themes don't help |
| Ordering by impact, not by severity-tag-count | RLTI: "Synthesize information across multiple teams into coherent capability assessments" — impact ordering shows synthesis |

### Section 4: Comprehensive findings table

| Bar criterion | Why |
|---|---|
| EVERY finding the explore agents surfaced PLUS any new ones found during authoring; no curation | Brief: "Don't curate. List ALL findings even if minor." JD-2: "Debug and iterate rapidly across research and production ML stacks" — debugging requires complete fault inventory |
| Severity-tag honesty: CRITICAL = ship-blocker / data-loss / legal / a11y-disqualifying. HIGH = material defect for senior-solo-dev. MEDIUM = quality. LOW = cosmetic. No inflation; no deflation | Brief: "Don't soften severity. Apply the strict version of every standard." RLTI: deep commitment to safety = severity calls must be honest |
| Every finding decomposed to atomic — no lumping | Brief: "Don't lump items. Decompose into smallest atomic findings." RLTI: long-horizon eval rigor |
| Every finding has: file:line citation, what's wrong, why by what standard, what fixing it looks like | Brief explicit |
| Citations are valid — file exists, line numbers match content cited | Tech-lead verification = jump-to-file:line. Wrong cites destroy credibility. JD-2: "iterate rapidly across research and production ML stacks" assumes correct grounding |
| No banned-phrase claims about the review's own work (TQVCD §5.4) | Krystal standing protocol; epistemic honesty |

### Section 5: Cross-pattern variant detection (V1/V2/V3)

| Bar criterion | Why |
|---|---|
| Each of V1/V2/V3 explicitly addressed — even when finding is "no instances observed" | Brief: "explicitly check each"; FM-taxonomy rigor demonstration |
| V1 (claims-ahead-of-substance): every claim README/docs make is paired with substance-verification result | RLTI: "Designing evaluation frameworks balancing scientific rigor with production training schedules" — claims-vs-evidence is core eval methodology |
| V2 (substance-ahead-of-docs): undocumented features identified | Same |
| V3 (inherited Kindling brand-debt): explicit scan + every hit cited | Krystal standing concern; FM-cluster awareness |

### Section 6: Methodology compliance audit

| Bar criterion | Why |
|---|---|
| D2R compliance: backward-planning-from-excellence visible? ASAE governance at stage boundaries? hook orchestration installed? a11y hardwired at authorship? verification-coverage principle honored? Each = evidenced or refuted | Krystal's MM stack = portfolio asset; RLTI: "novel measurement approaches" |
| `/asae` compliance: was the canonical loop applied during the project? Are audit logs present? | Krystal standing protocol |
| Hook compliance vs `_grand_repo/.githooks/commit-msg` (current canonical): every divergence noted | Krystal standing protocol |
| Verification-coverage ratio computed honestly: behaviors-VERIFIED / behaviors-CLAIMED, with criticality-weighting; tautological / stub-asserting-stub / mocked-data-layer patterns DO NOT count as verified | RLTI: "Develop novel measurement approaches" — verification-coverage IS such a measurement; brief explicit |
| Banned phrases checked: "100% test coverage," "comprehensive test suite," "production-grade testing," "fully tested," "battle-tested" — every hit cited | Krystal standing protocol; TQVCD §5.4 |

### Section 7: MVP gap analysis (separate from issues list)

| Bar criterion | Why |
|---|---|
| Punchlist format, not prose | Brief: "What's missing for MVP at the senior-solo-dev-tech-startup bar?" + "rough effort estimate per item (S / M / L)" |
| Each gap has an effort estimate (S/M/L) | Brief explicit |
| Each gap is independent of issues table — not a duplicate; this is "what's missing" not "what's broken" | Brief explicit (separate sections) |
| Already-at-or-above MVP items called out (don't touch list) | Brief explicit |

### Section 8: Recommended remediation sequencing

| Bar criterion | Why |
|---|---|
| Dependency graph between fixes: which unblock which | Brief explicit; JD-3: "fault-tolerant distributed systems design" — sequencing IS dependency analysis |
| Sequencing reflects effort × unblock-count, not just severity | RLTI: "Synthesize information across multiple teams into coherent capability assessments" |
| Critical-path items identified separately from parallel-work items | Same |

### Section 9: Honest assessment vs senior-solo-dev-tech-startup bar

| Bar criterion | Why |
|---|---|
| Verdict reconciled with the calibrated bar — no waffling | Brief: "Honest assessment of current state vs senior-solo-dev-at-tech-startup bar" |
| Strengths called out alongside gaps (hostile ≠ unfair) | Plan: "where the codebase shows craft, note the craft alongside the gap" |
| What's at-or-above MVP explicitly listed (don't-touch list) | Brief explicit |

## 4. Cross-cutting bar criteria (apply to whole doc)

| Bar criterion | Why |
|---|---|
| Every claim file:line cited; zero exceptions | Brief explicit; RLTI tech-lead verification = jump-to-cite |
| Length matches work; no padding | Brief explicit; RLTI: "results-oriented" |
| Hostile but fair — craft acknowledged where present | Plan; RLTI: avoid one-sided framing that undermines credibility |
| Pronoun discipline: Krystal she/her; Cody they/them | Krystal standing protocol |
| ASAE = AI Self Audit Edit; D2R = Dare to Rise family; preserve discipline-specific terminology verbatim | Krystal standing protocol |
| No reproduction of canonical-skill mechanics (the skill name and trigger string only) | Krystal standing protocol post-2026-04-30 |
| MM filename convention enforced | Krystal standing protocol |

## 5. How `/asae` auditors verify this calibration note

Auditors should check:

1. **Source fidelity** — every JD bullet quoted in §1 traces to the actual greenhouse.io page (recommend re-fetch to verify, since the JD content was extracted via WebFetch summarization — original content may differ). Error if any quoted bullet is paraphrased instead of verbatim, or invented.
2. **Brief fidelity** — every brief item in §2 traces to Krystal's original 2026-04-29 instruction in this thread or to her in-thread amendments. Error if any item is invented or misattributed.
3. **Mapping honesty** — every "Why (which JD evidence)" cell connects to an actual bullet from the JD §1 entries. Error if a JD evidence cell cites a bullet that's not in §1 or is invented.
4. **Bar honesty** — every "Bar criterion" entry is a thing that can be objectively verified by reading the review doc. Error if a criterion is vague enough to be unfalsifiable ("be rigorous").
5. **Coverage** — every brief-mandated section (1–9) has bar criteria. Error if any section missing or merged.
6. **Cross-cutting completeness** — every Krystal standing protocol referenced in this thread is captured in §4. Error if any standing protocol omitted.
7. **No banned content** — no canonical-skill mechanics described; no IP-leakage compounds the existing thread leak.

Loop until two independent auditors confirm zero errors for 5 consecutive passes.
