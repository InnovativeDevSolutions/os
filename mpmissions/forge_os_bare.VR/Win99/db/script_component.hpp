#define COMPONENT db
#define COMPONENT_BEAUTIFIED DB

// #define DEBUG_MODE_FULL
// #define DISABLE_COMPILE_CACHE

#ifdef DEBUG_ENABLED_DB
    #define DEBUG_MODE_FULL
#endif

#ifdef DEBUG_SETTINGS_DB
    #define DEBUG_SETTINGS DEBUG_SETTINGS_DB
#endif

#include "..\main\script_macros.hpp"
