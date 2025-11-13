# Forge OS

A fully functional Windows 99-style operating system interface for Arma 3, featuring a complete desktop environment, interactive applications, and seamless multiplayer integration.

![Arma 3](https://img.shields.io/badge/Arma%203-Compatible-green)
![Version](https://img.shields.io/badge/Version-2.0.0-blue)

## Overview

**Forge OS** brings a vintage Windows 98/99 computing experience into Arma 3. Players can interact with a fully functional operating system through in-game computer terminals, complete with draggable windows, functional applications, and multiplayer synchronization. Perfect for role-playing scenarios, mission briefings, intelligence coordination, and immersive gameplay experiences.

## Features

### 🖥️ Desktop Environment
- **Authentic Windows 98/99 aesthetic** with retro UI elements
- **Window management system** - Draggable, resizable, minimizable windows
- **Start menu** with organized program categories
- **Taskbar** with active window tracking
- **Desktop shortcuts** with custom icons
- **Wallpaper system** with customization support

### 📱 Applications

#### Notepad
- Create, edit, and save text files
- Full file menu (New, Open, Save)
- Edit operations (Cut, Copy, Paste, Select All)
- Persistent storage across game sessions

#### Messenger
- Real-time multiplayer chat system
- Player list with online status indicators
- Status updates (Online, Away, Busy)
- Message history and notifications
- CBA event-based synchronization

#### Calendar
- Event creation with title, date, time, and location
- Event list view with color coding
- Event management (create, delete)
- Persistent event storage

#### Internet Explorer
- In-game web browser interface
- Custom web applications support
- Navigation controls and address bar
- Iframe-based page rendering

#### SNet Intelligence Center
- Mission briefing viewer
- Intelligence document browser
- Media viewer (images, videos, audio)
- Markdown rendering support
- Categorized file system (Operations, Intel, Surveillance)

### 🌐 Multiplayer Features
- **Synchronized player chat** across all connected clients
- **Real-time status updates** for all players
- **Shared calendar events** visible to all team members
- **CBA event system** for efficient network communication
- **Server-authoritative** player tracking and data management

## Requirements

### Arma 3 Mods
- **[CBA_A3](https://steamcommunity.com/workshop/filedetails/?id=450814997)** - Community Base Addons (Required)
- **[ACE3](https://steamcommunity.com/workshop/filedetails/?id=463939057)** - Advanced Combat Environment (Required)

### Development Tools (Optional)
- **Python 3.7+** - For asset processing tools
- **PyInstaller** - For building standalone executables

## Installation

### For Players

1. Subscribe to the required mods on Steam Workshop:
   - [CBA_A3](https://steamcommunity.com/workshop/filedetails/?id=450814997)
   - [ACE3](https://steamcommunity.com/workshop/filedetails/?id=463939057)

2. Enable the mods in Arma 3 Launcher

3. Load the **forge_os_bare.VR** mission from the Virtual Reality map

4. In-game, approach a keyboard object and use ACE interaction (Windows key by default) to select "Open OS"

### For Developers

1. Clone this repository into your Arma 3 missions folder:
   ```bash
   git clone https://github.com/yourusername/forge_os.git
   cd forge_os
   ```

2. Install Python development tools (optional):
   ```bash
   cd mpmissions/forge_os_bare.VR/Win99UI/tools
   pip install -r requirements.txt
   ```

3. Edit mission files in your preferred code editor

4. Test in Arma 3 editor or dedicated server

## Architecture

### Technology Stack

- **Backend**: SQF (Arma 3 scripting language)
- **Frontend**: HTML/CSS/JavaScript with Windows 98/99 UI theme
- **Bridge**: Arma 3 ↔ CEF browser communication via JSDialog events
- **State Management**: HashMapObject pattern for object-oriented design
- **Networking**: CBA event system for multiplayer synchronization
- **Storage**: Profile namespace for persistent client data

### Project Structure

```
forge_os/
├── mpmissions/
│   └── forge_os_bare.VR/
│       ├── Win99/                  # Backend SQF modules
│       │   ├── main/              # Core initialization
│       │   ├── calendar/          # Calendar application
│       │   ├── messenger/         # Messenger application
│       │   ├── notepad/           # Notepad application
│       │   ├── snet/              # Intelligence system
│       │   └── network/           # Network utilities
│       │
│       ├── Win99UI/               # Frontend JavaScript
│       │   ├── index.html         # Entry point
│       │   ├── js/                # Core JS modules
│       │   │   ├── main.js        # OS orchestrator
│       │   │   ├── config.js      # System configuration
│       │   │   ├── loader.js      # Component loader
│       │   │   ├── a3bridge.js    # Arma-browser bridge
│       │   │   └── globalFunctions.js
│       │   │
│       │   ├── apps/              # Applications
│       │   │   ├── calendar.js
│       │   │   ├── messenger.js
│       │   │   ├── notepad.js
│       │   │   ├── snet.js
│       │   │   ├── internetexplorer.js
│       │   │   └── helpers/       # Shared utilities
│       │   │
│       │   ├── components/        # UI components
│       │   │   ├── desktop/
│       │   │   ├── window/
│       │   │   ├── taskbar/
│       │   │   ├── startmenu/
│       │   │   └── dialog/
│       │   │
│       │   ├── styles/            # CSS files
│       │   └── tools/             # Build utilities
│       │
│       ├── snet/                  # Intelligence data
│       │   ├── ops/briefings/
│       │   ├── intel/
│       │   └── surveillance/
│       │
│       ├── init.sqf               # Mission initialization
│       ├── initServer.sqf         # Server initialization
│       ├── initPlayerLocal.sqf    # Client initialization
│       └── description.ext        # Mission config
```

### Modern Architecture: HashMapObject Pattern

Forge OS 2.0 uses a modern object-oriented architecture with HashMapObject instances for state management:

**Benefits:**
- Encapsulated state per application
- Clean API surface with public methods
- Independent data management
- Better multiplayer synchronization
- Easier testing and debugging

**Example:**
```sqf
// Create a Calendar instance
private _calendar = [] call win99_calendar_fnc_createCalendar;

// Call methods
_calendar call ["createEvent", [_eventData]];
_calendar call ["deleteEvent", [_eventId]];
```

### Communication Flow

#### Browser → Arma (Client-Side)
1. JavaScript calls `A3Bridge.sendCommand(command, data)`
2. Command formatted as JSON and sent via `alert()`
3. CEF triggers `JSDialog` event in Arma
4. `initPlayerLocal.sqf` event handler routes to HashMapObject
5. HashMapObject processes command and triggers CBA events if needed

#### Arma → Browser
1. SQF executes `_ctrl ctrlWebBrowserAction ["ExecJS", "functionName(args)"]`
2. JavaScript function executes in browser context
3. UI updates accordingly

## Development

### Asset Processing Tools

Located in `mpmissions/forge_os_bare.VR/Win99UI/tools/`

#### compress_css.py (Recommended)
Compresses CSS files using zlib + base64 encoding.

```bash
python compress_css.py
# Enter: .. (recursive) or . (current directory only)
```

**Output:** `.css.b64` files ready for framework

#### media_to_base64.py
Converts media files to base64 encoding.

```bash
python media_to_base64.py
# Supports: .png, .jpg, .jpeg, .mp3, .mp4, .webm, .md
```

**Output:** `.b64` files for media assets

#### package_css.py (Advanced)
Advanced CSS packaging with multiple compression options.

⚠️ **Note:** Framework currently only supports zlib compression. Use `compress_css.py` for production.

### Building Executables

```bash
python -m PyInstaller --onefile --name compress_css Win99UI\tools\compress_css.py
python -m PyInstaller --onefile --name media_to_base64 Win99UI\tools\media_to_base64.py
```

Executables will be created in `dist/` directory.

### Adding New Applications

1. **Create SQF module** in `Win99/your_app/`
   - Implement `fnc_createYourApp.sqf` with HashMapObject
   - Define methods for data management
   - Add XEH files for initialization

2. **Create JavaScript application** in `Win99UI/apps/`
   - Extend base application class
   - Implement UI rendering
   - Use `A3Bridge` for backend communication

3. **Register in config** (`Win99UI/js/config.js`)
   - Add to applications registry
   - Define start menu entry
   - Configure desktop shortcut (optional)

4. **Add event handlers** in `initPlayerLocal.sqf`
   - Route commands to HashMapObject methods

### Best Practices

- **Use HashMapObject** for stateful components
- **Client-side processing** whenever possible for performance
- **CBA events** for multiplayer synchronization only when needed
- **Profile namespace** for persistent client data
- **Compress assets** using provided tools before deployment
- **Document your code** with JSDoc comments
- **Follow existing patterns** in codebase for consistency

## Documentation

Comprehensive documentation available in the mission folder:

- **[codebase-summary.md](mpmissions/forge_os_bare.VR/codebase-summary.md)** - Complete technical overview
- **[workshop-readme.md](mpmissions/forge_os_bare.VR/workshop-readme.md)** - Steam Workshop description
- **[Win99UI/tools/README.md](mpmissions/forge_os_bare.VR/Win99UI/tools/README.md)** - Asset processing tools guide
- **[snet/ops/briefings/](mpmissions/forge_os_bare.VR/snet/ops/briefings/)** - Example mission briefings

## Version History

### v2.0.0 - Architecture Overhaul (Current)
- Migrated to HashMapObject architecture for all applications
- Client-side event handling for improved performance
- Enhanced multiplayer synchronization
- Comprehensive documentation and code cleanup
- Fixed timestamp tracking in database systems
- Deprecated legacy centralized event handler

### v1.0.0 - Initial Release
- Full desktop environment with window management
- 5 functional applications (Notepad, Messenger, Calendar, Browser, SNet)
- Multiplayer synchronization via server-side handlers
- Persistent data storage
- Windows 98/99 retro UI aesthetic

## Known Limitations

- **Single OS instance** - Currently hardcoded to "OS1"
- **Email module** - Stub implementation, not fully functional
- **Screen mirroring** - Physical screen display needs modernization
- **CSS compression** - Framework only supports zlib (not gzip/brotli)
- **CSS minification** - Not yet supported by loader

## Contributing

Contributions are welcome! Areas that need help:

1. **Screen Mirroring System** - Modernize to work with HashMapObject architecture
2. **Email Module** - Complete implementation
3. **Additional Applications** - Create new apps (File Explorer, Paint, etc.)
4. **UI Improvements** - Enhance visual polish and animations
5. **Documentation** - Add tutorials and guides

### Contribution Guidelines

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Follow existing code patterns and architecture
4. Document your changes
5. Test thoroughly in multiplayer
6. Submit a pull request

## Credits

**Mission Design & Development:** J. Schmidt  
**Icons & Textures:** VolumeInfinite  
**UI Framework:** Windows 98 CSS Recreation  
**Dependencies:** CBA_A3, ACE3  
**Community:** Arma 3 modding community

## License

This project is provided as-is for the Arma 3 community. Please respect CBA and ACE3 licensing terms.

## Support

- **Issues:** Report bugs via GitHub Issues
- **Discord:** Join our community Discord server
- **Workshop:** Discuss on Steam Workshop page
- **Documentation:** Review comprehensive docs in mission folder

---

**Built for the Arma 3 community**
