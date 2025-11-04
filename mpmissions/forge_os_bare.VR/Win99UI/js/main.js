/**
 * Win99OS - Core Operating System Controller
 * 
 * Main orchestrator for the Windows 98-style OS interface.
 * Manages the complete initialization sequence:
 * - Base components (overlay, wallpaper, window system)
 * - Application loading and registration
 * - UI components (taskbar, start menu, desktop)
 * - Desktop icon management
 * 
 * The OS uses a phased initialization approach to ensure proper
 * dependency loading and component registration before user interaction.
 */
class Win99OS {
    /**
     * Initialize the operating system
     * Sets up desktop container reference and starts initialization sequence
     */
    constructor() {
        this.desktop = document.getElementById('desktop');
        window.os = this;
        this.init();
    }

    /**
     * Initialize all system components in sequence
     * 
     * Initialization order is critical:
     * 1. Base components (overlay, wallpaper, core UI)
     * 2. Applications (load all app scripts)
     * 3. User interface (taskbar, start menu)
     * 4. Desktop environment (icon containers)
     */
    async init() {
        await this.initializeBaseComponents();
        await this.loadApplications();
        await this.initializeUserInterface();
        await this.initializeDesktop();
    }

    /**
     * Initialize base system components
     * 
     * Loads and initializes foundational UI elements:
     * - Screen overlay (for modal dialogs)
     * - Wallpaper system
     * - Desktop, Window, and Dialog component classes
     * 
     * These must load before applications that depend on them
     */
    async initializeBaseComponents() {
        // Load and initialize overlay
        await ComponentLoader.loadComponent('overlay');
        new ScreenOverlay();

        // Load and initialize wallpaper
        await ComponentLoader.loadComponent('wallpaper');
        new Wallpaper();

        // Load core UI components
        await ComponentLoader.loadComponent('desktop');
        await ComponentLoader.loadComponent('window');
        await ComponentLoader.loadComponent('dialog');
    }

    /**
     * Load system applications from configuration
     * 
     * Iterates through WIN99_CONFIG.applications.system and loads each
     * application's JavaScript files via A3Bridge. Applications are loaded
     * as inline scripts and registered globally on the window object.
     * 
     * Applications must register themselves (e.g., window.Calendar = Calendar)
     */
    async loadApplications() {
        const apps = WIN99_CONFIG.applications.system;

        for (const [appName, config] of Object.entries(apps)) {
            for (const file of config.files) {
                const content = await A3Bridge.loadFile(`Win99UI\\${file}`);
                const script = document.createElement('script');
                script.textContent = content;
                document.body.appendChild(script);
            }
        }
    }

    /**
     * Initialize user interface components
     * 
     * Loads and instantiates the primary UI elements:
     * - Taskbar: Shows running applications and Start button
     * - Start Menu: Application launcher with system controls
     * 
     * Both components are loaded as HTML templates then instantiated
     * as JavaScript objects for event handling and state management
     */
    async initializeUserInterface() {
        // Load and initialize taskbar
        const taskbarHtml = await ComponentLoader.loadComponent('taskbar');
        this.desktop.innerHTML = taskbarHtml;

        // Load and initialize start menu
        const startMenuHtml = await ComponentLoader.loadComponent('startmenu');
        document.body.insertAdjacentHTML('beforeend', startMenuHtml);

        // Initialize UI managers
        this.startMenu = new StartMenu();
        this.taskbar = new Taskbar();
    }

    /**
     * Initialize desktop environment
     * 
     * Creates the desktop icon container structure:
     * - Left side: Typically system icons (My Computer, Recycle Bin)
     * - Right side: User-defined shortcuts
     * 
     * Instantiates Desktop class to manage icon layout and interactions
     */
    async initializeDesktop() {
        this.desktop.insertAdjacentHTML('beforeend', `
            <div class="desktop-icons" id="desktop-icons-container">
                <div class="desktop-icons-left"></div>
                <div class="desktop-icons-right"></div>
            </div>
        `);
        this.desktop = new Desktop();
    }

    /**
     * Toggle start menu visibility
     * 
     * Called when Start button is clicked
     * Delegates to StartMenu instance to handle show/hide animation
     */
    toggleStartMenu() {
        this.startMenu.toggle();
    }

    /**
     * Launch system application by name
     * 
     * Looks up application configuration from WIN99_CONFIG and instantiates
     * the corresponding class. Each application class extends Window and
     * handles its own lifecycle.
     * 
     * @param {string} appName - Application name (key from WIN99_CONFIG.applications.system)
     * @example
     * os.openApp('calendar'); // Launches Calendar application
     */
    openApp(appName) {
        const config = WIN99_CONFIG.applications.system[appName];
        if (config) {
            new window[config.class]();
        }
    }

    /**
     * Perform system shutdown
     * 
     * Initiates OS shutdown sequence
     * Currently logs shutdown message; can be extended to:
     * - Close all open windows
     * - Save application state
     * - Notify Arma 3 backend to close display
     */
    shutdown() {
        console.log('Shutting down...');
    }
}

/**
 * Auto-initialize OS when DOM is ready
 * 
 * Waits for DOMContentLoaded event to ensure all HTML elements
 * are available before starting OS initialization sequence.
 * 
 * Global `window.os` reference allows applications and components
 * to access OS functionality (e.g., window.os.openApp('calendar'))
 */
window.addEventListener('DOMContentLoaded', () => {
    window.os = new Win99OS();
});
