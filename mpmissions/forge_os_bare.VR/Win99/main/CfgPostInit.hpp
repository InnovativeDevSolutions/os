#include "script_component.hpp"

class GVARMAIN(Main) {
	init = PATH_POST(main);
	clientInit = PATH_POST_CLIENT(main);
	serverInit = PATH_POST_SERVER(main);
};

class GVARMAIN(DB) {
	init = PATH_POST(db);
	clientInit = PATH_POST_CLIENT(db);
	serverInit = PATH_POST_SERVER(db);
};

class GVARMAIN(Calendar) {
	init = PATH_POST(calendar);
	clientInit = PATH_POST_CLIENT(calendar);
	serverInit = PATH_POST_SERVER(calendar);
};

class GVARMAIN(Messenger) {
	init = PATH_POST(messenger);
	clientInit = PATH_POST_CLIENT(messenger);
	serverInit = PATH_POST_SERVER(messenger);
};

class GVARMAIN(Notepad) {
	init = PATH_POST(notepad);
	clientInit = PATH_POST_CLIENT(notepad);
	serverInit = PATH_POST_SERVER(notepad);
};

class GVARMAIN(SNet) {
	init = PATH_POST(snet);
	clientInit = PATH_POST_CLIENT(snet);
	serverInit = PATH_POST_SERVER(snet);
};
