// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod state;

use state::AppState;

fn main() {
    // Initialize logging
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();

    log::info!("Starting NUT HID GUI");

    tauri::Builder::default()
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![
            commands::test_connection,
            commands::create_device,
            commands::remove_device,
            commands::list_devices,
            commands::get_ups_status,
            commands::start_monitoring,
            commands::stop_monitoring,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
