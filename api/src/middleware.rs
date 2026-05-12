use axum::{
    extract::{Request, State},
    middleware::Next,
    response::Response,
};
use tracing::info;

use crate::{error::ApiError, AppState};

/// Request logging middleware
pub async fn request_logging(req: Request, next: Next) -> Response {
    let method = req.method().clone();
    let uri = req.uri().clone();

    info!("{} {}", method, uri);

    next.run(req).await
}

/// Bearer token authentication middleware
/// Extracts and verifies the Authorization: Bearer <token> header.
/// Rejects with 401 if missing or invalid.
pub async fn require_auth(
    State(state): State<AppState>,
    mut req: Request,
    next: Next,
) -> Result<Response, ApiError> {
    let token = req
        .headers()
        .get(axum::http::header::AUTHORIZATION)
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "))
        .map(|t| t.to_string())
        .ok_or(ApiError::Unauthorized)?;

    let user_id = state.db.verify_token(&token).await?;

    // Store verified user_id in request extensions for handlers
    req.extensions_mut().insert(AuthenticatedUser { user_id });

    Ok(next.run(req).await)
}

/// Extractor for the authenticated user set by require_auth middleware
#[derive(Clone)]
pub struct AuthenticatedUser {
    pub user_id: String,
}
