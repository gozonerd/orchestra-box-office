use axum::{
    extract::Request,
    middleware::Next,
    response::Response,
};
use tracing::info;

/// Request logging middleware
pub async fn request_logging(
    req: Request,
    next: Next,
) -> Response {
    let method = req.method().clone();
    let uri = req.uri().clone();

    info!("{} {}", method, uri);

    next.run(req).await
}
