use std::sync::Arc;
use parking_lot::RwLock;
use rups::blocking::Connection;
use rups::{ConfigBuilder, ClientError};

/// Application state shared between Rust backend and frontend
#[derive(Default)]
pub struct AppState {
    /// Current NUT connection
    pub connection: RwLock<Option<Arc<RwLock<ConnectionState>>>>,
    /// Created virtual devices
    pub devices: RwLock<Vec<DeviceInfo>>,
    /// Monitoring state
    pub monitoring: RwLock<Option<MonitoringState>>,
}

pub struct ConnectionState {
    pub host: String,
    pub port: u16,
    pub connected: bool,
    pub ups_name: String,
    pub ups_description: String,
}

pub struct DeviceInfo {
    pub instance_id: String,
    pub backend: String,
    pub host: String,
    pub port: u32,
    pub created_at: chrono::DateTime<chrono::Local>,
}

pub struct MonitoringState {
    pub active: bool,
    pub ups_status: UpsStatus,
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct UpsStatus {
    pub battery_charge: u8,
    pub battery_runtime: u32,  // seconds
    pub input_voltage: Option<f32>,
    pub output_voltage: Option<f32>,
    pub ups_load: Option<u8>,
    pub status_flags: StatusFlags,
    pub last_update: chrono::DateTime<chrono::Local>,
}

#[derive(Debug, Clone, serde::Serialize, Default)]
pub struct StatusFlags {
    pub online: bool,
    pub charging: bool,
    pub discharging: bool,
    pub low_battery: bool,
    pub fully_charged: bool,
    pub communication_lost: bool,
    pub overload: bool,
    pub shutdown_requested: bool,
    pub shutdown_imminent: bool,
}

impl Default for ConnectionState {
    fn default() -> Self {
        Self {
            host: String::new(),
            port: 3493,
            connected: false,
            ups_name: String::new(),
            ups_description: String::new(),
        }
    }
}

impl Default for UpsStatus {
    fn default() -> Self {
        Self {
            battery_charge: 0,
            battery_runtime: 0,
            input_voltage: None,
            output_voltage: None,
            ups_load: None,
            status_flags: StatusFlags::default(),
            last_update: chrono::Local::now(),
        }
    }
}
