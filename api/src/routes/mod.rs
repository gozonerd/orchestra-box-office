//! API routes for pipelines, budgets, and reporting.

use axum::{
    extract::State,
    http::StatusCode,
    Json,
};
use serde_json::json;
use uuid::Uuid;
use crate::AppState;

/// Create a new pipeline definition.
pub async fn create_pipeline(
    State(_state): State<AppState>,
    Json(_payload): Json<serde_json::Value>,
) -> (StatusCode, Json<serde_json::Value>) {
    // TODO: Parse payload, validate, insert into DB
    (
        StatusCode::CREATED,
        Json(json!({"message": "Pipeline created", "id": Uuid::new_v4()})),
    )
}

/// List all pipelines for the authenticated user.
pub async fn list_pipelines(
    State(_state): State<AppState>,
) -> (StatusCode, Json<serde_json::Value>) {
    // TODO: Query DB, return list
    (
        StatusCode::OK,
        Json(json!({"pipelines": []})),
    )
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_placeholder() {
        // Routes will be fully tested in Stage 04
    }
}
