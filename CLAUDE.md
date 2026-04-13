# Orchestra Box Office

**Owner:** Krystal Martinez / Stahl Systems  
**Type:** Git repository (public)  
**Purpose:** Hybrid desktop + cloud application for AI pipeline ROI tracking, cost-per-business-outcome analysis, license utilization, and board-ready financial reporting. Built for non-developers.

## Proof of Concept Objective

Demonstrates that Claude Code Engineered can build the hardest deployment pattern:
- Offline-first desktop with cloud sync
- Dual CI/CD pipelines (desktop builds + cloud deploys)
- Financial data integrity (zero floating point, exact calculations)
- Enterprise standards compliance (ISO/IEC 25010, OWASP Desktop Top 10, SOC 2, NIST SSDF)

## Tech Stack

### Desktop (`/desktop`)
- **Framework:** Tauri 2 + Rust backend
- **Frontend:** React 19 + TypeScript
- **Database:** SQLite (SQLCipher AES-256 encrypted)
- **UI:** Tailwind CSS 4 + Tremor 3.x (dashboards)
- **Testing:** Vitest + Playwright + tauri-driver
- **Export:** @react-pdf/renderer 4.x (PDF), docx 9.x (DOCX)

### Cloud API (`/api`)
- **Framework:** Rust/Axum
- **Database:** PostgreSQL (Neon serverless)
- **Deployment:** Fly.io (blue-green)
- **Sync:** PowerSync (SQLite-to-PostgreSQL, custom conflict handlers)
- **Testing:** cargo test + HTTP client tests

### Shared (`/shared`)
- **Rust Library:** Financial arithmetic (`rust_decimal`), data types, validation
- **Used by:** Desktop + API

## Monorepo Structure

```
orchestra-box-office/
  Cargo.toml              # Workspace root
  Cargo.lock              # Locked dependencies
  package.json            # Root npm config
  CLAUDE.md               # This file
  
  .github/workflows/      # CI/CD (two parallel tracks)
  
  api/                    # Axum backend (Fly.io)
    Cargo.toml
    src/
      main.rs
      routes/
      db/
      integrations/
      middleware/
    
  desktop/                # Tauri desktop app
    Cargo.toml
    package.json
    src/                  # React frontend (Vite)
    src-tauri/            # Rust backend (Tauri commands)
    
  shared/                 # Shared Rust library
    Cargo.toml
    src/
      lib.rs
      finance/            # rust_decimal arithmetic
      models/             # PipelineRun, Budget, Report, etc.
      validation/
```

## Enterprise Standards

- **ISO/IEC 25010:** Functional correctness, security, reliability
- **OWASP Desktop Top 10:** DT1 (injection), DT2 (auth), DT4 (data storage), DT6 (input validation), DT9 (updates)
- **OWASP Web Top 10:** A01 (access control), A02 (crypto), A03 (injection)
- **NIST SSDF:** Threat modeling, dependency scanning, artifact provenance
- **SOC 2:** Audit logging (all mutations), access control, encryption at rest + transit
- **CWE Top 25:** CWE-89, CWE-79, CWE-287, CWE-862, CWE-312

## Financial Data Integrity

- **Arithmetic:** `rust_decimal` (Rust) + `decimal.js` (JS) — zero floating point
- **Rounding:** Banker's rounding (round-half-to-even)
- **Checked operations:** Overflow detection, explicit error handling
- **Sync conflicts:** Never auto-merge financial data; preserve both versions, prompt user with diff
- **Integrations:** Read-only (QuickBooks Online, Xero, Plaid)

## CI/CD

Two parallel GitHub Actions tracks:

**Desktop Track:**
- `cargo test` → `cargo clippy` → `npm test` → `tauri build` (Windows/macOS/Linux) → code-sign → publish update manifest

**Cloud API Track:**
- `cargo test` → build Docker container → deploy Fly.io (blue-green) → DAST scan

**Shared:**
- Semgrep SAST scan
- `cargo audit`
- `npm audit`
- Gitleaks (secret detection)

## Testing Standards

Built at every stage, never after:

| Category | Tool | Target | Gate |
|----------|------|--------|------|
| Rust unit | cargo test | 100% line, 100% branch (min: 80/70) | Every stage |
| JS unit | Vitest | 100% line, 100% branch (min: 80/70) | Every stage |
| E2E desktop | tauri-driver | Install, launch, offline mode | Desktop milestones |
| E2E web | Playwright | Core dashboard flows (<3min suite) | Every UI stage |
| Accessibility | axe-core + Playwright | WCAG 2.1 AA, zero violations | Every UI stage |
| Security SAST | Semgrep | Zero high/critical | Every PR |
| Security DAST | OWASP ZAP | Zero high/critical | Pre-deploy |
| Financial accuracy | Reference value suite | 100% match, zero float | Every calculations stage |

## Development

```bash
# Install all dependencies
npm install
cargo fetch

# Desktop development (Tauri + Vite)
npm run tauri:dev

# Cloud API development
cd api && cargo run --all-features

# Run all tests
npm run test:all

# Lint all
npm run lint:all

# Format all
npm run format:all
```

## Security & Encryption

- **Local:** SQLCipher AES-256 (database at rest)
- **Transit:** TLS 1.3 + HMAC-signed payloads
- **Cloud:** PostgreSQL encryption at rest
- **Keys:** OS keychain via Tauri keyring plugin

## Integrations (MVP)

All read-only:

- **QuickBooks Online** — OAuth 2.0, categorized expenses, invoices
- **Xero** — OAuth 2.0, categorized expenses, invoices
- **Plaid** — OAuth Link flow, raw bank transactions (ground truth)

## File Naming

Follow Stahl Systems convention:

```
[PREFIX_][Description]_YYYY-MM-DD_vXX_[suffix].[ext]
```

No file versioning needed in git-tracked code files (git history is the version record).

## License

MIT
