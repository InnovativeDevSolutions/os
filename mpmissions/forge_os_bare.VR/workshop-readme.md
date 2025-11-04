# Forge OS - Windows 99 Interface

A fully functional Windows 99-style operating system interface for Arma 3, complete with desktop environment, applications, and multiplayer features.

## Features

### Desktop Environment
- Windows 98/99 retro aesthetic
- Draggable, resizable windows
- Start menu and taskbar
- Desktop shortcuts
- Minimize/maximize/close controls

### Applications
- **Notepad**: Create and edit text files with persistent storage
- **Messenger**: Real-time multiplayer chat with status updates
- **Calendar**: Event scheduling and management
- **Internet Explorer**: Web browser with custom web apps
- **Intelligence Center (SNet)**: Mission briefing and intel viewer

### Multiplayer Features
- Synchronized player chat
- Player status indicators (Online, Away, Busy)
- Shared calendar events
- Real-time updates across all connected players

## Required Mods

- **CBA_A3** - Community Base Addons
- **ACE3** - Advanced Combat Environment

Both available on Steam Workshop.

## Installation

1. Subscribe to this scenario on Steam Workshop
2. Subscribe to CBA_A3 and ACE3 if you haven't already
3. Enable all mods in Arma 3 Launcher
4. Load the scenario from the Virtual Reality map

## How to Use

1. Start the mission
2. Approach the keyboard object in-game
3. Use ACE interaction menu (Windows key by default)
4. Select "Open OS" to launch the interface

## Credits

Mission Design: J. Schmidt
UI Framework: Windows 98 CSS recreation
Dependencies: CBA_A3, ACE3

## Support

Report issues or suggest features on the Workshop discussion page.

## Technical Highlights

- **Modern Architecture**: Object-oriented design with HashMapObject pattern
- **Modular System**: Each application is a self-contained, stateful component
- **Client-Side Processing**: Efficient local event handling with CBA multiplayer sync
- **Persistent Storage**: Player data saved across sessions
- **Performance Optimized**: Compressed assets and efficient rendering

## Version History

- **2.0.0** - Architecture Overhaul
  - Migrated to HashMapObject architecture for all apps
  - Improved multiplayer synchronization
  - Enhanced performance with client-side event handling
  - Comprehensive documentation and code cleanup
  - Fixed timestamp tracking in database systems
  
- **1.0.0** - Initial release
  - Full desktop environment
  - 5 functional applications
  - Multiplayer synchronization
  - Persistent data storage
