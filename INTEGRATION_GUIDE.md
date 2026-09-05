# NUT HID Complete Integration Guide

This guide explains how to use the complete NUT HID solution to make your network UPS appear as a locally connected USB UPS on Windows 11.

## Overview

The solution consists of three components:

1. **nut_hid_driver** - Windows UMDF HID driver (kernel interface)
2. **nut_hid_cli** - Command-line tool for device creation
3. **nut_hid_gui** - Graphical user interface (this package)

## How It Works

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Network UPS    │────▶│  NUT Server      │────▶│  nut_hid_driver │
│  (SNMP/USB)     │     │  (Linux/Windows) │     │  (Windows)      │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                                                          ▼
                                                 ┌──────────────────┐
                                                 │  Windows HidBatt │
                                                 │  (Native Driver) │
                                                 └────────┬─────────┘
                                                          │
                                                          ▼
                                                 ┌──────────────────┐
                                                 │  Windows Power   │
                                                 │  Management      │
                                                 └──────────────────┘
```

The `nut_hid_driver` creates a virtual HID device that:
- Connects to your NUT server over the network
- Polls UPS status (battery level, runtime, voltage, etc.)
- Presents this data via HID reports matching the USB Power Device Class
- Windows' built-in `HidBatt.sys` driver recognizes it as a native UPS

## Installation

### Step 1: Install the Driver

**On Windows (as Administrator):**

```powershell
# Navigate to the driver directory
cd nut_hid_driver

# Install the driver
pnputil.exe /add-driver nut_hid_driver.inf /install

# Verify installation
pnputil.exe /enum-drivers | findstr nut_hid
```

You should see output like:
```
Published Name:      oemXX.inf
Driver Name:         nut_hid_driver.inf
Class Name:          HIDClass
Provider:            NUT HID Project
Date:                XX/XX/XXXX
Version:             0.1.0
```

### Step 2: Build the GUI (Optional but Recommended)

**Prerequisites:**
- Rust nightly: `rustup install nightly && rustup default nightly`
- Node.js LTS: https://nodejs.org/
- Visual Studio Build Tools with C++ workload

**Build:**

```bash
cd nut_hid_gui

# Install dependencies
npm install

# Build release
cargo tauri build
```

The installer will be in `target/release/bundle/`.

### Step 3: Configure NUT Server

Ensure your NUT server is running and accessible. Test with:

```bash
# On Linux NUT server
upsc <ups_name>@localhost

# Example output:
battery.charge: 100
battery.runtime: 7200
ups.status: OL
```

**Firewall:** Allow port 3493 (default NUT port) on your NUT server.

## Usage

### Using the GUI (Recommended)

1. **Launch** `NUT HID Configurator.exe`

2. **Connect to NUT Server**
   - Enter hostname/IP (e.g., `192.168.1.100` or `nut-server.local`)
   - Port: `3493` (default)
   - Click "Test Connection"

3. **Create Virtual Device**
   - Once connected, click "Create Virtual Device"
   - Windows will detect new hardware
   - You may see a notification: "Setting up device"

4. **Verify in Device Manager**
   - Open Device Manager (`devmgmt.msc`)
   - Look under "Batteries" for "HID UPS Battery"
   - Right-click → Properties → "This device is working properly"

5. **Monitor Status**
   - Click "Start Monitoring" in the GUI
   - View real-time battery level, runtime, and status

6. **Configure Windows Power Settings**
   - Open Control Panel → Power Options
   - Click "Change plan settings" → "Change advanced power settings"
   - Expand "Battery" section
   - Configure:
     - Low battery level: 20%
     - Critical battery level: 10%
     - Low battery action: Hibernate
     - Critical battery action: Shutdown

### Using the CLI

```bash
# Create a device
nut_hid_cli.exe --backend nut --host 192.168.1.100 --port 3493

# List devices
# (Check Device Manager or use PowerShell)

# Remove a device
pnputil.exe /remove-device <INSTANCE_ID>
```

## Verification

### Check Device Recognition

**PowerShell:**
```powershell
# List battery devices
Get-PnpDevice -Class Battery | Select-Object FriendlyName, Status, InstanceId

# Expected output:
# FriendlyName    Status   InstanceId
# ------------    ------   ----------
# HID UPS Battery OK       ROOT\NUT_HID\0001
```

### Check Windows Power Management

**Command Prompt:**
```cmd
powercfg /batteryreport
```

This generates `battery-report.html` in your user directory. Open it and verify the UPS is listed.

### Test Shutdown Behavior

**⚠️ Warning:** Only do this when you can afford a brief power interruption!

1. Unplug your UPS from the wall
2. Windows should detect "On battery power"
3. At configured battery levels, Windows will:
   - Show low battery warnings
   - Initiate hibernation/shutdown as configured

## Troubleshooting

### Device Shows "This device cannot start (Code 10)"

**Cause:** Driver loaded but failed to initialize, usually due to NUT connection issues.

**Solutions:**
1. Verify NUT server is reachable: `telnet <host> 3493`
2. Check NUT server logs: `journalctl -u nut-server` (Linux)
3. Test with CLI: `nut_hid_cli --backend nut --host <ip>`
4. Check Windows Event Log → System for nut_hid_driver errors

### UPS Status Shows "--" or Incorrect Values

**Cause:** NUT variable names differ between UPS models.

**Solutions:**
1. Check available variables: `upsc <ups_name>@<server>`
2. The driver expects: `battery.charge`, `battery.runtime`, `ups.status`
3. Edit `nut_hid_device/src/nut.rs` to map your UPS's variables
4. Rebuild and reinstall

### HidBatt.sys Not Loading

**Cause:** Windows HID Battery driver may be disabled or overridden.

**Solutions:**
1. Check service status: `sc query HidBatt`
2. Enable if disabled: `sc config HidBatt start= demand`
3. Reboot
4. In Device Manager, disable/enable the HID UPS Battery device

### Multiple UPS Devices

The current implementation supports one device per instance. For multiple UPS:

1. Create multiple virtual devices with different instance IDs
2. Each connects to a different NUT UPS name
3. Modify `nut_hid_cli` to accept `--ups-name` parameter

## Advanced Topics

### HID Report Descriptor

The HID report descriptor defines what data Windows can read from the virtual UPS. The default descriptor in `nut_hid_device/src/nut.rs` includes:

- Battery charge level (0-100%)
- Runtime remaining (seconds)
- Present status flags (online, charging, low battery, etc.)
- Voltage (if supported by UPS)

To add more fields, you must:
1. Add to the `UPS_REPORT_DESCRIPTOR` byte array
2. Add parsing logic in the `NutState::update()` function
3. Ensure the descriptor matches USB Power Device Class spec

### Custom NUT Variables

Different UPS models report different variables. Common mappings:

```rust
// In nut.rs
"battery.charge"        → Remaining capacity (%)
"battery.runtime"       → Runtime (seconds)
"ups.status"            → Status flags (OL, DISCHRG, LB, etc.)
"input.voltage"         → Input voltage
"output.voltage"        → Output voltage
"ups.load"              → UPS load (%)
```

Edit the `NutState::update()` function to query additional variables.

### Driver Signing

For production use, the driver must be signed:

1. Obtain a code signing certificate
2. Sign the driver: `signtool sign /fd SHA256 /a nut_hid_driver.sys`
3. Create catalog file: `inf2cat /driver:. /os:10_x64`
4. Sign catalog: `signtool sign /fd SHA256 nut_hid_driver.cat`

For development, use test signing:
```cmd
bcdedit /set testsigning on
```

## Security Considerations

1. **NUT Authentication**: The current implementation doesn't support NUT username/password. For secure setups:
   - Use firewall rules to restrict NUT access
   - Run NUT server on isolated network
   - Consider adding authentication to the driver

2. **Driver Privileges**: The driver runs in user-mode (UMDF), limiting potential damage from bugs.

3. **Network Security**: NUT protocol is unencrypted. Use on trusted networks only, or implement TLS tunneling.

## Performance

- **Polling Interval**: 2 seconds (hardcoded in `nut.rs`)
- **Network Overhead**: ~1KB per poll
- **CPU Usage**: <1% when idle

To adjust polling, modify `thread::sleep(Duration::from_secs(2))` in `NutDevice::read()`.

## Contributing

Areas for improvement:

- [ ] NUT authentication support
- [ ] UPS command execution (shutdown, reboot, test)
- [ ] Multiple simultaneous devices
- [ ] System tray icon with status
- [ ] Auto-start service
- [ ] Graphical history/metrics
- [ ] Export configuration profiles

## References

- [NUT Project](https://networkupstools.org/)
- [USB Power Device Class Spec](https://www.usb.org/sites/default/files/pdcv11.pdf)
- [Windows HID Battery Driver](https://learn.microsoft.com/en-us/windows-hardware/drivers/hid/hid-battery-driver)
- [nut_hid Original Project](https://github.com/elupus/nut_hid)
- [Virtual HID Framework](https://learn.microsoft.com/en-us/windows-hardware/drivers/hid/virtual-hid-framework--vhf-)

## License

Apache 2.0 - See LICENSE file

---

**Need Help?** Check the original nut_hid repository issues or the NUT mailing list.
