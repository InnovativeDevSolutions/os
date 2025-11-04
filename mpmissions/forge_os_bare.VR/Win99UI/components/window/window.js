/**
 * Window - Base Window Component
 * 
 * Core window class for the Win99 UI system. All applications extend this class.
 * Provides complete Windows 98-style window functionality:
 * 
 * Window Management:
 * - Creation, positioning, and sizing
 * - Title bar with icon and controls
 * - Minimize, maximize, restore, close operations
 * - Active/inactive state management
 * - Multi-window focus handling
 * 
 * User Interactions:
 * - Title bar dragging (constrained to viewport)
 * - Window activation on click
 * - Control button actions (minimize/maximize/close)
 * - Taskbar integration
 * 
 * Window Structure:
 * - Title bar (icon, text, controls)
 * - Menu bar (optional, for application menus)
 * - Toolbars (optional, for application toolbars)
 * - Content area (main application content)
 * - Status bar (optional, for status text)
 * 
 * Singleton Behavior:
 * - Prevents duplicate windows with same title
 * - Focuses existing window instead of creating new one
 * - Special handling for Notepad and Career windows
 * 
 * All application classes (Notepad, Calendar, etc.) extend this base class.
 */
class Window {
    /**
     * Static set to track all active window instances
     * Used for global window management and cleanup
     * @type {Set<Window>}
     */
    static activeWindows = new Set();

    /**
     * Create a new window instance
     * 
     * Initialization flow:
     * 1. Check for existing window with same title (singleton behavior)
     * 2. If exists, focus it and return existing instance
     * 3. If new, initialize properties and create DOM structure
     * 4. Register with taskbar and set up event handlers
     * 5. Apply maximized state if requested
     * 
     * @param {Object} [options={}] - Window configuration options
     * @param {string} [options.title='Window'] - Window title text
     * @param {string} [options.icon=''] - Icon texture name (Arma 3 resource)
     * @param {number} [options.width=800] - Window width in pixels
     * @param {number} [options.height=600] - Window height in pixels
     * @param {boolean} [options.isActive=false] - Initial active state
     * @param {boolean} [options.isMinimized=false] - Initial minimized state
     * @param {boolean} [options.maximized=false] - Start maximized
     * @param {Array<string>} [options.controls=['Minimize','Maximize','Close']] - Title bar control buttons
     */
    constructor(options = {}) {
        // Check for existing window and handle focus
        const existingWindow = this.findExistingWindow(options.title);
        if (existingWindow) return this.handleExistingWindow(existingWindow);

        // Initialize window properties
        this.initializeProperties(options);

        // Create and setup window element
        this.createWindowElement();
        this.setupWindowPosition();

        // Initialize window systems
        this.initializeWindowSystems();

        // Set initial window state
        if (options.maximized && this.controls.includes('Maximize')) {
            this.maximize();
        } else if (options.maximized) {
            // Handle maximized state without maximize button
            this.isMaximized = true;
            this.element.style.width = '100vw';
            this.element.style.height = 'calc(100vh - 34px)';
            this.element.style.left = '0';
            this.element.style.top = '0';
        }
    }

    // WINDOW INITIALIZATION

    /**
     * Find an existing window with the same title
     * 
     * Implements singleton behavior by searching for existing windows.
     * Special handling for:
     * - Notepad: Matches any window ending with ' - Notepad'
     * - Career: Matches any window starting with 'Career -'
     * - Others: Exact title match
     * 
     * @param {string} title - Window title to search for
     * @returns {HTMLElement|undefined} Existing window element or undefined
     */
    findExistingWindow(title) {
        return Array.from(document.querySelectorAll('.window')).find(win => {
            const titleElement = win.querySelector('.title-bar-text');
            const currentTitle = titleElement?.textContent;

            if (title === 'Untitled - Notepad') {
                return currentTitle?.endsWith(' - Notepad');
            }

            if (title === 'Career') {
                return currentTitle?.startsWith('Career -');
            }

            return currentTitle === title;
        });
    }

    /**
     * Handle focus for existing window
     * 
     * When duplicate window is attempted:
     * 1. Minimizes all other windows
     * 2. Clears existing window's menu bar
     * 3. Re-initializes components if method exists
     * 4. Brings existing window to front
     * 
     * @param {HTMLElement} existingWindow - Found existing window element
     * @returns {Window} Existing window instance
     */
    handleExistingWindow(existingWindow) {
        document.querySelectorAll('.window').forEach(win => {
            if (win !== existingWindow && win.winObj) {
                win.winObj.minimize();
            }
        });

        const menuBar = existingWindow.querySelector('.menu-bar');
        if (menuBar) {
            menuBar.innerHTML = '';
        }

        if (existingWindow.winObj.initComponents) {
            existingWindow.winObj.initComponents();
        }

        existingWindow.winObj.setActive();
        return existingWindow.winObj;
    }

    /**
     * Initialize window properties from options
     * 
     * Sets up all window state properties with defaults:
     * - title, icon, dimensions
     * - active/minimized/maximized states
     * - control button configuration
     * 
     * @param {Object} options - Window configuration options
     */
    initializeProperties(options) {
        this.title = options.title || 'Window';
        this.icon = options.icon || '';
        this.isActive = options.isActive || false;
        this.isMinimized = options.isMinimized || false;
        this.isMaximized = false;
        this.width = options.width || 800;
        this.height = options.height || 600;
        this.controls = options.controls || ['Minimize', 'Maximize', 'Close'];
    }

    /**
     * Create the window DOM element with initial structure
     * 
     * Creates window container div with:
     * - win99-window class for styling
     * - active class if initially active
     * - Initial width and height
     * - Triggers render() to build internal structure
     */
    createWindowElement() {
        this.element = document.createElement('div');
        this.element.className = `window win99-window ${this.isActive ? 'active' : ''}`;
        this.element.style.width = `${this.width}px`;
        this.element.style.height = `${this.height}px`;
        this.render();
    }

    /**
     * Setup initial window position
     * 
     * Centers window in viewport with constraints:
     * - Minimum 20px margin from all edges
     * - Prevents window from being off-screen
     * - Accounts for taskbar height (34px)
     * 
     * Position is calculated to keep window fully visible.
     */
    setupWindowPosition() {
        const maxX = window.innerWidth - this.width - 20;
        const maxY = window.innerHeight - this.height - 20;

        this.x = Math.max(20, Math.min(maxX, (window.innerWidth - this.width) / 2));
        this.y = Math.max(20, Math.min(maxY, (window.innerHeight - this.height) / 2));

        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
    }

    /**
     * Initialize window management systems
     * 
     * Integrates window with OS:
     * 1. Adds tab to taskbar
     * 2. Sets window as active
     * 3. Initializes event handlers
     * 4. Appends to desktop
     * 5. Stores back-reference (winObj)
     * 6. Adds to global window tracking set
     */
    initializeWindowSystems() {
        window.os.taskbar.addTab(this);
        this.setActive();
        this.initEvents();
        document.getElementById('desktop').appendChild(this.element);
        this.element.winObj = this;
        Window.activeWindows.add(this);
    }

    // WINDOW RENDERING AND EVENTS

    /**
     * Render window content
     * 
     * Builds complete window HTML structure:
     * - Title bar (icon, text, control buttons)
     * - Menu bar (empty, populated by applications)
     * - Toolbars (empty, populated by applications)
     * - Window body with content div
     * - Status bar (empty, populated by applications)
     * 
     * Control buttons are generated based on this.controls array.
     * Icon is loaded asynchronously from Arma 3 resources.
     */
    render() {
        const ariaLabels = {
            'Close': 'Close',
            'Help': 'Help',
            'Minimize': 'Minimize',
            'Maximize': 'Maximize'
        };
        const controlButtons = this.controls.map(control =>
            `<button aria-label="${ariaLabels[control]}"></button>`
        ).join('');

        this.element.innerHTML = `
            <div class="title-bar">
                <img class="title-bar-icon" alt="${this.title}" />
                <div class="title-bar-text">${this.title}</div>
                <div class="title-bar-controls">
                    ${controlButtons}
                </div>
            </div>
            <div class="menu-bar"></div>
            <div class="toolbars"></div>
            <div class="window-body">
                <div class="content"></div>
            </div>
            <div class="status-bar"></div>
        `;

        A3Bridge.loadIcon(this.icon).then(iconSrc => {
            const iconElement = this.element.querySelector('.title-bar-icon');
            iconElement.src = iconSrc;
        });
    }

    /**
     * Initialize window event handlers
     * 
     * Sets up all window interactions:
     * - Click to activate window
     * - Title bar dragging
     * - Control button clicks
     * - Click-outside to deactivate
     */
    initEvents() {
        this.element.addEventListener('click', () => this.setActive());
        this.initDragging();
        this.initControls();

        document.addEventListener('click', (e) => {
            if (!this.element.contains(e.target)) {
                this.setInactive();
            }
        });
    }

    // WINDOW CONTROLS

    /**
     * Initialize window dragging functionality
     * 
     * Implements title bar dragging with:
     * - Mousedown on title bar starts drag
     * - Mousemove updates position (if not maximized)
     * - Position constrained to viewport bounds
     * - Mouseup ends drag
     * - Dragging activates window
     * 
     * Maximized windows cannot be dragged.
     */
    initDragging() {
        const titleBar = this.element.querySelector('.title-bar');
        let isDragging = false;
        let startX, startY, initialX, initialY;

        titleBar.addEventListener('mousedown', (e) => {
            if (this.isMaximized) return;

            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialX = this.element.offsetLeft;
            initialY = this.element.offsetTop;
            this.setActive();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging || this.isMaximized) return;

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            let newX = initialX + dx;
            let newY = initialY + dy;

            const maxX = window.innerWidth - this.element.offsetWidth;
            const maxY = window.innerHeight - this.element.offsetHeight - 34;

            newX = Math.max(0, Math.min(maxX, newX));
            newY = Math.max(0, Math.min(maxY, newY));

            this.element.style.left = `${newX}px`;
            this.element.style.top = `${newY}px`;
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    /**
     * Initialize window control buttons
     * 
     * Maps control buttons to their actions:
     * - Minimize: minimize()
     * - Maximize: maximize()
     * - Help: help()
     * - Close: close()
     * 
     * Button actions determined by aria-label attribute.
     */
    initControls() {
        const controls = this.element.querySelector('.title-bar-controls');
        if (!controls) return;

        const controlActions = {
            'Minimize': () => this.minimize(),
            'Maximize': () => this.maximize(),
            'Help': () => this.help(),
            'Close': () => this.close()
        };

        Array.from(controls.children).forEach(button => {
            const action = button.getAttribute('aria-label');
            if (controlActions[action]) {
                button.addEventListener('click', controlActions[action]);
            }
        });
    }

    // WINDOW STATE MANAGEMENT

    /**
     * Set window as active
     * 
     * Brings window to front:
     * 1. Deactivates all other windows
     * 2. Adds active class to this window
     * 3. Updates title bar styling (removes inactive class)
     * 4. Syncs taskbar tab highlighting
     * 
     * Only one window can be active at a time.
     */
    setActive() {
        document.querySelectorAll('.window').forEach(win => {
            win.classList.remove('active');
            if (win !== this.element) {
                const windowInstance = win._windowInstance;
                if (windowInstance) {
                    windowInstance.isActive = false;
                    windowInstance.updateTitleBarState();
                }
            }
        });
        this.element.classList.add('active');
        this.isActive = true;
        this.updateTitleBarState();
        window.os.taskbar.updateTabs();
    }

    /**
     * Update title bar active state
     * 
     * Applies visual styling to title bar:
     * - Active: Colored title bar (blue gradient)
     * - Inactive: Gray title bar
     * 
     * Mimics Windows 98 window focus behavior.
     */
    updateTitleBarState() {
        const titleBar = this.element.querySelector('.title-bar');
        if (this.isActive) {
            titleBar.classList.remove('inactive');
        } else {
            titleBar.classList.add('inactive');
        }
    }

    /**
     * Set window as inactive
     * 
     * Deactivates window:
     * - Removes active class
     * - Updates title bar to gray
     * - Syncs taskbar tab (removes highlight)
     */
    setInactive() {
        this.element.classList.remove('active');
        this.isActive = false;
        this.updateTitleBarState();
        window.os.taskbar.updateTabs();
    }

    /**
     * Toggle window minimize state
     * 
     * Minimizes window to taskbar:
     * - Toggles minimized class (hides window via CSS)
     * - Toggles isMinimized flag
     * - Deactivates window
     * - Updates taskbar tab styling
     * 
     * Clicking taskbar tab restores minimized window.
     */
    minimize() {
        this.isMinimized = !this.isMinimized;
        this.element.classList.toggle('minimized');
        this.isActive = !this.isMinimized;
        window.os.taskbar.updateTabs();
    }

    /**
     * Toggle window maximize state
     * 
     * Maximizes window to fill viewport:
     * - Saves original dimensions for restore
     * - Expands to full screen (minus taskbar)
     * - Changes button to "Restore"
     * 
     * Clicking Restore returns to original size and position.
     */
    maximize() {
        this.isMaximized = !this.isMaximized;
        const maximizeBtn = this.element.querySelector('.title-bar-controls button[aria-label="Maximize"], .title-bar-controls button[aria-label="Restore"]');

        if (this.isMaximized) {
            this.handleMaximize(maximizeBtn);
        } else {
            this.handleRestore(maximizeBtn);
        }
    }

    /**
     * Handle window maximize state
     * 
     * Saves current dimensions and expands to fullscreen:
     * - Stores original width, height, x, y
     * - Sets window to 100vw x (100vh - 34px)
     * - Positions at top-left (0, 0)
     * - Changes button label to "Restore"
     * 
     * @param {HTMLElement} maximizeBtn - Maximize button element
     */
    handleMaximize(maximizeBtn) {
        this.originalDimensions = {
            width: this.width,
            height: this.height,
            x: this.x,
            y: this.y
        };

        this.element.style.width = '100vw';
        this.element.style.height = 'calc(100vh - 34px)';
        this.element.style.left = '0';
        this.element.style.top = '0';

        maximizeBtn.setAttribute('aria-label', 'Restore');
    }

    /**
     * Handle window restore state
     * 
     * Restores window to original dimensions:
     * - Applies saved width, height, x, y
     * - Returns to pre-maximized position
     * - Changes button label back to "Maximize"
     * 
     * @param {HTMLElement} maximizeBtn - Maximize/Restore button element
     */
    handleRestore(maximizeBtn) {
        this.element.style.width = `${this.originalDimensions.width}px`;
        this.element.style.height = `${this.originalDimensions.height}px`;
        this.element.style.left = `${this.originalDimensions.x}px`;
        this.element.style.top = `${this.originalDimensions.y}px`;

        maximizeBtn.setAttribute('aria-label', 'Maximize');
    }

    /**
     * Close the window
     * 
     * Performs complete window cleanup:
     * 1. Removes from global active windows set
     * 2. Removes taskbar tab
     * 3. Removes window element from DOM
     * 
     * No confirmation dialog - applications handle save prompts.
     */
    close() {
        Window.activeWindows.delete(this);
        window.os.taskbar.removeTab(this);
        this.element.remove();
    }

    /**
     * Send alert message to Arma 3 backend
     * 
     * Forwards message to A3Bridge for backend communication.
     * Used by applications to notify the game of events.
     * 
     * @param {Object} jsonObject - Message data to send
     */
    sendAlert(jsonObject) {
        A3Bridge.sendAlert(jsonObject);
    }
}