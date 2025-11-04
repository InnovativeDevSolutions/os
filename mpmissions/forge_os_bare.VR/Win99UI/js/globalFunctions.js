/**
 * Global Function Handlers
 * 
 * Centralized system for managing callbacks from Arma 3 backend to UI.
 * These handlers serve as the bridge between SQF code and JavaScript,
 * allowing the backend to update UI state, deliver messages, and notify
 * about system events.
 * 
 * All handlers are exposed to window scope for A3Bridge to call directly.
 * Handlers are organized by functional domain:
 * - UIHandlers: Player info and general UI updates
 * - MessagingHandlers: Chat system and player status
 * - NotepadHandlers: File operations for text editor
 * - CalendarHandlers: Event management for calendar app
 * - SystemHandlers: System-level state (multiplayer mode, etc.)
 */

/**
 * UIHandlers - User interface update handlers
 * Manages player information display across UI components
 */
const UIHandlers = {
    /**
     * Update player information across UI components
     * 
     * Called by backend when player info is retrieved or changes.
     * Updates:
     * - Intranet app welcome message
     * - Chat system current user identification
     * 
     * @param {Object|string} data - Player data (auto-parsed if JSON string)
     * @param {string} data.name - Player display name
     * @param {string} data.uid - Unique player identifier
     */
    updatePlayerInfo(data) {
        const playerData = typeof data === 'string' ? JSON.parse(data) : data;

        // Update intranet user info
        const intranetApp = document.querySelector('.intranet-app');
        if (intranetApp?.querySelector('.user-info')) {
            intranetApp.querySelector('.user-info span').textContent = `Welcome, ${playerData.name}`;
        }

        // Update chat instance
        window.currentChatInstance?.updatePlayerInfo(playerData.name, playerData.uid);
    },
};

/**
 * MessagingHandlers - Chat and messaging system handlers
 * Manages real-time messaging, player status, and user lists
 */
const MessagingHandlers = {
    /**
     * Update message history in active chat window
     * 
     * Called when chat window opens or reconnects to load historical messages.
     * Only updates if chat instance is active.
     * 
     * @param {Array<Object>} messages - Array of message objects with uid, name, content, timestamp
     */
    updateMessageHistory(messages) {
        if (window.currentChatInstance) {
            window.currentChatInstance.handleMessageHistory(messages);
        }
    },

    /**
     * Update all player statuses in chat system
     * 
     * Bulk update for player online/offline/away states.
     * Converts array format to object map if needed.
     * 
     * @param {Object|Array} statusData - Map of UIDs to status strings, or array of [uid, status] pairs
     */
    updateAllPlayerStatus(statusData) {
        if (!window.currentChatInstance) return;

        const statusMap = Array.isArray(statusData)
            ? Object.fromEntries(statusData)
            : statusData;

        window.currentChatInstance.updateAllPlayerStatus(statusMap);
    },

    /**
     * Update player list in chat window
     * 
     * Refreshes the complete list of players in the chat sidebar.
     * Transforms backend format to UI format and sorts with current user first.
     * 
     * @param {Object} players - Object mapping UIDs to player data {name, status, lastSeen}
     */
    updatePlayerList(players) {
        if (!window.currentChatInstance) return;

        const playerArray = Object.entries(players).map(([uid, data]) => ({
            id: uid,
            name: data.name,
            status: data.status || 'online',
            lastSeen: data.lastSeen || 'N/A'
        }));

        window.currentChatInstance.users = playerArray;
        window.currentChatInstance.users.sort((a, b) =>
            a.id === window.currentChatInstance.currentUser.id ? -1 : 1
        );

        window.currentChatInstance.refreshUserList();
    },

    /**
     * Update individual player status
     * 
     * Called when a single player's status changes (online/offline/away).
     * More efficient than full list refresh for single updates.
     * 
     * @param {Object|Array} statusData - Status update containing {uid, status} or [uid, status]
     */
    updatePlayerStatus(statusData) {
        if (!window.currentChatInstance) return;

        const { uid, status } = statusData;
        if (uid && status) {
            window.currentChatInstance.updatePlayerStatus(uid, status);
        }
    },

    /**
     * Handle incoming chat messages
     * 
     * Called by backend when a new message is broadcast.
     * Filters out echo of user's own messages (checked by UID).
     * Converts array format to object if needed.
     * 
     * @param {Object|Array} messageData - Message data {uid, name, content, timestamp} or array format
     */
    receiveMessage(messageData) {
        if (!window.currentChatInstance) return;

        const message = Array.isArray(messageData) ? {
            uid: messageData[0],
            name: messageData[1],
            content: messageData[2],
            timestamp: messageData[3]
        } : messageData;

        console.log(`Received message: ${message}`);

        if (message.uid !== window.currentChatInstance.currentUser.id) {
            window.currentChatInstance.receiveMessage(message);
        }
    }
};

/**
 * NotepadHandlers - Text editor file operation handlers
 * Manages file list and content loading for Notepad application
 */
const NotepadHandlers = {
    /**
     * Update file list in Notepad open dialog
     * 
     * Called when user opens the file list dialog.
     * Populates list with saved .txt files from profile namespace.
     * 
     * @param {Array|string} data - Array of filenames (auto-parsed if JSON string)
     */
    updateFileList(data) {
        const notepadWindow = document.querySelector('.notepad-window');

        console.log(`Updating file list: ${data}`);

        if (notepadWindow?.winObj) {
            const files = typeof data === 'string' ? JSON.parse(data) : data;
            notepadWindow.winObj.updateFileList(files);
        }
    },

    /**
     * Load file content into Notepad editor
     * 
     * Called after user selects a file to open.
     * Populates textarea with file content and updates window title.
     * 
     * @param {Object|string} data - File data (auto-parsed if JSON string)
     * @param {string} data.filename - Name of the file
     * @param {string} data.content - File text content
     */
    loadContent(data) {
        const notepadWindow = document.querySelector('.notepad-window');

        console.log(`Loading content: ${data}`);

        if (notepadWindow?.winObj) {
            const fileData = typeof data === 'string' ? JSON.parse(data) : data;
            notepadWindow.winObj.loadNotepadContent(fileData.filename, fileData.content);
        }
    }
};

/**
 * CalendarHandlers - Calendar event management handlers
 * Manages event data loading for Calendar application
 */
const CalendarHandlers = {
    /**
     * Load events into Calendar application
     * 
     * Called when calendar opens or refreshes.
     * Loads events from backend storage and renders them in calendar view.
     * Updates status bar with event count.
     * 
     * @param {Object} events - Object mapping event IDs to event data {date, time, title, notes}
     */
    loadEvents(events) {
        console.log('Calendar events:', events);

        const calendarWindow = Array.from(document.querySelectorAll('.window'))
            .find(win => win.querySelector('.title-bar-text')?.textContent === 'Calendar');

        if (calendarWindow?.winObj) {
            const eventsArray = Object.values(events || {});
            calendarWindow.winObj.events = eventsArray;
            calendarWindow.winObj.renderEvents();
            calendarWindow.winObj.setupStatusBar();
        }
    }
};

/**
 * SystemHandlers - System-level state management
 * Manages global OS state flags and system configuration
 */
const SystemHandlers = {
    /**
     * Set multiplayer mode status
     * 
     * Called on initialization to inform UI of multiplayer/singleplayer context.
     * Certain features (like chat) may behave differently based on this flag.
     * 
     * @param {boolean} isMultiplayer - True if game is in multiplayer mode
     */
    setMultiplayerMode(isMultiplayer) {
        window.isMultiplayerMode = isMultiplayer;
        console.log(`Multiplayer mode: ${isMultiplayer}`);
    }
};

/**
 * Expose handlers to global window scope
 * 
 * Makes handlers callable from Arma 3 backend via A3Bridge.
 * Backend calls these functions using executeJS commands.
 * 
 * Example from SQF:
 * _display setVariable ["executeJS", "UIUpdatePlayerInfo({name: 'John', uid: '12345'})"];
 */
Object.assign(window, {
    UIUpdatePlayerInfo: UIHandlers.updatePlayerInfo,
    UIUpdateMessageHistory: MessagingHandlers.updateMessageHistory,
    UIUpdateAllPlayerStatus: MessagingHandlers.updateAllPlayerStatus,
    UIUpdatePlayerList: MessagingHandlers.updatePlayerList,
    UIUpdatePlayerStatus: MessagingHandlers.updatePlayerStatus,
    receiveMessage: MessagingHandlers.receiveMessage,
    updateFileList: NotepadHandlers.updateFileList,
    loadNotepadContent: NotepadHandlers.loadContent,
    loadCalendarEvents: CalendarHandlers.loadEvents,
    setMultiplayerMode: SystemHandlers.setMultiplayerMode
});
