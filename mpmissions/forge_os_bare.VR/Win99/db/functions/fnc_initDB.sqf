#include "..\script_component.hpp"
/*
 * Author: J. Schmidt
 * Initializes the mission database with OOP-style data structures for events, messages, notes, and users
 *
 * ============================================================================
 * LEGACY CODE - DEPRECATED
 * ============================================================================
 *
 * STATUS: This centralized database pattern is DEPRECATED.
 *
 * NEW ARCHITECTURE:
 * Each Win99 module (Calendar, Messenger, Notepad, SNet) now manages its own
 * state internally using HashMapObject instances. Apps create their own data
 * stores and handle persistence independently.
 *
 * CURRENT USAGE:
 * This database may still be referenced by legacy code or for backward
 * compatibility, but new features should NOT use these global database objects.
 *
 * MIGRATION PATH:
 * - Calendar: Use fnc_createCalendar - manages events internally
 * - Messenger: Use fnc_createMessenger - manages messages internally
 * - Notepad: Use fnc_createNotepad - manages notes internally
 * - SNet: Use fnc_createSNet - manages files internally
 *
 * ============================================================================
 *
 * Arguments:
 * None
 *
 * Return Value:
 * None
 *
 * Example:
 * [] call FUNC(initDB);
 *
 * Public: No
 *
 * Notes:
 * Creates four HashMapObject instances:
 * - EVENTS_DB: IEvent interface for calendar events
 * - MESSAGES_DB: IMessage interface for messenger data
 * - NOTES_DB: INote interface for notepad files
 * - USERS_DB: IUser interface for player data
 *
 * Each interface provides methods: post, bulkPost, get, getById, delete
 * Each interface tracks lastUpdate timestamp for synchronization
 */

// ============================================================================
// IEvent - Calendar Events Database Interface (LEGACY)
// ============================================================================
// Provides CRUD operations for calendar events.
// NOTE: New Calendar module instances manage their own events internally.
//       See: Win99/calendar/functions/fnc_createCalendar.sqf

private _eventDeclaration = [
    ["#type", "IEvent"],
    
    // Constructor - Initialize empty events collection
    ["#create", {
        _self set ["events", createHashMap];
        _self set ["lastUpdate", [] call FUNC(getTimestamp)];
    }],
    // Add a single event to the database
    // Params: _event (HashMap) - Event data structure
    // Returns: None
    ["post", {
        params [["_event", createHashMap, [createHashMap]]];
        private _events = _self get "events";

        _events set [(count _events) + 1, _event];
        _self set ["lastUpdate", [] call FUNC(getTimestamp)];

        saveProfileNamespace;
    }],
    // Add multiple events in batch
    // Params: _events (Array) - Array of event HashMaps
    // Returns: None
    ["bulkPost", {
        params [["_events", [], [[]]]];
        private _eventMap = _self get "events";

        {
            _eventMap set [(count _eventMap) + 1, _x];
        } forEach _events;

        _self set ["lastUpdate", [] call FUNC(getTimestamp)];
    }],
    // Retrieve all events
    // Params: None
    // Returns: HashMap of all events
    ["get", {
        _self get "events";
    }],
    // Retrieve a specific event by ID
    // Params: _id (Number|String) - Event ID
    // Returns: HashMap of event data, or nil if not found
    ["getById", {
        params [["_id", 0, [0, ""]]];
        private _events = _self get "events";

        _events get _id;
    }],
    // Delete an event by ID
    // Params: _id (Number|String) - Event ID to delete
    // Returns: None
    ["delete", {
        params [["_id", 0, [0, ""]]];
        private _events = _self get "events";

        _events deleteAt _id;
    }]
];

// ============================================================================
// IMessage - Messenger Database Interface (LEGACY)
// ============================================================================
// Provides CRUD operations for messenger chat history.
// NOTE: New Messenger module instances manage their own messages internally.
//       See: Win99/messenger/functions/fnc_createMessenger.sqf

private _messageDeclaration = [
    ["#type", "IMessage"],
    
    // Constructor - Initialize empty messages collection
    ["#create", {
        _self set ["messages", createHashMap];
        _self set ["lastUpdate", [] call FUNC(getTimestamp)];
    }],
    // Add a single message to the database
    // Params: _message (HashMap) - Message data structure
    // Returns: None
    ["post", {
        params [["_message", createHashMap, [createHashMap]]];
        private _messages = _self get "messages";

        _messages set [(count _messages) + 1, _message];
        _self set ["lastUpdate", [] call FUNC(getTimestamp)];
    }],
    // Add multiple messages in batch
    // Params: _messages (Array) - Array of message HashMaps
    // Returns: None
    ["bulkPost", {
        params [["_messages", [], [[]]]];
        private _messageMap = _self get "messages";

        {
            _messageMap set [(count _messageMap) + 1, _x];
        } forEach _messages;

        _self set ["lastUpdate", [] call FUNC(getTimestamp)];
    }],
    // Retrieve all messages
    // Params: None
    // Returns: HashMap of all messages
    ["get", {
        _self get "messages";
    }],
    // Retrieve a specific message by ID
    // Params: _id (Number|String) - Message ID
    // Returns: HashMap of message data, or nil if not found
    ["getById", {
        params [["_id", 0, [0, ""]]];
        private _messages = _self get "messages";

        _messages get _id;
    }],
    // Delete a message by ID
    // Params: _id (Number|String) - Message ID to delete
    // Returns: None
    ["delete", {
        params [["_id", 0, [0, ""]]];
        private _messages = _self get "messages";

        _messages deleteAt _id;
    }]
];

// ============================================================================
// INote - Notepad Files Database Interface (LEGACY)
// ============================================================================
// Provides CRUD operations for notepad text files.
// NOTE: New Notepad module instances manage their own notes internally.
//       See: Win99/notepad/functions/fnc_createNotepad.sqf

private _noteDeclaration = [
    ["#type", "INote"],
    
    // Constructor - Initialize empty notes collection
    ["#create", {
        _self set ["notes", createHashMap];
        _self set ["lastUpdate", [] call FUNC(getTimestamp)];
    }],
    // Save or update a note file
    // Params: _file (HashMap) - Must contain "fileName" and "content" keys
    // Returns: None
    ["post", {
        params [["_file", createHashMap, [createHashMap]]];
        private _notes = _self get "notes";
        private _fileName = _file get "fileName";
        private _content = _file get "content";

        _notes set [_fileName, _content];
        _self set ["lastUpdate", [] call FUNC(getTimestamp)];
    }],
    // Retrieve all notes
    // Params: None
    // Returns: HashMap of all notes (fileName -> content)
    ["get", {
        _self get "notes";
    }],
    // Retrieve a specific note by filename
    // Params: _id (String) - Filename of the note
    // Returns: String content of note, or nil if not found
    ["getById", {
        params [["_id", 0, [0, ""]]];
        private _notes = _self get "notes";

        _notes get _id;
    }],
    // Delete a note by filename
    // Params: _id (String) - Filename to delete
    // Returns: None
    ["delete", {
        params [["_id", 0, [0, ""]]];
        private _notes = _self get "notes";

        _notes deleteAt _id;
    }]
];

// ============================================================================
// IUser - User/Player Data Database Interface (LEGACY)
// ============================================================================
// Provides CRUD operations for player profile data.
// NOTE: Consider if this should be migrated to per-module user data storage.

private _userDeclaration = [
    ["#type", "IUser"],
    
    // Constructor - Initialize empty users collection
    ["#create", {
        _self set ["users", createHashMap];
        _self set ["lastUpdate", [] call FUNC(getTimestamp)];
    }],
    // Create or update a user profile
    // Params: _uid (String) - User ID, _data (HashMap) - User profile data
    // Returns: None
    ["post", {
        params [["_uid", "", [""]], ["_data", createHashMap, [createHashMap]]];
        private _users = _self get "users";

        _users set [_uid, _data];
        _self set ["lastUpdate", [] call FUNC(getTimestamp)];
    }],
    // Retrieve all users
    // Params: None
    // Returns: HashMap of all users (uid -> userData)
    ["get", {
        _self get "users";
    }],
    // Retrieve a specific user by UID
    // Params: _uid (String) - User ID
    // Returns: HashMap of user data, or nil if not found
    ["getById", {
        params [["_uid", "", [""]]];
        private _users = _self get "users";

        _users get _uid;
    }],
    // Delete a user by UID
    // Params: _uid (String) - User ID to delete
    // Returns: None
    ["delete", {
        params [["_uid", "", [""]]];
        private _users = _self get "users";

        _users deleteAt _uid;
    }]
];

// ============================================================================
// Instantiate and Register Database Objects
// ============================================================================
// Creates HashMapObject instances from the declarations above and registers
// them as global mission variables for backward compatibility.

private _events = createHashMapObject [_eventDeclaration];
private _messages = createHashMapObject [_messageDeclaration];
private _notes = createHashMapObject [_noteDeclaration];
private _users = createHashMapObject [_userDeclaration];

// Register as global mission variables (LEGACY - for backward compatibility)
SETMVAR(MESSAGES_DB,_messages);
SETMVAR(USERS_DB,_users);
SETMVAR(EVENTS_DB,_events);
SETMVAR(NOTES_DB,_notes);
