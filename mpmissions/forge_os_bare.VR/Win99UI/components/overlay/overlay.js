/**
 * ScreenOverlay - Screen Pixel Texture Overlay
 * 
 * Creates a full-screen visual effect layer that adds authentic CRT monitor
 * texture to the Win99 UI. Provides:
 * - Subtle pixel pattern overlay
 * - Fixed positioning covering entire viewport
 * - Non-interactive (pointer-events: none)
 * - High z-index to appear above all content
 * - Low opacity for subtle effect
 * 
 * The overlay uses a repeating 3x3px texture loaded from Arma 3 resources
 * to simulate the scanline/pixel grid effect of vintage CRT monitors,
 * enhancing the Windows 98 aesthetic.
 * 
 * Automatically initializes on construction and appends to document.body.
 */
class ScreenOverlay {
    /**
     * Initialize screen overlay
     * 
     * Creates overlay element, applies styling, and loads texture.
     * Overlay is automatically appended to document.body and displayed.
     */
    constructor() {
        this.createOverlayElement();
        this.loadOverlayTexture();
    }

    /**
     * Create and configure overlay DOM element
     * 
     * Builds a fixed-position div covering the entire viewport with:
     * - position: fixed (stays in place during scroll)
     * - Full viewport dimensions (100% width/height)
     * - pointerEvents: none (doesn't block user interactions)
     * - z-index: 9999 (appears above all content)
     * - opacity: 0.1 (subtle, barely visible effect)
     * - Repeating 3x3px background pattern
     * 
     * Element is immediately appended to document.body.
     */
    createOverlayElement() {
        this.element = document.createElement('div');
        this.element.className = 'screen-overlay';

        // Set overlay styling and positioning
        Object.assign(this.element.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: '9999',
            opacity: '0.1',
            backgroundRepeat: 'repeat',
            backgroundSize: '3px 3px'
        });

        document.body.appendChild(this.element);
    }

    /**
     * Load and apply pixel pattern texture
     * 
     * Loads 'FORGE_FX_Pixel_CO' texture from Arma 3 resources via A3Bridge
     * and applies it as a repeating background image.
     * 
     * The texture is a small (3x3px) pixel pattern that tiles seamlessly
     * to create a consistent CRT monitor effect across the entire screen.
     * 
     * Async operation - texture loads in background without blocking UI.
     */
    async loadOverlayTexture() {
        const overlayTexture = await A3Bridge.loadIcon('FORGE_FX_Pixel_CO');
        this.element.style.backgroundImage = `url(${overlayTexture})`;
    }
}