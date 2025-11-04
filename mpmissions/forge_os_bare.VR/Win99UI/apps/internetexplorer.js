/**
 * Internet Explorer Application
 * 
 * A Windows 98-style web browser providing:
 * - Address bar navigation with URL input
 * - Back/Forward/Refresh navigation buttons
 * - Menu bar (File, Edit, View, Go, Favorites, Tools, Help)
 * - Web application loading and rendering
 * - Navigation history tracking
 * - Status bar with connection status and security zone
 * - Loading animations and progress indicators
 * 
 * Loads web applications (Intranet, Mail, etc.) dynamically from configuration.
 * Simulates realistic browser connection sequences and loading states.
 */

/**
 * BrowserComponents - UI component templates for browser interface
 * Contains HTML template functions for all browser UI elements
 */
const BrowserComponents = {
    /**
     * Create navigation toolbar with buttons and address bar
     * @returns {string} HTML string for navigation toolbars
     */
    createToolbars: () => `
        <div class='ie-buttons'>
            <button id="backBtn">Back</button>
            <button id="forwardBtn">Forward</button>
            <button id="refreshBtn">Refresh</button>
            <button disabled>Stop</button>
            <button id="homeBtn">Home</button>
        </div>
        <div class='ie-address-bar'>
            <span>Address</span>
            <input type='text' value='https://forge.mil/intranet' />
            <button>Go</button>
        </div>
    `,

    /**
     * Create menu bar with standard browser menu items
     * @returns {string} HTML string for menu bar
     */
    createMenuBar: () => {
        const menuItems = ['File', 'Edit', 'View', 'Go', 'Favorites', 'Tools', 'Help'];
        return menuItems.map(item => `
            <div class="menu-item">${item}</div>
        `).join('');
    },

    /**
     * Create main content container for web applications
     * @returns {string} HTML string for content area
     */
    createMainContent: () => `
        <div class='ie-content'></div>
    `,

    /**
     * Create status bar with connection info and security zone
     * @returns {string} HTML string for status bar
     */
    createStatusBar: () => `
        <div class='status-bar-field' style='flex: 1'>Done</div>
        <div class='status-bar-field' style='width: 100px'>&nbsp;</div>
        <div class='status-bar-field' style='width: 140px'>Internet Zone</div>
        <div class='status-bar-field' style='width: 130px'>Connected</div>
    `
};

/**
 * InternetExplorer - Web browser window component
 * Extends Window base class to provide browser functionality with navigation,
 * history management, and web application loading capabilities
 */
class InternetExplorer extends Window {
    /**
     * Create a new Internet Explorer browser instance
     * Initializes browser state, navigation history, and default homepage
     */
    constructor() {
        super({
            title: 'Internet Explorer',
            icon: 'FORGE_FX_Desktop_Ico_MyBrowser01_CA',
            width: 800,
            height: 600
        });

        // Core state initialization
        this.loadedApps = new Map();
        this.initialized = false;
        this.history = [];
        this.currentHistoryIndex = -1;
        this.defaultUrl = 'https://forge.mil/intranet';

        // Setup browser window
        this.element.classList.add('browser-window');
        this.initComponents();
        this.navigateToApp(this.defaultUrl);
    }

    /**
     * Initialize all UI components
     */
    initComponents() {
        if (!this.initialized) {
            this.setupMenuBar();
            this.setupToolbars();
            this.setupContent();
            this.setupStatusBar();
            this.initialized = true;
        }
    }

    /**
     * Setup the main menu bar with navigation items
     */
    setupMenuBar() {
        const menuBar = this.element.querySelector('.menu-bar');
        menuBar.innerHTML = BrowserComponents.createMenuBar();
    }

    /**
     * Setup navigation toolbars and address bar
     */
    setupToolbars() {
        const toolbars = this.element.querySelector('.toolbars');
        toolbars.innerHTML = BrowserComponents.createToolbars();
        this.initializeNavigationControls();
    }

    /**
     * Initialize navigation control event listeners
     */
    initializeNavigationControls() {
        const addressInput = this.element.querySelector('.ie-address-bar input');
        const goButton = this.element.querySelector('.ie-address-bar button');
        const backBtn = this.element.querySelector('#backBtn');
        const forwardBtn = this.element.querySelector('#forwardBtn');
        const refreshBtn = this.element.querySelector('#refreshBtn');
        const homeBtn = this.element.querySelector('#homeBtn');

        // Navigation event handlers
        goButton.addEventListener('click', () => {
            this.navigateToApp(addressInput.value);
        });

        addressInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.navigateToApp(addressInput.value);
            }
        });

        backBtn.addEventListener('click', () => this.goBack());
        forwardBtn.addEventListener('click', () => this.goForward());
        refreshBtn.addEventListener('click', () => this.refresh());
        homeBtn.addEventListener('click', () => this.navigateToApp(this.defaultUrl));

        this.updateNavigationButtons();
    }

    /**
     * Setup the main content area
     */
    setupContent() {
        const content = this.element.querySelector('.content');
        content.innerHTML = BrowserComponents.createMainContent();

        const addressInput = this.element.querySelector('.ie-address-bar input');
        addressInput.value = this.defaultUrl;
    }

    /**
     * Setup the status bar with event handlers
     */
    setupStatusBar() {
        const statusBar = this.element.querySelector('.status-bar');
        statusBar.innerHTML = BrowserComponents.createStatusBar();

        // Store references to status fields
        this.statusFields = {
            main: statusBar.children[0],
            progress: statusBar.children[1],
            zone: statusBar.children[2],
            connection: statusBar.children[3]
        };

        this.initStatusBarEvents();
    }

    /**
     * Initialize status bar event handlers
     */
    initStatusBarEvents() {
        const content = this.element.querySelector('.ie-content');

        // Handle link hovers for status updates
        content.addEventListener('mouseover', (e) => {
            if (e.target.tagName === 'A') {
                this.updateStatus(e.target.href);
            }
        });

        content.addEventListener('mouseout', () => {
            this.updateStatus('Done');
        });

        // Handle navigation feedback
        content.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                this.updateStatus('Opening page...');
                setTimeout(() => this.updateStatus('Done'), 2000);
            }
        });
    }

    /**
     * Status bar update methods
     */

    /**
     * Update main status bar text
     * @param {string} text - Status text to display
     */
    updateStatus(text) {
        this.statusFields.main.textContent = text;
    }

    /**
     * Update progress indicator in status bar
     * @param {boolean} show - Whether to show loading indicator
     */
    updateProgress(show) {
        this.statusFields.progress.innerHTML = show ?
            '<span class="loading-text">Loading...</span>' :
            '&nbsp;';
    }

    /**
     * Update security zone indicator
     * @param {string} zone - Security zone name (e.g., "Internet Zone", "Intranet Zone")
     */
    updateZone(zone) {
        this.statusFields.zone.textContent = zone;
    }

    /**
     * Update connection status indicator
     * @param {string} status - Connection status text (e.g., "Connected", "Connecting...")
     */
    updateConnection(status) {
        this.statusFields.connection.textContent = status;
    }

    /**
     * Web app loading and management
     */

    /**
     * Load a web application by name
     * Dynamically loads JavaScript, CSS, and HTML files for the specified app
     * @param {string} appName - Name of the web app to load (e.g., "intranet", "mail")
     * @returns {Promise<void>}
     * @throws {Error} If app is not found in configuration
     */
    async loadWebApp(appName) {
        if (!this.loadedApps.has(appName)) {
            try {
                const config = WIN99_CONFIG.applications.web[appName];
                if (!config) throw new Error(`Web app ${appName} not found`);

                // Load JavaScript
                if (config.files.js) {
                    const js = await A3Bridge.loadFile(`Win99UI\\${config.files.js}`);
                    const script = document.createElement('script');
                    script.textContent = js;
                    document.body.appendChild(script);
                }

                // Load CSS
                if (config.files.css) {
                    const css = await A3Bridge.loadFile(`Win99UI\\${config.files.css}`);
                    const style = document.createElement('style');
                    style.textContent = css;
                    document.head.appendChild(style);
                }

                // Load HTML
                if (config.files.html) {
                    const html = await A3Bridge.loadFile(`Win99UI\\${config.files.html}`);
                    const content = this.element.querySelector('.ie-content');
                    content.innerHTML = html;
                }

                this.loadedApps.set(appName, true);
            } catch (error) {
                console.error(`Error loading ${appName}:`, error);
                throw error;
            }
        }
    }

    /**
     * Navigate to specified application URL
     * Simulates browser connection sequence and loads the web application
     * Updates navigation history and status indicators throughout the process
     * @param {string} url - URL to navigate to (e.g., "https://forge.mil/intranet")
     * @returns {Promise<void>}
     */
    async navigateToApp(url) {
        // Start navigation sequence
        this.updateStatus('Connecting to site...');
        this.updateProgress(true);
        this.updateConnection('Connecting...');

        // Add to history if new URL
        if (!this.history.length || url !== this.history[this.currentHistoryIndex]) {
            this.currentHistoryIndex++;
            this.history.splice(this.currentHistoryIndex, this.history.length - this.currentHistoryIndex, url);
        }

        const urlObject = new URL(url);
        const path = urlObject.pathname.split('/')[1];
        const content = this.element.querySelector('.ie-content');

        try {
            // Show connecting sequence
            await this.delay(500);
            this.updateStatus('Connected to site');
            this.updateConnection('Connected');

            await this.delay(300);
            this.updateStatus('Waiting for reply...');

            await this.delay(400);
            this.updateStatus('Receiving data...');

            // Load the application
            const config = WIN99_CONFIG.applications.web[path];
            if (config) {
                await this.loadWebApp(path);
                new window[config.class](content);
                this.updateZone('Intranet Zone');
            } else {
                this.show404();
                this.updateZone('Internet Zone');
            }

            // Complete navigation
            await this.delay(300);
            this.updateStatus('Done');
            this.updateProgress(false);
            this.updateNavigationButtons();

        } catch (error) {
            console.error('Error loading app:', error);
            this.updateStatus('Error loading page');
            this.updateProgress(false);
            this.show404();
        }
    }

    /**
     * Helper method for adding delays in async operations
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise<void>}
     * @private
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Navigation Controls
     */

    /**
     * Navigate to previous page in history
     * Decrements history index and loads the previous URL
     */
    goBack() {
        if (this.currentHistoryIndex > 0) {
            this.currentHistoryIndex--;
            const url = this.history[this.currentHistoryIndex];
            const addressInput = this.element.querySelector('.ie-address-bar input');
            addressInput.value = url;
            this.navigateToApp(url);
        }
    }

    /**
     * Navigate to next page in history
     * Increments history index and loads the next URL
     */
    goForward() {
        if (this.currentHistoryIndex < this.history.length - 1) {
            this.currentHistoryIndex++;
            const url = this.history[this.currentHistoryIndex];
            const addressInput = this.element.querySelector('.ie-address-bar input');
            addressInput.value = url;
            this.navigateToApp(url);
        }
    }

    /**
     * Refresh current page
     * Reloads the currently displayed URL
     */
    refresh() {
        const currentUrl = this.history[this.currentHistoryIndex];
        if (currentUrl) {
            this.navigateToApp(currentUrl);
        }
    }

    /**
     * Update state of navigation buttons based on history position
     * Enables/disables Back and Forward buttons appropriately
     */
    updateNavigationButtons() {
        const backBtn = this.element.querySelector('#backBtn');
        const forwardBtn = this.element.querySelector('#forwardBtn');

        if (backBtn && forwardBtn) {
            backBtn.disabled = this.currentHistoryIndex <= 0;
            forwardBtn.disabled = this.currentHistoryIndex >= this.history.length - 1;
        }
    }

    /**
     * Error Handling
     */

    /**
     * Display 404 error page
     * Shows user-friendly error message with technical details
     */
    show404() {
        const content = this.element.querySelector('.ie-content');
        content.innerHTML = `
            <div class='ie-404'>
                <h1>404</h1>
                <h2>Page Not Found</h2>
                <p>The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
                <hr />
                <div class='technical-info'>
                    <p>Technical Information:</p>
                    <p>&#x2022; Error Code: HTTP 404</p>
                    <p>&#x2022; Description: File not found</p>
                    <p>&#x2022; Browser: Internet Explorer</p>
                </div>
                <p class='error-message'>Please check the URL and try again, or contact your system administrator.</p>
            </div>
        `;
    }
}

/**
 * Register InternetExplorer globally for OS launcher
 */
window.InternetExplorer = InternetExplorer;
