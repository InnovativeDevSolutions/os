#include "script_component.hpp"

class GVARMAIN(Main) {
    init = PATH_PRE(main);
};

class GVARMAIN(DB) {
    init = PATH_PRE(db);
};

class GVARMAIN(Calendar) {
    init = PATH_PRE(calendar);
};

class GVARMAIN(Messenger) {
    init = PATH_PRE(messenger);
};

class GVARMAIN(Notepad) {
    init = PATH_PRE(notepad);
};

class GVARMAIN(SNet) {
    init = PATH_PRE(snet);
};
