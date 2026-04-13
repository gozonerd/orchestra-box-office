// Tauri entry point for the desktop application

#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use orchestra_box_office_lib::initialize_app;
use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            // Tauri commands will be registered here
            // See src-tauri/lib.rs
        ])
        .setup(|app| {
            initialize_app(app)?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
