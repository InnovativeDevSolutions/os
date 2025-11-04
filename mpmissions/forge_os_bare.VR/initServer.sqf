/*
 * initServer.sqf
 * 
 * Server-side initialization and event handling for Win99OS
 * 
 * Responsibilities:
 * - Maintain authoritative messenger state (chat messages, player list)
 * - Handle player connection/disconnection
 * - Process messenger events and broadcast updates to all clients
 */

// ============================================================================
// SERVER STATE INITIALIZATION
// ============================================================================

/**
 * Server-authoritative messenger state
 * These variables maintain the single source of truth for multiplayer chat
 */

// Array of all chat messages (hashmap objects)
// Structure: [{sender, content, timestamp}, ...]
Win99_chatMessages = [];

// Hashmap of connected players indexed by UID
// Structure: {uid: {uid, name, status, lastSeen}, ...}
Win99_chatPlayers = createHashMap;

// Maximum number of messages to store (FIFO - oldest deleted when exceeded)
Win99_maxMessages = 100;

// ============================================================================
// PLAYER CONNECTION MANAGEMENT
// ============================================================================

/**
 * Handle player connection
 * Adds player to the global player list and broadcasts update to all clients
 */
addMissionEventHandler ["PlayerConnected", {
    params ["_id", "_uid", "_name", "_jip", "_owner", "_idstr"];
    
    // Create player data structure
    private _playerData = createHashMap;
    _playerData set ["uid", _uid];
    _playerData set ["name", _name];
    _playerData set ["status", "online"];
    _playerData set ["lastSeen", serverTime];
    
    // Add to global player list
    Win99_chatPlayers set [_uid, _playerData];
    
    // Notify all clients of updated player list
    ["PLAYERS_UPDATED", [Win99_chatPlayers]] call CBA_fnc_globalEvent;
}];

/**
 * Handle player disconnection
 * Removes player from the global list and broadcasts update to all clients
 */
addMissionEventHandler ["PlayerDisconnected", {
    params ["_id", "_uid", "_name", "_jip", "_owner", "_idstr"];
    
    // Remove from global player list if exists
    if (_uid in Win99_chatPlayers) then {
        Win99_chatPlayers deleteAt _uid;
        
        // Notify all clients of updated player list
        ["PLAYERS_UPDATED", [Win99_chatPlayers]] call CBA_fnc_globalEvent;
    };
}];

// ============================================================================
// MESSENGER EVENT HANDLERS
// ============================================================================

/**
 * MESSAGE_RECEIVED
 * Triggered when a player sends a chat message
 * Adds message to history and broadcasts to all clients
 */
["MESSAGE_RECEIVED", {
    params ["_message"];
    
    // Add message to history
    Win99_chatMessages pushBack _message;
    
    // Enforce message limit (FIFO)
    if (count Win99_chatMessages > Win99_maxMessages) then {
        Win99_chatMessages deleteAt 0;
    };
    
    // Notify all clients of updated message history
    ["MESSAGE_HISTORY_UPDATED", [Win99_chatMessages]] call CBA_fnc_globalEvent;
}] call CBA_fnc_addEventHandler;

/**
 * PLAYER_STATUS_UPDATED
 * Triggered when a player changes their status (online, away, busy)
 * Updates player status and broadcasts to all clients
 */
["PLAYER_STATUS_UPDATED", {
    params ["_uid", "_newStatus"];
    
    // Update player status if player exists
    if (_uid in Win99_chatPlayers) then {
        (Win99_chatPlayers get _uid) set ["status", _newStatus];
        
        // Notify all clients of updated player list
        ["PLAYERS_UPDATED", [Win99_chatPlayers]] call CBA_fnc_globalEvent;
    };
}] call CBA_fnc_addEventHandler;

// ============================================================================
// CLIENT REQUEST HANDLERS
// ============================================================================

/**
 * REQUEST_PLAYER_LIST_SERVER
 * Client requests current player list
 * Broadcasts current player list to all clients
 */
["REQUEST_PLAYER_LIST_SERVER", {
    ["PLAYERS_UPDATED", [Win99_chatPlayers]] call CBA_fnc_globalEvent;
}] call CBA_fnc_addEventHandler;

/**
 * REQUEST_PLAYER_STATUS_SERVER
 * Client requests current player status information
 * Broadcasts current player list to all clients
 */
["REQUEST_PLAYER_STATUS_SERVER", {
    ["PLAYERS_UPDATED", [Win99_chatPlayers]] call CBA_fnc_globalEvent;
}] call CBA_fnc_addEventHandler;

/**
 * REQUEST_CHAT_HISTORY_SERVER
 * Client requests current message history
 * Broadcasts current message history to all clients
 */
["REQUEST_CHAT_HISTORY_SERVER", {
    ["MESSAGE_HISTORY_UPDATED", [Win99_chatMessages]] call CBA_fnc_globalEvent;
}] call CBA_fnc_addEventHandler;
