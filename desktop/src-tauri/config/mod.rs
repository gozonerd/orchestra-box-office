//! Configuration and environment management for the desktop app.
//!
//! Handles API endpoints, database paths, encryption keys, etc.

pub struct Config {
    pub api_base_url: String,
    pub db_path: String,
}

impl Config {
    pub fn from_env() -> Self {
        Config {
            api_base_url: std::env::var("API_BASE_URL")
                .unwrap_or_else(|_| "http://localhost:3000".to_string()),
            db_path: std::env::var("DB_PATH")
                .unwrap_or_else(|_| "orchestra_box_office.db".to_string()),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_config_from_env() {
        let config = Config::from_env();
        assert!(!config.api_base_url.is_empty());
        assert!(!config.db_path.is_empty());
    }
}
