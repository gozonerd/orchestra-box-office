use axum::{
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use chrono::Utc;
use crate::{
    error::Result,
    models::{BatchSyncRequest, BatchSyncResponse, SyncPayload, SyncResponse},
    AppState,
};
use tracing::info;

/// POST /api/v1/sync/batch
/// Receive batch sync from desktop
pub async fn batch_sync(
    State(state): State<AppState>,
    Json(req): Json<BatchSyncRequest>,
) -> Result<impl IntoResponse> {
    info!("Batch sync received: {} entries from {}", req.entries.len(), req.client_id);

    let mut responses = Vec::new();
    let mut synced_count = 0;
    let mut failed_count = 0;
    let mut conflict_count = 0;

    for entry in req.entries {
        match process_sync_entry(&state, &entry).await {
            Ok(response) => {
                if response.synced {
                    synced_count += 1;
                } else if response.conflict.is_some() {
                    conflict_count += 1;
                } else {
                    failed_count += 1;
                }
                responses.push(response);
            }
            Err(_) => {
                failed_count += 1;
                responses.push(SyncResponse {
                    entity_id: entry.entity_id,
                    synced: false,
                    remote_version: None,
                    conflict: None,
                    error: Some("Failed to process entry".to_string()),
                });
            }
        }
    }

    let response = BatchSyncResponse {
        synced_count,
        failed_count,
        conflict_count,
        responses,
        server_timestamp: Utc::now().timestamp(),
    };

    info!(
        "Batch sync completed: {} synced, {} failed, {} conflicts",
        synced_count, failed_count, conflict_count
    );

    Ok((StatusCode::OK, Json(response)))
}

/// POST /api/v1/sync/entry/:entity_type
/// Upload single entry (retry for failed entries)
pub async fn upload_entry(
    State(state): State<AppState>,
    Json(payload): Json<SyncPayload>,
) -> Result<impl IntoResponse> {
    info!(
        "Single entry upload: {} {}",
        payload.entity_type, payload.entity_id
    );

    let response = process_sync_entry(&state, &payload).await?;

    Ok((StatusCode::OK, Json(response)))
}

/// Process a single sync entry
async fn process_sync_entry(
    state: &AppState,
    entry: &SyncPayload,
) -> Result<SyncResponse> {
    // Check for conflicts: financial data or version mismatch
    let has_conflict = is_financial_data(&entry.entity_type)
        || state
            .db
            .has_conflict(&entry.entity_type, &entry.entity_id, entry.local_version)
            .await?;

    if has_conflict {
        // Fetch remote entity to show diff
        let remote_data = state
            .db
            .fetch_entity(&entry.entity_type, &entry.entity_id)
            .await?;

        return Ok(SyncResponse {
            entity_id: entry.entity_id.clone(),
            synced: false,
            remote_version: remote_data.as_ref().map(|e| e.version),
            conflict: remote_data.map(|e| {
                crate::models::ConflictData {
                    entity_type: entry.entity_type.clone(),
                    entity_id: entry.entity_id.clone(),
                    local_data: entry.data.clone(),
                    remote_data: e.data,
                    resolution_strategy: "manual".to_string(),
                }
            }),
            error: None,
        });
    }

    // No conflict: store entry
    let stored = state
        .db
        .store_sync_entry(
            &entry.entity_type,
            &entry.entity_id,
            &entry.operation,
            entry.data.clone(),
            "client_id", // TODO: Extract from request context
            entry.local_version,
        )
        .await?;

    Ok(SyncResponse {
        entity_id: entry.entity_id.clone(),
        synced: true,
        remote_version: Some(stored.remote_version),
        conflict: None,
        error: None,
    })
}

/// Check if entity type is financial (always requires manual conflict resolution)
fn is_financial_data(entity_type: &str) -> bool {
    matches!(entity_type, "Budget" | "PipelineRun" | "Outcome")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_is_financial_data() {
        assert!(is_financial_data("Budget"));
        assert!(is_financial_data("PipelineRun"));
        assert!(is_financial_data("Outcome"));
        assert!(!is_financial_data("Pipeline"));
    }
}
