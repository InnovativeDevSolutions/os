#define COMPONENT messenger
#define COMPONENT_BEAUTIFIED Messenger

// #define DEBUG_MODE_FULL
// #define DISABLE_COMPILE_CACHE

#ifdef DEBUG_ENABLED_MESSENGER
    #define DEBUG_MODE_FULL
#endif

#ifdef DEBUG_SETTINGS_MESSENGER
    #define DEBUG_SETTINGS DEBUG_SETTINGS_MESSENGER
#endif

#include "..\main\script_macros.hpp"
