# Database Schema

Orchestra Box Office uses PostgreSQL 14+ with the following schema designed for:
- **Sync integrity** — Track synced entities with version numbers
- **Conflict resolution** — Record conflicts requiring manual intervention
- **Audit trail** — Complete mutation history for compliance
- **User isolation** — Multi-tenant data segregation

## Tables

### users
Authentication and user profiles.

```
id (UUID, PK)
email (VARCHAR 255, UNIQUE)
password_hash (VARCHAR 255)  -- bcrypt
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
deleted_at (TIMESTAMP, soft-delete)
```

**Indexes:**
- `email` (unique lookup)
- `deleted_at` (soft-delete filter)

### auth_tokens
Session tokens for API authentication.

```
id (UUID, PK)
user_id (UUID, FK → users)
token_hash (VARCHAR 255, UNIQUE)  -- SHA-256
expires_at (TIMESTAMP)
created_at (TIMESTAMP)
revoked_at (TIMESTAMP, nullable)
```

**Indexes:**
- `user_id` (lookup active sessions)
- `expires_at` (cleanup expired tokens)

**TTL:** 7 days; auto-delete after expiry + 30 days

### sync_queue
Pending sync entries from desktop clients.

```
id (UUID, PK)
user_id (UUID, FK → users)
entity_type (VARCHAR 50)  -- "Pipeline", "Budget", "PipelineRun", "Outcome"
entity_id (VARCHAR 255)
operation (VARCHAR 20)    -- "create", "update", "delete"
data (JSONB)
client_id (VARCHAR 255)   -- Deduplication
local_version (INT)
status (VARCHAR 20)       -- "pending", "synced", "failed", "conflict"
error_message (TEXT, nullable)
synced_at (TIMESTAMP, nullable)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

**Indexes:**
- `(user_id, status)` (query pending entries)
- `client_id` (deduplication)
- `created_at` (cleanup old)

**Constraints:**
- `operation IN ('create', 'update', 'delete')`
- `status IN ('pending', 'synced', 'failed', 'conflict')`

### entities
Synced entities from desktop (source of truth after merge).

```
id (UUID, PK)
user_id (UUID, FK → users)
entity_type (VARCHAR 50)
entity_id (VARCHAR 255)
operation (VARCHAR 20)
data (JSONB)
local_version (INT)
remote_version (INT)
synced_at (TIMESTAMP)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

**Indexes:**
- `(user_id, entity_type)` (query user's entities)
- `(entity_type, entity_id, user_id)` (fast lookup)
- `synced_at` (query recent)

**Constraints:**
- Unique constraint: `(user_id, entity_type, entity_id)`

### conflicts
Sync conflicts requiring manual resolution.

```
id (UUID, PK)
user_id (UUID, FK → users)
entity_type (VARCHAR 50)
entity_id (VARCHAR 255)
local_data (JSONB)        -- From desktop
remote_data (JSONB)       -- From cloud
resolution_strategy (VARCHAR 20)  -- "manual", "local_wins", "remote_wins"
resolved_at (TIMESTAMP, nullable)
resolution_choice (VARCHAR 20, nullable)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

**Indexes:**
- `(user_id, resolved_at)` WHERE resolved_at IS NULL (unresolved)
- `(entity_type, entity_id, user_id)` (lookup by entity)

**Constraints:**
- `resolution_strategy IN ('manual', 'local_wins', 'remote_wins')`

### audit_log
Complete audit trail of all mutations.

```
id (UUID, PK)
user_id (UUID, FK → users)
action (VARCHAR 50)       -- "sync_entry", "resolve_conflict", "delete_entity"
entity_type (VARCHAR 50, nullable)
entity_id (VARCHAR 255, nullable)
old_data (JSONB, nullable)
new_data (JSONB, nullable)
client_id (VARCHAR 255, nullable)
ip_address (INET, nullable)
user_agent (TEXT, nullable)
created_at (TIMESTAMP)
```

**Indexes:**
- `user_id` (query user's activity)
- `created_at` (query by date range)
- `(entity_type, entity_id)` (entity history)

**Retention:** 2 years

### deployment
Version tracking for deployments.

```
id (SERIAL, PK)
version (VARCHAR 50, UNIQUE)
deployed_at (TIMESTAMP)
deployed_by (VARCHAR 255)
notes (TEXT, nullable)
```

**Indexes:**
- `version` (lookup)

## Data Integrity

### Foreign Keys
- All `user_id` references cascade delete
- Prevents orphaned records if user is deleted

### Triggers
- `updated_at` auto-update on `INSERT` or `UPDATE`
- Ensures accurate timestamps

### Constraints
- NOT NULL on required fields
- CHECK constraints on status/operation enums
- UNIQUE constraints on identifiers

## Sync Flow

```
1. Desktop sends sync_queue entry
   ↓
2. Server checks for conflicts (version mismatch)
   ├─ No conflict → Insert into entities
   ├─ Conflict → Insert into conflicts, await resolution
3. Resolution choice → Update entities, record in audit_log
4. Cleanup: sync_queue.status = 'synced'
```

## Multi-Tenancy

- Every table has `user_id` (soft isolation)
- Row-level security (RLS) policies in production
- Queries filter by authenticated user_id
- No cross-user data access

## Scaling

### Partitioning (future)
```sql
-- Partition audit_log by month for faster queries
PARTITION BY RANGE (DATE_TRUNC('month', created_at))
```

### Archival
- Move audit_log > 2 years to cold storage (S3)
- Delete sync_queue > 90 days automatically

### Indexing Strategy
- Cover frequent WHERE clauses
- Avoid over-indexing (write performance)
- Use partial indexes for soft-deletes

## Migration Process

Migrations are SQL files in `api/migrations/`:
```
20260413_init.sql          -- Initial schema
20260420_add_index.sql     -- Performance improvement
20260501_column_rename.sql -- Schema evolution
```

Run with `sqlx migrate run` before deployment.

## Backup Strategy

- Daily automated backups (Neon)
- Point-in-time recovery (last 30 days)
- Encrypted backups stored in separate region
- Test restores weekly

## Connection Pooling

- Min: 2 connections
- Max: 20 connections (Fly.io resource limits)
- Idle timeout: 5 minutes
- Connection lifetime: 30 minutes
