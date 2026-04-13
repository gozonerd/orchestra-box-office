//! Orchestra Box Office — Shared Rust Library
//!
//! Provides financial arithmetic, data types, and validation logic used by both
//! the desktop application and cloud API.

pub mod finance;
pub mod models;
pub mod validation;

pub use finance::*;
pub use models::*;
pub use validation::*;
