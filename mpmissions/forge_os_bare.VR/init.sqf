/*
 * init.sqf
 * 
 * Mission initialization for Win99OS
 * 
 * Responsibilities:
 * - Initialize OS instances and global state
 * - Define OS management functions (create, power, state)
 * - Setup ACE interaction menus for opening OS
 * - Handle browser control and display lifecycle
 * - Create default OS instances
 */

// ============================================================================
// GLOBAL STATE INITIALIZATION
// ============================================================================

// Hashmap of all OS instances indexed by name
// Structure: {osName: {name, screen, keyboard, stateInfo, stateHandlers, powered, ctrl}, ...}
forge_Win99OSInstances = createHashMap;

// Unique generation ID for UI texture rendering (prevents texture caching issues)
forge_Win99OSGeneration = hashValue diag_tickTime;

// ============================================================================
// OS MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * forge_fnc_CreateOS
 * Creates a new OS instance and attaches ACE interaction menu
 * 
 * Arguments:
 * 0: OS name <STRING>
 * 1: Screen object variable name <STRING>
 * 2: Keyboard object variable name <STRING>
 * 
 * Example:
 * ["OS1", "Display_1_Screen", "Display_1_Keyboard"] call forge_fnc_CreateOS;
 */
forge_fnc_CreateOS = {
    params ["_osName", "_screenVariableName", "_keyboardVariableName"];
    
    private _osData = forge_Win99OSInstances getOrDefault [_osName, createHashMap, true];
    
    _osData set ["name", _osName];
    _osData set ["screen", (missionNamespace getVariable _screenVariableName)];
    _osData set ["keyboard", (missionNamespace getVariable _keyboardVariableName)];
    _osData set ["stateInfo", "{}"];
    _osData set ["stateHandlers", []];
    _osData set ["powered", false];

    private _action = ["OpenOS", "Open OS", "", {
        params ["_target", "_player", "_params"];
        _params params ["_osData"];

        private _display = (findDisplay 46) createDisplay "RscWin99OSDisplayControl";
        _display setVariable ["osData", _osData];

        private _ctrl = (_display displayCtrl 1337);
        // _ctrl ctrlWebBrowserAction ["OpenDevConsole"];
        _ctrl ctrlWebBrowserAction ["LoadFile", "Win99UI\index.html"];

        _ctrl ctrlAddEventHandler ["JSDialog", {
            params ["_control", "_isConfirmDialog", "_message"];
            private _display = ctrlParent _control;
            private _osData = _display getVariable "osData";
            // [_control, _osData get "name", _message] call forge_fnc_OnJSAlert;

            ["WIN99_handleJSAlert", [_message]] remoteExecCall ["CBA_fnc_serverEvent", 2];
            true;
        }];

        [{
            params ["_display"];
            private _ctrl = (_display displayCtrl 1337);
            private _osData = _display getVariable "osData";
        }, _display, 1] call CBA_fnc_waitAndExecute;

        [] call forge_fnc_loadMessengerData;

    }, {
        params ["_target", "_player", "_params"];
        _params params ["_osData"];
        _osData get "powered"
    }, {}, [_osData]] call ace_interact_menu_fnc_createAction;

    [(_osData get "keyboard"), 0, ["ACE_MainActions"], _action] call ace_interact_menu_fnc_addActionToObject;
};

/**
 * forge_fnc_SetOSPowerOn
 * Powers on an OS instance and sets up UI texture rendering
 * 
 * Arguments:
 * 0: OS name <STRING>
 * 
 * Example:
 * ["OS1"] call forge_fnc_SetOSPowerOn;
 */
forge_fnc_SetOSPowerOn = {
    params ["_osName"];

    diag_log ["Powering on OS:", _osName];
    private _osData = forge_Win99OSInstances get _osName;
    diag_log ["OS Data Retrieved:", _osData];

    _osData set ["powered", true];

    private _textureString = format["#(rgb,2048,1024,1)ui(RscWin99OSDisplay,%1_%s)", _osName, forge_Win99OSGeneration];
    diag_log ["Setting texture:", _textureString];
    diag_log ["Screen object:", _osData get "screen"];
    
    (_osData get "screen") setObjectTexture [0, _textureString];

    [{
        params ["_osData"];

        private _display = findDisplay 46;

        if (!isNull _display) then {
            displayUpdate _display;
        };
    }, 0.1, _osData] call CBA_fnc_addPerFrameHandler;
};

/**
 * forge_fnc_SetOSState
 * Updates OS state and notifies browser controls
 * 
 * Arguments:
 * 0: OS name <STRING>
 * 1: State info JSON string <STRING>
 * 
 * Example:
 * ["OS1", '{"foo": "bar"}'] call forge_fnc_SetOSState;
 */
forge_fnc_SetOSState = {
    params ["_osName", "_stateInfo"];
    
    private _osData = forge_Win99OSInstances getOrDefault [_osName, createHashMap, true];
    _osData set ["stateInfo", _stateInfo];

    {
        private _ctrl = _x;
        if (!isNull _ctrl) then {
            _ctrl ctrlWebBrowserAction ["ExecJS", format ["UIUpdateState(%1)", _stateInfo]];
        };
    } forEach [
        _osData getOrDefault ["ctrl", controlNull],
        (_osData get "screen") getVariable ["browserCtrl", controlNull]
    ];
    
    private _stateMap = fromJson _stateInfo;
    { _stateMap call _x; } forEach (_osData getOrDefault ["stateHandlers", []]);
};

// ============================================================================
// LEGACY CODE - UNDER DEVELOPMENT
// ============================================================================

/*
 * forge_fnc_OnJSAlert - DEPRECATED / UNDER DEVELOPMENT
 * 
 * Purpose:
 * This legacy code handles the real-time screen mirroring system. When a player
 * interacts with their personal OS UI, this system broadcasts those interactions
 * to render on a physical screen object placed in the editor, allowing other players
 * on the server to see what the player is doing in real-time.
 * 
 * How It Works:
 * - Player interacts with their personal UI (working with new HashMapObject system)
 * - This code captures those interactions and renders them as a texture on a
 *   physical screen object (e.g., monitor, terminal) in the game world
 * - Other players can see the UI activity displayed on that physical screen
 * 
 * Current Status:
 * The player's personal UI interaction system has been modernized (HashMapObject
 * architecture + CBA events in initPlayerLocal.sqf), but this screen mirroring
 * functionality needs to be updated to work with the new architecture.
 * 
 * Looking for Contributors:
 * We need help modernizing this code to capture UI state from the new HashMapObject
 * system and display it on physical screen objects for other players to see.
 * 
 * Key Features to Preserve:
 * - Capture player UI interactions from HashMapObject system
 * - Render UI state as texture on physical screen objects (forge_fnc_OSDisplayLoad)
 * - Real-time display updates visible to all players on server
 * - Per-frame display updates for smooth rendering
 * 
 * References:
 * - initPlayerLocal.sqf (current event handler system)
 * - Win99 modules (Calendar, Notepad, Messenger, SNet HashMapObjects)
 * - forge_fnc_SetOSPowerOn (texture initialization)
 * - forge_fnc_OSDisplayLoad (display lifecycle)
 */

/*forge_fnc_OnJSAlert = {
    params ["_control", "_osName", "_message"];

    diag_log ["JS Alert:", (fromJSON _message)];

    _message = (fromJSON _message);
    private _messageType = _message get "command";
    private _messageData = _message get "data";

    // if ((_message select [0,5]) == "state") exitWith {
    //     [_osName, _message select [5]] remoteExec ["forge_fnc_SetOSState", 0];
    // };

    switch (_messageType) do {
        case "EXIT": {
            closeDialog 0;
        };

        case "REQUEST_PLAYER_CAREER": {
            private _playerName = name player;
            private _careerData = createHashMap;
            
            _careerData set ["name", _playerName];
            
            _control ctrlWebBrowserAction ["ExecJS", format ["UIUpdatePlayerCareer(%1)", (toJSON _careerData)]];
        };

        case "REQUEST_PLAYER_INFO": {
            private _playerName = name player;
            private _playerUID = getPlayerUID player;
            private _playerData = createHashMap;
            
            _playerData set ["name", _playerName];
            _playerData set ["uid", _playerUID];
            
            _control ctrlWebBrowserAction ["ExecJS", format ["UIUpdatePlayerInfo(%1)", (toJSON _playerData)]];
        };

        case "STATE": {
            [_osName, _message select [5]] remoteExec ["forge_fnc_SetOSState", 0];
        };
        
        case "SAVE_NOTEPAD": {
            private _filename = _messageData get "filename";
            private _content = _messageData get "content";

            [_filename, _content] call Win99_notepad_fnc_saveNote;

            // if !(_filename select [count _filename - 4] isEqualTo ".txt") then {
            //     _filename = _filename + ".txt";
            // };

            // private _savedNotes = profileNamespace getVariable ["FORGE_SavedNotes", createHashMap];
            // _savedNotes set [_filename, _content];

            // profileNamespace setVariable ["FORGE_SavedNotes", _savedNotes];
            // saveProfileNamespace;
        };
        
        case "NOTEPAD_LIST_FILES": {
            [_control] call Win99_notepad_fnc_loadNotes;
            // private _savedNotes = profileNamespace getVariable ["FORGE_SavedNotes", createHashMap];
            // private _fileList = keys _savedNotes;
            
            // _control ctrlWebBrowserAction ["ExecJS", format ["updateFileList(%1)", (toJSON _fileList)]];
        };

        case "NOTEPAD_OPEN": {
            private _filename = _messageData get "filename";

            [_filename] call Win99_notepad_fnc_openNote;

            // private _savedNotes = profileNamespace getVariable ["FORGE_SavedNotes", createHashMap];
            // private _content = _savedNotes get _filename;
            // private _response = createHashMap;

            // _response set ["filename", _filename];
            // _response set ["content", _content];

            // _control ctrlWebBrowserAction ["ExecJS", format ["loadNotepadContent(%1)", (toJSON _response)]];
        };

        case "SEND_MESSAGE": {
            [_control, _messageData] call Win99_messenger_fnc_broadcastMessage;
        };

        case "REQUEST_PLAYER_LIST": {
            [_control] call Win99_messenger_fnc_loadUsers;
        };

        case "REQUEST_PLAYER_STATUS": {
            [_control] call Win99_messenger_fnc_getPlayerStatus;
        };

        case "REQUEST_MESSAGE_HISTORY": {
            [_control] call Win99_messenger_fnc_loadMessages;
        };

        case "UPDATE_PLAYER_STATUS": {
            private _uid = _messageData get "uid";
            private _newStatus = _messageData get "status";

            [_control, _uid, _newStatus] call Win99_messenger_fnc_updateStatus;
        };

        case "LOAD_CALENDAR_EVENTS": {
            [_control] call Win99_calendar_fnc_loadEvents;
        };

        case "SAVE_CALENDAR_EVENT": {
            [_control, _messageData] call Win99_calendar_fnc_addEvent;
        };

        case "DELETE_CALENDAR_EVENT": {

            [_control, _messageData] call Win99_calendar_fnc_deleteEvent;
        };
    };
}; */

// ============================================================================
// DISPLAY LIFECYCLE MANAGEMENT
// ============================================================================

/**
 * forge_fnc_OSDisplayLoad
 * Called when OS display is created (for UI texture rendering)
 * Sets up browser control and per-frame display updates
 * 
 * Arguments:
 * 0: Display <DISPLAY>
 * 1: OS name with generation suffix <STRING>
 * 
 * Note: This is called automatically by the RscWin99OSDisplay onLoad handler
 */
forge_fnc_OSDisplayLoad = {
    params ["_display", "_osName"];
    _osName = _osName select [0, _osName find "_"];
    
    private _osData = forge_Win99OSInstances getOrDefault [_osName, createHashMap, true];
    _display setVariable ["osData", _osData];
    
    private _ctrl = (_display displayCtrl 1337);
    _osData set ["ctrl", _ctrl];
    
    // _ctrl ctrlWebBrowserAction ["OpenDevConsole"];
    _ctrl ctrlWebBrowserAction ["LoadFile", "Win99UI\index.html"];
    
    _ctrl ctrlAddEventHandler ["JSDialog", {
        params ["_control", "_isConfirmDialog", "_message"];
    
        private _display = ctrlParent _control;
        private _osData = _display getVariable "osData";
    
        [_osData get "name", _message] call forge_fnc_OnJSAlert;
        true;
    }];

    [{
        params ["_display"];

        displayUpdate _display;

        private _ctrl = (_display displayCtrl 1337);
        private _osData = _display getVariable "osData";

        // _ctrl ctrlWebBrowserAction ["ExecJS", format ["UIUpdateState(%1)", _osData get "stateInfo"]];

        private _p2 = [{ displayUpdate (_this#0) }, 0.1, _display] call CBA_fnc_addPerFrameHandler;

        _display setVariable ["forge_p2", _p2];
    }, _display, 1] call CBA_fnc_waitAndExecute;
    
    _display displayAddEventHandler ["Unload", {
        params ["_display", "_exitCode"];
        [_display getVariable "forge_p2"] call CBA_fnc_removePerFrameHandler;
    }];
};

// ============================================================================
// LEGACY PLAYER EVENT HANDLERS
// ============================================================================

/*
 * These handlers call legacy functions that no longer exist.
 * Player connection is now handled in initServer.sqf
 * 
 * TODO: Remove these handlers once confirmed they're not needed
 */

addMissionEventHandler ["PlayerConnected", {
    // params ["_id", "_uid", "_name", "_jip", "_owner", "_idstr"];
    // Legacy: _this call Win99_fnc_messenger_onPlayerConnected;
}];

addMissionEventHandler ["PlayerDisconnected", {
    // params ["_id", "_uid", "_name", "_jip", "_owner", "_idstr"];
    // Legacy: _this call Win99_fnc_messenger_onPlayerDisconnected;
}];

// ============================================================================
// DEFAULT OS INSTANCE CREATION
// ============================================================================

/**
 * Create and power on default OS instance
 * This creates OS1 attached to Display_1_Screen and Display_1_Keyboard objects
 */
["OS1", "Display_1_Screen", "Display_1_Keyboard"] call forge_fnc_CreateOS;
["OS1"] call forge_fnc_SetOSPowerOn;
