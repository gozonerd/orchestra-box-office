# Launch Day Execution — April 20, 2026

**Launch Time:** 10:00 AM EDT (adjust as needed)  
**Timezone:** All times in EDT unless specified  
**Owner:** @nerdykrystaljaz  
**Backup:** TBD  

---

## Pre-Launch: 4 AM (6 hours before)

### System Checks (15 min)
```bash
# Check API health
curl -s https://api.orchestraboxoffice.com/health | jq .

# Check database connectivity
# (Verify in Fly.io console dashboard)

# Check logs for errors
flyctl logs -a orchestra-box-office --level error

# Verify desktop release exists
gh release view v1.0.0 --json assets
```

**Expected:**
- ✅ API responds with `{"status":"ok","timestamp":"..."}` (200 OK)
- ✅ No error logs in past 1 hour
- ✅ Desktop artifacts: `*.msi`, `*.dmg`, `*.AppImage` present
- ✅ update.json exists in GitHub Release assets

### Team Notification (5 min)
```
TO: @team-all
FROM: @nerdykrystaljaz
SUBJECT: Launch Day — T-6 Hours

🚀 Orchestra Box Office v1.0.0 launch in 6 hours.

Status: ✅ All systems nominal
- API: healthy
- Database: connected
- Desktop builds: ready
- Monitoring: active

Team: Monitor dashboards, be ready for escalation.
On-call rotation: Confirm status.

T-minus 6 hours to lift-off.
```

### Monitoring Dashboards (10 min)
1. **Fly.io Dashboard:** Open https://fly.io/dashboard
   - Monitor: App health, machines, logs
   - Set auto-refresh: 5 seconds

2. **GitHub Actions:** Open https://github.com/nerdykrystal/orchestra-box-office/actions
   - Watch for any failed CI/CD runs
   - Verify release.yml completed successfully

3. **Desktop Analytics** (if configured)
   - Prepare to monitor installations in real-time

---

## Final Verification: 8 AM (2 hours before)

### Smoke Test — All Platforms (30 min)

**Windows:**
```powershell
# Download latest .msi
Invoke-WebRequest -Uri "https://github.com/nerdykrystal/orchestra-box-office/releases/download/v1.0.0/orchestraboxoffice_1.0.0_x64.msi" -OutFile "orchestra.msi"

# Install
msiexec /i orchestra.msi /quiet

# Launch and verify
Start-Process "C:\Program Files\Orchestra Box Office\orchestra.exe"

# Checklist:
# - Window opens within 3 seconds ✓
# - Login page displays ✓
# - Can navigate to Budgets page ✓
# - Sync status shows "Synced" ✓
```

**macOS:**
```bash
# Download latest .dmg
curl -L https://github.com/nerdykrystal/orchestra-box-office/releases/download/v1.0.0/orchestraboxoffice_1.0.0_aarch64.dmg -o orchestra.dmg

# Mount and install
hdiutil mount orchestra.dmg
cp -r /Volumes/Orchestra\ Box\ Office/Orchestra\ Box\ Office.app ~/Applications/

# Launch
open ~/Applications/Orchestra\ Box\ Office.app

# Checklist:
# - Window opens within 3 seconds ✓
# - No security warnings ✓
# - Can authenticate ✓
# - Cloud sync initializes ✓
```

**Linux:**
```bash
# Download latest .AppImage
wget https://github.com/nerdykrystal/orchestra-box-office/releases/download/v1.0.0/orchestraboxoffice_1.0.0_amd64.AppImage

# Make executable and run
chmod +x orchestraboxoffice_1.0.0_amd64.AppImage
./orchestraboxoffice_1.0.0_amd64.AppImage

# Checklist:
# - Window opens within 3 seconds ✓
# - AppImage mounts correctly ✓
# - Functional on Ubuntu/Fedora/Arch ✓
```

### API Smoke Test (15 min)
```bash
# Health check
curl -X GET https://api.orchestraboxoffice.com/health \
  -H "Content-Type: application/json"
# Expected: 200 OK

# Authentication flow
curl -X POST https://api.orchestraboxoffice.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.launch@orchestraboxoffice.com",
    "password": "TempLaunchTest2026!",
    "username": "launchtest"
  }'
# Expected: 201 Created, returns auth token

# Sync endpoint
curl -X POST https://api.orchestraboxoffice.com/v1/sync/batch \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"entries": []}'
# Expected: 200 OK, returns batch sync response
```

### Update Manifest Verification (5 min)
```bash
# Verify update.json exists in release
gh release view v1.0.0 --json assets | grep update.json

# Verify manifest format
curl https://github.com/nerdykrystal/orchestra-box-office/releases/download/v1.0.0/update.json | jq .

# Expected structure:
# {
#   "version": "1.0.0",
#   "notes": "...",
#   "pub_date": "2026-04-20T...",
#   "platforms": {
#     "windows-x86_64": { "signature": "...", "url": "..." },
#     "darwin-aarch64": { "signature": "...", "url": "..." },
#     "darwin-x86_64": { "signature": "...", "url": "..." },
#     "linux-x86_64": { "signature": "...", "url": "..." }
#   }
# }
```

### Sign-Off (5 min)
- [ ] Engineering Lead: All systems nominal, go/no-go confirmed
- [ ] Operations: Monitoring dashboards active, on-call ready
- [ ] Product: Marketing materials prepared, social media scheduled

**Status:** ✅ **CLEAR FOR LAUNCH**

---

## Launch: 10:00 AM EDT

### T-0: Go Live (5 min)

**Task 1: Announce on Social Media (2 min)**
```
TWITTER:
🚀 We're live! Orchestra Box Office v1.0.0 is now available.

Track AI pipeline ROI, manage budgets by business outcome, and sync across devices.

Download now: https://github.com/nerdykrystal/orchestra-box-office/releases/tag/v1.0.0

#AI #FinancialOps #Startups

LINKEDIN:
[Longer form announcement about the problem we're solving, why it matters]

DISCORD/SLACK:
@channel Launch day! Orchestra Box Office is now available for download. Here's what you need to know: [link to launch blog post]
```

**Task 2: Send Beta Tester Thank-You (2 min)**
```bash
# Send email from: launch@orchestraboxoffice.com
# To: [beta-tester-list]
# Subject: 🎉 Thank you! Orchestra Box Office is live

Dear [Name],

Thank you for helping us build Orchestra Box Office. Your feedback shaped v1.0.0.

The app is now available for everyone:
- Download: [GitHub Release link]
- Documentation: [docs link]
- Support: support@orchestraboxoffice.com

As a beta tester, you get:
- Early access to v1.1 features (next week)
- Direct line to our team for questions
- Special mention in our launch blog post

Onward!
— The Orchestra Team
```

**Task 3: Update Status Pages (1 min)**
- [ ] GitHub Release published
- [ ] www.orchestraboxoffice.com → landing page (set DNS if not done)
- [ ] Status page: Operational

### T+30 min: Early Metrics Check

```bash
# Check installation count
gh release view v1.0.0 --json assets | jq '.assets[].downloadCount'

# Expected: 10-50+ downloads

# Check API error rate
flyctl monitor -a orchestra-box-office

# Expected: <0.5% error rate

# Check for crash reports (if Sentry configured)
# Dashboard: [Sentry link]
```

### T+1 hour: Social Media Monitoring

- [ ] Retweet/share positive feedback
- [ ] Monitor support email for issues
- [ ] Log any user-reported bugs in issue tracker
- [ ] Flag critical issues to engineering immediately

### T+4 hours: Status Update

```
TO: @team-all
FROM: @nerdykrystaljaz
SUBJECT: Launch Status — T+4h

📊 Launch metrics:
- Downloads: [number]
- Active installations: [number]
- API error rate: [percentage]%
- Support tickets: [number]

✅ Status: On track
Issues: [none / list critical only]

Next checkpoint: T+24h
```

### T+24 hours: Post-Launch Review

```bash
# Generate metrics report
# - Total downloads
# - DAU (Daily Active Users)
# - API response time (p50, p95, p99)
# - Error rate
# - Support tickets resolved
# - Critical issues remaining

# Publish launch recap blog post
# Timeline: how the launch went
# Metrics: what we learned
# Roadmap: what's next

# Send thank-you message to community
```

---

## Contingency Procedures

### If API goes down (Critical)
```bash
# 1. Page on-call engineer immediately
# 2. Check Fly.io dashboard for app status
# 3. Review recent deployments/changes
# 4. If recent deploy, rollback:
flyctl releases rollback

# 5. Restart all machines if needed
flyctl scale count 3

# 6. Notify users via Twitter/Discord
# 7. Estimated recovery: <15 minutes

# Post-incident: Root cause analysis within 24h
```

### If desktop installer is corrupted
```bash
# 1. Remove corrupted release
gh release delete v1.0.0 --yes

# 2. Fix issue locally
# 3. Rebuild and tag v1.0.1-hotfix
# 4. Wait for CI/CD to complete
# 5. Create new release
# 6. Notify users: "v1.0.1 available with fixes"
```

### If sync is failing for users
```bash
# 1. Check database connectivity
flyctl postgres connect

# 2. Review audit_log table for error patterns
SELECT * FROM audit_log WHERE status = 'failed' ORDER BY timestamp DESC LIMIT 20;

# 3. If migration issue, review db_migrations.rs
# 4. If quota exceeded, scale database
# 5. Escalate to database team

# User communication: "We're aware of sync issues. ETA fix: [time]"
```

### If we need to rollback completely
```bash
# Desktop: Users stay on v0.9.9 (old version in release history)
# API: Rollback to last known good version
flyctl releases list
flyctl releases rollback --version [number]

# Estimated time: 15 minutes
# User impact: Desktop works offline, cloud features disabled
# Recovery: Publish v1.0.1-fixed within 4 hours
```

---

## Communication Templates

### Success Announcement
```
🎉 Launch successful! Orchestra Box Office v1.0.0 is now live.

✨ What's included:
- Offline-first desktop app
- Cloud sync across devices
- Real-time ROI tracking
- Budget management by business outcome

📥 Download: [GitHub link]
📖 Get started: [docs link]
💬 Questions? support@orchestraboxoffice.com
```

### Issue Acknowledgment
```
We're aware of [issue description] affecting some users. Our team is investigating.

Timeline:
- [Time] Issue reported
- [Time] Root cause identified
- [Time] Fix deployed / v1.0.1 released

Workaround: [if available]
Status page: [link]
```

### Apology/Thank You
```
We're grateful for the feedback and bug reports today. They help us improve.

For anyone affected by [issue], we've released v1.0.1 with the fix.
Download here: [link]

Thank you for your patience and support.
```

---

## Post-Launch Checklist (Next 7 Days)

- [ ] Day 1: 100+ installations
- [ ] Day 3: Publish launch recap blog post
- [ ] Day 5: Review and prioritize feature requests
- [ ] Day 7: Publish v1.0.1 (if critical fixes needed)
- [ ] Weekly: Team retrospective on launch process

---

## Emergency Contacts

| Role | Name | Phone | Email |
|------|------|-------|-------|
| On-Call (API) | TBD | TBD | TBD |
| On-Call (Desktop) | TBD | TBD | TBD |
| Product Lead | TBD | TBD | TBD |
| Infrastructure | TBD | TBD | TBD |

---

**Script Status:** READY FOR LAUNCH  
**Last Updated:** 2026-04-14  
**Confidence:** HIGH ✅
