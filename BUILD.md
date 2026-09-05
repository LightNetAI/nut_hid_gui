# NUT HID GUI - Build Instructions

## Prerequisites

1. **Rust Toolchain**
   ```bash
   rustup install nightly
   rustup default nightly
   ```

2. **Node.js** (for Tauri frontend)
   - Download from https://nodejs.org/
   - Or via winget: `winget install OpenJS.NodeJS.LTS`

3. **Visual Studio Build Tools**
   - Download from https://visualstudio.microsoft.com/downloads/
   - Install "Desktop development with C++" workload

4. **NUT HID Driver** (must be installed first)
   ```powershell
   cd ..\nut_hid_driver
   pnputil.exe /add-driver nut_hid_driver.inf /install
   ```

## Building

### Option 1: Full Build (Recommended)

```bash
# Install Node dependencies
npm install

# Build in release mode
cargo tauri build

# Output will be in target/release/msi/ and target/release/nsis/
```

### Option 2: Development Mode

```bash
# Run in development mode with hot reload
cargo tauri dev
```

## Project Structure

```
nut_hid_gui/
├── Cargo.toml              # Rust dependencies
├── tauri.conf.json         # Tauri configuration
├── build.rs                # Tauri build script
├── src/
│   ├── main.rs             # Rust entry point
│   ├── commands.rs         # Tauri commands (Rust backend)
│   └── state.rs            # Application state
├── index.html              # Main HTML file
├── css/
│   └── styles.css          # Application styles
├── js/
│   └── app.js              # Frontend logic
├── icons/                  # Application icons
└── package.json            # Node dependencies (auto-generated)
```

## Usage

1. **Launch the application**
   - Double-click `NUT HID Configurator.exe` or run from command line

2. **Connect to NUT Server**
   - Enter the hostname/IP of your NUT server
   - Set the port (default: 3493)
   - Click "Test Connection"

3. **Create Virtual Device**
   - Once connected, click "Create Virtual Device"
   - Windows will detect a new "HID UPS Battery" device
   - The device will appear in Device Manager

4. **Monitor UPS Status**
   - Click "Start Monitoring" for automatic updates
   - View battery level, runtime, and status flags
   - Click "Refresh Status" for manual updates

5. **Manage Devices**
   - View created devices in the "Virtual Devices" panel
   - Remove devices when no longer needed

## Troubleshooting

### Driver Not Installed
```
Error: Driver not found
```
**Solution:** Install the nut_hid_driver first:
```powershell
pnputil.exe /add-driver ..\nut_hid_driver\nut_hid_driver.inf /install
```

### Connection Failed
```
Error: Connection failed: [error details]
```
**Solution:**
- Verify NUT server is running: `systemctl status nut-server` (Linux) or check Windows service
- Check firewall settings for port 3493
- Verify hostname/IP is correct

### Device Creation Fails
```
Error: COM init failed
```
**Solution:**
- Run application as Administrator
- Ensure nut_hid_driver is properly installed
- Check Windows Event Log for driver errors

### UPS Status Shows "--"
**Solution:**
- Ensure NUT server has the UPS connected and working
- Test with `upsc <ups_name>@localhost` command
- Some NUT variables may not be supported by your UPS model

## Advanced Configuration

### Custom HID Descriptor

To modify the HID report descriptor (for advanced users):

1. Edit `../nut_hid_device/src/nut.rs`
2. Modify the `UPS_REPORT_DESCRIPTOR` array
3. Rebuild both the driver and GUI

### Logging

Enable debug logging by setting environment variable:
```bash
$env:RUST_LOG="debug"
cargo tauri dev
```

## License

Apache 2.0 - Same as parent nut_hid project

## Contributing

Contributions welcome! Areas for improvement:
- [ ] Support for multiple simultaneous devices
- [ ] UPS command support (shutdown, reboot, test)
- [ ] System tray integration with status icon
- [ ] Auto-start on Windows boot
- [ ] Export/import device configurations
- [ ] Graph/history of UPS metrics
