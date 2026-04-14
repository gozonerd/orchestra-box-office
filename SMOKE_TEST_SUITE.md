# Orchestra Box Office — Smoke Test Suite
**Purpose:** Verify all critical paths work before launch  
**Audience:** QA, DevOps, Product  
**Timeline:** Execute 48 hours before launch (2026-04-18)

---

## Pre-Test Checklist

- [ ] All team members notified
- [ ] Fly.io staging environment ready with database
- [ ] API deployed to staging (v1.0.0)
- [ ] Desktop installers downloaded (Windows, macOS, Linux)
- [ ] Test account credentials prepared
- [ ] Monitoring dashboards open (Fly.io, logs, error tracking)

---

## Test Suite Structure

| Category | Tests | Pass Rate Goal |
|----------|-------|-----------------|
| **API Functionality** | 8 | 100% |
| **Authentication** | 5 | 100% |
| **Cloud Sync** | 6 | 100% |
| **Desktop Integration** | 4 | 100% |
| **Data Integrity** | 3 | 100% |
| **Error Handling** | 4 | 100% |
| **Performance** | 4 | 100% |
| **TOTAL** | **34 tests** | **100%** |

---

## Test 1: API Health Check

**Objective:** Verify API is running and responsive  
**Command:**
```bash
curl -X GET https://api.staging.orchestraboxoffice.com/health \
  -H "Content-Type: application/json" \
  -v
```

**Expected Response:**
```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "ok",
  "timestamp": "2026-04-18T14:30:00Z",
  "version": "1.0.0"
}
```

**Pass Criteria:**
- ✅ Status code: 200
- ✅ response.status == "ok"
- ✅ Response time < 100ms
- ✅ Content-Type is JSON

---

## Test 2: Database Connectivity

**Objective:** Verify database is accessible from API  
**Verification:** Check logs for database connection message

```bash
flyctl logs -a orchestra-box-office-staging | grep -i database | head -5
```

**Expected Output:**
```
[info] Database connected to postgresql://...
[info] Running migrations...
[info] Migrations completed successfully
```

**Pass Criteria:**
- ✅ "Database connected" in logs
- ✅ Migrations completed without errors
- ✅ No connection timeout messages

---

## Test 3: User Registration

**Objective:** Verify authentication system works  
**Command:**
```bash
curl -X POST https://api.staging.orchestraboxoffice.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "smoke-test-001@staging.local",
    "password": "SmokeTest2026!@#",
    "username": "smoke_test_001"
  }' \
  -v
```

**Expected Response:**
```
HTTP/1.1 201 Created
Content-Type: application/json

{
  "user_id": "uuid-...",
  "email": "smoke-test-001@staging.local",
  "token": "eyJ...",
  "token_expires_at": "2026-04-25T14:30:00Z"
}
```

**Pass Criteria:**
- ✅ Status code: 201
- ✅ response.user_id is UUID format
- ✅ response.token is JWT format (eyJ...)
- ✅ token_expires_at is 7 days from now (± 1 hour)

---

## Test 4: User Login

**Objective:** Verify authentication tokens work  
**Command:**
```bash
curl -X POST https://api.staging.orchestraboxoffice.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "smoke-test-001@staging.local",
    "password": "SmokeTest2026!@#"
  }' \
  -v
```

**Expected Response:**
```
HTTP/1.1 200 OK

{
  "token": "eyJ...",
  "user_id": "uuid-...",
  "token_expires_at": "..."
}
```

**Pass Criteria:**
- ✅ Status code: 200
- ✅ response.token present and valid JWT
- ✅ Response time < 200ms

---

## Test 5: Sync Endpoint (Empty Batch)

**Objective:** Verify sync API accepts requests  
**Setup:** Use token from Test 4

```bash
TOKEN="eyJ..." # From Test 4

curl -X POST https://api.staging.orchestraboxoffice.com/v1/sync/batch \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "entries": [],
    "client_version": "1.0.0"
  }' \
  -v
```

**Expected Response:**
```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "synced_count": 0,
  "conflicts": [],
  "server_timestamp": "2026-04-18T14:30:00Z"
}
```

**Pass Criteria:**
- ✅ Status code: 200
- ✅ response.synced_count == 0
- ✅ response.conflicts is array (empty)
- ✅ server_timestamp is recent (within ±5 seconds)

---

## Test 6: Sync Endpoint (With Entry)

**Objective:** Verify sync can create entities  
**Setup:** Use token from Test 4

```bash
TOKEN="eyJ..."

curl -X POST https://api.staging.orchestraboxoffice.com/v1/sync/batch \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "entries": [
      {
        "id": "entity-001",
        "type": "budget",
        "local_version": 1,
        "data": {
          "pipeline_id": "test-pipeline",
          "period": "2026-04",
          "allocated_cents": 100000,
          "spent_cents": 0
        }
      }
    ],
    "client_version": "1.0.0"
  }' \
  -v
```

**Expected Response:**
```
HTTP/1.1 200 OK

{
  "synced_count": 1,
  "conflicts": [],
  "server_timestamp": "..."
}
```

**Pass Criteria:**
- ✅ Status code: 200
- ✅ response.synced_count == 1
- ✅ No conflicts
- ✅ Entry stored in database

---

## Test 7: Conflict Handling

**Objective:** Verify conflict resolution works  
**Setup:** Send same entry with conflicting version

```bash
TOKEN="eyJ..."

# First, send entry with version 1
# (from Test 6)

# Then send same entry with version 1 again (conflict)
curl -X POST https://api.staging.orchestraboxoffice.com/v1/sync/batch \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "entries": [
      {
        "id": "entity-001",
        "type": "budget",
        "local_version": 1,  # Same version = conflict
        "data": { "allocated_cents": 150000 }
      }
    ],
    "client_version": "1.0.0"
  }' \
  -v
```

**Expected Response:**
```
HTTP/1.1 200 OK

{
  "synced_count": 0,
  "conflicts": [
    {
      "entity_id": "entity-001",
      "local_version": 1,
      "server_version": 1,
      "local_data": { ... },
      "server_data": { ... }
    }
  ]
}
```

**Pass Criteria:**
- ✅ Status code: 200
- ✅ Conflict detected and reported
- ✅ Both local and server data provided
- ✅ No data loss

---

## Test 8: Desktop Installer (Windows)

**Objective:** Verify Windows installer works  
**Platform:** Windows 10/11  
**Steps:**

```powershell
# 1. Download installer
$url = "https://github.com/nerdykrystal/orchestra-box-office/releases/download/v1.0.0/orchestraboxoffice_1.0.0_x64.msi"
Invoke-WebRequest -Uri $url -OutFile "orchestra.msi"

# 2. Verify file exists and size > 0
Get-Item orchestra.msi

# 3. Install
msiexec /i orchestra.msi /quiet INSTALLDIR="C:\Program Files\Orchestra Box Office"

# 4. Verify executable exists
Test-Path "C:\Program Files\Orchestra Box Office\orchestra.exe"

# 5. Launch
& "C:\Program Files\Orchestra Box Office\orchestra.exe"
```

**Expected Behavior:**
- ✅ Installer downloads (file size > 50MB)
- ✅ Installation completes without errors
- ✅ Shortcut created on Desktop
- ✅ App launches within 3 seconds
- ✅ No error dialogs

**Post-Install Verification:**
- [ ] Window displays correctly
- [ ] Login page loads
- [ ] Can navigate to Budgets page
- [ ] Sync status shows "Synced"
- [ ] No crash logs in `%APPDATA%\Orchestra Box Office\logs\`

---

## Test 9: Desktop Installer (macOS)

**Objective:** Verify macOS installer works  
**Platform:** macOS 11+  
**Steps:**

```bash
# 1. Download
curl -L https://github.com/nerdykrystal/orchestra-box-office/releases/download/v1.0.0/orchestraboxoffice_1.0.0_aarch64.dmg -o orchestra.dmg

# 2. Verify
file orchestra.dmg
ls -lh orchestra.dmg

# 3. Mount
hdiutil mount orchestra.dmg

# 4. Copy to Applications
cp -r /Volumes/Orchestra\ Box\ Office/Orchestra\ Box\ Office.app ~/Applications/

# 5. Eject
hdiutil eject /Volumes/Orchestra\ Box\ Office

# 6. Launch
open ~/Applications/Orchestra\ Box\ Office.app
```

**Expected Behavior:**
- ✅ DMG file downloads (50-150MB)
- ✅ No security warnings on mount
- ✅ App launches within 3 seconds
- ✅ Gatekeeper allows execution (code signed)
- ✅ Window displays with proper resolution

---

## Test 10: Desktop Installer (Linux)

**Objective:** Verify Linux AppImage works  
**Platform:** Ubuntu 22.04, Fedora 38, Arch Linux  
**Steps:**

```bash
# 1. Download
wget https://github.com/nerdykrystal/orchestra-box-office/releases/download/v1.0.0/orchestraboxoffice_1.0.0_amd64.AppImage

# 2. Make executable
chmod +x orchestraboxoffice_1.0.0_amd64.AppImage

# 3. Run
./orchestraboxoffice_1.0.0_amd64.AppImage

# 4. Verify process
ps aux | grep orchestraboxoffice
```

**Expected Behavior:**
- ✅ AppImage downloads and verifies checksum
- ✅ Runs without needing installation
- ✅ Window displays correctly
- ✅ Works on Ubuntu, Fedora, Arch

---

## Test 11: Desktop → API Authentication

**Objective:** Verify desktop can authenticate with API  
**Setup:** Desktop app open, API running

**Steps:**
1. Click "Login" button
2. Enter test credentials: smoke-test-001@staging.local / SmokeTest2026!@#
3. Wait for authentication response

**Expected Behavior:**
- ✅ Login succeeds
- ✅ Dashboard loads
- ✅ User name displayed in header
- ✅ Authentication token stored securely

---

## Test 12: Desktop → Cloud Sync

**Objective:** Verify desktop can sync with cloud  
**Setup:** Desktop authenticated, API running

**Steps:**
1. Open "Budgets" page
2. Create new budget: Pipeline 1, 2026-04, $10,000
3. Check sync status indicator
4. Wait 5 seconds for auto-sync

**Expected Behavior:**
- ✅ Budget created locally
- ✅ Sync status shows "pending" initially
- ✅ Sync status changes to "synced" after 5 seconds
- ✅ No error messages

---

## Test 13: Data Integrity Check

**Objective:** Verify data is not corrupted in transit  
**Setup:** Create budget with exact values

```
Pipeline: Test Pipeline
Period: 2026-04
Allocation: $10,000.50
Spent: $3,456.78
```

**Verification in Database:**
```sql
SELECT allocated_cents, spent_cents FROM budgets 
WHERE period = '2026-04' 
LIMIT 1;

-- Expected:
-- allocated_cents: 1000050
-- spent_cents: 345678
```

**Pass Criteria:**
- ✅ Exact values match (no float rounding errors)
- ✅ All decimal places preserved
- ✅ No data truncation

---

## Test 14: API Performance - Health Check

**Objective:** Verify API response times are acceptable  
**Command:**

```bash
for i in {1..10}; do
  curl -X GET https://api.staging.orchestraboxoffice.com/health \
    -w "%{time_total}\n" \
    -o /dev/null \
    -s
done | awk '{sum+=$1; count++} END {print "Avg:", sum/count "s"}'
```

**Pass Criteria:**
- ✅ Average response time < 100ms
- ✅ No timeouts (all requests succeed)
- ✅ Consistent performance (std dev < 50ms)

---

## Test 15: API Performance - Sync Endpoint

**Objective:** Verify sync performance acceptable under load  
**Setup:** Batch of 100 entries

```bash
# Generate JSON with 100 budget entries
# Test with curl or Apache Bench

ab -n 10 -c 1 \
  -H "Authorization: Bearer $TOKEN" \
  -p sync_batch_100.json \
  https://api.staging.orchestraboxoffice.com/v1/sync/batch
```

**Pass Criteria:**
- ✅ Response time < 500ms per request (p95)
- ✅ No requests fail
- ✅ Database queries complete < 100ms (p95)

---

## Test 16: Error Handling - Invalid Token

**Objective:** Verify API rejects invalid authentication  
**Command:**

```bash
curl -X POST https://api.staging.orchestraboxoffice.com/v1/sync/batch \
  -H "Authorization: Bearer invalid_token_xyz" \
  -H "Content-Type: application/json" \
  -d '{"entries": []}' \
  -v
```

**Expected Response:**
```
HTTP/1.1 401 Unauthorized

{
  "error": "Invalid or expired token"
}
```

**Pass Criteria:**
- ✅ Status code: 401
- ✅ Request rejected (no data synced)
- ✅ Clear error message

---

## Test 17: Error Handling - Missing Required Fields

**Objective:** Verify validation works  
**Command:**

```bash
curl -X POST https://api.staging.orchestraboxoffice.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@local"}' \
  -v
```

**Expected Response:**
```
HTTP/1.1 400 Bad Request

{
  "error": "Missing required fields: password, username"
}
```

**Pass Criteria:**
- ✅ Status code: 400
- ✅ Error message lists missing fields
- ✅ No user created

---

## Test 18: Error Handling - Database Timeout

**Objective:** Verify graceful error handling under load  
**Procedure:** (Advanced) Simulate database latency

**Expected Behavior:**
- ✅ Request times out or returns 504 after timeout
- ✅ No data loss or corruption
- ✅ Logs contain error details

---

## Test 19: Conflict Resolution UI

**Objective:** Verify desktop shows conflict resolution correctly  
**Setup:** Create conflict by sending same entry twice

**Expected Behavior:**
- ✅ Conflict notification appears
- ✅ Side-by-side diff shows local vs. remote data
- ✅ User can choose "Keep Local" or "Keep Remote"
- ✅ Resolution succeeds without errors

---

## Test 20: Offline Mode

**Objective:** Verify desktop works offline  
**Procedure:**

1. Disable internet/block API requests
2. Create a new budget
3. Re-enable internet
4. Observe auto-sync

**Expected Behavior:**
- ✅ Budget created successfully while offline
- ✅ Sync status shows "pending"
- ✅ Auto-sync triggers when online
- ✅ Budget synced to cloud after reconnect

---

## Summary Report Template

```
SMOKE TEST SUMMARY
==================

Date: 2026-04-18
Tester: [Name]
Environment: Staging
Build: v1.0.0

Tests Passed: XX / 20
Pass Rate: XX%

Failed Tests:
- [Test name] → [Reason] → [Resolution]

Blockers for Launch: [None / List if any]

Sign-Off:
- [ ] QA Lead: Testing complete, ready for launch
- [ ] DevOps: Infrastructure stable, no issues
- [ ] Product: All critical paths working

Next Steps: [Proceed to Launch / Hold for fixes]
```

---

**Suite Status:** READY TO EXECUTE  
**Estimated Duration:** 2-3 hours  
**Infrastructure Required:** Staging API, database, desktop installers
