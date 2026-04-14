# Deployment Guide

Orchestra Box Office uses a dual-deployment strategy:
- **Desktop** — Built via Tauri, signed, auto-updates via GitHub Releases
- **Cloud API** — Containerized on Fly.io with blue-green deployments

## Prerequisites

- Rust 1.75+
- Node.js 18+
- Docker (for local testing)
- Fly CLI (for cloud deployments)
- GitHub CLI (for releases)

## Desktop Deployment

### Local Development

```bash
npm install --workspace=desktop
npm run tauri:dev
```

### Building for Release

```bash
cd desktop
npm run tauri:build
```

Outputs:
- Windows: `src-tauri/target/release/bundle/msi/*.msi`
- macOS: `src-tauri/target/release/bundle/dmg/*.dmg`
- Linux: `src-tauri/target/release/bundle/AppImage/*.AppImage`

### Code Signing (macOS)

```bash
export APPLE_CERTIFICATE_PATH=/path/to/certificate.p8
export APPLE_CERTIFICATE_PASSWORD=password
export APPLE_SIGNING_IDENTITY="Developer ID Application (Company Name)"

npm run tauri:build
```

### Creating a Release

1. Tag version:
   ```bash
   git tag -a v1.0.0 -m "Release 1.0.0"
   git push origin v1.0.0
   ```

2. GitHub Actions will:
   - Build for all platforms
   - Create GitHub Release
   - Attach signed binaries
   - Update `update.json` manifest for auto-updates

3. Users will receive update notification within 24 hours

## Cloud API Deployment

### Local Testing

```bash
# Start PostgreSQL
docker run -d --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 postgres:14

# Run migrations
sqlx database create
sqlx migrate run

# Start API
cargo run -p orchestra-box-office-api
```

### Fly.io Deployment

1. **Initialize app** (first time only):
   ```bash
   flyctl apps create orchestra-box-office
   flyctl secrets set DATABASE_URL="postgresql://..."
   flyctl secrets set RUST_LOG="orchestra_box_office_api=debug"
   ```

2. **Deploy**:
   ```bash
   flyctl deploy
   ```

3. **Monitor**:
   ```bash
   flyctl logs
   flyctl status
   ```

### Database Migrations

Migrations run automatically at startup via `db_migrations.rs`.

To rollback:
```sql
-- Manually drop tables (only in non-production)
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS conflicts CASCADE;
DROP TABLE IF EXISTS sync_queue CASCADE;
DROP TABLE IF EXISTS entities CASCADE;
DROP TABLE IF EXISTS auth_tokens CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

## Continuous Deployment

GitHub Actions runs on every push:

1. **Desktop CI** (`desktop-ci.yml`)
   - Runs tests, clippy, ESLint
   - Builds for all platforms (Linux, macOS, Windows)
   - Uploads artifacts

2. **API CI/CD** (`api-ci-cd.yml`)
   - Runs Rust tests, clippy
   - Builds Docker image
   - Deploys to Fly.io (on master only)
   - Runs OWASP ZAP DAST scan post-deploy

3. **Release** (`release.yml`)
   - Triggered by `v*` tags
   - Builds signed desktop binaries
   - Creates GitHub Release
   - Deploys API with version tag

## Health Checks

### Desktop App

- Launch check: Verify window opens within 5 seconds
- Database check: Verify SQLite connection on startup
- Tauri command check: Call `ping` command, verify response

```bash
# Manual health check
npm run tauri:dev &
sleep 5
curl -X POST http://localhost:1420/api/ping
```

### Cloud API

Automatic health checks on Fly.io:

```
GET /health
Expected: 200 OK {"status":"ok","timestamp":"2026-04-14T..."}
Interval: 30 seconds
Timeout: 10 seconds
Grace period: 5 seconds
```

Manual check:
```bash
curl https://api.orchestraboxoffice.com/health
```

## Rollback Strategy

### Desktop

1. GitHub Releases tab shows version history
2. Users can install older versions manually
3. Auto-update checks latest release — old versions won't be offered
4. To rollback a release: Delete tag, create new patch release

```bash
git tag -d v1.0.0
git push origin :refs/tags/v1.0.0
git tag -a v1.0.1 -m "Rollback fix"
git push origin v1.0.1
```

### Cloud API

Fly.io machines automatically rollback on deploy failure:

```bash
# View deployment history
flyctl releases

# Rollback to previous version
flyctl releases rollback

# Manually target version
flyctl releases rollback --version 5
```

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Desktop startup | <3s | TBD |
| Dashboard load | <1s | TBD |
| Sync batch (100 entries) | <2s | TBD |
| API response (p95) | <500ms | TBD |
| Database query (p95) | <100ms | TBD |

Monitor with:
```bash
# Check API latency
flyctl monitor
```

## Security Checks Pre-Deployment

```bash
# Scan for secrets
gitleaks detect --verbose

# Scan for vulnerabilities
cargo audit
npm audit

# Run SAST
semgrep --config=p/owasp-top-ten

# Check code signing
# (Automated in CI)
```

## Monitoring & Logging

### Desktop
- Logs in `~/.config/Orchestra Box Office/logs/`
- Errors automatically reported (opt-in telemetry)
- Check update frequency via `update.json`

### Cloud API
```bash
# View logs
flyctl logs -a orchestra-box-office

# Filter by level
flyctl logs -a orchestra-box-office --level=error
```

### Metrics
- API response time (Fly.io dashboard)
- Database query performance (PostgreSQL)
- Error rates (Sentry integration — planned)
- Sync success rate (audit_log table)

## Disaster Recovery

### Data Backup
- PostgreSQL automated daily backups (Neon)
- 30-day retention, point-in-time recovery
- Test restore monthly

### Desktop Data
- SQLite database backed up in app data folder
- Users can export data (CSV format — planned)
- Manual recovery instructions in docs

## Release Checklist

Before tagging a release:

- [ ] All CI checks pass
- [ ] Tests pass (100% critical paths)
- [ ] DAST scan shows no high/critical issues
- [ ] Security checklist clear
- [ ] CHANGELOG updated
- [ ] Database migrations tested locally
- [ ] Desktop builds signed and tested on all platforms
- [ ] API deployed to staging, smoke tested
- [ ] Rollback procedure tested
- [ ] Team notified of release time

## Post-Deployment Verification

1. Desktop:
   - Launch on clean machine
   - Verify auto-update works
   - Spot-check critical features

2. Cloud API:
   - `GET /health` returns 200
   - Authentication works
   - Sync roundtrip succeeds
   - Conflict flow works

3. Integration:
   - Desktop can authenticate with API
   - Sync data flows correctly
   - Conflicts appear and resolve

## Support & Debugging

For deployment issues:

1. Check GitHub Actions logs
2. View Fly.io deployment logs
3. Check firewall/DNS settings
4. Verify environment variables
5. Test connectivity to external services

Contact: deployment@orchestraboxoffice.com
