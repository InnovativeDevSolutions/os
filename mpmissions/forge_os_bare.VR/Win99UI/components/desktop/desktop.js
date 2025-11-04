/**
 * Desktop - Desktop Icon Manager
 * 
 * Manages the Windows 98-style desktop icon system with:
 * - Icon rendering from configuration
 * - Selection state management (default/selected textures)
 * - Click and double-click event handling
 * - Left/right column layout positioning
 * - Click-outside deselection behavior
 * 
 * Icons are loaded from WIN99_CONFIG.desktop.shortcuts and support:
 * - Two-state icons (default and selected)
 * - Position-based layout (left or right column)
 * - Custom double-click handlers
 * - Lazy loading of selected state textures
 */
class Desktop {
    /**
     * Initialize desktop system
     * 
     * Sets up desktop icon containers, loads icon configuration,
     * and initializes the icon rendering system.
     * Creates cache for icon textures (default and selected states).
     */
    constructor() {
        this.element = document.getElementById('desktop-icons-container');
        this.leftContainer = this.element.querySelector('.desktop-icons-left');
        this.rightContainer = this.element.querySelector('.desktop-icons-right');
        this.selectedIconId = null;
        this.icons = WIN99_CONFIG.desktop.shortcuts;
        this.iconImages = {};

        this.initializeDesktop();
    }

    /**
     * Initialize desktop components
     * 
     * Triggers initial icon rendering and sets up global
     * click-outside event handler for deselection.
     */
    initializeDesktop() {
        this.render();
        this.setupClickOutside();
    }

    /**
     * Create individual desktop icon element
     * 
     * Constructs a desktop icon with:
     * - Image element (loaded from Arma 3 resources)
     * - Title text (currently commented out)
     * - Event handlers for click and double-click
     * - Cached texture references for state switching
     * 
     * Only loads default texture initially; selected texture is
     * loaded on-demand when icon is first clicked.
     * 
     * @param {Object} icon - Icon configuration from WIN99_CONFIG.desktop.shortcuts
     * @param {string} icon.id - Unique identifier for icon
     * @param {string} icon.title - Display text for icon
     * @param {Object} icon.icon - Icon texture paths
     * @param {string} icon.icon.default - Default state texture name
     * @param {string} icon.icon.selected - Selected state texture name
     * @returns {Promise<HTMLElement>} Created icon element with events attached
     */
    async createIcon(icon) {
        const iconElement = document.createElement('div');
        iconElement.className = 'desktop-icon';

        const img = document.createElement('img');
        img.alt = icon.title;

        const title = document.createElement('span');
        // title.className = 'icon-title';
        // title.textContent = icon.title;

        const defaultTexture = await A3Bridge.loadIcon(icon.icon.default);
        img.src = defaultTexture;
        this.iconImages[icon.id] = {
            default: defaultTexture,
            selected: null
        };

        iconElement.appendChild(img);
        iconElement.appendChild(title);

        this.setupIconEvents(iconElement, icon);

        return iconElement;
    }

    /**
     * Setup event handlers for icon interactions
     * 
     * Attaches click and double-click handlers:
     * - Click: Manages selection state (highlight icon)
     * - Double-click: Executes configured action (e.g., open app)
     * 
     * @param {HTMLElement} iconElement - Icon DOM element
     * @param {Object} icon - Icon configuration object with onDoubleClick handler
     */
    setupIconEvents(iconElement, icon) {
        iconElement.addEventListener('click', (e) => this.handleIconClick(icon, e));
        iconElement.addEventListener('dblclick', () => {
            if (icon.onDoubleClick) icon.onDoubleClick();
        });
    }

    /**
     * Handle icon click events and selection states
     * 
     * Manages the selection flow:
     * 1. Stops event propagation to prevent desktop deselection
     * 2. Deselects previously selected icon (if different)
     * 3. Updates selectedIconId tracking
     * 4. Selects clicked icon (loads selected texture if needed)
     * 
     * @param {Object} icon - Icon configuration object
     * @param {Event} event - Click event object
     */
    async handleIconClick(icon, event) {
        event.stopPropagation();

        if (this.selectedIconId && this.selectedIconId !== icon.id) {
            await this.deselectPreviousIcon();
        }

        this.selectedIconId = icon.id;
        await this.selectCurrentIcon(icon);
    }

    /**
     * Deselect previously selected icon
     * 
     * Restores icon to default texture state.
     * Uses cached default texture for instant switching.
     */
    async deselectPreviousIcon() {
        const previousIcon = this.icons.find(i => i.id === this.selectedIconId);
        if (previousIcon) {
            const iconElement = document.querySelector(`[data-icon-id="${this.selectedIconId}"] img`);
            iconElement.src = this.iconImages[this.selectedIconId].default;
        }
    }

    /**
     * Select current icon and load selected state texture
     * 
     * Applies selected texture to icon. Uses lazy loading:
     * selected texture is only loaded on first selection to
     * reduce initial load time and memory usage.
     * 
     * Subsequent selections use cached selected texture.
     * 
     * @param {Object} icon - Icon configuration object
     */
    async selectCurrentIcon(icon) {
        if (!this.iconImages[icon.id].selected) {
            const selectedTexture = await A3Bridge.loadIcon(icon.icon.selected);
            this.iconImages[icon.id].selected = selectedTexture;
        }

        const iconElement = document.querySelector(`[data-icon-id="${icon.id}"] img`);
        iconElement.src = this.iconImages[icon.id].selected;
    }

    /**
     * Setup click outside handler for deselecting icons
     * 
     * Registers global click listener on document to detect clicks
     * outside of desktop icons. When detected, restores selected
     * icon to default state (mimics Windows 98 behavior).
     * 
     * Uses event delegation to check if click target is within
     * a .desktop-icon element.
     */
    setupClickOutside() {
        document.addEventListener('click', async (e) => {
            if (!e.target.closest('.desktop-icon') && this.selectedIconId) {
                const iconElement = document.querySelector(`[data-icon-id="${this.selectedIconId}"] img`);
                iconElement.src = this.iconImages[this.selectedIconId].default;
                this.selectedIconId = null;
            }
        });
    }

    /**
     * Render all desktop icons
     * 
     * Separates icons into left and right columns based on
     * position property, then renders each group to its
     * respective container.
     * 
     * Maintains icon ordering as defined in configuration.
     */
    async render() {
        const leftIcons = this.icons.filter(icon => icon.position === 'left');
        const rightIcons = this.icons.filter(icon => icon.position === 'right');

        await this.renderIconGroup(leftIcons, this.leftContainer);
        await this.renderIconGroup(rightIcons, this.rightContainer);
    }

    /**
     * Render a group of icons to specified container
     * 
     * Iterates through icon array, creates DOM elements,
     * and appends them to the target container.
     * 
     * Each icon is tagged with data-icon-id attribute for
     * easy DOM querying during selection state changes.
     * 
     * @param {Array<Object>} icons - Array of icon configurations
     * @param {HTMLElement} container - Container element for icons (.desktop-icons-left or .desktop-icons-right)
     */
    async renderIconGroup(icons, container) {
        for (const icon of icons) {
            const iconElement = await this.createIcon(icon);
            iconElement.setAttribute('data-icon-id', icon.id);
            container.appendChild(iconElement);
        }
    }
}

/**
 * Register Desktop class globally
 * Makes Desktop available for instantiation by Win99OS
 */
window.Desktop = Desktop;
