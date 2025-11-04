#include "..\script_component.hpp"

/*
 * Author: J. Schmidt
 * Creates a Notepad HashMapObject with methods for managing notes
 *
 * Arguments:
 * None
 *
 * Return Value:
 * Notepad HashMapObject <HASHMAPOBJECT>
 *
 * Example:
 * private _notepad = [] call FUNC(createNotepad);
 * _notepad call ["saveNote", ["filename.txt", "content"]];
 *
 * Public: No
 */

private _declaration = [
    ["#type", "Notepad"],
    ["#create", {
        // No initialization needed - methods called directly from initPlayerLocal.sqf
    }],

    /**
     * Loads saved notes from profile namespace and sends file list to UI
     * 
     * Arguments:
     * None
     */
    ["loadNotes", {
        private _display = findDisplay 13371338;
        private _control = _display displayCtrl 1337;

        private _savedNotes = GETVAR(profileNamespace,FORGE_Notes,createHashMap);
        private _fileList = keys _savedNotes;

        if !(isNull _control) then {
            _control ctrlWebBrowserAction ["ExecJS", format ["updateFileList(%1)", (toJSON _fileList)]];
        };
    }],

    /**
     * Opens a saved note file and loads its content into the UI
     * 
     * Arguments:
     * 0: Filename <STRING>
     */
    ["openNote", {
        params [["_filename", "", [""]]];

        private _display = findDisplay 13371338;
        private _control = _display displayCtrl 1337;

        private _file = createHashMap;
        private _savedNotes = GETVAR(profileNamespace,FORGE_Notes,createHashMap);
        private _content = _savedNotes get _filename;

        _file set ["filename", _filename];
        _file set ["content", _content];

        if !(isNull _control) then {
            _control ctrlWebBrowserAction ["ExecJS", format ["loadNotepadContent(%1)", (toJSON _file)]];
        };
    }],

    /**
     * Saves note content to profile namespace with automatic .txt extension
     * 
     * Arguments:
     * 0: Filename <STRING>
     * 1: Content <STRING>
     */
    ["saveNote", {
        params [["_filename", "", [""]], ["_content", "", [""]]];

        private _savedNotes = GETVAR(profileNamespace,FORGE_Notes,createHashMap);

        if !(_filename select [count _filename - 4] isEqualTo ".txt") then {
            _filename = _filename + ".txt";
        };

        _savedNotes set [_filename, _content];

        SETVAR(profileNamespace,FORGE_Notes,_savedNotes);
        saveProfileNamespace;
    }]
];

createHashMapObject [_declaration]
