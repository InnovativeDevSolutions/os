#include "script_component.hpp"
ADDON = false;

PREP_RECOMPILE_START;
#include "XEH_PREP.hpp"
PREP_RECOMPILE_END;

// Create Calendar object instance
GVAR(calendar) = [] call FUNC(createCalendar);

ADDON = true;
