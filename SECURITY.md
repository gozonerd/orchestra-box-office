# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Orchestra Box Office, please **do not** open a public GitHub issue. Instead, please follow this process:

1. **Email:** security@orchestraboxoffice.com
2. **Include:** Description, steps to reproduce, potential impact, and affected version(s)
3. **Expect:** Response within 48 hours with next steps

We will:
- Acknowledge receipt within 48 hours
- Confirm the vulnerability within 7 days
- Provide a fix timeline
- Keep you updated on progress
- Credit you (unless you prefer anonymity)

## Security Standards

Orchestra Box Office implements the following standards:

### OWASP Top 10 (2023)
- **A01 Broken Access Control** — Role-based access, OAuth 2.0 for cloud API
- **A02 Cryptographic Failures** — TLS 1.3, AES-256 at rest, HMAC-SHA256 for payloads
- **A03 Injection** — Parameterized queries, input validation, no SQL string concatenation
- **A04 Insecure Design** — Threat modeling, security-first architecture
- **A05 Security Misconfiguration** — Minimal Docker image, least privilege, CI/CD scanning
- **A06 Vulnerable & Outdated Components** — `cargo audit`, `npm audit`, dependency pinning
- **A07 Authentication Failures** — Bcrypt password hashing, token expiry, session management
- **A08 SSRF/XXE** — No external entity expansion, URL validation for remote fetches
- **A09 Broken Access Control** — Desktop encryption at rest, cloud API auth headers
- **A10 SSRF** — No unsanitized URL redirects

### OWASP Desktop Top 10
- **DT1 Improperly Configured JSON Web Tokens** — Signed tokens with expiry
- **DT2 Sensitive Data Exposure** — Encryption at rest and in transit
- **DT4 Unencrypted Sensitive Data** — SQLCipher AES-256 for local database
- **DT6 Weak Input Validation** — Type-safe Rust, schema validation
- **DT9 Insecure Direct Object References** — Owner verification on all entities

### NIST SSDF
- **PO1.1 Threat Modeling** — Pre-implementation security review
- **PO2.1 Supply Chain Risk Assessment** — Dependency scanning in CI
- **PO3.1 Secure Development** — Code review, linting, type safety
- **PO4.1 Artifact Integrity** — Code signing, signed releases

### CWE Top 25
- **CWE-89 SQL Injection** → Parameterized queries only
- **CWE-79 Cross-Site Scripting** → React escaping, CSP headers
- **CWE-287 Improper Authentication** → BCrypt + expiring tokens
- **CWE-862 Missing Authorization** → Owner checks on all operations
- **CWE-312 Cleartext Storage of Sensitive Data** → Encryption at rest

## Deployment Security

### Desktop
- SQLCipher AES-256 encryption at rest
- Tauri secure IPC with message signing
- OS keychain integration for encryption keys
- Auto-update verification with code signing
- Sandboxed file access

### Cloud API
- TLS 1.3 for all transport
- PostgreSQL encryption at rest (Neon)
- JWT bearer tokens with 7-day expiry
- Rate limiting per client_id
- Audit logging for all mutations
- Blue-green deployment for zero-downtime updates

## Testing & Scanning

All code undergoes automated security scanning:

| Tool | Purpose | Gate |
|------|---------|------|
| `cargo audit` | Rust vulnerability database | Fail on high/critical |
| `npm audit` | JavaScript vulnerability database | Fail on moderate/high |
| `clippy` | Rust security lints | Part of build |
| `semgrep` | Static analysis (OWASP rules) | Fail on high/critical |
| `gitleaks` | Secret detection | Fail on matches |
| `OWASP ZAP` | Dynamic security testing | Post-deploy scan |

## Encryption

### At Rest
- **Desktop Database** — SQLCipher AES-256
- **Cloud Database** — PostgreSQL encryption (Neon)
- **Backup Archives** — AES-256 (future)

### In Transit
- **TLS** — 1.3 minimum, AEAD ciphers only
- **Payload Signing** — HMAC-SHA256 for integrity verification

### Key Management
- **Desktop** — OS keychain (Tauri keyring plugin)
- **Cloud** — Environment variables (Fly.io secrets), never in code

## Data Retention

- **Sync Queue Entries** — Deleted after 90 days (or user request)
- **Conflict Resolutions** — Audit trail kept for 2 years
- **Error Logs** — Truncated after 30 days (no PII)
- **User Tokens** — Expire after 7 days; revoked on logout

## Incident Response

In the event of a security incident:

1. **Detection** → Automated monitoring alerts
2. **Triage** → Severity assessment within 1 hour
3. **Containment** → Isolate affected systems immediately
4. **Eradication** → Fix root cause, patch, re-deploy
5. **Recovery** → Verify stability, audit logs
6. **Notification** → Affected users within 24 hours

## Compliance

- **SOC 2 Type II** — Planned certification
- **ISO/IEC 27001** — Information Security Management
- **GDPR** — Data processing agreements, right to deletion
- **CCPA** — California Consumer Privacy Act compliance

## Security Headers

All API responses include:
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'
```

## Contributors

Security is everyone's responsibility. If you're contributing code:
- Use type-safe Rust for server code
- Validate all user input
- Never log sensitive data (tokens, passwords, PII)
- Request security review for auth/encryption changes
- Follow OWASP guidelines

## Version Security Status

| Version | Status | Until |
|---------|--------|-------|
| 1.0.0 | Supported | 2027-04-13 |
| 0.x.x | EOL | 2026-04-13 |
