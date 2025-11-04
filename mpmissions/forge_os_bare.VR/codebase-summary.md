# forge_os_bare.VR - Codebase Summary

## Project Overview

**forge_os_bare.VR** is an Arma 3 mission that implements a fully functional Windows 99-style operating system interface within the game engine. The system provides an in-game computer terminal with a vintage OS aesthetic, complete with desktop environment, applications, and multiplayer communication features.

## Architecture

### Core Technology Stack
- **Engine**: Arma 3 (SQF scripting + CEF web browser integration)
- **Frontend**: HTML/CSS/JavaScript (Windows 98/99 UI theme)
- **Communication**: Arma 3 ↔ CEF browser bridge using JSDialog events
- **Data Storage**: HashMapObject instances with profile namespace persistence
- **Networking**: CBA event system for multiplayer synchronization
- **Design Pattern**: Object-oriented with HashMapObject for state management

### Project Structure

```
forge_os_bare.VR/
├── Win99/                  # Backend SQF modules
│   ├── main/              # Core initialization and event handlers
│   ├── calendar/          # Calendar application (HashMapObject)
│   ├── messenger/         # Messenger application (HashMapObject)
│   ├── notepad/           # Notepad application (HashMapObject)
│   ├── snet/              # Intelligence/Network system (HashMapObject)
│   ├── email/             # Email system (stub)
│   ├── db/                # Database functionality (LEGACY - DEPRECATED)
│   └── network/           # Network utilities
│
├── Win99UI/               # Frontend JavaScript UI
│   ├── index.html         # Main entry point with async loader
│   ├── js/                # Core JavaScript modules
│   │   ├── main.js        # Win99OS class (OS orchestrator)
│   │   ├── config.js      # System configuration (includes snetFilesystem)
│   │   ├── loader.js      # Component loader with zlib decompression
│   │   ├── a3bridge.js    # Arma 3 ↔ Browser bridge
│   │   └── globalFunctions.js  # Backend callback handlers
│   │
│   ├── apps/              # System applications
│   │   ├── calendar.js    # Events calendar
│   │   ├── internetexplorer.js  # Web browser
│   │   ├── messenger.js   # Chat/messaging
│   │   ├── notepad.js     # Text editor
│   │   ├── snet.js        # Intelligence center
│   │   ├── helpers/       # Shared helper utilities
│   │   │   ├── markdownParser.js   # Markdown to HTML converter
│   │   │   └── mediaViewers.js     # Media viewer windows
│   │   └── webapps/       # Web-based applications
│   │       ├── mail.js    # Email client
│   │       └── intranet.js  # Intranet portal
│   │
│   ├── components/        # UI components
│   │   ├── desktop/       # Desktop environment
│   │   ├── window/        # Window manager
│   │   ├── taskbar/       # Taskbar
│   │   ├── startmenu/     # Start menu
│   │   ├── overlay/       # Screen overlay
│   │   ├── wallpaper/     # Wallpaper manager
│   │   └── dialog/        # Dialog boxes
│   │
│   ├── styles/            # CSS files (.css + compressed .css.b64)
│   └── tools.7z           # Build utilities (archived)
│
├── snet/                  # Intelligence data files
│   ├── ops/               # Operations content
│   │   ├── briefings/
│   │   ├── videos/
│   │   ├── audio/
│   │   └── images/
│   ├── intel/             # Intelligence reports
│   └── surveillance/      # Surveillance data
│
├── ui/                    # Arma 3 UI resource definitions
├── init.sqf               # Mission initialization
├── initServer.sqf         # Server-side initialization
├── initPlayerLocal.sqf    # Client-side initialization
└── description.ext        # Mission configuration
```

## System Components

### 1. Initialization System (`init.sqf`)

**OS Instance Management**
- `forge_Win99OSInstances`: HashMap storing OS configurations
- `forge_Win99OSGeneration`: Unique identifier for UI texture rendering
- Each OS instance contains: screen object, keyboard object, state info, power status

**Key Functions**
- `forge_fnc_CreateOS`: Creates OS instance and attaches ACE interaction menu
- `forge_fnc_SetOSPowerOn`: Powers on display and sets UI texture
- `forge_fnc_SetOSState`: Updates OS state and syncs with browser
- `forge_fnc_OSDisplayLoad`: Handles browser control initialization

**Display System**
- Uses `RscWin99OSDisplayControl` dialog with browser control (idc 1337)
- Loads `Win99UI\index.html` into CEF browser
- Per-frame display updates for UI texture rendering

### 2. HashMapObject Architecture (NEW)

**Modern Design Pattern**:
Each application module now uses HashMapObject instances for state management:

**Module Constructors** (in each module's functions directory):
- `fnc_createCalendar.sqf` - Creates Calendar HashMapObject instance
- `fnc_createMessenger.sqf` - Creates Messenger HashMapObject instance
- `fnc_createNotepad.sqf` - Creates Notepad HashMapObject instance
- `fnc_createSNet.sqf` - Creates SNet HashMapObject instance

**Benefits**:
- Encapsulated state management per application
- Object-oriented design patterns in SQF
- Each instance manages its own data independently
- Clear API surface with public methods
- Better multiplayer synchronization

**Client-side Event Handler** (`initPlayerLocal.sqf`):
- `JSDialog` event handler processes browser commands locally
- Routes commands to appropriate HashMapObject methods
- Direct communication with app instances

### 3. Event Communication (LEGACY)

**⚠️ DEPRECATED**: The centralized server-side event handler `WIN99_handleJSAlert` in `initServer.sqf` is legacy code.

**Legacy System** (Under Migration):
The old system routed all commands through a central server handler. This has been replaced by the HashMapObject architecture where each app instance handles its own commands.

**Migration Status**:
- ✅ Calendar: Migrated to fnc_createCalendar
- ✅ Messenger: Migrated to fnc_createMessenger
- ✅ Notepad: Migrated to fnc_createNotepad
- ✅ SNet: Migrated to fnc_createSNet
- ⚠️ Legacy handlers: Retained for backward compatibility

### 4. Frontend Architecture

#### Win99OS Class (`main.js`)
Core orchestrator that manages system lifecycle:

```javascript
class Win99OS {
    async init() {
        await this.initializeBaseComponents();  // Overlay, wallpaper, window system
        await this.loadApplications();           // Load all apps from config
        await this.initializeUserInterface();    // Taskbar, start menu
        await this.initializeDesktop();          // Desktop icons
    }
    
    openApp(appName) {
        // Launches applications by class name
    }
}
```

#### Configuration System (`config.js`)
**WIN99_CONFIG** defines:
- Start menu structure with programs and actions
- Desktop shortcuts with icons and double-click handlers
- Application registry (system apps + web apps)
- SNet virtual filesystem configuration
- Each app configured with file paths and class names

#### Component Loader (`loader.js`)
Asynchronous component loading system:
- Loads HTML templates
- Loads and decompresses CSS (zlib compression)
- Dynamically injects scripts
- Manages component dependencies

#### A3 Bridge (`a3bridge.js`)
**A3Bridge** provides API for browser ↔ Arma communication:
- `A3Bridge.sendCommand(command, data)`: Send commands to Arma
- `A3Bridge.loadFile(path)`: Request file from Arma VFS
- `A3Bridge.loadIcon(texture)`: Load Arma texture as image

### 5. Applications

#### Notepad (`notepad.js`)
**Features**:
- Create, edit, save text files
- File menu (New, Open, Save)
- Edit menu (Cut, Copy, Paste, Select All)
- Files saved to profile namespace
- Persistent storage across sessions

#### Messenger (`messenger.js`)
**Features**:
- Real-time player chat
- Player list with online status
- Status updates (Online, Away, Busy)
- Message history
- Multiplayer synchronized via CBA events

#### Calendar (`calendar.js`)
**Features**:
- Event creation with title, date, time, location
- Event list view
- Event deletion
- Color-coded events
- Persistent storage in profile namespace

#### Internet Explorer (`internetexplorer.js`)
**Features**:
- URL navigation
- Web app hosting (Mail, Intranet)
- Address bar
- Navigation controls
- Iframe-based page rendering

#### SNet Intelligence Center (`snet.js`)
**Features**:
- File browser for intelligence data
- Category navigation (Operations, Intel, Surveillance)
- Media viewer (images, videos, audio, markdown)
- Base64-encoded media support
- Modular architecture with helper utilities:
  - `helpers/mediaViewers.js`: Dedicated media viewer windows
  - `helpers/markdownParser.js`: Markdown rendering engine
- Filesystem configuration in `config.js` for easy editing

### 6. Window Management System (`window.js`)

**Window Class** provides:
- Draggable windows with title bars
- Minimize, maximize, close controls
- Window focus management
- Taskbar integration
- Position and size management
- Single-instance enforcement for specific apps

**Features**:
- Cascade positioning for new windows
- Active window tracking
- Z-index management
- Window state persistence

## Module System

### Win99 Module Structure (Backend)
Each module follows CBA XEH (Extended Event Handler) pattern:

```
module_name/
├── script_component.hpp    # Component identifier
├── XEH_preStart.sqf        # Pre-initialization
├── XEH_preInit.sqf         # Function compilation
├── XEH_postInit.sqf        # Post-initialization
├── XEH_PREP.hpp            # Function preparation macros
├── RscDialogs.hpp          # Dialog definitions
├── RscTitles.hpp           # Title definitions
└── functions/              # Module functions
    ├── fnc_create*.sqf     # HashMapObject constructors (NEW)
    └── fnc_*.sqf           # Other module functions
```

### Active Modules
1. **main**: Core initialization and event handling
2. **calendar**: Calendar event management (HashMapObject)
3. **messenger**: Player communication (HashMapObject)
4. **notepad**: Text file management (HashMapObject)
5. **snet**: Intelligence center (HashMapObject)
6. **db**: Database functionality (LEGACY - DEPRECATED)
7. **email**: Email system (stub)

### HashMapObject Pattern

Each modern module implements a constructor function (`fnc_create*`) that returns a HashMapObject:

```sqf
// Example: fnc_createCalendar.sqf
private _declaration = [
    ["#type", "Calendar"],
    ["#create", {
        // Initialize state
        _self set ["events", createHashMap];
    }],
    ["addEvent", {
        params ["_eventData"];
        // Method implementation
    }],
    // ... more methods
];

private _calendar = createHashMapObject [_declaration];
_calendar
```

**Method Invocation**:
```sqf
private _calendar = [] call win99_calendar_fnc_createCalendar;
[_eventData] call (_calendar get "addEvent");
```

## Data Flow

### Modern Architecture (HashMapObject)

#### Browser → Arma (Client-Side)
1. JavaScript calls `A3Bridge.sendCommand(command, data)`
2. Bridge formats as JSON and calls `alert(JSON.stringify({command, data}))`
3. CEF's `JSDialog` event triggers in Arma
4. `initPlayerLocal.sqf` catches event via `JSDialog` event handler
5. Handler routes command to appropriate HashMapObject method
6. HashMapObject processes command locally or triggers CBA events for multiplayer sync

#### Arma → Browser
1. SQF code calls `_ctrl ctrlWebBrowserAction ["ExecJS", "functionName(args)"]`
2. JavaScript function executes in browser context
3. UI updates accordingly

### Legacy Architecture (DEPRECATED)

#### Browser → Arma → Server (Centralized)
1. JavaScript calls `A3Bridge.sendCommand(command, data)`
2. Bridge formats as JSON and calls `alert(JSON.stringify({command, data}))`
3. CEF's `JSDialog` event triggers in Arma
4. `init.sqf` catches event via `ctrlAddEventHandler ["JSDialog", ...]`
5. Message forwarded to server: `remoteExecCall ["WIN99_handleJSAlert", 2]`
6. Server processes in `initServer.sqf` event handler
7. Server executes appropriate module function

**⚠️ This centralized pattern is deprecated.** New code should use HashMapObject instances with local event handling.

## Asset Management

### CSS Compression
- CSS files are zlib-compressed and base64-encoded (`.css.b64`)
- Loaded asynchronously and decompressed in browser
- Reduces network overhead in Arma's file system
- **⚠️ Framework Limitation:** Currently only supports zlib compression without minification
- Use `compress_css.py` (not `package_css.py`) for production

### Media Encoding
- Images, videos, audio converted to base64
- Embedded directly in file system
- Tools provided: `compress_css.py`, `media_to_base64.py`
- Compiled Windows executables in `tools/` directory

### Icon System
- Uses Arma 3 texture paths (e.g., `FORGE_FX_Desktop_Ico_MyComputer01_CA`)
- Icons loaded via `A3Bridge.loadIcon(texturePath)`
- Converted to data URLs for browser display

## Multiplayer Architecture

### Player Tracking
- `addMissionEventHandler ["PlayerConnected"]` adds players to registry
- `addMissionEventHandler ["PlayerDisconnected"]` removes players
- Player data includes: UID, name, status, lastSeen timestamp

### State Synchronization
- CBA events used for real-time updates
- Events: `PLAYERS_UPDATED`, `MESSAGE_RECEIVED`, `PLAYER_STATUS_UPDATED`
- Server authoritative for player lists and chat history

### Data Persistence
- **Profile Namespace**: Client-side storage (notes, calendar events, preferences)
- **Server Variables**: Global state (player list, chat history)
- Per-player data isolated by UID

## Configuration

### Display Configuration (`description.ext`)
- **RscWin99OSDisplay**: Full-screen UI texture (1e+11 duration)
- **RscWin99OSDisplayControl**: Controlled-size browser display
- Both use idc 1337 for browser control
- Custom positioning for in-world screens

### Mission Configuration
- CBA framework dependency
- ACE3 interaction menus for OS access
- Event handlers for player connection/disconnection

## Development Tools

### Win99UI/tools/
**Build Tools** for asset processing:
- `compress_css.py`: Compresses CSS files using zlib + base64 encoding **(recommended for production)**
- `media_to_base64.py`: Converts media files (images, audio, video) to base64 strings
- `package_css.py`: Advanced CSS packaging with multiple compression options (brotli, gzip, zlib) and archival **(not yet supported by framework)**
- `requirements.txt`: Python dependencies (brotli, py7zr)
- `README.md`: Comprehensive tool documentation
- Pre-compiled Windows executables available in `tools.7z` archive

**⚠️ Framework Limitation:** Win99UI currently only supports zlib-compressed, non-minified CSS. Minification and alternative compression algorithms (gzip, brotli) are not yet supported by the loader.

### Tool Usage

#### compress_css.py (Simplified Zlib Compression) ⭐ Recommended
```bash
python compress_css.py
# When prompted, enter:
# "." - Process CSS in current directory only (non-recursive)
# ".." - Process CSS in current directory and subdirectories (recursive)
# "path/to/file.css" - Process specific file
# "path/to/directory" - Process directory recursively
```

#### media_to_base64.py (Media Encoding)
```bash
python media_to_base64.py
# When prompted, enter:
# "." - Process media in current directory only (non-recursive)
# ".." - Process media in current directory and subdirectories (recursive)
# "path/to/file.mp4" - Process specific file
# "path/to/directory" - Process directory recursively

# Supports: .png, .jpg, .jpeg, .mp3, .mp4, .webm, .md
```

#### package_css.py (Advanced Packaging) ⚠️ Not Yet Supported
```bash
python package_css.py
# When prompted, first enter path:
# "." - Process CSS in current directory only (non-recursive)
# ".." - Process CSS in current directory and subdirectories (recursive)
# "path/to/file.css" - Process specific file
# "path/to/directory" - Process directory recursively

# Then interactive prompts for:
# - Minification (yes/no) [NOT YET SUPPORTED]
# - Compression (yes/no)
# - Compression type (zlib/gzip/brotli) [ONLY ZLIB SUPPORTED]
# - Archival (yes/no) [NOT YET SUPPORTED]
# - Archival type (lzma/7z) [NOT YET SUPPORTED]
```

**Note:** This tool is provided for future framework enhancements. Currently use `compress_css.py` for production.

**Important**: The `..` input does NOT navigate to parent directory. It enables recursive processing within the current working directory.

### Building Executables
```bash
# Using PyInstaller
python -m PyInstaller --onefile --name compress_css Win99UI\tools\compress_css.py
python -m PyInstaller --onefile --name media_to_base64 Win99UI\tools\media_to_base64.py
python -m PyInstaller --onefile --name package_css Win99UI\tools\package_css.py

# Output in dist/ directory
```

## Best Practices Observed

1. **Object-Oriented Design**: HashMapObject pattern for stateful components
2. **Modular Architecture**: Clear separation between backend (SQF) and frontend (JS)
3. **Encapsulation**: Each module manages its own state independently
4. **Event-Driven Design**: CBA events for multiplayer synchronization
5. **Component System**: Reusable UI components with async loading
6. **Data Persistence**: Profile namespace for client data
7. **Asset Optimization**: Compression for CSS, base64 encoding for media
8. **Single Responsibility**: Each module handles one domain
9. **Configuration-Driven**: `WIN99_CONFIG` centralizes system setup
10. **Helper Utilities**: Shared functionality extracted to reusable helpers
11. **Comprehensive Documentation**: JSDoc comments throughout codebase
12. **Clear Migration Path**: Legacy systems marked and documented with migration guidance

## Known Limitations & Legacy Systems

### Current Limitations
1. **Document Creation Disabled**: SNet document editor currently commented out
2. **Career Module Removed**: Player career tracking no longer available
3. **Email Stub**: Email module exists but not fully implemented
4. **Single OS Instance**: Currently hardcoded to "OS1" instance
5. **Screen Mirroring**: Real-time display of player UI on physical screens needs modernization

### Legacy Systems (DEPRECATED)

#### 1. Centralized Database (`Win99/db/`)
**Status**: DEPRECATED - Do not use for new features

**Legacy Implementation**:
- `fnc_initDB.sqf` - Creates global database HashMapObjects (EVENTS_DB, MESSAGES_DB, NOTES_DB, USERS_DB)
- Centralized data storage pattern
- Global state management

**Migration Path**:
- Calendar: Use `fnc_createCalendar` - manages events internally
- Messenger: Use `fnc_createMessenger` - manages messages internally
- Notepad: Use `fnc_createNotepad` - manages notes internally
- SNet: Use `fnc_createSNet` - manages files internally

**Why Deprecated**: Per-module state management provides better encapsulation, easier multiplayer sync, and cleaner architecture.

#### 2. Server-Side Event Handler (`WIN99_handleJSAlert`)
**Status**: LEGACY - Retained for backward compatibility

**Legacy Pattern**:
- All browser commands routed through central server handler
- Server-side processing of all UI events
- Remote execution for all actions

**Modern Replacement**:
- Client-side `JSDialog` handler in `initPlayerLocal.sqf`
- Direct HashMapObject method invocation
- CBA events for multiplayer synchronization when needed

#### 3. Screen Mirroring System (`init.sqf` - forge_fnc_OnJSAlert)
**Status**: UNDER DEVELOPMENT - Needs modernization

**Purpose**: Displays player's UI interactions on physical screen objects in the game world for other players to see.

**Current Issue**: Player UI system has been modernized (HashMapObject architecture), but screen mirroring code still needs integration with new architecture.

**Contribution Needed**: Help modernize this code to capture UI state from HashMapObject system and render on physical screens.

## Technical Notes

### Performance Considerations
- Per-frame display updates may impact performance
- Large media files should be encoded to base64 offline
- CSS compression significantly reduces load times
- Component lazy-loading improves initial startup

### Browser Context
- CEF browser has JavaScript ES6+ support
- localStorage/sessionStorage not persistent across game restarts
- Use profile namespace via A3Bridge for persistence
- Alert hijacking for Arma communication

### Debugging
- Uncomment `_ctrl ctrlWebBrowserAction ["OpenDevConsole"]` in init.sqf
- Use `diag_log` for SQF debugging
- CBA event logging available via CBA settings

## Dependencies

### Required Mods
- **CBA_A3**: Community Base Addons (event system, wait functions)
- **ACE3**: Advanced Combat Environment (interaction menus)

### Asset Requirements
- FORGE texture pack (UI icons)
- Custom textures for desktop icons, taskbar, etc.

## Summary

**forge_os_bare.VR** is a sophisticated implementation of a retro OS interface within Arma 3, featuring:
- Full desktop environment with window management
- Multiple functional applications (notepad, messenger, calendar, browser)
- Multiplayer-synchronized communication
- Persistent data storage
- Modular, extensible architecture
- Modern JavaScript + SQF integration

The project demonstrates advanced integration between Arma 3's scripting engine and web technologies, creating an immersive in-game computer system suitable for role-playing scenarios, mission briefings, and player collaboration.
