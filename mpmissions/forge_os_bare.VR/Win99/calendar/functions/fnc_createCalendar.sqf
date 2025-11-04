#include "..\script_component.hpp"

/*
 * Author: J. Schmidt
 * Creates a Calendar HashMapObject with methods for managing calendar events
 *
 * Arguments:
 * None
 *
 * Return Value:
 * Calendar HashMapObject <HASHMAPOBJECT>
 *
 * Example:
 * private _calendar = [] call FUNC(createCalendar);
 * _calendar call ["addEvent", [_eventData]];
 *
 * Public: No
 */

private _declaration = [
    ["#type", "Calendar"],
    ["#create", {
        // No initialization needed - methods called directly from initPlayerLocal.sqf
    }],

    /**
     * Adds a calendar event to both mission database and profile namespace
     * 
     * Arguments:
     * 0: Event data <HASHMAP>
     *   - id: Event unique identifier <STRING>
     *   - title: Event title <STRING>
     *   - description: Event description <STRING>
     *   - date: Event date <STRING>
     *   - time: Event time <STRING>
     */
    ["addEvent", {
        params [["_data", createHashMap, [createHashMap]]];

        if (_data isEqualTo createHashMap) exitWith {
            diag_log text format ["[ERROR] Invalid event data | Expected: Non-empty HashMap | Received '%1' | Type: '%2'", _data, typeName _data];
        };

        private _db = GETMVAR(EVENTS_DB, createHashMap);
        _db call ["post", [_data]];

        private _savedEvents = GETVAR(profileNamespace,FORGE_Events,createHashMap);
        _savedEvents set [(_data get "id"), _data];

        SETVAR(profileNamespace,FORGE_Events,_savedEvents);
        saveProfileNamespace;
    }],

    /**
     * Deletes a calendar event from both mission database and profile namespace
     * 
     * Arguments:
     * 0: Event data <HASHMAP>
     *   - id: Event unique identifier to delete <STRING>
     */
    ["deleteEvent", {
        params [["_data", createHashMap, [createHashMap]]];

        private _db = GETMVAR(EVENTS_DB, createHashMap);
        private _id = (_data get "id");

        _db call ["delete", [_id]];

        private _updatedMissionEvents = _db call ["get", []];
        SETMVAR(EVENTS_DB, _updatedMissionEvents);

        private _savedEvents = GETVAR(profileNamespace,FORGE_Events,createHashMap);

        {
            private _key = _x;
            private _value = _y;

            if (_key == _id) then {
                _savedEvents deleteAt _key;
                SETVAR(profileNamespace,FORGE_Events,_savedEvents);
                saveProfileNamespace;
            };
        } forEach _savedEvents;

        _self call ["loadEvents", []];
    }],

    /**
     * Loads all calendar events from mission database and profile namespace, then sends to UI
     * 
     * Arguments:
     * None
     */
    ["loadEvents", {
        private _display = findDisplay 13371338;
        private _control = _display displayCtrl 1337;

        private _db = GETMVAR(EVENTS_DB, createHashMap);
        private _missionEvents = _db call ["get", []];
        private _profileEvents = GETVAR(profileNamespace,FORGE_Events,createHashMap);
        private _allEvents = [];

        {
            private _key = _x;
            private _value = _y;
            private _eventMap = createHashMap;

            _eventMap set ["id", _value get "id"];
            _eventMap set ["title", _value get "title"];
            _eventMap set ["description", _value get "description"];
            _eventMap set ["date", _value get "date"];
            _eventMap set ["time", _value get "time"];

            _allEvents pushBack _eventMap;
        } forEach _missionEvents;

        {
            private _key = _x;
            private _value = _y;
            private _eventMap = createHashMap;

            _eventMap set ["id", _value get "id"];
            _eventMap set ["title", _value get "title"];
            _eventMap set ["description", _value get "description"];
            _eventMap set ["date", _value get "date"];
            _eventMap set ["time", _value get "time"];

            _allEvents pushBackUnique _eventMap;
        } forEach _profileEvents;

        if !(isNull _control) then {
            _control ctrlWebBrowserAction ["ExecJS", format ["loadCalendarEvents(%1)", (toJSON _allEvents)]];
        };
    }]
];

createHashMapObject [_declaration]
