//! Orchestra Box Office Cloud API
//!
//! RESTful API for Box Office (Axum + PostgreSQL on Fly.io).
//! Handles sync, conflict resolution, and financial data management.

use axum::{
    routing::{get, post},
    Router,
};
use std::net::SocketAddr;
use tokio::net::TcpListener;
use tracing::info;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};

mod routes;
mod db;
mod middleware;
mod error;

/// Application state (PostgreSQL pool, etc.).
#[derive(Clone)]
pub struct AppState;

#[tokio::main]
async fn main() {
    // Initialize tracing
    let env_filter = EnvFilter::from_default_env();

    tracing_subscriber::registry()
        .with(env_filter)
        .with(tracing_subscriber::fmt::layer())
        .init();

    info!("Starting Orchestra Box Office API");

    // Build router
    let app = Router::new()
        .route("/health", get(health_check))
        .route("/api/v1/pipelines", post(routes::create_pipeline))
        .route("/api/v1/pipelines", get(routes::list_pipelines))
        .with_state(AppState)
        .layer(axum::middleware::from_fn(middleware::request_logging));

    // Listen on 0.0.0.0:3000 (Fly.io will proxy requests)
    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    let listener = TcpListener::bind(&addr).await
        .expect("Failed to bind to port 3000");

    info!("Listening on {}", addr);

    axum::serve(listener, app)
        .await
        .expect("Server failed");
}

/// Health check endpoint.
async fn health_check() -> &'static str {
    "OK"
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_app_state_clone() {
        let state = AppState;
        let _cloned = state.clone();
    }
}
