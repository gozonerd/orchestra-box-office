# Fly.io Deployment — Production Setup

**Target:** Deploy Orchestra Box Office API to production on Fly.io  
**Timeline:** 2026-04-15 (Day 1) — Complete by 5 PM EDT  
**Prerequisites:** Fly CLI installed, authenticated, `orchestra-box-office` app created

---

## Step 1: Set Environment Secrets (15 min)

Fly.io requires sensitive configuration as secrets, not in code.

### 1.1 Set DATABASE_URL

First, provision a PostgreSQL database. Use one of:

**Option A: Neon (Recommended)**
```bash
# Create account at https://neon.tech (free tier available)
# Create project → get connection string

# Connection string format:
# postgresql://[user]:[password]@[host]/[database]

flyctl secrets set DATABASE_URL="postgresql://user:password@host.neon.tech/dbname"
```

**Option B: Fly.io Postgres (Built-in)**
```bash
# Create Postgres cluster attached to app
flyctl postgres create --org personal

# This will output the DATABASE_URL — copy it
flyctl secrets set DATABASE_URL="postgresql://..."
```

**Option C: Self-Managed (Advanced)**
```bash
# If using external Postgres instance:
flyctl secrets set DATABASE_URL="postgresql://user:password@external-db.example.com/orchestraboxoffice"
```

**Verify:**
```bash
flyctl secrets list | grep DATABASE_URL
# Should show: DATABASE_URL (secret)
```

### 1.2 Set Logging Configuration

```bash
flyctl secrets set RUST_LOG="orchestra_box_office_api=debug,sqlx=warn"
```

**Log Levels:**
- `debug` — Detailed request/response logging (development)
- `info` — Key lifecycle events (production)
- `warn` — Warnings and errors only (minimal)

**Verify:**
```bash
flyctl secrets list | grep RUST_LOG
```

### 1.3 Optional: Error Tracking (Sentry)

If using Sentry for error tracking (highly recommended for production):

```bash
# Create account at https://sentry.io
# Create project for Rust/Axum
# Get DSN from project settings

flyctl secrets set SENTRY_DSN="https://key@sentry.io/project-id"
```

---

## Step 2: Create/Update Fly.io App Configuration (5 min)

Verify `fly.toml` is correctly configured:

```toml
app = "orchestra-box-office"
primary_region = "ewr"

[build]
  dockerfile = "api/Dockerfile"

[[services]]
  internal_port = 8080
  
  [services.http_checks]
    enabled = true
    grace_period = "5s"
    interval = "30s"
    min_timeout = "10s"
    path = "/health"
    timeout = "10s"
  
  [[services.ports]]
    port = 80
    handlers = ["http"]
    force_https = true
  
  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]

[processes]
  app = "orchestra-box-office-api"
```

**Check current config:**
```bash
flyctl config show
```

**If fly.toml doesn't exist, create it:**
```bash
flyctl launch --no-deploy
# Follow prompts, choose:
# - Region: ewr (Eastern US) [or closest to you]
# - PostgreSQL: yes/no [based on Step 1.2]
```

---

## Step 3: Build and Deploy to Staging (30 min)

Before going to production, test in staging.

### 3.1 Deploy to Staging

```bash
# Build and deploy (includes building Docker image)
flyctl deploy --detach

# Monitor deployment
flyctl logs -a orchestra-box-office
```

**Expected output:**
```
2026-04-15T13:45:23.123Z app[abc123] [info] Starting Orchestra Box Office API v1.0.0
2026-04-15T13:45:25.456Z app[abc123] [info] Database connected: postgresql://...
2026-04-15T13:45:26.789Z app[abc123] [info] Server listening on 0.0.0.0:8080
2026-04-15T13:45:27.012Z [health check] GET /health 200 OK
```

### 3.2 Test Staging Deployment

```bash
# Get app URL
APP_URL=$(flyctl info -j | jq -r '.appInfo.domain')

# Health check
curl -X GET https://$APP_URL/health -v

# Expected: 200 OK
# {
#   "status": "ok",
#   "timestamp": "2026-04-15T13:45:30Z",
#   "version": "1.0.0"
# }
```

### 3.3 Test Database Connection

```bash
# Check logs for database connection success
flyctl logs -a orchestra-box-office | grep -i database

# Expected: "Database connected" or "Migrations completed"
```

### 3.4 Test Authentication Endpoint

```bash
curl -X POST https://$APP_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@staging.local",
    "password": "StagingTest2026!",
    "username": "staging_user"
  }' -v

# Expected: 201 Created with auth token
```

### 3.5 Monitor Resources

```bash
# Check CPU/Memory usage
flyctl status

# Check machine details
flyctl machines list

# Expected: 
# - CPU: <50% under idle
# - Memory: <400MB under idle
# - Machine: running (no errors)
```

---

## Step 4: Production Deployment (20 min)

Once staging is verified, deploy to production.

### 4.1 Final Pre-Production Checks

```bash
# Verify no uncommitted changes
git status
# Should show: "nothing to commit, working tree clean"

# Verify v1.0.0 tag exists
git tag | grep v1.0.0

# Verify release assets exist
gh release view v1.0.0 --json assets
```

### 4.2 Deploy to Production

```bash
# Set production region (optional, if different from staging)
flyctl config set primary_region iad  # or your preferred region

# Deploy
flyctl deploy

# Monitor deployment logs
flyctl logs -a orchestra-box-office
```

**Deployment takes 2-5 minutes.** Watch for:
- ✅ Docker image built successfully
- ✅ New machines deployed
- ✅ Health checks passing
- ✅ No error messages in logs

### 4.3 Verify Production Endpoint

```bash
# Get production domain
flyctl info -a orchestra-box-office

# Test health endpoint
curl -X GET https://api.orchestraboxoffice.com/health

# Expected: 200 OK
# {
#   "status": "ok",
#   "timestamp": "...",
#   "version": "1.0.0"
# }
```

### 4.4 Monitor Production Metrics

```bash
# Real-time metrics
flyctl monitor -a orchestra-box-office

# Watch for 5 minutes:
# - Response time
# - Request count
# - Error rate
# - CPU/Memory usage

# Expected:
# - Response time: <500ms (p95)
# - Error rate: 0% (first few requests)
# - CPU: <30%
# - Memory: <400MB
```

---

## Step 5: DNS Configuration (5 min)

Configure domain to point to Fly.io.

### 5.1 Get Fly.io IP/CNAME

```bash
# Option 1: IP address (for A records)
flyctl ips list

# Option 2: CNAME (simpler)
flyctl info -j | jq '.appInfo.domain'
# Returns: orchestra-box-office.fly.dev
```

### 5.2 Update DNS

In your DNS provider (Vercel, Route53, Cloudflare, etc.):

**For `api.orchestraboxoffice.com`:**
- Type: `CNAME`
- Value: `orchestra-box-office.fly.dev`
- TTL: 300 (5 minutes for testing, 3600 for production)

**Alternative (if using A record):**
- Type: `A`
- Value: `[IP from flyctl ips list]`
- TTL: 3600

### 5.3 Verify DNS Propagation

```bash
# Check DNS resolution
nslookup api.orchestraboxoffice.com
# Should resolve to Fly.io IP

# Test HTTPS connection
curl -v https://api.orchestraboxoffice.com/health

# Expected: 
# - 200 OK
# - TLS 1.3 connection
# - Valid certificate (auto-renewed by Fly.io)
```

---

## Step 6: Auto-Scaling Configuration (10 min)

Ensure API can handle launch traffic spikes.

### 6.1 Set Auto-Scaling Rules

```bash
# Scale from 2 to 5 machines based on CPU
flyctl autoscale set --min 2 --max 5

# View current config
flyctl autoscale show
```

### 6.2 Configure Resource Limits

```bash
# Set per-machine resource limits (if needed)
# Default: 256MB RAM, 0.5 CPU shares (sufficient for launch)

# To increase:
flyctl machines update [machine-id] \
  --memory 512 \
  --cpu-kind shared
```

---

## Step 7: Monitoring & Alerts (10 min)

Set up production monitoring.

### 7.1 Enable Error Notifications

If using Sentry (already configured via SENTRY_DSN):
```
- Sentry will automatically capture errors
- Configure alerts in Sentry dashboard
- Alert when error rate > 5%
```

### 7.2 Fly.io Built-in Monitoring

```bash
# View Fly.io dashboard
# https://fly.io/dashboard → orchestra-box-office

# Configure Slack notifications (optional)
# https://fly.io/docs/reference/slackapp/
```

### 7.3 Custom Health Dashboard

```bash
# Create a monitoring script to run periodically
cat > /tmp/health_check.sh << 'EOF'
#!/bin/bash
API_URL="https://api.orchestraboxoffice.com"

# Check health
HEALTH=$(curl -s $API_URL/health | jq '.status')
if [ "$HEALTH" != '"ok"' ]; then
  echo "⚠️ API health check failed: $HEALTH"
  # Send alert via Slack/PagerDuty
fi

# Check response time
RESPONSE_TIME=$(curl -s -w '%{time_total}' -o /dev/null $API_URL/health)
echo "API response time: ${RESPONSE_TIME}s"

# Log metrics
echo "$(date): health=$HEALTH, response_time=$RESPONSE_TIME" >> /var/log/api-health.log
EOF

chmod +x /tmp/health_check.sh

# Run every 5 minutes (using cron or your monitoring system)
# */5 * * * * /tmp/health_check.sh
```

---

## Step 8: Backup & Disaster Recovery (5 min)

Ensure database is backed up.

### 8.1 Enable Automated Backups

**If using Neon:**
```bash
# Backups are automatic (14-day retention)
# Verify in Neon dashboard → project → backups
```

**If using Fly Postgres:**
```bash
# Backups configured automatically
# Verify: flyctl postgres detach  # Shows backup info
```

### 8.2 Test Restore Procedure (Optional but Recommended)

```bash
# Document restore steps:
# 1. Stop application
# 2. Restore database from backup
# 3. Run migrations
# 4. Restart application

# For Neon: https://neon.tech/docs/manage/database-restore
# For Fly: https://fly.io/docs/postgres/managing-postgres/
```

---

## Post-Deployment Checklist

- [ ] All secrets set correctly (`flyctl secrets list`)
- [ ] Staging deployment successful and tested
- [ ] Production deployment successful
- [ ] Health checks passing (monitor for 5 min)
- [ ] DNS configured and resolving
- [ ] HTTPS working with valid certificate
- [ ] Error rate < 0.5% after 1 hour
- [ ] Response time p95 < 500ms
- [ ] Auto-scaling configured
- [ ] Monitoring/alerts active
- [ ] Backups enabled

---

## Rollback Procedure (If Needed)

```bash
# View deployment history
flyctl releases

# Rollback to previous version
flyctl releases rollback

# Or rollback to specific version
flyctl releases rollback --version 3
```

**Expected downtime:** 2-5 minutes  
**Data loss risk:** None (database unchanged)

---

## Common Issues & Solutions

### Issue: "Database connection timeout"
```
Cause: DATABASE_URL incorrect or database offline
Fix: 
1. Verify DATABASE_URL: flyctl secrets list
2. Check database is running
3. Re-deploy: flyctl deploy
```

### Issue: "Health check failing"
```
Cause: App hasn't started or /health endpoint error
Fix:
1. Check logs: flyctl logs -a orchestra-box-office
2. Verify RUST_LOG is set
3. Wait 10 seconds, health check has grace period
```

### Issue: "TLS certificate error"
```
Cause: DNS not propagated or DNS misconfigured
Fix:
1. Verify DNS record: nslookup api.orchestraboxoffice.com
2. Wait for TTL to expire (up to 1 hour)
3. Force refresh: Clear browser cache, try curl
```

### Issue: "High memory/CPU usage"
```
Cause: Traffic spike or memory leak
Fix:
1. Scale up: flyctl scale count 5
2. Check logs for errors
3. Monitor metrics: flyctl monitor
```

---

## Success Criteria

- ✅ API responding to health checks
- ✅ Database connected and queryable
- ✅ Authentication endpoints working
- ✅ Sync endpoints accepting requests
- ✅ Error rate < 0.5%
- ✅ Response time p95 < 500ms
- ✅ Auto-scaling configured
- ✅ Monitoring active

---

**Deployment Status:** READY  
**Estimated Duration:** 90 minutes total  
**Difficulty:** Medium (following this checklist)  
**Support:** [documentation link]
