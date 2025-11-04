#include "\x\cba\addons\main\script_macros_mission.hpp"
#include "script_version.hpp"

// Core definitions
#define PREFIX Win99
#define VERSION QUOTE(MAJOR.MINOR.PATCH)
#define VERSION_BUILD QUOTE(MAJOR.MINOR.PATCH.BUILD)

// External function definitions
#define AFUNC(var1,var2) TRIPLES(DOUBLES(ace,var1),fnc,var2)
#define BFUNC(var1) TRIPLES(BIS,fnc,var1)
#define CFUNC(var1) TRIPLES(CBA,fnc,var1)
#define TFUNC(var1) TRIPLES(TFAR,fnc,var1)

// Variable handling
#define GETVAR_SYS(var1,var2) getVariable [ARR_2(QUOTE(var1),var2)]
#define SETVAR_SYS(var1,var2) setVariable [ARR_2(QUOTE(var1),var2)]
#define SETPVAR_SYS(var1,var2) setVariable [ARR_3(QUOTE(var1),var2,true)]

#undef GETVAR
#define GETVAR(var1,var2,var3) (var1 GETVAR_SYS(var2,var3))
#define GETMVAR(var1,var2) (missionNamespace GETVAR_SYS(var1,var2))
#define GETPAVAR(var1,var2) (parsingNamespace GETVAR_SYS(var1,var2))

#undef SETVAR
#define SETVAR(var1,var2,var3) var1 SETVAR_SYS(var2,var3)
#define SETPVAR(var1,var2,var3) var1 SETPVAR_SYS(var2,var3)
#define SETMVAR(var1,var2) missionNamespace SETVAR_SYS(var1,var2)
#define SETPMVAR(var1,var2) missionNamespace SETPVAR_SYS(var1,var2)
#define SETPAVAR(var1,var2) parsingNamespace SETVAR_SYS(var1,var2)

// Utility macros
#define ARR_SELECT(ARRAY,INDEX,DEFAULT) (if (count ARRAY > INDEX) then {ARRAY select INDEX} else {DEFAULT})
#define MINUTES *60

// Path and preparation macros
#undef PATHTO_SYS
#undef PREP
#undef PREPMAIN

#define PATHTO_SYS(var1,var2,var3,var4) ##var1\##var2\##var3\##var4.sqf
#define PREP(var1) TRIPLES(ADDON,fnc,var1) = compile preProcessFileLineNumbers 'PATHTO_SYS(Win99,COMPONENT,functions,DOUBLES(fnc,var1))'
#define PREPMAIN(var1) TRIPLES(PREFIX,fnc,var1) = compile preProcessFileLineNumbers 'PATHTO_SYS(Win99,COMPONENT,functions,DOUBLES(fnc,var1))'

// Component initialization macros
#define CCOMP(var1) QUOTE(call compile preProcessFileLineNumbers var1)
#define PATH_POST(var1) CCOMP('Win99\var1\XEH_postInit.sqf')
#define PATH_POST_CLIENT(var1) CCOMP('Win99\var1\XEH_postInit_client.sqf')
#define PATH_POST_SERVER(var1) CCOMP('Win99\var1\XEH_postInit_server.sqf')
#define PATH_PRE(var1) CCOMP('Win99\var1\XEH_preInit.sqf')
#define PATH_PRE_SERVER(var1) CCOMP('Win99\var1\XEH_preInit_server.sqf')
