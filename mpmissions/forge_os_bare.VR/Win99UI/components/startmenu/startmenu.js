/**
 * StartMenu - Windows 98-Style Start Menu
 * 
 * Manages the iconic Start menu with:
 * - Hierarchical menu structure with submenus
 * - Application launching via OS integration
 * - System actions (shutdown, logoff)
 * - Toggle visibility (click Start button)
 * - Click-outside-to-close behavior
 * - Windows 98 branding banner
 * - Icon loading from Arma 3 resources
 * 
 * Menu structure and items are loaded from WIN99_CONFIG.startMenu.programs.
 * Supports nested submenus (e.g., Programs > Accessories).
 * 
 * Integration:
 * - Launches apps via window.os.openApp()
 * - Executes system actions via window.os.shutdown()
 * - Syncs with Start button active state
 */
class StartMenu {
    /**
     * Initialize start menu system
     * 
     * Sets up menu structure, loads configuration from WIN99_CONFIG,
     * and initializes all menu components and event handlers.
     */
    constructor() {
        this.element = document.querySelector('.start-menu');
        this.menuItems = WIN99_CONFIG.startMenu.programs;
        this.startButton = document.querySelector('.start-button');
        this.initializeMenu();
    }

    /**
     * Initialize menu components
     * 
     * Performs complete menu setup:
     * 1. Renders menu structure from config
     * 2. Attaches click event handlers
     * 3. Loads Windows 98 branding banner
     * 4. Sets up click-outside detection
     */
    initializeMenu() {
        this.renderMenu();
        this.initMenuItems();
        this.setBannerImage();
        this.initClickOutside();
    }

    /**
     * Render menu structure
     * 
     * Generates HTML for all menu items from configuration,
     * injects into DOM, and triggers icon loading.
     * 
     * Recursively renders submenus for nested items.
     */
    renderMenu() {
        const menuHTML = this.menuItems.map(item => this.generateMenuItem(item)).join('');
        const menuContainer = this.element.querySelector('.menu-items');
        menuContainer.innerHTML = menuHTML;
        this.loadMenuIcons(menuContainer);
    }

    /**
     * Generate HTML for menu item
     * 
     * Creates menu item element with:
     * - Icon placeholder (loaded asynchronously)
     * - Item title text
     * - Data attributes for app/action routing
     * - CSS class for submenu indicator (arrow)
     * - Recursive submenu rendering if present
     * 
     * @param {Object} item - Menu item configuration from WIN99_CONFIG
     * @param {string} item.id - Unique identifier
     * @param {string} item.title - Display text
     * @param {string} item.icon - Icon texture name
     * @param {string} [item.app] - Application to launch (optional)
     * @param {string} [item.action] - System action (shutdown, logoff)
     * @param {Array} [item.submenu] - Nested menu items
     * @returns {string} Menu item HTML string
     */
    generateMenuItem(item) {
        return `
            <div class="menu-item ${item.submenu ? 'has-submenu' : ''}" 
                 data-id="${item.id}" 
                 ${item.app ? `data-app="${item.app}"` : ''}
                 ${item.action ? `data-action="${item.action}"` : ''}>
                <img data-icon="${item.icon}" alt="${item.title}">
                <span>${item.title}</span>
                ${this.renderSubmenu(item.submenu)}
            </div>
        `;
    }

    /**
     * Generate submenu HTML
     * 
     * Recursively renders nested menu items.
     * Returns empty string if no submenu provided.
     * 
     * Submenu appears on hover with CSS positioning.
     * 
     * @param {Array<Object>} [submenu] - Nested menu items array
     * @returns {string} Submenu HTML or empty string
     */
    renderSubmenu(submenu) {
        if (!submenu) return '';
        return `
            <div class="submenu">
                ${submenu.map(item => this.generateMenuItem(item)).join('')}
            </div>
        `;
    }

    /**
     * Load and set menu icons
     * 
     * Asynchronously loads all menu icons from Arma 3 resources.
     * Icons are loaded in parallel for better performance.
     * 
     * Each img element with data-icon attribute gets its src set
     * once the texture loads via A3Bridge.
     * 
     * @param {HTMLElement} container - Menu container with icon placeholders
     */
    loadMenuIcons(container) {
        const icons = container.querySelectorAll('img[data-icon]');
        icons.forEach(img => {
            A3Bridge.loadIcon(img.dataset.icon).then(iconSrc => {
                img.src = iconSrc;
            });
        });
    }

    /**
     * Initialize menu item event handlers
     * 
     * Attaches click handlers to all menu items for:
     * - Application launching (via data-app attribute)
     * - System actions (via data-action attribute)
     * - Menu hiding after selection
     * - Start button state sync
     * 
     * Routes to window.os.openApp() or window.os.shutdown() based on attributes.
     */
    initMenuItems() {
        const items = this.element.querySelectorAll('.menu-item');
        items.forEach(item => {
            item.addEventListener('click', () => {
                const app = item.dataset.app;
                const action = item.dataset.action;

                if (app) {
                    window.os.openApp(app);
                }

                if (action === 'shutdown') {
                    window.os.shutdown();
                }

                this.hide();
                this.startButton.classList.remove('active');
            });
        });
    }

    /**
     * Set start menu banner image
     * 
     * Loads the vertical Windows 98-style banner that appears on the
     * left side of the Start menu. Displays "Windows99" branding.
     * 
     * Banner is loaded asynchronously from Arma 3 resources.
     */
    async setBannerImage() {
        const bannerContainer = document.getElementById('start-menu-banner-img');
        const bannerImg = document.createElement('img');
        const iconSrc = await A3Bridge.loadIcon('FORGE_FX_TaskBar_Banner_Start_CA');
        bannerImg.src = iconSrc;
        bannerImg.alt = 'Windows99';
        bannerContainer.appendChild(bannerImg);
    }

    /**
     * Initialize click outside handler
     * 
     * Sets up global click listener to auto-close menu when user
     * clicks outside both the menu and Start button.
     * 
     * Mimics Windows 98 behavior where clicking anywhere else
     * dismisses the Start menu.
     */
    initClickOutside() {
        document.addEventListener('click', (e) => {
            if (!this.element.contains(e.target) &&
                !e.target.closest('.start-button')) {
                this.hide();
                this.startButton.classList.remove('active');
            }
        });
    }

    // MENU STATE MANAGEMENT

    /**
     * Toggle menu visibility
     * 
     * Switches between shown and hidden states.
     * Also toggles Start button active state for visual feedback.
     * 
     * Called by window.os.toggleStartMenu() when Start button is clicked.
     */
    toggle() {
        this.element.classList.toggle('active');
        this.startButton.classList.toggle('active');
    }

    /**
     * Hide menu
     * 
     * Removes active class to hide menu with CSS transition.
     * Also removes Start button active state.
     * 
     * Called after menu item selection or click-outside detection.
     */
    hide() {
        this.element.classList.remove('active');
        this.startButton.classList.remove('active');
    }

    /**
     * Show menu
     * 
     * Adds active class to display menu with CSS transition.
     * Also adds Start button active state for visual feedback.
     */
    show() {
        this.element.classList.add('active');
        this.startButton.classList.add('active');
    }
}