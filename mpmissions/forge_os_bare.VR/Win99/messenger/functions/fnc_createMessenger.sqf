#include "..\script_component.hpp"
/*
 * Author: J. Schmidt
 * Creates a Messenger HashMapObject with methods for updating UI
 *
 * Arguments:
 * None
 *
 * Return Value:
 * Messenger HashMapObject <HASHMAPOBJECT>
 *
 * Example:
 * private _messenger = [] call FUNC(createMessenger);
 * _messenger call ["updatePlayerList", [_players]];
 *
 * Public: No
 */

private _declaration = [
    ["#type", "Messenger"],
    ["#create", {}],
    /**
     * Updates player list in UI
     * 
     * Arguments:
     * 0: Players hashmap <HASHMAP>
     */
    ["updatePlayerList", {
        params [["_players", createHashMap, [createHashMap]]];

        private _display = findDisplay 13371338;
        private _control = _display displayCtrl 1337;

        if !(isNull _control) then {
            _control ctrlWebBrowserAction ["ExecJS", format ["UIUpdatePlayerList(%1)", (toJSON _players)]];
        };
    }],

    /**
     * Updates message history in UI
     * 
     * Arguments:
     * 0: Messages array <ARRAY>
     */
    ["updateMessageHistory", {
        params [["_messages", [], [[]]]];

        private _display = findDisplay 13371338;
        private _control = _display displayCtrl 1337;

        if !(isNull _control) then {
            _control ctrlWebBrowserAction ["ExecJS", format ["UIUpdateMessageHistory(%1)", (toJSON _messages)]];
        };
    }],

    /**
     * Sends local player info to UI
     */
    ["updatePlayerInfo", {
        private _display = findDisplay 13371338;
        private _control = _display displayCtrl 1337;
        private _playerInfo = createHashMap;

        _playerInfo set ["name", (name player)];
        _playerInfo set ["uid", (getPlayerUID player)];

        if !(isNull _control) then {
            _control ctrlWebBrowserAction ["ExecJS", format ["UIUpdatePlayerInfo(%1)", (toJSON _playerInfo)]];
        };
    }],

    /**
     * Sends multiplayer status to UI
     */
    ["updateMultiplayerStatus", {
        private _display = findDisplay 13371338;
        private _control = _display displayCtrl 1337;
        private _isMP = isMultiplayer;

        if !(isNull _control) then {
            _control ctrlWebBrowserAction ["ExecJS", format ["if (window.setMultiplayerMode) { window.setMultiplayerMode(%1); }", _isMP]];
        };
    }]
];

createHashMapObject [_declaration]
