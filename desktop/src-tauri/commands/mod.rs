//! Tauri IPC commands for frontend-to-backend communication.
//!
//! Commands are invoked from the React frontend and interact with the local database.

use crate::db::DbConnection;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::State;

/// Global database connection (wrapped in Mutex for thread safety)
pub type DbState = Mutex<Option<DbConnection>>;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct PipelineResponse {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct PipelineRunResponse {
    pub id: String,
    pub pipeline_id: String,
    pub status: String,
    pub started_at: i64,
    pub ended_at: Option<i64>,
    pub outcomes_count: u32,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct BudgetResponse {
    pub id: String,
    pub pipeline_id: String,
    pub period: String,
    pub allocated_cents: i64,
    pub spent_cents: i64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SyncStatus {
    pub pending_count: usize,
    pub last_sync: Option<i64>,
}

// ============= PIPELINE COMMANDS =============

/// Create a new pipeline.
#[tauri::command]
pub fn create_pipeline(
    db_state: State<DbState>,
    name: String,
    description: Option<String>,
) -> Result<PipelineResponse, String> {
    let db_guard = db_state.lock().map_err(|e| format!("Lock error: {}", e))?;
    let db = db_guard.as_ref().ok_or("Database not initialized")?;

    let id = db.insert_pipeline(&name, description.as_deref())
        .map_err(|e| format!("Failed to create pipeline: {}", e))?;

    Ok(PipelineResponse {
        id,
        name,
        description,
    })
}

/// Get a pipeline by ID.
#[tauri::command]
pub fn get_pipeline(
    db_state: State<DbState>,
    id: String,
) -> Result<Option<PipelineResponse>, String> {
    let db_guard = db_state.lock().map_err(|e| format!("Lock error: {}", e))?;
    let db = db_guard.as_ref().ok_or("Database not initialized")?;

    let pipeline = db.get_pipeline(&id)
        .map_err(|e| format!("Failed to get pipeline: {}", e))?;

    Ok(pipeline.map(|(id, name, description)| PipelineResponse {
        id,
        name,
        description,
    }))
}

/// List all pipelines.
#[tauri::command]
pub fn list_pipelines(
    db_state: State<DbState>,
) -> Result<Vec<PipelineResponse>, String> {
    let db_guard = db_state.lock().map_err(|e| format!("Lock error: {}", e))?;
    let db = db_guard.as_ref().ok_or("Database not initialized")?;

    let pipelines = db.list_pipelines()
        .map_err(|e| format!("Failed to list pipelines: {}", e))?;

    Ok(pipelines
        .into_iter()
        .map(|(id, name, description)| PipelineResponse {
            id,
            name,
            description,
        })
        .collect())
}

/// Update a pipeline.
#[tauri::command]
pub fn update_pipeline(
    db_state: State<DbState>,
    id: String,
    name: String,
    description: Option<String>,
) -> Result<(), String> {
    let db_guard = db_state.lock().map_err(|e| format!("Lock error: {}", e))?;
    let db = db_guard.as_ref().ok_or("Database not initialized")?;

    db.update_pipeline(&id, &name, description.as_deref())
        .map_err(|e| format!("Failed to update pipeline: {}", e))
}

/// Delete a pipeline.
#[tauri::command]
pub fn delete_pipeline(
    db_state: State<DbState>,
    id: String,
) -> Result<(), String> {
    let db_guard = db_state.lock().map_err(|e| format!("Lock error: {}", e))?;
    let db = db_guard.as_ref().ok_or("Database not initialized")?;

    db.delete_pipeline(&id)
        .map_err(|e| format!("Failed to delete pipeline: {}", e))
}

// ============= PIPELINE RUN COMMANDS =============

/// Create a new pipeline run.
#[tauri::command]
pub fn create_pipeline_run(
    db_state: State<DbState>,
    pipeline_id: String,
    status: String,
    outcomes_count: u32,
) -> Result<PipelineRunResponse, String> {
    let db_guard = db_state.lock().map_err(|e| format!("Lock error: {}", e))?;
    let db = db_guard.as_ref().ok_or("Database not initialized")?;

    let id = db.insert_pipeline_run(&pipeline_id, &status, outcomes_count)
        .map_err(|e| format!("Failed to create run: {}", e))?;

    let now = chrono::Utc::now().timestamp();

    Ok(PipelineRunResponse {
        id,
        pipeline_id,
        status,
        started_at: now,
        ended_at: None,
        outcomes_count,
    })
}

/// Get a pipeline run by ID.
#[tauri::command]
pub fn get_pipeline_run(
    db_state: State<DbState>,
    id: String,
) -> Result<Option<PipelineRunResponse>, String> {
    let db_guard = db_state.lock().map_err(|e| format!("Lock error: {}", e))?;
    let db = db_guard.as_ref().ok_or("Database not initialized")?;

    let run = db.get_pipeline_run(&id)
        .map_err(|e| format!("Failed to get run: {}", e))?;

    Ok(run.map(|(id, pipeline_id, status, started_at, ended_at, outcomes_count)| {
        PipelineRunResponse {
            id,
            pipeline_id,
            status,
            started_at,
            ended_at,
            outcomes_count,
        }
    }))
}

/// List pipeline runs for a pipeline.
#[tauri::command]
pub fn list_pipeline_runs(
    db_state: State<DbState>,
    pipeline_id: String,
) -> Result<Vec<PipelineRunResponse>, String> {
    let db_guard = db_state.lock().map_err(|e| format!("Lock error: {}", e))?;
    let db = db_guard.as_ref().ok_or("Database not initialized")?;

    let runs = db.list_pipeline_runs(&pipeline_id)
        .map_err(|e| format!("Failed to list runs: {}", e))?;

    Ok(runs
        .into_iter()
        .map(|(id, pipeline_id, status, started_at, ended_at, outcomes_count)| {
            PipelineRunResponse {
                id,
                pipeline_id,
                status,
                started_at,
                ended_at,
                outcomes_count,
            }
        })
        .collect())
}

/// List all pipeline runs across all pipelines.
#[tauri::command]
pub fn list_all_pipeline_runs(
    db_state: State<DbState>,
) -> Result<Vec<PipelineRunResponse>, String> {
    let db_guard = db_state.lock().map_err(|e| format!("Lock error: {}", e))?;
    let db = db_guard.as_ref().ok_or("Database not initialized")?;

    let runs = db.list_all_pipeline_runs()
        .map_err(|e| format!("Failed to list all runs: {}", e))?;

    Ok(runs
        .into_iter()
        .map(|(id, pipeline_id, status, started_at, ended_at, outcomes_count)| {
            PipelineRunResponse {
                id,
                pipeline_id,
                status,
                started_at,
                ended_at,
                outcomes_count,
            }
        })
        .collect())
}

/// Update a pipeline run status.
#[tauri::command]
pub fn update_pipeline_run_status(
    db_state: State<DbState>,
    id: String,
    status: String,
) -> Result<(), String> {
    let db_guard = db_state.lock().map_err(|e| format!("Lock error: {}", e))?;
    let db = db_guard.as_ref().ok_or("Database not initialized")?;

    db.update_pipeline_run_status(&id, &status)
        .map_err(|e| format!("Failed to update run status: {}", e))
}

/// Complete a pipeline run.
#[tauri::command]
pub fn complete_pipeline_run(
    db_state: State<DbState>,
    id: String,
) -> Result<(), String> {
    let db_guard = db_state.lock().map_err(|e| format!("Lock error: {}", e))?;
    let db = db_guard.as_ref().ok_or("Database not initialized")?;

    db.complete_pipeline_run(&id)
        .map_err(|e| format!("Failed to complete run: {}", e))
}

// ============= BUDGET COMMANDS =============

/// Create a new budget.
#[tauri::command]
pub fn create_budget(
    db_state: State<DbState>,
    pipeline_id: String,
    period: String,
    allocated_cents: i64,
    spent_cents: i64,
) -> Result<BudgetResponse, String> {
    let db_guard = db_state.lock().map_err(|e| format!("Lock error: {}", e))?;
    let db = db_guard.as_ref().ok_or("Database not initialized")?;

    let id = db.insert_budget(&pipeline_id, &period, allocated_cents, spent_cents)
        .map_err(|e| format!("Failed to create budget: {}", e))?;

    Ok(BudgetResponse {
        id,
        pipeline_id,
        period,
        allocated_cents,
        spent_cents,
    })
}

/// Get a budget by ID.
#[tauri::command]
pub fn get_budget(
    db_state: State<DbState>,
    id: String,
) -> Result<Option<BudgetResponse>, String> {
    let db_guard = db_state.lock().map_err(|e| format!("Lock error: {}", e))?;
    let db = db_guard.as_ref().ok_or("Database not initialized")?;

    let budget = db.get_budget(&id)
        .map_err(|e| format!("Failed to get budget: {}", e))?;

    Ok(budget.map(|(id, pipeline_id, period, allocated_cents, spent_cents)| {
        BudgetResponse {
            id,
            pipeline_id,
            period,
            allocated_cents,
            spent_cents,
        }
    }))
}

/// List budgets for a pipeline.
#[tauri::command]
pub fn list_budgets(
    db_state: State<DbState>,
    pipeline_id: String,
) -> Result<Vec<BudgetResponse>, String> {
    let db_guard = db_state.lock().map_err(|e| format!("Lock error: {}", e))?;
    let db = db_guard.as_ref().ok_or("Database not initialized")?;

    let budgets = db.list_budgets(&pipeline_id)
        .map_err(|e| format!("Failed to list budgets: {}", e))?;

    Ok(budgets
        .into_iter()
        .map(|(id, pipeline_id, period, allocated_cents, spent_cents)| {
            BudgetResponse {
                id,
                pipeline_id,
                period,
                allocated_cents,
                spent_cents,
            }
        })
        .collect())
}

/// List all budgets across all pipelines.
#[tauri::command]
pub fn list_all_budgets(
    db_state: State<DbState>,
) -> Result<Vec<BudgetResponse>, String> {
    let db_guard = db_state.lock().map_err(|e| format!("Lock error: {}", e))?;
    let db = db_guard.as_ref().ok_or("Database not initialized")?;

    let budgets = db.list_all_budgets()
        .map_err(|e| format!("Failed to list all budgets: {}", e))?;

    Ok(budgets
        .into_iter()
        .map(|(id, pipeline_id, period, allocated_cents, spent_cents)| {
            BudgetResponse {
                id,
                pipeline_id,
                period,
                allocated_cents,
                spent_cents,
            }
        })
        .collect())
}

/// Update a budget.
#[tauri::command]
pub fn update_budget(
    db_state: State<DbState>,
    id: String,
    spent_cents: i64,
) -> Result<(), String> {
    let db_guard = db_state.lock().map_err(|e| format!("Lock error: {}", e))?;
    let db = db_guard.as_ref().ok_or("Database not initialized")?;

    db.update_budget(&id, spent_cents)
        .map_err(|e| format!("Failed to update budget: {}", e))
}

/// Delete a budget.
#[tauri::command]
pub fn delete_budget(
    db_state: State<DbState>,
    id: String,
) -> Result<(), String> {
    let db_guard = db_state.lock().map_err(|e| format!("Lock error: {}", e))?;
    let db = db_guard.as_ref().ok_or("Database not initialized")?;

    db.delete_budget(&id)
        .map_err(|e| format!("Failed to delete budget: {}", e))
}

// ============= SYNC COMMANDS =============

/// Get sync status (pending sync count).
#[tauri::command]
pub fn get_sync_status(
    db_state: State<DbState>,
) -> Result<SyncStatus, String> {
    let db_guard = db_state.lock().map_err(|e| format!("Lock error: {}", e))?;
    let db = db_guard.as_ref().ok_or("Database not initialized")?;

    let syncs = db.get_pending_syncs()
        .map_err(|e| format!("Failed to get pending syncs: {}", e))?;

    Ok(SyncStatus {
        pending_count: syncs.len(),
        last_sync: None, // TODO: Track last sync timestamp
    })
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_placeholder() {
        // Command tests will be added in Stage 03
    }
}

