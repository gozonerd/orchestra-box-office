//! Middleware for authentication, logging, and tracing.

use axum::{
    extract::Request,
    middleware::Next,
    response::Response,
};
use tracing::info;

/// Log incoming requests and their responses.
pub async fn request_logging(req: Request, next: Next) -> Response {
    let method = req.method().to_string();
    let uri = req.uri().to_string();

    info!("Request: {} {}", method, uri);
    let response = next.run(req).await;
    let status = response.status();
    info!("Response: {} ({})", uri, status);

    response
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_placeholder() {
        // Middleware tests will be implemented in Stage 04
    }
}
