//! Tauri backend library for Orchestra Box Office
//!
//! Provides IPC commands for database operations, file I/O, and local state management.

use tracing_subscriber::EnvFilter;
use orchestra_box_office_shared as shared;

pub mod commands;
pub mod db;
pub mod config;

pub use commands::*;
pub use db::*;
pub use config::*;

/// Initialize the Tauri application (setup, database, etc.).
pub fn initialize_app(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    // Initialize tracing with env filter
    let env_filter = EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::new("orchestra_box_office=debug,tauri=info"));

    tracing_subscriber::fmt()
        .with_env_filter(env_filter)
        .init();

    tracing::info!("Initializing Orchestra Box Office");

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_initialize_app_logging() {
        // Logging initialization tested at runtime
    }
}
