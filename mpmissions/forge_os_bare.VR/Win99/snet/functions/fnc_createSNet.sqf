#include "..\script_component.hpp"

/*
 * Author: J. Schmidt
 * Creates an SNet HashMapObject with methods for managing intelligence files
 *
 * Arguments:
 * None
 *
 * Return Value:
 * SNet HashMapObject <HASHMAPOBJECT>
 *
 * Example:
 * private _snet = [] call FUNC(createSNet);
 * private _content = _snet call ["loadFile", ["snet/intel/report.md"]];
 *
 * Public: No
 */

private _declaration = [
    ["#type", "SNet"],
    ["#create", {
        // Initialize event handler for file loading
        ["LOAD_SNET_File", {
            params ["_path"];

            private _display = findDisplay 13371338;
            private _control = _display displayCtrl 1337;
            private _content = _self call ["loadSNetFile", [_path]];

            if !(isNull _control) then {
                _control ctrlWebBrowserAction ["ExecJS", format ["UIUpdateSNETContent(%1)", (toJSON _content)]];
            };
        }] call CBA_fnc_addEventHandler;
    }],

    /**
     * Loads a file from the mission directory for SNet intelligence viewer
     * 
     * Arguments:
     * 0: Relative file path <STRING>
     * 
     * Return Value:
     * File content <STRING>
     */
    ["loadFile", {
        params ["_path"];

        diag_log text format ["[DEBUG] Loading file %1", _path];

        private _missionRoot = getMissionPath "";
        private _fullPath = _missionRoot + _path;
        private _content = loadFile _fullPath;

        _content
    }]
];

createHashMapObject [_declaration]
