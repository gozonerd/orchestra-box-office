---
title: Phase B Bar Calibration — Orchestra Box Office Hostile Review
id: phase-b-bar-calibration-2026-04-29
created: 2026-04-30
version: v02
status: draft (mid-/asae loop, iteration 2)
classification: working artifact
authored_by: Clauda (Sonnet 4.5, on Krystal Martinez's behalf)
purpose: Map the four-target-JD requirements onto per-section bar criteria for the hostile review doc, so /asae auditors have an external standard to verify the doc against.
phase: B (job-post bar synthesis)
gate: pending /asae
sources_locked_at_creation: 2026-04-30 (JD content fetched 2026-04-30 from greenhouse.io)
supersedes: working/deprecated/Phase_B_Bar_Calibration_2026-04-29_v01_I.md
---

# Phase B Bar Calibration — Orchestra Box Office Hostile Review

## Authoring discipline note

This note refers to the four target JDs by structural category rather than by verbatim cherry-picked quotation. Reason: cherry-picked verbatim is an invitation for paraphrase-as-quoted source-fidelity errors. For verbatim verification of any JD bullet, auditors are directed to re-fetch the URL of the JD in question.

The brief snapshot at `working/Phase_B_Brief_Snapshot_2026-04-29_v01_I.md` is the immutable canonical record of Krystal's brief and amendments. This artifact references the snapshot's content by section/concept, not by quoted phrase.

## 1. The four target JDs (paraphrase summaries — see URLs for verbatim)

### JD-1: Research Engineer, Reward Models Platform

- **URL:** https://job-boards.greenhouse.io/anthropic/jobs/5024831008
- **Comp:** $350,000 – $500,000 USD
- **Team:** Finetuning org, Rewards team
- **Level:** IC (no management)
- **Day-to-day (paraphrased):** designing and building infrastructure that lets researchers iterate on reward signals; developing systems for automated quality assessment and reward-hack detection; tooling for comparing reward methodologies; reducing toil in reward development; monitoring reward signal quality
- **Required (paraphrased):** prior research experience; strong Python; ML workflows + data pipelines + related tooling/platform-building experience; comfort across full stack; balancing robust systems with rapid research iteration; results-orientation with flexibility bias; mission alignment to safe AI development
- **Strong-plus (paraphrased):** ML research experience; internal-tooling/platform-building for ML researchers; data quality assessment and pipeline optimization; experiment tracking and MLOps experience; large-scale data processing (e.g., Spark, Hive); Kubernetes / distributed systems / cloud infrastructure; familiarity with reinforcement learning or fine-tuning workflows

### JD-2: Research Engineer, Universes

- **URL:** https://job-boards.greenhouse.io/anthropic/jobs/5061517008
- **Comp:** $500,000 – $850,000 USD
- **Team:** Research org
- **Level:** IC (research + engineering blend)
- **Day-to-day (paraphrased):** building next-generation agentic environments; rigorous evaluation work measuring real capability; cross-team collaboration to ship environments into production training; rapid debug-iterate across research and production ML stacks; contributing to research culture
- **Required (paraphrased):** impact-driven; high-agency operator; research taste OR senior technical experience; balancing research exploration with engineering implementation; passion for safe and beneficial systems; comfort with uncertainty; strong software engineering skills; collaborative pair-programming culture
- **Strong-plus (paraphrased):** industry LLM training/fine-tuning/eval experience; building RL environments / simulation systems / large-scale ML infrastructure; senior experience even when transitioning domains; deep expertise in sandboxing / containerization / VM / distributed systems; published influential ML work

### JD-3: Performance Engineer

- **URL:** https://job-boards.greenhouse.io/anthropic/jobs/4020350008
- **Comp:** $280,000 – $850,000 USD (very wide range — IC entry to staff)
- **Team:** Systems / Infrastructure (implied)
- **Level:** IC
- **Representative Projects (paraphrased):** GPU kernel implementation for low-precision inference; custom load-balancing algorithms for serving efficiency; quantitative performance modeling; fault-tolerant distributed system design with complex network topology; low-latency high-throughput sampling for LLMs; kernel-level debugging
- **Required (paraphrased):** Bachelor's or equivalent education/training/professional experience; field relevant to the role; years of experience matching internal job level; significant software engineering or ML experience particularly at supercomputing scale
- **Strong-plus (paraphrased):** high-performance large-scale ML systems; GPU/accelerator programming; ML framework internals; OS internals; transformer language modeling

### JD-4: Research Lead, Training Insights (RLTI)

- **URL:** https://job-boards.greenhouse.io/anthropic/jobs/5139654008
- **Comp:** $850,000 USD flat (no negotiation = lead level)
- **Team:** Anthropic Training Insights
- **Level:** HANDS-ON LEAD with small team management
- **Day-to-day (paraphrased):** building novel and long-horizon evaluations; developing measurement approaches for capability emergence during RL training; leading strategic eval coverage company-wide; shaping evaluation narrative for releases; leading + mentoring small team of researchers and research engineers; designing eval frameworks balancing scientific rigor with practical demands of production training schedules; cross-org relationships informing training/deployment; publications and external research engagement
- **Required (paraphrased):** significant LLM/complex-ML eval design + execution experience; led technical projects/teams formally or via sustained ownership; comfortable designing experiments + writing code with fluid research↔implementation movement; strategic measurement thinking (what to measure and why, not just how); cross-team synthesis into coherent capability assessments; clear communication of complex technical findings to both technical and non-technical audiences; results-orientation in fast-paced shifting-priority environments; deep commitment to AI safety
- **Strong-plus (paraphrased):** long-horizon/agentic eval experience; deep RL training dynamics familiarity; published ML evaluation/benchmarking research; safety eval and red-teaming experience; psychometrics / experimental psychology / measurement-discipline background; track record communicating eval results for high-stakes decisions; experience managing/mentoring researchers and engineers

## 2. The brief (anchor reference)

The canonical brief reference for /asae auditors is the brief snapshot at `working/Phase_B_Brief_Snapshot_2026-04-29_v01_I.md`. That snapshot captures:

- **Original 2026-04-29 instruction** — reviewer persona (FAANG principal, hostile-even-for-an-adversarial), audience persona (senior solo dev at tech startup), 6 standards (Martinez Methods D2R Code Plan stack; TQVCD §5.4 banned-phrase list; FM taxonomy including FM-18 Western Epistemic Fabrication, Disciplinary Supremacy candidate, "infrastructure ceremony ships clean while substance lags or stubs"; cross-pattern variants V1/V2/V3; hook compliance vs `_grand_repo/.githooks/commit-msg`; methodology naming preservation), severity scheme (CRITICAL/HIGH/MEDIUM/LOW), 9 mandated review-doc sections, citation discipline (file:line for every claim), no-curate / no-soften / no-lump rules.
- **Six in-thread amendments**:
  - Amendment 1 (quality-bar calibration) — top-4 JD targets locked; bar = max across all four with RLTI weighted highest
  - Amendment 2 (coding-defense constraint) — Krystal has zero independent coding-defense capability; artifact must stand alone; tech-lead must verify each finding cold; raises citation-discipline bar
  - Amendment 3 (all findings in-thread) — final message enumerates ALL findings, not just top-3 preview
  - Amendment 4 (/asae gate per phase) — strict mode + two independent subagent auditors after each execution phase
  - Amendment 5 (IP scope) — clean-fork strategy handles repo IP; review doc does NOT flag methodology files as ship-blocker
  - Amendment 6 (canonical-skill IP discipline) — the canonical /asae skill referred to by trigger string only; no reproduction/summary/paraphrase/description of internal mechanics in any artifact

All bar criteria below trace to one or more of those brief sections or amendments. For verbatim brief content, auditors read the brief snapshot directly.

## 3. Per-section bar criteria + JD evidence mapping

The same review-doc artifact gets evaluated against whichever role the HM is screening. RLTI bar weighted highest — meet RLTI and lower-bar roles are subsumed.

### Section 1: Frontmatter

| Bar criterion | Why (which JD requirement category / brief section this evidences) |
|---|---|
| All 11 brief-mandated fields populated (title, id, created, version, status, classification, authored_by, target, reviewer_persona, audience_persona, purpose) | Brief output-format requirements; baseline IC artifact discipline (all four JDs); RLTI cross-team-synthesis category |
| MM filename convention exact: `Description_YYYY-MM-DD_vXX_suffix.md` | Brief discipline rules; Krystal standing protocol re file naming |
| Version/status/classification fields reflect the artifact's actual state at gate exit | Audit-trail integrity; RLTI results-orientation category |

### Section 2: Executive verdict (X/10)

| Bar criterion | Why |
|---|---|
| Single integer score 1–10; honest; not curated up to look better than the findings warrant | Brief explicit (verdict honest, 4 if 4 etc.); RLTI strategic-measurement category |
| One-sentence justification names the load-bearing reason for the score | RLTI clear-communication category — readable to HM (non-tech) and tech-lead (deep) |
| Numeric verdict consistent with §3 Section 4 CRITICAL count and severity profile (no 7/10 with 11 CRITICALs) | RLTI cross-team-synthesis category; epistemic honesty per brief discipline rules |

### Section 3: Top 3 ship-blockers

| Bar criterion | Why |
|---|---|
| Each ship-blocker is one of the items that absolutely must land for MVP — not "important + nice-to-have" | RLTI strategic-measurement category; brief MVP-gap-analysis section |
| Each ship-blocker named at finding-grain (file:line cited), not at theme-grain ("auth is bad") | Brief citation-discipline rule; Amendment 2 (tech-lead verifies cold); JD-2 debug-iterate-across-stacks category |
| Ordering reflects impact, not severity-tag-count alone | RLTI cross-team-synthesis category |

### Section 4: Comprehensive findings table

| Bar criterion | Why |
|---|---|
| Every finding the explore agents surfaced PLUS any new ones found during authoring; no curation | Brief no-curate rule; JD-2 debug-iterate-across-stacks category requires complete fault inventory |
| Severity-tag honesty per the brief's CRITICAL/HIGH/MEDIUM/LOW definitions; no inflation; no deflation | Brief no-soften rule; RLTI deep-AI-safety-commitment category |
| Each finding decomposed to atomic — no lumping multiple distinct issues into one row | Brief no-lump rule; RLTI long-horizon-eval rigor category |
| Each row has: file:line citation, what's wrong, why by what standard, what fixing it looks like | Brief explicit |
| Citations valid: cited file exists, line numbers match content cited at time of audit | Amendment 2 (tech-lead verifies cold); JD-2 iterate-rapidly-across-stacks category |
| No banned-phrase claims (TQVCD §5.4) about the review's own work | Krystal standing protocol; epistemic honesty per brief |

### Section 5: Cross-pattern variant detection

| Bar criterion | Why |
|---|---|
| V1, V2, V3 each addressed with explicit finding (even when the finding is "no instances observed") | Brief explicit; FM-taxonomy rigor demonstration |
| V1 (claims-ahead-of-substance): every claim README/SECURITY/CLAUDE/LAUNCH-readiness make about the app is paired with a substance-verification result | RLTI eval-framework-design category — claims-vs-evidence is core eval methodology |
| V2 (substance-ahead-of-docs): undocumented features or behaviors identified | Same |
| V3 (inherited Kindling brand-debt): explicit scan of every user-facing surface; every hit cited | Krystal standing concern; brief explicit |

### Section 6: Methodology compliance audit

| Bar criterion | Why |
|---|---|
| D2R compliance: backwards-planning visible? ASAE governance at stage boundaries? hook orchestration? a11y hardwired-at-authorship? verification-coverage principle honored? Each = evidenced or refuted with file:line | Krystal MM stack as portfolio asset; RLTI novel-measurement-approaches category |
| `/asae` compliance: was the canonical loop applied during the project's own development? Are audit logs present in the repo? | Krystal standing protocol; brief explicit |
| Hook compliance vs `_grand_repo/.githooks/commit-msg` (current canonical version): every divergence from canonical noted with line numbers from each file | Krystal standing protocol; brief explicit |
| Verification-coverage ratio computed honestly: behaviors-VERIFIED / behaviors-CLAIMED with criticality-weighting; tautological / stub-asserting-stub / mocked-data-layer patterns DO NOT count as verified; ratio numerically stated with method | Brief explicit; RLTI novel-measurement-approaches category — verification-coverage IS a measurement |
| Banned-phrase scan completed: TQVCD §5.4 phrases hunted across all user-facing repo surfaces; every hit cited | Brief explicit; Krystal standing protocol |

### Section 7: MVP gap analysis (separate from issues list)

| Bar criterion | Why |
|---|---|
| Punchlist format, not prose | Brief explicit |
| Each gap has an effort estimate (S / M / L) | Brief explicit |
| Each gap is independent of the §4 issues table — represents what's missing, not what's broken | Brief explicit |
| Already-at-or-above MVP items called out as a "don't touch" list | Brief explicit |

### Section 8: Recommended remediation sequencing

| Bar criterion | Why |
|---|---|
| Dependency graph between fixes: each remediation item annotated with which other items it unblocks | Brief explicit; JD-3 fault-tolerant-system-design category — sequencing IS dependency analysis |
| Sequencing reflects effort × unblock-count (not severity alone) | RLTI cross-team-synthesis category |
| Critical-path remediation items identified separately from parallel-work items | Same |

### Section 9: Honest assessment vs senior-solo-dev-at-tech-startup bar

| Bar criterion | Why |
|---|---|
| Numeric verdict in §2 matches the strengths-vs-gaps tally in §9; any divergence between §2 score and §9 narrative is explained explicitly | Brief explicit (verdict honest); epistemic honesty |
| At least one strength called out explicitly (don't-touch list non-empty) | Brief explicit; balances hostile review with fair acknowledgment of craft |
| Severity-tag distribution in §4 (count of CRITICAL/HIGH/MEDIUM/LOW) honest per brief definitions and visible in the §9 reconciliation | Brief no-soften rule |

## 4. Cross-cutting bar criteria (apply to whole doc)

| Bar criterion | Why |
|---|---|
| Every claim file:line cited; zero exceptions | Brief explicit; Amendment 2 (tech-lead verifies cold) |
| Each section contains at least one substantive finding/claim; no section consists solely of rephrasing the section above it | Length-matches-work proxy (falsifiable replacement for "no padding") |
| At least one strength acknowledged in §9 (don't-touch list non-empty) | Hostile-but-fair principle |
| Pronoun discipline: Krystal she/her; Cody they/them | Krystal standing protocol |
| Methodology naming: ASAE = AI Self Audit Edit; D2R = Dare to Rise family; preserve discipline-specific terminology verbatim | Krystal standing protocol |
| No reproduction of canonical-skill mechanics — refer to the canonical skill by trigger string only | Krystal standing protocol per Amendment 6 |
| MM filename convention enforced (`Description_YYYY-MM-DD_vXX_suffix.md`) | Krystal standing protocol |
| Deprecation discipline: never delete; superseded versions move to `deprecated/` adjacent to the working file | Krystal standing protocol |
| Branding: Martinez Methods (NOT Stahl Systems) for any forward-going references in the doc; historical/pre-2026-04-16 references in cited files acceptable as historical context | Krystal standing protocol re rebrand |
| Latine preferred over Latinx if either appears | Krystal standing protocol |
| Discipline-specific terminology preserved verbatim ("white men," "supremacist," "colonial," "Latine") — not softened in paraphrase | Krystal standing protocol |
| Other threads' outputs treated as input not authority — surface conflicts, don't silently defer | Krystal standing protocol |
| TQVCD §5.4 banned phrases ("100% test coverage," "comprehensive test suite," "production-grade testing," "fully tested," "battle-tested") not claimed by the review doc about its own work or about the app without honest mutation-scope disclosure | Krystal standing protocol |
| Background-agent concurrency cap respected if any further subagent work spawned (parent-thread cap: 2 Opus / 4 Sonnet / 6 Haiku at a time; sequence rounds if more needed) | Krystal standing protocol |

## 5. Verification checklist for this artifact

For /asae auditors verifying this Phase B artifact:

1. **Source fidelity** — every paraphrased JD bullet in §1 corresponds to actual content on the cited greenhouse.io page (re-fetch each URL to verify; flag any item that misrepresents the JD's actual requirement category, even when paraphrased). Flag any unwarranted quotation marks.
2. **Brief fidelity** — every reference to brief content in §2/§3/§4 traces to the brief snapshot at `working/Phase_B_Brief_Snapshot_2026-04-29_v01_I.md`. Flag any reference that contradicts the snapshot or claims content not present in the snapshot.
3. **Mapping honesty** — every "Why" cell in §3 connects to a real JD requirement category from §1 or a real brief section/amendment from §2. Flag mappings that cite invented categories or unattributed sources.
4. **Bar honesty** — every "Bar criterion" entry is objectively verifiable by reading the future review doc. Flag criteria too vague to falsify (e.g., "be rigorous," "no waffling," "professional tone").
5. **Coverage** — every brief-mandated review-doc section (1–9) has bar criteria in §3. Flag any missing or merged sections.
6. **Cross-cutting completeness** — every standing protocol in the brief snapshot's "Krystal's standing protocols" section is captured in §4. Flag any standing protocol omitted.
7. **No banned content** — the artifact references the canonical /asae skill only by trigger string. No internal mechanics reproduced, summarized, paraphrased, or described. Flag any sentence that describes how /asae works internally (its structure, sub-parts, iteration condition, exit condition, anti-pattern callouts, log-filing convention, or any other mechanic).
