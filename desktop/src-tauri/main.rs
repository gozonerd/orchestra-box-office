// Tauri entry point for the desktop application

#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use orchestra_box_office_lib::{
    initialize_app,
    commands::*,
    db::DbConnection,
};
use std::sync::Mutex;
use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            create_pipeline,
            get_pipeline,
            list_pipelines,
            update_pipeline,
            delete_pipeline,
            create_pipeline_run,
            get_pipeline_run,
            list_pipeline_runs,
            list_all_pipeline_runs,
            update_pipeline_run_status,
            complete_pipeline_run,
            create_budget,
            get_budget,
            list_budgets,
            list_all_budgets,
            update_budget,
            delete_budget,
            get_sync_status,
        ])
        .setup(|app| {
            initialize_app(app)?;

            // Initialize database and store in app state
            let app_handle = app.app_handle().clone();
            let app_data_dir = app_handle.path().app_data_dir()
                .map_err(|e| format!("Failed to get app data dir: {}", e))?;

            std::fs::create_dir_all(&app_data_dir)
                .map_err(|e| format!("Failed to create app data dir: {}", e))?;

            let db_path = app_data_dir.join("orchestra.db");
            let db = DbConnection::open(&db_path)
                .map_err(|e| format!("Failed to open database: {}", e))?;

            db.init_schema()
                .map_err(|e| format!("Failed to initialize schema: {}", e))?;

            // Store database in app state
            app_handle.manage(Mutex::new(Some(db)));

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
