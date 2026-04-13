# Orchestra Box Office

Hybrid application (desktop + cloud sync) for ROI tracking, cost-per-business-outcome analysis, license utilization, and board-ready financial reporting for AI pipelines. Built for non-developers.

## Stack

### Desktop (`/desktop`)
- **Framework:** Tauri 2 + Rust
- **Frontend:** React 19 + TypeScript
- **UI:** Tailwind CSS 4 + Tremor 3.x
- **Database:** SQLite (SQLCipher AES-256 encrypted)
- **Testing:** Vitest + Playwright + tauri-driver

### Cloud API (`/api`)
- **Framework:** Rust/Axum
- **Database:** PostgreSQL (Neon serverless)
- **Deployment:** Fly.io (blue-green)
- **Testing:** cargo test + HTTP client tests

### Shared (`/shared`)
- **Rust Library:** Financial arithmetic, data types, validation
- **Used by:** Desktop + API

## Monorepo Structure

```
orchestra-box-office/
  Cargo.toml              # Workspace root
  Cargo.lock              # Locked dependencies
  package.json            # Root npm config (for tooling)
  .github/workflows/      # CI/CD (desktop + cloud tracks)
  
  api/                    # Axum backend (Fly.io deploy)
    Cargo.toml
    src/
    
  desktop/                # Tauri desktop app
    Cargo.toml            # Tauri config
    package.json          # Node dependencies
    src/                  # React frontend
    src-tauri/            # Rust backend
    
  shared/                 # Shared Rust library
    Cargo.toml
    src/
```

## Development

```bash
# Install dependencies
npm install
cargo fetch

# Run desktop dev server (Tauri + Vite hot reload)
npm run tauri:dev

# Run cloud API dev server
cd api && cargo run --all-features

# Run all tests
npm run test:all

# Lint all
npm run lint:all

# Format all
npm run format:all
```

## CI/CD

- **Desktop:** `cargo test` → `cargo clippy` → `npm test` → `tauri build` → sign → publish manifest
- **Cloud API:** `cargo test` → build container → deploy Fly.io → DAST scan
- **Shared:** Semgrep SAST, `cargo audit`, `npm audit`, Gitleaks

## Enterprise Standards

- **ISO/IEC 25010:** Functional correctness (financial figures exact to 10^-8)
- **OWASP Desktop Top 10:** DT1, DT2, DT4, DT6, DT9
- **OWASP Web Top 10:** A01, A02, A03
- **NIST SSDF:** Threat model, dependency scanning, artifact provenance
- **SOC 2:** Audit logging (all mutations), access control, encryption at rest + transit
- **CWE Top 25:** CWE-89, CWE-79, CWE-287, CWE-862, CWE-312

## Financial Data Integrity

- **Arithmetic:** `rust_decimal` (Rust) + `decimal.js` (JS) — zero floating point
- **Rounding:** Banker's rounding (round-half-to-even)
- **Sync conflicts:** Never auto-merge; preserve both versions, prompt user with diff
- **Integrations:** Read-only (QuickBooks Online, Xero, Plaid)

## License

MIT
