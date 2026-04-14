// Migration helpers and utilities
// In production, use sqlx::migrate! macro with embedded migrations

use crate::error::{ApiError, Result};

/// Migration metadata
#[derive(Debug, Clone)]
pub struct Migration {
    pub version: &'static str,
    pub description: &'static str,
    pub up_sql: &'static str,
}

/// All migrations in order
pub const MIGRATIONS: &[Migration] = &[
    Migration {
        version: "20260413_init",
        description: "Initial schema with users, sync_queue, entities, conflicts, audit_log",
        up_sql: include_str!("../migrations/20260413_init.sql"),
    },
];

/// Run all pending migrations
pub async fn run_migrations() -> Result<()> {
    // TODO: Connect to database and execute migrations
    // for migration in MIGRATIONS {
    //     if !is_migration_applied(&migration.version).await? {
    //         execute_migration(&migration).await?;
    //         record_migration(&migration.version).await?;
    //     }
    // }
    Ok(())
}

/// Check if migration has been applied
pub async fn is_migration_applied(_version: &str) -> Result<bool> {
    // TODO: Query schema_migrations table
    Ok(true)
}

/// Execute a migration
pub async fn execute_migration(_migration: &Migration) -> Result<()> {
    // TODO: Execute up_sql against database
    Ok(())
}

/// Record migration in schema_migrations
pub async fn record_migration(_version: &str) -> Result<()> {
    // TODO: Insert into schema_migrations
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_migrations_exist() {
        assert!(!MIGRATIONS.is_empty());
    }

    #[test]
    fn test_migration_versions_ordered() {
        let versions: Vec<_> = MIGRATIONS.iter().map(|m| &m.version).collect();
        let mut sorted = versions.clone();
        sorted.sort();
        assert_eq!(versions, sorted, "Migrations must be in order");
    }

    #[test]
    fn test_migration_sql_not_empty() {
        for migration in MIGRATIONS {
            assert!(!migration.up_sql.is_empty(), "Migration {} has no SQL", migration.version);
        }
    }
}
