/**
 * Messenger Application
 * 
 * A real-time multiplayer chat and messaging system providing:
 * - Real-time message broadcasting and receiving
 * - User list with online status indicators (Online, Away, Busy, Offline)
 * - Status management and updates
 * - Message history persistence
 * - User-to-user communication
 * - Automatic player list updates
 * - Multiplayer-only functionality with singleplayer detection
 * 
 * The messenger synchronizes with Arma 3 backend via CBA events for
 * multiplayer chat functionality. Requires an active multiplayer session.
 */

/**
 * MessageManager - Static utility class for message formatting
 * Provides methods for rendering messages with proper styling
 */
class MessageManager {
    /**
     * Format a message for display in chat
     * @param {Object} message - Message object
     * @param {string} message.uid - Sender's unique ID
     * @param {string} message.userName - Sender's display name
     * @param {string} message.timestamp - Message timestamp
     * @param {string} message.text - Message content
     * @param {Object} currentUser - Current user object
     * @param {string} currentUser.id - Current user's ID
     * @returns {string} HTML string for message display
     */
    static formatMessage(message, currentUser) {
        const isCurrentUser = message.uid === currentUser.id;
        return `
            <div class="message ${isCurrentUser ? 'own-message' : ''}">
                <div class="message-header">
                    <span class="message-user">${message.userName}</span>
                    <span class="message-time">${message.timestamp}</span>
                </div>
                <div class="message-content">${message.text}</div>
            </div>
        `;
    }
}

/**
 * MessengerComponents - UI component templates
 * Contains HTML template functions for messenger interface elements
 */
const MessengerComponents = {
    /**
     * Create main messenger layout
     * @returns {string} HTML string for messenger container
     */
    createLayout: () => `
        <div class="messenger-container">
            ${MessengerComponents.createSidebar()}
            ${MessengerComponents.createMainChat()}
        </div>
    `,

    /**
     * Create sidebar with user list and status selector
     * @returns {string} HTML string for sidebar
     */
    createSidebar: () => `
        <div class="messenger-sidebar">
            <div class="messenger-users"></div>
            <div class="messenger-status">
                <select>
                    <option value="online">Online</option>
                    <option value="away">Away</option>
                    <option value="busy">Busy</option>
                    <option value="offline">Offline</option>
                </select>
            </div>
        </div>
    `,

    /**
     * Create main chat area with message display and input
     * @returns {string} HTML string for chat area
     */
    createMainChat: () => `
        <div class="messenger-main">
            <div class="messenger-messages"></div>
            <div class="messenger-input">
                <input type="text" placeholder="Type your message..." />
                <button>Send</button>
            </div>
        </div>
    `
};

/**
 * UserManager - Static utility class for user management
 * Provides methods for user formatting and status handling
 */
class UserManager {
    /**
     * Format user for display in user list
     * @param {Object} user - User object
     * @param {string} user.id - User unique ID
     * @param {string} user.name - User display name
     * @param {string} user.status - User status (online, away, busy, offline)
     * @returns {string} HTML string for user list item
     */
    static formatUser(user) {
        return `
            <div class="user-item ${user.status}" data-user-id="${user.id}">
                <div class="status-indicator">
                    <span class="status-dot ${user.status}"></span>
                </div>
                <span class="user-name">${user.name}</span>
            </div>
        `;
    }

    /**
     * Get CSS class name for user status
     * @param {string} status - Status identifier
     * @returns {string} CSS class name
     */
    static getStatusClass(status) {
        const statusMap = {
            online: 'status-online',
            away: 'status-away',
            busy: 'status-busy',
            offline: 'status-offline'
        };
        return statusMap[status] || 'status-offline';
    }
}

/**
 * NetworkManager - Static utility class for network communication
 * Handles message formatting for Arma 3 backend communication
 */
class NetworkManager {
    /**
     * Create formatted alert for Arma 3 backend
     * @param {string} command - Command identifier
     * @param {Object|null} data - Optional data payload
     * @returns {string} JSON string for A3Bridge
     */
    static createAlert(command, data = null) {
        return JSON.stringify({
            command,
            data
        });
    }
}

/**
 * Messenger - Main messenger application class
 * Extends Window base class to provide real-time chat functionality
 * Requires multiplayer mode to function properly
 */
class Messenger extends Window {
    /**
     * Create a new Messenger instance
     * Checks multiplayer status before initializing chat features
     */
    constructor() {
        super({
            title: 'Messenger',
            icon: 'FORGE_FX_Desktop_Ico_MyMessenger01_CA',
            width: 800,
            height: 600
        });

        this.persistentState = {
            status: 'online'
        };

        this.updateInterval = null;

        // Check multiplayer status first
        this.checkMultiplayerStatus();
    }

    /**
     * Check if in multiplayer mode and show warning if not
     */
    checkMultiplayerStatus() {
        // Request multiplayer status from Arma
        A3Bridge.sendAlert(JSON.stringify({
            command: 'REQUEST_MULTIPLAYER_STATUS'
        }));

        // Wait a moment for status to be set, then check
        setTimeout(() => {
            if (window.isMultiplayerMode === false) {
                this.showSingleplayerWarning();
            } else {
                // Initialize normally
                this.initializeState();
                this.initializeUI();
                this.initializeNetworking();
            }
        }, 100);
    }

    /**
     * Show dialog warning about singleplayer mode
     */
    showSingleplayerWarning() {
        const content = this.element.querySelector('.window-body');
        content.innerHTML = `
            <div style="padding: 20px; text-align: center;">
                <h3>Multiplayer Required</h3>
                <p>The Messenger application requires a multiplayer session to function.</p>
                <p>Please start or join a multiplayer game to use this feature.</p>
            </div>
        `;
    }

    /**
     * Initialize core state management
     */
    initializeState() {
        this.currentUser = {
            id: '_SP_PLAYER_',
            name: window.currentMessengerUser || 'Unknown User',
            status: window.currentUserStatus || 'offline'
        };
        this.users = [this.currentUser];
        this.messages = [];
        this.lastMessageTime = null;
        window.currentChatInstance = this;

        this.loadMessageHistory();
    }

    /**
     * Initialize UI components and layout
     */
    initializeUI() {
        this.element.classList.add('messenger-window');
        const content = this.element.querySelector('.window-body');
        content.innerHTML = MessengerComponents.createLayout();

        // Initialize UI references
        this.userList = this.element.querySelector('.messenger-users');
        this.messageContainer = this.element.querySelector('.messenger-messages');
        this.messageInput = this.element.querySelector('.messenger-input input');
        this.sendButton = this.element.querySelector('.messenger-input button');
        this.statusSelect = this.element.querySelector('.messenger-status select');

        this.initializeStatusHandling();
        this.initializeEventListeners();
        this.refreshUserInterface();
        this.updateStatusBar();
    }

    /**
     * Initialize network requests and updates
     */
    initializeNetworking() {
        // Initial data requests
        this.sendAlert(NetworkManager.createAlert("REQUEST_PLAYER_INFO"));
        this.sendAlert(NetworkManager.createAlert("REQUEST_PLAYER_STATUS"));
        this.updatePlayerList();
        this.loadMessageHistory();

        // Set up periodic updates
        this.updateInterval = setInterval(() => {
            this.updatePlayerList();
            this.sendAlert(NetworkManager.createAlert("REQUEST_PLAYER_STATUS"));
        }, 30000);
    }

    /**
     * Initialize status handling system
     */
    initializeStatusHandling() {
        if (this.statusSelect) {
            this.statusSelect.value = this.persistentState.status;
            this.statusSelect.onchange = (e) => {
                const newStatus = e.target.value;
                this.persistentState.status = newStatus;
                const user = this.users.find(u => u.id === '_SP_PLAYER_');
                if (user) {
                    user.status = newStatus;
                }
                this.refreshUserInterface();
                this.refreshUserList();
                this.updateStatus(newStatus);
            };
        }
    }

    /**
     * Initialize message handling and display
     * @param {Array} messages - Array of messages to display
     */
    handleMessageHistory(messages) {
        const uniqueMessages = new Set();
        messages.forEach(msg => {
            const msgData = Array.isArray(msg) ? Object.fromEntries(msg) : msg;
            const key = msgData.messageId || `${msgData.timestamp}-${msgData.uid}-${msgData.text}`;
            uniqueMessages.add(JSON.stringify(msg));
        });

        this.messages = Array.from(uniqueMessages).map(msg => JSON.parse(msg));
        this.refreshMessages();
        this.updateStatusBar();
    }

    /**
     * Initialize event listeners for user interactions
     */
    initializeEventListeners() {
        // Message sending handlers
        this.sendButton.onclick = () => this.sendMessage(this.messageInput.value);
        this.messageInput.onkeypress = (e) => {
            if (e.key === 'Enter') {
                this.sendMessage(this.messageInput.value);
            }
        };
    }

    /**
     * Message handling methods
     */

    /**
     * Send a chat message
     * Creates message object and broadcasts to all players
     * @param {string} text - Message content to send
     */
    sendMessage(text) {
        if (!text.trim()) return;

        const newMessage = {
            text: text,
            timestamp: new Date().toUTCString().split(' ')[4],
            uid: this.currentUser.id,
            messageId: Date.now() + '-' + this.currentUser.id
        };

        this.broadcastMessage(newMessage);
        this.clearInput();
    }

    /**
     * Receive incoming message from another player
     * Adds message to local array and refreshes display
     * @param {Object|Array} message - Incoming message data
     */
    receiveMessage(message) {
        const messageData = Object.fromEntries(message);
        const { uid, text, timestamp } = messageData;

        const user = this.users.find(u => u.id === uid) || {
            id: uid,
            name: window.currentMessengerUser || `User ${uid.substring(0, 8)}`,
            status: 'offline'
        };

        this.messages.push(message);
        this.updateStatusBar();
        this.refreshMessages();
    }

    /**
     * Broadcast message to all players
     * Sends message through backend for multiplayer distribution
     * @param {Object} message - Message object to broadcast
     */
    broadcastMessage(message) {
        this.sendAlert(NetworkManager.createAlert("SEND_MESSAGE", message));
    }

    /**
     * User status management
     */

    /**
     * Update current user's status
     * Updates local status and broadcasts to all players
     * @param {string} newStatus - New status value (online, away, busy, offline)
     */
    updateStatus(newStatus) {
        this.currentUser.status = newStatus;
        this.users[0].status = newStatus;
        this.refreshUserInterface();

        this.sendAlert(NetworkManager.createAlert("UPDATE_PLAYER_STATUS", {
            uid: this.currentUser.id,
            status: newStatus
        }));
    }

    /**
     * UI Refresh Methods
     */

    /**
     * Refresh user interface display
     * Updates user list in sidebar
     */
    refreshUserInterface() {
        if (this.userList) {
            this.userList.innerHTML = this.users.map(user =>
                UserManager.formatUser(user)
            ).join('');
        }
    }

    /**
     * Refresh user list display
     * Re-renders user list with current data
     */
    refreshUserList() {
        if (this.userList) {
            this.userList.innerHTML = this.users.map(user =>
                UserManager.formatUser(user)
            ).join('');
        }
    }

    /**
     * Refresh message display
     * Re-renders all messages and auto-scrolls to bottom
     */
    refreshMessages() {
        if (this.messageContainer) {
            const formattedMessages = this.messages.map(msg => {
                const messageData = Array.isArray(msg) ? Object.fromEntries(msg) : msg;
                const { text, timestamp, uid } = messageData;

                const user = this.users.find(u => u.id === uid) || {
                    id: uid,
                    name: window.currentMessengerUser || `User ${uid.substring(0, 8)}`,
                    status: 'offline'
                };

                return MessageManager.formatMessage({
                    text,
                    timestamp,
                    uid,
                    userName: user.name
                }, this.currentUser);
            }).join('');

            this.messageContainer.innerHTML = formattedMessages;
            this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
        }
    }

    /**
     * Player Management Methods
     */

    /**
     * Update a specific player's status
     * @param {string} playerUID - Player's unique ID
     * @param {string} newStatus - New status value
     */
    updatePlayerStatus(playerUID, newStatus) {
        const user = this.users.find(u => u.id === playerUID);

        if (user) {
            user.status = newStatus;
            if (playerUID === this.currentUser.id) {
                this.persistentState.status = newStatus;
            }
            this.refreshUserList();
        }
    }

    /**
     * Update current player information
     * @param {string} playerName - Player's display name
     * @param {string} playerUID - Player's unique ID
     */
    updatePlayerInfo(playerName, playerUID) {
        this.currentUser.name = playerName;
        this.currentUser.id = playerUID;
        this.users[0].name = playerName;
        this.users[0].id = playerUID;
        this.refreshUserList();
    }

    /**
     * Update all player statuses from server data
     * @param {Object|Array} statusData - Status data for all players
     */
    updateAllPlayerStatus(statusData) {
        const statusMap = Array.isArray(statusData)
            ? Object.fromEntries(statusData)
            : statusData;

        Object.entries(statusMap).forEach(([uid, status]) => {
            const user = this.users.find(u => u.id === uid);
            if (user) {
                user.status = status;
                if (uid === this.currentUser.id) {
                    this.persistentState.status = status;
                }
            }
        });
        this.refreshUserList();
    }

    /**
     * Utility Methods
     */

    /**
     * Clear message input field
     */
    clearInput() {
        this.messageInput.value = '';
    }

    /**
     * Update status bar with latest message info
     * Shows timestamp of most recent message
     */
    updateStatusBar() {
        const statusBar = this.element.querySelector('.status-bar');

        if (this.messages && this.messages.length > 0) {
            const latestMessage = this.messages[this.messages.length - 1];
            const messageData = Array.isArray(latestMessage) ?
                Object.fromEntries(latestMessage) :
                latestMessage;

            statusBar.innerHTML = `<p class='status-bar-field'>Last message received: ${messageData.timestamp}</p>`;
        } else {
            statusBar.innerHTML = `<p class='status-bar-field'>No messages received</p>`;
        }
    }

    /**
     * Request updated player list from server
     */
    updatePlayerList() {
        this.sendAlert(NetworkManager.createAlert('REQUEST_PLAYER_LIST'));
    }

    /**
     * Request message history from server
     */
    loadMessageHistory() {
        this.sendAlert(NetworkManager.createAlert('REQUEST_CHAT_HISTORY'));
    }

    /**
     * Cleanup and Window Management
     */

    /**
     * Close messenger window and cleanup resources
     * Clears update interval before closing
     */
    close() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        super.close();
    }
}

/**
 * Register Messenger application globally for OS launcher
 */
window.Messenger = Messenger;
