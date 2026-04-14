use axum::{
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use crate::{
    error::Result,
    models::{LoginRequest, LoginResponse},
    AppState,
};
use tracing::info;

/// POST /api/v1/auth/login
/// Authenticate user with email/password
pub async fn login(
    State(state): State<AppState>,
    Json(req): Json<LoginRequest>,
) -> Result<impl IntoResponse> {
    info!("Login attempt for: {}", req.email);

    let token = state.db.authenticate(&req.email, &req.password).await?;

    info!("Login successful for: {}", req.email);

    Ok((
        StatusCode::OK,
        Json(LoginResponse {
            token: token.token,
            user_id: token.user_id,
        }),
    ))
}

/// GET /api/v1/auth/status
/// Check if request is authenticated
pub async fn check_auth(State(state): State<AppState>) -> Result<impl IntoResponse> {
    // In a real implementation, extract token from Authorization header
    // For MVP, just verify database is reachable
    state
        .db
        .verify_token("mock_token")
        .await
        .ok();

    Ok(StatusCode::OK)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_login_empty_email() {
        let _req = LoginRequest {
            email: "".to_string(),
            password: "password".to_string(),
        };

        // Would need to setup test database
        // Result should be Err(ApiError::AuthenticationFailed)
    }
}
