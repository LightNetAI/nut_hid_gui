# NUT HID GUI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Rust](https://img.shields.io/badge/rust-nightly-orange.svg)](https://www.rust-lang.org)
[![Tauri](https://img.shields.io/badge/tauri-v2.0-24C8DB.svg?logo=tauri)](https://tauri.app)

A modern graphical user interface for configuring and managing [NUT HID](https://github.com/elupus/nut_hid) virtual UPS devices on Windows. Makes your network UPS appear as a locally connected USB HID UPS to Windows 11.

![NUT HID GUI Screenshot](docs/screenshot.png)

## ✨ Features

- 🔌 **Easy NUT Server Connection** - Test and configure connection to Network UPS Tools servers
- 🖥️ **Virtual Device Creation** - Create virtual HID UPS devices with one click
- 📊 **Real-time Monitoring** - View battery level, runtime, voltage, and status flags
- 🎨 **Modern Dark UI** - Beautiful Windows 11-inspired dark theme
- 📝 **Event Logging** - Timestamped, color-coded activity logs
- ⚡ **Windows Integration** - Works with native `HidBatt.sys` driver

## 🏗️ Architecture

```
Network UPS → NUT Server → nut_hid_gui → nut_hid_driver → HidBatt.sys → Windows Power Management
```

This GUI wraps the `nut_hid_device` and `nut_hid_cli` crates, providing a user-friendly interface for:
- Testing NUT server connectivity
- Creating virtual HID UPS devices via Windows SWDevice API
- Monitoring UPS status in real-time
- Managing multiple device configurations

## 📋 Prerequisites

- **Windows 10/11** (x64)
- **Rust nightly** toolchain
- **Node.js LTS** (v18+)
- **Visual Studio Build Tools** with C++ workload
- **NUT HID Driver** installed (`pnputil /add-driver nut_hid_driver.inf /install`)
- **NUT Server** running on your network (Linux/Windows/BSD)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install Rust nightly
rustup install nightly
rustup default nightly

# Install Node.js (winget)
winget install OpenJS.NodeJS.LTS

# Install VS Build Tools (download from Microsoft)
# https://visualstudio.microsoft.com/downloads/
# Select "Desktop development with C++" workload
```

### 2. Install NUT HID Driver

```powershell
# As Administrator
cd ..\nut_hid_driver
pnputil.exe /add-driver nut_hid_driver.inf /install
```

### 3. Build the GUI

```bash
cd nut_hid_gui

# Install Node dependencies (if prompted)
npm install

# Build release version
cargo tauri build

# Or run in development mode
cargo tauri dev
```

The installer will be in `target/release/bundle/`.

## 📖 Usage

1. **Launch** `NUT HID Configurator.exe`
2. **Enter NUT Server** details (host/IP and port)
3. **Test Connection** to verify connectivity
4. **Create Virtual Device** - Windows will detect new hardware
5. **Monitor Status** - View real-time battery metrics
6. **Configure Windows Power Settings** - Set low battery actions

See [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) for detailed instructions.

## 🎯 Key Components

| Component | Description |
|-----------|-------------|
| `src/main.rs` | Tauri application entry point |
| `src/commands.rs` | IPC commands for NUT operations |
| `src/state.rs` | Shared application state |
| `index.html` | Main UI structure |
| `css/styles.css` | Dark theme styles |
| `js/app.js` | Frontend logic and event handling |

## 📚 Documentation

- [BUILD.md](BUILD.md) - Detailed build instructions
- [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) - Complete usage guide with troubleshooting
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Technical overview and features
- [architecture.html](architecture.html) - Visual system architecture diagram

## 🔧 Development

### Project Structure

```
nut_hid_gui/
├── src/
│   ├── main.rs          # Tauri entry point
│   ├── commands.rs      # Rust backend commands
│   └── state.rs         # Application state
├── index.html           # Main HTML
├── css/
│   └── styles.css       # Styles
├── js/
│   └── app.js           # Frontend logic
├── Cargo.toml           # Rust dependencies
├── tauri.conf.json      # Tauri config
└── docs/                # Documentation
```

### Build Commands

```bash
# Development mode with hot reload
cargo tauri dev

# Build release
cargo tauri build

# Build with verbose output
cargo tauri build --verbose

# Run tests (when added)
cargo test
```

### Logging

Enable debug logging:

```bash
$env:RUST_LOG="nut_hid_gui=debug,info"
cargo tauri dev
```

## 🤝 Contributing

Contributions welcome! Areas for improvement:

- [ ] UPS command support (shutdown, reboot, battery test)
- [ ] Multiple simultaneous device support
- [ ] System tray integration
- [ ] Auto-start on Windows boot
- [ ] Graph/history of UPS metrics
- [ ] NUT authentication support
- [ ] Configuration profiles (import/export)

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- **Original nut_hid project**: [Joakim Plate (@elupus)](https://github.com/elupus/nut_hid)
- **Network UPS Tools**: [NUT Project](https://networkupstools.org/)
- **Tauri Framework**: [Tauri Apps](https://tauri.app/)
- **windows-rs**: [Microsoft](https://github.com/microsoft/windows-rs)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This software is provided "as is" without warranty of any kind. Use at your own risk. The authors are not responsible for any damage or data loss resulting from the use of this software.

Always test UPS shutdown behavior in a controlled environment before relying on it for production systems.

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/nut_hid_gui/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YOUR_USERNAME/nut_hid_gui/discussions)
- **NUT HID Original**: [elupus/nut_hid](https://github.com/elupus/nut_hid)

## 🌟 Show Your Support

If you find this project useful, please consider:
- ⭐ Starring this repository
- 🐛 Reporting bugs and suggesting features
- 📝 Contributing improvements
- 🔗 Sharing with others who might benefit

---

**Made with ❤️ using Rust and Tauri**
