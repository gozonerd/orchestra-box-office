//! Local database operations (SQLite + SQLCipher).
//!
//! Manages encrypted local database for offline-first operation.
//! Uses AES-256 encryption via SQLCipher for at-rest security.

use anyhow::{anyhow, Result};
use chrono::Utc;
use rusqlite::{params, Connection, OptionalExtension};
use std::path::{Path, PathBuf};
use uuid::Uuid;

/// Database connection manager with encryption support.
pub struct DbConnection {
    conn: Connection,
    _db_path: PathBuf,
}

impl DbConnection {
    /// Open or create an encrypted database at the specified path.
    ///
    /// Password is retrieved from OS keychain. If not found, generates a new one.
    pub fn open(db_path: impl AsRef<Path>) -> Result<Self> {
        let db_path = db_path.as_ref().to_path_buf();

        // Get or create password from OS keychain
        let password = get_or_create_db_password()?;

        // Open connection with SQLCipher encryption
        let conn = Connection::open(&db_path)?;

        // Enable SQLCipher encryption (AES-256)
        conn.execute_batch(&format!("PRAGMA key = '{}';", escape_pragma_string(&password)))?;

        // Verify encryption is active
        conn.execute_batch("PRAGMA cipher_version;")?;

        // Set pragmas for reliability and performance
        conn.execute_batch(
            "PRAGMA journal_mode = WAL;
             PRAGMA synchronous = NORMAL;
             PRAGMA foreign_keys = ON;",
        )?;

        Ok(DbConnection { conn, _db_path: db_path })
    }

    /// Initialize the database schema if it doesn't exist.
    pub fn init_schema(&self) -> Result<()> {
        self.conn.execute_batch(
            "
            CREATE TABLE IF NOT EXISTS pipelines (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            );

            CREATE TABLE IF NOT EXISTS pipeline_runs (
                id TEXT PRIMARY KEY,
                pipeline_id TEXT NOT NULL,
                status TEXT NOT NULL,
                started_at INTEGER NOT NULL,
                ended_at INTEGER,
                outcomes_count INTEGER NOT NULL,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                FOREIGN KEY(pipeline_id) REFERENCES pipelines(id)
            );

            CREATE TABLE IF NOT EXISTS budgets (
                id TEXT PRIMARY KEY,
                pipeline_id TEXT NOT NULL,
                period TEXT NOT NULL,
                allocated_cents INTEGER NOT NULL,
                spent_cents INTEGER NOT NULL,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                FOREIGN KEY(pipeline_id) REFERENCES pipelines(id)
            );

            CREATE TABLE IF NOT EXISTS sync_queue (
                id TEXT PRIMARY KEY,
                entity_type TEXT NOT NULL,
                entity_id TEXT NOT NULL,
                operation TEXT NOT NULL,
                payload TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                synced_at INTEGER,
                error_message TEXT
            );

            CREATE INDEX IF NOT EXISTS idx_pipeline_runs_pipeline ON pipeline_runs(pipeline_id);
            CREATE INDEX IF NOT EXISTS idx_budgets_pipeline ON budgets(pipeline_id);
            CREATE INDEX IF NOT EXISTS idx_sync_queue_synced ON sync_queue(synced_at);
            ",
        )?;
        Ok(())
    }

    /// Insert a new pipeline.
    pub fn insert_pipeline(&self, name: &str, description: Option<&str>) -> Result<String> {
        let id = Uuid::new_v4().to_string();
        let now = Utc::now().timestamp();

        self.conn.execute(
            "INSERT INTO pipelines (id, name, description, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?)",
            params![&id, name, description, now, now],
        )?;

        self.queue_sync("Pipeline", &id, "create", serde_json::json!({
            "id": &id,
            "name": name,
            "description": description
        }).to_string())?;

        Ok(id)
    }

    /// Get a pipeline by ID.
    pub fn get_pipeline(&self, id: &str) -> Result<Option<(String, String, Option<String>)>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, name, description FROM pipelines WHERE id = ?",
        )?;

        let pipeline = stmt
            .query_row(params![id], |row| {
                Ok((
                    row.get::<_, String>(0)?,
                    row.get::<_, String>(1)?,
                    row.get::<_, Option<String>>(2)?,
                ))
            })
            .optional()?;

        Ok(pipeline)
    }

    /// List all pipelines.
    pub fn list_pipelines(&self) -> Result<Vec<(String, String, Option<String>)>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, name, description FROM pipelines ORDER BY created_at DESC",
        )?;

        let pipelines = stmt
            .query_map([], |row| {
                Ok((
                    row.get::<_, String>(0)?,
                    row.get::<_, String>(1)?,
                    row.get::<_, Option<String>>(2)?,
                ))
            })?
            .collect::<Result<Vec<_>, _>>()?;

        Ok(pipelines)
    }

    /// Update a pipeline.
    pub fn update_pipeline(&self, id: &str, name: &str, description: Option<&str>) -> Result<()> {
        let now = Utc::now().timestamp();

        self.conn.execute(
            "UPDATE pipelines SET name = ?, description = ?, updated_at = ? WHERE id = ?",
            params![name, description, now, id],
        )?;

        self.queue_sync("Pipeline", id, "update", serde_json::json!({
            "id": id,
            "name": name,
            "description": description
        }).to_string())?;

        Ok(())
    }

    /// Delete a pipeline.
    pub fn delete_pipeline(&self, id: &str) -> Result<()> {
        self.conn.execute("DELETE FROM pipelines WHERE id = ?", params![id])?;

        self.queue_sync("Pipeline", id, "delete", serde_json::json!({
            "id": id
        }).to_string())?;

        Ok(())
    }

    /// Insert a pipeline run.
    pub fn insert_pipeline_run(
        &self,
        pipeline_id: &str,
        status: &str,
        outcomes_count: u32,
    ) -> Result<String> {
        let id = Uuid::new_v4().to_string();
        let now = Utc::now().timestamp();

        self.conn.execute(
            "INSERT INTO pipeline_runs (id, pipeline_id, status, started_at, outcomes_count, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)",
            params![&id, pipeline_id, status, now, outcomes_count, now, now],
        )?;

        self.queue_sync("PipelineRun", &id, "create", serde_json::json!({
            "id": &id,
            "pipeline_id": pipeline_id,
            "status": status,
            "outcomes_count": outcomes_count
        }).to_string())?;

        Ok(id)
    }

    /// Get a pipeline run by ID.
    pub fn get_pipeline_run(&self, id: &str) -> Result<Option<(String, String, String, i64, Option<i64>, u32)>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, pipeline_id, status, started_at, ended_at, outcomes_count FROM pipeline_runs WHERE id = ?",
        )?;

        let run = stmt
            .query_row(params![id], |row| {
                Ok((
                    row.get::<_, String>(0)?,
                    row.get::<_, String>(1)?,
                    row.get::<_, String>(2)?,
                    row.get::<_, i64>(3)?,
                    row.get::<_, Option<i64>>(4)?,
                    row.get::<_, u32>(5)?,
                ))
            })
            .optional()?;

        Ok(run)
    }

    /// List pipeline runs for a pipeline.
    pub fn list_pipeline_runs(&self, pipeline_id: &str) -> Result<Vec<(String, String, String, i64, Option<i64>, u32)>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, pipeline_id, status, started_at, ended_at, outcomes_count
             FROM pipeline_runs
             WHERE pipeline_id = ?
             ORDER BY started_at DESC",
        )?;

        let runs = stmt
            .query_map(params![pipeline_id], |row| {
                Ok((
                    row.get::<_, String>(0)?,
                    row.get::<_, String>(1)?,
                    row.get::<_, String>(2)?,
                    row.get::<_, i64>(3)?,
                    row.get::<_, Option<i64>>(4)?,
                    row.get::<_, u32>(5)?,
                ))
            })?
            .collect::<Result<Vec<_>, _>>()?;

        Ok(runs)
    }

    /// Update pipeline run status.
    pub fn update_pipeline_run_status(&self, id: &str, status: &str) -> Result<()> {
        let now = Utc::now().timestamp();

        self.conn.execute(
            "UPDATE pipeline_runs SET status = ?, updated_at = ? WHERE id = ?",
            params![status, now, id],
        )?;

        self.queue_sync("PipelineRun", id, "update", serde_json::json!({
            "id": id,
            "status": status
        }).to_string())?;

        Ok(())
    }

    /// Complete a pipeline run.
    pub fn complete_pipeline_run(&self, id: &str) -> Result<()> {
        let now = Utc::now().timestamp();

        self.conn.execute(
            "UPDATE pipeline_runs SET status = 'completed', ended_at = ?, updated_at = ? WHERE id = ?",
            params![now, now, id],
        )?;

        self.queue_sync("PipelineRun", id, "update", serde_json::json!({
            "id": id,
            "status": "completed"
        }).to_string())?;

        Ok(())
    }

    /// Insert a budget.
    pub fn insert_budget(
        &self,
        pipeline_id: &str,
        period: &str,
        allocated_cents: i64,
        spent_cents: i64,
    ) -> Result<String> {
        let id = Uuid::new_v4().to_string();
        let now = Utc::now().timestamp();

        self.conn.execute(
            "INSERT INTO budgets (id, pipeline_id, period, allocated_cents, spent_cents, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)",
            params![&id, pipeline_id, period, allocated_cents, spent_cents, now, now],
        )?;

        self.queue_sync("Budget", &id, "create", serde_json::json!({
            "id": &id,
            "pipeline_id": pipeline_id,
            "period": period,
            "allocated_cents": allocated_cents,
            "spent_cents": spent_cents
        }).to_string())?;

        Ok(id)
    }

    /// Get a budget by ID.
    pub fn get_budget(&self, id: &str) -> Result<Option<(String, String, String, i64, i64)>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, pipeline_id, period, allocated_cents, spent_cents FROM budgets WHERE id = ?",
        )?;

        let budget = stmt
            .query_row(params![id], |row| {
                Ok((
                    row.get::<_, String>(0)?,
                    row.get::<_, String>(1)?,
                    row.get::<_, String>(2)?,
                    row.get::<_, i64>(3)?,
                    row.get::<_, i64>(4)?,
                ))
            })
            .optional()?;

        Ok(budget)
    }

    /// List budgets for a pipeline.
    pub fn list_budgets(&self, pipeline_id: &str) -> Result<Vec<(String, String, String, i64, i64)>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, pipeline_id, period, allocated_cents, spent_cents
             FROM budgets
             WHERE pipeline_id = ?
             ORDER BY period DESC",
        )?;

        let budgets = stmt
            .query_map(params![pipeline_id], |row| {
                Ok((
                    row.get::<_, String>(0)?,
                    row.get::<_, String>(1)?,
                    row.get::<_, String>(2)?,
                    row.get::<_, i64>(3)?,
                    row.get::<_, i64>(4)?,
                ))
            })?
            .collect::<Result<Vec<_>, _>>()?;

        Ok(budgets)
    }

    /// Update a budget.
    pub fn update_budget(&self, id: &str, spent_cents: i64) -> Result<()> {
        let now = Utc::now().timestamp();

        self.conn.execute(
            "UPDATE budgets SET spent_cents = ?, updated_at = ? WHERE id = ?",
            params![spent_cents, now, id],
        )?;

        self.queue_sync("Budget", id, "update", serde_json::json!({
            "id": id,
            "spent_cents": spent_cents
        }).to_string())?;

        Ok(())
    }

    /// Delete a budget.
    pub fn delete_budget(&self, id: &str) -> Result<()> {
        self.conn.execute("DELETE FROM budgets WHERE id = ?", params![id])?;

        self.queue_sync("Budget", id, "delete", serde_json::json!({
            "id": id
        }).to_string())?;

        Ok(())
    }

    /// Queue a sync operation for later cloud sync.
    fn queue_sync(&self, entity_type: &str, entity_id: &str, operation: &str, payload: String) -> Result<()> {
        let id = Uuid::new_v4().to_string();
        let now = Utc::now().timestamp();

        self.conn.execute(
            "INSERT INTO sync_queue (id, entity_type, entity_id, operation, payload, created_at)
             VALUES (?, ?, ?, ?, ?, ?)",
            params![&id, entity_type, entity_id, operation, payload, now],
        )?;

        Ok(())
    }

    /// Get pending sync operations (not yet synced).
    pub fn get_pending_syncs(&self) -> Result<Vec<(String, String, String, String, String)>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, entity_type, entity_id, operation, payload
             FROM sync_queue
             WHERE synced_at IS NULL AND error_message IS NULL
             ORDER BY created_at ASC",
        )?;

        let syncs = stmt
            .query_map([], |row| {
                Ok((
                    row.get::<_, String>(0)?,
                    row.get::<_, String>(1)?,
                    row.get::<_, String>(2)?,
                    row.get::<_, String>(3)?,
                    row.get::<_, String>(4)?,
                ))
            })?
            .collect::<Result<Vec<_>, _>>()?;

        Ok(syncs)
    }

    /// Mark a sync operation as successfully synced.
    pub fn mark_synced(&self, sync_id: &str) -> Result<()> {
        let now = Utc::now().timestamp();
        self.conn.execute(
            "UPDATE sync_queue SET synced_at = ? WHERE id = ?",
            params![now, sync_id],
        )?;
        Ok(())
    }

    /// Mark a sync operation as failed.
    pub fn mark_sync_error(&self, sync_id: &str, error: &str) -> Result<()> {
        self.conn.execute(
            "UPDATE sync_queue SET error_message = ? WHERE id = ?",
            params![error, sync_id],
        )?;
        Ok(())
    }
}

/// Get or create the database encryption password from OS keychain.
fn get_or_create_db_password() -> Result<String> {
    const KEYRING_SERVICE: &str = "io.stahl.orchestraboxoffice";
    const KEYRING_USER: &str = "db_encryption_password";

    let entry = keyring::Entry::new(KEYRING_SERVICE, KEYRING_USER)
        .map_err(|e| anyhow!("Failed to create keyring entry: {}", e))?;

    match entry.get_password() {
        Ok(password) => Ok(password),
        Err(keyring::Error::NoEntry) => {
            // Generate new password
            let password = Uuid::new_v4().to_string();
            entry.set_password(&password)
                .map_err(|e| anyhow!("Failed to store password in keyring: {}", e))?;
            Ok(password)
        }
        Err(e) => Err(anyhow!("Keyring error: {}", e)),
    }
}

/// Escape special characters in PRAGMA string values.
fn escape_pragma_string(s: &str) -> String {
    s.replace('\'', "''")
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;

    fn create_test_db() -> Result<DbConnection> {
        let temp_dir = std::env::temp_dir();
        let db_path = temp_dir.join(format!("test_db_{}.db", Uuid::new_v4()));
        DbConnection::open(&db_path)
    }

    fn cleanup_test_db(path: &Path) {
        let _ = fs::remove_file(path);
        let _ = fs::remove_file(format!("{}-wal", path.display()));
        let _ = fs::remove_file(format!("{}-shm", path.display()));
    }

    #[test]
    fn test_db_open_and_init_schema() -> Result<()> {
        let temp_dir = std::env::temp_dir();
        let db_path = temp_dir.join(format!("test_db_{}.db", Uuid::new_v4()));

        let db = DbConnection::open(&db_path)?;
        db.init_schema()?;

        cleanup_test_db(&db_path);
        Ok(())
    }

    #[test]
    fn test_insert_and_get_pipeline() -> Result<()> {
        let temp_dir = std::env::temp_dir();
        let db_path = temp_dir.join(format!("test_db_{}.db", Uuid::new_v4()));

        let db = DbConnection::open(&db_path)?;
        db.init_schema()?;

        let id = db.insert_pipeline("Test Pipeline", Some("A test pipeline"))?;
        let pipeline = db.get_pipeline(&id)?;

        assert!(pipeline.is_some());
        let (pid, name, desc) = pipeline.unwrap();
        assert_eq!(pid, id);
        assert_eq!(name, "Test Pipeline");
        assert_eq!(desc, Some("A test pipeline".to_string()));

        cleanup_test_db(&db_path);
        Ok(())
    }

    #[test]
    fn test_list_pipelines() -> Result<()> {
        let temp_dir = std::env::temp_dir();
        let db_path = temp_dir.join(format!("test_db_{}.db", Uuid::new_v4()));

        let db = DbConnection::open(&db_path)?;
        db.init_schema()?;

        db.insert_pipeline("Pipeline 1", None)?;
        db.insert_pipeline("Pipeline 2", None)?;

        let pipelines = db.list_pipelines()?;
        assert_eq!(pipelines.len(), 2);

        cleanup_test_db(&db_path);
        Ok(())
    }

    #[test]
    fn test_update_pipeline() -> Result<()> {
        let temp_dir = std::env::temp_dir();
        let db_path = temp_dir.join(format!("test_db_{}.db", Uuid::new_v4()));

        let db = DbConnection::open(&db_path)?;
        db.init_schema()?;

        let id = db.insert_pipeline("Original", None)?;
        db.update_pipeline(&id, "Updated", Some("New description"))?;

        let pipeline = db.get_pipeline(&id)?;
        let (_, name, desc) = pipeline.unwrap();
        assert_eq!(name, "Updated");
        assert_eq!(desc, Some("New description".to_string()));

        cleanup_test_db(&db_path);
        Ok(())
    }

    #[test]
    fn test_delete_pipeline() -> Result<()> {
        let temp_dir = std::env::temp_dir();
        let db_path = temp_dir.join(format!("test_db_{}.db", Uuid::new_v4()));

        let db = DbConnection::open(&db_path)?;
        db.init_schema()?;

        let id = db.insert_pipeline("To Delete", None)?;
        db.delete_pipeline(&id)?;

        let pipeline = db.get_pipeline(&id)?;
        assert!(pipeline.is_none());

        cleanup_test_db(&db_path);
        Ok(())
    }

    #[test]
    fn test_insert_and_get_pipeline_run() -> Result<()> {
        let temp_dir = std::env::temp_dir();
        let db_path = temp_dir.join(format!("test_db_{}.db", Uuid::new_v4()));

        let db = DbConnection::open(&db_path)?;
        db.init_schema()?;

        let pipeline_id = db.insert_pipeline("Pipeline", None)?;
        let run_id = db.insert_pipeline_run(&pipeline_id, "running", 5)?;

        let run = db.get_pipeline_run(&run_id)?;
        assert!(run.is_some());
        let (rid, pid, status, _, _, outcomes) = run.unwrap();
        assert_eq!(rid, run_id);
        assert_eq!(pid, pipeline_id);
        assert_eq!(status, "running");
        assert_eq!(outcomes, 5);

        cleanup_test_db(&db_path);
        Ok(())
    }

    #[test]
    fn test_list_pipeline_runs() -> Result<()> {
        let temp_dir = std::env::temp_dir();
        let db_path = temp_dir.join(format!("test_db_{}.db", Uuid::new_v4()));

        let db = DbConnection::open(&db_path)?;
        db.init_schema()?;

        let pipeline_id = db.insert_pipeline("Pipeline", None)?;
        db.insert_pipeline_run(&pipeline_id, "running", 5)?;
        db.insert_pipeline_run(&pipeline_id, "running", 3)?;

        let runs = db.list_pipeline_runs(&pipeline_id)?;
        assert_eq!(runs.len(), 2);

        cleanup_test_db(&db_path);
        Ok(())
    }

    #[test]
    fn test_update_pipeline_run_status() -> Result<()> {
        let temp_dir = std::env::temp_dir();
        let db_path = temp_dir.join(format!("test_db_{}.db", Uuid::new_v4()));

        let db = DbConnection::open(&db_path)?;
        db.init_schema()?;

        let pipeline_id = db.insert_pipeline("Pipeline", None)?;
        let run_id = db.insert_pipeline_run(&pipeline_id, "running", 5)?;
        db.update_pipeline_run_status(&run_id, "completed")?;

        let run = db.get_pipeline_run(&run_id)?;
        let (_, _, status, _, _, _) = run.unwrap();
        assert_eq!(status, "completed");

        cleanup_test_db(&db_path);
        Ok(())
    }

    #[test]
    fn test_insert_and_get_budget() -> Result<()> {
        let temp_dir = std::env::temp_dir();
        let db_path = temp_dir.join(format!("test_db_{}.db", Uuid::new_v4()));

        let db = DbConnection::open(&db_path)?;
        db.init_schema()?;

        let pipeline_id = db.insert_pipeline("Pipeline", None)?;
        let budget_id = db.insert_budget(&pipeline_id, "2026-Q1", 100000, 50000)?;

        let budget = db.get_budget(&budget_id)?;
        assert!(budget.is_some());
        let (bid, pid, period, allocated, spent) = budget.unwrap();
        assert_eq!(bid, budget_id);
        assert_eq!(pid, pipeline_id);
        assert_eq!(period, "2026-Q1");
        assert_eq!(allocated, 100000);
        assert_eq!(spent, 50000);

        cleanup_test_db(&db_path);
        Ok(())
    }

    #[test]
    fn test_list_budgets() -> Result<()> {
        let temp_dir = std::env::temp_dir();
        let db_path = temp_dir.join(format!("test_db_{}.db", Uuid::new_v4()));

        let db = DbConnection::open(&db_path)?;
        db.init_schema()?;

        let pipeline_id = db.insert_pipeline("Pipeline", None)?;
        db.insert_budget(&pipeline_id, "2026-Q1", 100000, 50000)?;
        db.insert_budget(&pipeline_id, "2026-Q2", 120000, 60000)?;

        let budgets = db.list_budgets(&pipeline_id)?;
        assert_eq!(budgets.len(), 2);

        cleanup_test_db(&db_path);
        Ok(())
    }

    #[test]
    fn test_update_budget() -> Result<()> {
        let temp_dir = std::env::temp_dir();
        let db_path = temp_dir.join(format!("test_db_{}.db", Uuid::new_v4()));

        let db = DbConnection::open(&db_path)?;
        db.init_schema()?;

        let pipeline_id = db.insert_pipeline("Pipeline", None)?;
        let budget_id = db.insert_budget(&pipeline_id, "2026-Q1", 100000, 50000)?;
        db.update_budget(&budget_id, 75000)?;

        let budget = db.get_budget(&budget_id)?;
        let (_, _, _, _, spent) = budget.unwrap();
        assert_eq!(spent, 75000);

        cleanup_test_db(&db_path);
        Ok(())
    }

    #[test]
    fn test_delete_budget() -> Result<()> {
        let temp_dir = std::env::temp_dir();
        let db_path = temp_dir.join(format!("test_db_{}.db", Uuid::new_v4()));

        let db = DbConnection::open(&db_path)?;
        db.init_schema()?;

        let pipeline_id = db.insert_pipeline("Pipeline", None)?;
        let budget_id = db.insert_budget(&pipeline_id, "2026-Q1", 100000, 50000)?;
        db.delete_budget(&budget_id)?;

        let budget = db.get_budget(&budget_id)?;
        assert!(budget.is_none());

        cleanup_test_db(&db_path);
        Ok(())
    }

    #[test]
    fn test_get_pending_syncs() -> Result<()> {
        let temp_dir = std::env::temp_dir();
        let db_path = temp_dir.join(format!("test_db_{}.db", Uuid::new_v4()));

        let db = DbConnection::open(&db_path)?;
        db.init_schema()?;

        let pipeline_id = db.insert_pipeline("Pipeline", None)?;

        let syncs = db.get_pending_syncs()?;
        // Should have at least one sync from insert_pipeline
        assert!(syncs.len() >= 1);

        cleanup_test_db(&db_path);
        Ok(())
    }

    #[test]
    fn test_mark_synced() -> Result<()> {
        let temp_dir = std::env::temp_dir();
        let db_path = temp_dir.join(format!("test_db_{}.db", Uuid::new_v4()));

        let db = DbConnection::open(&db_path)?;
        db.init_schema()?;

        db.insert_pipeline("Pipeline", None)?;
        let syncs = db.get_pending_syncs()?;
        let sync_id = syncs[0].0.clone();

        db.mark_synced(&sync_id)?;
        let pending = db.get_pending_syncs()?;
        assert!(pending.is_empty());

        cleanup_test_db(&db_path);
        Ok(())
    }
}

