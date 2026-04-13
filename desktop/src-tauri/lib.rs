//! Tauri backend library for Orchestra Box Office
//!
//! Provides IPC commands for database operations, file I/O, and local state management.

use tauri::{AppHandle, Manager};
use orchestra_box_office_shared as shared;

pub mod commands;
pub mod db;
pub mod config;

pub use commands::*;
pub use db::*;
pub use config::*;

/// Initialize the Tauri application (setup, database, etc.).
pub fn initialize_app(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt::init();

    // Initialize database
    let app_handle = app.app_handle();

    Ok(())
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_placeholder() {
        // Tests for Tauri backend will be implemented in Stage 03
    }
}
