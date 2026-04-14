use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use crate::{
    error::{ApiError, Result},
    models::EntityResponse,
    AppState,
};
use tracing::info;

/// GET /api/v1/entities/:entity_type/:entity_id
/// Fetch remote entity for conflict resolution
pub async fn fetch_entity(
    State(state): State<AppState>,
    Path((entity_type, entity_id)): Path<(String, String)>,
) -> Result<impl IntoResponse> {
    info!("Fetch entity: {} {}", entity_type, entity_id);

    let entity = state
        .db
        .fetch_entity(&entity_type, &entity_id)
        .await?
        .ok_or_else(|| ApiError::NotFound(format!("{} {}", entity_type, entity_id)))?;

    Ok((
        StatusCode::OK,
        Json(EntityResponse {
            data: entity.data,
        }),
    ))
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_placeholder() {
        // Test fetch_entity when database is available
    }
}
