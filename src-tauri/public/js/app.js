// NUT HID GUI - Main Application Logic
import { invoke } from '@tauri-apps/api/core';

// State
let isConnected = false;
let isMonitoring = false;
let monitoringInterval = null;

// DOM Elements
const elements = {
    hostInput: document.getElementById('hostInput'),
    portInput: document.getElementById('portInput'),
    testConnectionBtn: document.getElementById('testConnectionBtn'),
    createDeviceBtn: document.getElementById('createDeviceBtn'),
    refreshStatusBtn: document.getElementById('refreshStatusBtn'),
    toggleMonitoringBtn: document.getElementById('toggleMonitoringBtn'),
    connectionStatus: document.getElementById('connectionStatus'),
    connectionResult: document.getElementById('connectionResult'),
    batteryCharge: document.getElementById('batteryCharge'),
    batteryRuntime: document.getElementById('batteryRuntime'),
    inputVoltage: document.getElementById('inputVoltage'),
    upsLoad: document.getElementById('upsLoad'),
    batteryProgress: document.getElementById('batteryProgress'),
    statusFlags: document.getElementById('statusFlags'),
    devicesList: document.getElementById('devicesList'),
    logContainer: document.getElementById('logContainer'),
    clearLogBtn: document.getElementById('clearLogBtn'),
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    log('Application started', 'info');
    setupEventListeners();
    loadDevices();
});

function setupEventListeners() {
    elements.testConnectionBtn.addEventListener('click', testConnection);
    elements.createDeviceBtn.addEventListener('click', createDevice);
    elements.refreshStatusBtn.addEventListener('click', refreshStatus);
    elements.toggleMonitoringBtn.addEventListener('click', toggleMonitoring);
    elements.clearLogBtn.addEventListener('click', clearLog);
}

// Connection Functions
async function testConnection() {
    const host = elements.hostInput.value.trim();
    const port = parseInt(elements.portInput.value);

    if (!host) {
        showConnectionResult('Please enter a host', 'error');
        return;
    }

    log(`Testing connection to ${host}:${port}...`, 'info');
    setButtonState(elements.testConnectionBtn, true);

    try {
        const result = await invoke('test_connection', { host, port });
        
        if (result.success) {
            isConnected = true;
            updateConnectionStatus(true);
            showConnectionResult(result.message, 'success');
            log(`Connected to UPS: ${result.ups_name} - ${result.ups_description}`, 'success');
            
            // Enable device creation
            elements.createDeviceBtn.disabled = false;
            elements.refreshStatusBtn.disabled = false;
            elements.toggleMonitoringBtn.disabled = false;
            
            // Load initial status
            refreshStatus();
        } else {
            showConnectionResult(result.message || 'Connection failed', 'error');
            log(`Connection failed: ${result.message}`, 'error');
        }
    } catch (error) {
        showConnectionResult(`Error: ${error}`, 'error');
        log(`Connection error: ${error}`, 'error');
    } finally {
        setButtonState(elements.testConnectionBtn, false);
    }
}

async function createDevice() {
    const backend = 'nut';
    
    log('Creating virtual HID device...', 'info');
    setButtonState(elements.createDeviceBtn, true);

    try {
        const result = await invoke('create_device', { backend });
        
        if (result.success) {
            log(`Device created: ${result.instance_id}`, 'success');
            showConnectionResult(result.message, 'success');
            
            // Add to devices list
            addDeviceToList({
                instance_id: result.instance_id,
                backend: backend,
                host: elements.hostInput.value,
                port: parseInt(elements.portInput.value),
                created_at: new Date().toISOString(),
            });
        } else {
            showConnectionResult(result.message || 'Failed to create device', 'error');
            log(`Device creation failed: ${result.message}`, 'error');
        }
    } catch (error) {
        showConnectionResult(`Error: ${error}`, 'error');
        log(`Device creation error: ${error}`, 'error');
    } finally {
        setButtonState(elements.createDeviceBtn, false);
    }
}

// Status Functions
async function refreshStatus() {
    if (!isConnected) return;

    log('Refreshing UPS status...', 'info');

    try {
        const status = await invoke('get_ups_status');
        updateStatusDisplay(status);
        log('Status updated', 'info');
    } catch (error) {
        log(`Status refresh error: ${error}`, 'error');
    }
}

function updateStatusDisplay(status) {
    // Battery charge
    elements.batteryCharge.textContent = `${status.battery_charge}%`;
    elements.batteryProgress.style.width = `${status.battery_charge}%`;
    
    // Runtime (convert seconds to MM:SS)
    const minutes = Math.floor(status.battery_runtime / 60);
    const seconds = status.battery_runtime % 60;
    elements.batteryRuntime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Voltage
    elements.inputVoltage.textContent = status.input_voltage 
        ? `${status.input_voltage.toFixed(1)} V` 
        : '-- V';
    
    // Load
    elements.upsLoad.textContent = status.ups_load 
        ? `${status.ups_load}%` 
        : '--%';
    
    // Status flags
    updateStatusFlags(status.status_flags);
}

function updateStatusFlags(flags) {
    const flagElements = elements.statusFlags.querySelectorAll('.flag-item');
    
    flagElements.forEach(flagEl => {
        const flagName = flagEl.dataset.flag;
        const isActive = flags[flagName] === true;
        
        flagEl.classList.toggle('active', isActive);
        flagEl.classList.toggle('inactive', !isActive);
    });
}

async function toggleMonitoring() {
    if (isMonitoring) {
        stopMonitoring();
    } else {
        startMonitoring();
    }
}

function startMonitoring() {
    isMonitoring = true;
    elements.toggleMonitoringBtn.innerHTML = '<span class="btn-icon">⏹️</span> Stop Monitoring';
    log('Monitoring started', 'info');
    
    // Refresh every 5 seconds
    monitoringInterval = setInterval(refreshStatus, 5000);
}

function stopMonitoring() {
    isMonitoring = false;
    elements.toggleMonitoringBtn.innerHTML = '<span class="btn-icon">▶️</span> Start Monitoring';
    log('Monitoring stopped', 'info');
    
    if (monitoringInterval) {
        clearInterval(monitoringInterval);
        monitoringInterval = null;
    }
}

// Device Management
async function loadDevices() {
    try {
        const devices = await invoke('list_devices');
        devices.forEach(device => addDeviceToList(device));
    } catch (error) {
        log(`Failed to load devices: ${error}`, 'error');
    }
}

function addDeviceToList(device) {
    const emptyState = elements.devicesList.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }

    const deviceEl = document.createElement('div');
    deviceEl.className = 'device-item';
    deviceEl.innerHTML = `
        <div class="device-info">
            <h4>${device.backend.toUpperCase()} Device</h4>
            <p>${device.host}:${device.port} | Created: ${formatDate(device.created_at)}</p>
            <p class="device-id">${device.instance_id}</p>
        </div>
        <div class="device-actions">
            <button class="btn btn-danger btn-small" onclick="removeDevice('${device.instance_id}')">
                Remove
            </button>
        </div>
    `;
    
    elements.devicesList.appendChild(deviceEl);
}

async function removeDevice(instanceId) {
    log(`Removing device: ${instanceId}`, 'info');
    
    try {
        const result = await invoke('remove_device', { instance_id: instanceId });
        log(result, 'info');
        
        // Remove from UI
        const deviceEl = Array.from(elements.devicesList.children)
            .find(el => el.textContent.includes(instanceId));
        if (deviceEl) {
            deviceEl.remove();
        }
        
        // Show empty state if no devices
        if (elements.devicesList.children.length === 0) {
            elements.devicesList.innerHTML = `
                <div class="empty-state">
                    <p>No virtual devices created</p>
                    <p class="hint">Connect to a NUT server and click "Create Virtual Device"</p>
                </div>
            `;
        }
    } catch (error) {
        log(`Remove error: ${error}`, 'error');
    }
}

// UI Helpers
function updateConnectionStatus(connected) {
    const indicator = elements.connectionStatus.querySelector('.status-indicator');
    const text = elements.connectionStatus.querySelector('.status-text');
    
    if (connected) {
        indicator.classList.remove('disconnected');
        indicator.classList.add('connected');
        text.textContent = 'Connected';
    } else {
        indicator.classList.remove('connected');
        indicator.classList.add('disconnected');
        text.textContent = 'Disconnected';
    }
}

function showConnectionResult(message, type) {
    elements.connectionResult.textContent = message;
    elements.connectionResult.className = `result-message ${type}`;
    elements.connectionResult.classList.remove('hidden');
}

function setButtonState(btn, disabled) {
    btn.disabled = disabled;
}

function log(message, level = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const logEl = document.createElement('div');
    logEl.className = 'log-entry';
    logEl.innerHTML = `
        <span class="log-timestamp">[${timestamp}]</span>
        <span class="log-level-${level}">${level.toUpperCase()}:</span>
        <span>${message}</span>
    `;
    
    elements.logContainer.appendChild(logEl);
    elements.logContainer.scrollTop = elements.logContainer.scrollHeight;
}

function clearLog() {
    elements.logContainer.innerHTML = '';
    log('Log cleared', 'info');
}

function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString();
}

// Make removeDevice available globally
window.removeDevice = removeDevice;
