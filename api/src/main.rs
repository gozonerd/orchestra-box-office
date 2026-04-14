//! Orchestra Box Office Cloud API
//!
//! RESTful API for sync, authentication, and conflict resolution.
//! Built with Axum + PostgreSQL for cloud deployment on Fly.io.

use axum::{
    extract::DefaultBodyLimit,
    routing::{get, post},
    Json, Router,
};
use serde_json::json;
use std::net::SocketAddr;
use tokio::net::TcpListener;
use tracing::info;
use tracing_subscriber::EnvFilter;

mod db;
mod db_migrations;
mod error;
mod middleware;
mod models;
mod routes;

use crate::db::Database;

/// Application state containing database pool
#[derive(Clone)]
pub struct AppState {
    pub db: Database,
}

#[tokio::main]
async fn main() {
    // Initialize tracing
    let env_filter = EnvFilter::from_default_env()
        .add_directive("orchestra_box_office_api=debug".parse().unwrap());

    tracing_subscriber::fmt()
        .with_env_filter(env_filter)
        .init();

    info!("Starting Orchestra Box Office API");

    // Initialize database
    let db = Database::new()
        .await
        .expect("Failed to initialize database");

    let state = AppState { db };

    // Build router
    let app = Router::new()
        // Health check
        .route("/health", get(health_check))
        // Auth routes
        .route("/api/v1/auth/login", post(routes::auth::login))
        .route("/api/v1/auth/status", get(routes::auth::check_auth))
        // Sync routes
        .route("/api/v1/sync/batch", post(routes::sync::batch_sync))
        .route(
            "/api/v1/sync/entry/:entity_type",
            post(routes::sync::upload_entry),
        )
        // Entity routes
        .route(
            "/api/v1/entities/:entity_type/:entity_id",
            get(routes::entities::fetch_entity),
        )
        // Conflict resolution
        .route(
            "/api/v1/conflicts/resolve",
            post(routes::conflicts::resolve_conflict),
        )
        .layer(DefaultBodyLimit::max(10 * 1024 * 1024)) // 10MB
        .layer(axum::middleware::from_fn(middleware::request_logging))
        .with_state(state);

    // Listen on 0.0.0.0:8080
    let addr = SocketAddr::from(([0, 0, 0, 0], 8080));
    let listener = TcpListener::bind(&addr)
        .await
        .expect("Failed to bind to port 8080");

    info!("Listening on {}", addr);

    axum::serve(listener, app)
        .await
        .expect("Server failed");
}

/// Health check endpoint
async fn health_check() -> impl axum::response::IntoResponse {
    Json(json!({
        "status": "ok",
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_health_check() {
        // Test that health_check completes without panicking
        let _ = health_check().await;
    }
}
