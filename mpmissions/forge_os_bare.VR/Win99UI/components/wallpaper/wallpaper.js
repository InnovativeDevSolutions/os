/**
 * Wallpaper - Desktop Background Manager
 * 
 * Manages the desktop wallpaper with:
 * - Dynamic wallpaper loading from Arma 3 resources
 * - Desktop container element creation
 * - Wallpaper image element management
 * - Automatic texture application
 * 
 * The wallpaper is loaded as an <img> element and styled via CSS
 * to fill the desktop area. This approach allows for:
 * - High-quality image display
 * - CSS-based positioning (center, stretch, tile, etc.)
 * - Easy swapping of wallpaper images
 * 
 * Wallpaper texture is loaded from Arma 3 PAA files via A3Bridge,
 * providing seamless integration with Arma 3's asset system.
 * 
 * Automatically initializes on construction and creates necessary
 * DOM structure at the beginning of document.body.
 */
class Wallpaper {
    /**
     * Initialize desktop wallpaper system
     * 
     * Triggers automatic wallpaper setup sequence:
     * 1. Creates desktop container
     * 2. Creates wallpaper image element
     * 3. Loads and applies wallpaper texture
     */
    constructor() {
        this.initializeWallpaper();
    }

    /**
     * Create and configure wallpaper elements
     * 
     * Orchestrates the 3-step wallpaper initialization:
     * 1. Desktop container creation
     * 2. Image element creation and attachment
     * 3. Texture loading from Arma 3 resources
     */
    initializeWallpaper() {
        this.createDesktopElement();
        this.createWallpaperImage();
        this.loadWallpaperTexture();
    }

    /**
     * Create the desktop container element
     * 
     * Creates a <div> with 'desktop' class and inserts it at the
     * beginning of document.body (before all other content).
     * 
     * This ensures the wallpaper appears behind all other UI elements
     * (windows, icons, taskbar, etc.) in the z-index stacking order.
     * 
     * The desktop container serves as the main canvas for:
     * - Wallpaper image
     * - Desktop icons (added later by Desktop class)
     */
    createDesktopElement() {
        this.element = document.createElement('div');
        this.element.className = 'desktop';
        document.body.insertBefore(this.element, document.body.firstChild);
    }

    /**
     * Create the wallpaper image element
     * 
     * Creates an <img> element for the wallpaper and appends it to
     * the desktop container.
     * 
     * The image is styled via CSS (desktop-wallpaper class) to:
     * - Fill the entire desktop area
     * - Position appropriately (center, stretch, etc.)
     * - Sit behind desktop icons and windows
     * 
     * Alt text is provided for accessibility.
     */
    createWallpaperImage() {
        this.wallpaperImg = document.createElement('img');
        this.wallpaperImg.className = 'desktop-wallpaper';
        this.wallpaperImg.alt = 'Desktop Wallpaper';
        this.element.appendChild(this.wallpaperImg);
    }

    /**
     * Load and apply wallpaper texture
     * 
     * Loads 'FORGE_FX_Wallpaper_CA' texture from Arma 3 resources
     * via A3Bridge and sets it as the image source.
     * 
     * The texture is loaded asynchronously to avoid blocking the
     * UI initialization. Desktop remains visible with empty
     * background until wallpaper loads.
     * 
     * PAA texture is automatically converted to base64 data URL
     * by A3Bridge for use in standard HTML <img> elements.
     */
    async loadWallpaperTexture() {
        const wallpaperSrc = await A3Bridge.loadIcon('FORGE_FX_Wallpaper_CA');
        this.wallpaperImg.src = wallpaperSrc;
    }
}