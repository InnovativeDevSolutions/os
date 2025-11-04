#include "..\script_component.hpp"
/*
 * Author: J. Schmidt
 * Generates a formatted timestamp string from systemTimeUTC
 *
 * Arguments:
 * None
 *
 * Return Value:
 * STRING - Formatted timestamp (YYYY-MM-DD_HH:MM:SS.MS)
 *
 * Example:
 * private _timestamp = [] call FUNC(getTimestamp);
 * // Returns: "2025-01-04_12:34:56.789"
 *
 * Public: No
 */

private _timestamp = systemTimeUTC apply { if (_x < 10) then { "0" + str _x } else { str _x }};
private _dateTime = format ["%1-%2-%3_%4:%5:%6.%7", _timestamp#0, _timestamp#1, _timestamp#2, _timestamp#3, _timestamp#4, _timestamp#5, _timestamp#6];

_dateTime
