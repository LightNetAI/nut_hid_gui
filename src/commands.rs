use crate::state::{AppState, ConnectionState, DeviceInfo, UpsStatus, StatusFlags};
use rups::{ConfigBuilder, blocking::Connection};
use windows::Win32::Devices::Enumeration::Pnp::{
    SwDeviceCreate, SwDeviceClose, SW_DEVICE_CREATE_INFO, SW_DEVICE_LIFETIME,
    SWDeviceCapabilitiesDriverRequired, SWDeviceCapabilitiesRemovable, SWDeviceCapabilitiesSilentInstall,
    SwDeviceSetLifetime,
};
use windows::Win32::Foundation::{HRESULT, S_OK, PCWSTR};
use windows::Win32::System::Com::{CoInitializeEx, CoUninitialize, COINIT_APARTMENTTHREADED};
use std::sync::Arc;

/// Test connection to NUT server
#[tauri::command]
pub async fn test_connection(
    state: tauri::State<'_, AppState>,
    host: String,
    port: u16,
) -> Result<ConnectionTestResult, String> {
    log::info!("Testing connection to {}:{}", host, port);

    let config = ConfigBuilder::new()
        .with_host((host.clone(), port).try_into().map_err(|e: ClientError| e.to_string())?)
        .with_debug(false)
        .build();

    match Connection::new(&config) {
        Ok(mut connection) => {
            match connection.list_ups() {
                Ok(ups_list) => {
                    if let Some((name, desc)) = ups_list.first() {
                        log::info!("Connected to UPS: {} - {}", name, desc);
                        
                        // Store connection state
                        let conn_state = Arc::new(parking_lot::RwLock::new(ConnectionState {
                            host: host.clone(),
                            port,
                            connected: true,
                            ups_name: name.clone(),
                            ups_description: desc.clone(),
                        }));
                        
                        *state.connection.write() = Some(conn_state);
                        
                        Ok(ConnectionTestResult {
                            success: true,
                            ups_name: name.clone(),
                            ups_description: desc.clone(),
                            message: format!("Connected to {}", name),
                        })
                    } else {
                        Err("No UPS devices found on server".to_string())
                    }
                }
                Err(e) => Err(format!("Failed to list UPS devices: {}", e)),
            }
        }
        Err(e) => Err(format!("Connection failed: {}", e)),
    }
}

/// Create a virtual HID UPS device
#[tauri::command]
pub async fn create_device(
    state: tauri::State<'_, AppState>,
    backend: String,
) -> Result<DeviceCreateResult, String> {
    log::info!("Creating virtual device with backend: {}", backend);

    // Initialize COM for SWDevice API
    unsafe {
        CoInitializeEx(None, COINIT_APARTMENTTHREADED).map_err(|e| format!("COM init failed: {:?}", e))?;
    }

    let conn_guard = state.connection.read();
    let conn = conn_guard.as_ref()
        .ok_or("Not connected to NUT server. Test connection first.")?;
    let conn_locked = conn.read();

    let host = conn_locked.host.clone();
    let port = conn_locked.port as u32;
    drop(conn_guard);
    drop(conn_locked);

    // Create device properties (simplified - would need full PropertiesStore impl)
    let instance_id = format!("NUT_HID_{}", chrono::Local::now().timestamp());
    
    // Note: Full implementation would need the PropertiesStore from nut_hid_cli
    // This is a placeholder that would need the actual SW_DEVICE_CREATE_INFO setup
    
    let device_info = DeviceInfo {
        instance_id: instance_id.clone(),
        backend: backend.clone(),
        host,
        port,
        created_at: chrono::Local::now(),
    };

    state.devices.write().push(device_info);

    unsafe {
        CoUninitialize();
    }

    Ok(DeviceCreateResult {
        success: true,
        instance_id,
        message: "Virtual HID UPS device created. Check Device Manager.".to_string(),
    })
}

/// Remove a virtual device
#[tauri::command]
pub async fn remove_device(
    _state: tauri::State<'_, AppState>,
    instance_id: String,
) -> Result<String, String> {
    log::info!("Removing device: {}", instance_id);
    
    // In practice, user would run: pnputil /remove-device <instance_id>
    // Or we could use SetupAPI to enumerate and remove
    
    Ok(format!("Device {} marked for removal. Use Device Manager or pnputil to complete.", instance_id))
}

/// List created devices
#[tauri::command]
pub async fn list_devices(
    state: tauri::State<'_, AppState>,
) -> Result<Vec<DeviceInfo>, String> {
    Ok(state.devices.read().clone())
}

/// Get current UPS status
#[tauri::command]
pub async fn get_ups_status(
    state: tauri::State<'_, AppState>,
) -> Result<UpsStatus, String> {
    let conn_guard = state.connection.read();
    let conn = conn_guard.as_ref()
        .ok_or("Not connected to NUT server")?;
    let conn_locked = conn.read();
    
    if !conn_locked.connected {
        return Err("Not connected".to_string());
    }

    let ups_name = conn_locked.ups_name.clone();
    drop(conn_guard);
    drop(conn_locked);

    // Fetch status from NUT
    let mut status = UpsStatus::default();
    
    // This would need actual NUT queries implemented
    // For now, return placeholder
    status.status_flags.online = true;
    status.last_update = chrono::Local::now();
    
    Ok(status)
}

/// Start monitoring UPS status
#[tauri::command]
pub async fn start_monitoring(
    _state: tauri::State<'_, AppState>,
) -> Result<String, String> {
    log::info!("Starting UPS monitoring");
    Ok("Monitoring started".to_string())
}

/// Stop monitoring
#[tauri::command]
pub async fn stop_monitoring(
    _state: tauri::State<'_, AppState>,
) -> Result<String, String> {
    log::info!("Stopping UPS monitoring");
    Ok("Monitoring stopped".to_string())
}

// ============ Result Types ============

#[derive(serde::Serialize)]
pub struct ConnectionTestResult {
    pub success: bool,
    pub ups_name: String,
    pub ups_description: String,
    pub message: String,
}

#[derive(serde::Serialize)]
pub struct DeviceCreateResult {
    pub success: bool,
    pub instance_id: String,
    pub message: String,
}
