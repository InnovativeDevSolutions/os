/*
 * initPlayerLocal.sqf
 * 
 * Client-side initialization and event handling for Win99OS
 * 
 * Responsibilities:
 * - Handle UI interactions from browser (via WIN99_handleJSAlert)
 * - Call methods on local HashMapObject instances (Calendar, Notepad, Messenger, SNet)
 * - Register CBA event handlers for server updates (Messenger)
 * - Route events between UI, local objects, and server
 */

// ============================================================================
// UI INTERACTION HANDLER
// ============================================================================

/**
 * WIN99_handleJSAlert
 * Main event handler for all UI interactions from the browser
 * Receives JSON messages from the browser and routes them to appropriate handlers
 * 
 * Message Format: {command: "COMMAND_NAME", data: {...}}
 */
["WIN99_handleJSAlert", {
    params [["_message", "", [""]]];

    // Parse JSON message from browser
    _message = (fromJSON _message);

    private _messageType = _message get "command";
    private _messageData = _message get "data";

    switch (_messageType) do {
        
        // ====================================================================
        // SYSTEM COMMANDS
        // ====================================================================
        
        /**
         * EXIT - Close the Win99OS dialog
         */
        case "EXIT": {
            closeDialog 0;
        };
        
        /**
         * REQUEST_MULTIPLAYER_STATUS - Send multiplayer status to UI
         */
        case "REQUEST_MULTIPLAYER_STATUS": {
            Win99_messenger_messenger call ["updateMultiplayerStatus", []];
        };

        // ====================================================================
        // NOTEPAD COMMANDS
        // ====================================================================
        
        /**
         * SAVE_NOTEPAD - Save note to profile namespace
         * Data: {filename: string, content: string}
         */
        case "SAVE_NOTEPAD": {
            private _filename = _messageData get "filename";
            private _content = _messageData get "content";

            Win99_notepad_notepad call ["saveNote", [_filename, _content]];
        };
        
        /**
         * NOTEPAD_LIST_FILES - Load list of saved notes
         */
        case "NOTEPAD_LIST_FILES": {
            Win99_notepad_notepad call ["loadNotes", []];
        };
        
        /**
         * NOTEPAD_OPEN - Open a saved note
         * Data: {filename: string}
         */
        case "NOTEPAD_OPEN": {
            private _filename = _messageData get "filename";

            Win99_notepad_notepad call ["openNote", [_filename]];
        };

        // ====================================================================
        // CALENDAR COMMANDS
        // ====================================================================
        
        /**
         * LOAD_CALENDAR_EVENTS - Load all calendar events
         */
        case "LOAD_CALENDAR_EVENTS": {
            Win99_calendar_calendar call ["loadEvents", []];
        };
        
        /**
         * SAVE_CALENDAR_EVENT - Save new calendar event
         * Data: {id, title, description, date, time}
         */
        case "SAVE_CALENDAR_EVENT": {
            Win99_calendar_calendar call ["addEvent", [_messageData]];
        };
        
        /**
         * DELETE_CALENDAR_EVENT - Delete calendar event
         * Data: {id: string}
         */
        case "DELETE_CALENDAR_EVENT": {
            Win99_calendar_calendar call ["deleteEvent", [_messageData]];
        };

        // ====================================================================
        // MESSENGER COMMANDS
        // ====================================================================
        
        /**
         * SEND_MESSAGE - Send chat message to all players
         * Data: {sender, content, timestamp}
         * Triggers global event that server will process
         */
        case "SEND_MESSAGE": {
            ["MESSAGE_RECEIVED", [_messageData]] call CBA_fnc_globalEvent;
        };
        
        /**
         * REQUEST_PLAYER_INFO - Get local player's info
         * Returns player name and UID to UI
         */
        case "REQUEST_PLAYER_INFO": {
            Win99_messenger_messenger call ["updatePlayerInfo", []];
        };
        
        /**
         * REQUEST_PLAYER_STATUS - Request player status from server
         */
        case "REQUEST_PLAYER_STATUS": {
            ["REQUEST_PLAYER_STATUS_SERVER", []] call CBA_fnc_serverEvent;
        };
        
        /**
         * UPDATE_PLAYER_STATUS - Update this player's status
         * Data: {uid: string, status: string}
         * Triggers global event that server will process
         */
        case "UPDATE_PLAYER_STATUS": {
            private _uid = _messageData get "uid";
            private _newStatus = _messageData get "status";

            ["PLAYER_STATUS_UPDATED", [_uid, _newStatus]] call CBA_fnc_globalEvent;
        };
        
        /**
         * REQUEST_PLAYER_LIST - Request player list from server
         */
        case "REQUEST_PLAYER_LIST": {
            ["REQUEST_PLAYER_LIST_SERVER", []] call CBA_fnc_serverEvent;
        };
        
        /**
         * REQUEST_CHAT_HISTORY - Request message history from server
         */
        case "REQUEST_CHAT_HISTORY": {
            ["REQUEST_CHAT_HISTORY_SERVER", []] call CBA_fnc_serverEvent;
        };
    };
}] call CBA_fnc_addEventHandler;

// ============================================================================
// SERVER UPDATE HANDLERS
// ============================================================================

/**
 * PLAYERS_UPDATED
 * Triggered by server when player list changes
 * Updates the Messenger UI with new player list
 */
["PLAYERS_UPDATED", {
    params ["_players"];
    Win99_messenger_messenger call ["updatePlayerList", [_players]];
}] call CBA_fnc_addEventHandler;

/**
 * MESSAGE_HISTORY_UPDATED
 * Triggered by server when chat message history changes
 * Updates the Messenger UI with new message history
 */
["MESSAGE_HISTORY_UPDATED", {
    params ["_messages"];
    Win99_messenger_messenger call ["updateMessageHistory", [_messages]];
}] call CBA_fnc_addEventHandler;
