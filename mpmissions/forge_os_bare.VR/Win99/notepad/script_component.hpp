#define COMPONENT notepad
#define COMPONENT_BEAUTIFIED Notepad

// #define DEBUG_MODE_FULL
// #define DISABLE_COMPILE_CACHE

#ifdef DEBUG_ENABLED_NOTEPAD
    #define DEBUG_MODE_FULL
#endif

#ifdef DEBUG_SETTINGS_NOTEPAD
    #define DEBUG_SETTINGS DEBUG_SETTINGS_NOTEPAD
#endif

#include "..\main\script_macros.hpp"
